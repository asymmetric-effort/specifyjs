# Sunburst

**Category:** Visualization  
**Path:** `components/viz/sunburst`

## Overview

A SpecifyJS component that renders multi-level donut/ring charts as SVG.
Supports:
 - Multi-level hierarchical data rendered as concentric ring segments
 - Iterative tree traversal (no recursion)
 - Configurable inner radius, colors, stroke
 - Optional labels on segments
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `SunburstNode` (required) | Root node of the sunburst data |
| `width` | `number` | SVG width in pixels (default: 500) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `innerRadius` | `number` | Inner radius of the first ring (default: 40) |
| `showLabels` | `boolean` | Show labels on segments (default: true) |
| `colors` | `string[]` | Color palette for segments without explicit color |
| `strokeColor` | `string` | Stroke color between segments (default: '#ffffff') |
| `strokeWidth` | `number` | Stroke width between segments (default: 1) |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
