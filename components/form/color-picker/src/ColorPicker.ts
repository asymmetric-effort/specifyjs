// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ColorPicker — Color selection component with swatch grid,
 * hex input field, and optional preset colors.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useMemo, useRef, useEffect } from '../../../../core/src/hooks/index';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

export interface ColorPickerProps {
  /** Current color value as hex string (e.g. '#ff0000') */
  value: string;
  /** Change handler, receives hex string */
  onChange: (value: string) => void;
  /** Preset color swatches */
  presets?: string[];
  /** Show hex text input */
  showInput?: boolean;
  /** Show alpha/opacity slider (future: reserved) */
  showAlpha?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Label text */
  label?: string;
  /** HTML id for the input element */
  id?: string;
}

const DEFAULT_PRESETS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7', '#cccccc', '#d9d9d9', '#efefef', '#f3f3f3', '#ffffff',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00', '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#e6b8af', '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3', '#c9daf8', '#cfe2f3', '#d9d2e9', '#ead1dc',
];

function isValidHex(s: string): boolean {
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/.test(s);
}

function normalizeHex(s: string): string {
  let h = s.startsWith('#') ? s : `#${s}`;
  if (/^#[0-9a-fA-F]{3}$/.test(h)) {
    h = `#${h[1]}${h[1]}${h[2]}${h[2]}${h[3]}${h[3]}`;
  }
  return h.toLowerCase();
}

export function ColorPicker(props: ColorPickerProps) {
  const inputId = props.id ?? `cp-${Math.random().toString(36).slice(2, 8)}`;
  const {
    value,
    onChange,
    presets = DEFAULT_PRESETS,
    showInput = true,
    showAlpha = false,
    disabled = false,
    label,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync input display when value prop changes
  useEffect(() => {
    setInputValue(value);
  }, [value]);

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

  const handleSwatchClick = useCallback(
    (color: string) => {
      if (disabled) return;
      onChange(normalizeHex(color));
    },
    [disabled, onChange],
  );

  const handleInputChange = useCallback(
    (e: Event) => {
      const raw = (e.target as HTMLInputElement).value;
      setInputValue(raw);
      const hex = raw.startsWith('#') ? raw : `#${raw}`;
      if (isValidHex(hex)) {
        onChange(normalizeHex(hex));
      }
    },
    [onChange],
  );

  const handleInputBlur = useCallback(() => {
    // Reset to current value if invalid
    if (!isValidHex(inputValue.startsWith('#') ? inputValue : `#${inputValue}`)) {
      setInputValue(value);
    }
  }, [inputValue, value]);

  const swatchTriggerStyle: Record<string, string> = {
    width: '36px',
    height: '36px',
    borderRadius: '6px',
    border: '2px solid #d1d5db',
    backgroundColor: value,
    cursor: disabled ? 'not-allowed' : 'pointer',
    flexShrink: '0',
  };

  const triggerContainerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
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
    width: '240px',
  };

  const swatchGridStyle: Record<string, string> = {
    display: 'grid',
    gridTemplateColumns: 'repeat(10, 1fr)',
    gap: '4px',
    marginBottom: showInput ? '8px' : '0',
  };

  const swatches = presets.map((color) => {
    const isSelected = normalizeHex(color) === normalizeHex(value);
    const swatchStyle: Record<string, string> = {
      width: '20px',
      height: '20px',
      borderRadius: '3px',
      backgroundColor: color,
      cursor: disabled ? 'not-allowed' : 'pointer',
      border: isSelected ? '2px solid #1f2937' : '1px solid #e5e7eb',
      boxSizing: 'border-box',
    };

    return createElement('div', {
      key: color,
      style: swatchStyle,
      onClick: () => handleSwatchClick(color),
      onKeyDown: (e: Event) => {
        const key = (e as KeyboardEvent).key;
        if (key === 'Enter' || key === ' ') {
          e.preventDefault();
          handleSwatchClick(color);
        }
      },
      role: 'button',
      tabIndex: disabled ? -1 : 0,
      title: color,
      'aria-label': `Select color ${color}`,
    });
  });

  const hexInput = showInput
    ? createElement(
        'div',
        {
          style: { display: 'flex', alignItems: 'center', gap: '4px' },
        },
        createElement(
          'div',
          {
            style: {
              width: '24px',
              height: '24px',
              borderRadius: '4px',
              backgroundColor: value,
              border: '1px solid #d1d5db',
              flexShrink: '0',
            },
          },
        ),
        createElement('input', {
          type: 'text',
          value: inputValue,
          onInput: handleInputChange,
          onBlur: handleInputBlur,
          disabled,
          style: {
            flex: '1',
            padding: '4px 8px',
            border: '1px solid #d1d5db',
            borderRadius: '4px',
            fontSize: '13px',
            fontFamily: 'monospace',
            outline: 'none',
            color: '#1f2937',
          },
          placeholder: '#000000',
          'aria-label': 'Hex color value',
        }),
      )
    : null;

  const dropdown = isOpen
    ? createElement(
        'div',
        { style: dropdownStyle },
        createElement('div', { style: swatchGridStyle }, ...swatches),
        hexInput,
      )
    : null;

  return createElement(FormFieldWrapper, {
    label,
    disabled,
    htmlFor: inputId,
  },
    createElement(
      'div',
      { ref: containerRef, style: { position: 'relative' } },
      createElement(
        'div',
        {
          style: triggerContainerStyle,
          onClick: disabled ? undefined : () => setIsOpen(!isOpen),
          onKeyDown: disabled ? undefined : (e: Event) => {
            const key = (e as KeyboardEvent).key;
            if (key === 'Enter' || key === ' ') {
              e.preventDefault();
              setIsOpen(!isOpen);
            }
          },
          role: 'button',
          tabIndex: disabled ? -1 : 0,
          'aria-expanded': isOpen ? 'true' : 'false',
          'aria-label': 'Toggle color picker',
        },
        createElement('div', { id: inputId, style: swatchTriggerStyle }),
        showInput
          ? createElement('span', { style: { fontSize: '14px', fontFamily: 'monospace', color: '#1f2937' } }, value)
          : null,
      ),
      dropdown,
    ),
  );
}
