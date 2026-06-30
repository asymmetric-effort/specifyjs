// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TitleBar -- Simple bar with centered title text, styled like a VS Code title bar.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Props for the TitleBar component. */
export interface TitleBarProps {
  /** The title text to display centered in the bar. */
  title: string;
  /** Optional style overrides merged onto the default title bar styles. */
  style?: Record<string, string>;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * A simple horizontal bar displaying centered title text.
 * Used as the topmost element in an IDE layout.
 */
export function TitleBar(props: TitleBarProps) {
  const baseStyle = useMemo<Record<string, string>>(() => ({
    height: '30px',
    backgroundColor: '#323233',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: '#999',
    flexShrink: '0',
    borderBottom: '1px solid var(--color-border, #252526)',
  }), []);

  const mergedStyle = props.style
    ? { ...baseStyle, ...props.style }
    : baseStyle;

  return createElement(
    'div',
    { className: 'ide__title-bar', style: mergedStyle },
    props.title,
  );
}
