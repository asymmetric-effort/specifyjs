// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Tests for the App-to-Shell signaling framework.
 *
 * These tests focus on the WindowManager context integration for menu bars,
 * dock signals, and focus-driven behavior. UnityApp rendering is tested
 * at the WindowManager level to avoid DraggableWindow DOM dependencies.
 */

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { WindowManagerProvider, useWindowManager } from '../../../layout/window-manager/src/index';
import type { WindowManagerContextValue, AppMenuBar, DockSignal } from '../../../layout/window-manager/src/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

async function flush(): Promise<void> {
  await new Promise<void>((r) => setTimeout(r, 20));
}

function setup() {
  let ctx: WindowManagerContextValue = null as unknown as WindowManagerContextValue;

  function Inspector() {
    ctx = useWindowManager();
    return createElement('div', { id: 'inspector' }, String(ctx.windows.length));
  }

  const root = createRoot(container);
  root.render(
    createElement(WindowManagerProvider, {},
      createElement(Inspector, null),
    ),
  );

  function getCtx(): WindowManagerContextValue {
    return ctx;
  }

  return { getCtx, flush: flush, root };
}

// ---------------------------------------------------------------------------
// Menu bar focus-driven switching
// ---------------------------------------------------------------------------

describe('Focus-driven menu bar switching', () => {
  it('returns null when no windows exist', () => {
    const { getCtx } = setup();
    expect(getCtx().activeMenuBar).toBeNull();
  });

  it('returns the focused app menu bar', async () => {
    const { getCtx } = setup();
    const menuBar: AppMenuBar = { menus: [{ label: 'File', items: [{ label: 'New' }] }] };
    getCtx().openWindow({ id: 'app1', title: 'App 1' });
    await flush();
    getCtx().setMenuBar('app1', menuBar);
    await flush();
    expect(getCtx().activeMenuBar).toEqual(menuBar);
  });

  it('switches menu bar when focus changes', async () => {
    const { getCtx } = setup();
    const menuA: AppMenuBar = { menus: [{ label: 'FileA', items: [] }] };
    const menuB: AppMenuBar = { menus: [{ label: 'FileB', items: [] }] };
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().openWindow({ id: 'b', title: 'B' });
    await flush();
    getCtx().setMenuBar('a', menuA);
    getCtx().setMenuBar('b', menuB);
    await flush();

    expect(getCtx().focusedWindowId).toBe('b');
    expect(getCtx().activeMenuBar).toEqual(menuB);

    getCtx().focusWindow('a');
    await flush();
    expect(getCtx().activeMenuBar).toEqual(menuA);
  });

  it('returns null when focused app has no menu bar registered', async () => {
    const { getCtx } = setup();
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().openWindow({ id: 'b', title: 'B' });
    await flush();
    getCtx().setMenuBar('a', { menus: [{ label: 'File', items: [] }] });
    await flush();
    // b is focused and has no menu bar
    expect(getCtx().activeMenuBar).toBeNull();
  });

  it('returns null when all windows minimized', async () => {
    const { getCtx } = setup();
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().setMenuBar('a', { menus: [{ label: 'File', items: [] }] });
    await flush();
    getCtx().minimizeWindow('a');
    await flush();
    expect(getCtx().focusedWindowId).toBeNull();
    expect(getCtx().activeMenuBar).toBeNull();
  });

  it('restoring a minimized window restores its menu bar', async () => {
    const { getCtx } = setup();
    const menu: AppMenuBar = { menus: [{ label: 'File', items: [] }] };
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().setMenuBar('a', menu);
    await flush();
    expect(getCtx().activeMenuBar).toEqual(menu);

    getCtx().minimizeWindow('a');
    await flush();
    expect(getCtx().activeMenuBar).toBeNull();

    getCtx().restoreWindow('a');
    await flush();
    getCtx().focusWindow('a');
    await flush();
    expect(getCtx().activeMenuBar).toEqual(menu);
  });
});

// ---------------------------------------------------------------------------
// DockSignal merge into DockItem
// ---------------------------------------------------------------------------

