# Gauge

Semicircular gauge meter rendered as SVG with colored arc segments, animated needle, tick marks, and value/label display.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| value | `number` | (required) | Current gauge value |
| min | `number` | `0` | Minimum value |
| max | `number` | `100` | Maximum value |
| width | `number` | `300` | SVG viewBox width |
| height | `number` | `200` | SVG viewBox height |
| startAngle | `number` | `-135` | Arc start angle in degrees |
| endAngle | `number` | `135` | Arc end angle in degrees |
| arcWidth | `number` | `20` | Arc stroke width |
| showValue | `boolean` | `true` | Show numeric value |
| showMinMax | `boolean` | `true` | Show min/max labels |
| showTicks | `boolean` | `true` | Show tick marks |
| tickCount | `number` | `10` | Number of tick divisions |
| label | `string` | `undefined` | Label text below value |
| unit | `string` | `undefined` | Unit text after value (e.g. 'rpm', '%') |
| colors | `string[]` | `['#22c55e', '#f59e0b', '#ef4444']` | Arc segment colors (evenly distributed) |
| needleColor | `string` | `'#374151'` | Needle fill color |
| backgroundColor | `string` | `'#e5e7eb'` | Background arc color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Gauge } from 'specifyjs/components/viz/gauge';

createElement(Gauge, {
  value: 72,
  min: 0,
  max: 100,
  unit: '%',
  label: 'CPU Usage',
  colors: ['#22c55e', '#f59e0b', '#ef4444'],
});
```

## Notes

- Renders as SVG with `role="meter"` and ARIA value attributes.
- The needle is a triangular polygon with a center cap circle.
- Value is clamped to the min/max range.
- Default angle span of 270 degrees (from -135 to 135) is typical for dashboard gauges.
