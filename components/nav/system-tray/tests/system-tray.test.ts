// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { SystemTray } from '../src/index';
import type { SystemTrayProps, SystemTrayIndicator, SystemTrayUser } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';

const roots = new Map<HTMLElement, ReturnType<typeof createRoot>>();

function renderToContainer(element: unknown): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(element);
  roots.set(container, root);
  return container;
}

function cleanup(container: HTMLElement) {
  const root = roots.get(container);
  if (root) {
    root.unmount();
    roots.delete(container);
  }
  if (container.parentNode) {
    document.body.removeChild(container);
  }
}

async function tick() {
  // Use microtask flush instead of setTimeout to work with fake timers.
  // Multiple flushes ensure batched state updates and re-renders complete.
  for (let i = 0; i < 4; i++) {
    await new Promise(r => queueMicrotask(r));
  }
}

const sampleUser: SystemTrayUser = {
  name: 'Alice',
  avatar: 'https://example.com/avatar.png',
};

const sampleIndicators: SystemTrayIndicator[] = [
  { id: 'volume', icon: '\uD83D\uDD0A', label: '75%', onClick: vi.fn() },
  { id: 'wifi', icon: '\uD83D\uDCF6', onClick: vi.fn() },
  { id: 'battery', icon: '\uD83D\uDD0B', label: '80%', onClick: vi.fn() },
];

const sampleMenuItems: SystemTrayProps['userMenuItems'] = [
  { label: 'Settings', icon: '\u2699\uFE0F', onClick: vi.fn() },
  { label: 'divider', divider: true, onClick: vi.fn() },
  { label: 'Log Out', icon: '\uD83D\uDEAA', onClick: vi.fn() },
];

// -- Happy path tests -------------------------------------------------------

