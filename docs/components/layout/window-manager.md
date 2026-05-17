# WindowManager

Context-based provider that manages multiple window states. Tracks positions, sizes, z-order, focus, and minimized/maximized state. Exposes an imperative API via context for opening, closing, focusing, and arranging windows.

## Import

```ts
import { WindowManagerProvider, useWindowManager } from 'specifyjs/components/layout/window-manager';
import type { WindowManagerProps, WindowManagerContextValue, WindowState } from 'specifyjs/components/layout/window-manager';
```

## Props (WindowManagerProvider)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `workspaceBounds` | `{ top: number; left: number; width: number; height: number }` | `{ top: 0, left: 0, width: 1920, height: 1080 }` | Workspace bounds for tiling and cascade calculations |
| `defaultWindowSize` | `{ width: number; height: number }` | `{ width: 600, height: 400 }` | Default size for new windows |
| `cascadeOffset` | `{ x: number; y: number }` | `{ x: 30, y: 30 }` | Position offset for cascading new windows |
| `onWindowOpen` | `(id: string) => void` | `undefined` | Called when any window is opened |
| `onWindowClose` | `(id: string) => void` | `undefined` | Called when any window is closed |
| `onFocusChange` | `(id: string \| null) => void` | `undefined` | Called when focus changes |
| `children` | `unknown` | -- | Descendant components that consume the window manager context |

## Context API (useWindowManager)

| Method | Signature | Description |
|--------|-----------|-------------|
| `windows` | `WindowState[]` | All currently tracked windows |
| `openWindow` | `(config: { id, title, icon?, position?, size?, appProps? }) => void` | Open a new window or focus it if already open |
| `closeWindow` | `(id: string) => void` | Close and remove a window |
| `focusWindow` | `(id: string) => void` | Raise a window to the top and set it as focused |
| `minimizeWindow` | `(id: string) => void` | Minimize a window |
| `maximizeWindow` | `(id: string) => void` | Maximize a window to fill the workspace |
| `restoreWindow` | `(id: string) => void` | Restore a window from maximized or minimized to normal |
| `moveWindow` | `(id: string, position: { x, y }) => void` | Update a window's position |
| `resizeWindow` | `(id: string, size: { width, height }) => void` | Update a window's size |
| `tileWindows` | `() => void` | Tile all open, non-minimized windows in a grid |
| `cascadeWindows` | `() => void` | Cascade all open, non-minimized windows with offset stacking |
| `minimizeAll` | `() => void` | Minimize all windows |
| `focusedWindowId` | `string \| null` | Currently focused window ID, or null |

## WindowState

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique window identifier |
| `title` | `string` | Window title |
| `icon` | `string \| undefined` | Optional icon |
| `position` | `{ x: number; y: number }` | Current position (pixels) |
| `size` | `{ width: number; height: number }` | Current size (pixels) |
| `windowState` | `'normal' \| 'maximized' \| 'minimized'` | Window display state |
| `zIndex` | `number` | Z-index for stacking order |
| `focused` | `boolean` | Whether this window is currently focused |
| `appProps` | `Record<string, unknown> \| undefined` | Application-specific props |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { WindowManagerProvider, useWindowManager } from 'specifyjs/components/layout/window-manager';

// Wrap your app in the provider
const app = createElement(
  WindowManagerProvider,
  {
    workspaceBounds: { top: 28, left: 48, width: 1872, height: 1052 },
    onFocusChange: (id) => console.log('Focused:', id),
  },
  createElement(MyDesktopContent, null),
);

// Inside a descendant component, use the hook
function MyDesktopContent() {
  const wm = useWindowManager();

  const handleOpen = () => {
    wm.openWindow({
      id: 'editor',
      title: 'Text Editor',
      icon: '/icons/editor.svg',
      size: { width: 800, height: 600 },
    });
  };

  return createElement('button', { onClick: handleOpen }, 'Open Editor');
}
```

## Features

- **Auto-cascade positioning** -- new windows are offset from the previous window to prevent stacking directly on top.
- **Z-order management** -- focusing a window brings it to the top. Z-indices are compacted periodically to prevent overflow.
- **Focus transfer** -- closing or minimizing the focused window automatically focuses the next highest z-order window.
- **Tile mode** -- arranges all non-minimized windows in an adaptive grid layout (1, 2, 3, or NxM grid).
- **Cascade mode** -- offsets all non-minimized windows in stacking order.
- **Minimize all** -- minimizes all windows and clears focus (show desktop).

## Notes

- WindowManagerProvider must wrap any components that use `useWindowManager()`.
- Windows that are already open are focused (not duplicated) when `openWindow` is called with the same `id`.
- The context compacts z-indices when they exceed 1000 to prevent integer overflow in long-running sessions.
