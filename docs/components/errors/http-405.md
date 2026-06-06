# Http405

Method Not Allowed error page component. Displays a full-page 405 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 405-specific defaults.

## Import

```ts
import { Http405 } from '@aspect/errors/http-405';
import type { Http405Props } from '@aspect/errors/http-405';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The request method is not supported for this resource."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http405 } from '@aspect/errors/http-405';

// Default 405 page
const methodNotAllowed = createElement(Http405, {});

// Custom description
const custom = createElement(Http405, {
  description: 'POST requests are not accepted on this endpoint.',
  actionLabel: 'View API Docs',
  onAction: () => navigateTo('/docs/api'),
});
```

## Features

- Displays status code 405 as a large background watermark.
- Title is fixed to "Method Not Allowed".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
