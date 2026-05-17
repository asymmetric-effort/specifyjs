# DraggableWindow

**Category:** Layout  
**Path:** `components/layout/draggable-window`

## Overview

Desktop-style draggable, resizable window component with title bar, window controls,
edge snapping, and boundary clamping. Supports normal, maximized, and minimized states.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `id` | `string` | Unique window identifier |
| `title` | `string` | Window title displayed in the title bar |
| `icon` | `string` | Optional icon (URL or emoji) displayed left of the title |
| `defaultPosition` | `{ x: number; y: number }` | Initial position relative to the containing element (pixels) |
| `defaultSize` | `{ width: number; height: number }` | Initial size (pixels) |
| `minSize` | `{ width: number; height: number }` | Minimum size constraints (default: 200x150) |
| `maxSize` | `{ width: number; height: number }` | Maximum size constraints (default: unconstrained) |
| `resizable` | `boolean` | Whether the window can be resized (default: true) |
| `draggable` | `boolean` | Whether the window can be dragged (default: true) |
| `windowState` | `'normal' \| 'maximized' \| 'minimized'` | Current window state |
| `focused` | `boolean` | Whether the window is currently focused |
| `zIndex` | `number` | Z-index for stacking order |
| `onClose` | `() => void` | Called when the user clicks the close button |
| `onMinimize` | `() => void` | Called when the user clicks the minimize button |
| `onMaximize` | `() => void` | Called when the user clicks the maximize/restore button |
| `onFocus` | `() => void` | Called when the window is clicked |
| `onMove` | `(position: { x: number; y: number }) => void` | Called when the window is moved |
| `onResize` | `(size: { width: number; height: number }) => void` | Called when the window is resized |
| `children` | `unknown` | Application content rendered inside the window body |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
