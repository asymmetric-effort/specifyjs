// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { WindowManagerProvider, useWindowManager } from '../src/index';
import type { WindowManagerContextValue, WindowManagerProps } from '../src/index';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

/**
 * Renders a WindowManagerProvider with an Inspector child that captures the
 * context value. Returns accessors for the captured context and a flush
 * helper to wait for state updates.
 */
function setup(providerProps: Partial<WindowManagerProps> = {}) {
  let ctx: WindowManagerContextValue = null as unknown as WindowManagerContextValue;

  function Inspector() {
    ctx = useWindowManager();
    // Serialize windows array length into DOM for easy assertions
    return createElement('div', { id: 'inspector' }, String(ctx.windows.length));
  }

  const root = createRoot(container);
  root.render(
    createElement(
      WindowManagerProvider,
      providerProps as WindowManagerProps,
      createElement(Inspector, null),
    ),
  );

  async function flush() {
    await new Promise((r) => setTimeout(r, 20));
  }

  function getCtx(): WindowManagerContextValue {
    return ctx;
  }

  return { getCtx, flush, root };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('WindowManagerProvider', () => {
  // ---- Rendering & defaults ----

  it('renders children', () => {
    const { getCtx } = setup();
    expect(container.querySelector('#inspector')).toBeTruthy();
    expect(getCtx()).toBeTruthy();
  });

  it('starts with empty windows array', () => {
    const { getCtx } = setup();
    expect(getCtx().windows).toEqual([]);
  });

  it('starts with focusedWindowId as null', () => {
    const { getCtx } = setup();
    expect(getCtx().focusedWindowId).toBeNull();
  });

  it('exposes all context methods', () => {
    const { getCtx } = setup();
    const ctx = getCtx();
    expect(typeof ctx.openWindow).toBe('function');
    expect(typeof ctx.closeWindow).toBe('function');
    expect(typeof ctx.focusWindow).toBe('function');
    expect(typeof ctx.minimizeWindow).toBe('function');
    expect(typeof ctx.maximizeWindow).toBe('function');
    expect(typeof ctx.restoreWindow).toBe('function');
    expect(typeof ctx.moveWindow).toBe('function');
    expect(typeof ctx.resizeWindow).toBe('function');
    expect(typeof ctx.tileWindows).toBe('function');
    expect(typeof ctx.cascadeWindows).toBe('function');
    expect(typeof ctx.minimizeAll).toBe('function');
  });

  // ---- openWindow ----

  it('opens a window with default size', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'win1', title: 'Window 1' });
    await flush();
    const ctx = getCtx();
    expect(ctx.windows.length).toBe(1);
    expect(ctx.windows[0].id).toBe('win1');
    expect(ctx.windows[0].title).toBe('Window 1');
    expect(ctx.windows[0].size).toEqual({ width: 600, height: 400 });
    expect(ctx.windows[0].windowState).toBe('normal');
    expect(ctx.windows[0].focused).toBe(true);
  });

  it('opens a window with custom size', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'win1', title: 'W', size: { width: 800, height: 600 } });
    await flush();
    expect(getCtx().windows[0].size).toEqual({ width: 800, height: 600 });
  });

  it('opens a window with explicit position', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'win1', title: 'W', position: { x: 100, y: 200 } });
    await flush();
    expect(getCtx().windows[0].position).toEqual({ x: 100, y: 200 });
  });

  it('opens a window with icon and appProps', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({
      id: 'win1',
      title: 'W',
      icon: 'folder',
      appProps: { path: '/home' },
    });
    await flush();
    expect(getCtx().windows[0].icon).toBe('folder');
    expect(getCtx().windows[0].appProps).toEqual({ path: '/home' });
  });

  it('auto-cascades position for multiple windows', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    const ctx = getCtx();
    // First window at offset 0, second at offset 30
    expect(ctx.windows[0].position).toEqual({ x: 0, y: 0 });
    expect(ctx.windows[1].position).toEqual({ x: 30, y: 30 });
  });

  it('uses custom defaultWindowSize', async () => {
    const { getCtx, flush } = setup({ defaultWindowSize: { width: 300, height: 200 } });
    getCtx().openWindow({ id: 'w1', title: 'W' });
    await flush();
    expect(getCtx().windows[0].size).toEqual({ width: 300, height: 200 });
  });

  it('uses custom cascadeOffset', async () => {
    const { getCtx, flush } = setup({ cascadeOffset: { x: 50, y: 50 } });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    expect(getCtx().windows[1].position).toEqual({ x: 50, y: 50 });
  });

  it('focuses existing window instead of creating duplicate', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    // w2 is now focused
    expect(getCtx().focusedWindowId).toBe('w2');
    // Open w1 again — should not create duplicate
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    expect(getCtx().windows.length).toBe(2);
    expect(getCtx().focusedWindowId).toBe('w1');
  });

  it('restores minimized window on duplicate open', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('minimized');
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
    expect(getCtx().windows[0].focused).toBe(true);
  });

  it('calls onWindowOpen callback', async () => {
    const onOpen = vi.fn();
    const { getCtx, flush } = setup({ onWindowOpen: onOpen });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    expect(onOpen).toHaveBeenCalledWith('w1');
  });

  it('calls onFocusChange when opening', async () => {
    const onFocus = vi.fn();
    const { getCtx, flush } = setup({ onFocusChange: onFocus });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    expect(onFocus).toHaveBeenCalledWith('w1');
  });

  // ---- closeWindow ----

  it('closes a window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().closeWindow('w1');
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  it('focuses next highest z-order on close', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().openWindow({ id: 'w3', title: 'W3' });
    await flush();
    // w3 is focused, close it
    getCtx().closeWindow('w3');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w2');
  });

  it('sets focusedWindowId to null when last window closed', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().closeWindow('w1');
    await flush();
    expect(getCtx().focusedWindowId).toBeNull();
  });

  it('does nothing when closing nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().closeWindow('nonexistent');
    await flush();
    expect(getCtx().windows.length).toBe(1);
  });

  it('calls onWindowClose callback', async () => {
    const onClose = vi.fn();
    const { getCtx, flush } = setup({ onWindowClose: onClose });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().closeWindow('w1');
    await flush();
    expect(onClose).toHaveBeenCalledWith('w1');
  });

  it('closing unfocused window does not change focus', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    // w2 is focused, close w1 (unfocused)
    getCtx().closeWindow('w1');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w2');
  });

  // ---- focusWindow ----

  it('focuses a window and raises z-index', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    const w2z = getCtx().windows.find((w) => w.id === 'w2')!.zIndex;
    getCtx().focusWindow('w1');
    await flush();
    const w1 = getCtx().windows.find((w) => w.id === 'w1')!;
    expect(w1.focused).toBe(true);
    expect(w1.zIndex).toBeGreaterThan(w2z);
    expect(getCtx().focusedWindowId).toBe('w1');
  });

  it('unfocuses other windows when one is focused', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().focusWindow('w1');
    await flush();
    const w2 = getCtx().windows.find((w) => w.id === 'w2')!;
    expect(w2.focused).toBe(false);
  });

  it('does nothing when focusing nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().focusWindow('nonexistent');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w1');
  });

  // ---- minimizeWindow ----

  it('minimizes a window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('minimized');
    expect(getCtx().windows[0].focused).toBe(false);
  });

  it('focuses next window when minimizing focused window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    // w2 focused, minimize it
    getCtx().minimizeWindow('w2');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w1');
  });

  it('sets focusedWindowId to null when all minimized', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    expect(getCtx().focusedWindowId).toBeNull();
  });

  it('does nothing when minimizing nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().minimizeWindow('nonexistent');
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- maximizeWindow ----

  it('maximizes a window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().maximizeWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('maximized');
  });

  it('does nothing when maximizing nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().maximizeWindow('nonexistent');
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- restoreWindow ----

  it('restores a maximized window to normal', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().maximizeWindow('w1');
    await flush();
    getCtx().restoreWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
  });

  it('restores a minimized window to normal', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    getCtx().restoreWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
  });

  it('does nothing when restoring nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().restoreWindow('nonexistent');
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- moveWindow ----

  it('moves a window to a new position', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().moveWindow('w1', { x: 200, y: 300 });
    await flush();
    expect(getCtx().windows[0].position).toEqual({ x: 200, y: 300 });
  });

  it('does nothing when moving nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().moveWindow('nonexistent', { x: 100, y: 100 });
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- resizeWindow ----

  it('resizes a window', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().resizeWindow('w1', { width: 800, height: 600 });
    await flush();
    expect(getCtx().windows[0].size).toEqual({ width: 800, height: 600 });
  });

  it('does nothing when resizing nonexistent window', async () => {
    const { getCtx, flush } = setup();
    getCtx().resizeWindow('nonexistent', { width: 100, height: 100 });
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- tileWindows ----

  it('tiles 1 window to fill workspace', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().tileWindows();
    await flush();
    const w = getCtx().windows[0];
    expect(w.position).toEqual({ x: 0, y: 0 });
    expect(w.size).toEqual({ width: 1000, height: 800 });
  });

  it('tiles 2 windows side by side', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    const w1 = ws.find((w) => w.id === 'w1')!;
    const w2 = ws.find((w) => w.id === 'w2')!;
    expect(w1.size.width).toBe(500);
    expect(w2.size.width).toBe(500);
    expect(w1.position.x).toBe(0);
    expect(w2.position.x).toBe(500);
  });

  it('tiles 3 windows: 1 large left, 2 stacked right', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().openWindow({ id: 'w3', title: 'W3' });
    await flush();
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    const w1 = ws.find((w) => w.id === 'w1')!;
    const w2 = ws.find((w) => w.id === 'w2')!;
    const w3 = ws.find((w) => w.id === 'w3')!;
    expect(w1.size).toEqual({ width: 500, height: 800 });
    expect(w2.size).toEqual({ width: 500, height: 400 });
    expect(w3.size).toEqual({ width: 500, height: 400 });
    expect(w2.position.y).toBe(0);
    expect(w3.position.y).toBe(400);
  });

  it('tiles 4 windows in 2x2 grid', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    for (let i = 1; i <= 4; i++) {
      getCtx().openWindow({ id: `w${i}`, title: `W${i}` });
      await flush();
    }
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    // 4 windows: ceil(sqrt(4))=2 cols, ceil(4/2)=2 rows
    expect(ws.find((w) => w.id === 'w1')!.size).toEqual({ width: 500, height: 400 });
    expect(ws.find((w) => w.id === 'w4')!.position).toEqual({ x: 500, y: 400 });
  });

  it('tiles 5 windows in 3x2 grid', async () => {
    const bounds = { top: 0, left: 0, width: 900, height: 600 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    for (let i = 1; i <= 5; i++) {
      getCtx().openWindow({ id: `w${i}`, title: `W${i}` });
      await flush();
    }
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    // 5 windows: ceil(sqrt(5))=3 cols, ceil(5/3)=2 rows
    expect(ws.find((w) => w.id === 'w1')!.size).toEqual({ width: 300, height: 300 });
  });

  it('tiles 6 windows in 3x2 grid', async () => {
    const bounds = { top: 0, left: 0, width: 900, height: 600 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    for (let i = 1; i <= 6; i++) {
      getCtx().openWindow({ id: `w${i}`, title: `W${i}` });
      await flush();
    }
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    // 6 windows: ceil(sqrt(6))=3 cols, ceil(6/3)=2 rows
    expect(ws.find((w) => w.id === 'w6')!.position).toEqual({ x: 600, y: 300 });
  });

  it('skips minimized windows when tiling', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().openWindow({ id: 'w3', title: 'W3' });
    await flush();
    getCtx().minimizeWindow('w2');
    await flush();
    getCtx().tileWindows();
    await flush();
    const ws = getCtx().windows;
    // Only w1 and w3 should be tiled (2 windows -> side by side)
    const w1 = ws.find((w) => w.id === 'w1')!;
    const w3 = ws.find((w) => w.id === 'w3')!;
    expect(w1.size.width).toBe(500);
    expect(w3.size.width).toBe(500);
    // w2 should remain minimized
    expect(ws.find((w) => w.id === 'w2')!.windowState).toBe('minimized');
  });

  it('does nothing when tiling with no windows', async () => {
    const { getCtx, flush } = setup();
    getCtx().tileWindows();
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  it('sets windowState to normal when tiling', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().maximizeWindow('w1');
    await flush();
    getCtx().tileWindows();
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
  });

  // ---- cascadeWindows ----

  it('cascades windows with offset', async () => {
    const bounds = { top: 0, left: 0, width: 1920, height: 1080 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().openWindow({ id: 'w3', title: 'W3' });
    await flush();
    getCtx().cascadeWindows();
    await flush();
    const ws = getCtx().windows;
    const sorted = [...ws].sort((a, b) => a.zIndex - b.zIndex);
    expect(sorted[0].position).toEqual({ x: 0, y: 0 });
    expect(sorted[1].position).toEqual({ x: 30, y: 30 });
    expect(sorted[2].position).toEqual({ x: 60, y: 60 });
  });

  it('skips minimized windows when cascading', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    getCtx().cascadeWindows();
    await flush();
    // w1 remains minimized and untouched
    expect(getCtx().windows.find((w) => w.id === 'w1')!.windowState).toBe('minimized');
  });

  it('does nothing when cascading with no windows', async () => {
    const { getCtx, flush } = setup();
    getCtx().cascadeWindows();
    await flush();
    expect(getCtx().windows.length).toBe(0);
  });

  // ---- minimizeAll ----

  it('minimizes all windows', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().minimizeAll();
    await flush();
    const ws = getCtx().windows;
    expect(ws.every((w) => w.windowState === 'minimized')).toBe(true);
    expect(ws.every((w) => !w.focused)).toBe(true);
    expect(getCtx().focusedWindowId).toBeNull();
  });

  it('calls onFocusChange(null) on minimizeAll', async () => {
    const onFocus = vi.fn();
    const { getCtx, flush } = setup({ onFocusChange: onFocus });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    onFocus.mockClear();
    getCtx().minimizeAll();
    await flush();
    expect(onFocus).toHaveBeenCalledWith(null);
  });

  // ---- Z-order compaction ----

  it('compacts z-indices when max exceeds 1000', async () => {
    const { getCtx, flush } = setup();
    // Open a window to get started
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();

    // Simulate high z-index by repeatedly focusing
    // We need to trigger the threshold. Instead, let's open many windows fast.
    // The z-index starts at 1 and increments. We need > 1000.
    // Focus 1001 times to trigger compaction
    for (let i = 0; i < 1001; i++) {
      getCtx().focusWindow(i % 2 === 0 ? 'w1' : 'w2');
      await flush();
    }

    const ws = getCtx().windows;
    const maxZ = Math.max(...ws.map((w) => w.zIndex));
    // After compaction, z-indices should be sequential from 1
    expect(maxZ).toBeLessThanOrEqual(ws.length);
  });

  // ---- Cascade wrapping ----

  it('wraps cascade position when exceeding workspace bounds', async () => {
    const bounds = { top: 0, left: 0, width: 700, height: 500 };
    const offset = { x: 30, y: 30 };
    const windowSize = { width: 600, height: 400 };
    const { getCtx, flush } = setup({
      workspaceBounds: bounds,
      cascadeOffset: offset,
      defaultWindowSize: windowSize,
    });

    // maxX = 700 - 600 = 100, so after 4 windows (0, 30, 60, 90),
    // the 5th would be at 120 which exceeds 100, so it wraps
    for (let i = 1; i <= 5; i++) {
      getCtx().openWindow({ id: `w${i}`, title: `W${i}` });
      await flush();
    }

    const ws = getCtx().windows;
    const w5 = ws.find((w) => w.id === 'w5')!;
    // Position should have wrapped
    expect(w5.position.x).toBeLessThanOrEqual(100);
  });

  // ---- Workspace bounds ----

  it('uses custom workspace bounds for tiling', async () => {
    const bounds = { top: 50, left: 100, width: 800, height: 600 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().tileWindows();
    await flush();
    const w = getCtx().windows[0];
    expect(w.position).toEqual({ x: 100, y: 50 });
    expect(w.size).toEqual({ width: 800, height: 600 });
  });

  // ---- Multiple operations ----

  it('handles open-close-reopen cycle', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().closeWindow('w1');
    await flush();
    expect(getCtx().windows.length).toBe(0);
    getCtx().openWindow({ id: 'w1', title: 'W1 Reopened' });
    await flush();
    expect(getCtx().windows.length).toBe(1);
    expect(getCtx().windows[0].title).toBe('W1 Reopened');
  });

  it('handles maximize then tile', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().maximizeWindow('w1');
    await flush();
    expect(getCtx().windows[0].windowState).toBe('maximized');
    getCtx().tileWindows();
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
    expect(getCtx().windows[0].size).toEqual({ width: 1000, height: 800 });
  });

  it('handles focus after minimize-restore cycle', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().minimizeWindow('w2');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w1');
    getCtx().restoreWindow('w2');
    await flush();
    // w2 is restored but focus should still be on w1
    expect(getCtx().focusedWindowId).toBe('w1');
    getCtx().focusWindow('w2');
    await flush();
    expect(getCtx().focusedWindowId).toBe('w2');
  });

  // ---- Edge cases ----

  it('handles rapid open of many windows', async () => {
    const { getCtx, flush } = setup();
    for (let i = 0; i < 20; i++) {
      getCtx().openWindow({ id: `w${i}`, title: `W${i}` });
      await flush();
    }
    expect(getCtx().windows.length).toBe(20);
    // Last opened should be focused
    expect(getCtx().focusedWindowId).toBe('w19');
  });

  it('each window gets a unique z-index', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().openWindow({ id: 'w3', title: 'W3' });
    await flush();
    const zIndices = getCtx().windows.map((w) => w.zIndex);
    const unique = new Set(zIndices);
    expect(unique.size).toBe(3);
  });

  it('new window always gets highest z-index', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    const w2z = getCtx().windows.find((w) => w.id === 'w2')!.zIndex;
    const w1z = getCtx().windows.find((w) => w.id === 'w1')!.zIndex;
    expect(w2z).toBeGreaterThan(w1z);
  });

  it('tileWindows with workspace offset', async () => {
    const bounds = { top: 30, left: 60, width: 800, height: 600 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().openWindow({ id: 'w2', title: 'W2' });
    await flush();
    getCtx().tileWindows();
    await flush();
    const w1 = getCtx().windows.find((w) => w.id === 'w1')!;
    const w2 = getCtx().windows.find((w) => w.id === 'w2')!;
    expect(w1.position).toEqual({ x: 60, y: 30 });
    expect(w2.position).toEqual({ x: 460, y: 30 });
  });

  it('does nothing when tiling all-minimized windows', async () => {
    const bounds = { top: 0, left: 0, width: 1000, height: 800 };
    const { getCtx, flush } = setup({ workspaceBounds: bounds });
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().minimizeWindow('w1');
    await flush();
    getCtx().tileWindows();
    await flush();
    // Window should remain minimized since there are no non-minimized windows
    expect(getCtx().windows[0].windowState).toBe('minimized');
  });

  it('cascadeWindows sets windowState to normal for maximized windows', async () => {
    const { getCtx, flush } = setup();
    getCtx().openWindow({ id: 'w1', title: 'W1' });
    await flush();
    getCtx().maximizeWindow('w1');
    await flush();
    getCtx().cascadeWindows();
    await flush();
    expect(getCtx().windows[0].windowState).toBe('normal');
  });
});
