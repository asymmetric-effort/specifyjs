// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Fiber } from '../shared/types';

/**
 * Internal hook state management.
 * Each fiber maintains a linked list of hook states.
 */

export interface Hook {
  memoizedState: unknown;
  queue: HookUpdate[] | null;
  next: Hook | null;
}

export interface HookUpdate {
  action: unknown;
}

export interface EffectHook {
  tag: EffectHookTag;
  create: () => void | (() => void);
  destroy: (() => void) | null | undefined;
  deps: readonly unknown[] | undefined;
  next: EffectHook | null;
}

export const enum EffectHookTag {
  NoEffect = 0,
  HasEffect = 1,
  Layout = 2,
  Passive = 4,
  Insertion = 8,
}

// The currently rendering fiber and its hook cursor
let currentlyRenderingFiber: Fiber | null = null;
let workInProgressHook: Hook | null = null;
let currentHook: Hook | null = null;
let hookIndex = 0;

// Effect lists per fiber
let effectListHead: EffectHook | null = null;
let effectListTail: EffectHook | null = null;

export function setCurrentFiber(fiber: Fiber | null): void {
  currentlyRenderingFiber = fiber;
  workInProgressHook = null;
  currentHook = null;
  hookIndex = 0;
  effectListHead = null;
  effectListTail = null;
}

export function getCurrentFiber(): Fiber | null {
  return currentlyRenderingFiber;
}

export function getCurrentHookIndex(): number {
  return hookIndex;
}

/* v8 ignore start -- internal utility, tested indirectly */
export function getHookIndex(): number {
  return hookIndex;
}
/* v8 ignore stop */

/**
 * Allocate the next hook slot for the currently rendering fiber.
 * On mount: creates a new hook.
 * On update: advances to the next existing hook.
 */
export function allocateHook(): Hook {
  let hook: Hook;

  if (currentlyRenderingFiber === null) {
    throw new Error('Hooks can only be called inside a function component.');
  }

  const alternate = currentlyRenderingFiber.alternate;

  if (alternate !== null) {
    // Update path: clone from the previous render
    if (currentHook === null) {
      currentHook = (alternate.memoizedState as Hook) ?? null;
    } else {
      currentHook = currentHook.next;
    }

    if (currentHook === null) {
      throw new Error('Rendered more hooks than during the previous render.');
    }

    hook = {
      memoizedState: currentHook.memoizedState,
      queue: currentHook.queue,
      next: null,
    };
  } else {
    // Mount path: create fresh hook
    hook = {
      memoizedState: null,
      queue: null,
      next: null,
    };
  }

  // Append to the fiber's hook linked list
  if (workInProgressHook === null) {
    currentlyRenderingFiber.memoizedState = hook;
    workInProgressHook = hook;
  } else {
    workInProgressHook.next = hook;
    workInProgressHook = hook;
  }

  hookIndex++;
  return hook;
}

/**
 * Push an effect onto the current fiber's effect list.
 */
export function pushEffect(
  tag: EffectHookTag,
  create: () => void | (() => void),
  destroy: (() => void) | null | undefined,
  deps: readonly unknown[] | undefined,
): EffectHook {
  const effect: EffectHook = {
    tag,
    create,
    destroy,
    deps,
    next: null,
  };

  if (effectListTail === null) {
    effectListHead = effect;
    effectListTail = effect;
  } else {
    effectListTail.next = effect;
    effectListTail = effect;
  }

  return effect;
}

export function getEffectList(): EffectHook | null {
  return effectListHead;
}

/**
 * Compare dependency arrays.
 */
export function areDepsEqual(
  prevDeps: readonly unknown[] | undefined,
  nextDeps: readonly unknown[] | undefined,
): boolean {
  if (prevDeps === undefined || nextDeps === undefined) {
    return false;
  }
  if (prevDeps.length !== nextDeps.length) {
    return false;
  }
  for (let i = 0; i < prevDeps.length; i++) {
    if (!Object.is(prevDeps[i], nextDeps[i])) {
      return false;
    }
  }
  return true;
}
