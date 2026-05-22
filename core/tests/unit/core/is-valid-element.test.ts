import { describe, it, expect } from 'vitest';
import { createElement, isValidElement } from '../../../src/index';

describe('isValidElement', () => {
  // Happy path
  it('returns true for a valid element', () => {
    const el = createElement('div', null);
    expect(isValidElement(el)).toBe(true);
  });

  it('returns true for element with children', () => {
    const el = createElement('div', null, 'hello');
    expect(isValidElement(el)).toBe(true);
  });

  it('returns true for function component element', () => {
    const Comp = () => null;
    const el = createElement(Comp, null);
    expect(isValidElement(el)).toBe(true);
  });

  // Sad path
  it('returns false for null', () => {
    expect(isValidElement(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isValidElement(undefined)).toBe(false);
  });

  it('returns false for a string', () => {
    expect(isValidElement('hello')).toBe(false);
  });

  it('returns false for a number', () => {
    expect(isValidElement(42)).toBe(false);
  });

  it('returns false for a plain object', () => {
    expect(isValidElement({ type: 'div' })).toBe(false);
  });

  it('returns false for an array', () => {
    expect(isValidElement([1, 2, 3])).toBe(false);
  });

  it('returns false for a boolean', () => {
    expect(isValidElement(true)).toBe(false);
  });
});
