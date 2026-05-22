/**
 * Test that setState triggers actual DOM re-renders.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement } from '../../src/index';
import { useState } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('setState triggers re-render', () => {
  it('re-renders when setState is called and root.render is called again', () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(0);
      setCountFn = setCount;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    const element = createElement(Counter, null);
    root.render(element);
    expect(container.innerHTML).toBe('<span>0</span>');

    // Queue a state update and force re-render
    setCountFn!((prev: number) => prev + 1);
    root.render(element);
    expect(container.innerHTML).toBe('<span>1</span>');
  });

  it('re-renders asynchronously via scheduleRender', async () => {
    let setCountFn: ((v: number | ((p: number) => number)) => void) | undefined;

    function Counter() {
      const [count, setCount] = useState(0);
      setCountFn = setCount;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');

    // Call setState — should trigger async re-render
    setCountFn!(1);

    // Wait for microtask
    await new Promise((r) => setTimeout(r, 50));

    // Check if re-render happened
    expect(container.innerHTML).toBe('<span>1</span>');
  });
});
