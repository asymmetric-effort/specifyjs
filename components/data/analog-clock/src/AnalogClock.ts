// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * AnalogClock — Renders a live SVG clock face with configurable format,
 * size, date display, and timezone support.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect } from 'specifyjs/hooks';

export interface AnalogClockProps {
  /** Display format: '12h' or '24h' — in 24h, show 0-23 hour numbers */
  format?: '12h' | '24h';
  /** Clock face size in pixels */
  size?: number;
  /** Show date below the clock */
  showDate?: boolean;
  /** Date format: 'short' (MM/DD/YYYY), 'long' (Month DD, YYYY), 'iso' (YYYY-MM-DD) */
  dateFormat?: 'short' | 'long' | 'iso';
  /** Show second hand */
  showSeconds?: boolean;
  /** Custom timezone */
  timezone?: string;
  /** CSS className */
  className?: string;
}

// ── Helpers ────────────────────────────────────────────────────────────

function getTimeInZone(timezone?: string): Date {
  if (!timezone) return new Date();
  // Build a formatter that extracts numeric parts in the target timezone
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
  return new Date(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
}

function formatDate(date: Date, dateFormat: 'short' | 'long' | 'iso'): string {
  const y = date.getFullYear();
  const m = date.getMonth();
  const d = date.getDate();
  switch (dateFormat) {
    case 'short': {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${mm}/${dd}/${y}`;
    }
    case 'long': {
      const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      return `${months[m]} ${String(d).padStart(2, '0')}, ${y}`;
    }
    case 'iso': {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    }
  }
}

// ── Colors ─────────────────────────────────────────────────────────────

const COLORS = {
  face: '#f8fafc',
  border: '#334155',
  hand: '#1e293b',
  second: '#ef4444',
  numbers: '#374151',
} as const;

// ── Component ──────────────────────────────────────────────────────────

export function AnalogClock(props: AnalogClockProps) {
  const {
    format = '12h',
    size = 200,
    showDate = false,
    dateFormat = 'short',
    showSeconds = true,
    timezone,
    className,
  } = props;

  const [now, setNow] = useState<Date>(getTimeInZone(timezone));

  useEffect(() => {
    const id = setInterval(() => {
      setNow(getTimeInZone(timezone));
    }, 1000);
    return () => clearInterval(id);
  }, [timezone]);

  // ── Time extraction ──────────────────────────────────────────────────

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();

  // ── Hand angles ──────────────────────────────────────────────────────

  // Hour hand always sweeps 360° per 12 hours (same as standard clock)
  const hourAngle = (hours % 12) * 30 + minutes * 0.5;

  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  // ── Layout constants ─────────────────────────────────────────────────

  const cx = size / 2;
  const cy = size / 2;
  const radius = size / 2 - 10;
  const tickOuter = radius - 4;
  const numberRadius = radius - 22;

  // ── Build SVG children ───────────────────────────────────────────────

  const svgChildren: unknown[] = [];

  // Clock face circle
  svgChildren.push(
    createElement('circle', {
      cx: String(cx),
      cy: String(cy),
      r: String(radius),
      fill: COLORS.face,
      stroke: COLORS.border,
      'stroke-width': '3',
    }),
  );

  // Hour markers & numbers — always 12 divisions
  // In 24h mode: outer ring 12/1-11, inner ring 0/13-23
  for (let i = 0; i < 12; i++) {
    const angle = (i * 30) - 90; // 30° per hour, -90 so 12 is at top
    const rad = (angle * Math.PI) / 180;

    // Tick mark
    const innerR = tickOuter - 6;
    svgChildren.push(
      createElement('line', {
        x1: String(cx + innerR * Math.cos(rad)),
        y1: String(cy + innerR * Math.sin(rad)),
        x2: String(cx + tickOuter * Math.cos(rad)),
        y2: String(cy + tickOuter * Math.sin(rad)),
        stroke: COLORS.border,
        'stroke-width': '2',
      }),
    );

    // Outer ring number (1-12)
    const outerLabel = String(i === 0 ? 12 : i);
    svgChildren.push(
      createElement('text', {
        x: String(cx + numberRadius * Math.cos(rad)),
        y: String(cy + numberRadius * Math.sin(rad)),
        'text-anchor': 'middle',
        'dominant-baseline': 'central',
        fill: COLORS.numbers,
        'font-size': String(size * 0.08),
        'font-family': 'sans-serif',
        'font-weight': '600',
      }, outerLabel),
    );

    // Inner ring (13-23, 0) — only in 24h mode
    if (format === '24h') {
      const innerNumberRadius = radius - 38;
      const innerLabel = String(i === 0 ? 0 : i + 12);
      svgChildren.push(
        createElement('text', {
          x: String(cx + innerNumberRadius * Math.cos(rad)),
          y: String(cy + innerNumberRadius * Math.sin(rad)),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          fill: COLORS.numbers,
          'font-size': String(size * 0.055),
          'font-family': 'sans-serif',
          opacity: '0.6',
        }, innerLabel),
      );
    }
  }

  // ── Hand helper ──────────────────────────────────────────────────────

  const hand = (angle: number, length: number, width: string, color: string) => {
    const rad = ((angle - 90) * Math.PI) / 180;
    return createElement('line', {
      x1: String(cx),
      y1: String(cy),
      x2: String(cx + length * Math.cos(rad)),
      y2: String(cy + length * Math.sin(rad)),
      stroke: color,
      'stroke-width': width,
      'stroke-linecap': 'round',
    });
  };

  // Hour hand (short, thick)
  svgChildren.push(hand(hourAngle, radius * 0.5, '4', COLORS.hand));

  // Minute hand (long, medium)
  svgChildren.push(hand(minuteAngle, radius * 0.75, '3', COLORS.hand));

  // Second hand (long, thin, red)
  if (showSeconds) {
    svgChildren.push(hand(secondAngle, radius * 0.85, '1.5', COLORS.second));
  }

  // Center dot
  svgChildren.push(
    createElement('circle', {
      cx: String(cx),
      cy: String(cy),
      r: '4',
      fill: COLORS.hand,
    }),
  );

  // ── Assemble ─────────────────────────────────────────────────────────

  const svg = createElement(
    'svg',
    {
      width: String(size),
      height: String(size),
      viewBox: `0 0 ${size} ${size}`,
      xmlns: 'http://www.w3.org/2000/svg',
    },
    ...svgChildren,
  );

  const wrapperChildren: unknown[] = [svg];

  if (showDate) {
    wrapperChildren.push(
      createElement('div', {
        style: {
          textAlign: 'center',
          marginTop: '8px',
          fontFamily: 'sans-serif',
          fontSize: '14px',
          color: COLORS.numbers,
        },
      }, formatDate(now, dateFormat)),
    );
  }

  return createElement('div', {
    className,
    style: {
      display: 'inline-flex',
      flexDirection: 'column',
      alignItems: 'center',
    },
  }, ...wrapperChildren);
}
