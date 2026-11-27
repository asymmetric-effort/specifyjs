// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { scaleValue, inverseScale, generateLogTicks } from '../src/log-scale';
import type { ScaleType } from '../src/log-scale';

// ---------------------------------------------------------------------------
// scaleValue
// ---------------------------------------------------------------------------

describe('scaleValue', () => {
  it('linear returns same value', () => {
    expect(scaleValue(42, 'linear', 10)).toBe(42);
    expect(scaleValue(0, 'linear', 10)).toBe(0);
    expect(scaleValue(-5, 'linear', 10)).toBe(-5);
  });

  it('log base 10: 1→0, 10→1, 100→2, 1000→3', () => {
    expect(scaleValue(1, 'log', 10)).toBe(0);
    expect(scaleValue(10, 'log', 10)).toBeCloseTo(1, 10);
    expect(scaleValue(100, 'log', 10)).toBeCloseTo(2, 10);
    expect(scaleValue(1000, 'log', 10)).toBeCloseTo(3, 10);
  });

  it('log base 2: 1→0, 2→1, 4→2, 8→3', () => {
    expect(scaleValue(1, 'log', 2)).toBe(0);
    expect(scaleValue(2, 'log', 2)).toBeCloseTo(1, 10);
    expect(scaleValue(4, 'log', 2)).toBeCloseTo(2, 10);
    expect(scaleValue(8, 'log', 2)).toBeCloseTo(3, 10);
  });

  it('zero returns 0 in log mode', () => {
    expect(scaleValue(0, 'log', 10)).toBe(0);
  });

  it('negative returns 0 in log mode', () => {
    expect(scaleValue(-5, 'log', 10)).toBe(0);
    expect(scaleValue(-100, 'log', 2)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// inverseScale
// ---------------------------------------------------------------------------

describe('inverseScale', () => {
  it('linear returns same value', () => {
    expect(inverseScale(42, 'linear', 10)).toBe(42);
    expect(inverseScale(0, 'linear', 10)).toBe(0);
  });

  it('log base 10: 0→1, 1→10, 2→100, 3→1000', () => {
    expect(inverseScale(0, 'log', 10)).toBeCloseTo(1, 10);
    expect(inverseScale(1, 'log', 10)).toBeCloseTo(10, 10);
    expect(inverseScale(2, 'log', 10)).toBeCloseTo(100, 10);
    expect(inverseScale(3, 'log', 10)).toBeCloseTo(1000, 10);
  });

  it('roundtrip: inverseScale(scaleValue(x)) ≈ x for positive values', () => {
    const values = [1, 5, 10, 42, 100, 1000, 0.5, 3.14];
    for (const x of values) {
      const scaled = scaleValue(x, 'log', 10);
      const roundtrip = inverseScale(scaled, 'log', 10);
      expect(roundtrip).toBeCloseTo(x, 8);
    }
  });

  it('roundtrip with base 2', () => {
    const values = [1, 2, 4, 8, 16, 32, 7.5];
    for (const x of values) {
      const scaled = scaleValue(x, 'log', 2);
      const roundtrip = inverseScale(scaled, 'log', 2);
      expect(roundtrip).toBeCloseTo(x, 8);
    }
  });

  it('roundtrip with base e', () => {
    const values = [1, Math.E, Math.E * Math.E, 10, 100];
    for (const x of values) {
      const scaled = scaleValue(x, 'log', Math.E);
      const roundtrip = inverseScale(scaled, 'log', Math.E);
      expect(roundtrip).toBeCloseTo(x, 8);
    }
  });
});

// ---------------------------------------------------------------------------
// generateLogTicks
// ---------------------------------------------------------------------------

describe('generateLogTicks', () => {
  it('produces powers of base 10', () => {
    const ticks = generateLogTicks(1, 10000, 10);
    expect(ticks).toContain(1);
    expect(ticks).toContain(10);
    expect(ticks).toContain(100);
    expect(ticks).toContain(1000);
    expect(ticks).toContain(10000);
  });

  it('produces powers of base 2', () => {
    const ticks = generateLogTicks(1, 16, 2);
    expect(ticks).toContain(1);
    expect(ticks).toContain(2);
    expect(ticks).toContain(4);
    expect(ticks).toContain(8);
    expect(ticks).toContain(16);
  });

  it('handles min less than 1 by clamping to 1', () => {
    const ticks = generateLogTicks(0.001, 100, 10);
    // Should include at least 1, 10, 100
    expect(ticks).toContain(1);
    expect(ticks).toContain(10);
    expect(ticks).toContain(100);
  });

  it('returns at least one tick for small ranges', () => {
    const ticks = generateLogTicks(5, 50, 10);
    expect(ticks.length).toBeGreaterThan(0);
    // Should include 1, 10, 100 (powers of 10 spanning that range)
    expect(ticks).toContain(1);
    expect(ticks).toContain(10);
    expect(ticks).toContain(100);
  });
});
