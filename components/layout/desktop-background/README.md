# DesktopBackground

**Category:** Layout  
**Path:** `components/layout/desktop-background`

## Overview

Full-area container component that serves as the workspace background for a desktop layout.
Provides a configurable background (color, gradient, or image), right-click context menu
integration, and acts as the drop zone for window placement.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `backgroundColor` | `string` | Background color (default: '#2c001e') |
| `backgroundGradient` | `string` | CSS gradient string, overrides backgroundColor if set |
| `backgroundImage` | `string` | Background image URL, rendered with cover/center |
| `backgroundImageOpacity` | `number` | Image opacity 0-1 (default: 1) |
| `contextMenuItems` | `ContextMenuItem[]` | Context menu items shown on right-click |
| `onClick` | `() => void` | Called when background itself is clicked (not children) |
| `onDoubleClick` | `() => void` | Called when background is double-clicked |
| `children` | `unknown` | Content rendered on top of the background |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
