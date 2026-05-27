# ForceGraph3D

**Category:** Visualization
**Path:** `components/viz/3d-force-graph`

## Overview

A SpecifyJS component that renders force-directed graph layouts in 3D space
using the 3dSpace engine. Supports:

- Physics-based 3D node positioning (Coulomb repulsion + Hooke spring attraction)
- Multiple node shapes: sphere, cube, tetrahedron, octahedron, icosahedron, custom
- Multiple edge styles: cylinder-solid, cylinder-mesh, line
- Animated simulation via Space3D onFrame with convergence detection
- Imperative API for dynamic graph manipulation (add/remove nodes/edges)
- Pure math force simulation engine (testable without DOM)
- Boundary clamping, velocity clamping, fixed nodes

Depends on the 3dSpace component for rendering.

## Architecture

```
src/
  types.ts          # ForceGraph3DNode, ForceGraph3DEdge, ForceGraph3DProps, ForceGraph3DAPI
  force-sim.ts      # Pure math 3D force simulation (no DOM, no rendering)
  ForceGraph3D.ts   # Main component using Space3D
  index.ts          # Public exports
```

The force simulation (`force-sim.ts`) is completely decoupled from rendering.
It operates on `Map<string, SimNode>` and mutates positions/velocities in place.

The component (`ForceGraph3D.ts`) maintains internal state maps (`NodeState`,
`EdgeState`) that map graph nodes/edges to SceneObjects. No `userData` is stored
on 3dSpace SceneObjects.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` (required) | Canvas width in pixels |
| `height` | `number` (required) | Canvas height in pixels |
| `nodes` | `ForceGraph3DNode[]` (required) | Array of nodes to render |
| `edges` | `ForceGraph3DEdge[]` (required) | Array of edges connecting nodes |
| `bounds` | `{min: Vec3, max: Vec3}` | Boundary for simulation (default: +/-50) |
| `repulsionStrength` | `number` | Coulomb constant (default: 100) |
| `attractionStrength` | `number` | Hooke constant (default: 0.1) |
| `damping` | `number` | Velocity decay 0-1 (default: 0.9) |
| `centerGravity` | `number` | Pull toward origin (default: 0.01) |
| `running` | `boolean` | Simulation active (default: true) |
| `timeStep` | `number` | Seconds per step (default: 0.016) |
| `cameraDistance` | `number` | Camera distance (default: auto-fit) |
| `apiRef` | `(api: ForceGraph3DAPI) => void` | Imperative API ref |
| `onNodeClick` | `(nodeId, node) => void` | Click callback |
| `onNodeHover` | `(nodeId | null) => void` | Hover callback |
| `onEdgeClick` | `(edge) => void` | Edge click callback |
| `lightingModel` | `LightingModel` | 3dSpace lighting model |
| `backgroundColor` | `Color` | Background color |

## Node Interface

```typescript
interface ForceGraph3DNode {
  id: string;
  label?: string;
  position?: Vec3;
  shape?: 'sphere' | 'cube' | 'tetrahedron' | 'octahedron' | 'icosahedron' | 'custom';
  customGeometry?: PolyhedronGeometry;
  size?: number;       // default: 1.0
  color?: Color;
  textColor?: Color;
  fixed?: boolean;     // default: false
  mass?: number;       // default: 1.0
}
```

## Edge Interface

```typescript
interface ForceGraph3DEdge {
  source: string;
  target: string;
  style?: 'cylinder-solid' | 'cylinder-mesh' | 'line';
  thickness?: number;  // default: 0.1
  color?: Color;
  length?: number;     // rest length (default: auto)
  stiffness?: number;  // spring constant (default: 0.1)
}
```

## Imperative API

```typescript
interface ForceGraph3DAPI {
  addNode(node: ForceGraph3DNode): void;
  removeNode(nodeId: string): void;
  addEdge(edge: ForceGraph3DEdge): void;
  removeEdge(source: string, target: string): void;
  updateNode(nodeId: string, updates: Partial<ForceGraph3DNode>): void;
  updateEdge(source: string, target: string, updates: Partial<ForceGraph3DEdge>): void;
  getNodePositions(): Map<string, Vec3>;
  setRunning(running: boolean): void;
  resetPositions(): void;
  fitCamera(): void;
  loadGraph(graph: { nodes: ForceGraph3DNode[]; edges: ForceGraph3DEdge[] }): void;
  getSceneGraph(): SceneGraph;
}
```

## Usage

```typescript
import { ForceGraph3D } from '@specifyjs/3d-force-graph';

ForceGraph3D({
  width: 800,
  height: 600,
  nodes: [
    { id: 'a', label: 'Alpha', shape: 'sphere' },
    { id: 'b', label: 'Beta', shape: 'cube' },
    { id: 'c', label: 'Gamma', shape: 'tetrahedron' },
  ],
  edges: [
    { source: 'a', target: 'b', style: 'cylinder-solid' },
    { source: 'b', target: 'c', style: 'cylinder-mesh' },
  ],
  repulsionStrength: 150,
  damping: 0.85,
  apiRef: (api) => {
    // Dynamically add a node
    api.addNode({ id: 'd', label: 'Delta' });
    api.addEdge({ source: 'c', target: 'd' });
  },
});
```
