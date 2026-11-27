// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * createVizTheme — create a custom theme by deep-merging overrides
 * onto a built-in base theme.
 */

import type { VizTheme } from './VizTheme.types';
import { getVizTheme } from './getVizTheme';
import { deepFreeze } from './freeze';

/** Recursively merge source into target, returning a new object. */
function deepMerge<T extends Record<string, unknown>>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const srcVal = source[key];
    const tgtVal = target[key];
    if (
      typeof srcVal === 'object' &&
      srcVal !== null &&
      !Array.isArray(srcVal) &&
      typeof tgtVal === 'object' &&
      tgtVal !== null &&
      !Array.isArray(tgtVal)
    ) {
      result[key] = deepMerge(
        tgtVal as Record<string, unknown>,
        srcVal as Record<string, unknown>,
      ) as T[keyof T];
    } else if (srcVal !== undefined) {
      result[key] = srcVal as T[keyof T];
    }
  }
  return result;
}

/**
 * Create a custom VizTheme by merging overrides onto a built-in base.
 *
 * @param base - The base theme name ('casual' or 'crisp')
 * @param overrides - Partial theme tokens to override
 * @returns A new frozen VizTheme
 *
 * @example
 * ```ts
 * const myTheme = createVizTheme('crisp', {
 *   fontSize: { axis: '10px' },  // only axis changes; label and title preserved
 *   lineCap: 'round',
 * });
 * ```
 */
export function createVizTheme(
  base: 'casual' | 'crisp',
  overrides: Partial<VizTheme>,
): VizTheme {
  const baseTheme = getVizTheme(base);
  // Work with unfrozen copies for merging
  const unfrozen = JSON.parse(JSON.stringify(baseTheme)) as VizTheme;
  const merged = deepMerge(
    unfrozen as unknown as Record<string, unknown>,
    overrides as unknown as Record<string, unknown>,
  ) as unknown as VizTheme;
  return deepFreeze(merged);
}
