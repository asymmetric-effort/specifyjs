// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { FlexContainer, FlexItem } from '../src/index';
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

describe('FlexContainer', () => {
  describe('happy paths', () => {
    it('renders with default props (display: flex)', () => {
      render(createElement(FlexContainer, null));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe('flex');
    });

    it('renders with direction column', () => {
      render(createElement(FlexContainer, { direction: 'column' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.flexDirection).toBe('column');
    });

    it('renders with direction row-reverse', () => {
      render(createElement(FlexContainer, { direction: 'row-reverse' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.flexDirection).toBe('row-reverse');
    });

    it('renders with wrap', () => {
      render(createElement(FlexContainer, { wrap: 'wrap' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.flexWrap).toBe('wrap');
    });

    it('renders with gap', () => {
      render(createElement(FlexContainer, { gap: '12px' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.gap).toBe('12px');
    });

    it('renders with alignItems and justifyContent', () => {
      render(createElement(FlexContainer, { alignItems: 'center', justifyContent: 'space-between' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.alignItems).toBe('center');
      expect(el.style.justifyContent).toBe('space-between');
    });

    it('renders as inline-flex when inline is true', () => {
      render(createElement(FlexContainer, { inline: true }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.display).toBe('inline-flex');
    });

    it('renders children inside', () => {
      render(createElement(FlexContainer, { direction: 'row' },
        createElement('div', { className: 'child-1' }, 'One'),
        createElement('div', { className: 'child-2' }, 'Two'),
      ));
      expect(container.querySelector('.child-1')).toBeTruthy();
      expect(container.querySelector('.child-2')).toBeTruthy();
    });

    it('renders with all props set', () => {
      render(createElement(FlexContainer, {
        direction: 'column-reverse',
        wrap: 'wrap-reverse',
        gap: '8px',
        alignItems: 'flex-end',
        justifyContent: 'center',
        inline: false,
        className: 'my-flex',
        style: { maxWidth: '500px' },
      }));
      const el = container.querySelector('.flex-container.my-flex') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.maxWidth).toBe('500px');
      expect(el.style.flexDirection).toBe('column-reverse');
    });
  });

  describe('sad paths', () => {
    it('renders without crashing with empty props', () => {
      render(createElement(FlexContainer, {}));
      expect(container.querySelector('.flex-container')).toBeTruthy();
    });

    it('renders with no children', () => {
      render(createElement(FlexContainer, { direction: 'row' }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.children.length).toBe(0);
    });

    it('defaults to flex (not inline-flex) when inline is false', () => {
      render(createElement(FlexContainer, { inline: false }));
      const el = container.querySelector('.flex-container') as HTMLElement;
      expect(el.style.display).toBe('flex');
    });
  });
});

describe('FlexItem', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(FlexItem, null));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders with flex shorthand', () => {
      render(createElement(FlexItem, { flex: '1 1 auto' }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.flex).toBe('1 1 auto');
    });

    it('renders with grow, shrink, basis', () => {
      render(createElement(FlexItem, { grow: 2, shrink: 0, basis: '200px' }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.flexGrow).toBe('2');
      expect(el.style.flexShrink).toBe('0');
      expect(el.style.flexBasis).toBe('200px');
    });

    it('renders with alignSelf', () => {
      render(createElement(FlexItem, { alignSelf: 'stretch' }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.alignSelf).toBe('stretch');
    });

    it('renders with order', () => {
      render(createElement(FlexItem, { order: 5 }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.order).toBe('5');
    });

    it('renders children inside', () => {
      render(createElement(FlexItem, { flex: '1' },
        createElement('span', null, 'inner'),
      ));
      expect(container.querySelector('.flex-item span')).toBeTruthy();
    });

    it('renders with all props set', () => {
      render(createElement(FlexItem, {
        flex: '0 1 auto',
        grow: 1,
        shrink: 1,
        basis: '100px',
        alignSelf: 'center',
        order: 3,
        className: 'custom-item',
        style: { color: 'red' },
      }));
      const el = container.querySelector('.flex-item.custom-item') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.color).toBe('red');
    });
  });

  describe('sad paths', () => {
    it('renders with empty props', () => {
      render(createElement(FlexItem, {}));
      expect(container.querySelector('.flex-item')).toBeTruthy();
    });

    it('renders with no children', () => {
      render(createElement(FlexItem, {}));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.children.length).toBe(0);
    });

    it('handles grow of zero', () => {
      render(createElement(FlexItem, { grow: 0 }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.flexGrow).toBe('0');
    });

    it('handles order of zero', () => {
      render(createElement(FlexItem, { order: 0 }));
      const el = container.querySelector('.flex-item') as HTMLElement;
      expect(el.style.order).toBe('0');
    });
  });
});
