# Http429

Too Many Requests error page component. Displays a full-page 429 error with a watermark status code, title, description, and action buttons. Wraps the shared `HttpErrorPage` layout with 429-specific defaults.

## Import

```ts
import { Http429 } from '@aspect/errors/http-429';
import type { Http429Props } from '@aspect/errors/http-429';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `description` | `string` | `"You have sent too many requests. Please wait and try again."` | Override the default description text |
| `actionLabel` | `string` | `"Go Home"` | Override the primary action button label |
| `onAction` | `() => void` | navigates to `"/"` | Override the primary action handler |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Http429 } from '@aspect/errors/http-429';

// Default 429 page
const rateLimited = createElement(Http429, {});

// Custom with wait suggestion
const withWait = createElement(Http429, {
  description: 'Rate limit exceeded. Please wait 60 seconds before retrying.',
  actionLabel: 'Go to Dashboard',
  onAction: () => navigateTo('/dashboard'),
});
```

## Features

- Displays status code 429 as a large background watermark.
- Title is fixed to "Too Many Requests".
- Includes a secondary "Go Back" button that calls `window.history.back()`.
- Falls back to navigating to `"/"` if no `onAction` handler is provided.

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers.
- The watermark status code is marked `aria-hidden="true"`.
- Action buttons use `<button type="button">` for proper keyboard support.
