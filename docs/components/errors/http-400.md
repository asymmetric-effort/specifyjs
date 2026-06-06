# Http400

Bad Request error page component. Displays a full-page 400 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 400-specific defaults.

## Import

```ts
import { Http400 } from '@aspect/errors/http-400';
import type { Http400Props } from '@aspect/errors/http-400';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The request could not be understood. Please check your input."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http400 } from '@aspect/errors/http-400';

// Default 400 page
const badRequest = createElement(Http400, {});

// Custom description and action
const custom = createElement(Http400, {
  description: 'The form data was invalid. Please correct the highlighted fields.',
  actionLabel: 'Back to Form',
  onAction: () => navigateTo('/form'),
});
```

## Features

- Displays status code 400 as a large background watermark.
- Title is fixed to "Bad Request".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
