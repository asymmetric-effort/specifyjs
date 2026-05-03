# Sidebar

**Category:** Navigation  
**Path:** `components/nav/sidebar`

## Overview

Collapsible sidebar navigation component.
Renders a vertical navigation panel with nested sections that expand on click,
badge indicators, icon-only collapsed mode, and tooltip labels when collapsed.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `items` | `SidebarItem[]` (required) | Navigation items |
| `collapsed` | `boolean` | Whether the sidebar is collapsed to icon-only mode |
| `onToggleCollapse` | `() => void` | Called to toggle collapse state |
| `selectedId` | `string` | Currently selected item id |
| `onSelect` | `(id: string) => void` | Called when an item is selected |
| `width` | `string | number` | Expanded width (default: '240px') |
| `collapsedWidth` | `string | number` | Collapsed width (default: '56px') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