describe('DockSignal merge into DockItem', () => {
  it('badge signal is readable from dockSignals map', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { badge: 5 });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.badge).toBe(5);
  });

  it('progress signal is readable', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { progress: 0.42 });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.progress).toBe(0.42);
  });

  it('urgent signal is readable', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { urgent: true });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.urgent).toBe(true);
  });

  it('tooltip signal overrides label', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { tooltip: 'Building...' });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.tooltip).toBe('Building...');
  });

  it('multiple signals merge correctly', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { badge: 3, tooltip: 'Inbox' });
    await flush();
    getCtx().signalDock('app1', { progress: 0.9 });
    await flush();
    const s = getCtx().dockSignals.get('app1')!;
    expect(s.badge).toBe(3);
    expect(s.tooltip).toBe('Inbox');
    expect(s.progress).toBe(0.9);
  });

  it('closing window clears its dock signals', async () => {
    const { getCtx } = setup();
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().signalDock('a', { badge: 2 });
    await flush();
    getCtx().closeWindow('a');
    await flush();
    expect(getCtx().dockSignals.has('a')).toBe(false);
  });

  it('badge: null clears the badge value', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { badge: 5 });
    await flush();
    getCtx().signalDock('app1', { badge: null });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.badge).toBeNull();
  });

  it('progress: null clears the progress value', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('app1', { progress: 0.5 });
    await flush();
    getCtx().signalDock('app1', { progress: null });
    await flush();
    expect(getCtx().dockSignals.get('app1')!.progress).toBeNull();
  });

  it('independent signals for multiple apps', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('a', { badge: 1 });
    getCtx().signalDock('b', { badge: 2 });
    getCtx().signalDock('c', { urgent: true });
    await flush();
    expect(getCtx().dockSignals.get('a')!.badge).toBe(1);
    expect(getCtx().dockSignals.get('b')!.badge).toBe(2);
    expect(getCtx().dockSignals.get('c')!.urgent).toBe(true);
    expect(getCtx().dockSignals.size).toBe(3);
  });

  it('closing one app does not affect other dock signals', async () => {
    const { getCtx } = setup();
    getCtx().openWindow({ id: 'a', title: 'A' });
    getCtx().openWindow({ id: 'b', title: 'B' });
    await flush();
    getCtx().signalDock('a', { badge: 1 });
    getCtx().signalDock('b', { badge: 2 });
    await flush();
    getCtx().closeWindow('a');
    await flush();
    expect(getCtx().dockSignals.has('a')).toBe(false);
    expect(getCtx().dockSignals.get('b')!.badge).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Cleanup on close
// ---------------------------------------------------------------------------

describe('Cleanup on close', () => {
  it('closing app cleans up menu bar and dock signal together', async () => {
    const { getCtx } = setup();
    getCtx().openWindow({ id: 'app1', title: 'App 1' });
    await flush();
    getCtx().setMenuBar('app1', { menus: [{ label: 'File', items: [] }] });
    getCtx().signalDock('app1', { badge: 3 });
    await flush();
    expect(getCtx().activeMenuBar).not.toBeNull();
    expect(getCtx().dockSignals.has('app1')).toBe(true);

    getCtx().closeWindow('app1');
    await flush();
    expect(getCtx().activeMenuBar).toBeNull();
    expect(getCtx().dockSignals.has('app1')).toBe(false);
  });

  it('closing focused app shifts menu bar to next focused app', async () => {
    const { getCtx } = setup();
    const menuA: AppMenuBar = { menus: [{ label: 'A', items: [] }] };
    const menuB: AppMenuBar = { menus: [{ label: 'B', items: [] }] };
    getCtx().openWindow({ id: 'a', title: 'A' });
    await flush();
    getCtx().openWindow({ id: 'b', title: 'B' });
    await flush();
    getCtx().setMenuBar('a', menuA);
    getCtx().setMenuBar('b', menuB);
    await flush();

    // b is focused, close it -> focus goes to a
    getCtx().closeWindow('b');
    await flush();
    expect(getCtx().focusedWindowId).toBe('a');
    expect(getCtx().activeMenuBar).toEqual(menuA);
  });

  it('closing non-existent window is safe', async () => {
    const { getCtx } = setup();
    getCtx().signalDock('x', { badge: 1 });
    await flush();
    getCtx().closeWindow('nonexistent');
    await flush();
    expect(getCtx().dockSignals.get('x')!.badge).toBe(1);
  });
});
