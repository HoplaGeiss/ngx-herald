import { inject, Injectable, signal } from '@angular/core';
import { take } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { TOAST_CONFIG } from './toast.config';
import {
  ResolvedToastOptions,
  Toast,
  ToastOptions,
  ToastPosition,
  ToastPromiseOptions,
  ToastType,
} from './toast.models';

const LEAVE_DURATION = 300;
const DEFAULT_DURATION = 4000;
const DEFAULT_POSITION: ToastPosition = 'bottom-right';
const DEFAULT_MAX_TOASTS = 5;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly config = inject(TOAST_CONFIG, { optional: true }) ?? {};
  private readonly _toasts = signal<Toast[]>([]);
  private readonly timers = new Map<string, ReturnType<typeof setTimeout>>();

  readonly toasts = this._toasts.asReadonly();

  success(message: string, options?: ToastOptions): string {
    return this.show('success', message, options);
  }

  error(message: string, options?: ToastOptions): string {
    return this.show('error', message, options);
  }

  warning(message: string, options?: ToastOptions): string {
    return this.show('warning', message, options);
  }

  info(message: string, options?: ToastOptions): string {
    return this.show('info', message, options);
  }

  show(type: ToastType, message: string, options?: ToastOptions): string {
    const id = crypto.randomUUID();
    const resolved: ResolvedToastOptions = {
      description: options?.description ?? '',
      duration: options?.duration ?? this.config.duration ?? DEFAULT_DURATION,
      position: options?.position ?? this.config.position ?? DEFAULT_POSITION,
      progressBar: options?.progressBar ?? this.config.progressBar ?? true,
      dismissible: options?.dismissible ?? this.config.dismissible ?? true,
      template: options?.template ?? null,
    };

    const toast: Toast = { id, type, message, options: resolved, createdAt: Date.now(), isLeaving: false };
    const maxToasts = this.config.maxToasts ?? DEFAULT_MAX_TOASTS;

    this._toasts.update(toasts => {
      const next = [...toasts, toast];
      if (next.length <= maxToasts) return next;
      // Drop oldest: remove first item (mark as leaving instantly, skip animation)
      const [oldest, ...rest] = next;
      this.clearTimer(oldest.id);
      return rest;
    });

    if (resolved.duration > 0) {
      this.scheduleRemove(id, resolved.duration);
    }

    return id;
  }

  dismiss(id: string): void {
    this.clearTimer(id);
    this._toasts.update(toasts =>
      toasts.map(t => (t.id === id ? { ...t, isLeaving: true } : t)),
    );
    setTimeout(() => {
      this._toasts.update(toasts => toasts.filter(t => t.id !== id));
    }, LEAVE_DURATION);
  }

  dismissAll(): void {
    this.timers.forEach((_, id) => this.clearTimer(id));
    this._toasts.update(toasts => toasts.map(t => ({ ...t, isLeaving: true })));
    setTimeout(() => this._toasts.set([]), LEAVE_DURATION);
  }

  promise<T>(source: Observable<T> | Promise<T>, options: ToastPromiseOptions<T>): void {
    const id = this.show('info', options.loading, { duration: 0, progressBar: false, dismissible: false });

    const onSuccess = (data: T): void => {
      const message = typeof options.success === 'function' ? options.success(data) : options.success;
      this.resolvePromiseToast(id, 'success', message);
    };

    const onError = (err: unknown): void => {
      const message = typeof options.error === 'function' ? options.error(err) : options.error;
      this.resolvePromiseToast(id, 'error', message);
    };

    if (typeof (source as Observable<T>).subscribe === 'function') {
      (source as Observable<T>).pipe(take(1)).subscribe({ next: onSuccess, error: onError });
    } else {
      (source as Promise<T>).then(onSuccess).catch(onError);
    }
  }

  private resolvePromiseToast(id: string, type: ToastType, message: string): void {
    this._toasts.update(toasts =>
      toasts.map(t =>
        t.id === id
          ? {
              ...t,
              type,
              message,
              options: { ...t.options, duration: DEFAULT_DURATION, progressBar: true, dismissible: true },
            }
          : t,
      ),
    );
    this.scheduleRemove(id, DEFAULT_DURATION);
  }

  private scheduleRemove(id: string, duration: number): void {
    const timer = setTimeout(() => {
      this.timers.delete(id);
      this.dismiss(id);
    }, duration);
    this.timers.set(id, timer);
  }

  private clearTimer(id: string): void {
    const timer = this.timers.get(id);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
  }
}
