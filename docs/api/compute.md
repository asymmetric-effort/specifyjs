<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Compute — GPU Compute Abstraction

SpecifyJS provides a backend-agnostic compute API for running parallel numeric
kernels on the GPU (WebGPU, WebGL) or CPU. The system auto-detects the best
available backend at runtime and falls back to a pure TypeScript CPU
implementation when no GPU is present.

```typescript
import {
  createComputeContext,
  setComputeBackend,
} from '@asymmetric-effort/specifyjs/compute';

import type {
  KernelName,
  ComputeBuffer,
  KernelParams,
  KernelResult,
  BackendInfo,
  ComputeContext,
} from '@asymmetric-effort/specifyjs/compute';
```

> **Note:** The `compute` subpath is an internal module. Depending on your
> project setup you may need to import directly from the source files.

---

## Quick Start

```typescript
import { createComputeContext } from '@asymmetric-effort/specifyjs/compute';

const ctx = await createComputeContext();

console.log(ctx.getBackendInfo().name); // 'webgpu', 'webgl', or 'cpu'

const result = await ctx.execute('matrix-multiply', {
  buffers: [
    { name: 'a', data: new Float64Array([1, 0, 0, 1]), usage: 'read' },
    { name: 'b', data: new Float64Array([5, 6, 7, 8]), usage: 'read' },
    { name: 'result', data: new Float64Array(4), usage: 'write' },
  ],
  uniforms: { size: 2 },
});

const output = result.buffers.get('result');
// Float64Array [5, 6, 7, 8]

ctx.dispose();
```

---

## createComputeContext()

```typescript
async function createComputeContext(): Promise<ComputeContext>
```

Creates or returns a cached `ComputeContext`. The context is cached for the
lifetime of the page -- calling `createComputeContext()` multiple times
returns the same instance until `dispose()` is called.

**Auto-detection order:**

1. **WebGPU** -- used if `navigator.gpu` is available and device initialization succeeds
2. **WebGL** -- used if WebGPU is unavailable but WebGL context can be created
3. **CPU** -- pure TypeScript fallback, always available

---

## setComputeBackend(name)

```typescript
function setComputeBackend(name: 'webgpu' | 'webgl' | 'cpu'): void
```

Forces a specific backend for all subsequent `createComputeContext()` calls.
Clears the cached backend so the next call creates a fresh instance.

```typescript
import { setComputeBackend, createComputeContext } from '@asymmetric-effort/specifyjs/compute';

// Force CPU backend (useful for testing or deterministic behavior)
setComputeBackend('cpu');
const ctx = await createComputeContext();
console.log(ctx.getBackendInfo().name); // 'cpu'
```

---

## ComputeContext

The developer-facing API returned by `createComputeContext()`.

### execute(kernel, params)

```typescript
execute(kernel: KernelName, params: KernelParams): Promise<KernelResult>
```

Runs a named compute kernel with the provided buffers and uniforms.

### getBackendInfo()

```typescript
getBackendInfo(): BackendInfo
```

Returns information about the active backend.

```typescript
interface BackendInfo {
  name: 'webgpu' | 'webgl' | 'cpu';
  isGPU: boolean;
  maxBufferSize: number;  // Max buffer size in bytes
}
```

### dispose()

```typescript
dispose(): void
```

Releases all GPU resources held by the backend and clears the cached
instance. After calling `dispose()`, the next `createComputeContext()` call
will create a new backend.

---

## Types

### KernelName

```typescript
type KernelName = 'matrix-multiply' | 'verlet-constraints' | 'n-body' | 'particle-system';
```

The four named compute kernels. Three are currently implemented
(`matrix-multiply`, `verlet-constraints`, `n-body`); `particle-system` is
reserved for a future kernel.

### ComputeBuffer

```typescript
interface ComputeBuffer {
  name: string;
  data: Float64Array | Float32Array;
  usage: 'read' | 'write' | 'readwrite';
}
```

| Field | Description |
|---|---|
| `name` | Identifier for this buffer within a kernel invocation |
| `data` | Typed array holding the numeric payload |
| `usage` | `'read'` = input only, `'write'` = output only, `'readwrite'` = both |

### KernelParams

```typescript
interface KernelParams {
  buffers: ComputeBuffer[];
  uniforms?: Record<string, number>;
  workgroupSize?: number;  // GPU hint, ignored by CPU backend
}
```

### KernelResult

```typescript
interface KernelResult {
  buffers: Map<string, Float64Array | Float32Array>;
}
```

Output buffers are keyed by buffer name. Only buffers with `usage: 'write'`
or `'readwrite'` appear in the result.

---

## Pre-built Kernels

### matrix-multiply

Multiplies two NxN matrices.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| `a` | `read` | N*N floats, row-major |
| `b` | `read` | N*N floats, row-major |
| `result` | `write` | N*N floats (pre-allocated) |

**Uniforms:**

| Name | Description |
|---|---|
| `size` | Dimension N of the square matrices |

