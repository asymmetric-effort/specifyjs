# ChordDiagram

Circular chord diagram rendered as SVG, showing directional flow between groups. Outer arcs are proportional to total flow; ribbons show inter-group connections.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| matrix | `number[][]` | (required) | Square matrix where `matrix[i][j]` = flow from group i to group j |
| labels | `string[]` | (required) | Labels for each group (must match matrix dimensions) |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `600` | SVG viewBox height |
| colors | `string[]` | built-in palette | Color palette for groups |
| padAngle | `number` | `0.05` | Angular padding between arcs in radians |
| showLabels | `boolean` | `true` | Show group labels |
| showValues | `boolean` | `false` | Show flow values in labels |
| ribbonOpacity | `number` | `0.5` | Ribbon fill opacity (0-1) |
| innerRadiusRatio | `number` | `0.9` | Inner radius as ratio of outer radius (0.5-0.99) |
| title | `string` | `undefined` | Chart title |

## Usage

```ts
import { createElement } from 'specifyjs';
import { ChordDiagram } from 'specifyjs/components/viz/chord';

createElement(ChordDiagram, {
  matrix: [
    [0, 10, 5],
    [8, 0, 3],
    [2, 7, 0],
  ],
  labels: ['A', 'B', 'C'],
  showValues: true,
});
```

## Notes

- Renders as SVG with quadratic Bezier ribbons through the center.
- Labels are rotated for readability based on their angular position.
- Shows an empty state message when no data is provided.
