// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Warning system for development-time diagnostics.
 * Warnings are suppressed in production builds (NODE_ENV === 'production').
 */

const MAX_WARNINGS = 1000;
const warnedMessages = new Set<string>();

/** True when running in a production environment. Bundlers tree-shake the guarded code. */
const IS_PRODUCTION =
  typeof process !== 'undefined' &&
  typeof process.env !== 'undefined' &&
  process.env.NODE_ENV === 'production';

/**
 * Issue a one-time warning (deduplicated by message).
 * Suppressed in production builds.
 */
export function warn(message: string): void {
  if (IS_PRODUCTION) return;
  if (warnedMessages.has(message)) return;
  if (warnedMessages.size >= MAX_WARNINGS) return;
  warnedMessages.add(message);

  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.warn(`[SpecifyJS] ${message}`);
  }
}

/**
 * Issue an error-level warning.
 * Suppressed in production builds.
 */
export function error(message: string): void {
  if (IS_PRODUCTION) return;
  if (typeof console !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(`[SpecifyJS] ${message}`);
  }
}

/**
 * Issue a deprecation warning (one-time, deduplicated).
 * @param oldApi - The deprecated API name
 * @param newApi - The replacement API name
 * @param removeVersion - The version when the deprecated API will be removed
 */
export function deprecate(oldApi: string, newApi: string, removeVersion: string): void {
  warn(
    `DEPRECATED: "${oldApi}" is deprecated and will be removed in v${removeVersion}. Use "${newApi}" instead.`,
  );
}

/**
 * Reset warned messages (for testing).
 */
export function resetWarnings(): void {
  warnedMessages.clear();
}
