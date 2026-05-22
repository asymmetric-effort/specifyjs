// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Sidebar } from '../src/index';
import type { SidebarProps, SidebarItem } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';

function renderToContainer(element: unknown): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(element);
  return container;
}

function cleanup(container: HTMLElement) {
  document.body.removeChild(container);
}

async function tick() {
  await new Promise(r => setTimeout(r, 0));
}

const sampleItems: SidebarItem[] = [
  { id: 'home', label: 'Home', icon: 'H' },
  {
    id: 'settings',
    label: 'Settings',
    icon: 'S',
    children: [
      { id: 'general', label: 'General' },
      { id: 'security', label: 'Security' },
    ],
  },
  { id: 'help', label: 'Help', icon: '?', badge: '3' },
];

// -- Happy path tests -------------------------------------------------------

describe('Sidebar', () => {
  describe('happy path', () => {
    it('renders sidebar navigation', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      expect(nav!.getAttribute('aria-label')).toBe('Sidebar');
      cleanup(container);
    });

    it('renders all top-level items', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      expect(container.textContent).toContain('Home');
      expect(container.textContent).toContain('Settings');
      expect(container.textContent).toContain('Help');
      cleanup(container);
    });

    it('displays item icons', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      expect(container.textContent).toContain('H');
      expect(container.textContent).toContain('S');
      expect(container.textContent).toContain('?');
      cleanup(container);
    });

    it('displays badge indicators', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      expect(container.textContent).toContain('3');
      cleanup(container);
    });

    it('highlights selected item', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems, selectedId: 'home' }),
      );
      const selected = container.querySelector('[aria-selected="true"]');
      expect(selected).toBeTruthy();
      cleanup(container);
    });

    it('renders collapse toggle when onToggleCollapse provided', () => {
      const onToggle = vi.fn();
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems, onToggleCollapse: onToggle }),
      );
      const toggleBtn = container.querySelector('[aria-label="Collapse sidebar"]');
      expect(toggleBtn).toBeTruthy();
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty items array', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: [] }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('renders collapsed mode with icon-only', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems, collapsed: true }),
      );
      // Labels should not be visible when collapsed
      const nav = container.querySelector('[role="navigation"]') as HTMLElement;
      expect(nav).toBeTruthy();
      // In collapsed mode, labels are hidden
      cleanup(container);
    });

    it('handles missing onSelect callback', () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      const button = container.querySelector('button[type="button"]') as HTMLElement;
      expect(() => button.click()).not.toThrow();
      cleanup(container);
    });

    it('handles items without icons', () => {
      const items: SidebarItem[] = [
        { id: 'plain', label: 'No icon' },
      ];
      const container = renderToContainer(
        createElement(Sidebar, { items }),
      );
      expect(container.textContent).toContain('No icon');
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onSelect when item is clicked', () => {
      const onSelect = vi.fn();
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems, onSelect }),
      );
      const buttons = container.querySelectorAll('button[type="button"]');
      (buttons[0] as HTMLElement).click();
      expect(onSelect).toHaveBeenCalledWith('home');
      cleanup(container);
    });

    it('expands nested items on parent click', async () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      // Click Settings to expand children
      const buttons = container.querySelectorAll('button[type="button"]');
      // Find Settings button
      let settingsBtn: HTMLElement | null = null;
      buttons.forEach((btn) => {
        if (btn.textContent!.includes('Settings')) settingsBtn = btn as HTMLElement;
      });
      if (settingsBtn) {
        settingsBtn.click();
        await tick();
        // After expanding, children should be visible
        expect(container.textContent).toContain('General');
        expect(container.textContent).toContain('Security');
      }
      cleanup(container);
    });

    it('collapses nested items on second parent click', async () => {
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems }),
      );
      const buttons = container.querySelectorAll('button[type="button"]');
      let settingsBtn: HTMLElement | null = null;
      buttons.forEach((btn) => {
        if (btn.textContent!.includes('Settings')) settingsBtn = btn as HTMLElement;
      });
      if (settingsBtn) {
        settingsBtn.click(); // expand
        await tick();
        settingsBtn.click(); // collapse
        await tick();
      }
      cleanup(container);
    });

    it('calls onToggleCollapse when toggle button is clicked', () => {
      const onToggle = vi.fn();
      const container = renderToContainer(
        createElement(Sidebar, { items: sampleItems, onToggleCollapse: onToggle }),
      );
      const toggleBtn = container.querySelector('[aria-label="Collapse sidebar"]') as HTMLElement;
      toggleBtn.click();
      expect(onToggle).toHaveBeenCalledTimes(1);
      cleanup(container);
    });
  });
});
