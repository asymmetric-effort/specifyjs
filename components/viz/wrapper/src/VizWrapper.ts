// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VizWrapper — A container component for all visualization components.
 *
 * Provides a configurable title, legend, and content container with
 * positional layout. Renders the visualization in an isolated Shadow-DOM-like
 * scope (via CSS containment) to avoid style/layout conflicts with the
 * rest of the DOM.
 */

import { createElement, Fragment } from 'specifyjs';
import { useMemo, useRef, useEffect } from 'specifyjs/hooks';

// -- Types ------------------------------------------------------------------

export type Position = 'top' | 'bottom' | 'left' | 'right';

export interface LegendItem {
  label: string;
  color: string;
  /** Optional dash pattern for line charts (e.g. '5,3') */
  dash?: string;
  /** Shape: circle, square, line (default: circle) */
  shape?: 'circle' | 'square' | 'line';
}

export interface VizWrapperProps {
  /** Title text */
  title?: string;
  /** Position of the title relative to content (default: 'top') */
  titlePosition?: Position;
  /** Title alignment: 'start' | 'center' | 'end' (default: 'center') */
  titleAlign?: 'start' | 'center' | 'end';
  /** Title font size (default: '16px') */
  titleFontSize?: string;
  /** Title font weight (default: '600') */
  titleFontWeight?: string;
  /** Title color (default: '#1f2937') */
  titleColor?: string;

  /** Legend items */
  legend?: LegendItem[];
  /** Position of the legend relative to content (default: 'bottom') */
  legendPosition?: Position;
  /** Legend alignment: 'start' | 'center' | 'end' (default: 'center') */
  legendAlign?: 'start' | 'center' | 'end';
  /** Legend font size (default: '12px') */
  legendFontSize?: string;
  /** Legend item spacing in px (default: 16) */
  legendGap?: number;

  /** Container width (default: 'auto') */
  width?: string | number;
  /** Container height (default: 'auto') */
  height?: string | number;
  /** Background color (default: '#ffffff') */
  backgroundColor?: string;
  /** Border (default: '1px solid #e5e7eb') */
  border?: string;
  /** Border radius (default: '8px') */
  borderRadius?: string;
  /** Padding around the entire wrapper (default: '16px') */
  padding?: string;
  /** Gap between title/legend/content (default: '12px') */
  gap?: string;
  /** Box shadow (default: none) */
  boxShadow?: string;
  /** Font family (default: inherit) */
  fontFamily?: string;

  /** CSS contain value for isolation (default: 'layout style paint') */
  contain?: string;

  /** Extra className on the outer container */
  className?: string;
  /** Extra inline style on the outer container */
  style?: Record<string, string>;

  /** The visualization content (children) */
  children?: unknown;
}

// -- Component --------------------------------------------------------------

