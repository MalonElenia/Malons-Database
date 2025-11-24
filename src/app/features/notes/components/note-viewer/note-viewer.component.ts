import { 
  Component, 
  inject, 
  OnInit, 
  signal, 
  computed, 
  CUSTOM_ELEMENTS_SCHEMA,
  ViewContainerRef,
  ComponentRef,
  AfterViewChecked,
  ElementRef,
  createComponent,
  EnvironmentInjector,
  ApplicationRef,
  ViewChild,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeHtml, Meta, Title } from '@angular/platform-browser';
import { MarkdownService, SearchService, ProjectConfigService } from '../../../../core/services';
import { WikiLinkDirective } from '../wiki-link.directive';
import { InlineIconDirective } from '../inline-icon.directive';
import { toSignal } from '@angular/core/rxjs-interop';
import { IconifyIconComponent } from '../../../../shared/components/iconify-icon/iconify-icon.component';
import { CalculatorComponent } from '../../../../shared/components/calculator/calculator.component';

/**
 * Component for displaying markdown note content
 *
 * Design decisions:
 * - Listens to route parameters to load the correct note
 * - Renders HTML directly, bypassing sanitizer for trusted markdown content
 * - WikiLinkDirective handles hover previews and click navigation
 * - InlineIconDirective converts inline icon placeholders to Iconify icons
 * - Handles note loading states
 * - Implements fade-in/fade-out transitions between notes
 * - Uses DomSanitizer.bypassSecurityTrustHtml to preserve data-* attributes needed for wiki-links and icons
 * - Dynamically renders calculator components from markdown placeholders
 */