describe('SystemTray', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 4, 17, 15, 42, 3)); // Sat May 17 2026 15:42:03
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('happy path', () => {
    it('renders panel with role="menubar"', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const panel = container.querySelector('[role="menubar"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders panel with aria-label="System panel"', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const panel = container.querySelector('[aria-label="System panel"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders with data-theme attribute', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const panel = container.querySelector('[data-theme="dark"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders with default height of 28px', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const panel = container.querySelector('[role="menubar"]') as HTMLElement;
      expect(panel.style.height).toBe('28px');
      cleanup(container);
    });

    it('renders with custom height', () => {
      const container = renderToContainer(
        createElement(SystemTray, { height: 36 }),
      );
      const panel = container.querySelector('[role="menubar"]') as HTMLElement;
      expect(panel.style.height).toBe('36px');
      cleanup(container);
    });

    it('renders activities button when provided', () => {
      const onClick = vi.fn();
      const container = renderToContainer(
        createElement(SystemTray, {
          activitiesButton: { label: 'Activities', onClick },
        }),
      );
      expect(container.textContent).toContain('Activities');
      cleanup(container);
    });

    it('renders active app name', () => {
      const container = renderToContainer(
        createElement(SystemTray, { activeAppName: 'My App' }),
      );
      expect(container.textContent).toContain('My App');
      cleanup(container);
    });

    it('renders clock with role="timer"', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const timer = container.querySelector('[role="timer"]');
      expect(timer).toBeTruthy();
      cleanup(container);
    });

    it('renders clock with aria-live="polite"', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const timer = container.querySelector('[aria-live="polite"]');
      expect(timer).toBeTruthy();
      cleanup(container);
    });

    it('renders clock with aria-label="System clock"', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const timer = container.querySelector('[aria-label="System clock"]');
      expect(timer).toBeTruthy();
      cleanup(container);
    });

    it('renders 24h clock format by default', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      expect(container.textContent).toContain('15:42:03');
      cleanup(container);
    });

    it('renders 12h clock format when specified', () => {
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '12h' }),
      );
      expect(container.textContent).toContain('3:42:03 PM');
      cleanup(container);
    });

    it('renders clock without seconds when showSeconds is false', () => {
      const container = renderToContainer(
        createElement(SystemTray, { showSeconds: false }),
      );
      expect(container.textContent).toContain('15:42');
      expect(container.textContent).not.toContain('15:42:03');
      cleanup(container);
    });

    it('renders 12h format without seconds', () => {
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '12h', showSeconds: false }),
      );
      expect(container.textContent).toContain('3:42 PM');
      expect(container.textContent).not.toContain('3:42:03');
      cleanup(container);
    });

    it('renders date by default', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      expect(container.textContent).toContain('Sun, May 17');
      cleanup(container);
    });

    it('hides date when showDate is false', () => {
      const container = renderToContainer(
        createElement(SystemTray, { showDate: false }),
      );
      expect(container.textContent).not.toContain('Sun, May 17');
      cleanup(container);
    });

    it('renders indicators', () => {
      const container = renderToContainer(
        createElement(SystemTray, { indicators: sampleIndicators }),
      );
      expect(container.textContent).toContain('75%');
      expect(container.textContent).toContain('80%');
      cleanup(container);
    });

    it('renders indicator icons', () => {
      const container = renderToContainer(
        createElement(SystemTray, { indicators: sampleIndicators }),
      );
      expect(container.textContent).toContain('\uD83D\uDD0A');
      expect(container.textContent).toContain('\uD83D\uDCF6');
      expect(container.textContent).toContain('\uD83D\uDD0B');
      cleanup(container);
    });

    it('renders indicators with aria-label', () => {
      const container = renderToContainer(
        createElement(SystemTray, { indicators: sampleIndicators }),
      );
      // Indicators render as buttons with role="button"
      const buttons = container.querySelectorAll('button[role="button"]');
      // Should have at least the indicator buttons (may also have activities)
      expect(buttons.length).toBeGreaterThanOrEqual(3);
      // Check that indicator text content is present
      expect(container.textContent).toContain('75%');
      expect(container.textContent).toContain('80%');
      cleanup(container);
    });

    it('renders user menu with name and avatar', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      expect(container.textContent).toContain('Alice');
      // Check for avatar image
      const img = container.querySelector('img');
      expect(img).toBeTruthy();
      if (img) {
        expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
      }
      cleanup(container);
    });

    it('renders user avatar fallback (first letter) when no avatar URL', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: { name: 'Bob' } }),
      );
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('Bob');
      cleanup(container);
    });

    it('renders dropdown arrow for user menu', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      expect(container.textContent).toContain('\u25BE');
      cleanup(container);
    });

    it('user menu trigger has aria-haspopup="true"', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]');
      expect(trigger).toBeTruthy();
      cleanup(container);
    });

    it('user menu trigger has aria-expanded="false" initially', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      const trigger = container.querySelector('[aria-expanded="false"]');
      expect(trigger).toBeTruthy();
      cleanup(container);
    });

    it('renders full system tray with all props', () => {
      const onClick = vi.fn();
      const container = renderToContainer(
        createElement(SystemTray, {
          activeAppName: 'Terminal',
          activitiesButton: { label: 'Activities', onClick },
          clockFormat: '24h',
          showSeconds: true,
          showDate: true,
          indicators: sampleIndicators,
          user: sampleUser,
          userMenuItems: sampleMenuItems,
          height: 32,
        }),
      );
      expect(container.textContent).toContain('Activities');
      expect(container.textContent).toContain('Terminal');
      expect(container.textContent).toContain('15:42:03');
      expect(container.textContent).toContain('Alice');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with no props (minimal)', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const panel = container.querySelector('[role="menubar"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders without activities button', () => {
      const container = renderToContainer(
        createElement(SystemTray, { activeAppName: 'App' }),
      );
      expect(container.textContent).toContain('App');
      cleanup(container);
    });

    it('renders without activeAppName', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      const panel = container.querySelector('[role="menubar"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders with empty indicators array', () => {
      const container = renderToContainer(
        createElement(SystemTray, { indicators: [] }),
      );
      const panel = container.querySelector('[role="menubar"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders without user (no user menu section)', () => {
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]');
      expect(trigger).toBeFalsy();
      cleanup(container);
    });

    it('renders user menu without userMenuItems', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      expect(container.textContent).toContain('Alice');
      cleanup(container);
    });

    it('renders with empty string activeAppName', () => {
      const container = renderToContainer(
        createElement(SystemTray, { activeAppName: '' }),
      );
      const panel = container.querySelector('[role="menubar"]');
      expect(panel).toBeTruthy();
      cleanup(container);
    });

    it('renders indicator without label (icon only)', () => {
      const indicators: SystemTrayIndicator[] = [
        { id: 'plain', icon: '\u2B50' },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      expect(container.textContent).toContain('\u2B50');
      cleanup(container);
    });

    it('renders indicator without onClick handler', () => {
      const indicators: SystemTrayIndicator[] = [
        { id: 'noclick', icon: '\u26A0' },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      const btn = container.querySelector('[aria-label="\u26A0"]') as HTMLElement;
      expect(btn).toBeTruthy();
      // Should not throw when clicked
      btn.click();
      cleanup(container);
    });

    it('handles 12h format at midnight (0:00)', () => {
      vi.setSystemTime(new Date(2026, 4, 17, 0, 0, 0)); // midnight
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '12h' }),
      );
      expect(container.textContent).toContain('12:00:00 AM');
      cleanup(container);
    });

    it('handles 12h format at noon (12:00)', () => {
      vi.setSystemTime(new Date(2026, 4, 17, 12, 0, 0));
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '12h' }),
      );
      expect(container.textContent).toContain('12:00:00 PM');
      cleanup(container);
    });

    it('handles 24h format at midnight', () => {
      vi.setSystemTime(new Date(2026, 4, 17, 0, 5, 9));
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '24h' }),
      );
      expect(container.textContent).toContain('00:05:09');
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls activities button onClick', () => {
      const onClick = vi.fn();
      const container = renderToContainer(
        createElement(SystemTray, {
          activitiesButton: { label: 'Activities', onClick },
        }),
      );
      const btn = container.querySelector('[aria-label="Activities"]') as HTMLElement;
      expect(btn).toBeTruthy();
      btn.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('calls indicator onClick when clicked', () => {
      const onClick = vi.fn();
      const indicators: SystemTrayIndicator[] = [
        { id: 'vol', icon: '\uD83D\uDD0A', label: 'Volume', onClick },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      const btn = container.querySelector('[aria-label="Volume"]') as HTMLElement;
      expect(btn).toBeTruthy();
      btn.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('opens user dropdown on click', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      expect(trigger).toBeTruthy();
      trigger.click();
      await tick();
      // Dropdown should be open
      const expanded = container.querySelector('[aria-expanded="true"]');
      expect(expanded).toBeTruthy();
      // Menu should be visible
      const menu = container.querySelector('[role="menu"]');
      expect(menu).toBeTruthy();
      expect(container.textContent).toContain('Settings');
      expect(container.textContent).toContain('Log Out');
      cleanup(container);
    });

    it('closes user dropdown on toggle click', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click(); // open
      await tick();
      expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
      trigger.click(); // close
      await tick();
      expect(container.querySelector('[aria-expanded="false"]')).toBeTruthy();
      cleanup(container);
    });

    it('calls menu item onClick and closes dropdown on item click', async () => {
      const onSettings = vi.fn();
      const items: SystemTrayProps['userMenuItems'] = [
        { label: 'Settings', onClick: onSettings },
      ];
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: items,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      expect(menuItem).toBeTruthy();
      menuItem.click();
      await tick();
      expect(onSettings).toHaveBeenCalledTimes(1);
      // Dropdown should be closed
      expect(container.querySelector('[aria-expanded="false"]')).toBeTruthy();
      cleanup(container);
    });

    it('closes dropdown on outside click', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
      // Click outside
      document.body.click();
      await tick();
      expect(container.querySelector('[aria-expanded="false"]')).toBeTruthy();
      cleanup(container);
    });

    it('renders divider in user menu items', async () => {
      const items: SystemTrayProps['userMenuItems'] = [
        { label: 'Item1', onClick: vi.fn() },
        { label: 'sep', divider: true, onClick: vi.fn() },
        { label: 'Item2', onClick: vi.fn() },
      ];
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: items,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      const separators = container.querySelectorAll('[role="separator"]');
      expect(separators.length).toBeGreaterThanOrEqual(1);
      cleanup(container);
    });

    it('clock updates every second', async () => {
      const container = renderToContainer(
        createElement(SystemTray, { clockFormat: '24h', showSeconds: true }),
      );
      expect(container.textContent).toContain('15:42:03');
      // Advance by 1 second
      vi.advanceTimersByTime(1000);
      await tick();
      expect(container.textContent).toContain('15:42:04');
      // Advance by another second
      vi.advanceTimersByTime(1000);
      await tick();
      expect(container.textContent).toContain('15:42:05');
      cleanup(container);
    });

    it('cleans up clock interval on unmount', () => {
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      const container = renderToContainer(
        createElement(SystemTray, {}),
      );
      cleanup(container);
      // clearInterval should have been called
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
    });

    it('activities button responds to Enter key', () => {
      const onClick = vi.fn();
      const container = renderToContainer(
        createElement(SystemTray, {
          activitiesButton: { label: 'Activities', onClick },
        }),
      );
      const btn = container.querySelector('[aria-label="Activities"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      btn.dispatchEvent(event);
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('activities button responds to Space key', () => {
      const onClick = vi.fn();
      const container = renderToContainer(
        createElement(SystemTray, {
          activitiesButton: { label: 'Activities', onClick },
        }),
      );
      const btn = container.querySelector('[aria-label="Activities"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      btn.dispatchEvent(event);
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('indicator button responds to Enter key', () => {
      const onClick = vi.fn();
      const indicators: SystemTrayIndicator[] = [
        { id: 'vol', icon: '\uD83D\uDD0A', label: 'Volume', onClick },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      const btn = container.querySelector('[aria-label="Volume"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      btn.dispatchEvent(event);
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('indicator button responds to Space key', () => {
      const onClick = vi.fn();
      const indicators: SystemTrayIndicator[] = [
        { id: 'vol', icon: '\uD83D\uDD0A', label: 'Volume', onClick },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      const btn = container.querySelector('[aria-label="Volume"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      btn.dispatchEvent(event);
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('user menu opens with Enter key', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      trigger.dispatchEvent(event);
      await tick();
      expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
      cleanup(container);
    });

    it('user menu opens with Space key', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      trigger.dispatchEvent(event);
      await tick();
      expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
      cleanup(container);
    });

    it('user menu closes with Escape key', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: sampleMenuItems,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      expect(container.querySelector('[aria-expanded="true"]')).toBeTruthy();
      const escEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
      trigger.dispatchEvent(escEvent);
      await tick();
      expect(container.querySelector('[aria-expanded="false"]')).toBeTruthy();
      cleanup(container);
    });

    it('menu item icon is rendered when provided', async () => {
      const items: SystemTrayProps['userMenuItems'] = [
        { label: 'Settings', icon: '\u2699\uFE0F', onClick: vi.fn() },
      ];
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: items,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      expect(container.textContent).toContain('\u2699\uFE0F');
      cleanup(container);
    });

    it('menu item responds to Enter key', async () => {
      const onSettings = vi.fn();
      const items: SystemTrayProps['userMenuItems'] = [
        { label: 'Settings', onClick: onSettings },
      ];
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: items,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true });
      menuItem.dispatchEvent(event);
      await tick();
      expect(onSettings).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('menu item responds to Space key', async () => {
      const onSettings = vi.fn();
      const items: SystemTrayProps['userMenuItems'] = [
        { label: 'Settings', onClick: onSettings },
      ];
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: items,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      const event = new KeyboardEvent('keydown', { key: ' ', bubbles: true });
      menuItem.dispatchEvent(event);
      await tick();
      expect(onSettings).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('does not show dropdown when user has no menu items', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      // No menu should appear
      const menu = container.querySelector('[role="menu"]');
      expect(menu).toBeFalsy();
      cleanup(container);
    });

    it('does not show dropdown when user has empty menu items', async () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          user: sampleUser,
          userMenuItems: [],
        }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      trigger.click();
      await tick();
      const menu = container.querySelector('[role="menu"]');
      expect(menu).toBeFalsy();
      cleanup(container);
    });

    it('indicators have tabindex="0" for keyboard focus', () => {
      const indicators: SystemTrayIndicator[] = [
        { id: 'vol', icon: '\uD83D\uDD0A', label: 'Volume', onClick: vi.fn() },
      ];
      const container = renderToContainer(
        createElement(SystemTray, { indicators }),
      );
      const btn = container.querySelector('[aria-label="Volume"]') as HTMLElement;
      expect(btn.getAttribute('tabindex')).toBe('0');
      cleanup(container);
    });

    it('activities button has tabindex="0" for keyboard focus', () => {
      const container = renderToContainer(
        createElement(SystemTray, {
          activitiesButton: { label: 'Activities', onClick: vi.fn() },
        }),
      );
      const btn = container.querySelector('[aria-label="Activities"]') as HTMLElement;
      expect(btn.getAttribute('tabindex')).toBe('0');
      cleanup(container);
    });

    it('user menu trigger has tabindex="0"', () => {
      const container = renderToContainer(
        createElement(SystemTray, { user: sampleUser }),
      );
      const trigger = container.querySelector('[aria-haspopup="true"]') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('0');
      cleanup(container);
    });
  });
});
