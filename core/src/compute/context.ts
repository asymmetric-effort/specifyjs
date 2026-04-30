// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type {
  BackendInfo,
  ComputeBackend,
  ComputeContext,
  KernelName,
  KernelParams,
  KernelResult,
} from './types';
import { CpuBackend } from './cpu-backend';
import { WebGpuBackend } from './webgpu-backend';
import { WebGlBackend } from './webgl-backend';

// ---------------------------------------------------------------------------
// Module-level state
// ---------------------------------------------------------------------------

/** Cached backend instance, created by {@link createComputeContext}. */
let _cachedBackend: ComputeBackend | null = null;

/**
 * If set, {@link createComputeContext} skips auto-detection and uses this
 * backend directly.
 */
let _forcedBackendName: BackendInfo['name'] | null = null;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Force a specific backend for all subsequent {@link createComputeContext}
 * calls.
 *
 * Passing a new value clears the cached backend so the next
 * {@link createComputeContext} call will create a fresh instance.
 *
 * @param name - Backend to use ('webgpu', 'webgl', or 'cpu').
 */
export function setComputeBackend(name: 'webgpu' | 'webgl' | 'cpu'): void {
  _forcedBackendName = name;
  _cachedBackend = null;
}

/**
 * Create (or return the cached) {@link ComputeContext}.
 *
 * Auto-detection order: WebGPU -> WebGL -> CPU.
 * The first backend that reports {@link ComputeBackend.isAvailable | isAvailable()}
 * is initialised and cached for the lifetime of the page.
 */
export async function createComputeContext(): Promise<ComputeContext> {
  if (_cachedBackend) {
    return _wrapBackend(_cachedBackend);
  }

  const backend = await _resolveBackend();
  _cachedBackend = backend;
  return _wrapBackend(backend);
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/** Instantiate a backend by name. */
function _backendByName(name: BackendInfo['name']): ComputeBackend {
  switch (name) {
    /* v8 ignore next 4 -- GPU backends not available in jsdom tests */
    case 'webgpu':
      return new WebGpuBackend();
    case 'webgl':
      return new WebGlBackend();
    case 'cpu':
      return new CpuBackend();
  }
}

/** Resolve the best available backend, honouring any forced override. */
async function _resolveBackend(): Promise<ComputeBackend> {
  if (_forcedBackendName) {
    const backend = _backendByName(_forcedBackendName);
    await backend.init();
    return backend;
  }

  /* v8 ignore start -- GPU auto-detection requires real browser with GPU */
  // Auto-detection chain: WebGPU -> WebGL -> CPU
  const candidates: ComputeBackend[] = [new WebGpuBackend(), new WebGlBackend(), new CpuBackend()];

  for (let i = 0; i < candidates.length; i++) {
    const candidate = candidates[i]!;
    if (candidate.isAvailable()) {
      try {
        await candidate.init();
        return candidate;
      } catch {
        // Init failed — try the next candidate.
      }
    }
  }

  // CPU backend is always available; this is a defensive fallback.
  const cpu = new CpuBackend();
  await cpu.init();
  return cpu;
  /* v8 ignore stop */
}

/** Wrap a backend in the public {@link ComputeContext} interface. */
function _wrapBackend(backend: ComputeBackend): ComputeContext {
  return {
    execute(kernel: KernelName, params: KernelParams): Promise<KernelResult> {
      return backend.execute(kernel, params);
    },
    getBackendInfo(): BackendInfo {
      return backend.info;
    },
    dispose(): void {
      backend.dispose();
      if (_cachedBackend === backend) {
        _cachedBackend = null;
      }
    },
  };
}
