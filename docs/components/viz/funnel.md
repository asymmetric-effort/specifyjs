# FunnelChart

Funnel/pipeline visualization rendered as SVG. Each section is a trapezoid whose width is proportional to its value. Supports vertical and horizontal orientation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `FunnelDatum[]` | `[]` | Data sections (in funnel order, largest first) |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| orientation | `'vertical' \| 'horizontal'` | `'vertical'` | Funnel direction |
| showLabels | `boolean` | `true` | Show section labels |
| showValues | `boolean` | `true` | Show values |
| showPercentage | `boolean` | `true` | Show percentage of first item |
| gapSize | `number` | `2` | Gap between sections in px |
| colors | `string[]` | blue gradient palette | Color palette |
| title | `string` | `undefined` | Chart title |

### FunnelDatum

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Section label |
| value | `number` | Section value |
| color | `string` | Optional fill color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { FunnelChart } from 'specifyjs/components/viz/funnel';

createElement(FunnelChart, {
  data: [
    { label: 'Visitors', value: 1000 },
    { label: 'Signups', value: 600 },
    { label: 'Active', value: 300 },
    { label: 'Paid', value: 100 },
  ],
  title: 'Conversion Funnel',
});
```

## Notes

- Renders as SVG. Each section tapers from its value width to the next section's width.
- Percentages are computed relative to the first item's value.
- Zero values are rendered at a minimum 5% width for visibility.
