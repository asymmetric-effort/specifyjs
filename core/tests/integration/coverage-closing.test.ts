/**
 * Integration tests targeting remaining coverage gaps across multiple modules.
 * Exercises: reconciler edge cases, work-loop commit paths, synthetic events,
 * and scheduler edge cases through full render cycles.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement, Fragment } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import {
  useState,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  useRef,
  useId,
  useTransition,
  useDeferredValue,
  useImperativeHandle,
} from '../../src/hooks/index';
import { forwardRef } from '../../src/core/forward-ref';
import { memo } from '../../src/core/memo';
import { Component } from '../../src/components/component';
import { scheduleMicrotask } from '../../src/core/scheduler';
import {
  createSyntheticEvent,
  SyntheticTouchEvent,
  SyntheticWheelEvent,
} from '../../src/dom/synthetic-event';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ─── Reconciler: keyed list reordering ────────────────────────────────
describe('reconciler — keyed list operations', () => {
  it('handles key mismatch (delete old, create new)', async () => {
    let setItems: (items: string[]) => void;
    function List() {
      const [items, si] = useState(['a', 'b', 'c']);
      setItems = si;
      return createElement('ul', null, ...items.map((i) => createElement('li', { key: i }, i)));
    }
    const root = createRoot(container);
    root.render(createElement(List, null));
    expect(container.querySelectorAll('li').length).toBe(3);

    // Replace with completely different keys
    setItems!(['x', 'y']);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelectorAll('li').length).toBe(2);
    expect(container.textContent).toContain('x');
    expect(container.textContent).toContain('y');
    root.unmount();
  });

  it('handles list reordering (moves)', async () => {
    let setItems: (items: string[]) => void;
    function List() {
      const [items, si] = useState(['a', 'b', 'c']);
      setItems = si;
      return createElement('ul', null, ...items.map((i) => createElement('li', { key: i }, i)));
    }
    const root = createRoot(container);
    root.render(createElement(List, null));

    // Reverse the order
    setItems!(['c', 'b', 'a']);
    await new Promise((r) => setTimeout(r, 50));
    const lis = container.querySelectorAll('li');
    expect(lis[0].textContent).toBe('c');
    expect(lis[2].textContent).toBe('a');
    root.unmount();
  });

  it('handles inserting items into middle of list', async () => {
    let setItems: (items: string[]) => void;
    function List() {
      const [items, si] = useState(['a', 'c']);
      setItems = si;
      return createElement('ul', null, ...items.map((i) => createElement('li', { key: i }, i)));
    }
    const root = createRoot(container);
    root.render(createElement(List, null));

    setItems!(['a', 'b', 'c']);
    await new Promise((r) => setTimeout(r, 50));
    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(3);
    expect(lis[1].textContent).toBe('b');
    root.unmount();
  });

  it('handles replacing element type at same position', async () => {
    let setUseSpan: (v: boolean) => void;
    function App() {
      const [useSpan, s] = useState(false);
      setUseSpan = s;
      return useSpan
        ? createElement('span', { key: 'item' }, 'span')
        : createElement('div', { key: 'item' }, 'div');
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('div')).toBeTruthy();

    setUseSpan!(true);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('span')).toBeTruthy();
    expect(container.querySelector('div')).toBeNull();
    root.unmount();
  });

  it('handles text node replacement with element', async () => {
    let setMode: (v: string) => void;
    function App() {
      const [mode, s] = useState('text');
      setMode = s;
      return mode === 'text'
        ? createElement('div', null, 'just text')
        : createElement('div', null, createElement('span', null, 'element'));
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.textContent).toBe('just text');

    setMode!('element');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('span')).toBeTruthy();
    root.unmount();
  });
});

// ─── Memo component bail-out ──────────────────────────────────────────
describe('memo bail-out and custom compare', () => {
  it('bails out with shallow equal props', async () => {
    const renderSpy = vi.fn();
    const MemoComp = memo(function Inner(props: { value: number }) {
      renderSpy();
      return createElement('span', null, String(props.value));
    });

    let forceUpdate: () => void;
    function App() {
      const [, setCount] = useState(0);
      forceUpdate = () => setCount((c) => c + 1);
      return createElement(MemoComp, { value: 42 });
    }

    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    forceUpdate!();
    await new Promise((r) => setTimeout(r, 50));
    // Same props, should bail out
    expect(renderSpy).toHaveBeenCalledTimes(1);
    root.unmount();
  });

  it('re-renders when props change', async () => {
    const renderSpy = vi.fn();
    const MemoComp = memo(function Inner(props: { value: number }) {
      renderSpy();
      return createElement('span', null, String(props.value));
    });

    let setVal: (v: number) => void;
    function App() {
      const [val, sv] = useState(1);
      setVal = sv;
      return createElement(MemoComp, { value: val });
    }

    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(renderSpy).toHaveBeenCalledTimes(1);

    setVal!(2);
    await new Promise((r) => setTimeout(r, 50));
    expect(renderSpy).toHaveBeenCalledTimes(2);
    root.unmount();
  });
});

// ─── ForwardRef with useImperativeHandle ──────────────────────────────
describe('forwardRef + useImperativeHandle', () => {
  it('exposes imperative handle via ref', () => {
    const FancyInput = forwardRef((props: {}, ref: any) => {
      useImperativeHandle(ref, () => ({ focus: () => 'focused' }));
      return createElement('input', { type: 'text' });
    });

    const ref = { current: null as any };
    const root = createRoot(container);
    root.render(createElement(FancyInput, { ref }));
    expect(ref.current).toBeTruthy();
    expect(ref.current.focus()).toBe('focused');
    root.unmount();
  });
});

// ─── Synthetic event creation ─────────────────────────────────────────
describe('synthetic events — touch and wheel', () => {
  it('creates SyntheticEvent for generic events', () => {
    const ev = new Event('custom');
    const synth = createSyntheticEvent(ev);
    expect(synth.type).toBe('custom');
  });

  it('creates SyntheticWheelEvent for wheel events', () => {
    const ev = new WheelEvent('wheel', { deltaX: 10, deltaY: 20 });
    const synth = createSyntheticEvent(ev);
    expect(synth).toBeInstanceOf(SyntheticWheelEvent);
    expect((synth as SyntheticWheelEvent).deltaX).toBe(10);
  });
});

// ─── scheduleMicrotask ────────────────────────────────────────────────
describe('scheduleMicrotask', () => {
  it('runs callback asynchronously', async () => {
    let ran = false;
    scheduleMicrotask(() => {
      ran = true;
    });
    expect(ran).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(ran).toBe(true);
  });
});

// ─── useId, useTransition, useDeferredValue via render ────────────────
describe('hooks via full render', () => {
  it('useId generates unique ids', () => {
    function Comp() {
      const id = useId();
      return createElement('div', { id }, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const id = container.querySelector('div')!.id;
    expect(id).toMatch(/^:l\d+:$/);
    root.unmount();
  });

  it('useTransition provides startTransition', () => {
    let startTransition: (cb: () => void) => void;
    function Comp() {
      const [isPending, st] = useTransition();
      startTransition = st;
      return createElement('div', null, isPending ? 'pending' : 'idle');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const called = vi.fn();
    startTransition!(called);
    expect(called).toHaveBeenCalled();
    root.unmount();
  });

  it('useDeferredValue returns the value', () => {
    let captured: string;
    function Comp() {
      const deferred = useDeferredValue('hello');
      captured = deferred;
      return createElement('div', null, deferred);
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(captured!).toBe('hello');
    root.unmount();
  });
});
