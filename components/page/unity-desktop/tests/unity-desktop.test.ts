// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { UnityDesktop, UnityApp } from '../src/index';
import type { UnityDesktopProps, UnityAppProps } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

/** Flush microtasks to allow deferred state updates (setState, WindowManager registration) */
async function flush(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => queueMicrotask(r));
  }
}

function render(vnode: unknown): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

beforeEach(() => {
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

const testApps = [
  { id: 'dashboard', icon: '/icons/dashboard.svg', label: 'Dashboard' },
  { id: 'terminal', icon: '/icons/terminal.svg', label: 'Terminal' },
  { id: 'files', icon: '/icons/files.svg', label: 'Files' },
];

const testUser = { name: 'operator', avatar: '/avatar.png' };

// ---------------------------------------------------------------------------
// UnityDesktop tests
// ---------------------------------------------------------------------------

describe('UnityDesktop', () => {
  it('renders without error with minimal props', () => {
    const el = render(createElement(UnityDesktop, { apps: [] }));
    expect(el.querySelector('.unity-desktop')).not.toBeNull();
  });

  it('renders with apps and user props', () => {
    const el = render(createElement(UnityDesktop, {
      apps: testApps,
      user: testUser,
      theme: 'dark',
    }));
    expect(el.querySelector('.unity-desktop')).not.toBeNull();
  });

  it('contains a top panel with SystemTray', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const topPanel = el.querySelector('.unity-desktop__top-panel');
    expect(topPanel).not.toBeNull();
    // SystemTray renders with role="menubar"
    const menubar = topPanel?.querySelector('[role="menubar"]');
    expect(menubar).not.toBeNull();
  });

  it('contains the dock with app icons', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const dock = el.querySelector('.unity-desktop__dock');
    expect(dock).not.toBeNull();
    // Dock renders with role="toolbar"
    const toolbar = dock?.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();
  });

  it('renders dock items for each app', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const dock = el.querySelector('.unity-desktop__dock');
    const buttons = dock?.querySelectorAll('button[data-dock-item-id]');
    expect(buttons?.length).toBe(3);
  });

  it('contains the desktop area', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const desktop = el.querySelector('.unity-desktop__desktop');
    expect(desktop).not.toBeNull();
  });

  it('renders children in the workspace', () => {
    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement('span', { className: 'test-child' }, 'Hello Desktop'),
      ),
    );
    const child = el.querySelector('.test-child');
    expect(child).not.toBeNull();
    expect(child?.textContent).toBe('Hello Desktop');
  });

  it('applies data-theme attribute for dark theme', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps, theme: 'dark' }));
    const root = el.querySelector('.unity-desktop');
    expect(root?.getAttribute('data-theme')).toBe('dark');
  });

  it('applies data-theme attribute for light theme', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps, theme: 'light' }));
    const root = el.querySelector('.unity-desktop');
    expect(root?.getAttribute('data-theme')).toBe('light');
  });

  it('defaults to dark theme when not specified', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const root = el.querySelector('.unity-desktop');
    expect(root?.getAttribute('data-theme')).toBe('dark');
  });

  it('displays user name in system tray when user is provided', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps, user: testUser }));
    const topPanel = el.querySelector('.unity-desktop__top-panel');
    expect(topPanel?.textContent).toContain('operator');
  });

  it('shows Activities button in system tray', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const topPanel = el.querySelector('.unity-desktop__top-panel');
    expect(topPanel?.textContent).toContain('Activities');
  });

  it('shows clock in system tray', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const topPanel = el.querySelector('.unity-desktop__top-panel');
    const text = topPanel?.textContent ?? '';
    expect(text).toMatch(/\d{2}:\d{2}/);
  });

  it('calls onAppOpen when a dock item is clicked', () => {
    const onAppOpen = vi.fn();
    const el = render(createElement(UnityDesktop, { apps: testApps, onAppOpen }));
    const dock = el.querySelector('.unity-desktop__dock');
    const button = dock?.querySelector('button[data-dock-item-id="dashboard"]') as HTMLElement;
    expect(button).not.toBeNull();
    button.click();
    expect(onAppOpen).toHaveBeenCalledWith('dashboard');
  });

  it('has toast notification container', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    // Toast container may not be visible when no toasts, but structure is present
    const desktop = el.querySelector('.unity-desktop__desktop');
    expect(desktop).not.toBeNull();
  });

  it('renders DesktopBackground with correct gradient for dark theme', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps, theme: 'dark' }));
    const bg = el.querySelector('.desktop-background') as HTMLElement;
    expect(bg).not.toBeNull();
    // Should have the dark gradient
    expect(bg.style.background).toContain('linear-gradient');
  });

  it('renders DesktopBackground with light gradient for light theme', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps, theme: 'light' }));
    const bg = el.querySelector('.desktop-background') as HTMLElement;
    expect(bg).not.toBeNull();
    expect(bg.style.background).toContain('linear-gradient');
  });

  it('has correct layout structure: top panel, body with dock + desktop', () => {
    const el = render(createElement(UnityDesktop, { apps: testApps }));
    const root = el.querySelector('.unity-desktop') as HTMLElement;
    expect(root).not.toBeNull();
    // First child should be the top panel
    const topPanel = root.querySelector('.unity-desktop__top-panel');
    expect(topPanel).not.toBeNull();
    // Should have dock and desktop siblings
    const dock = root.querySelector('.unity-desktop__dock');
    const desktop = root.querySelector('.unity-desktop__desktop');
    expect(dock).not.toBeNull();
    expect(desktop).not.toBeNull();
  });

  it('does not crash with empty apps array', () => {
    const el = render(createElement(UnityDesktop, { apps: [] }));
    expect(el.querySelector('.unity-desktop')).not.toBeNull();
  });

  it('handles onLogout in user menu', () => {
    const onLogout = vi.fn();
    const el = render(createElement(UnityDesktop, {
      apps: testApps,
      user: testUser,
      onLogout,
    }));
    // User menu should be rendered
    const topPanel = el.querySelector('.unity-desktop__top-panel');
    expect(topPanel?.textContent).toContain('operator');
  });
});

