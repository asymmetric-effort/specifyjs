// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Breadcrumb } from '../src/index';
import type { BreadcrumbProps, BreadcrumbItem } from '../src/index';
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

const sampleItems: BreadcrumbItem[] = [
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'Widget', href: '/products/widget' },
];

// -- Happy path tests -------------------------------------------------------

describe('Breadcrumb', () => {
  describe('happy path', () => {
    it('renders breadcrumb navigation', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      expect(nav!.getAttribute('aria-label')).toBe('Breadcrumb');
      cleanup(container);
    });

    it('renders all items', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems }),
      );
      expect(container.textContent).toContain('Home');
      expect(container.textContent).toContain('Products');
      expect(container.textContent).toContain('Widget');
      cleanup(container);
    });

    it('renders last item as current page', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems }),
      );
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeTruthy();
      expect(current!.textContent).toBe('Widget');
      cleanup(container);
    });

    it('renders link items as anchor tags', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems }),
      );
      const links = container.querySelectorAll('a[href]');
      expect(links.length).toBe(2); // Home and Products, not Widget (last)
      expect((links[0] as HTMLAnchorElement).href).toContain('/');
      cleanup(container);
    });

    it('renders separators between items', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems, separator: '>' }),
      );
      const separators = container.querySelectorAll('[aria-hidden="true"]');
      expect(separators.length).toBe(2); // between 3 items
      expect(separators[0]!.textContent).toBe('>');
      cleanup(container);
    });

    it('supports size variants', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: sampleItems, size: 'lg' }),
      );
      const current = container.querySelector('[aria-current="page"]') as HTMLElement;
      expect(current.style.fontSize).toBe('16px');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders with empty items array', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: [] }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      const list = container.querySelector('ol');
      expect(list!.children.length).toBe(0);
      cleanup(container);
    });

    it('renders single item as current page', () => {
      const container = renderToContainer(
        createElement(Breadcrumb, { items: [{ label: 'Only' }] }),
      );
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeTruthy();
      expect(current!.textContent).toBe('Only');
      cleanup(container);
    });

    it('handles items without href or onClick', () => {
      const items: BreadcrumbItem[] = [
        { label: 'Plain' },
        { label: 'Current' },
      ];
      const container = renderToContainer(
        createElement(Breadcrumb, { items }),
      );
      // First item has no href, should render as plain span
      const links = container.querySelectorAll('a');
      expect(links.length).toBe(0);
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onClick when breadcrumb item is clicked', () => {
      const onClick = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Clickable', onClick },
        { label: 'Current' },
      ];
      const container = renderToContainer(
        createElement(Breadcrumb, { items }),
      );
      const button = container.querySelector('button[type="button"]') as HTMLElement;
      button.click();
      expect(onClick).toHaveBeenCalledTimes(1);
      cleanup(container);
    });

    it('collapses middle items when maxItems is set', () => {
      const manyItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'A', href: '/a' },
        { label: 'B', href: '/b' },
        { label: 'C', href: '/c' },
        { label: 'Current' },
      ];
      const container = renderToContainer(
        createElement(Breadcrumb, { items: manyItems, maxItems: 3 }),
      );
      expect(container.textContent).toContain('...');
      expect(container.textContent).toContain('Home');
      expect(container.textContent).toContain('Current');
      cleanup(container);
    });

    it('expands collapsed items when ellipsis is clicked', async () => {
      const manyItems: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'A', href: '/a' },
        { label: 'B', href: '/b' },
        { label: 'C', href: '/c' },
        { label: 'Current' },
      ];
      const container = renderToContainer(
        createElement(Breadcrumb, { items: manyItems, maxItems: 3 }),
      );
      const ellipsisBtn = container.querySelector('[aria-label="Show all breadcrumb items"]') as HTMLElement;
      expect(ellipsisBtn).toBeTruthy();
      ellipsisBtn.click();
      await tick();
      // After expanding, all items should be visible
      expect(container.textContent).toContain('A');
      expect(container.textContent).toContain('B');
      expect(container.textContent).toContain('C');
      cleanup(container);
    });

    it('prevents default on link with onClick', () => {
      const onClick = vi.fn();
      const items: BreadcrumbItem[] = [
        { label: 'Link', href: '/test', onClick },
        { label: 'Current' },
      ];
      const container = renderToContainer(
        createElement(Breadcrumb, { items }),
      );
      const link = container.querySelector('a[href]') as HTMLAnchorElement;
      link.click();
      expect(onClick).toHaveBeenCalled();
      cleanup(container);
    });
  });
});
