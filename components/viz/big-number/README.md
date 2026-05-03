# BigNumber

**Category:** Visualization  
**Path:** `components/viz/big-number`

## Overview

A SpecifyJS component that renders KPI / metric cards as SVG.
Supports:
 - Large formatted number display with prefix/suffix
 - Trend indicator (up/down arrow with color)
 - Optional sparkline (mini line chart)
 - Descriptive label and trend label
 - Configurable colors and sizing
 - ARIA accessibility attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number | string` (required) | The main value to display |
| `label` | `string` | Descriptive label beneath the value |
| `prefix` | `string` | Prefix before the value (e.g. '$') |
| `suffix` | `string` | Suffix after the value (e.g. '%') |
| `trend` | `number` | Trend value — positive = up, negative = down |
| `trendLabel` | `string` | Trend context label (e.g. 'vs last week') |
| `sparkline` | `number[]` | Small line chart data points |
| `width` | `number` | SVG width in pixels (default: 280) |
| `height` | `number` | SVG height in pixels (default: 160) |
| `valueColor` | `string` | Main value text color (default: 'currentColor') |
| `trendUpColor` | `string` | Trend arrow color when positive (default: '#22c55e') |
| `trendDownColor` | `string` | Trend arrow color when negative (default: '#ef4444') |
| `backgroundColor` | `string` | Card background color (default: '#ffffff') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