```typescript
const n = 3;
const a = new Float64Array([
  1, 2, 3,
  4, 5, 6,
  7, 8, 9,
]);
const b = new Float64Array([
  9, 8, 7,
  6, 5, 4,
  3, 2, 1,
]);

const result = await ctx.execute('matrix-multiply', {
  buffers: [
    { name: 'a', data: a, usage: 'read' },
    { name: 'b', data: b, usage: 'read' },
    { name: 'result', data: new Float64Array(n * n), usage: 'write' },
  ],
  uniforms: { size: n },
});

const product = result.buffers.get('result');
```

### verlet-constraints

Applies Verlet integration with distance constraint relaxation for 2D
particle simulations (cloth, rope, soft-body).

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| `positions` | `readwrite` | 2 floats per particle (x, y), length = `count * 2` |
| `prevPositions` | `readwrite` | 2 floats per particle (previous frame), length = `count * 2` |
| `constraints` | `read` | Packed triples `[indexA, indexB, restLength, ...]`, length = `constraintCount * 3` |

**Uniforms:**

| Name | Description |
|---|---|
| `dt` | Time step (seconds) |
| `gravity` | Gravitational acceleration (positive = downward) |
| `count` | Number of particles |
| `constraintCount` | Number of distance constraints |

```typescript
const count = 3;
const positions = new Float64Array([0, 0, 1, 0, 2, 0]);
const prevPositions = new Float64Array([0, 0, 1, 0, 2, 0]);
// Two constraints: particle 0--1 and 1--2, rest length 1.0
const constraints = new Float64Array([0, 1, 1.0, 1, 2, 1.0]);

const result = await ctx.execute('verlet-constraints', {
  buffers: [
    { name: 'positions', data: positions, usage: 'readwrite' },
    { name: 'prevPositions', data: prevPositions, usage: 'readwrite' },
    { name: 'constraints', data: constraints, usage: 'read' },
  ],
  uniforms: { dt: 1 / 60, gravity: 9.8, count, constraintCount: 2 },
});

const newPositions = result.buffers.get('positions');
const newPrev = result.buffers.get('prevPositions');
```

The algorithm:
1. Computes velocity from position difference (`current - previous`)
2. Applies gravity to the y-component
3. Updates positions via Verlet integration
4. Relaxes each distance constraint by moving both particles toward the rest length

### n-body

Gravitational N-body simulation step for 3D particle systems.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| `positions` | `readwrite` | 3 floats per particle (x, y, z), length = `count * 3` |
| `velocities` | `readwrite` | 3 floats per particle (vx, vy, vz), length = `count * 3` |
| `masses` | `read` | 1 float per particle, length = `count` |

**Uniforms:**

| Name | Description |
|---|---|
| `dt` | Time step (seconds) |
| `G` | Gravitational constant |
| `count` | Number of particles |

```typescript
const count = 2;
const positions = new Float64Array([
  0, 0, 0,  // Particle 0 at origin
  1, 0, 0,  // Particle 1 at (1, 0, 0)
]);
const velocities = new Float64Array(count * 3); // All zero
const masses = new Float64Array([1e6, 1e6]);

const result = await ctx.execute('n-body', {
  buffers: [
    { name: 'positions', data: positions, usage: 'readwrite' },
    { name: 'velocities', data: velocities, usage: 'readwrite' },
    { name: 'masses', data: masses, usage: 'read' },
  ],
  uniforms: { dt: 0.01, G: 6.674e-11, count },
});

const newPositions = result.buffers.get('positions');
const newVelocities = result.buffers.get('velocities');
```

A softening factor of `1e-10` is added to distance calculations to prevent
singularities when particles are very close together.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Unknown kernel name | Throws `Error: CpuBackend: unknown kernel '<name>'` |
| Missing required buffer | Throws `Error: CpuBackend: missing buffer '<name>'` |
| Missing required uniform | Throws `Error: CpuBackend: missing uniform '<key>'` |
| GPU init fails during auto-detect | Silently falls back to the next backend |
| All GPU backends fail | Falls back to CPU (always available) |
| `dispose()` called, then `execute()` | Undefined behavior -- create a new context first |

---

## Testing with CPU Backend

For deterministic tests, force the CPU backend:

```typescript
import { setComputeBackend, createComputeContext } from '@asymmetric-effort/specifyjs/compute';

beforeAll(() => {
  setComputeBackend('cpu');
});

test('matrix multiply', async () => {
  const ctx = await createComputeContext();
  const result = await ctx.execute('matrix-multiply', {
    buffers: [
      { name: 'a', data: new Float64Array([1, 0, 0, 1]), usage: 'read' },
      { name: 'b', data: new Float64Array([2, 3, 4, 5]), usage: 'read' },
      { name: 'result', data: new Float64Array(4), usage: 'write' },
    ],
    uniforms: { size: 2 },
  });
  expect(Array.from(result.buffers.get('result')!)).toEqual([2, 3, 4, 5]);
  ctx.dispose();
});
```
