# BubbleChart

Scatter chart with three-dimensional data encoding (x, y, bubble radius) rendered as SVG. Auto-scales bubble sizes within configurable min/max radius bounds.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `BubbleDatum[]` | `[]` | Array of bubble data points |
| width | `number` | `600` | SVG viewBox width |
| height | `number` | `400` | SVG viewBox height |
| xLabel | `string` | `undefined` | X-axis label |
| yLabel | `string` | `undefined` | Y-axis label |
| showGrid | `boolean` | `true` | Show grid lines |
| showAxes | `boolean` | `true` | Show axes |
| showLabels | `boolean` | `false` | Show datum labels |
| maxBubbleRadius | `number` | `40` | Maximum rendered bubble radius in px |
| minBubbleRadius | `number` | `4` | Minimum rendered bubble radius in px |
| defaultColor | `string` | `'#3b82f6'` | Default bubble fill color |
| opacity | `number` | `0.7` | Bubble fill opacity |
| title | `string` | `undefined` | Chart title |
| padding | `number` | `60` | Padding around chart area |

### BubbleDatum

| Field | Type | Description |
|-------|------|-------------|
| x | `number` | X coordinate |
| y | `number` | Y coordinate |
| r | `number` | Bubble size value |
| label | `string` | Optional label |
| color | `string` | Optional fill color |

## Usage

```ts
import { createElement } from 'specifyjs';
import { BubbleChart } from 'specifyjs/components/viz/bubble-chart';

createElement(BubbleChart, {
  data: [
    { x: 10, y: 20, r: 30, label: 'A' },
    { x: 40, y: 50, r: 15, label: 'B' },
    { x: 25, y: 35, r: 45, label: 'C', color: '#ef4444' },
  ],
  xLabel: 'Revenue',
  yLabel: 'Growth',
  showLabels: true,
});
```

## Notes

- Renders as SVG. Invalid data points (NaN, Infinity) are filtered out.
- Bubble radius is linearly interpolated between `minBubbleRadius` and `maxBubbleRadius`.
- ARIA labels are applied to each bubble circle.
