// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ScrollContainer — Scrollable container with custom scrollbar styling hints.
 *
 * Provides a constrained scrollable area with configurable scroll direction,
 * scrollbar visibility, optional inset shadow at scroll edges, and padding.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect, useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScrollContainerProps {
  /** Maximum height (CSS value) */
  maxHeight?: string;
  /** Maximum width (CSS value) */
  maxWidth?: string;
  /** Scroll direction (default: 'vertical') */
  direction?: 'vertical' | 'horizontal' | 'both';
  /** Scrollbar visibility (default: 'auto') */
  showScrollbar?: 'auto' | 'always' | 'hover' | 'never';
  /** Inner padding (CSS value) */
  padding?: string;
  /** Show inset shadow at scroll edges to hint overflow (default: false) */
  shadow?: boolean;
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Children */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getOverflowValue(
  direction: 'vertical' | 'horizontal' | 'both',
  axis: 'x' | 'y',
): string {
  if (direction === 'both') return 'auto';
  if (direction === 'horizontal') return axis === 'x' ? 'auto' : 'hidden';
  return axis === 'y' ? 'auto' : 'hidden';
}

function getScrollbarStyle(visibility: string): Record<string, string> {
  switch (visibility) {
    case 'never':
      // Hide scrollbars using overflow clip + scrollbar-width
      return { scrollbarWidth: 'none' };
    case 'always':
      return { scrollbarWidth: 'thin' };
    case 'hover':
      // Use thin scrollbar that becomes visible on hover via opacity
      return { scrollbarWidth: 'thin' };
    case 'auto':
    default:
      return { scrollbarWidth: 'auto' };
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ScrollContainer(props: ScrollContainerProps) {
  const direction = props.direction ?? 'vertical';
  const showScrollbar = props.showScrollbar ?? 'auto';
  const showShadow = props.shadow ?? false;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [atTop, setAtTop] = useState(true);
  const [atBottom, setAtBottom] = useState(false);
  const [atLeft, setAtLeft] = useState(true);
  const [atRight, setAtRight] = useState(false);

  const updateEdges = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;

    const threshold = 2;
    setAtTop(el.scrollTop <= threshold);
    setAtBottom(el.scrollTop + el.clientHeight >= el.scrollHeight - threshold);
    setAtLeft(el.scrollLeft <= threshold);
    setAtRight(el.scrollLeft + el.clientWidth >= el.scrollWidth - threshold);
  }, []);

  useEffect(() => {
    updateEdges();
  }, [updateEdges]);

  const onScroll = useCallback(() => {
    if (showShadow) {
      updateEdges();
    }
  }, [showShadow, updateEdges]);

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      position: 'relative',
      overflowX: getOverflowValue(direction, 'x'),
      overflowY: getOverflowValue(direction, 'y'),
      ...getScrollbarStyle(showScrollbar),
    };

    if (props.maxHeight) {
      s.maxHeight = props.maxHeight;
    }
    if (props.maxWidth) {
      s.maxWidth = props.maxWidth;
    }
    if (props.padding) {
      s.padding = props.padding;
    }

    return { ...s, ...(props.style ?? {}) };
  }, [direction, showScrollbar, props.maxHeight, props.maxWidth, props.padding, props.style]);

  // Build shadow indicators
  const shadows: string[] = [];
  if (showShadow) {
    const isVert = direction === 'vertical' || direction === 'both';
    const isHoriz = direction === 'horizontal' || direction === 'both';

    if (isVert && !atTop) {
      shadows.push('inset 0 8px 6px -6px rgba(0,0,0,0.15)');
    }
    if (isVert && !atBottom) {
      shadows.push('inset 0 -8px 6px -6px rgba(0,0,0,0.15)');
    }
    if (isHoriz && !atLeft) {
      shadows.push('inset 8px 0 6px -6px rgba(0,0,0,0.15)');
    }
    if (isHoriz && !atRight) {
      shadows.push('inset -8px 0 6px -6px rgba(0,0,0,0.15)');
    }
  }

  const finalStyle: Record<string, string> = {
    ...containerStyle,
  };

  if (shadows.length > 0) {
    finalStyle.boxShadow = shadows.join(', ');
  }

  return createElement(
    'div',
    {
      className: `scroll-container scroll-container--${direction} ${props.className ?? ''}`.trim(),
      style: finalStyle,
      ref: containerRef,
      onScroll,
    },
    props.children,
  );
}
