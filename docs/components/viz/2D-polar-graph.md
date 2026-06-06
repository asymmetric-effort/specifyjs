# PolarGraph2D

Interactive 2D polar coordinate graph rendered as SVG. Plots functions in polar form r = f(theta) and discrete polar data points. Supports pan, zoom, and point interaction events.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | `400` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| rRange | `[number, number]` | `[0, 2]` | Radial range |
| plotFunction | `(theta: number) => number` | `undefined` | Function to plot: f(theta) -> r |
| plotResolution | `number` | `360` | Number of samples around the circle. Ignored if `thetaStep` is set |
| thetaStep | `number` | `undefined` | Explicit step increment in radians. Overrides `plotResolution` |
| sync | `boolean` | `false` | If true, compute synchronously |
| points | `{ r: number; theta: number }[]` | `[]` | Discrete polar data points |
| showGrid | `boolean` | `true` | Show radial grid circles and angle lines |
| pointRadius | `number` | `3` | Data point circle radius |
| pointColor | `string` | `'#3b82f6'` | Data point fill color |
| curveColor | `string` | `'#3b82f6'` | Curve stroke color |
| onPointClick | `(info: PolarPointInfo) => void` | `undefined` | Point click callback |
| onPointDoubleClick | `(info: PolarPointInfo) => void` | `undefined` | Point double-click callback |
| onPointContextMenu | `(info: PolarPointInfo) => void` | `undefined` | Point right-click callback |
| onPointHover | `(info: PolarPointInfo) => void` | `undefined` | Point hover callback |

## Usage

```ts
import { createElement } from 'specifyjs';
import { PolarGraph2D } from 'specifyjs/components/viz/2D-polar-graph';

// Plot a cardioid: r = 1 + cos(theta)
createElement(PolarGraph2D, {
  plotFunction: (theta) => 1 + Math.cos(theta),
  rRange: [0, 3],
});
```

## Notes

- Renders as SVG with grid circles at integer radial intervals and angle lines every 30 degrees.
- Supports mouse-drag panning and scroll-wheel zooming of the radial range.
- Async computation is the default; set `sync: true` for immediate rendering.
