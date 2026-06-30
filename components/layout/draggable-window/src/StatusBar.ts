// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * StatusBar -- Optional footer bar for DraggableWindow.
 *
 * Renders a fixed-height flex row at the bottom of a window with left-aligned
 * and right-aligned item groups. Items with onClick get pointer cursor and
 * hover highlight.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface StatusBarItem {
  /** Unique identifier for the item */
  key: string;
  /** Display text */
  label: string;
  /** Optional leading icon/emoji */
  icon?: string;
  /** Optional click handler */
  onClick?: () => void;
  /** Alignment within the status bar. Default: 'left' */
  align?: 'left' | 'right';
}

export interface StatusBarProps {
  /** Items to display in the status bar */
  items: StatusBarItem[];
  /** Background color. Default: '#007acc' */
  backgroundColor?: string;
  /** Text color. Default: '#ffffff' */
  color?: string;
  /** Height in pixels. Default: 22 */
  height?: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function StatusBar(props: StatusBarProps) {
  const {
    items,
    backgroundColor = '#007acc',
    color = '#ffffff',
    height = 22,
  } = props;

  const leftItems = items.filter((item: StatusBarItem) => item.align !== 'right');
  const rightItems = items.filter((item: StatusBarItem) => item.align === 'right');

  const containerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: `${height}px`,
    backgroundColor,
    color,
    fontSize: '12px',
    flexShrink: '0',
    padding: '0 8px',
    overflow: 'hidden',
    userSelect: 'none',
  };

  function renderItem(item: StatusBarItem) {
    const isClickable = typeof item.onClick === 'function';
    const itemStyle: Record<string, string> = {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '0 6px',
      height: '100%',
      whiteSpace: 'nowrap',
      cursor: isClickable ? 'pointer' : 'default',
    };

    const children: unknown[] = [];

    if (item.icon) {
      children.push(
        createElement('span', {
          className: 'status-bar__item-icon',
          style: { fontSize: '12px', lineHeight: '1' },
        }, item.icon),
      );
    }

    children.push(
      createElement('span', {
        className: 'status-bar__item-label',
      }, item.label),
    );

    const itemProps: Record<string, unknown> = {
      key: item.key,
      className: `status-bar__item${isClickable ? ' status-bar__item--clickable' : ''}`,
      style: itemStyle,
    };

    if (isClickable) {
      itemProps.onClick = item.onClick;
      itemProps.onMouseEnter = (e: Event) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(255, 255, 255, 0.15)';
      };
      itemProps.onMouseLeave = (e: Event) => {
        (e.currentTarget as HTMLElement).style.backgroundColor = '';
      };
    }

    return createElement('span', itemProps, ...children);
  }

  const leftGroup = createElement(
    'div',
    {
      className: 'status-bar__left',
      style: { display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden' },
    },
    ...leftItems.map(renderItem),
  );

  const rightGroup = createElement(
    'div',
    {
      className: 'status-bar__right',
      style: { display: 'flex', alignItems: 'center', height: '100%', overflow: 'hidden' },
    },
    ...rightItems.map(renderItem),
  );

  return createElement(
    'div',
    {
      className: 'status-bar',
      style: containerStyle,
      role: 'status',
      'aria-label': 'Status bar',
    },
    leftGroup,
    rightGroup,
  );
}
