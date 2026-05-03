# PieGraph

**Category:** Visualization  
**Path:** `components/viz/2D-pie-graph`

## Overview

Build an SVG path `d` string for an arc (or annular sector).
Angles are in **radians**, measured clockwise from 12-o'clock
(i.e. -PI/2 offset so 0 rad = top).
Exported as a public utility so consumers can draw custom arcs.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `PieSliceDatum[]` (required) |  |
| `width` | `number` |  |
| `height` | `number` |  |
| `innerRadius` | `number` |  |
| `outerRadius` | `number` |  |
| `padAngle` | `number` |  |
| `showLabels` | `boolean` |  |
| `showValues` | `boolean` |  |
| `showLegend` | `boolean` |  |
| `legendPosition` | `'right' | 'bottom'` |  |
| `title` | `string` |  |
| `centerLabel` | `string` |  |
| `colors` | `string[]` |  |
| `strokeColor` | `string` |  |
| `strokeWidth` | `number` |  |
| `textColor` | `string` |  |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
