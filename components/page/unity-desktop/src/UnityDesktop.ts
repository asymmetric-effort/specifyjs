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
import { DraggableWindow } from '../../../layout/draggable-window/src/index';
import { WordProcessor } from '../../../page/word-processor/src/index';
import { IDE } from '../../../page/ide/src/index';
import { TradingDashboard } from '../../../page/trading-dashboard/src/index';
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
// Mock app content for demo windows
// ---------------------------------------------------------------------------

function getMockContent(title: string): unknown {
  const contentStyle: Record<string, string> = {
    padding: '16px',
    fontSize: '13px',
    color: 'var(--color-text, #333)',
    height: '100%',
    overflow: 'auto',
  };
  switch (title) {
    case 'Files':
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { fontWeight: '600', marginBottom: '12px' } }, 'Home'),
        createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
          ...['\u{1F4C1} Documents', '\u{1F4C1} Downloads', '\u{1F4C1} Music', '\u{1F4C1} Pictures', '\u{1F4C1} Videos', '\u{1F4C4} readme.txt']
            .map((f) => createElement('span', { style: { cursor: 'pointer' } }, f)),
        ),
      );
    case 'Terminal':
      return createElement('div', { style: { ...contentStyle, backgroundColor: '#1a1a2e', color: '#00ff41', fontFamily: 'monospace', fontSize: '12px' } },
        createElement('div', null, '$ whoami'),
        createElement('div', null, 'operator'),
        createElement('div', null, '$ uname -a'),
        createElement('div', null, 'Linux specifyjs 6.1.0 #1 SMP x86_64 GNU/Linux'),
        createElement('div', null, '$ _'),
      );
    case 'Browser':
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { padding: '6px 10px', backgroundColor: '#f1f5f9', borderRadius: '4px', marginBottom: '12px', fontSize: '12px', color: '#64748b' } }, 'https://specifyjs.asymmetric-effort.com'),
        createElement('div', { style: { textAlign: 'center', padding: '32px', color: '#94a3b8' } }, 'Web page content area'),
      );
    case 'Mail':
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { fontWeight: '600', marginBottom: '8px' } }, 'Inbox (3)'),
        ...['Build passed \u2014 CI/CD Pipeline', 'PR Review: feat/unity-desktop', 'Weekly sync notes'].map((subj) =>
          createElement('div', { style: { padding: '8px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer' } }, subj),
        ),
      );
    case 'Settings':
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { fontWeight: '600', marginBottom: '12px' } }, 'System Settings'),
        ...['Appearance', 'Network', 'Sound', 'Power', 'Users', 'About'].map((s) =>
          createElement('div', { style: { padding: '8px 0', borderBottom: '1px solid #e2e8f0' } }, s),
        ),
      );
    case 'Word Processor':
      return createElement(WordProcessor, null);
    case 'IDE':
      return createElement(IDE, null);
    case 'Trading':
      return createElement(TradingDashboard, null);
    default:
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { textAlign: 'center', padding: '32px', color: '#94a3b8' } }, `${title} application content`),
      );
  }
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
  const [showAppsGrid, setShowAppsGrid] = useState(false);
  const [locked, setLocked] = useState(false);
  const [contextMenuAppId, setContextMenuAppId] = useState<string | null>(null);
  const [contextMenuPos, setContextMenuPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [aboutAppId, setAboutAppId] = useState<string | null>(null);

  const toggleAppsGrid = useCallback(() => {
    setShowAppsGrid((prev: boolean) => !prev);
  }, []);

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

  const handleLock = useCallback(() => {
    setLocked(true);
  }, []);

  const handleUnlock = useCallback(() => {
    setLocked(false);
  }, []);

  const handleContextMenu = useCallback((id: string, pos: { x: number; y: number }) => {
    setContextMenuAppId(id);
    setContextMenuPos(pos);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenuAppId(null);
  }, []);

  const userMenuItems = useMemo(() => {
    const items: Array<{ label: string; icon?: string; onClick: () => void; divider?: boolean }> = [];
    if (user) {
      items.push({ label: user.name, icon: undefined, onClick: () => {}, divider: false });
      items.push({ label: '', icon: undefined, onClick: () => {}, divider: true });
    }
    items.push({ label: 'Lock', icon: undefined, onClick: handleLock, divider: false });
    items.push({ label: 'Logout', icon: undefined, onClick: onLogout || (() => {}), divider: false });
    return items;
  }, [user, onLogout, handleLock]);

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
    activitiesButton: { label: 'Activities', onClick: toggleAppsGrid },
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
    onItemContextMenu: handleContextMenu,
  });

  const toastEl = createElement(ToastContainer, {
    toasts,
    onDismiss: dismissToast,
  });

  // Render windows from WindowManager state
  const windowEls = windowManager.windows
    .filter((w) => w.windowState !== 'minimized')
    .map((w) => createElement(DraggableWindow, {
      key: w.id,
      id: w.id,
      title: w.title,
      icon: w.icon,
      defaultPosition: w.position,
      defaultSize: w.size,
      zIndex: w.zIndex,
      focused: w.focused,
      windowState: w.windowState as 'normal' | 'maximized' | 'minimized',
      onClose: () => windowManager.closeWindow(w.id),
      onFocus: () => windowManager.focusWindow(w.id),
      onMinimize: () => windowManager.minimizeWindow(w.id),
      onMaximize: () => {
        if (w.windowState === 'maximized') windowManager.restoreWindow(w.id);
        else windowManager.maximizeWindow(w.id);
      },
      onMove: (pos: { x: number; y: number }) => windowManager.moveWindow(w.id, pos),
      onResize: (size: { width: number; height: number }) => windowManager.resizeWindow(w.id, size),
    },
      getMockContent(w.title),
    ));

  const desktopContentChildren: unknown[] = [];
  if (children) {
    desktopContentChildren.push(children);
  }
  desktopContentChildren.push(...windowEls);
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

  // Apps grid overlay (Activities)
  const appsGridEl = showAppsGrid ? createElement('div', {
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: '100',
      backgroundColor: 'rgba(0, 0, 0, 0.85)',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))',
      gap: '24px',
      padding: '48px',
      alignContent: 'start',
      overflowY: 'auto',
    },
    onClick: toggleAppsGrid,
  },
    ...apps.map((app: UnityDesktopApp) =>
      createElement('button', {
        key: app.id,
        style: {
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          background: 'none',
          border: 'none',
          color: '#ffffff',
          cursor: 'pointer',
          padding: '12px',
          borderRadius: '8px',
          fontSize: '12px',
        },
        onClick: (e: Event) => {
          e.stopPropagation();
          setShowAppsGrid(false);
          handleDockItemClick(app.id);
        },
      },
        createElement('span', {
          style: { fontSize: '32px', display: 'block' },
        }, app.icon),
        createElement('span', null, app.label),
      ),
    ),
  ) : null;

  // Lock overlay
  const lockOverlayEl = locked ? createElement('div', {
    className: 'unity-desktop__lock-overlay',
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: '9999',
      backgroundColor: 'rgba(0,0,0,0.85)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      color: '#ffffff',
    },
    onClick: handleUnlock,
  },
    createElement('div', { style: { fontSize: '64px', marginBottom: '16px' } }, '\u{1F512}'),
    createElement('div', { style: { fontSize: '24px', fontWeight: '600', marginBottom: '8px' } }, 'Locked'),
    createElement('div', { style: { fontSize: '14px', opacity: '0.7' } }, 'Click to unlock'),
  ) : null;

  // Context menu
  const contextMenuEl = contextMenuAppId ? createElement('div', {
    className: 'unity-desktop__context-menu-backdrop',
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: '9000',
    },
    onClick: closeContextMenu,
  },
    createElement('div', {
      className: 'unity-desktop__context-menu',
      style: {
        position: 'absolute',
        top: `${contextMenuPos.y}px`,
        left: `${contextMenuPos.x}px`,
        backgroundColor: '#2d2d2d',
        border: '1px solid #555',
        borderRadius: '6px',
        padding: '4px 0',
        minWidth: '160px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
        zIndex: '9001',
        color: '#ffffff',
        fontSize: '13px',
      },
      onClick: (e: Event) => e.stopPropagation(),
    },
      createElement('div', {
        style: { padding: '6px 14px', fontWeight: '600', borderBottom: '1px solid #444', marginBottom: '4px' },
      }, apps.find((a: UnityDesktopApp) => a.id === contextMenuAppId)?.label || contextMenuAppId),
      createElement('div', {
        style: { padding: '6px 14px', cursor: 'pointer' },
        onClick: () => { setAboutAppId(contextMenuAppId); setContextMenuAppId(null); },
        role: 'menuitem',
      }, 'About'),
    ),
  ) : null;

  // About dialog
  const aboutApp = aboutAppId ? apps.find((a: UnityDesktopApp) => a.id === aboutAppId) : null;
  const aboutDialogEl = aboutApp ? createElement('div', {
    className: 'unity-desktop__about-backdrop',
    style: {
      position: 'absolute',
      inset: '0',
      zIndex: '9500',
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    onClick: () => setAboutAppId(null),
  },
    createElement('div', {
      style: {
        backgroundColor: '#2d2d2d',
        border: '1px solid #555',
        borderRadius: '8px',
        padding: '24px',
        minWidth: '280px',
        color: '#ffffff',
        textAlign: 'center',
      },
      onClick: (e: Event) => e.stopPropagation(),
    },
      createElement('div', { style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px' } }, aboutApp.label),
      createElement('div', { style: { fontSize: '13px', marginBottom: '4px', color: '#aaa' } }, 'SpecifyJS Demo App'),
      createElement('div', { style: { fontSize: '13px', marginBottom: '4px', color: '#aaa' } }, 'MIT License'),
      createElement('div', { style: { fontSize: '13px', color: '#aaa' } }, 'v0.2.47'),
      createElement('button', {
        style: { marginTop: '16px', padding: '6px 16px', border: '1px solid #555', borderRadius: '4px', backgroundColor: '#444', color: '#fff', cursor: 'pointer' },
        onClick: () => setAboutAppId(null),
      }, 'Close'),
    ),
  ) : null;

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
      }, desktopEl, appsGridEl),
    ),
    // Overlays
    contextMenuEl,
    aboutDialogEl,
    lockOverlayEl,
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
