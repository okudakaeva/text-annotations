import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import {
  provideRouter,
  Router,
  withComponentInputBinding,
  withInMemoryScrolling,
  withNavigationErrorHandler
} from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top' }),
      withNavigationErrorHandler(() => {
        const router = inject(Router);
        router.navigate(['/not-found']);
      }),
    ),
  ]
};
