// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * EmptyState -- Empty content placeholder with icon, title, description, and CTA.
 *
 * Renders a centered layout with a large icon or image, a title,
 * descriptive text, and an optional call-to-action button.
 */

import { createElement } from 'specifyjs';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface EmptyStateAction {
  label: string;
  onClick: () => void;
}

export interface EmptyStateProps {
  /** Large icon or emoji displayed at the top */
  icon?: string;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Call-to-action button */
  action?: EmptyStateAction;
  /** Image URL displayed instead of / above the icon */
  image?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EmptyState(props: EmptyStateProps) {
  return createElement(
    'div',
    {
      style: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '48px 24px',
        gap: '16px',
      },
    },
    // Image
    props.image
      ? createElement('img', {
          src: props.image,
          alt: '',
          style: { maxWidth: '200px', maxHeight: '160px', objectFit: 'contain' },
        })
      : null,
    // Icon
    props.icon
      ? createElement(
          'div',
          { style: { fontSize: '48px', lineHeight: '1' } },
          props.icon,
        )
      : null,
    // Title
    props.title
      ? createElement(
          'h3',
          {
            style: {
              margin: '0',
              fontSize: '20px',
              fontWeight: '600',
              color: '#111827',
              lineHeight: '1.4',
            },
          },
          props.title,
        )
      : null,
    // Description
    props.description
      ? createElement(
          'p',
          {
            style: {
              margin: '0',
              fontSize: '14px',
              color: '#6b7280',
              maxWidth: '360px',
              lineHeight: '1.6',
            },
          },
          props.description,
        )
      : null,
    // Action button
    props.action
      ? createElement(
          'button',
          {
            onclick: props.action.onClick,
            style: {
              marginTop: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              fontWeight: '500',
              color: '#ffffff',
              backgroundColor: '#3b82f6',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            },
          },
          props.action.label,
        )
      : null,
  );
}
