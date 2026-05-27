// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * NumberSpinner — Numeric input with increment/decrement buttons.
 *
 * Features +/- buttons on sides, keyboard arrow support,
 * optional prefix/suffix, and min/max clamping.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useId } from 'specifyjs/hooks';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

export interface NumberSpinnerProps {
  /** Current numeric value */
  value: number;
  /** Change handler */
  onChange: (value: number) => void;
  /** Minimum allowed value */
  min?: number;
  /** Maximum allowed value */
  max?: number;
  /** Step increment */
  step?: number;
  /** Disabled state */
  disabled?: boolean;
  /** Prefix text (e.g. '$') */
  prefix?: string;
  /** Suffix text (e.g. 'kg') */
  suffix?: string;
  /** Label text */
  label?: string;
  /** Error message */
  error?: string;
  /** HTML id for the input element */
  id?: string;
}

export function NumberSpinner(props: NumberSpinnerProps) {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? `ns-${autoId}`;
  const {
    value,
    onChange,
    min,
    max,
    step = 1,
    disabled = false,
    prefix,
    suffix,
    label,
    error,
  } = props;

  const [focused, setFocused] = useState(false);

  const clamp = useCallback(
    (v: number): number => {
      let result = v;
      if (min !== undefined && result < min) result = min;
      if (max !== undefined && result > max) result = max;
      return result;
    },
    [min, max],
  );

  const handleIncrement = useCallback(() => {
    if (disabled) return;
    onChange(clamp(value + step));
  }, [disabled, value, step, clamp, onChange]);

  const handleDecrement = useCallback(() => {
    if (disabled) return;
    onChange(clamp(value - step));
  }, [disabled, value, step, clamp, onChange]);

  const handleInputChange = useCallback(
    (e: Event) => {
      const raw = (e.target as HTMLInputElement).value;
      if (raw === '' || raw === '-') return;
      const num = parseFloat(raw);
      if (!isNaN(num)) {
        onChange(clamp(num));
      }
    },
    [clamp, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        handleIncrement();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        handleDecrement();
      }
    },
    [disabled, handleIncrement, handleDecrement],
  );

  const canDecrement = min === undefined || value > min;
  const canIncrement = max === undefined || value < max;

  const containerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'stretch',
    borderRadius: '6px',
    overflow: 'hidden',
    border: `1px solid ${error ? '#ef4444' : focused ? '#3b82f6' : 'var(--color-border, #d1d5db)'}`,
    transition: 'border-color 0.15s',
    opacity: disabled ? '0.6' : '1',
    ...(focused && !error ? { boxShadow: '0 0 0 3px #3b82f622' } : {}),
  };

  const btnStyle = (isEnabled: boolean): Record<string, string> => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '36px',
    backgroundColor: 'var(--color-bg-subtle, #f9fafb)',
    border: 'none',
    cursor: disabled || !isEnabled ? 'not-allowed' : 'pointer',
    color: disabled || !isEnabled ? '#d1d5db' : 'var(--color-text, #374151)',
    fontSize: 'inherit',
    fontWeight: '600',
    userSelect: 'none',
    transition: 'background-color 0.1s',
    borderRight: 'none',
    borderLeft: 'none',
  });

  const inputStyle: Record<string, string> = {
    flex: '1',
    minWidth: '32px',
    textAlign: 'center',
    border: 'none',
    borderLeft: '1px solid var(--color-border, #e5e7eb)',
    borderRight: '1px solid var(--color-border, #e5e7eb)',
    outline: 'none',
    fontSize: 'inherit',
    fontFamily: 'inherit',
    backgroundColor: 'var(--color-bg, #ffffff)',
    color: 'var(--color-text, #1f2937)',
    padding: '4px 2px',
  };

  const affixStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    fontSize: 'inherit',
    color: 'var(--color-text-muted, #6b7280)',
    padding: '0 2px',
    backgroundColor: 'var(--color-bg-subtle, #f9fafb)',
  };

  const decrementBtn = createElement(
    'button',
    {
      type: 'button',
      style: btnStyle(canDecrement),
      onClick: handleDecrement,
      disabled: disabled,
      'aria-label': 'Decrement',
      tabIndex: -1,
    },
    '\u2212',
  );

  const prefixEl = prefix
    ? createElement('span', { style: affixStyle }, prefix)
    : null;

  const input = createElement('input', {
    id: inputId,
    type: 'text',
    value: String(value),
    onInput: handleInputChange,
    onKeyDown: handleKeyDown,
    onFocus: () => setFocused(true),
    onBlur: () => setFocused(false),
    disabled,
    style: inputStyle,
    'aria-label': label || 'Number',
    role: 'spinbutton',
    'aria-valuenow': String(value),
    'aria-valuemin': min !== undefined ? String(min) : undefined,
    'aria-valuemax': max !== undefined ? String(max) : undefined,
  });

  const suffixEl = suffix
    ? createElement('span', { style: affixStyle }, suffix)
    : null;

  const incrementBtn = createElement(
    'button',
    {
      type: 'button',
      style: btnStyle(canIncrement),
      onClick: handleIncrement,
      disabled: disabled,
      'aria-label': 'Increment',
      tabIndex: -1,
    },
    '+',
  );

  const innerChildren = [decrementBtn];
  if (prefixEl) innerChildren.push(prefixEl);
  innerChildren.push(input);
  if (suffixEl) innerChildren.push(suffixEl);
  innerChildren.push(incrementBtn);

  return createElement(FormFieldWrapper, {
    label,
    error,
    disabled,
    htmlFor: inputId,
  },
    createElement('div', { style: containerStyle }, ...innerChildren),
  );
}
