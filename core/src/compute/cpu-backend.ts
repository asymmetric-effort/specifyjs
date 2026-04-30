// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type {
  BackendInfo,
  ComputeBackend,
  ComputeBuffer,
  KernelName,
  KernelParams,
  KernelResult,
} from './types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Retrieve a buffer by name or throw. */
function getBuffer(buffers: ComputeBuffer[], name: string): ComputeBuffer {
  const buf = buffers.find((b) => b.name === name);
  if (!buf) {
    throw new Error(`CpuBackend: missing buffer '${name}'`);
  }
  return buf;
}

/** Retrieve a required uniform or throw. */
function getUniform(uniforms: Record<string, number> | undefined, key: string): number {
  if (uniforms === undefined || !(key in uniforms)) {
    throw new Error(`CpuBackend: missing uniform '${key}'`);
  }
  return uniforms[key]!;
}

// ---------------------------------------------------------------------------
// Kernel implementations
// ---------------------------------------------------------------------------

/**
 * Multiply two NxN matrices.
 *
 * Buffers: 'a' (read), 'b' (read), 'result' (write)
 * Uniforms: 'size' — dimension N of the square matrices.
 */
function matrixMultiply(params: KernelParams): KernelResult {
  const a = getBuffer(params.buffers, 'a');
  const b = getBuffer(params.buffers, 'b');
  const result = getBuffer(params.buffers, 'result');
  const n = getUniform(params.uniforms, 'size');

  const out = result.data;
  for (let row = 0; row < n; row++) {
    for (let col = 0; col < n; col++) {
      let sum = 0;
      for (let k = 0; k < n; k++) {
        sum += (a.data[row * n + k] ?? 0) * (b.data[k * n + col] ?? 0);
      }
      out[row * n + col] = sum;
    }
  }

  const buffers = new Map<string, Float64Array | Float32Array>();
  buffers.set('result', out);
  return { buffers };
}

/**
 * Apply Verlet integration with distance constraints.
 *
 * Each particle has 2 floats (x, y) in 'positions' and 'prevPositions'.
 * Constraints are encoded as triples [indexA, indexB, restLength].
 *
 * Buffers:
 *   'positions'     (readwrite) — current positions
 *   'prevPositions'  (readwrite) — previous-frame positions
 *   'constraints'    (read)      — packed [iA, iB, restLength, ...]
 *
 * Uniforms: 'dt', 'gravity', 'count', 'constraintCount'
 */
function verletConstraints(params: KernelParams): KernelResult {
  const pos = getBuffer(params.buffers, 'positions');
  const prev = getBuffer(params.buffers, 'prevPositions');
  const cons = getBuffer(params.buffers, 'constraints');

  const dt = getUniform(params.uniforms, 'dt');
  const gravity = getUniform(params.uniforms, 'gravity');
  const count = getUniform(params.uniforms, 'count');
  const constraintCount = getUniform(params.uniforms, 'constraintCount');

  const p = pos.data;
  const pp = prev.data;

  // --- Verlet integration step ---
  for (let i = 0; i < count; i++) {
    const ix = i * 2;
    const iy = i * 2 + 1;

    const cx = p[ix] ?? 0;
    const cy = p[iy] ?? 0;
    const px = pp[ix] ?? 0;
    const py = pp[iy] ?? 0;

    const vx = cx - px;
    const vy = cy - py;

    pp[ix] = cx;
    pp[iy] = cy;

    p[ix] = cx + vx;
    p[iy] = cy + vy + gravity * dt * dt;
  }

  // --- Distance constraint relaxation ---
  for (let c = 0; c < constraintCount; c++) {
    const base = c * 3;
    const iA = cons.data[base] ?? 0;
    const iB = cons.data[base + 1] ?? 0;
    const restLength = cons.data[base + 2] ?? 0;

    const ax = p[iA * 2] ?? 0;
    const ay = p[iA * 2 + 1] ?? 0;
    const bx = p[iB * 2] ?? 0;
    const by = p[iB * 2 + 1] ?? 0;

    const dx = bx - ax;
    const dy = by - ay;
    const dist = Math.sqrt(dx * dx + dy * dy) || 1e-10;
    const diff = ((dist - restLength) / dist) * 0.5;

    p[iA * 2] = ax + dx * diff;
    p[iA * 2 + 1] = ay + dy * diff;
    p[iB * 2] = bx - dx * diff;
    p[iB * 2 + 1] = by - dy * diff;
  }

  const buffers = new Map<string, Float64Array | Float32Array>();
  buffers.set('positions', p);
  buffers.set('prevPositions', pp);
  return { buffers };
}

