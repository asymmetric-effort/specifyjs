// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from '@asymmetric-effort/nogginlessdom';
import {
  generateInputs,
  computeSync,
  computeAsync,
  evaluateFunction,
  type RangeSpec,
} from '../../../src/shared/async-compute';

describe('generateInputs', () => {
  it('generates correct inputs for a simple range', () => {
    const inputs = generateInputs({ start: 0, end: 5, step: 1 });
    expect(inputs).toEqual([0, 1, 2, 3, 4, 5]);
  });

  it('generates correct inputs for fractional step', () => {
    const inputs = generateInputs({ start: 0, end: 1, step: 0.25 });
    expect(inputs).toEqual([0, 0.25, 0.5, 0.75, 1]);
  });

  it('handles negative range', () => {
    const inputs = generateInputs({ start: -2, end: 2, step: 1 });
    expect(inputs).toEqual([-2, -1, 0, 1, 2]);
  });

  it('returns empty for zero step', () => {
    expect(generateInputs({ start: 0, end: 10, step: 0 })).toEqual([]);
  });

  it('returns empty for negative step', () => {
    expect(generateInputs({ start: 0, end: 10, step: -1 })).toEqual([]);
  });

  it('returns single point when start === end', () => {
    const inputs = generateInputs({ start: 5, end: 5, step: 1 });
    expect(inputs).toEqual([5]);
  });

  it('caps at 1 million inputs', () => {
    const inputs = generateInputs({ start: 0, end: 2_000_000, step: 1 });
    expect(inputs).toEqual([]);
  });
});

describe('computeSync', () => {
  it('evaluates a function for all inputs', () => {
    const fn = (x: number) => x * 2;
    const result = computeSync(fn, [1, 2, 3]);
    expect(result).toEqual([
      { input: 1, output: 2 },
      { input: 2, output: 4 },
      { input: 3, output: 6 },
    ]);
  });

  it('skips non-finite results', () => {
    const fn = (x: number) => (x === 0 ? Infinity : 1 / x);
    const result = computeSync(fn, [0, 1, 2]);
    expect(result).toEqual([
      { input: 1, output: 1 },
      { input: 2, output: 0.5 },
    ]);
  });

  it('handles empty input', () => {
    expect(computeSync((x) => x, [])).toEqual([]);
  });
});

describe('computeAsync', () => {
  it('calls onProgress with all results when done', async () => {
    const fn = (x: number) => x * x;
    const inputs = [1, 2, 3, 4, 5];

    const result = await new Promise<{ input: number; output: number }[]>((resolve) => {
      computeAsync(fn, inputs, 100, (results, done) => {
        if (done) resolve(results);
      });
    });

    expect(result).toEqual([
      { input: 1, output: 1 },
      { input: 2, output: 4 },
      { input: 3, output: 9 },
      { input: 4, output: 16 },
      { input: 5, output: 25 },
    ]);
  });

  it('can be cancelled', async () => {
    const fn = vi.fn((x: number) => x);
    const inputs = Array.from({ length: 1000 }, (_, i) => i);
    const onProgress = vi.fn();

    const cancel = computeAsync(fn, inputs, 10, onProgress);
    cancel();

    // Wait a tick for potential async callback
    await new Promise((r) => setTimeout(r, 50));

    // Should have processed at most one batch before cancellation
    expect(fn.mock.calls.length).toBeLessThanOrEqual(10);
  });
});

describe('evaluateFunction', () => {
  it('computes synchronously when sync=true', () => {
    const onResult = vi.fn();
    const { points } = evaluateFunction(
      { fn: (x) => x + 1, range: { start: 0, end: 3, step: 1 }, sync: true },
      onResult,
    );
    expect(points).toEqual([
      { input: 0, output: 1 },
      { input: 1, output: 2 },
      { input: 2, output: 3 },
      { input: 3, output: 4 },
    ]);
    expect(onResult).toHaveBeenCalled();
  });

  it('returns null initially in async mode', () => {
    const onResult = vi.fn();
    const { points, cancel } = evaluateFunction(
      { fn: (x) => x, range: { start: 0, end: 10, step: 1 } },
      onResult,
    );
    expect(points).toBeNull();
    cancel();
  });

  it('completes async evaluation and calls onResult', async () => {
    const onResult = vi.fn();
    evaluateFunction(
      { fn: (x) => x * 3, range: { start: 0, end: 2, step: 1 }, batchSize: 10 },
      onResult,
    );
    // Wait for async batches to complete
    await new Promise((r) => setTimeout(r, 200));
    expect(onResult).toHaveBeenCalledWith([
      { input: 0, output: 0 },
      { input: 1, output: 3 },
      { input: 2, output: 6 },
    ]);
  });
});

describe('computeAsync progress', () => {
  it('calls onProgress with partial results during computation', async () => {
    const fn = (x: number) => x;
    const inputs = Array.from({ length: 50 }, (_, i) => i);
    const progressCalls: number[] = [];

    await new Promise<void>((resolve) => {
      computeAsync(fn, inputs, 10, (results, done) => {
        progressCalls.push(results.length);
        if (done) resolve();
      });
    });

    // Should have had multiple progress calls
    expect(progressCalls.length).toBeGreaterThan(1);
    // Final call should have all 50 results
    expect(progressCalls[progressCalls.length - 1]).toBe(50);
  });
});
