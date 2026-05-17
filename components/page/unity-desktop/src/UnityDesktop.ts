// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * UnityDesktop -- Configurable top-level layout that assembles the Ubuntu Unity
 * desktop environment from reusable sub-components: SystemTray (top panel),
 * Dock (left launcher), DesktopBackground (workspace), and WindowManager
 * (context provider for window state). Also provides toast notifications.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useMemo, useEffect } from '../../../../core/src/hooks/index';
import { WindowManagerProvider, useWindowManager } from '../../../layout/window-manager/src/index';
import { SystemTray } from '../../../nav/system-tray/src/index';
import { Dock } from '../../../nav/dock/src/index';
import { DesktopBackground } from '../../../layout/desktop-background/src/index';
import type { DockItem } from '../../../nav/dock/src/index';
import type { WindowManagerContextValue } from '../../../layout/window-manager/src/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnityDesktopApp {
  id: string;
  icon: string;
  label: string;
}

export interface UnityDesktopUser {
  name: string;
  avatar?: string;
}

export interface UnityDesktopProps {
  /** Application definitions for the dock launcher */
  apps: UnityDesktopApp[];
  /** User info for the system tray */
  user?: UnityDesktopUser;
  /** Called when an app icon is clicked in the dock */
  onAppOpen?: (appId: string) => void;
  /** Called when the user selects logout from the user menu */
  onLogout?: () => void;
  /** Color theme */
  theme?: 'dark' | 'light';
  /** UnityApp windows render here */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Toast notification types
// ---------------------------------------------------------------------------

export interface ToastNotification {
  id: number;
  message: string;
  severity: 'info' | 'warning' | 'error';
  timestamp: number;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const PANEL_HEIGHT = 28;
const TOAST_TIMEOUT = 5000;
let toastIdCounter = 0;

// ---------------------------------------------------------------------------
// Internal: Toast Container
// ---------------------------------------------------------------------------

function ToastContainer(props: { toasts: ToastNotification[]; onDismiss: (id: number) => void }) {
  const { toasts, onDismiss } = props;

  if (toasts.length === 0) return null;

  const containerStyle: Record<string, string> = {
    position: 'absolute',
    top: '8px',
    right: '8px',
    zIndex: '9999',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    pointerEvents: 'none',
    maxWidth: '320px',
  };

  const toastEls = toasts.map((toast: ToastNotification) => {
    let bgColor = 'rgba(50, 50, 50, 0.95)';
    let borderColor = '#555';
    if (toast.severity === 'warning') {
      bgColor = 'rgba(60, 40, 10, 0.95)';
      borderColor = '#f39c12';
    } else if (toast.severity === 'error') {
      bgColor = 'rgba(60, 10, 10, 0.95)';
      borderColor = '#e74c3c';
    }

    return createElement('div', {
      key: String(toast.id),
      className: `unity-desktop__toast unity-desktop__toast--${toast.severity}`,
      style: {
        backgroundColor: bgColor,
        border: `1px solid ${borderColor}`,
        borderRadius: '6px',
        padding: '10px 14px',
        color: '#ffffff',
        fontSize: '13px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        pointerEvents: 'auto',
        cursor: 'pointer',
        transition: 'opacity 200ms ease',
      },
      onClick: () => onDismiss(toast.id),
      role: 'alert',
      'aria-live': 'polite',
    }, toast.message);
  });

  return createElement('div', {
    className: 'unity-desktop__toast-container',
    style: containerStyle,
    'aria-label': 'Notifications',
  }, ...toastEls);
}

// ---------------------------------------------------------------------------
// Internal: Inner layout (has access to WindowManager context)
// ---------------------------------------------------------------------------

function UnityDesktopInner(props: {
  apps: UnityDesktopApp[];
  user?: UnityDesktopUser;
  onAppOpen?: (appId: string) => void;
  onLogout?: () => void;
  theme?: 'dark' | 'light';
  children?: unknown;
}) {
  const { apps, user, onAppOpen, onLogout, theme = 'dark', children } = props;
  const windowManager: WindowManagerContextValue = useWindowManager();

  // -----------------------------------------------------------------------
  // Toast state
  // -----------------------------------------------------------------------

  const [toasts, setToasts] = useState<ToastNotification[]>([]);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev: ToastNotification[]) => prev.filter((t: ToastNotification) => t.id !== id));
  }, []);

  // Auto-dismiss toasts
  useEffect(() => {
    if (toasts.length === 0) return;
    const oldest = toasts[0];
    const elapsed = Date.now() - oldest.timestamp;
    const remaining = Math.max(0, TOAST_TIMEOUT - elapsed);
    const timer = setTimeout(() => {
      setToasts((prev: ToastNotification[]) => prev.filter((t: ToastNotification) => t.id !== oldest.id));
    }, remaining);
    return () => clearTimeout(timer);
  }, [toasts]);

  // -----------------------------------------------------------------------
  // Dock item click handler
  // -----------------------------------------------------------------------

  const handleDockItemClick = useCallback((id: string) => {
    // Check if window already open
    const existingWindow = windowManager.windows.find((w) => w.id === id);
    if (existingWindow) {
      if (existingWindow.windowState === 'minimized') {
        windowManager.restoreWindow(id);
      }
      windowManager.focusWindow(id);
    } else {
      // Find the app definition
      const app = apps.find((a: UnityDesktopApp) => a.id === id);
      if (app) {
        windowManager.openWindow({
          id: app.id,
          title: app.label,
          icon: app.icon,
        });
      }
    }
    if (onAppOpen) onAppOpen(id);
  }, [windowManager, apps, onAppOpen]);

  // -----------------------------------------------------------------------
  // Build dock items from apps + running state
  // -----------------------------------------------------------------------

  const dockItems: DockItem[] = useMemo(() => {
    return apps.map((app: UnityDesktopApp) => {
      const isRunning = windowManager.windows.some((w) => w.id === app.id);
      return {
        id: app.id,
        icon: app.icon,
        label: app.label,
        active: isRunning,
      };
    });
  }, [apps, windowManager.windows]);

  // -----------------------------------------------------------------------
  // SystemTray config
  // -----------------------------------------------------------------------

  const activeAppName = useMemo(() => {
    if (!windowManager.focusedWindowId) return undefined;
    const focused = windowManager.windows.find((w) => w.id === windowManager.focusedWindowId);
    return focused ? focused.title : undefined;
  }, [windowManager.focusedWindowId, windowManager.windows]);

  const userMenuItems = useMemo(() => {
    const items: Array<{ label: string; icon?: string; onClick: () => void; divider?: boolean }> = [];
    if (user) {
      items.push({ label: user.name, icon: undefined, onClick: () => {}, divider: false });
      items.push({ label: '', icon: undefined, onClick: () => {}, divider: true });
    }
    if (onLogout) {
      items.push({ label: 'Log Out', icon: undefined, onClick: onLogout, divider: false });
    }
    return items;
  }, [user, onLogout]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle = useMemo<Record<string, string>>(() => ({
    width: '100%',
    height: '100%',
    minHeight: '500px',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: 'Ubuntu, "Segoe UI", sans-serif',
    fontSize: '13px',
    color: theme === 'dark' ? '#ffffff' : '#1a1a1a',
    overflow: 'hidden',
    position: 'relative',
  }), [theme]);

  const bodyStyle: Record<string, string> = {
    display: 'flex',
    flex: '1',
    overflow: 'hidden',
  };

  const dockContainerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme === 'dark'
      ? 'var(--dock-bg, rgba(0, 0, 0, 0.7))'
      : 'var(--dock-bg, rgba(200, 200, 200, 0.9))',
    borderRight: theme === 'dark'
      ? '1px solid rgba(255, 255, 255, 0.1)'
      : '1px solid rgba(0, 0, 0, 0.1)',
    flexShrink: '0',
  };

  const workspaceStyle: Record<string, string> = {
    flex: '1',
    position: 'relative',
    overflow: 'hidden',
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const systemTrayEl = createElement(SystemTray, {
    activeAppName,
    activitiesButton: { label: 'Activities', onClick: () => {} },
    clockFormat: '24h' as const,
    showSeconds: true,
    showDate: true,
    user: user ? { name: user.name, avatar: user.avatar } : undefined,
    userMenuItems: userMenuItems.length > 0 ? userMenuItems : undefined,
    height: PANEL_HEIGHT,
  });

  const dockEl = createElement(Dock, {
    items: dockItems,
    orientation: 'vertical' as const,
    position: 'left' as const,
    iconSize: 36,
    onItemClick: handleDockItemClick,
  });

  const toastEl = createElement(ToastContainer, {
    toasts,
    onDismiss: dismissToast,
  });

  const desktopContentChildren: unknown[] = [];
  if (children) {
    desktopContentChildren.push(children);
  }
  desktopContentChildren.push(toastEl);

  const desktopEl = createElement(DesktopBackground, {
    backgroundColor: theme === 'dark' ? '#2c001e' : '#e8e0e4',
    backgroundGradient: theme === 'dark'
      ? 'linear-gradient(135deg, #2c001e 0%, #5e2750 50%, #2c001e 100%)'
      : 'linear-gradient(135deg, #e8e0e4 0%, #d4c4d0 50%, #e8e0e4 100%)',
  }, createElement('div', {
    className: 'unity-desktop__workspace',
    style: workspaceStyle,
  }, ...desktopContentChildren));

  return createElement('div', {
    className: 'unity-desktop',
    style: containerStyle,
    'data-theme': theme,
  },
    // Top panel
    createElement('div', {
      className: 'unity-desktop__top-panel',
      style: { flexShrink: '0', zIndex: '10' },
    }, systemTrayEl),
    // Body: Dock + Desktop
    createElement('div', { style: bodyStyle },
      createElement('div', {
        className: 'unity-desktop__dock',
        style: dockContainerStyle,
      }, dockEl),
      createElement('main', {
        className: 'unity-desktop__desktop',
        style: { flex: '1', position: 'relative', overflow: 'hidden' },
      }, desktopEl),
    ),
  );
}

// ---------------------------------------------------------------------------
// Public Component: UnityDesktop
// ---------------------------------------------------------------------------

export function UnityDesktop(props: UnityDesktopProps) {
  const { apps, user, onAppOpen, onLogout, theme = 'dark', children } = props;

  return createElement(
    WindowManagerProvider,
    {
      onWindowOpen: onAppOpen,
    },
    createElement(UnityDesktopInner, {
      apps,
      user,
      onAppOpen,
      onLogout,
      theme,
      children,
    }),
  );
}
