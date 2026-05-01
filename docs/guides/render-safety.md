<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Render Safety — Render Guard System

SpecifyJS includes a development-time render guard system that detects infinite
render loops, effect cycles, unstable hook dependencies, and setState floods.
All guards are tree-shaken in production builds (`__DEV__` gate) and have zero
overhead in shipped code.

The render guard uses `WeakMap` for per-fiber tracking, so component fibers
are garbage collected normally. Each unique warning message fires only once
to avoid console spam.

---

## Detection Strategies

The render guard implements four detection strategies:

1. **Render loop detection** -- catches components that re-render infinitely
2. **Effect cycle detection** -- catches effects that fire in a tight loop
3. **Unstable dependency warnings** -- catches effect deps that change every render
4. **setState flood detection** -- catches rapid-fire state updates in a single frame

---

## 1. Render Loop Detection

**What it detects:** A component that re-renders more than 50 times within a
single synchronous work cycle (e.g., a `setState` inside the render body that
triggers an immediate re-render).

**Threshold:** `MAX_RENDERS_PER_CYCLE = 50`

**Behavior:** Throws an `Error` to break the infinite loop. The error message
includes the component name and the number of renders.

**Error message:**
```
[SpecifyJS] Maximum update depth exceeded. Component "MyComponent"
re-rendered 51 times in a single cycle. This usually means a useEffect
or setState call is creating an infinite loop. Check that useEffect
dependencies are stable (use useMemo/useCallback for objects/arrays).
```

### Common Causes

**Setting state unconditionally during render:**
```typescript
// BUG: Causes infinite render loop
function Counter() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // setState during render body
  return createElement('div', null, count);
}
```

**Fix:** Move state updates into event handlers or effects:
```typescript
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Only runs once after mount
    setCount(1);
  }, []);
  return createElement('div', null, count);
}
```

**useEffect with unstable deps that trigger setState:**
```typescript
// BUG: Creates a render loop
function List() {
  const [items, setItems] = useState([]);
  const config = { page: 1 }; // New object every render

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]); // config is a new reference every render

  return createElement('ul', null, ...items);
}
```

**Fix:** Stabilize dependencies with `useMemo`:
```typescript
function List() {
  const [items, setItems] = useState([]);
  const config = useMemo(() => ({ page: 1 }), []);

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]);

  return createElement('ul', null, ...items);
}
```

### How It Works

The guard tracks per-fiber render counts using a `WeakMap`. Each work cycle
increments a monotonic cycle ID via `beginRenderCycle()`. When
`trackRender(fiber, name)` is called before a component render, it checks
whether the fiber has exceeded the threshold in the current cycle. If so, it
resets the count and throws.

---

## 2. Effect Cycle Detection

**What it detects:** Effects that fire more than 25 times for a single fiber
within a single commit cycle.

**Threshold:** `MAX_EFFECTS_PER_CYCLE = 25`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
```
Effect cycle detected in "MyComponent". Effects fired 26 times in a
single commit. This may indicate an effect that triggers a state update
on every run. Ensure effect dependencies are correct and stable.
```

### Common Causes

An effect that calls `setState`, which triggers a re-render, which triggers
the effect again:

```typescript
// BUG: Effect cycle
function Broken() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(value + 1); // Triggers re-render, re-triggers this effect
  }); // No deps = runs every render
  return createElement('span', null, value);
}
```

**Fix:** Add a dependency array to control when the effect runs:
```typescript
function Fixed() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(1);
  }, []); // Only runs once
  return createElement('span', null, value);
}
```

### How It Works

A separate commit-cycle counter tracks effect executions per fiber.
`beginCommitCycle()` is called at the start of each commit phase, and
`trackEffect(fiber, name)` increments the count for that fiber.

---

## 3. Unstable Dependency Warnings

**What it detects:** An effect whose dependency array changes on every single
render for 5 or more consecutive renders.

