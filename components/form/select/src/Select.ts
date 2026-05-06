// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Select — Custom dropdown select/combobox component.
 *
 * Renders a custom dropdown (not native <select>): trigger shows selected value,
 * dropdown panel with option list, keyboard navigation, search filtering,
 * multiple selection, and clearable support.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useEffect, useRef, useCallback, useMemo, useId } from '../../../../core/src/hooks/index';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface SelectProps {
  /** Available options */
  options: SelectOption[];
  /** Current selected value (string for single, string[] for multiple) */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Enable search/filter by typing */
  searchable?: boolean;
  /** Allow multiple selection */
  multiple?: boolean;
  /** Show clear button */
  clearable?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Error message */
  error?: string;
  /** Label text */
  label?: string;
  /** Help text */
  helpText?: string;
  /** HTML id for the input element */
  id?: string;
}

export function Select(props: SelectProps) {
  const autoId = useId();
  const inputId = props.id ?? autoId;
  const {
    options,
    value,
    onChange,
    placeholder = 'Select...',
    searchable = false,
    multiple = false,
    clearable = false,
    disabled = false,
    error,
    label,
    helpText,
  } = props;

  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo(
    () => (Array.isArray(value) ? value : value ? [value] : []),
    [value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchQuery) return options;
    const q = searchQuery.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery, searchable]);

  const groupedOptions = useMemo(() => {
    const groups: Record<string, SelectOption[]> = {};
    const ungrouped: SelectOption[] = [];
    for (const opt of filteredOptions) {
      if (opt.group) {
        if (!groups[opt.group]) groups[opt.group] = [];
        groups[opt.group].push(opt);
      } else {
        ungrouped.push(opt);
      }
    }
    return { groups, ungrouped };
  }, [filteredOptions]);

  const displayText = useMemo(() => {
    if (selectedValues.length === 0) return '';
    const labels = selectedValues
      .map((v) => options.find((o) => o.value === v))
      .filter(Boolean)
      .map((o) => o!.label);
    return labels.join(', ');
  }, [selectedValues, options]);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: Event) => {
      const target = e.target as Node;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = useCallback(
    (optionValue: string) => {
      if (multiple) {
        const newValues = selectedValues.includes(optionValue)
          ? selectedValues.filter((v) => v !== optionValue)
          : [...selectedValues, optionValue];
        onChange(newValues);
      } else {
        onChange(optionValue);
        setIsOpen(false);
        setSearchQuery('');
      }
    },
    [multiple, selectedValues, onChange],
  );

  const handleClear = useCallback(
    (e: Event) => {
      e.stopPropagation();
      onChange(multiple ? [] : '');
    },
    [multiple, onChange],
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (disabled) return;
      const key = e.key;

      if (!isOpen && (key === 'Enter' || key === ' ' || key === 'ArrowDown')) {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
        return;
      }

      if (!isOpen) return;

      if (key === 'Escape') {
        setIsOpen(false);
        setSearchQuery('');
        return;
      }

      if (key === 'ArrowDown') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.min(prev + 1, filteredOptions.length - 1));
      } else if (key === 'ArrowUp') {
        e.preventDefault();
        setFocusedIndex((prev) => Math.max(prev - 1, 0));
      } else if (key === 'Enter' && focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
        e.preventDefault();
        const opt = filteredOptions[focusedIndex];
        if (!opt.disabled) handleSelect(opt.value);
      }
    },
    [disabled, isOpen, focusedIndex, filteredOptions, handleSelect],
  );

  const triggerStyle: Record<string, string> = {
    ...buildInputStyle({}, { focused: isOpen, error: !!error }),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minHeight: '38px',
    userSelect: 'none',
  };

  const dropdownStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    marginTop: '4px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    zIndex: '1000',
    maxHeight: '240px',
    overflowY: 'auto',
  };

  const renderOption = (opt: SelectOption, idx: number) => {
    const isSelected = selectedValues.includes(opt.value);
    const isFocused = idx === focusedIndex;

    const optStyle: Record<string, string> = {
      padding: '8px 12px',
      cursor: opt.disabled ? 'not-allowed' : 'pointer',
      backgroundColor: isFocused ? '#f3f4f6' : isSelected ? '#eff6ff' : 'transparent',
      color: opt.disabled ? '#9ca3af' : '#1f2937',
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '14px',
    };

    return createElement(
      'div',
      {
        key: opt.value,
        style: optStyle,
        onClick: opt.disabled ? undefined : () => handleSelect(opt.value),
        onMouseEnter: () => setFocusedIndex(idx),
        role: 'option',
        'aria-selected': isSelected ? 'true' : 'false',
        'aria-disabled': opt.disabled ? 'true' : undefined,
      },
      multiple && isSelected
        ? createElement('span', { style: { color: '#3b82f6', fontWeight: '700' } }, '\u2713')
        : null,
      opt.label,
    );
  };

  // Build flat option list with group headers interleaved
  const renderOptions = () => {
    const elements: unknown[] = [];
    let flatIdx = 0;

    const { groups, ungrouped } = groupedOptions;

    for (const opt of ungrouped) {
      elements.push(renderOption(opt, flatIdx++));
    }

    for (const groupName of Object.keys(groups)) {
      elements.push(
        createElement(
          'div',
          {
            key: `group-${groupName}`,
            style: {
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: '600',
              color: '#6b7280',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            },
          },
          groupName,
        ),
      );
      for (const opt of groups[groupName]) {
        elements.push(renderOption(opt, flatIdx++));
      }
    }

    if (elements.length === 0) {
      elements.push(
        createElement(
          'div',
          { style: { padding: '8px 12px', color: '#9ca3af', fontSize: '14px' } },
          'No options',
        ),
      );
    }

    return elements;
  };

  const chevron = createElement(
    'span',
    {
      style: {
        marginLeft: '8px',
        fontSize: '10px',
        transition: 'transform 0.15s',
        transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
        color: '#6b7280',
      },
    },
    '\u25BC',
  );

  const trigger = createElement(
    'div',
    {
      style: triggerStyle,
      id: inputId,
      onClick: disabled ? undefined : () => { setIsOpen(!isOpen); setFocusedIndex(-1); },
      onKeyDown: handleKeyDown,
      tabIndex: disabled ? -1 : 0,
      role: 'combobox',
      'aria-expanded': isOpen ? 'true' : 'false',
      'aria-haspopup': 'listbox',
    },
    createElement(
      'span',
      { style: { flex: '1', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: displayText ? '#1f2937' : '#9ca3af' } },
      displayText || placeholder,
    ),
    createElement(
      'span',
      { style: { display: 'flex', alignItems: 'center', gap: '4px' } },
      clearable && selectedValues.length > 0
        ? createElement(
            'span',
            {
              onClick: handleClear,
              onKeyDown: (e: Event) => {
                const key = (e as KeyboardEvent).key;
                if (key === 'Enter' || key === ' ') {
                  e.preventDefault();
                  e.stopPropagation();
                  handleClear(e);
                }
              },
              style: { cursor: 'pointer', color: '#9ca3af', fontSize: '14px', lineHeight: '1' },
              role: 'button',
              tabIndex: 0,
              'aria-label': 'Clear selection',
            },
            '\u2715',
          )
        : null,
      chevron,
    ),
  );

  const searchInput = searchable && isOpen
    ? createElement('input', {
        type: 'text',
        value: searchQuery,
        onInput: (e: Event) => {
          setSearchQuery((e.target as HTMLInputElement).value);
          setFocusedIndex(0);
        },
        placeholder: 'Search...',
        style: {
          width: '100%',
          boxSizing: 'border-box',
          padding: '8px 12px',
          border: 'none',
          borderBottom: '1px solid #e5e7eb',
          outline: 'none',
          fontSize: '14px',
        },
      })
    : null;

  const dropdown = isOpen
    ? createElement(
        'div',
        { style: dropdownStyle, role: 'listbox' },
        searchInput,
        ...renderOptions(),
      )
    : null;

  return createElement(FormFieldWrapper, {
    label,
    error,
    helpText,
    disabled,
    htmlFor: inputId,
  },
    createElement(
      'div',
      {
        ref: containerRef,
        style: { position: 'relative' },
      },
      trigger,
      dropdown,
    ),
  );
}
