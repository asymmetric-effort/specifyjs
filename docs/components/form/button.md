# Button

A configurable, accessible button component. Supports multiple visual variants, sizes, disabled state, full-width mode, and an active/toggled state.

## Import

```ts
import { Button } from '@aspect/form/button';
import type { ButtonProps } from '@aspect/form/button';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `unknown` | `undefined` | Button label or child elements |
| `onClick` | `(e: Event) => void` | `undefined` | Click handler |
| `variant` | `'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger'` | `'secondary'` | Visual variant |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | Size variant |
| `disabled` | `boolean` | `false` | Disabled state. Reduces opacity and prevents clicks |
| `fullWidth` | `boolean` | `false` | Whether the button spans the full width of its container |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | HTML button type attribute |
| `className` | `string` | `undefined` | Custom CSS class name |
| `style` | `Record<string, string>` | `undefined` | Custom inline style overrides |
| `ariaLabel` | `string` | `undefined` | Accessible label (useful when children is an icon) |
| `active` | `boolean` | `false` | Whether the button is in an active/toggled state |

### Size dimensions

| Size | Padding | Font Size | Border Radius |
|------|---------|-----------|---------------|
| `sm` | 3px 10px | 12px | 4px |
| `md` | 6px 14px | 13px | 6px |
| `lg` | 8px 20px | 15px | 6px |

### Variant colors

| Variant | Background | Text Color | Border |
|---------|-----------|------------|--------|
| `primary` | #3b82f6 | white | #3b82f6 |
| `secondary` | #f8fafc | #0f172a | #d1d5db |
| `outline` | transparent | #0f172a | #d1d5db |
| `ghost` | transparent | #0f172a | transparent |
| `danger` | #ef4444 | white | #ef4444 |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Button } from '@aspect/form/button';

// Basic secondary button
const basic = createElement(Button, {
  onClick: () => console.log('clicked'),
}, 'Click me');

// Primary button
const primary = createElement(Button, {
  variant: 'primary',
  onClick: handleSubmit,
}, 'Submit');

// Danger button, large
const danger = createElement(Button, {
  variant: 'danger',
  size: 'lg',
  onClick: handleDelete,
}, 'Delete');

// Full-width disabled button
const disabled = createElement(Button, {
  variant: 'primary',
  fullWidth: true,
  disabled: true,
  onClick: () => {},
}, 'Loading...');

// Icon button with aria-label
const icon = createElement(Button, {
  variant: 'ghost',
  ariaLabel: 'Close dialog',
  onClick: handleClose,
}, '\u00D7');

// Toggle button with active state
const toggle = createElement(Button, {
  active: isActive,
  onClick: () => setActive(!isActive),
}, 'Bold');
```

## Accessibility

- Renders a native `<button>` element for built-in keyboard and screen reader support.
- `aria-label` prop provides an accessible name when the button content is non-textual (e.g., an icon).
- `aria-pressed` is set to `'true'` when the `active` prop is enabled, indicating a toggle state.
- The `disabled` attribute is set on the native button element when disabled.
- Click handler is removed when disabled, preventing interaction.
