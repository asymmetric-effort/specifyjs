# LollipopChart

Lollipop chart rendered as SVG. Each data point is a thin stem (line) with a circle at the tip, providing a lighter visual alternative to bar charts.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `LollipopDatum[]` | `[]` | Data points to render |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| orientation | `'horizontal' \| 'vertical'` | `'vertical'` | Chart orientation |
| stemColor | `string` | `'#94a3b8'` | Stem line color |
| stemWidth | `number` | `2` | Stem line width |
| dotRadius | `number` | `6` | Dot circle radius |
| dotColor | `string` | `'#3b82f6'` | Default dot fill color |
| showGrid | `boolean` | `true` | Show grid lines |
| showValues | `boolean` | `true` | Show value labels |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `60` | Padding around chart area |

### LollipopDatum

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Category label |
| value | `number` | Data value |
| color | `string` | Optional dot color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { LollipopChart } from 'specifyjs/components/viz/lollipop';

createElement(LollipopChart, {
  data: [
    { label: 'Jan', value: 30 },
    { label: 'Feb', value: 45 },
    { label: 'Mar', value: 28 },
  ],
  title: 'Monthly Sales',
});
```

## Notes

- Renders as SVG. Category labels are rotated -45 degrees in vertical orientation to prevent overlap.
- Shows an empty state message when no data is provided.
