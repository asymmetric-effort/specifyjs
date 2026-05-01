// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Splitter — Resizable split pane (horizontal or vertical).
 *
 * Renders exactly two child panes separated by a draggable divider bar.
 * Uses onMouseDown/onMouseMove/onMouseUp for interactive resize.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef, useEffect, useMemo } from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SplitterProps {
  /** Split direction (default: 'horizontal' — left|right panes) */
  direction?: 'horizontal' | 'vertical';
  /** Initial split percentage for the first pane (default: 50) */
  initialSplit?: number;
  /** Minimum size of either pane in px (default: 50) */
  minSize?: number;
  /** Maximum size of the first pane in px */
  maxSize?: number;
  /** Divider bar width/height in px (default: 6) */
  dividerSize?: number;
  /** Extra inline styles for the container */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Exactly two children */
  children?: unknown[];
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Splitter(props: SplitterProps) {
  const direction = props.direction ?? 'horizontal';
  const isHorizontal = direction === 'horizontal';
  const dividerSize = props.dividerSize ?? 6;
  const minSize = props.minSize ?? 50;

  const [splitPercent, setSplitPercent] = useState(props.initialSplit ?? 50);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const onMouseDown = useCallback(
    (e: MouseEvent) => {
      e.preventDefault();
      dragging.current = true;
      document.body.style.cursor = isHorizontal ? 'col-resize' : 'row-resize';
      document.body.style.userSelect = 'none';
    },
    [isHorizontal],
  );

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const total = isHorizontal ? rect.width : rect.height;
      const offset = isHorizontal ? e.clientX - rect.left : e.clientY - rect.top;

      if (total <= 0) return;

      const minPercent = (minSize / total) * 100;
      const maxPercent = props.maxSize
        ? (props.maxSize / total) * 100
        : 100 - minPercent;

      let newPercent = (offset / total) * 100;
      newPercent = Math.max(minPercent, Math.min(maxPercent, newPercent));
      setSplitPercent(newPercent);
    };

    const onMouseUp = () => {
      if (dragging.current) {
        dragging.current = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
      }
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [isHorizontal, minSize, props.maxSize]);

  const containerStyle = useMemo<Record<string, string>>(() => {
    return {
      display: 'flex',
      flexDirection: isHorizontal ? 'row' : 'column',
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      ...(props.style ?? {}),
    };
  }, [isHorizontal, props.style]);

  const firstPaneStyle: Record<string, string> = isHorizontal
    ? { width: `calc(${splitPercent}% - ${dividerSize / 2}px)`, overflow: 'auto', flexShrink: '0' }
    : { height: `calc(${splitPercent}% - ${dividerSize / 2}px)`, overflow: 'auto', flexShrink: '0' };

  const secondPaneStyle: Record<string, string> = {
    flex: '1',
    overflow: 'auto',
    minWidth: '0',
    minHeight: '0',
  };

  const dividerStyle: Record<string, string> = {
    flexShrink: '0',
    backgroundColor: '#e5e7eb',
    transition: 'background-color 0.15s',
    ...(isHorizontal
      ? {
          width: `${dividerSize}px`,
          cursor: 'col-resize',
          height: '100%',
        }
      : {
          height: `${dividerSize}px`,
          cursor: 'row-resize',
          width: '100%',
        }),
  };

  const children = Array.isArray(props.children) ? props.children : [];

  return createElement(
    'div',
    {
      className: `splitter splitter--${direction} ${props.className ?? ''}`.trim(),
      style: containerStyle,
      ref: containerRef,
    },
    // First pane
    createElement(
      'div',
      { className: 'splitter__pane splitter__pane--first', style: firstPaneStyle },
      children[0] ?? null,
    ),
    // Divider
    createElement('div', {
      className: 'splitter__divider',
      style: dividerStyle,
      onMouseDown,
      onKeyDown: (e: Event) => {
        const key = (e as KeyboardEvent).key;
        const step = 2; // percent per keypress
        if (isHorizontal && (key === 'ArrowLeft' || key === 'ArrowRight')) {
          e.preventDefault();
          setSplitPercent((prev: number) => {
            const delta = key === 'ArrowRight' ? step : -step;
            return Math.max(5, Math.min(95, prev + delta));
          });
        } else if (!isHorizontal && (key === 'ArrowUp' || key === 'ArrowDown')) {
          e.preventDefault();
          setSplitPercent((prev: number) => {
            const delta = key === 'ArrowDown' ? step : -step;
            return Math.max(5, Math.min(95, prev + delta));
          });
        }
      },
      role: 'separator',
      tabIndex: 0,
      'aria-orientation': isHorizontal ? 'vertical' : 'horizontal',
      'aria-valuenow': String(Math.round(splitPercent)),
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-label': 'Resize panels',
    }),
    // Second pane
    createElement(
      'div',
      { className: 'splitter__pane splitter__pane--second', style: secondPaneStyle },
      children[1] ?? null,
    ),
  );
}
