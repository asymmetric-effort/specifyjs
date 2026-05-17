# WindowManager

Context-based provider component that manages the state of multiple window
instances: positions, sizes, z-order, focus, minimized/maximized state.

Exposes an imperative API via context for opening, closing, focusing, and
arranging windows.

## Usage

```ts
import { createElement } from 'specifyjs';
import { WindowManagerProvider, useWindowManager } from '@specifyjs/layout-window-manager';

function App() {
  return createElement(WindowManagerProvider, null,
    createElement(Desktop, null),
  );
}

function Desktop() {
  const { openWindow, windows } = useWindowManager();
  // ...
}
```

## API

- `WindowManagerProvider` -- wraps children and provides window management context
- `useWindowManager()` -- hook to access context from any descendant

### Context Methods

- `openWindow(config)` -- open or focus a window
- `closeWindow(id)` -- close and remove a window
- `focusWindow(id)` -- raise to top z-index
- `minimizeWindow(id)` -- minimize a window
- `maximizeWindow(id)` -- maximize a window
- `restoreWindow(id)` -- restore from minimized/maximized
- `moveWindow(id, position)` -- update position
- `resizeWindow(id, size)` -- update size
- `tileWindows()` -- arrange in grid
- `cascadeWindows()` -- stack with offset
- `minimizeAll()` -- minimize all windows
