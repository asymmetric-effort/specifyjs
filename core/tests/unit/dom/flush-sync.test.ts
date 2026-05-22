import { describe, it, expect, fn, spyOn, mock } from '@asymmetric-effort/nogginlessdom';
import { flushSync } from '../../../src/dom/flush-sync';

describe('flushSync', () => {
  it('executes the callback synchronously', () => {
    const mockFn = fn(() => 42);
    const result = flushSync(mockFn);
    expect(mockFn).toHaveBeenCalledTimes(1);
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
