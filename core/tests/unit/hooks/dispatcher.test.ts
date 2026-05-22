/**
 * Unit tests for src/hooks/dispatcher.ts — all hook implementations.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  useStateImpl,
  useReducerImpl,
  useEffectDispatch,
  useLayoutEffectDispatch,
  useInsertionEffectDispatch,
  useContextImpl,
  useCallbackImpl,
  useMemoImpl,
  useRefImpl,
  useImperativeHandleImpl,
  useDebugValueImpl,
  useIdImpl,
  useDeferredValueImpl,
  useTransitionImpl,
  useSyncExternalStoreImpl,
  setRerenderCallback,
  resetIdCounter,
} from '../../../src/hooks/dispatcher';
import {
  setCurrentFiber,
  allocateHook,
  getEffectList,
  type EffectHook,
} from '../../../src/hooks/hook-state';
import { installDispatcher, uninstallDispatcher } from '../../../src/hooks/install-dispatcher';
import type { Fiber, SpecContext } from '../../../src/shared/types';
import { FiberTag, EffectTag } from '../../../src/shared/types';

function makeFiber(alternate: Fiber | null = null): Fiber {
  return {
    tag: FiberTag.FunctionComponent,
    type: null,
    key: null,
    ref: null,
    pendingProps: {},
    memoizedProps: null,
    memoizedState: null,
    stateNode: null,
    return: null,
    child: null,
    sibling: null,
    alternate,
    effectTag: EffectTag.NoEffect,
    updateQueue: null,
    dependencies: null,
    index: 0,
  };
}

/** Set up a fiber context for hook calls. */
function enterFiber(fiber: Fiber) {
  installDispatcher();
  setCurrentFiber(fiber);
}

function exitFiber() {
  setCurrentFiber(null);
  uninstallDispatcher();
}

/** Simulate a re-render: create a new fiber with alternate pointing to the old one. */
function rerender(oldFiber: Fiber): Fiber {
  exitFiber();
  const newFiber = makeFiber(oldFiber);
  enterFiber(newFiber);
  return newFiber;
}

beforeEach(() => {
  setRerenderCallback(null);
  resetIdCounter();
});

// ─── useState ─────────────────────────────────────────────────────────
describe('useStateImpl', () => {
  it('initializes with a value', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [state] = useStateImpl(42);
    expect(state).toBe(42);
    exitFiber();
  });

  it('initializes with a function', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [state] = useStateImpl(() => 99);
    expect(state).toBe(99);
    exitFiber();
  });

  it('returns stable state across re-renders when no updates', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [s1] = useStateImpl(10);
    exitFiber();

    const f2 = rerender(fiber);
    const [s2] = useStateImpl(10);
    expect(s2).toBe(10);
    exitFiber();
  });

  it('processes queued updates on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [, setState] = useStateImpl(0);
    exitFiber();

    // Enqueue an update
    setState(5);

    // Re-render should pick up the update
    const f2 = rerender(fiber);
    const [state2] = useStateImpl(0);
    expect(state2).toBe(5);
    exitFiber();
  });

  it('processes functional updates', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [, setState] = useStateImpl(10);
    exitFiber();

    setState((prev: number) => prev + 5);

    const f2 = rerender(fiber);
    const [state2] = useStateImpl(10);
    expect(state2).toBe(15);
    exitFiber();
  });

  it('setState calls scheduleUpdate when rerenderFiber is set', () => {
    const rerenderer = vi.fn();
    setRerenderCallback(rerenderer);

    const fiber = makeFiber();
    enterFiber(fiber);
    const [, setState] = useStateImpl(0);
    exitFiber();

    setState(1);
    // scheduleUpdate runs task synchronously when not batching
    expect(rerenderer).toHaveBeenCalledWith(fiber);
  });
});

// ─── useReducer ───────────────────────────────────────────────────────
describe('useReducerImpl', () => {
  const reducer = (state: number, action: { type: string; payload?: number }) => {
    switch (action.type) {
      case 'increment':
        return state + 1;
      case 'add':
        return state + (action.payload ?? 0);
      default:
        return state;
    }
  };

  it('initializes with initialArg', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [state] = useReducerImpl(reducer, 0);
    expect(state).toBe(0);
    exitFiber();
  });

  it('initializes with init function', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [state] = useReducerImpl(reducer, 10, (arg) => arg * 2);
    expect(state).toBe(20);
    exitFiber();
  });

  it('processes dispatched actions on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [, dispatch] = useReducerImpl(reducer, 0);
    exitFiber();

    dispatch({ type: 'increment' });
    dispatch({ type: 'add', payload: 5 });

    const f2 = rerender(fiber);
    const [state2] = useReducerImpl(reducer, 0);
    expect(state2).toBe(6);
    exitFiber();
  });

  it('dispatch triggers rerenderFiber', () => {
    const rerenderer = vi.fn();
    setRerenderCallback(rerenderer);

    const fiber = makeFiber();
    enterFiber(fiber);
    const [, dispatch] = useReducerImpl(reducer, 0);
    exitFiber();

    dispatch({ type: 'increment' });
    expect(rerenderer).toHaveBeenCalledWith(fiber);
  });
});

