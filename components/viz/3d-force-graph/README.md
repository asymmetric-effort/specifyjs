# ForceGraph3D

**Category:** Visualization
**Path:** `components/viz/3d-force-graph`

## Overview

A SpecifyJS component that renders force-directed graph layouts in 3D space,
projected to SVG via perspective projection. Supports:

- Physics-based 3D node positioning (Coulomb repulsion + Hooke spring attraction)
- Animated simulation via requestAnimationFrame with convergence detection
- Camera orbit via mouse drag, zoom via scroll wheel
- Node click/hover callbacks
- Configurable forces (repulsion, attraction, damping)
- Node labels (billboarded)
- Depth-sorted rendering (painter's algorithm)

Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `nodes` | `ForceGraph3DNode[]` (required) | Array of nodes to render |
| `edges` | `ForceGraph3DEdge[]` (required) | Array of edges connecting nodes |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `simulation` | `object` | Force simulation parameters |
| `simulation.repulsion` | `number` | Repulsion strength (default: -100) |
| `simulation.springStrength` | `number` | Spring strength for edges (default: 0.01) |
| `simulation.springLength` | `number` | Ideal spring length (default: 100) |
| `simulation.damping` | `number` | Velocity damping per tick (default: 0.9) |
| `simulation.iterations` | `number` | Iterations per frame (default: 1) |
| `camera` | `object` | Camera controls |
| `camera.distance` | `number` | Initial camera distance (default: 300) |
| `camera.autoRotateSpeed` | `number` | Auto-rotate speed in deg/s (default: 0) |
| `onNodeClick` | `(node) => void` | Click callback |
| `onNodeHover` | `(node \| null) => void` | Hover callback |
| `backgroundColor` | `string` | Background color (default: '#0f172a') |

## Node Interface

```typescript
interface ForceGraph3DNode {
  id: string;
  label?: string;
  x?: number; y?: number; z?: number;
  size?: number;       // default: 5
  color?: string;      // default: '#3b82f6'
  data?: Record<string, unknown>;
}
```

## Edge Interface

```typescript
interface ForceGraph3DEdge {
  source: string;
  target: string;
  color?: string;      // default: '#94a3b8'
  width?: number;      // default: 1
  label?: string;
}
```

## Usage

```typescript
import { ForceGraph3D } from '@specifyjs/3d-force-graph';

ForceGraph3D({
  nodes: [
    { id: 'a', label: 'Alpha' },
    { id: 'b', label: 'Beta' },
    { id: 'c', label: 'Gamma' },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
  ],
  width: 800,
  height: 600,
  simulation: { repulsion: -150, damping: 0.85 },
  camera: { distance: 400, autoRotateSpeed: 5 },
  onNodeClick: (node) => console.log('Clicked:', node.id),
});
```
