import { describe, it, expect } from 'vitest';
import {
  getFiberTag,
  createFiberFromElement,
  createFiberFromText,
  createHostRootFiber,
  createFiber,
  createWorkInProgress,
  coerceToFiberChildren,
} from '../../../src/core/fiber';
import { createElement, Fragment, Component } from '../../../src/index';
import { forwardRef } from '../../../src/core/forward-ref';
import { memo } from '../../../src/core/memo';
import { FiberTag, EffectTag, SPEC_ELEMENT_TYPE } from '../../../src/shared/types';

describe('getFiberTag', () => {
  it('returns HostComponent for string types', () => {
    expect(getFiberTag('div')).toBe(FiberTag.HostComponent);
    expect(getFiberTag('span')).toBe(FiberTag.HostComponent);
  });

  it('returns FunctionComponent for plain functions', () => {
    const Comp = () => null;
    expect(getFiberTag(Comp)).toBe(FiberTag.FunctionComponent);
  });

  it('returns ClassComponent for class components', () => {
    class MyComp extends Component {
      render() {
        return null;
      }
    }
    expect(getFiberTag(MyComp)).toBe(FiberTag.ClassComponent);
  });

  it('returns Fragment for fragment type', () => {
    expect(getFiberTag(Fragment)).toBe(FiberTag.Fragment);
  });

  it('returns ForwardRef for forwarded ref components', () => {
    const FwdComp = forwardRef(() => null);
    expect(getFiberTag(FwdComp as unknown as symbol)).toBe(FiberTag.ForwardRef);
  });

  it('returns MemoComponent for memo components', () => {
    const MemoComp = memo(() => null);
    expect(getFiberTag(MemoComp as unknown as symbol)).toBe(FiberTag.MemoComponent);
  });
});

describe('createFiberFromElement', () => {
  it('creates a fiber from a host element', () => {
    const el = createElement('div', { id: 'test' }, 'hello');
    const fiber = createFiberFromElement(el);
    expect(fiber.tag).toBe(FiberTag.HostComponent);
    expect(fiber.type).toBe('div');
    expect(fiber.key).toBeNull();
    expect(fiber.pendingProps.id).toBe('test');
  });

  it('creates a fiber from a keyed element', () => {
    const el = createElement('li', { key: 'item-1' });
    const fiber = createFiberFromElement(el);
    expect(fiber.key).toBe('item-1');
  });

  it('creates a fiber from a function component', () => {
    const Comp = () => null;
    const el = createElement(Comp, { value: 42 });
    const fiber = createFiberFromElement(el);
    expect(fiber.tag).toBe(FiberTag.FunctionComponent);
    expect(fiber.type).toBe(Comp);
  });
});

describe('createFiberFromText', () => {
  it('creates a text fiber', () => {
    const fiber = createFiberFromText('hello');
    expect(fiber.tag).toBe(FiberTag.HostText);
    expect(fiber.type).toBeNull();
    expect((fiber.pendingProps as unknown as { text: string }).text).toBe('hello');
  });

  it('creates a text fiber from number', () => {
    const fiber = createFiberFromText(42);
    expect(fiber.tag).toBe(FiberTag.HostText);
    expect((fiber.pendingProps as unknown as { text: number }).text).toBe(42);
  });
});

describe('createHostRootFiber', () => {
  it('creates a root fiber', () => {
    const fiber = createHostRootFiber();
    expect(fiber.tag).toBe(FiberTag.HostRoot);
    expect(fiber.type).toBeNull();
    expect(fiber.return).toBeNull();
  });
});

describe('createWorkInProgress', () => {
  it('creates an alternate fiber', () => {
    const current = createHostRootFiber();
    current.memoizedState = { count: 0 };
    const wip = createWorkInProgress(current, { children: null });
    expect(wip.alternate).toBe(current);
    expect(current.alternate).toBe(wip);
    expect(wip.tag).toBe(FiberTag.HostRoot);
    expect(wip.memoizedState).toEqual({ count: 0 });
  });

  it('reuses alternate on second call', () => {
    const current = createHostRootFiber();
    const wip1 = createWorkInProgress(current, { children: null });
    const wip2 = createWorkInProgress(current, { children: 'new' });
    expect(wip2).toBe(wip1);
    expect(wip2.pendingProps.children).toBe('new');
  });
});

describe('coerceToFiberChildren', () => {
  it('returns empty array for null', () => {
    expect(coerceToFiberChildren(null)).toEqual([]);
  });

  it('returns empty array for undefined', () => {
    expect(coerceToFiberChildren(undefined)).toEqual([]);
  });

  it('returns empty array for booleans', () => {
    expect(coerceToFiberChildren(true)).toEqual([]);
    expect(coerceToFiberChildren(false)).toEqual([]);
  });

  it('wraps a string in an array', () => {
    expect(coerceToFiberChildren('text')).toEqual(['text']);
  });

  it('wraps a number in an array', () => {
    expect(coerceToFiberChildren(42)).toEqual([42]);
  });

  it('wraps an element in an array', () => {
    const el = createElement('div', null);
    const result = coerceToFiberChildren(el);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe(el);
  });

  it('flattens nested arrays', () => {
    const el = createElement('span', null);
    const result = coerceToFiberChildren(['a', [el, 'b']]);
    expect(result).toEqual(['a', el, 'b']);
  });

  it('filters out null and boolean from arrays', () => {
    const result = coerceToFiberChildren([null, true, 'text', false]);
    expect(result).toEqual(['text']);
  });
});
