import { describe, it, expect } from 'vitest';
import { createElement, cloneElement } from '../../../src/index';

describe('cloneElement', () => {
  // Happy path
  it('clones an element preserving type and props', () => {
    const original = createElement('div', { id: 'original' });
    const cloned = cloneElement(original);
    expect(cloned.type).toBe('div');
    expect(cloned.props.id).toBe('original');
    expect(cloned).not.toBe(original);
  });

  it('merges new props into the clone', () => {
    const original = createElement('div', { id: 'a', className: 'old' });
    const cloned = cloneElement(original, { className: 'new' });
    expect(cloned.props.id).toBe('a');
    expect(cloned.props.className).toBe('new');
  });

  it('overrides key in the clone', () => {
    const original = createElement('div', { key: 'old' });
    const cloned = cloneElement(original, { key: 'new' });
    expect(cloned.key).toBe('new');
  });

  it('overrides ref in the clone', () => {
    const ref1 = { current: null };
    const ref2 = { current: null };
    const original = createElement('div', { ref: ref1 });
    const cloned = cloneElement(original, { ref: ref2 });
    expect(cloned.ref).toBe(ref2);
  });

  it('replaces children when new children provided', () => {
    const original = createElement('div', null, 'old');
    const cloned = cloneElement(original, null, 'new');
    expect(cloned.props.children).toBe('new');
  });

  it('replaces children with multiple new children', () => {
    const original = createElement('div', null, 'old');
    const cloned = cloneElement(original, null, 'a', 'b');
    expect(cloned.props.children).toEqual(['a', 'b']);
  });

  it('preserves original key and ref when not overridden', () => {
    const ref = { current: null };
    const original = createElement('div', { key: 'k', ref });
    const cloned = cloneElement(original);
    expect(cloned.key).toBe('k');
    expect(cloned.ref).toBe(ref);
  });

  // Sad path
  it('throws when given a non-element', () => {
    expect(() => {
      cloneElement('not an element' as unknown as ReturnType<typeof createElement>, null);
    }).toThrow('cloneElement: argument must be a valid SpecifyJS element');
  });

  it('throws when given null', () => {
    expect(() => {
      cloneElement(null as unknown as ReturnType<typeof createElement>);
    }).toThrow();
  });
});
