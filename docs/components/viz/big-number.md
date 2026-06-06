# BigNumber

KPI / metric card component rendered as SVG. Displays a large formatted number with optional prefix, suffix, trend indicator, label, and sparkline mini-chart.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number \| string` | (required) | The main value to display |
| label | `string` | `undefined` | Descriptive label beneath the value |
| prefix | `string` | `''` | Prefix before the value (e.g. '$') |
| suffix | `string` | `''` | Suffix after the value (e.g. '%') |
| trend | `number` | `undefined` | Trend value (positive = up arrow, negative = down arrow) |
| trendLabel | `string` | `undefined` | Trend context label (e.g. 'vs last week') |
| sparkline | `number[]` | `undefined` | Array of data points for a mini line chart |
| width | `number` | `280` | SVG viewBox width |
| height | `number` | `160` | SVG viewBox height |
| valueColor | `string` | `'currentColor'` | Main value text color |
| trendUpColor | `string` | `'#22c55e'` | Trend arrow color when positive |
| trendDownColor | `string` | `'#ef4444'` | Trend arrow color when negative |
| backgroundColor | `string` | `'#ffffff'` | Card background color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { BigNumber } from 'specifyjs/components/viz/big-number';

createElement(BigNumber, {
  value: 42567,
  prefix: '$',
  label: 'Monthly Revenue',
  trend: 12.5,
  trendLabel: 'vs last month',
  sparkline: [30, 35, 28, 42, 38, 45, 50],
});
```

## Notes

- Renders entirely as SVG with rounded card styling.
- Numeric values are auto-formatted with thousand separators.
- The sparkline includes a gradient fill area beneath the line.
- ARIA attributes are applied for accessibility.
