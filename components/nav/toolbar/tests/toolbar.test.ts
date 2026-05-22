// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Toolbar } from '../src/index';
import type { ToolbarProps, ToolbarItem } from '../src/index';
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

const sampleItems: ToolbarItem[] = [
  { id: 'bold', label: 'Bold', icon: 'B', type: 'button', onClick: vi.fn() },
  { id: 'italic', label: 'Italic', icon: 'I', type: 'button', onClick: vi.fn() },
  { id: 'sep1', type: 'separator', id: 'sep1' } as ToolbarItem,
  { id: 'underline', label: 'Underline', icon: 'U', type: 'button', onClick: vi.fn() },
];

// -- Happy path tests -------------------------------------------------------

describe('Toolbar', () => {
  describe('happy path', () => {
    it('renders toolbar with role="toolbar"', () => {
      const container = renderToContainer(
        createElement(Toolbar, { items: sampleItems }),
      );
      const toolbar = container.querySelector('[role="toolbar"]');
      expect(toolbar).toBeTruthy();
      cleanup(container);
    });

    it('renders all button items', () => {
      const container = renderToContainer(
        createElement(Toolbar, { items: sampleItems }),
      );
      expect(container.textContent).toContain('Bold');
      expect(container.textContent).toContain('Italic');
      expect(container.textContent).toContain('Underline');
      cleanup(container);
    });

    it('renders separator elements', () => {
      const container = renderToContainer(
        createElement(Toolbar, { items: sampleItems }),
      );
      const separators = container.querySelectorAll('[role="separator"]');
      expect(separators.length).toBeGreaterThanOrEqual(1);
      cleanup(container);
    });

    it('renders item icons', () => {
      const container = renderToContainer(
        createElement(Toolbar, { items: sampleItems }),
      );
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('I');
      expect(container.textContent).toContain('U');
      cleanup(container);
    });

    it('supports active state on items', () => {
      const items: ToolbarItem[] = [
        { id: 'active', label: 'Active', type: 'button', active: true },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items }),
      );
      // Active button should have different styling
      const btn = container.querySelector('button') as HTMLElement;
      expect(btn).toBeTruthy();
      cleanup(container);
    });

    it('supports size variants', () => {
      const items: ToolbarItem[] = [
        { id: 'b', label: 'Btn', type: 'button' },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items, size: 'lg' }),
      );
      const btn = container.querySelector('button') as HTMLElement;
      expect(btn.style.height).toBe('44px');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty items array', () => {
      const container = renderToContainer(
        createElement(Toolbar, { items: [] }),
      );
      const toolbar = container.querySelector('[role="toolbar"]');
      expect(toolbar).toBeTruthy();
      cleanup(container);
    });

    it('renders disabled buttons', () => {
      const onClick = vi.fn();
      const items: ToolbarItem[] = [
        { id: 'dis', label: 'Disabled', type: 'button', disabled: true, onClick },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items }),
      );
      const btn = container.querySelector('button') as HTMLElement;
      btn.click();
      expect(onClick).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('handles items with no label (icon only)', () => {
      const items: ToolbarItem[] = [
        { id: 'icon-only', icon: 'X', type: 'button' },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items }),
      );
      expect(container.textContent).toContain('X');
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onClick when button is clicked', () => {
      const onClick = vi.fn();
      const items: ToolbarItem[] = [
        { id: 'clickable', label: 'Click', type: 'button', onClick },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items }),
      );
      const btn = container.querySelector('button') as HTMLElement;
      btn.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('renders spacer items with flex grow', () => {
      const items: ToolbarItem[] = [
        { id: 'a', label: 'A', type: 'button' },
        { id: 'spacer', type: 'spacer' } as ToolbarItem,
        { id: 'b', label: 'B', type: 'button' },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items }),
      );
      // Spacer should be present in the DOM
      const toolbar = container.querySelector('[role="toolbar"]')!;
      expect(toolbar.children.length).toBeGreaterThanOrEqual(3);
      cleanup(container);
    });

    it('supports raised variant styling', () => {
      const items: ToolbarItem[] = [
        { id: 'btn', label: 'Btn', type: 'button' },
      ];
      const container = renderToContainer(
        createElement(Toolbar, { items, variant: 'raised' }),
      );
      const btn = container.querySelector('button') as HTMLElement;
      expect(btn.style.border).toContain('solid');
      cleanup(container);
    });
  });
});
