# WaterfallChart

**Category:** Visualization  
**Path:** `components/viz/waterfall`

## Overview

A SpecifyJS component that renders waterfall/cascade charts
as SVG.
Each bar starts where the previous bar ended, showing cumulative effect.
Bars typed as 'total' start from zero. Increases go up (green), decreases
go down (red), and totals are a distinct color (blue).
Supports:
 - Automatic cumulative positioning
 - Connector lines between bars
 - Color-coded increase/decrease/total
 - Grid lines, value labels, title
 - Edge cases: empty data, single item, all-zero values, negative cumulative
Zero runtime dependencies -- pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `WaterfallDatum[]` (required) | Data points to render |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `increaseColor` | `string` | Color for increase bars (default: '#10b981') |
| `decreaseColor` | `string` | Color for decrease bars (default: '#ef4444') |
| `totalColor` | `string` | Color for total bars (default: '#3b82f6') |
| `connectorColor` | `string` | Color for connector lines (default: '#94a3b8') |
| `showValues` | `boolean` | Show value labels on bars (default: true) |
| `showGrid` | `boolean` | Show grid lines (default: true) |
| `showConnectors` | `boolean` | Show connector lines between bars (default: true) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 60) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
