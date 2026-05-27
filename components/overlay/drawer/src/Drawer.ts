// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Drawer — Slide-in panel from any edge with optional overlay backdrop.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useRef, useCallback } from 'specifyjs/hooks';

export type DrawerPosition = 'left' | 'right' | 'top' | 'bottom';

export interface DrawerProps {
  /** Whether the drawer is open */
  open: boolean;
  /** Called when the drawer requests to close */
  onClose: () => void;
  /** Edge the drawer slides in from */
  position?: DrawerPosition;
  /** Width (left/right) or height (top/bottom) in px or % */
  size?: string;
  /** Drawer title */
  title?: string;
  /** Show overlay backdrop behind the drawer */
  overlay?: boolean;
  /** Close when clicking the overlay */
  closeOnOverlay?: boolean;
  /** Close on Escape key */
  closeOnEscape?: boolean;
  /** Drawer body children */
  children?: unknown;
}

function getTransform(position: DrawerPosition, isOpen: boolean): string {
  if (isOpen) return 'translate3d(0, 0, 0)';
  switch (position) {
    case 'left': return 'translate3d(-100%, 0, 0)';
    case 'right': return 'translate3d(100%, 0, 0)';
    case 'top': return 'translate3d(0, -100%, 0)';
    case 'bottom': return 'translate3d(0, 100%, 0)';
  }
}

function getPanelPosition(position: DrawerPosition, size: string): Record<string, string> {
  const base: Record<string, string> = {
    position: 'fixed',
    zIndex: '10001',
    backgroundColor: '#fff',
    boxShadow: '0 0 24px rgba(0, 0, 0, 0.15)',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  };

  switch (position) {
    case 'left':
      return { ...base, top: '0', left: '0', bottom: '0', width: size };
    case 'right':
      return { ...base, top: '0', right: '0', bottom: '0', width: size };
    case 'top':
      return { ...base, top: '0', left: '0', right: '0', height: size };
    case 'bottom':
      return { ...base, bottom: '0', left: '0', right: '0', height: size };
  }
}

export function Drawer(props: DrawerProps) {
  const {
    open,
    onClose,
    position = 'right',
    size = '320px',
    title,
    overlay = true,
    closeOnOverlay = true,
    closeOnEscape = true,
    children,
  } = props;

  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);
  const titleId = title ? 'drawer-title' : undefined;

  // Manage visibility for transition
  useEffect(() => {
    if (open) {
      setVisible(true);
      // Trigger animation on next tick
      requestAnimationFrame(() => setAnimating(true));
    } else {
      setAnimating(false);
      const timer = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // Escape key handler
  useEffect(() => {
    if (!open || !closeOnEscape) return;
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, closeOnEscape, onClose]);

  // Body scroll lock
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Focus trap: focus the panel on open
  useEffect(() => {
    if (open && panelRef.current) {
      panelRef.current.focus();
    }
  }, [open]);

  if (!visible) return null;

  const overlayStyle: Record<string, string> = {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: '10000',
    opacity: animating ? '1' : '0',
    transition: 'opacity 0.3s ease',
  };

  const panelStyle: Record<string, string> = {
    ...getPanelPosition(position, size),
    transform: getTransform(position, animating),
    transition: 'transform 0.3s ease',
  };

  const headerStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #e5e7eb',
    flexShrink: '0',
  };

  const titleStyle: Record<string, string> = {
    margin: '0',
    fontSize: '16px',
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
    lineHeight: '1',
  };

  const bodyStyle: Record<string, string> = {
    padding: '20px',
    overflow: 'auto',
    flex: '1',
  };

  const handleOverlayClick = () => {
    if (closeOnOverlay) onClose();
  };

  const panelChildren: unknown[] = [];

  if (title) {
    panelChildren.push(
      createElement(
        'div',
        { style: headerStyle },
        createElement('h3', { id: titleId, style: titleStyle }, title),
        createElement(
          'button',
          {
            type: 'button',
            style: closeButtonStyle,
            onClick: onClose,
            'aria-label': 'Close drawer',
          },
          '\u00D7',
        ),
      ),
    );
  }

  panelChildren.push(createElement('div', { style: bodyStyle }, children));

  const elements: unknown[] = [];

  if (overlay) {
    elements.push(
      createElement('div', {
        style: overlayStyle,
        onClick: handleOverlayClick,
      }),
    );
  }

  elements.push(
    createElement(
      'div',
      {
        ref: panelRef,
        style: panelStyle,
        role: 'dialog',
        'aria-modal': 'true',
        'aria-labelledby': titleId,
        tabIndex: -1,
      },
      ...panelChildren,
    ),
  );

  return createElement('div', null, ...elements);
}
