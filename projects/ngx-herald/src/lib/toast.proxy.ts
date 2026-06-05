import { Observable } from 'rxjs';
import { ToastOptions, ToastPromiseOptions } from './toast.models';
import { ToastService } from './toast.service';

let _service: ToastService | null = null;

export function initToastRef(service: ToastService): void {
  _service = service;
}

function getService(): ToastService {
  if (!_service) {
    throw new Error(
      '[ngx-herald] toast() called before <ngx-herald> is mounted. ' +
        'Add <ngx-herald /> to your app.component.html.',
    );
  }
  return _service;
}

export const toast = {
  success: (message: string, options?: ToastOptions): string =>
    getService().success(message, options),

  error: (message: string, options?: ToastOptions): string =>
    getService().error(message, options),

  warning: (message: string, options?: ToastOptions): string =>
    getService().warning(message, options),

  info: (message: string, options?: ToastOptions): string =>
    getService().info(message, options),

  show: (type: Parameters<ToastService['show']>[0], message: string, options?: ToastOptions): string =>
    getService().show(type, message, options),

  dismiss: (id: string): void => getService().dismiss(id),

  dismissAll: (): void => getService().dismissAll(),

  promise: <T>(
    source: Observable<T> | Promise<T>,
    options: ToastPromiseOptions<T>,
  ): void => getService().promise(source, options),
};
