# FunnelChart

**Category:** Visualization  
**Path:** `components/viz/funnel`

## Overview

A SpecifyJS component that renders funnel/pipeline
visualizations as SVG.
Each section is a trapezoid whose width is proportional to its value,
tapering from the largest value toward the smallest. Supports both
vertical (top-to-bottom) and horizontal (left-to-right) orientation.
Supports:
 - Vertical and horizontal orientation
 - Labels, values, and percentage display
 - Per-datum or palette-based colors
 - Configurable gap between sections
 - Edge cases: empty data, single item, zero values
Zero runtime dependencies -- pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `FunnelDatum[]` (required) | Data sections to render (in funnel order, largest first typically) |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `orientation` | `'vertical' | 'horizontal'` | Funnel orientation (default: 'vertical') |
| `showLabels` | `boolean` | Show labels on sections (default: true) |
| `showValues` | `boolean` | Show values on sections (default: true) |
| `showPercentage` | `boolean` | Show percentage of first item (default: true) |
| `gapSize` | `number` | Gap between sections in px (default: 2) |
| `colors` | `string[]` | Color palette (cycles through when per-datum color is absent) |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
