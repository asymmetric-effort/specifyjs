import { describe, it, expect, vi } from 'vitest';
import {
  startTransition,
  isInTransition,
  requestUpdateLane,
  enterFlushSyncContext,
  exitFlushSyncContext,
} from '../../../src/core/transitions';
import { DefaultLane, SyncLane, TransitionLane1, TransitionLane2 } from '../../../src/core/lanes';

describe('startTransition', () => {
  it('executes the callback synchronously', () => {
    const fn = vi.fn();
    startTransition(fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('marks isInTransition as true during callback', () => {
    let wasInTransition = false;
    startTransition(() => {
      wasInTransition = isInTransition();
    });
    expect(wasInTransition).toBe(true);
  });

  it('resets isInTransition after callback', () => {
    startTransition(() => {});
    expect(isInTransition()).toBe(false);
  });

  it('resets isInTransition even if callback throws', () => {
    expect(() => {
      startTransition(() => {
        throw new Error('oops');
      });
    }).toThrow('oops');
    expect(isInTransition()).toBe(false);
  });

  it('handles nested transitions', () => {
    let innerCheck = false;
    startTransition(() => {
      startTransition(() => {
        innerCheck = isInTransition();
      });
    });
    expect(innerCheck).toBe(true);
    expect(isInTransition()).toBe(false);
  });
});

describe('requestUpdateLane', () => {
  it('returns DefaultLane outside any context', () => {
    expect(requestUpdateLane()).toBe(DefaultLane);
  });

  it('returns a TransitionLane inside startTransition', () => {
    let lane = 0;
    startTransition(() => {
      lane = requestUpdateLane();
    });
    expect([TransitionLane1, TransitionLane2]).toContain(lane);
  });

  it('returns SyncLane inside flushSync context', () => {
    enterFlushSyncContext();
    expect(requestUpdateLane()).toBe(SyncLane);
    exitFlushSyncContext();
  });

  it('restores DefaultLane after startTransition', () => {
    startTransition(() => {});
    expect(requestUpdateLane()).toBe(DefaultLane);
  });

  it('flushSync takes precedence over transition context', () => {
    enterFlushSyncContext();
    let lane = 0;
    startTransition(() => {
      lane = requestUpdateLane();
    });
    // flushSync context should take precedence
    expect(lane).toBe(SyncLane);
    exitFlushSyncContext();
  });
});
