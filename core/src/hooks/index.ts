// ============================================================================
// SpecifyJS Hooks
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { SpecContext } from '../shared/types';

// Internal: the currently rendering fiber sets these
type Dispatcher = {
  useState: typeof useState;
  useEffect: typeof useEffect;
  useContext: typeof useContext;
  useReducer: typeof useReducer;
  useCallback: typeof useCallback;
  useMemo: typeof useMemo;
  useRef: typeof useRef;
  useImperativeHandle: typeof useImperativeHandle;
  useLayoutEffect: typeof useLayoutEffect;
  useDebugValue: typeof useDebugValue;
  useId: typeof useId;
  useDeferredValue: typeof useDeferredValue;
  useTransition: typeof useTransition;
  useSyncExternalStore: typeof useSyncExternalStore;
  useInsertionEffect: typeof useInsertionEffect;
};

let currentDispatcher: Dispatcher | null = null;

export function __setDispatcher(dispatcher: Dispatcher | null): void {
  currentDispatcher = dispatcher;
}

export function __getDispatcher(): Dispatcher | null {
  return currentDispatcher;
}

function resolveDispatcher(): Dispatcher {
  if (currentDispatcher === null) {
    throw new Error(
      'Invalid hook call. Hooks can only be called inside the body of a function component.',
    );
  }
  return currentDispatcher;
}

export function useState<T>(
  initialState: T | (() => T),
): [T, (action: T | ((prev: T) => T)) => void] {
  return resolveDispatcher().useState(initialState);
}

export function useEffect(create: () => void | (() => void), deps?: readonly unknown[]): void {
  return resolveDispatcher().useEffect(create, deps);
}

export function useContext<T>(context: SpecContext<T>): T {
  return resolveDispatcher().useContext(context);
}

export function useReducer<S, A>(
  reducer: (state: S, action: A) => S,
  initialArg: S,
  init?: (arg: S) => S,
): [S, (action: A) => void] {
  return resolveDispatcher().useReducer(reducer, initialArg, init);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useCallback<T extends (...args: any[]) => any>(
  callback: T,
  deps: readonly unknown[],
): T {
  return resolveDispatcher().useCallback(callback, deps);
}

export function useMemo<T>(factory: () => T, deps: readonly unknown[]): T {
  return resolveDispatcher().useMemo(factory, deps);
}

export function useRef<T>(initialValue: T): { current: T };
export function useRef<T>(initialValue: T | null): { current: T | null };
export function useRef<T>(): { current: T | undefined };
export function useRef<T>(initialValue?: T): { current: T | undefined } {
  return resolveDispatcher().useRef(initialValue);
}

export function useImperativeHandle<T>(
  ref: { current: T | null } | ((instance: T | null) => void) | null,
  createHandle: () => T,
  deps?: readonly unknown[],
): void {
  return resolveDispatcher().useImperativeHandle(ref, createHandle, deps);
}

export function useLayoutEffect(
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  return resolveDispatcher().useLayoutEffect(create, deps);
}

export function useDebugValue<T>(value: T, format?: (value: T) => unknown): void {
  return resolveDispatcher().useDebugValue(value, format);
}

export function useId(): string {
  return resolveDispatcher().useId();
}

export function useDeferredValue<T>(value: T): T {
  return resolveDispatcher().useDeferredValue(value);
}

export function useTransition(): [boolean, (callback: () => void) => void] {
  return resolveDispatcher().useTransition();
}

export function useSyncExternalStore<T>(
  subscribe: (onStoreChange: () => void) => () => void,
  getSnapshot: () => T,
  getServerSnapshot?: () => T,
): T {
  return resolveDispatcher().useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export function useInsertionEffect(
  create: () => void | (() => void),
  deps?: readonly unknown[],
): void {
  return resolveDispatcher().useInsertionEffect(create, deps);
}

// Custom hooks (not dispatcher-based)
export { useHead } from './use-head';
export type { HeadMeta, HeadHttpEquiv } from './use-head';
export { useMediaQuery } from './use-media-query';
export { useWindowSize } from './use-window-size';
export type { WindowSize } from './use-window-size';
export { useBreakpoint, useBreakpointValue } from './use-breakpoint';
export { getBreakpoints, configureBreakpoints, breakpointQuery } from './breakpoints';
export type { Breakpoint } from './breakpoints';
