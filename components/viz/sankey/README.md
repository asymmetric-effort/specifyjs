# SankeyDiagram

**Category:** Visualization  
**Path:** `components/viz/sankey`

## Overview

A SpecifyJS component that renders Sankey/flow diagrams as SVG.
Supports:
 - Automatic multi-column layout (sources left, sinks right)
 - Curved Bezier flow paths between nodes
 - Flow width proportional to value
 - Node and flow labels with optional values
 - Configurable colors, padding, opacity
 - Iterative layout algorithm (no recursion)
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `nodes` | `SankeyNode[]` (required) | Array of nodes |
| `links` | `SankeyLink[]` (required) | Array of links (flows) between nodes |
| `width` | `number` | SVG width in pixels (default: 800) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `nodeWidth` | `number` | Width of each node rectangle in pixels (default: 20) |
| `nodePadding` | `number` | Vertical padding between nodes in pixels (default: 10) |
| `showLabels` | `boolean` | Show node labels (default: true) |
| `showValues` | `boolean` | Show flow values on links (default: false) |
| `linkOpacity` | `number` | Link fill opacity 0..1 (default: 0.4) |
| `colors` | `string[]` | Color palette for auto-coloring nodes |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 40) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
