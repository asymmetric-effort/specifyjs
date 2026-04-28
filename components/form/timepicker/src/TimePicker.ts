// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TimePicker — Time selection component with hour/minute/seconds selectors,
 * AM/PM toggle for 12-hour format, and optional timezone selector.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useMemo } from '../../../../core/src/hooks/index';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

/** Default timezone options for the timezone selector */
const DEFAULT_TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Asia/Tokyo',
];

export interface TimePickerProps {
  /** Current value in 'HH:MM' or 'HH:MM:SS' format (24h) */
  value: string;
  /** Change handler, receives 'HH:MM' or 'HH:MM:SS' string in 24h format */
  onChange: (value: string) => void;
  /** Display format */
  format?: '12h' | '24h';
  /** Minute increment step */
  minuteStep?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** When true, show a seconds spinner (default false) */
  showSeconds?: boolean;
  /** If provided, display a timezone label next to the time */
  timezone?: string;
  /** When true, show a timezone dropdown selector (default false) */
  showTimezone?: boolean;
  /** List of timezone strings for the dropdown */
  timezones?: string[];
  /** Callback when timezone changes */
  onTimezoneChange?: (tz: string) => void;
  /** HTML id for the input element */
  id?: string;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function parseTime(val: string): { hour: number; minute: number; second: number } {
  const parts = val.split(':');
  return {
    hour: parseInt(parts[0], 10) || 0,
    minute: parseInt(parts[1], 10) || 0,
    second: parseInt(parts[2], 10) || 0,
  };
}

export function TimePicker(props: TimePickerProps) {
  const inputId = props.id ?? `tp-${Math.random().toString(36).slice(2, 8)}`;
  const {
    value,
    onChange,
    format = '24h',
    minuteStep = 1,
    disabled = false,
    label,
    error,
    showSeconds = false,
    timezone,
    showTimezone = false,
    timezones = DEFAULT_TIMEZONES,
    onTimezoneChange,
  } = props;

  const [focused, setFocused] = useState(false);
  const parsed = useMemo(() => parseTime(value), [value]);

  const is12h = format === '12h';
  const isPM = parsed.hour >= 12;
  const display12Hour = is12h ? (parsed.hour % 12 || 12) : parsed.hour;

  const emit = useCallback(
    (h: number, m: number, s?: number) => {
      const hh = Math.max(0, Math.min(23, h));
      const mm = Math.max(0, Math.min(59, m));
      const ss = Math.max(0, Math.min(59, s ?? 0));
      if (showSeconds) {
        onChange(`${pad2(hh)}:${pad2(mm)}:${pad2(ss)}`);
      } else {
        onChange(`${pad2(hh)}:${pad2(mm)}`);
      }
    },
    [onChange, showSeconds],
  );

  const handleHourChange = useCallback(
    (e: Event) => {
      let h = parseInt((e.target as HTMLInputElement).value, 10) || 0;
      if (is12h) {
        h = h % 12;
        if (isPM) h += 12;
      }
      emit(h, parsed.minute, parsed.second);
    },
    [is12h, isPM, parsed.minute, parsed.second, emit],
  );

  const handleMinuteChange = useCallback(
    (e: Event) => {
      const m = parseInt((e.target as HTMLInputElement).value, 10) || 0;
      emit(parsed.hour, m, parsed.second);
    },
    [parsed.hour, parsed.second, emit],
  );

  const handleSecondChange = useCallback(
    (e: Event) => {
      const s = parseInt((e.target as HTMLInputElement).value, 10) || 0;
      emit(parsed.hour, parsed.minute, s);
    },
    [parsed.hour, parsed.minute, emit],
  );

  const handleAMPMToggle = useCallback(() => {
    if (disabled) return;
    const newHour = isPM ? parsed.hour - 12 : parsed.hour + 12;
    emit(newHour, parsed.minute, parsed.second);
  }, [disabled, isPM, parsed.hour, parsed.minute, parsed.second, emit]);

  const handleHourIncrement = useCallback(
    (delta: number) => {
      if (disabled) return;
      emit(parsed.hour + delta, parsed.minute, parsed.second);
    },
    [disabled, parsed.hour, parsed.minute, parsed.second, emit],
  );

  const handleMinuteIncrement = useCallback(
    (delta: number) => {
      if (disabled) return;
      emit(parsed.hour, parsed.minute + delta * minuteStep, parsed.second);
    },
    [disabled, parsed.hour, parsed.minute, parsed.second, minuteStep, emit],
  );

  const handleSecondIncrement = useCallback(
    (delta: number) => {
      if (disabled) return;
      emit(parsed.hour, parsed.minute, parsed.second + delta);
    },
    [disabled, parsed.hour, parsed.minute, parsed.second, emit],
  );

  const handleTimezoneChange = useCallback(
    (e: Event) => {
      const tz = (e.target as HTMLSelectElement).value;
      if (onTimezoneChange) onTimezoneChange(tz);
    },
    [onTimezoneChange],
  );

  const containerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    ...buildInputStyle({}, { focused, error: !!error }),
  };

