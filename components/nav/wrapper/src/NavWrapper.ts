// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * NavWrapper — Base container for all navigation components.
 *
 * Provides consistent layout, orientation, ARIA roles, focus management,
 * and configurable styling. All nav components (dropdown, treenav, accordion)
 * build on this foundation.
 *
 * Responsive behavior: horizontal navs automatically collapse into a
 * hamburger menu on screens < 768px. This is automatic — no opt-in
 * required. Vertical navs are unaffected (already mobile-friendly).
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect, useMediaQuery } from 'specifyjs/hooks';

// -- Types ------------------------------------------------------------------

export type NavOrientation = 'horizontal' | 'vertical';

export interface NavWrapperStyle {
  /** Background color (default: 'var(--color-bg, #ffffff)') */
  backgroundColor?: string;
  /** Text color (default: 'var(--color-text, #1f2937)') */
  color?: string;
  /** Font family (default: inherit) */
  fontFamily?: string;
  /** Font size (default: '14px') */
  fontSize?: string;
  /** Border (default: '1px solid var(--color-border, #e5e7eb)') */
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

// -- Hamburger button styles ------------------------------------------------

const HAMBURGER_STYLE: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '44px',
  height: '44px',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  fontSize: '24px',
  color: 'inherit',
  flexShrink: '0',
  borderRadius: '4px',
  WebkitTapHighlightColor: 'transparent',
  padding: '0',
  marginLeft: 'auto',
};

// -- Component --------------------------------------------------------------

export function NavWrapper(props: NavWrapperProps) {
  const orientation = props.orientation ?? 'vertical';
  const role = props.role ?? 'navigation';
  const keyboardNav = props.keyboardNav ?? true;
  const s = props.styling ?? {};

  const containerRef = useRef<HTMLElement | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Responsive: detect mobile viewport for horizontal navs
  const isMobile = useMediaQuery('(max-width: 767px)');
  const needsHamburger = orientation === 'horizontal' && isMobile;

  // Close mobile menu when viewport grows past breakpoint
  useEffect(() => {
    if (!isMobile && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isMobile, mobileOpen]);

  const toggleMenu = useCallback(
    ((..._args: unknown[]) => setMobileOpen((prev: boolean) => !prev)) as (
      ...args: unknown[]
    ) => unknown,
    [],
  );

  const handleMenuKeyDown = useCallback(
    (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Escape' && mobileOpen) {
        ke.preventDefault();
        setMobileOpen(false);
      }
    },
    [mobileOpen],
  );

  // Container styles
  const bgColor = s.backgroundColor ?? 'var(--color-bg, #ffffff)';
  const textColor = s.color ?? 'var(--color-text, #1f2937)';
  const borderColor = s.border ?? '1px solid var(--color-border, #e5e7eb)';

  const baseStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: needsHamburger ? 'row' : (orientation === 'horizontal' ? 'row' : 'column'),
    flexWrap: needsHamburger ? 'wrap' : 'nowrap',
    alignItems: needsHamburger ? 'center' : 'stretch',
    position: 'relative',
    backgroundColor: bgColor,
    color: textColor,
    fontFamily: s.fontFamily ?? 'inherit',
    fontSize: s.fontSize ?? '14px',
    border: borderColor,
    borderRadius: s.borderRadius ?? '8px',
    padding: s.padding ?? '0',
    width: typeof s.width === 'number' ? `${s.width}px` : (s.width ?? 'auto'),
    overflow: needsHamburger ? 'visible' : 'auto',
    boxSizing: 'border-box',
    listStyle: 'none',
    margin: '0',
    ...(s.boxShadow ? { boxShadow: s.boxShadow } : {}),
    ...(s.maxHeight && !needsHamburger
      ? { maxHeight: typeof s.maxHeight === 'number' ? `${s.maxHeight}px` : String(s.maxHeight) }
      : {}),
    ...(s.custom ?? {}),
  };

  // Keyboard navigation handler
  const handleKeyDown = useCallback(
    (e: Event) => {
      if (!keyboardNav) return;
      const ke = e as KeyboardEvent;

      // Escape closes mobile menu
      if (ke.key === 'Escape' && mobileOpen) {
        ke.preventDefault();
        setMobileOpen(false);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const focusable = Array.from(
        container.querySelectorAll(
          'button, [tabindex]:not([tabindex="-1"]), a[href], [role="menuitem"], [role="treeitem"]',
        ),
      ) as HTMLElement[];

      const idx = focusable.indexOf(document.activeElement as HTMLElement);
      if (idx < 0) return;

      // In mobile collapsed mode, arrow keys navigate vertically
      const effectiveOrientation = needsHamburger ? 'vertical' : orientation;
      const isVert = effectiveOrientation === 'vertical';
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
    [keyboardNav, orientation, needsHamburger, mobileOpen],
  );

  // Mobile dropdown styles
  const dropdownStyle: Record<string, string> = {
    display: mobileOpen ? 'flex' : 'none',
    flexDirection: 'column',
    position: 'absolute',
    top: '100%',
    left: '0',
    right: '0',
    backgroundColor: bgColor,
    borderBottom: borderColor,
    borderLeft: borderColor,
    borderRight: borderColor,
    borderRadius: '0 0 8px 8px',
    padding: '8px 0',
    zIndex: '99',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'opacity 0.2s ease, transform 0.2s ease',
    opacity: mobileOpen ? '1' : '0',
    transform: mobileOpen ? 'translateY(0)' : 'translateY(-8px)',
  };

  // Hamburger mode: render button + collapsible dropdown
  if (needsHamburger) {
    return createElement(
      'nav',
      {
        ref: containerRef,
        role,
        'aria-label': props.ariaLabel ?? undefined,
        className: `nav-wrapper ${props.className ?? ''}`.trim(),
        style: baseStyle,
        onKeyDown: handleKeyDown,
      },
      // Hamburger toggle button
      createElement(
        'button',
        {
          type: 'button',
          style: HAMBURGER_STYLE,
          onClick: toggleMenu,
          'aria-label': mobileOpen ? 'Close menu' : 'Open menu',
          'aria-expanded': String(mobileOpen),
          'aria-controls': 'nav-wrapper-dropdown',
        },
        mobileOpen ? '\u2715' : '\u2630',
      ),
      // Dropdown panel (children rendered vertically)
      createElement(
        'div',
        {
          id: 'nav-wrapper-dropdown',
          role: 'menu',
          style: dropdownStyle,
        },
        props.children,
      ),
    );
  }

  // Desktop mode: standard horizontal/vertical layout
  return createElement(
    'nav',
    {
      ref: containerRef,
      role,
      'aria-label': props.ariaLabel ?? undefined,
      'aria-orientation': orientation,
      className: `nav-wrapper ${props.className ?? ''}`.trim(),
      style: baseStyle,
      onKeyDown: handleKeyDown,
    },
    props.children,
  );
}

// -- Shared nav item helpers ------------------------------------------------

export interface NavItemStyle {
  /** Padding (default: '10px 16px') */
  padding?: string;
  /** Hover background (default: 'var(--color-hover, #f3f4f6)') */
  hoverBackground?: string;
  /** Active/selected background (default: 'var(--color-active, #eff6ff)') */
  activeBackground?: string;
  /** Active text color (default: 'var(--color-primary, #2563eb)') */
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
      ? (s.activeBackground ?? 'var(--color-active, #eff6ff)')
      : state.hover
        ? (s.hoverBackground ?? 'var(--color-hover, #f3f4f6)')
        : 'transparent',
    color: state.active ? (s.activeColor ?? 'var(--color-primary, #2563eb)') : 'inherit',
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
