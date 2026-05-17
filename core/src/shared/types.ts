// ============================================================================
// SpecifyJS Core Types
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/** Unique symbol to identify SpecifyJS elements */
export const SPEC_ELEMENT_TYPE = Symbol.for('spec.element');
export const SPEC_FRAGMENT_TYPE = Symbol.for('spec.fragment');
export const SPEC_PORTAL_TYPE = Symbol.for('spec.portal');
export const SPEC_PROVIDER_TYPE = Symbol.for('spec.provider');
export const SPEC_CONSUMER_TYPE = Symbol.for('spec.consumer');
export const SPEC_FORWARD_REF_TYPE = Symbol.for('spec.forward_ref');
export const SPEC_MEMO_TYPE = Symbol.for('spec.memo');
export const SPEC_LAZY_TYPE = Symbol.for('spec.lazy');
export const SPEC_SUSPENSE_TYPE = Symbol.for('spec.suspense');
export const SPEC_STRICT_MODE_TYPE = Symbol.for('spec.strict_mode');
export const SPEC_PROFILER_TYPE = Symbol.for('spec.profiler');

/** A key used for reconciliation */
export type Key = string | number | null;

/** A ref can be a callback, an object, or null */
export type Ref<T = unknown> = RefCallback<T> | RefObject<T> | null;
export type RefCallback<T> = (instance: T | null) => void;
export interface RefObject<T> {
  current: T | null;
}

/** Props are an arbitrary key-value map */
export type Props = Record<string, unknown> & {
  children?: SpecNode;
  key?: Key;
  ref?: Ref;
};

/** Valid child types in a SpecifyJS tree */
export type SpecChild = SpecElement | string | number | boolean | null | undefined;
export type SpecNode = SpecChild | SpecNode[];

/** A functional component */
export type FunctionComponent<P extends Props = Props> = (props: P) => SpecNode;

/** A class component constructor */
export interface ClassComponentConstructor<P extends Props = Props, S = unknown> {
  new (props: P): ClassComponentInstance<P, S>;
  getDerivedStateFromProps?(props: P, state: S): Partial<S> | null;
  getDerivedStateFromError?(error: unknown): Partial<S> | null;
}

/** Instance of a class component */
export interface ClassComponentInstance<P extends Props = Props, S = unknown> {
  props: P;
  state: S;
  setState(updater: Partial<S> | ((prevState: S, props: P) => Partial<S> | null)): void;
  forceUpdate(callback?: () => void): void;
  render(): SpecNode;
  componentDidMount?(): void;
  componentDidUpdate?(prevProps: P, prevState: S, snapshot?: unknown): void;
  componentWillUnmount?(): void;
  shouldComponentUpdate?(nextProps: P, nextState: S): boolean;
  getSnapshotBeforeUpdate?(prevProps: P, prevState: S): unknown;
  componentDidCatch?(error: unknown, info: ErrorInfo): void;
  // Internal: set by the reconciler for setState/forceUpdate wiring
  _fiber: unknown;
  _pendingState: Array<Partial<S> | ((prevState: S, props: P) => Partial<S> | null)>;
  _forceUpdate: boolean;
  _enqueueUpdate(callback?: () => void): void;
}

export interface ErrorInfo {
  componentStack: string;
}

/** A component type can be a function, a class, or a special symbol type */
export type ComponentType<P extends Props = Props> =
  | FunctionComponent<P>
  | ClassComponentConstructor<P>
  | string
  | symbol;

/** The core element structure — equivalent to React.Element */
export interface SpecElement<P extends Props = Props> {
  $$typeof: typeof SPEC_ELEMENT_TYPE;
  type: ComponentType<P>;
  props: P;
  key: Key;
  ref: Ref;
}

/** Fiber node types for the reconciler */
export const enum FiberTag {
  FunctionComponent = 0,
  ClassComponent = 1,
  HostRoot = 2,
  HostComponent = 3,
  HostText = 4,
  Fragment = 5,
  ContextProvider = 6,
  ContextConsumer = 7,
  ForwardRef = 8,
  MemoComponent = 9,
  LazyComponent = 10,
  SuspenseComponent = 11,
  Profiler = 12,
  Portal = 13,
}

/** Effect flags for fiber work */
export const enum EffectTag {
  NoEffect = 0,
  Placement = 1,
  Update = 2,
  Deletion = 4,
  ChildDeletion = 8,
  Snapshot = 16,
  Passive = 32,
  Layout = 64,
  Ref = 128,
}

/** Fiber node — the internal work unit */
export interface Fiber<P extends Props = Props> {
  tag: FiberTag;
  type: ComponentType<P> | null;
  key: Key;
  ref: Ref;

  stateNode: unknown;
  pendingProps: P;
  memoizedProps: P | null;
  memoizedState: unknown;

  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  alternate: Fiber | null;
  effectTag: EffectTag;

  updateQueue: unknown;
  dependencies: unknown;

  lanes: number;
  childLanes: number;
}

/** Context type */
export interface SpecContext<T> {
  $$typeof: symbol;
  Provider: ComponentType;
  Consumer: ComponentType;
  _currentValue: T;
  _defaultValue: T;
  displayName?: string;
}
