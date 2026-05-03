# RadarChart

**Category:** Visualization  
**Path:** `components/viz/radar-chart`

## Overview

A SpecifyJS component that renders spider/radar charts as SVG.
Supports:
 - Multiple overlaid data series
 - Configurable number of concentric grid rings
 - Axis labels and value annotations
 - Filled polygons with configurable opacity
 - Data point dots
 - Legend
 - Proper ARIA attributes
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `axes` | `RadarAxis[]` (required) | Axes definition — one per spoke of the radar |
| `series` | `RadarSeries[]` (required) | Data series to overlay on the chart |
| `width` | `number` | SVG width in pixels (default: 500) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `levels` | `number` | Number of concentric grid rings (default: 5) |
| `showLabels` | `boolean` | Show axis labels around the perimeter (default: true) |
| `showValues` | `boolean` | Show value annotations at data points (default: false) |
| `showLegend` | `boolean` | Show legend (default: true) |
| `showDots` | `boolean` | Show dots at data points (default: true) |
| `gridColor` | `string` | Grid line color (default: '#d1d5db') |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
