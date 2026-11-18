// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * useWindowSize — Tracks browser viewport dimensions reactively.
 *
 * Uses a shared module-level store (like router-store.ts) so that all
 * components share a single resize listener. Returns `{ width: 0, height: 0 }`
 * during build-time pre-rendering.
 *
 * ```typescript
 * const { width, height } = useWindowSize();
 * ```
 */

import { useSyncExternalStore } from './index';

export interface WindowSize {
  width: number;
  height: number;
}

let currentSize: WindowSize =
  typeof window !== 'undefined'
    ? { width: window.innerWidth, height: window.innerHeight }
    : { width: 0, height: 0 };

const listeners = new Set<() => void>();
let listenerAttached = false;

function handleResize(): void {
  const w = window.innerWidth;
  const h = window.innerHeight;
  if (w === currentSize.width && h === currentSize.height) return;
  currentSize = { width: w, height: h };
  for (const cb of listeners) cb();
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  if (!listenerAttached && typeof window !== 'undefined') {
    window.addEventListener('resize', handleResize);
    listenerAttached = true;
  }
  return () => {
    listeners.delete(callback);
    if (listeners.size === 0 && listenerAttached) {
      window.removeEventListener('resize', handleResize);
      listenerAttached = false;
    }
  };
}

function getSnapshot(): WindowSize {
  return currentSize;
}

function getServerSnapshot(): WindowSize {
  return { width: 0, height: 0 };
}

/** Reset the cached window size. For testing only. */
export function __resetWindowSize(): void {
  currentSize =
    typeof window !== 'undefined'
      ? { width: window.innerWidth, height: window.innerHeight }
      : { width: 0, height: 0 };
}

/**
 * Returns the current window dimensions as `{ width, height }`.
 * Re-renders the component when the window is resized.
 */
export function useWindowSize(): WindowSize {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
