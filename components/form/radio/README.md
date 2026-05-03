# RadioGroup

**Category:** Form  
**Path:** `components/form/radio`

## Overview

Radio button group component.
Wraps individual radio buttons with support for horizontal/vertical layout,
keyboard navigation, and error states.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `RadioOption[]` (required) | Available options |
| `value` | `string` (required) | Currently selected value |
| `onChange` | `(value: string) => void` (required) | Change handler |
| `name` | `string` (required) | Name attribute for the radio group |
| `direction` | `'horizontal' | 'vertical'` | Layout direction |
| `disabled` | `boolean` | Disabled state for entire group |
| `error` | `string` | Error message |
| `label` | `string` | Label for the group |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
