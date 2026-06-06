# DecompositionTree

Hierarchical tree layout rendered as SVG with labeled rectangle nodes and curved connector lines. Supports horizontal (root-left) and vertical (root-top) orientation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `DecompNode` | (required) | Root node of the tree |
| width | `number` | `800` | SVG viewBox width |
| height | `number` | `500` | SVG viewBox height |
| orientation | `'horizontal' \| 'vertical'` | `'horizontal'` | Layout direction |
| nodeWidth | `number` | `120` | Width of each node rectangle |
| nodeHeight | `number` | `40` | Height of each node rectangle |
| showValues | `boolean` | `true` | Show values inside nodes |
| showConnectors | `boolean` | `true` | Show connector lines |
| connectorColor | `string` | `'#94a3b8'` | Connector line color |
| colors | `string[]` | built-in palette | Color palette by depth |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `40` | Padding around chart area |

### DecompNode

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Node label |
| value | `number \| string` | Optional node value |
| color | `string` | Optional node color |
| children | `DecompNode[]` | Child nodes |

## Usage

```ts
import { createElement } from 'specifyjs';
import { DecompositionTree } from 'specifyjs/components/viz/decomposition-tree';

createElement(DecompositionTree, {
  data: {
    label: 'Revenue',
    value: 1000,
    children: [
      { label: 'Product A', value: 600 },
      { label: 'Product B', value: 400, children: [
        { label: 'Region 1', value: 250 },
        { label: 'Region 2', value: 150 },
      ]},
    ],
  },
  title: 'Revenue Breakdown',
});
```

## Notes

- Renders as SVG with iterative BFS-based layout (no recursion).
- Connectors use cubic Bezier curves.
- Nodes are colored by depth using the palette, overridden by per-node `color`.
