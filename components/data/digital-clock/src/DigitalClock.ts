// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DigitalClock — A real-time digital clock component with configurable
 * format, timezone, date display, and seconds visibility.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect } from 'specifyjs/hooks';

export interface DigitalClockProps {
  /** Display format: '12h' for AM/PM or '24h' for 24-hour */
  format?: '12h' | '24h';
  /** Show date display */
  showDate?: boolean;
  /** Date format: 'short' (MM/DD/YYYY), 'long' (Month DD, YYYY), 'iso' (YYYY-MM-DD) */
  dateFormat?: 'short' | 'long' | 'iso';
  /** Show seconds */
  showSeconds?: boolean;
  /** Custom timezone (e.g., 'America/New_York') */
  timezone?: string;
  /** CSS className */
  className?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────────

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function getTimeParts(date: Date, timezone?: string) {
  if (timezone) {
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: timezone,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      hour12: false,
    });
    const parts = formatter.formatToParts(date);
    const get = (type: string) => Number(parts.find(p => p.type === type)?.value ?? 0);
    return { hours: get('hour'), minutes: get('minute'), seconds: get('second') };
  }
  return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
}

function formatDate(date: Date, dateFormat: 'short' | 'long' | 'iso', timezone?: string): string {
  if (timezone) {
    const options: Intl.DateTimeFormatOptions = { timeZone: timezone };
    if (dateFormat === 'short') {
      Object.assign(options, { month: '2-digit', day: '2-digit', year: 'numeric' });
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    if (dateFormat === 'long') {
      Object.assign(options, { month: 'long', day: 'numeric', year: 'numeric' });
      return new Intl.DateTimeFormat('en-US', options).format(date);
    }
    // iso
    Object.assign(options, { year: 'numeric', month: '2-digit', day: '2-digit' });
    const parts = new Intl.DateTimeFormat('en-CA', options).formatToParts(date);
    const get = (type: string) => parts.find(p => p.type === type)?.value ?? '';
    return `${get('year')}-${get('month')}-${get('day')}`;
  }

  if (dateFormat === 'short') {
    return `${pad(date.getMonth() + 1)}/${pad(date.getDate())}/${date.getFullYear()}`;
  }
  if (dateFormat === 'long') {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(date);
  }
  // iso
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

// ── Styles ──────────────────────────────────────────────────────────────

const containerStyle: Record<string, string> = {
  fontFamily: '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", "Courier New", monospace',
  backgroundColor: '#1e293b',
  color: '#e2e8f0',
  padding: '16px 24px',
  borderRadius: '8px',
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '4px',
};

const timeStyle: Record<string, string> = {
  fontSize: '2rem',
  fontWeight: '600',
  letterSpacing: '2px',
  lineHeight: '1',
};

const ampmStyle: Record<string, string> = {
  fontSize: '0.875rem',
  fontWeight: '400',
  marginLeft: '4px',
  verticalAlign: 'super',
};

const dateStyle: Record<string, string> = {
  fontSize: '0.75rem',
  color: '#94a3b8',
  marginTop: '4px',
};

// ── Component ───────────────────────────────────────────────────────────

export function DigitalClock(props: DigitalClockProps) {
  const {
    format = '12h',
    showDate = false,
    dateFormat = 'short',
    showSeconds = true,
    timezone,
    className,
  } = props;

  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const { hours, minutes, seconds } = getTimeParts(now, timezone);

  // Build time string
  let displayHours: number;
  let period: string | null = null;

  if (format === '12h') {
    period = hours >= 12 ? 'PM' : 'AM';
    displayHours = hours % 12 || 12;
  } else {
    displayHours = hours;
  }

  let timeStr = `${pad(displayHours)}:${pad(minutes)}`;
  if (showSeconds) {
    timeStr += `:${pad(seconds)}`;
  }

  // Build children
  const timeChildren: unknown[] = [timeStr];
  if (period != null) {
    timeChildren.push(createElement('span', { style: ampmStyle }, period));
  }

  const wrapperChildren: unknown[] = [
    createElement('span', { style: timeStyle }, ...timeChildren),
  ];

  if (showDate) {
    wrapperChildren.push(
      createElement('span', { style: dateStyle }, formatDate(now, dateFormat, timezone)),
    );
  }

  return createElement('div', {
    style: containerStyle,
    ...(className ? { class: className } : {}),
  }, ...wrapperChildren);
}
