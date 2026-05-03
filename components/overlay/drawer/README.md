# Drawer

**Category:** Overlay  
**Path:** `components/overlay/drawer`

## Overview

Slide-in panel from any edge with optional overlay backdrop.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` (required) | Whether the drawer is open |
| `onClose` | `() => void` (required) | Called when the drawer requests to close |
| `position` | `DrawerPosition` | Edge the drawer slides in from |
| `size` | `string` | Width (left/right) or height (top/bottom) in px or % |
| `title` | `string` | Drawer title |
| `overlay` | `boolean` | Show overlay backdrop behind the drawer |
| `closeOnOverlay` | `boolean` | Close when clicking the overlay |
| `closeOnEscape` | `boolean` | Close on Escape key |
| `children` | `unknown` | Drawer body children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
