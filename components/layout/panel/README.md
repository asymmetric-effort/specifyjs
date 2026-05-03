# Panel

**Category:** Layout  
**Path:** `components/layout/panel`

## Overview

Collapsible panel with header bar.
Supports a title, optional icon, collapsible body with animated max-height
transition, and a trailing header-right slot. Configurable border and shadow.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Panel title |
| `collapsible` | `boolean` | Whether the panel can be collapsed (default: false) |
| `defaultCollapsed` | `boolean` | Initial collapsed state when collapsible (default: false) |
| `icon` | `unknown` | Icon element rendered before the title |
| `headerRight` | `unknown` | Slot rendered at the trailing edge of the header |
| `bordered` | `boolean` | Show border (default: true) |
| `shadow` | `'none' | 'sm' | 'md'` | Shadow: 'none' | 'sm' | 'md' (default: 'none') |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Body content |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
