// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Card — Content card with header, body, and footer slots.
 *
 * Supports an optional top image, title/subtitle header with an action slot,
 * a body area (children), and a footer slot. Configurable border, shadow,
 * hover effect, padding, and border radius.
 */

import { createElement } from 'specifyjs';
import { useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CardProps {
  /** Card title displayed in the header */
  title?: string;
  /** Subtitle shown below the title */
  subtitle?: string;
  /** Slot rendered at the trailing edge of the header (e.g. action button) */
  headerAction?: unknown;
  /** Slot rendered as the card footer */
  footer?: unknown;
  /** URL for a top image */
  image?: string;
  /** Alt text for the top image */
  imageAlt?: string;
  /** Enable hover elevation effect (default: false) */
  hoverable?: boolean;
  /** Show border (default: true) */
  bordered?: boolean;
  /** Shadow level: 'none' | 'sm' | 'md' | 'lg' (default: 'sm') */
  shadow?: 'none' | 'sm' | 'md' | 'lg';
  /** Inner padding (CSS value, default: '16px') */
  padding?: string;
  /** Border radius (CSS value, default: '8px') */
  borderRadius?: string;
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

const SHADOW_MAP: Record<string, string> = {
  none: 'none',
  sm: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.06)',
  md: '0 4px 6px rgba(0,0,0,0.1), 0 2px 4px rgba(0,0,0,0.06)',
  lg: '0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05)',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card(props: CardProps) {
  const bordered = props.bordered !== false;
  const shadowLevel = props.shadow ?? 'sm';
  const padding = props.padding ?? '16px';
  const borderRadius = props.borderRadius ?? '8px';

  const cardStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'flex',
      flexDirection: 'column',
      borderRadius,
      overflow: 'hidden',
      backgroundColor: '#ffffff',
      transition: 'box-shadow 0.2s, transform 0.2s',
    };

    if (bordered) {
      s.border = '1px solid #e5e7eb';
    }

    s.boxShadow = SHADOW_MAP[shadowLevel] ?? SHADOW_MAP.sm;

    if (props.hoverable) {
      s.cursor = 'pointer';
    }

    return { ...s, ...(props.style ?? {}) };
  }, [bordered, shadowLevel, borderRadius, props.hoverable, props.style]);

  const headerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding,
    gap: '12px',
  };

  const bodyStyle: Record<string, string> = {
    padding,
    paddingTop: props.title || props.subtitle ? '0' : padding,
    flex: '1',
  };

  const footerStyle: Record<string, string> = {
    padding,
    paddingTop: '0',
    borderTop: '1px solid #f3f4f6',
    paddingBottom: padding,
    marginTop: 'auto',
  };

  const hasHeader = props.title || props.subtitle || props.headerAction;

  return createElement(
    'div',
    {
      className: `card ${props.hoverable ? 'card--hoverable' : ''} ${props.className ?? ''}`.trim(),
      style: cardStyle,
    },
    // Top image
    props.image
      ? createElement('img', {
          src: props.image,
          alt: props.imageAlt ?? '',
          style: {
            width: '100%',
            height: 'auto',
            display: 'block',
            objectFit: 'cover',
          },
        })
      : null,
    // Header
    hasHeader
      ? createElement(
          'div',
          { className: 'card__header', style: headerStyle },
          createElement(
            'div',
            { style: { flex: '1', minWidth: '0' } },
            props.title
              ? createElement(
                  'div',
                  {
                    className: 'card__title',
                    style: { fontSize: '16px', fontWeight: '600', color: '#111827', lineHeight: '1.4' },
                  },
                  props.title,
                )
              : null,
            props.subtitle
              ? createElement(
                  'div',
                  {
                    className: 'card__subtitle',
                    style: { fontSize: '14px', color: '#6b7280', marginTop: '2px', lineHeight: '1.4' },
                  },
                  props.subtitle,
                )
              : null,
          ),
          props.headerAction
            ? createElement('div', { className: 'card__header-action' }, props.headerAction)
            : null,
        )
      : null,
    // Body
    createElement(
      'div',
      { className: 'card__body', style: bodyStyle },
      props.children,
    ),
    // Footer
    props.footer
      ? createElement(
          'div',
          { className: 'card__footer', style: footerStyle },
          props.footer,
        )
      : null,
  );
}
