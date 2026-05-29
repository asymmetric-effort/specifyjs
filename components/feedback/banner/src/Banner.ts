// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Banner -- A dismissible banner that displays at the top of the page,
 * shifting all DOM content down. Three-column layout with configurable
 * severity icon, message text, and optional dismiss button.
 */

import { createElement } from 'specifyjs';
import { useMemo, useCallback } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BannerSeverity = 'info' | 'warning' | 'alert';

export interface BannerProps {
  /** The severity determines the icon and color scheme */
  severity: BannerSeverity;
  /** Plain text message to display */
  message: string;
  /** Called when the dismiss button is clicked. If not provided, dismiss button is hidden. */
  onDismiss?: () => void;
  /** Custom icon element to override the default severity icon */
  icon?: unknown;
  /** Whether the banner is visible. Default: true */
  visible?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface SeverityTheme {
  background: string;
  borderColor: string;
  iconColor: string;
  textColor: string;
}

const SEVERITY_THEMES: Record<BannerSeverity, SeverityTheme> = {
  info: { background: '#eff6ff', borderColor: '#3b82f6', iconColor: '#3b82f6', textColor: '#1e40af' },
  warning: { background: '#fffbeb', borderColor: '#f59e0b', iconColor: '#f59e0b', textColor: '#92400e' },
  alert: { background: '#fef2f2', borderColor: '#ef4444', iconColor: '#ef4444', textColor: '#991b1b' },
};

// ---------------------------------------------------------------------------
// Default SVG Icons
// ---------------------------------------------------------------------------

function infoIcon(color: string) {
  return createElement('svg', {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  },
    createElement('circle', { cx: '12', cy: '12', r: '10', stroke: color, 'stroke-width': '2', fill: 'none' }),
    createElement('line', { x1: '12', y1: '11', x2: '12', y2: '17', stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round' }),
    createElement('circle', { cx: '12', cy: '8', r: '1', fill: color }),
  );
}

function warningIcon(color: string) {
  return createElement('svg', {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  },
    createElement('path', {
      d: 'M12 2L1 21h22L12 2z',
      stroke: color,
      'stroke-width': '2',
      'stroke-linejoin': 'round',
      fill: 'none',
    }),
    createElement('line', { x1: '12', y1: '10', x2: '12', y2: '15', stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round' }),
    createElement('circle', { cx: '12', cy: '18', r: '1', fill: color }),
  );
}

function alertIcon(color: string) {
  return createElement('svg', {
    width: '24',
    height: '24',
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    'aria-hidden': 'true',
  },
    createElement('circle', { cx: '12', cy: '12', r: '10', stroke: color, 'stroke-width': '2', fill: 'none' }),
    createElement('line', { x1: '12', y1: '8', x2: '12', y2: '13', stroke: color, 'stroke-width': '2', 'stroke-linecap': 'round' }),
    createElement('circle', { cx: '12', cy: '16', r: '1', fill: color }),
  );
}

function getDefaultIcon(severity: BannerSeverity, color: string) {
  switch (severity) {
    case 'info': return infoIcon(color);
    case 'warning': return warningIcon(color);
    case 'alert': return alertIcon(color);
    default: return infoIcon(color);
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Banner(props: BannerProps) {
  const {
    severity,
    message,
    onDismiss,
    icon,
    visible = true,
  } = props;

  const theme = SEVERITY_THEMES[severity] ?? SEVERITY_THEMES.info;

  const handleDismiss = useCallback(() => {
    if (onDismiss) onDismiss();
  }, [onDismiss]);

  const containerStyle = useMemo<Record<string, string>>(() => ({
    display: 'flex',
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    boxSizing: 'border-box',
    padding: '12px 16px',
    backgroundColor: theme.background,
    borderBottom: `1px solid ${theme.borderColor}`,
    fontFamily: 'inherit',
  }), [theme]);

  const iconPaneStyle = useMemo<Record<string, string>>(() => ({
    width: '50px',
    height: '50px',
    flexShrink: '0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }), []);

  const messagePaneStyle = useMemo<Record<string, string>>(() => ({
    flex: '1',
    padding: '0 16px',
    fontSize: '14px',
    color: theme.textColor,
    lineHeight: '1.5',
  }), [theme]);

  const dismissButtonStyle = useMemo<Record<string, string>>(() => ({
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: '#f1f5f9',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '16px',
    lineHeight: '1',
    color: '#64748b',
    flexShrink: '0',
    padding: '0',
  }), []);

  if (!visible) return null;

  const role = severity === 'alert' ? 'alert' : 'status';

  const iconElement = icon !== undefined ? icon : getDefaultIcon(severity, theme.iconColor);

  return createElement(
    'div',
    {
      role,
      'aria-live': 'polite',
      style: containerStyle,
    },
    // Left pane: icon
    createElement('div', { style: iconPaneStyle }, iconElement),
    // Center pane: message
    createElement('div', { style: messagePaneStyle }, message),
    // Right pane: dismiss button (only when onDismiss provided)
    onDismiss
      ? createElement(
          'button',
          {
            'aria-label': 'Dismiss banner',
            onClick: handleDismiss,
            style: dismissButtonStyle,
          },
          '\u00D7',
        )
      : null,
  );
}
