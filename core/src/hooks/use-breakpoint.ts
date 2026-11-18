// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * useBreakpoint — Returns the current responsive breakpoint name.
 * useBreakpointValue — Returns a value mapped to the current breakpoint.
 *
 * Both hooks use `useMediaQuery` internally. Breakpoint thresholds are
 * controlled via `configureBreakpoints` from `./breakpoints`.
 *
 * ```typescript
 * const bp = useBreakpoint(); // 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
 * const cols = useBreakpointValue({ xs: 1, sm: 2, md: 3, lg: 4 });
 * ```
 */

import { useMediaQuery } from './use-media-query';
import { breakpointQuery } from './breakpoints';
import type { Breakpoint } from './breakpoints';

const BREAKPOINT_ORDER: Breakpoint[] = ['2xl', 'xl', 'lg', 'md', 'sm', 'xs'];

/** Returns the name of the largest breakpoint whose min-width query matches. */
export function useBreakpoint(): Breakpoint {
  // Check from largest to smallest; first match wins
  const match2xl = useMediaQuery(breakpointQuery('2xl'));
  const matchXl = useMediaQuery(breakpointQuery('xl'));
  const matchLg = useMediaQuery(breakpointQuery('lg'));
  const matchMd = useMediaQuery(breakpointQuery('md'));
  const matchSm = useMediaQuery(breakpointQuery('sm'));

  if (match2xl) return '2xl';
  if (matchXl) return 'xl';
  if (matchLg) return 'lg';
  if (matchMd) return 'md';
  if (matchSm) return 'sm';
  return 'xs';
}

/**
 * Returns the value associated with the current breakpoint, falling back
 * to the next smaller breakpoint that has a value defined.
 */
export function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const current = useBreakpoint();
  const idx = BREAKPOINT_ORDER.indexOf(current);
  // Walk from current down to xs, return first defined value
  for (let i = idx; i < BREAKPOINT_ORDER.length; i++) {
    const val = values[BREAKPOINT_ORDER[i]!];
    if (val !== undefined) return val;
  }
  return undefined;
}
