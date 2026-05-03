# Breadcrumb

**Category:** Navigation  
**Path:** `components/nav/breadcrumb`

## Overview

A breadcrumb trail navigation component.
Renders an ordered list of navigation links with configurable separators,
collapsible middle items, and proper ARIA semantics for accessibility.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `BreadcrumbItem[]` (required) | Ordered list of breadcrumb items (first = root, last = current page) |
| `separator` | `string | unknown` | Separator between items (default: '/') |
| `maxItems` | `number` | When set, collapses middle items to '...' if items exceed this count |
| `size` | `BreadcrumbSize` | Size variant (default: 'md') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
