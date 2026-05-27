// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Sidebar — Collapsible sidebar navigation component.
 *
 * Renders a vertical navigation panel with nested sections that expand on click,
 * badge indicators, icon-only collapsed mode, and tooltip labels when collapsed.
 */

import { createElement, type SpecNode } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';
import { NavWrapper, useHover, buildNavItemStyle } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface SidebarItem {
  /** Unique identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon (emoji or text character) */
  icon?: string;
  /** Nested child items */
  children?: SidebarItem[];
  /** Optional badge text (e.g. count) */
  badge?: string;
}

export interface SidebarProps {
  /** Navigation items */
  items: SidebarItem[];
  /** Whether the sidebar is collapsed to icon-only mode */
  collapsed?: boolean;
  /** Called to toggle collapse state */
  onToggleCollapse?: () => void;
  /** Currently selected item id */
  selectedId?: string;
  /** Called when an item is selected */
  onSelect?: (id: string) => void;
  /** Expanded width (default: '240px') */
  width?: string | number;
  /** Collapsed width (default: '56px') */
  collapsedWidth?: string | number;
}

// -- Internal components ----------------------------------------------------

function SidebarNavItem(props: {
  item: SidebarItem;
  collapsed: boolean;
  selectedId?: string;
  onSelect?: (id: string) => void;
  depth: number;
}): SpecNode {
  const { item, collapsed, selectedId, onSelect, depth } = props;
  const { hover, onMouseEnter, onMouseLeave } = useHover();
  const [expanded, setExpanded] = useState(false);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = item.id === selectedId;

  const handleClick = useCallback(() => {
    if (hasChildren && !collapsed) {
      setExpanded((prev: boolean) => !prev);
    }
    if (onSelect) {
      onSelect(item.id);
    }
  }, [hasChildren, collapsed, onSelect, item.id]);

  const paddingLeft = collapsed ? '0' : `${16 + depth * 16}px`;

  const style: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    padding: collapsed ? '10px 0' : `10px 12px 10px ${paddingLeft}`,
    justifyContent: collapsed ? 'center' : 'flex-start',
    cursor: 'pointer',
    backgroundColor: isSelected
      ? '#eff6ff'
      : hover
        ? '#f3f4f6'
        : 'transparent',
    color: isSelected ? '#2563eb' : '#1f2937',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    font: 'inherit',
    fontSize: '14px',
    transition: 'background-color 0.15s',
    position: 'relative',
    gap: '10px',
    boxSizing: 'border-box',
  };

  const iconEl = item.icon
    ? createElement(
        'span',
        {
          style: { flexShrink: '0', fontSize: '16px' },
          'aria-hidden': 'true',
        },
        item.icon,
      )
    : null;

  const labelEl = !collapsed
    ? createElement(
        'span',
        {
          style: {
            flex: '1',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          },
        },
        item.label,
      )
    : null;

  const badgeEl = !collapsed && item.badge
    ? createElement(
        'span',
        {
          style: {
            backgroundColor: '#ef4444',
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '600',
            padding: '1px 6px',
            borderRadius: '10px',
            marginLeft: '4px',
            flexShrink: '0',
          },
        },
        item.badge,
      )
    : null;

  const chevronEl = !collapsed && hasChildren
    ? createElement(
        'span',
        {
          style: {
            fontSize: '10px',
            transition: 'transform 0.15s',
            transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)',
            marginLeft: '4px',
          },
          'aria-hidden': 'true',
        },
        '\u25B6',
      )
    : null;

  // Tooltip when collapsed
  const tooltipEl = collapsed && hover
    ? createElement(
        'div',
        {
          style: {
            position: 'absolute',
            left: '100%',
            top: '50%',
            transform: 'translateY(-50%)',
            marginLeft: '8px',
            padding: '4px 10px',
            backgroundColor: '#1f2937',
            color: '#ffffff',
            fontSize: '12px',
            borderRadius: '4px',
            whiteSpace: 'nowrap',
            zIndex: '1000',
            pointerEvents: 'none',
          },
          role: 'tooltip',
        },
        item.label,
      )
    : null;

  const button = createElement(
    'button',
    {
      type: 'button',
      style,
      onClick: handleClick,
      onMouseEnter,
      onMouseLeave,
      'aria-selected': isSelected ? 'true' : 'false',
      title: collapsed ? item.label : undefined,
    },
    iconEl,
    labelEl,
    badgeEl,
    chevronEl,
    tooltipEl,
  );

  const childItems: SpecNode[] | false | null = !collapsed && hasChildren && expanded
    ? item.children!.map((child: SidebarItem): SpecNode =>
        createElement(SidebarNavItem as unknown as (props: Record<string, unknown>) => SpecNode, {
          key: child.id,
          item: child,
          collapsed,
          selectedId,
          onSelect,
          depth: depth + 1,
        }),
      )
    : null;

  return createElement(
    'div',
    { key: item.id, style: { position: 'relative' } },
    button,
    childItems
      ? createElement('div', { role: 'group' }, ...childItems)
      : null,
  );
}

// -- Main component ---------------------------------------------------------

export function Sidebar(props: SidebarProps) {
  const {
    items,
    collapsed = false,
    onToggleCollapse,
    selectedId,
    onSelect,
    width = '240px',
    collapsedWidth = '56px',
  } = props;

  const resolvedWidth = collapsed
    ? (typeof collapsedWidth === 'number' ? `${collapsedWidth}px` : collapsedWidth)
    : (typeof width === 'number' ? `${width}px` : width);

  const toggleButton = onToggleCollapse
    ? createElement(
        'button',
        {
          type: 'button',
          onClick: onToggleCollapse,
          'aria-label': collapsed ? 'Expand sidebar' : 'Collapse sidebar',
          style: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            padding: '10px 0',
            border: 'none',
            borderBottom: '1px solid #e5e7eb',
            backgroundColor: 'transparent',
            cursor: 'pointer',
            fontSize: '14px',
            color: '#6b7280',
            fontFamily: 'inherit',
          },
        },
        collapsed ? '\u25B6' : '\u25C0',
      )
    : null;

  const navItems = items.map((item: SidebarItem) =>
    createElement(SidebarNavItem, {
      key: item.id,
      item,
      collapsed,
      selectedId,
      onSelect,
      depth: 0,
    }),
  );

  return createElement(
    NavWrapper,
    {
      orientation: 'vertical',
      role: 'navigation',
      ariaLabel: 'Sidebar',
      keyboardNav: true,
      styling: {
        width: resolvedWidth,
        border: '1px solid #e5e7eb',
        borderRadius: '0',
        padding: '0',
        backgroundColor: '#ffffff',
        custom: {
          height: '100%',
          transition: 'width 0.2s',
          overflow: 'hidden',
        },
      },
    },
    toggleButton,
    ...navItems,
  );
}
