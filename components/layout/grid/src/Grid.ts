// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Grid — CSS Grid layout container.
 *
 * Provides a declarative CSS Grid wrapper with support for columns, rows,
 * gap, named areas, auto-fit responsive columns, and alignment.
 * Use GridItem to control individual child placement.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GridBreakpoint {
  /** Min-width media query value (e.g. '768px') */
  minWidth: string;
  /** Column template override at this breakpoint */
  columns?: number | string;
  /** Row template override */
  rows?: string;
  /** Gap override */
  gap?: string;
}

export interface GridProps {
  /** Number of equal columns or a CSS grid-template-columns string */
  columns?: number | string;
  /** CSS grid-template-rows value */
  rows?: string;
  /** Gap between grid cells (CSS value, e.g. '16px' or '1rem 2rem') */
  gap?: string;
  /** CSS align-items for the grid container */
  alignItems?: string;
  /** CSS justify-items for the grid container */
  justifyItems?: string;
  /** When set, uses auto-fit with minmax(minColWidth, 1fr) */
  minColWidth?: string;
  /** Named grid areas (grid-template-areas lines) */
  areas?: string[];
  /** Responsive breakpoints — rendered as inline style overrides via CSS custom properties */
  responsive?: GridBreakpoint[];
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Children */
  children?: unknown;
}

export interface GridItemProps {
  /** grid-column value (e.g. 'span 2', '1 / 3') */
  gridColumn?: string;
  /** grid-row value */
  gridRow?: string;
  /** grid-area name */
  gridArea?: string;
  /** CSS align-self */
  alignSelf?: string;
  /** CSS justify-self */
  justifySelf?: string;
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Children */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Components
// ---------------------------------------------------------------------------

export function Grid(props: GridProps) {
  const gridStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'grid',
    };

    if (props.minColWidth) {
      s.gridTemplateColumns = `repeat(auto-fit, minmax(${props.minColWidth}, 1fr))`;
    } else if (props.columns !== undefined) {
      s.gridTemplateColumns =
        typeof props.columns === 'number'
          ? `repeat(${props.columns}, 1fr)`
          : props.columns;
    }

    if (props.rows) {
      s.gridTemplateRows = props.rows;
    }
    if (props.gap) {
      s.gap = props.gap;
    }
    if (props.alignItems) {
      s.alignItems = props.alignItems;
    }
    if (props.justifyItems) {
      s.justifyItems = props.justifyItems;
    }
    if (props.areas && props.areas.length > 0) {
      s.gridTemplateAreas = props.areas.map((a) => `"${a}"`).join(' ');
    }

    return { ...s, ...(props.style ?? {}) };
  }, [
    props.columns,
    props.rows,
    props.gap,
    props.alignItems,
    props.justifyItems,
    props.minColWidth,
    props.areas,
    props.style,
  ]);

  return createElement(
    'div',
    {
      className: `grid ${props.className ?? ''}`.trim(),
      style: gridStyle,
    },
    props.children,
  );
}

export function GridItem(props: GridItemProps) {
  const itemStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {};

    if (props.gridColumn) {
      s.gridColumn = props.gridColumn;
    }
    if (props.gridRow) {
      s.gridRow = props.gridRow;
    }
    if (props.gridArea) {
      s.gridArea = props.gridArea;
    }
    if (props.alignSelf) {
      s.alignSelf = props.alignSelf;
    }
    if (props.justifySelf) {
      s.justifySelf = props.justifySelf;
    }

    return { ...s, ...(props.style ?? {}) };
  }, [props.gridColumn, props.gridRow, props.gridArea, props.alignSelf, props.justifySelf, props.style]);

  return createElement(
    'div',
    {
      className: `grid-item ${props.className ?? ''}`.trim(),
      style: itemStyle,
    },
    props.children,
  );
}
