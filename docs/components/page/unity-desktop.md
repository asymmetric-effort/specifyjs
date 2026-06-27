# UnityDesktop

Configurable top-level layout that assembles the Ubuntu Unity desktop environment from reusable sub-components: SystemTray (top panel), Dock (left launcher), DesktopBackground (workspace), and WindowManager (context provider for window state). Includes toast notifications, lock screen, and automatic dock-to-window integration.

## Import

```ts
import { UnityDesktop, UnityApp } from 'specifyjs/components/page/unity-desktop';
import type {
  UnityDesktopProps,
  UnityDesktopApp,
  UnityDesktopUser,
  UnityAppProps,
} from 'specifyjs/components/page/unity-desktop';
```

## Props

### UnityDesktopProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apps` | `UnityDesktopApp[]` | *required* | Application definitions for the dock launcher |
| `user` | `UnityDesktopUser` | `undefined` | User info for the system tray |
| `onAppOpen` | `(appId: string) => void` | `undefined` | Called when an app icon is clicked in the dock |
| `onLogout` | `() => void` | `undefined` | Called when the user selects Logout from the user menu |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `children` | `unknown` | -- | UnityApp windows render here |

### UnityDesktopApp

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique application identifier (used as the window ID in WindowManager) |
| `icon` | `string` | Icon — URL to an image/SVG, or an emoji/text character |
| `label` | `string` | Application display name (shown in dock tooltip, window title bar, Activities grid) |

### UnityDesktopUser

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Display name shown in the system tray |
| `avatar` | `string \| undefined` | Avatar URL (falls back to first letter of name) |

### UnityAppProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | *required* | Must match an `id` in the `apps` array |
| `title` | `string` | *required* | Window title bar text |
| `icon` | `string` | `undefined` | Window title bar icon |
| `defaultPosition` | `{ x: number; y: number }` | auto-cascade | Initial window position |
| `defaultSize` | `{ width: number; height: number }` | `600x400` | Initial window size |
| `minSize` | `{ width: number; height: number }` | `200x150` | Minimum resize constraints |
| `resizable` | `boolean` | `true` | Whether the window can be resized |
| `onClose` | `() => void` | `undefined` | Called when the window close button is clicked |
| `children` | `unknown` | -- | Your application content |

---

## Building Applications with UnityDesktop

### Architecture Overview

UnityDesktop is a **container** — it provides the desktop shell (panel, dock, window management, background). Your application code lives inside `UnityApp` children. The desktop does not control what your apps render; you do.

```
UnityDesktop (shell)
├── SystemTray (top panel — clock, user menu, Activities)
├── Dock (left launcher — icons from apps[])
├── WindowManager (context — tracks open windows)
├── DesktopBackground (workspace area)
│   ├── UnityApp (your app window 1)
│   │   └── <YourComponent /> ← you control this
│   ├── UnityApp (your app window 2)
│   │   └── <YourComponent /> ← you control this
│   └── ...
```

### Pattern 1: Static Windows (Always Open)

The simplest pattern — pass `UnityApp` children directly. Each one registers with the WindowManager on mount and appears as a draggable window.

```ts
createElement(UnityDesktop, {
  apps: [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'logs', icon: '📋', label: 'Logs' },
  ],
  user: { name: 'Operator' },
},
  createElement(UnityApp, {
    id: 'dashboard',
    title: 'Dashboard',
    defaultSize: { width: 800, height: 600 },
  },
    createElement(DashboardView, null),
  ),
  createElement(UnityApp, {
    id: 'logs',
    title: 'Logs',
    defaultSize: { width: 600, height: 400 },
  },
    createElement(LogViewer, null),
  ),
);
```

Both windows appear immediately. The user can move, resize, minimize, maximize, and close them. Clicking a dock icon focuses/restores the window.

### Pattern 2: Dynamic Windows (Open on Dock Click)

For apps that should only appear when the user clicks a dock icon, use `onAppOpen` to manage which apps are visible:

```ts
function MyDesktop() {
  const [openApps, setOpenApps] = useState<string[]>([]);

  const handleAppOpen = useCallback((appId: string) => {
    setOpenApps((prev: string[]) => {
      if (prev.includes(appId)) return prev; // already open
      return [...prev, appId];
    });
  }, []);

  const handleAppClose = useCallback((appId: string) => {
    setOpenApps((prev: string[]) => prev.filter((id: string) => id !== appId));
  }, []);

  return createElement(UnityDesktop, {
    apps: [
      { id: 'editor', icon: '✏️', label: 'Editor' },
      { id: 'terminal', icon: '💻', label: 'Terminal' },
      { id: 'browser', icon: '🌐', label: 'Browser' },
    ],
    user: { name: 'Developer' },
    onAppOpen: handleAppOpen,
  },
    // Only render UnityApp for apps the user has opened
    ...openApps.map((appId: string) =>
      createElement(UnityApp, {
        key: appId,
        id: appId,
        title: getAppTitle(appId),
        onClose: () => handleAppClose(appId),
      },
        createElement(getAppComponent(appId), null),
      ),
    ),
  );
}
```

### Pattern 3: Shared State Across Apps

Apps can share state via a context provider above the UnityDesktop:

