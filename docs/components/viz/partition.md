# Partition

Icicle/partition diagram rendered as SVG. Subdivides hierarchical data into proportional rectangles across depth levels. Supports horizontal (icicle) and vertical (flame) orientation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `PartitionNode` | (required) | Root node of the partition data |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| showLabels | `boolean` | `true` | Show labels inside cells |
| showValues | `boolean` | `true` | Show values inside cells |
| colors | `string[]` | built-in palette | Color palette |
| borderColor | `string` | `'#ffffff'` | Cell border color |
| borderWidth | `number` | `1` | Cell border width |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `10` | Padding around chart area |

### PartitionNode

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Node label |
| value | `number` | Leaf node value (internal nodes sum descendants) |
| color | `string` | Optional fill color |
| children | `PartitionNode[]` | Child nodes |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Partition } from 'specifyjs/components/viz/partition';

createElement(Partition, {
  data: {
    label: 'Root',
    children: [
      { label: 'A', value: 30 },
      { label: 'B', children: [
        { label: 'B1', value: 20 },
        { label: 'B2', value: 10 },
      ]},
    ],
  },
  title: 'Icicle Diagram',
});
```

## Notes

- Renders as SVG using iterative tree traversal (no recursion).
- Each depth level occupies a full row (horizontal) or column (vertical).
- Labels and values are hidden for cells that are too small.
