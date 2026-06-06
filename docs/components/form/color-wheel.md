# ColorWheel

A color picker component that renders a native color input wrapped in a styled swatch. Displays the selected color as a visual preview and optionally shows the hex value below.

## Import

```ts
import { ColorWheel } from '@aspect/form/color-wheel';
import type { ColorWheelProps } from '@aspect/form/color-wheel';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | `'#000000'` | Current color value as a hex string |
| `onChange` | `(color: string) => void` | `undefined` | Called when the color changes |
| `size` | `number` | `32` | Swatch size in pixels |
| `showLabel` | `boolean` | `true` | Whether to show the hex label below the swatch |
| `disabled` | `boolean` | `false` | Disabled state |
| `label` | `string` | `undefined` | Label text displayed above the color input via FormFieldWrapper |
| `id` | `string` | auto-generated | HTML id for the input element |

## Usage

```ts
import { createElement } from 'specifyjs';
import { ColorWheel } from '@aspect/form/color-wheel';

// Basic color picker
const picker = createElement(ColorWheel, {
  value: '#3b82f6',
  onChange: (color) => console.log('Selected:', color),
});

// With label and larger swatch
const labeled = createElement(ColorWheel, {
  label: 'Background Color',
  value: currentColor,
  onChange: setColor,
  size: 48,
});

// Without hex label
const minimal = createElement(ColorWheel, {
  value: '#ef4444',
  onChange: handleColorChange,
  showLabel: false,
});

// Disabled state
const disabled = createElement(ColorWheel, {
  value: '#cccccc',
  disabled: true,
});
```

## Features

- Renders a native `<input type="color">` inside a styled swatch container for a consistent visual appearance.
- The swatch background updates in real time to reflect the selected color.
- Hex color value is displayed below the swatch in monospace font when `showLabel` is enabled.
- Wraps content in a `FormFieldWrapper` for consistent label rendering.
- Generates a unique `id` via `useId` when none is provided, ensuring label-input association.

## Accessibility

- The hidden color input receives an `aria-label` set to the `label` prop value, or `'Color'` as a fallback.
- The `label` prop is rendered via `FormFieldWrapper` with a proper `htmlFor` association to the input.
- Disabled state applies `cursor: not-allowed` to both the swatch and the input.
