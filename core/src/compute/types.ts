// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/** Named compute kernel identifier. */
export type KernelName = 'matrix-multiply' | 'verlet-constraints' | 'n-body' | 'particle-system';

/** Buffer of numeric data for GPU transfer. */
export interface ComputeBuffer {
  /** Identifier for this buffer within a kernel invocation. */
  name: string;
  /** Typed array holding the numeric payload. */
  data: Float64Array | Float32Array;
  /** 'read' = input only, 'write' = output only, 'readwrite' = both. */
  usage: 'read' | 'write' | 'readwrite';
}

/** Parameters for a kernel execution. */
export interface KernelParams {
  /** Data buffers consumed and/or produced by the kernel. */
  buffers: ComputeBuffer[];
  /** Scalar uniform values keyed by name. */
  uniforms?: Record<string, number>;
  /** Optional workgroup size hint (GPU backends). */
  workgroupSize?: number;
}

/** Result of a kernel execution. */
export interface KernelResult {
  /** Output buffers keyed by buffer name. */
  buffers: Map<string, Float64Array | Float32Array>;
}

/** Backend capabilities descriptor. */
export interface BackendInfo {
  /** Backend identifier. */
  name: 'webgpu' | 'webgl' | 'cpu';
  /** Whether this backend uses a hardware GPU. */
  isGPU: boolean;
  /** Maximum buffer size in bytes. */
  maxBufferSize: number;
}

/** Compute backend interface — implemented by each backend. */
export interface ComputeBackend {
  /** Descriptor for this backend's capabilities. */
  readonly info: BackendInfo;
  /** Returns true when this backend can be used in the current environment. */
  isAvailable(): boolean;
  /** Perform any async initialisation (e.g. request GPU device). */
  init(): Promise<void>;
  /** Execute the named kernel with the given parameters. */
  execute(kernel: KernelName, params: KernelParams): Promise<KernelResult>;
  /** Release GPU resources held by this backend. */
  dispose(): void;
}

/** Public compute context — the developer-facing API. */
export interface ComputeContext {
  /** Execute a named compute kernel. */
  execute(kernel: KernelName, params: KernelParams): Promise<KernelResult>;
  /** Return information about the active backend. */
  getBackendInfo(): BackendInfo;
  /** Release all resources. */
  dispose(): void;
}
