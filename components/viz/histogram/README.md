# Histogram

**Category:** Visualization  
**Path:** `components/viz/histogram`

## Overview

A SpecifyJS component that bins raw numeric data and renders
vertical bars as SVG.
Supports:
 - Automatic or user-specified bin count
 - Bin-range labels on the x-axis, counts on the y-axis
 - Optional grid lines, value labels, title, axis labels
 - Configurable colors, gap, and padding
 - Edge cases: empty data, single value, all-same values
Zero runtime dependencies -- pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `number[]` (required) | Raw data values to bin |
| `bins` | `number` | Number of bins (default: 10) |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `barColor` | `string` | Bar fill color (default: '#3b82f6') |
| `barGap` | `number` | Gap between bars in px (default: 2) |
| `showGrid` | `boolean` | Show grid lines (default: true) |
| `showValues` | `boolean` | Show count values above bars (default: true) |
| `title` | `string` | Chart title |
| `xLabel` | `string` | X-axis label |
| `yLabel` | `string` | Y-axis label |
| `padding` | `number` | Padding around chart area in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
