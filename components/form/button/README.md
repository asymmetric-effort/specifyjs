# Button

**Category:** Form  
**Path:** `components/form/button`

## Overview

A configurable, accessible button component.
Supports variants (primary, secondary, outline, ghost, danger),
sizes (sm, md, lg), disabled state, and full-width mode.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `children` | `unknown` | Button label / children |
| `onClick` | `(e: Event) => void` | Click handler |
| `variant` | `'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'` | Visual variant |
| `size` | `'sm' | 'md' | 'lg'` | Size |
| `disabled` | `boolean` | Disabled state |
| `fullWidth` | `boolean` | Full width |
| `type` | `'button' | 'submit' | 'reset'` | HTML type attribute |
| `className` | `string` | Custom className |
| `style` | `Record<string, string>` | Custom inline style overrides |
| `ariaLabel` | `string` | Accessible label (when children is an icon) |
| `active` | `boolean` | Whether button is in active/toggled state |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
