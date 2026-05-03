# PolarGraph2D

**Category:** Visualization  
**Path:** `components/viz/2D-polar-graph`


## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` |  |
| `height` | `number` |  |
| `rRange` | `[number, number]` |  |
| `plotFunction` | `(theta: number) => number` | Function to plot: f(theta) → r |
| `plotResolution` | `number` | Number of samples around the full circle (default: 360). Ignored if thetaStep is set. |
| `thetaStep` | `number` |  |
| `sync` | `boolean` |  |
| `points` | `{ r: number; theta: number }[]` |  |
| `showGrid` | `boolean` |  |
| `pointRadius` | `number` |  |
| `pointColor` | `string` |  |
| `curveColor` | `string` |  |
| `onPointClick` | `(info: PolarPointInfo) => void` |  |
| `onPointDoubleClick` | `(info: PolarPointInfo) => void` |  |
| `onPointContextMenu` | `(info: PolarPointInfo) => void` |  |
| `onPointHover` | `(info: PolarPointInfo) => void` |  |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
