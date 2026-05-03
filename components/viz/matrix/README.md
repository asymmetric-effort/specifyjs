# Matrix

**Category:** Visualization  
**Path:** `components/viz/matrix`

## Overview

A SpecifyJS component that renders correlation/confusion matrices
as SVG.
Supports:
 - Colored grid cells with intensity proportional to value
 - Row and column labels (or shared labels for square matrices)
 - Optional value text in each cell
 - Symmetric mode for correlation matrices (mirrors across diagonal)
 - Diagonal highlighting
 - Configurable color gradient
 - Proper ARIA attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `number[][]` (required) | 2D grid of values — data[row][col] |
| `labels` | `string[]` | Shared row/column labels for square matrices |
| `rowLabels` | `string[]` | Explicit row labels (overrides `labels`) |
| `columnLabels` | `string[]` | Explicit column labels (overrides `labels`) |
| `width` | `number` | SVG width in pixels (default: 500) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `colorScale` | `string[]` | Color gradient from low to high (default: white to blue) |
| `showValues` | `boolean` | Show numeric value in each cell (default: true) |
| `showDiagonal` | `boolean` | Highlight diagonal cells (default: true) |
| `cellBorderColor` | `string` | Cell border color (default: '#e5e7eb') |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around the chart in px (default: 70) |
| `symmetric` | `boolean` | If true, mirror values across diagonal for correlation matrices (default: false) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
