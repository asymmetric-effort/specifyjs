# Histogram

Bins raw numeric data and renders vertical bar charts as SVG. Supports automatic or user-specified bin counts with grid lines, value labels, and axis labels.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `number[]` | `[]` | Raw data values to bin |
| bins | `number` | `10` | Number of bins |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| barColor | `string` | `'#3b82f6'` | Bar fill color |
| barGap | `number` | `2` | Gap between bars in px |
| showGrid | `boolean` | `true` | Show grid lines |
| showValues | `boolean` | `true` | Show count labels above bars |
| title | `string` | `undefined` | Chart title |
| xLabel | `string` | `undefined` | X-axis label |
| yLabel | `string` | `undefined` | Y-axis label |
| padding | `number` | `60` | Padding around chart area |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Histogram } from 'specifyjs/components/viz/histogram';

createElement(Histogram, {
  data: [1, 2, 2, 3, 3, 3, 4, 5, 5, 6, 7, 8, 8, 9, 10],
  bins: 5,
  title: 'Value Distribution',
  xLabel: 'Value',
  yLabel: 'Count',
});
```

## Notes

- Renders as SVG. Bin ranges are computed automatically as equal-width intervals.
- Handles edge cases: empty data, single value, all-same values.
- Bin range labels are shown on the x-axis; the final bin's upper bound is also displayed.
