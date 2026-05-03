# BarGraph

**Category:** Visualization  
**Path:** `components/viz/2D-bar-graph`

## Overview

A SpecifyJS component that renders 2D bar charts as SVG.
Supports:
 - Vertical and horizontal orientation
 - Rounded bar corners
 - Value labels on bars
 - Grid lines
 - Stacked bars (multiple segments per category)
 - Grouped bars (side-by-side per category)
 - Optional animation
 - Configurable colors, gaps, padding
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `BarDatum[]` (required) | Simple bar data |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `orientation` | `'vertical' | 'horizontal'` | Bar orientation (default: 'vertical') |
| `barColor` | `string` | Default bar fill color (default: '#3b82f6') |
| `barGap` | `number` | Gap between bars in px (default: 8) |
| `barRadius` | `number` | Border radius on bar tops (default: 4) |
| `showValues` | `boolean` | Show value labels on bars (default: true) |
| `showGrid` | `boolean` | Show grid lines perpendicular to bars (default: true) |
| `gridColor` | `string` | Grid line color (default: '#e5e7eb') |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 50) |
| `animate` | `boolean` | Enable animation (default: false) |
| `stacked` | `StackedBarDatum[]` | Stacked bar data — overrides `data` when provided |
| `grouped` | `boolean` | Grouped mode — side-by-side bars when using stacked data (default: false) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
