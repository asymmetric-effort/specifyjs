# DiscreteCartesian2D

**Category:** Visualization  
**Path:** `components/viz/2D-discrete-cartesian`

## Overview

A SpecifyJS component that renders an NxM grid of
discrete cells as SVG, where each cell's value determines its color.
Supports:
 - Arbitrary NxM grids with per-cell coloring via a color map
 - Configurable cell gap, border radius, and padding
 - Optional grid lines and row/column indices
 - Click and hover callbacks per cell
 - Responsive SVG sizing via viewBox
 - ARIA-compliant with role="img" and role="button" on interactive cells
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `number[][]` (required) | Grid data: rows x cols. Each value maps to a color via colorMap. |
| `colorMap` | `Record<number, string>` | Map cell values to colors (e.g., {0: '#1e293b', 1: '#3b82f6'}) |
| `width` | `number` | SVG viewBox width (default: 600) |
| `height` | `number` | SVG viewBox height (default: 600) |
| `cellGap` | `number` | Gap between cells in pixels (default: 1) |
| `cellRadius` | `number` | Cell border radius (default: 0) |
| `showGrid` | `boolean` | Show grid lines (default: false) |
| `gridColor` | `string` | Grid line color (default: '#334155') |
| `showIndices` | `boolean` | Show row/column indices (default: false) |
| `backgroundColor` | `string` | Background color (default: '#0f172a') |
| `padding` | `number` | Padding around grid (default: 10) |
| `onCellClick` | `(row: number, col: number, value: number) => void` | Called when a cell is clicked: (row, col, value) |
| `onCellHover` | `(row: number, col: number, value: number) => void` | Called when mouse enters a cell |
| `title` | `string` | Title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
