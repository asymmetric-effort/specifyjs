// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * FlexContainer — Flexbox layout container.
 *
 * Provides a declarative flexbox wrapper with direction, wrap, gap, and
 * alignment props. Use FlexItem for per-child flex control.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface FlexContainerProps {
  /** flex-direction (default: 'row') */
  direction?: 'row' | 'row-reverse' | 'column' | 'column-reverse';
  /** flex-wrap (default: 'nowrap') */
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  /** Gap between items (CSS value) */
  gap?: string;
  /** CSS align-items */
  alignItems?: string;
  /** CSS justify-content */
  justifyContent?: string;
  /** Use inline-flex instead of flex */
  inline?: boolean;
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Children */
  children?: unknown;
}

export interface FlexItemProps {
  /** Shorthand flex property (e.g. '1 1 auto') */
  flex?: string;
  /** flex-grow */
  grow?: number;
  /** flex-shrink */
  shrink?: number;
  /** flex-basis */
  basis?: string;
  /** align-self override */
  alignSelf?: string;
  /** order */
  order?: number;
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

export function FlexContainer(props: FlexContainerProps) {
  const flexStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: props.inline ? 'inline-flex' : 'flex',
    };

    if (props.direction) {
      s.flexDirection = props.direction;
    }
    if (props.wrap) {
      s.flexWrap = props.wrap;
    }
    if (props.gap) {
      s.gap = props.gap;
    }
    if (props.alignItems) {
      s.alignItems = props.alignItems;
    }
    if (props.justifyContent) {
      s.justifyContent = props.justifyContent;
    }

    return { ...s, ...(props.style ?? {}) };
  }, [props.direction, props.wrap, props.gap, props.alignItems, props.justifyContent, props.inline, props.style]);

  return createElement(
    'div',
    {
      className: `flex-container ${props.className ?? ''}`.trim(),
      style: flexStyle,
    },
    props.children,
  );
}

export function FlexItem(props: FlexItemProps) {
  const itemStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {};

    if (props.flex) {
      s.flex = props.flex;
    }
    if (props.grow !== undefined) {
      s.flexGrow = String(props.grow);
    }
    if (props.shrink !== undefined) {
      s.flexShrink = String(props.shrink);
    }
    if (props.basis) {
      s.flexBasis = props.basis;
    }
    if (props.alignSelf) {
      s.alignSelf = props.alignSelf;
    }
    if (props.order !== undefined) {
      s.order = String(props.order);
    }

    return { ...s, ...(props.style ?? {}) };
  }, [props.flex, props.grow, props.shrink, props.basis, props.alignSelf, props.order, props.style]);

  return createElement(
    'div',
    {
      className: `flex-item ${props.className ?? ''}`.trim(),
      style: itemStyle,
    },
    props.children,
  );
}
