# DecompositionTree

**Category:** Visualization  
**Path:** `components/viz/decomposition-tree`

## Overview

A SpecifyJS component that renders hierarchical tree layouts as SVG.
Supports:
 - Horizontal (root-left) and vertical (root-top) orientation
 - Labeled rectangle nodes with optional values
 - Curved or straight connector lines
 - Configurable colors, dimensions, padding
 - Iterative BFS-based layout (no recursion)
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `DecompNode` (required) | Root node of the tree |
| `width` | `number` | SVG width in pixels (default: 800) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `orientation` | `'horizontal' | 'vertical'` | Layout orientation (default: 'horizontal') |
| `nodeWidth` | `number` | Width of each node rectangle (default: 120) |
| `nodeHeight` | `number` | Height of each node rectangle (default: 40) |
| `showValues` | `boolean` | Show value inside nodes (default: true) |
| `showConnectors` | `boolean` | Show connector lines between nodes (default: true) |
| `connectorColor` | `string` | Connector line color (default: '#94a3b8') |
| `colors` | `string[]` | Color palette for nodes by depth |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 40) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
