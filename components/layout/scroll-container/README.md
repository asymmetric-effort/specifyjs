# ScrollContainer

**Category:** Layout  
**Path:** `components/layout/scroll-container`

## Overview

Scrollable container with custom scrollbar styling hints.
Provides a constrained scrollable area with configurable scroll direction,
scrollbar visibility, optional inset shadow at scroll edges, and padding.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `maxHeight` | `string` | Maximum height (CSS value) |
| `maxWidth` | `string` | Maximum width (CSS value) |
| `direction` | `'vertical' | 'horizontal' | 'both'` | Scroll direction (default: 'vertical') |
| `showScrollbar` | `'auto' | 'always' | 'hover' | 'never'` | Scrollbar visibility (default: 'auto') |
| `padding` | `string` | Inner padding (CSS value) |
| `shadow` | `boolean` | Show inset shadow at scroll edges to hint overflow (default: false) |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
