# ThreeDLayers

**Category:** Visualization  
**Path:** `components/viz/3d-layers`

## Overview

A SpecifyJS component that renders pseudo-3D stacked
surface/layer visualizations as isometric SVG.
Supports:
 - Multiple stacked layers, each a 2D grid of height values
 - Configurable perspective, rotation, and layer spacing
 - Color-coded layers with opacity control
 - Axis labels and layer labels
 - Simple affine 3D-to-2D projection (no WebGL)
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `layers` | `Layer3D[]` (required) | Array of layers, each containing a 2D grid of height values |
| `width` | `number` | SVG width in pixels (default: 700) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `perspective` | `number` | Perspective strength (default: 0.5) — 0 = flat, 1 = strong perspective |
| `rotateX` | `number` | X-axis rotation in degrees (default: 35) |
| `rotateY` | `number` | Y-axis rotation in degrees (default: 45) |
| `rotateZ` | `number` | Z-axis rotation in degrees (default: 0) |
| `showLabels` | `boolean` | Show layer labels (default: true) |
| `showAxes` | `boolean` | Show 3D axes (default: true) |
| `layerSpacing` | `number` | Vertical spacing between layers in data units (default: 2) |
| `colorScale` | `string[]` | Color palette for layers (default: built-in palette) |
| `gridColor` | `string` | Grid wireframe color (default: '#94a3b8') |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
