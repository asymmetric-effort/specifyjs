import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import {
  getBreakpoints,
  configureBreakpoints,
  breakpointQuery,
  __resetBreakpoints,
} from '../../../src/hooks/breakpoints';
import type { Breakpoint } from '../../../src/hooks/breakpoints';

beforeEach(() => {
  __resetBreakpoints();
});

describe('breakpoints', () => {
  describe('getBreakpoints', () => {
    it('returns default breakpoints', () => {
      const bp = getBreakpoints();
      expect(bp).toEqual({
        xs: 0,
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      });
    });

    it('returns a copy, not the internal object', () => {
      const bp1 = getBreakpoints();
      const bp2 = getBreakpoints();
      expect(bp1).toEqual(bp2);
      // Mutating the returned copy should not affect future calls
      bp1.sm = 999;
      expect(getBreakpoints().sm).toBe(640);
    });
  });

  describe('configureBreakpoints', () => {
    it('overrides specific breakpoints while keeping defaults for others', () => {
      configureBreakpoints({ sm: 500, lg: 1000 });
      const bp = getBreakpoints();
      expect(bp.xs).toBe(0);
      expect(bp.sm).toBe(500);
      expect(bp.md).toBe(768);
      expect(bp.lg).toBe(1000);
      expect(bp.xl).toBe(1280);
      expect(bp['2xl']).toBe(1536);
    });

    it('can override all breakpoints', () => {
      configureBreakpoints({ xs: 10, sm: 20, md: 30, lg: 40, xl: 50, '2xl': 60 });
      const bp = getBreakpoints();
      expect(bp).toEqual({ xs: 10, sm: 20, md: 30, lg: 40, xl: 50, '2xl': 60 });
    });

    it('can be called multiple times; later calls merge with defaults', () => {
      configureBreakpoints({ sm: 500 });
      configureBreakpoints({ md: 800 });
      const bp = getBreakpoints();
      // Second call resets sm back to default since it merges with defaults
      expect(bp.sm).toBe(640);
      expect(bp.md).toBe(800);
    });
  });

  describe('breakpointQuery', () => {
    it('returns a min-width media query for each breakpoint', () => {
      expect(breakpointQuery('xs')).toBe('(min-width: 0px)');
      expect(breakpointQuery('sm')).toBe('(min-width: 640px)');
      expect(breakpointQuery('md')).toBe('(min-width: 768px)');
      expect(breakpointQuery('lg')).toBe('(min-width: 1024px)');
      expect(breakpointQuery('xl')).toBe('(min-width: 1280px)');
      expect(breakpointQuery('2xl')).toBe('(min-width: 1536px)');
    });

    it('reflects configured breakpoints', () => {
      configureBreakpoints({ sm: 500 });
      expect(breakpointQuery('sm')).toBe('(min-width: 500px)');
    });
  });

  describe('__resetBreakpoints', () => {
    it('restores defaults after configuration', () => {
      configureBreakpoints({ sm: 999, lg: 999 });
      __resetBreakpoints();
      const bp = getBreakpoints();
      expect(bp.sm).toBe(640);
      expect(bp.lg).toBe(1024);
    });
  });
});