/**
 * Gravitational N-body simulation step.
 *
 * Each particle stores 3 floats (x, y, z) in 'positions' and 'velocities'.
 * 'masses' stores one float per particle.
 *
 * Buffers:
 *   'positions'  (readwrite) — particle positions (3 * count)
 *   'velocities' (readwrite) — particle velocities (3 * count)
 *   'masses'     (read)      — particle masses (count)
 *
 * Uniforms: 'dt', 'G', 'count'
 */
function nBody(params: KernelParams): KernelResult {
  const posBuf = getBuffer(params.buffers, 'positions');
  const velBuf = getBuffer(params.buffers, 'velocities');
  const massBuf = getBuffer(params.buffers, 'masses');

  const dt = getUniform(params.uniforms, 'dt');
  const G = getUniform(params.uniforms, 'G');
  const count = getUniform(params.uniforms, 'count');

  const pos = posBuf.data;
  const vel = velBuf.data;
  const mass = massBuf.data;

  // Softening factor to avoid singularities
  const SOFTENING = 1e-10;

  // Accumulate forces for each particle
  for (let i = 0; i < count; i++) {
    let fx = 0;
    let fy = 0;
    let fz = 0;

    const ix = i * 3;
    const iy = i * 3 + 1;
    const iz = i * 3 + 2;

    const px = pos[ix] ?? 0;
    const py = pos[iy] ?? 0;
    const pz = pos[iz] ?? 0;

    for (let j = 0; j < count; j++) {
      if (i === j) continue;

      const jx = j * 3;
      const jy = j * 3 + 1;
      const jz = j * 3 + 2;

      const dx = (pos[jx] ?? 0) - px;
      const dy = (pos[jy] ?? 0) - py;
      const dz = (pos[jz] ?? 0) - pz;

      const distSq = dx * dx + dy * dy + dz * dz + SOFTENING;
      const dist = Math.sqrt(distSq);
      const force = (G * (mass[j] ?? 0)) / distSq;

      fx += (force * dx) / dist;
      fy += (force * dy) / dist;
      fz += (force * dz) / dist;
    }

    vel[ix] = (vel[ix] ?? 0) + fx * dt;
    vel[iy] = (vel[iy] ?? 0) + fy * dt;
    vel[iz] = (vel[iz] ?? 0) + fz * dt;
  }

  // Update positions from velocities
  for (let i = 0; i < count * 3; i++) {
    pos[i] = (pos[i] ?? 0) + (vel[i] ?? 0) * dt;
  }

  const buffers = new Map<string, Float64Array | Float32Array>();
  buffers.set('positions', pos);
  buffers.set('velocities', vel);
  return { buffers };
}

// ---------------------------------------------------------------------------
// Kernel registry
// ---------------------------------------------------------------------------

type KernelFn = (params: KernelParams) => KernelResult;

const KERNELS: Record<string, KernelFn> = {
  'matrix-multiply': matrixMultiply,
  'verlet-constraints': verletConstraints,
  'n-body': nBody,
};

// ---------------------------------------------------------------------------
// CpuBackend
// ---------------------------------------------------------------------------

/** Pure TypeScript CPU backend — the universal fallback. */
export class CpuBackend implements ComputeBackend {
  /** @inheritdoc */
  readonly info: BackendInfo = {
    name: 'cpu',
    isGPU: false,
    maxBufferSize: Number.MAX_SAFE_INTEGER,
  };

  /** CPU backend is always available. */
  isAvailable(): boolean {
    return true;
  }

  /** No initialisation required for the CPU backend. */
  async init(): Promise<void> {
    // no-op
  }

  /** Execute the named kernel synchronously on the CPU. */
  async execute(kernel: KernelName, params: KernelParams): Promise<KernelResult> {
    const fn = KERNELS[kernel];
    if (!fn) {
      throw new Error(`CpuBackend: unknown kernel '${kernel}'`);
    }
    return fn(params);
  }

  /** No resources to release on the CPU backend. */
  dispose(): void {
    // no-op
  }
}
