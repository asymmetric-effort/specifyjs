// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * UnityApp -- A window container for use inside UnityDesktop.
 *
 * Wraps DraggableWindow with WindowManager integration. Consuming projects
 * use this component to inject their app content into the desktop environment.
 * Connects onClose/onFocus/onMove/onResize to the WindowManager context.
 */

import { createElement } from 'specifyjs';
import { useCallback, useMemo, useEffect, useRef } from 'specifyjs/hooks';
import { DraggableWindow } from '../../../layout/draggable-window/src/index';
import { useWindowManager } from '../../../layout/window-manager/src/index';
import { AppContextProvider } from '../../../layout/app-message-bus/src/index';
import type { WindowManagerContextValue, WindowState, AppMenuBar } from '../../../layout/window-manager/src/index';
import type { StatusBarProps } from '../../../layout/draggable-window/src/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UnityAppProps {
  /** Unique identifier for this app window */
  id: string;
  /** Window title */
  title: string;
  /** Optional icon (URL or emoji) */
  icon?: string;
  /** Default position when first opened */
  defaultPosition?: { x: number; y: number };
  /** Default size when first opened */
  defaultSize?: { width: number; height: number };
  /** Minimum size constraints */
  minSize?: { width: number; height: number };
  /** Whether the window can be resized. Default: true */
  resizable?: boolean;
  /** Called when the window is closed */
  onClose?: () => void;
  /** Menu bar definition; registered with WindowManager when provided */
  menuBar?: AppMenuBar;
  /** Optional status bar rendered at the bottom of the window */
  statusBar?: StatusBarProps | false;
  /** Called when this window gains focus */
  onActivate?: () => void;
  /** Called when this window loses focus */
  onDeactivate?: () => void;
  /** Application content */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function UnityApp(props: UnityAppProps) {
  const {
    id,
    title,
    icon,
    defaultPosition,
    defaultSize,
    minSize,
    resizable = true,
    onClose,
    menuBar,
    statusBar,
    onActivate,
    onDeactivate,
    children,
  } = props;

  const windowManager: WindowManagerContextValue = useWindowManager();

  // Find this window's state in the manager
  const windowState: WindowState | undefined = useMemo(() => {
    return windowManager.windows.find((w: WindowState) => w.id === id);
  }, [windowManager.windows, id]);

  // -----------------------------------------------------------------------
  // Menu bar registration (must be before early return to satisfy hooks rules)
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (menuBar) {
      windowManager.setMenuBar(id, menuBar);
    } else {
      windowManager.clearMenuBar(id);
    }
    return () => {
      windowManager.clearMenuBar(id);
    };
  }, [menuBar, id, windowManager]);

  // -----------------------------------------------------------------------
  // Focus lifecycle callbacks (onActivate / onDeactivate)
  // -----------------------------------------------------------------------

  const wasFocusedRef = useRef(false);
  const isFocused = windowState ? windowState.focused : false;

  useEffect(() => {
    const wasFocused = wasFocusedRef.current;
    wasFocusedRef.current = isFocused;

    if (isFocused && !wasFocused) {
      if (onActivate) onActivate();
    } else if (!isFocused && wasFocused) {
      if (onDeactivate) onDeactivate();
    }
  }, [isFocused, onActivate, onDeactivate]);

  // -----------------------------------------------------------------------
  // Handlers (all hooks must be called before any early return)
  // -----------------------------------------------------------------------

  const handleClose = useCallback(() => {
    windowManager.closeWindow(id);
    if (onClose) onClose();
  }, [windowManager, id, onClose]);

  const handleFocus = useCallback(() => {
    windowManager.focusWindow(id);
  }, [windowManager, id]);

  const handleMove = useCallback((position: { x: number; y: number }) => {
    windowManager.moveWindow(id, position);
  }, [windowManager, id]);

  const handleResize = useCallback((size: { width: number; height: number }) => {
    windowManager.resizeWindow(id, size);
  }, [windowManager, id]);

  const handleMinimize = useCallback(() => {
    windowManager.minimizeWindow(id);
  }, [windowManager, id]);

  const handleMaximize = useCallback(() => {
    if (windowState && windowState.windowState === 'maximized') {
      windowManager.restoreWindow(id);
    } else {
      windowManager.maximizeWindow(id);
    }
  }, [windowManager, id, windowState]);

  // -----------------------------------------------------------------------
  // Early return: register window if not yet tracked
  // -----------------------------------------------------------------------

  if (!windowState) {
    // Open the window in the manager
    windowManager.openWindow({
      id,
      title,
      icon,
      position: defaultPosition,
      size: defaultSize,
    });
    // Return null for this render; next render will have the state
    return null;
  }

  // -----------------------------------------------------------------------
  // Render DraggableWindow with state from WindowManager
  // -----------------------------------------------------------------------

  return createElement(
    AppContextProvider,
    { appId: id },
    createElement(DraggableWindow, {
      id,
      title,
      icon,
      defaultPosition: windowState.position,
      defaultSize: windowState.size,
      minSize,
      resizable,
      windowState: windowState.windowState,
      focused: windowState.focused,
      zIndex: windowState.zIndex,
      onClose: handleClose,
      onFocus: handleFocus,
      onMove: handleMove,
      onResize: handleResize,
      onMinimize: handleMinimize,
      onMaximize: handleMaximize,
      statusBar: statusBar,
      children,
    }),
  );
}
