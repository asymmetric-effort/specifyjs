// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * MultilineField — Multi-line textarea with FormFieldWrapper.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';
import type { FormFieldWrapperStyle, InputBaseStyle } from '../../wrapper/src/FormFieldWrapper';

export interface MultilineFieldProps {
  /** Current value (controlled) */
  value?: string;
  /** Default value (uncontrolled) */
  defaultValue?: string;
  /** Change handler */
  onChange?: (value: string) => void;
  /** Blur handler */
  onBlur?: (value: string) => void;
  /** Placeholder */
  placeholder?: string;
  /** HTML name */
  name?: string;
  /** HTML id */
  id?: string;
  /** Number of visible rows (default: 4) */
  rows?: number;
  /** Max length */
  maxLength?: number;
  /** Auto-resize to fit content (default: false) */
  autoResize?: boolean;
  /** Min height when auto-resizing */
  minHeight?: string;
  /** Max height when auto-resizing */
  maxHeight?: string;
  /** Read-only */
  readOnly?: boolean;
  /** Disabled */
  disabled?: boolean;
  /** Show character count (default: false) */
  showCount?: boolean;

  // Wrapper props
  label?: string;
  helpText?: string;
  error?: string;
  required?: boolean;
  wrapperStyle?: FormFieldWrapperStyle;

  // Textarea styling
  inputStyle?: InputBaseStyle;
  className?: string;
}

export function MultilineField(props: MultilineFieldProps) {
  const [focused, setFocused] = useState(false);
  const [charCount, setCharCount] = useState(
    (props.value ?? props.defaultValue ?? '').length,
  );
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? `ml-${autoId}`;

  const baseStyle = buildInputStyle(props.inputStyle ?? {}, {
    focused,
    error: !!props.error,
  });

  const textareaStyle: Record<string, string> = {
    ...baseStyle,
    resize: props.autoResize ? 'none' : 'vertical',
    lineHeight: '1.5',
    ...(props.minHeight ? { minHeight: props.minHeight } : {}),
    ...(props.maxHeight ? { maxHeight: props.maxHeight } : {}),
  };

  const handleInput = useCallback(
    (e: Event) => {
      const target = e.target as HTMLTextAreaElement;
      const val = target.value;
      setCharCount(val.length);
      if (props.onChange) props.onChange(val);

      // Auto-resize
      if (props.autoResize) {
        target.style.height = 'auto';
        target.style.height = `${target.scrollHeight}px`;
      }
    },
    [props.onChange, props.autoResize],
  );

  const textarea = createElement('textarea', {
    id: inputId,
    name: props.name,
    value: props.value,
    placeholder: props.placeholder,
    rows: String(props.rows ?? 4),
    maxLength: props.maxLength ? String(props.maxLength) : undefined,
    readOnly: props.readOnly,
    disabled: props.disabled,
    'aria-invalid': props.error ? 'true' : undefined,
    'aria-required': props.required ? 'true' : undefined,
    className: `multiline-input ${props.className ?? ''}`.trim(),
    style: textareaStyle,
    onFocus: () => setFocused(true),
    onBlur: (e: Event) => {
      setFocused(false);
      if (props.onBlur) props.onBlur((e.target as HTMLTextAreaElement).value);
    },
    onInput: handleInput,
  });

  const counter =
    props.showCount && props.maxLength
      ? createElement(
          'div',
          {
            style: {
              fontSize: '11px',
              color: charCount > (props.maxLength ?? Infinity) * 0.9 ? '#ef4444' : '#9ca3af',
              textAlign: 'right',
              marginTop: '2px',
            },
          },
          `${charCount}/${props.maxLength}`,
        )
      : props.showCount
        ? createElement(
            'div',
            { style: { fontSize: '11px', color: '#9ca3af', textAlign: 'right', marginTop: '2px' } },
            `${charCount} characters`,
          )
        : null;

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
    textarea,
    counter,
  );
}
