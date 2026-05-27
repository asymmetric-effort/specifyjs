// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * FormFieldWrapper — Base container for all data-entry / form components.
 *
 * Provides consistent label, help text, error display, required indicator,
 * and styling. Foundation for textfield, multiline, texteditor, etc.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

export interface FormFieldWrapperStyle {
  /** Container font family */
  fontFamily?: string;
  /** Container font size (default: '14px') */
  fontSize?: string;
  /** Label color (default: '#374151') */
  labelColor?: string;
  /** Label font weight (default: '500') */
  labelFontWeight?: string;
  /** Label font size (default: '14px') */
  labelFontSize?: string;
  /** Help text color (default: '#6b7280') */
  helpColor?: string;
  /** Error text color (default: '#ef4444') */
  errorColor?: string;
  /** Error border color applied to child (default: '#ef4444') */
  errorBorderColor?: string;
  /** Focus border color hint (default: '#3b82f6') */
  focusBorderColor?: string;
  /** Gap between label/field/help (default: '4px') */
  gap?: string;
  /** Width (default: '100%') */
  width?: string | number;
  /** Custom overrides */
  custom?: Record<string, string>;
}

export interface FormFieldWrapperProps {
  /** Label text */
  label?: string;
  /** HTML id to link label to input via htmlFor */
  htmlFor?: string;
  /** Help / description text shown below the field */
  helpText?: string;
  /** Error message — when set, field enters error state */
  error?: string;
  /** Show required asterisk (default: false) */
  required?: boolean;
  /** Disabled state (default: false) */
  disabled?: boolean;
  /** Styling */
  styling?: FormFieldWrapperStyle;
  /** Extra class */
  className?: string;
  /** The form control (children) */
  children?: unknown;
}

export function FormFieldWrapper(props: FormFieldWrapperProps) {
  const s = props.styling ?? {};
  const hasError = !!props.error;

  const containerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    gap: s.gap ?? '4px',
    width: typeof s.width === 'number' ? `${s.width}px` : (s.width ?? '100%'),
    fontFamily: s.fontFamily ?? 'inherit',
    fontSize: s.fontSize ?? '14px',
    opacity: props.disabled ? '0.6' : '1',
    ...(s.custom ?? {}),
  };

  const labelStyle: Record<string, string> = {
    color: s.labelColor ?? '#374151',
    fontWeight: s.labelFontWeight ?? '500',
    fontSize: s.labelFontSize ?? '14px',
  };

  const helpStyle: Record<string, string> = {
    fontSize: '12px',
    color: hasError ? (s.errorColor ?? '#ef4444') : (s.helpColor ?? '#6b7280'),
    marginTop: '2px',
  };

  return createElement(
    'div',
    {
      className: `form-field ${hasError ? 'form-field--error' : ''} ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Label
    props.label
      ? createElement(
          'label',
          {
            htmlFor: props.htmlFor,
            style: labelStyle,
          },
          props.label,
          props.required
            ? createElement('span', {
                style: { color: s.errorColor ?? '#ef4444', marginLeft: '2px' },
              }, '*')
            : null,
        )
      : null,
    // Field content
    props.children,
    // Help text or error
    props.error
      ? createElement('div', { className: 'form-field__error', style: helpStyle, role: 'alert' }, props.error)
      : props.helpText
        ? createElement('div', { className: 'form-field__help', style: helpStyle }, props.helpText)
        : null,
  );
}

/**
 * Shared input styling builder used by textfield, multiline, texteditor.
 */
export interface InputBaseStyle {
  padding?: string;
  border?: string;
  borderRadius?: string;
  fontSize?: string;
  fontFamily?: string;
  backgroundColor?: string;
  color?: string;
  focusBorderColor?: string;
  errorBorderColor?: string;
  transition?: string;
  custom?: Record<string, string>;
}

export function buildInputStyle(
  s: InputBaseStyle,
  state: { focused: boolean; error: boolean },
): Record<string, string> {
  const borderColor = state.error
    ? (s.errorBorderColor ?? '#ef4444')
    : state.focused
      ? (s.focusBorderColor ?? '#3b82f6')
      : undefined;

  return {
    padding: s.padding ?? '8px 12px',
    border: borderColor ? `1px solid ${borderColor}` : (s.border ?? '1px solid #d1d5db'),
    borderRadius: s.borderRadius ?? '6px',
    fontSize: s.fontSize ?? '14px',
    fontFamily: s.fontFamily ?? 'inherit',
    backgroundColor: s.backgroundColor ?? '#ffffff',
    color: s.color ?? '#1f2937',
    outline: 'none',
    transition: s.transition ?? 'border-color 0.15s',
    width: '100%',
    boxSizing: 'border-box',
    ...(state.focused && borderColor ? { boxShadow: `0 0 0 3px ${borderColor}22` } : {}),
    ...(s.custom ?? {}),
  };
}
