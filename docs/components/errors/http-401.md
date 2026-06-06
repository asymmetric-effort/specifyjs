# Http401

Unauthorized error page component. Displays a full-page 401 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 401-specific defaults.

## Import

```ts
import { Http401 } from '@aspect/errors/http-401';
import type { Http401Props } from '@aspect/errors/http-401';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"You must sign in to access this page."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http401 } from '@aspect/errors/http-401';

// Default 401 page
const unauthorized = createElement(Http401, {});

// Redirect to login
const withLogin = createElement(Http401, {
  description: 'Your session has expired. Please sign in again.',
  actionLabel: 'Sign In',
  onAction: () => navigateTo('/login'),
});
```

## Features

- Displays status code 401 as a large background watermark.
- Title is fixed to "Unauthorized".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
