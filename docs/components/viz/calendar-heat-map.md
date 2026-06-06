# CalendarHeatMap

GitHub-style contribution calendar rendered as SVG. Days are colored squares arranged in week columns with color intensity proportional to value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | `CalendarDatum[]` | `[]` | Array of date/value pairs |
| width | `number` | `800` | SVG viewBox width |
| height | `number` | `160` | SVG viewBox height |
| colorScale | `string[]` | `['#9be9a8', '#40c463', '#30a14e', '#216e39']` | Color gradient from low to high |
| cellSize | `number` | `12` | Size of each day cell in px |
| cellGap | `number` | `2` | Gap between cells in px |
| showMonthLabels | `boolean` | `true` | Show month labels above the calendar |
| showDayLabels | `boolean` | `true` | Show day-of-week labels on the left |
| emptyColor | `string` | `'#ebedf0'` | Color for days with no data |
| title | `string` | `undefined` | Chart title |

### CalendarDatum

| Field | Type | Description |
|-------|------|-------------|
| date | `string` | Date string in 'YYYY-MM-DD' format |
| value | `number` | Numeric value for this date |

## Usage

```ts
import { createElement } from 'specifyjs';
import { CalendarHeatMap } from 'specifyjs/components/viz/calendar-heat-map';

createElement(CalendarHeatMap, {
  data: [
    { date: '2026-01-01', value: 5 },
    { date: '2026-01-02', value: 12 },
    { date: '2026-01-03', value: 3 },
  ],
  title: 'Activity',
});
```

## Notes

- Renders as SVG. Date range is auto-detected from data and extended to full weeks.
- Multiple values on the same date are summed.
- Color interpolation uses linear blending through the color scale.
