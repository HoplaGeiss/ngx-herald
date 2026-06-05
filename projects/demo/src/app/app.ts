import { ChangeDetectionStrategy, Component, TemplateRef, viewChild } from '@angular/core';
import { toast, ToasterComponent } from 'ngx-herald';

@Component({
  selector: 'app-root',
  imports: [ToasterComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  private readonly customTmpl = viewChild<TemplateRef<unknown>>('customTmpl');

  showSuccess(): void {
    toast.success('File saved successfully', { description: 'Your changes have been saved.' });
  }

  showError(): void {
    toast.error('Something went wrong', { description: 'Please try again later.' });
  }

  showWarning(): void {
    toast.warning('Disk space low', { description: 'You have less than 1 GB remaining.' });
  }

  showInfo(): void {
    toast.info('New version available', { description: 'Refresh to get the latest features.' });
  }

  showNoDismiss(): void {
    toast.success('Auto-dismiss only', { dismissible: false, duration: 3000 });
  }

  showNoProgress(): void {
    toast.info('No progress bar', { progressBar: false });
  }

  showLong(): void {
    toast.info('This one sticks around', { duration: 10000, description: '10 second duration.' });
  }

  showCustom(): void {
    const tmpl = this.customTmpl();
    if (tmpl) {
      toast.success('Custom template', { template: tmpl as TemplateRef<never> });
    }
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

  dismissAll(): void {
    toast.dismissAll();
  }
}
