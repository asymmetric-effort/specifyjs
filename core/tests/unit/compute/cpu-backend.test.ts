// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { CpuBackend } from '../../../src/compute/cpu-backend';
import type { KernelParams, KernelName } from '../../../src/compute/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBuffer(name: string, data: number[], usage: 'read' | 'write' | 'readwrite' = 'read') {
  return { name, data: new Float64Array(data), usage };
}

// ---------------------------------------------------------------------------
// CpuBackend — class-level behaviour
// ---------------------------------------------------------------------------

describe('CpuBackend', () => {
  it('isAvailable() returns true', () => {
    const backend = new CpuBackend();
    expect(backend.isAvailable()).toBe(true);
  });

  it('info reports cpu backend', () => {
    const backend = new CpuBackend();
    expect(backend.info.name).toBe('cpu');
    expect(backend.info.isGPU).toBe(false);
    expect(backend.info.maxBufferSize).toBe(Number.MAX_SAFE_INTEGER);
  });

  it('init() resolves without error', async () => {
    const backend = new CpuBackend();
    await expect(backend.init()).resolves.toBeUndefined();
  });

  it('dispose() does not throw', () => {
    const backend = new CpuBackend();
    expect(() => backend.dispose()).not.toThrow();
  });

  it('execute() throws on unknown kernel', async () => {
    const backend = new CpuBackend();
    await backend.init();
    const params: KernelParams = { buffers: [] };
    await expect(backend.execute('nonexistent-kernel' as KernelName, params)).rejects.toThrow(
      "unknown kernel 'nonexistent-kernel'",
    );
  });

  it('execute() throws on particle-system (unregistered kernel)', async () => {
    const backend = new CpuBackend();
    await backend.init();
    const params: KernelParams = { buffers: [] };
    await expect(backend.execute('particle-system', params)).rejects.toThrow(
      "unknown kernel 'particle-system'",
    );
  });

  // -----------------------------------------------------------------------
  // matrix-multiply kernel
  // -----------------------------------------------------------------------

  describe('matrix-multiply kernel', () => {
    const backend = new CpuBackend();

    it('identity * matrix = same matrix (2x2)', async () => {
      const identity = [1, 0, 0, 1];
      const matrix = [5, 3, 7, 2];
      const result = await backend.execute('matrix-multiply', {
        buffers: [
          makeBuffer('a', identity),
          makeBuffer('b', matrix),
          makeBuffer('result', [0, 0, 0, 0], 'write'),
        ],
        uniforms: { size: 2 },
      });

      const out = result.buffers.get('result')!;
      expect(out[0]).toBeCloseTo(5);
      expect(out[1]).toBeCloseTo(3);
      expect(out[2]).toBeCloseTo(7);
      expect(out[3]).toBeCloseTo(2);
    });

    it('multiplies two known 2x2 matrices', async () => {
      // [1 2] * [5 6] = [1*5+2*7  1*6+2*8] = [19 22]
      // [3 4]   [7 8]   [3*5+4*7  3*6+4*8]   [43 50]
      const a = [1, 2, 3, 4];
      const b = [5, 6, 7, 8];
      const result = await backend.execute('matrix-multiply', {
        buffers: [
          makeBuffer('a', a),
          makeBuffer('b', b),
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

    it('multiplies 3x3 matrices', async () => {
      // Identity 3x3 * arbitrary 3x3 = same matrix
      const identity = [1, 0, 0, 0, 1, 0, 0, 0, 1];
      const matrix = [2, 3, 4, 5, 6, 7, 8, 9, 10];
      const result = await backend.execute('matrix-multiply', {
        buffers: [
          makeBuffer('a', identity),
          makeBuffer('b', matrix),
          makeBuffer('result', new Array(9).fill(0), 'write'),
        ],
        uniforms: { size: 3 },
      });

      const out = result.buffers.get('result')!;
      for (let i = 0; i < 9; i++) {
        expect(out[i]).toBeCloseTo(matrix[i]!);
      }
    });

    it('multiplies two non-trivial 3x3 matrices', async () => {
      // [1 0 2] * [0 1 0] = [4 1 6]
      // [0 1 0]   [1 0 1]   [1 0 1]
      // [1 0 1]   [2 0 3]   [2 1 3]
      const a = [1, 0, 2, 0, 1, 0, 1, 0, 1];
      const b = [0, 1, 0, 1, 0, 1, 2, 0, 3];
      const result = await backend.execute('matrix-multiply', {
        buffers: [
          makeBuffer('a', a),
          makeBuffer('b', b),
          makeBuffer('result', new Array(9).fill(0), 'write'),
        ],
        uniforms: { size: 3 },
      });

      const out = result.buffers.get('result')!;
      expect(out[0]).toBeCloseTo(4);
      expect(out[1]).toBeCloseTo(1);
      expect(out[2]).toBeCloseTo(6);
      expect(out[3]).toBeCloseTo(1);
      expect(out[4]).toBeCloseTo(0);
      expect(out[5]).toBeCloseTo(1);
      expect(out[6]).toBeCloseTo(2);
      expect(out[7]).toBeCloseTo(1);
      expect(out[8]).toBeCloseTo(3);
    });

    it('throws when missing buffer "a"', async () => {
      await expect(
        backend.execute('matrix-multiply', {
          buffers: [makeBuffer('b', [1, 0, 0, 1]), makeBuffer('result', [0, 0, 0, 0], 'write')],
          uniforms: { size: 2 },
        }),
      ).rejects.toThrow("missing buffer 'a'");
    });

    it('throws when missing uniform "size"', async () => {
      await expect(
        backend.execute('matrix-multiply', {
          buffers: [
            makeBuffer('a', [1, 0, 0, 1]),
            makeBuffer('b', [1, 0, 0, 1]),
            makeBuffer('result', [0, 0, 0, 0], 'write'),
          ],
          uniforms: {},
        }),
      ).rejects.toThrow("missing uniform 'size'");
    });

    it('throws when uniforms is undefined', async () => {
      await expect(
        backend.execute('matrix-multiply', {
          buffers: [
            makeBuffer('a', [1, 0, 0, 1]),
            makeBuffer('b', [1, 0, 0, 1]),
            makeBuffer('result', [0, 0, 0, 0], 'write'),
          ],
        }),
      ).rejects.toThrow("missing uniform 'size'");
    });
  });

  // -----------------------------------------------------------------------
  // verlet-constraints kernel
  // -----------------------------------------------------------------------

  describe('verlet-constraints kernel', () => {
    const backend = new CpuBackend();

    it('gravity pulls particles downward', async () => {
      // One particle at (0, 0), prev at (0, 0), gravity = 9.8, dt = 1
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [0, 0], 'readwrite'),
          makeBuffer('prevPositions', [0, 0], 'readwrite'),
          makeBuffer('constraints', [], 'read'),
        ],
        uniforms: { dt: 1, gravity: 9.8, count: 1, constraintCount: 0 },
      });

      const pos = result.buffers.get('positions')!;
      // x should remain 0, y should increase (gravity pulling down)
      expect(pos[0]).toBeCloseTo(0);
      expect(pos[1]!).toBeGreaterThan(0);
      expect(pos[1]).toBeCloseTo(9.8); // gravity * dt^2
    });

    it('velocity is preserved via Verlet integration', async () => {
      // Particle at (10, 5), prev at (9, 5) => velocity (1, 0)
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [10, 5], 'readwrite'),
          makeBuffer('prevPositions', [9, 5], 'readwrite'),
          makeBuffer('constraints', [], 'read'),
        ],
        uniforms: { dt: 1, gravity: 0, count: 1, constraintCount: 0 },
      });

      const pos = result.buffers.get('positions')!;
      // Should continue in x direction: 10 + (10-9) = 11
      expect(pos[0]).toBeCloseTo(11);
      expect(pos[1]).toBeCloseTo(5);
    });

    it('distance constraint: two connected particles maintain distance', async () => {
      // Two particles at (0,0) and (2,0), prev=(0,0) and (2,0), rest length=1
      // They are 2 apart but rest length is 1, so constraint pulls them together
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [0, 0, 2, 0], 'readwrite'),
          makeBuffer('prevPositions', [0, 0, 2, 0], 'readwrite'),
          makeBuffer('constraints', [0, 1, 1], 'read'), // [indexA, indexB, restLength]
        ],
        uniforms: { dt: 1, gravity: 0, count: 2, constraintCount: 1 },
      });

      const pos = result.buffers.get('positions')!;
      // After constraint relaxation, particles should be closer together
      const dx = (pos[2] ?? 0) - (pos[0] ?? 0);
      const dy = (pos[3] ?? 0) - (pos[1] ?? 0);
      const dist = Math.sqrt(dx * dx + dy * dy);
      // They started 2 apart, rest length is 1, so after one step they should be closer to 1
      expect(dist).toBeLessThan(2);
      expect(dist).toBeCloseTo(1);
    });

    it('chain of three particles with constraints', async () => {
      // Three particles in a line: (0,0), (3,0), (6,0)
      // Constraints: 0-1 rest=1, 1-2 rest=1
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [0, 0, 3, 0, 6, 0], 'readwrite'),
          makeBuffer('prevPositions', [0, 0, 3, 0, 6, 0], 'readwrite'),
          makeBuffer(
            'constraints',
            [0, 1, 1, 1, 2, 1], // two constraints
            'read',
          ),
        ],
        uniforms: { dt: 1, gravity: 0, count: 3, constraintCount: 2 },
      });

      const pos = result.buffers.get('positions')!;
      // After constraint relaxation, distances should be closer to rest lengths
      const dist01 = Math.sqrt(
        ((pos[2] ?? 0) - (pos[0] ?? 0)) ** 2 + ((pos[3] ?? 0) - (pos[1] ?? 0)) ** 2,
      );
      const dist12 = Math.sqrt(
        ((pos[4] ?? 0) - (pos[2] ?? 0)) ** 2 + ((pos[5] ?? 0) - (pos[3] ?? 0)) ** 2,
      );
      expect(dist01).toBeLessThan(3); // was 3, should move toward 1
      expect(dist12).toBeLessThan(6); // was 3, should move toward 1
    });

    it('prevPositions buffer is updated', async () => {
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [5, 10], 'readwrite'),
          makeBuffer('prevPositions', [4, 9], 'readwrite'),
          makeBuffer('constraints', [], 'read'),
        ],
        uniforms: { dt: 1, gravity: 0, count: 1, constraintCount: 0 },
      });

      const prev = result.buffers.get('prevPositions')!;
      // prevPositions should be set to current positions before integration
      expect(prev[0]).toBeCloseTo(5);
      expect(prev[1]).toBeCloseTo(10);
    });

    it('throws when missing positions buffer', async () => {
      await expect(
        backend.execute('verlet-constraints', {
          buffers: [
            makeBuffer('prevPositions', [0, 0], 'readwrite'),
            makeBuffer('constraints', [], 'read'),
          ],
          uniforms: { dt: 1, gravity: 0, count: 1, constraintCount: 0 },
        }),
      ).rejects.toThrow("missing buffer 'positions'");
    });

    it('throws when missing dt uniform', async () => {
      await expect(
        backend.execute('verlet-constraints', {
          buffers: [
            makeBuffer('positions', [0, 0], 'readwrite'),
            makeBuffer('prevPositions', [0, 0], 'readwrite'),
            makeBuffer('constraints', [], 'read'),
          ],
          uniforms: { gravity: 0, count: 1, constraintCount: 0 },
        }),
      ).rejects.toThrow("missing uniform 'dt'");
    });
  });

  // -----------------------------------------------------------------------
  // n-body kernel
  // -----------------------------------------------------------------------

  describe('n-body kernel', () => {
    const backend = new CpuBackend();

    it('two bodies attract each other', async () => {
      // Body 0 at (0,0,0), Body 1 at (1,0,0), both mass 1, G=1
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [0, 0, 0, 1, 0, 0], 'readwrite'),
          makeBuffer('velocities', [0, 0, 0, 0, 0, 0], 'readwrite'),
          makeBuffer('masses', [1, 1], 'read'),
        ],
        uniforms: { dt: 1, G: 1, count: 2 },
      });

      const vel = result.buffers.get('velocities')!;
      // Body 0 should gain positive x velocity (toward body 1)
      expect(vel[0]!).toBeGreaterThan(0);
      // Body 1 should gain negative x velocity (toward body 0)
      expect(vel[3]!).toBeLessThan(0);
      // y and z velocities should be ~0
      expect(vel[1]).toBeCloseTo(0);
      expect(vel[2]).toBeCloseTo(0);
      expect(vel[4]).toBeCloseTo(0);
      expect(vel[5]).toBeCloseTo(0);
    });

    it('single body: no forces applied', async () => {
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [5, 10, 15], 'readwrite'),
          makeBuffer('velocities', [1, 2, 3], 'readwrite'),
          makeBuffer('masses', [100], 'read'),
        ],
        uniforms: { dt: 1, G: 1, count: 1 },
      });

      const vel = result.buffers.get('velocities')!;
      // No other body => no force => velocity unchanged
      expect(vel[0]).toBeCloseTo(1);
      expect(vel[1]).toBeCloseTo(2);
      expect(vel[2]).toBeCloseTo(3);

      const pos = result.buffers.get('positions')!;
      // Position updated by velocity: pos += vel * dt
      expect(pos[0]).toBeCloseTo(6);
      expect(pos[1]).toBeCloseTo(12);
      expect(pos[2]).toBeCloseTo(18);
    });

    it('three bodies: forces are symmetric and correctly directed', async () => {
      // Three bodies along x-axis: at x=0, x=10, x=20
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [0, 0, 0, 10, 0, 0, 20, 0, 0], 'readwrite'),
          makeBuffer('velocities', [0, 0, 0, 0, 0, 0, 0, 0, 0], 'readwrite'),
          makeBuffer('masses', [1, 1, 1], 'read'),
        ],
        uniforms: { dt: 1, G: 1, count: 3 },
      });

      const vel = result.buffers.get('velocities')!;
      // Body 0 (leftmost): attracted right by both bodies => positive x velocity
      expect(vel[0]!).toBeGreaterThan(0);
      // Body 2 (rightmost): attracted left by both bodies => negative x velocity
      expect(vel[6]!).toBeLessThan(0);
      // Body 1 (middle): pulled equally from both sides, but body 0 and 2 are equidistant
      // Forces should roughly cancel in x (symmetric placement)
      // Due to symmetry, the middle body's x-velocity should be ~0
      expect(Math.abs(vel[3]!)).toBeLessThan(0.001);
    });

    it('heavier body exerts stronger gravitational pull', async () => {
      // Body 0 at origin mass=1, Body 1 at (1,0,0) mass=100
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [0, 0, 0, 1, 0, 0], 'readwrite'),
          makeBuffer('velocities', [0, 0, 0, 0, 0, 0], 'readwrite'),
          makeBuffer('masses', [1, 100], 'read'),
        ],
        uniforms: { dt: 0.01, G: 1, count: 2 },
      });

      const vel = result.buffers.get('velocities')!;
      // Body 0 accelerates toward body 1 (heavy) much more than body 1 toward body 0
      // Force on body 0: G * m1 / r^2 (from body 1, mass=100)
      // Force on body 1: G * m0 / r^2 (from body 0, mass=1)
      // So vel[0] should be ~100x vel[3] magnitude (but opposite sign)
      expect(Math.abs(vel[0]!)).toBeGreaterThan(Math.abs(vel[3]!) * 50);
    });

    it('positions are updated by velocities', async () => {
      // Body with existing velocity, no gravitational partner
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [0, 0, 0], 'readwrite'),
          makeBuffer('velocities', [3, 4, 5], 'readwrite'),
          makeBuffer('masses', [1], 'read'),
        ],
        uniforms: { dt: 0.5, G: 1, count: 1 },
      });

      const pos = result.buffers.get('positions')!;
      // pos += vel * dt
      expect(pos[0]).toBeCloseTo(1.5); // 0 + 3*0.5
      expect(pos[1]).toBeCloseTo(2.0); // 0 + 4*0.5
      expect(pos[2]).toBeCloseTo(2.5); // 0 + 5*0.5
    });

    it('throws when missing positions buffer', async () => {
      await expect(
        backend.execute('n-body', {
          buffers: [
            makeBuffer('velocities', [0, 0, 0], 'readwrite'),
            makeBuffer('masses', [1], 'read'),
          ],
          uniforms: { dt: 1, G: 1, count: 1 },
        }),
      ).rejects.toThrow("missing buffer 'positions'");
    });

    it('throws when missing G uniform', async () => {
      await expect(
        backend.execute('n-body', {
          buffers: [
            makeBuffer('positions', [0, 0, 0], 'readwrite'),
            makeBuffer('velocities', [0, 0, 0], 'readwrite'),
            makeBuffer('masses', [1], 'read'),
          ],
          uniforms: { dt: 1, count: 1 },
        }),
      ).rejects.toThrow("missing uniform 'G'");
    });
  });

  // -----------------------------------------------------------------------
  // Edge cases
  // -----------------------------------------------------------------------

  describe('edge cases', () => {
    const backend = new CpuBackend();

    it('matrix-multiply with 1x1 matrices', async () => {
      const result = await backend.execute('matrix-multiply', {
        buffers: [makeBuffer('a', [3]), makeBuffer('b', [7]), makeBuffer('result', [0], 'write')],
        uniforms: { size: 1 },
      });

      const out = result.buffers.get('result')!;
      expect(out[0]).toBeCloseTo(21);
    });

    it('verlet with zero dt produces no movement from gravity', async () => {
      const result = await backend.execute('verlet-constraints', {
        buffers: [
          makeBuffer('positions', [5, 10], 'readwrite'),
          makeBuffer('prevPositions', [5, 10], 'readwrite'),
          makeBuffer('constraints', [], 'read'),
        ],
        uniforms: { dt: 0, gravity: 9.8, count: 1, constraintCount: 0 },
      });

      const pos = result.buffers.get('positions')!;
      expect(pos[0]).toBeCloseTo(5);
      expect(pos[1]).toBeCloseTo(10);
    });

    it('n-body with zero G produces no gravitational acceleration', async () => {
      const result = await backend.execute('n-body', {
        buffers: [
          makeBuffer('positions', [0, 0, 0, 10, 0, 0], 'readwrite'),
          makeBuffer('velocities', [0, 0, 0, 0, 0, 0], 'readwrite'),
          makeBuffer('masses', [1000, 1000], 'read'),
        ],
        uniforms: { dt: 1, G: 0, count: 2 },
      });

      const vel = result.buffers.get('velocities')!;
      expect(vel[0]).toBeCloseTo(0);
      expect(vel[3]).toBeCloseTo(0);
    });
  });
});
