// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Breadcrumb — A breadcrumb trail navigation component.
 *
 * Renders an ordered list of navigation links with configurable separators,
 * collapsible middle items, and proper ARIA semantics for accessibility.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';
import { NavWrapper } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface BreadcrumbItem {
  /** Display label */
  label: string;
  /** Optional link href — if omitted, rendered as plain text */
  href?: string;
  /** Optional click handler */
  onClick?: () => void;
}

export type BreadcrumbSize = 'sm' | 'md' | 'lg';

export interface BreadcrumbProps {
  /** Ordered list of breadcrumb items (first = root, last = current page) */
  items: BreadcrumbItem[];
  /** Separator between items (default: '/') */
  separator?: string | unknown;
  /** When set, collapses middle items to '...' if items exceed this count */
  maxItems?: number;
  /** Size variant (default: 'md') */
  size?: BreadcrumbSize;
}

// -- Helpers ----------------------------------------------------------------

const SIZE_MAP: Record<BreadcrumbSize, { fontSize: string; padding: string }> = {
  sm: { fontSize: '12px', padding: '4px 0' },
  md: { fontSize: '14px', padding: '6px 0' },
  lg: { fontSize: '16px', padding: '8px 0' },
};

// -- Component --------------------------------------------------------------

export function Breadcrumb(props: BreadcrumbProps) {
  const {
    items,
    separator = '/',
    maxItems,
    size = 'md',
  } = props;

  const [expanded, setExpanded] = useState(false);
  const sizeStyle = SIZE_MAP[size];

  const handleExpand = useCallback(() => {
    setExpanded(true);
  }, []);

  // Determine visible items
  let visibleItems = items;
  let collapsed = false;

  if (maxItems && maxItems > 1 && items.length > maxItems && !expanded) {
    collapsed = true;
    const headCount = 1;
    const tailCount = maxItems - 1;
    visibleItems = [
      ...items.slice(0, headCount),
      { label: '...' } as BreadcrumbItem,
      ...items.slice(items.length - tailCount),
    ];
  }

  const separatorEl = (node: string | unknown) => {
    if (typeof node === 'string') {
      return createElement(
        'span',
        {
          'aria-hidden': 'true',
          style: {
            margin: '0 8px',
            color: '#9ca3af',
            userSelect: 'none',
          },
        },
        node,
      );
    }
    return createElement(
      'span',
      { 'aria-hidden': 'true', style: { margin: '0 8px' } },
      node,
    );
  };

  const renderItem = (item: BreadcrumbItem, index: number, arr: BreadcrumbItem[]) => {
    const isLast = index === arr.length - 1;
    const isEllipsis = collapsed && item.label === '...' && index === 1;

    const children: unknown[] = [];

    // Separator before every item except the first
    if (index > 0) {
      children.push(separatorEl(separator));
    }

    if (isEllipsis) {
      // Expandable ellipsis button
      children.push(
        createElement(
          'button',
          {
            type: 'button',
            onClick: handleExpand,
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '2px 4px',
              fontSize: sizeStyle.fontSize,
              color: '#6b7280',
              fontFamily: 'inherit',
            },
            'aria-label': 'Show all breadcrumb items',
          },
          '...',
        ),
      );
    } else if (isLast) {
      // Current page — no link
      children.push(
        createElement(
          'span',
          {
            'aria-current': 'page',
            style: {
              color: '#1f2937',
              fontWeight: '600',
              fontSize: sizeStyle.fontSize,
            },
          },
          item.label,
        ),
      );
    } else if (item.href) {
      children.push(
        createElement(
          'a',
          {
            href: item.href,
            onClick: item.onClick
              ? (e: Event) => {
                  e.preventDefault();
                  item.onClick!();
                }
              : undefined,
            style: {
              color: '#2563eb',
              textDecoration: 'none',
              fontSize: sizeStyle.fontSize,
            },
          },
          item.label,
        ),
      );
    } else if (item.onClick) {
      children.push(
        createElement(
          'button',
          {
            type: 'button',
            onClick: item.onClick,
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#2563eb',
              padding: '0',
              fontSize: sizeStyle.fontSize,
              fontFamily: 'inherit',
            },
          },
          item.label,
        ),
      );
    } else {
      children.push(
        createElement(
          'span',
          { style: { color: '#6b7280', fontSize: sizeStyle.fontSize } },
          item.label,
        ),
      );
    }

    return createElement(
      'li',
      {
        key: String(index),
        style: {
          display: 'inline-flex',
          alignItems: 'center',
        },
      },
      ...children,
    );
  };

  const listItems = visibleItems.map((item, i) =>
    renderItem(item, i, visibleItems),
  );

  return createElement(
    NavWrapper,
    {
      orientation: 'horizontal',
      role: 'navigation',
      ariaLabel: 'Breadcrumb',
      keyboardNav: false,
      styling: {
        border: 'none',
        borderRadius: '0',
        padding: sizeStyle.padding,
        backgroundColor: 'transparent',
      },
    },
    createElement(
      'ol',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          listStyle: 'none',
          margin: '0',
          padding: '0',
          flexWrap: 'wrap',
        },
      },
      ...listItems,
    ),
  );
}
