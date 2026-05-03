# ComplexGraph2D

**Category:** Visualization  
**Path:** `components/viz/2D-complex-graph`

## Overview

Precompute a Mandelbrot iteration grid at a given resolution.
Returns a 2D array of iteration counts (rows x cols).

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` |  |
| `height` | `number` |  |
| `realRange` | `[number, number]` |  |
| `imagRange` | `[number, number]` |  |
| `maxIterations` | `number` |  |
| `colorScheme` | `"classic" | "fire" | "ocean"` |  |
| `computeFunction` | `(re: number, im: number, maxIter: number) => number` |  |
| `data` | `number[][]` |  |
| `resolution` | `number` | Pixel resolution for precomputed SVG rendering (default: 2) |
| `sync` | `boolean` |  |
| `onPointClick` | `(info: ComplexPointInfo) => void` |  |
| `onPointHover` | `(info: ComplexPointInfo) => void` |  |
| `onPointDoubleClick` | `(info: ComplexPointInfo) => void` |  |
| `onPointContextMenu` | `(info: ComplexPointInfo) => void` |  |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
