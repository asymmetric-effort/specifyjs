// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TextField — Single-line text input with FormFieldWrapper.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useId } from 'specifyjs/hooks';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';
import type { FormFieldWrapperStyle, InputBaseStyle } from '../../wrapper/src/FormFieldWrapper';

export interface TextFieldProps {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Input event handler (fires on every keystroke) */
  onInput?: (value: string) => void;
  /** Blur handler */
  onBlur?: (value: string) => void;
  /** Enter key handler */
  onEnter?: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Input type (default: 'text') */
  type?: 'text' | 'password' | 'email' | 'url' | 'tel' | 'search' | 'number';
  /** HTML name attribute */
  name?: string;
  /** HTML id */
  id?: string;
  /** Max length */
  maxLength?: number;
  /** Pattern for validation */
  pattern?: string;
  /** Auto-complete hint */
  autoComplete?: string;
  /** Autofocus on mount */
  autoFocus?: boolean;
  /** Read-only */
  readOnly?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Prefix element (icon, text) */
  prefix?: unknown;
  /** Suffix element (icon, button) */
  suffix?: unknown;

  // Wrapper props
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  wrapperStyle?: FormFieldWrapperStyle;

  // Input styling
  inputStyle?: InputBaseStyle;

  /** Extra class on the input */
  className?: string;
}

export function TextField(props: TextFieldProps) {
  const [focused, setFocused] = useState(false);
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? `tf-${autoId}`;

  const style = buildInputStyle(props.inputStyle ?? {}, {
    focused,
    error: !!props.error,
  });

  const hasAddons = !!(props.prefix || props.suffix);

  const inputEl = createElement('input', {
    type: props.type ?? 'text',
    id: inputId,
    name: props.name,
    value: props.value,
    placeholder: props.placeholder,
    maxLength: props.maxLength ? String(props.maxLength) : undefined,
    pattern: props.pattern,
    autoComplete: props.autoComplete,
    autoFocus: props.autoFocus,
    readOnly: props.readOnly,
    disabled: props.disabled,
    'aria-invalid': props.error ? 'true' : undefined,
    'aria-required': props.required ? 'true' : undefined,
    className: `textfield-input ${props.className ?? ''}`.trim(),
    style: hasAddons
      ? { ...style, border: 'none', boxShadow: 'none', flex: '1', minWidth: '0' }
      : style,
    onFocus: () => setFocused(true),
    onBlur: (e: Event) => {
      setFocused(false);
      if (props.onBlur) props.onBlur((e.target as HTMLInputElement).value);
    },
    onInput: (e: Event) => {
      const val = (e.target as HTMLInputElement).value;
      if (props.onInput) props.onInput(val);
      if (props.onChange) props.onChange(val);
    },
    onKeyDown: (e: Event) => {
      if ((e as KeyboardEvent).key === 'Enter' && props.onEnter) {
        props.onEnter((e.target as HTMLInputElement).value);
      }
    },
  });

  const field = hasAddons
    ? createElement(
        'div',
        {
          style: {
            ...style,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '0',
          },
        },
        props.prefix
          ? createElement('span', { style: { paddingLeft: '10px', color: '#9ca3af', flexShrink: '0' } }, props.prefix)
          : null,
        inputEl,
        props.suffix
          ? createElement('span', { style: { paddingRight: '10px', color: '#9ca3af', flexShrink: '0' } }, props.suffix)
          : null,
      )
    : inputEl;

  return createElement(
    FormFieldWrapper,
    {
      label: props.label,
      htmlFor: inputId,
      helpText: props.helpText,
      error: props.error,
      required: props.required,
      disabled: props.disabled,
      styling: props.wrapperStyle,
    },
    field,
  );
}
