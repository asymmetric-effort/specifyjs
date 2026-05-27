// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Tabs — Tabbed content container.
 *
 * Renders a tab list with configurable position (top/bottom/left/right) and
 * visual variant (line/card/pill). Supports keyboard navigation (arrow keys),
 * disabled tabs, optional icons, and full ARIA tablist/tab/tabpanel roles.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useMemo, useRef } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TabDefinition {
  /** Unique tab identifier */
  id: string;
  /** Display label */
  label: string;
  /** Optional icon element */
  icon?: unknown;
  /** Disabled state */
  disabled?: boolean;
  /** Tab panel content */
  content: unknown;
}

export interface TabsProps {
  /** Tab definitions */
  tabs: TabDefinition[];
  /** Controlled active tab id */
  activeTab?: string;
  /** Change handler (receives tab id) */
  onChange?: (tabId: string) => void;
  /** Tab list position (default: 'top') */
  position?: 'top' | 'bottom' | 'left' | 'right';
  /** Visual variant (default: 'line') */
  variant?: 'line' | 'card' | 'pill';
  /** Extra inline styles */
  style?: Record<string, string>;
  /** Extra class name */
  className?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Tabs(props: TabsProps) {
  const position = props.position ?? 'top';
  const variant = props.variant ?? 'line';
  const firstEnabledId = props.tabs.find((t) => !t.disabled)?.id ?? '';
  const [internalActive, setInternalActive] = useState(props.activeTab ?? firstEnabledId);
  const activeId = props.activeTab ?? internalActive;
  const tabListRef = useRef<HTMLDivElement | null>(null);

  const activate = useCallback(
    (id: string) => {
      setInternalActive(id);
      if (props.onChange) {
        props.onChange(id);
      }
    },
    [props.onChange],
  );

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const enabledTabs = props.tabs.filter((t) => !t.disabled);
      const currentIdx = enabledTabs.findIndex((t) => t.id === activeId);
      if (currentIdx === -1) return;

      const isVertical = position === 'left' || position === 'right';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';

      let newIdx = -1;
      if (e.key === prevKey) {
        newIdx = currentIdx > 0 ? currentIdx - 1 : enabledTabs.length - 1;
      } else if (e.key === nextKey) {
        newIdx = currentIdx < enabledTabs.length - 1 ? currentIdx + 1 : 0;
      } else if (e.key === 'Home') {
        newIdx = 0;
      } else if (e.key === 'End') {
        newIdx = enabledTabs.length - 1;
      }

      if (newIdx >= 0) {
        e.preventDefault();
        activate(enabledTabs[newIdx].id);
        // Focus the new tab button
        const tabList = tabListRef.current;
        if (tabList) {
          const buttons = tabList.querySelectorAll('[role="tab"]');
          const targetBtn = buttons[props.tabs.indexOf(enabledTabs[newIdx])] as HTMLElement | undefined;
          if (targetBtn) targetBtn.focus();
        }
      }
    },
    [props.tabs, activeId, position, activate],
  );

  // Layout direction
  const isVertical = position === 'left' || position === 'right';
  const isReversed = position === 'bottom' || position === 'right';

  const containerStyle = useMemo<Record<string, string>>(() => {
    return {
      display: 'flex',
      flexDirection: isVertical
        ? (isReversed ? 'row-reverse' : 'row')
        : (isReversed ? 'column-reverse' : 'column'),
      width: '100%',
      ...(props.style ?? {}),
    };
  }, [isVertical, isReversed, props.style]);

  const tabListStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    gap: variant === 'pill' ? '4px' : '0',
    ...(variant === 'line' && !isVertical
      ? { borderBottom: '2px solid #e5e7eb' }
      : {}),
    ...(variant === 'line' && isVertical
      ? { borderRight: position === 'left' ? '2px solid #e5e7eb' : 'none',
          borderLeft: position === 'right' ? '2px solid #e5e7eb' : 'none' }
      : {}),
    ...(variant === 'card' ? { backgroundColor: '#f9fafb' } : {}),
    ...(variant === 'pill' ? { padding: '4px' } : {}),
    flexShrink: '0',
  };

  const panelStyle: Record<string, string> = {
    flex: '1',
    padding: '16px',
    minWidth: '0',
    minHeight: '0',
  };

  const activeTab = props.tabs.find((t) => t.id === activeId);

  // Build tab buttons
  const tabButtons = props.tabs.map((tab) => {
    const isActive = tab.id === activeId;
    const btnStyle: Record<string, string> = {
      padding: '8px 16px',
      border: 'none',
      background: 'none',
      cursor: tab.disabled ? 'not-allowed' : 'pointer',
      opacity: tab.disabled ? '0.5' : '1',
      fontSize: '14px',
      fontWeight: isActive ? '600' : '400',
      color: isActive ? '#3b82f6' : '#6b7280',
      whiteSpace: 'nowrap',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      outline: 'none',
      transition: 'color 0.15s, background-color 0.15s',
    };

    if (variant === 'line') {
      if (!isVertical) {
        btnStyle.borderBottom = isActive ? '2px solid #3b82f6' : '2px solid transparent';
        btnStyle.marginBottom = '-2px';
      } else {
        if (position === 'left') {
          btnStyle.borderRight = isActive ? '2px solid #3b82f6' : '2px solid transparent';
          btnStyle.marginRight = '-2px';
        } else {
          btnStyle.borderLeft = isActive ? '2px solid #3b82f6' : '2px solid transparent';
          btnStyle.marginLeft = '-2px';
        }
      }
    } else if (variant === 'card') {
      btnStyle.backgroundColor = isActive ? '#ffffff' : 'transparent';
      btnStyle.borderRadius = '6px 6px 0 0';
      if (isActive) {
        btnStyle.border = '1px solid #e5e7eb';
        btnStyle.borderBottom = '1px solid #ffffff';
      }
    } else if (variant === 'pill') {
      btnStyle.borderRadius = '9999px';
      btnStyle.backgroundColor = isActive ? '#3b82f6' : 'transparent';
      btnStyle.color = isActive ? '#ffffff' : '#6b7280';
    }

    return createElement(
      'button',
      {
        key: tab.id,
        role: 'tab',
        'aria-selected': String(isActive),
        'aria-controls': `tabpanel-${tab.id}`,
        'aria-disabled': tab.disabled ? 'true' : undefined,
        id: `tab-${tab.id}`,
        tabIndex: isActive ? '0' : '-1',
        style: btnStyle,
        onClick: tab.disabled ? undefined : () => activate(tab.id),
        onKeyDown,
      },
      tab.icon ? createElement('span', { className: 'tabs__tab-icon' }, tab.icon) : null,
      tab.label,
    );
  });

  return createElement(
    'div',
    {
      className: `tabs tabs--${position} tabs--${variant} ${props.className ?? ''}`.trim(),
      style: containerStyle,
    },
    // Tab list
    createElement(
      'div',
      {
        className: 'tabs__list',
        role: 'tablist',
        'aria-label': 'Tabs',
        'aria-orientation': isVertical ? 'vertical' : 'horizontal',
        style: tabListStyle,
        ref: tabListRef,
      },
      ...tabButtons,
    ),
    // Tab panel
    createElement(
      'div',
      {
        className: 'tabs__panel',
        role: 'tabpanel',
        id: `tabpanel-${activeId}`,
        'aria-labelledby': `tab-${activeId}`,
        style: panelStyle,
        tabIndex: '0',
      },
      activeTab ? activeTab.content : null,
    ),
  );
}
