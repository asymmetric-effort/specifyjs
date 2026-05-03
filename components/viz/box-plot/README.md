# BoxPlot

**Category:** Visualization  
**Path:** `components/viz/box-plot`

## Overview

A SpecifyJS component that renders box-and-whisker plots as SVG.
Supports:
 - Vertical and horizontal orientation
 - Automatic quartile, whisker, and outlier computation
 - Optional mean marker
 - Optional outlier display
 - Grid lines
 - Per-box colors
 - ARIA accessibility attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `BoxPlotDatum[]` (required) | Array of box plot data |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `orientation` | `'horizontal' | 'vertical'` | Plot orientation (default: 'vertical') |
| `showOutliers` | `boolean` | Show outlier circles (default: true) |
| `showMean` | `boolean` | Show mean marker (default: false) |
| `whiskerColor` | `string` | Whisker line color (default: '#374151') |
| `boxWidth` | `number` | Box width as fraction of available space (default: 0.6) |
| `showGrid` | `boolean` | Show grid lines (default: true) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
