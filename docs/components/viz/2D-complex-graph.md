# ComplexGraph2D

Interactive 2D complex plane visualization, rendering fractals (Mandelbrot by default) using either Canvas 2D (runtime computation) or SVG (precomputed data grids). Supports pan, zoom, and multiple color schemes.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | `400` | Width in pixels |
| height | `number` | `300` | Height in pixels |
| realRange | `[number, number]` | `[-2.5, 1]` | Real axis range |
| imagRange | `[number, number]` | `[-1.25, 1.25]` | Imaginary axis range |
| maxIterations | `number` | `100` | Maximum iteration count for divergence test |
| colorScheme | `'classic' \| 'fire' \| 'ocean'` | `'classic'` | Color mapping scheme |
| computeFunction | `(re: number, im: number, maxIter: number) => number` | Mandelbrot | Custom iteration function |
| data | `number[][]` | `undefined` | Precomputed iteration grid (rows x cols). When provided, renders as SVG instead of canvas |
| resolution | `number` | `2` | Pixel resolution for precomputed SVG rendering |
| sync | `boolean` | `false` | If true, compute values synchronously |
| onPointClick | `(info: ComplexPointInfo) => void` | `undefined` | Click callback |
| onPointHover | `(info: ComplexPointInfo) => void` | `undefined` | Hover callback |
| onPointDoubleClick | `(info: ComplexPointInfo) => void` | `undefined` | Double-click callback |
| onPointContextMenu | `(info: ComplexPointInfo) => void` | `undefined` | Right-click callback |

### ComplexPointInfo

```ts
interface ComplexPointInfo {
  re: number;
  im: number;
  iterations: number;
  event: Event;
}
```

## Usage

```ts
import { createElement } from 'specifyjs';
import { ComplexGraph2D, computeMandelbrotGrid } from 'specifyjs/components/viz/2D-complex-graph';

// Runtime canvas rendering (interactive)
createElement(ComplexGraph2D, {
  width: 600,
  height: 400,
  maxIterations: 200,
  colorScheme: 'fire',
});

// Precomputed SVG rendering (for build-time / static output)
const grid = computeMandelbrotGrid(200, 150);
createElement(ComplexGraph2D, { data: grid, width: 600, height: 400 });
```

## Notes

- When `data` is provided, renders as SVG rectangles (suitable for static pre-rendering). Otherwise renders to a Canvas 2D element with interactive pan and zoom.
- The `computeMandelbrotGrid` helper is exported for precomputing iteration grids at build time.
- Canvas mode supports mouse-drag panning and scroll-wheel zooming.
