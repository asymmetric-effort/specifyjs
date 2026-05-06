// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * RadioGroup — Radio button group component.
 *
 * Wraps individual radio buttons with support for horizontal/vertical layout,
 * keyboard navigation, and error states.
 */

import { createElement } from '../../../../core/src/index';
import { useCallback, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper } from '../../wrapper/src/FormFieldWrapper';

export interface RadioOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface RadioGroupProps {
  /** Available options */
  options: RadioOption[];
  /** Currently selected value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Name attribute for the radio group */
  name: string;
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  /** Disabled state for entire group */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Label for the group */
  label?: string;
  /** HTML id for the radio group */
  id?: string;
}

export function RadioGroup(props: RadioGroupProps) {
  const autoId = useId();
  const groupId = props.id ?? autoId;
  const {
    options,
    value,
    onChange,
    name,
    direction = 'vertical',
    disabled = false,
    error,
    label,
  } = props;

  const handleSelect = useCallback(
    (optValue: string) => {
      if (disabled) return;
      onChange(optValue);
    },
    [disabled, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const enabledOpts = options.filter((o) => !o.disabled);
      if (enabledOpts.length === 0) return;

      const currentIdx = enabledOpts.findIndex((o) => o.value === value);
      let nextIdx = currentIdx;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        nextIdx = currentIdx < enabledOpts.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        nextIdx = currentIdx > 0 ? currentIdx - 1 : enabledOpts.length - 1;
      } else {
        return;
      }

      onChange(enabledOpts[nextIdx].value);
    },
    [disabled, options, value, onChange],
  );

  const groupStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: direction === 'horizontal' ? 'row' : 'column',
    gap: direction === 'horizontal' ? '16px' : '8px',
  };

  const radioButtons = options.map((opt, idx) => {
    const isSelected = opt.value === value;
    const isDisabled = disabled || !!opt.disabled;
    const optionId = `${groupId}-opt-${idx}`;

    const outerCircleStyle: Record<string, string> = {
      width: '18px',
      height: '18px',
      minWidth: '18px',
      borderRadius: '50%',
      border: `2px solid ${error ? '#ef4444' : isSelected ? '#3b82f6' : '#d1d5db'}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'border-color 0.15s',
      boxSizing: 'border-box',
    };

    const innerDotStyle: Record<string, string> = {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#3b82f6',
      transition: 'transform 0.15s',
      transform: isSelected ? 'scale(1)' : 'scale(0)',
    };

    const itemStyle: Record<string, string> = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '8px',
      cursor: isDisabled ? 'not-allowed' : 'pointer',
      opacity: isDisabled ? '0.5' : '1',
      userSelect: 'none',
    };

    return createElement(
      'label',
      {
        key: opt.value,
        htmlFor: optionId,
        style: itemStyle,
        onClick: isDisabled ? undefined : (e: Event) => { e.preventDefault(); handleSelect(opt.value); },
      },
      createElement('input', {
        type: 'radio',
        id: optionId,
        name,
        value: opt.value,
        checked: isSelected,
        disabled: isDisabled,
        style: { position: 'absolute', opacity: '0', width: '0', height: '0', pointerEvents: 'none' },
        tabIndex: -1,
      }),
      createElement('div', { style: outerCircleStyle }, createElement('div', { style: innerDotStyle })),
      createElement('span', { style: { fontSize: '14px', color: '#374151' } }, opt.label),
    );
  });

  return createElement(FormFieldWrapper, {
    label,
    error,
    htmlFor: `${groupId}-opt-0`,
  },
    createElement(
      'div',
      {
        id: groupId,
        style: groupStyle,
        role: 'radiogroup',
        'aria-label': label,
        onKeyDown: handleKeyDown,
        tabIndex: disabled ? -1 : 0,
      },
      ...radioButtons,
    ),
  );
}
