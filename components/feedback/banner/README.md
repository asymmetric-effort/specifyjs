# Banner

**Category:** Feedback  
**Path:** `components/feedback/banner`

## Overview

A dismissible banner that displays at the top of the page, shifting all DOM content down.
Three-column layout with a severity icon, plain text message, and optional dismiss button.
Supports info, warning, and alert severity levels with appropriate color schemes.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `severity` | `'info' \| 'warning' \| 'alert'` | The severity determines the icon and color scheme |
| `message` | `string` | Plain text message to display |
| `onDismiss` | `() => void` | Called when dismiss button is clicked. If not provided, dismiss button is hidden. |
| `icon` | `unknown` | Custom icon element to override the default severity icon |
| `visible` | `boolean` | Whether the banner is visible. Default: true |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
