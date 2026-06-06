# RadarChart

Spider/radar chart rendered as SVG. Supports multiple overlaid data series with concentric grid rings, axis labels, filled polygons, data point dots, and a legend.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| axes | `RadarAxis[]` | `[]` | Axes definition (one per spoke) |
| series | `RadarSeries[]` | `[]` | Data series to overlay |
| width | `number` | `500` | SVG viewBox width |
| height | `number` | `500` | SVG viewBox height |
| levels | `number` | `5` | Number of concentric grid rings |
| showLabels | `boolean` | `true` | Show axis labels around the perimeter |
| showValues | `boolean` | `false` | Show value annotations at data points |
| showLegend | `boolean` | `true` | Show legend |
| showDots | `boolean` | `true` | Show dots at data points |
| gridColor | `string` | `'#d1d5db'` | Grid line color |
| title | `string` | `undefined` | Chart title |

### RadarAxis

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Axis label |
| max | `number` | Optional axis maximum (auto-detected if omitted) |

### RadarSeries

| Field | Type | Description |
|-------|------|-------------|
| label | `string` | Series label |
| values | `number[]` | Values for each axis |
| color | `string` | Series color |
| fillOpacity | `number` | Fill opacity (default: 0.15) |

## Usage

```ts
import { createElement } from 'specifyjs';
import { RadarChart } from 'specifyjs/components/viz/radar-chart';

createElement(RadarChart, {
  axes: [
    { label: 'Speed' },
    { label: 'Power' },
    { label: 'Range' },
    { label: 'Armor' },
    { label: 'Stealth' },
  ],
  series: [
    { label: 'Unit A', values: [8, 6, 7, 5, 9], color: '#3b82f6' },
    { label: 'Unit B', values: [5, 9, 4, 8, 3], color: '#ef4444' },
  ],
  title: 'Unit Comparison',
});
```

## Notes

- Renders as SVG. Requires at least 3 axes (shows error message otherwise).
- Each series renders as a filled polygon with an outlined border.
- Axis maximum is auto-detected from data if not specified per axis.
