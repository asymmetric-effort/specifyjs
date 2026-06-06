# Http404

Not Found error page component. Displays a full-page 404 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 404-specific defaults.

## Import

```ts
import { Http404 } from '@aspect/errors/http-404';
import type { Http404Props } from '@aspect/errors/http-404';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"The page you are looking for does not exist or has been moved."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http404 } from '@aspect/errors/http-404';

// Default 404 page
const notFound = createElement(Http404, {});

// Custom 404 with search suggestion
const withSearch = createElement(Http404, {
  description: 'We could not find that page. Try searching instead.',
  actionLabel: 'Search',
  onAction: () => navigateTo('/search'),
});
```

## Features

- Displays status code 404 as a large background watermark.
- Title is fixed to "Not Found".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
