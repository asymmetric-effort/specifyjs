// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * StatusBar -- Bottom status bar with left and right sections.
 *
 * Renders a colored bar at the bottom of the IDE with status items
 * grouped into left and right sections.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** A single item displayed in the status bar. */
export interface StatusItem {
  /** Text label to display. */
  label: string;
  /** Optional click handler. */
  onClick?: () => void;
}

/** Props for the StatusBar component. */
export interface StatusBarProps {
  /** Items displayed on the left side of the status bar. */
  items: StatusItem[];
  /** Items displayed on the right side of the status bar. */
  rightItems: StatusItem[];
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const statusBarStyle: Record<string, string> = {
  height: '22px',
  backgroundColor: '#007acc',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 12px',
  fontSize: '12px',
  color: '#ffffff',
  flexShrink: '0',
};

const statusItemStyle: Record<string, string> = {
  cursor: 'pointer',
  padding: '0 6px',
  borderRadius: '3px',
  transition: 'background-color 0.15s',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A bottom status bar split into left and right item groups.
 */
export function StatusBar(props: StatusBarProps) {
  const renderItems = (items: StatusItem[]) =>
    items.map((item, i) =>
      createElement(
        'span',
        {
          key: String(i),
          style: statusItemStyle,
          onClick: item.onClick,
        },
        item.label,
      ),
    );

  return createElement(
    'div',
    { className: 'ide__status-bar', style: statusBarStyle },
    createElement(
      'div',
      { style: { display: 'flex', gap: '16px' } },
      ...renderItems(props.items),
    ),
    createElement(
      'div',
      { style: { display: 'flex', gap: '16px' } },
      ...renderItems(props.rightItems),
    ),
  );
}
