# TextField

**Category:** Form  
**Path:** `components/form/textfield`

## Overview

Single-line text input with FormFieldWrapper.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Current value (controlled) |
| `defaultValue` | `string` | Default value (uncontrolled) |
| `onChange` | `(value: string) => void` | Change handler |
| `onInput` | `(value: string) => void` | Input event handler (fires on every keystroke) |
| `onBlur` | `(value: string) => void` | Blur handler |
| `onEnter` | `(value: string) => void` | Enter key handler |
| `placeholder` | `string` | Placeholder text |
| `type` | `'text' | 'password' | 'email' | 'url' | 'tel' | 'search' | 'number'` | Input type (default: 'text') |
| `name` | `string` | HTML name attribute |
| `id` | `string` | HTML id |
| `maxLength` | `number` | Max length |
| `pattern` | `string` | Pattern for validation |
| `autoComplete` | `string` | Auto-complete hint |
| `autoFocus` | `boolean` | Autofocus on mount |
| `readOnly` | `boolean` | Read-only |
| `disabled` | `boolean` | Disabled |
| `prefix` | `unknown` | Prefix element (icon, text) |
| `suffix` | `unknown` | Suffix element (icon, button) |
| `label` | `string` |  |
| `helpText` | `string` |  |
| `error` | `string` |  |
| `required` | `boolean` |  |
| `wrapperStyle` | `FormFieldWrapperStyle` |  |
| `inputStyle` | `InputBaseStyle` |  |
| `className` | `string` | Extra class on the input |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
