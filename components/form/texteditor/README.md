# TextEditor

**Category:** Form  
**Path:** `components/form/texteditor`

## Overview

Simple WYSIWYG rich text editor using contentEditable.
Provides a toolbar with basic formatting commands (bold, italic, underline,
lists, headings, links) and a contentEditable editing area. Zero
dependencies — uses document.execCommand for formatting.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `value` | `string` | Initial HTML content |
| `onChange` | `(html: string) => void` | Change handler — receives HTML string |
| `onBlur` | `(html: string) => void` | Blur handler |
| `placeholder` | `string` | Placeholder text |
| `minHeight` | `string` | Minimum height of editing area (default: '200px') |
| `maxHeight` | `string` | Maximum height (default: none — grows to fit) |
| `readOnly` | `boolean` | Read-only |
| `disabled` | `boolean` | Disabled |
| `toolbar` | `ToolbarButton[]` | Which toolbar buttons to show (default: all) |
| `id` | `string` | HTML id |
| `toolbarStyle` | `{` |  |
| `backgroundColor` | `string` |  |
| `borderBottom` | `string` |  |
| `buttonColor` | `string` |  |
| `buttonHoverBackground` | `string` |  |
| `buttonActiveBackground` | `string` |  |
| `buttonSize` | `string` |  |
| `editorStyle` | `{` |  |
| `padding` | `string` |  |
| `backgroundColor` | `string` |  |
| `color` | `string` |  |
| `fontFamily` | `string` |  |
| `fontSize` | `string` |  |
| `lineHeight` | `string` |  |
| `label` | `string` |  |
| `helpText` | `string` |  |
| `error` | `string` |  |
| `required` | `boolean` |  |
| `wrapperStyle` | `FormFieldWrapperStyle` |  |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
