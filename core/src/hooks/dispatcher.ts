// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * The concrete hook implementations that get wired up as the dispatcher
 * when a function component is being rendered.
 */

import type { SpecContext, Fiber } from '../shared/types';
import {
  allocateHook,
  areDepsEqual,
  pushEffect,
  getCurrentFiber,
  getCurrentHookIndex,
  EffectHookTag,
} from './hook-state';
import { scheduleUpdate } from '../core/scheduler';
import { requestUpdateLane, startTransition as startTransitionFn } from '../core/transitions';
import { mergeLanes } from '../core/lanes';
import { trackStateUpdate, trackEffectDeps } from '../shared/render-guard';
import { getComponentName } from '../shared/component-registry';

// ---------------------------------------------------------------------------
// Fiber render trigger — set by the work loop
// ---------------------------------------------------------------------------
let rerenderFiber: ((fiber: Fiber) => void) | null = null;

export function setRerenderCallback(cb: ((fiber: Fiber) => void) | null): void {
  rerenderFiber = cb;
}

function getCurrentFiberForDispatch(): Fiber {
  const fiber = getCurrentFiber();
  /* v8 ignore start -- guard only triggers outside render context */
  if (!fiber) {
    throw new Error('Invalid hook call.');
  }
  /* v8 ignore stop */
  return fiber;
}

/**
 * Walk up from a fiber to the root, setting lane bits on each ancestor.
 * This propagates the lane information so ensureRootIsScheduled knows
 * what work is pending.
 */
function markFiberWithLane(fiber: Fiber, lane: number): void {
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  let node: Fiber | null = fiber.return;
  while (node !== null) {
    node.childLanes = mergeLanes(node.childLanes, lane);
    node = node.return;
  }
}

// ---------------------------------------------------------------------------
// useState
// ---------------------------------------------------------------------------

export function useStateImpl<T>(
  initialState: T | (() => T),
): [T, (action: T | ((prev: T) => T)) => void] {
  const hook = allocateHook();

  // Mount: initialize state and queue
  if (hook.queue === null) {
    const initial = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
    hook.memoizedState = initial;
    hook.queue = [];
  }

  // Process queued updates (mutate the same array to keep closure references valid)
  const queue = hook.queue!;
  if (queue.length > 0) {
    let state = hook.memoizedState as T;
    for (const update of queue) {
      const action = update.action as T | ((prev: T) => T);
      state = typeof action === 'function' ? (action as (prev: T) => T)(state) : action;
    }
    hook.memoizedState = state;
    queue.length = 0; // Clear in-place to keep reference stable
  }

  const state = hook.memoizedState as T;
  const fiber = getCurrentFiberForDispatch();

  const setState = (action: T | ((prev: T) => T)) => {
    // Dev-time: detect rapid setState floods
    const compName =
      (typeof fiber.type === 'function'
        ? getComponentName(fiber.type) || (fiber.type as { name?: string }).name
        : '') || 'Anonymous';
    trackStateUpdate(fiber, compName);

    const lane = requestUpdateLane();
    /* v8 ignore start -- overflow guard tested in security regression tests */
    if (queue.length >= 10000) {
      if (typeof console !== 'undefined')
        console.warn('[SpecifyJS] Hook update queue exceeded 10000 — dropping oldest updates');
      queue.splice(0, queue.length - 5000);
    }
    /* v8 ignore stop */
    queue.push({ action });
    markFiberWithLane(fiber, lane);
    if (rerenderFiber) {
      scheduleUpdate(() => rerenderFiber!(fiber));
    }
  };

  return [state, setState];
}

// ---------------------------------------------------------------------------
// useReducer
// ---------------------------------------------------------------------------

