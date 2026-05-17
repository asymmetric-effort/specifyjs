// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Props, SpecNode, ErrorInfo } from '../shared/types';

/**
 * Base class for class components.
 * Equivalent to React.Component.
 */
export class Component<P extends Props = Props, S = unknown> {
  static contextType?: unknown;
  static getDerivedStateFromProps?(_props: Props, _state: unknown): Partial<unknown> | null;
  static getDerivedStateFromError?(_error: unknown): Partial<unknown> | null;

  props: P;
  state: S;
  context: unknown;

  // Set by the reconciler
  _fiber: unknown = null;
  _pendingState: Array<Partial<S> | ((prevState: S, props: P) => Partial<S> | null)> = [];
  _forceUpdate = false;

  constructor(props: P) {
    this.props = props;
    this.state = {} as S;
    this.context = undefined;
  }

  setState(
    updater: Partial<S> | ((prevState: S, props: P) => Partial<S> | null),
    callback?: () => void,
  ): void {
    this._pendingState.push(updater);
    // Trigger re-render via reconciler
    this._enqueueUpdate(callback);
  }

  forceUpdate(callback?: () => void): void {
    this._forceUpdate = true;
    this._enqueueUpdate(callback);
  }

  render(): SpecNode {
    return null;
  }

  // Lifecycle methods — overridden by subclasses
  componentDidMount?(): void;
  componentDidUpdate?(_prevProps: P, _prevState: S, _snapshot?: unknown): void;
  componentWillUnmount?(): void;
  shouldComponentUpdate?(_nextProps: P, _nextState: S): boolean;
  getSnapshotBeforeUpdate?(_prevProps: P, _prevState: S): unknown;
  componentDidCatch?(_error: unknown, _info: ErrorInfo): void;

  // Internal: replaced by the reconciler when the instance is mounted
  _enqueueUpdate(_callback?: () => void): void {
    // Placeholder — the reconciler attaches the real implementation
  }
}

// Set on prototype so instanceof checks and prototype inspection work
(Component.prototype as unknown as Record<string, boolean>).isSpecComponent = true;

/**
 * PureComponent implements shouldComponentUpdate with shallow prop/state comparison.
 * Equivalent to React.PureComponent.
 */
export class PureComponent<P extends Props = Props, S = unknown> extends Component<P, S> {
  shouldComponentUpdate(nextProps: P, nextState: S): boolean {
    return !shallowEqual(this.props, nextProps) || !shallowEqual(this.state, nextState);
  }
}

(PureComponent.prototype as unknown as Record<string, boolean>).isPureSpecComponent = true;

/**
 * Shallow comparison of two objects.
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  const objA = a as Record<string, unknown>;
  const objB = b as Record<string, unknown>;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(objA[key], objB[key])) {
      return false;
    }
  }

  return true;
}
