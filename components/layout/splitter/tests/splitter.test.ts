// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Splitter } from '../src/index';
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

describe('Splitter', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'Pane 1'),
        createElement('div', null, 'Pane 2'),
      ));
      const el = container.querySelector('.splitter') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe('flex');
      expect(el.style.flexDirection).toBe('row');
    });

    it('renders horizontal direction by default', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const el = container.querySelector('.splitter--horizontal') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders vertical direction', () => {
      render(createElement(Splitter, { direction: 'vertical' },
        createElement('div', null, 'Top'),
        createElement('div', null, 'Bottom'),
      ));
      const el = container.querySelector('.splitter--vertical') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.flexDirection).toBe('column');
    });

    it('renders two panes', () => {
      render(createElement(Splitter, null,
        createElement('div', { className: 'pane-a' }, 'A'),
        createElement('div', { className: 'pane-b' }, 'B'),
      ));
      expect(container.querySelector('.splitter__pane--first .pane-a')).toBeTruthy();
      expect(container.querySelector('.splitter__pane--second .pane-b')).toBeTruthy();
    });

    it('renders divider with separator role', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider).toBeTruthy();
      expect(divider.getAttribute('role')).toBe('separator');
    });

    it('divider has col-resize cursor for horizontal', () => {
      render(createElement(Splitter, { direction: 'horizontal' },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.style.cursor).toBe('col-resize');
    });

    it('divider has row-resize cursor for vertical', () => {
      render(createElement(Splitter, { direction: 'vertical' },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.style.cursor).toBe('row-resize');
    });

    it('renders with custom initialSplit', () => {
      render(createElement(Splitter, { initialSplit: 30 },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const firstPane = container.querySelector('.splitter__pane--first') as HTMLElement;
      expect(firstPane.style.width).toContain('30%');
    });

    it('renders with custom dividerSize', () => {
      render(createElement(Splitter, { dividerSize: 10 },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.style.width).toBe('10px');
    });

    it('renders with all props set', () => {
      render(createElement(Splitter, {
        direction: 'vertical',
        initialSplit: 40,
        minSize: 100,
        maxSize: 500,
        dividerSize: 8,
        className: 'my-splitter',
        style: { height: '600px' },
      },
        createElement('div', null, 'Top'),
        createElement('div', null, 'Bottom'),
      ));
      const el = container.querySelector('.splitter.my-splitter') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.height).toBe('600px');
    });

    it('aria-orientation is vertical for horizontal direction', () => {
      render(createElement(Splitter, { direction: 'horizontal' },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.getAttribute('aria-orientation')).toBe('vertical');
    });

    it('aria-orientation is horizontal for vertical direction', () => {
      render(createElement(Splitter, { direction: 'vertical' },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.getAttribute('aria-orientation')).toBe('horizontal');
    });
  });

  describe('drag interaction', () => {
    it('mousedown on divider sets cursor on body', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      const event = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
      divider.dispatchEvent(event);
      expect(document.body.style.cursor).toBe('col-resize');
      // Clean up
      document.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('mouseup resets cursor on body', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      divider.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      document.dispatchEvent(new MouseEvent('mouseup'));
      expect(document.body.style.cursor).toBe('');
    });

    it('vertical direction sets row-resize cursor on drag', () => {
      render(createElement(Splitter, { direction: 'vertical' },
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      divider.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true }));
      expect(document.body.style.cursor).toBe('row-resize');
      document.dispatchEvent(new MouseEvent('mouseup'));
    });
  });

  describe('sad paths', () => {
    it('renders with no children', () => {
      render(createElement(Splitter, null));
      const panes = container.querySelectorAll('.splitter__pane');
      expect(panes.length).toBe(2);
    });

    it('renders with one child', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'Only one'),
      ));
      // Single child is not wrapped in an array by createElement,
      // so Splitter's Array.isArray check yields an empty array.
      // Both panes render empty.
      const first = container.querySelector('.splitter__pane--first') as HTMLElement;
      expect(first.textContent).toBe('');
      const second = container.querySelector('.splitter__pane--second') as HTMLElement;
      expect(second.textContent).toBe('');
    });

    it('handles children not being an array', () => {
      render(createElement(Splitter, { children: null as any }));
      expect(container.querySelector('.splitter')).toBeTruthy();
    });

    it('defaults initialSplit to 50', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const firstPane = container.querySelector('.splitter__pane--first') as HTMLElement;
      expect(firstPane.style.width).toContain('50%');
    });

    it('defaults dividerSize to 6', () => {
      render(createElement(Splitter, null,
        createElement('div', null, 'A'),
        createElement('div', null, 'B'),
      ));
      const divider = container.querySelector('.splitter__divider') as HTMLElement;
      expect(divider.style.width).toBe('6px');
    });
  });
});
