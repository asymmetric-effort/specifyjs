// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { createComputeContext, setComputeBackend } from '../../../src/compute/index';
import type { KernelParams, KernelName } from '../../../src/compute/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBuffer(name: string, data: number[], usage: 'read' | 'write' | 'readwrite' = 'read') {
  return { name, data: new Float64Array(data), usage };
}

// ---------------------------------------------------------------------------
// Compute context
// ---------------------------------------------------------------------------

describe('ComputeContext', () => {
  beforeEach(() => {
    // Force CPU backend and clear cached state before each test
    setComputeBackend('cpu');
  });

  it('createComputeContext() returns a valid context', async () => {
    const ctx = await createComputeContext();
    expect(ctx).toBeDefined();
    expect(typeof ctx.execute).toBe('function');
    expect(typeof ctx.getBackendInfo).toBe('function');
    expect(typeof ctx.dispose).toBe('function');
  });

  it('getBackendInfo() returns cpu in jsdom (no GPU)', async () => {
    const ctx = await createComputeContext();
    const info = ctx.getBackendInfo();
    expect(info.name).toBe('cpu');
    expect(info.isGPU).toBe(false);
    expect(info.maxBufferSize).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('setComputeBackend("cpu") forces CPU backend', async () => {
    setComputeBackend('cpu');
    const ctx = await createComputeContext();
    expect(ctx.getBackendInfo().name).toBe('cpu');
  });

  it('dispose() does not throw', async () => {
    const ctx = await createComputeContext();
    expect(() => ctx.dispose()).not.toThrow();
  });

  it('dispose() clears cached backend so next call creates fresh one', async () => {
    const ctx1 = await createComputeContext();
    ctx1.dispose();
    // After dispose, a new context should be created successfully
    const ctx2 = await createComputeContext();
    expect(ctx2.getBackendInfo().name).toBe('cpu');
  });

  it('multiple createComputeContext() calls return cached context', async () => {
    const ctx1 = await createComputeContext();
    const ctx2 = await createComputeContext();
    // Both should have the same backend info
    expect(ctx1.getBackendInfo().name).toBe(ctx2.getBackendInfo().name);
  });

  // -----------------------------------------------------------------------
  // End-to-end kernel execution via context
  // -----------------------------------------------------------------------

  it('execute() with matrix-multiply works end-to-end', async () => {
    const ctx = await createComputeContext();
    const result = await ctx.execute('matrix-multiply', {
      buffers: [
        makeBuffer('a', [1, 2, 3, 4]),
        makeBuffer('b', [5, 6, 7, 8]),
        makeBuffer('result', [0, 0, 0, 0], 'write'),
      ],
      uniforms: { size: 2 },
    });

    const out = result.buffers.get('result')!;
    expect(out[0]).toBeCloseTo(19);
    expect(out[1]).toBeCloseTo(22);
    expect(out[2]).toBeCloseTo(43);
    expect(out[3]).toBeCloseTo(50);
  });

  it('execute() with verlet-constraints works end-to-end', async () => {
    const ctx = await createComputeContext();
    const result = await ctx.execute('verlet-constraints', {
      buffers: [
        makeBuffer('positions', [0, 0, 2, 0], 'readwrite'),
        makeBuffer('prevPositions', [0, 0, 2, 0], 'readwrite'),
        makeBuffer('constraints', [0, 1, 1], 'read'),
      ],
      uniforms: { dt: 1, gravity: 0, count: 2, constraintCount: 1 },
    });

    const pos = result.buffers.get('positions')!;
    expect(pos).toBeDefined();
    // Particles should have moved closer together
    const dist = Math.abs((pos[2] ?? 0) - (pos[0] ?? 0));
    expect(dist).toBeLessThan(2);
  });

  it('execute() with n-body works end-to-end', async () => {
    const ctx = await createComputeContext();
    const result = await ctx.execute('n-body', {
      buffers: [
        makeBuffer('positions', [0, 0, 0, 10, 0, 0], 'readwrite'),
        makeBuffer('velocities', [0, 0, 0, 0, 0, 0], 'readwrite'),
        makeBuffer('masses', [1, 1], 'read'),
      ],
      uniforms: { dt: 0.1, G: 1, count: 2 },
    });

    const vel = result.buffers.get('velocities')!;
    expect(vel).toBeDefined();
    // Bodies should attract each other
    expect(vel[0]!).toBeGreaterThan(0); // body 0 moves toward body 1
    expect(vel[3]!).toBeLessThan(0); // body 1 moves toward body 0
  });

  it('execute() rejects unknown kernel via context', async () => {
    const ctx = await createComputeContext();
    await expect(ctx.execute('unknown-kernel' as KernelName, { buffers: [] })).rejects.toThrow();
  });

  it('execute() rejects with missing buffers', async () => {
    const ctx = await createComputeContext();
    await expect(
      ctx.execute('matrix-multiply', {
        buffers: [],
        uniforms: { size: 2 },
      }),
    ).rejects.toThrow("missing buffer 'a'");
  });

  it('context works after setComputeBackend is called multiple times', async () => {
    setComputeBackend('cpu');
    const ctx1 = await createComputeContext();
    expect(ctx1.getBackendInfo().name).toBe('cpu');

    // Setting again clears cached backend
    setComputeBackend('cpu');
    const ctx2 = await createComputeContext();
    expect(ctx2.getBackendInfo().name).toBe('cpu');
  });
});
