import { describe, it, expect, fn, spyOn, mock } from '@asymmetric-effort/nogginlessdom';
import {
  getCurrentTime,
  shouldYieldToHost,
  resetDeadline,
  scheduleCallback,
  cancelCallback,
  flushAllWork,
  hasPendingWork,
} from '../../../src/core/scheduler-host-config';

describe('getCurrentTime', () => {
  it('returns a number', () => {
    expect(typeof getCurrentTime()).toBe('number');
  });

  it('is monotonically non-decreasing', () => {
    const t1 = getCurrentTime();
    const t2 = getCurrentTime();
    expect(t2).toBeGreaterThanOrEqual(t1);
  });
});

describe('shouldYieldToHost', () => {
  it('returns false right after resetDeadline', () => {
    resetDeadline();
    expect(shouldYieldToHost()).toBe(false);
  });
});

describe('scheduleCallback + flushAllWork', () => {
  it('schedules and executes a callback', () => {
    const mockFn = fn(() => null);
    scheduleCallback(mockFn);
    expect(hasPendingWork()).toBe(true);
    flushAllWork();
    expect(mockFn).toHaveBeenCalledOnce();
    expect(hasPendingWork()).toBe(false);
  });

  it('handles continuation callbacks', () => {
    let callCount = 0;
    const contFn = (): any => {
      callCount++;
      if (callCount < 3) return contFn;
      return null;
    };
    scheduleCallback(contFn);
    flushAllWork();
    expect(callCount).toBe(3);
  });

  it('clears state after flushing', () => {
    const mockFn = fn(() => null);
    scheduleCallback(mockFn);
    flushAllWork();
    expect(hasPendingWork()).toBe(false);
  });
});

describe('cancelCallback', () => {
  it('marks callback node as cancelled', () => {
    const node = { callback: fn(() => null), cancelled: false };
    cancelCallback(node);
    expect(node.cancelled).toBe(true);
  });

  it('clears active callback when cancelled node matches', () => {
    const mockFn = fn(() => null);
    const node = scheduleCallback(mockFn);
    cancelCallback(node);
    expect(node.cancelled).toBe(true);
    // Flush should be a no-op since callback was cancelled
    flushAllWork();
    expect(mockFn).not.toHaveBeenCalled();
  });
});

describe('hasPendingWork', () => {
  it('returns false when no work is scheduled', () => {
    flushAllWork();
    expect(hasPendingWork()).toBe(false);
  });

  it('returns true after scheduling work', () => {
    scheduleCallback(() => null);
    expect(hasPendingWork()).toBe(true);
    flushAllWork();
  });
});
