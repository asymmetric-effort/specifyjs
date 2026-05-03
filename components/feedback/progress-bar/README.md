# ProgressBar

**Category:** Feedback  
**Path:** `components/feedback/progress-bar`

## Overview

Progress indicator bar with bar and circular variants.
Supports determinate (value-based) and indeterminate (animated) modes,
optional percentage label, shimmer animation, and a circular SVG variant.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` | Current progress value (0-100) |
| `max` | `number` | Maximum value (default: 100) |
| `color` | `string` | Fill color |
| `backgroundColor` | `string` | Track background color |
| `height` | `string` | Bar height (CSS value) |
| `showLabel` | `boolean` | Show percentage label |
| `animated` | `boolean` | Enable shimmer animation on the filled portion |
| `variant` | `'bar' | 'circular'` | Display variant |
| `size` | `number | string` | Size for circular variant or bar height shorthand |
| `indeterminate` | `boolean` | Indeterminate mode -- animated without a specific value |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
