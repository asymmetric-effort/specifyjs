import { describe, it, expect } from 'vitest';
import { Component, PureComponent } from '../../../src/index';
import { shallowEqual } from '../../../src/components/component';

describe('Component', () => {
  it('initializes with props', () => {
    const comp = new Component({ value: 42 });
    expect(comp.props.value).toBe(42);
  });

  it('initializes state as empty object', () => {
    const comp = new Component({});
    expect(comp.state).toEqual({});
  });

  it('render returns null by default', () => {
    const comp = new Component({});
    expect(comp.render()).toBeNull();
  });

  it('has isSpecComponent on prototype', () => {
    expect(Component.prototype.isSpecComponent).toBe(true);
  });

  it('queues state via setState', () => {
    const comp = new Component({});
    comp.setState({ count: 1 });
    expect(comp._pendingState).toHaveLength(1);
  });

  it('accepts a function updater in setState', () => {
    const comp = new Component({});
    const updater = () => ({ count: 2 });
    comp.setState(updater);
    expect(comp._pendingState[0]).toBe(updater);
  });

  it('sets _forceUpdate flag on forceUpdate', () => {
    const comp = new Component({});
    comp.forceUpdate();
    expect(comp._forceUpdate).toBe(true);
  });
});

describe('PureComponent', () => {
  it('extends Component', () => {
    const comp = new PureComponent({});
    expect(comp).toBeInstanceOf(Component);
  });

  it('has isPureSpecComponent on prototype', () => {
    expect(PureComponent.prototype.isPureSpecComponent).toBe(true);
  });

  it('shouldComponentUpdate returns false for same props and state', () => {
    const comp = new PureComponent({ a: 1 });
    comp.state = { x: 10 };
    expect(comp.shouldComponentUpdate!({ a: 1 }, { x: 10 })).toBe(false);
  });

  it('shouldComponentUpdate returns true for different props', () => {
    const comp = new PureComponent({ a: 1 });
    comp.state = { x: 10 };
    expect(comp.shouldComponentUpdate!({ a: 2 }, { x: 10 })).toBe(true);
  });

  it('shouldComponentUpdate returns true for different state', () => {
    const comp = new PureComponent({ a: 1 });
    comp.state = { x: 10 };
    expect(comp.shouldComponentUpdate!({ a: 1 }, { x: 20 })).toBe(true);
  });
});

describe('shallowEqual', () => {
  it('returns true for identical references', () => {
    const obj = { a: 1 };
    expect(shallowEqual(obj, obj)).toBe(true);
  });

  it('returns true for equal primitives', () => {
    expect(shallowEqual(1, 1)).toBe(true);
    expect(shallowEqual('x', 'x')).toBe(true);
  });

  it('returns false for different primitives', () => {
    expect(shallowEqual(1, 2)).toBe(false);
  });

  it('returns true for shallowly equal objects', () => {
    expect(shallowEqual({ a: 1, b: 'x' }, { a: 1, b: 'x' })).toBe(true);
  });

  it('returns false for deeply unequal objects', () => {
    expect(shallowEqual({ a: { nested: 1 } }, { a: { nested: 1 } })).toBe(false);
  });

  it('returns false for different key counts', () => {
    expect(shallowEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
  });

  it('handles null and undefined', () => {
    expect(shallowEqual(null, null)).toBe(true);
    expect(shallowEqual(null, undefined)).toBe(false);
    expect(shallowEqual(null, {})).toBe(false);
  });

  it('handles NaN', () => {
    expect(shallowEqual(NaN, NaN)).toBe(true);
  });

  it('distinguishes +0 and -0', () => {
    expect(shallowEqual(+0, -0)).toBe(false);
  });
});
