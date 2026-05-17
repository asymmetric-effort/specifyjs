# SystemTray

**Category:** Navigation  
**Path:** `components/nav/system-tray`

## Overview

Horizontal status bar component for the top edge of a desktop layout. Displays the active application name, a real-time clock, system status indicators (icons with optional labels), and a user menu with avatar and name. Inspired by the Ubuntu Unity / GNOME top panel.

## Props

| Prop | Type | Description |
| --- | --- | --- |
| `activeAppName` | `string` | Text shown on the left, typically the active application name |
| `activitiesButton` | `{ label: string; onClick: () => void }` | Optional left-most button |
| `clockFormat` | `'12h' \| '24h'` | Clock format (default: '24h') |
| `showSeconds` | `boolean` | Whether to show seconds in the clock (default: true) |
| `showDate` | `boolean` | Whether to show the date beside the clock (default: true) |
| `indicators` | `SystemTrayIndicator[]` | System status indicators displayed in the right section |
| `user` | `SystemTrayUser` | User profile shown at the far right with avatar and name |
| `userMenuItems` | `Array<{ label: string; icon?: string; onClick: () => void; divider?: boolean }>` | Items in the user dropdown menu |
| `height` | `number` | Panel height in pixels (default: 28) |
| `children` | `unknown` | Additional elements to render in the center area |

## Documentation

See the [SpecifyJS README](https://github.com/asymmetric-effort/specifyjs#readme) for full project documentation.