export function useReducerImpl<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
  init?: (arg: S) => S,
): [S, (action: A) => void] {
  const hook = allocateHook();

  // Mount: initialize state and queue
  if (hook.queue === null) {
    hook.memoizedState = init ? init(initialArg) : initialArg;
    hook.queue = [];
  }

  // Process queued actions (mutate in-place for stable reference)
  const queue = hook.queue!;
  if (queue.length > 0) {
    let state = hook.memoizedState as S;
    for (const update of queue) {
      state = reducer(state, update.action as A);
    }
    hook.memoizedState = state;
    queue.length = 0;
  }

  const state = hook.memoizedState as S;
  const fiber = getCurrentFiberForDispatch();

  const dispatch = (action: A) => {
    // Dev-time: detect rapid dispatch floods
    const dName =
      (typeof fiber.type === 'function'
        ? getComponentName(fiber.type) || (fiber.type as { name?: string }).name
        : '') || 'Anonymous';
    trackStateUpdate(fiber, dName);

    const lane = requestUpdateLane();
    queue.push({ action });
    markFiberWithLane(fiber, lane);
    if (rerenderFiber) {
      scheduleUpdate(() => rerenderFiber!(fiber));
    }
  };

  return [state, dispatch];
}

// ---------------------------------------------------------------------------
// useEffect / useLayoutEffect / useInsertionEffect
// ---------------------------------------------------------------------------

function useEffectImpl(
  tag: EffectHookTag,
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  const hook = allocateHook();
  const hIdx = getCurrentHookIndex();

  // On update, read the previous effect's destroy from the effect object itself
  // (runEffects sets destroy on the effect, not on hook.memoizedState)
  const prevState = hook.memoizedState as {
    deps?: readonly unknown[];
    effect?: { destroy?: (() => void) | null };
  } | null;
  const prevDestroy = prevState?.effect?.destroy ?? null;

  if (prevState !== null && deps !== undefined) {
    const depsMatch = areDepsEqual(prevState.deps, deps);

    // Dev-time: track dependency stability
    const fiber = getCurrentFiber();
    if (fiber) {
      const cName =
        (typeof fiber.type === 'function'
          ? getComponentName(fiber.type) || (fiber.type as { name?: string }).name
          : '') || 'Anonymous';
      trackEffectDeps(fiber, hIdx, deps as unknown[] | undefined, !depsMatch, cName);
    }

    if (depsMatch) {
      // Deps haven't changed, skip
      pushEffect(EffectHookTag.NoEffect, create, prevDestroy, deps);
      return;
    }
  }

  const effect = pushEffect(EffectHookTag.HasEffect | tag, create, prevDestroy, deps);
  hook.memoizedState = { deps, effect };
}

export function useEffectDispatch(
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  useEffectImpl(EffectHookTag.Passive, create, deps);
}

export function useLayoutEffectDispatch(
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  useEffectImpl(EffectHookTag.Layout, create, deps);
}

export function useInsertionEffectDispatch(
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  useEffectImpl(EffectHookTag.Insertion, create, deps);
}

// ---------------------------------------------------------------------------
// useContext
// ---------------------------------------------------------------------------

export function useContextImpl<T>(context: SpecContext<T>): T {
  allocateHook(); // reserve a slot for consistency
  return context._currentValue;
}

// ---------------------------------------------------------------------------
// useCallback
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallbackImpl<T extends (...args: any[]) => any>(
  callback: T,
  deps: readonly unknown[],
): T {
  const hook = allocateHook();

  const prevState = hook.memoizedState as [T, readonly unknown[]] | null;
  if (prevState !== null) {
    if (areDepsEqual(prevState[1], deps)) {
      return prevState[0];
    }
  }

  hook.memoizedState = [callback, deps];
  return callback;
}

// ---------------------------------------------------------------------------
// useMemo
// ---------------------------------------------------------------------------

export function useMemoImpl<T>(factory: () => T, deps: readonly unknown[]): T {
  const hook = allocateHook();

  const prevState = hook.memoizedState as [T, readonly unknown[]] | null;
  if (prevState !== null) {
    if (areDepsEqual(prevState[1], deps)) {
      return prevState[0];
    }
  }

  const value = factory();
  hook.memoizedState = [value, deps];
  return value;
}

