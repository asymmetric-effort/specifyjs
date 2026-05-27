// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Toast — Notification system with toaster factory, container, and hook.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useRef, useCallback, useMemo } from 'specifyjs/hooks';

export type ToastPosition =
  | 'top-right'
  | 'top-left'
  | 'bottom-right'
  | 'bottom-left'
  | 'top-center'
  | 'bottom-center';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastOptions {
  /** Toast type for styling */
  type?: ToastType;
  /** Duration in ms before auto-dismiss (0 = persistent) */
  duration?: number;
  /** Optional action button */
  action?: ToastAction;
}

export interface ToasterConfig {
  /** Position of the toast stack */
  position?: ToastPosition;
  /** Maximum visible toasts */
  maxToasts?: number;
  /** Default auto-dismiss duration in ms */
  defaultDuration?: number;
}

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration: number;
  action?: ToastAction;
  createdAt: number;
}

export interface Toaster {
  toast: (message: string, opts?: ToastOptions) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  subscribe: (listener: () => void) => () => void;
  getToasts: () => ToastItem[];
  config: Required<ToasterConfig>;
}

let idCounter = 0;

function generateId(): string {
  return `toast-${++idCounter}-${Date.now()}`;
}

/**
 * Creates a toaster instance that manages toast state externally.
 */
export function createToaster(config: ToasterConfig = {}): Toaster {
  const resolvedConfig: Required<ToasterConfig> = {
    position: config.position ?? 'top-right',
    maxToasts: config.maxToasts ?? 5,
    defaultDuration: config.defaultDuration ?? 4000,
  };

  let toasts: ToastItem[] = [];
  const listeners = new Set<() => void>();

  function notify() {
    listeners.forEach((fn) => fn());
  }

  function toast(message: string, opts: ToastOptions = {}): string {
    const id = generateId();
    const item: ToastItem = {
      id,
      message,
      type: opts.type ?? 'info',
      duration: opts.duration ?? resolvedConfig.defaultDuration,
      action: opts.action,
      createdAt: Date.now(),
    };
    toasts = [item, ...toasts].slice(0, resolvedConfig.maxToasts);
    notify();
    return id;
  }

  function dismiss(id: string) {
    toasts = toasts.filter((t) => t.id !== id);
    notify();
  }

  function dismissAll() {
    toasts = [];
    notify();
  }

  return {
    toast,
    dismiss,
    dismissAll,
    subscribe: (listener: () => void) => {
      listeners.add(listener);
      return () => { listeners.delete(listener); };
    },
    getToasts: () => toasts,
    config: resolvedConfig,
  };
}

// ---- Color schemes for toast types ----

const typeColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  info:    { bg: '#eff6ff', border: '#3b82f6', icon: '\u2139\uFE0F' },
  success: { bg: '#f0fdf4', border: '#22c55e', icon: '\u2705' },
  warning: { bg: '#fffbeb', border: '#f59e0b', icon: '\u26A0\uFE0F' },
  error:   { bg: '#fef2f2', border: '#ef4444', icon: '\u274C' },
};

// ---- Position styles for the container ----

function getContainerPosition(pos: ToastPosition): Record<string, string> {
  const base: Record<string, string> = {
    position: 'fixed',
    zIndex: '10100',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    pointerEvents: 'none',
  };

  const isTop = pos.startsWith('top');
  const isBottom = pos.startsWith('bottom');
  const isLeft = pos.endsWith('left');
  const isRight = pos.endsWith('right');
  const isCenter = pos.endsWith('center');

  if (isTop) base.top = '0';
  if (isBottom) { base.bottom = '0'; base.flexDirection = 'column-reverse'; }
  if (isLeft) base.left = '0';
  if (isRight) base.right = '0';
  if (isCenter) { base.left = '50%'; base.transform = 'translateX(-50%)'; }

  return base;
}

/**
 * Single toast item renderer.
 */
function ToastItemView(props: { item: ToastItem; onDismiss: (id: string) => void }) {
  const { item, onDismiss } = props;
  const colors = typeColors[item.type];

  // Auto-dismiss timer
  useEffect(() => {
    if (item.duration <= 0) return;
    const timer = setTimeout(() => onDismiss(item.id), item.duration);
    return () => clearTimeout(timer);
  }, [item.id, item.duration, onDismiss]);

  const style: Record<string, string> = {
    backgroundColor: colors.bg,
    borderLeft: `4px solid ${colors.border}`,
    borderRadius: '6px',
    padding: '12px 16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    pointerEvents: 'auto',
    minWidth: '280px',
    maxWidth: '420px',
    animation: 'specifyjs-toast-slide-in 0.3s ease forwards',
  };

  const messageStyle: Record<string, string> = {
    flex: '1',
    fontSize: '14px',
    color: '#1f2937',
    lineHeight: '1.4',
  };

  const closeStyle: Record<string, string> = {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    color: '#9ca3af',
    padding: '2px 6px',
    lineHeight: '1',
    flexShrink: '0',
  };

  const actionStyle: Record<string, string> = {
    background: 'none',
    border: `1px solid ${colors.border}`,
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '12px',
    fontWeight: '600',
    color: colors.border,
    padding: '4px 10px',
    flexShrink: '0',
  };

  const children: unknown[] = [
    createElement('span', null, colors.icon),
    createElement('span', { style: messageStyle }, item.message),
  ];

  if (item.action) {
    children.push(
      createElement(
        'button',
        { type: 'button', style: actionStyle, onClick: item.action.onClick },
        item.action.label,
      ),
    );
  }

  children.push(
    createElement(
      'button',
      {
        type: 'button',
        style: closeStyle,
        onClick: () => onDismiss(item.id),
        'aria-label': 'Dismiss toast',
      },
      '\u00D7',
    ),
  );

  return createElement('div', { style, role: 'alert' }, ...children);
}

/**
 * ToastContainer — Renders all toasts from a given toaster.
 */
export function ToastContainer(props: { toaster: Toaster }) {
  const { toaster } = props;

  // Subscribe to toaster updates
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    return toaster.subscribe(() => forceUpdate((n: number) => n + 1));
  }, [toaster]);

  const toasts = toaster.getToasts();

  if (toasts.length === 0) return null;

  const containerStyle = getContainerPosition(toaster.config.position);

  // Inject keyframes style element
  useEffect(() => {
    const styleId = 'specifyjs-toast-keyframes';
    if (document.getElementById(styleId)) return;
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      @keyframes specifyjs-toast-slide-in {
        from { opacity: 0; transform: translateY(-12px); }
        to { opacity: 1; transform: translateY(0); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      const el = document.getElementById(styleId);
      if (el) el.remove();
    };
  }, []);

  const dismiss = useCallback((id: string) => toaster.dismiss(id), [toaster]);

  const toastElements = toasts.map((item: ToastItem) =>
    createElement(ToastItemView, { key: item.id, item, onDismiss: dismiss }),
  );

  return createElement('div', { style: containerStyle }, ...toastElements);
}

/**
 * useToast — Hook that creates a toaster and returns toast() + ToastContainer.
 */
export function useToast(config: ToasterConfig = {}) {
  const toasterRef = useRef<Toaster | null>(null);
  if (!toasterRef.current) {
    toasterRef.current = createToaster(config);
  }
  const toaster = toasterRef.current!;

  const ToastContainerComponent = useCallback(
    () => createElement(ToastContainer, { toaster }),
    [toaster],
  );

  return {
    toast: toaster.toast,
    dismiss: toaster.dismiss,
    dismissAll: toaster.dismissAll,
    ToastContainer: ToastContainerComponent,
  };
}
