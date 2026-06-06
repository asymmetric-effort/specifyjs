# Http502

Bad Gateway error page component. Displays a full-page 502 error with a watermark status code, title, description, and a primary action button. Wraps the shared `HttpErrorPage` layout with 502-specific defaults.

## Import

```ts
import { Http502 } from '@aspect/errors/http-502';
import type { Http502Props } from '@aspect/errors/http-502';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The server received an invalid response. Please try again later."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http502 } from '@aspect/errors/http-502';

// Default 502 page
const badGateway = createElement(Http502, {});

// Custom with retry
const withRetry = createElement(Http502, {
  description: 'The upstream service is not responding. This is usually temporary.',
  actionLabel: 'Retry',
  onAction: () => window.location.reload(),
});
```

## Features

- Displays status code 502 as a large background watermark.
- Title is fixed to "Bad Gateway".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- The action button uses `<button type="button">` for proper keyboard support.
