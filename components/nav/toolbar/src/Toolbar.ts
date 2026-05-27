// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Toolbar — Horizontal toolbar with button groups.
 *
 * Renders a row of buttons, separators (vertical lines), and spacers (flex-grow).
 * Supports size and variant props for consistent toolbar styling.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';
import { NavWrapper, useHover } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface ToolbarItem {
  /** Unique identifier */
  id: string;
  /** Display label (optional if icon provided) */
  label?: string;
  /** Icon text (emoji or character) */
  icon?: string;
  /** Item type — 'button' has momentary press, 'toggle' stays pressed until clicked again */
  type: 'button' | 'toggle' | 'separator' | 'dropdown' | 'spacer';
  /** Click handler */
  onClick?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is in an active/pressed state (used by toggle) */
  active?: boolean;
}

export type ToolbarSize = 'sm' | 'md' | 'lg';
export type ToolbarVariant = 'flat' | 'raised';

export interface ToolbarProps {
  /** Toolbar items */
  items: ToolbarItem[];
  /** Size (default: 'md') */
  size?: ToolbarSize;
  /** Visual variant (default: 'flat') */
  variant?: ToolbarVariant;
}

// -- Size map ---------------------------------------------------------------

const SIZE_MAP: Record<ToolbarSize, { height: string; padding: string; fontSize: string; iconSize: string }> = {
  sm: { height: '28px', padding: '4px 8px', fontSize: '12px', iconSize: '14px' },
  md: { height: '36px', padding: '6px 12px', fontSize: '14px', iconSize: '16px' },
  lg: { height: '44px', padding: '8px 16px', fontSize: '16px', iconSize: '18px' },
};

// -- Internal components ----------------------------------------------------

function ToolbarButton(props: {
  item: ToolbarItem;
  size: ToolbarSize;
  variant: ToolbarVariant;
}) {
  const { item, size, variant } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const s = SIZE_MAP[size];
  const isDisabled = item.disabled === true;
  const isToggle = item.type === 'toggle';

  // For toggle buttons, active state comes from props (managed externally)
  // For click buttons, pressed state is momentary (mousedown → mouseup)
  const [pressed, setPressed] = useState(false);
  const isActive = isToggle ? item.active === true : pressed;

  const handleClick = useCallback(() => {
    if (!isDisabled && item.onClick) {
      item.onClick();
    }
  }, [isDisabled, item]);

  // Momentary press for non-toggle buttons
  const handleMouseDown = useCallback(() => {
    if (!isDisabled && !isToggle) setPressed(true);
  }, [isDisabled, isToggle]);

  const handleMouseUp = useCallback(() => {
    if (!isToggle) setPressed(false);
  }, [isToggle]);

  const handleMouseLeaveBtn = useCallback(() => {
    onMouseLeave();
    if (!isToggle) setPressed(false);
  }, [isToggle, onMouseLeave]);

  const style: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    height: s.height,
    padding: s.padding,
    fontSize: s.fontSize,
    fontFamily: 'inherit',
    border: variant === 'raised' ? '1px solid #d1d5db' : '1px solid transparent',
    borderRadius: '4px',
    backgroundColor: isActive
      ? '#e0e7ff'
      : (!isDisabled && hover)
        ? '#f3f4f6'
        : variant === 'raised'
          ? '#ffffff'
          : 'transparent',
    color: isDisabled ? '#9ca3af' : isActive ? '#2563eb' : '#374151',
    cursor: isDisabled ? 'default' : 'pointer',
    opacity: isDisabled ? '0.5' : '1',
    outline: 'none',
    transition: 'background-color 0.15s',
  };

  const iconEl = item.icon
    ? createElement(
        'span',
        { style: { fontSize: s.iconSize }, 'aria-hidden': 'true' },
        item.icon,
      )
    : null;

  const labelEl = item.label
    ? createElement('span', null, item.label)
    : null;

  const dropdownIndicator = item.type === 'dropdown'
    ? createElement(
        'span',
        { style: { fontSize: '10px', marginLeft: '2px' }, 'aria-hidden': 'true' },
        '\u25BC',
      )
    : null;

  return createElement(
    'button',
    {
      type: 'button',
      style,
      onClick: handleClick,
      onMouseDown: handleMouseDown,
      onMouseUp: handleMouseUp,
      onMouseEnter,
      onMouseLeave: handleMouseLeaveBtn,
      disabled: isDisabled || undefined,
      'aria-pressed': isToggle ? isActive : undefined,
      'aria-label': item.label || item.id,
      title: item.label || item.id,
    },
    iconEl,
    labelEl,
    dropdownIndicator,
  );
}

// -- Main component ---------------------------------------------------------

export function Toolbar(props: ToolbarProps) {
  const {
    items,
    size = 'md',
    variant = 'flat',
  } = props;

  const s = SIZE_MAP[size];

  const children = items.map((item: ToolbarItem) => {
    if (item.type === 'separator') {
      return createElement('div', {
        key: item.id,
        role: 'separator',
        'aria-orientation': 'vertical',
        style: {
          width: '1px',
          height: s.height,
          backgroundColor: '#d1d5db',
          margin: '0 4px',
          flexShrink: '0',
        },
      });
    }

    if (item.type === 'spacer') {
      return createElement('div', {
        key: item.id,
        style: { flex: '1' },
        'aria-hidden': 'true',
      });
    }

    // button, toggle, or dropdown
    return createElement(ToolbarButton, {
      key: item.id,
      item,
      size,
      variant,
    });
  });

  return createElement(
    NavWrapper,
    {
      orientation: 'horizontal',
      role: 'toolbar' as string,
      ariaLabel: 'Toolbar',
      keyboardNav: true,
      styling: {
        border: variant === 'raised' ? '1px solid #e5e7eb' : 'none',
        borderRadius: variant === 'raised' ? '8px' : '0',
        padding: '4px',
        backgroundColor: variant === 'raised' ? '#ffffff' : 'transparent',
        boxShadow: variant === 'raised' ? '0 1px 3px rgba(0,0,0,0.1)' : undefined,
        custom: { gap: '2px', alignItems: 'center' },
      },
    },
    ...children,
  );
}
