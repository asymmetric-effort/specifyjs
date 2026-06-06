# Http504

Gateway Timeout error page component. Displays a full-page 504 error with a watermark status code, title, description, and a primary action button. Wraps the shared `HttpErrorPage` layout with 504-specific defaults.

## Import

```ts
import { Http504 } from '@aspect/errors/http-504';
import type { Http504Props } from '@aspect/errors/http-504';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The server did not respond in time. Please try again later."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http504 } from '@aspect/errors/http-504';

// Default 504 page
const gatewayTimeout = createElement(Http504, {});

// Custom with retry
const withRetry = createElement(Http504, {
  description: 'The request to the backend timed out. The server may be under heavy load.',
  actionLabel: 'Retry',
  onAction: () => window.location.reload(),
});
```

## Features

- Displays status code 504 as a large background watermark.
- Title is fixed to "Gateway Timeout".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- The action button uses `<button type="button">` for proper keyboard support.
