// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * WindowManager -- Context-based provider that manages multiple window states.
 *
 * Tracks positions, sizes, z-order, focus, and minimized/maximized state.
 * Exposes an imperative API via context for opening, closing, focusing,
 * and arranging windows.
 */

import { createElement } from '../../../../core/src/index';
import { createContext } from '../../../../core/src/context/create-context';
import { useState, useCallback, useMemo, useContext } from '../../../../core/src/hooks/index';
import type { SpecNode } from '../../../../core/src/shared/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface WindowState {
  /** Unique window identifier */
  id: string;
  /** Window title */
  title: string;
  /** Optional icon */
  icon?: string;
  /** Current position (pixels relative to workspace) */
  position: { x: number; y: number };
  /** Current size (pixels) */
  size: { width: number; height: number };
  /** Window display state */
  windowState: 'normal' | 'maximized' | 'minimized';
  /** Z-index for stacking order */
  zIndex: number;
  /** Whether this window is currently focused */
  focused: boolean;
  /** Application-specific props passed to the window content */
  appProps?: Record<string, unknown>;
}

export interface WindowManagerContextValue {
  /** All currently tracked windows */
  windows: WindowState[];
  /** Open a new window or focus it if already open */
  openWindow(config: {
    id: string;
    title: string;
    icon?: string;
    position?: { x: number; y: number };
    size?: { width: number; height: number };
    appProps?: Record<string, unknown>;
  }): void;
  /** Close and remove a window */
  closeWindow(id: string): void;
  /** Raise a window to the top and set it as focused */
  focusWindow(id: string): void;
  /** Minimize a window */
  minimizeWindow(id: string): void;
  /** Maximize a window to fill the workspace */
  maximizeWindow(id: string): void;
  /** Restore a window from maximized or minimized to normal */
  restoreWindow(id: string): void;
  /** Update a window's position */
  moveWindow(id: string, position: { x: number; y: number }): void;
  /** Update a window's size */
  resizeWindow(id: string, size: { width: number; height: number }): void;
  /** Tile all open, non-minimized windows in a grid */
  tileWindows(): void;
  /** Cascade all open, non-minimized windows with offset stacking */
  cascadeWindows(): void;
  /** Minimize all windows */
  minimizeAll(): void;
  /** Currently focused window ID, or null */
  focusedWindowId: string | null;
}

