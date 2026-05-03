# FlexContainer

**Category:** Layout  
**Path:** `components/layout/flex-container`

## Overview

Flexbox layout container.
Provides a declarative flexbox wrapper with direction, wrap, gap, and
alignment props. Use FlexItem for per-child flex control.

## Props

### FlexContainerProps

| Prop | Type | Description |
| --- | --- | --- |
| `direction` | `'row' | 'row-reverse' | 'column' | 'column-reverse'` | flex-direction (default: 'row') |
| `wrap` | `'nowrap' | 'wrap' | 'wrap-reverse'` | flex-wrap (default: 'nowrap') |
| `gap` | `string` | Gap between items (CSS value) |
| `alignItems` | `string` | CSS align-items |
| `justifyContent` | `string` | CSS justify-content |
| `inline` | `boolean` | Use inline-flex instead of flex |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Children |

### FlexItemProps

| Prop | Type | Description |
| --- | --- | --- |
| `flex` | `string` | Shorthand flex property (e.g. '1 1 auto') |
| `grow` | `number` | flex-grow |
| `shrink` | `number` | flex-shrink |
| `basis` | `string` | flex-basis |
| `alignSelf` | `string` | align-self override |
| `order` | `number` | order |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
