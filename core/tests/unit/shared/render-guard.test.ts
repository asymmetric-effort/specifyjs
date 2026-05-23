// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from '@asymmetric-effort/nogginlessdom';
import {
  beginRenderCycle,
  trackRender,
  beginCommitCycle,
  trackEffect,
  trackEffectDeps,
  trackStateUpdate,
  beginFrame,
  resetRenderGuard,
} from '../../../src/shared/render-guard';
import { resetWarnings } from '../../../src/shared/warnings';

beforeEach(() => {
  resetRenderGuard();
  resetWarnings();
});

describe('Render loop detection', () => {
  it('allows normal render counts', () => {
    beginRenderCycle();
    const fiber = {};
    // 10 renders in a cycle should be fine
    for (let i = 0; i < 10; i++) {
      trackRender(fiber, 'TestComponent');
    }
  });

  it('throws when render count exceeds limit', () => {
    beginRenderCycle();
    const fiber = {};
    // Fill up to 50 (the limit)
    for (let i = 0; i < 50; i++) {
      trackRender(fiber, 'BadComponent');
    }
    // The 51st should throw
    expect(() => trackRender(fiber, 'BadComponent')).toThrow('Maximum update depth exceeded');
  });

  it('resets count on new cycle', () => {
    beginRenderCycle();
    const fiber = {};
    for (let i = 0; i < 40; i++) {
      trackRender(fiber, 'TestComponent');
    }
    // New cycle resets the count
    beginRenderCycle();
    // Should not throw — count reset
    for (let i = 0; i < 40; i++) {
      trackRender(fiber, 'TestComponent');
    }
  });

  it('tracks different fibers independently', () => {
    beginRenderCycle();
    const fiber1 = {};
    const fiber2 = {};
    for (let i = 0; i < 40; i++) {
      trackRender(fiber1, 'Component1');
      trackRender(fiber2, 'Component2');
    }
    // Neither should throw — each is under 50
  });
});

describe('Effect cycle detection', () => {
  it('allows normal effect counts', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginCommitCycle();
    const fiber = {};
    for (let i = 0; i < 10; i++) {
      trackEffect(fiber, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warns when effect count exceeds limit', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginCommitCycle();
    const fiber = {};
    for (let i = 0; i < 26; i++) {
      trackEffect(fiber, 'LoopyComponent');
    }
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Effect cycle detected'));
    spy.mockRestore();
  });

  it('resets count on new commit cycle', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginCommitCycle();
    const fiber = {};
    for (let i = 0; i < 20; i++) {
      trackEffect(fiber, 'TestComponent');
    }
    beginCommitCycle();
    for (let i = 0; i < 20; i++) {
      trackEffect(fiber, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('Unstable dependency warnings', () => {
  it('does not warn for stable deps', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fiber = {};
    // Deps don't change — should not warn
    for (let i = 0; i < 10; i++) {
      trackEffectDeps(fiber, 0, [1, 2, 3], false, 'StableComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warns when deps change on consecutive renders', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fiber = {};
    // Deps change every render
    for (let i = 0; i < 6; i++) {
      trackEffectDeps(fiber, 0, [i], true, 'UnstableComponent');
    }
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Unstable useEffect dependencies'));
    spy.mockRestore();
  });

  it('resets consecutive counter when deps stabilize', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fiber = {};
    // 3 changes, then stable, then 3 more — should not warn (never hits 5 consecutive)
    for (let i = 0; i < 3; i++) {
      trackEffectDeps(fiber, 0, [i], true, 'TestComponent');
    }
    trackEffectDeps(fiber, 0, [3], false, 'TestComponent'); // stable
    for (let i = 0; i < 3; i++) {
      trackEffectDeps(fiber, 0, [i + 10], true, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('skips tracking when deps is undefined', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const fiber = {};
    for (let i = 0; i < 10; i++) {
      trackEffectDeps(fiber, 0, undefined, true, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});

describe('setState flood detection', () => {
  it('allows normal setState frequency', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginFrame();
    const fiber = {};
    for (let i = 0; i < 50; i++) {
      trackStateUpdate(fiber, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });

  it('warns on rapid setState (100+ in one frame)', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginFrame();
    const fiber = {};
    for (let i = 0; i < 101; i++) {
      trackStateUpdate(fiber, 'FloodComponent');
    }
    expect(spy).toHaveBeenCalledWith(expect.stringContaining('Rapid state updates'));
    spy.mockRestore();
  });

  it('resets count on new frame', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    beginFrame();
    const fiber = {};
    for (let i = 0; i < 80; i++) {
      trackStateUpdate(fiber, 'TestComponent');
    }
    beginFrame();
    for (let i = 0; i < 80; i++) {
      trackStateUpdate(fiber, 'TestComponent');
    }
    expect(spy).not.toHaveBeenCalled();
    spy.mockRestore();
  });
});
