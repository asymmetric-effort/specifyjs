# Dropdown

**Category:** Navigation  
**Path:** `components/nav/dropdown`

## Overview

A dropdown menu navigation component.
Renders a trigger button that toggles a dropdown panel containing
menu items. Supports nested submenus, dividers, icons, disabled
states, and keyboard dismissal.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` (required) | Trigger button text |
| `items` | `DropdownItem[]` (required) | Menu items |
| `triggerStyle` | `Record<string, string>` | Custom styles for the trigger button |
| `menuStyle` | `NavWrapperStyle` | Styling passed to NavWrapper for the dropdown panel |
| `itemStyle` | `NavItemStyle` | Styling for menu items |
| `placement` | `'bottom-start' | 'bottom-end'` | Placement of the dropdown relative to the trigger (default: 'bottom-start') |
| `closeOnSelect` | `boolean` | Close the dropdown when an item is selected (default: true) |
| `width` | `string | number` | Width of the dropdown panel (default: '220px') |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
