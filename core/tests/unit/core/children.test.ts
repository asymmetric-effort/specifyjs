import { describe, it, expect, vi } from 'vitest';
import { createElement, Children } from '../../../src/index';

describe('Children', () => {
  describe('map', () => {
    it('maps over children', () => {
      const result = Children.map(['a', 'b', 'c'], (child, i) =>
        createElement('span', { key: i }, child),
      );
      expect(result).toHaveLength(3);
    });

    it('flattens nested arrays', () => {
      const result = Children.map([['a', 'b'], 'c'], (child) => child);
      expect(result).toHaveLength(3);
    });

    it('skips null and boolean children', () => {
      const result = Children.map([null, true, false, 'visible'], (child) => child);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('visible');
    });

    it('handles a single child (not array)', () => {
      const result = Children.map('single' as unknown as string[], (child) => child);
      expect(result).toHaveLength(1);
      expect(result[0]).toBe('single');
    });
  });

  describe('forEach', () => {
    it('iterates over children', () => {
      const fn = vi.fn();
      Children.forEach(['a', 'b'], fn);
      expect(fn).toHaveBeenCalledTimes(2);
      expect(fn).toHaveBeenCalledWith('a', 0);
      expect(fn).toHaveBeenCalledWith('b', 1);
    });

    it('skips null and boolean', () => {
      const fn = vi.fn();
      Children.forEach([null, false, 'x'], fn);
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('count', () => {
    it('counts renderable children', () => {
      expect(Children.count(['a', 'b', 'c'])).toBe(3);
    });

    it('excludes null, undefined, and booleans', () => {
      expect(Children.count([null, undefined, true, false, 'text', 0])).toBe(2);
    });

    it('flattens nested arrays for counting', () => {
      expect(Children.count([['a', 'b'], 'c'])).toBe(3);
    });
  });

  describe('only', () => {
    it('returns the child if it is a single valid element', () => {
      const child = createElement('div', null);
      expect(Children.only(child)).toBe(child);
    });

    it('throws if given a string', () => {
      expect(() => Children.only('text')).toThrow();
    });

    it('throws if given an array', () => {
      expect(() => Children.only([createElement('div', null)])).toThrow();
    });

    it('throws if given null', () => {
      expect(() => Children.only(null)).toThrow();
    });
  });

  describe('toArray', () => {
    it('converts children to a flat array', () => {
      const arr = Children.toArray([['a', 'b'], 'c']);
      expect(arr).toEqual(['a', 'b', 'c']);
    });

    it('filters out null, undefined, and booleans', () => {
      const arr = Children.toArray([null, true, 'x', undefined, false, 0]);
      expect(arr).toEqual(['x', 0]);
    });
  });
});
