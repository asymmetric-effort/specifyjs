# SystemTray

Horizontal status bar for the top edge of a desktop layout. Displays the active application name, a real-time clock, system status indicators (icons with optional labels), and a user menu with avatar and name. Inspired by the Ubuntu Unity / GNOME top panel.

## Import

```ts
import { SystemTray } from 'specifyjs/components/nav/system-tray';
import type { SystemTrayProps, SystemTrayIndicator, SystemTrayUser } from 'specifyjs/components/nav/system-tray';
```

## Props

### SystemTrayProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `activeAppName` | `string` | `undefined` | Text shown on the left -- typically the active application name |
| `activitiesButton` | `{ label: string; onClick: () => void }` | `undefined` | Optional left-most button (e.g., "Activities"). Fires onClick. |
| `clockFormat` | `'12h' \| '24h'` | `'24h'` | Clock format |
| `showSeconds` | `boolean` | `true` | Whether to show seconds in the clock |
| `showDate` | `boolean` | `true` | Whether to show the date beside the clock |
| `indicators` | `SystemTrayIndicator[]` | `undefined` | System status indicators displayed in the right section |
| `user` | `SystemTrayUser` | `undefined` | User profile -- shown at the far right with avatar and name |
| `userMenuItems` | `Array<{ label, icon?, onClick, divider? }>` | `undefined` | Items in the user dropdown menu (shown on click) |
| `height` | `number` | `28` | Panel height in pixels |
| `children` | `unknown` | -- | Additional elements rendered in the center area |

### SystemTrayIndicator

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | *required* | Unique identifier |
| `icon` | `string` | *required* | Icon -- emoji, text character, or image URL |
| `label` | `string` | `undefined` | Optional label shown next to the icon |
| `onClick` | `() => void` | `undefined` | Click handler |

### SystemTrayUser

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `name` | `string` | *required* | Display name |
| `avatar` | `string` | `undefined` | Avatar URL or emoji fallback |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { SystemTray } from 'specifyjs/components/nav/system-tray';

const tray = createElement(SystemTray, {
  activeAppName: 'Text Editor',
  activitiesButton: { label: 'Activities', onClick: () => console.log('Activities') },
  clockFormat: '24h',
  showSeconds: true,
  showDate: true,
  indicators: [
    { id: 'wifi', icon: 'W', label: 'Connected', onClick: () => {} },
    { id: 'volume', icon: 'V', onClick: () => {} },
    { id: 'battery', icon: 'B', label: '85%' },
  ],
  user: { name: 'Claude', avatar: '/avatar.png' },
  userMenuItems: [
    { label: 'Claude', onClick: () => {} },
    { label: '', onClick: () => {}, divider: true },
    { label: 'Settings', icon: 'S', onClick: () => {} },
    { label: 'Log Out', onClick: () => handleLogout() },
  ],
});
```

## Features

- **Activities button** -- a bold, clickable button at the left edge. Highlights on hover.
- **Active app name** -- displays the focused application title with truncation/ellipsis.
- **Real-time clock** -- updates every second. Supports 12h/24h format with optional seconds and date display.
- **Status indicators** -- icon buttons with optional labels. Clickable when `onClick` is provided.
- **User menu** -- avatar circle (image or initial), user name, and dropdown arrow. Click opens a dropdown menu.
- **Dropdown menu** -- positioned below the user button. Supports labels, icons, dividers, and click-to-close behavior. Closes on outside click or Escape key.

## Variants

### Minimal panel (clock only)

```ts
createElement(SystemTray, {
  clockFormat: '12h',
  showSeconds: false,
  showDate: false,
  height: 24,
});
```

### Panel with user menu

```ts
createElement(SystemTray, {
  user: { name: 'Admin' },
  userMenuItems: [
    { label: 'Profile', icon: 'P', onClick: () => {} },
    { label: '', onClick: () => {}, divider: true },
    { label: 'Log Out', onClick: handleLogout },
  ],
});
```

## Accessibility

- The panel container has `role="menubar"` and `aria-label="System panel"`.
- The Activities button and indicator buttons have `aria-label` attributes and are keyboard-focusable.
- The user menu button has `aria-haspopup="true"` and `aria-expanded` reflecting the open state.
- Dropdown menu items have `role="menuitem"`.
- The clock uses `role="timer"` with `aria-live="polite"` for assistive technology updates.
- All interactive elements respond to Enter and Space key activation.
- Outside-click and Escape close the user dropdown.
