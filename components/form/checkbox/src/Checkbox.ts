// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Checkbox — Custom styled checkbox with label.
 *
 * Uses a hidden native input + visible styled div with checkmark/indeterminate indicator.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useRef, useEffect, useCallback, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper } from '../../wrapper/src/FormFieldWrapper';

export interface CheckboxProps {
  /** Whether checkbox is checked */
  checked: boolean;
  /** Change handler */
  onChange: (checked: boolean) => void;
  /** Label text */
  label?: string;
  /** Indeterminate state (overrides checkmark display) */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** HTML id for the input element */
  id?: string;
}

const SIZE_MAP = {
  sm: { box: 14, icon: 10, fontSize: '12px' },
  md: { box: 18, icon: 12, fontSize: '14px' },
  lg: { box: 22, icon: 16, fontSize: '16px' },
};

export function Checkbox(props: CheckboxProps) {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? autoId;
  const {
    checked,
    onChange,
    label,
    indeterminate = false,
    disabled = false,
    error,
    size = 'md',
  } = props;

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync indeterminate property (not an attribute)
  useEffect(() => {
    if (inputRef.current) {
      (inputRef.current as any).indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const handleClick = useCallback(() => {
    if (disabled) return;
    onChange(!checked);
  }, [disabled, checked, onChange]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      if (e.key === ' ' || e.key === 'Enter') {
        e.preventDefault();
        onChange(!checked);
      }
    },
    [disabled, checked, onChange],
  );

  const dim = SIZE_MAP[size];
  const boxSize = `${dim.box}px`;

  const borderColor = error ? '#ef4444' : checked || indeterminate ? '#3b82f6' : '#d1d5db';
  const bgColor = checked || indeterminate ? '#3b82f6' : '#ffffff';

  const boxStyle: Record<string, string> = {
    width: boxSize,
    height: boxSize,
    minWidth: boxSize,
    borderRadius: '4px',
    border: `2px solid ${borderColor}`,
    backgroundColor: bgColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 0.15s',
    boxSizing: 'border-box',
  };

  const iconStyle: Record<string, string> = {
    color: '#ffffff',
    fontSize: `${dim.icon}px`,
    lineHeight: '1',
    fontWeight: '700',
  };

  const icon = indeterminate
    ? createElement('span', { style: iconStyle }, '\u2014')
    : checked
      ? createElement('span', { style: iconStyle }, '\u2713')
      : null;

  const containerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? '0.6' : '1',
    userSelect: 'none',
  };

  const hiddenInput = createElement('input', {
    ref: inputRef,
    type: 'checkbox',
    id: inputId,
    checked,
    disabled,
    onChange: () => onChange(!checked),
    style: {
      position: 'absolute',
      opacity: '0',
      width: '0',
      height: '0',
      pointerEvents: 'none',
    },
    'aria-hidden': 'true',
    tabIndex: -1,
  });

  const box = createElement('div', { style: boxStyle }, icon);

  const labelEl = label
    ? createElement('span', { style: { fontSize: dim.fontSize, color: '#374151' } }, label)
    : null;

  return createElement(FormFieldWrapper, {
    error,
    htmlFor: inputId,
  },
    createElement(
      'div',
      {
        style: containerStyle,
        onClick: handleClick,
        onKeyDown: handleKeyDown,
        tabIndex: disabled ? -1 : 0,
        role: 'checkbox',
        'aria-checked': indeterminate ? 'mixed' : checked ? 'true' : 'false',
        'aria-disabled': disabled ? 'true' : undefined,
        'aria-label': label,
      },
      hiddenInput,
      box,
      labelEl,
    ),
  );
}
