import { describe, it, expect } from 'vitest';
import { createElement, Fragment } from '../../../src/index';
import { SPEC_ELEMENT_TYPE, SPEC_FRAGMENT_TYPE } from '../../../src/shared/types';

describe('createElement', () => {
  // Happy path
  it('creates an element with a string type (host component)', () => {
    const el = createElement('div', null);
    expect(el.$$typeof).toBe(SPEC_ELEMENT_TYPE);
    expect(el.type).toBe('div');
    expect(el.props).toEqual({});
    expect(el.key).toBeNull();
    expect(el.ref).toBeNull();
  });

  it('creates an element with props', () => {
    const el = createElement('div', { id: 'test', className: 'foo' });
    expect(el.props.id).toBe('test');
    expect(el.props.className).toBe('foo');
  });

  it('extracts key from props', () => {
    const el = createElement('div', { key: 'my-key' });
    expect(el.key).toBe('my-key');
    expect(el.props).not.toHaveProperty('key');
  });

  it('coerces numeric key to string', () => {
    const el = createElement('div', { key: 42 });
    expect(el.key).toBe('42');
  });

  it('extracts ref from props', () => {
    const ref = { current: null };
    const el = createElement('div', { ref });
    expect(el.ref).toBe(ref);
    expect(el.props).not.toHaveProperty('ref');
  });

  it('handles a single child', () => {
    const el = createElement('div', null, 'hello');
    expect(el.props.children).toBe('hello');
  });

  it('handles multiple children as array', () => {
    const el = createElement('div', null, 'a', 'b', 'c');
    expect(el.props.children).toEqual(['a', 'b', 'c']);
  });

  it('handles nested element children', () => {
    const child = createElement('span', null, 'text');
    const el = createElement('div', null, child);
    expect(el.props.children).toBe(child);
    expect((el.props.children as typeof child).type).toBe('span');
  });

  it('creates an element with a function component', () => {
    const MyComp = () => null;
    const el = createElement(MyComp, { value: 123 });
    expect(el.type).toBe(MyComp);
    expect(el.props.value).toBe(123);
  });

  it('applies defaultProps from function components', () => {
    const MyComp = () => null;
    (MyComp as unknown as { defaultProps: Record<string, unknown> }).defaultProps = {
      color: 'red',
    };
    const el = createElement(MyComp, null);
    expect(el.props.color).toBe('red');
  });

  it('does not override explicit props with defaultProps', () => {
    const MyComp = () => null;
    (MyComp as unknown as { defaultProps: Record<string, unknown> }).defaultProps = {
      color: 'red',
    };
    const el = createElement(MyComp, { color: 'blue' });
    expect(el.props.color).toBe('blue');
  });

  it('creates a Fragment element', () => {
    expect(Fragment).toBe(SPEC_FRAGMENT_TYPE);
    const el = createElement(Fragment, null, 'a', 'b');
    expect(el.type).toBe(SPEC_FRAGMENT_TYPE);
    expect(el.props.children).toEqual(['a', 'b']);
  });

  // Sad path
  it('handles null config', () => {
    const el = createElement('div', null);
    expect(el.props).toEqual({});
  });

  it('handles undefined config', () => {
    const el = createElement('div', undefined as unknown as null);
    expect(el.props).toEqual({});
  });

  it('handles no children', () => {
    const el = createElement('div', { id: 'x' });
    expect(el.props.children).toBeUndefined();
  });

  it('handles null children in the children list', () => {
    const el = createElement('div', null, null, 'text', null);
    expect(el.props.children).toEqual([null, 'text', null]);
  });

  it('handles boolean children', () => {
    const el = createElement('div', null, true, false, 'visible');
    expect(el.props.children).toEqual([true, false, 'visible']);
  });

  it('handles numeric children', () => {
    const el = createElement('div', null, 0, 42);
    expect(el.props.children).toEqual([0, 42]);
  });
});