**Threshold:** `UNSTABLE_DEPS_THRESHOLD = 5`

**Behavior:** Emits a one-time console warning per fiber+hook combination.

**Warning message:**
```
Unstable useEffect dependencies in "MyComponent" (hook #2). Dependencies
changed on 5 consecutive renders. This may cause unnecessary effect
re-runs. Wrap objects/arrays in useMemo and functions in useCallback to
stabilize references.
```

### Common Causes

Passing inline objects, arrays, or functions as effect dependencies:

```typescript
// BUG: Deps change every render because options is a new object
function Search(props) {
  const options = { query: props.query, limit: 10 };
  useEffect(() => {
    performSearch(options);
  }, [options]); // New reference every render
  return createElement('div', null, 'Searching...');
}
```

**Fix:**
```typescript
function Search(props) {
  const options = useMemo(() => ({ query: props.query, limit: 10 }), [props.query]);
  useEffect(() => {
    performSearch(options);
  }, [options]);
  return createElement('div', null, 'Searching...');
}
```

### How It Works

`trackEffectDeps()` is called during `useEffect` dependency comparison. It
maintains a per-fiber, per-hook-index history of consecutive dep changes.
Once the threshold is reached, a warning fires and is marked as "warned" to
prevent duplicates. If deps stabilize (stop changing), the counter resets
to zero.

---

## 4. setState Flood Detection

**What it detects:** A single fiber calling `setState` / `dispatch` 100 or
more times within a single browser frame.

**Threshold:** `100 calls per frame`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
```
Rapid state updates in "MyComponent": setState called 100 times in a
single frame. This may indicate a loop or missing dependency optimization.
```

### Common Causes

Processing a large dataset by calling `setState` in a loop:

```typescript
// BUG: 1000 setState calls in one frame
function Importer() {
  const [items, setItems] = useState([]);
  const handleImport = (data) => {
    for (const item of data) {
      setItems(prev => [...prev, item]); // Called hundreds of times
    }
  };
  return createElement('button', { onClick: () => handleImport(bigData) }, 'Import');
}
```

**Fix:** Batch into a single update:
```typescript
function Importer() {
  const [items, setItems] = useState([]);
  const handleImport = (data) => {
    setItems(prev => [...prev, ...data]); // Single setState call
  };
  return createElement('button', { onClick: () => handleImport(bigData) }, 'Import');
}
```

### How It Works

`beginFrame()` increments a frame counter at the start of each browser frame
or microtask batch. `trackStateUpdate(fiber, name)` counts how many times
`setState` is called for a given fiber in the current frame. The warning
fires exactly once when the count hits 100.

---

## Configuration

The thresholds are compile-time constants defined in the render guard module:

| Constant | Default | Purpose |
|---|---|---|
| `MAX_RENDERS_PER_CYCLE` | 50 | Max renders per component per work cycle before throwing |
| `MAX_EFFECTS_PER_CYCLE` | 25 | Max effect executions per fiber per commit before warning |
| `UNSTABLE_DEPS_THRESHOLD` | 5 | Consecutive dep-changing renders before warning |
| setState flood threshold | 100 | setState calls per fiber per frame before warning |

These values are not configurable at runtime. They are tuned for development
diagnostics and are fully removed in production builds.

---

## Production Behavior

All render guard code is gated behind `__DEV__` checks. In production builds:

- No `WeakMap` tracking is created
- No cycle/commit/frame counters are incremented
- No warnings or errors are emitted
- Zero runtime overhead

---

## Testing

The render guard exports a `resetRenderGuard()` function for use in test
suites. Call it in `beforeEach` or `afterEach` to reset all internal
counters:

```typescript
import { resetRenderGuard } from '../../src/shared/render-guard';

afterEach(() => {
  resetRenderGuard();
});
```

This resets `currentCycleId`, `currentCommitId`, and `currentFrameId` to zero.
`WeakMap` entries are not cleared explicitly but will be garbage collected
when fiber references are released.
