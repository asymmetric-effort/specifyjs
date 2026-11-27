// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Shared log-scale utility for chart components.
 *
 * Provides linear/logarithmic scaling, inverse scaling, and log-tick generation.
 * Default scale type is 'linear' (no visual change for existing consumers).
 */

export type ScaleType = 'linear' | 'log';

/**
 * Transform a value according to the given scale type.
 * For 'linear', returns the value unchanged.
 * For 'log', returns log_base(value). Zero/negative values are clamped to 0.
 */
export function scaleValue(value: number, scaleType: ScaleType, logBase: number): number {
  if (scaleType === 'linear') return value;
  if (value <= 0) return 0;
  return Math.log(value) / Math.log(logBase);
}

/**
 * Inverse of scaleValue — maps a scaled value back to the original domain.
 * For 'linear', returns the value unchanged.
 * For 'log', returns base^scaled.
 */
export function inverseScale(scaled: number, scaleType: ScaleType, logBase: number): number {
  if (scaleType === 'linear') return scaled;
  return Math.pow(logBase, scaled);
}

/**
 * Generate tick values for a logarithmic axis.
 * Returns powers of `logBase` that span from `min` to `max`.
 */
export function generateLogTicks(min: number, max: number, logBase: number): number[] {
  const ticks: number[] = [];
  const minPow = Math.floor(Math.log(Math.max(min, 1)) / Math.log(logBase));
  const maxPow = Math.ceil(Math.log(max) / Math.log(logBase));
  for (let p = minPow; p <= maxPow; p++) {
    ticks.push(Math.pow(logBase, p));
  }
  return ticks;
}
