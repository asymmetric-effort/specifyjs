# Gauge

**Category:** Visualization  
**Path:** `components/viz/gauge`

## Overview

A SpecifyJS component that renders semicircular gauge meters as SVG.
Supports:
 - Configurable arc angles (start/end)
 - Colored arc segments (e.g. green/yellow/red zones)
 - Animated needle
 - Tick marks with labels
 - Value and unit display
 - Min/max labels
 - ARIA accessibility attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` (required) | Current gauge value |
| `min` | `number` | Minimum value (default: 0) |
| `max` | `number` | Maximum value (default: 100) |
| `width` | `number` | SVG width in pixels (default: 300) |
| `height` | `number` | SVG height in pixels (default: 200) |
| `startAngle` | `number` | Arc start angle in degrees (default: -135) |
| `endAngle` | `number` | Arc end angle in degrees (default: 135) |
| `arcWidth` | `number` | Arc stroke width (default: 20) |
| `showValue` | `boolean` | Show the numeric value (default: true) |
| `showMinMax` | `boolean` | Show min/max labels (default: true) |
| `showTicks` | `boolean` | Show tick marks (default: true) |
| `tickCount` | `number` | Number of tick divisions (default: 10) |
| `label` | `string` | Label text below the value |
| `unit` | `string` | Unit text after the value (e.g. 'rpm', '%') |
| `colors` | `string[]` | Colors for arc segments — evenly distributed (default: ['#22c55e', '#f59e0b', '#ef4444']) |
| `needleColor` | `string` | Needle color (default: '#374151') |
| `backgroundColor` | `string` | Background arc color (default: '#e5e7eb') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
