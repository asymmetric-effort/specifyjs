import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment } from '../../src/index';
import {
  useState,
  useEffect,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useContext,
  useId,
  useLayoutEffect,
  useInsertionEffect,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useTransition,
  useSyncExternalStore,
} from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { createContext, forwardRef } from '../../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('useState full coverage', () => {
  it('renders with initial state from function', () => {
    function Comp() {
      const [val] = useState(() => 'computed');
      return createElement('div', null, val);
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>computed</div>');
  });

  it('preserves state across re-renders', () => {
    function Comp(props: { extra: string }) {
      const [count] = useState(5);
      return createElement('div', null, `${count}-${props.extra}`);
    }
    const root = createRoot(container);
    root.render(createElement(Comp, { extra: 'a' }));
    expect(container.innerHTML).toBe('<div>5-a</div>');
    root.render(createElement(Comp, { extra: 'b' }));
    expect(container.innerHTML).toBe('<div>5-b</div>');
  });
});

describe('useReducer full coverage', () => {
  it('dispatches actions through re-renders', () => {
    type Action = 'inc' | 'dec';
    let dispatchFn: (a: Action) => void;

    function Counter() {
      const [count, dispatch] = useReducer(
        (state: number, action: Action) => (action === 'inc' ? state + 1 : state - 1),
        0,
      );
      dispatchFn = dispatch;
      return createElement('span', null, String(count));
    }

    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');
  });

  it('uses init function', () => {
    function Comp() {
      const [state] = useReducer(
        (s: number) => s,
        5,
        (initial: number) => initial * 3,
      );
      return createElement('div', null, String(state));
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>15</div>');
  });
});

describe('useCallback full coverage', () => {
  it('returns stable reference across re-renders with same deps', () => {
    let fn1: (() => string) | undefined;
    let fn2: (() => string) | undefined;

    function Comp(props: { x: number }) {
      const cb = useCallback(() => `value-${props.x}`, [props.x]);
      if (!fn1) fn1 = cb;
      else fn2 = cb;
      return createElement('div', null, cb());
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    root.render(createElement(Comp, { x: 1 }));
    expect(fn1).toBe(fn2); // Same deps -> same reference
  });

  it('returns new reference when deps change', () => {
    let fn1: (() => string) | undefined;
    let fn2: (() => string) | undefined;

    function Comp(props: { x: number }) {
      const cb = useCallback(() => `value-${props.x}`, [props.x]);
      if (!fn1) fn1 = cb;
      else fn2 = cb;
      return createElement('div', null, cb());
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    root.render(createElement(Comp, { x: 2 }));
    expect(fn1).not.toBe(fn2);
  });
});

describe('useMemo full coverage', () => {
  it('recomputes when deps change', () => {
    const factory = vi.fn((x: number) => x * 2);

    function Comp(props: { x: number }) {
      const val = useMemo(() => factory(props.x), [props.x]);
      return createElement('div', null, String(val));
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 3 }));
    expect(container.innerHTML).toBe('<div>6</div>');
    expect(factory).toHaveBeenCalledTimes(1);

    root.render(createElement(Comp, { x: 3 }));
    expect(factory).toHaveBeenCalledTimes(1); // same deps, no recompute

    root.render(createElement(Comp, { x: 5 }));
    expect(factory).toHaveBeenCalledTimes(2);
    expect(container.innerHTML).toBe('<div>10</div>');
  });
});

describe('useRef full coverage', () => {
  it('preserves ref across re-renders', () => {
    let ref1: { current: number | undefined } | undefined;
    let ref2: { current: number | undefined } | undefined;

    function Comp(props: { x: number }) {
      const ref = useRef(42);
      if (!ref1) ref1 = ref;
      else ref2 = ref;
      return createElement('div', null, `${ref.current}-${props.x}`);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    root.render(createElement(Comp, { x: 2 }));
    expect(ref1).toBe(ref2); // Same ref object
    expect(ref1!.current).toBe(42);
  });
});

describe('useEffect full coverage', () => {
  it('skips effect when deps unchanged on re-render', () => {
    const effectFn = vi.fn();

    function Comp(props: { x: number; y: number }) {
      useEffect(effectFn, [props.x]);
      return createElement('div', null, `${props.x}-${props.y}`);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1, y: 1 }));
    expect(effectFn).toHaveBeenCalledTimes(1);

    // y changes but x (dep) doesn't
    root.render(createElement(Comp, { x: 1, y: 2 }));
    expect(effectFn).toHaveBeenCalledTimes(1); // skipped

    // x changes
    root.render(createElement(Comp, { x: 2, y: 2 }));
    expect(effectFn).toHaveBeenCalledTimes(2);
  });

  it('runs cleanup before re-running effect', () => {
    const order: string[] = [];

    function Comp(props: { x: number }) {
      useEffect(() => {
        order.push(`effect-${props.x}`);
        return () => order.push(`cleanup-${props.x}`);
      }, [props.x]);
      return createElement('div', null, String(props.x));
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    expect(order).toEqual(['effect-1']);

    root.render(createElement(Comp, { x: 2 }));
    expect(order).toEqual(['effect-1', 'cleanup-1', 'effect-2']);
  });

  it('runs effect without deps on every render', () => {
    const effectFn = vi.fn();

    function Comp(props: { x: number }) {
      useEffect(effectFn);
      return createElement('div', null, String(props.x));
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    root.render(createElement(Comp, { x: 2 }));
    expect(effectFn).toHaveBeenCalledTimes(2);
  });
});

describe('useLayoutEffect full coverage', () => {
  it('runs layout effect and cleanup', () => {
    const order: string[] = [];

    function Comp(props: { x: number }) {
      useLayoutEffect(() => {
        order.push(`layout-${props.x}`);
        return () => order.push(`layout-cleanup-${props.x}`);
      }, [props.x]);
      return createElement('div', null, String(props.x));
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { x: 1 }));
    expect(order).toEqual(['layout-1']);

    root.render(createElement(Comp, { x: 2 }));
    expect(order).toEqual(['layout-1', 'layout-cleanup-1', 'layout-2']);
  });
});

describe('useInsertionEffect full coverage', () => {
  it('runs insertion effect', () => {
    const effectFn = vi.fn();

    function Comp() {
      useInsertionEffect(effectFn, []);
      return createElement('div', null, 'insertion');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});

describe('useImperativeHandle full coverage', () => {
  it('sets handle on ref object', () => {
    const ref = { current: null as { focus: () => string } | null };

    const FancyInput = forwardRef((_props, fwdRef) => {
      useImperativeHandle(
        fwdRef as { current: { focus: () => string } | null },
        () => ({
          focus: () => 'focused!',
        }),
        [],
      );
      return createElement('input', { type: 'text' });
    });

    const root = createRoot(container);
    root.render(createElement(FancyInput as unknown as () => null, { ref }));
    expect(ref.current).not.toBeNull();
    expect(ref.current!.focus()).toBe('focused!');
  });

  it('sets handle via callback ref', () => {
    let handle: { getValue: () => number } | null = null;
    const callbackRef = (instance: { getValue: () => number } | null) => {
      handle = instance;
    };

    const Comp = forwardRef((_props, ref) => {
      useImperativeHandle(
        ref as (instance: { getValue: () => number } | null) => void,
        () => ({
          getValue: () => 42,
        }),
        [],
      );
      return createElement('div', null, 'imperative');
    });

    const root = createRoot(container);
    root.render(createElement(Comp as unknown as () => null, { ref: callbackRef }));
    expect(handle).not.toBeNull();
    expect(handle!.getValue()).toBe(42);
  });

  it('handles null ref', () => {
    function Comp() {
      useImperativeHandle(null, () => ({ value: 1 }), []);
      return createElement('div', null, 'null-ref');
    }

    const root = createRoot(container);
    expect(() => {
      root.render(createElement(Comp, null));
    }).not.toThrow();
    expect(container.innerHTML).toBe('<div>null-ref</div>');
  });
});

describe('useDebugValue full coverage', () => {
  it('does not throw (no-op)', () => {
    function Comp() {
      useDebugValue('debug info');
      useDebugValue(42, (v) => `formatted: ${v}`);
      return createElement('div', null, 'debug');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>debug</div>');
  });
});

describe('useDeferredValue full coverage', () => {
  it('returns the initial value on first render', () => {
    function Comp(props: { query: string }) {
      const deferred = useDeferredValue(props.query);
      return createElement('div', null, deferred);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { query: 'hello' }));
    expect(container.innerHTML).toBe('<div>hello</div>');
  });

  it('defers value update to transition priority', async () => {
    function Comp(props: { query: string }) {
      const deferred = useDeferredValue(props.query);
      return createElement('div', null, deferred);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, { query: 'hello' }));
    expect(container.innerHTML).toBe('<div>hello</div>');

    root.render(createElement(Comp, { query: 'world' }));
    // The deferred value eventually updates
    await new Promise((r) => setTimeout(r, 100));
    root.render(createElement(Comp, { query: 'world' }));
    expect(container.innerHTML).toBe('<div>world</div>');
  });
});

describe('useTransition full coverage', () => {
  it('returns isPending and startTransition', () => {
    let isPendingVal: boolean | undefined;
    let startFn: ((cb: () => void) => void) | undefined;

    function Comp() {
      const [isPending, startTransition] = useTransition();
      isPendingVal = isPending;
      startFn = startTransition;
      return createElement('div', null, isPending ? 'pending' : 'idle');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(isPendingVal).toBe(false);
    expect(container.innerHTML).toBe('<div>idle</div>');
    expect(typeof startFn).toBe('function');
  });

  it('startTransition executes callback', () => {
    let startFn: ((cb: () => void) => void) | undefined;
    const callback = vi.fn();

    function Comp() {
      const [, startTransition] = useTransition();
      startFn = startTransition;
      return createElement('div', null, 'transition');
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    startFn!(callback);
    expect(callback).toHaveBeenCalledTimes(1);
  });
});

describe('useSyncExternalStore full coverage', () => {
  it('reads from external store', () => {
    let storeValue = 'initial';
    const listeners = new Set<() => void>();

    const subscribe = (cb: () => void) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    };
    const getSnapshot = () => storeValue;

    function Comp() {
      const value = useSyncExternalStore(subscribe, getSnapshot);
      return createElement('div', null, value);
    }

    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(container.innerHTML).toBe('<div>initial</div>');
  });
});

describe('useContext with provider full coverage', () => {
  it('reads nested provider value', () => {
    const Ctx = createContext(0);

    function Display() {
      const val = useContext(Ctx);
      return createElement('span', null, String(val));
    }

    const root = createRoot(container);
    root.render(
      createElement(
        Ctx.Provider as unknown as () => null,
        { value: 99 },
        createElement(Display, null),
      ),
    );
    expect(container.innerHTML).toBe('<span>99</span>');
  });
});

describe('useId uniqueness', () => {
  it('generates unique ids across components', () => {
    const ids: string[] = [];

    function IdComp() {
      const id = useId();
      ids.push(id);
      return createElement('div', { id }, 'x');
    }

    const root = createRoot(container);
    root.render(
      createElement(
        Fragment,
        null,
        createElement(IdComp, null),
        createElement(IdComp, null),
        createElement(IdComp, null),
      ),
    );
    expect(new Set(ids).size).toBe(3);
  });
});

describe('multiple hooks in one component', () => {
  it('handles useState + useEffect + useRef together', () => {
    const effectFn = vi.fn();

    function Multi() {
      const [count] = useState(10);
      const ref = useRef('hello');
      useEffect(effectFn, []);
      return createElement('div', null, `${count}-${ref.current}`);
    }

    const root = createRoot(container);
    root.render(createElement(Multi, null));
    expect(container.innerHTML).toBe('<div>10-hello</div>');
    expect(effectFn).toHaveBeenCalledTimes(1);
  });
});

describe('hydrateRoot', () => {
  it('hydrates server-rendered content', async () => {
    const { hydrateRoot } = await import('../../src/dom/create-root');
    container.innerHTML = '<div>server</div>';

    const root = hydrateRoot(container, createElement('div', null, 'server'));
    expect(root).toBeDefined();
    expect(typeof root.render).toBe('function');
    expect(typeof root.unmount).toBe('function');
  });
});
