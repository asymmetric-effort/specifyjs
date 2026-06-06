# DigitalClock

A real-time digital clock component with configurable format, timezone, date display, and seconds visibility. Renders with a dark background and monospace font.

## Import

```ts
import { DigitalClock } from '@aspect/data/digital-clock';
import type { DigitalClockProps } from '@aspect/data/digital-clock';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `format` | `'12h' \| '24h'` | `'12h'` | Display format. 12h shows AM/PM indicator |
| `showDate` | `boolean` | `false` | Show date below the time |
| `dateFormat` | `'short' \| 'long' \| 'iso'` | `'short'` | Date format: short (MM/DD/YYYY), long (Month DD, YYYY), or iso (YYYY-MM-DD) |
| `showSeconds` | `boolean` | `true` | Whether to display seconds |
| `timezone` | `string` | `undefined` | IANA timezone string (e.g., `'America/New_York'`). Defaults to local time |
| `className` | `string` | `undefined` | CSS class name for the wrapper element |

## Usage

```ts
import { createElement } from 'specifyjs';
import { DigitalClock } from '@aspect/data/digital-clock';

// Basic 12-hour clock
const clock = createElement(DigitalClock, {});

// 24-hour clock with date
const clock24 = createElement(DigitalClock, {
  format: '24h',
  showDate: true,
  dateFormat: 'long',
});

// Clock for a specific timezone without seconds
const utcClock = createElement(DigitalClock, {
  timezone: 'UTC',
  showSeconds: false,
});

// Compact clock with ISO date
const compact = createElement(DigitalClock, {
  format: '24h',
  showDate: true,
  dateFormat: 'iso',
  showSeconds: false,
});
```

## Features

- Updates every second via `setInterval`.
- 12-hour mode displays hours 1-12 with an AM/PM indicator rendered as a superscript.
- 24-hour mode displays hours 00-23 without a period indicator.
- Time is displayed in a monospace font at 2rem with letter-spacing.
- Dark theme: dark slate background (#1e293b) with light text (#e2e8f0).
- Date is shown in a smaller muted font (#94a3b8) below the time.
- Timezone support uses `Intl.DateTimeFormat` for accurate time and date extraction.
