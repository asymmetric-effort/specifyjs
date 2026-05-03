# TimePicker

**Category:** Form  
**Path:** `components/form/timepicker`

## Overview

Time selection component with hour/minute/seconds selectors,
AM/PM toggle for 12-hour format, and optional timezone selector.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` (required) | Current value in 'HH:MM' or 'HH:MM:SS' format (24h) |
| `onChange` | `(value: string) => void` (required) | Change handler, receives 'HH:MM' or 'HH:MM:SS' string in 24h format |
| `format` | `'12h' | '24h'` | Display format |
| `minuteStep` | `number` | Minute increment step |
| `disabled` | `boolean` | Disabled state |
| `label` | `string` | Label text |
| `error` | `string` | Error message |
| `showSeconds` | `boolean` | When true, show a seconds spinner (default false) |
| `timezone` | `string` | If provided, display a timezone label next to the time |
| `showTimezone` | `boolean` | When true, show a timezone dropdown selector (default false) |
| `timezones` | `string[]` | List of timezone strings for the dropdown |
| `onTimezoneChange` | `(tz: string) => void` | Callback when timezone changes |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
