/**
 * Final push to 98% coverage: targets the specific remaining uncovered lines.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement, Fragment } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import { useState, useEffect } from '../../src/hooks/index';
import { updateDOMProperties } from '../../src/dom/work-loop';

let container: HTMLDivElement;
beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ─── reconciler: createChild returns null for invalid child types ──────
describe('reconciler — invalid child types', () => {
  it('handles boolean children (filtered out)', () => {
    const root = createRoot(container);
    // Booleans should be ignored (React behavior)
    root.render(createElement('div', null, true, false, 'visible'));
    expect(container.textContent).toBe('visible');
    root.unmount();
  });

  it('handles deeply nested fragments with mixed types', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        null,
        createElement(
          Fragment,
          null,
          'text1',
          createElement('span', null, 'el1'),
          null,
          createElement(Fragment, null, 'text2', createElement('em', null, 'el2')),
        ),
      ),
    );
    expect(container.textContent).toBe('text1el1text2el2');
    root.unmount();
  });
});

// ─── reconciler: updateFromMap returns null for invalid type ───────────
describe('reconciler — updateFromMap edge cases', () => {
  it('handles array child update where some items become invalid', async () => {
    let setItems: (v: unknown[]) => void;
    function App() {
      const [items, si] = useState<unknown[]>([
        createElement('div', { key: 'a' }, 'A'),
        createElement('div', { key: 'b' }, 'B'),
        createElement('div', { key: 'c' }, 'C'),
      ]);
      setItems = si;
      return createElement('div', null, ...(items as any[]));
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('div').length).toBe(4); // outer + 3

    // Remove middle item and add text — forces map-based reconciliation
    setItems!([
      createElement('div', { key: 'c' }, 'C'),
      'text-node',
      createElement('div', { key: 'a' }, 'A-updated'),
    ]);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('C');
    expect(container.textContent).toContain('text-node');
    expect(container.textContent).toContain('A-updated');
    root.unmount();
  });
});

// ─── work-loop: getHostSibling traversal ──────────────────────────────
describe('work-loop — insertion ordering edge cases', () => {
  it('correctly orders children when inserting before component siblings', async () => {
    function Child({ text }: { text: string }) {
      return createElement('span', null, text);
    }

    let setItems: (v: string[]) => void;
    function App() {
      const [items, si] = useState(['B', 'C']);
      setItems = si;
      return createElement(
        'div',
        null,
        ...items.map((i) => createElement(Child, { key: i, text: i })),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('span').length).toBe(2);

    // Insert 'A' at the beginning — needs getHostSibling to find existing 'B' span
    setItems!(['A', 'B', 'C']);
    await new Promise((r) => setTimeout(r, 50));
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(3);
    expect(spans[0].textContent).toBe('A');
    root.unmount();
  });

  it('handles deletion of component between host siblings', async () => {
    function Middle() {
      return createElement('em', null, 'middle');
    }

    let setShow: (v: boolean) => void;
    function App() {
      const [show, s] = useState(true);
      setShow = s;
      return createElement(
        'div',
        null,
        createElement('span', null, 'first'),
        show ? createElement(Middle, null) : null,
        createElement('span', null, 'last'),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('em')).toBeTruthy();

    setShow!(false);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('em')).toBeNull();
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('first');
    expect(spans[1].textContent).toBe('last');
    root.unmount();
  });
});

// ─── work-loop: updateDOMProperties — event removal ──────────────────
describe('updateDOMProperties — event edge cases', () => {
  it('removes event listener when value is null/undefined', () => {
    const el = document.createElement('div');
    const handler = vi.fn();
    updateDOMProperties(el, {}, { onClick: handler });
    el.click();
    expect(handler).toHaveBeenCalledTimes(1);

    // Remove the handler
    updateDOMProperties(el, { onClick: handler }, { onClick: null });
    el.click();
    expect(handler).toHaveBeenCalledTimes(1); // Not called again
  });
});

// ─── scheduler: scheduleMicrotask ─────────────────────────────────────
describe('scheduler — scheduleMicrotask via render', () => {
  it('state updates re-render asynchronously via microtask', async () => {
    let setText: (v: string) => void;
    function App() {
      const [text, st] = useState('initial');
      setText = st;
      return createElement('div', null, text);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.textContent).toBe('initial');

    setText!('updated');
    // Not updated synchronously
    expect(container.textContent).toBe('initial');
    // But updated after microtask flush
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe('updated');
    root.unmount();
  });
});

// ─── reconciler: placeChild with alternate (no movement) ──────────────
describe('reconciler — placeChild stable position', () => {
  it('does not move items that are already in correct position', async () => {
    let setItems: (v: string[]) => void;
    function App() {
      const [items, si] = useState(['a', 'b', 'c']);
      setItems = si;
      return createElement('ul', null, ...items.map((i) => createElement('li', { key: i }, i)));
    }
    const root = createRoot(container);
    root.render(createElement(App, null));

    // Update with same order but different content
    setItems!(['a', 'b', 'c']);
    await new Promise((r) => setTimeout(r, 50));
    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(3);
    expect(lis[0].textContent).toBe('a');
    root.unmount();
  });
});

// ─── work-loop: HostComponent update (re-render existing DOM) ─────────
describe('work-loop — DOM node updates', () => {
  it('updates props on existing DOM elements', async () => {
    let setColor: (v: string) => void;
    function App() {
      const [color, sc] = useState('red');
      setColor = sc;
      return createElement('div', { style: { color } }, 'styled');
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('div')!.style.color).toBe('red');

    setColor!('blue');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('div')!.style.color).toBe('blue');
    root.unmount();
  });
});
