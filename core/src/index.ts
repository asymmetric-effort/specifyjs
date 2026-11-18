// ============================================================================
// SpecifyJS — Core Public API
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

export { createElement, createElement as h, createFactory } from './core/create-element';
export { Fragment } from './core/fragment';
export { createContext } from './context/create-context';
export { createRef } from './core/create-ref';
export { forwardRef } from './core/forward-ref';
export { memo } from './core/memo';
export { lazy } from './core/lazy';
export { isValidElement } from './core/is-valid-element';
export { cloneElement } from './core/clone-element';
export { Children } from './core/children';
export { Component, PureComponent } from './components/component';
export { ErrorBoundary } from './components/error-boundary';

// Hooks
export {
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
  useHead,
  useMediaQuery,
  useWindowSize,
  useBreakpoint,
  useBreakpointValue,
  getBreakpoints,
  configureBreakpoints,
  breakpointQuery,
} from './hooks/index';

// Special component types
export { Suspense } from './components/suspense';
export { StrictMode } from './components/strict-mode';
export { Profiler } from './components/profiler';

// Router
export { Router, Route, Link, useRouter, useParams, useNavigate, matchPath } from './router/index';

// Utilities
export { startTransition } from './core/transitions';
export { act } from './shared/act';
export { secureFetch, assertSecureUrl } from './shared/secure-fetch';
export {
  resolveComponentId,
  getComponentTypeTable,
  setComponentIdsEnabled,
} from './shared/component-registry';

// Feature Flags
export { FeatureFlagProvider, FeatureGate, useFeatureFlags } from './features/index';

// Types
export type {
  SpecElement,
  SpecNode,
  SpecChild,
  Props,
  Key,
  Ref,
  RefObject,
  RefCallback,
  FunctionComponent,
  ClassComponentConstructor,
  ClassComponentInstance,
  SpecContext,
  ErrorInfo,
  Fiber,
} from './shared/types';

export type { HeadMeta, HeadHttpEquiv } from './hooks/use-head';
export type { WindowSize } from './hooks/use-window-size';
export type { Breakpoint } from './hooks/breakpoints';
