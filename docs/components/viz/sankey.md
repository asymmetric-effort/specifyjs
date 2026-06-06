# SankeyDiagram

Sankey/flow diagram rendered as SVG. Nodes are positioned in columns from sources to sinks; curved Bezier paths show flow between nodes with width proportional to value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodes | `SankeyNode[]` | (required) | Array of nodes |
| links | `SankeyLink[]` | (required) | Array of flow links |
| width | `number` | `800` | SVG viewBox width |
| height | `number` | `500` | SVG viewBox height |
| nodeWidth | `number` | `20` | Width of node rectangles |
| nodePadding | `number` | `10` | Vertical padding between nodes |
| showLabels | `boolean` | `true` | Show node labels |
| showValues | `boolean` | `false` | Show flow values on links |
| linkOpacity | `number` | `0.4` | Link fill opacity (0-1) |
| colors | `string[]` | built-in palette | Node color palette |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `40` | Padding around chart area |

### SankeyNode

| Field | Type | Description |
|-------|------|-------------|
| id | `string` | Unique identifier |
| label | `string` | Display label |
| color | `string` | Optional node color |

### SankeyLink

| Field | Type | Description |
|-------|------|-------------|
| source | `string` | Source node ID |
| target | `string` | Target node ID |
| value | `number` | Flow value |
| color | `string` | Optional link color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { SankeyDiagram } from 'specifyjs/components/viz/sankey';

createElement(SankeyDiagram, {
  nodes: [
    { id: 'a', label: 'Source A' },
    { id: 'b', label: 'Source B' },
    { id: 'c', label: 'Target C' },
  ],
  links: [
    { source: 'a', target: 'c', value: 30 },
    { source: 'b', target: 'c', value: 20 },
  ],
  title: 'Flow Diagram',
});
```

## Notes

- Renders as SVG with cubic Bezier flow paths.
- Column assignment uses iterative BFS from source nodes (nodes with no incoming links).
- Node heights are proportional to total throughput within each column.
- Labels are placed to the left of first-column nodes and to the right of last-column nodes.
