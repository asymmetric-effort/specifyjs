# Splitter

**Category:** Layout  
**Path:** `components/layout/splitter`

## Overview

Resizable split pane (horizontal or vertical).
Renders exactly two child panes separated by a draggable divider bar.
Uses onMouseDown/onMouseMove/onMouseUp for interactive resize.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `direction` | `'horizontal' | 'vertical'` | Split direction (default: 'horizontal' — left|right panes) |
| `initialSplit` | `number` | Initial split percentage for the first pane (default: 50) |
| `minSize` | `number` | Minimum size of either pane in px (default: 50) |
| `maxSize` | `number` | Maximum size of the first pane in px |
| `dividerSize` | `number` | Divider bar width/height in px (default: 6) |
| `style` | `Record<string, string>` | Extra inline styles for the container |
| `className` | `string` | Extra class name |
| `children` | `unknown[]` | Exactly two children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
