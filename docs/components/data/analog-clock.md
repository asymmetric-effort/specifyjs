# AnalogClock

A live SVG clock face with configurable format, size, date display, and timezone support. Renders hour markers, numbers, and animated clock hands that update every second.

## Import

```ts
import { AnalogClock } from '@aspect/data/analog-clock';
import type { AnalogClockProps } from '@aspect/data/analog-clock';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `format` | `'12h' \| '24h'` | `'12h'` | Display format. In 24h mode, an inner ring shows 0/13-23 numbers |
| `size` | `number` | `200` | Clock face diameter in pixels |
| `showDate` | `boolean` | `false` | Show the date below the clock |
| `dateFormat` | `'short' \| 'long' \| 'iso'` | `'short'` | Date format: short (MM/DD/YYYY), long (Month DD, YYYY), or iso (YYYY-MM-DD) |
| `showSeconds` | `boolean` | `true` | Whether to show the second hand |
| `timezone` | `string` | `undefined` | IANA timezone string (e.g., `'America/New_York'`). Defaults to local time |
| `className` | `string` | `undefined` | CSS class name for the wrapper element |

## Usage

```ts
import { createElement } from 'specifyjs';
import { AnalogClock } from '@aspect/data/analog-clock';

// Basic clock with defaults
const clock = createElement(AnalogClock, {});

// Large 24-hour clock with date
const clock24 = createElement(AnalogClock, {
  format: '24h',
  size: 300,
  showDate: true,
  dateFormat: 'long',
});

// Clock in a specific timezone without seconds
const nyClock = createElement(AnalogClock, {
  timezone: 'America/New_York',
  showSeconds: false,
  showDate: true,
  dateFormat: 'iso',
});

// Small clock
const mini = createElement(AnalogClock, {
  size: 100,
});
```

## Features

- Renders as pure SVG with no external dependencies.
- Updates every second via `setInterval`.
- 12-hour mode shows numbers 1-12 around the face.
- 24-hour mode adds an inner ring with 0/13-23 at reduced opacity.
- Hour hand sweeps smoothly based on both hours and minutes.
- Minute hand sweeps smoothly based on both minutes and seconds.
- Second hand (red, #ef4444) can be hidden via `showSeconds`.
- Timezone support uses `Intl.DateTimeFormat` for accurate zone conversion.
- Clock face uses a light background (#f8fafc) with dark border (#334155).
