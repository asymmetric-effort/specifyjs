// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Deep freeze utility for theme objects.
 * Recursively freezes all nested objects so theme tokens are immutable.
 */

export function deepFreeze<T extends object>(obj: T): T {
  Object.freeze(obj);
  for (const key of Object.keys(obj)) {
    const value = (obj as Record<string, unknown>)[key];
    if (typeof value === 'object' && value !== null && !Object.isFrozen(value)) {
      deepFreeze(value as object);
    }
  }
  return obj;
}
