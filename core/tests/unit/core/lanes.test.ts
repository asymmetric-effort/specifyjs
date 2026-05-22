import { describe, it, expect } from 'vitest';
import {
  NoLanes,
  SyncLane,
  InputContinuousLane,
  DefaultLane,
  TransitionLane1,
  TransitionLane2,
  IdleLane,
  OffscreenLane,
  NonIdleLanes,
  mergeLanes,
  isSubsetOfLanes,
  includesSomeLane,
  removeLanes,
  getHighestPriorityLane,
  isEmpty,
  laneExpirationMs,
  claimNextTransitionLane,
} from '../../../src/core/lanes';

describe('lane constants', () => {
  it('are distinct powers of two', () => {
    const lanes = [
      SyncLane,
      InputContinuousLane,
      DefaultLane,
      TransitionLane1,
      TransitionLane2,
      32,
      IdleLane,
      OffscreenLane,
    ];
    for (let i = 0; i < lanes.length; i++) {
      for (let j = i + 1; j < lanes.length; j++) {
        expect(lanes[i] & lanes[j]).toBe(0);
      }
    }
  });

  it('NoLanes is zero', () => {
    expect(NoLanes).toBe(0);
  });

  it('NonIdleLanes excludes IdleLane and OffscreenLane', () => {
    expect(NonIdleLanes & IdleLane).toBe(0);
    expect(NonIdleLanes & OffscreenLane).toBe(0);
    expect(NonIdleLanes & SyncLane).toBe(SyncLane);
    expect(NonIdleLanes & DefaultLane).toBe(DefaultLane);
  });
});

describe('mergeLanes', () => {
  it('combines two lane sets', () => {
    expect(mergeLanes(SyncLane, DefaultLane)).toBe(SyncLane | DefaultLane);
  });

  it('is idempotent', () => {
    expect(mergeLanes(SyncLane, SyncLane)).toBe(SyncLane);
  });

  it('merging with NoLanes is identity', () => {
    expect(mergeLanes(DefaultLane, NoLanes)).toBe(DefaultLane);
  });
});

describe('isSubsetOfLanes', () => {
  it('returns true when subset is contained', () => {
    const set = SyncLane | DefaultLane | TransitionLane1;
    expect(isSubsetOfLanes(set, SyncLane)).toBe(true);
    expect(isSubsetOfLanes(set, SyncLane | DefaultLane)).toBe(true);
  });

  it('returns false when subset is not fully contained', () => {
    expect(isSubsetOfLanes(SyncLane, DefaultLane)).toBe(false);
  });

  it('empty is subset of everything', () => {
    expect(isSubsetOfLanes(SyncLane, NoLanes)).toBe(true);
  });
});

describe('includesSomeLane', () => {
  it('returns true when sets overlap', () => {
    expect(includesSomeLane(SyncLane | DefaultLane, DefaultLane)).toBe(true);
  });

  it('returns false when sets are disjoint', () => {
    expect(includesSomeLane(SyncLane, DefaultLane)).toBe(false);
  });

  it('returns false for NoLanes', () => {
    expect(includesSomeLane(SyncLane, NoLanes)).toBe(false);
  });
});

describe('removeLanes', () => {
  it('removes specified lanes', () => {
    const set = SyncLane | DefaultLane | TransitionLane1;
    expect(removeLanes(set, DefaultLane)).toBe(SyncLane | TransitionLane1);
  });

  it('removing non-present lane is no-op', () => {
    expect(removeLanes(SyncLane, DefaultLane)).toBe(SyncLane);
  });
});

describe('getHighestPriorityLane', () => {
  it('returns the lowest set bit (highest priority)', () => {
    expect(getHighestPriorityLane(DefaultLane | TransitionLane1 | IdleLane)).toBe(DefaultLane);
    expect(getHighestPriorityLane(SyncLane | DefaultLane)).toBe(SyncLane);
    expect(getHighestPriorityLane(TransitionLane1 | IdleLane)).toBe(TransitionLane1);
  });

  it('returns the lane itself for a single lane', () => {
    expect(getHighestPriorityLane(IdleLane)).toBe(IdleLane);
  });

  it('returns 0 for NoLanes', () => {
    expect(getHighestPriorityLane(NoLanes)).toBe(0);
  });
});

describe('isEmpty', () => {
  it('returns true for NoLanes', () => {
    expect(isEmpty(NoLanes)).toBe(true);
  });

  it('returns false for any lane', () => {
    expect(isEmpty(SyncLane)).toBe(false);
  });
});

describe('laneExpirationMs', () => {
  it('SyncLane and InputContinuousLane never expire', () => {
    expect(laneExpirationMs(SyncLane)).toBe(-1);
    expect(laneExpirationMs(InputContinuousLane)).toBe(-1);
  });

  it('DefaultLane and TransitionLanes expire after 5s', () => {
    expect(laneExpirationMs(DefaultLane)).toBe(5000);
    expect(laneExpirationMs(TransitionLane1)).toBe(5000);
    expect(laneExpirationMs(TransitionLane2)).toBe(5000);
  });

  it('IdleLane never expires', () => {
    expect(laneExpirationMs(IdleLane)).toBe(-1);
  });

  it('unknown lane returns -1', () => {
    expect(laneExpirationMs(0b11111111_11111111)).toBe(-1);
  });
});

describe('claimNextTransitionLane', () => {
  it('alternates between TransitionLane1 and TransitionLane2', () => {
    const first = claimNextTransitionLane();
    const second = claimNextTransitionLane();
    expect(first).not.toBe(second);
    expect([TransitionLane1, TransitionLane2]).toContain(first);
    expect([TransitionLane1, TransitionLane2]).toContain(second);
  });
});
