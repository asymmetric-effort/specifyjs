// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import {
  resetComponentRegistry,
  setComponentIdsEnabled,
} from '../../src/shared/component-registry';

function render(vnode: unknown): { container: HTMLElement; root: ReturnType<typeof createRoot> } {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return { container, root };
}

describe('Component IDs', () => {
  beforeEach(() => {
    setComponentIdsEnabled(true);
    resetComponentRegistry();
  });

  afterEach(() => {
    setComponentIdsEnabled(false);
  });

  it('assigns compact IDs to DOM elements', () => {
    function MyButton() {
      return createElement('button', null, 'Click');
    }
    const { container } = render(createElement(MyButton, null));
    const button = container.querySelector('button');
    expect(button).toBeTruthy();
    expect(button!.getAttribute('data-cid')).toMatch(/^s-\d+-\d+$/);
  });

  it('preserves user-provided id and still assigns data-cid', () => {
    function MyButton() {
      return createElement('button', { id: 'my-custom-id' }, 'Click');
    }
    const { container } = render(createElement(MyButton, null));
    const button = container.querySelector('button');
    expect(button!.id).toBe('my-custom-id');
    expect(button!.getAttribute('data-cid')).toMatch(/^s-\d+-\d+$/);
  });

  it('assigns different IDs to different instances', () => {
    function Item() {
      return createElement('li', null, 'item');
    }
    const { container } = render(
      createElement(
        'ul',
        null,
        createElement(Item, null),
        createElement(Item, null),
        createElement(Item, null),
      ),
    );
    const items = container.querySelectorAll('li');
    expect(items.length).toBe(3);
    const ids = Array.from(items).map((el) => el.getAttribute('data-cid'));
    // All should have unique IDs
    expect(new Set(ids).size).toBe(3);
    // All should follow the compact format
    ids.forEach((id) => expect(id).toMatch(/^s-\d+-\d+$/));
  });

  it('populates __SPECIFYJS_COMPONENTS__ global lookup', () => {
    function Card() {
      return createElement('div', null, 'card');
    }
    render(createElement(Card, null));
    const lookup = (globalThis as unknown as Record<string, unknown>)
      .__SPECIFYJS_COMPONENTS__ as Record<number, string>;
    expect(lookup).toBeTruthy();
    // Should contain at least one entry
    expect(Object.keys(lookup).length).toBeGreaterThan(0);
  });
});
