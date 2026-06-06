# GoogleAnalytics

An invisible component that injects the Google Analytics (gtag.js) script and configures it with a site-specific measurement ID. Renders nothing to the DOM -- this is a side-effect-only component.

## Import

```ts
import { GoogleAnalytics } from '@aspect/analytics/google-analytics';
import type { GoogleAnalyticsProps } from '@aspect/analytics/google-analytics';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `measurementId` | `string` | required | Google Analytics measurement ID (e.g., `'G-XXXXXXXXXX'`) |
| `disabled` | `boolean` | `false` | Disable tracking (useful for development/testing) |
| `debug` | `boolean` | `false` | Enable debug mode (logs events to console via GA debug_mode) |
| `anonymizeIp` | `boolean` | `false` | Anonymize IP addresses |
| `config` | `Record<string, unknown>` | `undefined` | Custom config parameters passed to `gtag('config', ...)` |

## Usage

```ts
import { createElement } from 'specifyjs';
import { GoogleAnalytics } from '@aspect/analytics/google-analytics';

// Basic usage -- place once at the top of your app
const analytics = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
});

// With debug mode and IP anonymization
const analyticsDebug = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  debug: true,
  anonymizeIp: true,
});

// Disabled in development
const analyticsDev = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  disabled: process.env.NODE_ENV !== 'production',
});

// With custom config
const analyticsCustom = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  config: {
    page_title: 'My App',
    send_page_view: true,
  },
});
```

## Features

- Injects the gtag.js script tag into `<head>` only once, even if multiple instances mount.
- Initializes the `dataLayer` and `gtag` function on the window object.
- Calls `gtag('config', measurementId, ...)` with merged config parameters.
- The script tag is removed on component unmount for clean teardown.
- When `disabled` is true, no script injection or configuration occurs.
- Debug mode sets `debug_mode: true` in the gtag config.
- IP anonymization sets `anonymize_ip: true` in the gtag config.
