// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Load/stress tests for the SpecifyJS rendering pipeline.
 * These tests verify the framework doesn't crash, hang, or produce incorrect
 * output under heavy load. They use realistic component patterns, not synthetic
 * microbenchmarks.
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement, Fragment, createContext } from '../../src/index';
import { useState, useEffect, useMemo, useCallback, useContext } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/index';

describe('Load/Stress Tests', { timeout: 30000 }, () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it('mounts 10,000 elements without hanging', () => {
    const items = Array.from({ length: 10_000 }, (_, i) =>
      createElement('div', { key: String(i), className: 'item' }, `Item ${i}`),
    );
    const App = () => createElement('div', { id: 'root-list' }, ...items);

    const root = createRoot(container);
    root.render(createElement(App, null));

    const rendered = container.querySelectorAll('.item');
    expect(rendered.length).toBe(10_000);

    // Verify first and last items are correct
    expect(rendered[0].textContent).toBe('Item 0');
    expect(rendered[9999].textContent).toBe('Item 9999');
  });

  it('reconciles 10,000 keyed items after reversal', () => {
    const indices = Array.from({ length: 10_000 }, (_, i) => i);

    const App = (props: { order: number[] }) =>
      createElement(
        'ul',
        null,
        ...props.order.map((i) =>
          createElement('li', { key: String(i), 'data-idx': String(i) }, `Item ${i}`),
        ),
      );

    const root = createRoot(container);

    // Initial render
    root.render(createElement(App, { order: indices }));
    expect(container.querySelectorAll('li').length).toBe(10_000);

    // Verify initial order
    const firstBefore = container.querySelector('li');
    expect(firstBefore?.textContent).toBe('Item 0');

    // Reverse the list (worst case for reconciliation)
    const reversed = [...indices].reverse();
    root.render(createElement(App, { order: reversed }));

    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(10_000);

    // Verify reversed order
    expect(lis[0].textContent).toBe('Item 9999');
    expect(lis[9999].textContent).toBe('Item 0');
    expect(lis[0].getAttribute('data-idx')).toBe('9999');
    expect(lis[9999].getAttribute('data-idx')).toBe('0');
  });

  it('mounts 1,000 function components with their own state', () => {
    function StatefulItem(props: { index: number }) {
      const [value] = useState(`state-${props.index}`);
      return createElement('div', { className: 'stateful' }, value);
    }

    const items = Array.from({ length: 1_000 }, (_, i) =>
      createElement(StatefulItem, { key: String(i), index: i }),
    );
    const App = () => createElement('div', null, ...items);

    const root = createRoot(container);
    root.render(createElement(App, null));

    const rendered = container.querySelectorAll('.stateful');
    expect(rendered.length).toBe(1_000);

    // Verify each component rendered with its own state
    expect(rendered[0].textContent).toBe('state-0');
    expect(rendered[500].textContent).toBe('state-500');
    expect(rendered[999].textContent).toBe('state-999');
  });

  it('propagates context through 100 levels to 50 consumers', () => {
    const ThemeCtx = createContext('default-theme');

    // Consumer component that reads context and renders the value
    function Consumer(props: { id: number }) {
      const theme = useContext(ThemeCtx);
      return createElement('span', { className: 'consumer', 'data-id': String(props.id) }, theme);
    }

    // Build a 100-level deep tree with consumers placed at various depths
    // Place consumers at every other level (50 consumers total)
    const consumerDepths = new Set(Array.from({ length: 50 }, (_, i) => i * 2));

    let tree: ReturnType<typeof createElement> = createElement('span', null, 'leaf');
    for (let depth = 99; depth >= 0; depth--) {
      const children: ReturnType<typeof createElement>[] = [tree];
      if (consumerDepths.has(depth)) {
        children.push(createElement(Consumer, { key: `consumer-${depth}`, id: depth }));
      }
      tree = createElement(
        'div',
        { key: `level-${depth}`, 'data-depth': String(depth) },
        ...children,
      );
    }

    const App = () =>
      createElement(ThemeCtx.Provider as unknown as () => null, { value: 'dark-mode' }, tree);

    const root = createRoot(container);
    root.render(createElement(App, null));

    const consumers = container.querySelectorAll('.consumer');
    expect(consumers.length).toBe(50);

    // Verify all consumers received the provided context value
    consumers.forEach((el) => {
      expect(el.textContent).toBe('dark-mode');
    });
  });

  it('handles rapid setState cascade with correct final state', () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(0);
      setCountFn = setCount;
      return createElement('span', { id: 'counter' }, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.querySelector('#counter')?.textContent).toBe('0');

    // Call setState 100 times with functional updater to accumulate
    for (let i = 0; i < 100; i++) {
      setCountFn!((prev: number) => prev + 1);
    }

    // Re-render to process all queued updates
    root.render(createElement(Counter, null));

    // The final state should reflect all 100 increments
    // (framework should batch them, final result = 100)
    const counterText = container.querySelector('#counter')?.textContent;
    expect(counterText).toBe('100');
  });

  it('renders 5,000 items across 100 Fragments without wrapper elements', () => {
    const FRAGMENT_COUNT = 100;
    const ITEMS_PER_FRAGMENT = 50;

    const fragments = Array.from({ length: FRAGMENT_COUNT }, (_, fragIdx) => {
      const items = Array.from({ length: ITEMS_PER_FRAGMENT }, (_, itemIdx) => {
        const globalIdx = fragIdx * ITEMS_PER_FRAGMENT + itemIdx;
        return createElement(
          'span',
          { key: String(globalIdx), className: 'frag-item' },
          String(globalIdx),
        );
      });
      return createElement(Fragment, { key: `frag-${fragIdx}` }, ...items);
    });

    const App = () => createElement('div', { id: 'frag-root' }, ...fragments);

    const root = createRoot(container);
    root.render(createElement(App, null));

    const rendered = container.querySelectorAll('.frag-item');
    expect(rendered.length).toBe(5_000);

    // Verify Fragments don't insert wrapper elements
    const fragRoot = container.querySelector('#frag-root');
    expect(fragRoot).not.toBeNull();

    // All span children should be direct children of #frag-root, not wrapped
    const directChildren = fragRoot!.children;
    expect(directChildren.length).toBe(5_000);
    for (let i = 0; i < directChildren.length; i++) {
      expect(directChildren[i].tagName).toBe('SPAN');
    }

    // Spot-check content
    expect(rendered[0].textContent).toBe('0');
    expect(rendered[2500].textContent).toBe('2500');
    expect(rendered[4999].textContent).toBe('4999');
  });

  it('handles mount, unmount, and remount cycle for 5,000 elements', () => {
    function ItemList() {
      const items = Array.from({ length: 5_000 }, (_, i) =>
        createElement('li', { key: String(i), className: 'cycle-item' }, `Item ${i}`),
      );
      return createElement('ul', null, ...items);
    }

    const root = createRoot(container);

    // First mount
    root.render(createElement(ItemList, null));
    expect(container.querySelectorAll('.cycle-item').length).toBe(5_000);
    expect(container.querySelector('.cycle-item')?.textContent).toBe('Item 0');

    // Unmount by rendering null
    root.render(null);
    expect(container.querySelectorAll('.cycle-item').length).toBe(0);
    expect(container.innerHTML).toBe('');

    // Remount — should work identically to first mount (no leaked state)
    root.render(createElement(ItemList, null));
    const remounted = container.querySelectorAll('.cycle-item');
    expect(remounted.length).toBe(5_000);
    expect(remounted[0].textContent).toBe('Item 0');
    expect(remounted[4999].textContent).toBe('Item 4999');
  });

  it('renders 200 levels of nested function components without stack overflow', () => {
    // Build a chain of 200 function components, each wrapping the next.
    // The framework should use iterative traversal, not recursion,
    // so this should not cause a stack overflow.

    function Leaf() {
      return createElement('span', { id: 'deep-leaf' }, 'reached-bottom');
    }

    // Create wrapper components iteratively
    const components: Array<(props: { children?: unknown }) => ReturnType<typeof createElement>> =
      [];
    components.push(Leaf);

    for (let i = 1; i < 200; i++) {
      const Inner = components[i - 1];
      const level = i;
      function Wrapper() {
        return createElement(
          'div',
          { 'data-level': String(level), className: 'nesting-level' },
          createElement(Inner, null),
        );
      }
      // Give each wrapper a displayName for debugging
      Object.defineProperty(Wrapper, 'name', { value: `Wrapper_${level}` });
      components.push(Wrapper);
    }

    const Outermost = components[components.length - 1];
    const App = () => createElement(Outermost, null);

    const root = createRoot(container);

    // This should not throw a stack overflow
    root.render(createElement(App, null));

    // Verify the leaf was reached
    const leaf = container.querySelector('#deep-leaf');
    expect(leaf).not.toBeNull();
    expect(leaf!.textContent).toBe('reached-bottom');

    // Verify all 199 wrapper levels are in the DOM (level 1-199)
    const levels = container.querySelectorAll('.nesting-level');
    expect(levels.length).toBe(199);
  });
});
