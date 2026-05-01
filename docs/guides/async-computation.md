<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Async Function Evaluation

SpecifyJS includes an async computation engine for evaluating mathematical
functions over a range of input values without blocking the UI. The engine
splits work into batches and yields to the browser between batches using
`requestIdleCallback` (or `setTimeout` as a fallback).

This module powers the `CartesianGraph2D` and `PolarGraph2D` visualization
components but can be used independently in any component that needs to
compute a large number of function evaluations.

---

## Import

```typescript
import {
  evaluateFunction,
  generateInputs,
  computeSync,
  computeAsync,
} from '@asymmetric-effort/specifyjs';
```

> **Note:** These functions are currently part of the internal `shared/`
> module. Import paths may vary depending on your project setup.

---

## Quick Start

```typescript
import { evaluateFunction } from '../../core/src/shared/async-compute';

// Evaluate sin(x) from 0 to 2*PI with step 0.01
const { points, cancel } = evaluateFunction(
  {
    fn: Math.sin,
    range: { start: 0, end: 2 * Math.PI, step: 0.01 },
    sync: false,      // async mode (default)
    batchSize: 200,   // evaluations per idle tick (default)
  },
  (results) => {
    console.log(`Computed ${results.length} points`);
    // results: Array<{ input: number, output: number }>
  },
);

// Cancel computation if the component unmounts
// cancel();
```

---

## Types

### ComputedPoint

```typescript
interface ComputedPoint {
  input: number;   // The x (or theta) value
  output: number;  // The computed f(x) value
}
```

### RangeSpec

```typescript
interface RangeSpec {
  start: number;  // First input value
  end: number;    // Last input value (inclusive)
  step: number;   // Increment between values
}
```

### AsyncComputeOptions

```typescript
interface AsyncComputeOptions {
  fn: (x: number) => number;   // The function to evaluate
  range: RangeSpec;            // Range of input values
  sync?: boolean;              // If true, compute synchronously (default: false)
  batchSize?: number;          // Evaluations per idle tick (default: 200)
}
```

---

## Core Functions

### evaluateFunction(options, onResult)

High-level entry point. Evaluates a function over a range and calls
`onResult` with the computed points.

```typescript
function evaluateFunction(
  options: AsyncComputeOptions,
  onResult: (points: ComputedPoint[]) => void,
): { points: ComputedPoint[] | null; cancel: () => void }
```

**Return value:**
- `points` -- In sync mode, the computed points are returned immediately. In
  async mode, this is `null` (use the callback).
- `cancel` -- A function to abort async computation. In sync mode, this is a
  no-op.

**Sync mode:**
```typescript
const { points } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 }, sync: true },
  (results) => { /* also called immediately in sync mode */ },
);
// points is available immediately
console.log(points.length); // 101
```

**Async mode:**
```typescript
const { cancel } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 } },
  (results) => {
    // Called once when all batches are complete
    console.log(results.length);
  },
);
// cancel() to abort
```

### generateInputs(range)

Generates the full array of input values for a range specification.

```typescript
function generateInputs(range: RangeSpec): number[]
```

```typescript
const inputs = generateInputs({ start: 0, end: 1, step: 0.25 });
// [0, 0.25, 0.5, 0.75, 1.0]
```

**Safety limits:**
- Returns `[]` if `step <= 0` or `step` is not finite
- Returns `[]` if the computed count exceeds 1,000,000 (prevents memory
  explosion from very small step values)

### computeSync(fn, inputs)

Evaluates a function for every input value synchronously. Non-finite outputs
(NaN, Infinity, -Infinity) are silently skipped.

```typescript
function computeSync(fn: (x: number) => number, inputs: number[]): ComputedPoint[]
```

```typescript
const results = computeSync(Math.sqrt, [0, 1, 4, -1, 9]);
// [
//   { input: 0, output: 0 },
//   { input: 1, output: 1 },
//   { input: 4, output: 2 },
//   // { input: -1, output: NaN } -- skipped (not finite)
//   { input: 9, output: 3 },
// ]
```

### computeAsync(fn, inputs, batchSize, onProgress)

Evaluates a function in batches, yielding to the browser between batches.
Returns a cancel function.

```typescript
function computeAsync(
  fn: (x: number) => number,
  inputs: number[],
  batchSize: number,
  onProgress: (results: ComputedPoint[], done: boolean) => void,
): () => void
```

