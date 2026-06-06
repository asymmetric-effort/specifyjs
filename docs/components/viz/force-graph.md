# ForceGraph

2D force-directed graph layout rendered as SVG with animated physics simulation. Supports node dragging, pinning, custom force functions, collision detection, edge arrows, and node path trails.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodes | `ForceNode[]` | (required) | Array of graph nodes |
| edges | `ForceEdge[]` | (required) | Array of edges |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| nodeRadius | `number` | `12` | Node circle radius |
| nodeStrokeWidth | `number` | `2` | Node border width (0 for no border) |
| showLabels | `boolean` | `true` | Show node labels |
| showArrows | `boolean` | `false` | Show edge arrowheads |
| repulsionForce | `number` | `300` | Coulomb repulsion constant |
| attractionForce | `number` | `0.01` | Spring attraction constant |
| damping | `number` | `0.9` | Velocity damping (0-1) |
| edgeLength | `number` | `100` | Ideal edge length in pixels |
| edgeColor | `string` | `'#94a3b8'` | Default edge color |
| edgeWidth | `number` | `1.5` | Default edge width |
| solidNodes | `boolean` | `true` | Enable elastic collision between nodes |
| customForce | `CustomForceFunction` | `undefined` | Custom force function replacing default physics |
| trails | `TrailConfig[]` | `undefined` | Trail configurations for specific nodes |
| title | `string` | `undefined` | Chart title |

### ForceNode

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | `string` | (required) | Unique identifier |
| label | `string` | same as id | Display label |
| color | `string` | from palette | Fill color |
| x | `number` | circular layout | Initial x position |
| y | `number` | circular layout | Initial y position |
| fixed | `boolean` | `false` | Pinned in place |
| solid | `boolean` | `true` | Participates in collision detection |

## Usage

```ts
import { createElement } from 'specifyjs';
import { ForceGraph } from 'specifyjs/components/viz/force-graph';

createElement(ForceGraph, {
  nodes: [
    { id: 'a', label: 'Alice' },
    { id: 'b', label: 'Bob' },
    { id: 'c', label: 'Carol' },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c', weight: 2 },
  ],
  showArrows: true,
});
```

## Notes

- Renders as SVG with `requestAnimationFrame`-driven physics simulation.
- Drag nodes to reposition; double-click to toggle fixed/pinned state.
- Solid nodes collide elastically (Newtonian bounce). Fixed nodes act as immovable walls.
- The `customForce` prop replaces all default physics with a user-supplied function called each frame.
- Trails render fading path histories for designated nodes.
