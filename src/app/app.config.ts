import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { provideRouter, Router, withComponentInputBinding, withNavigationErrorHandler } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(),
      withNavigationErrorHandler(() => {
        const router = inject(Router);
        router.navigate(['/not-found']);
      }),
    ),
  ]
};
