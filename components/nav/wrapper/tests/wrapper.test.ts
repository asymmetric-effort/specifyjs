// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NavWrapper, buildNavItemStyle, useHover } from '../src/index';
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

// -- Happy path tests -------------------------------------------------------

describe('NavWrapper', () => {
  describe('happy path', () => {
    it('renders a nav element with default role', () => {
      const container = renderToContainer(
        createElement(NavWrapper, null, createElement('span', null, 'Item 1')),
      );
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
      expect(nav!.getAttribute('role')).toBe('navigation');
      cleanup(container);
    });

    it('renders children correctly', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          null,
          createElement('span', null, 'Child A'),
          createElement('span', null, 'Child B'),
        ),
      );
      const spans = container.querySelectorAll('span');
      expect(spans.length).toBeGreaterThanOrEqual(2);
      expect(spans[0]!.textContent).toBe('Child A');
      expect(spans[1]!.textContent).toBe('Child B');
      cleanup(container);
    });

    it('applies horizontal orientation', () => {
      const container = renderToContainer(
        createElement(NavWrapper, { orientation: 'horizontal' }),
      );
      const nav = container.querySelector('nav');
      expect(nav!.getAttribute('aria-orientation')).toBe('horizontal');
      cleanup(container);
    });

    it('applies vertical orientation by default', () => {
      const container = renderToContainer(createElement(NavWrapper, null));
      const nav = container.querySelector('nav');
      expect(nav!.getAttribute('aria-orientation')).toBe('vertical');
      cleanup(container);
    });

    it('applies custom aria-label', () => {
      const container = renderToContainer(
        createElement(NavWrapper, { ariaLabel: 'Main nav' }),
      );
      const nav = container.querySelector('nav');
      expect(nav!.getAttribute('aria-label')).toBe('Main nav');
      cleanup(container);
    });

    it('applies custom className', () => {
      const container = renderToContainer(
        createElement(NavWrapper, { className: 'my-nav' }),
      );
      const nav = container.querySelector('nav');
      expect(nav!.className).toContain('my-nav');
      cleanup(container);
    });

    it('applies styling props', () => {
      const container = renderToContainer(
        createElement(NavWrapper, {
          styling: { backgroundColor: '#ff0000', borderRadius: '12px' },
        }),
      );
      const nav = container.querySelector('nav') as HTMLElement;
      expect(nav.style.backgroundColor).toBe('rgb(255, 0, 0)');
      expect(nav.style.borderRadius).toBe('12px');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('renders without children', () => {
      const container = renderToContainer(createElement(NavWrapper, null));
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('handles undefined styling gracefully', () => {
      const container = renderToContainer(
        createElement(NavWrapper, { styling: undefined }),
      );
      const nav = container.querySelector('nav');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('handles empty className', () => {
      const container = renderToContainer(
        createElement(NavWrapper, { className: '' }),
      );
      const nav = container.querySelector('nav');
      expect(nav!.className).toContain('nav-wrapper');
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('supports keyboard navigation with ArrowDown', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          { keyboardNav: true },
          createElement('button', null, 'A'),
          createElement('button', null, 'B'),
        ),
      );
      const buttons = container.querySelectorAll('button');
      (buttons[0] as HTMLElement).focus();
      const nav = container.querySelector('nav')!;
      nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).toBe(buttons[1]);
      cleanup(container);
    });

    it('supports keyboard navigation with ArrowUp', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          { keyboardNav: true },
          createElement('button', null, 'A'),
          createElement('button', null, 'B'),
        ),
      );
      const buttons = container.querySelectorAll('button');
      (buttons[1] as HTMLElement).focus();
      const nav = container.querySelector('nav')!;
      nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(document.activeElement).toBe(buttons[0]);
      cleanup(container);
    });

    it('supports Home key to focus first item', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          { keyboardNav: true },
          createElement('button', null, 'A'),
          createElement('button', null, 'B'),
          createElement('button', null, 'C'),
        ),
      );
      const buttons = container.querySelectorAll('button');
      (buttons[2] as HTMLElement).focus();
      const nav = container.querySelector('nav')!;
      nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
      expect(document.activeElement).toBe(buttons[0]);
      cleanup(container);
    });

    it('supports End key to focus last item', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          { keyboardNav: true },
          createElement('button', null, 'A'),
          createElement('button', null, 'B'),
          createElement('button', null, 'C'),
        ),
      );
      const buttons = container.querySelectorAll('button');
      (buttons[0] as HTMLElement).focus();
      const nav = container.querySelector('nav')!;
      nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
      expect(document.activeElement).toBe(buttons[2]);
      cleanup(container);
    });

    it('does not navigate when keyboardNav is false', () => {
      const container = renderToContainer(
        createElement(
          NavWrapper,
          { keyboardNav: false },
          createElement('button', null, 'A'),
          createElement('button', null, 'B'),
        ),
      );
      const buttons = container.querySelectorAll('button');
      (buttons[0] as HTMLElement).focus();
      const nav = container.querySelector('nav')!;
      nav.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(document.activeElement).toBe(buttons[0]);
      cleanup(container);
    });
  });
});

describe('buildNavItemStyle', () => {
  it('returns default style when no state active', () => {
    const style = buildNavItemStyle({}, { hover: false, active: false });
    expect(style.backgroundColor).toBe('transparent');
    expect(style.cursor).toBe('pointer');
  });

  it('applies hover background when hovered', () => {
    const style = buildNavItemStyle({}, { hover: true, active: false });
    expect(style.backgroundColor).toBe('#f3f4f6');
  });

  it('applies active background when active', () => {
    const style = buildNavItemStyle({}, { hover: false, active: true });
    expect(style.backgroundColor).toBe('#eff6ff');
    expect(style.color).toBe('#2563eb');
  });

  it('applies custom padding', () => {
    const style = buildNavItemStyle({ padding: '20px' }, { hover: false, active: false });
    expect(style.padding).toBe('20px');
  });
});
