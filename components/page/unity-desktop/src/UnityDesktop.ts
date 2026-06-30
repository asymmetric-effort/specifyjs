// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * UnityDesktop -- Configurable top-level layout that assembles the Ubuntu Unity
 * desktop environment from reusable sub-components: SystemTray (top panel),
 * Dock (left launcher), DesktopBackground (workspace), and WindowManager
 * (context provider for window state). Also provides toast notifications.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useMemo, useEffect, useRef } from 'specifyjs/hooks';
import { WindowManagerProvider, useWindowManager } from '../../../layout/window-manager/src/index';
import { MessageBusProvider, useMessageBus, useChannel, AppContextProvider } from '../../../layout/app-message-bus/src/index';
import { DragDropProvider, useDragDrop } from '../../../layout/app-drag-drop/src/index';
import type { AppMessage } from '../../../layout/app-message-bus/src/index';
import { SystemTray } from '../../../nav/system-tray/src/index';
import { Dock } from '../../../nav/dock/src/index';
import { DesktopBackground } from '../../../layout/desktop-background/src/index';
import { DraggableWindow } from '../../../layout/draggable-window/src/index';
import { WordProcessor } from '../../../page/word-processor/src/index';
import { IDE } from '../../../page/ide/src/index';
import { TradingDashboard } from '../../../page/trading-dashboard/src/index';
import { ProjectManagerApp } from '../../../../demos/project-manager/src/index';
import type { DockItem } from '../../../nav/dock/src/index';
import type { DockSignal } from '../../../layout/window-manager/src/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnityDesktopApp {
  id: string;
  icon: string;
  label: string;
  render?: (windowId: string) => unknown;
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
let instanceCounter = 0;

function nextInstanceId(appId: string): string {
  instanceCounter++;
  return `${appId}-${instanceCounter}`;
}

/**
 * Derive the base app label from `getMockContent`-compatible title.
 * Instance titles may look like "Files (2)" — strip the trailing " (N)".
 */
function baseLabel(title: string): string {
  return title.replace(/\s*\(\d+\)$/, '');
}

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
// Demo components for message bus and drag-drop
// ---------------------------------------------------------------------------

/**
 * TerminalContent -- Publishes a message on "terminal-output" when mounted.
 */
function TerminalContent() {
  const bus = useMessageBus();
  const publishedRef = useRef(false);

  useEffect(() => {
    if (!publishedRef.current) {
      publishedRef.current = true;
      bus.publish('terminal-output', { text: 'Terminal session started', pid: 1 });
    }
  }, [bus]);

  const contentStyle: Record<string, string> = {
    padding: '16px',
    fontSize: '12px',
    color: '#00ff41',
    height: '100%',
    overflow: 'auto',
    backgroundColor: '#1a1a2e',
    fontFamily: 'monospace',
  };

  return createElement('div', { style: contentStyle },
    createElement('div', null, '$ whoami'),
    createElement('div', null, 'operator'),
    createElement('div', null, '$ uname -a'),
    createElement('div', null, 'Linux specifyjs 6.1.0 #1 SMP x86_64 GNU/Linux'),
    createElement('div', { style: { opacity: '0.6', marginTop: '8px', fontSize: '10px' } },
      '[Published terminal-output message]'),
    createElement('div', null, '$ _'),
  );
}

/**
 * FilesContent -- Subscribes to "terminal-output" and displays received messages.
 * Also includes a draggable file card with type "application/file".
 */
