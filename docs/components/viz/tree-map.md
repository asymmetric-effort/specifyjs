# TreeMap

Treemap visualization rendered as SVG using a squarified layout algorithm. Hierarchical data is displayed as nested proportional rectangles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `TreeMapNode` | (required) | Root node of the treemap data |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| showLabels | `boolean` | `true` | Show labels inside cells |
| showValues | `boolean` | `true` | Show values inside cells |
| colors | `string[]` | built-in palette | Color palette |
| borderColor | `string` | `'#ffffff'` | Cell border color |
| borderWidth | `number` | `2` | Cell border width |
| padding | `number` | `2` | Inner padding for nested cells |
| title | `string` | `undefined` | Chart title |

### TreeMapNode

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Node label |
| value | `number` | Leaf node value |
| color | `string` | Optional fill color |
| children | `TreeMapNode[]` | Child nodes |

## Usage

```ts
import { createElement } from 'specifyjs';
import { TreeMap } from 'specifyjs/components/viz/tree-map';

createElement(TreeMap, {
  data: {
    label: 'Portfolio',
    value: 0,
    children: [
      { label: 'Stocks', value: 60 },
      { label: 'Bonds', value: 25 },
      { label: 'Cash', value: 15 },
    ],
  },
  title: 'Asset Allocation',
});
```

## Notes

- Renders as SVG using an iterative squarified treemap algorithm (optimizes for square-like aspect ratios).
- Nested children are laid out within their parent cell with a small header offset for the parent label.
- Labels and values are hidden for cells too small to display them.
