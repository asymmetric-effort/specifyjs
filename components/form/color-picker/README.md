# ColorPicker

**Category:** Form  
**Path:** `components/form/color-picker`

## Overview

Color selection component with swatch grid,
hex input field, and optional preset colors.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` (required) | Current color value as hex string (e.g. '#ff0000') |
| `onChange` | `(value: string) => void` (required) | Change handler, receives hex string |
| `presets` | `string[]` | Preset color swatches |
| `showInput` | `boolean` | Show hex text input |
| `showAlpha` | `boolean` | Show alpha/opacity slider (future: reserved) |
| `disabled` | `boolean` | Disabled state |
| `label` | `string` | Label text |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
