// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Footer — A three-column footer with left, center, and right content areas.
 *
 * Usage:
 *   createElement(Footer, {
 *     left: createElement('span', null, 'Copyright 2026'),
 *     center: createElement('span', null, 'Built with SpecifyJS'),
 *     right: createElement('a', { href: '/privacy' }, 'Privacy'),
 *   })
 */

import { createElement } from 'specifyjs';

export interface FooterProps {
  /** Content for the left section */
  left?: unknown;
  /** Content for the center section */
  center?: unknown;
  /** Content for the right section */
  right?: unknown;
  /** Border top style */
  borderTop?: string;
  /** Background color */
  background?: string;
  /** Text color */
  color?: string;
  /** Font size */
  fontSize?: string;
  /** Padding */
  padding?: string;
  /** Max width for inner container */
  maxWidth?: string;
  /** CSS className */
  className?: string;
  /** ARIA label for the footer landmark */
  ariaLabel?: string;
}

export function Footer(props: FooterProps) {
  const {
    left,
    center,
    right,
    borderTop = '1px solid var(--color-border, #e2e8f0)',
    background = 'var(--color-bg, transparent)',
    color = 'var(--color-text-muted, #64748b)',
    fontSize = '13px',
    padding = '24px',
    maxWidth = '1200px',
    className,
    ariaLabel = 'Site footer',
  } = props;

  return createElement(
    'footer',
    {
      className,
      role: 'contentinfo',
      'aria-label': ariaLabel,
      style: {
        borderTop,
        background,
        color,
        fontSize,
        padding,
        marginTop: '48px',
      },
    },
    createElement(
      'div',
      {
        className: 'footer-inner',
        style: {
          maxWidth,
          margin: '0 auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        },
      },
      // Left
      createElement(
        'div',
        { className: 'footer-section', style: { flex: '1', textAlign: 'left', minWidth: '150px' } },
        left ?? null,
      ),
      // Center
      createElement(
        'div',
        { className: 'footer-section', style: { flex: '1', textAlign: 'center', minWidth: '150px' } },
        center ?? null,
      ),
      // Right
      createElement(
        'div',
        { className: 'footer-section', style: { flex: '1', textAlign: 'right', minWidth: '150px' } },
        right ?? null,
      ),
    ),
  );
}
