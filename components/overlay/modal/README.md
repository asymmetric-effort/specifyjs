# Modal

**Category:** Overlay  
**Path:** `components/overlay/modal`

## Overview

Dialog overlay with backdrop, focus trap, and scroll lock.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `open` | `boolean` (required) | Whether the modal is open |
| `onClose` | `() => void` (required) | Called when the modal requests to close |
| `title` | `string` | Modal title rendered in the header |
| `size` | `ModalSize` | Modal width preset |
| `closeOnOverlay` | `boolean` | Close when clicking the overlay backdrop (default true) |
| `closeOnEscape` | `boolean` | Close when pressing Escape (default true) |
| `footer` | `unknown` | Footer slot content |
| `showCloseButton` | `boolean` | Show the X close button in the header (default true) |
| `children` | `unknown` | Modal body children |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
