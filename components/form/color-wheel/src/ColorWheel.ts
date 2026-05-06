// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ColorWheel — Reusable color picker component with visual color input.
 *
 * Renders a native color input wrapped in a styled container showing
 * the current color as a swatch. Supports onChange callback.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper } from '../../wrapper/src/FormFieldWrapper';

export interface ColorWheelProps {
  /** Current color value (hex string) */
  value?: string;
  /** Called when color changes */
  onChange?: (color: string) => void;
  /** Swatch size in pixels (default: 32) */
  size?: number;
  /** Whether to show hex label below swatch (default: true) */
  showLabel?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** HTML id for the input element */
  id?: string;
}

export function ColorWheel(props: ColorWheelProps) {
  const autoId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const inputId = props.id ?? `cw-${autoId}`;
  const {
    value = '#000000',
    onChange,
    size = 32,
    showLabel = true,
    disabled = false,
    label,
  } = props;

  const [color, setColor] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(
    ((...args: unknown[]) => {
      const e = args[0] as Event;
      const newColor = (e.target as HTMLInputElement).value;
      setColor(newColor);
      onChange?.(newColor);
    }) as (...args: unknown[]) => unknown,
    [onChange],
  );

  const containerStyle: Record<string, string> = {
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  };

  const swatchStyle: Record<string, string> = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '6px',
    border: '2px solid #d1d5db',
    backgroundColor: color,
    cursor: disabled ? 'not-allowed' : 'pointer',
    position: 'relative',
    overflow: 'hidden',
  };

  const inputStyle: Record<string, string> = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    opacity: '0',
    cursor: disabled ? 'not-allowed' : 'pointer',
    border: 'none',
    padding: '0',
  };

  return createElement(FormFieldWrapper, {
    label,
    htmlFor: inputId,
  },
    createElement(
      'div',
      { style: containerStyle },
      createElement(
        'div',
        { style: swatchStyle },
        createElement('input', {
          id: inputId,
          ref: inputRef,
          type: 'color',
          value: color,
          onInput: handleChange,
          disabled,
          style: inputStyle,
          'aria-label': label || 'Color',
        }),
      ),
      showLabel
        ? createElement(
            'span',
            {
              style: {
                fontSize: '11px',
                fontFamily: 'monospace',
                color: '#64748b',
              },
            },
            color,
          )
        : null,
    ),
  );
}
