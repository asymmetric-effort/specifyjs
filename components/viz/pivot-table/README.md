# PivotTable

**Category:** Visualization  
**Path:** `components/viz/pivot-table`

## Overview

A SpecifyJS component that renders cross-tabulation tables as SVG.
Supports:
 - Multiple row and column dimension fields
 - Aggregation: sum, count, avg, min, max
 - Optional totals row and column
 - Configurable styling (header color, cell padding)
 - Auto-sizing cells
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `Record<string, unknown>[]` (required) | Array of data records |
| `rows` | `string[]` (required) | Row dimension field names |
| `columns` | `string[]` (required) | Column dimension field names |
| `values` | `string[]` (required) | Value field names to aggregate |
| `aggregation` | `'sum' | 'count' | 'avg' | 'min' | 'max'` | Aggregation function (default: 'sum') |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `showTotals` | `boolean` | Show totals row and column (default: true) |
| `title` | `string` | Chart title |
| `headerColor` | `string` | Header background color (default: '#3b82f6') |
| `cellPadding` | `number` | Cell padding in px (default: 8) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
