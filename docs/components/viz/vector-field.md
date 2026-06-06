# VectorField

2D vector field plot rendered as SVG or Canvas. Displays arrows at grid points showing vector direction and magnitude, with optional color-by-magnitude encoding.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `VectorDatum[]` | `undefined` | Pre-computed vector data |
| vectorFunction | `(x, y) => { dx, dy }` | `undefined` | Function computing vector at each grid point |
| width | `number` | `600` | Width in pixels |
| height | `number` | `600` | Height in pixels |
| gridSize | `number` | `15` | Arrows per axis (max: 50) |
| xRange | `[number, number]` | `[-5, 5]` | X-axis domain |
| yRange | `[number, number]` | `[-5, 5]` | Y-axis domain |
| arrowScale | `number` | `1` | Scale factor for arrow length |
| arrowColor | `string` | `'#3b82f6'` | Default arrow color |
| showGrid | `boolean` | `true` | Show background grid |
| showAxes | `boolean` | `true` | Show axes through origin |
| colorByMagnitude | `boolean` | `false` | Color arrows by magnitude |
| colorScale | `string[]` | `['#3b82f6', '#8b5cf6', '#ef4444']` | Magnitude color scale |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `50` | Padding around chart |
| tickFontSize | `number` | `10` | Axis tick label font size |
| arrowWidth | `number` | `1.5` | Arrow stroke width |
| renderer | `'svg' \| 'canvas'` | `'svg'` | Rendering mode |
| computeWorker | `ComputeWorkerFn` | `undefined` | Custom compute function for vector calculation |

### VectorDatum

| Field | Type | Description |
|-------|------|-------------|
| x | `number` | X position |
| y | `number` | Y position |
| dx | `number` | Vector x component |
| dy | `number` | Vector y component |
| magnitude | `number` | Optional pre-computed magnitude |

## Usage

```ts
import { createElement } from 'specifyjs';
import { VectorField } from 'specifyjs/components/viz/vector-field';

// Rotation field
createElement(VectorField, {
  vectorFunction: (x, y) => ({ dx: -y, dy: x }),
  colorByMagnitude: true,
  title: 'Rotation Field',
});

// Canvas mode for high arrow counts
createElement(VectorField, {
  vectorFunction: (x, y) => ({ dx: Math.sin(y), dy: Math.cos(x) }),
  gridSize: 40,
  renderer: 'canvas',
});
```

## Notes

- SVG mode (default) renders each arrow as an SVG line + polygon arrowhead.
- Canvas mode uses `requestAnimationFrame` for smooth rendering and is recommended for `gridSize > 25`.
- Arrow scale is auto-computed based on grid density and maximum magnitude.
- The `computeWorker` prop allows offloading vector computation to a custom function (e.g., for GPU-accelerated or radio propagation simulations).
