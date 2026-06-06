# CartesianGraph2D

Interactive 2D Cartesian coordinate graph rendered as SVG. Supports plotting discrete data points and continuous functions with pan, zoom, and point interaction events. Functions can be evaluated synchronously or asynchronously with progressive rendering.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | `400` | SVG viewBox width in pixels |
| height | `number` | `300` | SVG viewBox height in pixels |
| points | `{ x: number; y: number }[]` | `[]` | Array of discrete data points to plot |
| plotFunction | `(x: number) => number` | `undefined` | Function to plot: f(x) -> y |
| plotResolution | `number` | `200` | Number of samples across the x range. Ignored if `xStep` is set |
| xStep | `number` | `undefined` | Explicit step increment for function evaluation. Overrides `plotResolution` |
| sync | `boolean` | `false` | If true, compute plotFunction synchronously. Otherwise computes asynchronously via requestIdleCallback with progressive rendering |
| xRange | `[number, number]` | `[-5, 5]` | Initial x-axis range |
| yRange | `[number, number]` | `[-5, 5]` | Initial y-axis range |
| showGrid | `boolean` | `true` | Show grid lines |
| showAxes | `boolean` | `true` | Show x and y axes |
| pointRadius | `number` | `3` | Radius of data point circles |
| pointColor | `string` | `'#3b82f6'` | Fill color for data points |
| curveColor | `string` | `'#3b82f6'` | Stroke color for the plotted curve |
| gridColor | `string` | `'#e2e8f0'` | Grid line color |
| axisColor | `string` | `'#94a3b8'` | Axis line and label color |
| onPointClick | `(info: PointEvent) => void` | `undefined` | Callback when a data point is clicked |
| onPointDoubleClick | `(info: PointEvent) => void` | `undefined` | Callback when a data point is double-clicked |
| onPointContextMenu | `(info: PointEvent) => void` | `undefined` | Callback when a data point is right-clicked |
| onPointHover | `(info: PointEvent) => void` | `undefined` | Callback when the mouse enters a data point |

### PointEvent

```ts
interface PointEvent {
  x: number;
  y: number;
  index: number;
  event: Event;
}
```

## Usage

```ts
import { createElement } from 'specifyjs';
import { CartesianGraph2D } from 'specifyjs/components/viz/2D-cartesian-raw';

// Plot a sine curve
createElement(CartesianGraph2D, {
  width: 600,
  height: 400,
  plotFunction: (x) => Math.sin(x),
  xRange: [-Math.PI * 2, Math.PI * 2],
  yRange: [-1.5, 1.5],
});

// Plot discrete points with click handler
createElement(CartesianGraph2D, {
  points: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 1 }],
  onPointClick: (info) => console.log(`Clicked point ${info.index}`),
});
```

## Notes

- Renders entirely as SVG with no external dependencies.
- Supports mouse-drag panning and scroll-wheel zooming.
- When `sync` is false (default), the function curve renders progressively as batches of results arrive via `requestIdleCallback`.
- Tick labels are auto-generated using a "nice numbers" algorithm.
