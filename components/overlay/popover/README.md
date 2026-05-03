# Popover

**Category:** Overlay  
**Path:** `components/overlay/popover`

## Overview

Positioned popover attached to a trigger element.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `trigger` | `unknown` (required) | Trigger element slot |
| `content` | `unknown` (required) | Popover content slot |
| `open` | `boolean` | Controlled open state (if provided, disables auto-toggle) |
| `placement` | `PopoverPlacement` | Placement relative to trigger |
| `offset` | `number` | Offset from trigger in px |
| `arrow` | `boolean` | Show an arrow pointing to the trigger |
| `closeOnClickOutside` | `boolean` | Close when clicking outside the popover |
| `onOpenChange` | `(open: boolean) => void` | Callback when open state changes (for controlled mode) |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
