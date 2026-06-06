# BlochSphere

Interactive 3D Bloch sphere visualization for quantum states, rendered as SVG with orthographic projection. Displays a qubit state vector on a unit sphere with wireframe, axis labels, trajectory trail, and optional quantum gate animation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| state | `BlochState` | `{ theta: 0, phi: 0 }` | Current qubit state (theta: polar, phi: azimuthal) |
| gates | `GateOp[]` | `undefined` | Sequence of gates to animate (applied one per frame) |
| width | `number` | `400` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| rotateY | `number` | `-25` | Initial Y-axis rotation in degrees |
| rotateX | `number` | `15` | Initial X-axis rotation in degrees |
| zoom | `number` | `1.0` | Zoom level (0.5-3.0) |
| interactive | `boolean` | `true` | Allow drag rotation |
| zoomable | `boolean` | `true` | Allow scroll zoom |
| showVector | `boolean` | `true` | Show state vector arrow |
| showLabels | `boolean` | `true` | Show axis labels (|0>, |1>, |+>, |->, |+i>, |-i>) |
| showWireframe | `boolean` | `true` | Show wireframe circles (equator, meridians) |
| showTrail | `boolean` | `true` | Show state trajectory trail |
| trailMaxPoints | `number` | `200` | Maximum trail points |
| trailColor | `string` | `'#ef4444'` | Trail path color |
| wireframeColor | `string` | `'#cbd5e1'` | Wireframe circle color |
| vectorColor | `string` | `'#3b82f6'` | State vector color |
| backgroundColor | `string` | `undefined` | Background color (transparent if omitted) |
| sphereRadius | `number` | `130` | Sphere radius in viewBox units |
| title | `string` | `undefined` | Title text |
| onStateChange | `(state: BlochState) => void` | `undefined` | Callback when state changes |

### Supported Gates

`'X'`, `'Y'`, `'Z'`, `'H'`, `'S'`, `'T'`, `'Rx'`, `'Ry'`, `'Rz'` (Rx/Ry/Rz accept an `angle` parameter in radians).

## Usage

```ts
import { createElement } from 'specifyjs';
import { BlochSphere } from 'specifyjs/components/viz/bloch-sphere';

// Display |+> state
createElement(BlochSphere, {
  state: { theta: Math.PI / 2, phi: 0 },
  title: 'Qubit State',
});

// Animate a gate sequence
createElement(BlochSphere, {
  gates: [{ gate: 'H' }, { gate: 'T' }, { gate: 'H' }],
  onStateChange: (state) => console.log(state),
});
```

## Notes

- Renders entirely as SVG with 3D-to-2D projection.
- Interactive drag rotation and scroll zoom enabled by default.
- Gate animations run one gate per animation frame via `requestAnimationFrame`.
- The trail records the Bloch vector path as gates are applied.
