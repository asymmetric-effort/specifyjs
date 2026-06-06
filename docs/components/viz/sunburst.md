# Sunburst

Multi-level donut/ring chart rendered as SVG. Hierarchical data is displayed as concentric ring segments with angles proportional to value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `SunburstNode` | (required) | Root node of the sunburst data |
| width | `number` | `500` | SVG viewBox width |
| height | `number` | `500` | SVG viewBox height |
| innerRadius | `number` | `40` | Inner radius of the first ring |
| showLabels | `boolean` | `true` | Show labels on segments |
| colors | `string[]` | built-in palette | Color palette |
| strokeColor | `string` | `'#ffffff'` | Stroke color between segments |
| strokeWidth | `number` | `1` | Stroke width between segments |
| title | `string` | `undefined` | Chart title |

### SunburstNode

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Segment label |
| value | `number` | Leaf node value |
| color | `string` | Optional fill color |
| children | `SunburstNode[]` | Child nodes |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Sunburst } from 'specifyjs/components/viz/sunburst';

createElement(Sunburst, {
  data: {
    label: 'Total',
    children: [
      { label: 'A', value: 30, children: [
        { label: 'A1', value: 15 },
        { label: 'A2', value: 15 },
      ]},
      { label: 'B', value: 20 },
    ],
  },
  title: 'Hierarchical Breakdown',
});
```

## Notes

- Renders as SVG using iterative BFS layout (no recursion).
- Ring width is evenly divided across depth levels.
- Labels are hidden on segments that are too small to fit text.
- Full-circle arcs (single child at any level) are handled with special SVG path logic.
