# Card

**Category:** Layout  
**Path:** `components/layout/card`

## Overview

Content card with header, body, and footer slots.
Supports an optional top image, title/subtitle header with an action slot,
a body area (children), and a footer slot. Configurable border, shadow,
hover effect, padding, and border radius.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `title` | `string` | Card title displayed in the header |
| `subtitle` | `string` | Subtitle shown below the title |
| `headerAction` | `unknown` | Slot rendered at the trailing edge of the header (e.g. action button) |
| `footer` | `unknown` | Slot rendered as the card footer |
| `image` | `string` | URL for a top image |
| `imageAlt` | `string` | Alt text for the top image |
| `hoverable` | `boolean` | Enable hover elevation effect (default: false) |
| `bordered` | `boolean` | Show border (default: true) |
| `shadow` | `'none' | 'sm' | 'md' | 'lg'` | Shadow level: 'none' | 'sm' | 'md' | 'lg' (default: 'sm') |
| `padding` | `string` | Inner padding (CSS value, default: '16px') |
| `borderRadius` | `string` | Border radius (CSS value, default: '8px') |
| `style` | `Record<string, string>` | Extra inline styles |
| `className` | `string` | Extra class name |
| `children` | `unknown` | Body content |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
