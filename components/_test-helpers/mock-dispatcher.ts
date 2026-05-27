// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Mock hook dispatcher for component unit tests.
 *
 * Allows calling component functions directly (without createRoot/render)
 * by providing trivial implementations of every hook.
 *
 * Usage:
 *   import { installMockDispatcher, teardownMockDispatcher } from '../../_test-helpers/mock-dispatcher';
 *   beforeEach(() => installMockDispatcher());
 *   afterEach(() => teardownMockDispatcher());
 */

import { __setDispatcher } from 'specifyjs/hooks';

let idCounter = 0;

function mockDispatcher() {
  idCounter = 0;
  return {
    useState<T>(initialState: T | (() => T)): [T, (a: T | ((p: T) => T)) => void] {
      const val = typeof initialState === 'function' ? (initialState as () => T)() : initialState;
      return [val, () => {}];
    },
    useEffect(_create: () => void | (() => void), _deps?: readonly unknown[]): void {},
    useContext<T>(_context: any): T {
      return undefined as unknown as T;
    },
    useReducer<S, A>(
      _reducer: (state: S, action: A) => S,
      initialArg: S,
      init?: (arg: S) => S,
    ): [S, (action: A) => void] {
      const state = init ? init(initialArg) : initialArg;
      return [state, () => {}];
    },
    useCallback<T extends (...args: unknown[]) => unknown>(callback: T, _deps: readonly unknown[]): T {
      return callback;
    },
    useMemo<T>(factory: () => T, _deps: readonly unknown[]): T {
      return factory();
    },
    useRef<T>(initialValue?: T): { current: T | undefined } {
      return { current: initialValue };
    },
    useImperativeHandle(
      _ref: any,
      _createHandle: () => any,
      _deps?: readonly unknown[],
    ): void {},
    useLayoutEffect(_create: () => void | (() => void), _deps?: readonly unknown[]): void {},
    useDebugValue<T>(_value: T, _format?: (value: T) => unknown): void {},
    useId(): string {
      return `mock-id-${idCounter++}`;
    },
    useDeferredValue<T>(value: T): T {
      return value;
    },
    useTransition(): [boolean, (callback: () => void) => void] {
      return [false, (cb: () => void) => cb()];
    },
    useSyncExternalStore<T>(
      _subscribe: (onStoreChange: () => void) => () => void,
      getSnapshot: () => T,
      _getServerSnapshot?: () => T,
    ): T {
      return getSnapshot();
    },
    useInsertionEffect(_create: () => void | (() => void), _deps?: readonly unknown[]): void {},
  };
}

export function installMockDispatcher(): void {
  __setDispatcher(mockDispatcher() as any);
}

export function teardownMockDispatcher(): void {
  __setDispatcher(null);
}
