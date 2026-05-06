// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DatePicker — Calendar dropdown date picker.
 *
 * Features month/year navigation, day grid, today highlight,
 * selected date highlight, min/max date constraints.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useEffect, useRef, useCallback, useMemo, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

export interface DatePickerProps {
  /** Current value (Date object or 'YYYY-MM-DD' string) */
  value: Date | string | null;
  /** Change handler, receives ISO date string */
  onChange: (value: string) => void;
  /** Display format (default 'YYYY-MM-DD') */
  format?: string;
  /** Earliest selectable date */
  minDate?: Date | string;
  /** Latest selectable date */
  maxDate?: Date | string;
  /** Disabled state */
  disabled?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** HTML id for the input element */
  id?: string;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const DAY_NAMES = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function toDate(v: Date | string | null | undefined): Date | null {
  if (!v) return null;
  if (v instanceof Date) return v;
  const d = new Date(v);
  return isNaN(d.getTime()) ? null : d;
}

function formatDate(d: Date, fmt: string): string {
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  return fmt
    .replace('YYYY', String(y))
    .replace('MM', String(m).padStart(2, '0'))
    .replace('DD', String(day).padStart(2, '0'));
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function toISODateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function DatePicker(props: DatePickerProps) {
  const autoId = useId();
  const inputId = props.id ?? autoId;
  const {
    value,
    onChange,
    format = 'YYYY-MM-DD',
    minDate,
    maxDate,
    disabled = false,
    placeholder = 'Select date...',
    label,
    error,
  } = props;

  const selectedDate = useMemo(() => toDate(value), [value]);
  const minD = useMemo(() => toDate(minDate), [minDate]);
  const maxD = useMemo(() => toDate(maxDate), [maxDate]);

  const [isOpen, setIsOpen] = useState(false);
  const [viewYear, setViewYear] = useState(() => selectedDate ? selectedDate.getFullYear() : new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(() => selectedDate ? selectedDate.getMonth() : new Date().getMonth());
  const containerRef = useRef<HTMLDivElement>(null);

  const today = useMemo(() => new Date(), []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const prevMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 0) { setViewYear((y) => y - 1); return 11; }
      return m - 1;
    });
  }, []);

  const nextMonth = useCallback(() => {
    setViewMonth((m) => {
      if (m === 11) { setViewYear((y) => y + 1); return 0; }
      return m + 1;
    });
  }, []);

  const handleDayClick = useCallback(
    (day: number) => {
      const d = new Date(viewYear, viewMonth, day);
      if (minD && d < minD) return;
      if (maxD && d > maxD) return;
      onChange(toISODateString(d));
      setIsOpen(false);
    },
    [viewYear, viewMonth, onChange, minD, maxD],
  );

  const displayText = selectedDate ? formatDate(selectedDate, format) : '';

  // Build calendar grid
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const rows: (number | null)[][] = [];
    let row: (number | null)[] = [];

    for (let i = 0; i < firstDay; i++) row.push(null);
    for (let d = 1; d <= daysInMonth; d++) {
      row.push(d);
      if (row.length === 7) { rows.push(row); row = []; }
    }
    while (row.length > 0 && row.length < 7) row.push(null);
    if (row.length) rows.push(row);
    return rows;
  }, [viewYear, viewMonth]);

  const triggerStyle = {
    ...buildInputStyle({}, { focused: isOpen, error: !!error }),
    cursor: disabled ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '38px',
    userSelect: 'none',
  };

  const dropdownStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: '1000',
    padding: '12px',
    width: '280px',
  };

  const navStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '8px',
  };

  const navBtnStyle: Record<string, string> = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    padding: '4px 8px',
    color: '#374151',
    borderRadius: '4px',
  };

  const gridHeaderStyle: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(7, 1fr)',
    textAlign: 'center',
    fontSize: '11px',
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: '4px',
  };

  const dayHeaders = DAY_NAMES.map((d) =>
    createElement('div', { key: d, style: { padding: '4px' } }, d),
  );

  const dayRows = calendarDays.map((row, ri) => {
    const cells = row.map((day, ci) => {
      if (day === null) {
        return createElement('div', { key: `empty-${ri}-${ci}`, style: { padding: '4px' } });
      }

      const date = new Date(viewYear, viewMonth, day);
      const isToday = isSameDay(date, today);
      const isSelected = selectedDate ? isSameDay(date, selectedDate) : false;
      const isOutOfRange = (minD && date < minD) || (maxD && date > maxD);

      const cellStyle: Record<string, string> = {
        padding: '4px',
        textAlign: 'center',
        cursor: isOutOfRange ? 'not-allowed' : 'pointer',
        borderRadius: '4px',
        fontSize: '13px',
        fontWeight: isToday ? '700' : '400',
        backgroundColor: isSelected ? '#3b82f6' : 'transparent',
        color: isSelected ? '#ffffff' : isOutOfRange ? '#d1d5db' : isToday ? '#3b82f6' : '#1f2937',
        border: isToday && !isSelected ? '1px solid #3b82f6' : '1px solid transparent',
        lineHeight: '1.8',
      };

      return createElement(
        'div',
        {
          key: `day-${day}`,
          style: cellStyle,
          onClick: isOutOfRange ? undefined : () => handleDayClick(day),
          onKeyDown: isOutOfRange ? undefined : (e: Event) => {
            const key = (e as KeyboardEvent).key;
            if (key === 'Enter' || key === ' ') {
              e.preventDefault();
              handleDayClick(day);
            }
          },
          role: isOutOfRange ? undefined : 'button',
          tabIndex: isOutOfRange ? undefined : 0,
          'aria-label': `${MONTH_NAMES[viewMonth]} ${day}, ${viewYear}`,
          'aria-disabled': isOutOfRange ? 'true' : undefined,
        },
        String(day),
      );
    });

    return createElement('div', {
      key: `row-${ri}`,
      style: { display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)' },
    }, ...cells);
  });

  const calendar = isOpen
    ? createElement(
        'div',
        { style: dropdownStyle },
        // Nav
        createElement(
          'div',
          { style: navStyle },
          createElement('button', { type: 'button', style: navBtnStyle, onClick: prevMonth }, '\u25C0'),
          createElement(
            'span',
            { style: { fontWeight: '600', fontSize: '14px', color: '#1f2937' } },
            `${MONTH_NAMES[viewMonth]} ${viewYear}`,
          ),
          createElement('button', { type: 'button', style: navBtnStyle, onClick: nextMonth }, '\u25B6'),
        ),
        // Day name headers
        createElement('div', { style: gridHeaderStyle }, ...dayHeaders),
        // Day rows
        ...dayRows,
      )
    : null;

  return createElement(FormFieldWrapper, {
    label,
    error,
    disabled,
    htmlFor: inputId,
  },
    createElement(
      'div',
      { ref: containerRef, style: { position: 'relative' } },
      createElement(
        'div',
        {
          id: inputId,
          style: triggerStyle,
          onClick: disabled ? undefined : () => setIsOpen(!isOpen),
          onKeyDown: disabled ? undefined : (e: Event) => {
            const key = (e as KeyboardEvent).key;
            if (key === 'Enter' || key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          },
          tabIndex: disabled ? -1 : 0,
          role: 'button',
          'aria-label': 'Pick a date',
          'aria-expanded': isOpen ? 'true' : 'false',
        },
        createElement(
          'span',
          { style: { color: displayText ? '#1f2937' : '#9ca3af' } },
          displayText || placeholder,
        ),
        createElement('span', { style: { color: '#6b7280', fontSize: '14px' } }, '\u{1F4C5}'),
      ),
      calendar,
    ),
  );
}