export interface WindowManagerProps {
  /** Workspace bounds */
  workspaceBounds?: {
    top: number;
    left: number;
    width: number;
    height: number;
  };
  /** Default size for new windows. Default: { width: 600, height: 400 } */
  defaultWindowSize?: { width: number; height: number };
  /** Position offset for cascading new windows. Default: { x: 30, y: 30 } */
  cascadeOffset?: { x: number; y: number };
  /** Called when any window is opened */
  onWindowOpen?: (id: string) => void;
  /** Called when any window is closed */
  onWindowClose?: (id: string) => void;
  /** Called when focus changes */
  onFocusChange?: (id: string | null) => void;
  /** Children */
  children?: unknown;
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

/* v8 ignore start -- default context value, only used without Provider */
const WindowManagerContext = createContext<WindowManagerContextValue>({
  windows: [],
  openWindow: () => {},
  closeWindow: () => {},
  focusWindow: () => {},
  minimizeWindow: () => {},
  maximizeWindow: () => {},
  restoreWindow: () => {},
  moveWindow: () => {},
  resizeWindow: () => {},
  tileWindows: () => {},
  cascadeWindows: () => {},
  minimizeAll: () => {},
  focusedWindowId: null,
});
/* v8 ignore stop */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_WINDOW_SIZE = { width: 600, height: 400 };
const DEFAULT_CASCADE_OFFSET = { x: 30, y: 30 };
const DEFAULT_WORKSPACE_BOUNDS = { top: 0, left: 0, width: 1920, height: 1080 };
const Z_ORDER_COMPACT_THRESHOLD = 1000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Compute the next cascade position given the current window count and offset.
 * Wraps when position would exceed workspace bounds.
 */
function computeCascadePosition(
  windowCount: number,
  offset: { x: number; y: number },
  bounds: { top: number; left: number; width: number; height: number },
  windowSize: { width: number; height: number },
): { x: number; y: number } {
  let x = bounds.left + windowCount * offset.x;
  let y = bounds.top + windowCount * offset.y;

  // Wrap if beyond workspace bounds
  const maxX = bounds.left + bounds.width - windowSize.width;
  const maxY = bounds.top + bounds.height - windowSize.height;

  if (maxX > bounds.left && x > maxX) {
    x = bounds.left + ((x - bounds.left) % Math.max(1, maxX - bounds.left));
  }
  if (maxY > bounds.top && y > maxY) {
    y = bounds.top + ((y - bounds.top) % Math.max(1, maxY - bounds.top));
  }

  return { x, y };
}

/**
 * Compact z-indices to sequential integers starting at 1.
 */
function compactZIndices(windows: WindowState[]): WindowState[] {
  const sorted = [...windows].sort((a, b) => a.zIndex - b.zIndex);
  const result: WindowState[] = [];
  for (let i = 0; i < sorted.length; i++) {
    result.push({ ...sorted[i], zIndex: i + 1 });
  }
  return result;
}

/**
 * Find the next highest z-order window (excluding a given id).
 */
function findNextFocusable(windows: WindowState[], excludeId: string): WindowState | null {
  let best: WindowState | null = null;
  for (let i = 0; i < windows.length; i++) {
    const w = windows[i];
    if (w.id === excludeId) continue;
    if (w.windowState === 'minimized') continue;
    if (best === null || w.zIndex > best.zIndex) {
      best = w;
    }
  }
  return best;
}

/**
 * Get the current max z-index across all windows.
 */
function getMaxZIndex(windows: WindowState[]): number {
  let max = 0;
  for (let i = 0; i < windows.length; i++) {
    if (windows[i].zIndex > max) max = windows[i].zIndex;
  }
  return max;
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function WindowManagerProvider(props: WindowManagerProps): SpecNode {
  const bounds = props.workspaceBounds ?? DEFAULT_WORKSPACE_BOUNDS;
  const defaultSize = props.defaultWindowSize ?? DEFAULT_WINDOW_SIZE;
  const cascadeOff = props.cascadeOffset ?? DEFAULT_CASCADE_OFFSET;

  const [windows, setWindows] = useState<WindowState[]>([]);

  const openWindow = useCallback(
    ((...args: unknown[]) => {
      const config = args[0] as {
        id: string;
        title: string;
        icon?: string;
        position?: { x: number; y: number };
        size?: { width: number; height: number };
        appProps?: Record<string, unknown>;
      };
      setWindows((prev: WindowState[]) => {
        // If window already exists, focus it
        const existing = prev.find((w: WindowState) => w.id === config.id);
        if (existing) {
          const maxZ = getMaxZIndex(prev);
          const newZ = maxZ + 1;
          let updated = prev.map((w: WindowState) => {
            if (w.id === config.id) {
              return {
                ...w,
                focused: true,
                zIndex: newZ,
                windowState: w.windowState === 'minimized' ? 'normal' as const : w.windowState,
              };
            }
            return { ...w, focused: false };
          });
          if (newZ > Z_ORDER_COMPACT_THRESHOLD) {
            updated = compactZIndices(updated);
          }
          return updated;
        }

        // Create new window
        const size = config.size ?? defaultSize;
        const position = config.position ??
          computeCascadePosition(prev.length, cascadeOff, bounds, size);
        const maxZ = getMaxZIndex(prev);
        const newZ = maxZ + 1;

        const newWindow: WindowState = {
          id: config.id,
          title: config.title,
          icon: config.icon,
          position,
          size,
          windowState: 'normal',
          zIndex: newZ,
          focused: true,
          appProps: config.appProps,
        };

        let updated = prev.map((w: WindowState) => ({ ...w, focused: false }));
        updated.push(newWindow);

        if (newZ > Z_ORDER_COMPACT_THRESHOLD) {
          updated = compactZIndices(updated);
        }

        if (props.onWindowOpen) props.onWindowOpen(config.id);
        if (props.onFocusChange) props.onFocusChange(config.id);

        return updated;
      });
    }) as (...args: unknown[]) => unknown,
    [defaultSize, cascadeOff, bounds, props.onWindowOpen, props.onFocusChange],
  ) as WindowManagerContextValue['openWindow'];

  const closeWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      setWindows((prev: WindowState[]) => {
        const closing = prev.find((w: WindowState) => w.id === id);
        if (!closing) return prev;

        const remaining = prev.filter((w: WindowState) => w.id !== id);

        if (closing.focused && remaining.length > 0) {
          // Focus next highest z-order
          const next = findNextFocusable(remaining, id);
          if (next) {
            const result = remaining.map((w: WindowState) => ({
              ...w,
              focused: w.id === next.id,
            }));
            if (props.onWindowClose) props.onWindowClose(id);
            if (props.onFocusChange) props.onFocusChange(next.id);
            return result;
          }
        }

        if (props.onWindowClose) props.onWindowClose(id);
        if (remaining.length === 0 && props.onFocusChange) {
          props.onFocusChange(null);
        }
        return remaining;
      });
    }) as (...args: unknown[]) => unknown,
    [props.onWindowClose, props.onFocusChange],
  ) as WindowManagerContextValue['closeWindow'];

  const focusWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      setWindows((prev: WindowState[]) => {
        const target = prev.find((w: WindowState) => w.id === id);
        if (!target) return prev;

        const maxZ = getMaxZIndex(prev);
        const newZ = maxZ + 1;

        let updated = prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, focused: true, zIndex: newZ };
          }
          return { ...w, focused: false };
        });

        if (newZ > Z_ORDER_COMPACT_THRESHOLD) {
          updated = compactZIndices(updated);
        }

        if (props.onFocusChange) props.onFocusChange(id);
        return updated;
      });
    }) as (...args: unknown[]) => unknown,
    [props.onFocusChange],
  ) as WindowManagerContextValue['focusWindow'];

  const minimizeWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      setWindows((prev: WindowState[]) => {
        const target = prev.find((w: WindowState) => w.id === id);
        if (!target) return prev;

        let updated = prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, windowState: 'minimized' as const, focused: false };
          }
          return w;
        });

        // Focus next highest z-order if the minimized window was focused
        if (target.focused) {
          const next = findNextFocusable(updated, id);
          if (next) {
            updated = updated.map((w: WindowState) => ({
              ...w,
              focused: w.id === next.id,
            }));
            if (props.onFocusChange) props.onFocusChange(next.id);
          } else {
            if (props.onFocusChange) props.onFocusChange(null);
          }
        }

        return updated;
      });
    }) as (...args: unknown[]) => unknown,
    [props.onFocusChange],
  ) as WindowManagerContextValue['minimizeWindow'];

  const maximizeWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      setWindows((prev: WindowState[]) => {
        return prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, windowState: 'maximized' as const };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [],
  ) as WindowManagerContextValue['maximizeWindow'];

  const restoreWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      setWindows((prev: WindowState[]) => {
        return prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, windowState: 'normal' as const };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [],
  ) as WindowManagerContextValue['restoreWindow'];

  const moveWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      const position = args[1] as { x: number; y: number };
      setWindows((prev: WindowState[]) => {
        return prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, position };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [],
  ) as WindowManagerContextValue['moveWindow'];

  const resizeWindow = useCallback(
    ((...args: unknown[]) => {
      const id = args[0] as string;
      const size = args[1] as { width: number; height: number };
      setWindows((prev: WindowState[]) => {
        return prev.map((w: WindowState) => {
          if (w.id === id) {
            return { ...w, size };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [],
  ) as WindowManagerContextValue['resizeWindow'];

  const tileWindows = useCallback(
    ((..._args: unknown[]) => {
      setWindows((prev: WindowState[]) => {
        const nonMinimized = prev.filter(
          (w: WindowState) => w.windowState !== 'minimized',
        );
        if (nonMinimized.length === 0) return prev;

        const count = nonMinimized.length;
        const tiled = new Map<string, { position: { x: number; y: number }; size: { width: number; height: number } }>();

        if (count === 1) {
          // Full workspace
          tiled.set(nonMinimized[0].id, {
            position: { x: bounds.left, y: bounds.top },
            size: { width: bounds.width, height: bounds.height },
          });
        } else if (count === 2) {
          // Side by side
          const halfW = Math.floor(bounds.width / 2);
          tiled.set(nonMinimized[0].id, {
            position: { x: bounds.left, y: bounds.top },
            size: { width: halfW, height: bounds.height },
          });
          tiled.set(nonMinimized[1].id, {
            position: { x: bounds.left + halfW, y: bounds.top },
            size: { width: bounds.width - halfW, height: bounds.height },
          });
        } else if (count === 3) {
          // 1 large left, 2 stacked right
          const halfW = Math.floor(bounds.width / 2);
          const halfH = Math.floor(bounds.height / 2);
          tiled.set(nonMinimized[0].id, {
            position: { x: bounds.left, y: bounds.top },
            size: { width: halfW, height: bounds.height },
          });
          tiled.set(nonMinimized[1].id, {
            position: { x: bounds.left + halfW, y: bounds.top },
            size: { width: bounds.width - halfW, height: halfH },
          });
          tiled.set(nonMinimized[2].id, {
            position: { x: bounds.left + halfW, y: bounds.top + halfH },
            size: { width: bounds.width - halfW, height: bounds.height - halfH },
          });
        } else {
          // NxM grid
          const cols = Math.ceil(Math.sqrt(count));
          const rows = Math.ceil(count / cols);
          const cellW = Math.floor(bounds.width / cols);
          const cellH = Math.floor(bounds.height / rows);

          for (let i = 0; i < nonMinimized.length; i++) {
            const row = Math.floor(i / cols);
            const col = i % cols;
            tiled.set(nonMinimized[i].id, {
              position: {
                x: bounds.left + col * cellW,
                y: bounds.top + row * cellH,
              },
              size: { width: cellW, height: cellH },
            });
          }
        }

        return prev.map((w: WindowState) => {
          const tile = tiled.get(w.id);
          if (tile) {
            return {
              ...w,
              position: tile.position,
              size: tile.size,
              windowState: 'normal' as const,
            };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [bounds],
  ) as WindowManagerContextValue['tileWindows'];

  const cascadeWindows = useCallback(
    ((..._args: unknown[]) => {
      setWindows((prev: WindowState[]) => {
        const nonMinimized = prev.filter(
          (w: WindowState) => w.windowState !== 'minimized',
        );
        if (nonMinimized.length === 0) return prev;

        // Sort by current z-index
        const sorted = [...nonMinimized].sort((a, b) => a.zIndex - b.zIndex);
        const cascaded = new Map<string, { position: { x: number; y: number }; zIndex: number }>();

        for (let i = 0; i < sorted.length; i++) {
          const pos = computeCascadePosition(i, cascadeOff, bounds, sorted[i].size);
          cascaded.set(sorted[i].id, { position: pos, zIndex: i + 1 });
        }

        return prev.map((w: WindowState) => {
          const casc = cascaded.get(w.id);
          if (casc) {
            return {
              ...w,
              position: casc.position,
              zIndex: casc.zIndex,
              windowState: 'normal' as const,
            };
          }
          return w;
        });
      });
    }) as (...args: unknown[]) => unknown,
    [cascadeOff, bounds],
  ) as WindowManagerContextValue['cascadeWindows'];

  const minimizeAll = useCallback(
    ((..._args: unknown[]) => {
      setWindows((prev: WindowState[]) => {
        const result = prev.map((w: WindowState) => ({
          ...w,
          windowState: 'minimized' as const,
          focused: false,
        }));
        if (props.onFocusChange) props.onFocusChange(null);
        return result;
      });
    }) as (...args: unknown[]) => unknown,
    [props.onFocusChange],
  ) as WindowManagerContextValue['minimizeAll'];

  const focusedWindowId = useMemo(() => {
    const focused = windows.find((w: WindowState) => w.focused);
    return focused ? focused.id : null;
  }, [windows]);

  const value: WindowManagerContextValue = useMemo(
    () => ({
      windows,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      moveWindow,
      resizeWindow,
      tileWindows,
      cascadeWindows,
      minimizeAll,
      focusedWindowId,
    }),
    [
      windows,
      openWindow,
      closeWindow,
      focusWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      moveWindow,
      resizeWindow,
      tileWindows,
      cascadeWindows,
      minimizeAll,
      focusedWindowId,
    ],
  );

  return createElement(WindowManagerContext.Provider, { value }, props.children);
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Access the WindowManager context from any descendant component.
 */
export function useWindowManager(): WindowManagerContextValue {
  return useContext(WindowManagerContext);
}
