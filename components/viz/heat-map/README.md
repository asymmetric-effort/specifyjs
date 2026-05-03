# HeatMap

**Category:** Visualization  
**Path:** `components/viz/heat-map`

## Overview

A SpecifyJS component that renders 2D heat maps as SVG.
Supports:
 - 2D grid of colored cells with intensity proportional to value
 - Row and column labels
 - Optional value text in each cell
 - Configurable color gradient
 - Cell borders
 - Auto-detection of min/max values
 - Proper ARIA attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `number[][]` (required) | 2D grid of values — data[row][col] |
| `rowLabels` | `string[]` | Labels for rows (Y axis) |
| `columnLabels` | `string[]` | Labels for columns (X axis) |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `colorScale` | `string[]` | Color gradient from low to high (default: blue to red) |
| `minValue` | `number` | Minimum value for color mapping (auto-detected if omitted) |
| `maxValue` | `number` | Maximum value for color mapping (auto-detected if omitted) |
| `showValues` | `boolean` | Show numeric value in each cell (default: false) |
| `cellBorderColor` | `string` | Cell border color (default: '#fff') |
| `cellBorderWidth` | `number` | Cell border width (default: 1) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around the chart in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
