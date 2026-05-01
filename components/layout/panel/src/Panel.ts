// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Panel — Collapsible panel with header bar.
 *
 * Supports a title, optional icon, collapsible body with animated max-height
 * transition, and a trailing header-right slot. Configurable border and shadow.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useMemo, useCallback, useRef, useEffect } from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PanelProps {
  /** Panel title */
  title?: string;
  /** Whether the panel can be collapsed (default: false) */
  collapsible?: boolean;
  /** Initial collapsed state when collapsible (default: false) */
  defaultCollapsed?: boolean;
  /** Icon element rendered before the title */
  icon?: unknown;
  /** Slot rendered at the trailing edge of the header */
  headerRight?: unknown;
  /** Show border (default: true) */
  bordered?: boolean;
  /** Shadow: 'none' | 'sm' | 'md' (default: 'none') */
  shadow?: 'none' | 'sm' | 'md';
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
  /** Body content */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SHADOW: Record<string, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12)',
  md: '0 4px 6px rgba(0,0,0,0.1)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Panel(props: PanelProps) {
  const bordered = props.bordered !== false;
  const shadowLevel = props.shadow ?? 'none';
  const [collapsed, setCollapsed] = useState(!!props.defaultCollapsed);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const [bodyHeight, setBodyHeight] = useState<string>('auto');

  // Measure body height for animated collapse
  useEffect(() => {
    if (!props.collapsible) return;
    const el = bodyRef.current;
    if (el) {
      setBodyHeight(`${el.scrollHeight}px`);
    }
  }, [props.children, props.collapsible]);

  const toggle = useCallback(() => {
    if (!props.collapsible) return;
    setCollapsed((prev: boolean) => !prev);
  }, [props.collapsible]);

  const handleHeaderKeyDown = useCallback((e: Event) => {
    if (!props.collapsible) return;
    const key = (e as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      toggle();
    }
  }, [props.collapsible, toggle]);

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      borderRadius: '6px',
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    };
    if (bordered) {
      s.border = '1px solid #e5e7eb';
    }
    s.boxShadow = SHADOW[shadowLevel] ?? SHADOW.none;
    return { ...s, ...(props.style ?? {}) };
  }, [bordered, shadowLevel, props.style]);

  const headerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px',
    gap: '8px',
    backgroundColor: '#f9fafb',
    userSelect: 'none',
    cursor: props.collapsible ? 'pointer' : 'default',
  };

  const chevronStyle: Record<string, string> = {
    display: 'inline-block',
    width: '0',
    height: '0',
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '6px solid #6b7280',
    transition: 'transform 0.2s',
    transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
    marginRight: '8px',
    flexShrink: '0',
  };

  const bodyWrapperStyle: Record<string, string> = {
    maxHeight: collapsed ? '0' : bodyHeight,
    overflow: 'hidden',
    transition: 'max-height 0.3s ease',
  };

  const bodyContentStyle: Record<string, string> = {
    padding: '16px',
  };

  return createElement(
    'div',
    {
      className: `panel ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Header
    createElement(
      'div',
      {
        className: 'panel__header',
        style: headerStyle,
        onClick: toggle,
        onKeyDown: handleHeaderKeyDown,
        role: props.collapsible ? 'button' : undefined,
        tabIndex: props.collapsible ? 0 : undefined,
        'aria-expanded': props.collapsible ? String(!collapsed) : undefined,
      },
      createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', flex: '1', minWidth: '0', gap: '8px' } },
        props.collapsible
          ? createElement('span', { className: 'panel__chevron', style: chevronStyle })
          : null,
        props.icon
          ? createElement('span', { className: 'panel__icon' }, props.icon)
          : null,
        props.title
          ? createElement(
              'span',
              {
                className: 'panel__title',
                style: { fontSize: '14px', fontWeight: '600', color: '#111827' },
              },
              props.title,
            )
          : null,
      ),
      props.headerRight
        ? createElement('div', { className: 'panel__header-right' }, props.headerRight)
        : null,
    ),
    // Body
    createElement(
      'div',
      {
        className: 'panel__body-wrapper',
        style: props.collapsible ? bodyWrapperStyle : {},
        ref: bodyRef,
      },
      createElement(
        'div',
        { className: 'panel__body', style: bodyContentStyle },
        props.children,
      ),
    ),
  );
}