// ─── useEffect / useLayoutEffect / useInsertionEffect ─────────────────
describe('useEffect variants', () => {
  it('useEffectDispatch pushes a Passive effect', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const create = vi.fn();
    useEffectDispatch(create, [1]);
    const effects = getEffectList();
    expect(effects).not.toBeNull();
    expect(effects!.tag & 1).toBe(1); // HasEffect
    expect(effects!.tag & 4).toBe(4); // Passive
    exitFiber();
  });

  it('useLayoutEffectDispatch pushes a Layout effect', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    useLayoutEffectDispatch(vi.fn(), []);
    const effects = getEffectList();
    expect(effects!.tag & 2).toBe(2); // Layout
    exitFiber();
  });

  it('useInsertionEffectDispatch pushes an Insertion effect', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    useInsertionEffectDispatch(vi.fn(), []);
    const effects = getEffectList();
    expect(effects!.tag & 8).toBe(8); // Insertion
    exitFiber();
  });

  it('skips effect when deps are equal on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    useEffectDispatch(vi.fn(), [1, 2]);
    exitFiber();

    const f2 = rerender(fiber);
    useEffectDispatch(vi.fn(), [1, 2]);
    const effects = getEffectList();
    // Should have NoEffect tag (deps unchanged)
    expect(effects!.tag & 1).toBe(0); // No HasEffect
    exitFiber();
  });

  it('runs effect when deps change on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    useEffectDispatch(vi.fn(), [1]);
    exitFiber();

    const f2 = rerender(fiber);
    useEffectDispatch(vi.fn(), [2]);
    const effects = getEffectList();
    expect(effects!.tag & 1).toBe(1); // HasEffect
    exitFiber();
  });
});

// ─── useContext ────────────────────────────────────────────────────────
describe('useContextImpl', () => {
  it('returns the current context value', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const ctx: SpecContext<string> = {
      _currentValue: 'hello',
      Provider: null as any,
      Consumer: null as any,
    };
    const value = useContextImpl(ctx);
    expect(value).toBe('hello');
    exitFiber();
  });
});

// ─── useCallback ──────────────────────────────────────────────────────
describe('useCallbackImpl', () => {
  it('returns the callback on mount', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const fn = () => {};
    const result = useCallbackImpl(fn, [1]);
    expect(result).toBe(fn);
    exitFiber();
  });

  it('returns same ref when deps unchanged', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const fn1 = () => {};
    useCallbackImpl(fn1, [1]);
    exitFiber();

    const f2 = rerender(fiber);
    const fn2 = () => {};
    const result = useCallbackImpl(fn2, [1]);
    expect(result).toBe(fn1); // Same as first render
    exitFiber();
  });

  it('returns new ref when deps change', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const fn1 = () => {};
    useCallbackImpl(fn1, [1]);
    exitFiber();

    const f2 = rerender(fiber);
    const fn2 = () => {};
    const result = useCallbackImpl(fn2, [2]);
    expect(result).toBe(fn2);
    exitFiber();
  });
});

// ─── useMemo ──────────────────────────────────────────────────────────
describe('useMemoImpl', () => {
  it('computes value on mount', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const value = useMemoImpl(() => 42, []);
    expect(value).toBe(42);
    exitFiber();
  });

  it('returns cached value when deps unchanged', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const factory = vi.fn(() => ({ x: 1 }));
    const v1 = useMemoImpl(factory, [1]);
    exitFiber();

    const f2 = rerender(fiber);
    const v2 = useMemoImpl(factory, [1]);
    expect(v2).toBe(v1); // Same object ref
    expect(factory).toHaveBeenCalledTimes(1); // Not called again
    exitFiber();
  });

  it('recomputes when deps change', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const factory = vi.fn(() => ({ x: 1 }));
    const v1 = useMemoImpl(factory, [1]);
    exitFiber();

    const f2 = rerender(fiber);
    const v2 = useMemoImpl(factory, [2]);
    expect(v2).not.toBe(v1);
    expect(factory).toHaveBeenCalledTimes(2);
    exitFiber();
  });
});

