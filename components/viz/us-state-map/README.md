# USStateMap

**Category:** Visualization  
**Path:** `components/viz/us-state-map`

## Overview

A SpecifyJS component that renders an interactive SVG map of the United States.
Supports:
 - Per-state fill coloring via a state abbreviation to color map
 - Hover highlight effects with configurable hover color
 - Click and hover event handlers with state identification
 - Configurable stroke color and width for state borders
 - Full ARIA compliance with accessible labels per state
 - Public domain (CC0) SVG path data for all 50 states plus DC
Zero runtime dependencies — pure SpecifyJS + SVG.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `width` | `number` | SVG width in pixels (default: 959) |
| `height` | `number` | SVG height in pixels (default: 593) |
| `stateColors` | `Record<string, string>` | Map of state abbreviation to fill color |
| `defaultColor` | `string` | Default fill for states not in stateColors (default: '#D0D0D0') |
| `strokeColor` | `string` | Border color between states (default: '#FFFFFF') |
| `strokeWidth` | `number` | Border width between states (default: 1) |
| `onStateClick` | `(stateId: string) => void` | Click handler receiving state abbreviation |
| `onStateHover` | `(stateId: string \| null) => void` | Hover handler receiving state abbreviation or null |
| `hoverColor` | `string` | Highlight color on hover (default: '#FFD700') |
| `title` | `string` | Accessible title for the SVG (default: 'Map of the United States') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
