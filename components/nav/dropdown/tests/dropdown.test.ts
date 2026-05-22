// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Dropdown } from '../src/index';
import type { DropdownProps, DropdownItem } from '../src/index';
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

const sampleItems: DropdownItem[] = [
  { id: 'a', label: 'Alpha', onClick: vi.fn() },
  { id: 'b', label: 'Beta', onClick: vi.fn() },
  { id: 'c', label: 'Gamma', onClick: vi.fn() },
];

// -- Happy path tests -------------------------------------------------------

describe('Dropdown', () => {
  describe('happy path', () => {
    it('renders a trigger button with label', () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems }),
      );
      const button = container.querySelector('button');
      expect(button).toBeTruthy();
      expect(button!.textContent).toContain('Menu');
      cleanup(container);
    });

    it('shows dropdown items when trigger is clicked', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems }),
      );
      const trigger = container.querySelector('button')!;
      trigger.click();
      await tick();
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBe(3);
      expect(menuItems[0]!.textContent).toContain('Alpha');
      expect(menuItems[1]!.textContent).toContain('Beta');
      expect(menuItems[2]!.textContent).toContain('Gamma');
      cleanup(container);
    });

    it('sets aria-expanded on trigger', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems }),
      );
      const trigger = container.querySelector('button')!;
      expect(trigger.getAttribute('aria-expanded')).toBe('false');
      trigger.click();
      await tick();
      expect(trigger.getAttribute('aria-expanded')).toBe('true');
      cleanup(container);
    });

    it('renders items with icons', async () => {
      const items: DropdownItem[] = [
        { id: 'x', label: 'Save', icon: 'S' },
      ];
      const container = renderToContainer(
        createElement(Dropdown, { label: 'File', items }),
      );
      container.querySelector('button')!.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]')!;
      expect(menuItem.textContent).toContain('S');
      expect(menuItem.textContent).toContain('Save');
      cleanup(container);
    });

    it('renders divider items', async () => {
      const items: DropdownItem[] = [
        { id: 'a', label: 'One' },
        { id: 'div', label: '', divider: true },
        { id: 'b', label: 'Two' },
      ];
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items }),
      );
      container.querySelector('button')!.click();
      await tick();
      const separator = container.querySelector('[role="separator"]');
      expect(separator).toBeTruthy();
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty items array', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Empty', items: [] }),
      );
      const trigger = container.querySelector('button')!;
      trigger.click();
      await tick();
      const menuItems = container.querySelectorAll('[role="menuitem"]');
      expect(menuItems.length).toBe(0);
      cleanup(container);
    });

    it('renders disabled items as non-interactive', async () => {
      const onClick = vi.fn();
      const items: DropdownItem[] = [
        { id: 'dis', label: 'Disabled', disabled: true, onClick },
      ];
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items }),
      );
      container.querySelector('button')!.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLButtonElement;
      expect(menuItem.getAttribute('aria-disabled')).toBe('true');
      menuItem.click();
      expect(onClick).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('handles missing onClick on items', async () => {
      const items: DropdownItem[] = [
        { id: 'no-handler', label: 'No handler' },
      ];
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items }),
      );
      container.querySelector('button')!.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLButtonElement;
      expect(() => menuItem.click()).not.toThrow();
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('closes dropdown when trigger is clicked again', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems }),
      );
      const trigger = container.querySelector('button')!;
      trigger.click();
      await tick();
      expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);
      trigger.click();
      await tick();
      expect(container.querySelectorAll('[role="menuitem"]').length).toBe(0);
      cleanup(container);
    });

    it('closes dropdown on Escape key', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems }),
      );
      container.querySelector('button')!.click();
      await tick();
      expect(container.querySelectorAll('[role="menuitem"]').length).toBe(3);
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      await tick();
      expect(container.querySelectorAll('[role="menuitem"]').length).toBe(0);
      cleanup(container);
    });

    it('calls onClick when item is clicked', async () => {
      const onClick = vi.fn();
      const items: DropdownItem[] = [
        { id: 'click-me', label: 'Click Me', onClick },
      ];
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items }),
      );
      container.querySelector('button')!.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      menuItem.click();
      await tick();
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('closes on item select when closeOnSelect is true', async () => {
      const container = renderToContainer(
        createElement(Dropdown, { label: 'Menu', items: sampleItems, closeOnSelect: true }),
      );
      container.querySelector('button')!.click();
      await tick();
      const menuItem = container.querySelector('[role="menuitem"]') as HTMLElement;
      menuItem.click();
      await tick();
      expect(container.querySelectorAll('[role="menuitem"]').length).toBe(0);
      cleanup(container);
    });
  });
});
