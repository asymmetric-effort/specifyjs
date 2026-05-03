# Slider

**Category:** Form  
**Path:** `components/form/slider`

## Overview

Custom range slider with support for single and dual handles,
marks/ticks, and value display.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `number | [number, number]` (required) | Current value (number for single, [number, number] for range) |
| `onChange` | `(value: number | [number, number]) => void` (required) | Change handler |
| `min` | `number` | Minimum value |
| `max` | `number` | Maximum value |
| `step` | `number` | Step increment |
| `showValue` | `boolean` | Show current value label above thumb |
| `showTicks` | `boolean` | Show tick marks at each step |
| `disabled` | `boolean` | Disabled state |
| `marks` | `SliderMark[]` | Named marks along the track |
| `range` | `boolean` | Enable range mode (dual handles) |
| `label` | `string` | Label text |
| `error` | `string` | Error message |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
