// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TabBar -- Tab strip showing open files.
 *
 * Renders a horizontal row of tabs with the active tab highlighted.
 * Supports clicking to switch tabs and an optional close button.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the TabBar component. */
export interface TabBarProps {
  /** List of tab labels (typically file names). */
  tabs: string[];
  /** The currently active tab label. */
  activeTab: string;
  /** Callback when a tab is clicked. */
  onTabClick: (tab: string) => void;
  /** Optional callback when a tab's close button is clicked. */
  onTabClose?: (tab: string) => void;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const tabBarStyle: Record<string, string> = {
  height: '35px',
  backgroundColor: '#252526',
  display: 'flex',
  alignItems: 'center',
  flexShrink: '0',
};

const activeTabStyle: Record<string, string> = {
  padding: '0 16px',
  height: '35px',
  lineHeight: '35px',
  backgroundColor: '#1e1e1e',
  color: '#ffffff',
  fontSize: '13px',
  cursor: 'pointer',
  border: 'none',
  borderBottom: '2px solid #007acc',
  boxSizing: 'border-box',
};

const inactiveTabStyle: Record<string, string> = {
  padding: '0 16px',
  height: '35px',
  lineHeight: '35px',
  backgroundColor: '#2d2d2d',
  color: '#999999',
  fontSize: '13px',
  cursor: 'pointer',
  border: 'none',
  borderBottom: '2px solid transparent',
  boxSizing: 'border-box',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A horizontal tab strip for switching between open files.
 */
export function TabBar(props: TabBarProps) {
  const tabElements = props.tabs.map((tab, i) => {
    const isActive = tab === props.activeTab;
    return createElement(
      'button',
      {
        key: String(i),
        style: isActive ? activeTabStyle : inactiveTabStyle,
        'aria-label': tab,
        onClick: () => props.onTabClick(tab),
      },
      tab,
    );
  });

  return createElement(
    'div',
    { style: tabBarStyle },
    ...tabElements,
  );
}