The `onProgress` callback is called after each batch with:
- `results` -- all points computed so far (cumulative)
- `done` -- `true` after the final batch

```typescript
const cancel = computeAsync(
  (x) => Math.sin(x) / x,
  generateInputs({ start: 0.01, end: 100, step: 0.01 }),
  500,
  (results, done) => {
    if (done) {
      console.log(`Finished: ${results.length} points`);
    } else {
      console.log(`Progress: ${results.length} points so far`);
    }
  },
);

// Abort if needed:
cancel();
```

**Scheduling:** Uses `requestIdleCallback` with a 16ms timeout when available,
falling back to `setTimeout(fn, 0)`.

---

## Using with Graph Components

The `CartesianGraph2D` and `PolarGraph2D` visualization components use async
computation internally. You control the behavior with these props:

### CartesianGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| `plotFunction` | `(x: number) => number` | required | The function to plot |
| `xMin` / `xMax` | `number` | required | X-axis range |
| `plotResolution` | `number` | `200` | Number of samples across the range |
| `xStep` | `number` | computed | Explicit step size (overrides `plotResolution`) |
| `syncMode` | `boolean` | `false` | If true, compute synchronously |

When `syncMode` is `false` (default), the component uses `computeAsync` to
evaluate the function in batches. This keeps the UI responsive when plotting
complex functions over large ranges.

When `syncMode` is `true`, the component uses `computeSync` via `useMemo` for
immediate results. Use this for simple functions or small ranges.

### PolarGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| `plotFunction` | `(theta: number) => number` | required | Maps angle to radius |
| `plotResolution` | `number` | `360` | Number of samples around the circle |
| `thetaStep` | `number` | computed | Explicit theta step (overrides `plotResolution`) |
| `syncMode` | `boolean` | `false` | If true, compute synchronously |

The default range is `0` to `2 * Math.PI`. The step is computed as
`thetaStep ?? (2 * Math.PI) / plotResolution`.

---

## Using in Custom Components

You can use the async computation engine in your own components:

```typescript
import { createElement, useState, useEffect, useRef, useMemo } from '@asymmetric-effort/specifyjs';
import { generateInputs, computeSync, computeAsync } from '../../core/src/shared/async-compute';

function CustomChart(props) {
  const { fn, xMin, xMax, step, syncMode } = props;
  const [asyncPoints, setAsyncPoints] = useState([]);
  const cancelRef = useRef(null);

  // Synchronous path
  const syncPoints = useMemo(() => {
    if (!syncMode) return null;
    const inputs = generateInputs({ start: xMin, end: xMax, step });
    return computeSync(fn, inputs);
  }, [fn, xMin, xMax, step, syncMode]);

  // Asynchronous path
  useEffect(() => {
    if (syncMode) return;
    // Cancel previous computation
    if (cancelRef.current) cancelRef.current();

    const inputs = generateInputs({ start: xMin, end: xMax, step });
    cancelRef.current = computeAsync(fn, inputs, 200, (results, done) => {
      if (done) setAsyncPoints(results);
    });

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [fn, xMin, xMax, step, syncMode]);

  const points = syncMode ? syncPoints : asyncPoints;

  return createElement('svg', { width: 600, height: 400 },
    // ... render points as a polyline or path
  );
}
```

Key patterns:
1. Store the cancel function in a `useRef`
2. Cancel previous computation in the effect cleanup
3. Use `useMemo` for sync mode, `useEffect` + `useState` for async mode
4. Check the `done` flag before updating state to avoid partial renders

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `step <= 0` or non-finite step | `generateInputs` returns `[]` |
| Range produces more than 1,000,000 inputs | `generateInputs` returns `[]` |
| Function returns `NaN` or `Infinity` | Point is silently skipped |
| `cancel()` called during computation | Remaining batches are not processed |
| `cancel()` called after completion | No-op |
| `sync: true` with large input count | Blocks the main thread; use async mode instead |

---

## Performance Tips

- **Use async mode for 1,000+ points.** Sync mode blocks the main thread and
  can cause frame drops on complex functions.
- **Increase `batchSize` for simple functions.** If your function is cheap
  (e.g. `Math.sin`), a larger batch size (500-1000) reduces scheduling
  overhead.
- **Decrease `batchSize` for expensive functions.** If your function involves
  heavy computation, smaller batches (50-100) keep the UI smoother.
- **Cancel on unmount.** Always cancel pending computations in the effect
  cleanup to avoid setting state on unmounted components.
