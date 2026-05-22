/**
 * Tests for remaining reconciler coverage gaps:
 * - createChild with invalid child type
 * - updateFromMap text and element paths
 * - placeChild with existing alternate
 * - deleteRemainingChildren with multiple siblings
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement, Fragment } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { useState } from '../../../src/hooks/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('reconciler — array child reconciliation edge cases', () => {
  it('handles array with mixed element types and nulls', async () => {
    let setItems: (v: (string | number | null)[]) => void;
    function App() {
      const [items, si] = useState<(string | number | null)[]>(['hello', 42, null, 'world']);
      setItems = si;
      return createElement(
        'div',
        null,
        ...items.map((item, i) =>
          item !== null ? createElement('span', { key: String(i) }, String(item)) : null,
        ),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('span').length).toBe(3);

    // Completely different set of items — triggers updateFromMap
    setItems!([null, 'new', 99]);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelectorAll('span').length).toBe(2);
    root.unmount();
  });

  it('handles growing array (new items at end)', async () => {
    let setCount: (v: number) => void;
    function App() {
      const [count, sc] = useState(2);
      setCount = sc;
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(createElement('li', { key: `k${i}` }, `item-${i}`));
      }
      return createElement('ul', null, ...items);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('li').length).toBe(2);

    setCount!(5);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelectorAll('li').length).toBe(5);
    root.unmount();
  });

  it('handles shrinking array (fewer items)', async () => {
    let setCount: (v: number) => void;
    function App() {
      const [count, sc] = useState(5);
      setCount = sc;
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(createElement('div', { key: `k${i}` }, `item-${i}`));
      }
      return createElement('div', null, ...items);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));

    setCount!(1);
    await new Promise((r) => setTimeout(r, 50));
    // 1 child div + the outer div
    expect(container.textContent).toBe('item-0');
    root.unmount();
  });

  it('handles reorder where oldFiber.index > newIdx', async () => {
    let setItems: (v: string[]) => void;
    function App() {
      const [items, si] = useState(['a', 'b', 'c', 'd', 'e']);
      setItems = si;
      return createElement('div', null, ...items.map((i) => createElement('span', { key: i }, i)));
    }
    const root = createRoot(container);
    root.render(createElement(App, null));

    // Move 'e' to position 0 — forces oldFiber.index > newIdx
    setItems!(['e', 'a', 'b', 'c', 'd']);
    await new Promise((r) => setTimeout(r, 50));
    const spans = container.querySelectorAll('span');
    expect(spans[0].textContent).toBe('e');
    expect(spans[4].textContent).toBe('d');
    root.unmount();
  });

  it('handles text children interleaved with elements', () => {
    const root = createRoot(container);
    root.render(
      createElement('div', null, 'before', createElement('span', null, 'middle'), 'after'),
    );
    expect(container.textContent).toBe('beforemiddleafter');
    root.unmount();
  });

  it('handles single child replacement (key match, type differs)', async () => {
    let setUseSpan: (v: boolean) => void;
    function App() {
      const [useSpan, su] = useState(false);
      setUseSpan = su;
      return createElement(
        'section',
        null,
        useSpan
          ? createElement('span', { key: 'child' }, 'span-content')
          : createElement('div', { key: 'child' }, 'div-content'),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('section div')).toBeTruthy();

    setUseSpan!(true);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('section span')).toBeTruthy();
    root.unmount();
  });
});
