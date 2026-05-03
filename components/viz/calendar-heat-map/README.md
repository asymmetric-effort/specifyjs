# CalendarHeatMap

**Category:** Visualization  
**Path:** `components/viz/calendar-heat-map`

## Overview

A SpecifyJS component that renders GitHub-style
contribution calendars as SVG.
Supports:
 - Days as colored squares arranged in weeks (columns) and days-of-week (rows)
 - Color intensity proportional to value
 - Month and day-of-week labels
 - Configurable cell size and gap
 - Auto-detection of date range from data
 - Proper ARIA attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `CalendarDatum[]` (required) | Array of date/value pairs |
| `width` | `number` | SVG width in pixels (default: 800) |
| `height` | `number` | SVG height in pixels (default: 160) |
| `colorScale` | `string[]` | Color gradient from low to high |
| `cellSize` | `number` | Size of each day cell in px (default: 12) |
| `cellGap` | `number` | Gap between cells in px (default: 2) |
| `showMonthLabels` | `boolean` | Show month labels above the calendar (default: true) |
| `showDayLabels` | `boolean` | Show day-of-week labels on the left (default: true) |
| `emptyColor` | `string` | Color for days with no data (default: '#ebedf0') |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
