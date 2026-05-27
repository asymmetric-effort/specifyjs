// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Badge — Count or dot indicator, positioned as an overlay on top-right
 * of children, or rendered inline when no children are provided.
 */

import { createElement } from 'specifyjs';

export interface BadgeProps {
  /** Numeric count to display */
  count?: number;
  /** Maximum count before showing "N+" */
  max?: number;
  /** Show a dot instead of a count */
  dot?: boolean;
  /** Badge color */
  color?: string;
  /** Size preset */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'solid' | 'outline';
  /** Child element to overlay the badge on */
  children?: unknown;
}

// ── Sizes ───────────────────────────────────────────────────────────────

const badgeSizes: Record<string, { minWidth: string; height: string; fontSize: string; padding: string }> = {
  sm: { minWidth: '16px', height: '16px', fontSize: '10px', padding: '0 4px' },
  md: { minWidth: '20px', height: '20px', fontSize: '12px', padding: '0 6px' },
  lg: { minWidth: '24px', height: '24px', fontSize: '14px', padding: '0 8px' },
};

const dotSizes: Record<string, { width: string; height: string }> = {
  sm: { width: '6px', height: '6px' },
  md: { width: '8px', height: '8px' },
  lg: { width: '10px', height: '10px' },
};

// ── Component ───────────────────────────────────────────────────────────

export function Badge(props: BadgeProps) {
  const {
    count,
    max,
    dot = false,
    color = '#ef4444',
    size = 'md',
    variant = 'solid',
    children,
  } = props;

  // Determine display text
  let displayText: string | null = null;
  if (!dot && count != null) {
    displayText = max != null && count > max ? `${max}+` : String(count);
  }

  // Hide badge if no count and not a dot
  const showBadge = dot || (count != null && count > 0);

  // Build badge element style
  const badgeStyle: Record<string, string> = dot
    ? {
        ...dotSizes[size],
        borderRadius: '50%',
        ...(variant === 'solid'
          ? { backgroundColor: color }
          : { backgroundColor: 'transparent', border: `2px solid ${color}` }),
      }
    : {
        ...badgeSizes[size],
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontWeight: '600',
        lineHeight: '1',
        boxSizing: 'border-box',
        ...(variant === 'solid'
          ? { backgroundColor: color, color: '#fff' }
          : { backgroundColor: 'transparent', color, border: `2px solid ${color}` }),
      };

  const badgeEl = showBadge
    ? createElement('span', { style: badgeStyle, 'aria-label': dot ? 'notification' : `count ${displayText}` },
        displayText,
      )
    : null;

  // Inline mode (no children)
  if (children == null) {
    return badgeEl ?? createElement('span', null);
  }

  // Overlay mode: position badge on top-right of children
  const overlayBadgeStyle: Record<string, string> = {
    ...badgeStyle,
    position: 'absolute',
    top: '0',
    right: '0',
    transform: 'translate(50%, -50%)',
    zIndex: '1',
  };

  return createElement('span', {
    style: {
      position: 'relative',
      display: 'inline-flex',
    },
  },
    children,
    showBadge
      ? createElement('span', { style: overlayBadgeStyle, 'aria-label': dot ? 'notification' : `count ${displayText}` },
          displayText,
        )
      : null,
  );
}
