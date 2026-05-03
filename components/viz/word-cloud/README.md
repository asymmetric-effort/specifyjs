# WordCloud

**Category:** Visualization  
**Path:** `components/viz/word-cloud`

## Overview

A SpecifyJS component that renders word clouds as SVG.
Supports:
 - Font size proportional to word weight
 - Spiral placement algorithm (archimedean or rectangular) to avoid overlaps
 - Configurable rotation angles
 - Custom color palettes
 - Configurable padding between words
 - Proper ARIA attributes
Zero runtime dependencies — pure SpecifyJS + SVG.
Note: Since SVG text measurement is not available without a DOM, this
component uses character-count-based width estimation. Placement is
deterministic for the same input.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `words` | `WordDatum[]` (required) | Array of words with weights |
| `width` | `number` | SVG width in pixels (default: 600) |
| `height` | `number` | SVG height in pixels (default: 400) |
| `minFontSize` | `number` | Minimum font size in px (default: 10) |
| `maxFontSize` | `number` | Maximum font size in px (default: 64) |
| `fontFamily` | `string` | Font family (default: 'sans-serif') |
| `colors` | `string[]` | Color palette for words without explicit color |
| `rotations` | `number[]` | Allowed rotation angles in degrees (default: [0, -45, 45, 90]) |
| `padding` | `number` | Padding between words in px (default: 4) |
| `spiral` | `'archimedean' | 'rectangular'` | Spiral type for placement (default: 'archimedean') |
| `title` | `string` | Chart title |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
