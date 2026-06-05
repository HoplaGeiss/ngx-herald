import { TemplateRef } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';

export interface ToastTemplateContext {
  $implicit: Toast;
  dismiss: () => void;
}

export interface ToastOptions {
  description?: string;
  duration?: number;
  position?: ToastPosition;
  progressBar?: boolean;
  dismissible?: boolean;
  template?: TemplateRef<ToastTemplateContext>;
}

export interface ResolvedToastOptions {
  description: string;
  duration: number;
  position: ToastPosition;
  progressBar: boolean;
  dismissible: boolean;
  template: TemplateRef<ToastTemplateContext> | null;
}

export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  options: ResolvedToastOptions;
  createdAt: number;
  isLeaving: boolean;
}

export interface ToastPromiseOptions<T> {
  loading: string;
  success: string | ((data: T) => string);
  error: string | ((err: unknown) => string);
}

export interface ToastConfig {
  position?: ToastPosition;
  duration?: number;
  progressBar?: boolean;
  dismissible?: boolean;
  maxToasts?: number;
}
