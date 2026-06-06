# PivotTable

Cross-tabulation table rendered as SVG. Aggregates data records across row and column dimensions with configurable aggregation functions and optional totals.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `Record<string, unknown>[]` | `[]` | Array of data records |
| rows | `string[]` | `[]` | Row dimension field names |
| columns | `string[]` | `[]` | Column dimension field names |
| values | `string[]` | `[]` | Value field names to aggregate |
| aggregation | `'sum' \| 'count' \| 'avg' \| 'min' \| 'max'` | `'sum'` | Aggregation function |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| showTotals | `boolean` | `true` | Show totals row and column |
| title | `string` | `undefined` | Chart title |
| headerColor | `string` | `'#3b82f6'` | Header background color |
| cellPadding | `number` | `8` | Cell padding in px |

## Usage

```ts
import { createElement } from 'specifyjs';
import { PivotTable } from 'specifyjs/components/viz/pivot-table';

createElement(PivotTable, {
  data: [
    { region: 'North', product: 'A', sales: 100 },
    { region: 'North', product: 'B', sales: 150 },
    { region: 'South', product: 'A', sales: 200 },
    { region: 'South', product: 'B', sales: 120 },
  ],
  rows: ['region'],
  columns: ['product'],
  values: ['sales'],
  aggregation: 'sum',
  showTotals: true,
  title: 'Sales by Region and Product',
});
```

## Notes

- Renders as SVG with `role="table"` for accessibility.
- Supports multiple row/column dimension fields (composite keys).
- Alternating row backgrounds for readability.
- Long labels are truncated with ellipsis.
