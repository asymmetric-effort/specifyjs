// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Dropdown — A dropdown menu navigation component.
 *
 * Renders a trigger button that toggles a dropdown panel containing
 * menu items. Supports nested submenus, dividers, icons, disabled
 * states, and keyboard dismissal.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import {
  NavWrapper,
  buildNavItemStyle,
  useHover,
} from '../../wrapper/src/NavWrapper';
import type { NavWrapperStyle, NavItemStyle } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface DropdownItem {
  /** Unique identifier for the item */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon rendered as a text span before the label (emoji or text) */
  icon?: string;
  /** Whether the item is disabled (grayed out, non-interactive) */
  disabled?: boolean;
  /** Render as a thin horizontal divider instead of a menu item */
  divider?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Nested submenu items — shows a right chevron and expands on hover */
  children?: DropdownItem[];
}

export interface DropdownProps {
  /** Trigger button text */
  label: string;
  /** Menu items */
  items: DropdownItem[];
  /** Custom styles for the trigger button */
  triggerStyle?: Record<string, string>;
  /** Styling passed to NavWrapper for the dropdown panel */
  menuStyle?: NavWrapperStyle;
  /** Styling for menu items */
  itemStyle?: NavItemStyle;
  /** Placement of the dropdown relative to the trigger (default: 'bottom-start') */
  placement?: 'bottom-start' | 'bottom-end';
  /** Close the dropdown when an item is selected (default: true) */
  closeOnSelect?: boolean;
  /** Width of the dropdown panel (default: '220px') */
  width?: string | number;
}

// -- Internal helpers -------------------------------------------------------

function DropdownMenuItem(props: {
  item: DropdownItem;
  itemStyle: NavItemStyle;
  closeOnSelect: boolean;
  onClose: () => void;
}) {
  const { item, itemStyle, closeOnSelect, onClose } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Divider rendering
  if (item.divider) {
    return createElement('div', {
      role: 'separator',
      style: {
        height: '1px',
        backgroundColor: '#e5e7eb',
        margin: '4px 0',
      },
    });
  }

  const isDisabled = item.disabled === true;

  const baseStyle = buildNavItemStyle(itemStyle, {
    hover: !isDisabled && hover,
    active: false,
  });

  const style: Record<string, string> = {
    ...baseStyle,
    position: 'relative',
    justifyContent: 'space-between',
    ...(isDisabled
      ? {
          color: '#9ca3af',
          cursor: 'default',
          opacity: '0.6',
        }
      : {}),
  };

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    if (hasChildren) {
      setSubmenuOpen((prev: boolean) => !prev);
      return;
    }
    if (item.onClick) item.onClick();
    if (closeOnSelect) onClose();
  }, [isDisabled, hasChildren, item, closeOnSelect, onClose]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter();
    if (hasChildren) setSubmenuOpen(true);
  }, [hasChildren, onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave();
    if (hasChildren) setSubmenuOpen(false);
  }, [hasChildren, onMouseLeave]);

  const leftContent = createElement(
    'span',
    { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
    item.icon
      ? createElement(
          'span',
          { style: { flexShrink: '0' }, 'aria-hidden': 'true' },
          item.icon,
        )
      : null,
    createElement('span', null, item.label),
  );

  const rightIndicator = hasChildren
    ? createElement(
        'span',
        {
          style: { marginLeft: '8px', fontSize: '10px', lineHeight: '1' },
          'aria-hidden': 'true',
        },
        '\u203A',
      )
    : null;

  const submenu =
    hasChildren && submenuOpen
      ? createElement(
          'div',
          {
            style: {
              position: 'absolute',
              left: '100%',
              top: '0',
              zIndex: '1000',
            },
          },
          createElement(
            NavWrapper,
            {
              orientation: 'vertical',
              role: 'menu',
              styling: {
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                width: '200px',
                backgroundColor: '#ffffff',
              },
            },
            ...item.children!.map((child: DropdownItem) =>
              createElement(DropdownMenuItem, {
                key: child.id,
                item: child,
                itemStyle: itemStyle,
                closeOnSelect: closeOnSelect,
                onClose: onClose,
              }),
            ),
          ),
        )
      : null;

  return createElement(
    'div',
    {
      style: { position: 'relative' },
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    },
    createElement(
      'button',
      {
        type: 'button',
        role: 'menuitem',
        style,
        onClick: handleClick,
        disabled: isDisabled || undefined,
        tabIndex: isDisabled ? -1 : 0,
        'aria-disabled': isDisabled ? 'true' : undefined,
        'aria-haspopup': hasChildren || undefined,
        'aria-expanded': hasChildren ? String(submenuOpen) : undefined,
      },
      leftContent,
      rightIndicator,
    ),
    submenu,
  );
}

// -- Dropdown component -----------------------------------------------------

export function Dropdown(props: DropdownProps) {
  const {
    label,
    items,
    triggerStyle,
    menuStyle,
    itemStyle = {},
    placement = 'bottom-start',
    closeOnSelect = true,
    width = '220px',
  } = props;

  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLElement | null>(null);

  const toggle = useCallback(() => {
    setOpen((prev: boolean) => !prev);
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (!open) return;

    const handleDocClick = (e: Event) => {
      const container = containerRef.current;
      if (container && !container.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener('click', handleDocClick, true);
    return () => {
      document.removeEventListener('click', handleDocClick, true);
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        setOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [open]);

  // Trigger button
  const defaultTriggerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontFamily: 'inherit',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    backgroundColor: '#ffffff',
    color: '#1f2937',
    cursor: 'pointer',
    outline: 'none',
    ...(triggerStyle ?? {}),
  };

  const triggerButton = createElement(
    'button',
    {
      type: 'button',
      style: defaultTriggerStyle,
      onClick: toggle,
      'aria-haspopup': 'true',
      'aria-expanded': String(open),
    },
    createElement('span', null, label),
    createElement(
      'span',
      {
        style: {
          marginLeft: '4px',
          fontSize: '10px',
          transition: 'transform 0.15s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
        },
        'aria-hidden': 'true',
      },
      '\u25BC',
    ),
  );

  // Dropdown panel
  const resolvedWidth =
    typeof width === 'number' ? `${width}px` : width;

  const panelStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    ...(placement === 'bottom-end' ? { right: '0' } : { left: '0' }),
    marginTop: '4px',
    zIndex: '999',
  };

  const mergedMenuStyle: NavWrapperStyle = {
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    padding: '4px 0',
    width: resolvedWidth,
    backgroundColor: '#ffffff',
    ...(menuStyle ?? {}),
  };

  const panel = open
    ? createElement(
        'div',
        { style: panelStyle },
        createElement(
          NavWrapper,
          {
            orientation: 'vertical',
            role: 'menu',
            ariaLabel: `${label} menu`,
            styling: mergedMenuStyle,
          },
          ...items.map((item: DropdownItem) =>
            createElement(DropdownMenuItem, {
              key: item.id,
              item,
              itemStyle,
              closeOnSelect,
              onClose: close,
            }),
          ),
        ),
      )
    : null;

  return createElement(
    'div',
    {
      ref: containerRef,
      style: { position: 'relative', display: 'inline-block' },
    },
    triggerButton,
    panel,
  );
}
