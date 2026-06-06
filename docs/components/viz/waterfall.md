# WaterfallChart

Waterfall/cascade chart rendered as SVG. Each bar starts where the previous bar ended, showing cumulative effect. Bars are color-coded as increases (green), decreases (red), or totals (blue).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `WaterfallDatum[]` | `[]` | Data points to render |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| increaseColor | `string` | `'#10b981'` | Color for increase bars |
| decreaseColor | `string` | `'#ef4444'` | Color for decrease bars |
| totalColor | `string` | `'#3b82f6'` | Color for total bars |
| connectorColor | `string` | `'#94a3b8'` | Connector line color |
| showValues | `boolean` | `true` | Show value labels on bars |
| showGrid | `boolean` | `true` | Show grid lines |
| showConnectors | `boolean` | `true` | Show connector lines between bars |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `60` | Padding around chart area |

### WaterfallDatum

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Category label |
| value | `number` | Change value |
| type | `'increase' \| 'decrease' \| 'total'` | Bar type (auto-detected from sign if omitted) |

## Usage

```ts
import { createElement } from 'specifyjs';
import { WaterfallChart } from 'specifyjs/components/viz/waterfall';

createElement(WaterfallChart, {
  data: [
    { label: 'Revenue', value: 500 },
    { label: 'COGS', value: -200, type: 'decrease' },
    { label: 'Gross Profit', value: 0, type: 'total' },
    { label: 'Expenses', value: -150, type: 'decrease' },
    { label: 'Net Income', value: 0, type: 'total' },
  ],
  title: 'Income Waterfall',
});
```

## Notes

- Renders as SVG. Total bars start from zero and show the running cumulative.
- Connector lines (dashed) link the end of each bar to the start of the next (skipped before totals).
- Value labels show +/- prefix for non-total bars.
- Handles negative cumulative values correctly (bars can extend below zero).
