// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Alert -- Alert/banner message component.
 *
 * Displays a colored banner with an icon, optional title and message,
 * an optional close button, and an optional action button.
 * Supports filled, outline, and subtle style variants.
 */

import { createElement } from 'specifyjs';
import { useMemo, useState } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AlertAction {
  label: string;
  onClick: () => void;
}

export interface AlertProps {
  /** Alert severity type */
  type?: 'info' | 'success' | 'warning' | 'error';
  /** Alert title */
  title?: string;
  /** Alert message (children) */
  message?: unknown;
  /** Children alias for message */
  children?: unknown;
  /** Show close button */
  closable?: boolean;
  /** Close callback */
  onClose?: () => void;
  /** Custom icon text/emoji; auto-selected by type if omitted */
  icon?: string;
  /** Style variant */
  variant?: 'filled' | 'outline' | 'subtle';
  /** Optional action button */
  action?: AlertAction;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

interface TypeTheme {
  icon: string;
  bg: string;
  border: string;
  text: string;
  filledBg: string;
  filledText: string;
}

const TYPE_THEMES: Record<string, TypeTheme> = {
  info: { icon: '\u2139\uFE0F', bg: '#eff6ff', border: '#3b82f6', text: '#1e40af', filledBg: '#3b82f6', filledText: '#ffffff' },
  success: { icon: '\u2705', bg: '#f0fdf4', border: '#22c55e', text: '#166534', filledBg: '#22c55e', filledText: '#ffffff' },
  warning: { icon: '\u26A0\uFE0F', bg: '#fffbeb', border: '#f59e0b', text: '#92400e', filledBg: '#f59e0b', filledText: '#ffffff' },
  error: { icon: '\u274C', bg: '#fef2f2', border: '#ef4444', text: '#991b1b', filledBg: '#ef4444', filledText: '#ffffff' },
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Alert(props: AlertProps) {
  const [visible, setVisible] = useState(true);
  const type = props.type ?? 'info';
  const variant = props.variant ?? 'subtle';
  const theme = TYPE_THEMES[type] ?? TYPE_THEMES.info;
  const icon = props.icon ?? theme.icon;
  const content = props.message ?? props.children;

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'flex',
      alignItems: 'flex-start',
      gap: '12px',
      padding: '12px 16px',
      borderRadius: '8px',
      fontSize: '14px',
      lineHeight: '1.5',
    };

    if (variant === 'filled') {
      s.backgroundColor = theme.filledBg;
      s.color = theme.filledText;
    } else if (variant === 'outline') {
      s.backgroundColor = 'transparent';
      s.border = `1px solid ${theme.border}`;
      s.color = theme.text;
    } else {
      // subtle
      s.backgroundColor = theme.bg;
      s.color = theme.text;
    }

    return s;
  }, [variant, theme]);

  if (!visible) return null;

  return createElement(
    'div',
    { role: 'alert', style: containerStyle },
    // Icon
    createElement('span', { style: { flexShrink: '0', fontSize: '16px', lineHeight: '1.5' } }, icon),
    // Content area
    createElement(
      'div',
      { style: { flex: '1', minWidth: '0' } },
      props.title
        ? createElement(
            'div',
            { style: { fontWeight: '600', marginBottom: content ? '4px' : '0' } },
            props.title,
          )
        : null,
      content
        ? createElement('div', null, content)
        : null,
      props.action
        ? createElement(
            'button',
            {
              onclick: props.action.onClick,
              style: {
                marginTop: '8px',
                padding: '4px 12px',
                fontSize: '13px',
                fontWeight: '500',
                border: variant === 'filled' ? '1px solid currentColor' : `1px solid ${theme.border}`,
                borderRadius: '4px',
                backgroundColor: 'transparent',
                color: 'inherit',
                cursor: 'pointer',
              },
            },
            props.action.label,
          )
        : null,
    ),
    // Close button
    props.closable
      ? createElement(
          'button',
          {
            'aria-label': 'Close',
            onclick: () => {
              setVisible(false);
              if (props.onClose) props.onClose();
            },
            style: {
              flexShrink: '0',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '18px',
              lineHeight: '1',
              color: 'inherit',
              opacity: '0.7',
              padding: '0',
            },
          },
          '\u00D7',
        )
      : null,
  );
}
