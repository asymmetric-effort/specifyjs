// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Render Guard — Development-time detection of infinite render loops,
 * effect cycles, and unstable hook dependencies.
 *
 * All checks are designed for zero overhead in production:
 * - Guards only run when `__DEV__` is true (tree-shaken in prod builds)
 * - Per-fiber tracking uses WeakMap so fibers are GC'd normally
 * - Warnings are deduplicated (each unique message fires once)
 *
 * Three detection strategies:
 *
 * 1. **Render loop detection** — Tracks how many times a component renders
 *    within a single synchronous work cycle. If a component exceeds
 *    MAX_RENDERS_PER_CYCLE (default 50), an error is thrown to break
 *    the loop with a clear diagnostic message.
 *
 * 2. **Effect cycle detection** — Tracks how many times effects fire for
 *    a given fiber within a single commit cycle. If effects exceed
 *    MAX_EFFECTS_PER_CYCLE (default 25), a warning is emitted.
 *
 * 3. **Unstable dependency warnings** — Tracks effect dependency arrays
 *    across renders. If an effect's deps change on every single render
 *    for UNSTABLE_DEPS_THRESHOLD (default 5) consecutive renders,
 *    a warning is emitted suggesting useMemo/useCallback.
 */

import { warn, error } from './warnings';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Max renders per component before we throw (breaks the loop) */
const MAX_RENDERS_PER_CYCLE = 50;

/** Max effect executions per fiber per commit before warning */
const MAX_EFFECTS_PER_CYCLE = 25;

/** Consecutive renders where deps change before warning about instability */
const UNSTABLE_DEPS_THRESHOLD = 5;

// ---------------------------------------------------------------------------
// Render loop detection
// ---------------------------------------------------------------------------

interface RenderCount {
  count: number;
  cycleId: number;
}

/** Per-fiber render counts. Uses WeakMap so fibers can be GC'd. */
const fiberRenderCounts = new WeakMap<object, RenderCount>();

/** Monotonically increasing cycle ID. Incremented each time a new work
 *  cycle begins (performWork is called). */
let currentCycleId = 0;

/**
 * Call at the start of each work cycle (performWork).
 * Resets the cycle ID so per-fiber counts start fresh.
 */
export function beginRenderCycle(): void {
  currentCycleId++;
}

/**
 * Call before each component render in reconcileFunctionComponent.
 * Tracks render count per fiber per cycle. Throws if limit exceeded.
 *
 * @param fiber - The fiber being rendered (used as WeakMap key)
 * @param componentName - Display name for diagnostics
 */
export function trackRender(fiber: object, componentName: string): void {
  let entry = fiberRenderCounts.get(fiber);
  if (!entry || entry.cycleId !== currentCycleId) {
    entry = { count: 0, cycleId: currentCycleId };
    fiberRenderCounts.set(fiber, entry);
  }
  entry.count++;

  if (entry.count > MAX_RENDERS_PER_CYCLE) {
    const msg =
      `Maximum update depth exceeded. Component "${componentName}" ` +
      `re-rendered ${entry.count} times in a single cycle. This usually means ` +
      `a useEffect or setState call is creating an infinite loop. Check that ` +
      `useEffect dependencies are stable (use useMemo/useCallback for objects/arrays).`;
    error(msg);
    // Reset count to prevent cascading errors
    entry.count = 0;
    throw new Error(`[SpecifyJS] ${msg}`);
  }
}

// ---------------------------------------------------------------------------
// Effect cycle detection
// ---------------------------------------------------------------------------

interface EffectCount {
  count: number;
  commitId: number;
}

const fiberEffectCounts = new WeakMap<object, EffectCount>();
let currentCommitId = 0;

/**
 * Call at the start of each commit phase (commitRoot).
 */
export function beginCommitCycle(): void {
  currentCommitId++;
}

/**
 * Call before each effect execution in runEffects.
 * Warns if effects fire too many times per commit cycle.
 *
 * @param fiber - The fiber owning the effect
 * @param componentName - Display name for diagnostics
 */
