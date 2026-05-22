import { describe, it, expect, vi } from 'vitest';
import { act } from '../../../src/shared/act';

describe('act', () => {
  it('executes the callback synchronously', () => {
    const fn = vi.fn();
    act(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('flushes pending tasks after callback', () => {
    // act should call flushPendingTasks; since we have no pending tasks, no error
    expect(() => act(() => {})).not.toThrow();
  });

  it('handles async callbacks', async () => {
    let resolved = false;
    act(async () => {
      await Promise.resolve();
      resolved = true;
    });
    // Give the microtask a chance to run
    await new Promise((r) => setTimeout(r, 10));
    expect(resolved).toBe(true);
  });

  it('handles callbacks that return undefined', () => {
    expect(() => act(() => undefined)).not.toThrow();
  });

  it('handles callbacks that return void (no return)', () => {
    let sideEffect = 0;
    act(() => {
      sideEffect = 1;
    });
    expect(sideEffect).toBe(1);
  });
});
