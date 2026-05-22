// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { Panel } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

function render(element: unknown) {
  const root = createRoot(container);
  root.render(element as any);
  return container;
}

describe('Panel', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(Panel, null));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders with title', () => {
      render(createElement(Panel, { title: 'My Panel' }));
      const title = container.querySelector('.panel__title') as HTMLElement;
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('My Panel');
    });

    it('renders with icon', () => {
      render(createElement(Panel, { icon: createElement('span', null, 'IC') }));
      const icon = container.querySelector('.panel__icon') as HTMLElement;
      expect(icon).toBeTruthy();
      expect(icon.textContent).toBe('IC');
    });

    it('renders headerRight slot', () => {
      render(createElement(Panel, {
        title: 'Test',
        headerRight: createElement('button', null, 'More'),
      }));
      const right = container.querySelector('.panel__header-right') as HTMLElement;
      expect(right).toBeTruthy();
      expect(right.textContent).toBe('More');
    });

    it('renders children in body', () => {
      render(createElement(Panel, { title: 'Test' },
        createElement('p', null, 'Panel body content'),
      ));
      const body = container.querySelector('.panel__body') as HTMLElement;
      expect(body.textContent).toBe('Panel body content');
    });

    it('renders with border by default', () => {
      render(createElement(Panel, null));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el.style.border).toContain('1px solid');
    });

    it('renders without border when bordered is false', () => {
      render(createElement(Panel, { bordered: false }));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el.style.border).toBe('');
    });

    it('renders with shadow sm', () => {
      render(createElement(Panel, { shadow: 'sm' }));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el.style.boxShadow).toContain('1px 3px');
    });

    it('renders with shadow md', () => {
      render(createElement(Panel, { shadow: 'md' }));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el.style.boxShadow).toContain('4px 6px');
    });

    it('renders with all props set', () => {
      render(createElement(Panel, {
        title: 'Full Panel',
        collapsible: true,
        defaultCollapsed: false,
        icon: createElement('span', null, 'X'),
        headerRight: createElement('span', null, 'R'),
        bordered: true,
        shadow: 'sm',
        className: 'custom-panel',
        style: { width: '400px' },
      }, createElement('div', null, 'body')));
      const el = container.querySelector('.panel.custom-panel') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.width).toBe('400px');
    });
  });

  describe('collapsible behavior', () => {
    it('renders chevron when collapsible', () => {
      render(createElement(Panel, { collapsible: true, title: 'Collapsible' }));
      expect(container.querySelector('.panel__chevron')).toBeTruthy();
    });

    it('does not render chevron when not collapsible', () => {
      render(createElement(Panel, { collapsible: false, title: 'Static' }));
      expect(container.querySelector('.panel__chevron')).toBeFalsy();
    });

    it('header has role=button when collapsible', () => {
      render(createElement(Panel, { collapsible: true, title: 'Test' }));
      const header = container.querySelector('.panel__header') as HTMLElement;
      expect(header.getAttribute('role')).toBe('button');
    });

    it('header has aria-expanded when collapsible', () => {
      render(createElement(Panel, { collapsible: true, title: 'Test' }));
      const header = container.querySelector('.panel__header') as HTMLElement;
      expect(header.getAttribute('aria-expanded')).toBe('true');
    });

    it('starts collapsed when defaultCollapsed is true', () => {
      render(createElement(Panel, { collapsible: true, defaultCollapsed: true, title: 'Test' },
        createElement('div', null, 'content'),
      ));
      const wrapper = container.querySelector('.panel__body-wrapper') as HTMLElement;
      expect(wrapper.style.maxHeight).toMatch(/^0(px)?$/);
    });

    it('toggles collapsed state on header click', async () => {
      render(createElement(Panel, { collapsible: true, title: 'Toggle' },
        createElement('div', null, 'content'),
      ));
      const header = container.querySelector('.panel__header') as HTMLElement;
      // Initially expanded
      expect(header.getAttribute('aria-expanded')).toBe('true');
      // Click to collapse
      header.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      const headerAfter1 = container.querySelector('.panel__header') as HTMLElement;
      expect(headerAfter1.getAttribute('aria-expanded')).toBe('false');
      // Click again to expand
      headerAfter1.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await new Promise((r) => setTimeout(r, 20));
      const headerAfter2 = container.querySelector('.panel__header') as HTMLElement;
      expect(headerAfter2.getAttribute('aria-expanded')).toBe('true');
    });

    it('does not toggle when not collapsible and header is clicked', () => {
      render(createElement(Panel, { collapsible: false, title: 'Static' },
        createElement('div', null, 'content'),
      ));
      const header = container.querySelector('.panel__header') as HTMLElement;
      header.click();
      // No aria-expanded attribute at all
      expect(header.getAttribute('aria-expanded')).toBeFalsy();
    });

    it('header has pointer cursor when collapsible', () => {
      render(createElement(Panel, { collapsible: true, title: 'Test' }));
      const header = container.querySelector('.panel__header') as HTMLElement;
      expect(header.style.cursor).toBe('pointer');
    });

    it('header has default cursor when not collapsible', () => {
      render(createElement(Panel, { collapsible: false, title: 'Test' }));
      const header = container.querySelector('.panel__header') as HTMLElement;
      expect(header.style.cursor).toBe('default');
    });
  });

  describe('sad paths', () => {
    it('renders with no title', () => {
      render(createElement(Panel, null, 'content'));
      expect(container.querySelector('.panel__title')).toBeFalsy();
    });

    it('renders with no icon', () => {
      render(createElement(Panel, { title: 'Test' }));
      expect(container.querySelector('.panel__icon')).toBeFalsy();
    });

    it('renders with no headerRight', () => {
      render(createElement(Panel, { title: 'Test' }));
      expect(container.querySelector('.panel__header-right')).toBeFalsy();
    });

    it('renders with empty children', () => {
      render(createElement(Panel, { title: 'Empty' }));
      const body = container.querySelector('.panel__body') as HTMLElement;
      expect(body).toBeTruthy();
    });

    it('shadow defaults to none', () => {
      render(createElement(Panel, null));
      const el = container.querySelector('.panel') as HTMLElement;
      expect(el.style.boxShadow).toBe('none');
    });
  });
});
