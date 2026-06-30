// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Minimap -- Small preview strip of the code.
 *
 * Renders a narrow column of thin bars representing each line of code,
 * with a viewport indicator showing the currently visible region.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the Minimap component. */
export interface MinimapProps {
  /** Lines of code to represent as minimap bars. */
  lines: string[];
  /** Pixel offset of the visible viewport top. */
  visibleStart: number;
  /** Pixel height of the visible viewport indicator. */
  visibleEnd: number;
  /** Total number of lines (used for scaling). */
  totalLines: number;
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const minimapStyle: Record<string, string> = {
  width: '60px',
  backgroundColor: '#1e1e1e',
  borderLeft: '1px solid var(--color-border, #252526)',
  flexShrink: '0',
  padding: '8px 4px',
  display: 'flex',
  flexDirection: 'column',
  gap: '2px',
  position: 'relative',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A minimap sidebar that shows a compressed view of all code lines
 * with a translucent viewport indicator.
 */
export function Minimap(props: MinimapProps) {
  return createElement(
    'div',
    { className: 'ide__minimap', style: minimapStyle, 'aria-hidden': 'true' },
    // Viewport indicator
    createElement('div', {
      style: {
        position: 'absolute',
        top: `${props.visibleStart}px`,
        left: '0',
        right: '0',
        height: `${props.visibleEnd}px`,
        backgroundColor: 'rgba(100, 100, 200, 0.15)',
        border: '1px solid rgba(100, 100, 200, 0.3)',
        borderRadius: '2px',
        pointerEvents: 'none',
      },
    }),
    ...props.lines.map((line, i) =>
      createElement('div', {
        key: String(i),
        style: {
          height: '2px',
          backgroundColor: line.trim() ? '#555555' : 'transparent',
          borderRadius: '1px',
          width: `${Math.min(100, line.length * 2)}%`,
        },
      }),
    ),
  );
}
