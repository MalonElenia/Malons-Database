import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { IconPreloadService } from './core/services/icon-preload.service';

/**
 * Application configuration
 * 
 * Design decisions:
 * - HttpClient with fetch API for better performance and SSR compatibility
 * - Client hydration for improved initial page load
 * - Event replay for better user experience during hydration
 * - Angular animations for smooth UI transitions
 * - Iconify for comprehensive icon support (200,000+ icons from 150+ libraries)
 *   with zero configuration - icons load automatically based on frontmatter
 * - Icon preloading via APP_INITIALIZER for immediate availability on first page load
 *   (improves reliability and reduces perceived loading time)
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideAnimations(),
    provideClientHydration(withEventReplay()),
    // Preload commonly used icons during app initialization
    {
      provide: APP_INITIALIZER,
      useFactory: (iconPreloadService: IconPreloadService) => () => iconPreloadService.preloadIcons(),
      deps: [IconPreloadService],
      multi: true,
    },
  ]
};
