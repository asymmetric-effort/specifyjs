# Grid

**Category:** Layout  
**Path:** `components/layout/grid`

## Overview

CSS Grid layout container.
Provides a declarative CSS Grid wrapper with support for columns, rows,
gap, named areas, auto-fit responsive columns, and alignment.
Use GridItem to control individual child placement.

## Props

### GridProps

| Prop | Type | Description |
| --- | --- | --- |
| `columns` | `number | string` | Number of equal columns or a CSS grid-template-columns string |
| `rows` | `string` | CSS grid-template-rows value |
| `gap` | `string` | Gap between grid cells (CSS value, e.g. '16px' or '1rem 2rem') |
| `alignItems` | `string` | CSS align-items for the grid container |
| `justifyItems` | `string` | CSS justify-items for the grid container |
| `minColWidth` | `string` | When set, uses auto-fit with minmax(minColWidth, 1fr) |
| `areas` | `string[]` | Named grid areas (grid-template-areas lines) |
| `responsive` | `GridBreakpoint[]` | Responsive breakpoints — rendered as inline style overrides via CSS custom properties |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Children |

### GridItemProps

| Prop | Type | Description |
| --- | --- | --- |
| `gridColumn` | `string` | grid-column value (e.g. 'span 2', '1 / 3') |
| `gridRow` | `string` | grid-row value |
| `gridArea` | `string` | grid-area name |
| `alignSelf` | `string` | CSS align-self |
| `justifySelf` | `string` | CSS justify-self |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
