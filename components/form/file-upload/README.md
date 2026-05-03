# FileUpload

**Category:** Form  
**Path:** `components/form/file-upload`

## Overview

File upload component with drag-and-drop support.
Features a drop zone with drag-over highlight, file list display
with remove buttons and file size formatting.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `onChange` | `(files: File[]) => void` (required) | Change handler, receives array of selected files |
| `accept` | `string` | Accepted file types (e.g. 'image/*,.pdf') |
| `multiple` | `boolean` | Allow multiple file selection |
| `maxSize` | `number` | Maximum file size in bytes |
| `disabled` | `boolean` | Disabled state |
| `label` | `string` | Label text |
| `helpText` | `string` | Help text |
| `id` | `string` | HTML id for the input element |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
