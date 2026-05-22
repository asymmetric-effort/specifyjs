import { describe, it, expect, vi } from 'vitest';
import { flushSync } from '../../../src/dom/flush-sync';

describe('flushSync', () => {
  it('executes the callback synchronously', () => {
    const fn = vi.fn(() => 42);
    const result = flushSync(fn);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(result).toBe(42);
  });

  it('returns the callback return value', () => {
    expect(flushSync(() => 'hello')).toBe('hello');
    expect(flushSync(() => null)).toBeNull();
    expect(flushSync(() => undefined)).toBeUndefined();
  });

  it('propagates errors from callback', () => {
    expect(() => {
      flushSync(() => {
        throw new Error('sync error');
      });
    }).toThrow('sync error');
  });

  it('works with void callbacks', () => {
    let sideEffect = false;
    flushSync(() => {
      sideEffect = true;
    });
    expect(sideEffect).toBe(true);
  });
});
