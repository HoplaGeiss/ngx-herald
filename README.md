# ngx-herald

A modern Angular toast notification library. Signals-first, zoneless-compatible, zero runtime dependencies.

[![CI](https://github.com/HoplaGeiss/ngx-herald/actions/workflows/ci.yml/badge.svg)](https://github.com/HoplaGeiss/ngx-herald/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/ngx-herald)](https://www.npmjs.com/package/ngx-herald)
[![license](https://img.shields.io/badge/license-MIT-blue)](LICENSE)

**[Live demo →](https://hoplageiss.github.io/ngx-herald/)**

### Why ngx-herald?

For years, `ngx-toastr` was the standard choice for toast notifications in Angular. However, after it was compromised and subsequently abandoned, the Angular community was left without a modern, secure, and actively maintained alternative—especially one designed for modern Angular architectures (Signals-first, zoneless-compatible, and zero runtime dependencies).

`ngx-herald` was built to fill this gap: a clean, modern, secure toaster library built from the ground up for modern Angular applications.

---

## Features

- **Signals-first** — internal state is a single `signal<Toast[]>`, OnPush throughout
- **Zoneless-compatible** — no `zone.js` dependency, works with `provideExperimentalZonelessChangeDetection()`
- **Zero runtime dependencies** — no lodash, no tinycolor, nothing
- **Both APIs** — injectable `ToastService` and imperative `toast.success(...)` proxy
- **Promise / Observable support** — `toast.promise()` accepts both
- **Fully themeable** — every visual decision is a CSS custom property
- **Custom content** — pass a `TemplateRef` to render arbitrary Angular content inside a toast
- **Accessible** — `role="log"`, `role="alert"` on errors, focus-visible dismiss button
- **Positions** — six positions, per-toast or global
- **Progress bar** — pure CSS animation, zero JS overhead

---

## Requirements

- Angular **20+**
- RxJS **7+** (peer dependency, only needed if you use `toast.promise()` with an Observable)

---

## Installation

```bash
npm install ngx-herald
# or
pnpm add ngx-herald
```

---

## Setup

Add the outlet component once at the root of your application (usually `app.component.html`):

```html
<!-- app.component.html -->
<ngx-herald />
<router-outlet />
```

That's it.

---

## Basic usage

### Imperative (anywhere in your codebase)

```ts
import { toast } from 'ngx-herald';

toast.success('File saved');
toast.error('Something went wrong', { description: 'Please try again.' });
toast.warning('Disk space low');
toast.info('Update available');
```

### Injectable service (inside Angular components / services)

```ts
import { ToastService } from 'ngx-herald';

@Component({ ... })
export class MyComponent {
  private toasts = inject(ToastService);

  save() {
    this.toasts.success('Saved', { description: 'All changes persisted.' });
  }
}
```

Both APIs share the same signal state — they are interchangeable.

---

## Toast options

Every method accepts an optional `ToastOptions` object as second argument.

```ts
toast.success('Message', {
  description: 'Optional subtitle text',
  duration: 5000,          // ms until auto-dismiss. 0 = never. Default: 4000
  position: 'top-right',  // override global position for this toast
  progressBar: true,       // default: true
  dismissible: true,       // show ✕ button. Default: true
  template: myTemplateRef, // custom Angular template (see below)
});
```

### `ToastOptions` reference

| Option | Type | Default | Description |
|---|---|---|---|
| `description` | `string` | — | Secondary line below the message |
| `duration` | `number` | `4000` | Auto-dismiss delay in ms. `0` disables it |
| `position` | `ToastPosition` | global config | Overrides the position for this toast only |
| `progressBar` | `boolean` | `true` | Show the countdown bar |
| `dismissible` | `boolean` | `true` | Show the close button |
| `template` | `TemplateRef` | — | Replaces the default content entirely |

---

## Dismiss programmatically

```ts
const id = toast.success('File saved');

// dismiss one
toast.dismiss(id);

// dismiss all
toast.dismissAll();
```

---

## Promise / Observable

`toast.promise()` shows a loading toast immediately and transitions it to success or error when the async operation settles.

```ts
toast.promise(fetch('/api/save'), {
  loading: 'Saving…',
  success: 'Saved!',
  error: 'Save failed.',
});
```

The messages can be functions that receive the resolved value or the error:

```ts
toast.promise(uploadFile(file), {
  loading: 'Uploading…',
  success: (data) => `Uploaded ${data.filename}`,
  error: (err) => `Upload failed: ${err.message}`,
});
```

Both `Promise<T>` and `Observable<T>` are accepted. Observables are automatically completed after the first emission.

---

## Custom templates

Pass a `TemplateRef` to take full control of the toast's content. The template receives the toast data and a dismiss function as context.

```html
<ng-template #myToast let-t let-dismiss="dismiss">
  <div style="padding: 12px 16px; display: flex; gap: 12px; align-items: center;">
    <img [src]="t.options.description" alt="" width="40" height="40" style="border-radius: 50%;" />
    <div>
      <strong>{{ t.message }}</strong>
    </div>
    <button (click)="dismiss()" aria-label="Dismiss">✕</button>
  </div>
</ng-template>
```

```ts
private readonly myToast = viewChild<TemplateRef<unknown>>('myToast');

show() {
  toast.success('Gabriel joined the team', {
    template: this.myToast() as TemplateRef<never>,
    description: 'https://example.com/avatar.jpg',
  });
}
```

### Template context type

```ts
interface ToastTemplateContext {
  $implicit: Toast;  // the full toast object
  dismiss: () => void;
}
```

---

## Configuration

To configure global defaults for every toast, register `provideToaster()` in your application providers (usually in `app.config.ts`). All fields are optional:

```ts
// app.config.ts
import { ApplicationConfig } from '@angular/core';
import { provideToaster } from 'ngx-herald';

export const appConfig: ApplicationConfig = {
  providers: [
    provideToaster({
      position: 'bottom-right',   // default: 'bottom-right'
      duration: 4000,             // default: 4000
      progressBar: true,          // default: true
      dismissible: true,          // default: true
      maxToasts: 5,               // default: 5 — oldest is dropped when exceeded
    }),
  ],
};
```

### Positions

```
'top-left'    | 'top-center'    | 'top-right'
'bottom-left' | 'bottom-center' | 'bottom-right'
```

### Component-level position override

If you need toasts at a specific position regardless of individual toast settings, pass `position` directly on `<ngx-herald>`:

```html
<ngx-herald position="top-right" />
```

---

## Theming

ngx-herald ships with neutral defaults that inherit your app's font. Every visual decision is a CSS custom property — override what you need in your global stylesheet.

```css
:root {
  /* layout */
  --ngx-toast-z-index: 9999;
  --ngx-toast-gap: 8px;
  --ngx-toast-width: 360px;
  --ngx-toast-padding: 12px 16px;
  --ngx-toast-border-radius: 8px;
  --ngx-toast-offset: 16px;

  /* typography */
  --ngx-toast-font-family: inherit;
  --ngx-toast-font-size: 14px;
  --ngx-toast-message-weight: 500;
  --ngx-toast-message-color: #111827;
  --ngx-toast-description-color: #6b7280;
  --ngx-toast-description-size: 13px;

  /* visual */
  --ngx-toast-bg: #ffffff;
  --ngx-toast-border: 1px solid rgba(0, 0, 0, 0.08);
  --ngx-toast-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);

  /* type accent colors */
  --ngx-toast-success-color: #22c55e;
  --ngx-toast-error-color: #ef4444;
  --ngx-toast-warning-color: #f59e0b;
  --ngx-toast-info-color: #3b82f6;

  /* progress bar */
  --ngx-toast-progress-height: 3px;
  --ngx-toast-progress-opacity: 0.3;
}
```

### Dark mode example

```css
@media (prefers-color-scheme: dark) {
  :root {
    --ngx-toast-bg: #1f2937;
    --ngx-toast-border: 1px solid rgba(255, 255, 255, 0.08);
    --ngx-toast-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    --ngx-toast-message-color: #f9fafb;
    --ngx-toast-description-color: #9ca3af;
  }
}
```

### Angular Material override example

```css
:root {
  --ngx-toast-font-family: var(--mat-sys-body-medium-font);
  --ngx-toast-border-radius: 4px;
  --ngx-toast-bg: var(--mat-sys-surface);
  --ngx-toast-message-color: var(--mat-sys-on-surface);
  --ngx-toast-border: none;
  --ngx-toast-shadow: var(--mat-sys-level2);
}
```

---

## Comparison

| | ngx-herald | ngx-toastr | Angular Material Snackbar |
|---|---|---|---|
| Angular 20+ / zoneless | ✅ | ❌ abandoned | ✅ |
| Signals-first | ✅ | ❌ | ❌ |
| Zero dependencies | ✅ | ❌ | ❌ |
| Imperative API | ✅ | ✅ | ❌ |
| Injectable service | ✅ | ✅ | ✅ |
| Promise / Observable | ✅ | ❌ | ❌ |
| Custom TemplateRef | ✅ | partial | ✅ |
| CSS custom properties | ✅ | ❌ | partial |
| npm provenance | ✅ | ❌ | — |

---

## Contributing

Pull requests are welcome. For significant changes please open an issue first.

```bash
git clone https://github.com/HoplaGeiss/ngx-herald.git
cd ngx-herald
pnpm install
ng serve demo   # starts the demo app at localhost:4200
```

---

## License

[MIT](LICENSE)