function FilesContent() {
  const [messages, setMessages] = useState<string[]>([]);
  const dragDrop = useDragDrop();

  useChannel<{ text: string }>('terminal-output', (msg: AppMessage<{ text: string }>) => {
    setMessages((prev: string[]) => [...prev, `[terminal] ${msg.payload.text}`]);
  });

  const handleDragFile = useCallback((e: Event) => {
    e.preventDefault();
    dragDrop.startDrag({
      type: 'application/file',
      data: { name: 'readme.txt', size: 1024 },
      sourceAppId: 'files',
      preview: 'readme.txt',
    });
  }, [dragDrop]);

  const contentStyle: Record<string, string> = {
    padding: '16px',
    fontSize: '13px',
    color: 'var(--color-text, #333)',
    height: '100%',
    overflow: 'auto',
  };

  return createElement('div', { style: contentStyle },
    createElement('div', { style: { fontWeight: '600', marginBottom: '12px' } }, 'Home'),
    createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '6px' } },
      ...['\u{1F4C1} Documents', '\u{1F4C1} Downloads', '\u{1F4C1} Music', '\u{1F4C1} Pictures', '\u{1F4C1} Videos'].map(
        (f) => createElement('span', { style: { cursor: 'pointer' } }, f),
      ),
      createElement('span', {
        style: {
          cursor: 'grab',
          padding: '4px 8px',
          border: '1px dashed #94a3b8',
          borderRadius: '4px',
          backgroundColor: 'rgba(148, 163, 184, 0.1)',
        },
        onMouseDown: handleDragFile,
        'aria-label': 'Drag readme.txt',
      }, '\u{1F4C4} readme.txt (drag me)'),
    ),
    messages.length > 0 ? createElement('div', {
      style: {
        marginTop: '12px',
        padding: '8px',
        backgroundColor: 'rgba(0,0,0,0.05)',
        borderRadius: '4px',
        fontSize: '11px',
        fontFamily: 'monospace',
      },
    },
      createElement('div', { style: { fontWeight: '600', marginBottom: '4px' } }, 'Messages received:'),
      ...messages.map((m: string, i: number) =>
        createElement('div', { key: String(i), style: { color: '#64748b' } }, m),
      ),
    ) : null,
  );
}

// ---------------------------------------------------------------------------
// Mock app content for demo windows — GALLERY DEMO ONLY
//
// This function exists solely to provide placeholder content for the
// component gallery showcase. It is NOT part of the UnityDesktop API.
//
// Real consuming applications should NOT use this function. Instead,
// pass your own application components as children of <UnityApp>:
//
//   createElement(UnityApp, { id: 'my-app', title: 'My App' },
//     createElement(MyAppComponent, { ...myProps }),
//   )
//
// Application content, data fetching, and state management are the
// responsibility of the consuming project, not the desktop shell.
// See docs/components/page/unity-desktop.md for integration patterns.
// ---------------------------------------------------------------------------

