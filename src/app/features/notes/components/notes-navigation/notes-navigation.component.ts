import { Component, inject, signal, OnInit, OnDestroy, computed, ChangeDetectionStrategy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { filter, Subject, Subscription, debounceTime } from 'rxjs';
import { MarkdownService, SearchService, ProjectConfigService } from '../../../../core/services';
import {
  NoteTreeNode,
  NoteFolder,
  isFolder,
  isNote,
  Note,
} from '../../../../core/interfaces';
import { MatIcon } from '@angular/material/icon';
import { SearchResult } from '../../../../core/services/search.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { HighlightMatchPipe } from '../../../../shared/pipes/highlight-match.pipe';
import { IconifyIconComponent } from '../../../../shared/components/iconify-icon/iconify-icon.component';

/**
 * Navigation tree component for displaying notes hierarchy
 *
 * Design decisions:
 * - Uses Angular signals for reactive state management
 * - Recursive ng-template for rendering nested folder structure at any depth
 * - Auto-expands folders when navigating to a note
 * - Material-inspired tree UI without direct Material dependency
 * - Single Responsibility: handles only navigation tree display and interaction
 * - Recursive design follows Open/Closed Principle: extensible to any tree depth
 * - Smooth animations for expand/collapse transitions enhance UX
 */
@Component({
  selector: 'app-notes-navigation',
  imports: [
    CommonModule,
    RouterModule,
    MatIcon,
    IconifyIconComponent,
    FormsModule,
    HighlightMatchPipe,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './notes-navigation.component.html',
  styleUrl: './notes-navigation.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    // Smooth expand/collapse animation for folder children
    trigger('expandCollapse', [
      state('collapsed', style({
        height: '0',
        overflow: 'hidden',
        opacity: '0',
      })),
      state('expanded', style({
        height: '*',
        overflow: 'visible',
        opacity: '1',
      })),
      transition('collapsed <=> expanded', [
        animate('250ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
    ]),
    // Icon transition animation
    trigger('folderIconRotate', [
      state('collapsed', style({
        transform: 'rotate(0deg)',
      })),
      state('expanded', style({
        transform: 'rotate(0deg)',
      })),
      transition('collapsed <=> expanded', [
        animate('200ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ]),
    ]),
  ],
})
export class NotesNavigationComponent implements OnInit, OnDestroy {
  private readonly markdownService = inject(MarkdownService);
  private readonly searchService = inject(SearchService);
  private readonly router = inject(Router);
  private readonly projectConfig = inject(ProjectConfigService);

  // Project configuration exposed to template
  protected readonly projectName = this.projectConfig.getProjectName();
  protected readonly projectSlug = this.projectConfig.getProjectNameSlug();

  // Reactive state for tree nodes
  private readonly allTreeNodes = signal<NoteTreeNode[]>([]);

  // Search state with debouncing
  private readonly searchInputSubject = new Subject<string>();
  private searchSubscription?: Subscription;
  protected readonly searchQuery = signal<string>('');
  protected readonly searchResults = toSignal(
    this.searchService.searchResults$,
    {
      initialValue: [],
    }
  );

  // Computed filtered tree based on search
  protected readonly treeNodes = computed(() => {
    const query = this.searchQuery();
    const results = this.searchResults();

    if (!query.trim() || results.length === 0) {
      return this.allTreeNodes();
    }

    // When searching, show a flat list of results in order of relevance
    // This provides better UX than maintaining tree hierarchy
    return results.map((result) => result.note as NoteTreeNode);
  });

  // Type guards exposed to template
  protected readonly isFolder = isFolder;
  protected readonly isNote = isNote;

  constructor() {
    // Subscribe to notes tree changes
    this.markdownService.notesTree$.subscribe((tree) => {
      // Skip empty initial emission
      if (!tree || tree.length === 0) {
        return;
      }
      
      // Expand to current route first, then set the tree
      // This ensures only one render cycle with the expanded state
      const url = this.router.url;
      const regex = new RegExp(`\\/${this.projectSlug}\\/(.+)`);
      const match = url.match(regex);
      
      if (match) {
        // Decode URL-encoded characters (e.g., %20 -> space) to match note IDs in tree
        const noteId = decodeURIComponent(match[1].split('?')[0].split('#')[0]);
        this.expandPathToNote(tree, noteId);
      }
      
      // Now set the tree with expansion already applied
      this.allTreeNodes.set(tree);
    });
  }

  ngOnInit(): void {
    // Set up debounced search with 300ms delay
    this.searchSubscription = this.searchInputSubject
      .pipe(debounceTime(300))
      .subscribe((query) => {
        this.searchService.search(query);

        // Auto-expand all folders when searching
        if (query.trim()) {
          this.expandAllFolders(this.allTreeNodes());
          // Trigger signal update without copying array
          this.allTreeNodes.update(n => n);
        }
      });

    // Listen to route changes to expand the tree
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe(() => {
        // Expand to show the current route's note
        const tree = this.allTreeNodes();
        if (tree.length > 0) {
          const url = this.router.url;
          const regex = new RegExp(`\\/${this.projectSlug}\\/(.+)`);
          const match = url.match(regex);
          
          if (match) {
            // Decode URL-encoded characters (e.g., %20 -> space) to match note IDs in tree
            // Also strip query params and fragments
            const noteId = decodeURIComponent(match[1].split('?')[0].split('#')[0]);
            this.expandPathToNote(tree, noteId);
            // Trigger signal update without copying array
            this.allTreeNodes.update(n => n);
          }
        }
      });
  }

  /**
   * Handles search input changes with debouncing
   * Updates the signal immediately for UI feedback, but debounces the actual search
   */
  protected onSearchChange(query: string): void {
    this.searchQuery.set(query);
    this.searchInputSubject.next(query);
  }

  /**
   * Clears the search and resets search state
   */
  protected clearSearch(): void {
    this.searchQuery.set('');
    this.searchInputSubject.next('');
    this.searchService.clearSearch();
  }

  /**
   * Toggles a folder's expanded state
   */
  protected toggleFolder(folder: NoteTreeNode): void {
    if (isFolder(folder)) {
      folder.expanded = !folder.expanded;
      // Trigger signal update without copying array
      // Since we mutate the folder object, just update the signal reference
      this.allTreeNodes.update(nodes => nodes);
    }
  }

  /**
   * Gets the search result for a specific note
   */
  protected getSearchResult(noteId: string): SearchResult | undefined {
    return this.searchResults().find((r) => r.note.id === noteId);
  }

  /**
   * Expands all folders in the tree (used when searching)
   */
  private expandAllFolders(nodes: NoteTreeNode[]): void {
    for (const node of nodes) {
      if (isFolder(node)) {
        node.expanded = true;
        this.expandAllFolders(node.children);
      }
    }
  }

  /**
   * Collapses all folders in the tree recursively
   */
  private collapseAllFolders(nodes: NoteTreeNode[]): void {
    for (const node of nodes) {
      if (isFolder(node)) {
        node.expanded = false;
        this.collapseAllFolders(node.children);
      }
    }
  }

  /**
   * Public method to expand all folders - accessible from template
   */
  protected expandAll(): void {
    const nodes = this.allTreeNodes();
    this.expandAllFolders(nodes);
    // Trigger signal update without copying array
    this.allTreeNodes.update(n => n);
  }

  /**
   * Public method to collapse all folders - accessible from template
   */
  protected collapseAll(): void {
    const nodes = this.allTreeNodes();
    this.collapseAllFolders(nodes);
    // Trigger signal update without copying array
    this.allTreeNodes.update(n => n);
  }

  /**
   * Builds a filtered tree showing only matched notes and their parent folders
   * Preserves the search result order for better relevance
   */
  private buildFilteredTree(
    nodes: NoteTreeNode[],
    results: SearchResult[]
  ): NoteTreeNode[] {
    // Create a map of note ID to search result index for ordering
    const noteOrderMap = new Map<string, number>();
    results.forEach((result, index) => {
      noteOrderMap.set(result.note.id, index);
    });

    const matchedNoteIds = new Set(results.map((r) => r.note.id));
    const filteredNodes: NoteTreeNode[] = [];

    for (const node of nodes) {
      if (isNote(node)) {
        // Include only matched notes
        if (matchedNoteIds.has(node.id)) {
          filteredNodes.push(node);
        }
      } else if (isFolder(node)) {
        // Recursively filter children
        const filteredChildren = this.buildFilteredTree(node.children, results);

        // Include folder only if it has matched children
        if (filteredChildren.length > 0) {
          filteredNodes.push({
            ...node,
            children: filteredChildren,
            expanded: true, // Auto-expand when filtering
          });
        }
      }
    }

    // Sort the filtered nodes to match search result order
    // Folders come first (to maintain tree structure), then notes by search relevance
    filteredNodes.sort((a, b) => {
      const aIsFolder = isFolder(a);
      const bIsFolder = isFolder(b);

      // Keep folders before notes
      if (aIsFolder && !bIsFolder) return -1;
      if (!aIsFolder && bIsFolder) return 1;

      // If both are folders, keep original order
      if (aIsFolder && bIsFolder) return 0;

      // If both are notes, sort by search result order
      const aNote = isNote(a) ? a : null;
      const bNote = isNote(b) ? b : null;
      
      if (!aNote || !bNote) return 0;
      
      const aOrder = noteOrderMap.get(aNote.id) ?? Infinity;
      const bOrder = noteOrderMap.get(bNote.id) ?? Infinity;
      return aOrder - bOrder;
    });

    return filteredNodes;
  }

  /**
   * Track by function for ngFor performance optimization
   * Uses stable identifiers to prevent unnecessary re-renders
   */
  protected trackNode(index: number, node: NoteTreeNode): string {
    if (isNote(node)) {
      return `note-${node.id}`;
    } else if (isFolder(node)) {
      // Use folder name as identifier (folders at same level should have unique names)
      return `folder-${node.name}-${index}`;
    }
    return `unknown-${index}`;
  }

  /**
   * Recursively searches for a note and expands all parent folders
   * Returns true if the note was found
   */
  private expandPathToNote(
    nodes: NoteTreeNode[],
    targetNoteId: string
  ): boolean {
    for (const node of nodes) {
      if (isNote(node) && node.id === targetNoteId) {
        return true;
      }

      if (isFolder(node)) {
        // Recursively check children
        if (this.expandPathToNote(node.children, targetNoteId)) {
          // If found in children, expand this folder
          node.expanded = true;
          return true;
        }
      }
    }

    return false;
  }

  ngOnDestroy(): void {
    // Clean up search subscription to prevent memory leaks
    this.searchSubscription?.unsubscribe();
  }
}
