# ChordDiagram

**Category:** Visualization  
**Path:** `components/viz/chord`

## Overview

A SpecifyJS component that renders circular chord diagrams as SVG.
Supports:
 - Outer arcs proportional to total flow
 - Ribbons between arcs showing directional flow
 - Labels and value annotations
 - Configurable colors, padding angle, opacity
 - Matrix-based input (matrix[i][j] = flow from i to j)
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `matrix` | `number[][]` (required) | Square matrix where matrix[i][j] = flow from group i to group j |
| `labels` | `string[]` (required) | Labels for each group (must match matrix dimensions) |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 600) |
| `colors` | `string[]` | Color palette for groups |
| `padAngle` | `number` | Angular padding between arcs in radians (default: 0.05) |
| `showLabels` | `boolean` | Show group labels (default: true) |
| `showValues` | `boolean` | Show flow values on hover/annotation (default: false) |
| `ribbonOpacity` | `number` | Ribbon fill opacity 0..1 (default: 0.5) |
| `innerRadiusRatio` | `number` | Inner radius as ratio of outer radius (default: 0.9) |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
