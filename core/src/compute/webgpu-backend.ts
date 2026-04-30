// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { BackendInfo, ComputeBackend, KernelName, KernelParams, KernelResult } from './types';
import { CpuBackend } from './cpu-backend';

// ---------------------------------------------------------------------------
// WGSL shader source — reference implementation for matrix-multiply
// ---------------------------------------------------------------------------

/** WGSL compute shader for NxN matrix multiplication. */
const MATRIX_MULTIPLY_WGSL = /* wgsl */ `
struct Uniforms {
  size: u32,
};

@group(0) @binding(0) var<storage, read>       a:      array<f32>;
@group(0) @binding(1) var<storage, read>       b:      array<f32>;
@group(0) @binding(2) var<storage, read_write> result: array<f32>;
@group(0) @binding(3) var<uniform>             u:      Uniforms;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) gid: vec3<u32>) {
  let row = gid.x;
  let col = gid.y;
  let n   = u.size;
  if (row >= n || col >= n) { return; }

  var sum: f32 = 0.0;
  for (var k: u32 = 0u; k < n; k = k + 1u) {
    sum = sum + a[row * n + k] * b[k * n + col];
  }
  result[row * n + col] = sum;
}
`;

// ---------------------------------------------------------------------------
// WebGpuBackend
// ---------------------------------------------------------------------------

/**
 * WebGPU compute backend.
 *
 * When a real GPU device is available the backend compiles WGSL shaders and
 * dispatches compute workgroups. If the device cannot be obtained the backend
 * reports itself as unavailable during {@link init}.
 *
 * Shader execution paths are marked with `v8 ignore` because they require a
 * live GPU device which is not present in jsdom/unit-test environments.
 */
/* v8 ignore start -- entire WebGPU backend requires a live GPU device, not available in jsdom */
export class WebGpuBackend implements ComputeBackend {
  /** @inheritdoc */
  readonly info: BackendInfo = {
    name: 'webgpu',
    isGPU: true,
    maxBufferSize: 256 * 1024 * 1024, // 256 MB default; refined after init
  };

  /** GPU device handle — populated by {@link init}. */
  private _device: GPUDevice | null = null;

  /** CPU fallback used when GPU dispatch is not yet possible. */
  private readonly _cpuFallback = new CpuBackend();

  /** Reference to the WGSL shader source for matrix-multiply. */
  private readonly _matrixMultiplyWgsl = MATRIX_MULTIPLY_WGSL;

  /**
   * Returns true when the WebGPU API is exposed by the runtime.
   * This does not guarantee that a usable adapter exists — call {@link init}
   * to confirm device availability.
   */
  isAvailable(): boolean {
    return typeof navigator !== 'undefined' && navigator.gpu !== undefined;
  }

  /**
   * Request a GPU adapter and device. If neither can be obtained the backend
   * silently degrades; subsequent {@link execute} calls will throw.
   */
  async init(): Promise<void> {
    if (!this.isAvailable()) {
      return;
    }

    /* v8 ignore start — requires live GPU */
    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) return;

      this._device = await adapter.requestDevice();