// ─── useRef ───────────────────────────────────────────────────────────
describe('useRefImpl', () => {
  it('creates a ref with initial value', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const ref = useRefImpl(42);
    expect(ref.current).toBe(42);
    exitFiber();
  });

  it('returns same ref object on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const ref1 = useRefImpl(0);
    exitFiber();

    const f2 = rerender(fiber);
    const ref2 = useRefImpl(0);
    expect(ref2).toBe(ref1);
    exitFiber();
  });

  it('creates ref with undefined when no initial value', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const ref = useRefImpl();
    expect(ref.current).toBeUndefined();
    exitFiber();
  });
});

// ─── useImperativeHandle ──────────────────────────────────────────────
describe('useImperativeHandleImpl', () => {
  it('pushes a layout effect for object ref', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const ref = { current: null as { value: number } | null };
    useImperativeHandleImpl(ref, () => ({ value: 42 }), []);
    const effects = getEffectList();
    expect(effects).not.toBeNull();
    expect(effects!.tag & 2).toBe(2); // Layout
    exitFiber();
  });

  it('pushes a layout effect for callback ref', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const refFn = vi.fn();
    useImperativeHandleImpl(refFn, () => ({ value: 1 }), []);
    const effects = getEffectList();
    expect(effects).not.toBeNull();
    exitFiber();
  });

  it('handles null ref without error', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    expect(() => {
      useImperativeHandleImpl(null, () => ({ value: 1 }), []);
    }).not.toThrow();
    exitFiber();
  });
});

// ─── useDebugValue ────────────────────────────────────────────────────
describe('useDebugValueImpl', () => {
  it('is a no-op', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    expect(() => useDebugValueImpl('test')).not.toThrow();
    expect(() => useDebugValueImpl(42, (v) => `val: ${v}`)).not.toThrow();
    exitFiber();
  });
});

// ─── useId ────────────────────────────────────────────────────────────
describe('useIdImpl', () => {
  it('generates sequential IDs', () => {
    const f1 = makeFiber();
    enterFiber(f1);
    const id1 = useIdImpl();
    expect(id1).toBe(':l0:');
    exitFiber();

    const f2 = makeFiber();
    enterFiber(f2);
    const id2 = useIdImpl();
    expect(id2).toBe(':l1:');
    exitFiber();
  });

  it('returns stable ID on re-render', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const id1 = useIdImpl();
    exitFiber();

    const f2 = rerender(fiber);
    const id2 = useIdImpl();
    expect(id2).toBe(id1);
    exitFiber();
  });

  it('resetIdCounter resets sequence', () => {
    const f1 = makeFiber();
    enterFiber(f1);
    useIdImpl(); // :l0:
    exitFiber();

    resetIdCounter();

    const f2 = makeFiber();
    enterFiber(f2);
    const id = useIdImpl();
    expect(id).toBe(':l0:');
    exitFiber();
  });
});

// ─── useDeferredValue ─────────────────────────────────────────────────
describe('useDeferredValueImpl', () => {
  it('returns the value as-is', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const result = useDeferredValueImpl('hello');
    expect(result).toBe('hello');
    exitFiber();
  });
});

// ─── useTransition ────────────────────────────────────────────────────
describe('useTransitionImpl', () => {
  it('returns [false, startTransition]', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [isPending, startTransition] = useTransitionImpl();
    expect(isPending).toBe(false);
    expect(typeof startTransition).toBe('function');
    exitFiber();
  });

  it('startTransition executes the callback', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const [, startTransition] = useTransitionImpl();
    const cb = vi.fn();
    startTransition(cb);
    expect(cb).toHaveBeenCalledOnce();
    exitFiber();
  });
});

// ─── useSyncExternalStore ─────────────────────────────────────────────
describe('useSyncExternalStoreImpl', () => {
  it('returns the current snapshot', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const subscribe = vi.fn(() => vi.fn());
    const getSnapshot = () => 42;
    const value = useSyncExternalStoreImpl(subscribe, getSnapshot);
    expect(value).toBe(42);
    exitFiber();
  });

  it('subscribes via effect', () => {
    const fiber = makeFiber();
    enterFiber(fiber);
    const unsubscribe = vi.fn();
    const subscribe = vi.fn(() => unsubscribe);
    useSyncExternalStoreImpl(subscribe, () => 'v1');
    const effects = getEffectList();
    expect(effects).not.toBeNull();
    exitFiber();
  });
});

// ─── install/uninstall dispatcher ─────────────────────────────────────
describe('installDispatcher / uninstallDispatcher', () => {
  it('installs and uninstalls without error', () => {
    expect(() => installDispatcher()).not.toThrow();
    expect(() => uninstallDispatcher()).not.toThrow();
  });
});
