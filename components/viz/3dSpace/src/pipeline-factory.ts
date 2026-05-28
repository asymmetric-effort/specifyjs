// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Auto-select the best available render pipeline for the client hardware.
 *
 * Detection order:
 * 1. WebGPU (navigator.gpu available + adapter + device)
 * 2. WebGL (canvas.getContext('webgl2') or 'webgl')
 * 3. CPU (canvas.getContext('2d'))
 */

import type { RenderPipeline } from './render-pipeline';
import { CpuPipeline } from './cpu-pipeline';
import { WebGLPipeline } from './webgl-pipeline';
import { WebGPUPipeline } from './webgpu-pipeline';

/**
 * Create the best available render pipeline for the given canvas.
 * Tries WebGPU first, then WebGL, then falls back to CPU.
 *
 * @param canvas - The target canvas element.
 * @returns The initialized pipeline (ready to call render()).
 */
export async function createPipeline(canvas: HTMLCanvasElement): Promise<RenderPipeline> {
  // 1. Try WebGPU
  try {
    const gpu = (navigator as any).gpu as GPU | undefined;
    if (gpu) {
      const adapter = await gpu.requestAdapter();
      if (adapter) {
        const pipeline = new WebGPUPipeline();
        await pipeline.initializeAsync(canvas);
        return pipeline;
      }
    }
  } catch {
    // WebGPU not available or failed — fall through
  }

  // 2. Try WebGL
  try {
    const testCtx = canvas.getContext('webgl2') || canvas.getContext('webgl');
    if (testCtx) {
      // Return the context so WebGLPipeline can use it
      // But WebGLPipeline.initialize acquires its own context, so we need to
      // release this one first. The canvas can only have one context type.
      // Since we already created a webgl context, WebGLPipeline will get it.
      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);
      return pipeline;
    }
  } catch {
    // WebGL not available — fall through
  }

  // 3. CPU fallback
  const pipeline = new CpuPipeline();
  pipeline.initialize(canvas);
  return pipeline;
}

/**
 * Synchronous pipeline creation — always returns CpuPipeline.
 * Use this when async initialization is not feasible.
 */
export function createPipelineSync(canvas: HTMLCanvasElement): RenderPipeline {
  const pipeline = new CpuPipeline();
  pipeline.initialize(canvas);
  return pipeline;
}
