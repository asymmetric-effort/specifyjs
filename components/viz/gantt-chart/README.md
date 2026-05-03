# GanttChart

**Category:** Visualization  
**Path:** `components/viz/gantt-chart`

## Overview

A SpecifyJS component that renders timeline bar charts as SVG.
Supports:
 - Horizontal task bars positioned by start time and duration
 - Optional task grouping
 - Configurable bar height and gap
 - Time axis with grid lines
 - Labels on left side
 - Progress indicators
 - Configurable colors per task
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `tasks` | `GanttTask[]` (required) | Array of tasks to render |
| `width` | `number` | SVG width in pixels (default: 800) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `barHeight` | `number` | Height of each task bar in px (default: 24) |
| `barGap` | `number` | Vertical gap between task bars in px (default: 8) |
| `showGrid` | `boolean` | Show vertical grid lines (default: true) |
| `showLabels` | `boolean` | Show task labels on the left (default: true) |
| `showProgress` | `boolean` | Show progress text on bars (default: false) |
| `timeUnit` | `string` | Label for the time unit displayed on axis (default: 'days') |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 50) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
