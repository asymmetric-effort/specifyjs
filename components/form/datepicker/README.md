# DatePicker

**Category:** Form  
**Path:** `components/form/datepicker`

## Overview

Calendar dropdown date picker.
Features month/year navigation, day grid, today highlight,
selected date highlight, min/max date constraints.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `Date | string | null` (required) | Current value (Date object or 'YYYY-MM-DD' string) |
| `onChange` | `(value: string) => void` (required) | Change handler, receives ISO date string |
| `format` | `string` | Display format (default 'YYYY-MM-DD') |
| `minDate` | `Date | string` | Earliest selectable date |
| `maxDate` | `Date | string` | Latest selectable date |
| `disabled` | `boolean` | Disabled state |
| `placeholder` | `string` | Placeholder text |
| `label` | `string` | Label text |
| `error` | `string` | Error message |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