function getMockContent(title: string, windowId?: string, onTitleChange?: (newTitle: string) => void): unknown {
  const contentStyle: Record<string, string> = {
    padding: '16px',
    fontSize: '13px',
    color: 'var(--color-text, #333)',
    height: '100%',
    overflow: 'auto',
  };
  const baseName = baseLabel(title);
  switch (baseName) {
    case 'Files':
      return createElement(AppContextProvider, { appId: 'files' },
        createElement(FilesContent, null),
      );
    case 'Terminal':
      return createElement(AppContextProvider, { appId: 'terminal' },
        createElement(TerminalContent, null),
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
    case 'Project Board':
      return createElement(ProjectManagerApp, {
        boardId: windowId || 'default',
        onTitleChange: onTitleChange || undefined,
      });
    default:
      return createElement('div', { style: contentStyle },
        createElement('div', { style: { textAlign: 'center', padding: '32px', color: '#94a3b8' } }, `${title} application content`),
      );
  }
}

// ---------------------------------------------------------------------------
// Internal: Open window state for UnityDesktopInner
// ---------------------------------------------------------------------------

interface InternalOpenWindow {
  id: string;
  appId: string;
  title: string;
  icon?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  focused: boolean;
  windowState: 'normal' | 'maximized' | 'minimized';
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

  // -----------------------------------------------------------------------
  // Read signals from WindowManager context
  // -----------------------------------------------------------------------

  const wm = useWindowManager();
  const wmActiveMenuBar = wm.activeMenuBar;
  const wmDockSignals = wm.dockSignals;
  // Stable refs for WM methods to avoid dependency churn in useCallbacks
  const wmRef = useRef(wm);
  wmRef.current = wm;

  // -----------------------------------------------------------------------
  // Local window state (direct state, not context-dependent)
  // -----------------------------------------------------------------------

  const [openWindows, setOpenWindows] = useState<InternalOpenWindow[]>([]);

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

  // Use a ref for apps to avoid stale closures in useCallback
  const appsRef = useRef(apps);
  appsRef.current = apps;
  const onAppOpenRef = useRef(onAppOpen);
  onAppOpenRef.current = onAppOpen;

  // Stable title change callbacks per window — avoids recreating closures on every render
  const titleChangeCallbacks = useRef<Record<string, (newTitle: string) => void>>({});
  // Ensure each window has a stable callback
  for (const w of openWindows) {
    if (!titleChangeCallbacks.current[w.id]) {
      const winId = w.id;
      titleChangeCallbacks.current[winId] = (newTitle: string) => {
        setOpenWindows((prev: InternalOpenWindow[]) =>
          prev.map((ww: InternalOpenWindow) => ww.id === winId ? { ...ww, title: newTitle } : ww));
      };
    }
  }

  /**
   * Open a brand-new instance of the given app.
   */
  const openNewInstance = useCallback((appId: string) => {
    const currentApps = appsRef.current;
    const app = currentApps.find((a: UnityDesktopApp) => a.id === appId);
    if (!app) return;

    setOpenWindows((prev: InternalOpenWindow[]) => {
      const existingCount = prev.filter((w: InternalOpenWindow) => w.appId === appId).length;
      const instanceNum = existingCount + 1;
      const title = instanceNum === 1 ? app.label : `${app.label} (${instanceNum})`;
      const winId = nextInstanceId(appId);
      const maxZ = prev.length > 0 ? Math.max(...prev.map((w: InternalOpenWindow) => w.zIndex)) + 1 : 1;
      const newWin: InternalOpenWindow = {
        id: winId,
        appId: app.id,
        title,
        icon: app.icon,
        x: 60 + prev.length * 30,
        y: 40 + prev.length * 30,
        width: 600,
        height: 400,
        zIndex: maxZ,
        focused: true,
        windowState: 'normal',
      };
      return [...prev.map((w: InternalOpenWindow) => ({ ...w, focused: false })), newWin];
    });

    // Register demo menu bars and dock signals for specific apps
    if (appId === 'files') {
      wmRef.current.setMenuBar('files', {
        menus: [
          {
            label: 'File',
            items: [
              { label: 'New', shortcut: 'Ctrl+N', onClick: () => {} },
              { label: 'Open', shortcut: 'Ctrl+O', onClick: () => {} },
              { label: 'Save', shortcut: 'Ctrl+S', onClick: () => {} },
            ],
          },
          {
            label: 'Edit',
            items: [
              { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => {} },
              { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => {} },
              { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => {} },
            ],
          },
        ],
      });
    }
    if (appId === 'terminal') {
      wmRef.current.signalDock('terminal', { badge: 3 });
    }

    if (onAppOpenRef.current) onAppOpenRef.current(appId);
  }, []);

  /**
   * Focus/restore a specific window instance by its unique window id.
   */
  const focusInstance = useCallback((winId: string) => {
    setOpenWindows((prev: InternalOpenWindow[]) => {
      const target = prev.find((w: InternalOpenWindow) => w.id === winId);
      if (!target) return prev;
      const maxZ = Math.max(...prev.map((w: InternalOpenWindow) => w.zIndex)) + 1;
      return prev.map((w: InternalOpenWindow) => w.id === winId
        ? { ...w, focused: true, zIndex: maxZ, windowState: w.windowState === 'minimized' ? 'normal' as const : w.windowState }
        : { ...w, focused: false });
    });
  }, []);

  const handleDockItemClick = useCallback((appId: string) => {
    setOpenWindows((prev: InternalOpenWindow[]) => {
      const instances = prev.filter((w: InternalOpenWindow) => w.appId === appId);
      if (instances.length === 0) {
        // No instances open — schedule opening a new one after this state update
        // We cannot call openNewInstance inside setOpenWindows (it also calls setOpenWindows).
        // Return prev unchanged; we will open below.
        return prev;
      }
      // One or more instances: focus the most recently focused (highest zIndex)
      const sorted = [...instances].sort((a: InternalOpenWindow, b: InternalOpenWindow) => b.zIndex - a.zIndex);
      const target = sorted[0];
      const maxZ = Math.max(...prev.map((w: InternalOpenWindow) => w.zIndex)) + 1;
      return prev.map((w: InternalOpenWindow) => w.id === target.id
        ? { ...w, focused: true, zIndex: maxZ, windowState: w.windowState === 'minimized' ? 'normal' as const : w.windowState }
        : { ...w, focused: false });
    });

    // If no instances were open we need to create one. We read openWindows
    // via a ref-like approach: schedule the open unconditionally and let
    // openNewInstance's setOpenWindows check again.
    // To keep it simple, we peek at current state via another updater.
    setOpenWindows((prev: InternalOpenWindow[]) => {
      const instances = prev.filter((w: InternalOpenWindow) => w.appId === appId);
      if (instances.length === 0) {
        // Open new instance inline (build the window here directly)
        const currentApps = appsRef.current;
        const app = currentApps.find((a: UnityDesktopApp) => a.id === appId);
        if (!app) return prev;
        const winId = nextInstanceId(appId);
        const maxZ = prev.length > 0 ? Math.max(...prev.map((w: InternalOpenWindow) => w.zIndex)) + 1 : 1;
        const newWin: InternalOpenWindow = {
          id: winId,
          appId: app.id,
          title: app.label,
          icon: app.icon,
          x: 60 + prev.length * 30,
          y: 40 + prev.length * 30,
          width: 600,
          height: 400,
          zIndex: maxZ,
          focused: true,
          windowState: 'normal',
        };

        // Side-effects for demo menu bars / dock signals
        if (appId === 'files') {
          wmRef.current.setMenuBar('files', {
            menus: [
              {
                label: 'File',
                items: [
                  { label: 'New', shortcut: 'Ctrl+N', onClick: () => {} },
                  { label: 'Open', shortcut: 'Ctrl+O', onClick: () => {} },
                  { label: 'Save', shortcut: 'Ctrl+S', onClick: () => {} },
                ],
              },
              {
                label: 'Edit',
                items: [
                  { label: 'Cut', shortcut: 'Ctrl+X', onClick: () => {} },
                  { label: 'Copy', shortcut: 'Ctrl+C', onClick: () => {} },
                  { label: 'Paste', shortcut: 'Ctrl+V', onClick: () => {} },
                ],
              },
            ],
          });
        }
        if (appId === 'terminal') {
          wmRef.current.signalDock('terminal', { badge: 3 });
        }
        if (onAppOpenRef.current) onAppOpenRef.current(appId);

        return [...prev.map((w: InternalOpenWindow) => ({ ...w, focused: false })), newWin];
      }
      return prev;
    });
  }, []);

  // -----------------------------------------------------------------------
  // Build dock items from apps + running state
  // -----------------------------------------------------------------------

  // Compute dock items directly (no useMemo — openWindows reference changes cause staleness issues)
  // Merge dock signals from WindowManager into items
  const dockItems: DockItem[] = apps.map((app: UnityDesktopApp) => {
    const isRunning = openWindows.some((w: InternalOpenWindow) => w.appId === app.id);
    const signal: DockSignal | undefined = wmDockSignals.get(app.id);
    const item: DockItem = {
      id: app.id,
      icon: app.icon,
      label: signal?.tooltip || app.label,
      active: isRunning,
    };
    if (signal) {
      if (signal.badge != null) item.badge = signal.badge > 0 ? signal.badge : undefined;
      if (signal.progress != null) item.progress = signal.progress > 0 ? signal.progress : undefined;
      if (signal.urgent) item.urgent = true;
    }
    return item;
  });

  // -----------------------------------------------------------------------
  // SystemTray config
  // -----------------------------------------------------------------------

  const focusedWindow = openWindows.find((w: InternalOpenWindow) => w.focused);
  const activeAppName = focusedWindow ? focusedWindow.title : undefined;

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

  const noop = useCallback(() => {}, []);
  const handleLogout = useCallback(() => { if (onLogout) onLogout(); }, [onLogout]);

  const userMenuItems: Array<{ label: string; icon?: string; onClick: () => void; divider?: boolean }> = [];
  if (user) {
    userMenuItems.push({ label: user.name, icon: undefined, onClick: noop, divider: false });
    userMenuItems.push({ label: '', icon: undefined, onClick: noop, divider: true });
  }
  userMenuItems.push({ label: 'Lock', icon: undefined, onClick: handleLock, divider: false });
  userMenuItems.push({ label: 'Logout', icon: undefined, onClick: handleLogout, divider: false });

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
    width: '100%',
    height: '100%',
    position: 'relative',
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const systemTrayEl = createElement(SystemTray, {
    activeAppName,
    activitiesButton: { label: 'Activities', onClick: toggleAppsGrid },
    appMenuBar: wmActiveMenuBar || undefined,
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

  // Render windows from local state
  const windowEls = openWindows
    .filter((w: InternalOpenWindow) => w.windowState !== 'minimized')
    .map((w: InternalOpenWindow) => createElement(DraggableWindow, {
      key: w.id,
      id: w.id,
      title: w.title,
      icon: w.icon,
      defaultPosition: { x: w.x, y: w.y },
      defaultSize: { width: w.width, height: w.height },
      zIndex: w.zIndex,
      focused: w.focused,
      windowState: w.windowState,
      onClose: () => {
        setOpenWindows((prev: InternalOpenWindow[]) => prev.filter((ww: InternalOpenWindow) => ww.id !== w.id));
      },
      onFocus: () => {
        setOpenWindows((prev: InternalOpenWindow[]) => {
          const maxZ = Math.max(...prev.map((ww: InternalOpenWindow) => ww.zIndex)) + 1;
          return prev.map((ww: InternalOpenWindow) => ww.id === w.id
            ? { ...ww, focused: true, zIndex: maxZ }
            : { ...ww, focused: false });
        });
      },
      onMinimize: () => {
        setOpenWindows((prev: InternalOpenWindow[]) =>
          prev.map((ww: InternalOpenWindow) => ww.id === w.id ? { ...ww, windowState: 'minimized' as const } : ww));
      },
      onMaximize: () => {
        setOpenWindows((prev: InternalOpenWindow[]) =>
          prev.map((ww: InternalOpenWindow) => ww.id === w.id
            ? { ...ww, windowState: ww.windowState === 'maximized' ? 'normal' as const : 'maximized' as const }
            : ww));
      },
    },
      // Gallery demo only — real apps pass their own content as UnityApp children.
      // See docs/components/page/unity-desktop.md for integration patterns.
      (() => {
        const app = apps.find((a: UnityDesktopApp) => a.id === w.appId);
        // Use app's render callback if provided, otherwise fall back to mock content
        return app?.render
          ? app.render(w.id)
          : getMockContent(app?.label || w.title, w.id, titleChangeCallbacks.current[w.id]);
      })(),
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

  // Context menu — lists New, open instances, and About
  const contextMenuEl = (() => {
    if (!contextMenuAppId) return null;

    const ctxApp = apps.find((a: UnityDesktopApp) => a.id === contextMenuAppId);
    const ctxInstances = openWindows.filter((w: InternalOpenWindow) => w.appId === contextMenuAppId);

    const menuItemStyle: Record<string, string> = { padding: '6px 14px', cursor: 'pointer' };
    const menuItemHoverHandlers = {
      onMouseEnter: (e: Event) => { (e.currentTarget as HTMLElement).style.backgroundColor = '#444'; },
      onMouseLeave: (e: Event) => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; },
    };
    const separatorStyle: Record<string, string> = { borderBottom: '1px solid #444', margin: '4px 0' };

    const menuChildren: unknown[] = [];

    // "New" item — always first
    menuChildren.push(createElement('div', {
      key: 'new',
      style: menuItemStyle,
      ...menuItemHoverHandlers,
      onClick: () => { openNewInstance(contextMenuAppId); setContextMenuAppId(null); },
      role: 'menuitem',
    }, '\u{25CF} New'));

    // Separator + instance list (only if instances exist)
    if (ctxInstances.length > 0) {
      menuChildren.push(createElement('div', { key: 'sep-1', style: separatorStyle }));

      // Renumber instances for display: 1-based order by zIndex (creation order is fine too)
      ctxInstances.forEach((inst: InternalOpenWindow, idx: number) => {
        const displayLabel = inst.title;
        menuChildren.push(createElement('div', {
          key: `inst-${inst.id}`,
          style: menuItemStyle,
          ...menuItemHoverHandlers,
          onClick: () => { focusInstance(inst.id); setContextMenuAppId(null); },
          role: 'menuitem',
        }, displayLabel));
      });
    }

    // Separator before About
    menuChildren.push(createElement('div', { key: 'sep-2', style: separatorStyle }));

    // "About" item — always last
    menuChildren.push(createElement('div', {
      key: 'about',
      style: menuItemStyle,
      ...menuItemHoverHandlers,
      onClick: () => { setAboutAppId(contextMenuAppId); setContextMenuAppId(null); },
      role: 'menuitem',
    }, 'About'));

    return createElement('div', {
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
      }, ...menuChildren),
    );
  })();

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
        style: { flex: '1', position: 'relative', overflow: 'hidden', minHeight: '0' },
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
    createElement(
      MessageBusProvider,
      null,
      createElement(
        DragDropProvider,
        null,
        createElement(UnityDesktopInner, {
          apps,
          user,
          onAppOpen,
          onLogout,
          theme,
          children,
        }),
      ),
    ),
  );
}
