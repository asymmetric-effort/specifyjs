import { describe, it, expect } from 'vitest';
import {
  useState,
  useEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useLayoutEffect,
  useDebugValue,
  useId,
  useDeferredValue,
  useTransition,
  useSyncExternalStore,
  useInsertionEffect,
} from '../../../src/hooks/index';

describe('hooks guard (called outside component)', () => {
  const hooks = [
    ['useState', () => useState(0)],
    ['useEffect', () => useEffect(() => {})],
    [
      'useContext',
      () =>
        useContext({
          $$typeof: Symbol(),
          Provider: Symbol(),
          Consumer: Symbol(),
          _currentValue: 0,
          _defaultValue: 0,
        }),
    ],
    ['useReducer', () => useReducer((s: number) => s, 0)],
    ['useCallback', () => useCallback(() => {}, [])],
    ['useMemo', () => useMemo(() => 1, [])],
    ['useRef', () => useRef(null)],
    ['useImperativeHandle', () => useImperativeHandle(null, () => ({}))],
    ['useLayoutEffect', () => useLayoutEffect(() => {})],
    ['useDebugValue', () => useDebugValue('test')],
    ['useId', () => useId()],
    ['useDeferredValue', () => useDeferredValue(0)],
    ['useTransition', () => useTransition()],
    [
      'useSyncExternalStore',
      () =>
        useSyncExternalStore(
          () => () => {},
          () => 0,
        ),
    ],
    ['useInsertionEffect', () => useInsertionEffect(() => {})],
  ] as const;

  for (const [name, hookFn] of hooks) {
    it(`${name} throws when called outside a component`, () => {
      expect(() => hookFn()).toThrow('Invalid hook call');
    });
  }
});
