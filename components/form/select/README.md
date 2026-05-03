# Select

**Category:** Form  
**Path:** `components/form/select`

## Overview

Custom dropdown select/combobox component.
Renders a custom dropdown (not native <select>): trigger shows selected value,
dropdown panel with option list, keyboard navigation, search filtering,
multiple selection, and clearable support.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `options` | `SelectOption[]` (required) | Available options |
| `value` | `string | string[]` (required) | Current selected value (string for single, string[] for multiple) |
| `onChange` | `(value: string | string[]) => void` (required) | Change handler |
| `placeholder` | `string` | Placeholder text |
| `searchable` | `boolean` | Enable search/filter by typing |
| `multiple` | `boolean` | Allow multiple selection |
| `clearable` | `boolean` | Show clear button |
| `disabled` | `boolean` | Disabled state |
| `error` | `string` | Error message |
| `label` | `string` | Label text |
| `helpText` | `string` | Help text |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