@Component({
  selector: 'app-note-viewer',
  imports: [CommonModule, WikiLinkDirective, InlineIconDirective, IconifyIconComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './note-viewer.component.html',
  styleUrl: './note-viewer.component.scss',
})
export class NoteViewerComponent implements OnInit, AfterViewChecked {
  private readonly route = inject(ActivatedRoute);
  private readonly markdownService = inject(MarkdownService);
  private readonly searchService = inject(SearchService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly elementRef = inject(ElementRef);
  private readonly injector = inject(EnvironmentInjector);
  private readonly appRef = inject(ApplicationRef);
  private readonly meta = inject(Meta);
  private readonly titleService = inject(Title);
  private readonly projectConfig = inject(ProjectConfigService);

  @ViewChild('noteContent', { read: ElementRef }) noteContentElement?: ElementRef;

  protected readonly rawContent = signal<string>('');
  protected readonly error = signal<string | null>(null);
  protected readonly contentVisible = signal<boolean>(false);
  protected readonly noteTitle = signal<string>('');
  protected readonly noteIcon = signal<string | undefined>(undefined);

  private currentNoteId: string | null = null;
  private calculatorComponents: ComponentRef<CalculatorComponent>[] = [];
  private lastProcessedContent = '';
  private highlightCache = new Map<string, string>();

  constructor() {
    // Use effect to watch for content changes and render calculators
    // queueMicrotask ensures DOM is updated before processing (replaces arbitrary 100ms setTimeout)
    effect(() => {
      const content = this.rawContent();
      if (content && content !== this.lastProcessedContent) {
        this.lastProcessedContent = content;
        // queueMicrotask defers to next microtask, after DOM updates are applied
        queueMicrotask(() => this.renderCalculatorComponents());
      }
    });
  }

  // Track search query
  protected readonly searchQuery = toSignal(this.searchService.searchQuery$, {
    initialValue: '',
  });

  // Computed content with highlighting applied
  // Uses caching to avoid redundant DOM manipulation for the same content+query combination
  protected readonly noteContent = computed(() => {
    const content = this.rawContent();
    const query = this.searchQuery();

    if (!query.trim() || !content) {
      return this.sanitizer.bypassSecurityTrustHtml(content);
    }

    // Create cache key combining content length and query for fast lookup
    const cacheKey = `${content.length}-${query}`;
    
    if (this.highlightCache.has(cacheKey)) {
      return this.sanitizer.bypassSecurityTrustHtml(this.highlightCache.get(cacheKey)!);
    }

    // Apply highlighting to the content
    const highlighted = this.highlightSearchTerms(content, query);
    
    // Limit cache size to prevent memory issues (keep last 10 entries)
    if (this.highlightCache.size > 10) {
      const firstKey = this.highlightCache.keys().next().value;
      if (firstKey !== undefined) {
        this.highlightCache.delete(firstKey);
      }
    }
    
    this.highlightCache.set(cacheKey, highlighted);
    return this.sanitizer.bypassSecurityTrustHtml(highlighted);
  });

  ngOnInit(): void {
    // Listen to route parameter changes to load the correct note
    this.route.paramMap.subscribe((params) => {
      const noteId = params.get('id');
      if (noteId) {
        this.loadNote(noteId);
      } else {
        this.error.set('No note ID provided');
        this.contentVisible.set(false);
      }
    });
  }

  /**
   * Loads a note by its ID with smooth fade-out/fade-in transition
   * Creates a seamless transition through the background color
   * 
   * Design decision:
   * - Old content (including icon) fades out completely
   * - New content loads IN PARALLEL during the fade-out (performance optimization)
   * - Content swap happens ONLY when opacity is 0 (during the invisible moment)
   * - New content (including icon) fades in once ready
   * - This creates a smooth, continuous transition without content popping
   * - Updates SEO meta tags dynamically for each page
   * 
   * Performance optimization:
   * - Content loading starts immediately, not after fade-out completes
   * - This parallelizes the I/O operation with the animation
   * - Results in faster perceived transitions, especially for larger notes
   * 
   * Visual smoothness:
   * - Title, icon, and content update only after fade-out completes
   * - This prevents jarring mid-fade content changes
   * - User sees old content fade out, then new content fade in
   */
  private loadNote(noteId: string): void {
    this.currentNoteId = noteId;
    this.error.set(null);

    // Fade out current content FIRST (before changing anything)
    this.contentVisible.set(false);

    // NECESSARY: Track when fade-out animation completes (matches CSS transition duration of 150ms)
    // This ensures smooth visual transition before swapping content
    const fadeOutComplete = new Promise<void>(resolve => setTimeout(resolve, 150));
    
    // Start loading content immediately (in parallel with fade-out)
    let loadedNote: any;
    let loadedHtml: string;
    let loadedTextContent: string;
    
    const contentLoadComplete = new Promise<void>((resolve, reject) => {
      // Get note metadata for later use
      loadedNote = this.markdownService.getNoteById(noteId);
      
      this.markdownService.loadNoteById(noteId).subscribe({
        next: (html) => {
          loadedHtml = html;
          loadedTextContent = this.extractTextContent(html);
          resolve();
        },
        error: (err) => {
          reject(err);
        },
      });
    });

    // Wait for both fade-out animation AND content loading to complete
    Promise.all([fadeOutComplete, contentLoadComplete])
      .then(() => {
        // NOW update all the content at once (while opacity is 0)
        if (loadedNote) {
          this.noteTitle.set(loadedNote.title);
          this.noteIcon.set(loadedNote.icon);
          this.updateMetaTags(loadedNote.title, noteId);
        } else {
          this.noteTitle.set(noteId);
          this.noteIcon.set(undefined);
          this.updateMetaTags(noteId, noteId);
        }
        
        this.rawContent.set(loadedHtml);
        this.updateMetaDescription(loadedTextContent);

        // queueMicrotask ensures DOM update is complete before fading in (replaces arbitrary 50ms setTimeout)
        queueMicrotask(() => {
          this.contentVisible.set(true);
        });
      })
      .catch((err) => {
        this.error.set(`Failed to load note: ${err.message}`);
        this.contentVisible.set(false);
      });
  }

  /**
   * Updates meta tags for SEO optimization
   * Sets title, Open Graph, and Twitter Card tags
   */
  private updateMetaTags(title: string, noteId: string): void {
    const fullTitle = this.projectConfig.getPageTitle(title);
    const url = this.projectConfig.getContentUrl(noteId);
    
    // Update page title
    this.titleService.setTitle(fullTitle);
    
    // Update Open Graph tags
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:type', content: 'article' });
    
    // Update Twitter Card tags
    this.meta.updateTag({ name: 'twitter:title', content: fullTitle });
    this.meta.updateTag({ name: 'twitter:url', content: url });
    
    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', url);
    }
  }

  /**
   * Updates the meta description based on the content
   */
  private updateMetaDescription(textContent: string): void {
    // Create a meaningful description from the first 160 characters
    const description = textContent.substring(0, 160).trim() + '...';
    
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }

  /**
   * Extracts plain text content from HTML for meta descriptions
   */
  private extractTextContent(html: string): string {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    // Remove script and style elements
    const scripts = tempDiv.querySelectorAll('script, style');
    scripts.forEach(el => el.remove());
    
    // Get text content and clean up whitespace
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.replace(/\s+/g, ' ').trim();
  }

  /**
   * Retries loading the current note
   */
  protected retry(): void {
    if (this.currentNoteId) {
      this.loadNote(this.currentNoteId);
    }
  }

  /**
   * Highlights search terms in HTML content
   * Avoids highlighting inside HTML tags and preserves calculator placeholders
   */
  private highlightSearchTerms(html: string, query: string): string {
    if (!query.trim()) {
      return html;
    }

    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    // Recursively highlight text nodes
    this.highlightTextNodes(tempDiv, query);

    return tempDiv.innerHTML;
  }

  /**
   * After view is checked, we could render calculator components here too
   * but we're using effect() in the constructor instead for better reactivity
   */
  ngAfterViewChecked(): void {
    // This is now handled by the effect() in the constructor
  }

  /**
   * Finds calculator placeholders in the DOM and replaces them with actual calculator components
   */
  private renderCalculatorComponents(): void {
    // Clean up existing calculator components
    this.cleanupCalculatorComponents();

    // Find all calculator placeholder elements
    const placeholders = this.elementRef.nativeElement.querySelectorAll('.calculator-placeholder');
    
    placeholders.forEach((placeholder: HTMLElement) => {
      const configAttr = placeholder.getAttribute('data-calculator-config');
      if (!configAttr) return;

      try {
        // Decode HTML entities and parse JSON
        const decodedConfig = configAttr.replace(/&quot;/g, '"');
        const config = JSON.parse(decodedConfig);

        // Create calculator component dynamically
        const componentRef = createComponent(CalculatorComponent, {
          environmentInjector: this.injector,
          elementInjector: this.injector,
        });

        // Set the config input
        componentRef.setInput('config', config);

        // Attach to application ref for change detection
        this.appRef.attachView(componentRef.hostView);

        // Insert the component's host element before the placeholder
        const componentElement = (componentRef.hostView as any).rootNodes[0] as HTMLElement;
        placeholder.parentNode?.insertBefore(componentElement, placeholder);

        // Remove the placeholder
        placeholder.remove();

        // Store reference for cleanup
        this.calculatorComponents.push(componentRef);
      } catch (error) {
        console.error('Error rendering calculator:', error);
        placeholder.innerHTML = '<div class="calculator-error">Error rendering calculator</div>';
      }
    });
  }

  /**
   * Cleans up dynamically created calculator components
   */
  private cleanupCalculatorComponents(): void {
    this.calculatorComponents.forEach(componentRef => {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
    });
    this.calculatorComponents = [];
  }

  /**
   * Recursively highlights text nodes in an element
   */
  private highlightTextNodes(element: HTMLElement, query: string): void {
    const walker = document.createTreeWalker(
      element,
      NodeFilter.SHOW_TEXT,
      null
    );

    const nodesToReplace: { node: Node; parent: Node; highlighted: Node }[] =
      [];

    let node: Node | null;
    while ((node = walker.nextNode())) {
      const text = node.textContent || '';

      // Skip if parent is a script, style, or already highlighted
      const parent = node.parentNode;
      if (
        !parent ||
        parent.nodeName === 'SCRIPT' ||
        parent.nodeName === 'STYLE' ||
        (parent as HTMLElement).classList?.contains('search-highlight')
      ) {
        continue;
      }

      // Create regex for case-insensitive matching
      // Split query into words and match each independently
      const queryWords = query.trim().split(/\s+/);
      let highlightedText = text;
      let hasMatch = false;

      for (const word of queryWords) {
        if (word.length < 2) continue;

        // Escape special regex characters
        const escapedWord = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        // Case-insensitive match
        const regex = new RegExp(`(${escapedWord})`, 'gi');

        if (regex.test(highlightedText)) {
          hasMatch = true;
          highlightedText = highlightedText.replace(
            regex,
            '<mark class="search-highlight">$1</mark>'
          );
        }
      }

      if (hasMatch) {
        const span = document.createElement('span');
        span.innerHTML = highlightedText;
        nodesToReplace.push({ node, parent, highlighted: span });
      }
    }

    // Replace nodes after walking to avoid modifying the tree during traversal
    for (const { node, parent, highlighted } of nodesToReplace) {
      parent.replaceChild(highlighted, node);
    }
  }
}