  const spinnerGroupStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  };

  const arrowBtnStyle: Record<string, string> = {
    background: 'none',
    border: 'none',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '10px',
    padding: '0 4px',
    color: '#6b7280',
    lineHeight: '1',
  };

  const inputStyle: Record<string, string> = {
    width: '32px',
    textAlign: 'center',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'monospace',
    backgroundColor: 'transparent',
    color: '#1f2937',
    padding: '0',
  };

  const ampmBtnStyle: Record<string, string> = {
    marginLeft: '4px',
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#f9fafb',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
  };

  const hourSpinner = createElement(
    'div',
    { style: spinnerGroupStyle },
    createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleHourIncrement(1), disabled }, '\u25B2'),
    createElement('input', {
      type: 'text',
      value: pad2(display12Hour),
      onChange: handleHourChange,
      style: inputStyle,
      disabled,
      'aria-label': 'Hour',
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleHourIncrement(-1), disabled }, '\u25BC'),
  );

  const separator = createElement(
    'span',
    { style: { fontSize: '16px', fontWeight: '700', color: '#374151', padding: '0 2px' } },
    ':',
  );

  const minuteSpinner = createElement(
    'div',
    { style: spinnerGroupStyle },
    createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleMinuteIncrement(1), disabled }, '\u25B2'),
    createElement('input', {
      type: 'text',
      value: pad2(parsed.minute),
      onChange: handleMinuteChange,
      style: inputStyle,
      disabled,
      'aria-label': 'Minute',
      onFocus: () => setFocused(true),
      onBlur: () => setFocused(false),
    }),
    createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleMinuteIncrement(-1), disabled }, '\u25BC'),
  );

  const secondsSeparator = showSeconds
    ? createElement(
        'span',
        { style: { fontSize: '16px', fontWeight: '700', color: '#374151', padding: '0 2px' } },
        ':',
      )
    : null;

  const secondsSpinner = showSeconds
    ? createElement(
        'div',
        { style: spinnerGroupStyle },
        createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleSecondIncrement(1), disabled }, '\u25B2'),
        createElement('input', {
          type: 'text',
          value: pad2(parsed.second),
          onChange: handleSecondChange,
          style: inputStyle,
          disabled,
          'aria-label': 'Second',
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        }),
        createElement('button', { type: 'button', style: arrowBtnStyle, onClick: () => handleSecondIncrement(-1), disabled }, '\u25BC'),
      )
    : null;

  const ampmToggle = is12h
    ? createElement(
        'button',
        {
          type: 'button',
          style: ampmBtnStyle,
          onClick: handleAMPMToggle,
          disabled,
          'aria-label': 'Toggle AM/PM',
        },
        isPM ? 'PM' : 'AM',
      )
    : null;

  const timezoneSelectStyle: Record<string, string> = {
    marginLeft: '4px',
    padding: '4px 8px',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    backgroundColor: '#f9fafb',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: '#374151',
  };

  const timezoneLabelEl = (timezone && !showTimezone)
    ? createElement(
        'span',
        {
          style: {
            marginLeft: '8px',
            fontSize: '12px',
            fontWeight: '600',
            color: '#6b7280',
          },
        },
        timezone,
      )
    : null;

  const timezoneSelect = showTimezone
    ? createElement(
        'select',
        {
          style: timezoneSelectStyle,
          value: timezone ?? timezones[0],
          onChange: handleTimezoneChange,
          disabled,
          'aria-label': 'Timezone',
        },
        ...timezones.map((tz: string) =>
          createElement('option', { key: tz, value: tz }, tz),
        ),
      )
    : null;

  const children = [hourSpinner, separator, minuteSpinner];
  if (secondsSeparator) children.push(secondsSeparator);
  if (secondsSpinner) children.push(secondsSpinner);
  if (ampmToggle) children.push(ampmToggle);
  if (timezoneLabelEl) children.push(timezoneLabelEl);
  if (timezoneSelect) children.push(timezoneSelect);

  return createElement(FormFieldWrapper, {
    label,
    error,
    disabled,
    htmlFor: inputId,
  },
    createElement(
      'div',
      {
        id: inputId,
        style: containerStyle,
      },
      ...children,
    ),
  );
}
