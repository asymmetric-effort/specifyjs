# CartesianGraph2D

**Category:** Visualization  
**Path:** `components/viz/2D-cartesian-raw`


## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` |  |
| `height` | `number` |  |
| `points` | `{ x: number; y: number }[]` |  |
| `plotFunction` | `(x: number) => number` | Function to plot: f(x) → y |
| `plotResolution` | `number` | Number of samples across the x range (default: 200). Ignored if xStep is set. |
| `xStep` | `number` |  |
| `sync` | `boolean` |  |
| `xRange` | `[number, number]` |  |
| `yRange` | `[number, number]` |  |
| `showGrid` | `boolean` |  |
| `showAxes` | `boolean` |  |
| `pointRadius` | `number` |  |
| `pointColor` | `string` |  |
| `curveColor` | `string` |  |
| `gridColor` | `string` |  |
| `axisColor` | `string` |  |
| `onPointClick` | `(info: PointEvent) => void` |  |
| `onPointDoubleClick` | `(info: PointEvent) => void` |  |
| `onPointContextMenu` | `(info: PointEvent) => void` |  |
| `onPointHover` | `(info: PointEvent) => void` |  |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
