# VirtualScroll

**Category:** Data Display  
**Path:** `components/data/virtual-scroll`

## Overview

Renders only visible items from a large list plus an
overscan buffer. Uses a spacer div for correct scrollbar sizing and
recalculates visible range on every scroll event.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `unknown[]` (required) | Full array of items |
| `renderItem` | `(item: unknown, index: number) => unknown` (required) | Render function for a single item |
| `itemHeight` | `number` (required) | Fixed height of each item in pixels |
| `overscan` | `number` | Extra items rendered above/below the viewport |
| `height` | `string` (required) | Container height (CSS value, e.g. '400px' or '100%') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
