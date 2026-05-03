# LollipopChart

**Category:** Visualization  
**Path:** `components/viz/lollipop`

## Overview

A SpecifyJS component that renders lollipop charts as SVG.
Each data point is rendered as a thin stem (line) with a circle at the end,
similar to a bar chart but with a lighter visual footprint.
Supports:
 - Vertical and horizontal orientation
 - Configurable stem and dot styling
 - Grid lines, value labels, title
 - Per-datum colors
 - Edge cases: empty data, single item, zero values
Zero runtime dependencies -- pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `LollipopDatum[]` (required) | Data points to render |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `orientation` | `"horizontal" | "vertical"` | Chart orientation (default: 'vertical') |
| `stemColor` | `string` | Stem line color (default: '#94a3b8') |
| `stemWidth` | `number` | Stem line width in px (default: 2) |
| `dotRadius` | `number` | Dot radius in px (default: 6) |
| `dotColor` | `string` | Dot fill color (default: '#3b82f6') |
| `showGrid` | `boolean` | Show grid lines (default: true) |
| `showValues` | `boolean` | Show value labels (default: true) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
