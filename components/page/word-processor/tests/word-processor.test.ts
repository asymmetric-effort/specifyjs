// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { WordProcessor } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

function render(vnode: unknown): HTMLElement {
  container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return container;
}

beforeEach(() => {
  return () => {
    if (container && container.parentNode) {
      document.body.removeChild(container);
    }
  };
});

describe('WordProcessor', () => {
  it('renders without error', () => {
    const el = render(createElement(WordProcessor, null));
    expect(el.querySelector('.word-processor')).not.toBeNull();
  });

  it('contains menu bar with File, Edit, View items', () => {
    const el = render(createElement(WordProcessor, null));
    const menuBar = el.querySelector('.word-processor__menu-bar');
    expect(menuBar).not.toBeNull();
    const text = menuBar?.textContent ?? '';
    expect(text).toContain('File');
    expect(text).toContain('Edit');
    expect(text).toContain('View');
  });

  it('contains formatting toolbar', () => {
    const el = render(createElement(WordProcessor, null));
    const toolbar = el.querySelector('.word-processor__toolbar');
    expect(toolbar).not.toBeNull();
    expect(toolbar?.getAttribute('role')).toBe('toolbar');
  });

  it('contains ruler bar', () => {
    const el = render(createElement(WordProcessor, null));
    const ruler = el.querySelector('.word-processor__ruler');
    expect(ruler).not.toBeNull();
    expect(ruler?.getAttribute('aria-hidden')).toBe('true');
  });

  it('contains document area', () => {
    const el = render(createElement(WordProcessor, null));
    const docArea = el.querySelector('.word-processor__document-area');
    expect(docArea).not.toBeNull();
    expect(docArea?.tagName).toBe('MAIN');
  });

  it('shows placeholder text when no content', () => {
    const el = render(createElement(WordProcessor, null));
    const page = el.querySelector('.word-processor__page');
    expect(page?.textContent).toBe('Start typing...');
  });

  it('renders content prop in document area', () => {
    const el = render(createElement(WordProcessor, { content: 'Hello World document content' }));
    const page = el.querySelector('.word-processor__page');
    expect(page?.textContent).toBe('Hello World document content');
  });

  it('contains status bar', () => {
    const el = render(createElement(WordProcessor, null));
    const statusBar = el.querySelector('.word-processor__status-bar');
    expect(statusBar).not.toBeNull();
  });

  it('status bar shows word count', () => {
    const el = render(createElement(WordProcessor, { content: 'one two three four' }));
    const statusBar = el.querySelector('.word-processor__status-bar');
    expect(statusBar?.textContent).toContain('4 words');
  });

  it('applies className', () => {
    const el = render(createElement(WordProcessor, { className: 'my-wp' }));
    const root = el.querySelector('.word-processor');
    expect(root?.classList.contains('my-wp')).toBe(true);
  });

  it('document area has white background on the page', () => {
    const el = render(createElement(WordProcessor, null));
    const page = el.querySelector('.word-processor__page') as HTMLElement;
    // jsdom normalizes hex to rgb
    expect(page.style.backgroundColor).toBe('rgb(255, 255, 255)');
  });

  it('menu bar has menubar role', () => {
    const el = render(createElement(WordProcessor, null));
    const menuBar = el.querySelector('.word-processor__menu-bar');
    expect(menuBar?.getAttribute('role')).toBe('menubar');
  });

  it('toolbar contains Bold, Italic, Underline buttons', () => {
    const el = render(createElement(WordProcessor, null));
    const toolbar = el.querySelector('.word-processor__toolbar');
    const buttons = toolbar?.querySelectorAll('button');
    const labels = Array.from(buttons ?? []).map((b) => b.getAttribute('aria-label'));
    expect(labels).toContain('Bold');
    expect(labels).toContain('Italic');
    expect(labels).toContain('Underline');
  });

  it('status bar shows page info and zoom', () => {
    const el = render(createElement(WordProcessor, null));
    const statusBar = el.querySelector('.word-processor__status-bar');
    const text = statusBar?.textContent ?? '';
    expect(text).toContain('Page 1 of 1');
    expect(text).toContain('100%');
  });
});
