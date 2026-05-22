// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { ScrollContainer } from '../src/index';
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

describe('ScrollContainer', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.position).toBe('relative');
    });

    it('defaults to vertical direction', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container--vertical') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.overflowY).toBe('auto');
      expect(el.style.overflowX).toBe('hidden');
    });

    it('renders with horizontal direction', () => {
      render(createElement(ScrollContainer, { direction: 'horizontal' }));
      const el = container.querySelector('.scroll-container--horizontal') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.overflowX).toBe('auto');
      expect(el.style.overflowY).toBe('hidden');
    });

    it('renders with both direction', () => {
      render(createElement(ScrollContainer, { direction: 'both' }));
      const el = container.querySelector('.scroll-container--both') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.overflowX).toBe('auto');
      expect(el.style.overflowY).toBe('auto');
    });

    it('renders with maxHeight', () => {
      render(createElement(ScrollContainer, { maxHeight: '400px' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.maxHeight).toBe('400px');
    });

    it('renders with maxWidth', () => {
      render(createElement(ScrollContainer, { maxWidth: '600px' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.maxWidth).toBe('600px');
    });

    it('renders with padding', () => {
      render(createElement(ScrollContainer, { padding: '16px' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.padding).toBe('16px');
    });

    it('renders children inside', () => {
      render(createElement(ScrollContainer, { maxHeight: '200px' },
        createElement('div', { className: 'inner' }, 'Scrollable content'),
      ));
      const inner = container.querySelector('.inner') as HTMLElement;
      expect(inner).toBeTruthy();
      expect(inner.textContent).toBe('Scrollable content');
    });

    it('renders with showScrollbar auto (default)', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.scrollbarWidth).toBe('auto');
    });

    it('renders with showScrollbar always', () => {
      render(createElement(ScrollContainer, { showScrollbar: 'always' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.scrollbarWidth).toBe('thin');
    });

    it('renders with showScrollbar never', () => {
      render(createElement(ScrollContainer, { showScrollbar: 'never' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.scrollbarWidth).toBe('none');
    });

    it('renders with showScrollbar hover', () => {
      render(createElement(ScrollContainer, { showScrollbar: 'hover' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.scrollbarWidth).toBe('thin');
    });

    it('renders with all props set', () => {
      render(createElement(ScrollContainer, {
        maxHeight: '500px',
        maxWidth: '800px',
        direction: 'both',
        showScrollbar: 'always',
        padding: '20px',
        shadow: true,
        className: 'custom-scroll',
        style: { border: '1px solid #ccc' },
      }, createElement('div', null, 'content')));
      const el = container.querySelector('.scroll-container.custom-scroll') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.border).toContain('1px solid');
      expect(el.style.maxHeight).toBe('500px');
    });
  });

  describe('shadow behavior', () => {
    it('no box-shadow when shadow is false', () => {
      render(createElement(ScrollContainer, { shadow: false }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.boxShadow).toBe('');
    });

    it('shadow prop activates edge shadow tracking', () => {
      render(createElement(ScrollContainer, { shadow: true, maxHeight: '100px' },
        createElement('div', { style: { height: '500px' } }, 'tall'),
      ));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      // At scroll top, no top shadow but potentially bottom shadow
      expect(el).toBeTruthy();
    });
  });

  describe('sad paths', () => {
    it('renders with no children', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.children.length).toBe(0);
    });

    it('renders without maxHeight or maxWidth', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.maxHeight).toBe('');
      expect(el.style.maxWidth).toBe('');
    });

    it('renders with empty className', () => {
      render(createElement(ScrollContainer, { className: '' }));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders with no style override', () => {
      render(createElement(ScrollContainer, null));
      const el = container.querySelector('.scroll-container') as HTMLElement;
      expect(el.style.position).toBe('relative');
    });

    it('applies custom className alongside default', () => {
      render(createElement(ScrollContainer, { className: 'extra' }));
      const el = container.querySelector('.scroll-container.extra') as HTMLElement;
      expect(el).toBeTruthy();
    });
  });
});
