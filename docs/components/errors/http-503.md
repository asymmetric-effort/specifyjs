# Http503

Service Unavailable error page component. Displays a full-page 503 error with a watermark status code, title, description, and a primary action button. Wraps the shared `HttpErrorPage` layout with 503-specific defaults.

## Import

```ts
import { Http503 } from '@aspect/errors/http-503';
import type { Http503Props } from '@aspect/errors/http-503';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The service is temporarily unavailable. Please try again later."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http503 } from '@aspect/errors/http-503';

// Default 503 page
const unavailable = createElement(Http503, {});

// Custom maintenance page
const maintenance = createElement(Http503, {
  description: 'We are performing scheduled maintenance. Expected back at 3:00 PM UTC.',
  actionLabel: 'Status Page',
  onAction: () => navigateTo('/status'),
});
```

## Features

- Displays status code 503 as a large background watermark.
- Title is fixed to "Service Unavailable".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- The action button uses `<button type="button">` for proper keyboard support.
