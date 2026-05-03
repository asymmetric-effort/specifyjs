# Partition

**Category:** Visualization  
**Path:** `components/viz/partition`

## Overview

A SpecifyJS component that renders icicle/partition diagrams as SVG.
Supports:
 - Horizontal (icicle) and vertical (flame) orientation
 - Hierarchical data with proportional subdivision
 - Iterative tree traversal (no recursion)
 - Labels and value display
 - Configurable colors, borders, padding
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `data` | `PartitionNode` (required) | Root node of the partition data |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `orientation` | `'horizontal' | 'vertical'` | Layout orientation (default: 'horizontal') |
| `showLabels` | `boolean` | Show labels inside cells (default: true) |
| `showValues` | `boolean` | Show values inside cells (default: true) |
| `colors` | `string[]` | Color palette for cells without explicit color |
| `borderColor` | `string` | Border color around cells (default: '#ffffff') |
| `borderWidth` | `number` | Border width in px (default: 1) |
| `title` | `string` | Chart title |
| `padding` | `number` | Padding around chart area in px (default: 10) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
