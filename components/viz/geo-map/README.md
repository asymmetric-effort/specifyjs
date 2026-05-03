# GeoMap

**Category:** Visualization  
**Path:** `components/viz/geo-map`

## Overview

A SpecifyJS component that renders geographic maps as SVG.
Supports:
 - Choropleth coloring of regions via pre-computed SVG path data
 - Point markers via lat/lon with Mercator or equirectangular projection
 - Configurable color scales for value-based region coloring
 - Region labels
 - Demo helper: generateUSMapOutline() returns ~10 simplified US state regions
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `regions` | `GeoRegion[]` | SVG path data for each region |
| `markers` | `GeoMarker[]` | Point markers |
| `width` | `number` | SVG width in pixels (default: 800) |
| `height` | `number` | SVG height in pixels (default: 500) |
| `projection` | `'mercator' | 'equirectangular'` | Map projection type (default: 'equirectangular') |
| `colorScale` | `string[]` | Gradient colors for choropleth coloring (default: blue scale) |
| `minValue` | `number` | Minimum value for color scale domain |
| `maxValue` | `number` | Maximum value for color scale domain |
| `showLabels` | `boolean` | Show region labels (default: false) |
| `backgroundColor` | `string` | SVG background color (default: '#f0f4f8') |
| `borderColor` | `string` | Region border color (default: '#94a3b8') |
| `borderWidth` | `number` | Region border width (default: 1) |
| `defaultRegionColor` | `string` | Default fill color for regions without a value (default: '#cbd5e1') |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 20) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
