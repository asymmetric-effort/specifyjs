# Banner

A dismissible banner that displays at the top of the page with a three-column layout: severity icon, message text, and an optional dismiss button. Supports three severity levels with distinct color themes.

## Import

```ts
import { Banner } from '@aspect/feedback/banner';
import type { BannerProps, BannerSeverity } from '@aspect/feedback/banner';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `severity` | `'info' \| 'warning' \| 'alert'` | required | Determines the icon and color scheme |
| `message` | `string` | required | Plain text message to display |
| `onDismiss` | `() => void` | `undefined` | Called when the dismiss button is clicked. If omitted, the dismiss button is hidden |
| `icon` | `unknown` | `undefined` | Custom icon element to override the default severity icon |
| `visible` | `boolean` | `true` | Whether the banner is visible. When false, renders nothing |

### Severity themes

| Severity | Background | Border | Icon Color | Text Color |
|----------|-----------|--------|------------|------------|
| `info` | #eff6ff | #3b82f6 | #3b82f6 | #1e40af |
| `warning` | #fffbeb | #f59e0b | #f59e0b | #92400e |
| `alert` | #fef2f2 | #ef4444 | #ef4444 | #991b1b |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Banner } from '@aspect/feedback/banner';

// Info banner (non-dismissible)
const info = createElement(Banner, {
  severity: 'info',
  message: 'A new version is available.',
});

// Warning banner with dismiss
const warning = createElement(Banner, {
  severity: 'warning',
  message: 'Your session will expire in 5 minutes.',
  onDismiss: () => setShowWarning(false),
});

// Alert banner
const alert = createElement(Banner, {
  severity: 'alert',
  message: 'Failed to save changes. Please try again.',
  onDismiss: () => dismissAlert(),
});

// Banner with custom icon
const custom = createElement(Banner, {
  severity: 'info',
  message: 'Maintenance scheduled for tonight.',
  icon: myCustomIcon,
  onDismiss: handleDismiss,
});

// Conditionally visible banner
const conditional = createElement(Banner, {
  severity: 'warning',
  message: 'Unsaved changes detected.',
  visible: hasUnsavedChanges,
});
```

## Features

- Three severity levels, each with a distinct SVG icon (info circle, warning triangle, alert circle).
- Three-column layout: 50x50px icon pane, flexible message pane, and a dismiss button pane.
- Dismiss button renders as a circular button with a multiplication sign, only when `onDismiss` is provided.
- Custom icon support overrides the default severity icon.
- `visible` prop allows declarative show/hide without unmounting logic.
- Full-width layout with a colored bottom border matching the severity theme.

## Accessibility

- Uses `role="alert"` for the `alert` severity and `role="status"` for `info` and `warning`.
- `aria-live="polite"` is set on the container for assistive technology announcements.
- The dismiss button has `aria-label="Dismiss banner"` for screen reader identification.
- Default SVG icons include `aria-hidden="true"` to prevent redundant announcement.
