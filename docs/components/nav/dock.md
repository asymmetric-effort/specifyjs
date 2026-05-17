# Dock

Application launcher bar component. A configurable vertical or horizontal icon bar that displays application launchers with active/running indicators, badges, tooltips, and click-to-open behavior. Inspired by the Ubuntu Unity launcher and macOS dock.

## Import

```ts
import { Dock } from 'specifyjs/components/nav/dock';
import type { DockProps, DockItem } from 'specifyjs/components/nav/dock';
```

## Props

### DockProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `items` | `DockItem[]` | *required* | The dock items to display |
| `orientation` | `'vertical' \| 'horizontal'` | `'vertical'` | Orientation of the dock |
| `position` | `'left' \| 'right' \| 'top' \| 'bottom'` | `'left'` | Position on the screen edge |
| `iconSize` | `number` | `36` | Icon size in pixels |
| `autoHide` | `boolean` | `false` | Whether to auto-hide the dock (slides out on hover, hidden otherwise) |
| `showTrailingSeparator` | `boolean` | `false` | Whether to show a separator before the last item |
| `onItemClick` | `(id: string) => void` | `undefined` | Called when a dock item is clicked |
| `onItemContextMenu` | `(id: string, event: { x: number; y: number }) => void` | `undefined` | Called when a dock item is right-clicked |
| `children` | `unknown` | -- | Extra children rendered at the end of the dock |

### DockItem

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `id` | `string` | *required* | Unique identifier for this dock entry |
| `icon` | `string` | *required* | Icon source -- URL to an image/SVG, or an emoji/text character |
| `label` | `string` | *required* | Tooltip label shown on hover |
| `active` | `boolean` | `false` | Whether this item's application is currently running. Displays a dot indicator. |
| `badge` | `number` | `undefined` | Optional badge count (e.g., unread messages). Renders a number badge on the icon. |
| `disabled` | `boolean` | `false` | Whether this icon is disabled (greyed out, non-clickable) |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { Dock } from 'specifyjs/components/nav/dock';

const dock = createElement(Dock, {
  items: [
    { id: 'files', icon: '/icons/files.svg', label: 'Files', active: true },
    { id: 'browser', icon: '/icons/browser.svg', label: 'Browser' },
    { id: 'terminal', icon: '/icons/terminal.svg', label: 'Terminal', badge: 3 },
    { id: 'settings', icon: '/icons/settings.svg', label: 'Settings' },
  ],
  orientation: 'vertical',
  position: 'left',
  iconSize: 36,
  onItemClick: (id) => console.log('Clicked:', id),
});
```

## Features

- **Active indicators** -- running applications show a small dot adjacent to the icon (position-aware based on dock edge).
- **Badge counts** -- items display a red number badge for notification counts. Counts above 99 show "99+".
- **Hover tooltips** -- hovering over an item shows a positioned tooltip with the item label. Tooltip placement is opposite to the dock edge.
- **Auto-hide mode** -- the dock slides off-screen when not hovered, with a thin trigger strip along the edge.
- **Trailing separator** -- a visual divider before the last item (useful for a "Show Applications" grid button).
- **Context menu support** -- right-clicking an item calls `onItemContextMenu` with the item ID and cursor position.
- **Keyboard navigation** -- arrow keys navigate between items in the dock. Home/End jump to first/last item. Enter/Space activates.
- **Hover scale effect** -- items scale up slightly (1.1x) with a background highlight on hover.

## Variants

### Horizontal bottom dock

```ts
createElement(Dock, {
  items: [...],
  orientation: 'horizontal',
  position: 'bottom',
  iconSize: 48,
  onItemClick: handleClick,
});
```

### Auto-hide dock

```ts
createElement(Dock, {
  items: [...],
  autoHide: true,
  position: 'left',
  onItemClick: handleClick,
});
```

### Dock with trailing separator

```ts
createElement(Dock, {
  items: [
    { id: 'files', icon: 'F', label: 'Files', active: true },
    { id: 'browser', icon: 'B', label: 'Browser' },
    { id: 'grid', icon: '::::', label: 'Show Applications' },
  ],
  showTrailingSeparator: true,
  onItemClick: handleClick,
});
```

## Accessibility

- The dock container has `role="toolbar"` and `aria-label="Application launcher"` with `aria-orientation` reflecting the layout direction.
- Each item is rendered as a `<button>` with an `aria-label` that includes the item label and badge count (e.g., "Terminal, 3 unread").
- Active state is communicated via `aria-pressed`.
- Disabled items have `aria-disabled="true"` and `tabIndex={-1}`.
- Arrow-key keyboard navigation (Up/Down for vertical, Left/Right for horizontal) with Home and End support.
- Tooltips use `role="tooltip"`.
- Separators have `role="separator"` and `aria-hidden="true"`.
