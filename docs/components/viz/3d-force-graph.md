# ForceGraph3D

3D force-directed graph visualization using the SpecifyJS 3dSpace engine. Renders nodes as spheres or polyhedra and edges as cylinders in a physics-based simulation with repulsion, attraction, damping, collision detection, and automatic camera orbiting.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | (required) | Canvas width in pixels |
| height | `number` | (required) | Canvas height in pixels |
| nodes | `ForceGraph3DNode[]` | (required) | Array of graph nodes |
| edges | `ForceGraph3DEdge[]` | (required) | Array of graph edges |
| bounds | `{ min: Vec3; max: Vec3 }` | +/-50 on all axes | Simulation boundary |
| repulsionStrength | `number` | `100` | Coulomb repulsion constant |
| attractionStrength | `number` | `0.1` | Hooke spring constant |
| damping | `number` | `0.9` | Velocity decay factor (0-1) |
| centerGravity | `number` | `0.01` | Pull toward origin |
| running | `boolean` | `true` | Whether the simulation is active |
| timeStep | `number` | `0.016` | Seconds per simulation step |
| cameraDistance | `number` | auto-fit | Camera distance from origin |
| collisionEnabled | `boolean` | `true` | Enable sphere-sphere collision detection |
| restitution | `number` | `0.8` | Collision bounciness (0-1) |
| backgroundColor | `Color` | dark blue | Canvas background color |
| apiRef | `(api: ForceGraph3DAPI) => void` | `undefined` | Callback receiving the imperative API |
| onNodeClick | `(nodeId, node, event) => void` | `undefined` | Node click handler |
| onNodeDoubleClick | `(nodeId, node, event) => void` | `undefined` | Node double-click handler |
| onNodeRightClick | `(nodeId, node, event) => void` | `undefined` | Node right-click handler |
| onNodeMouseDown | `(nodeId, node, event) => void` | `undefined` | Node mouse-down handler |
| onNodeMouseUp | `(nodeId, node, event) => void` | `undefined` | Node mouse-up handler |
| onNodeHover | `(nodeId, node, event) => void` | `undefined` | Node hover handler |
| onEdgeClick | `(edge, event) => void` | `undefined` | Edge click handler |
| onEdgeHover | `(edge, event) => void` | `undefined` | Edge hover handler |

### ForceGraph3DNode

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| id | `string` | (required) | Unique identifier |
| label | `string` | `undefined` | Display label |
| position | `Vec3` | random | Initial position |
| shape | `'sphere' \| 'cube' \| 'tetrahedron' \| 'octahedron' \| 'icosahedron' \| 'custom'` | `'sphere'` | Node geometry |
| size | `number` | `1.0` | Radius/scale |
| color | `Color` | blue | Node color |
| fixed | `boolean` | `false` | Exempt from simulation forces |
| mass | `number` | `1.0` | Physics mass |
| collisionRadius | `number` | same as size | Collision sphere radius |

### ForceGraph3DEdge

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| source | `string` | (required) | Source node ID |
| target | `string` | (required) | Target node ID |
| style | `'cylinder-solid' \| 'cylinder-mesh' \| 'line'` | `'cylinder-solid'` | Edge visual style |
| thickness | `number` | `0.1` | Edge width |
| color | `Color` | gray | Edge color |
| length | `number` | auto | Rest length for spring force |
| stiffness | `number` | `0.1` | Spring constant |

## Usage

```ts
import { createElement } from 'specifyjs';
import { ForceGraph3D } from 'specifyjs/components/viz/3d-force-graph';

createElement(ForceGraph3D, {
  width: 800,
  height: 600,
  nodes: [
    { id: 'a', label: 'Node A' },
    { id: 'b', label: 'Node B' },
    { id: 'c', label: 'Node C' },
  ],
  edges: [
    { source: 'a', target: 'b' },
    { source: 'b', target: 'c' },
  ],
  apiRef: (api) => { /* store api for dynamic manipulation */ },
});
```

## Notes

- Renders to a Canvas element using the CpuPipeline (with async GPU upgrade when available).
- The camera automatically orbits the graph. The simulation stops when kinetic energy drops below a threshold.
- The imperative API (`ForceGraph3DAPI`) allows dynamic node/edge CRUD, camera control, and full graph replacement at runtime.
- Raycasting-based hit testing enables per-node mouse event handling.
