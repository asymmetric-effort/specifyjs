// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Pagination — Page navigation component.
 *
 * Renders First, Previous, page number buttons with ellipsis gaps,
 * Next, and Last controls for navigating paginated data.
 */

import { createElement } from 'specifyjs';
import { useCallback } from 'specifyjs/hooks';
import { NavWrapper } from '../../wrapper/src/NavWrapper';

// -- Types ------------------------------------------------------------------

export interface PaginationProps {
  /** Total number of items */
  total: number;
  /** Items per page */
  pageSize: number;
  /** Current active page (1-based) */
  currentPage: number;
  /** Called when page changes */
  onChange: (page: number) => void;
  /** Number of sibling pages shown around the current page (default: 1) */
  siblingCount?: number;
  /** Show First/Last buttons (default: true) */
  showFirstLast?: boolean;
  /** Show Prev/Next buttons (default: true) */
  showPrevNext?: boolean;
  /** Disable all controls */
  disabled?: boolean;
}

// -- Helpers ----------------------------------------------------------------

function range(start: number, end: number): number[] {
  const result: number[] = [];
  for (let i = start; i <= end; i++) result.push(i);
  return result;
}

function computePageRange(
  totalPages: number,
  currentPage: number,
  siblingCount: number,
): (number | 'ellipsis')[] {
  // Total slots: first + last + current + 2*siblings + 2 ellipsis
  const totalSlots = siblingCount * 2 + 5;

  if (totalPages <= totalSlots) {
    return range(1, totalPages);
  }

  const leftSibling = Math.max(currentPage - siblingCount, 1);
  const rightSibling = Math.min(currentPage + siblingCount, totalPages);

  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftRange = range(1, siblingCount * 2 + 3);
    return [...leftRange, 'ellipsis', totalPages];
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightRange = range(totalPages - siblingCount * 2 - 2, totalPages);
    return [1, 'ellipsis', ...rightRange];
  }

  return [1, 'ellipsis', ...range(leftSibling, rightSibling), 'ellipsis', totalPages];
}

// -- Styles -----------------------------------------------------------------

const baseButtonStyle: Record<string, string> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  height: '36px',
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: '6px',
  backgroundColor: '#ffffff',
  color: '#374151',
  fontSize: '14px',
  fontFamily: 'inherit',
  cursor: 'pointer',
  transition: 'background-color 0.15s, color 0.15s',
  outline: 'none',
  userSelect: 'none',
};

const activeButtonStyle: Record<string, string> = {
  ...baseButtonStyle,
  backgroundColor: '#2563eb',
  color: '#ffffff',
  borderColor: '#2563eb',
  fontWeight: '600',
};

const disabledButtonStyle: Record<string, string> = {
  ...baseButtonStyle,
  color: '#9ca3af',
  cursor: 'default',
  opacity: '0.5',
};

const ellipsisStyle: Record<string, string> = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: '36px',
  height: '36px',
  color: '#6b7280',
  fontSize: '14px',
  userSelect: 'none',
};

// -- Component --------------------------------------------------------------

export function Pagination(props: PaginationProps) {
  const {
    total,
    pageSize,
    currentPage,
    onChange,
    siblingCount = 1,
    showFirstLast = true,
    showPrevNext = true,
    disabled = false,
  } = props;

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const page = Math.min(Math.max(1, currentPage), totalPages);

  const goTo = useCallback(
    (p: number) => {
      if (!disabled && p >= 1 && p <= totalPages && p !== page) {
        onChange(p);
      }
    },
    [disabled, totalPages, page, onChange],
  );

  const navButton = (label: string, targetPage: number, ariaLabel: string) => {
    const isDisabled = disabled || targetPage < 1 || targetPage > totalPages || targetPage === page;
    return createElement(
      'button',
      {
        type: 'button',
        onClick: () => goTo(targetPage),
        disabled: isDisabled || undefined,
        'aria-label': ariaLabel,
        style: isDisabled ? disabledButtonStyle : baseButtonStyle,
      },
      label,
    );
  };

  const pages = computePageRange(totalPages, page, siblingCount);
  let ellipsisKey = 0;

  const children: unknown[] = [];

  if (showFirstLast) {
    children.push(navButton('\u00AB', 1, 'Go to first page'));
  }
  if (showPrevNext) {
    children.push(navButton('\u2039', page - 1, 'Go to previous page'));
  }

  for (const p of pages) {
    if (p === 'ellipsis') {
      children.push(
        createElement('span', { key: `ellipsis-${ellipsisKey++}`, style: ellipsisStyle }, '...'),
      );
    } else {
      const isCurrent = p === page;
      children.push(
        createElement(
          'button',
          {
            key: String(p),
            type: 'button',
            onClick: () => goTo(p),
            disabled: disabled || undefined,
            'aria-label': `Page ${p}`,
            'aria-current': isCurrent ? 'page' : undefined,
            style: disabled
              ? disabledButtonStyle
              : isCurrent
                ? activeButtonStyle
                : baseButtonStyle,
          },
          String(p),
        ),
      );
    }
  }

  if (showPrevNext) {
    children.push(navButton('\u203A', page + 1, 'Go to next page'));
  }
  if (showFirstLast) {
    children.push(navButton('\u00BB', totalPages, 'Go to last page'));
  }

  return createElement(
    NavWrapper,
    {
      orientation: 'horizontal',
      role: 'navigation',
      ariaLabel: 'Pagination',
      keyboardNav: true,
      styling: {
        border: 'none',
        borderRadius: '0',
        backgroundColor: 'transparent',
        padding: '0',
        custom: { gap: '4px' },
      },
    },
    ...children,
  );
}
