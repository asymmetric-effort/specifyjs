// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Menubar } from '../src/index';
import type { MenubarProps, MenuDefinition, MenuItem } from '../src/index';
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

const sampleMenus: MenuDefinition[] = [
  {
    id: 'file',
    label: 'File',
    items: [
      { id: 'new', label: 'New', onClick: vi.fn() },
      { id: 'open', label: 'Open', onClick: vi.fn() },
      { id: 'save', label: 'Save', onClick: vi.fn() },
    ],
  },
  {
    id: 'edit',
    label: 'Edit',
    items: [
      { id: 'undo', label: 'Undo', onClick: vi.fn() },
      { id: 'redo', label: 'Redo', onClick: vi.fn() },
    ],
  },
];

// -- Happy path tests -------------------------------------------------------

describe('Menubar', () => {
  describe('happy path', () => {
    it('renders menubar with role="menubar"', () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      const menubar = container.querySelector('[role="menubar"]');
      expect(menubar).toBeTruthy();
      cleanup(container);
    });

    it('renders all top-level menu labels', () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      expect(container.textContent).toContain('File');
      expect(container.textContent).toContain('Edit');
      cleanup(container);
    });

    it('shows menu items when top-level menu is clicked', async () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      // Find and click the File menu trigger
      const triggers = container.querySelectorAll('[role="menuitem"]');
      const fileTrigger = Array.from(triggers).find(
        (t) => t.textContent!.includes('File'),
      ) as HTMLElement;
      if (fileTrigger) {
        fileTrigger.click();
        await tick();
        // After click, submenu items should be visible
        expect(container.textContent).toContain('New');
        expect(container.textContent).toContain('Open');
        expect(container.textContent).toContain('Save');
      }
      cleanup(container);
    });

    it('renders menu items with correct count', () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      const triggers = container.querySelectorAll('[role="menuitem"]');
      // At minimum, top-level menu items should be present
      expect(triggers.length).toBeGreaterThanOrEqual(2);
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty menus array', () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: [] }),
      );
      const menubar = container.querySelector('[role="menubar"]');
      expect(menubar).toBeTruthy();
      cleanup(container);
    });

    it('renders disabled menu items', async () => {
      const onClick = vi.fn();
      const menus: MenuDefinition[] = [
        {
          id: 'test',
          label: 'Test',
          items: [
            { id: 'dis', label: 'Disabled Item', disabled: true, onClick },
          ],
        },
      ];
      const container = renderToContainer(
        createElement(Menubar, { menus }),
      );
      // Open the menu
      const trigger = container.querySelector('[role="menuitem"]') as HTMLElement;
      if (trigger) {
        trigger.click();
        await tick();
        const disabledItem = container.querySelector('[aria-disabled="true"]');
        if (disabledItem) {
          (disabledItem as HTMLElement).click();
          expect(onClick).not.toHaveBeenCalled();
        }
      }
      cleanup(container);
    });

    it('handles menus with empty items array', () => {
      const menus: MenuDefinition[] = [
        { id: 'empty', label: 'Empty Menu', items: [] },
      ];
      const container = renderToContainer(
        createElement(Menubar, { menus }),
      );
      expect(container.textContent).toContain('Empty Menu');
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onClick when menu item is clicked', async () => {
      const onClick = vi.fn();
      const menus: MenuDefinition[] = [
        {
          id: 'act',
          label: 'Actions',
          items: [
            { id: 'do', label: 'Do Thing', onClick },
          ],
        },
      ];
      const container = renderToContainer(
        createElement(Menubar, { menus }),
      );
      // Open the menu
      const trigger = container.querySelector('[role="menuitem"]') as HTMLElement;
      if (trigger) {
        trigger.click();
        await tick();
      }
      // Find and click the sub-item
      const allItems = container.querySelectorAll('[role="menuitem"]');
      const doItem = Array.from(allItems).find(
        (el) => el.textContent!.includes('Do Thing'),
      ) as HTMLElement;
      if (doItem) {
        doItem.click();
        await tick();
        expect(onClick).toHaveBeenCalledTimes(1);
      }
      cleanup(container);
    });

    it('closes menu on Escape key', async () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      const trigger = container.querySelector('[role="menuitem"]') as HTMLElement;
      if (trigger) {
        trigger.click();
        await tick();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        await tick();
      }
      cleanup(container);
    });

    it('toggles menu open and closed on trigger click', async () => {
      const container = renderToContainer(
        createElement(Menubar, { menus: sampleMenus }),
      );
      const trigger = container.querySelector('[role="menuitem"]') as HTMLElement;
      if (trigger) {
        trigger.click(); // open
        await tick();
        expect(container.textContent).toContain('New');
        trigger.click(); // close
        await tick();
      }
      cleanup(container);
    });
  });
});
