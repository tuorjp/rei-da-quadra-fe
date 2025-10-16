import { ApplicationConfig, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { authInterceptor } from './config/auth.interceptor';
import { ApiModule, Configuration } from './api';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

export function apiConfigFactory(): Configuration {
  return new Configuration({
    basePath: 'http://localhost:8090'
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([
      authInterceptor
    ])),
    provideAnimationsAsync(),
    importProvidersFrom(ApiModule.forRoot(apiConfigFactory))
  ]
};
