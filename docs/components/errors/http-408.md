# Http408

Request Timeout error page component. Displays a full-page 408 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 408-specific defaults.

## Import

```ts
import { Http408 } from '@aspect/errors/http-408';
import type { Http408Props } from '@aspect/errors/http-408';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The server timed out waiting for the request. Please try again."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http408 } from '@aspect/errors/http-408';

// Default 408 page
const timeout = createElement(Http408, {});

// Custom retry action
const withRetry = createElement(Http408, {
  description: 'The upload took too long. Please try with a smaller file.',
  actionLabel: 'Try Again',
  onAction: () => window.location.reload(),
});
```

## Features

- Displays status code 408 as a large background watermark.
- Title is fixed to "Request Timeout".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
