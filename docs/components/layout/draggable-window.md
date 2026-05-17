# DraggableWindow

Desktop-style draggable, resizable window component. Provides window chrome with title bar, window controls (minimize, maximize, close), drag-to-move, 8-direction resize handles, edge snapping, boundary clamping, and focus management.

## Import

```ts
import { DraggableWindow } from 'specifyjs/components/layout/draggable-window';
import type { DraggableWindowProps } from 'specifyjs/components/layout/draggable-window';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | *required* | Unique window identifier |
| `title` | `string` | *required* | Window title displayed in the title bar |
| `icon` | `string` | `undefined` | Optional icon (URL or emoji) displayed left of the title |
| `defaultPosition` | `{ x: number; y: number }` | `{ x: 50, y: 50 }` | Initial position relative to the containing element (pixels) |
| `defaultSize` | `{ width: number; height: number }` | `{ width: 400, height: 300 }` | Initial size (pixels) |
| `minSize` | `{ width: number; height: number }` | `{ width: 200, height: 150 }` | Minimum size constraints (pixels) |
| `maxSize` | `{ width: number; height: number }` | `undefined` | Maximum size constraints (pixels) |
| `resizable` | `boolean` | `true` | Whether the window can be resized |
| `draggable` | `boolean` | `true` | Whether the window can be dragged |
| `windowState` | `'normal' \| 'maximized' \| 'minimized'` | `'normal'` | Current window state |
| `focused` | `boolean` | `true` | Whether the window is currently focused (determines title bar styling) |
| `zIndex` | `number` | `undefined` | Z-index for stacking order |
| `onClose` | `() => void` | `undefined` | Called when the user clicks the close button |
| `onMinimize` | `() => void` | `undefined` | Called when the user clicks the minimize button |
| `onMaximize` | `() => void` | `undefined` | Called when the user clicks the maximize/restore button |
| `onFocus` | `() => void` | `undefined` | Called when the window is clicked (for focus management) |
| `onMove` | `(position: { x: number; y: number }) => void` | `undefined` | Called when the window is moved. Reports final position. |
| `onResize` | `(size: { width: number; height: number }) => void` | `undefined` | Called when the window is resized. Reports final size. |
| `children` | `unknown` | -- | Application content rendered inside the window body |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { DraggableWindow } from 'specifyjs/components/layout/draggable-window';

const window = createElement(
  DraggableWindow,
  {
    id: 'editor',
    title: 'Text Editor',
    icon: '/icons/editor.svg',
    defaultPosition: { x: 100, y: 80 },
    defaultSize: { width: 600, height: 400 },
    onClose: () => console.log('Window closed'),
    onFocus: () => console.log('Window focused'),
  },
  createElement('div', null, 'Window body content'),
);
```

## Features

### Drag-to-move

Drag the title bar to reposition the window. The window is clamped to the parent container bounds.

```ts
createElement(DraggableWindow, {
  id: 'movable',
  title: 'Drag Me',
  onMove: (pos) => console.log('Moved to', pos.x, pos.y),
}, 'Content');
```

### 8-direction resizing

Resize handles on all edges and corners allow proportional resizing. Size is clamped between `minSize` and `maxSize`.

```ts
createElement(DraggableWindow, {
  id: 'resizable',
  title: 'Resize Me',
  minSize: { width: 300, height: 200 },
  maxSize: { width: 800, height: 600 },
  onResize: (size) => console.log('Resized to', size.width, size.height),
}, 'Content');
```

### Edge snapping

Dragging the window to the left or right screen edge snaps it to fill half the workspace. Dragging to the top edge triggers maximize. A blue preview overlay shows the snap zone before release.

### Window states

```ts
// Maximized: fills the entire parent container
createElement(DraggableWindow, {
  id: 'max',
  title: 'Maximized',
  windowState: 'maximized',
  onMaximize: () => console.log('Toggle maximize'),
}, 'Content');

// Minimized: renders nothing (hidden)
createElement(DraggableWindow, {
  id: 'min',
  title: 'Minimized',
  windowState: 'minimized',
}, 'Content');
```

### Window controls

The title bar includes three colored buttons: minimize (orange), maximize/restore (green), and close (red). Double-clicking the title bar also triggers maximize/restore.

### Non-draggable / non-resizable

```ts
createElement(DraggableWindow, {
  id: 'fixed',
  title: 'Fixed Window',
  draggable: false,
  resizable: false,
}, 'Cannot move or resize this window');
```

## Accessibility

- The window container has `role="dialog"` and `aria-label` set to the window title.
- The title bar has `role="toolbar"` with `aria-label` describing the window controls.
- Window control buttons have descriptive `aria-label` attributes ("Minimize", "Maximize", "Restore", "Close").
- The window element has `tabIndex={-1}` for programmatic focus management.
- Pressing `Escape` when the window is focused triggers the `onClose` callback.
- Focus and unfocus states are reflected with distinct shadow and opacity styling.
