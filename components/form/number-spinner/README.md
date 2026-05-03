# NumberSpinner

**Category:** Form  
**Path:** `components/form/number-spinner`

## Overview

Numeric input with increment/decrement buttons.
Features +/- buttons on sides, keyboard arrow support,
optional prefix/suffix, and min/max clamping.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number` (required) | Current numeric value |
| `onChange` | `(value: number) => void` (required) | Change handler |
| `min` | `number` | Minimum allowed value |
| `max` | `number` | Maximum allowed value |
| `step` | `number` | Step increment |
| `disabled` | `boolean` | Disabled state |
| `prefix` | `string` | Prefix text (e.g. '$') |
| `suffix` | `string` | Suffix text (e.g. 'kg') |
| `label` | `string` | Label text |
| `error` | `string` | Error message |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
