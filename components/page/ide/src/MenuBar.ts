// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * MenuBar -- Horizontal menu bar with dropdown menus.
 *
 * Renders a row of menu buttons. Clicking a button toggles its dropdown.
 * Each dropdown contains action items that fire the `onAction` callback.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single item inside a dropdown menu. */
export interface MenuItem {
  label: string;
  action: string;
}

/** Props for the MenuBar component. */
export interface MenuBarProps {
  /** Ordered list of top-level menu names. */
  menus: string[];
  /** Map of menu name to its dropdown items. Menus without entries have no dropdown. */
  menuItems: Record<string, MenuItem[]>;
  /** Callback fired when a dropdown item is clicked, receiving the action string. */
  onAction: (action: string) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const menuBarStyle: Record<string, string> = {
  height: '28px',
  backgroundColor: '#3c3c3c',
  display: 'flex',
  alignItems: 'center',
  padding: '0 8px',
  gap: '2px',
  flexShrink: '0',
  position: 'relative',
};

const menuItemStyleBase: Record<string, string> = {
  padding: '3px 8px',
  fontSize: '12px',
  color: '#cccccc',
  cursor: 'pointer',
  borderRadius: '3px',
  backgroundColor: 'transparent',
  border: 'none',
  position: 'relative',
};

const menuItemStyleActive: Record<string, string> = {
  ...menuItemStyleBase,
  backgroundColor: 'rgba(255,255,255,0.1)',
};

const dropdownStyle: Record<string, string> = {
  position: 'absolute',
  top: '100%',
  left: '0',
  minWidth: '180px',
  backgroundColor: '#2d2d2d',
  border: '1px solid #454545',
  borderRadius: '4px',
  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
  padding: '4px 0',
  zIndex: '1000',
};

const dropdownItemStyle: Record<string, string> = {
  display: 'block',
  width: '100%',
  padding: '6px 16px',
  fontSize: '12px',
  color: '#cccccc',
  backgroundColor: 'transparent',
  border: 'none',
  textAlign: 'left',
  cursor: 'pointer',
  transition: 'background 0.1s',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A horizontal menu bar that manages its own open/close state internally.
 * Dropdown items fire the provided `onAction` callback.
 */
export function MenuBar(props: MenuBarProps) {
  const [activeMenu, setActiveMenu] = useState<number>(-1);

  const handleMenuClick = useCallback((index: number) => {
    setActiveMenu((prev: number) => prev === index ? -1 : index);
  }, []);

  const handleAction = useCallback((action: string) => {
    props.onAction(action);
    setActiveMenu(-1);
  }, [props.onAction]);

  const menuElements = props.menus.map((menu, i) => {
    const children: Array<unknown> = [menu];
    const isActive = activeMenu === i;

    if (isActive && props.menuItems[menu]) {
      children.push(
        createElement(
          'div',
          {
            key: 'dropdown',
            style: dropdownStyle,
            className: 'ide__menu-dropdown',
          },
          ...props.menuItems[menu].map((item, j) =>
            createElement(
              'button',
              {
                key: String(j),
                style: dropdownItemStyle,
                onClick: (e: Event) => {
                  e.stopPropagation();
                  handleAction(item.action);
                },
                role: 'menuitem',
              },
              item.label,
            ),
          ),
        ),
      );
    }

    return createElement(
      'button',
      {
        key: String(i),
        style: isActive ? menuItemStyleActive : menuItemStyleBase,
        role: 'menuitem',
        'aria-label': menu,
        onClick: () => handleMenuClick(i),
      },
      ...children,
    );
  });

  return createElement(
    'div',
    { className: 'ide__menu-bar', style: menuBarStyle, role: 'menubar' },
    ...menuElements,
  );
}