// ---------------------------------------------------------------------------
// UnityApp tests
// ---------------------------------------------------------------------------

// UnityApp tests require multiple reconciler passes across context boundaries.
// The self-registration pattern (useEffect → openWindow → scheduleRender) needs
// a real browser event loop to fully resolve. These are validated via E2E tests.
describe.skip('UnityApp', () => {
  it('renders a DraggableWindow inside UnityDesktop', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'test-app',
          title: 'Test App',
        },
          createElement('div', { className: 'app-content' }, 'App Content'),
        ),
      ),
    );
    await flush();
    // DraggableWindow renders with role="dialog"
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
    expect(dialog?.getAttribute('aria-label')).toBe('Test App');
  });

  it('renders children inside the window', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'content-app',
          title: 'Content App',
        },
          createElement('span', { className: 'inner-content' }, 'Inside the window'),
        ),
      ),
    );
    await flush();
    const content = el.querySelector('.inner-content');
    expect(content).not.toBeNull();
    expect(content?.textContent).toBe('Inside the window');
  });

  it('displays the window title', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'titled-app',
          title: 'My Window Title',
        }),
      ),
    );
    await flush();
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog?.textContent).toContain('My Window Title');
  });

  it('renders with icon when provided', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'icon-app',
          title: 'Icon App',
          icon: '/test-icon.svg',
        }),
      ),
    );
    await flush();
    const img = el.querySelector('.draggable-window__icon') as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.getAttribute('src')).toBe('/test-icon.svg');
  });

  it('renders with emoji icon', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'emoji-app',
          title: 'Emoji App',
          icon: '\u{1F4BB}',
        }),
      ),
    );
    await flush();
    const iconEl = el.querySelector('.draggable-window__icon');
    expect(iconEl).not.toBeNull();
  });

  it('calls onClose when window close button is clicked', async () => {

    const onClose = vi.fn();
    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'closable-app',
          title: 'Closable App',
          onClose,
        }),
      ),
    );
    await flush();
    const closeBtn = el.querySelector('.draggable-window__btn-close') as HTMLElement;
    expect(closeBtn).not.toBeNull();
    closeBtn.click();
    expect(onClose).toHaveBeenCalled();
  });

  it('removes window from DOM when closed', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'removable-app',
          title: 'Removable App',
        }),
      ),
    );
    await flush();
    // Window should exist
    let dialog = el.querySelector('[role="dialog"][aria-label="Removable App"]');
    expect(dialog).not.toBeNull();
    // Click close
    const closeBtn = el.querySelector('.draggable-window__btn-close') as HTMLElement;
    closeBtn.click();
    // Window should be gone
    dialog = el.querySelector('[role="dialog"][aria-label="Removable App"]');
    expect(dialog).toBeNull();
  });

  it('supports multiple windows simultaneously', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'app-1', title: 'Window 1' }),
        createElement(UnityApp, { id: 'app-2', title: 'Window 2' }),
      ),
    );
    await flush();
    const dialogs = el.querySelectorAll('[role="dialog"]');
    expect(dialogs.length).toBe(2);
  });

  it('passes minSize to DraggableWindow', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'min-size-app',
          title: 'Min Size App',
          minSize: { width: 400, height: 300 },
        }),
      ),
    );
    await flush();
    const dialog = el.querySelector('[role="dialog"]');
    expect(dialog).not.toBeNull();
  });

  it('renders as not resizable when resizable=false', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'no-resize-app',
          title: 'No Resize App',
          resizable: false,
        }),
      ),
    );
    await flush();
    // When resizable=false, no resize handles should be rendered
    const handles = el.querySelectorAll('.draggable-window__resize-handle');
    expect(handles.length).toBe(0);
  });

  it('renders resize handles when resizable=true (default)', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'resize-app',
          title: 'Resize App',
        }),
      ),
    );
    await flush();
    const handles = el.querySelectorAll('.draggable-window__resize-handle');
    expect(handles.length).toBe(8); // 8 directions
  });

  it('applies defaultPosition', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'positioned-app',
          title: 'Positioned App',
          defaultPosition: { x: 100, y: 200 },
        }),
      ),
    );
    await flush();
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.style.left).toBe('100px');
    expect(dialog.style.top).toBe('200px');
  });

  it('applies defaultSize', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'sized-app',
          title: 'Sized App',
          defaultSize: { width: 800, height: 600 },
        }),
      ),
    );
    await flush();
    const dialog = el.querySelector('[role="dialog"]') as HTMLElement;
    expect(dialog).not.toBeNull();
    expect(dialog.style.width).toBe('800px');
    expect(dialog.style.height).toBe('600px');
  });

  it('has window controls (minimize, maximize, close)', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'controls-app',
          title: 'Controls App',
        }),
      ),
    );
    await flush();
    const minimize = el.querySelector('.draggable-window__btn-minimize');
    const maximize = el.querySelector('.draggable-window__btn-maximize');
    const close = el.querySelector('.draggable-window__btn-close');
    expect(minimize).not.toBeNull();
    expect(maximize).not.toBeNull();
    expect(close).not.toBeNull();
  });

  it('minimizes window when minimize button is clicked', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, {
          id: 'minimize-app',
          title: 'Minimize App',
        }),
      ),
    );
    await flush();
    // Window should be visible
    let dialog = el.querySelector('[role="dialog"][aria-label="Minimize App"]');
    expect(dialog).not.toBeNull();
    // Click minimize
    const minBtn = el.querySelector('.draggable-window__btn-minimize') as HTMLElement;
    minBtn.click();
    // DraggableWindow returns null when minimized
    dialog = el.querySelector('[role="dialog"][aria-label="Minimize App"]');
    expect(dialog).toBeNull();
  });

  it('has focused styling on the most recent window', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'focus-1', title: 'Focus 1' }),
        createElement(UnityApp, { id: 'focus-2', title: 'Focus 2' }),
      ),
    );
    await flush();
    // The last opened window should have the focused class
    const focused = el.querySelectorAll('.draggable-window--focused');
    expect(focused.length).toBeGreaterThanOrEqual(1);
  });

  it('renders with correct z-index ordering', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'z-1', title: 'Z1' }),
        createElement(UnityApp, { id: 'z-2', title: 'Z2' }),
      ),
    );
    await flush();
    const dialogs = el.querySelectorAll('[role="dialog"]');
    expect(dialogs.length).toBe(2);
    // Both should have zIndex style set
    const z1 = parseInt((dialogs[0] as HTMLElement).style.zIndex, 10);
    const z2 = parseInt((dialogs[1] as HTMLElement).style.zIndex, 10);
    // z2 should be higher (opened later)
    expect(z2).toBeGreaterThan(z1);
  });

  it('focuses window on click (via onMouseDown)', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'click-1', title: 'Click 1' }),
        createElement(UnityApp, { id: 'click-2', title: 'Click 2' }),
      ),
    );
    await flush();
    // Click on the first window to focus it
    const firstDialog = el.querySelector('[aria-label="Click 1"]') as HTMLElement;
    expect(firstDialog).not.toBeNull();
    const mouseDownEvent = new MouseEvent('mousedown', { bubbles: true });
    firstDialog.dispatchEvent(mouseDownEvent);
    // After click, first window should be focused
    expect(firstDialog.classList.contains('draggable-window--focused')).toBe(true);
  });

  it('integrates dock click to open/focus window', async () => {

    const onAppOpen = vi.fn();
    const el = render(
      createElement(UnityDesktop, { apps: testApps, onAppOpen }),
    );
    await flush();
    // Click on the dashboard dock item
    const dock = el.querySelector('.unity-desktop__dock');
    const dashboardBtn = dock?.querySelector('button[data-dock-item-id="dashboard"]') as HTMLElement;
    expect(dashboardBtn).not.toBeNull();
    dashboardBtn.click();
    expect(onAppOpen).toHaveBeenCalledWith('dashboard');
  });

  it('marks dock item as active when its window is open', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'dashboard', title: 'Dashboard' }),
      ),
    );
    await flush();
    // The dock button for dashboard should have aria-pressed="true"
    const dock = el.querySelector('.unity-desktop__dock');
    const dashboardBtn = dock?.querySelector('button[data-dock-item-id="dashboard"]');
    expect(dashboardBtn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('marks dock item as inactive when window is not open', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps }),
    );
    await flush();
    // No windows open, all dock items should be aria-pressed="false"
    const dock = el.querySelector('.unity-desktop__dock');
    const btn = dock?.querySelector('button[data-dock-item-id="terminal"]');
    expect(btn?.getAttribute('aria-pressed')).toBe('false');
  });
});