export function VizWrapper(props: VizWrapperProps) {
  const titlePos = props.titlePosition ?? 'top';
  const legendPos = props.legendPosition ?? 'bottom';
  const titleAlign = props.titleAlign ?? 'center';
  const legendAlign = props.legendAlign ?? 'center';
  const gap = props.gap ?? '12px';
  const contain = props.contain ?? 'layout style paint';

  // Build the outer container style
  const containerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: resolveDirection(titlePos, legendPos),
    gap,
    width: typeof props.width === 'number' ? `${props.width}px` : (props.width ?? 'auto'),
    height: typeof props.height === 'number' ? `${props.height}px` : (props.height ?? 'auto'),
    backgroundColor: props.backgroundColor ?? '#ffffff',
    border: props.border ?? '1px solid #e5e7eb',
    borderRadius: props.borderRadius ?? '8px',
    padding: props.padding ?? '16px',
    fontFamily: props.fontFamily ?? 'inherit',
    contain,
    overflow: 'hidden',
    position: 'relative',
    boxSizing: 'border-box',
    ...(props.boxShadow ? { boxShadow: props.boxShadow } : {}),
    ...(props.style ?? {}),
  };

  // Title element
  const titleEl = props.title
    ? createElement('div', {
        className: 'viz-title',
        style: {
          fontSize: props.titleFontSize ?? '16px',
          fontWeight: props.titleFontWeight ?? '600',
          color: props.titleColor ?? '#1f2937',
          textAlign: titleAlign,
          flexShrink: '0',
        },
      }, props.title)
    : null;

  // Legend element
  const legendEl = props.legend && props.legend.length > 0
    ? buildLegend(props.legend, {
        align: legendAlign,
        fontSize: props.legendFontSize ?? '12px',
        gap: props.legendGap ?? 16,
        direction: legendPos === 'left' || legendPos === 'right' ? 'column' : 'row',
      })
    : null;

  // Content container — isolated with contain
  const contentEl = createElement('div', {
    className: 'viz-content',
    style: {
      flex: '1',
      minWidth: '0',
      minHeight: '0',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
  }, props.children);

  // Arrange: title, content, legend according to positions
  const elements = arrangeElements(titleEl, contentEl, legendEl, titlePos, legendPos);

  return createElement(
    'div',
    {
      className: `viz-wrapper ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    ...elements,
  );
}

// -- Layout helpers ---------------------------------------------------------

/**
 * Determine the flex direction based on where title and legend are.
 * The main axis should accommodate the dominant layout:
 * - title top/bottom or legend top/bottom → column
 * - title left/right or legend left/right → needs nested flex
 * For simplicity, we always use column and wrap left/right items
 * in rows.
 */
function resolveDirection(_titlePos: Position, _legendPos: Position): string {
  return 'column';
}

function arrangeElements(
  titleEl: unknown,
  contentEl: unknown,
  legendEl: unknown,
  titlePos: Position,
  legendPos: Position,
): unknown[] {
  // For left/right positions, wrap content+side-element in a row
  const elements: unknown[] = [];

  // Title at top
  if (titlePos === 'top' && titleEl) elements.push(titleEl);

  // Middle section: handles left/right legend alongside content
  if (legendPos === 'left' || legendPos === 'right') {
    const rowChildren: unknown[] = [];
    if (legendPos === 'left' && legendEl) rowChildren.push(legendEl);

    // If title is left/right, add it here
    if (titlePos === 'left' && titleEl) rowChildren.push(titleEl);
    rowChildren.push(contentEl);
    if (titlePos === 'right' && titleEl) rowChildren.push(titleEl);

    if (legendPos === 'right' && legendEl) rowChildren.push(legendEl);

    elements.push(
      createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'row',
          flex: '1',
          gap: '12px',
          minHeight: '0',
          alignItems: 'stretch',
        },
      }, ...rowChildren),
    );
  } else if (titlePos === 'left' || titlePos === 'right') {
    // Title is left/right, legend is top/bottom
    if (legendPos === 'top' && legendEl) elements.push(legendEl);

    const rowChildren: unknown[] = [];
    if (titlePos === 'left' && titleEl) rowChildren.push(titleEl);
    rowChildren.push(contentEl);
    if (titlePos === 'right' && titleEl) rowChildren.push(titleEl);

    elements.push(
      createElement('div', {
        style: {
          display: 'flex',
          flexDirection: 'row',
          flex: '1',
          gap: '12px',
          minHeight: '0',
          alignItems: 'center',
        },
      }, ...rowChildren),
    );

    if (legendPos === 'bottom' && legendEl) elements.push(legendEl);
  } else {
    // Both title and legend are top/bottom
    if (legendPos === 'top' && legendEl) elements.push(legendEl);
    elements.push(contentEl);
    if (legendPos === 'bottom' && legendEl) elements.push(legendEl);
  }

  // Title at bottom
  if (titlePos === 'bottom' && titleEl) elements.push(titleEl);

  return elements;
}

// -- Legend builder ----------------------------------------------------------

function buildLegend(
  items: LegendItem[],
  opts: { align: string; fontSize: string; gap: number; direction: 'row' | 'column' },
) {
  return createElement(
    'div',
    {
      className: 'viz-legend',
      style: {
        display: 'flex',
        flexDirection: opts.direction,
        flexWrap: 'wrap',
        gap: `${opts.gap}px`,
        justifyContent: opts.align,
        alignItems: 'center',
        fontSize: opts.fontSize,
        color: '#6b7280',
        flexShrink: '0',
      },
    },
    ...items.map((item, i) =>
      createElement(
        'div',
        {
          key: `legend-${i}`,
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          },
        },
        buildLegendSwatch(item),
        createElement('span', null, item.label),
      ),
    ),
  );
}

function buildLegendSwatch(item: LegendItem) {
  const shape = item.shape ?? 'circle';

  if (shape === 'line') {
    return createElement(
      'svg',
      { width: '20', height: '12', viewBox: '0 0 20 12' },
      createElement('line', {
        x1: '0',
        y1: '6',
        x2: '20',
        y2: '6',
        stroke: item.color,
        'stroke-width': '2',
        'stroke-dasharray': item.dash ?? '',
      }),
    );
  }

  if (shape === 'square') {
    return createElement('div', {
      style: {
        width: '12px',
        height: '12px',
        backgroundColor: item.color,
        borderRadius: '2px',
        flexShrink: '0',
      },
    });
  }

  // Default: circle
  return createElement('div', {
    style: {
      width: '10px',
      height: '10px',
      backgroundColor: item.color,
      borderRadius: '50%',
      flexShrink: '0',
    },
  });
}
