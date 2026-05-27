// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VirtualScroll — Renders only visible items from a large list plus an
 * overscan buffer. Uses a spacer div for correct scrollbar sizing and
 * recalculates visible range on every scroll event.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';

export interface VirtualScrollProps {
  /** Full array of items */
  items: unknown[];
  /** Render function for a single item */
  renderItem: (item: unknown, index: number) => unknown;
  /** Fixed height of each item in pixels */
  itemHeight: number;
  /** Extra items rendered above/below the viewport */
  overscan?: number;
  /** Container height (CSS value, e.g. '400px' or '100%') */
  height: string;
}

const containerStyle: Record<string, string> = {
  overflow: 'auto',
  position: 'relative',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export function VirtualScroll(props: VirtualScrollProps) {
  const {
    items,
    renderItem,
    itemHeight,
    overscan = 5,
    height,
  } = props;

  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const totalHeight = items.length * itemHeight;

  // Parse container height for calculations.
  // If it's a pixel value we can compute visible count, otherwise estimate.
  const containerHeightPx = parseInt(height, 10) || 400;

  const visibleCount = Math.ceil(containerHeightPx / itemHeight);

  // Determine range of items to render
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(items.length, Math.floor(scrollTop / itemHeight) + visibleCount + overscan);

  const handleScroll = useCallback((e: Event) => {
    const target = e.target as HTMLElement;
    setScrollTop(target.scrollTop);
  }, []);

  // Build visible item elements
  const visibleItems: unknown[] = [];

  for (let i = startIndex; i < endIndex; i++) {
    visibleItems.push(
      createElement('div', {
        key: String(i),
        style: {
          position: 'absolute',
          top: `${i * itemHeight}px`,
          left: '0',
          right: '0',
          height: `${itemHeight}px`,
          overflow: 'hidden',
        },
      }, renderItem(items[i], i)),
    );
  }

  return createElement('div', {
    ref: containerRef,
    style: { ...containerStyle, height },
    onScroll: handleScroll,
  },
    // Spacer div for correct scrollbar size
    createElement('div', {
      style: {
        height: `${totalHeight}px`,
        position: 'relative',
        width: '100%',
      },
    }, ...visibleItems),
  );
}
