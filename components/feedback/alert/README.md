# Alert

**Category:** Feedback  
**Path:** `components/feedback/alert`

## Overview

Alert/banner message component.
Displays a colored banner with an icon, optional title and message,
an optional close button, and an optional action button.
Supports filled, outline, and subtle style variants.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `type` | `'info' | 'success' | 'warning' | 'error'` | Alert severity type |
| `title` | `string` | Alert title |
| `message` | `unknown` | Alert message (children) |
| `children` | `unknown` | Children alias for message |
| `closable` | `boolean` | Show close button |
| `onClose` | `() => void` | Close callback |
| `icon` | `string` | Custom icon text/emoji; auto-selected by type if omitted |
| `variant` | `'filled' | 'outline' | 'subtle'` | Style variant |
| `action` | `AlertAction` | Optional action button |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
