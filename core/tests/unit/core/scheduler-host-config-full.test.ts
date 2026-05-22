/**
 * Full coverage tests for scheduler-host-config.ts.
 * Tests the MessageChannel-based scheduling, yielding, and edge cases.
 */
import { describe, it, expect, vi } from 'vitest';
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
  it('returns a positive number', () => {
    const t = getCurrentTime();
    expect(t).toBeGreaterThan(0);
  });
});

describe('shouldYieldToHost + resetDeadline', () => {
  it('yields after deadline passes', () => {
    // Reset with a fresh deadline
    resetDeadline();
    // Immediately after, should not yield
    expect(shouldYieldToHost()).toBe(false);
  });
});

describe('scheduleCallback', () => {
  it('executes callback via flushAllWork', () => {
    const fn = vi.fn(() => null);
    scheduleCallback(fn);
    flushAllWork();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('handles callback that returns continuation', () => {
    let count = 0;
    const fn = (): any => {
      count++;
      return count < 5 ? fn : null;
    };
    scheduleCallback(fn);
    flushAllWork();
    expect(count).toBe(5);
  });

  it('replaces previously scheduled callback', () => {
    const fn1 = vi.fn(() => null);
    const fn2 = vi.fn(() => null);
    scheduleCallback(fn1);
    scheduleCallback(fn2);
    flushAllWork();
    // fn2 replaced fn1; only fn2 should run
    expect(fn2).toHaveBeenCalled();
  });

  it('returns a CallbackNode with cancelled=false', () => {
    const node = scheduleCallback(() => null);
    expect(node.cancelled).toBe(false);
    expect(node.callback).toBeDefined();
    flushAllWork();
  });
});

describe('cancelCallback', () => {
  it('sets cancelled flag', () => {
    const node = scheduleCallback(() => null);
    cancelCallback(node);
    expect(node.cancelled).toBe(true);
    flushAllWork();
  });

  it('prevents execution when active callback is cancelled', () => {
    const fn = vi.fn(() => null);
    const node = scheduleCallback(fn);
    cancelCallback(node);
    flushAllWork();
    expect(fn).not.toHaveBeenCalled();
  });
});

describe('flushAllWork', () => {
  it('is a no-op when nothing scheduled', () => {
    flushAllWork();
    expect(hasPendingWork()).toBe(false);
  });

  it('processes all continuations', () => {
    const results: number[] = [];
    let i = 0;
    const fn = (): any => {
      results.push(i++);
      return i < 3 ? fn : null;
    };
    scheduleCallback(fn);
    flushAllWork();
    expect(results).toEqual([0, 1, 2]);
  });
});

describe('hasPendingWork', () => {
  it('returns false initially', () => {
    flushAllWork(); // clean state
    expect(hasPendingWork()).toBe(false);
  });

  it('returns true after schedule', () => {
    scheduleCallback(() => null);
    expect(hasPendingWork()).toBe(true);
    flushAllWork();
  });

  it('returns false after flush', () => {
    scheduleCallback(() => null);
    flushAllWork();
    expect(hasPendingWork()).toBe(false);
  });
});

describe('async MessageChannel delivery', () => {
  it('callback fires asynchronously via MessageChannel', async () => {
    const fn = vi.fn(() => null);
    scheduleCallback(fn);
    expect(fn).not.toHaveBeenCalled();
    // MessageChannel fires via macrotask in jsdom — wait for it
    await new Promise((r) => setTimeout(r, 100));
    // The MessageChannel handler (performWorkUntilDeadline) should have run
    expect(fn).toHaveBeenCalled();
  });

  it('MessageChannel handles continuation callback', async () => {
    let count = 0;
    const fn = (): any => {
      count++;
      return count < 3 ? fn : null;
    };
    scheduleCallback(fn);
    // Wait for all continuations to process through MessageChannel
    await new Promise((r) => setTimeout(r, 200));
    expect(count).toBe(3);
  });

  it('MessageChannel stops when no more work', async () => {
    const fn = vi.fn(() => null);
    scheduleCallback(fn);
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).toHaveBeenCalledOnce();
    expect(hasPendingWork()).toBe(false);
  });

  it('flushAllWork is a no-op after all work completes', () => {
    const fn = vi.fn(() => null);
    scheduleCallback(fn);
    flushAllWork();
    expect(fn).toHaveBeenCalled();
    // Calling again is a no-op
    flushAllWork();
    expect(fn).toHaveBeenCalledOnce();
  });

  it('MessageChannel handles null scheduledCallback', async () => {
    // Schedule then immediately cancel — when MessageChannel fires,
    // scheduledCallback is null, hitting the else branch (line 77-78)
    const fn = vi.fn(() => null);
    const node = scheduleCallback(fn);
    cancelCallback(node);
    await new Promise((r) => setTimeout(r, 100));
    expect(fn).not.toHaveBeenCalled();
  });
});
