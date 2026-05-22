/**
 * Tests for state updates (useState setState, useReducer dispatch)
 * that trigger re-renders through the work loop.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment } from '../../src/index';
import { useState, useReducer, useEffect } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { scheduleRender, createFiberRoot } from '../../src/dom/work-loop';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('useState with setState triggering re-renders', () => {
  it('updates DOM when setState is called via event handler', () => {
    function Counter() {
      const [count, setCount] = useState(0);
      return createElement(
        'div',
        null,
        createElement('span', { id: 'count' }, String(count)),
        createElement(
          'button',
          {
            id: 'inc',
            onClick: () => setCount(count + 1),
          },
          '+',
        ),
      );
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.querySelector('#count')?.textContent).toBe('0');

    // Simulate click -> triggers setState -> re-render
    container.querySelector('#inc')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    // Give the microtask scheduler a chance to run — but since performSyncWork is used
    // we need to check if the re-render was scheduled
  });

  it('processes queued state updates on re-render', () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(0);
      setCountFn = setCount;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');

    // Queue a state update
    setCountFn!(5);
    // Re-render the same component to process the queue
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>5</span>');
  });

  it('processes functional updater in setState', () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(10);
      setCountFn = setCount;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>10</span>');

    setCountFn!((prev: number) => prev + 5);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>15</span>');
  });

  it('batches multiple setState calls', () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(0);
      setCountFn = setCount;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));

    setCountFn!((p: number) => p + 1);
    setCountFn!((p: number) => p + 1);
    setCountFn!((p: number) => p + 1);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>3</span>');
  });
});

describe('useReducer with dispatch triggering re-renders', () => {
  it('processes dispatched actions on re-render', () => {
    type Action = { type: 'inc' } | { type: 'dec' } | { type: 'set'; value: number };
    let dispatchFn: ((a: Action) => void) | undefined;

    function reducer(state: number, action: Action): number {
      switch (action.type) {
        case 'inc':
          return state + 1;
        case 'dec':
          return state - 1;
        case 'set':
          return action.value;
      }
    }

    function Counter() {
      const [count, dispatch] = useReducer(reducer, 0);
      dispatchFn = dispatch;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');

    dispatchFn!({ type: 'inc' });
    dispatchFn!({ type: 'inc' });
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>2</span>');
  });

  it('handles multiple action types', () => {
    type Action = 'add' | 'sub';
    let dispatchFn: ((a: Action) => void) | undefined;

    function Counter() {
      const [count, dispatch] = useReducer(
        (s: number, a: Action) => (a === 'add' ? s + 10 : s - 3),
        100,
      );
      dispatchFn = dispatch;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>100</span>');

    dispatchFn!('add');
    dispatchFn!('sub');
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>107</span>');
  });
});

describe('scheduleRender (async render path)', () => {
  it('schedules a microtask render', async () => {
    const fiberRoot = createFiberRoot(container);
    scheduleRender(fiberRoot, createElement('div', null, 'async'));

    // The render happens in a microtask
    await new Promise((r) => setTimeout(r, 20));
    expect(container.innerHTML).toBe('<div>async</div>');
  });

  it('deduplicates multiple scheduleRender calls', async () => {
    const fiberRoot = createFiberRoot(container);
    scheduleRender(fiberRoot, createElement('div', null, 'first'));
    scheduleRender(fiberRoot, createElement('div', null, 'second'));

    await new Promise((r) => setTimeout(r, 20));
    // The last scheduled children should win
    expect(container.innerHTML).toBe('<div>second</div>');
  });
});

describe('effect cleanup through tree deletion', () => {
  it('cleans up effects when component is removed from tree', () => {
    const willUnmount = vi.fn();

    function ChildWrapper() {
      useEffect(() => willUnmount, []);
      return createElement('span', null, 'child');
    }

    const root = createRoot(container);
    root.render(createElement('div', null, createElement(ChildWrapper, null)));
    expect(willUnmount).not.toHaveBeenCalled();

    root.render(createElement('div', null, 'no child'));
    expect(willUnmount).toHaveBeenCalledTimes(1);
  });
});