// ---------------------------------------------------------------------------
// useRef
// ---------------------------------------------------------------------------

export function useRefImpl<T>(initialValue?: T): { current: T | undefined } {
  const hook = allocateHook();

  if (hook.memoizedState === null) {
    const ref = { current: initialValue };
    hook.memoizedState = ref;
  }

  return hook.memoizedState as { current: T | undefined };
}

// ---------------------------------------------------------------------------
// useImperativeHandle
// ---------------------------------------------------------------------------

export function useImperativeHandleImpl<T>(
  ref: { current: T | null } | ((instance: T | null) => void) | null,
  createHandle: () => T,
  deps?: readonly unknown[],
): void {
  useEffectImpl(
    EffectHookTag.Layout,
    () => {
      const handle = createHandle();
      if (ref !== null) {
        if (typeof ref === 'function') {
          ref(handle);
          return () => ref(null);
        }
        (ref as { current: T | null }).current = handle;
        return () => {
          (ref as { current: T | null }).current = null;
        };
      }
      return undefined;
    },
    deps,
  );
}

// ---------------------------------------------------------------------------
// useDebugValue
// ---------------------------------------------------------------------------

export function useDebugValueImpl<T>(_value: T, _format?: (value: T) => unknown): void {
  // DevTools integration — no-op in production
}

// ---------------------------------------------------------------------------
// useId
// ---------------------------------------------------------------------------

let idCounter = 0;

export function resetIdCounter(): void {
  idCounter = 0;
}

export function useIdImpl(): string {
  const hook = allocateHook();

  if (hook.memoizedState === null) {
    hook.memoizedState = `:l${idCounter++}:`;
  }

  return hook.memoizedState as string;
}

// ---------------------------------------------------------------------------
// useDeferredValue
// ---------------------------------------------------------------------------

export function useDeferredValueImpl<T>(value: T): T {
  const [deferredValue, setDeferredValue] = useStateImpl(value);

  // When the value changes, schedule a low-priority update to sync it
  useEffectImpl(
    EffectHookTag.Passive,
    () => {
      startTransitionFn(() => {
        setDeferredValue(value);
      });
    },
    [value],
  );

  return deferredValue;
}

// ---------------------------------------------------------------------------
// useTransition
// ---------------------------------------------------------------------------

export function useTransitionImpl(): [boolean, (callback: () => void) => void] {
  const [isPending, setIsPending] = useStateImpl(false);

  const startTransition = useCallbackImpl(
    ((callback: () => void) => {
      // Set isPending=true at DefaultLane (high priority — shows spinner immediately)
      setIsPending(true);

      // Run the callback inside startTransition — updates get TransitionLane
      startTransitionFn(() => {
        setIsPending(false); // This update gets TransitionLane (deferred)
        callback(); // User's updates also get TransitionLane
      });
    }) as (...args: unknown[]) => unknown,
    [setIsPending],
  ) as unknown as (callback: () => void) => void;

  return [isPending, startTransition];
}

// ---------------------------------------------------------------------------
// useSyncExternalStore
// ---------------------------------------------------------------------------

export function useSyncExternalStoreImpl<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  _getServerSnapshot?: () => T,
): T {
  const hook = allocateHook();
  const fiber = getCurrentFiberForDispatch();

  const value = getSnapshot();
  hook.memoizedState = value;

  // Subscribe to store changes and trigger re-render
  useEffectImpl(
    EffectHookTag.Passive,
    () => {
      const unsubscribe = subscribe(() => {
        const nextValue = getSnapshot();
        if (!Object.is(hook.memoizedState, nextValue)) {
          hook.memoizedState = nextValue;
          if (rerenderFiber) {
            scheduleUpdate(() => rerenderFiber!(fiber));
          }
        }
      });
      return unsubscribe;
    },
    [subscribe, getSnapshot],
  );

  return value;
}
