import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Toast } from './toast.models';
import { ToastService } from './toast.service';

@Component({
  selector: 'ngx-herald-item',
  imports: [NgTemplateOutlet],
  templateUrl: './toast-item.component.html',
  styleUrl: './toast-item.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': 'toast().type === "error" ? "alert" : "status"',
    '[class.is-leaving]': 'toast().isLeaving',
    '[style.--_duration]': 'durationStyle()',
  },
})
export class ToastItemComponent {
  readonly toast = input.required<Toast>();
  private readonly service = inject(ToastService);

  protected readonly durationStyle = computed(() => `${this.toast().options.duration}ms`);

  protected readonly templateContext = computed(() => ({
    $implicit: this.toast(),
    dismiss: () => this.service.dismiss(this.toast().id),
  }));

  protected dismiss(): void {
    this.service.dismiss(this.toast().id);
  }
}
