// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { WindowManagerProvider, useWindowManager } from '../src/index';
import type { WindowManagerContextValue, WindowManagerProps, AppMenuBar, DockSignal } from '../src/index';

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

function setup(providerProps: Partial<WindowManagerProps> = {}) {
  let ctx: WindowManagerContextValue = null as unknown as WindowManagerContextValue;

  function Inspector() {
    ctx = useWindowManager();
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
// Menu Bar State Management
// ---------------------------------------------------------------------------

describe('WindowManager App-to-Shell Signaling', () => {
  describe('Menu Bar', () => {
    it('starts with activeMenuBar as null', () => {
      const { getCtx } = setup();
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('exposes setMenuBar as a function', () => {
      const { getCtx } = setup();
      expect(typeof getCtx().setMenuBar).toBe('function');
    });

    it('exposes clearMenuBar as a function', () => {
      const { getCtx } = setup();
      expect(typeof getCtx().clearMenuBar).toBe('function');
    });

    it('exposes signalDock as a function', () => {
      const { getCtx } = setup();
      expect(typeof getCtx().signalDock).toBe('function');
    });

    it('exposes dockSignals as a Map', () => {
      const { getCtx } = setup();
      expect(getCtx().dockSignals instanceof Map).toBe(true);
    });

    it('dockSignals starts empty', () => {
      const { getCtx } = setup();
      expect(getCtx().dockSignals.size).toBe(0);
    });

    it('setMenuBar registers a menu bar for an app', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      // app1 is focused so activeMenuBar should be the registered one
      expect(getCtx().activeMenuBar).toEqual(menuBar);
    });

    it('activeMenuBar is null when no menu bar registered for focused app', async () => {
      const { getCtx, flush } = setup();
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('activeMenuBar is null when no window is focused', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      // No windows open, no focused window
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('clearMenuBar removes the menu bar for an app', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'Open' }] }],
      };
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);
      getCtx().clearMenuBar('app1');
      await flush();
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('clearMenuBar is a no-op for non-registered app', async () => {
      const { getCtx, flush } = setup();
      getCtx().clearMenuBar('nonexistent');
      await flush();
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('switching focus updates activeMenuBar to new app', async () => {
      const { getCtx, flush } = setup();
      const menuBar1: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };
      const menuBar2: AppMenuBar = {
        menus: [{ label: 'Edit', items: [{ label: 'Cut' }] }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().openWindow({ id: 'app2', title: 'App 2' });
      await flush();
      getCtx().setMenuBar('app1', menuBar1);
      getCtx().setMenuBar('app2', menuBar2);
      await flush();

      // app2 is focused
      expect(getCtx().activeMenuBar).toEqual(menuBar2);

      // Focus app1
      getCtx().focusWindow('app1');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar1);
    });

    it('activeMenuBar becomes null when focused app has no menu bar', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().openWindow({ id: 'app2', title: 'App 2' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();

      // app2 is focused and has no menu bar
      expect(getCtx().activeMenuBar).toBeNull();

      // Focus app1 (has menu bar)
      getCtx().focusWindow('app1');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);
    });

    it('setMenuBar updates existing menu bar', async () => {
      const { getCtx, flush } = setup();
      const menuBar1: AppMenuBar = { menus: [{ label: 'File', items: [] }] };
      const menuBar2: AppMenuBar = { menus: [{ label: 'File', items: [{ label: 'Save' }] }] };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar1);
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar1);

      getCtx().setMenuBar('app1', menuBar2);
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar2);
    });

    it('closing an app cleans up its menu bar', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().openWindow({ id: 'app2', title: 'App 2' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      getCtx().setMenuBar('app2', { menus: [{ label: 'Edit', items: [] }] });
      await flush();

      // Close app2 (currently focused), focus moves to app1
      getCtx().closeWindow('app2');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);
    });

    it('closing the only app with a menu bar results in null activeMenuBar', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);

      getCtx().closeWindow('app1');
      await flush();
      expect(getCtx().activeMenuBar).toBeNull();
    });

    it('menu bar with multiple menus', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [
          { label: 'File', items: [{ label: 'New' }, { label: 'Open' }] },
          { label: 'Edit', items: [{ label: 'Cut' }, { label: 'Copy' }] },
          { label: 'View', items: [{ label: 'Zoom In' }] },
        ],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      expect(getCtx().activeMenuBar!.menus.length).toBe(3);
      expect(getCtx().activeMenuBar!.menus[0].label).toBe('File');
      expect(getCtx().activeMenuBar!.menus[1].label).toBe('Edit');
      expect(getCtx().activeMenuBar!.menus[2].label).toBe('View');
    });

    it('menu items support all optional fields', async () => {
      const { getCtx, flush } = setup();
      const onClick = vi.fn();
      const menuBar: AppMenuBar = {
        menus: [{
          label: 'File',
          items: [
            { label: 'Save', onClick, shortcut: 'Ctrl+S', disabled: false, divider: false, checked: true },
            { divider: true },
            { label: 'Exit', disabled: true },
          ],
        }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      const items = getCtx().activeMenuBar!.menus[0].items;
      expect(items.length).toBe(3);
      expect(items[0].checked).toBe(true);
      expect(items[0].shortcut).toBe('Ctrl+S');
      expect(items[1].divider).toBe(true);
      expect(items[2].disabled).toBe(true);
    });
  });

  // ---------------------------------------------------------------------------
  // Dock Signals
  // ---------------------------------------------------------------------------

  describe('Dock Signals', () => {
    it('signalDock sets a badge for an app', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 5 });
      await flush();
      expect(getCtx().dockSignals.get('app1')).toEqual({ badge: 5 });
    });

    it('signalDock sets progress for an app', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { progress: 0.5 });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.progress).toBe(0.5);
    });

    it('signalDock sets urgent for an app', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { urgent: true });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.urgent).toBe(true);
    });

    it('signalDock sets tooltip for an app', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { tooltip: 'Downloading...' });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.tooltip).toBe('Downloading...');
    });

    it('signalDock merges with existing signals', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 3 });
      await flush();
      getCtx().signalDock('app1', { progress: 0.7 });
      await flush();
      const signal = getCtx().dockSignals.get('app1')!;
      expect(signal.badge).toBe(3);
      expect(signal.progress).toBe(0.7);
    });

    it('signalDock can clear badge with null', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 5 });
      await flush();
      getCtx().signalDock('app1', { badge: null });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.badge).toBeNull();
    });

    it('signalDock can clear progress with null', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { progress: 0.5 });
      await flush();
      getCtx().signalDock('app1', { progress: null });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.progress).toBeNull();
    });

    it('signalDock supports multiple apps independently', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 2 });
      getCtx().signalDock('app2', { badge: 10 });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.badge).toBe(2);
      expect(getCtx().dockSignals.get('app2')!.badge).toBe(10);
    });

    it('closing an app cleans up its dock signals', async () => {
      const { getCtx, flush } = setup();
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().signalDock('app1', { badge: 5, progress: 0.3 });
      await flush();
      expect(getCtx().dockSignals.has('app1')).toBe(true);

      getCtx().closeWindow('app1');
      await flush();
      expect(getCtx().dockSignals.has('app1')).toBe(false);
    });

    it('closing an app does not affect other apps dock signals', async () => {
      const { getCtx, flush } = setup();
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      getCtx().openWindow({ id: 'app2', title: 'App 2' });
      await flush();
      getCtx().signalDock('app1', { badge: 3 });
      getCtx().signalDock('app2', { badge: 7 });
      await flush();

      getCtx().closeWindow('app1');
      await flush();
      expect(getCtx().dockSignals.has('app1')).toBe(false);
      expect(getCtx().dockSignals.get('app2')!.badge).toBe(7);
    });

    it('signalDock with urgent false clears urgency', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { urgent: true });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.urgent).toBe(true);
      getCtx().signalDock('app1', { urgent: false });
      await flush();
      expect(getCtx().dockSignals.get('app1')!.urgent).toBe(false);
    });

    it('signalDock updates tooltip while preserving badge', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 2, tooltip: 'Hello' });
      await flush();
      getCtx().signalDock('app1', { tooltip: 'Updated' });
      await flush();
      const signal = getCtx().dockSignals.get('app1')!;
      expect(signal.badge).toBe(2);
      expect(signal.tooltip).toBe('Updated');
    });
  });

  // ---------------------------------------------------------------------------
  // Combined scenarios
  // ---------------------------------------------------------------------------

  describe('Combined menu bar and dock signals', () => {
    it('both menu bar and dock signal for same app', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [{ label: 'New' }] }],
      };

      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      getCtx().signalDock('app1', { badge: 5 });
      await flush();

      expect(getCtx().activeMenuBar).toEqual(menuBar);
      expect(getCtx().dockSignals.get('app1')!.badge).toBe(5);
    });

    it('closing app cleans up both menu bar and dock signal', async () => {
      const { getCtx, flush } = setup();
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', { menus: [{ label: 'File', items: [] }] });
      getCtx().signalDock('app1', { badge: 3 });
      await flush();

      getCtx().closeWindow('app1');
      await flush();
      expect(getCtx().activeMenuBar).toBeNull();
      expect(getCtx().dockSignals.has('app1')).toBe(false);
    });

    it('closing non-existent window does not clean up signals', async () => {
      const { getCtx, flush } = setup();
      getCtx().signalDock('app1', { badge: 3 });
      await flush();
      getCtx().closeWindow('nonexistent');
      await flush();
      // app1 signal should still exist (it was never a window)
      expect(getCtx().dockSignals.get('app1')!.badge).toBe(3);
    });

    it('minimizing focused app with menu bar does not clear the menu bar registration', async () => {
      const { getCtx, flush } = setup();
      const menuBar: AppMenuBar = {
        menus: [{ label: 'File', items: [] }],
      };
      getCtx().openWindow({ id: 'app1', title: 'App 1' });
      await flush();
      getCtx().setMenuBar('app1', menuBar);
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);

      getCtx().minimizeWindow('app1');
      await flush();
      // No focused window, so activeMenuBar is null
      expect(getCtx().activeMenuBar).toBeNull();

      // Restore and focus — menu bar should come back
      getCtx().restoreWindow('app1');
      await flush();
      getCtx().focusWindow('app1');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBar);
    });

    it('activeMenuBar updates to new app when app with menu bar gains focus', async () => {
      const { getCtx, flush } = setup();
      const menuBarA: AppMenuBar = { menus: [{ label: 'A', items: [] }] };
      const menuBarB: AppMenuBar = { menus: [{ label: 'B', items: [] }] };

      getCtx().openWindow({ id: 'a', title: 'A' });
      await flush();
      getCtx().openWindow({ id: 'b', title: 'B' });
      await flush();
      getCtx().setMenuBar('a', menuBarA);
      getCtx().setMenuBar('b', menuBarB);
      await flush();

      expect(getCtx().activeMenuBar).toEqual(menuBarB); // b is focused

      getCtx().focusWindow('a');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBarA);

      getCtx().focusWindow('b');
      await flush();
      expect(getCtx().activeMenuBar).toEqual(menuBarB);
    });
  });
});
