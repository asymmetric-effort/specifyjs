# NavWrapper

**Category:** Navigation  
**Path:** `components/nav/wrapper`

## Overview

Base container for all navigation components.
Provides consistent layout, orientation, ARIA roles, focus management,
and configurable styling. All nav components (dropdown, treenav, accordion)
build on this foundation.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `orientation` | `NavOrientation` | Orientation of child items (default: 'vertical') |
| `role` | `string` | ARIA role (default: 'navigation') |
| `ariaLabel` | `string` | ARIA label |
| `styling` | `NavWrapperStyle` | Styling configuration |
| `className` | `string` | Extra CSS class name |
| `keyboardNav` | `boolean` | Enable keyboard navigation with arrow keys (default: true) |
| `children` | `unknown` | Children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
