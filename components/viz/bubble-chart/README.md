# BubbleChart

**Category:** Visualization  
**Path:** `components/viz/bubble-chart`

## Overview

A SpecifyJS component that renders bubble (scatter) charts as SVG.
Supports:
 - Three-dimensional data encoding (x, y, bubble radius)
 - Auto-scaling of bubble sizes within configurable min/max radius
 - Grid lines and axes
 - Per-datum labels and colors
 - Configurable opacity
 - ARIA accessibility attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `BubbleDatum[]` (required) | Array of bubble data points |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `xLabel` | `string` | X-axis label |
| `yLabel` | `string` | Y-axis label |
| `showGrid` | `boolean` | Show grid lines (default: true) |
| `showAxes` | `boolean` | Show axes (default: true) |
| `showLabels` | `boolean` | Show datum labels (default: false) |
| `maxBubbleRadius` | `number` | Maximum rendered bubble radius in px (default: 40) |
| `minBubbleRadius` | `number` | Minimum rendered bubble radius in px (default: 4) |
| `defaultColor` | `string` | Default bubble fill color (default: '#3b82f6') |
| `opacity` | `number` | Bubble fill opacity (default: 0.7) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
