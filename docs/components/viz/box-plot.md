# BoxPlot

Box-and-whisker plot rendered as SVG. Automatically computes quartiles, whiskers, outliers, and optional mean markers from raw numeric data.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `BoxPlotDatum[]` | `[]` | Array of box plot data sets |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| orientation | `'horizontal' \| 'vertical'` | `'vertical'` | Plot orientation |
| showOutliers | `boolean` | `true` | Show outlier circles |
| showMean | `boolean` | `false` | Show mean marker (circle) |
| whiskerColor | `string` | `'#374151'` | Whisker and border color |
| boxWidth | `number` | `0.6` | Box width as fraction of available space (0.1-0.95) |
| showGrid | `boolean` | `true` | Show grid lines |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `60` | Padding around chart area |

### BoxPlotDatum

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Category label |
| values | `number[]` | Raw numeric values |
| color | `string` | Optional box fill color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { BoxPlot } from 'specifyjs/components/viz/box-plot';

createElement(BoxPlot, {
  data: [
    { label: 'Group A', values: [1, 2, 3, 4, 5, 6, 7, 8, 20] },
    { label: 'Group B', values: [3, 4, 5, 5, 6, 7, 8] },
  ],
  showMean: true,
  title: 'Distribution Comparison',
});
```

## Notes

- Renders as SVG with ARIA attributes on each box.
- Whiskers extend to the closest data point within 1.5x IQR. Points beyond are rendered as outlier circles.
- Quartiles computed using linear interpolation.
