# DiscreteCartesian2D

Renders an NxM grid of discrete colored cells as SVG. Each cell's value maps to a color via a configurable color map. Useful for cellular automata, binary matrices, game-of-life grids, and similar discrete state visualizations.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `number[][]` | (required) | Grid data: rows x cols. Each value maps to a color via `colorMap` |
| colorMap | `Record<number, string>` | `{ 0: '#1e293b', 1: '#3b82f6' }` | Map of cell values to colors |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `600` | SVG viewBox height |
| cellGap | `number` | `1` | Gap between cells in pixels |
| cellRadius | `number` | `0` | Cell border radius |
| showGrid | `boolean` | `false` | Show grid lines between cells |
| gridColor | `string` | `'#334155'` | Grid line color |
| showIndices | `boolean` | `false` | Show row and column index labels |
| backgroundColor | `string` | `'#0f172a'` | Background color |
| padding | `number` | `10` | Padding around the grid |
| onCellClick | `(row: number, col: number, value: number) => void` | `undefined` | Cell click callback |
| onCellHover | `(row: number, col: number, value: number) => void` | `undefined` | Cell hover callback |
| title | `string` | `undefined` | Chart title |

## Usage

```ts
import { createElement } from 'specifyjs';
import { DiscreteCartesian2D } from 'specifyjs/components/viz/2D-discrete-cartesian';

createElement(DiscreteCartesian2D, {
  data: [
    [0, 1, 0, 1],
    [1, 0, 1, 0],
    [0, 1, 0, 1],
  ],
  colorMap: { 0: '#1e293b', 1: '#22c55e' },
  showIndices: true,
  onCellClick: (row, col, val) => console.log(`Cell (${row},${col}) = ${val}`),
});
```

## Notes

- Renders entirely as SVG with responsive viewBox sizing.
- Interactive cells receive `role="button"` and `tabIndex` for ARIA compliance.
- Handles jagged arrays gracefully (rows may have different lengths).
