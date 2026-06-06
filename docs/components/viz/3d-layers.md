# ThreeDLayers

Renders pseudo-3D stacked surface/layer visualizations as isometric SVG. Each layer is a 2D grid of height values rendered as a colored surface with configurable perspective, rotation, and spacing.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| layers | `Layer3D[]` | (required) | Array of layers with 2D height data grids |
| width | `number` | `700` | SVG width in pixels |
| height | `number` | `500` | SVG height in pixels |
| perspective | `number` | `0.5` | Perspective strength (0 = flat, 1 = strong) |
| rotateX | `number` | `35` | X-axis rotation in degrees |
| rotateY | `number` | `45` | Y-axis rotation in degrees |
| rotateZ | `number` | `0` | Z-axis rotation in degrees |
| showLabels | `boolean` | `true` | Show layer labels |
| showAxes | `boolean` | `true` | Show 3D axes (X, Y, Z) |
| layerSpacing | `number` | `2` | Vertical spacing between layers in data units |
| colorScale | `string[]` | built-in palette | Color palette for layers |
| gridColor | `string` | `'#94a3b8'` | Wireframe grid color |
| title | `string` | `undefined` | Chart title |

### Layer3D

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| label | `string` | (required) | Layer label |
| data | `number[][]` | (required) | 2D grid of height values |
| color | `string` | from palette | Layer color |
| opacity | `number` | `0.7` | Layer fill opacity |

## Usage

```ts
import { createElement } from 'specifyjs';
import { ThreeDLayers } from 'specifyjs/components/viz/3d-layers';

createElement(ThreeDLayers, {
  layers: [
    { label: 'Surface A', data: [[1, 2], [3, 4]] },
    { label: 'Surface B', data: [[2, 1], [1, 3]] },
  ],
  rotateX: 30,
  rotateY: 40,
  title: 'Stacked Surfaces',
});
```

## Notes

- Renders entirely as SVG using affine 3D-to-2D projection (no WebGL required).
- Uses painter's algorithm (depth sorting) for correct polygon occlusion.
- Shows an empty state message when no layers are provided.
