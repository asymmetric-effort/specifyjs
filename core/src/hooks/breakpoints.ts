// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Breakpoint configuration for responsive design hooks.
 *
 * Provides named breakpoints (xs through 2xl) with Tailwind CSS defaults.
 * Breakpoints can be customized globally via `configureBreakpoints`.
 */

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const DEFAULT_BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

let breakpoints = { ...DEFAULT_BREAKPOINTS };

/** Returns a copy of the current breakpoint configuration. */
export function getBreakpoints(): Record<Breakpoint, number> {
  return { ...breakpoints };
}

/** Override one or more breakpoint values. Unspecified breakpoints retain their defaults. */
export function configureBreakpoints(custom: Partial<Record<Breakpoint, number>>): void {
  breakpoints = { ...DEFAULT_BREAKPOINTS, ...custom };
}

/** Returns a `(min-width: Npx)` media query string for the named breakpoint. */
export function breakpointQuery(name: Breakpoint): string {
  return `(min-width: ${breakpoints[name]}px)`;
}

/** Reset breakpoints to defaults. For testing only. */
export function __resetBreakpoints(): void {
  breakpoints = { ...DEFAULT_BREAKPOINTS };
}
