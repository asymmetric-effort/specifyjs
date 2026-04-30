// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

//
// WebGL compute-via-texture backend.
//
// Approach (future full implementation):
//   General-purpose compute on WebGL works by encoding numeric data into
//   floating-point textures, running a fragment shader that performs the
//   computation per-texel, and reading the result back via readPixels().
//
//   1. Pack each input buffer into an RGBA Float32 texture (4 values/texel).
//   2. Bind the textures as samplers in a full-screen-quad fragment shader.
//   3. The fragment shader reads neighbouring texels to implement the kernel
//      (e.g. dot-product accumulation for matrix multiply).
//   4. Render to an off-screen framebuffer backed by a Float32 texture.
//   5. Use readPixels to pull the result back to the CPU.
//
//   This technique is well-established (see GPGPU-on-WebGL literature) but
//   the full pipeline is complex. For now the backend delegates all kernel
//   execution to the CPU backend while exposing the correct backend
//   interface so that the auto-detection chain works correctly.
//

import type { BackendInfo, ComputeBackend, KernelName, KernelParams, KernelResult } from './types';
import { CpuBackend } from './cpu-backend';

// ---------------------------------------------------------------------------
// WebGlBackend
// ---------------------------------------------------------------------------

/**
 * WebGL compute backend.
 *
 * Currently delegates all computation to the CPU backend. The texture-based
 * compute pipeline described above will be implemented in a future release
 * once the kernel registry stabilises.
 */
/* v8 ignore start -- WebGL requires a real canvas/GPU, not available in jsdom tests */
export class WebGlBackend implements ComputeBackend {
  /** @inheritdoc */
  readonly info: BackendInfo = {
    name: 'webgl',
    isGPU: true,
    // WebGL textures are limited; 4096x4096 RGBA Float32 ≈ 256 MB
    maxBufferSize: 4096 * 4096 * 4 * 4,
  };

  /** CPU fallback used for all kernel execution at this stage. */
  private readonly _cpu = new CpuBackend();

  /**
   * Returns true when a WebGL rendering context can be created.
   *
   * Checks for WebGL2 first (required for float texture support without
   * extensions), then falls back to WebGL1.
   */
  isAvailable(): boolean {
    if (typeof document === 'undefined') return false;
    try {
      const canvas = document.createElement('canvas');
      const gl =
        canvas.getContext('webgl2') ??
        canvas.getContext('webgl') ??
        canvas.getContext('experimental-webgl');
      return gl !== null;
    } catch {
      return false;
    }
  }

  /** No async initialisation needed while delegating to CPU. */
  async init(): Promise<void> {
    // Future: create off-screen canvas and GL context here.
  }

  /**
   * Execute the kernel.
   *
   * Delegates to the CPU backend until the texture-based compute pipeline
   * is implemented.
   */
  async execute(kernel: KernelName, params: KernelParams): Promise<KernelResult> {
    return this._cpu.execute(kernel, params);
  }

  /** Release any GL resources (none held at this stage). */
  dispose(): void {
    // Future: delete textures, framebuffers, programs.
  }
}
/* v8 ignore stop */
