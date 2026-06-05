import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { render, screen } from '@testing-library/angular/zoneless';
import { TOAST_CONFIG } from './toast.config';
import { ToasterComponent } from './toaster.component';
import { ToastService } from './toast.service';

describe('ToasterComponent', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    vi.useRealTimers();
  });

  async function setup(config?: object) {
    const result = await render(ToasterComponent, {
      providers: [
        provideZonelessChangeDetection(),
        ...(config ? [{ provide: TOAST_CONFIG, useValue: config }] : []),
      ],
    });
    const service = TestBed.inject(ToastService);
    return { fixture: result.fixture, service };
  }

  it('renders a toast message', async () => {
    const { fixture, service } = await setup();
    service.success('File saved');
    fixture.detectChanges();
    expect(screen.getByText('File saved')).toBeInTheDocument();
  });

  it('renders a toast description', async () => {
    const { fixture, service } = await setup();
    service.info('Update available', { description: 'Version 2.0 is ready' });
    fixture.detectChanges();
    expect(screen.getByText('Version 2.0 is ready')).toBeInTheDocument();
  });

  it('renders multiple toasts', async () => {
    const { fixture, service } = await setup();
    service.success('First', { duration: 0 });
    service.warning('Second', { duration: 0 });
    fixture.detectChanges();
    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('uses role="status" for non-error toasts', async () => {
    const { fixture, service } = await setup();
    service.success('Done');
    fixture.detectChanges();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('uses role="alert" for error toasts', async () => {
    const { fixture, service } = await setup();
    service.error('Something went wrong');
    fixture.detectChanges();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('shows a progress bar by default', async () => {
    const { fixture, service } = await setup();
    service.success('Loading');
    fixture.detectChanges();
    expect(document.querySelector('.ngx-herald-item__progress')).toBeInTheDocument();
  });

  it('hides progress bar when disabled', async () => {
    const { fixture, service } = await setup();
    service.success('No bar', { progressBar: false });
    fixture.detectChanges();
    expect(document.querySelector('.ngx-herald-item__progress')).not.toBeInTheDocument();
  });

  it('hides the dismiss button when dismissible is false', async () => {
    const { fixture, service } = await setup();
    service.success('Sticky', { dismissible: false, duration: 0 });
    fixture.detectChanges();
    expect(screen.queryByRole('button', { name: 'Dismiss notification' })).not.toBeInTheDocument();
  });

  it('removes a toast after clicking dismiss', async () => {
    vi.useFakeTimers();
    const { fixture, service } = await setup();
    service.success('Dismiss me', { duration: 0 });
    fixture.detectChanges();

    screen.getByRole('button', { name: 'Dismiss notification' }).click();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument();
  });

  it('removes all toasts when dismissAll is called', async () => {
    vi.useFakeTimers();
    const { fixture, service } = await setup();
    service.success('First', { duration: 0 });
    service.success('Second', { duration: 0 });
    fixture.detectChanges();

    service.dismissAll();
    vi.advanceTimersByTime(300);
    fixture.detectChanges();

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.queryByText('Second')).not.toBeInTheDocument();
  });

  it('drops the oldest toast when maxToasts is exceeded', async () => {
    const { fixture, service } = await setup({ maxToasts: 2 });
    service.success('First', { duration: 0 });
    service.success('Second', { duration: 0 });
    service.success('Third', { duration: 0 });
    fixture.detectChanges();

    expect(screen.queryByText('First')).not.toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });

  it('resolves a promise toast to success', async () => {
    const { fixture, service } = await setup();
    service.promise(Promise.resolve('ok'), {
      loading: 'Saving…',
      success: 'Saved!',
      error: 'Failed',
    });
    fixture.detectChanges();
    expect(screen.getByText('Saving…')).toBeInTheDocument();

    await Promise.resolve();
    fixture.detectChanges();
    expect(screen.queryByText('Saving…')).not.toBeInTheDocument();
    expect(screen.getByText('Saved!')).toBeInTheDocument();
  });

  it('resolves a promise toast to error', async () => {
    const { fixture, service } = await setup();
    service.promise(Promise.reject(new Error('oops')), {
      loading: 'Saving…',
      success: 'Saved!',
      error: 'Failed',
    });
    fixture.detectChanges();

    await Promise.resolve();
    await Promise.resolve(); // reject goes through an extra microtask hop (.then skip + .catch run)
    fixture.detectChanges();
    expect(screen.getByText('Failed')).toBeInTheDocument();
  });
});
