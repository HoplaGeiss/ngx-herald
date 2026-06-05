import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideToaster } from 'ngx-herald';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideToaster({ position: 'bottom-right', duration: 4000 }),
  ],
};
