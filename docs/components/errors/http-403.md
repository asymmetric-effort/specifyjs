# Http403

Forbidden error page component. Displays a full-page 403 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 403-specific defaults.

## Import

```ts
import { Http403 } from '@aspect/errors/http-403';
import type { Http403Props } from '@aspect/errors/http-403';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"You do not have permission to access this resource."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http403 } from '@aspect/errors/http-403';

// Default 403 page
const forbidden = createElement(Http403, {});

// Custom action to request access
const withRequest = createElement(Http403, {
  description: 'This resource requires elevated privileges.',
  actionLabel: 'Request Access',
  onAction: () => navigateTo('/request-access'),
});
```

## Features

- Displays status code 403 as a large background watermark.
- Title is fixed to "Forbidden".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
