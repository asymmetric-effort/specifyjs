// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { Card } from '../src/index';
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

describe('Card', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(Card, null));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe('flex');
      expect(el.style.flexDirection).toBe('column');
    });

    it('renders with title', () => {
      render(createElement(Card, { title: 'My Card' }));
      const title = container.querySelector('.card__title') as HTMLElement;
      expect(title).toBeTruthy();
      expect(title.textContent).toBe('My Card');
    });

    it('renders with subtitle', () => {
      render(createElement(Card, { title: 'Title', subtitle: 'Subtitle text' }));
      const subtitle = container.querySelector('.card__subtitle') as HTMLElement;
      expect(subtitle).toBeTruthy();
      expect(subtitle.textContent).toBe('Subtitle text');
    });

    it('renders header when title is provided', () => {
      render(createElement(Card, { title: 'Test' }));
      expect(container.querySelector('.card__header')).toBeTruthy();
    });

    it('renders headerAction slot', () => {
      render(createElement(Card, {
        title: 'Test',
        headerAction: createElement('button', null, 'Action'),
      }));
      const action = container.querySelector('.card__header-action') as HTMLElement;
      expect(action).toBeTruthy();
      expect(action.textContent).toBe('Action');
    });

    it('renders footer', () => {
      render(createElement(Card, { footer: createElement('span', null, 'Footer') }));
      const footer = container.querySelector('.card__footer') as HTMLElement;
      expect(footer).toBeTruthy();
      expect(footer.textContent).toBe('Footer');
    });

    it('renders top image', () => {
      render(createElement(Card, { image: 'https://example.com/img.jpg', imageAlt: 'Test image' }));
      const img = container.querySelector('img') as HTMLImageElement;
      expect(img).toBeTruthy();
      expect(img.src).toContain('example.com/img.jpg');
      expect(img.alt).toBe('Test image');
    });

    it('renders children in body', () => {
      render(createElement(Card, null,
        createElement('p', null, 'Body content'),
      ));
      const body = container.querySelector('.card__body') as HTMLElement;
      expect(body.textContent).toBe('Body content');
    });

    it('renders with hoverable class', () => {
      render(createElement(Card, { hoverable: true }));
      const el = container.querySelector('.card--hoverable') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.cursor).toBe('pointer');
    });

    it('renders with border when bordered is true (default)', () => {
      render(createElement(Card, null));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el.style.border).toContain('1px solid');
    });

    it('renders without border when bordered is false', () => {
      render(createElement(Card, { bordered: false }));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el.style.border).toBe('');
    });

    it('renders with different shadow levels', () => {
      render(createElement(Card, { shadow: 'lg' }));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el.style.boxShadow).toContain('10px');
    });

    it('renders with shadow none', () => {
      render(createElement(Card, { shadow: 'none' }));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el.style.boxShadow).toBe('none');
    });

    it('renders with all props set', () => {
      render(createElement(Card, {
        title: 'Full Card',
        subtitle: 'All props',
        headerAction: createElement('button', null, 'Act'),
        footer: createElement('div', null, 'Foot'),
        image: 'img.png',
        imageAlt: 'alt text',
        hoverable: true,
        bordered: true,
        shadow: 'md',
        padding: '24px',
        borderRadius: '12px',
        className: 'my-card',
        style: { width: '300px' },
      }, createElement('p', null, 'body')));
      const el = container.querySelector('.card.my-card') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.width).toBe('300px');
      expect(el.style.borderRadius).toBe('12px');
    });
  });

  describe('sad paths', () => {
    it('renders without header when no title/subtitle/headerAction', () => {
      render(createElement(Card, null, 'content'));
      expect(container.querySelector('.card__header')).toBeFalsy();
    });

    it('renders without footer when not provided', () => {
      render(createElement(Card, null));
      expect(container.querySelector('.card__footer')).toBeFalsy();
    });

    it('renders without image when not provided', () => {
      render(createElement(Card, null));
      expect(container.querySelector('img')).toBeFalsy();
    });

    it('renders with empty children', () => {
      render(createElement(Card, null));
      const body = container.querySelector('.card__body') as HTMLElement;
      expect(body).toBeTruthy();
    });

    it('image alt defaults to empty string', () => {
      render(createElement(Card, { image: 'test.png' }));
      const img = container.querySelector('img') as HTMLImageElement;
      expect(img.alt).toBe('');
    });

    it('defaults shadow to sm', () => {
      render(createElement(Card, null));
      const el = container.querySelector('.card') as HTMLElement;
      expect(el.style.boxShadow).toContain('1px 3px');
    });
  });
});
