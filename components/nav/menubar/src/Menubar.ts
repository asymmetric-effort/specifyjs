// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Menubar — Horizontal menu bar with dropdown menus.
 *
 * Renders a horizontal bar of menu triggers. Hovering/clicking opens dropdown
 * panels with menu items that support shortcuts, icons, dividers, disabled
 * states, and nested submenus. Full keyboard navigation with arrow keys,
 * Enter to select, and Escape to close. Proper ARIA menubar/menu/menuitem roles.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import { useHover } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface MenuItem {
  /** Display label */
  label: string;
  /** Click handler */
  onClick?: () => void;
  /** Keyboard shortcut hint (e.g. 'Ctrl+S') */
  shortcut?: string;
  /** Icon text (emoji or character) */
  icon?: string;
  /** Render as a divider line */
  divider?: boolean;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Nested submenu items */
  children?: MenuItem[];
}

export interface MenuDefinition {
  /** Top-level menu label */
  label: string;
  /** Items in this menu */
  items: MenuItem[];
}

export interface MenubarProps {
  /** Array of top-level menu definitions */
  menus: MenuDefinition[];
}

// -- Internal: MenuItem renderer -------------------------------------------

function MenuItemRow(props: {
  item: MenuItem;
  onClose: () => void;
  index: number;
}) {
  const { item, onClose, index } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const [submenuOpen, setSubmenuOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

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

  const handleClick = useCallback(() => {
    if (isDisabled) return;
    if (hasChildren) {
      setSubmenuOpen((prev: boolean) => !prev);
      return;
    }
    if (item.onClick) item.onClick();
    onClose();
  }, [isDisabled, hasChildren, item, onClose]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter();
    if (hasChildren) setSubmenuOpen(true);
  }, [hasChildren, onMouseEnter]);

  const handleMouseLeave = useCallback(() => {
    onMouseLeave();
    if (hasChildren) setSubmenuOpen(false);
  }, [hasChildren, onMouseLeave]);

  const style: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 16px',
    fontSize: '13px',
    fontFamily: 'inherit',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    cursor: isDisabled ? 'default' : 'pointer',
    backgroundColor: !isDisabled && hover ? '#f3f4f6' : 'transparent',
    color: isDisabled ? '#9ca3af' : '#1f2937',
    opacity: isDisabled ? '0.6' : '1',
    transition: 'background-color 0.1s',
    boxSizing: 'border-box',
  };

  const leftContent = createElement(
    'span',
    { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
    item.icon
      ? createElement('span', { style: { width: '16px', textAlign: 'center' }, 'aria-hidden': 'true' }, item.icon)
      : createElement('span', { style: { width: '16px' } }),
    createElement('span', null, item.label),
  );

  const rightContent = hasChildren
    ? createElement('span', { style: { fontSize: '10px', color: '#9ca3af' }, 'aria-hidden': 'true' }, '\u25B6')
    : item.shortcut
      ? createElement(
          'span',
          { style: { fontSize: '11px', color: '#9ca3af', marginLeft: '24px' } },
          item.shortcut,
        )
      : null;

  const submenu = hasChildren && submenuOpen
    ? createElement(
        'div',
        {
          style: {
            position: 'absolute',
            left: '100%',
            top: '0',
            zIndex: '1001',
          },
        },
        createElement(
          'div',
          {
            role: 'menu',
            style: {
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '4px 0',
              minWidth: '180px',
            },
          },
          ...item.children!.map((child: MenuItem, i: number) =>
            createElement(MenuItemRow, {
              key: String(i),
              item: child,
              onClose,
              index: i,
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
        tabIndex: -1,
        'aria-disabled': isDisabled || undefined,
        'aria-haspopup': hasChildren || undefined,
        'aria-expanded': hasChildren ? submenuOpen : undefined,
      },
      leftContent,
      rightContent,
    ),
    submenu,
  );
}

// -- Internal: Single top-level menu trigger + panel -----------------------

function MenuTrigger(props: {
  menu: MenuDefinition;
  index: number;
  isOpen: boolean;
  anyOpen: boolean;
  onOpen: (index: number) => void;
  onClose: () => void;
}) {
  const { menu, index, isOpen, anyOpen, onOpen, onClose } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const triggerRef = useRef<HTMLElement | null>(null);

  const handleClick = useCallback(() => {
    if (isOpen) {
      onClose();
    } else {
      onOpen(index);
    }
  }, [isOpen, index, onOpen, onClose]);

  const handleMouseEnter = useCallback(() => {
    onMouseEnter();
    // If any menu is already open, hovering switches to this menu
    if (anyOpen && !isOpen) {
      onOpen(index);
    }
  }, [anyOpen, isOpen, index, onOpen, onMouseEnter]);

  const triggerStyle: Record<string, string> = {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '6px 12px',
    fontSize: '13px',
    fontFamily: 'inherit',
    border: 'none',
    outline: 'none',
    cursor: 'pointer',
    backgroundColor: isOpen ? '#e5e7eb' : hover ? '#f3f4f6' : 'transparent',
    color: '#1f2937',
    borderRadius: '4px',
    transition: 'background-color 0.1s',
  };

  const panel = isOpen
    ? createElement(
        'div',
        {
          style: {
            position: 'absolute',
            top: '100%',
            left: '0',
            zIndex: '1000',
            marginTop: '2px',
          },
        },
        createElement(
          'div',
          {
            role: 'menu',
            'aria-label': `${menu.label} menu`,
            style: {
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '6px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
              padding: '4px 0',
              minWidth: '200px',
            },
          },
          ...menu.items.map((item: MenuItem, i: number) =>
            createElement(MenuItemRow, {
              key: String(i),
              item,
              onClose,
              index: i,
            }),
          ),
        ),
      )
    : null;

  return createElement(
    'div',
    {
      style: { position: 'relative', display: 'inline-block' },
      onMouseEnter: handleMouseEnter,
      onMouseLeave,
    },
    createElement(
      'button',
      {
        ref: triggerRef,
        type: 'button',
        role: 'menuitem',
        style: triggerStyle,
        onClick: handleClick,
        'aria-haspopup': 'true',
        'aria-expanded': String(isOpen),
        tabIndex: 0,
      },
      menu.label,
    ),
    panel,
  );
}

// -- Main Menubar component ------------------------------------------------

export function Menubar(props: MenubarProps) {
  const { menus } = props;

  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleOpen = useCallback((index: number) => {
    setOpenIndex(index);
  }, []);

  const handleClose = useCallback(() => {
    setOpenIndex(null);
  }, []);

  // Close on outside click
  useEffect(() => {
    if (openIndex === null) return;

    const handleDocClick = (e: Event) => {
      const container = containerRef.current;
      if (container && !container.contains(e.target as Node)) {
        setOpenIndex(null);
      }
    };

    document.addEventListener('click', handleDocClick, true);
    return () => {
      document.removeEventListener('click', handleDocClick, true);
    };
  }, [openIndex]);

  // Keyboard navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;

      if (ke.key === 'Escape') {
        setOpenIndex(null);
        return;
      }

      if (ke.key === 'ArrowRight') {
        ke.preventDefault();
        setOpenIndex((prev: number | null) => {
          if (prev === null) return 0;
          return (prev + 1) % menus.length;
        });
        return;
      }

      if (ke.key === 'ArrowLeft') {
        ke.preventDefault();
        setOpenIndex((prev: number | null) => {
          if (prev === null) return menus.length - 1;
          return (prev - 1 + menus.length) % menus.length;
        });
        return;
      }

      if (ke.key === 'ArrowDown' && openIndex !== null) {
        ke.preventDefault();
        // Focus first menuitem in the open panel
        const panel = container.querySelector('[role="menu"]');
        if (panel) {
          const first = panel.querySelector('[role="menuitem"]') as HTMLElement | null;
          if (first) first.focus();
        }
        return;
      }

      if (ke.key === 'Enter' || ke.key === ' ') {
        // Let the button handle its own click
        return;
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [openIndex, menus.length]);

  const triggers = menus.map((menu: MenuDefinition, index: number) =>
    createElement(MenuTrigger, {
      key: String(index),
      menu,
      index,
      isOpen: openIndex === index,
      anyOpen: openIndex !== null,
      onOpen: handleOpen,
      onClose: handleClose,
    }),
  );

  return createElement(
    'div',
    {
      ref: containerRef,
      role: 'menubar',
      'aria-label': 'Menu bar',
      style: {
        display: 'flex',
        alignItems: 'center',
        backgroundColor: '#ffffff',
        borderBottom: '1px solid #e5e7eb',
        padding: '2px 4px',
        fontFamily: 'inherit',
        fontSize: '13px',
        gap: '2px',
      },
    },
    ...triggers,
  );
}
