/**
 * Tests for createFactory (legacy API).
 */
import { describe, it, expect } from 'vitest';
import { createFactory, createElement } from '../../../src/core/create-element';
import { SPEC_ELEMENT_TYPE } from '../../../src/shared/types';

describe('createFactory', () => {
  it('returns a factory function for a string type', () => {
    const divFactory = createFactory('div');
    const el = divFactory({ id: 'test' }, 'child');
    expect(el.$$typeof).toBe(SPEC_ELEMENT_TYPE);
    expect(el.type).toBe('div');
    expect(el.props.id).toBe('test');
    expect(el.props.children).toBe('child');
  });

  it('returns a factory function for a component type', () => {
    function MyComp(props: { value: number }) {
      return createElement('span', null, String(props.value));
    }
    const factory = createFactory(MyComp);
    const el = factory({ value: 42 });
    expect(el.type).toBe(MyComp);
    expect(el.props.value).toBe(42);
  });

  it('handles null config', () => {
    const factory = createFactory('span');
    const el = factory(null, 'text');
    expect(el.type).toBe('span');
    expect(el.props.children).toBe('text');
  });

  it('handles undefined config', () => {
    const factory = createFactory('span');
    const el = factory(undefined, 'text');
    expect(el.type).toBe('span');
    expect(el.props.children).toBe('text');
  });

  it('handles multiple children', () => {
    const factory = createFactory('div');
    const el = factory(null, 'a', 'b', 'c');
    expect(el.props.children).toEqual(['a', 'b', 'c']);
  });
});