      // Refine max buffer size from device limits
      const limits = this._device.limits;
      if (limits.maxBufferSize) {
        (this.info as { maxBufferSize: number }).maxBufferSize = limits.maxBufferSize;
      }
    } catch {
      this._device = null;
    }
    /* v8 ignore stop */
  }

  /**
   * Execute the named kernel on the GPU.
   *
   * If no device is available an error is thrown — callers should check
   * {@link isAvailable} or use the auto-detection in
   * {@link createComputeContext}.
   */
  async execute(kernel: KernelName, params: KernelParams): Promise<KernelResult> {
    if (!this._device) {
      throw new Error(
        'WebGpuBackend: no GPU device available. ' +
          'Use createComputeContext() for automatic fallback.',
      );
    }

    /* v8 ignore start — GPU dispatch requires live device */
    return this._dispatchKernel(kernel, params);
    /* v8 ignore stop */
  }

  /* v8 ignore start — GPU dispatch path */

  /**
   * Internal dispatch — compiles the appropriate WGSL shader and runs the
   * compute pipeline for the given kernel.
   */
  private async _dispatchKernel(kernel: KernelName, params: KernelParams): Promise<KernelResult> {
    const wgsl = this._getShaderSource(kernel);
    if (!wgsl) {
      // Kernels without a WGSL implementation fall back to CPU
      return this._cpuFallback.execute(kernel, params);
    }

    const device = this._device!;
    const module = device.createShaderModule({ code: wgsl });

    // Build bind group layout entries and GPU buffers
    const gpuBuffers: GPUBuffer[] = [];
    const entries: GPUBindGroupEntry[] = [];

    for (let i = 0; i < params.buffers.length; i++) {
      const buf = params.buffers[i]!;
      const gpuUsage =
        buf.usage === 'read'
          ? GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST
          : buf.usage === 'write'
            ? GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC
            : GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC;

      const gpuBuf = device.createBuffer({
        size: buf.data.byteLength,
        usage: gpuUsage,
        mappedAtCreation: buf.usage !== 'write',
      });

      if (buf.usage !== 'write') {
        new Float32Array(gpuBuf.getMappedRange()).set(
          buf.data instanceof Float32Array ? buf.data : new Float32Array(buf.data),
        );
        gpuBuf.unmap();
      }

      gpuBuffers.push(gpuBuf);
      entries.push({ binding: i, resource: { buffer: gpuBuf } });
    }

    // Uniform buffer (if any)
    if (params.uniforms) {
      const uniformValues = Object.values(params.uniforms);
      const uniformData = new Float32Array(uniformValues);
      const uniformBuf = device.createBuffer({
        size: uniformData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        mappedAtCreation: true,
      });
      new Float32Array(uniformBuf.getMappedRange()).set(uniformData);
      uniformBuf.unmap();
      entries.push({ binding: entries.length, resource: { buffer: uniformBuf } });
    }

    const pipeline = device.createComputePipeline({
      layout: 'auto',
      compute: { module, entryPoint: 'main' },
    });

    const bindGroup = device.createBindGroup({
      layout: pipeline.getBindGroupLayout(0),
      entries,
    });

    const workgroupSize = params.workgroupSize ?? 64;
    const totalElements = params.buffers[0]?.data.length ?? workgroupSize;
    const numWorkgroups = Math.ceil(totalElements / workgroupSize);

    const encoder = device.createCommandEncoder();
    const pass = encoder.beginComputePass();
    pass.setPipeline(pipeline);
    pass.setBindGroup(0, bindGroup);
    pass.dispatchWorkgroups(numWorkgroups);
    pass.end();

    device.queue.submit([encoder.finish()]);

    // Read back output buffers
    const result = new Map<string, Float64Array | Float32Array>();
    for (let i = 0; i < params.buffers.length; i++) {
      const buf = params.buffers[i]!;
      if (buf.usage === 'read') continue;

      const readBuf = device.createBuffer({
        size: gpuBuffers[i]!.size,
        usage: GPUBufferUsage.MAP_READ | GPUBufferUsage.COPY_DST,
      });
      const copyEncoder = device.createCommandEncoder();
      copyEncoder.copyBufferToBuffer(gpuBuffers[i]!, 0, readBuf, 0, readBuf.size);
      device.queue.submit([copyEncoder.finish()]);

      await readBuf.mapAsync(GPUMapMode.READ);
      const outputData = new Float32Array(readBuf.getMappedRange().slice(0));
      readBuf.unmap();
      readBuf.destroy();

      result.set(buf.name, outputData);
    }

    // Clean up GPU buffers
    for (const buf of gpuBuffers) {
      buf.destroy();
    }

    return { buffers: result };
  }

  /** Return the WGSL source for a kernel, or null if not yet implemented. */
  private _getShaderSource(kernel: KernelName): string | null {
    switch (kernel) {
      case 'matrix-multiply':
        return this._matrixMultiplyWgsl;
      default:
        return null;
    }
  }

  /* v8 ignore stop */

  /** Release the GPU device and associated resources. */
  dispose(): void {
    /* v8 ignore start */
    if (this._device) {
      this._device.destroy();
      this._device = null;
    }
  }
}
/* v8 ignore stop */