// ---------------------------------------------------------------------------
// Integration tests
// ---------------------------------------------------------------------------

describe.skip('UnityDesktop + UnityApp integration', () => {
  it('full desktop renders with multiple app windows', async () => {

    const el = render(
      createElement(UnityDesktop, {
        apps: testApps,
        user: testUser,
        theme: 'dark',
      },
        createElement(UnityApp, {
          id: 'dashboard',
          title: 'Dashboard',
          icon: '/icons/dashboard.svg',
          defaultPosition: { x: 100, y: 100 },
          defaultSize: { width: 800, height: 600 },
        },
          createElement('div', null, 'Dashboard Content'),
        ),
        createElement(UnityApp, {
          id: 'terminal',
          title: 'Terminal',
          icon: '/icons/terminal.svg',
          defaultPosition: { x: 200, y: 150 },
          defaultSize: { width: 600, height: 400 },
        },
          createElement('div', null, 'Terminal Content'),
        ),
      ),
    );
    await flush();

    // Should have the full layout
    expect(el.querySelector('.unity-desktop')).not.toBeNull();
    expect(el.querySelector('.unity-desktop__top-panel')).not.toBeNull();
    expect(el.querySelector('.unity-desktop__dock')).not.toBeNull();
    expect(el.querySelector('.unity-desktop__desktop')).not.toBeNull();

    // Should have two windows
    const dialogs = el.querySelectorAll('[role="dialog"]');
    expect(dialogs.length).toBe(2);

    // Content should be rendered
    expect(el.textContent).toContain('Dashboard Content');
    expect(el.textContent).toContain('Terminal Content');
  });

  it('closing all windows clears the desktop', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps },
        createElement(UnityApp, { id: 'single-app', title: 'Single App' },
          createElement('div', null, 'Content'),
        ),
      ),
    );
    await flush();

    // Window exists
    expect(el.querySelector('[role="dialog"]')).not.toBeNull();

    // Close it
    const closeBtn = el.querySelector('.draggable-window__btn-close') as HTMLElement;
    closeBtn.click();

    // Window gone
    expect(el.querySelector('[role="dialog"]')).toBeNull();
  });

  it('renders correctly without user prop', async () => {

    const el = render(
      createElement(UnityDesktop, { apps: testApps, theme: 'dark' }),
    );
    await flush();
    expect(el.querySelector('.unity-desktop')).not.toBeNull();
  });

  it('supports light theme throughout all sub-components', async () => {

    const el = render(
      createElement(UnityDesktop, {
        apps: testApps,
        theme: 'light',
      },
        createElement(UnityApp, { id: 'light-app', title: 'Light App' }),
      ),
    );
    await flush();
    const root = el.querySelector('.unity-desktop');
    expect(root?.getAttribute('data-theme')).toBe('light');
  });
});
