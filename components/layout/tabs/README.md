# Tabs

**Category:** Layout  
**Path:** `components/layout/tabs`

## Overview

Tabbed content container.
Renders a tab list with configurable position (top/bottom/left/right) and
visual variant (line/card/pill). Supports keyboard navigation (arrow keys),
disabled tabs, optional icons, and full ARIA tablist/tab/tabpanel roles.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `tabs` | `TabDefinition[]` (required) | Tab definitions |
| `activeTab` | `string` | Controlled active tab id |
| `onChange` | `(tabId: string) => void` | Change handler (receives tab id) |
| `position` | `'top' | 'bottom' | 'left' | 'right'` | Tab list position (default: 'top') |
| `variant` | `'line' | 'card' | 'pill'` | Visual variant (default: 'line') |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
