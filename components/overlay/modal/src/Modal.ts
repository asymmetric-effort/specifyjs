// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Modal — Dialog overlay with backdrop, focus trap, and scroll lock.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useCallback, useRef } from 'specifyjs/hooks';

export type ModalSize = 'sm' | 'md' | 'lg' | 'full';

export interface ModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Called when the modal requests to close */
  onClose: () => void;
  /** Modal title rendered in the header */
  title?: string;
  /** Modal width preset */
  size?: ModalSize;
  /** Close when clicking the overlay backdrop (default true) */
  closeOnOverlay?: boolean;
  /** Close when pressing Escape (default true) */
  closeOnEscape?: boolean;
  /** Footer slot content */
  footer?: unknown;
  /** Show the X close button in the header (default true) */
  showCloseButton?: boolean;
  /** Modal body children */
  children?: unknown;
}

const sizeWidths: Record<ModalSize, string> = {
  sm: '400px',
  md: '600px',
  lg: '800px',
  full: '100vw',
};

export function Modal(props: ModalProps) {
  const {
    open,
    onClose,
    title,
    size = 'md',
    closeOnOverlay = true,
    closeOnEscape = true,
    footer,
    showCloseButton = true,
    children,
  } = props;

  const dialogRef = useRef<HTMLDivElement | null>(null);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, onClose]);

  // Focus trap: focus the dialog on open
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  const overlayStyle: Record<string, string> = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: '10000',
  };

  const dialogStyle: Record<string, string> = {
    backgroundColor: '#fff',
    borderRadius: size === 'full' ? '0' : '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxHeight: size === 'full' ? '100vh' : '90vh',
    width: sizeWidths[size],
    maxWidth: size === 'full' ? '100vw' : '90vw',
    display: 'flex',
    flexDirection: 'column',
    outline: 'none',
    overflow: 'hidden',
  };

  const headerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 24px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: '0',
  };

  const titleStyle: Record<string, string> = {
    margin: '0',
    fontSize: '18px',
    fontWeight: '600',
    color: '#111827',
  };

  const closeButtonStyle: Record<string, string> = {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px 8px',
    borderRadius: '4px',
    lineHeight: '1',
  };

  const bodyStyle: Record<string, string> = {
    padding: '24px',
    overflow: 'auto',
    flex: '1',
  };

  const footerStyle: Record<string, string> = {
    padding: '16px 24px',
    borderTop: '1px solid #e5e7eb',
    flexShrink: '0',
  };

  const handleOverlayClick = (e: Event) => {
    if (closeOnOverlay && e.target === e.currentTarget) {
      onClose();
    }
  };

  const headerChildren: unknown[] = [];
  const titleId = title ? 'modal-title' : undefined;
  if (title) {
    headerChildren.push(createElement('h2', { id: titleId, style: titleStyle }, title));
  } else {
    headerChildren.push(createElement('span', null));
  }
  if (showCloseButton) {
    headerChildren.push(
      createElement(
        'button',
        {
          type: 'button',
          style: closeButtonStyle,
          onClick: onClose,
          'aria-label': 'Close modal',
        },
        '\u00D7',
      ),
    );
  }

  const dialogChildren: unknown[] = [
    createElement('div', { style: headerStyle }, ...headerChildren),
    createElement('div', { style: bodyStyle }, children),
  ];

  if (footer) {
    dialogChildren.push(createElement('div', { style: footerStyle }, footer));
  }

  return createElement(
    'div',
    {
      style: overlayStyle,
      onClick: handleOverlayClick,
      'aria-modal': 'true',
      role: 'dialog',
      'aria-labelledby': titleId,
    },
    createElement(
      'div',
      {
        ref: dialogRef,
        style: dialogStyle,
        tabIndex: -1,
        role: 'document',
      },
      ...dialogChildren,
    ),
  );
}
