// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * NavWrapper — Base container for all navigation components.
 *
 * Provides consistent layout, orientation, ARIA roles, focus management,
 * and configurable styling. All nav components (dropdown, treenav, accordion)
 * build on this foundation.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';

// -- Types ------------------------------------------------------------------

export type NavOrientation = 'horizontal' | 'vertical';

export interface NavWrapperStyle {
  /** Background color (default: '#ffffff') */
  backgroundColor?: string;
  /** Text color (default: '#1f2937') */
  color?: string;
  /** Font family (default: inherit) */
  fontFamily?: string;
  /** Font size (default: '14px') */
  fontSize?: string;
  /** Border (default: '1px solid #e5e7eb') */
  border?: string;
  /** Border radius (default: '8px') */
  borderRadius?: string;
  /** Padding (default: '0') */
  padding?: string;
  /** Box shadow (default: none) */
  boxShadow?: string;
  /** Width (default: 'auto') */
  width?: string | number;
  /** Max height for scrollable content (default: none) */
  maxHeight?: string | number;
  /** Custom inline styles merged last */
  custom?: Record<string, string>;
}

export interface NavWrapperProps {
  /** Orientation of child items (default: 'vertical') */
  orientation?: NavOrientation;
  /** ARIA role (default: 'navigation') */
  role?: string;
  /** ARIA label */
  ariaLabel?: string;
  /** Styling configuration */
  styling?: NavWrapperStyle;
  /** Extra CSS class name */
  className?: string;
  /** Enable keyboard navigation with arrow keys (default: true) */
  keyboardNav?: boolean;
  /** Children */
  children?: unknown;
}

// -- Component --------------------------------------------------------------

export function NavWrapper(props: NavWrapperProps) {
  const orientation = props.orientation ?? 'vertical';
  const role = props.role ?? 'navigation';
  const keyboardNav = props.keyboardNav ?? true;
  const s = props.styling ?? {};

  const containerRef = useRef<HTMLElement | null>(null);

  const style: Record<string, string> = {
    display: 'flex',
    flexDirection: orientation === 'horizontal' ? 'row' : 'column',
    backgroundColor: s.backgroundColor ?? '#ffffff',
    color: s.color ?? '#1f2937',
    fontFamily: s.fontFamily ?? 'inherit',
    fontSize: s.fontSize ?? '14px',
    border: s.border ?? '1px solid #e5e7eb',
    borderRadius: s.borderRadius ?? '8px',
    padding: s.padding ?? '0',
    width: typeof s.width === 'number' ? `${s.width}px` : (s.width ?? 'auto'),
    overflow: 'auto',
    boxSizing: 'border-box',
    listStyle: 'none',
    margin: '0',
    ...(s.boxShadow ? { boxShadow: s.boxShadow } : {}),
    ...(s.maxHeight
      ? { maxHeight: typeof s.maxHeight === 'number' ? `${s.maxHeight}px` : s.maxHeight }
      : {}),
    ...(s.custom ?? {}),
  };

  const handleKeyDown = useCallback(
    (e: Event) => {
      if (!keyboardNav) return;
      const ke = e as KeyboardEvent;
      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"]), a[href], [role="menuitem"], [role="treeitem"]',
        ),
      ) as HTMLElement[];

      const idx = focusable.indexOf(document.activeElement as HTMLElement);
      if (idx < 0) return;

      const isVert = orientation === 'vertical';
      const nextKey = isVert ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVert ? 'ArrowUp' : 'ArrowLeft';

      if (ke.key === nextKey) {
        ke.preventDefault();
        const next = focusable[idx + 1];
        if (next) next.focus();
      } else if (ke.key === prevKey) {
        ke.preventDefault();
        const prev = focusable[idx - 1];
        if (prev) prev.focus();
      } else if (ke.key === 'Home') {
        ke.preventDefault();
        focusable[0]?.focus();
      } else if (ke.key === 'End') {
        ke.preventDefault();
        focusable[focusable.length - 1]?.focus();
      }
    },
    [keyboardNav, orientation],
  );

  return createElement(
    'nav',
    {
      ref: containerRef,
      role,
      'aria-label': props.ariaLabel ?? undefined,
      'aria-orientation': orientation,
      className: `nav-wrapper ${props.className ?? ''}`.trim(),
      style,
      onKeyDown: handleKeyDown,
    },
    props.children,
  );
}

// -- Shared nav item helpers ------------------------------------------------

export interface NavItemStyle {
  /** Padding (default: '10px 16px') */
  padding?: string;
  /** Hover background (default: '#f3f4f6') */
  hoverBackground?: string;
  /** Active/selected background (default: '#eff6ff') */
  activeBackground?: string;
  /** Active text color (default: '#2563eb') */
  activeColor?: string;
  /** Border bottom between items (default: none) */
  separator?: string;
  /** Cursor (default: 'pointer') */
  cursor?: string;
  /** Transition (default: 'background-color 0.15s') */
  transition?: string;
}

/**
 * Build common inline styles for a navigation item.
 */
export function buildNavItemStyle(
  s: NavItemStyle,
  state: { hover: boolean; active: boolean },
): Record<string, string> {
  return {
    display: 'flex',
    alignItems: 'center',
    padding: s.padding ?? '10px 16px',
    cursor: s.cursor ?? 'pointer',
    transition: s.transition ?? 'background-color 0.15s',
    backgroundColor: state.active
      ? (s.activeBackground ?? '#eff6ff')
      : state.hover
        ? (s.hoverBackground ?? '#f3f4f6')
        : 'transparent',
    color: state.active ? (s.activeColor ?? '#2563eb') : 'inherit',
    border: 'none',
    outline: 'none',
    width: '100%',
    textAlign: 'left',
    font: 'inherit',
    ...(s.separator ? { borderBottom: s.separator } : {}),
  };
}

/**
 * useHover — simple hover state hook for nav items.
 */
export function useHover(): {
  hover: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
} {
  const [hover, setHover] = useState(false);
  return {
    hover,
    onMouseEnter: useCallback(() => setHover(true), []),
    onMouseLeave: useCallback(() => setHover(false), []),
  };
}
