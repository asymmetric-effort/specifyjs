# DesktopBackground

Full-area workspace background with configurable color, gradient, or image. Supports right-click context menu integration and click handlers that only fire on direct background clicks (not bubbled from children).

## Import

```ts
import { DesktopBackground } from 'specifyjs/components/layout/desktop-background';
import type { DesktopBackgroundProps } from 'specifyjs/components/layout/desktop-background';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `backgroundColor` | `string` | `'#2c001e'` | Background color (Ubuntu aubergine default) |
| `backgroundGradient` | `string` | `undefined` | CSS gradient string. Overrides `backgroundColor` if provided. |
| `backgroundImage` | `string` | `undefined` | Background image URL. Rendered with cover/center. |
| `backgroundImageOpacity` | `number` | `1` | Background image opacity (0-1). When less than 1, rendered as a separate overlay layer. |
| `contextMenuItems` | `ContextMenuItem[]` | `undefined` | Context menu items shown on right-click of the background. |
| `onClick` | `() => void` | `undefined` | Called when the background itself is clicked (not a child). |
| `onDoubleClick` | `() => void` | `undefined` | Called when the background is double-clicked. |
| `overflow` | `'hidden' \| 'visible' \| 'auto'` | `'visible'` | Overflow behavior. Use `'visible'` (default) when children use `position: absolute` (e.g., DraggableWindow). Use `'hidden'` to clip children at the container bounds. |
| `children` | `unknown` | -- | Content rendered on top of the background |

## Usage

```ts
import { createElement } from 'specifyjs/core';
import { DesktopBackground } from 'specifyjs/components/layout/desktop-background';

const desktop = createElement(
  DesktopBackground,
  {
    backgroundGradient: 'linear-gradient(135deg, #2c001e 0%, #5e2750 50%, #2c001e 100%)',
    onClick: () => console.log('Background clicked'),
  },
  createElement('div', null, 'Desktop icons or windows here'),
);
```

## Features

### Solid color background

```ts
createElement(DesktopBackground, {
  backgroundColor: '#1a1a2e',
}, 'Content');
```

### Gradient background

```ts
createElement(DesktopBackground, {
  backgroundGradient: 'linear-gradient(to bottom, #2c001e, #5e2750)',
}, 'Content');
```

### Background image with opacity

When `backgroundImageOpacity` is less than 1, the image is rendered as a separate absolutely-positioned overlay layer, allowing the color/gradient to show through.

```ts
createElement(DesktopBackground, {
  backgroundColor: '#1a1a1a',
  backgroundImage: '/wallpapers/mountains.jpg',
  backgroundImageOpacity: 0.8,
}, 'Content');
```

### Right-click context menu

Integrates with the ContextMenu overlay component. Items are shown when right-clicking directly on the background.

```ts
createElement(DesktopBackground, {
  contextMenuItems: [
    { label: 'Change Wallpaper', onClick: () => {} },
    { label: 'Display Settings', onClick: () => {} },
    { type: 'separator' },
    { label: 'Open Terminal', onClick: () => {} },
  ],
}, 'Content');
```

### Click filtering

The `onClick` and `onDoubleClick` handlers only fire when clicking the background element directly. Clicks on child elements do not trigger these handlers.

## Accessibility

- The container has `role="application"` and `aria-label="Desktop workspace"`.
- Image overlay layer is marked `aria-hidden="true"` since it is purely decorative.
- Sets `data-theme="dark"` for downstream theming.
- Children are rendered in a relatively-positioned wrapper above the image overlay to ensure correct stacking.
