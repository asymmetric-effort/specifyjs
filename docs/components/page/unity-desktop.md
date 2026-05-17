# UnityDesktop

Configurable top-level layout that assembles the Ubuntu Unity desktop environment from reusable sub-components: SystemTray (top panel), Dock (left launcher), DesktopBackground (workspace), and WindowManager (context provider for window state). Includes toast notifications and automatic dock-to-window integration.

## Import

```ts
import { UnityDesktop } from 'specifyjs/components/page/unity-desktop';
import { UnityApp } from 'specifyjs/components/page/unity-desktop';
import type { UnityDesktopProps, UnityDesktopApp, UnityDesktopUser, UnityAppProps } from 'specifyjs/components/page/unity-desktop';
```

## Props

### UnityDesktopProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `apps` | `UnityDesktopApp[]` | *required* | Application definitions for the dock launcher |
| `user` | `UnityDesktopUser` | `undefined` | User info for the system tray |
| `onAppOpen` | `(appId: string) => void` | `undefined` | Called when an app icon is clicked in the dock |
| `onLogout` | `() => void` | `undefined` | Called when the user selects logout from the user menu |
| `theme` | `'dark' \| 'light'` | `'dark'` | Color theme |
| `children` | `unknown` | -- | UnityApp windows render here |

### UnityDesktopApp

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` | Unique application identifier |
| `icon` | `string` | Icon URL or emoji |
| `label` | `string` | Application display name |

### UnityDesktopUser

| Property | Type | Description |
|----------|------|-------------|
| `name` | `string` | Display name |
| `avatar` | `string \| undefined` | Avatar URL |

### UnityAppProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `id` | `string` | *required* | Unique identifier for this app window |
| `title` | `string` | *required* | Window title |
| `icon` | `string` | `undefined` | Optional icon (URL or emoji) |
| `defaultPosition` | `{ x: number; y: number }` | `undefined` | Default position when first opened |
| `defaultSize` | `{ width: number; height: number }` | `undefined` | Default size when first opened |
| `minSize` | `{ width: number; height: number }` | `undefined` | Minimum size constraints |
| `resizable` | `boolean` | `true` | Whether the window can be resized |
| `onClose` | `() => void` | `undefined` | Called when the window is closed |
| `children` | `unknown` | -- | Application content |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { UnityDesktop, UnityApp } from 'specifyjs/components/page/unity-desktop';

const desktop = createElement(
  UnityDesktop,
  {
    apps: [
      { id: 'files', icon: '/icons/files.svg', label: 'Files' },
      { id: 'browser', icon: '/icons/browser.svg', label: 'Browser' },
      { id: 'terminal', icon: '/icons/terminal.svg', label: 'Terminal' },
      { id: 'settings', icon: '/icons/settings.svg', label: 'Settings' },
    ],
    user: { name: 'Claude', avatar: '/avatar.png' },
    onAppOpen: (id) => console.log('Opened:', id),
    onLogout: () => console.log('Logout'),
    theme: 'dark',
  },
  // UnityApp children register themselves with the WindowManager
  createElement(UnityApp, {
    id: 'files',
    title: 'Files',
    icon: '/icons/files.svg',
    defaultSize: { width: 700, height: 500 },
  }, createElement('div', null, 'File manager content')),
  createElement(UnityApp, {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/terminal.svg',
    defaultSize: { width: 600, height: 400 },
  }, createElement('div', null, 'Terminal content')),
);
```

## Features

- **Integrated WindowManager** -- UnityDesktop wraps its children in a `WindowManagerProvider`. All window state (position, size, focus, z-order) is managed automatically.
- **Dock integration** -- clicking a dock icon opens the app window or focuses it if already open. Minimized windows are restored on click. Running apps show an active indicator dot.
- **SystemTray** -- displays the focused window title, Activities button, 24h clock with date, and user menu with logout option.
- **DesktopBackground** -- aubergine gradient (dark theme) or light gradient (light theme) fills the workspace.
- **Toast notifications** -- auto-dismiss notifications with info/warning/error severity levels. Toasts appear in the top-right corner and dismiss on click or after 5 seconds.
- **Theme support** -- `dark` and `light` themes affect the dock, background, and panel colors.

## Architecture

UnityDesktop composes these sub-components:

1. **WindowManagerProvider** -- wraps everything, providing window state context.
2. **SystemTray** -- top panel (28px height) with clock, app name, and user menu.
3. **Dock** -- left launcher (vertical, 36px icons) with items derived from the `apps` prop.
4. **DesktopBackground** -- fills the remaining workspace area.
5. **UnityApp** (children) -- each child self-registers with the WindowManager and renders as a DraggableWindow.

### UnityApp behavior

UnityApp is a thin wrapper around DraggableWindow that integrates with the WindowManager context:

- On first render, it calls `openWindow()` to register itself if not already tracked.
- Close, minimize, maximize, move, and resize events are forwarded to the WindowManager.
- The maximize button toggles between maximized and normal state.
- Window state (position, size, focus, z-index) is driven by the WindowManager.

## Variants

### Light theme

```ts
createElement(UnityDesktop, {
  apps: [...],
  theme: 'light',
}, ...children);
```

### Minimal (no user menu)

```ts
createElement(UnityDesktop, {
  apps: [...],
  theme: 'dark',
}, ...children);
```

## Accessibility

- The dock sidebar renders as a `<div>` with `role="toolbar"` and `aria-label="Application launcher"`.
- The top panel uses `role="menubar"` with `aria-label="System panel"`.
- The main desktop area uses a `<main>` element for landmark navigation.
- Each UnityApp window has `role="dialog"` with `aria-label` set to the window title.
- Toast notifications use `role="alert"` with `aria-live="polite"`.
