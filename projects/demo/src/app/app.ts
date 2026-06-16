import { ChangeDetectionStrategy, Component, TemplateRef, viewChild, effect, inject, signal, computed } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { toast, ToasterComponent, ToastPosition } from 'ngx-herald';

@Component({
  selector: 'app-root',
  imports: [ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly customTmpl = viewChild<TemplateRef<unknown>>('customTmpl');

  readonly themes = [
    { id: 'default', label: 'Default' },
    { id: 'material', label: 'Angular Material' },
    { id: 'bootstrap', label: 'Bootstrap' },
    { id: 'prime', label: 'PrimeNG' },
  ] as const;

  readonly activeTheme = signal<'default' | 'material' | 'bootstrap' | 'prime'>('default');

  // Configuration Signals
  readonly activePreviewType = signal<'success' | 'error' | 'warning' | 'info'>('success');
  readonly message = signal<string>('Operation completed successfully');
  readonly description = signal<string>('Your changes have been saved.');
  readonly duration = signal<number>(4000);
  readonly position = signal<ToastPosition>('bottom-right');
  readonly progressBar = signal<boolean>(true);
  readonly dismissible = signal<boolean>(true);

  readonly positions: ToastPosition[] = [
    'bottom-right',
    'bottom-center',
    'bottom-left',
    'top-right',
    'top-center',
    'top-left',
  ];

  readonly codeSnippet = computed(() => {
    const type = this.activePreviewType();
    const msg = this.message();
    const desc = this.description();
    const dur = this.duration();
    const pos = this.position();
    const pBar = this.progressBar();
    const dis = this.dismissible();

    const options: string[] = [];
    if (desc) options.push(`  description: '${desc}'`);
    if (dur !== 4000) options.push(`  duration: ${dur}`);
    if (pos !== 'bottom-right') options.push(`  position: '${pos}'`);
    if (!pBar) options.push(`  progressBar: false`);
    if (!dis) options.push(`  dismissible: false`);

    if (options.length === 0) {
      return `toast.${type}('${msg}');`;
    }

    return `toast.${type}('${msg}', {\n${options.join(',\n')}\n});`;
  });

  private readonly document = inject(DOCUMENT);

  constructor() {
    effect(() => {
      const theme = this.activeTheme();
      const body = this.document.body;
      body.classList.remove('theme-default', 'theme-material', 'theme-bootstrap', 'theme-prime');
      body.classList.add(`theme-${theme}`);
    });
  }

  setTheme(theme: 'default' | 'material' | 'bootstrap' | 'prime'): void {
    this.activeTheme.set(theme);
  }

  triggerToast(type: 'success' | 'error' | 'warning' | 'info'): void {
    this.activePreviewType.set(type);

    const options: any = {
      description: this.description(),
      duration: this.duration(),
      position: this.position(),
      progressBar: this.progressBar(),
      dismissible: this.dismissible(),
    };

    toast[type](this.message(), options);
  }

  updateMessage(event: Event): void {
    this.message.set((event.target as HTMLInputElement).value);
  }

  updateDescription(event: Event): void {
    this.description.set((event.target as HTMLInputElement).value);
  }

  updateDuration(event: Event): void {
    this.duration.set(Number((event.target as HTMLInputElement).value));
  }

  updatePosition(event: Event): void {
    this.position.set((event.target as HTMLSelectElement).value as ToastPosition);
  }

  updateProgressBar(event: Event): void {
    this.progressBar.set((event.target as HTMLInputElement).checked);
  }

  updateDismissible(event: Event): void {
    this.dismissible.set((event.target as HTMLInputElement).checked);
  }

  showPromise(): void {
    const fakeRequest = new Promise<string>((resolve) =>
      setTimeout(() => resolve('done'), 2000),
    );
    toast.promise(fakeRequest, {
      loading: 'Uploading file…',
      success: () => 'Upload complete!',
      error: (e) => `Upload failed: ${String(e)}`,
    });
  }

  showPromiseError(): void {
    const fakeRequest = new Promise<string>((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), 2000),
    );
    toast.promise(fakeRequest, {
      loading: 'Connecting…',
      success: () => 'Connected!',
      error: (e) => `Failed: ${e instanceof Error ? e.message : 'unknown error'}`,
    });
  }

  showCustom(): void {
    const tmpl = this.customTmpl();
    if (tmpl) {
      toast.success('Custom Template', { template: tmpl as TemplateRef<never> });
    }
  }

  dismissAll(): void {
    toast.dismissAll();
  }
}
