// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ContextMenu — Right-click context menu with nested submenus and keyboard navigation.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useRef, useCallback } from 'specifyjs/hooks';

export interface ContextMenuItem {
  /** Display label */
  label?: string;
  /** Click handler */
  onClick?: () => void;
  /** Optional icon (rendered as text/emoji) */
  icon?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Render as a divider instead of a menu item */
  divider?: boolean;
  /** Nested submenu items */
  children?: ContextMenuItem[];
}

export interface ContextMenuProps {
  /** Menu item definitions */
  items: ContextMenuItem[];
  /** Trigger area children */
  children?: unknown;
}

interface MenuPosition {
  x: number;
  y: number;
}

/**
 * Submenu renderer — handles a single level of the context menu.
 */
function MenuList(props: {
  items: ContextMenuItem[];
  position: MenuPosition;
  onClose: () => void;
  depth: number;
}) {
  const { items, position, onClose, depth } = props;
  const [activeIndex, setActiveIndex] = useState(-1);
  const [submenuOpen, setSubmenuOpen] = useState<number | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Keyboard navigation
  useEffect(() => {
    if (!menuRef.current) return;
    menuRef.current.focus();

    const handler = (e: Event) => {
      const ke = e as KeyboardEvent;
      const actionableItems = items.map((item, i) => ({ item, i })).filter(
        ({ item }) => !item.divider,
      );

      if (ke.key === 'ArrowDown') {
        ke.preventDefault();
        setActiveIndex((prev: number) => {
          const currentIdx = actionableItems.findIndex(({ i }) => i === prev);
          const nextIdx = (currentIdx + 1) % actionableItems.length;
          return actionableItems[nextIdx].i;
        });
      } else if (ke.key === 'ArrowUp') {
        ke.preventDefault();
        setActiveIndex((prev: number) => {
          const currentIdx = actionableItems.findIndex(({ i }) => i === prev);
          const nextIdx = currentIdx <= 0 ? actionableItems.length - 1 : currentIdx - 1;
          return actionableItems[nextIdx].i;
        });
      } else if (ke.key === 'ArrowRight') {
        if (activeIndex >= 0 && items[activeIndex]?.children) {
          setSubmenuOpen(activeIndex);
        }
      } else if (ke.key === 'ArrowLeft') {
        if (depth > 0) onClose();
      } else if (ke.key === 'Enter') {
        ke.preventDefault();
        if (activeIndex >= 0) {
          const item = items[activeIndex];
          if (item.children) {
            setSubmenuOpen(activeIndex);
          } else if (!item.disabled && item.onClick) {
            item.onClick();
            onClose();
          }
        }
      } else if (ke.key === 'Escape') {
        onClose();
      }
    };

    menuRef.current.addEventListener('keydown', handler);
    const el = menuRef.current;
    return () => el.removeEventListener('keydown', handler);
  }, [items, activeIndex, depth, onClose]);

  const menuStyle: Record<string, string> = {
    position: 'fixed',
    left: `${position.x}px`,
    top: `${position.y}px`,
    backgroundColor: '#fff',
    border: '1px solid #e5e7eb',
    borderRadius: '8px',
    boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
    padding: '4px 0',
    minWidth: '180px',
    zIndex: `${10200 + depth}`,
    outline: 'none',
    overflow: 'visible',
  };

  const menuElements = items.map((item: ContextMenuItem, index: number) => {
    if (item.divider) {
      return createElement('div', {
        key: `divider-${index}`,
        style: {
          height: '1px',
          backgroundColor: '#e5e7eb',
          margin: '4px 0',
        },
      });
    }

    const isActive = activeIndex === index;
    const isDisabled = !!item.disabled;
    const hasChildren = !!(item.children && item.children.length > 0);

    const itemStyle: Record<string, string> = {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 12px',
      fontSize: '14px',
      color: isDisabled ? '#9ca3af' : '#1f2937',
      cursor: isDisabled ? 'default' : 'pointer',
      backgroundColor: isActive && !isDisabled ? '#f3f4f6' : 'transparent',
      userSelect: 'none',
      position: 'relative',
    };

    const handleMouseEnter = () => {
      setActiveIndex(index);
      if (hasChildren) {
        setSubmenuOpen(index);
      } else {
        setSubmenuOpen(null);
      }
    };

    const handleClick = () => {
      if (isDisabled) return;
      if (hasChildren) {
        setSubmenuOpen(index);
        return;
      }
      if (item.onClick) {
        item.onClick();
      }
      onClose();
    };

    const itemChildren: unknown[] = [];
    if (item.icon) {
      itemChildren.push(
        createElement('span', { style: { width: '20px', textAlign: 'center', flexShrink: '0' } }, item.icon),
      );
    }
    itemChildren.push(
      createElement('span', { style: { flex: '1' } }, item.label ?? ''),
    );
    if (hasChildren) {
      itemChildren.push(
        createElement('span', { style: { fontSize: '10px', color: '#9ca3af', marginLeft: '8px' } }, '\u25B6'),
      );
    }

    const itemElements: unknown[] = [
      createElement(
        'div',
        {
          key: `item-${index}`,
          style: itemStyle,
          onMouseEnter: handleMouseEnter,
          onClick: handleClick,
          role: 'menuitem',
          'aria-disabled': isDisabled ? 'true' : undefined,
        },
        ...itemChildren,
      ),
    ];

    // Render submenu if open
    if (hasChildren && submenuOpen === index) {
      itemElements.push(
        createElement(MenuList, {
          key: `submenu-${index}`,
          items: item.children!,
          position: { x: position.x + 178, y: position.y + index * 36 },
          onClose: () => setSubmenuOpen(null),
          depth: depth + 1,
        }),
      );
    }

    return createElement('div', { key: `wrap-${index}`, style: { position: 'relative' } }, ...itemElements);
  });

  return createElement(
    'div',
    {
      ref: menuRef,
      style: menuStyle,
      tabIndex: -1,
      role: 'menu',
    },
    ...menuElements,
  );
}

export function ContextMenu(props: ContextMenuProps) {
  const { items, children } = props;
  const [menuPos, setMenuPos] = useState<MenuPosition | null>(null);

  const handleContextMenu = useCallback((e: Event) => {
    e.preventDefault();
    const me = e as MouseEvent;
    setMenuPos({ x: me.clientX, y: me.clientY });
  }, []);

  const closeMenu = useCallback(() => {
    setMenuPos(null);
  }, []);

  // Click outside to close
  useEffect(() => {
    if (!menuPos) return;
    const handler = (e: Event) => {
      closeMenu();
    };
    // Delay to avoid closing immediately
    const timer = setTimeout(() => {
      document.addEventListener('mousedown', handler);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('mousedown', handler);
    };
  }, [menuPos, closeMenu]);

  // Escape to close
  useEffect(() => {
    if (!menuPos) return;
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') closeMenu();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [menuPos, closeMenu]);

  const triggerStyle: Record<string, string> = {
    display: 'contents',
  };

  const elements: unknown[] = [
    createElement('div', { onContextMenu: handleContextMenu, style: triggerStyle }, children),
  ];

  if (menuPos) {
    elements.push(
      createElement(MenuList, {
        items,
        position: menuPos,
        onClose: closeMenu,
        depth: 0,
      }),
    );
  }

  return createElement('div', null, ...elements);
}
