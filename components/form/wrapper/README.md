# FormFieldWrapper

**Category:** Form  
**Path:** `components/form/wrapper`

## Overview

Base container for all data-entry / form components.
Provides consistent label, help text, error display, required indicator,
and styling. Foundation for textfield, multiline, texteditor, etc.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `label` | `string` | Label text |
| `htmlFor` | `string` | HTML id to link label to input via htmlFor |
| `helpText` | `string` | Help / description text shown below the field |
| `error` | `string` | Error message — when set, field enters error state |
| `required` | `boolean` | Show required asterisk (default: false) |
| `disabled` | `boolean` | Disabled state (default: false) |
| `styling` | `FormFieldWrapperStyle` | Styling |
| `className` | `string` | Extra class |
| `children` | `unknown` | The form control (children) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
