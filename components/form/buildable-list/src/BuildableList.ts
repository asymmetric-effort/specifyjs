// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BuildableList — Ordered string-list builder with add, edit, delete.
 *
 * Internally uses a Set for deduplication while preserving insertion order.
 * The `value` prop and `onChange` callback use `string[]`.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useMemo, useRef } from 'specifyjs/hooks';
import { FormFieldWrapper, buildInputStyle } from '../../wrapper/src/FormFieldWrapper';

export interface BuildableListProps {
  /** Current list of strings (controlled). Internally a Set — no duplicates. */
  value: string[];
  /** Called when the list changes (add, edit, delete). Returns the new list. */
  onChange: (value: string[]) => void;
  /** Orientation of the rendered list. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Where the text input appears when adding. Default: 'below' */
  inputPosition?: 'above' | 'below';
  /** Delimiter shown between items in the rendered list. Default: ', ' for horizontal, newline for vertical */
  delimiter?: string;
  /** Placeholder text for the input field. Default: 'Add item...' */
  placeholder?: string;
  /** Whether the control is disabled. Default: false */
  disabled?: boolean;
  /** Label for the control */
  label?: string;
  /** Maximum number of items. Default: unlimited */
  maxItems?: number;
}

/** Mode of the input row: adding a new item or editing an existing one. */
type InputMode =
  | { type: 'closed' }
  | { type: 'add' }
  | { type: 'edit'; index: number; original: string };

