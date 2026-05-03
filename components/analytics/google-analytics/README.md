# GoogleAnalytics

**Category:** Analytics  
**Path:** `components/analytics/google-analytics`

## Overview

Invisible component that injects the Google Analytics
(gtag.js) script and configures it with a site-specific measurement ID.
Renders nothing to the DOM. Place it once at the top of your app.
Usage:
  createElement(GoogleAnalytics, { measurementId: 'G-XXXXXXXXXX' })

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `measurementId` | `string` (required) | Google Analytics measurement ID (e.g., 'G-XXXXXXXXXX') |
| `disabled` | `boolean` | Disable tracking (useful for development/testing) |
| `debug` | `boolean` | Enable debug mode (logs events to console) |
| `anonymizeIp` | `boolean` | Anonymize IP addresses |
| `config` | `Record<string, unknown>` | Custom config parameters passed to gtag('config', ...) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
