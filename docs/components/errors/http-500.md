# Http500

Internal Server Error page component. Displays a full-page 500 error with a watermark status code, title, description, and a primary action button. Wraps the shared `HttpErrorPage` layout with 500-specific defaults.

## Import

```ts
import { Http500 } from '@aspect/errors/http-500';
import type { Http500Props } from '@aspect/errors/http-500';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"Something went wrong on the server. Please try again later."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http500 } from '@aspect/errors/http-500';

// Default 500 page
const serverError = createElement(Http500, {});

// Custom with status page link
const withStatus = createElement(Http500, {
  description: 'Our engineers have been notified. Check the status page for updates.',
  actionLabel: 'Status Page',
  onAction: () => navigateTo('/status'),
});
```

## Features

- Displays status code 500 as a large background watermark.
- Title is fixed to "Internal Server Error".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- The action button uses `<button type="button">` for proper keyboard support.
