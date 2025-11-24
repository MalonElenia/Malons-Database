import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * Service for managing Iconify web component loading and icon verification
 * 
 * Design decisions:
 * - Centralizes all Iconify loading logic to eliminate code duplication
 * - Provides promise-based API for waiting on Iconify initialization
 * - Handles icon loading verification with configurable delays
 * - Supports both SSR and browser environments
 * - Follows Single Responsibility Principle
 * 
 * Benefits:
 * - DRY: Eliminates duplicate setTimeout logic across multiple components
 * - Consistency: All components use same timing and retry logic
 * - Maintainability: Changes to loading strategy only need to be made in one place
 * - Testability: Easier to mock and test icon loading behavior
 */
@Injectable({
  providedIn: 'root'
})
export class IconifyLoadingService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  
  private iconifyReady: Promise<void> | null = null;

  /**
   * Waits for Iconify web component to be fully defined
   * Returns a cached promise for subsequent calls
   * 
   * @param timeoutMs - Maximum time to wait before resolving anyway (default: 10000ms)
   * @returns Promise that resolves when Iconify is ready or timeout occurs
   */
  waitForIconify(timeoutMs: number = 10000): Promise<void> {
    // Return cached promise if already waiting
    if (this.iconifyReady) {
      return this.iconifyReady;
    }

    this.iconifyReady = new Promise((resolve) => {
      // SSR check
      if (!this.isBrowser || typeof customElements === 'undefined') {
        resolve();
        return;
      }

      // Already defined
      if (customElements.get('iconify-icon')) {
        console.debug('[Iconify Service] Web component already loaded');
        resolve();
        return;
      }

      // Wait for definition with timeout
      // NECESSARY: External resource loading requires timeout as safety mechanism
      const timeout = setTimeout(() => {
        console.warn(`[Iconify Service] Web component did not load within ${timeoutMs}ms, proceeding anyway`);
        resolve();
      }, timeoutMs);

      customElements.whenDefined('iconify-icon')
        .then(() => {
          clearTimeout(timeout);
          console.log('[Iconify Service] Web component loaded successfully');
          resolve();
        })
        .catch((error) => {
          clearTimeout(timeout);
          console.error('[Iconify Service] Error loading web component:', error);
          resolve(); // Resolve anyway to prevent blocking
        });
    });

    return this.iconifyReady;
  }

  /**
   * Checks if an icon element has successfully loaded (has SVG in shadow DOM)
   * 
   * @param iconElement - The iconify-icon element to check
   * @returns true if icon has loaded (has SVG), false otherwise
   */
  hasIconLoaded(iconElement: HTMLElement): boolean {
    return !!iconElement.shadowRoot?.querySelector('svg');
  }

  /**
   * Waits for an icon to load with a specified delay, then calls callback
   * Provides a non-blocking way to verify icon loading
   * 
   * @param iconElement - The iconify-icon element to check
   * @param delayMs - How long to wait before checking (default: 50ms)
   * @param callback - Function called with loading result (true if loaded, false if not)
   */
  checkIconLoaded(
    iconElement: HTMLElement,
    delayMs: number = 50,
    callback: (loaded: boolean) => void
  ): void {
    // NECESSARY: Short delay needed because Iconify loads icons asynchronously
    // Shadow DOM SVG is not immediately available after setting icon attribute
    setTimeout(() => {
      const loaded = this.hasIconLoaded(iconElement);
      callback(loaded);
    }, delayMs);
  }

  /**
   * Tests Iconify API connectivity by attempting to load a known test icon
   * Useful for diagnosing network issues or API problems
   * 
   * @param onSuccess - Callback when API is confirmed working
   * @param onFailure - Callback if API appears to be failing
   * @param maxChecks - Number of times to retry checking (default: 3)
   * @param checkIntervalMs - Time between checks (default: 3000ms)
   */
  testIconifyConnection(
    onSuccess?: () => void,
    onFailure?: () => void,
    maxChecks: number = 3,
    checkIntervalMs: number = 3000
  ): void {
    if (!this.isBrowser) {
      return;
    }

    const testIcon = document.createElement('iconify-icon');
    testIcon.setAttribute('icon', 'lucide:heart');
    testIcon.style.position = 'fixed';
    testIcon.style.top = '-9999px';
    testIcon.style.left = '-9999px';
    document.body.appendChild(testIcon);
    
    let checkCount = 0;
    
    const checkIcon = () => {
      checkCount++;
      const svg = testIcon.querySelector('svg');
      
      if (svg) {
        console.log(`[Iconify Service] ✓ API connection successful (took ${checkCount * checkIntervalMs / 1000}s)`);
        testIcon.remove();
        onSuccess?.();
      } else if (checkCount < maxChecks) {
        // NECESSARY: Network check requires periodic retries with delays
        // Icons may be slow to load on first visit or slow connections
        setTimeout(checkIcon, checkIntervalMs);
      } else {
        console.warn('[Iconify Service] ⚠️ API slow or not responding');
        console.log('  If icons are showing on the page, you can ignore this warning');
        testIcon.remove();
        onFailure?.();
      }
    };
    
    // NECESSARY: Initial delay gives Iconify time to initialize before first check
    setTimeout(checkIcon, checkIntervalMs);
  }

  /**
   * Executes a callback after ensuring DOM is ready and Iconify is loaded
   * Replacement for arbitrary setTimeout delays
   * 
   * @param callback - Function to execute after initialization
   * @param additionalDelayMs - Optional additional delay after Iconify is ready (default: 0)
   */
  async executeWhenReady(callback: () => void, additionalDelayMs: number = 0): Promise<void> {
    await this.waitForIconify();
    
    if (additionalDelayMs > 0) {
      // NECESSARY: Some operations need brief delay after Iconify is ready
      // for full initialization (e.g., API setup, icon preloading)
      setTimeout(callback, additionalDelayMs);
    } else {
      // Use queueMicrotask for next-tick execution without arbitrary delays
      queueMicrotask(callback);
    }
  }
}