export function BuildableList(props: BuildableListProps) {
  const {
    value,
    onChange,
    orientation = 'vertical',
    inputPosition = 'below',
    delimiter: delimiterProp,
    placeholder = 'Add item...',
    disabled = false,
    label,
    maxItems,
  } = props;

  const delimiter = delimiterProp ?? (orientation === 'horizontal' ? ', ' : '\n');

  // Deduplicated ordered list derived from value prop
  const items = useMemo(() => Array.from(new Set(value)), [value]);

  const [mode, setMode] = useState<InputMode>({ type: 'closed' });
  const [inputValue, setInputValue] = useState('');
  const [duplicate, setDuplicate] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Helpers ──────────────────────────────────────────────────────────

  const openAdd = useCallback(() => {
    if (disabled) return;
    if (maxItems !== undefined && items.length >= maxItems) return;
    setMode({ type: 'add' });
    setInputValue('');
    setDuplicate(false);
  }, [disabled, maxItems, items.length]);

  const openEdit = useCallback(
    (index: number) => {
      if (disabled) return;
      setMode({ type: 'edit', index, original: items[index] });
      setInputValue(items[index]);
      setDuplicate(false);
    },
    [disabled, items],
  );

  const closeInput = useCallback(() => {
    setMode({ type: 'closed' });
    setInputValue('');
    setDuplicate(false);
  }, []);

  const handleConfirm = useCallback(() => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (mode.type === 'add') {
      // Duplicate check
      if (items.includes(trimmed)) {
        setDuplicate(true);
        setInputValue('');
        return;
      }
      onChange([...items, trimmed]);
      setInputValue('');
      setDuplicate(false);
      // input stays open for rapid entry
    } else if (mode.type === 'edit') {
      if (trimmed === mode.original) {
        // No change — just close
        closeInput();
        return;
      }
      // Check if the new value conflicts with another item
      if (items.includes(trimmed)) {
        setDuplicate(true);
        return;
      }
      const next = items.slice();
      next[mode.index] = trimmed;
      onChange(next);
      closeInput();
    }
  }, [inputValue, mode, items, onChange, closeInput]);

  const handleDelete = useCallback(() => {
    if (mode.type === 'edit') {
      const next = items.filter((_: string, i: number) => i !== mode.index);
      onChange(next);
      closeInput();
    }
  }, [mode, items, onChange, closeInput]);

  const handleInputKeyDown = useCallback(
    (e: Event) => {
      const key = (e as KeyboardEvent).key;
      if (key === 'Enter') {
        e.preventDefault();
        handleConfirm();
      } else if (key === 'Escape') {
        e.preventDefault();
        closeInput();
      }
    },
    [handleConfirm, closeInput],
  );

  const handleContainerKeyDown = useCallback(
    (e: Event) => {
      if (disabled) return;
      const key = (e as KeyboardEvent).key;
      if (key === '+' && mode.type === 'closed') {
        e.preventDefault();
        openAdd();
      }
    },
    [disabled, mode, openAdd],
  );

  // ── Styles ───────────────────────────────────────────────────────────

  const containerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  };

  const listContainerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: orientation === 'vertical' ? 'column' : 'row',
    flexWrap: orientation === 'horizontal' ? 'wrap' : 'nowrap',
    gap: orientation === 'vertical' ? '2px' : '0',
    alignItems: orientation === 'horizontal' ? 'center' : 'stretch',
  };

  const itemStyle: Record<string, string> = {
    padding: '4px 8px',
    cursor: disabled ? 'default' : 'pointer',
    borderRadius: '4px',
    fontSize: '14px',
    color: '#1f2937',
    backgroundColor: 'transparent',
    transition: 'background-color 0.1s',
    border: '1px solid transparent',
    userSelect: 'none',
  };

  const buttonBase: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: '16px',
    fontWeight: '700',
    lineHeight: '1',
    padding: '4px 10px',
    color: '#374151',
    transition: 'background-color 0.15s, border-color 0.15s',
  };

  const inputRowStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  };

  const inputStyle = buildInputStyle({}, { focused: false, error: duplicate });

  // ── Render pieces ────────────────────────────────────────────────────

  // List items
  const listItems: unknown[] = [];
  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    // Add delimiter between horizontal items
    if (orientation === 'horizontal' && i > 0) {
      listItems.push(
        createElement('span', {
          key: `delim-${i}`,
          style: { color: '#9ca3af', fontSize: '14px', userSelect: 'none' },
          'aria-hidden': 'true',
        }, delimiter),
      );
    }
    listItems.push(
      createElement('span', {
        key: `item-${i}`,
        role: 'listitem',
        tabIndex: disabled ? -1 : 0,
        style: itemStyle,
        onClick: disabled ? undefined : () => openEdit(i),
        onKeyDown: disabled
          ? undefined
          : (e: Event) => {
              if ((e as KeyboardEvent).key === 'Enter') openEdit(i);
            },
      }, item),
    );
  }

  const listEl = createElement(
    'div',
    { role: 'list', style: listContainerStyle },
    ...listItems,
  );

  // Add button (+)
  const addBtnDisabled = disabled || (maxItems !== undefined && items.length >= maxItems);
  const addButton = createElement('button', {
    type: 'button',
    'aria-label': 'Add item',
    style: {
      ...buttonBase,
      opacity: addBtnDisabled ? '0.5' : '1',
      cursor: addBtnDisabled ? 'not-allowed' : 'pointer',
    },
    disabled: addBtnDisabled,
    onClick: addBtnDisabled ? undefined : openAdd,
  }, '+');

  // Input row
  let inputRow: unknown = null;
  if (mode.type !== 'closed') {
    const okBtn = createElement('button', {
      type: 'button',
      'aria-label': 'Confirm',
      style: { ...buttonBase, fontSize: '13px', padding: '4px 8px' },
      onClick: handleConfirm,
    }, 'OK');

    const deleteBtn =
      mode.type === 'edit'
        ? createElement('button', {
            type: 'button',
            'aria-label': 'Delete',
            style: { ...buttonBase, fontSize: '13px', padding: '4px 8px', color: '#ef4444' },
            onClick: handleDelete,
          }, 'X')
        : null;

    inputRow = createElement(
      'div',
      { style: inputRowStyle, className: 'buildable-list__input-row' },
      createElement('input', {
        ref: inputRef,
        type: 'text',
        value: inputValue,
        placeholder,
        'aria-label': mode.type === 'edit' ? 'Edit item' : 'New item',
        style: { ...inputStyle, flex: '1', minWidth: '0' },
        autoFocus: true,
        onInput: (e: Event) => {
          setInputValue((e.target as HTMLInputElement).value);
          setDuplicate(false);
        },
        onKeyDown: handleInputKeyDown,
      }),
      okBtn,
      deleteBtn,
    );
  }

  // Assemble main body: list + add button, with input row above or below
  const bodyParts: unknown[] = [];

  if (mode.type !== 'closed' && inputPosition === 'above') {
    bodyParts.push(inputRow);
  }

  // Row with list + add button
  bodyParts.push(
    createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'flex-start',
          gap: '8px',
        },
      },
      listEl,
      addButton,
    ),
  );

  if (mode.type !== 'closed' && inputPosition === 'below') {
    bodyParts.push(inputRow);
  }

  const body = createElement(
    'div',
    {
      style: containerStyle,
      tabIndex: 0,
      onKeyDown: handleContainerKeyDown,
      className: 'buildable-list',
    },
    ...bodyParts,
  );

  return createElement(
    FormFieldWrapper,
    { label, disabled },
    body,
  );
}