```ts
const ProjectContext = createContext<ProjectState>(defaultState);

function OperatorConsole() {
  const [project, setProject] = useState(defaultState);

  return createElement(
    ProjectContext.Provider,
    { value: project },
    createElement(UnityDesktop, {
      apps: [
        { id: 'projects', icon: '📁', label: 'Projects' },
        { id: 'monitor', icon: '📡', label: 'Monitor' },
      ],
    },
      createElement(UnityApp, { id: 'projects', title: 'Projects' },
        // ProjectList can call setProject via context
        createElement(ProjectList, null),
      ),
      createElement(UnityApp, { id: 'monitor', title: 'Monitor' },
        // MonitorView reads project from context
        createElement(MonitorView, null),
      ),
    ),
  );
}
```

This is the recommended pattern for apps that need to communicate. The desktop itself does not provide cross-app state — that is an application concern, implemented with SpecifyJS's Context API.

### Pattern 4: Accessing the WindowManager

Any component rendered inside UnityDesktop can access the window manager via the `useWindowManager` hook:

```ts
import { useWindowManager } from 'specifyjs/components/layout/window-manager';

function MyApp() {
  const wm = useWindowManager();

  return createElement('div', null,
    createElement('button', {
      onClick: () => wm.openWindow({
        id: 'new-window',
        title: 'Spawned Window',
      }),
    }, 'Open New Window'),
    createElement('button', {
      onClick: () => wm.tileWindows(),
    }, 'Tile All'),
    createElement('button', {
      onClick: () => wm.minimizeAll(),
    }, 'Minimize All'),
  );
}
```

Available methods: `openWindow`, `closeWindow`, `focusWindow`, `minimizeWindow`, `maximizeWindow`, `restoreWindow`, `moveWindow`, `resizeWindow`, `tileWindows`, `cascadeWindows`, `minimizeAll`.

---

## Built-in Features

### User Menu (Lock & Logout)

The user menu always includes **Lock** and **Logout** items:

- **Lock** — renders a translucent overlay over the entire desktop, preventing interaction. Click the overlay to unlock.
- **Logout** — calls the `onLogout` prop callback. The consuming application is responsible for handling the logout (e.g., clearing session, redirecting).

### Activities Grid

Clicking the **Activities** button in the top panel opens a full-screen grid overlay showing all registered apps. Clicking an app in the grid opens/focuses its window and dismisses the overlay.

### Right-Click Context Menu

Right-clicking a dock icon opens a context menu with:
- The app label
- **About** — shows a dialog with the app name, description, and license

### Toast Notifications

The desktop includes a built-in toast notification system. Toasts appear in the top-right corner and auto-dismiss after 5 seconds.

---

## Sub-Components

UnityDesktop composes these independently reusable components:

| Component | Path | Docs |
|-----------|------|------|
| DraggableWindow | `components/layout/draggable-window` | [draggable-window.md](../layout/draggable-window.md) |
| WindowManager | `components/layout/window-manager` | [window-manager.md](../layout/window-manager.md) |
| Dock | `components/nav/dock` | [dock.md](../nav/dock.md) |
| SystemTray | `components/nav/system-tray` | [system-tray.md](../nav/system-tray.md) |
| DesktopBackground | `components/layout/desktop-background` | [desktop-background.md](../layout/desktop-background.md) |

Each can be used independently outside of UnityDesktop.

---

## Complete Example

A full operator console with multiple app types:

```ts
import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';
import { UnityDesktop, UnityApp } from 'specifyjs/components/page/unity-desktop';

function OperatorConsole() {
  const [openApps, setOpenApps] = useState<string[]>([]);

  const apps = [
    { id: 'dashboard', icon: '📊', label: 'Dashboard' },
    { id: 'agents', icon: '🤖', label: 'Agent Monitor' },
    { id: 'console', icon: '💻', label: 'Console' },
    { id: 'logs', icon: '📋', label: 'Log Viewer' },
  ];

  const handleOpen = useCallback((id: string) => {
    setOpenApps((prev: string[]) =>
      prev.includes(id) ? prev : [...prev, id],
    );
  }, []);

  const handleClose = useCallback((id: string) => {
    setOpenApps((prev: string[]) =>
      prev.filter((a: string) => a !== id),
    );
  }, []);

  const handleLogout = useCallback(() => {
    window.location.href = '/logout';
  }, []);

  const appContent: Record<string, () => unknown> = {
    dashboard: () => createElement(DashboardView, null),
    agents: () => createElement(AgentMonitor, null),
    console: () => createElement(ConsoleTerminal, null),
    logs: () => createElement(LogViewer, null),
  };

  return createElement(UnityDesktop, {
    apps,
    user: { name: 'Operator', avatar: '/avatar.png' },
    onAppOpen: handleOpen,
    onLogout: handleLogout,
    theme: 'dark',
  },
    ...openApps.map((id: string) => {
      const app = apps.find((a) => a.id === id)!;
      return createElement(UnityApp, {
        key: id,
        id,
        title: app.label,
        icon: app.icon,
        defaultSize: { width: 800, height: 600 },
        onClose: () => handleClose(id),
      },
        appContent[id]!(),
      );
    }),
  );
}
```

## Accessibility

- Dock: `role="toolbar"`, `aria-label="Application launcher"`, keyboard navigable (arrow keys)
- Top panel: `role="menubar"`, `aria-label="System panel"`
- Desktop: `<main>` landmark element
- Each window: `role="dialog"`, `aria-label="{title}"`
- Toasts: `role="alert"`, `aria-live="polite"`
- Lock overlay prevents focus from reaching desktop controls
- Activities grid is keyboard accessible (Tab + Enter to select)
