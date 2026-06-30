// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DraggableWindow -- Desktop-style draggable, resizable window component.
 *
 * Provides window chrome with title bar, window controls (minimize, maximize,
 * close), drag-to-move, 8-direction resize handles, edge snapping, boundary
 * clamping, and focus management. Designed as the core primitive for
 * multi-window UIs.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useCallback, useMemo, useRef } from 'specifyjs/hooks';
import { StatusBar } from './StatusBar';
import type { StatusBarProps } from './StatusBar';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface DraggableWindowProps {
  /** Unique window identifier */
  id: string;
  /** Window title displayed in the title bar */
  title: string;
  /** Optional icon (URL or emoji) displayed left of the title */
  icon?: string;
  /** Initial position relative to the containing element (pixels) */
  defaultPosition?: { x: number; y: number };
  /** Initial size (pixels) */
  defaultSize?: { width: number; height: number };
  /** Minimum size constraints (pixels). Default: { width: 200, height: 150 } */
  minSize?: { width: number; height: number };
  /** Maximum size constraints (pixels). Default: unconstrained */
  maxSize?: { width: number; height: number };
  /** Whether the window can be resized. Default: true */
  resizable?: boolean;
  /** Whether the window can be dragged. Default: true */
  draggable?: boolean;
  /** Current window state */
  windowState?: 'normal' | 'maximized' | 'minimized';
  /** Whether the window is currently focused (determines title bar styling) */
  focused?: boolean;
  /** Z-index for stacking order */
  zIndex?: number;
  /** Called when the user clicks the close button */
  onClose?: () => void;
  /** Called when the user clicks the minimize button */
  onMinimize?: () => void;
  /** Called when the user clicks the maximize/restore button */
  onMaximize?: () => void;
  /** Called when the window is clicked (for focus management) */
  onFocus?: () => void;
  /** Called when the window is moved. Reports final position. */
  onMove?: (position: { x: number; y: number }) => void;
  /** Called when the window is resized. Reports final size. */
  onResize?: (size: { width: number; height: number }) => void;
  /** Optional status bar rendered at the bottom of the window */
  statusBar?: StatusBarProps | false;
  /** Application content rendered inside the window body */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MIN_SIZE = { width: 200, height: 150 };
const DEFAULT_POSITION = { x: 50, y: 50 };
const DEFAULT_SIZE = { width: 400, height: 300 };
const RESIZE_HANDLE_SIZE = 8;
const SNAP_EDGE_THRESHOLD = 20;

type ResizeDirection = 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';

const RESIZE_CURSORS: Record<ResizeDirection, string> = {
  n: 'n-resize',
  s: 's-resize',
  e: 'e-resize',
  w: 'w-resize',
  ne: 'ne-resize',
  nw: 'nw-resize',
  se: 'se-resize',
  sw: 'sw-resize',
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DraggableWindow(props: DraggableWindowProps) {
  const {
    id,
    title,
    icon,
    defaultPosition = DEFAULT_POSITION,
    defaultSize = DEFAULT_SIZE,
    minSize = DEFAULT_MIN_SIZE,
    maxSize,
    resizable = true,
    draggable = true,
    windowState = 'normal',
    focused = true,
    zIndex,
    onClose,
    onMinimize,
    onMaximize,
    onFocus,
    onMove,
    onResize,
    statusBar,
    children,
  } = props;

  // -- State ----------------------------------------------------------------

  const [posX, setPosX] = useState(defaultPosition.x);
  const [posY, setPosY] = useState(defaultPosition.y);
  const [width, setWidth] = useState(defaultSize.width);
  const [height, setHeight] = useState(defaultSize.height);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [snapZone, setSnapZone] = useState<string | null>(null);

  // Refs for drag/resize tracking (not reactive)
  const dragRef = useRef<{
    startMouseX: number;
    startMouseY: number;
    startPosX: number;
    startPosY: number;
  } | null>(null);

  const resizeRef = useRef<{
    direction: ResizeDirection;
    startMouseX: number;
    startMouseY: number;
    startPosX: number;
    startPosY: number;
    startWidth: number;
    startHeight: number;
  } | null>(null);

  const windowRef = useRef<HTMLDivElement | null>(null);

  // -- Helpers --------------------------------------------------------------

  const clampSize = useCallback(
    (w: number, h: number): { width: number; height: number } => {
      let cw = Math.max(w, minSize.width);
      let ch = Math.max(h, minSize.height);
      if (maxSize) {
        cw = Math.min(cw, maxSize.width);
        ch = Math.min(ch, maxSize.height);
      }
      return { width: cw, height: ch };
    },
    [minSize, maxSize],
  );

  const getContainerBounds = useCallback((): { width: number; height: number } => {
    const el = windowRef.current;
    if (el && el.parentElement) {
      return {
        width: el.parentElement.clientWidth,
        height: el.parentElement.clientHeight,
      };
    }
    return { width: window.innerWidth, height: window.innerHeight };
  }, []);

  const clampPosition = useCallback(
    (x: number, y: number, w: number, h: number): { x: number; y: number } => {
      const bounds = getContainerBounds();
      const cx = Math.max(0, Math.min(x, bounds.width - w));
      const cy = Math.max(0, Math.min(y, bounds.height - h));
      return { x: cx, y: cy };
    },
    [getContainerBounds],
  );

  // -- Drag handlers --------------------------------------------------------

  const handleTitleBarMouseDown = useCallback(
    (e: Event) => {
      if (!draggable || windowState === 'maximized') return;
      const me = e as MouseEvent;
      // Ignore if the click target is a button (window controls)
      if ((me.target as HTMLElement).closest('button')) return;
      me.preventDefault();
      dragRef.current = {
        startMouseX: me.clientX,
        startMouseY: me.clientY,
        startPosX: posX,
        startPosY: posY,
      };
      setIsDragging(true);
    },
    [draggable, windowState, posX, posY],
  );

  const handleTitleBarDblClick = useCallback(
    (e: Event) => {
      // Ignore if the click target is a button
      if ((e.target as HTMLElement).closest('button')) return;
      // Do not allow maximize via double-click when window is not resizable
      if (!resizable) return;
      if (onMaximize) onMaximize();
    },
    [onMaximize, resizable],
  );

  // Document-level drag listeners
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      const drag = dragRef.current;
      if (!drag) return;

      const dx = me.clientX - drag.startMouseX;
      const dy = me.clientY - drag.startMouseY;

      let newX = drag.startPosX + dx;
      let newY = drag.startPosY + dy;

      // Boundary clamping
      const bounds = getContainerBounds();
      newX = Math.max(0, Math.min(newX, bounds.width - width));
      newY = Math.max(0, Math.min(newY, bounds.height - height));

      setPosX(newX);
      setPosY(newY);

      // Edge snap detection
      if (me.clientX <= SNAP_EDGE_THRESHOLD) {
        setSnapZone('left');
      } else if (me.clientX >= bounds.width - SNAP_EDGE_THRESHOLD) {
        setSnapZone('right');
      } else if (me.clientY <= SNAP_EDGE_THRESHOLD) {
        setSnapZone('top');
      } else {
        setSnapZone(null);
      }
    };

    const handleMouseUp = (e: Event) => {
      const me = e as MouseEvent;
      setIsDragging(false);

      // Apply snap zone
      const bounds = getContainerBounds();
      if (snapZone === 'left') {
        setPosX(0);
        setPosY(0);
        setWidth(Math.floor(bounds.width / 2));
        setHeight(bounds.height);
        setSnapZone(null);
        if (onMove) onMove({ x: 0, y: 0 });
        if (onResize) onResize({ width: Math.floor(bounds.width / 2), height: bounds.height });
        return;
      }
      if (snapZone === 'right') {
        const halfW = Math.floor(bounds.width / 2);
        setPosX(halfW);
        setPosY(0);
        setWidth(halfW);
        setHeight(bounds.height);
        setSnapZone(null);
        if (onMove) onMove({ x: halfW, y: 0 });
        if (onResize) onResize({ width: halfW, height: bounds.height });
        return;
      }
      if (snapZone === 'top') {
        setSnapZone(null);
        if (onMaximize) onMaximize();
        return;
      }
      setSnapZone(null);

      // Fire onMove with final position
      const drag = dragRef.current;
      if (drag && onMove) {
        const dx = me.clientX - drag.startMouseX;
        const dy = me.clientY - drag.startMouseY;
        let finalX = drag.startPosX + dx;
        let finalY = drag.startPosY + dy;
        finalX = Math.max(0, Math.min(finalX, bounds.width - width));
        finalY = Math.max(0, Math.min(finalY, bounds.height - height));
        onMove({ x: finalX, y: finalY });
      }
      dragRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, snapZone, width, height, getContainerBounds, onMove, onResize, onMaximize]);

  // -- Resize handlers ------------------------------------------------------

  const handleResizeMouseDown = useCallback(
    (direction: ResizeDirection) => (e: Event) => {
      if (!resizable || windowState !== 'normal') return;
      const me = e as MouseEvent;
      me.preventDefault();
      me.stopPropagation();
      resizeRef.current = {
        direction,
        startMouseX: me.clientX,
        startMouseY: me.clientY,
        startPosX: posX,
        startPosY: posY,
        startWidth: width,
        startHeight: height,
      };
      setIsResizing(true);
    },
    [resizable, windowState, posX, posY, width, height],
  );

  useEffect(() => {
    if (!isResizing) return;

    const handleMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      const r = resizeRef.current;
      if (!r) return;

      const dx = me.clientX - r.startMouseX;
      const dy = me.clientY - r.startMouseY;
      const dir = r.direction;

      let newW = r.startWidth;
      let newH = r.startHeight;
      let newX = r.startPosX;
      let newY = r.startPosY;

      if (dir.includes('e')) newW = r.startWidth + dx;
      if (dir.includes('w')) {
        newW = r.startWidth - dx;
        newX = r.startPosX + dx;
      }
      if (dir.includes('s')) newH = r.startHeight + dy;
      if (dir.includes('n')) {
        newH = r.startHeight - dy;
        newY = r.startPosY + dy;
      }

      // Clamp size
      const clamped = clampSize(newW, newH);

      // Adjust position if size was clamped on w/n edges
      if (dir.includes('w')) {
        newX = r.startPosX + (r.startWidth - clamped.width);
      }
      if (dir.includes('n')) {
        newY = r.startPosY + (r.startHeight - clamped.height);
      }

      setWidth(clamped.width);
      setHeight(clamped.height);
      setPosX(newX);
      setPosY(newY);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      if (onResize) onResize({ width, height });
      resizeRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, width, height, clampSize, onResize]);

  // -- Escape key handler ---------------------------------------------------

  useEffect(() => {
    if (!focused || !onClose) return;
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [focused, onClose]);

  // -- Click-to-focus handler -----------------------------------------------

  const handleWindowMouseDown = useCallback(
    (_e: Event) => {
      if (onFocus) onFocus();
    },
    [onFocus],
  );

  // -- Minimized: render nothing --------------------------------------------

  if (windowState === 'minimized') return null;

  // -- Compute styles -------------------------------------------------------

  const isMaximized = windowState === 'maximized';

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      position: 'absolute',
      display: 'flex',
      flexDirection: 'column',
      border: '1px solid var(--window-border, #555555)',
      borderRadius: isMaximized ? '0' : '6px',
      overflow: 'hidden',
      backgroundColor: 'var(--window-body-bg, #1e1e1e)',
      boxShadow: focused
        ? '0 8px 32px rgba(0, 0, 0, 0.4)'
        : '0 4px 16px rgba(0, 0, 0, 0.2)',
      transition: isMaximized ? 'all 200ms ease' : 'box-shadow 200ms ease',
      outline: 'none',
    };

    if (isMaximized) {
      s.top = '0';
      s.left = '0';
      s.width = '100%';
      s.height = '100%';
    } else {
      s.top = `${posY}px`;
      s.left = `${posX}px`;
      s.width = `${width}px`;
      s.height = `${height}px`;
    }

    if (zIndex !== undefined) {
      s.zIndex = String(zIndex);
    }

    if (isDragging) {
      s.cursor = 'grabbing';
      s.userSelect = 'none';
    }

    return s;
  }, [isMaximized, posX, posY, width, height, zIndex, focused, isDragging]);

  const titleBarStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'flex',
      alignItems: 'center',
      padding: '0 8px',
      height: '32px',
      backgroundColor: focused
        ? 'var(--window-title-bg, #2c2c2c)'
        : 'var(--window-title-bg, #2c2c2c)',
      color: 'var(--window-title-text, #ffffff)',
      userSelect: 'none',
      flexShrink: '0',
      cursor: draggable && !isMaximized ? 'grab' : 'default',
      opacity: focused ? '1' : '0.6',
    };
    if (isDragging) {
      s.cursor = 'grabbing';
    }
    return s;
  }, [focused, draggable, isMaximized, isDragging]);

  const bodyStyle: Record<string, string> = {
    flex: '1',
    overflow: 'auto',
    backgroundColor: 'var(--window-body-bg, #1e1e1e)',
  };

  const buttonBaseStyle: Record<string, string> = {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
    marginLeft: '6px',
    fontSize: '0',
    lineHeight: '0',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  // -- Build title bar children ---------------------------------------------

  const titleBarChildren: unknown[] = [];

  // Icon
  if (icon) {
    const isUrl = icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('data:');
    if (isUrl) {
      titleBarChildren.push(
        createElement('img', {
          src: icon,
          alt: '',
          style: { width: '16px', height: '16px', marginRight: '6px', flexShrink: '0' },
          className: 'draggable-window__icon',
        }),
      );
    } else {
      titleBarChildren.push(
        createElement(
          'span',
          {
            style: { marginRight: '6px', fontSize: '14px', flexShrink: '0' },
            className: 'draggable-window__icon',
          },
          icon,
        ),
      );
    }
  }

  // Title text
  titleBarChildren.push(
    createElement(
      'span',
      {
        className: 'draggable-window__title-text',
        style: {
          flex: '1',
          fontSize: '13px',
          fontWeight: '500',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        },
      },
      title,
    ),
  );

  // Window control buttons (minimize, maximize/restore, close)
  const controlButtons: unknown[] = [];

  controlButtons.push(createElement('button', {
    type: 'button',
    'aria-label': 'Minimize',
    className: 'draggable-window__btn-minimize',
    style: { ...buttonBaseStyle, backgroundColor: 'var(--window-button-minimize, #f39c12)' },
    onClick: (e: Event) => {
      e.stopPropagation();
      if (onMinimize) onMinimize();
    },
  }));

  // Only render maximize button when the window is resizable
  if (resizable) {
    controlButtons.push(createElement('button', {
      type: 'button',
      'aria-label': isMaximized ? 'Restore' : 'Maximize',
      className: 'draggable-window__btn-maximize',
      style: { ...buttonBaseStyle, backgroundColor: 'var(--window-button-maximize, #2ecc71)' },
      onClick: (e: Event) => {
        e.stopPropagation();
        if (onMaximize) onMaximize();
      },
    }));
  }

  controlButtons.push(createElement('button', {
    type: 'button',
    'aria-label': 'Close',
    className: 'draggable-window__btn-close',
    style: { ...buttonBaseStyle, backgroundColor: 'var(--window-button-close, #e74c3c)' },
    onClick: (e: Event) => {
      e.stopPropagation();
      if (onClose) onClose();
    },
  }));

  const controlsContainer = createElement(
    'div',
    {
      style: { display: 'flex', alignItems: 'center', flexShrink: '0' },
      className: 'draggable-window__controls',
    },
    ...controlButtons,
  );

  titleBarChildren.push(controlsContainer);

  // -- Resize handles -------------------------------------------------------

  const resizeHandles: unknown[] = [];

  if (resizable && !isMaximized) {
    const directions: ResizeDirection[] = ['n', 's', 'e', 'w', 'ne', 'nw', 'se', 'sw'];
    for (let i = 0; i < directions.length; i++) {
      const dir = directions[i];
      const handleStyle: Record<string, string> = {
        position: 'absolute',
        zIndex: '1',
      };

      // Position each handle
      if (dir === 'n') {
        handleStyle.top = '0';
        handleStyle.left = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.right = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 's') {
        handleStyle.bottom = '0';
        handleStyle.left = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.right = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'e') {
        handleStyle.top = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.right = '0';
        handleStyle.bottom = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'w') {
        handleStyle.top = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.left = '0';
        handleStyle.bottom = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'ne') {
        handleStyle.top = '0';
        handleStyle.right = '0';
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'nw') {
        handleStyle.top = '0';
        handleStyle.left = '0';
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'se') {
        handleStyle.bottom = '0';
        handleStyle.right = '0';
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      } else if (dir === 'sw') {
        handleStyle.bottom = '0';
        handleStyle.left = '0';
        handleStyle.width = `${RESIZE_HANDLE_SIZE}px`;
        handleStyle.height = `${RESIZE_HANDLE_SIZE}px`;
      }

      handleStyle.cursor = RESIZE_CURSORS[dir];

      resizeHandles.push(
        createElement('div', {
          className: `draggable-window__resize-handle draggable-window__resize-${dir}`,
          style: handleStyle,
          onMouseDown: handleResizeMouseDown(dir),
        }),
      );
    }
  }

  // -- Snap preview overlay -------------------------------------------------

  let snapPreview: unknown = null;
  if (snapZone) {
    const previewStyle: Record<string, string> = {
      position: 'fixed',
      backgroundColor: 'rgba(66, 133, 244, 0.2)',
      border: '2px solid rgba(66, 133, 244, 0.5)',
      borderRadius: '4px',
      zIndex: '999999',
      pointerEvents: 'none',
      transition: 'all 150ms ease',
    };

    if (snapZone === 'left') {
      previewStyle.top = '0';
      previewStyle.left = '0';
      previewStyle.width = '50%';
      previewStyle.height = '100%';
    } else if (snapZone === 'right') {
      previewStyle.top = '0';
      previewStyle.right = '0';
      previewStyle.width = '50%';
      previewStyle.height = '100%';
    } else if (snapZone === 'top') {
      previewStyle.top = '0';
      previewStyle.left = '0';
      previewStyle.width = '100%';
      previewStyle.height = '100%';
    }

    snapPreview = createElement('div', {
      className: 'draggable-window__snap-preview',
      style: previewStyle,
    });
  }

  // -- Assemble the tree ----------------------------------------------------

  const windowChildren: unknown[] = [];

  // Resize handles first (positioned absolutely)
  for (let i = 0; i < resizeHandles.length; i++) {
    windowChildren.push(resizeHandles[i]);
  }

  // Title bar
  windowChildren.push(
    createElement(
      'div',
      {
        className: 'draggable-window__title-bar',
        style: titleBarStyle,
        onMouseDown: handleTitleBarMouseDown,
        onDblClick: handleTitleBarDblClick,
        role: 'toolbar',
        'aria-label': `${title} window controls`,
      },
      ...titleBarChildren,
    ),
  );

  // Body
  windowChildren.push(
    createElement(
      'div',
      {
        className: 'draggable-window__body',
        style: bodyStyle,
      },
      children,
    ),
  );

  // Status bar (between body and end of window)
  if (statusBar && statusBar !== false) {
    windowChildren.push(createElement(StatusBar, statusBar));
  }

  const result: unknown[] = [
    createElement(
      'div',
      {
        ref: windowRef,
        id: `draggable-window-${id}`,
        className: `draggable-window ${focused ? 'draggable-window--focused' : 'draggable-window--unfocused'} draggable-window--${windowState}`,
        style: containerStyle,
        role: 'dialog',
        'aria-label': title,
        tabIndex: -1,
        onMouseDown: handleWindowMouseDown,
      },
      ...windowChildren,
    ),
  ];

  // Snap preview is a sibling (rendered at fixed position)
  if (snapPreview) {
    result.push(snapPreview);
  }

  // If there's only one element, return it directly; otherwise wrap in a fragment-like container
  if (result.length === 1) {
    return result[0];
  }

  // Return both the window and the snap preview
  return createElement('div', { style: { display: 'contents' } }, ...result);
}
