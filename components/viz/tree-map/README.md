# TreeMap

**Category:** Visualization  
**Path:** `components/viz/tree-map`

## Overview

A SpecifyJS component that renders treemap visualizations as SVG.
Supports:
 - Squarified treemap layout (iterative, no recursion)
 - Nested hierarchical data
 - Configurable colors, borders, padding
 - Labels and value display
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `TreeMapNode` (required) | Root node of the treemap data |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `showLabels` | `boolean` | Show labels inside cells (default: true) |
| `showValues` | `boolean` | Show values inside cells (default: true) |
| `colors` | `string[]` | Color palette for cells without explicit color |
| `borderColor` | `string` | Border color around cells (default: '#ffffff') |
| `borderWidth` | `number` | Border width in px (default: 2) |
| `padding` | `number` | Inner padding for nested cells in px (default: 2) |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
