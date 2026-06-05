import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { ToastItemComponent } from './toast-item.component';
import { ToastPosition } from './toast.models';
import { ToastService } from './toast.service';
import { initToastRef } from './toast.proxy';

@Component({
  selector: 'ngx-herald',
  imports: [ToastItemComponent],
  templateUrl: './toaster.component.html',
  styleUrl: './toaster.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToasterComponent {
  private readonly service = inject(ToastService);

  readonly position = input<ToastPosition | undefined>(undefined);

  protected readonly positionGroups = computed(() => {
    const override = this.position();
    const toasts = this.service.toasts();

    if (override) {
      return [{ position: override, toasts }];
    }

    const groups = new Map<ToastPosition, typeof toasts>();
    for (const toast of toasts) {
      const pos = toast.options.position;
      const existing = groups.get(pos);
      if (existing) {
        existing.push(toast);
      } else {
        groups.set(pos, [toast]);
      }
    }

    return Array.from(groups.entries()).map(([position, toasts]) => ({ position, toasts }));
  });

  constructor() {
    initToastRef(this.service);
  }
}
