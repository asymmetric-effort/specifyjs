# HttpErrorPage

Base layout component for HTTP error pages. Renders a centered full-height container with a large watermark status code, title, description, and optional action buttons.

This is an internal shared component used by all specific HTTP error page components (Http400, Http404, Http500, etc.). You typically will not use this directly -- prefer the specific error components instead.

## Import

```ts
import { HttpErrorPage } from '@aspect/errors/_shared';
import type { HttpErrorPageProps } from '@aspect/errors/_shared';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `statusCode` | `number` | required | HTTP status code displayed as a large watermark (e.g. 404) |
| `title` | `string` | required | Error title displayed as an h1 heading (e.g. "Not Found") |
| `description` | `string` | `undefined` | Descriptive message displayed below the title |
| `actionLabel` | `string` | `"Go Home"` | Label for the primary action button |
| `onAction` | `() => void` | navigates to `"/"` | Handler for the primary action button |
| `showGoBack` | `boolean` | `undefined` | Whether to show a secondary "Go Back" button that calls `window.history.back()` |

## Usage

```ts
import { createElement } from 'specifyjs';
import { HttpErrorPage } from '@aspect/errors/_shared';

// Custom error page
const errorPage = createElement(HttpErrorPage, {
  statusCode: 418,
  title: "I'm a Teapot",
  description: 'The server refuses to brew coffee because it is a teapot.',
  actionLabel: 'Try Coffee Maker',
  onAction: () => navigateTo('/coffee'),
  showGoBack: true,
});
```

## Layout

The component renders the following structure:

1. A full-viewport centered flex container (`role="alert"`, `aria-live="assertive"`)
2. A large watermark showing the status code (120px, 15% opacity, `aria-hidden="true"`)
3. An `<h1>` title
4. An optional `<p>` description (max-width 480px, 70% opacity)
5. A primary action `<button>`
6. An optional secondary "Go Back" `<button>` (underlined, 70% opacity)

## Accessibility

- The outer container uses `role="alert"` with `aria-live="assertive"` to announce the error to screen readers immediately.
- The watermark status code is marked `aria-hidden="true"` since the meaningful title conveys the same information.
- Both action buttons use `<button type="button">` for proper keyboard and assistive technology support.
