// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Async function evaluation engine for graph components.
 *
 * Computes f(x) for a range of x values in batches, yielding to the
 * browser between batches so the UI remains responsive. When all values
 * are computed, calls the onComplete callback with the results.
 *
 * Two modes:
 * - **async** (default): computes in batches via requestIdleCallback/setTimeout
 * - **sync**: computes all values immediately in one pass
 */

/** A single computed point. */
export interface ComputedPoint {
  input: number;
  output: number;
}

/** Range specification: start, end, step. */
export interface RangeSpec {
  start: number;
  end: number;
  step: number;
}

/** Options for async computation. */
export interface AsyncComputeOptions {
  /** The function to evaluate */
  fn: (x: number) => number;
  /** Range of input values */
  range: RangeSpec;
  /** If true, compute synchronously (blocking). Default: false (async). */
  sync?: boolean;
  /** Batch size for async mode — how many evaluations per idle tick (default: 200) */
  batchSize?: number;
}

/**
 * Generate the full set of input values for a range.
 */
export function generateInputs(range: RangeSpec): number[] {
  const { start, end, step } = range;
  if (step <= 0 || !isFinite(step)) return [];
  const count = Math.ceil((end - start) / step) + 1;
  // Safety cap to prevent memory explosion
  if (count > 1_000_000) return [];
  const inputs: number[] = [];
  for (let i = 0; i < count; i++) {
    const x = start + i * step;
    if (x > end + step * 0.001) break;
    inputs.push(x);
  }
  return inputs;
}

/**
 * Compute all values synchronously.
 */
export function computeSync(fn: (x: number) => number, inputs: number[]): ComputedPoint[] {
  const results: ComputedPoint[] = [];
  for (let i = 0; i < inputs.length; i++) {
    const x = inputs[i]!;
    const y = fn(x);
    if (isFinite(y)) {
      results.push({ input: x, output: y });
    }
  }
  return results;
}

/**
 * Compute values asynchronously in batches.
 * Returns a cancel function.
 *
 * @param fn - The function to evaluate
 * @param inputs - Array of input values
 * @param batchSize - How many evaluations per tick
 * @param onProgress - Called after each batch with results so far
 * @param onComplete - Called when all values are computed
 * @returns A cancel function to abort computation
 */
export function computeAsync(
  fn: (x: number) => number,
  inputs: number[],
  batchSize: number,
  onProgress: (results: ComputedPoint[], done: boolean) => void,
): () => void {
  let cancelled = false;
  let cursor = 0;
  const results: ComputedPoint[] = [];

  const processBatch = () => {
    if (cancelled) return;

    const end = Math.min(cursor + batchSize, inputs.length);
    for (let i = cursor; i < end; i++) {
      const x = inputs[i]!;
      const y = fn(x);
      if (isFinite(y)) {
        results.push({ input: x, output: y });
      }
    }
    cursor = end;

    if (cursor >= inputs.length) {
      onProgress(results, true);
      return;
    }

    // Yield to browser, then continue
    onProgress(results, false);
    scheduleNextBatch(processBatch);
  };

  scheduleNextBatch(processBatch);

  return () => {
    cancelled = true;
  };
}

/**
 * Schedule the next batch using the best available API.
 */
function scheduleNextBatch(fn: () => void): void {
  /* v8 ignore next 3 -- requestIdleCallback not available in jsdom test environment */
  if (typeof requestIdleCallback === 'function') {
    requestIdleCallback(() => fn(), { timeout: 16 });
  } else {
    setTimeout(fn, 0);
  }
}

/**
 * High-level: evaluate a function over a range, async by default.
 *
 * @returns For sync mode: the computed points immediately.
 *          For async mode: null initially (use the callback).
 */
export function evaluateFunction(
  options: AsyncComputeOptions,
  onResult: (points: ComputedPoint[]) => void,
): { points: ComputedPoint[] | null; cancel: () => void } {
  const { fn, range, sync = false, batchSize = 200 } = options;
  const inputs = generateInputs(range);

  if (sync) {
    const points = computeSync(fn, inputs);
    onResult(points);
    return { points, cancel: () => {} };
  }

  const cancel = computeAsync(fn, inputs, batchSize, (results, done) => {
    if (done) {
      onResult(results);
    }
  });

  return { points: null, cancel };
}
