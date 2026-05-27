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
import { useCallback, useMemo } from 'specifyjs/hooks';
import { DraggableWindow } from '../../../layout/draggable-window/src/index';
import { useWindowManager } from '../../../layout/window-manager/src/index';
import type { WindowManagerContextValue, WindowState } from '../../../layout/window-manager/src/index';

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
    children,
  } = props;

  const windowManager: WindowManagerContextValue = useWindowManager();

  // Find this window's state in the manager
  const windowState: WindowState | undefined = useMemo(() => {
    return windowManager.windows.find((w: WindowState) => w.id === id);
  }, [windowManager.windows, id]);

  // If the window isn't tracked by the manager yet, register it on first render
  // (this handles the case where UnityApp is rendered as a child of UnityDesktop
  // without an explicit openWindow call)
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
  // Handlers
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
  // Render DraggableWindow with state from WindowManager
  // -----------------------------------------------------------------------

  return createElement(DraggableWindow, {
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
    children,
  });
}
