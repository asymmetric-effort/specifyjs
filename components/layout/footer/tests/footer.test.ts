// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { Footer } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

describe('Footer', () => {
  it('renders a footer element', () => {
    const el = render(createElement(Footer, {}));
    expect(el.querySelector('footer')).toBeTruthy();
  });

  it('has role="contentinfo"', () => {
    const el = render(createElement(Footer, {}));
    expect(el.querySelector('footer')?.getAttribute('role')).toBe('contentinfo');
  });

  it('has aria-label', () => {
    const el = render(createElement(Footer, {}));
    expect(el.querySelector('footer')?.getAttribute('aria-label')).toBe('Site footer');
  });

  it('renders custom aria-label', () => {
    const el = render(createElement(Footer, { ariaLabel: 'Page footer' }));
    expect(el.querySelector('footer')?.getAttribute('aria-label')).toBe('Page footer');
  });

  it('renders left content', () => {
    const el = render(createElement(Footer, { left: 'Left text' }));
    expect(el.textContent).toContain('Left text');
  });

  it('renders center content', () => {
    const el = render(createElement(Footer, { center: 'Center text' }));
    expect(el.textContent).toContain('Center text');
  });

  it('renders right content', () => {
    const el = render(createElement(Footer, { right: 'Right text' }));
    expect(el.textContent).toContain('Right text');
  });

  it('renders all three sections', () => {
    const el = render(createElement(Footer, {
      left: 'L',
      center: 'C',
      right: 'R',
    }));
    expect(el.textContent).toContain('L');
    expect(el.textContent).toContain('C');
    expect(el.textContent).toContain('R');
  });

  it('renders empty footer without content', () => {
    const el = render(createElement(Footer, {}));
    const footer = el.querySelector('footer');
    expect(footer).toBeTruthy();
  });

  it('applies className', () => {
    const el = render(createElement(Footer, { className: 'my-footer' }));
    expect(el.querySelector('.my-footer')).toBeTruthy();
  });

  it('has three child divs for columns', () => {
    const el = render(createElement(Footer, { left: 'L', center: 'C', right: 'R' }));
    const inner = el.querySelector('footer > div');
    const cols = inner?.querySelectorAll(':scope > div');
    expect(cols?.length).toBe(3);
  });

  it('left column has text-align left', () => {
    const el = render(createElement(Footer, { left: 'L' }));
    const cols = el.querySelector('footer > div')?.querySelectorAll(':scope > div');
    expect((cols?.[0] as HTMLElement)?.style.textAlign).toBe('left');
  });

  it('center column has text-align center', () => {
    const el = render(createElement(Footer, { center: 'C' }));
    const cols = el.querySelector('footer > div')?.querySelectorAll(':scope > div');
    expect((cols?.[1] as HTMLElement)?.style.textAlign).toBe('center');
  });

  it('right column has text-align right', () => {
    const el = render(createElement(Footer, { right: 'R' }));
    const cols = el.querySelector('footer > div')?.querySelectorAll(':scope > div');
    expect((cols?.[2] as HTMLElement)?.style.textAlign).toBe('right');
  });
});