export function trackEffect(fiber: object, componentName: string): void {
  let entry = fiberEffectCounts.get(fiber);
  if (!entry || entry.commitId !== currentCommitId) {
    entry = { count: 0, commitId: currentCommitId };
    fiberEffectCounts.set(fiber, entry);
  }
  entry.count++;

  if (entry.count > MAX_EFFECTS_PER_CYCLE) {
    warn(
      `Effect cycle detected in "${componentName}". Effects fired ` +
        `${entry.count} times in a single commit. This may indicate an effect ` +
        `that triggers a state update on every run. Ensure effect dependencies ` +
        `are correct and stable.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Unstable dependency warnings
// ---------------------------------------------------------------------------

interface DepsHistory {
  /** How many consecutive renders the deps changed */
  consecutiveChanges: number;
  /** Stringified deps from last render for comparison */
  lastDepsKey: string;
  /** Whether we already warned for this fiber+effect */
  warned: boolean;
}

const fiberDepsHistory = new WeakMap<object, Map<number, DepsHistory>>();

/**
 * Call when an effect's dependency comparison runs (in useEffect).
 * Detects deps that change on every render (unstable references).
 *
 * @param fiber - The fiber owning the effect
 * @param hookIndex - Which hook slot this effect occupies
 * @param deps - The current dependency array
 * @param depsChanged - Whether deps differed from previous render
 * @param componentName - Display name for diagnostics
 */
export function trackEffectDeps(
  fiber: object,
  hookIndex: number,
  deps: unknown[] | undefined,
  depsChanged: boolean,
  componentName: string,
): void {
  if (!deps) return; // No deps = runs every render (intentional)

  let fiberMap = fiberDepsHistory.get(fiber);
  if (!fiberMap) {
    fiberMap = new Map();
    fiberDepsHistory.set(fiber, fiberMap);
  }

  let history = fiberMap.get(hookIndex);
  if (!history) {
    history = { consecutiveChanges: 0, lastDepsKey: '', warned: false };
    fiberMap.set(hookIndex, history);
  }

  if (depsChanged) {
    history.consecutiveChanges++;
  } else {
    history.consecutiveChanges = 0;
  }

  if (history.consecutiveChanges >= UNSTABLE_DEPS_THRESHOLD && !history.warned) {
    history.warned = true;
    warn(
      `Unstable useEffect dependencies in "${componentName}" (hook #${hookIndex}). ` +
        `Dependencies changed on ${history.consecutiveChanges} consecutive renders. ` +
        `This may cause unnecessary effect re-runs. Wrap objects/arrays in useMemo ` +
        `and functions in useCallback to stabilize references.`,
    );
  }
}

// ---------------------------------------------------------------------------
// setState flood detection
// ---------------------------------------------------------------------------

interface StateSetCount {
  count: number;
  frameId: number;
}

const fiberStateSetCounts = new WeakMap<object, StateSetCount>();
let currentFrameId = 0;

/** Call once per browser frame / microtask batch to reset frame ID. */
export function beginFrame(): void {
  currentFrameId++;
}

/**
 * Call when setState/dispatch is invoked.
 * Warns if a single fiber calls setState too many times in one frame.
 *
 * @param fiber - The fiber calling setState
 * @param componentName - Display name for diagnostics
 */
export function trackStateUpdate(fiber: object, componentName: string): void {
  let entry = fiberStateSetCounts.get(fiber);
  if (!entry || entry.frameId !== currentFrameId) {
    entry = { count: 0, frameId: currentFrameId };
    fiberStateSetCounts.set(fiber, entry);
  }
  entry.count++;

  if (entry.count === 100) {
    warn(
      `Rapid state updates in "${componentName}": setState called ` +
        `${entry.count} times in a single frame. This may indicate ` +
        `a loop or missing dependency optimization.`,
    );
  }
}

// ---------------------------------------------------------------------------
// Reset (for testing)
// ---------------------------------------------------------------------------

export function resetRenderGuard(): void {
  currentCycleId = 0;
  currentCommitId = 0;
  currentFrameId = 0;
}
