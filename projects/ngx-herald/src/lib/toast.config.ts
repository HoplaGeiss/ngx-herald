import { EnvironmentProviders, InjectionToken, makeEnvironmentProviders } from '@angular/core';
import { ToastConfig } from './toast.models';

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG');

export function provideToaster(config?: ToastConfig): EnvironmentProviders {
  return makeEnvironmentProviders([
    { provide: TOAST_CONFIG, useValue: config ?? {} },
  ]);
}
