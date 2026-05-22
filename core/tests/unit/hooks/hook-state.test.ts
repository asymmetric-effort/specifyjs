import { describe, it, expect, beforeEach } from 'vitest';
import {
  setCurrentFiber,
  getCurrentFiber,
  allocateHook,
  areDepsEqual,
  pushEffect,
  getEffectList,
  EffectHookTag,
} from '../../../src/hooks/hook-state';
import { createHostRootFiber } from '../../../src/core/fiber';
import type { Fiber } from '../../../src/shared/types';

describe('hook-state', () => {
  let fiber: Fiber;

  beforeEach(() => {
    fiber = createHostRootFiber();
    setCurrentFiber(fiber);
  });

  describe('setCurrentFiber / getCurrentFiber', () => {
    it('sets and gets the current fiber', () => {
      expect(getCurrentFiber()).toBe(fiber);
    });

    it('clears the current fiber', () => {
      setCurrentFiber(null);
      expect(getCurrentFiber()).toBeNull();
    });
  });

  describe('allocateHook', () => {
    it('allocates a new hook on mount', () => {
      const hook = allocateHook();
      expect(hook).toBeDefined();
      expect(hook.memoizedState).toBeNull();
      expect(hook.queue).toBeNull();
      expect(hook.next).toBeNull();
    });

    it('links multiple hooks', () => {
      const hook1 = allocateHook();
      const hook2 = allocateHook();
      expect(hook1.next).toBe(hook2);
    });

    it('stores hooks on the fiber', () => {
      const hook = allocateHook();
      expect(fiber.memoizedState).toBe(hook);
    });

    it('throws when called outside a fiber', () => {
      setCurrentFiber(null);
      expect(() => allocateHook()).toThrow('Hooks can only be called inside a function component');
    });
  });

  describe('areDepsEqual', () => {
    it('returns true for same deps', () => {
      expect(areDepsEqual([1, 'a'], [1, 'a'])).toBe(true);
    });

    it('returns false for different deps', () => {
      expect(areDepsEqual([1], [2])).toBe(false);
    });

    it('returns false for different lengths', () => {
      expect(areDepsEqual([1], [1, 2])).toBe(false);
    });

    it('returns false when prev is undefined', () => {
      expect(areDepsEqual(undefined, [1])).toBe(false);
    });

    it('returns false when next is undefined', () => {
      expect(areDepsEqual([1], undefined)).toBe(false);
    });

    it('uses Object.is for comparison', () => {
      expect(areDepsEqual([NaN], [NaN])).toBe(true);
      expect(areDepsEqual([0], [-0])).toBe(false);
    });
  });

  describe('pushEffect / getEffectList', () => {
    it('pushes an effect', () => {
      const create = () => {};
      pushEffect(EffectHookTag.HasEffect | EffectHookTag.Passive, create, null, []);
      const list = getEffectList();
      expect(list).not.toBeNull();
      expect(list!.create).toBe(create);
    });

    it('chains effects', () => {
      const create1 = () => {};
      const create2 = () => {};
      pushEffect(EffectHookTag.HasEffect, create1, null, []);
      pushEffect(EffectHookTag.HasEffect, create2, null, []);
      const list = getEffectList();
      expect(list!.next).not.toBeNull();
      expect(list!.next!.create).toBe(create2);
    });

    it('returns null when no effects', () => {
      // Reset by setting a new fiber
      setCurrentFiber(createHostRootFiber());
      expect(getEffectList()).toBeNull();
    });
  });
});
