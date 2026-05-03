# VectorField

**Category:** Visualization  
**Path:** `components/viz/vector-field`

## Overview

A SpecifyJS component that renders 2D vector field plots as SVG.
Supports:
 - Pre-computed vector data arrays
 - Functional vector fields: (x, y) => { dx, dy }
 - Configurable grid resolution
 - Arrow rendering with proper arrowheads
 - Color-by-magnitude with configurable color scale
 - Optional grid lines and axes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `VectorDatum[]` | Pre-computed vector data |
| `vectorFunction` | `(x: number, y: number) => { dx: number; dy: number }` | Function that computes vector at each grid point |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 600) |
| `gridSize` | `number` | Number of arrows per axis when using vectorFunction (default: 15) |
| `xRange` | `[number, number]` | X-axis domain (default: [-5, 5]) |
| `yRange` | `[number, number]` | Y-axis domain (default: [-5, 5]) |
| `arrowScale` | `number` | Scale factor for arrow length (default: 1) |
| `arrowColor` | `string` | Default arrow color (default: '#3b82f6') |
| `showGrid` | `boolean` | Show background grid (default: true) |
| `showAxes` | `boolean` | Show axes through origin (default: true) |
| `colorByMagnitude` | `boolean` | Color arrows by magnitude (default: false) |
| `colorScale` | `string[]` | Color scale for magnitude coloring (default: blue-red) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 50) |
| `tickFontSize` | `number` | Font size for axis tick labels in px (default: 10) |
| `arrowWidth` | `number` | Arrow stroke width (default: 1.5) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
