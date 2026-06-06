# HeatMap

2D heat map rendered as SVG. Each cell's color intensity is proportional to its value, with configurable color gradient, row/column labels, and optional value text.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `number[][]` | `[]` | 2D grid of values (data[row][col]) |
| rowLabels | `string[]` | `undefined` | Labels for rows (Y axis) |
| columnLabels | `string[]` | `undefined` | Labels for columns (X axis) |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| colorScale | `string[]` | `['#3b82f6', '#fbbf24', '#ef4444']` | Color gradient (low to high) |
| minValue | `number` | auto-detected | Minimum value for color mapping |
| maxValue | `number` | auto-detected | Maximum value for color mapping |
| showValues | `boolean` | `false` | Show numeric value in each cell |
| cellBorderColor | `string` | `'#fff'` | Cell border color |
| cellBorderWidth | `number` | `1` | Cell border width |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `60` | Padding around chart |

## Usage

```ts
import { createElement } from 'specifyjs';
import { HeatMap } from 'specifyjs/components/viz/heat-map';

createElement(HeatMap, {
  data: [[1, 5, 3], [7, 2, 8], [4, 6, 1]],
  rowLabels: ['A', 'B', 'C'],
  columnLabels: ['X', 'Y', 'Z'],
  showValues: true,
  title: 'Correlation Matrix',
});
```

## Notes

- Renders as SVG. Value text color automatically adjusts for contrast (light/dark) based on cell fill luminance.
- Min/max values are auto-detected from data if not specified.
- Shows an empty state message when data has no rows or columns.
