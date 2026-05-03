# ForceGraph

**Category:** Visualization  
**Path:** `components/viz/force-graph`

## Overview

A SpecifyJS component that renders force-directed graph layouts as SVG.
Supports:
 - Physics-based node positioning (repulsion + attraction)
 - Animated simulation via requestAnimationFrame
 - Directed edges with optional arrowheads
 - Node labels
 - Configurable forces (repulsion, attraction, damping)
 - Edge weights affecting attraction strength
 - Fixed (pinned) nodes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `nodes` | `ForceNode[]` (required) | Array of nodes to render |
| `edges` | `ForceEdge[]` (required) | Array of edges connecting nodes |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `nodeRadius` | `number` | Node circle radius in pixels (default: 12) |
| `nodeStrokeWidth` | `number` | Node border stroke width in pixels (default: 2, set to 0 for no border) |
| `showLabels` | `boolean` | Show node labels (default: true) |
| `showArrows` | `boolean` | Show arrowheads on edges (default: false) |
| `repulsionForce` | `number` | Repulsion force between nodes (default: 300) |
| `attractionForce` | `number` | Attraction force along edges (default: 0.01) |
| `damping` | `number` | Velocity damping factor 0..1 (default: 0.9) |
| `edgeLength` | `number` | Ideal edge length in pixels (default: 100) |
| `edgeColor` | `string` | Default edge stroke color (default: '#94a3b8') |
| `edgeWidth` | `number` | Default edge stroke width (default: 1.5) |
| `title` | `string` | Chart title |
| `solidNodes` | `boolean` |  |
| `customForce` | `CustomForceFunction` |  |
| `trails` | `TrailConfig[]` | Trail configurations — render fading path trails for specific nodes |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
