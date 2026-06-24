var e=[{title:`Overview`,children:[{title:`SpecifyJS Documentation`,path:`README`,content:`# SpecifyJS Documentation

Welcome to the SpecifyJS documentation — a comprehensive guide to building declarative, performant web applications with zero runtime dependencies.

## Quick Start

| Topic | Link | Description |
|-------|------|-------------|
| Getting Started | [guides/getting-started.md](guides/getting-started.md) | Install, create your first app, build |
| Core Concepts | [guides/core-concepts.md](guides/core-concepts.md) | Components, props, state, lifecycle |
| Routing | [guides/routing.md](guides/routing.md) | Hash-based SPA routing |
| Forms | [guides/forms-and-validation.md](guides/forms-and-validation.md) | Controlled inputs, validation |

---

## Part I: Foundations

- [Getting Started](guides/getting-started.md) — Installation, first component, dev server, build
- [Core Concepts](guides/core-concepts.md) — Elements, components, props, state, effects, fragments, keys
- [TypeScript Patterns](guides/typescript.md) — Typing components, hooks, events, and context
- [Styling](guides/styling.md) — Inline styles, CSS classes, theming, dark mode

## Part II: Essential Patterns

- [Routing & Navigation](guides/routing.md) — Router, Route, Link, useRouter, useParams, useNavigate
- [State Management](guides/state-management.md) — useState, useReducer, Context, custom stores
- [Forms & Validation](guides/forms-and-validation.md) — Controlled inputs, validation, multi-step forms
- [Custom Hooks](guides/custom-hooks.md) — Building reusable logic with hooks
- [Meta Tags & SEO](guides/meta-tags.md) — useHead, Open Graph, CSP headers
- [Feature Flags](guides/feature-flags.md) — FeatureFlagProvider, FeatureGate, runtime toggling

## Part III: Advanced Topics

- [Performance Optimization](guides/performance.md) — memo, useMemo, useCallback, profiling
- [Concurrent Rendering](guides/concurrent-rendering.md) — useTransition, useDeferredValue, lanes
- [Code Splitting](guides/code-splitting.md) — lazy(), Suspense, route-based splitting
- [Error Handling](guides/error-handling.md) — ErrorBoundary, recovery, logging
- [Accessibility](guides/accessibility.md) — ARIA, keyboard nav, screen readers, focus management
- [Building SPAs](guides/building-spas.md) — Single-page application architecture

## Part IV: Production

- [Production Builds](guides/production-builds.md) — Minification, tree-shaking, bundle size
- [Deployment](guides/deployment.md) — GitHub Pages, Netlify, Vercel, custom domains
- [Testing](guides/testing.md) — Unit (Vitest), integration (jsdom), E2E (Playwright)
- [Browser Support](guides/browser-support.md) — Compatibility matrix, polyfills
- [Migrating from React](guides/migrating-from-react.md) — API mapping, key differences

## Part V: Troubleshooting

- [Troubleshooting & FAQ](guides/troubleshooting.md) — Common issues, debugging tips, gotchas

---

## API Reference

- [Components](api/components.md) — createElement, Fragment, Context, Refs, memo, lazy, forwardRef
- [Hooks](api/hooks.md) — All 16 hooks with signatures and examples
- [DOM](api/dom.md) — createRoot, hydrateRoot, createPortal, flushSync
- [Server](api/server.md) — renderToString, renderToStaticMarkup, streaming APIs
- [Types](api/types.md) — SpecElement, SpecNode, SpecChild, SpecContext

## Architecture

- [Overview](architecture/README.md) — High-level system design
- [Virtual DOM](architecture/virtual-dom.md) — Element types, diffing, symbols
- [Fiber & Reconciler](architecture/fiber-reconciler.md) — Fiber tree, work loop, keyed reconciliation
- [Hooks Internals](architecture/hooks-internals.md) — Hook state, dispatcher, effect system
- [Event System](architecture/event-system.md) — Synthetic events, delegation, normalization

## Component Library

- [Component Reference](components/README.md) — 62 components across 8 categories
- **Layout**: [Grid](components/layout/grid.md), [FlexContainer](components/layout/flex-container.md), [Card](components/layout/card.md), [Panel](components/layout/panel.md), [Splitter](components/layout/splitter.md), [Tabs](components/layout/tabs.md), [ScrollContainer](components/layout/scroll-container.md)
- **Form**: [TextField](components/form/textfield.md), [Select](components/form/select.md), [Checkbox](components/form/checkbox.md), [Toggle](components/form/toggle.md), [Slider](components/form/slider.md), [DatePicker](components/form/datepicker.md), [TimePicker](components/form/timepicker.md), [ColorPicker](components/form/color-picker.md), [FileUpload](components/form/file-upload.md), [NumberSpinner](components/form/number-spinner.md), [TextEditor](components/form/texteditor.md)
- **Navigation**: [Dropdown](components/nav/dropdown.md), [TreeNav](components/nav/treenav.md), [Accordion](components/nav/accordion.md), [Breadcrumb](components/nav/breadcrumb.md), [Pagination](components/nav/pagination.md), [Stepper](components/nav/stepper.md), [Sidebar](components/nav/sidebar.md), [Toolbar](components/nav/toolbar.md), [Menubar](components/nav/menubar.md)
- **Overlay**: [Modal](components/overlay/modal.md), [Drawer](components/overlay/drawer.md), [Popover](components/overlay/popover.md), [Tooltip](components/overlay/tooltip.md), [Toast](components/overlay/toast.md), [ContextMenu](components/overlay/context-menu.md)
- **Data**: [DataGrid](components/data/data-grid.md), [ListView](components/data/list-view.md), [VirtualScroll](components/data/virtual-scroll.md), [Tag](components/data/tag.md), [Badge](components/data/badge.md), [Avatar](components/data/avatar.md)
- **Feedback**: [ProgressBar](components/feedback/progress-bar.md), [Spinner](components/feedback/spinner.md), [Skeleton](components/feedback/skeleton.md), [Alert](components/feedback/alert.md), [EmptyState](components/feedback/empty-state.md)
- **Media**: [Image](components/media/image.md), [Carousel](components/media/carousel.md), [VideoPlayer](components/media/video-player.md)
- **Visualization**: [VizWrapper](components/viz/wrapper.md), [BarGraph](components/viz/2D-bar-graph.md), [LineGraph](components/viz/2D-line-graph.md), [PieGraph](components/viz/2D-pie-graph.md), [HypercubeGraph](components/viz/graph.md)

## Contributing

- [Development Setup](contributing/README.md) — Clone, install, run tests
- [Code Style](contributing/code-style.md) — TypeScript conventions, formatting
- [CI/CD](contributing/ci-cd.md) — GitHub Actions, testing with act
`}]},{title:`Guides`,children:[{title:`3D Space Demo Guide`,path:`guides/3d-space-demo`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# 3D Space Demo Guide

The 3D Space demo is a showcase page available at \`/#/3dSpace\` on the SpecifyJS
site. It renders five coloured boxes in 3D space with an orbiting camera, using
the CPU software rasteriser directly.

## What the Demo Shows

- **CPU rasterisation** -- every triangle is projected, clipped, shaded, and
  painted to a 2D canvas each frame with no GPU involvement
- **Scene graph** -- five \`SceneObject\` instances registered in a \`SceneGraph\`
- **Camera orbit** -- the camera follows a circular path (radius 15) with
  sinusoidal vertical motion, always looking at the origin
- **Flat shading** -- \`FlatShading\` lighting model returns material colours
  unchanged
- **Direct pipeline usage** -- bypasses the \`Space3D\` component and drives the
  \`CpuPipeline\` manually for full control

## Scene Layout

| Box | Colour | Position (x, y, z) |
|-----|--------|---------------------|
| Red | \`(0.9, 0.2, 0.2)\` | \`(0, 0, 0)\` |
| Green | \`(0.2, 0.8, 0.2)\` | \`(5, 0, 0)\` |
| Blue | \`(0.2, 0.4, 0.9)\` | \`(-3, 2, 5)\` |
| Yellow | \`(0.9, 0.8, 0.1)\` | \`(0, -2, -4)\` |
| Cyan | \`(0.1, 0.8, 0.8)\` | \`(7, 3, -2)\` |

All boxes share a single \`Mesh.createBox(1, 1, 1)\` geometry. Each has its own
material created with \`createMaterial\`.

## Camera Motion

The camera orbits at a radius of 15 units around the Y axis. Its height
oscillates sinusoidally between approximately -3 and +5 units. It always faces
the origin via \`camera.lookAt({ x: 0, y: 0, z: 0 })\`. One full revolution
takes roughly 20 seconds.

\`\`\`
x = cos(t * 0.3) * 15
z = sin(t * 0.3) * 15
y = sin(t * 0.2) * 4 + 1
\`\`\`

## How It Works

The demo uses a ref callback pattern instead of the \`Space3D\` component. When
the container \`<div>\` mounts, the callback:

1. Creates a \`<canvas>\` element (720 x 480) and appends it to the DOM
2. Builds the \`SceneGraph\` and registers five box objects
3. Creates a \`Camera\` and \`Viewport\`
4. Initialises the \`CpuPipeline\`
5. Starts a \`requestAnimationFrame\` loop that:
   - Computes delta time
   - Updates the camera position and orientation
   - Calls \`pipeline.render(scene, camera, viewport, lighting)\`

On unmount, the cleanup function cancels the animation frame, disposes the
pipeline, and removes the canvas from the DOM.

## Running the Demo

Start the SpecifyJS showcase site locally:

\`\`\`bash
cd site
npm run dev
\`\`\`

Navigate to \`http://localhost:5173/#/3dSpace\` in a browser.

## Extending the Demo

### Add a new object

\`\`\`typescript
const sphere = new SceneObject('my-sphere');
sphere.position = { x: -5, y: 1, z: 3 };
sphere.mesh = Mesh.createBox(1, 1, 1);  // or a custom mesh
sphere.material = createMaterial({ r: 1, g: 0.5, b: 0, a: 1 });
scene.register(sphere);
\`\`\`

### Switch to WebGL

Replace \`CpuPipeline\` with \`WebGLPipeline\`:

\`\`\`typescript
import { WebGLPipeline } from 'specifyjs/components/viz/3dSpace';

const pipeline = new WebGLPipeline();
pipeline.initialize(canvas);
\`\`\`

### Add a custom lighting model

Implement the \`LightingModel\` interface and pass it to \`pipeline.render()\` as
the fourth argument. See the [3d-space component docs](../components/viz/3d-space.md)
for a full Lambertian shading example.

## Source Files

| File | Description |
|------|-------------|
| \`site/src/screens/3d-space.ts\` | Demo component |
| \`components/viz/3dSpace/src/\` | 3dSpace library sources |
| \`site/e2e/3d-space.spec.ts\` | E2E tests for the demo |
| \`site/e2e/3d-space-pdv.spec.ts\` | Pre-deploy validation tests |
`},{title:`Accessibility`,path:`guides/accessibility`,content:`# Accessibility

Building accessible applications ensures that all users -- including those who rely on assistive technologies, keyboard navigation, or alternative input devices -- can interact with your UI. SpecifyJS renders standard DOM elements, so all native accessibility features of HTML and ARIA are available through \`createElement\`.

## ARIA Attributes

Pass ARIA attributes as props. SpecifyJS forwards them directly to the DOM:

\`\`\`typescript
import { createElement } from 'specifyjs';

function Alert(props: { message: string }) {
  return createElement('div', {
    role: 'alert',
    'aria-live': 'assertive',
  }, props.message);
}

function ProgressBar(props: { value: number; max: number }) {
  return createElement('div', {
    role: 'progressbar',
    'aria-valuenow': props.value,
    'aria-valuemin': 0,
    'aria-valuemax': props.max,
    'aria-label': 'Loading progress',
    style: \`width: \${(props.value / props.max) * 100}%\`,
  });
}
\`\`\`

## Semantic HTML

Use the correct HTML elements rather than applying ARIA roles to generic \`div\` and \`span\` elements. Semantic elements carry built-in accessibility semantics that assistive technologies understand without extra attributes:

\`\`\`typescript
function PageLayout() {
  return createElement('div', null,
    createElement('header', null,
      createElement('nav', { 'aria-label': 'Main navigation' },
        createElement('ul', null,
          createElement('li', null, createElement('a', { href: '#home' }, 'Home')),
          createElement('li', null, createElement('a', { href: '#about' }, 'About')),
        ),
      ),
    ),
    createElement('main', null,
      createElement('article', null,
        createElement('h1', null, 'Page Title'),
        createElement('p', null, 'Content goes here.'),
      ),
    ),
    createElement('footer', null,
      createElement('p', null, 'Copyright 2026'),
    ),
  );
}
\`\`\`

Prefer \`button\` over \`div\` with \`onClick\`, \`a\` for navigation, \`input\` and \`label\` for forms, and heading elements (\`h1\`-\`h6\`) for document structure.

## Keyboard Navigation

Interactive components must be operable via keyboard. Handle \`onKeyDown\` to support expected key bindings:

\`\`\`typescript
function DropdownMenu(props: { items: string[]; onSelect: (item: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: Event): void => {
    const key = (e as KeyboardEvent).key;
    if (key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, props.items.length - 1));
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (key === 'Enter') {
      props.onSelect(props.items[activeIndex]);
      setOpen(false);
    } else if (key === 'Escape') {
      setOpen(false);
    }
  };

  return createElement('div', { onKeyDown: handleKeyDown },
    createElement('button', {
      'aria-haspopup': 'listbox',
      'aria-expanded': open,
      onClick: () => setOpen(o => !o),
    }, 'Select item'),
    open
      ? createElement('ul', { role: 'listbox' },
          ...props.items.map((item, i) =>
            createElement('li', {
              key: item,
              role: 'option',
              'aria-selected': i === activeIndex,
              tabindex: i === activeIndex ? 0 : -1,
              onClick: () => { props.onSelect(item); setOpen(false); },
            }, item),
          ),
        )
      : null,
  );
}
\`\`\`

## Focus Management with useRef

Manage focus programmatically when the UI changes -- after opening a modal, navigating to a new route, or revealing content:

\`\`\`typescript
import { useRef, useEffect, createElement } from 'specifyjs';
import type { RefObject } from 'specifyjs';

function Modal(props: { open: boolean; onClose: () => void; children: SpecNode }) {
  const closeRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (props.open) {
      closeRef.current?.focus();
    }
  }, [props.open]);

  if (!props.open) return null;

  return createElement('div', {
    role: 'dialog',
    'aria-modal': true,
    'aria-label': 'Dialog',
  },
    createElement('button', {
      ref: closeRef,
      onClick: props.onClose,
      'aria-label': 'Close dialog',
    }, 'X'),
    props.children,
  );
}
\`\`\`

## Screen Reader Considerations

- **Live regions**: Use \`aria-live="polite"\` for non-urgent updates (e.g., search result counts) and \`aria-live="assertive"\` for critical information (e.g., form errors).
- **Hidden content**: Use \`aria-hidden="true"\` to hide decorative elements from assistive technologies.
- **Labels**: Every interactive element needs an accessible name -- either visible text content, an \`aria-label\`, or an association via \`aria-labelledby\`.
- **Descriptions**: Provide \`aria-describedby\` to link form fields to help text or error messages.

\`\`\`typescript
function FormField(props: { id: string; label: string; error?: string }) {
  const errorId = \`\${props.id}-error\`;
  return createElement('div', null,
    createElement('label', { htmlFor: props.id }, props.label),
    createElement('input', {
      id: props.id,
      'aria-invalid': props.error ? true : undefined,
      'aria-describedby': props.error ? errorId : undefined,
    }),
    props.error
      ? createElement('span', {
          id: errorId,
          role: 'alert',
          'aria-live': 'assertive',
        }, props.error)
      : null,
  );
}
\`\`\`

## Common ARIA Roles

| Role          | Element         | When to use                                   |
|---------------|-----------------|-----------------------------------------------|
| \`alert\`       | \`div\`, \`span\`   | Important messages that need immediate attention |
| \`dialog\`      | \`div\`           | Modal or non-modal dialogs                    |
| \`navigation\`  | \`nav\`           | Groups of navigation links (prefer \`<nav>\`)   |
| \`tablist\`     | \`div\`           | Container for a set of tabs                   |
| \`tab\`         | \`button\`        | Individual tab control                        |
| \`tabpanel\`    | \`div\`           | Content associated with a tab                 |
| \`listbox\`     | \`ul\`            | Selectable list of options                    |
| \`option\`      | \`li\`            | Individual option within a listbox            |
| \`progressbar\` | \`div\`           | Displays progress of a task                   |
| \`status\`      | \`div\`           | Advisory information (pairs with \`aria-live\`)  |

## Testing Accessibility

Validate accessibility at multiple levels:

1. **Automated checks** -- Use axe-core in integration tests to catch missing labels, contrast issues, and invalid ARIA.
2. **Keyboard testing** -- Verify all interactive elements are reachable via Tab, Enter, Space, Escape, and arrow keys.
3. **Screen reader testing** -- Test with VoiceOver, NVDA, or Orca to confirm announcements and navigation flow.
4. **Playwright E2E tests** -- Assert focus position and \`aria-*\` attribute values after interactions.

\`\`\`typescript
// Example Playwright assertion
const dialog = page.locator('[role="dialog"]');
await expect(dialog).toHaveAttribute('aria-modal', 'true');
await expect(dialog.locator('button')).toBeFocused();
\`\`\`

## See Also

- [Core Concepts](./core-concepts.md)
- [API Reference: createElement](../api/create-element.md)
- [API Reference: useRef](../api/hooks.md#useref)
`},{title:`Async Function Evaluation`,path:`guides/async-computation`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Async Function Evaluation

SpecifyJS includes an async computation engine for evaluating mathematical
functions over a range of input values without blocking the UI. The engine
splits work into batches and yields to the browser between batches using
\`requestIdleCallback\` (or \`setTimeout\` as a fallback).

This module powers the \`CartesianGraph2D\` and \`PolarGraph2D\` visualization
components but can be used independently in any component that needs to
compute a large number of function evaluations.

---

## Import

\`\`\`typescript
import {
  evaluateFunction,
  generateInputs,
  computeSync,
  computeAsync,
} from '@asymmetric-effort/specifyjs';
\`\`\`

> **Note:** These functions are currently part of the internal \`shared/\`
> module. Import paths may vary depending on your project setup.

---

## Quick Start

\`\`\`typescript
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
    console.log(\`Computed \${results.length} points\`);
    // results: Array<{ input: number, output: number }>
  },
);

// Cancel computation if the component unmounts
// cancel();
\`\`\`

---

## Types

### ComputedPoint

\`\`\`typescript
interface ComputedPoint {
  input: number;   // The x (or theta) value
  output: number;  // The computed f(x) value
}
\`\`\`

### RangeSpec

\`\`\`typescript
interface RangeSpec {
  start: number;  // First input value
  end: number;    // Last input value (inclusive)
  step: number;   // Increment between values
}
\`\`\`

### AsyncComputeOptions

\`\`\`typescript
interface AsyncComputeOptions {
  fn: (x: number) => number;   // The function to evaluate
  range: RangeSpec;            // Range of input values
  sync?: boolean;              // If true, compute synchronously (default: false)
  batchSize?: number;          // Evaluations per idle tick (default: 200)
}
\`\`\`

---

## Core Functions

### evaluateFunction(options, onResult)

High-level entry point. Evaluates a function over a range and calls
\`onResult\` with the computed points.

\`\`\`typescript
function evaluateFunction(
  options: AsyncComputeOptions,
  onResult: (points: ComputedPoint[]) => void,
): { points: ComputedPoint[] | null; cancel: () => void }
\`\`\`

**Return value:**
- \`points\` -- In sync mode, the computed points are returned immediately. In
  async mode, this is \`null\` (use the callback).
- \`cancel\` -- A function to abort async computation. In sync mode, this is a
  no-op.

**Sync mode:**
\`\`\`typescript
const { points } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 }, sync: true },
  (results) => { /* also called immediately in sync mode */ },
);
// points is available immediately
console.log(points.length); // 101
\`\`\`

**Async mode:**
\`\`\`typescript
const { cancel } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 } },
  (results) => {
    // Called once when all batches are complete
    console.log(results.length);
  },
);
// cancel() to abort
\`\`\`

### generateInputs(range)

Generates the full array of input values for a range specification.

\`\`\`typescript
function generateInputs(range: RangeSpec): number[]
\`\`\`

\`\`\`typescript
const inputs = generateInputs({ start: 0, end: 1, step: 0.25 });
// [0, 0.25, 0.5, 0.75, 1.0]
\`\`\`

**Safety limits:**
- Returns \`[]\` if \`step <= 0\` or \`step\` is not finite
- Returns \`[]\` if the computed count exceeds 1,000,000 (prevents memory
  explosion from very small step values)

### computeSync(fn, inputs)

Evaluates a function for every input value synchronously. Non-finite outputs
(NaN, Infinity, -Infinity) are silently skipped.

\`\`\`typescript
function computeSync(fn: (x: number) => number, inputs: number[]): ComputedPoint[]
\`\`\`

\`\`\`typescript
const results = computeSync(Math.sqrt, [0, 1, 4, -1, 9]);
// [
//   { input: 0, output: 0 },
//   { input: 1, output: 1 },
//   { input: 4, output: 2 },
//   // { input: -1, output: NaN } -- skipped (not finite)
//   { input: 9, output: 3 },
// ]
\`\`\`

### computeAsync(fn, inputs, batchSize, onProgress)

Evaluates a function in batches, yielding to the browser between batches.
Returns a cancel function.

\`\`\`typescript
function computeAsync(
  fn: (x: number) => number,
  inputs: number[],
  batchSize: number,
  onProgress: (results: ComputedPoint[], done: boolean) => void,
): () => void
\`\`\`

The \`onProgress\` callback is called after each batch with:
- \`results\` -- all points computed so far (cumulative)
- \`done\` -- \`true\` after the final batch

\`\`\`typescript
const cancel = computeAsync(
  (x) => Math.sin(x) / x,
  generateInputs({ start: 0.01, end: 100, step: 0.01 }),
  500,
  (results, done) => {
    if (done) {
      console.log(\`Finished: \${results.length} points\`);
    } else {
      console.log(\`Progress: \${results.length} points so far\`);
    }
  },
);

// Abort if needed:
cancel();
\`\`\`

**Scheduling:** Uses \`requestIdleCallback\` with a 16ms timeout when available,
falling back to \`setTimeout(fn, 0)\`.

---

## Using with Graph Components

The \`CartesianGraph2D\` and \`PolarGraph2D\` visualization components use async
computation internally. You control the behavior with these props:

### CartesianGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| \`plotFunction\` | \`(x: number) => number\` | required | The function to plot |
| \`xMin\` / \`xMax\` | \`number\` | required | X-axis range |
| \`plotResolution\` | \`number\` | \`200\` | Number of samples across the range |
| \`xStep\` | \`number\` | computed | Explicit step size (overrides \`plotResolution\`) |
| \`syncMode\` | \`boolean\` | \`false\` | If true, compute synchronously |

When \`syncMode\` is \`false\` (default), the component uses \`computeAsync\` to
evaluate the function in batches. This keeps the UI responsive when plotting
complex functions over large ranges.

When \`syncMode\` is \`true\`, the component uses \`computeSync\` via \`useMemo\` for
immediate results. Use this for simple functions or small ranges.

### PolarGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| \`plotFunction\` | \`(theta: number) => number\` | required | Maps angle to radius |
| \`plotResolution\` | \`number\` | \`360\` | Number of samples around the circle |
| \`thetaStep\` | \`number\` | computed | Explicit theta step (overrides \`plotResolution\`) |
| \`syncMode\` | \`boolean\` | \`false\` | If true, compute synchronously |

The default range is \`0\` to \`2 * Math.PI\`. The step is computed as
\`thetaStep ?? (2 * Math.PI) / plotResolution\`.

---

## Using in Custom Components

You can use the async computation engine in your own components:

\`\`\`typescript
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
\`\`\`

Key patterns:
1. Store the cancel function in a \`useRef\`
2. Cancel previous computation in the effect cleanup
3. Use \`useMemo\` for sync mode, \`useEffect\` + \`useState\` for async mode
4. Check the \`done\` flag before updating state to avoid partial renders

---

## Error Handling

| Scenario | Behavior |
|---|---|
| \`step <= 0\` or non-finite step | \`generateInputs\` returns \`[]\` |
| Range produces more than 1,000,000 inputs | \`generateInputs\` returns \`[]\` |
| Function returns \`NaN\` or \`Infinity\` | Point is silently skipped |
| \`cancel()\` called during computation | Remaining batches are not processed |
| \`cancel()\` called after completion | No-op |
| \`sync: true\` with large input count | Blocks the main thread; use async mode instead |

---

## Performance Tips

- **Use async mode for 1,000+ points.** Sync mode blocks the main thread and
  can cause frame drops on complex functions.
- **Increase \`batchSize\` for simple functions.** If your function is cheap
  (e.g. \`Math.sin\`), a larger batch size (500-1000) reduces scheduling
  overhead.
- **Decrease \`batchSize\` for expensive functions.** If your function involves
  heavy computation, smaller batches (50-100) keep the UI smoother.
- **Cancel on unmount.** Always cancel pending computations in the effect
  cleanup to avoid setting state on unmounted components.
`},{title:`Browser Support`,path:`guides/browser-support`,content:`# Browser Support

SpecifyJS targets modern browsers with ES2020+ support. The framework has zero runtime dependencies, so browser compatibility is determined solely by the JavaScript and DOM APIs it uses.

## Supported Browsers

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome / Chromium | Last 2 major versions | Fully supported |
| Firefox | Last 2 major versions | Fully supported |
| Safari | Last 2 major versions | Fully supported |
| Edge (Chromium) | Last 2 major versions | Fully supported |
| iOS Safari | 15+ | Fully supported |
| Chrome for Android | Last 2 major versions | Fully supported |

Older browsers (Internet Explorer, legacy Edge, Safari < 15) are not supported.

## Required Browser APIs

SpecifyJS relies on the following APIs that are available in all supported browsers:

- **ES2020 features** -- \`Promise\`, \`Map\`, \`Set\`, \`WeakMap\`, \`WeakSet\`, \`Symbol\`, optional chaining, nullish coalescing, \`globalThis\`
- **DOM APIs** -- \`document.createElement\`, \`MutationObserver\`, \`requestAnimationFrame\`, \`queueMicrotask\`
- **Fetch API** -- Used by feature flag loading and recommended for data fetching
- **URL / URLSearchParams** -- Used by the router for query string parsing
- **structuredClone** -- Used in some utilities (Chrome 98+, Firefox 94+, Safari 15.4+)

## Polyfill Recommendations

If you need to support slightly older browser versions, the following polyfills can extend compatibility:

| API | Polyfill | When Needed |
|-----|----------|-------------|
| \`structuredClone\` | \`core-js/actual/structured-clone\` | Safari < 15.4 |
| \`queueMicrotask\` | \`core-js/actual/queue-microtask\` | Very old browsers only |
| \`fetch\` | \`whatwg-fetch\` | Only if targeting legacy environments |

Add polyfills at the entry point of your application, before importing SpecifyJS:

\`\`\`typescript
import 'core-js/actual/structured-clone';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
\`\`\`

In most cases, no polyfills are needed if you target the browser versions listed above.

## Platform Support

| Platform | Architecture | Status |
|----------|-------------|--------|
| Linux | AMD64 | First-class (CI runs here) |
| Linux | ARM64 | Planned |
| macOS | Intel / Apple Silicon | Planned |
| Windows | x64 | Planned |

Development and CI are currently validated on Linux AMD64. The framework itself is pure JavaScript and runs identically on all platforms, but build tooling and E2E tests are validated on Linux first.
`},{title:`Building Single-Page Applications`,path:`guides/building-spas`,content:`# Building Single-Page Applications

SpecifyJS is designed for building SPAs that compile to minified JavaScript for high-performance browser execution.

## Application Structure

A typical SpecifyJS SPA:

\`\`\`
my-app/
  src/
    app.ts          # Root component
    components/     # Reusable components
    hooks/          # Custom hooks
    context/        # Application context providers
  index.html        # HTML shell with <div id="root">
  vite.config.ts    # Build configuration
\`\`\`

## Entry Point

\`\`\`typescript
// src/app.ts
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function App() {
  return createElement('div', { id: 'app' },
    createElement(Router, null),
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(createElement(App, null));
\`\`\`

## State Management

### Local State
Use \`useState\` for component-local state:

\`\`\`typescript
const [items, setItems] = useState<Item[]>([]);
\`\`\`

### Complex State
Use \`useReducer\` for state with multiple actions:

\`\`\`typescript
const [state, dispatch] = useReducer(reducer, initialState);
\`\`\`

### Shared State
Use \`createContext\` + \`useContext\` for app-wide state:

\`\`\`typescript
const AppContext = createContext(defaultState);
\`\`\`

## Performance Patterns

- **\`memo\`** — Skip re-renders when props haven't changed
- **\`useMemo\`** — Cache expensive computations
- **\`useCallback\`** — Stable function references for child components
- **Keys** — Efficient list reconciliation

## Production Build

SpecifyJS apps compile to minified, tree-shaken bundles via Vite/Rollup:

\`\`\`bash
npx vite build
\`\`\`

Target: < 50KB gzipped including framework overhead.

## Example Apps

See \`core/examples/\` for complete working SPAs:

- **Todo App** — Lists, events, filters, refs
- **Counter App** — useReducer, useMemo, useCallback
- **Form App** — Context, controlled inputs, validation

## Next Steps

- [Testing](testing.md) — How to test your SPA
- [Production Builds](production-builds.md) — Optimization and deployment
`},{title:`Code Splitting`,path:`guides/code-splitting`,content:`# Code Splitting

Code splitting lets you break your application into smaller chunks that are loaded on demand. SpecifyJS supports this through \`lazy()\` for dynamic imports and \`Suspense\` for rendering fallback UI while chunks load.

## lazy() for Dynamic Imports

The \`lazy\` function wraps a dynamic \`import()\` call and returns a component that loads its implementation on first render:

\`\`\`typescript
import { createElement, lazy, Suspense } from 'specifyjs';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return createElement(Suspense, { fallback: createElement('p', null, 'Loading chart...') },
    createElement(HeavyChart, { data: chartData }),
  );
}
\`\`\`

The module passed to \`lazy\` must have a \`default\` export that is a SpecifyJS component:

\`\`\`typescript
// components/HeavyChart.ts
export default function HeavyChart(props: { data: number[] }) {
  return createElement('canvas', { className: 'chart' });
}
\`\`\`

## Suspense Boundaries with Fallback

Every \`lazy\` component must be wrapped in a \`Suspense\` boundary. The \`fallback\` prop defines what to show while the component is loading:

\`\`\`typescript
createElement(Suspense, {
  fallback: createElement('div', { className: 'spinner' }, 'Loading...'),
},
  createElement(LazyComponent, null),
);
\`\`\`

You can nest multiple lazy components under a single \`Suspense\` boundary. The fallback is shown until all children within the boundary have loaded:

\`\`\`typescript
createElement(Suspense, { fallback: createElement('p', null, 'Loading page...') },
  createElement(LazyHeader, null),
  createElement(LazyContent, null),
  createElement(LazyFooter, null),
);
\`\`\`

## Route-Based Code Splitting

The most common use of code splitting is at the route level. Each route loads its page component lazily:

\`\`\`typescript
import { createElement, lazy, Suspense } from 'specifyjs';

const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  // Assuming a router that provides currentRoute
  const { currentRoute } = useRouter();

  const pages: Record<string, ReturnType<typeof lazy>> = {
    '/': HomePage,
    '/about': AboutPage,
    '/settings': SettingsPage,
  };

  const Page = pages[currentRoute] || HomePage;

  return createElement(Suspense, {
    fallback: createElement('div', { className: 'page-loader' }, 'Loading...'),
  },
    createElement(Page, null),
  );
}
\`\`\`

This ensures that the JavaScript for each page is only downloaded when the user navigates to that route, reducing the initial bundle size.

## Component-Level Code Splitting

You can also split at the component level for heavy widgets that are not always visible:

\`\`\`typescript
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'));
const DataGrid = lazy(() => import('./components/DataGrid'));

function AdminPanel() {
  const [showEditor, setShowEditor] = useState(false);

  return createElement('div', null,
    createElement('button', {
      onClick: () => setShowEditor(true),
    }, 'Open Editor'),
    showEditor
      ? createElement(Suspense, {
          fallback: createElement('p', null, 'Loading editor...'),
        },
          createElement(MarkdownEditor, null),
        )
      : null,
  );
}
\`\`\`

The editor chunk is only fetched when the user clicks the button.

## Error Handling with Lazy Components

If a dynamic import fails (network error, missing chunk), the promise rejects and the error propagates up the component tree. Use an error boundary to catch it:

\`\`\`typescript
import { Component } from 'specifyjs';

class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return createElement('div', { className: 'error' },
        createElement('p', null, 'Failed to load component.'),
        createElement('button', {
          onClick: () => this.setState({ hasError: false }),
        }, 'Retry'),
      );
    }
    return this.props.children;
  }
}

// Usage
createElement(LazyErrorBoundary, null,
  createElement(Suspense, { fallback: createElement('p', null, 'Loading...') },
    createElement(LazyComponent, null),
  ),
);
\`\`\`

When the user clicks "Retry", the error boundary resets and \`lazy\` re-attempts the import. This pattern is essential for production applications where network reliability varies.
`},{title:`Concurrent Rendering`,path:`guides/concurrent-rendering`,content:`# Concurrent Rendering

Concurrent rendering allows SpecifyJS to work on multiple state updates simultaneously, prioritizing urgent interactions (like typing) over less critical updates (like filtering a large list). This keeps the UI responsive even during expensive renders.

## What Is Concurrent Rendering

In synchronous rendering, every state update blocks the main thread until the entire component tree re-renders. With concurrent rendering, SpecifyJS can interrupt a low-priority render to process a higher-priority update first, then resume or restart the lower-priority work.

Concurrent rendering is enabled automatically when you use \`createRoot\`:

\`\`\`typescript
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
\`\`\`

## Lane-Based Priority System

SpecifyJS uses a lane-based priority system to classify updates. Each update is assigned a lane that determines its urgency:

| Lane | Priority | Use Case |
|------|----------|----------|
| \`SyncLane\` | Highest | \`flushSync\`, discrete user events |
| \`DefaultLane\` | Normal | Standard state updates, event handlers |
| \`TransitionLane\` | Lower | Updates inside \`startTransition\` |

Higher-priority lanes interrupt lower-priority work. When a \`SyncLane\` update arrives while a \`TransitionLane\` render is in progress, the transition render is paused and the sync update is processed first.

## useTransition for Non-Urgent Updates

The \`useTransition\` hook marks a state update as non-urgent. It returns an \`isPending\` flag and a \`startTransition\` function:

\`\`\`typescript
import { useState, useTransition } from 'specifyjs/hooks';
import { createElement } from 'specifyjs';

function SearchableList(props: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(props.items);
  const [isPending, startTransition] = useTransition();

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);                        // Urgent: update the input immediately
    startTransition(() => {
      setFiltered(                          // Non-urgent: filter can wait
        props.items.filter((item) => item.toLowerCase().includes(value.toLowerCase())),
      );
    });
  }

  return createElement('div', null,
    createElement('input', { value: query, onInput: handleInput, placeholder: 'Search...' }),
    isPending
      ? createElement('p', null, 'Filtering...')
      : null,
    createElement('ul', null,
      filtered.map((item) => createElement('li', { key: item }, item)),
    ),
  );
}
\`\`\`

The input field updates instantly because \`setQuery\` is a normal (default lane) update. The list filtering happens inside \`startTransition\`, so it can be interrupted if the user types again before filtering completes.

## useDeferredValue for Expensive Computations

\`useDeferredValue\` returns a deferred copy of a value. The deferred value lags behind during urgent updates, allowing the UI to remain responsive:

\`\`\`typescript
import { useState, useDeferredValue, useMemo } from 'specifyjs/hooks';

function ExpensiveChart(props: { data: number[] }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filteredData = useMemo(() => {
    return props.data.filter((d) => expensiveCheck(d, deferredFilter));
  }, [props.data, deferredFilter]);

  const isStale = filter !== deferredFilter;

  return createElement('div', null,
    createElement('input', {
      value: filter,
      onInput: (e) => setFilter((e.target as HTMLInputElement).value),
    }),
    createElement('div', {
      style: { opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' },
    },
      createElement(Chart, { data: filteredData }),
    ),
  );
}
\`\`\`

While the user types, \`deferredFilter\` lags behind \`filter\`. The chart re-renders with the deferred value, which can be interrupted if new input arrives. The stale state is indicated visually by reducing opacity.

## startTransition API

The standalone \`startTransition\` function works the same as the hook version but can be used outside of components:

\`\`\`typescript
import { startTransition } from 'specifyjs';

function handleNavigation(url: string) {
  startTransition(() => {
    setCurrentRoute(url);
  });
}
\`\`\`

State updates inside \`startTransition\` are assigned a \`TransitionLane\`, making them interruptible by higher-priority updates. Unlike \`useTransition\`, the standalone function does not provide an \`isPending\` flag.

## When to Use Concurrent Features

Use concurrent features when a state update triggers an expensive re-render that could block user interaction:

**Good candidates for transitions:**
- Filtering or sorting large lists
- Navigating between routes (loading new page content)
- Updating visualizations or charts with large datasets
- Search-as-you-type with results rendering

**Not needed for:**
- Simple state toggles (show/hide, open/close)
- Form input updates with minimal re-renders
- State changes that affect only a small subtree

### Guidelines

1. Keep urgent updates (text input, button feedback) outside \`startTransition\`.
2. Wrap expensive, non-blocking updates in \`startTransition\` or use \`useDeferredValue\`.
3. Show visual feedback during pending transitions (spinners, opacity changes).
4. Do not overuse transitions. Most updates are fast enough without them. Profile first, then optimize.
5. Combine \`useMemo\` with \`useDeferredValue\` to avoid recomputing expensive derived data on every keystroke.
`},{title:`Core Concepts`,path:`guides/core-concepts`,content:`# Core Concepts

## Elements

SpecifyJS elements are lightweight objects describing what to render:

\`\`\`typescript
const element = createElement('div', { className: 'card' },
  createElement('h2', null, 'Title'),
  createElement('p', null, 'Content'),
);
\`\`\`

## Function Components

Components are functions that return elements:

\`\`\`typescript
function Greeting(props: { name: string }) {
  return createElement('h1', null, \`Hello, \${props.name}!\`);
}
\`\`\`

## Props

Props are read-only inputs passed to components:

\`\`\`typescript
createElement(Greeting, { name: 'World' });
\`\`\`

Reserved props: \`key\` (reconciliation identity) and \`ref\` (DOM/instance access).

## State

Components manage local state with \`useState\`:

\`\`\`typescript
function Counter() {
  const [count, setCount] = useState(0);
  return createElement('button', {
    onClick: () => setCount(prev => prev + 1),
  }, \`Clicked \${count} times\`);
}
\`\`\`

## Lifecycle (Effects)

Side effects run after rendering:

\`\`\`typescript
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id); // Cleanup
  }, []); // Empty deps = run once

  return createElement('span', null, \`\${seconds}s\`);
}
\`\`\`

## Context

Share values through the component tree without prop drilling:

\`\`\`typescript
const ThemeContext = createContext('light');

function App() {
  return createElement(ThemeContext.Provider, { value: 'dark' },
    createElement(ThemedButton, null),
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return createElement('button', { className: theme }, 'Click');
}
\`\`\`

## Fragments

Group children without extra DOM nodes:

\`\`\`typescript
createElement(Fragment, null,
  createElement('span', null, 'A'),
  createElement('span', null, 'B'),
);
\`\`\`

## Keys

Use \`key\` for efficient list reconciliation:

\`\`\`typescript
items.map(item =>
  createElement('li', { key: item.id }, item.name)
);
\`\`\`

## Next Steps

- [Hooks API](../api/hooks.md) — Full hook reference
- [Building SPAs](building-spas.md) — Application patterns
`},{title:`Custom Hooks`,path:`guides/custom-hooks`,content:`# Custom Hooks

Custom hooks let you extract reusable stateful logic from components. They are regular functions that call built-in hooks internally.

## What Are Custom Hooks

A custom hook is any function whose name starts with \`use\` and that calls one or more SpecifyJS hooks. Custom hooks let you share behavior between components without duplicating code or introducing wrapper components.

## Naming Convention

Custom hooks must follow the \`use*\` naming convention. This convention is enforced by linters and signals to developers (and to SpecifyJS) that the function follows the rules of hooks: it must be called at the top level of a component or another hook, never inside conditions or loops.

\`\`\`typescript
// Good
function useWindowSize() { ... }
function useDocumentTitle(title: string) { ... }

// Bad - not recognized as a hook
function getWindowSize() { ... }
function fetchData() { ... }
\`\`\`

## Building a useFetch Hook

A hook that fetches data from an API endpoint:

\`\`\`typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json as T);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
\`\`\`

Usage in a component:

\`\`\`typescript
function UserProfile(props: { userId: string }) {
  const { data, loading, error } = useFetch(\`/api/users/\${props.userId}\`);

  if (loading) return createElement('p', null, 'Loading...');
  if (error) return createElement('p', null, \`Error: \${error}\`);
  return createElement('h1', null, data.name);
}
\`\`\`

## Building a useLocalStorage Hook

A hook that syncs state with \`localStorage\`:

\`\`\`typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(stored));
  }, [key, stored]);

  return [stored, setStored];
}
\`\`\`

Usage:

\`\`\`typescript
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return createElement('button', {
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  }, \`Current theme: \${theme}\`);
}
\`\`\`

## Building a useDebounce Hook

A hook that delays updating a value until input settles:

\`\`\`typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
\`\`\`

Usage with a search input:

\`\`\`typescript
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useFetch(\`/api/search?q=\${debouncedQuery}\`);

  return createElement('div', null,
    createElement('input', {
      value: query,
      onInput: (e) => setQuery(e.target.value),
      placeholder: 'Search...',
    }),
    createElement('ul', null,
      (data || []).map((item) =>
        createElement('li', { key: item.id }, item.title),
      ),
    ),
  );
}
\`\`\`

## Composing Hooks Together

Custom hooks can call other custom hooks. The \`SearchBox\` example above already demonstrates this: \`useDebounce\` and \`useFetch\` are composed together. You can also create higher-level hooks that combine several primitives:

\`\`\`typescript
function useDebouncedFetch<T>(url: string, delayMs: number) {
  const debouncedUrl = useDebounce(url, delayMs);
  return useFetch<T>(debouncedUrl);
}
\`\`\`

## Testing Custom Hooks

Test custom hooks by creating a minimal component that exercises the hook, then render it with \`createRoot\`:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { act } from 'specifyjs/test-utils';

test('useDebounce delays value', async () => {
  let result: string;

  function TestComponent() {
    result = useDebounce('hello', 100);
    return createElement('span', null, result);
  }

  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(createElement(TestComponent, null));
  });

  expect(result).toBe('hello');
});
\`\`\`

For hooks that depend on external APIs (fetch, localStorage), mock those APIs in your test setup to keep tests deterministic and fast.

## Rules of Hooks

Custom hooks follow the same rules as built-in hooks:

1. Only call hooks at the top level of a function component or custom hook.
2. Never call hooks inside conditions, loops, or nested functions.
3. Always call hooks in the same order on every render.

Violating these rules causes a runtime error: "Invalid hook call. Hooks can only be called inside the body of a function component."
`},{title:`Deployment`,path:`guides/deployment`,content:`# Deployment

This guide covers building SpecifyJS applications for production and deploying them to common hosting platforms.

## Building for Production

SpecifyJS applications use Vite (backed by Rollup) for production builds. The build process produces minified, tree-shaken JavaScript bundles optimized for browser delivery.

\`\`\`bash
npx vite build
\`\`\`

This outputs files to the \`dist/\` directory:

\`\`\`
dist/
  index.html
  assets/
    index-abc123.js    # Hashed JS bundle
    style-def456.css   # Hashed CSS (if applicable)
\`\`\`

### Vite Configuration

A minimal \`vite.config.ts\` for a SpecifyJS SPA:

\`\`\`typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
\`\`\`

The framework targets less than 15KB minified and gzipped for the core library. Applications should aim for under 50KB gzipped total, including framework overhead.

## Deploying to GitHub Pages

GitHub Pages serves static files from a branch or directory.

1. Set the \`base\` option in \`vite.config.ts\` to your repository name:

\`\`\`typescript
export default defineConfig({
  base: '/your-repo-name/',
});
\`\`\`

2. Build the project:

\`\`\`bash
npx vite build
\`\`\`

3. Deploy using the \`gh-pages\` package or a GitHub Actions workflow:

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
      - run: npm ci
      - run: npx vite build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
\`\`\`

For hash-based routing (\`/#/about\`), no special server configuration is needed since GitHub Pages always serves \`index.html\` for the root path.

## Deploying to Netlify

1. Create a \`netlify.toml\` in the project root:

\`\`\`toml
[build]
  command = "npx vite build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

The redirect rule ensures that client-side routes work when the user refreshes or navigates directly to a deep URL.

2. Connect your repository to Netlify via the dashboard, or use the Netlify CLI:

\`\`\`bash
npx netlify deploy --prod --dir=dist
\`\`\`

## Deploying to Vercel

1. Create a \`vercel.json\` in the project root:

\`\`\`json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

2. Deploy with the Vercel CLI:

\`\`\`bash
npx vercel --prod
\`\`\`

## Environment Variables

Vite exposes environment variables prefixed with \`VITE_\` to client-side code:

\`\`\`bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-000000
\`\`\`

Access them in your application:

\`\`\`typescript
const apiUrl = import.meta.env.VITE_API_URL;
\`\`\`

Never put secrets (API keys, tokens) in \`VITE_\` variables. They are embedded in the client bundle and visible to anyone. Use server-side API endpoints to proxy requests that require authentication.

## CNAME and Custom Domain Setup

### GitHub Pages

Create a \`CNAME\` file in your \`public/\` directory (so Vite copies it to \`dist/\`):

\`\`\`
app.example.com
\`\`\`

Then configure your DNS provider to point \`app.example.com\` to \`your-username.github.io\` with a CNAME record.

### Netlify / Vercel

Both platforms provide custom domain configuration through their dashboards. Add your domain and follow the DNS instructions they provide. Both handle TLS certificates automatically.

When using a custom domain, set the \`base\` option in Vite to \`/\` instead of the repository name.

## Source Maps in Production

Source maps help debug production issues but expose your source code. Configure them based on your needs:

\`\`\`typescript
export default defineConfig({
  build: {
    // Full source maps (uploaded to error tracking, not served publicly)
    sourcemap: 'hidden',
    // Or disable entirely
    // sourcemap: false,
  },
});
\`\`\`

- \`true\` -- Source maps are generated and referenced in the bundle. Useful for development.
- \`'hidden'\` -- Source maps are generated but not referenced. Upload them to error tracking services (Sentry, Datadog) without exposing them to users.
- \`false\` -- No source maps generated.

## Performance Verification

After deploying, verify your application meets performance targets:

1. **Lighthouse audit** -- Run Chrome DevTools Lighthouse in Incognito mode. Target a score above 90 for Performance.
2. **Bundle analysis** -- Use \`npx vite-bundle-visualizer\` to identify oversized chunks.
3. **First paint** -- Initial content should render within 100ms on modern hardware.
4. **Network** -- Confirm assets are served with proper cache headers (\`Cache-Control: max-age=31536000, immutable\` for hashed files).
5. **Compression** -- Verify your host serves Brotli or gzip-compressed assets.

\`\`\`bash
# Check compressed size of your bundle
gzip -9 -c dist/assets/index-*.js | wc -c
\`\`\`
`},{title:`Error Handling`,path:`guides/error-handling`,content:`# Error Handling

Errors in a UI tree can leave the entire application in a broken state. SpecifyJS provides **error boundaries** -- class components that catch errors during rendering, lifecycle methods, and constructors of any component below them in the tree.

## What Happens When a Component Throws

When a component throws during rendering, SpecifyJS walks up the fiber tree looking for an ancestor with \`componentDidCatch\` or \`getDerivedStateFromError\`. If one is found, the boundary captures the error and re-renders with fallback UI. If no boundary exists, the entire tree unmounts.

## Using the Built-in ErrorBoundary

SpecifyJS exports a ready-made \`ErrorBoundary\` component. Wrap any subtree that might fail:

\`\`\`typescript
import { createElement, ErrorBoundary } from 'specifyjs';

function App() {
  return createElement(ErrorBoundary, {
    fallback: createElement('p', null, 'Something went wrong.'),
    onError: (error: unknown, info: ErrorInfo) => {
      console.error('Caught by boundary:', error, info.componentStack);
    },
  },
    createElement(UnstableWidget, null),
  );
}
\`\`\`

The \`ErrorBoundaryProps\` interface accepts:

| Prop       | Type                                         | Purpose                               |
|------------|----------------------------------------------|---------------------------------------|
| \`fallback\` | \`SpecNode\`                                   | UI rendered when an error is caught   |
| \`onError\`  | \`(error: unknown, info: ErrorInfo) => void\`  | Callback for logging or side effects  |
| \`children\` | \`SpecNode\`                                   | Normal child tree                     |

## Building a Custom Error Boundary

Any class component becomes an error boundary when it implements one or both of the static and instance lifecycle methods:

\`\`\`typescript
import { Component, createElement } from 'specifyjs';
import type { SpecNode, ErrorInfo, Props } from 'specifyjs';

interface BoundaryProps extends Props {
  children?: SpecNode;
}

interface BoundaryState {
  hasError: boolean;
  error: unknown;
}

class CustomBoundary extends Component<BoundaryProps, BoundaryState> {
  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    // Update state so the next render shows fallback UI.
    return { hasError: true, error };
  }

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Side effects: send to a logging service, analytics, etc.
    reportErrorToService(error, info.componentStack);
  }

  render(): SpecNode {
    if (this.state.hasError) {
      return createElement('div', { role: 'alert' },
        createElement('h2', null, 'Unexpected Error'),
        createElement('pre', null, String(this.state.error)),
      );
    }
    return this.props.children ?? null;
  }
}
\`\`\`

### getDerivedStateFromError vs componentDidCatch

- **\`getDerivedStateFromError(error)\`** -- A static method called during the render phase. It returns a partial state update used to switch to fallback UI. It must be a pure function with no side effects.
- **\`componentDidCatch(error, info)\`** -- An instance method called during the commit phase. Use it for side effects like error logging. The \`info\` argument contains a \`componentStack\` string showing the component ancestry.

## Fallback UI Patterns

### Simple message

\`\`\`typescript
createElement(ErrorBoundary, {
  fallback: createElement('p', null, 'This section is unavailable.'),
}, children);
\`\`\`

### Retry button

\`\`\`typescript
class RetryBoundary extends Component<BoundaryProps, BoundaryState> {
  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { hasError: true, error };
  }

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): SpecNode {
    if (this.state.hasError) {
      return createElement('div', { role: 'alert' },
        createElement('p', null, 'Something went wrong.'),
        createElement('button', { onClick: this.handleRetry }, 'Try Again'),
      );
    }
    return this.props.children ?? null;
  }
}
\`\`\`

Calling \`setState\` to clear the error causes the boundary to attempt rendering the children again.

## Error Recovery Strategies

1. **Retry rendering** -- Reset the boundary state to re-mount children (shown above).
2. **Granular boundaries** -- Place boundaries around individual widgets rather than the entire app. A failing sidebar should not take down the main content area.
3. **Progressive degradation** -- Show reduced functionality in fallback UI rather than a blank screen.
4. **Route-level boundaries** -- Wrap each route in a boundary so navigation errors are isolated.

## Logging Errors

Use the \`onError\` prop (built-in boundary) or \`componentDidCatch\` (custom boundary) to send errors to external services:

\`\`\`typescript
function logError(error: unknown, componentStack: string): void {
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      componentStack,
      timestamp: Date.now(),
    }),
  });
}
\`\`\`

## Error Boundaries and Async Operations

Error boundaries catch errors thrown **synchronously** during rendering and lifecycle methods. They do **not** catch errors inside event handlers or asynchronous code (promises, \`setTimeout\`). Handle those with standard try/catch and local state:

\`\`\`typescript
function DataLoader() {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => setData(d.value))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return createElement('p', { role: 'alert' }, \`Load failed: \${error}\`);
  }
  return createElement('p', null, data ?? 'Loading...');
}
\`\`\`

Combine both patterns for full coverage: an error boundary around the component tree and local error state for async work within individual components.

## See Also

- [API Reference: ErrorBoundary](../api/error-boundary.md)
- [API Reference: Component](../api/component.md)
- [Core Concepts](./core-concepts.md)
`},{title:`Feature Flags`,path:`guides/feature-flags`,content:`# Feature Flags

SpecifyJS includes a built-in feature flag system based on the Context API. It allows you to gate UI features behind boolean flags, load flag configuration from static JSON, and toggle flags at runtime.

## FeatureFlagProvider

Wrap your application (or a subtree) in \`FeatureFlagProvider\` to make flags available to all descendants:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { FeatureFlagProvider } from 'specifyjs/features';
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));

root.render(
  createElement(FeatureFlagProvider, {
    defaults: { darkMode: true, newDashboard: false },
  },
    createElement(App, null),
  ),
);
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| \`defaults\` | \`Record<string, boolean>\` | Initial flag values applied immediately. |
| \`url\` | \`string\` | URL to fetch a JSON object of flag overrides from. |
| \`children\` | \`SpecNode\` | Child components that can consume flags. |

When both \`defaults\` and \`url\` are provided, defaults are applied first, then remote flags are merged on top once the fetch completes.

## Loading Flags from Static JSON

Point the \`url\` prop at a static JSON file served over HTTPS:

\`\`\`typescript
createElement(FeatureFlagProvider, {
  url: 'https://cdn.example.com/flags.json',
  defaults: { betaFeature: false },
},
  createElement(App, null),
);
\`\`\`

The JSON file should be a flat object mapping flag names to booleans:

\`\`\`json
{ "betaFeature": true, "newCheckout": false }
\`\`\`

The provider sanitizes incoming JSON, stripping \`__proto__\`, \`constructor\`, and \`prototype\` keys to prevent prototype pollution.

## FeatureGate Component

\`FeatureGate\` conditionally renders children based on whether a flag is enabled:

\`\`\`typescript
import { FeatureGate } from 'specifyjs/features';

function Dashboard() {
  return createElement('div', null,
    createElement(FeatureGate, { flag: 'newDashboard' },
      createElement(NewDashboard, null),
    ),
    createElement(FeatureGate, {
      flag: 'newDashboard',
      fallback: createElement(LegacyWidget, null),
    },
      createElement(NewWidget, null),
    ),
  );
}
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| \`flag\` | \`string\` | The flag name to check. |
| \`children\` | \`SpecNode\` | Rendered when the flag is enabled. |
| \`fallback\` | \`SpecNode\` | Rendered when the flag is disabled (defaults to \`null\`). |

## useFeatureFlags Hook

For programmatic access, use the \`useFeatureFlags\` hook:

\`\`\`typescript
import { useFeatureFlags } from 'specifyjs/features';

function SettingsPanel() {
  const { flags, isEnabled, setFlag, loading } = useFeatureFlags();

  if (loading) {
    return createElement('p', null, 'Loading flags...');
  }

  return createElement('div', null,
    createElement('p', null, \`Dark mode: \${isEnabled('darkMode')}\`),
    createElement('button', {
      onClick: () => setFlag('darkMode', !isEnabled('darkMode')),
    }, 'Toggle Dark Mode'),
  );
}
\`\`\`

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| \`flags\` | \`Record<string, boolean>\` | Current flag state object. |
| \`isEnabled\` | \`(flag: string) => boolean\` | Returns \`true\` if the named flag is enabled. |
| \`setFlag\` | \`(flag: string, enabled: boolean) => void\` | Updates a flag at runtime. |
| \`loading\` | \`boolean\` | \`true\` while remote flags are being fetched. |

## Toggling Flags at Runtime

Flags can be changed at runtime using \`setFlag\`. This triggers a re-render of all components consuming the flag context:

\`\`\`typescript
function AdminToolbar() {
  const { setFlag, isEnabled } = useFeatureFlags();

  return createElement('label', null,
    createElement('input', {
      type: 'checkbox',
      checked: isEnabled('experimentalEditor'),
      onChange: (e) => setFlag('experimentalEditor', e.target.checked),
    }),
    ' Enable experimental editor',
  );
}
\`\`\`

Runtime flag changes are not persisted. To persist them, combine \`setFlag\` with \`localStorage\` or an API call in your application code.
`},{title:`Forms and Validation`,path:`guides/forms-and-validation`,content:`# Forms and Validation

This guide covers building forms in SpecifyJS, from basic inputs to complex multi-step wizards with async validation.

## Controlled Components

SpecifyJS forms follow the controlled component pattern: the component state is the single source of truth, and user input is fed back through event handlers.

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';

function NameInput() {
  const [name, setName] = useState('');

  return createElement('input', {
    type: 'text',
    value: name,
    onInput: (e: Event) => setName((e.target as HTMLInputElement).value),
  });
}
\`\`\`

The \`value\` prop locks the input to the current state. The \`onInput\` handler updates state on every keystroke, which triggers a re-render with the new value. This gives you full control over what the user sees and lets you intercept, transform, or reject input before it reaches the DOM.

## Building a Basic Form

A typical form composes multiple controlled inputs and handles submission:

\`\`\`typescript
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement('label', null, 'Name'),
    createElement('input', {
      type: 'text',
      value: name,
      onInput: (e: Event) => setName((e.target as HTMLInputElement).value),
    }),
    createElement('label', null, 'Email'),
    createElement('input', {
      type: 'email',
      value: email,
      onInput: (e: Event) => setEmail((e.target as HTMLInputElement).value),
    }),
    createElement('button', { type: 'submit' }, 'Send'),
  );
}
\`\`\`

Always call \`e.preventDefault()\` in the submit handler to prevent the browser from performing a full page navigation.

## Using FormFieldWrapper for Consistent Styling

The \`FormFieldWrapper\` component provides a standardized container with label, help text, error display, required indicator, and disabled styling. All form components in the \`@specifyjs/components\` library use it internally.

\`\`\`typescript
import { FormFieldWrapper } from '@specifyjs/form-wrapper';

function StyledInput() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  return createElement(FormFieldWrapper, {
    label: 'Username',
    required: true,
    helpText: 'Choose a unique username',
    error: error,
  },
    createElement('input', {
      type: 'text',
      value: value,
      onInput: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        setValue(v);
        setError(v.length < 3 ? 'Must be at least 3 characters' : undefined);
      },
    }),
  );
}
\`\`\`

The wrapper handles label-to-input linking via \`htmlFor\`, displays a red asterisk for required fields, and switches between help text and error messages automatically. Customize colors, fonts, and spacing through the \`styling\` prop.

For single-line text inputs, the pre-built \`TextField\` component wraps \`FormFieldWrapper\` with focus/blur state management, prefix/suffix addon slots, and keyboard handling (e.g., \`onEnter\`):

\`\`\`typescript
import { TextField } from '@specifyjs/textfield';

createElement(TextField, {
  label: 'Email',
  type: 'email',
  value: email,
  onChange: setEmail,
  error: emailError,
  required: true,
  placeholder: 'you@example.com',
});
\`\`\`

## Input Validation Patterns

### Inline Validation

Validate on every change or on blur. Blur validation avoids showing errors while the user is still typing:

\`\`\`typescript
function ValidatedEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const validate = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) return 'Invalid email address';
    return undefined;
  };

  return createElement(TextField, {
    label: 'Email',
    type: 'email',
    value: email,
    onChange: setEmail,
    onBlur: (v: string) => setError(validate(v)),
    error: error,
    required: true,
  });
}
\`\`\`

### Form-Level Validation

For forms with many fields, centralize validation in a single function that returns an errors map:

\`\`\`typescript
interface FormData { name: string; age: string; email: string; }
type Errors = Partial<Record<keyof FormData, string>>;

function validateForm(data: FormData): Errors {
  const errors: Errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.age || Number(data.age) < 18) errors.age = 'Must be 18 or older';
  if (!data.email) errors.email = 'Email is required';
  return errors;
}

function RegistrationForm() {
  const [data, setData] = useState<FormData>({ name: '', age: '', email: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData) => (value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Submit the data
    }
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement(TextField, { label: 'Name', value: data.name, onChange: update('name'), error: errors.name, required: true }),
    createElement(TextField, { label: 'Age', type: 'number', value: data.age, onChange: update('age'), error: errors.age, required: true }),
    createElement(TextField, { label: 'Email', type: 'email', value: data.email, onChange: update('email'), error: errors.email, required: true }),
    createElement('button', { type: 'submit' }, 'Register'),
  );
}
\`\`\`

### Custom Validation with useReducer

For complex validation logic, \`useReducer\` keeps state transitions predictable:

\`\`\`typescript
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case 'VALIDATE':
      return { ...state, errors: validateForm(state.values) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
\`\`\`

## Displaying Validation Errors

When using \`FormFieldWrapper\` or \`TextField\`, pass the \`error\` prop. The wrapper automatically renders the error with \`role="alert"\` for screen readers. For custom error displays:

\`\`\`typescript
createElement('div', { className: 'error-summary', role: 'alert' },
  Object.entries(errors).map(([field, msg]) =>
    createElement('p', { key: field, style: { color: '#ef4444' } }, \`\${field}: \${msg}\`),
  ),
);
\`\`\`

## Async Validation

Use \`useEffect\` with a debounce pattern to validate against a server:

\`\`\`typescript
function UsernameField() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (username.length < 3) {
      setError(username ? 'Too short' : undefined);
      return;
    }
    setChecking(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await fetch(\`/api/check-username?u=\${encodeURIComponent(username)}\`);
      const { available } = await res.json();
      setError(available ? undefined : 'Username is taken');
      setChecking(false);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [username]);

  return createElement(TextField, {
    label: 'Username',
    value: username,
    onChange: setUsername,
    error: error,
    suffix: checking ? 'Checking...' : null,
    required: true,
  });
}
\`\`\`

## Select and Radio Groups

Build select dropdowns and radio groups as controlled components:

\`\`\`typescript
function ColorPicker() {
  const [color, setColor] = useState('red');

  return createElement(FormFieldWrapper, { label: 'Favorite Color' },
    createElement('select', {
      value: color,
      onChange: (e: Event) => setColor((e.target as HTMLSelectElement).value),
    },
      createElement('option', { value: 'red' }, 'Red'),
      createElement('option', { value: 'green' }, 'Green'),
      createElement('option', { value: 'blue' }, 'Blue'),
    ),
  );
}

function SizeSelector() {
  const [size, setSize] = useState('medium');
  const sizes = ['small', 'medium', 'large'];

  return createElement(FormFieldWrapper, { label: 'Size' },
    ...sizes.map(s =>
      createElement('label', { key: s, style: { marginRight: '12px' } },
        createElement('input', {
          type: 'radio',
          name: 'size',
          value: s,
          checked: size === s,
          onChange: () => setSize(s),
        }),
        \` \${s}\`,
      ),
    ),
  );
}
\`\`\`

## File Uploads

Use an uncontrolled input (type \`file\` cannot be controlled) and read the file via a ref or event:

\`\`\`typescript
function FileUpload() {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/upload', { method: 'POST', body: formData });
    setUploading(false);
  };

  return createElement(FormFieldWrapper, { label: 'Attachment' },
    createElement('input', { type: 'file', onChange: handleFile }),
    fileName ? createElement('span', null, uploading ? 'Uploading...' : \`Selected: \${fileName}\`) : null,
  );
}
\`\`\`

## Date and Time Pickers

Use native HTML date/time inputs as controlled components:

\`\`\`typescript
function DateRange() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  return createElement('div', { style: { display: 'flex', gap: '16px' } },
    createElement(TextField, { label: 'Start Date', type: 'date' as any, value: start, onChange: setStart }),
    createElement(TextField, { label: 'End Date', type: 'date' as any, value: end, onChange: setEnd,
      error: end && start && end < start ? 'End must be after start' : undefined }),
  );
}
\`\`\`

## Multi-Step Forms (Wizards)

Track the current step in state and render one section at a time:

\`\`\`typescript
function WizardForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', email: '', plan: 'free' });

  const steps = [
    () => createElement(TextField, { label: 'Name', value: data.name, onChange: (v: string) => setData(d => ({ ...d, name: v })) }),
    () => createElement(TextField, { label: 'Email', type: 'email', value: data.email, onChange: (v: string) => setData(d => ({ ...d, email: v })) }),
    () => createElement('div', null,
      createElement('h3', null, 'Confirm'),
      createElement('p', null, \`Name: \${data.name}\`),
      createElement('p', null, \`Email: \${data.email}\`),
    ),
  ];

  return createElement('div', null,
    createElement('p', null, \`Step \${step + 1} of \${steps.length}\`),
    steps[step](),
    createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '16px' } },
      step > 0
        ? createElement('button', { onClick: () => setStep(s => s - 1) }, 'Back')
        : null,
      step < steps.length - 1
        ? createElement('button', { onClick: () => setStep(s => s + 1) }, 'Next')
        : createElement('button', { onClick: () => console.log('Submit', data) }, 'Submit'),
    ),
  );
}
\`\`\`

## Best Practices

1. **Prefer controlled components.** Keeping form state in SpecifyJS gives you full control over validation, formatting, and conditional logic.

2. **Validate on blur for UX, on submit for safety.** Show errors after the user finishes a field, but always re-validate the entire form before submitting.

3. **Debounce async validation.** Network requests on every keystroke waste bandwidth and create race conditions. Use a 300-500ms delay.

4. **Use \`FormFieldWrapper\` for consistency.** It handles labels, errors, required indicators, and accessibility attributes so you do not have to.

5. **Set \`aria-invalid\` and \`role="alert"\`.** Screen readers need these attributes to announce validation errors. \`FormFieldWrapper\` and \`TextField\` handle this automatically.

6. **Avoid derived state.** Do not store both the raw value and a "cleaned" version. Derive formatted values during render with \`useMemo\` instead.

7. **Disable the submit button during async operations.** Prevent duplicate submissions by tracking a \`submitting\` state flag.

8. **Use \`key\` props on dynamic field lists.** When fields are added or removed dynamically, stable keys prevent input state from jumping between fields.
`},{title:`Getting Started`,path:`guides/getting-started`,content:`# Getting Started

## Prerequisites

- Node.js 24+
- npm 10+

## Installation

\`\`\`bash
cd core
npm install
\`\`\`

## Create Your First Component

SpecifyJS uses \`createElement\` (or JSX) to describe UI:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { createRoot } from 'specifyjs/dom';

function App() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('h1', null, \`Count: \${count}\`),
    createElement('button', {
      onClick: () => setCount(count + 1)
    }, 'Increment'),
  );
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
\`\`\`

## Development Server

Start the Vite dev server for hot-reloading:

\`\`\`bash
npx vite --port 3000
\`\`\`

## Build for Production

\`\`\`bash
npm run build
\`\`\`

Output lands in \`dist/\` with ESM and CJS bundles.

## Run Tests

\`\`\`bash
npm test              # Unit + integration (465 tests)
npm run test:e2e      # Playwright browser tests (27 tests)
npm run test:coverage # Tests with coverage report
\`\`\`

## Next Steps

- [Core Concepts](core-concepts.md) — Components, props, state
- [Hooks API](../api/hooks.md) — All 16 hooks
- [Building SPAs](building-spas.md) — SPA patterns and examples
`},{title:`Meta Tags`,path:`guides/meta-tags`,content:`# Meta Tags

The \`useHead\` hook lets components declaratively manage document \`<head>\` meta tags. Tags are applied when the component mounts and cleaned up when it unmounts, preventing stale metadata from persisting across route changes.

## useHead Hook API

\`\`\`typescript
import { useHead } from 'specifyjs/hooks';

function AboutPage() {
  useHead({
    title: 'About Us',
    description: 'Learn about our team and mission.',
    keywords: 'about, team, company',
    author: 'SpecifyJS Team',
  });

  return createElement('h1', null, 'About Us');
}
\`\`\`

### Options

| Property | Type | Description |
|----------|------|-------------|
| \`title\` | \`string\` | Sets \`document.title\`. |
| \`description\` | \`string\` | Sets \`<meta name="description">\`. |
| \`keywords\` | \`string\` | Sets \`<meta name="keywords">\` (comma-separated). |
| \`author\` | \`string\` | Sets \`<meta name="author">\`. |
| \`canonical\` | \`string\` | Adds a \`<link rel="canonical">\` element. |
| \`og\` | \`Record<string, string>\` | Open Graph \`<meta property="og:*">\` tags. |
| \`twitter\` | \`Record<string, string>\` | Twitter Card \`<meta name="twitter:*">\` tags. |
| \`httpEquiv\` | \`HeadHttpEquiv\` | HTTP-equiv meta tags. |
| \`meta\` | \`Array<{ name?, property?, content }>\` | Arbitrary meta tags. |

## Setting Title, Description, Keywords, Author

Each property maps to a standard HTML meta tag:

\`\`\`typescript
useHead({
  title: 'Product Page - MyApp',
  description: 'Browse our product catalog with free shipping.',
  keywords: 'products, catalog, shopping',
  author: 'MyApp Inc.',
  canonical: 'https://myapp.com/products',
});
\`\`\`

## Open Graph Tags

Open Graph tags control how your page appears when shared on social media:

\`\`\`typescript
useHead({
  title: 'Blog Post Title',
  og: {
    title: 'Blog Post Title',
    description: 'A summary of the blog post.',
    image: 'https://myapp.com/images/post-og.png',
    url: 'https://myapp.com/blog/post-slug',
    type: 'article',
    site_name: 'MyApp Blog',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myapp',
    title: 'Blog Post Title',
    image: 'https://myapp.com/images/post-og.png',
  },
});
\`\`\`

Each key in the \`og\` object becomes \`<meta property="og:key" content="value">\`. Each key in the \`twitter\` object becomes \`<meta name="twitter:key" content="value">\`.

## HTTP-equiv Meta Tags

HTTP-equiv meta tags set browser-level policies. The \`httpEquiv\` option provides named shortcuts for common security headers:

\`\`\`typescript
useHead({
  httpEquiv: {
    csp: "default-src 'self'; script-src 'self'",
    referrer: 'strict-origin-when-cross-origin',
    contentType: 'nosniff',
    cacheControl: 'no-cache, no-store, must-revalidate',
  },
});
\`\`\`

### Named Shortcuts

| Key | HTTP-equiv header |
|-----|-------------------|
| \`csp\` | \`Content-Security-Policy\` |
| \`referrer\` | \`Referrer-Policy\` |
| \`contentType\` | \`X-Content-Type-Options\` |
| \`frameOptions\` | \`X-Frame-Options\` |
| \`cacheControl\` | \`Cache-Control\` |

You can also pass arbitrary http-equiv names as keys:

\`\`\`typescript
useHead({
  httpEquiv: {
    'X-Custom-Header': 'custom-value',
  },
});
\`\`\`

## Cleanup on Unmount

When the component calling \`useHead\` unmounts, all meta tags it created are removed. Tags that existed before the component mounted have their previous values restored. This automatic cleanup prevents stale meta tags from accumulating as users navigate between routes:

\`\`\`typescript
function ProductPage(props: { product: Product }) {
  // These tags are set on mount and removed on unmount
  useHead({
    title: \`\${props.product.name} - Shop\`,
    description: props.product.summary,
    og: {
      title: props.product.name,
      image: props.product.imageUrl,
    },
  });

  return createElement('div', null,
    createElement('h1', null, props.product.name),
    createElement('p', null, props.product.summary),
  );
}
\`\`\`

The dependency array includes all head properties, so if props change (e.g., navigating to a different product), the tags are updated accordingly.
`},{title:`Migrating from React`,path:`guides/migrating-from-react`,content:"# Migrating from React\n\nSpecifyJS is designed with React API parity. Most React code works with minimal changes.\n\n## Quick Start\n\n1. Replace imports:\n\n```diff\n- import React from 'react';\n- import ReactDOM from 'react-dom/client';\n+ import { createElement, useState, useEffect } from 'specifyjs';\n+ import { createRoot } from 'specifyjs/dom';\n```\n\n2. Replace JSX pragma (if not using automatic runtime):\n\n```json\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"jsx\": \"react-jsx\",\n    \"jsxImportSource\": \"specifyjs\"\n  }\n}\n```\n\n## API Mapping\n\n| React | SpecifyJS | Notes |\n|-------|----------|-------|\n| `React.createElement` | `createElement` | Identical API |\n| `ReactDOM.createRoot` | `createRoot` | from `specifyjs/dom` |\n| `ReactDOM.hydrateRoot` | `hydrateRoot` | from `specifyjs/dom` |\n| `React.useState` | `useState` | Identical |\n| `React.useEffect` | `useEffect` | Identical |\n| `React.useTransition` | `useTransition` | Lane-based concurrent |\n| `React.useDeferredValue` | `useDeferredValue` | Lane-based concurrent |\n| `React.startTransition` | `startTransition` | Identical |\n| `ReactDOM.flushSync` | `flushSync` | from `specifyjs/dom` |\n| `React.memo` | `memo` | Identical |\n| `React.forwardRef` | `forwardRef` | Identical |\n| `React.lazy` | `lazy` | Identical |\n| `React.createContext` | `createContext` | Identical |\n| `React.createFactory` | `createFactory` | Deprecated, supported |\n| `renderToString` | `renderToString` | from `specifyjs/server` (build-time only) |\n| `renderToPipeableStream` | `renderToPipeableStream` | from `specifyjs/server` (build-time only) |\n| `renderToReadableStream` | `renderToReadableStream` | from `specifyjs/server` (build-time only) |\n\n> **Note:** Unlike React, SpecifyJS does NOT support server-side rendering at request time. The `specifyjs/server` module is for **static pre-rendering during builds** only. Dynamic content should be fetched client-side via HTTPS.\n\n## Legacy API Support\n\nSpecifyJS supports React's legacy rendering API for incremental migration:\n\n```typescript\nimport { render, hydrate, unmountComponentAtNode } from 'specifyjs/dom';\n\n// Legacy render (React 17 style)\nrender(element, container);\n\n// Legacy hydrate\nhydrate(element, container);\n\n// Legacy unmount\nunmountComponentAtNode(container);\n```\n\n## Key Differences\n\n### No Default Export\nSpecifyJS uses named exports exclusively. There is no default `React` object.\n\n### Zero Runtime Dependencies\nSpecifyJS has no dependencies. All algorithms (diffing, scheduling, event normalization) are implemented from scratch.\n\n### TypeScript-First\nAll APIs have full TypeScript type definitions. No `@types/` package needed.\n\n### Concurrent Rendering\nSpecifyJS implements lane-based concurrent rendering with the same priority levels as React 18:\n- `SyncLane` for `flushSync`\n- `DefaultLane` for normal updates\n- `TransitionLane` for `startTransition`/`useTransition`\n\n### SVG Support\nSVG elements are rendered with the correct SVG namespace (`createElementNS`).\n\n### Web Components\nCustom elements (tags with hyphens) receive complex prop values as DOM properties rather than string attributes.\n\n## What's Not Supported\n\n- React Server Components (RSC)\n- `use()` hook (React 19)\n- `useOptimistic` (React 19)\n- `useFormStatus` / `useFormState` (React 19)\n- React Native\n"},{title:`Performance Optimization`,path:`guides/performance`,content:`# Performance Optimization

This guide explains how SpecifyJS renders, why unnecessary work happens, and the tools available to eliminate it.

## How SpecifyJS Renders

SpecifyJS uses a three-phase rendering pipeline:

1. **Begin work** -- Traverse the fiber tree top-down. For each component fiber, call the component function to produce new elements, then reconcile the returned children against the previous tree.
2. **Complete work** -- Walk the tree bottom-up, building or updating real DOM nodes for host fibers (div, span, etc.).
3. **Commit** -- Apply all accumulated DOM mutations in a single synchronous batch, then run effects (\`useEffect\`, \`useLayoutEffect\`).

Each fiber carries a lane bitmask indicating the priority of its pending update. The scheduler processes high-priority lanes (user input, \`flushSync\`) before lower-priority ones (transitions). During concurrent rendering, the begin-work phase can yield to the browser between fibers, keeping the main thread responsive.

## Why Unnecessary Re-Renders Happen

A component re-renders whenever its parent re-renders, regardless of whether its props changed. Consider:

\`\`\`typescript
function Parent() {
  const [count, setCount] = useState(0);
  return createElement('div', null,
    createElement('button', { onClick: () => setCount(c => c + 1) }, 'Increment'),
    createElement(ExpensiveChild, null),  // re-renders every time
  );
}
\`\`\`

\`ExpensiveChild\` receives no props that change, yet it re-renders on every click because \`Parent\` creates a new element for it each time. This is where memoization helps.

## memo() for Component Memoization

Wrap a component with \`memo\` to skip re-rendering when its props have not changed (shallow comparison by default):

\`\`\`typescript
import { memo, createElement } from 'specifyjs';

const ExpensiveChild = memo(function ExpensiveChild(props: { data: string }) {
  // Only re-renders when props.data changes
  return createElement('div', null, computeExpensiveLayout(props.data));
});
\`\`\`

Supply a custom comparator for more control:

\`\`\`typescript
const Chart = memo(ChartComponent, (prev, next) => {
  return prev.data.length === next.data.length && prev.theme === next.theme;
});
\`\`\`

Return \`true\` to skip the re-render, \`false\` to allow it -- the opposite of \`shouldComponentUpdate\`.

## useMemo() for Expensive Computations

When a render involves heavy computation, cache the result with \`useMemo\`:

\`\`\`typescript
function FilteredList(props: { items: Item[]; query: string }) {
  const filtered = useMemo(
    () => props.items.filter(item => item.name.includes(props.query)),
    [props.items, props.query],
  );

  return createElement('ul', null,
    filtered.map(item =>
      createElement('li', { key: item.id }, item.name),
    ),
  );
}
\`\`\`

The filter function only runs when \`items\` or \`query\` changes. Without \`useMemo\`, it would run on every render of the parent.

## useCallback() for Stable Function References

Functions defined inside a component are recreated on every render. When passed as props to memoized children, this defeats \`memo\`:

\`\`\`typescript
function Parent() {
  const [count, setCount] = useState(0);

  // Unstable: new function every render
  const handleClick = () => console.log('clicked');

  // Stable: same reference unless deps change
  const stableHandleClick = useCallback(() => console.log('clicked'), []);

  return createElement('div', null,
    createElement(MemoizedButton, { onClick: stableHandleClick }),
  );
}
\`\`\`

Use \`useCallback\` when passing functions to \`memo\`-wrapped children or as dependencies of \`useEffect\`.

## Key Props for Efficient List Reconciliation

The reconciler uses \`key\` props to match old and new children in a list. Without keys, it compares by position, which causes unnecessary DOM mutations when items are inserted, removed, or reordered:

\`\`\`typescript
// Good: stable, unique keys
items.map(item =>
  createElement(Row, { key: item.id, data: item }),
);

// Bad: index keys cause problems on reorder
items.map((item, i) =>
  createElement(Row, { key: i, data: item }),
);
\`\`\`

Use a stable identifier from your data (database ID, slug, etc.) as the key. Avoid array indices unless the list is static and never reordered.

## Lazy Loading with lazy() and Suspense

Split your bundle by lazily loading components that are not needed on initial render:

\`\`\`typescript
import { lazy, createElement, Suspense } from 'specifyjs';

const Settings = lazy(() => import('./Settings'));

function App() {
  return createElement(Suspense, { fallback: createElement('div', null, 'Loading...') },
    createElement(Settings, null),
  );
}
\`\`\`

\`lazy\` accepts a function that returns a dynamic \`import()\` promise. The component is fetched only when it first renders. Until the module resolves, \`Suspense\` displays the fallback. This reduces the initial bundle size and speeds up first paint.

Place \`Suspense\` boundaries at meaningful UI divisions: route-level panels, modal content, or dashboard widgets.

## Concurrent Rendering with useTransition and useDeferredValue

### useTransition

Mark state updates as non-urgent so they do not block user input:

\`\`\`typescript
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);  // Urgent: update the input immediately

    startTransition(() => {
      setResults(filterLargeDataset(value));  // Non-urgent: can be interrupted
    });
  };

  return createElement('div', null,
    createElement('input', { value: query, onInput: handleInput }),
    isPending
      ? createElement('div', null, 'Updating...')
      : createElement('ul', null,
          results.map(r => createElement('li', { key: r }, r)),
        ),
  );
}
\`\`\`

Updates inside \`startTransition\` receive a lower-priority lane. If a higher-priority update arrives (another keystroke), the in-progress transition is interrupted and restarted with the latest state.

### useDeferredValue

Defer an expensive derived value so the UI stays responsive:

\`\`\`typescript
function HeavyVisualization(props: { data: number[] }) {
  const deferredData = useDeferredValue(props.data);

  // deferredData may lag behind props.data during rapid updates
  const chart = useMemo(() => buildChart(deferredData), [deferredData]);

  return createElement('div', null, chart);
}
\`\`\`

## Bundle Size Optimization

### Tree-Shaking

Import only what you use. SpecifyJS is structured as named exports so bundlers can eliminate unused code:

\`\`\`typescript
// Good: only pulls in createElement and useState
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';

// Avoid: barrel imports that may pull in the entire library
import * as Spec from 'specifyjs';
\`\`\`

### Code Splitting

Use dynamic \`import()\` at route boundaries to split the bundle:

\`\`\`typescript
const routes: Record<string, ReturnType<typeof lazy>> = {
  '/dashboard': lazy(() => import('./pages/Dashboard')),
  '/settings': lazy(() => import('./pages/Settings')),
  '/profile': lazy(() => import('./pages/Profile')),
};
\`\`\`

Each route loads its own chunk on demand.

## Profiling with StrictMode

\`StrictMode\` intentionally double-renders components in development to surface impure renders and side effects:

\`\`\`typescript
import { StrictMode, createElement } from 'specifyjs';

createElement(StrictMode, null,
  createElement(App, null),
);
\`\`\`

If a component behaves differently across the two renders (e.g., it mutates external state during render), you have a purity violation that can cause bugs in concurrent mode. Fix these before optimizing.

## Common Performance Anti-Patterns

### Creating objects and arrays inline in props

\`\`\`typescript
// Bad: new object every render defeats memo
createElement(Child, { style: { color: 'red' } });

// Good: stable reference
const style = useMemo(() => ({ color: 'red' }), []);
createElement(Child, { style });
\`\`\`

### Defining components inside other components

\`\`\`typescript
// Bad: new component type every render, destroys all child state
function Parent() {
  function Child() { return createElement('div', null, 'hi'); }
  return createElement(Child, null);
}

// Good: define outside
function Child() { return createElement('div', null, 'hi'); }
function Parent() { return createElement(Child, null); }
\`\`\`

### Over-lifting state

Lifting state to a common ancestor is correct when siblings need to share it. But lifting state to the root when only a leaf needs it forces the entire tree to re-render. Keep state as close to its consumers as possible.

### Premature splitting of contexts

A single context with a large value causes every consumer to re-render on any change. Split contexts by update frequency:

\`\`\`typescript
// Separate rarely-changing config from frequently-changing state
const ThemeContext = createContext('light');
const UserInputContext = createContext('');
\`\`\`

## When NOT to Optimize

Not every re-render is a problem. Measure before optimizing:

1. **Most components are fast.** A component that returns a few elements takes microseconds to render. Wrapping it in \`memo\` adds comparison overhead that may exceed the render cost.

2. **Do not memoize everything.** \`useMemo\` and \`useCallback\` consume memory for the cached value and its dependency array. Use them when profiling shows a measurable improvement.

3. **Profile first.** Use browser DevTools Performance tab or the SpecifyJS \`Profiler\` component to identify actual bottlenecks. Optimize the slowest 5%, not the entire tree.

4. **Avoid premature code splitting.** Splitting a 2KB component into its own chunk adds a network round trip that costs more than the bytes saved. Split at meaningful boundaries where chunks are 20KB or larger.

5. **Readable code wins.** If an optimization makes the code significantly harder to understand, reconsider. Ship the simple version first and optimize when users report slowness.

## Summary Checklist

- Use \`key\` props on all list items with stable identifiers
- Wrap expensive pure components in \`memo\`
- Stabilize function props with \`useCallback\` when passed to memoized children
- Cache expensive computations with \`useMemo\`
- Split routes with \`lazy\` and \`Suspense\`
- Use \`startTransition\` for non-urgent updates that render large trees
- Keep state close to its consumers
- Define components outside of render functions
- Profile before optimizing -- measure, do not guess
`},{title:`Production Builds`,path:`guides/production-builds`,content:`# Production Builds

## Library Build

Build the SpecifyJS library for distribution:

\`\`\`bash
cd core
npm run build
\`\`\`

Outputs:
- \`dist/specifyjs.esm.js\` — ES module (14KB)
- \`dist/specifyjs.cjs.js\` — CommonJS (15KB)
- \`dist/specifyjs-dom.esm.js\` — DOM renderer (40KB)
- \`dist/specifyjs-server.esm.js\` — Pre-rendering (11KB)
- \`dist/specifyjs.d.ts\` — TypeScript declarations

## Application Build

Build a SpecifyJS SPA for deployment using Vite:

\`\`\`bash
npx vite build
\`\`\`

Vite automatically:
- Tree-shakes unused code
- Minifies with esbuild/Terser
- Generates source maps
- Code-splits dynamic imports

## Bundle Size Targets

- Core framework: < 15KB gzipped
- Full app (core + DOM renderer): < 50KB gzipped

## Optimization Tips

1. Use \`memo\` to prevent unnecessary re-renders
2. Use \`useMemo\`/\`useCallback\` for expensive operations
3. Use \`lazy\` for code splitting large components
4. Minimize component depth — flatter trees diff faster

`},{title:`Render Safety — Render Guard System`,path:`guides/render-safety`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Render Safety — Render Guard System

SpecifyJS includes a development-time render guard system that detects infinite
render loops, effect cycles, unstable hook dependencies, and setState floods.
All guards are tree-shaken in production builds (\`__DEV__\` gate) and have zero
overhead in shipped code.

The render guard uses \`WeakMap\` for per-fiber tracking, so component fibers
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
single synchronous work cycle (e.g., a \`setState\` inside the render body that
triggers an immediate re-render).

**Threshold:** \`MAX_RENDERS_PER_CYCLE = 50\`

**Behavior:** Throws an \`Error\` to break the infinite loop. The error message
includes the component name and the number of renders.

**Error message:**
\`\`\`
[SpecifyJS] Maximum update depth exceeded. Component "MyComponent"
re-rendered 51 times in a single cycle. This usually means a useEffect
or setState call is creating an infinite loop. Check that useEffect
dependencies are stable (use useMemo/useCallback for objects/arrays).
\`\`\`

### Common Causes

**Setting state unconditionally during render:**
\`\`\`typescript
// BUG: Causes infinite render loop
function Counter() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // setState during render body
  return createElement('div', null, count);
}
\`\`\`

**Fix:** Move state updates into event handlers or effects:
\`\`\`typescript
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Only runs once after mount
    setCount(1);
  }, []);
  return createElement('div', null, count);
}
\`\`\`

**useEffect with unstable deps that trigger setState:**
\`\`\`typescript
// BUG: Creates a render loop
function List() {
  const [items, setItems] = useState([]);
  const config = { page: 1 }; // New object every render

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]); // config is a new reference every render

  return createElement('ul', null, ...items);
}
\`\`\`

**Fix:** Stabilize dependencies with \`useMemo\`:
\`\`\`typescript
function List() {
  const [items, setItems] = useState([]);
  const config = useMemo(() => ({ page: 1 }), []);

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]);

  return createElement('ul', null, ...items);
}
\`\`\`

### How It Works

The guard tracks per-fiber render counts using a \`WeakMap\`. Each work cycle
increments a monotonic cycle ID via \`beginRenderCycle()\`. When
\`trackRender(fiber, name)\` is called before a component render, it checks
whether the fiber has exceeded the threshold in the current cycle. If so, it
resets the count and throws.

---

## 2. Effect Cycle Detection

**What it detects:** Effects that fire more than 25 times for a single fiber
within a single commit cycle.

**Threshold:** \`MAX_EFFECTS_PER_CYCLE = 25\`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
\`\`\`
Effect cycle detected in "MyComponent". Effects fired 26 times in a
single commit. This may indicate an effect that triggers a state update
on every run. Ensure effect dependencies are correct and stable.
\`\`\`

### Common Causes

An effect that calls \`setState\`, which triggers a re-render, which triggers
the effect again:

\`\`\`typescript
// BUG: Effect cycle
function Broken() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(value + 1); // Triggers re-render, re-triggers this effect
  }); // No deps = runs every render
  return createElement('span', null, value);
}
\`\`\`

**Fix:** Add a dependency array to control when the effect runs:
\`\`\`typescript
function Fixed() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(1);
  }, []); // Only runs once
  return createElement('span', null, value);
}
\`\`\`

### How It Works

A separate commit-cycle counter tracks effect executions per fiber.
\`beginCommitCycle()\` is called at the start of each commit phase, and
\`trackEffect(fiber, name)\` increments the count for that fiber.

---

## 3. Unstable Dependency Warnings

**What it detects:** An effect whose dependency array changes on every single
render for 5 or more consecutive renders.

**Threshold:** \`UNSTABLE_DEPS_THRESHOLD = 5\`

**Behavior:** Emits a one-time console warning per fiber+hook combination.

**Warning message:**
\`\`\`
Unstable useEffect dependencies in "MyComponent" (hook #2). Dependencies
changed on 5 consecutive renders. This may cause unnecessary effect
re-runs. Wrap objects/arrays in useMemo and functions in useCallback to
stabilize references.
\`\`\`

### Common Causes

Passing inline objects, arrays, or functions as effect dependencies:

\`\`\`typescript
// BUG: Deps change every render because options is a new object
function Search(props) {
  const options = { query: props.query, limit: 10 };
  useEffect(() => {
    performSearch(options);
  }, [options]); // New reference every render
  return createElement('div', null, 'Searching...');
}
\`\`\`

**Fix:**
\`\`\`typescript
function Search(props) {
  const options = useMemo(() => ({ query: props.query, limit: 10 }), [props.query]);
  useEffect(() => {
    performSearch(options);
  }, [options]);
  return createElement('div', null, 'Searching...');
}
\`\`\`

### How It Works

\`trackEffectDeps()\` is called during \`useEffect\` dependency comparison. It
maintains a per-fiber, per-hook-index history of consecutive dep changes.
Once the threshold is reached, a warning fires and is marked as "warned" to
prevent duplicates. If deps stabilize (stop changing), the counter resets
to zero.

---

## 4. setState Flood Detection

**What it detects:** A single fiber calling \`setState\` / \`dispatch\` 100 or
more times within a single browser frame.

**Threshold:** \`100 calls per frame\`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
\`\`\`
Rapid state updates in "MyComponent": setState called 100 times in a
single frame. This may indicate a loop or missing dependency optimization.
\`\`\`

### Common Causes

Processing a large dataset by calling \`setState\` in a loop:

\`\`\`typescript
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
\`\`\`

**Fix:** Batch into a single update:
\`\`\`typescript
function Importer() {
  const [items, setItems] = useState([]);
  const handleImport = (data) => {
    setItems(prev => [...prev, ...data]); // Single setState call
  };
  return createElement('button', { onClick: () => handleImport(bigData) }, 'Import');
}
\`\`\`

### How It Works

\`beginFrame()\` increments a frame counter at the start of each browser frame
or microtask batch. \`trackStateUpdate(fiber, name)\` counts how many times
\`setState\` is called for a given fiber in the current frame. The warning
fires exactly once when the count hits 100.

---

## Configuration

The thresholds are compile-time constants defined in the render guard module:

| Constant | Default | Purpose |
|---|---|---|
| \`MAX_RENDERS_PER_CYCLE\` | 50 | Max renders per component per work cycle before throwing |
| \`MAX_EFFECTS_PER_CYCLE\` | 25 | Max effect executions per fiber per commit before warning |
| \`UNSTABLE_DEPS_THRESHOLD\` | 5 | Consecutive dep-changing renders before warning |
| setState flood threshold | 100 | setState calls per fiber per frame before warning |

These values are not configurable at runtime. They are tuned for development
diagnostics and are fully removed in production builds.

---

## Production Behavior

All render guard code is gated behind \`__DEV__\` checks. In production builds:

- No \`WeakMap\` tracking is created
- No cycle/commit/frame counters are incremented
- No warnings or errors are emitted
- Zero runtime overhead

---

## Testing

The render guard exports a \`resetRenderGuard()\` function for use in test
suites. Call it in \`beforeEach\` or \`afterEach\` to reset all internal
counters:

\`\`\`typescript
import { resetRenderGuard } from '../../src/shared/render-guard';

afterEach(() => {
  resetRenderGuard();
});
\`\`\`

This resets \`currentCycleId\`, \`currentCommitId\`, and \`currentFrameId\` to zero.
\`WeakMap\` entries are not cleared explicitly but will be garbage collected
when fiber references are released.
`},{title:`Routing`,path:`guides/routing`,content:"# Routing\n\nSpecifyJS includes a built-in hash-based router for single-page applications. The router listens to changes in the URL hash (`window.location.hash`) and renders components conditionally based on the current path. No server configuration is required -- the router works on any static file host, including GitHub Pages, S3, and Netlify.\n\n## Why Hash-Based Routing\n\nTraditional path-based routing (e.g., `/users/123`) requires the server to rewrite all requests to `index.html`. Hash-based routing (e.g., `#/users/123`) avoids this entirely because browsers never send the hash fragment to the server. This means:\n\n- **Zero server configuration** -- deploy to any static host and routing works immediately.\n- **No 404 errors** -- refreshing the page always loads `index.html`, then the hash router picks up the path.\n- **Bookmark-friendly** -- users can share and bookmark URLs with hash paths.\n\n## Basic Setup\n\nWrap your application in a `Router` component. This subscribes to `hashchange` events and provides routing context to all descendant components.\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { createRoot } from 'specifyjs/dom';\nimport { Router, Route } from 'specifyjs/router';\n\nfunction App() {\n  return createElement(Router, null,\n    createElement(Route, { path: '/', exact: true, component: HomePage }),\n    createElement(Route, { path: '/about', component: AboutPage }),\n    createElement(Route, { path: '/contact', component: ContactPage }),\n  );\n}\n\ncreateRoot(document.getElementById('root')!).render(createElement(App));\n```\n\nThe `Router` component must be an ancestor of any `Route`, `Link`, or router hook usage. You typically place it at the top of your component tree.\n\n## Defining Routes\n\nThe `Route` component renders its content when the current hash path matches the `path` pattern.\n\n```typescript\n// Render a component\ncreateElement(Route, { path: '/dashboard', component: Dashboard })\n\n// Render children directly\ncreateElement(Route, { path: '/settings' },\n  createElement('h1', null, 'Settings'),\n)\n```\n\n### RouteProps\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `path` | `string` | Path pattern to match (e.g., `'/users/:id'`). |\n| `component` | `FunctionComponent` | Component to render. Receives matched params as props. |\n| `exact` | `boolean` | If `true`, the entire pathname must match. Default: `false`. |\n| `children` | `SpecNode` | Alternative to `component` -- render children when matched. |\n\n### Exact Matching\n\nWithout `exact`, a route with `path=\"/\"` matches every path because `/` is a prefix of all paths. Use `exact` for your root route:\n\n```typescript\ncreateElement(Route, { path: '/', exact: true, component: HomePage })\n```\n\n## Navigation with Link\n\nThe `Link` component renders an anchor tag (`<a>`) that navigates by updating the hash without a full page reload:\n\n```typescript\nimport { Link } from 'specifyjs/router';\n\nfunction NavBar() {\n  return createElement('nav', null,\n    createElement(Link, { to: '/' }, 'Home'),\n    createElement(Link, { to: '/about' }, 'About'),\n    createElement(Link, { to: '/contact' }, 'Contact'),\n  );\n}\n```\n\n### LinkProps\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `to` | `string` | Target path (e.g., `'/about'`). |\n| `className` | `string` | CSS class name for the anchor element. |\n| `activeClassName` | `string` | Additional class applied when the link's path matches the current route. |\n| `exact` | `boolean` | If `true`, `activeClassName` requires an exact path match. Default: `false`. |\n| `children` | `SpecNode` | Link text or content. |\n\nAdditional props are spread onto the underlying `<a>` element.\n\n### Active Link Styling\n\nUse `activeClassName` to highlight the current route in your navigation:\n\n```typescript\ncreateElement(Link, {\n  to: '/dashboard',\n  className: 'nav-link',\n  activeClassName: 'nav-link--active',\n  exact: true,\n}, 'Dashboard')\n```\n\nWhen the user is on `#/dashboard`, the anchor receives both classes: `nav-link nav-link--active`. The `exact` prop controls whether partial path matches also activate the class.\n\n## Route Parameters\n\nDefine dynamic segments in your path pattern with the `:paramName` syntax. Matched values are passed as props to the `component` and are available via `useParams()`:\n\n```typescript\nfunction UserProfile(props: { id: string }) {\n  return createElement('h1', null, `User #${props.id}`);\n}\n\n// In your route definitions:\ncreateElement(Route, { path: '/users/:id', component: UserProfile })\n```\n\nWhen the user navigates to `#/users/42`, the `UserProfile` component receives `{ id: '42' }` as props. Parameter values are automatically URI-decoded.\n\n## Wildcard Routes\n\nA trailing `*` segment matches all remaining path segments. The matched portion is available as `params['*']`:\n\n```typescript\nfunction FileViewer(props: { '*': string }) {\n  return createElement('p', null, `Viewing: ${props['*']}`);\n}\n\ncreateElement(Route, { path: '/files/*', component: FileViewer })\n```\n\nNavigating to `#/files/docs/readme.md` renders `\"Viewing: docs/readme.md\"`. Wildcard routes are useful for catch-all pages and file-browser-style UIs.\n\n## Programmatic Navigation\n\nUse the `useNavigate` hook to navigate from event handlers, effects, or any logic inside a component:\n\n```typescript\nimport { useNavigate } from 'specifyjs/router';\n\nfunction LoginForm() {\n  const navigate = useNavigate();\n\n  const handleSubmit = () => {\n    // ... perform login logic\n    navigate('/dashboard');\n  };\n\n  return createElement('button', { onClick: handleSubmit }, 'Log In');\n}\n```\n\n### Replace vs. Push\n\nBy default, `navigate` pushes a new entry onto the browser history stack. Pass `{ replace: true }` to replace the current entry instead, which prevents the user from navigating back to the current page with the browser's back button:\n\n```typescript\nnavigate('/dashboard', { replace: true });\n```\n\nThis is useful after form submissions, redirects, or login flows where going \"back\" would be confusing.\n\n## Reading Router State\n\nThe `useRouter` hook returns the full routing context:\n\n```typescript\nimport { useRouter } from 'specifyjs/router';\n\nfunction Breadcrumb() {\n  const router = useRouter();\n  return createElement('span', null, `Current path: ${router.pathname}`);\n}\n```\n\n### RouterContextValue\n\n| Property | Type | Description |\n|----------|------|-------------|\n| `pathname` | `string` | Current hash pathname (e.g., `'/users/123'`). |\n| `params` | `Record<string, string>` | Matched route parameters from the nearest `Route`. |\n| `navigate` | `(to: string, options?) => void` | Navigate function. |\n| `basePath` | `string` | Base path for nested routing (the parent route's matched URL). |\n\n## Extracting Parameters\n\nThe `useParams` hook returns the matched route parameters from the nearest `Route` ancestor. It supports a generic type parameter for type safety:\n\n```typescript\nimport { useParams } from 'specifyjs/router';\n\nfunction ProductDetail() {\n  const params = useParams<{ category: string; id: string }>();\n  return createElement('div', null,\n    createElement('p', null, `Category: ${params.category}`),\n    createElement('p', null, `Product ID: ${params.id}`),\n  );\n}\n\n// Route definition:\ncreateElement(Route, { path: '/products/:category/:id', component: ProductDetail })\n```\n\n## Nested Routing\n\nRoutes can be nested to build layouts with sub-sections. When a `Route` matches, it sets a new `basePath` equal to the matched URL, so child routes are relative to the parent:\n\n```typescript\nfunction DashboardLayout() {\n  return createElement('div', { className: 'dashboard' },\n    createElement('nav', null,\n      createElement(Link, { to: '/dashboard/overview' }, 'Overview'),\n      createElement(Link, { to: '/dashboard/settings' }, 'Settings'),\n    ),\n    createElement('main', null,\n      createElement(Route, { path: '/overview', component: Overview }),\n      createElement(Route, { path: '/settings', component: Settings }),\n    ),\n  );\n}\n\n// Top-level route:\ncreateElement(Route, { path: '/dashboard', component: DashboardLayout })\n```\n\nWhen the user navigates to `#/dashboard/settings`, the parent `Route` matches `/dashboard` and sets `basePath` to `/dashboard`. The child `Route` with `path=\"/settings\"` then matches against the full path `/dashboard/settings`.\n\nParameters from parent routes are merged into child routes, so deeply nested components can access parameters defined at any level via `useParams()`.\n\n## Best Practices\n\n1. **Always use `exact` on your root route** -- without it, `path=\"/\"` matches every URL.\n2. **Prefer `Link` over manual hash manipulation** -- `Link` handles click events, sets `href` for accessibility, and integrates with `activeClassName`.\n3. **Use `replace` for redirects** -- after login or form submission, use `navigate(path, { replace: true })` to keep browser history clean.\n4. **Type your params** -- use the generic parameter on `useParams<{ id: string }>()` to catch typos at compile time.\n5. **Keep route definitions co-located** -- define routes near the components they render rather than in a single distant configuration file.\n6. **Use wildcard routes for 404 pages** -- place a `Route` with `path=\"/*\"` last to catch unmatched paths.\n\n## See Also\n\n- [Core Concepts](./core-concepts.md) -- elements, components, and hooks fundamentals\n- [Building SPAs](./building-spas.md) -- full application architecture guide\n- [API Reference: Router](/docs/api/router.md) -- complete API documentation\n"},{title:`SEO — Sitemap, Robots, LLMs, and Noscript Fallback`,path:`guides/seo`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# SEO — Sitemap, Robots, LLMs, and Noscript Fallback

SpecifyJS provides two Vite plugins for build-time SEO:

- **specifyJsSeoPlugin** -- auto-generates \`sitemap.xml\`, \`robots.txt\`, and \`llms.txt\`
- **specifyJsNoscriptPlugin** -- injects a \`<noscript>\` fallback into \`index.html\` for crawlers and accessibility

Both plugins run during the Vite \`closeBundle\` hook (build-time only) and
produce static files in the \`dist/\` output directory.

\`\`\`typescript
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';
\`\`\`

---

## specifyJsSeoPlugin

### Setup

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://example.com',
      title: 'My App',
      description: 'A fast single-page application built with SpecifyJS.',
      routes: ['/', '/#/about', '/#/contact'],
      docsDir: './docs',
      npmPackage: '@my-org/my-app',
      author: 'My Org',
      license: 'MIT',
      repository: 'https://github.com/my-org/my-app',
      robotsRules: ['Disallow: /admin/'],
    }),
  ],
});
\`\`\`

### SeoPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| \`siteUrl\` | \`string\` | Yes | Base URL of the site (e.g. \`https://example.com\`) |
| \`title\` | \`string\` | No | Site title used in \`llms.txt\` |
| \`description\` | \`string\` | No | Site description for \`llms.txt\` (supports \`\\n\` for multi-line) |
| \`routes\` | \`string[]\` | No | Hash-based routes to include in the sitemap. Defaults to \`['/']\` |
| \`docsDir\` | \`string\` | No | Path to a docs directory. Markdown files are auto-discovered and added as \`/#/docs/<path>\` routes |
| \`npmPackage\` | \`string\` | No | npm package name for install instructions in \`llms.txt\` |
| \`author\` | \`string\` | No | Author name for \`llms.txt\` |
| \`license\` | \`string\` | No | License identifier for \`llms.txt\` |
| \`robotsRules\` | \`string[]\` | No | Additional lines appended to \`robots.txt\` (e.g. \`['Disallow: /admin/']\`) |
| \`repository\` | \`string\` | No | Repository URL for \`llms.txt\` |

### Generated Files

#### sitemap.xml

Standard XML sitemap with one \`<url>\` entry per route. Routes from the \`routes\`
array and auto-discovered doc pages from \`docsDir\` are both included. Each
entry gets a \`<lastmod>\` set to the build date.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/about</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/docs/guides/getting-started</loc><lastmod>2026-04-28</lastmod></url>
</urlset>
\`\`\`

#### robots.txt

Allows all crawlers by default and points to the sitemap. Extra rules are
appended after the \`Allow\` directive.

\`\`\`
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
\`\`\`

#### llms.txt

A machine-readable text file describing the project for LLM crawlers. Includes
the title, description, website URL, repository, npm package, documentation
links (grouped by guides and API), install instructions, license, and author.

\`\`\`
# My App

> A fast single-page application built with SpecifyJS.

## Website: https://example.com
## Repository: https://github.com/my-org/my-app
## npm: https://www.npmjs.com/package/@my-org/my-app

## Documentation

- getting-started: https://example.com/#/docs/guides/getting-started

## API Reference

- hooks: https://example.com/#/docs/api/hooks

## Install

\`\`\`
npm install @my-org/my-app
\`\`\`

## License: MIT
## Author: My Org
\`\`\`

### Docs Directory Auto-Discovery

When \`docsDir\` is set, the plugin iteratively walks the directory tree and
collects all \`.md\` files. Each file becomes a sitemap route at
\`/#/docs/<relative-path>\` (without the \`.md\` extension).

For example, given the directory structure:
\`\`\`
docs/
  guides/
    getting-started.md
    routing.md
  api/
    hooks.md
    dom.md
\`\`\`

The plugin generates routes:
- \`/#/docs/guides/getting-started\`
- \`/#/docs/guides/routing\`
- \`/#/docs/api/hooks\`
- \`/#/docs/api/dom\`

In \`llms.txt\`, guides and API docs are listed in separate sections.

---

## specifyJsNoscriptPlugin

### Setup

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsNoscriptPlugin({
      title: 'My App',
      description: 'A fast single-page application.',
      sections: [
        {
          id: 'home',
          title: 'Home',
          html: '<h1>Welcome</h1><p>This is the home page.</p>',
        },
        {
          id: 'docs',
          title: 'Documentation',
          html: '<h2>Getting Started</h2><p>Install with npm...</p>',
        },
      ],
      copyright: '(c) 2026 My Org. All rights reserved.',
    }),
  ],
});
\`\`\`

### NoscriptPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| \`title\` | \`string\` | No | Page title shown at the top |
| \`description\` | \`string\` | No | Subtitle shown below the title |
| \`sections\` | \`NoscriptSection[]\` | Yes | Content sections to render |
| \`copyright\` | \`string\` | No | Copyright notice at the bottom |
| \`classPrefix\` | \`string\` | No | CSS class prefix (default: \`'ns'\`) |
| \`maxContentSize\` | \`number\` | No | Maximum noscript content size in bytes before a warning (default: 512KB) |

### NoscriptSection

\`\`\`typescript
interface NoscriptSection {
  id: string;      // Anchor ID (href="#id")
  title: string;   // Navigation bar display title
  html: string;    // Static HTML content
}
\`\`\`

### What It Generates

The plugin injects a \`<noscript>\` block before \`</body>\` in \`dist/index.html\`
containing:

1. **Scoped CSS** -- a complete stylesheet for readable, responsive layout
2. **JS-disabled notice** -- a yellow banner explaining that the page works
   best with JavaScript
3. **Navigation bar** -- sticky nav with anchor links to each section
4. **Section content** -- each section as semantic HTML with headings,
   paragraphs, lists, and a "Back to top" link
5. **Copyright footer** -- if configured

### Interactive Element Stripping

The plugin automatically strips elements that do not work without JavaScript:

| Element | Treatment |
|---|---|
| \`<button>\` | Removed, inner text preserved |
| \`<input>\` | Removed entirely |
| \`<select>\` / \`<option>\` | Removed entirely |
| \`<textarea>\` | Removed entirely |
| \`<form>\` | Wrapper removed, content preserved |
| \`<script>\` | Removed entirely |
| \`onclick\`, \`onchange\`, etc. | Inline event handlers removed |
| \`style="...javascript:..."\` | Style attributes with JS expressions removed |

The \`stripInteractiveElements()\` function is exported for use outside the
plugin:

\`\`\`typescript
import { stripInteractiveElements } from '@asymmetric-effort/specifyjs/build';

const clean = stripInteractiveElements('<button onclick="alert()">Click</button>');
// 'Click'
\`\`\`

### Content Size Warning

If the generated noscript HTML exceeds \`maxContentSize\` (default 512KB),
a console warning is emitted during build. This prevents accidentally
bloating \`index.html\` with large noscript content.

### Removing Noscript After Hydration

The \`<noscript>\` block is inert when JavaScript is enabled -- browsers do not
render \`<noscript>\` content when JS is active. No cleanup is needed after
hydration.

If you want to remove the \`<noscript>\` element from the DOM for cleanliness
after your app mounts:

\`\`\`typescript
import { createElement, useEffect } from '@asymmetric-effort/specifyjs';

function App() {
  useEffect(() => {
    const noscript = document.querySelector('noscript');
    if (noscript) {
      noscript.remove();
    }
  }, []);

  return createElement('div', null, 'App loaded');
}
\`\`\`

---

## Using Both Plugins Together

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://myapp.com',
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      routes: ['/', '/#/about'],
      docsDir: './docs',
      npmPackage: '@my-org/myapp',
      license: 'MIT',
    }),
    specifyJsNoscriptPlugin({
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      sections: [
        { id: 'home', title: 'Home', html: '<h1>Welcome to MyApp</h1>' },
        { id: 'about', title: 'About', html: '<p>About this application.</p>' },
      ],
      copyright: '(c) 2026 My Org',
    }),
  ],
});
\`\`\`

Both plugins run independently during \`closeBundle\`. The SEO plugin generates
\`sitemap.xml\`, \`robots.txt\`, and \`llms.txt\`. The noscript plugin modifies
\`index.html\` to add the fallback block. Order does not matter.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| \`docsDir\` does not exist | Skipped silently; no doc routes added |
| \`dist/index.html\` not found (noscript) | Warning logged; noscript injection skipped |
| No sections provided (noscript) | Warning logged; no noscript block injected |
| Noscript content exceeds \`maxContentSize\` | Warning logged; content still injected |
| \`routes\` not provided (SEO) | Defaults to \`['/']\` |
`},{title:`State Management`,path:`guides/state-management`,content:`# State Management

SpecifyJS provides a layered approach to state management. Simple components use \`useState\`, components with complex transitions use \`useReducer\`, and cross-component state is shared through the Context API. For integration with external stores, \`useSyncExternalStore\` provides tear-free reads with automatic re-rendering.

## Local State with useState

The \`useState\` hook is the foundation of state management. It returns a tuple of the current value and a setter function:

\`\`\`typescript
import { createElement, useState } from 'specifyjs';

function Counter() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('p', null, \`Count: \${count}\`),
    createElement('button', {
      onClick: () => setCount(count + 1),
    }, 'Increment'),
  );
}
\`\`\`

### Functional Updates

When the next state depends on the previous state, pass a function to the setter. This avoids stale closures when multiple updates are batched:

\`\`\`typescript
// Correct -- always reads the latest value
setCount(prev => prev + 1);

// Risky -- may use a stale closure value
setCount(count + 1);
\`\`\`

### Lazy Initialization

If computing the initial state is expensive, pass a function to \`useState\`. It runs only on the first render:

\`\`\`typescript
const [data, setData] = useState(() => parseExpensiveData(rawInput));
\`\`\`

## Complex State with useReducer

When state transitions follow predictable rules or involve multiple related values, \`useReducer\` provides a clearer structure than multiple \`useState\` calls:

\`\`\`typescript
import { createElement, useReducer } from 'specifyjs';

interface FormState {
  name: string;
  email: string;
  submitting: boolean;
  error: string | null;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; message: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SUBMIT':
      return { ...state, submitting: true, error: null };
    case 'SUCCESS':
      return { ...state, submitting: false };
    case 'ERROR':
      return { ...state, submitting: false, error: action.message };
  }
}

function ContactForm() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '',
    email: '',
    submitting: false,
    error: null,
  });

  return createElement('form', null,
    createElement('input', {
      value: state.name,
      onChange: (e: Event) =>
        dispatch({ type: 'SET_FIELD', field: 'name', value: (e.target as HTMLInputElement).value }),
    }),
    createElement('button', {
      onClick: () => dispatch({ type: 'SUBMIT' }),
      disabled: state.submitting,
    }, 'Submit'),
    state.error ? createElement('p', { className: 'error' }, state.error) : null,
  );
}
\`\`\`

### Lazy Initialization with useReducer

The optional third argument to \`useReducer\` is an initializer function. It receives the second argument and returns the initial state:

\`\`\`typescript
const [state, dispatch] = useReducer(reducer, rawConfig, (config) => ({
  ...parseConfig(config),
  loaded: true,
}));
\`\`\`

## Sharing State with Context

The Context API passes data through the component tree without manually threading props through every level. It consists of three parts: \`createContext\`, the \`Provider\`, and \`useContext\`.

### Creating a Context

\`\`\`typescript
import { createContext } from 'specifyjs';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});
\`\`\`

The argument to \`createContext\` is the default value used when no \`Provider\` is found above the consuming component.

### Providing Context

Wrap a subtree with the \`Provider\` to supply a value:

\`\`\`typescript
import { createElement, useState, useCallback } from 'specifyjs';

function ThemeProvider(props: { children?: unknown }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback((() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }) as (...args: unknown[]) => unknown, []);

  const value = { theme, toggleTheme: toggleTheme as () => void };

  return createElement(ThemeContext.Provider, { value }, props.children);
}
\`\`\`

### Consuming Context

Use the \`useContext\` hook to read the nearest ancestor \`Provider\` value:

\`\`\`typescript
import { useContext } from 'specifyjs';

function ThemedButton(props: { label: string }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return createElement('button', {
    className: \`btn--\${theme}\`,
    onClick: toggleTheme,
  }, props.label);
}
\`\`\`

When the \`Provider\` value changes, all components that call \`useContext\` for that context re-render automatically.

## When to Use Each Approach

| Approach | Best For |
|----------|----------|
| \`useState\` | Simple, independent values (toggles, counters, form fields). |
| \`useReducer\` | Complex state with multiple sub-values or strict transition rules. |
| Context | Cross-cutting concerns (theme, locale, auth) shared by many components. |
| \`useSyncExternalStore\` | Integration with external stores, real-time data, or shared mutable state. |

**Rule of thumb**: start with \`useState\`. Move to \`useReducer\` when you find yourself coordinating multiple \`useState\` calls in the same component. Lift to Context when sibling or distant components need the same data.

## Patterns for Large Applications

### Context + useReducer

Combine Context and \`useReducer\` to create a lightweight application-level store without any external libraries:

\`\`\`typescript
import { createContext, createElement, useReducer, useContext } from 'specifyjs';

interface AppState {
  user: { name: string } | null;
  notifications: string[];
}

type AppAction =
  | { type: 'LOGIN'; name: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_NOTIFICATION'; message: string };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: { name: action.name } };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.message] };
  }
}

const AppStateContext = createContext<AppState>({ user: null, notifications: [] });
const AppDispatchContext = createContext<(action: AppAction) => void>(() => {});

function AppProvider(props: { children?: unknown }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    notifications: [],
  });

  return createElement(AppStateContext.Provider, { value: state },
    createElement(AppDispatchContext.Provider, { value: dispatch },
      props.children,
    ),
  );
}

// Consumers only re-render when they read the part of context that changed
function useAppState(): AppState {
  return useContext(AppStateContext);
}

function useAppDispatch(): (action: AppAction) => void {
  return useContext(AppDispatchContext);
}
\`\`\`

Splitting state and dispatch into separate contexts is important: components that only dispatch actions (e.g., a logout button) will not re-render when state changes.

## Performance Considerations

### Avoiding Unnecessary Re-renders

1. **Memoize callbacks** with \`useCallback\` so child components receiving them as props do not re-render when the parent re-renders:

    \`\`\`typescript
    const handleClick = useCallback((() => {
      setOpen(prev => !prev);
    }) as (...args: unknown[]) => unknown, []);
    \`\`\`

2. **Memoize computed values** with \`useMemo\` to skip expensive recalculations:

    \`\`\`typescript
    const sortedItems = useMemo(() =>
      items.slice().sort((a, b) => a.name.localeCompare(b.name)),
      [items],
    );
    \`\`\`

3. **Split contexts** to prevent unrelated updates from triggering re-renders across the tree (as shown in the Context + useReducer pattern above).

4. **Use \`memo\`** to skip re-rendering a component when its props have not changed:

    \`\`\`typescript
    import { memo, createElement } from 'specifyjs';

    const ExpensiveList = memo(function ExpensiveList(props: { items: string[] }) {
      return createElement('ul', null,
        ...props.items.map(item => createElement('li', { key: item }, item)),
      );
    });
    \`\`\`

## External Store Integration

The \`useSyncExternalStore\` hook connects SpecifyJS components to any external data source that follows the subscribe/getSnapshot pattern. This is the recommended approach for integrating with third-party state libraries, browser APIs, or shared mutable state:

\`\`\`typescript
import { useSyncExternalStore } from 'specifyjs';

// A simple external store
let externalCount = 0;
const listeners = new Set<() => void>();

const counterStore = {
  increment() {
    externalCount++;
    listeners.forEach(fn => fn());
  },
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot() {
    return externalCount;
  },
};

function ExternalCounter() {
  const count = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
  );

  return createElement('div', null,
    createElement('p', null, \`External count: \${count}\`),
    createElement('button', {
      onClick: () => counterStore.increment(),
    }, 'Increment'),
  );
}
\`\`\`

The hook guarantees that the component always sees a consistent snapshot, even during concurrent rendering. When the store notifies subscribers, SpecifyJS compares the new snapshot with \`Object.is\` and only re-renders if the value has changed.

## Custom Hooks for Encapsulating State Logic

Extract reusable state patterns into custom hooks. A custom hook is any function whose name starts with \`use\` and calls other hooks:

\`\`\`typescript
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);

  const toggle = useCallback((() => {
    setValue(prev => !prev);
  }) as (...args: unknown[]) => unknown, []);

  return [value, toggle as () => void];
}

function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) as T : defaultValue;
  });

  const setAndPersist = useCallback(((next: T) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }) as (...args: unknown[]) => unknown, [key]);

  return [value, setAndPersist as (v: T) => void];
}
\`\`\`

Usage:

\`\`\`typescript
function SettingsPanel() {
  const [darkMode, toggleDarkMode] = useToggle(false);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return createElement('div', null,
    createElement('button', { onClick: toggleDarkMode },
      darkMode ? 'Light Mode' : 'Dark Mode',
    ),
    createElement('input', {
      type: 'range',
      min: '12',
      max: '24',
      value: String(fontSize),
      onChange: (e: Event) =>
        setFontSize(Number((e.target as HTMLInputElement).value)),
    }),
  );
}
\`\`\`

## Anti-Patterns to Avoid

1. **Storing derived data in state.** If a value can be computed from existing state or props, compute it inline or with \`useMemo\` rather than duplicating it in a separate \`useState\`:

    \`\`\`typescript
    // Bad -- duplicated state that can get out of sync
    const [items, setItems] = useState<string[]>([]);
    const [count, setCount] = useState(0); // always items.length

    // Good -- derive it
    const count = items.length;
    \`\`\`

2. **Putting everything in Context.** Context is not a global store. Every value change re-renders all consumers. Use Context for low-frequency data (theme, locale, auth) and local state for high-frequency data (form input, animations).

3. **Mutating state directly.** Always create new objects or arrays when updating state. Mutations bypass change detection and cause stale renders:

    \`\`\`typescript
    // Bad -- mutates the existing array
    items.push(newItem);
    setItems(items);

    // Good -- creates a new array
    setItems([...items, newItem]);
    \`\`\`

4. **Missing dependency arrays.** Omitting the dependency array on \`useEffect\`, \`useMemo\`, or \`useCallback\` causes the hook to run on every render, defeating memoization.

5. **Oversized reducers.** Keep reducers focused on a single domain. If your reducer handles dozens of unrelated action types, split it into separate reducers with separate contexts.

## See Also

- [Core Concepts](./core-concepts.md) -- elements, components, props, and hooks overview
- [Routing](./routing.md) -- hash-based navigation and route parameters
- [Testing](./testing.md) -- testing components with state and effects
`},{title:`Styling`,path:`guides/styling`,content:`# Styling

SpecifyJS supports multiple approaches to styling components, from inline styles to CSS classes, CSS modules, and dynamic theming via the Context API.

## Inline Styles with createElement

Pass a \`style\` prop as a JavaScript object. Property names use camelCase, and numeric values default to pixels:

\`\`\`typescript
import { createElement } from 'specifyjs';

function Banner() {
  return createElement('div', {
    style: {
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      padding: 24,
      borderRadius: 8,
      fontSize: 18,
      fontWeight: 600,
    },
  }, 'Welcome to SpecifyJS');
}
\`\`\`

Unitless CSS properties (such as \`opacity\`, \`zIndex\`, \`fontWeight\`, \`lineHeight\`, and \`flex\`) are not appended with \`px\`.

## CSS Classes via className

Use the \`className\` prop to apply CSS classes defined in external stylesheets:

\`\`\`typescript
function Card(props: { title: string; body: string }) {
  return createElement('div', { className: 'card' },
    createElement('h2', { className: 'card-title' }, props.title),
    createElement('p', { className: 'card-body' }, props.body),
  );
}
\`\`\`

For conditional classes, build the string manually:

\`\`\`typescript
function Button(props: { primary?: boolean; disabled?: boolean; label: string }) {
  const classes = [
    'btn',
    props.primary ? 'btn-primary' : 'btn-default',
    props.disabled ? 'btn-disabled' : '',
  ].filter(Boolean).join(' ');

  return createElement('button', {
    className: classes,
    disabled: props.disabled,
  }, props.label);
}
\`\`\`

## CSS Modules Approach

CSS Modules scope class names to the component, preventing style collisions. With Vite, any \`.module.css\` file is automatically treated as a CSS Module:

\`\`\`css
/* Button.module.css */
.button { padding: 8px 16px; border: none; cursor: pointer; }
.primary { background: #0066cc; color: white; }
.secondary { background: #e0e0e0; color: #333; }
\`\`\`

\`\`\`typescript
import styles from './Button.module.css';

function Button(props: { variant: 'primary' | 'secondary'; label: string }) {
  return createElement('button', {
    className: \`\${styles.button} \${styles[props.variant]}\`,
  }, props.label);
}
\`\`\`

The imported \`styles\` object maps original class names to unique, scoped identifiers (e.g., \`Button_button_x7f3a\`).

## Dynamic Styling Patterns

Compute styles based on props or state:

\`\`\`typescript
function ProgressBar(props: { percent: number }) {
  return createElement('div', {
    style: { background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  },
    createElement('div', {
      style: {
        width: \`\${Math.min(100, Math.max(0, props.percent))}%\`,
        height: 8,
        background: props.percent >= 100 ? '#22c55e' : '#3b82f6',
        transition: 'width 0.3s ease',
      },
    }),
  );
}
\`\`\`

## Theming with Context API

Use the Context API to provide theme values throughout your component tree:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { createContext, useContext } from 'specifyjs/context';

const ThemeContext = createContext({
  primary: '#0066cc',
  background: '#ffffff',
  text: '#1a1a1a',
  surface: '#f5f5f5',
});

function useTheme() {
  return useContext(ThemeContext);
}

function ThemedButton(props: { label: string; onClick: () => void }) {
  const theme = useTheme();
  return createElement('button', {
    style: {
      backgroundColor: theme.primary,
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: 4,
      cursor: 'pointer',
    },
    onClick: props.onClick,
  }, props.label);
}
\`\`\`

Wrap the application in a \`ThemeContext.Provider\` to supply the theme:

\`\`\`typescript
const darkTheme = {
  primary: '#6366f1',
  background: '#0f0f23',
  text: '#e0e0e0',
  surface: '#1a1a2e',
};

function App() {
  return createElement(ThemeContext.Provider, { value: darkTheme },
    createElement(ThemedButton, { label: 'Click me', onClick: () => {} }),
  );
}
\`\`\`

## Dark Mode Implementation

Combine theme context with state to toggle between light and dark modes:

\`\`\`typescript
import { useState } from 'specifyjs/hooks';

const lightTheme = { primary: '#0066cc', background: '#ffffff', text: '#1a1a1a' };
const darkTheme = { primary: '#6366f1', background: '#0f0f23', text: '#e0e0e0' };

function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return createElement(ThemeContext.Provider, { value: theme },
    createElement('div', {
      style: { backgroundColor: theme.background, color: theme.text, minHeight: '100vh' },
    },
      createElement('button', {
        onClick: () => setIsDark((prev) => !prev),
      }, isDark ? 'Switch to Light' : 'Switch to Dark'),
      createElement(MainContent, null),
    ),
  );
}
\`\`\`

To respect the user's system preference on initial load:

\`\`\`typescript
const [isDark, setIsDark] = useState(() =>
  window.matchMedia('(prefers-color-scheme: dark)').matches,
);
\`\`\`
`},{title:`Testing`,path:`guides/testing`,content:`# Testing

SpecifyJS applications use three levels of testing.

## Unit Tests (Vitest + jsdom)

Test individual components and hooks in isolation:

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { createRoot } from 'specifyjs/dom';

describe('Counter', () => {
  it('renders initial count', () => {
    const container = document.createElement('div');
    function Counter() {
      const [count] = useState(0);
      return createElement('span', null, String(count));
    }
    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');
  });
});
\`\`\`

## Integration Tests (Vitest + jsdom)

Test component trees and interactions:

\`\`\`typescript
it('adds a todo', () => {
  root.render(createElement(TodoApp, null));
  // Simulate interaction, verify DOM changes
});
\`\`\`

## E2E Tests (Playwright)

Test full user flows in a real browser:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('adds a todo', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('todo-input').fill('Buy milk');
  await page.getByTestId('add-btn').click();
  await expect(page.locator('.todo-item')).toHaveCount(1);
});
\`\`\`

## Running Tests

\`\`\`bash
npm test                    # Unit + integration
npm run test:coverage       # With coverage thresholds
npm run test:e2e            # Playwright browser tests
\`\`\`

## Coverage Requirements

- Statements: 95%+
- Branches: 94%+
- Functions: 97%+
- Lines: 95%+

## Next Steps

- [CI/CD](../contributing/ci-cd.md) — Automated testing in CI
- [Production Builds](production-builds.md) — Build optimization
`},{title:`Troubleshooting`,path:`guides/troubleshooting`,content:`# Troubleshooting

Common questions and solutions when working with SpecifyJS.

---

## Why isn't my component re-rendering?

Components only re-render when their state changes via \`useState\` or \`useReducer\`, or when their parent re-renders with new props. Common causes:

- **Mutating state directly.** Never modify state objects in place. Always create a new reference:

\`\`\`typescript
// Wrong: mutating the existing array
items.push(newItem);
setItems(items);

// Correct: creating a new array
setItems([...items, newItem]);
\`\`\`

- **Same reference.** If you pass the same object reference, SpecifyJS skips the re-render. Spread objects and arrays to create new references.

- **State not lifting high enough.** If a sibling component needs to react to a change, lift the state to the nearest common ancestor.

---

## How do I prevent unnecessary re-renders?

Use \`memo\` to skip re-renders when props have not changed:

\`\`\`typescript
import { memo, createElement } from 'specifyjs';

const ExpensiveList = memo(function ExpensiveList(props: { items: string[] }) {
  return createElement('ul', null,
    props.items.map((item) => createElement('li', { key: item }, item)),
  );
});
\`\`\`

Use \`useMemo\` for expensive computations and \`useCallback\` for stable function references passed as props:

\`\`\`typescript
const sorted = useMemo(() => items.sort(compareFn), [items]);
const handleClick = useCallback(() => { doSomething(); }, []);
\`\`\`

---

## Why do I get "hooks called in wrong order"?

Hooks must be called in the same order on every render. This error occurs when hooks are placed inside conditions, loops, or early returns:

\`\`\`typescript
// Wrong
function MyComponent(props: { show: boolean }) {
  if (props.show) {
    const [value, setValue] = useState('');  // Conditional hook call
  }
  // ...
}

// Correct
function MyComponent(props: { show: boolean }) {
  const [value, setValue] = useState('');    // Always called
  if (!props.show) return null;
  // Use value here
}
\`\`\`

Always place all hook calls at the top level of the component function body.

---

## How do I handle async data fetching?

Use \`useEffect\` with a cleanup flag to prevent updates after unmount:

\`\`\`typescript
function UserProfile(props: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(\`/api/users/\${props.userId}\`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [props.userId]);

  if (loading) return createElement('p', null, 'Loading...');
  return createElement('h1', null, user.name);
}
\`\`\`

The \`cancelled\` flag prevents state updates on an unmounted component. See the [Custom Hooks](./custom-hooks.md) guide for a reusable \`useFetch\` pattern.

---

## Why does my effect run twice in StrictMode?

\`StrictMode\` intentionally double-invokes effects during development to help detect side effects that do not clean up properly. If your effect runs twice, verify that:

1. Your cleanup function properly reverses the setup (remove listeners, cancel timers, abort fetches).
2. Your effect is idempotent -- running it twice produces the same result as running it once.

This double invocation only happens in development. Production builds run effects once.

---

## How do I debug state changes?

Use \`useEffect\` to log state values whenever they change:

\`\`\`typescript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('count changed:', count);
}, [count]);
\`\`\`

For complex state managed by \`useReducer\`, log inside the reducer function:

\`\`\`typescript
function reducer(state: State, action: Action): State {
  console.log('action:', action.type, 'prev state:', state);
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}
\`\`\`

---

## What's the difference between useEffect and useLayoutEffect?

Both run after rendering, but at different times:

- **\`useEffect\`** runs asynchronously after the browser has painted. Use it for data fetching, subscriptions, logging, and most side effects.
- **\`useLayoutEffect\`** runs synchronously after DOM mutations but before the browser paints. Use it for measuring DOM elements, adjusting scroll position, or preventing visual flicker.

\`\`\`typescript
// Measure an element's dimensions before the user sees it
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setHeight(rect.height);
}, []);
\`\`\`

Prefer \`useEffect\` unless you specifically need to read or modify the DOM before the browser paints.

---

## How do I share state between components?

Three approaches, depending on scope:

1. **Lift state up.** Move state to the nearest common ancestor and pass it down via props.

2. **Context API.** For widely shared state (theme, user session, feature flags), use \`createContext\` and a Provider:

\`\`\`typescript
const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  return createElement(UserContext.Provider, { value: { user, setUser } },
    createElement(Dashboard, null),
  );
}

function Dashboard() {
  const { user } = useContext(UserContext);
  return createElement('p', null, \`Hello, \${user?.name}\`);
}
\`\`\`

3. **External store with \`useSyncExternalStore\`.** For complex global state, create a store and subscribe components to it.

---

## Why is my list rendering slowly?

Large lists cause performance problems because every item creates DOM nodes. Solutions:

- **Add \`key\` props.** Always provide stable, unique keys so the reconciler can reuse existing DOM nodes instead of recreating them:

\`\`\`typescript
items.map((item) => createElement('li', { key: item.id }, item.name));
\`\`\`

- **Avoid index keys for dynamic lists.** Using array indices as keys causes incorrect reuse when items are inserted, removed, or reordered.

- **Memoize list items.** Wrap individual item components in \`memo\` to skip re-rendering unchanged items.

- **Virtualize.** For lists with hundreds or thousands of items, render only the visible portion using a windowing technique. Only create DOM nodes for items currently in the viewport.

- **Use transitions.** Wrap expensive list updates in \`startTransition\` so they do not block user input (see [Concurrent Rendering](./concurrent-rendering.md)).

---

## How do I handle form validation?

Validate on change or on submit using state:

\`\`\`typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // Submit the form
  }

  return createElement('form', { onSubmit: handleSubmit },
    createElement('input', {
      type: 'email',
      value: email,
      onInput: (e) => {
        setEmail((e.target as HTMLInputElement).value);
        setError('');
      },
    }),
    error ? createElement('p', { style: { color: 'red' } }, error) : null,
    createElement('button', { type: 'submit' }, 'Log In'),
  );
}
\`\`\`

For complex forms with multiple fields, use \`useReducer\` to manage form state and validation errors together. See the [Forms and Validation](./forms-and-validation.md) guide for more patterns.
`},{title:`TypeScript Patterns`,path:`guides/typescript`,content:`# TypeScript Patterns

SpecifyJS is a **TypeScript-first** framework. The entire codebase is written in strict mode (\`"strict": true\`), and all public APIs ship with full type definitions. This guide covers common typing patterns you will encounter when building SpecifyJS applications.

## Typing Functional Components

Use the \`FunctionComponent\` type or define an explicit props interface with a return type of \`SpecNode\`:

\`\`\`typescript
import { createElement } from 'specifyjs';
import type { FunctionComponent, SpecNode, Props } from 'specifyjs';

// Option 1: Inline props type
function Greeting(props: { name: string }): SpecNode {
  return createElement('h1', null, \`Hello, \${props.name}!\`);
}

// Option 2: Using FunctionComponent
interface CardProps extends Props {
  title: string;
  subtitle?: string;
}

const Card: FunctionComponent<CardProps> = (props) => {
  return createElement('div', { className: 'card' },
    createElement('h2', null, props.title),
    props.subtitle
      ? createElement('p', null, props.subtitle)
      : null,
  );
};
\`\`\`

## Typing Props Interfaces

Props interfaces should extend \`Props\` when you need access to \`children\`, \`key\`, or \`ref\`:

\`\`\`typescript
import type { Props, SpecNode, Ref } from 'specifyjs';

interface ButtonProps extends Props {
  label: string;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
  children?: SpecNode;
}
\`\`\`

The base \`Props\` type is \`Record<string, unknown> & { children?: SpecNode; key?: Key; ref?: Ref }\`, so extending it lets TypeScript enforce your custom fields while preserving built-in prop support.

## Typing Hooks

### useState with Generics

Provide a type parameter when the initial value does not fully express the type:

\`\`\`typescript
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// TypeScript infers \`number\` from the initial value here:
const [count, setCount] = useState(0);
\`\`\`

### useRef\\<T\\>

Type the ref to match the DOM element or value it will hold:

\`\`\`typescript
import { useRef, useEffect, createElement } from 'specifyjs';
import type { RefObject } from 'specifyjs';

function TextInput() {
  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return createElement('input', { ref: inputRef, type: 'text' });
}
\`\`\`

### useReducer with Typed Actions

Define a discriminated union for actions:

\`\`\`typescript
interface State {
  count: number;
  error: string | null;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'error'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'decrement': return { ...state, count: state.count - 1 };
    case 'reset':     return { ...state, count: action.payload, error: null };
    case 'error':     return { ...state, error: action.payload };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
  return createElement('button', {
    onClick: () => dispatch({ type: 'increment' }),
  }, \`Count: \${state.count}\`);
}
\`\`\`

## Typing Event Handlers

Event handler props accept standard DOM event types. Type them explicitly for safety:

\`\`\`typescript
interface FormProps extends Props {
  onSubmit: (value: string) => void;
}

function SearchForm(props: FormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: Event): void => {
    e.preventDefault();
    props.onSubmit(query);
  };

  const handleInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement('input', { type: 'text', onInput: handleInput, value: query }),
    createElement('button', { type: 'submit' }, 'Search'),
  );
}
\`\`\`

## Typing Context Values

Provide a concrete type parameter to \`createContext\`:

\`\`\`typescript
import { createContext, useContext } from 'specifyjs';
import type { SpecContext } from 'specifyjs';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
}

const ThemeContext: SpecContext<Theme> = createContext<Theme>({
  primary: '#0066cc',
  secondary: '#444',
  background: '#fff',
});

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return createElement('button', {
    style: \`background: \${theme.primary}; color: \${theme.background}\`,
  }, 'Click me');
}
\`\`\`

## Typing Custom Hooks

Custom hooks are plain functions. Type the return value explicitly to avoid leaking implementation details:

\`\`\`typescript
interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

function useToggle(initial: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initial);
  return {
    value,
    toggle: useCallback(() => setValue(v => !v), []),
    setTrue: useCallback(() => setValue(true), []),
    setFalse: useCallback(() => setValue(false), []),
  };
}
\`\`\`

## Using SpecElement, SpecNode, and SpecChild

These types describe the tree structure:

| Type          | Definition                                                   | Use case                            |
|---------------|--------------------------------------------------------------|-------------------------------------|
| \`SpecElement\` | \`{ $$typeof, type, props, key, ref }\`                       | A single element descriptor         |
| \`SpecChild\`   | \`SpecElement \\| string \\| number \\| boolean \\| null \\| undefined\` | One renderable value           |
| \`SpecNode\`    | \`SpecChild \\| SpecNode[]\`                                    | Any renderable value, including arrays |

Use \`SpecNode\` as the return type for render functions and \`children\` props. Use \`SpecElement\` when you need to inspect or validate a specific element (for example with \`isValidElement\`):

\`\`\`typescript
import { isValidElement } from 'specifyjs';
import type { SpecElement, SpecNode } from 'specifyjs';

function renderWithWrapper(node: SpecNode): SpecNode {
  if (isValidElement(node)) {
    const element = node as SpecElement;
    return createElement('div', { className: 'wrapper', key: element.key }, element);
  }
  return node;
}
\`\`\`

## See Also

- [API Reference: Types](../api/types.md)
- [Core Concepts](./core-concepts.md)
- [Getting Started](./getting-started.md)
`},{title:`Wumpus World Demo`,path:`guides/wumpus-world`,content:`# Wumpus World Demo

A 2D demonstration of the classic AI problem from Russell and Norvig's "Artificial Intelligence: A Modern Approach," implemented as a SpecifyJS showcase application. The demo is available at \`/#/wumpus\` on the showcase site.

## Overview

The agent explores a 10x10 cave to find gold while avoiding deadly hazards:

- **The Wumpus** -- a monster that kills the agent on contact.
- **Bottomless pits** -- falling in is fatal.

The agent must navigate using only local percepts, grab the gold, and return to the entrance to win.

## Game Mechanics

### Board Generation

- **Grid**: 10x10 cells.
- **Agent start**: Bottom-left corner (row 9, col 0).
- **Wumpus**: Exactly one, placed randomly (never at start).
- **Gold**: Exactly one, placed randomly (never at start).
- **Pits**: Each remaining cell has a 20% chance of containing a pit (not at start, not on wumpus/gold).

### Percepts

The agent receives percepts only for its current cell:

| Percept | Meaning |
|---------|---------|
| **Stench** | Adjacent (4-directional) to the Wumpus |
| **Breeze** | Adjacent to a pit |
| **Glitter** | In the same room as the gold |
| **Bump** | Walked into a wall |
| **Scream** | The Wumpus was killed by an arrow |

### Actions

| Action | Effect |
|--------|--------|
| **Move Forward** | Move one cell in the agent's facing direction |
| **Turn Left** | Rotate 90 degrees counter-clockwise |
| **Turn Right** | Rotate 90 degrees clockwise |
| **Shoot** | Fire an arrow in the facing direction (one arrow only) |
| **Grab** | Pick up the gold (must be in the same cell) |
| **Climb** | Exit the cave (must be at the entrance) |

### Scoring

| Event | Points |
|-------|--------|
| Each action taken | -1 |
| Shooting the arrow | -10 |
| Death (Wumpus or pit) | -1001 (including the move) |
| Exiting with gold | +1000 |
| Exiting without gold | 0 bonus |

The goal is to maximize the total score. A perfect game involves finding and grabbing the gold with minimal moves and returning to the entrance.

## Human Mode

In human mode, the player controls the agent manually using on-screen buttons:

- **Move/Turn buttons** -- Move Forward, Turn Left, Turn Right.
- **Action buttons** -- Shoot, Grab, Climb.
- The grid displays only cells the agent has visited (fog of war).
- Percepts are shown after each move.
- A log panel records all actions and events.

## AI Mode

In AI mode, a knowledge-based agent plays automatically at one action per second. The AI uses logical inference to deduce safe cells and locate hazards.

### AI Decision Priority

The agent follows this priority order each turn:

1. **Glitter detected** -- grab the gold immediately.
2. **Have gold** -- pathfind back to the entrance and climb out.
3. **Wumpus located + have arrow** -- if aligned for a shot, shoot the Wumpus.
4. **Safe unvisited cell adjacent** -- move to explore it.
5. **Safe unvisited cell reachable** -- pathfind to the nearest safe unvisited cell.
6. **Risky exploration** -- if no safe option exists, move to a "maybe" cell (calculated risk).
7. **Retreat** -- return to the entrance and climb out if no progress is possible.

### AI Inference Rules

The knowledge base tracks per-cell status: visited, safe, noPit, noWumpus, maybePit, maybeWumpus, definitelyPit, and wumpusLocation.

**Rule 1: No breeze at current cell** -- all adjacent cells are proven free of pits.

**Rule 2: No stench at current cell** -- all adjacent cells are proven free of the Wumpus.

**Rule 3: Wumpus killed** -- all cells are marked wumpus-safe.

**Rule 4: Constraint propagation (pits)** -- if a breezy cell has only one unproven adjacent cell, that cell must contain a pit. Conversely, if a known pit explains the breeze, remaining neighbors are safe.

**Rule 5: Constraint propagation (Wumpus)** -- if a stenchy cell has only one unproven adjacent cell, the Wumpus must be there. Once located, all other cells are marked safe from Wumpus.

**Rule 6: Global uniqueness** -- if only one cell in the entire grid remains a Wumpus candidate, it is identified as the Wumpus location.

**Rule 7: Combined safety** -- a cell is "safe" if it is proven to have no pit AND no Wumpus.

### AI Reasoning Display

The AI displays its current reasoning string explaining why it chose its action (e.g., "No breeze at (2,3) -> (2,4) has no pit" or "Have gold -> returning to entrance via (8,0) -> (9,0)").

### Auto-restart

In AI mode, when a game ends (win or loss), a new game automatically starts after recording the result. A running win/loss tally with win percentage is displayed.

## Technical Implementation

- **Pure logic module** (\`wumpus-logic.ts\`) -- zero framework dependencies, containing all game state, board generation, percept computation, action execution, knowledge base updates, and AI decision logic.
- **UI component** (\`wumpus-world.ts\`) -- SpecifyJS functional component using \`useState\`, \`useEffect\`, \`useCallback\`, \`useMemo\`, and \`useRef\`.
- **Visualization** -- uses the \`DiscreteCartesian2D\` grid component for the board display with color-coded cells.
- **Testing** -- comprehensive unit tests for the logic module and integration tests for the UI, plus Playwright E2E tests.

## Color Legend

| Color | Meaning |
|-------|---------|
| Dark gray | Unknown/unvisited cell |
| Light/white | Visited empty cell |
| Blue | Agent's current position |
| Black | Confirmed pit |
| Red | Wumpus |
| Yellow | Gold |
| Green (light) | Stench detected |
| Cyan (light) | Breeze detected |
| Mixed green/cyan | Both stench and breeze |
`}]},{title:`API Reference`,children:[{title:`API Reference`,path:`api/README`,content:"# API Reference\n\n## Core API\n\n| Export | Module | Description |\n|--------|--------|-------------|\n| `createElement` | `specifyjs` | Create a virtual DOM element |\n| `h` | `specifyjs` | Alias for createElement |\n| `Fragment` | `specifyjs` | Group children without a wrapper node |\n| `createContext` | `specifyjs` | Create a context for shared state |\n| `createRef` | `specifyjs` | Create a mutable ref object |\n| `forwardRef` | `specifyjs` | Forward refs through components |\n| `memo` | `specifyjs` | Memoize a component |\n| `lazy` | `specifyjs` | Lazy-load a component (use with Suspense) |\n| `isValidElement` | `specifyjs` | Check if a value is a SpecifyJS element |\n| `cloneElement` | `specifyjs` | Clone an element with merged props |\n| `Children` | `specifyjs` | Utilities for the children prop |\n| `Component` | `specifyjs` | Base class for class components |\n| `PureComponent` | `specifyjs` | Component with shallow prop comparison |\n| `startTransition` | `specifyjs` | Mark state updates as non-urgent |\n| `act` | `specifyjs` | Testing utility for flushing updates |\n\n## Detailed References\n\n- [Components](components.md) — createElement, Fragment, Context, Refs, memo, lazy, forwardRef\n- [Hooks](hooks.md) — All 16 hooks with signatures and examples\n- [DOM](dom.md) — Browser rendering APIs\n- [Server](server.md) — Static pre-rendering — Build-time HTML generation\n- [Types](types.md) — TypeScript type definitions\n"},{title:`Components API`,path:`api/components`,content:`# Components API

## createElement

\`\`\`typescript
createElement(type, props, ...children): SpecElement
\`\`\`

Creates a virtual DOM element. \`type\` can be a string (\`'div'\`), function component, or class component.

## Fragment

\`\`\`typescript
createElement(Fragment, null, child1, child2)
\`\`\`

Groups children without adding an extra DOM node. JSX shorthand: \`<>...</>\`.

## Context

### createContext

\`\`\`typescript
const MyContext = createContext(defaultValue);
\`\`\`

Creates a context with Provider and Consumer.

### Provider

\`\`\`typescript
createElement(MyContext.Provider, { value: actualValue }, children)
\`\`\`

### useContext

\`\`\`typescript
const value = useContext(MyContext);
\`\`\`

## Refs

### createRef

\`\`\`typescript
const ref = createRef<HTMLInputElement>();
// ref.current is null until mounted
\`\`\`

### forwardRef

\`\`\`typescript
const FancyInput = forwardRef((props, ref) => {
  return createElement('input', { ref, ...props });
});
\`\`\`

## Memoization

### memo

\`\`\`typescript
const MemoComp = memo(MyComponent);
const MemoComp = memo(MyComponent, (prev, next) => prev.id === next.id);
\`\`\`

### lazy

\`\`\`typescript
const LazyComp = lazy(() => import('./HeavyComponent'));
// Use with Suspense
\`\`\`

## Class Components

### Component

\`\`\`typescript
class MyComp extends Component<Props, State> {
  state = { count: 0 };
  render() { return createElement('div', null, this.state.count); }
  componentDidMount() { }
  componentDidUpdate(prevProps, prevState) { }
  componentWillUnmount() { }
  shouldComponentUpdate(nextProps, nextState) { return true; }
}
\`\`\`

### PureComponent

Like Component but implements \`shouldComponentUpdate\` with shallow comparison.

## Utilities

### Children

\`\`\`typescript
Children.map(children, fn)     // Map over children
Children.forEach(children, fn) // Iterate children
Children.count(children)       // Count renderable children
Children.only(children)        // Assert single element child
Children.toArray(children)     // Flatten to array
\`\`\`

### cloneElement

\`\`\`typescript
cloneElement(element, { newProp: 'value' }, newChild)
\`\`\`

### isValidElement

\`\`\`typescript
isValidElement(value) // true if SpecifyJS element
\`\`\`
`},{title:`Compute — GPU Compute Abstraction`,path:`api/compute`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Compute — GPU Compute Abstraction

SpecifyJS provides a backend-agnostic compute API for running parallel numeric
kernels on the GPU (WebGPU, WebGL) or CPU. The system auto-detects the best
available backend at runtime and falls back to a pure TypeScript CPU
implementation when no GPU is present.

\`\`\`typescript
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
\`\`\`

> **Note:** The \`compute\` subpath is an internal module. Depending on your
> project setup you may need to import directly from the source files.

---

## Quick Start

\`\`\`typescript
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
\`\`\`

---

## createComputeContext()

\`\`\`typescript
async function createComputeContext(): Promise<ComputeContext>
\`\`\`

Creates or returns a cached \`ComputeContext\`. The context is cached for the
lifetime of the page -- calling \`createComputeContext()\` multiple times
returns the same instance until \`dispose()\` is called.

**Auto-detection order:**

1. **WebGPU** -- used if \`navigator.gpu\` is available and device initialization succeeds
2. **WebGL** -- used if WebGPU is unavailable but WebGL context can be created
3. **CPU** -- pure TypeScript fallback, always available

---

## setComputeBackend(name)

\`\`\`typescript
function setComputeBackend(name: 'webgpu' | 'webgl' | 'cpu'): void
\`\`\`

Forces a specific backend for all subsequent \`createComputeContext()\` calls.
Clears the cached backend so the next call creates a fresh instance.

\`\`\`typescript
import { setComputeBackend, createComputeContext } from '@asymmetric-effort/specifyjs/compute';

// Force CPU backend (useful for testing or deterministic behavior)
setComputeBackend('cpu');
const ctx = await createComputeContext();
console.log(ctx.getBackendInfo().name); // 'cpu'
\`\`\`

---

## ComputeContext

The developer-facing API returned by \`createComputeContext()\`.

### execute(kernel, params)

\`\`\`typescript
execute(kernel: KernelName, params: KernelParams): Promise<KernelResult>
\`\`\`

Runs a named compute kernel with the provided buffers and uniforms.

### getBackendInfo()

\`\`\`typescript
getBackendInfo(): BackendInfo
\`\`\`

Returns information about the active backend.

\`\`\`typescript
interface BackendInfo {
  name: 'webgpu' | 'webgl' | 'cpu';
  isGPU: boolean;
  maxBufferSize: number;  // Max buffer size in bytes
}
\`\`\`

### dispose()

\`\`\`typescript
dispose(): void
\`\`\`

Releases all GPU resources held by the backend and clears the cached
instance. After calling \`dispose()\`, the next \`createComputeContext()\` call
will create a new backend.

---

## Types

### KernelName

\`\`\`typescript
type KernelName = 'matrix-multiply' | 'verlet-constraints' | 'n-body' | 'particle-system';
\`\`\`

The four named compute kernels. Three are currently implemented
(\`matrix-multiply\`, \`verlet-constraints\`, \`n-body\`); \`particle-system\` is
reserved for a future kernel.

### ComputeBuffer

\`\`\`typescript
interface ComputeBuffer {
  name: string;
  data: Float64Array | Float32Array;
  usage: 'read' | 'write' | 'readwrite';
}
\`\`\`

| Field | Description |
|---|---|
| \`name\` | Identifier for this buffer within a kernel invocation |
| \`data\` | Typed array holding the numeric payload |
| \`usage\` | \`'read'\` = input only, \`'write'\` = output only, \`'readwrite'\` = both |

### KernelParams

\`\`\`typescript
interface KernelParams {
  buffers: ComputeBuffer[];
  uniforms?: Record<string, number>;
  workgroupSize?: number;  // GPU hint, ignored by CPU backend
}
\`\`\`

### KernelResult

\`\`\`typescript
interface KernelResult {
  buffers: Map<string, Float64Array | Float32Array>;
}
\`\`\`

Output buffers are keyed by buffer name. Only buffers with \`usage: 'write'\`
or \`'readwrite'\` appear in the result.

---

## Pre-built Kernels

### matrix-multiply

Multiplies two NxN matrices.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`a\` | \`read\` | N*N floats, row-major |
| \`b\` | \`read\` | N*N floats, row-major |
| \`result\` | \`write\` | N*N floats (pre-allocated) |

**Uniforms:**

| Name | Description |
|---|---|
| \`size\` | Dimension N of the square matrices |

\`\`\`typescript
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
\`\`\`

### verlet-constraints

Applies Verlet integration with distance constraint relaxation for 2D
particle simulations (cloth, rope, soft-body).

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`positions\` | \`readwrite\` | 2 floats per particle (x, y), length = \`count * 2\` |
| \`prevPositions\` | \`readwrite\` | 2 floats per particle (previous frame), length = \`count * 2\` |
| \`constraints\` | \`read\` | Packed triples \`[indexA, indexB, restLength, ...]\`, length = \`constraintCount * 3\` |

**Uniforms:**

| Name | Description |
|---|---|
| \`dt\` | Time step (seconds) |
| \`gravity\` | Gravitational acceleration (positive = downward) |
| \`count\` | Number of particles |
| \`constraintCount\` | Number of distance constraints |

\`\`\`typescript
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
\`\`\`

The algorithm:
1. Computes velocity from position difference (\`current - previous\`)
2. Applies gravity to the y-component
3. Updates positions via Verlet integration
4. Relaxes each distance constraint by moving both particles toward the rest length

### n-body

Gravitational N-body simulation step for 3D particle systems.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`positions\` | \`readwrite\` | 3 floats per particle (x, y, z), length = \`count * 3\` |
| \`velocities\` | \`readwrite\` | 3 floats per particle (vx, vy, vz), length = \`count * 3\` |
| \`masses\` | \`read\` | 1 float per particle, length = \`count\` |

**Uniforms:**

| Name | Description |
|---|---|
| \`dt\` | Time step (seconds) |
| \`G\` | Gravitational constant |
| \`count\` | Number of particles |

\`\`\`typescript
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
\`\`\`

A softening factor of \`1e-10\` is added to distance calculations to prevent
singularities when particles are very close together.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Unknown kernel name | Throws \`Error: CpuBackend: unknown kernel '<name>'\` |
| Missing required buffer | Throws \`Error: CpuBackend: missing buffer '<name>'\` |
| Missing required uniform | Throws \`Error: CpuBackend: missing uniform '<key>'\` |
| GPU init fails during auto-detect | Silently falls back to the next backend |
| All GPU backends fail | Falls back to CPU (always available) |
| \`dispose()\` called, then \`execute()\` | Undefined behavior -- create a new context first |

---

## Testing with CPU Backend

For deterministic tests, force the CPU backend:

\`\`\`typescript
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
\`\`\`
`},{title:`DOM API`,path:`api/dom`,content:`# DOM API

The DOM module provides browser rendering APIs. Import from \`specifyjs/dom\`.

## createRoot

\`\`\`typescript
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
root.unmount();
\`\`\`

## hydrateRoot

Hydrate server-rendered HTML:

\`\`\`typescript
import { hydrateRoot } from 'specifyjs/dom';

const root = hydrateRoot(document, createElement(App, null));
\`\`\`

## createPortal

Render children into a different DOM subtree:

\`\`\`typescript
import { createPortal } from 'specifyjs/dom';

createPortal(createElement(Modal, null), document.getElementById('modal-root'));
\`\`\`

## flushSync

Force synchronous state updates (escape automatic batching):

\`\`\`typescript
import { flushSync } from 'specifyjs/dom';

flushSync(() => {
  setState(newValue); // Updates DOM synchronously
});
\`\`\`

## Legacy APIs

For migration from older patterns:

\`\`\`typescript
import { render, hydrate, unmountComponentAtNode } from 'specifyjs/dom';

render(element, container, callback);
hydrate(element, container, callback);
unmountComponentAtNode(container);
\`\`\`

## Event Handling

SpecifyJS uses a synthetic event system with cross-browser normalization:

\`\`\`typescript
createElement('button', {
  onClick: (e) => { /* SyntheticMouseEvent */ },
  onKeyDown: (e) => { /* SyntheticKeyboardEvent */ },
});
\`\`\`

Supported event types: Mouse, Keyboard, Focus, Input, Touch, Wheel, Drag, Pointer, Clipboard, Animation, Transition.
`},{title:`Hooks API`,path:`api/hooks`,content:`# Hooks API

All hooks must be called inside function component bodies. Calling hooks outside a component throws an error.

## State Hooks

### \`useState<T>(initialState: T | (() => T)): [T, setter]\`

Returns a stateful value and a function to update it.

\`\`\`typescript
const [count, setCount] = useState(0);
setCount(5);             // Direct value
setCount(prev => prev + 1); // Functional updater
\`\`\`

### \`useReducer<S, A>(reducer, initialArg, init?): [S, dispatch]\`

Alternative to useState for complex state logic.

\`\`\`typescript
const [state, dispatch] = useReducer(
  (state, action) => { switch(action.type) { ... } },
  { count: 0 }
);
dispatch({ type: 'increment' });
\`\`\`

## Effect Hooks

### \`useEffect(create, deps?): void\`

Runs side effects after render. Returns an optional cleanup function.

\`\`\`typescript
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

### \`useLayoutEffect(create, deps?): void\`

Like useEffect but fires synchronously after DOM mutations, before paint.

### \`useInsertionEffect(create, deps?): void\`

Fires before DOM mutations. Designed for CSS-in-JS libraries.

## Context Hooks

### \`useContext<T>(context: SpecContext<T>): T\`

Reads the current value from the nearest matching Provider.

\`\`\`typescript
const theme = useContext(ThemeContext);
\`\`\`

## Ref Hooks

### \`useRef<T>(initialValue?): { current: T }\`

Returns a mutable ref object that persists across renders.

\`\`\`typescript
const inputRef = useRef<HTMLInputElement>(null);
\`\`\`

### \`useImperativeHandle(ref, createHandle, deps?): void\`

Customizes the instance value exposed to parent refs via \`forwardRef\`.

## Performance Hooks

### \`useMemo<T>(factory: () => T, deps): T\`

Memoizes an expensive computation. Recomputes only when deps change.

\`\`\`typescript
const sorted = useMemo(() => items.sort(compareFn), [items]);
\`\`\`

### \`useCallback<T>(callback: T, deps): T\`

Returns a memoized callback. Equivalent to \`useMemo(() => callback, deps)\`.

\`\`\`typescript
const handleClick = useCallback(() => setCount(c => c + 1), []);
\`\`\`

### \`memo(component, compare?)\`

Wraps a component to skip re-renders when props are shallowly equal.

## Identity Hooks

### \`useId(): string\`

Generates a unique ID stable across server and client renders.

\`\`\`typescript
const id = useId(); // ":l0:", ":l1:", etc.
\`\`\`

## Transition Hooks

### \`useTransition(): [isPending, startTransition]\`

Marks state updates as non-urgent transitions.

### \`useDeferredValue<T>(value: T): T\`

Defers a value update to avoid blocking urgent updates.

## External Store Hooks

### \`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?): T\`

Subscribes to an external data source.

## Debug Hooks

### \`useDebugValue(value, format?): void\`

Displays a label in DevTools for custom hooks. No-op in production.
`},{title:`Math — Linear Algebra Library`,path:`api/math`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Math — Linear Algebra Library

SpecifyJS ships a lightweight, immutable linear algebra library for 2D/3D vector
math, NxN matrix operations, and numerical solvers. All functions are pure
(they return new values and never mutate their inputs), use \`Float64Array\` for
numeric precision, and contain zero runtime dependencies.

\`\`\`typescript
import {
  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Length,
  vec2Normalize, vec2Dist, vec2Lerp,
  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot, vec3Cross,
  vec3Length, vec3Normalize,
  mat4Identity, mat4Multiply, mat4Transpose, mat4Inverse,
  mat4Translate, mat4Scale, mat4RotateX, mat4RotateY, mat4RotateZ,
  mat4Perspective, mat4Orthographic, mat4LookAt,
  mat4FromQuaternion, mat4TransformVec3, mat4TransformDirection,
  quatIdentity, quatFromAxisAngle, quatFromEuler, quatMultiply,
  quatConjugate, quatInverse, quatNormalize, quatLength,
  quatDot, quatSlerp, quatRotateVec3, quatToEuler, quatLookAt,
  matN, matNIdentity, matNFromArray, matNGet, matNSet,
  matNMultiply, matNMultiplyVec, matNTranspose, matNScale,
  matNAdd, matNCopy,
  solve, luDecompose, luSolve, determinant, inverse,
} from '@asymmetric-effort/specifyjs/math';
\`\`\`

> **Note:** The \`math\` subpath is an internal module. Depending on your project
> setup you may need to import directly from the source files
> (e.g. \`../../components/math/src/vec\`).

---

## Vec2 — 2D Vectors

### Type

\`\`\`typescript
interface Vec2 {
  readonly x: number;
  readonly y: number;
}
\`\`\`

All \`Vec2\` instances are plain objects with immutable \`x\` and \`y\` fields.

### Creating a Vec2

\`\`\`typescript
const v = vec2(3, 4); // { x: 3, y: 4 }
\`\`\`

### Arithmetic

\`\`\`typescript
const a = vec2(1, 2);
const b = vec2(3, 4);

vec2Add(a, b);        // { x: 4, y: 6 }
vec2Sub(a, b);        // { x: -2, y: -2 }
vec2Scale(a, 3);      // { x: 3, y: 6 }
\`\`\`

### Dot Product

Returns a scalar representing the alignment of two vectors.

\`\`\`typescript
vec2Dot(vec2(1, 0), vec2(0, 1)); // 0  (perpendicular)
vec2Dot(vec2(1, 0), vec2(1, 0)); // 1  (parallel)
\`\`\`

### Length and Normalization

\`\`\`typescript
vec2Length(vec2(3, 4));        // 5
vec2Normalize(vec2(3, 4));     // { x: 0.6, y: 0.8 }
vec2Normalize(vec2(0, 0));     // { x: 0, y: 0 } — zero-safe
\`\`\`

### Distance

\`\`\`typescript
vec2Dist(vec2(0, 0), vec2(3, 4)); // 5
\`\`\`

### Linear Interpolation

Interpolates between two points. \`t = 0\` returns \`a\`, \`t = 1\` returns \`b\`.

\`\`\`typescript
vec2Lerp(vec2(0, 0), vec2(10, 10), 0.5); // { x: 5, y: 5 }
\`\`\`

---

## Vec3 — 3D Vectors

### Type

\`\`\`typescript
interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
\`\`\`

### Creating a Vec3

\`\`\`typescript
const v = vec3(1, 2, 3);
\`\`\`

### Arithmetic

\`\`\`typescript
const a = vec3(1, 2, 3);
const b = vec3(4, 5, 6);

vec3Add(a, b);        // { x: 5, y: 7, z: 9 }
vec3Sub(a, b);        // { x: -3, y: -3, z: -3 }
vec3Scale(a, 2);      // { x: 2, y: 4, z: 6 }
\`\`\`

### Dot Product

\`\`\`typescript
vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0)); // 0
\`\`\`

### Cross Product

Returns a vector perpendicular to both inputs (right-hand rule).

\`\`\`typescript
vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0)); // { x: 0, y: 0, z: 1 }
\`\`\`

### Length and Normalization

\`\`\`typescript
vec3Length(vec3(1, 2, 2));        // 3
vec3Normalize(vec3(0, 0, 5));     // { x: 0, y: 0, z: 1 }
vec3Normalize(vec3(0, 0, 0));     // { x: 0, y: 0, z: 0 } — zero-safe
\`\`\`

---

## Mat4 — 4x4 Matrices

### Type

\`\`\`typescript
type Mat4 = Float64Array; // 16 elements, column-major order
\`\`\`

Index layout (column-major, OpenGL convention):

\`\`\`
[0]  [4]  [8]  [12]
[1]  [5]  [9]  [13]
[2]  [6]  [10] [14]
[3]  [7]  [11] [15]
\`\`\`

All Mat4 functions return new arrays and never mutate their inputs.

### Creating Matrices

\`\`\`typescript
const eye = mat4Identity(); // 4x4 identity matrix
\`\`\`

### Arithmetic

\`\`\`typescript
mat4Multiply(a, b);    // result = a * b (column-major)
mat4Transpose(m);      // transpose of m
\`\`\`

### Inverse

Returns \`null\` if the matrix is singular (determinant smaller than \`1e-15\`).

\`\`\`typescript
const inv = mat4Inverse(m); // Mat4 | null
\`\`\`

### Transforms

Apply transforms to a matrix (result = m * T):

\`\`\`typescript
mat4Translate(m, { x: 1, y: 2, z: 3 });  // translation
mat4Scale(m, { x: 2, y: 2, z: 2 });      // uniform scale
mat4RotateX(m, Math.PI / 4);              // rotate around X (radians)
mat4RotateY(m, Math.PI / 4);              // rotate around Y
mat4RotateZ(m, Math.PI / 4);              // rotate around Z
\`\`\`

### Projection Matrices

\`\`\`typescript
// Perspective: fovY (radians), aspect ratio, near, far
mat4Perspective(Math.PI / 4, 16 / 9, 0.1, 1000);

// Orthographic: left, right, bottom, top, near, far
mat4Orthographic(-10, 10, -10, 10, 0.1, 100);
\`\`\`

### View Matrix

\`\`\`typescript
// Camera at eye, looking at target, with world up
mat4LookAt(
  { x: 0, y: 5, z: 10 },  // eye
  { x: 0, y: 0, z: 0 },   // target
  { x: 0, y: 1, z: 0 },   // up
);
\`\`\`

### Quaternion Conversion

\`\`\`typescript
mat4FromQuaternion(q); // rotation matrix from a unit quaternion
\`\`\`

### Vector Transformation

\`\`\`typescript
// Transform a point (w=1, applies translation, perspective divide)
mat4TransformVec3(m, { x: 1, y: 2, z: 3 });

// Transform a direction (w=0, ignores translation)
mat4TransformDirection(m, { x: 0, y: 1, z: 0 });
\`\`\`

### Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| \`mat4Identity\` | \`() => Mat4\` | 4x4 identity matrix |
| \`mat4Multiply\` | \`(a: Mat4, b: Mat4) => Mat4\` | Matrix multiplication |
| \`mat4Transpose\` | \`(m: Mat4) => Mat4\` | Transpose |
| \`mat4Inverse\` | \`(m: Mat4) => Mat4 \\| null\` | Inverse (null if singular) |
| \`mat4Translate\` | \`(m: Mat4, v: Vec3) => Mat4\` | Apply translation |
| \`mat4Scale\` | \`(m: Mat4, v: Vec3) => Mat4\` | Apply scale |
| \`mat4RotateX\` | \`(m: Mat4, radians: number) => Mat4\` | Rotate around X axis |
| \`mat4RotateY\` | \`(m: Mat4, radians: number) => Mat4\` | Rotate around Y axis |
| \`mat4RotateZ\` | \`(m: Mat4, radians: number) => Mat4\` | Rotate around Z axis |
| \`mat4Perspective\` | \`(fovY, aspect, near, far) => Mat4\` | Perspective projection |
| \`mat4Orthographic\` | \`(left, right, bottom, top, near, far) => Mat4\` | Orthographic projection |
| \`mat4LookAt\` | \`(eye: Vec3, target: Vec3, up: Vec3) => Mat4\` | View (look-at) matrix |
| \`mat4FromQuaternion\` | \`(q: Quaternion) => Mat4\` | Rotation matrix from quaternion |
| \`mat4TransformVec3\` | \`(m: Mat4, v: Vec3) => Vec3\` | Transform point (w=1) |
| \`mat4TransformDirection\` | \`(m: Mat4, v: Vec3) => Vec3\` | Transform direction (w=0) |

---

## Quaternion — Rotation Representation

### Type

\`\`\`typescript
interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;  // scalar component
}
\`\`\`

All quaternion functions return new objects and never mutate their inputs.

### Creating Quaternions

\`\`\`typescript
const q = quatIdentity();  // { x: 0, y: 0, z: 0, w: 1 } — no rotation

// From axis + angle (axis is auto-normalized)
quatFromAxisAngle({ x: 0, y: 1, z: 0 }, Math.PI / 2);  // 90-degree Y rotation

// From Euler angles (intrinsic ZYX / yaw-pitch-roll, radians)
quatFromEuler(pitch, yaw, roll);

// Look in a direction
quatLookAt(
  { x: 0, y: 0, z: -1 },  // forward direction
  { x: 0, y: 1, z: 0 },   // up vector
);
\`\`\`

### Arithmetic

\`\`\`typescript
// Hamilton product: applies rotation b first, then a
quatMultiply(a, b);

quatConjugate(q);   // { -x, -y, -z, w }
quatInverse(q);     // conjugate / |q|^2 (safe for zero-length)
quatNormalize(q);   // unit quaternion
\`\`\`

### Measurements

\`\`\`typescript
quatLength(q);     // magnitude (sqrt of sum of squares)
quatDot(a, b);     // dot product
\`\`\`

### Interpolation

\`\`\`typescript
// Spherical linear interpolation (t: 0 = a, 1 = b)
quatSlerp(a, b, 0.5);
\`\`\`

Automatically takes the shorter arc (negates one quaternion if the dot product
is negative). Falls back to normalised lerp when quaternions are very close
(\`dot > 0.9995\`).

### Transforming Vectors

\`\`\`typescript
// Rotate a Vec3 by a unit quaternion (optimized q * v * q^-1)
quatRotateVec3(q, { x: 1, y: 0, z: 0 });
\`\`\`

### Conversion

\`\`\`typescript
// To Euler angles: returns Vec3 where x=pitch, y=yaw, z=roll
quatToEuler(q);

// To rotation matrix (use Mat4 module)
mat4FromQuaternion(q);
\`\`\`

### Function Reference

| Function | Signature | Description |
|----------|-----------|-------------|
| \`quatIdentity\` | \`() => Quaternion\` | Identity (no rotation) |
| \`quatFromAxisAngle\` | \`(axis: Vec3, radians: number) => Quaternion\` | From axis + angle |
| \`quatFromEuler\` | \`(pitch, yaw, roll) => Quaternion\` | From Euler angles (ZYX) |
| \`quatMultiply\` | \`(a: Quaternion, b: Quaternion) => Quaternion\` | Hamilton product |
| \`quatConjugate\` | \`(q: Quaternion) => Quaternion\` | Conjugate |
| \`quatInverse\` | \`(q: Quaternion) => Quaternion\` | Inverse |
| \`quatNormalize\` | \`(q: Quaternion) => Quaternion\` | Normalize to unit length |
| \`quatLength\` | \`(q: Quaternion) => number\` | Magnitude |
| \`quatDot\` | \`(a: Quaternion, b: Quaternion) => number\` | Dot product |
| \`quatSlerp\` | \`(a: Quaternion, b: Quaternion, t: number) => Quaternion\` | Spherical lerp |
| \`quatRotateVec3\` | \`(q: Quaternion, v: Vec3) => Vec3\` | Rotate vector by quaternion |
| \`quatToEuler\` | \`(q: Quaternion) => Vec3\` | To Euler angles (x=pitch, y=yaw, z=roll) |
| \`quatLookAt\` | \`(forward: Vec3, up: Vec3) => Quaternion\` | Look-rotation from direction |

---

## MatN — NxN Matrices

### Type

\`\`\`typescript
interface MatN {
  readonly data: Float64Array;  // Row-major flat storage
  readonly size: number;        // Dimension N (rows = cols = N)
}
\`\`\`

Matrices are stored as flat \`Float64Array\` in row-major order. Element at
row \`i\`, column \`j\` is at index \`i * size + j\`.

### Creating Matrices

\`\`\`typescript
// Zero matrix (3x3)
const zero = matN(3);

// Identity matrix (3x3)
const eye = matNIdentity(3);

// From flat array (row-major)
const m = matNFromArray(2, [
  1, 2,
  3, 4,
]);
\`\`\`

### Element Access

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);

matNGet(m, 0, 1);              // 2
const m2 = matNSet(m, 0, 1, 9); // Returns a new matrix with m[0][1] = 9
\`\`\`

\`matNSet\` returns a **new** matrix; the original is not modified.

### Matrix Multiplication

Both operands must have the same size.

\`\`\`typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNIdentity(2);
const c = matNMultiply(a, b); // c equals a
\`\`\`

### Matrix-Vector Multiplication

Multiplies an NxN matrix by an N-length column vector.

\`\`\`typescript
const m = matNFromArray(2, [1, 0, 0, 2]);
const v = new Float64Array([3, 4]);
const result = matNMultiplyVec(m, v); // Float64Array [3, 8]
\`\`\`

### Transpose

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
const mt = matNTranspose(m);
// mt = [1, 3, 2, 4]
\`\`\`

### Scalar Operations

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
matNScale(m, 2);  // [2, 4, 6, 8]
\`\`\`

### Addition

Both operands must have the same size.

\`\`\`typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNFromArray(2, [5, 6, 7, 8]);
const c = matNAdd(a, b); // [6, 8, 10, 12]
\`\`\`

### Copying

\`\`\`typescript
const copy = matNCopy(m); // Deep copy (new Float64Array)
\`\`\`

---

## Solver — Gaussian Elimination and LU Decomposition

### solve(A, b) — Solve Ax = b

Solves a system of linear equations using LU decomposition with partial
pivoting.

\`\`\`typescript
// Solve:  2x + y = 5
//          x + 3y = 7
const A = matNFromArray(2, [2, 1, 1, 3]);
const b = new Float64Array([5, 7]);
const x = solve(A, b);
// x = Float64Array [1.6, 1.8]
\`\`\`

Returns \`null\` if the matrix is singular (no unique solution exists).

\`\`\`typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
const result = solve(singular, new Float64Array([1, 2]));
// result === null
\`\`\`

### luDecompose(A) — LU Decomposition

Computes PA = LU where L is lower-triangular with unit diagonal, U is
upper-triangular, and P is a permutation vector.

\`\`\`typescript
const A = matNFromArray(3, [
  2, 1, 1,
  4, 3, 3,
  8, 7, 9,
]);
const decomp = luDecompose(A);
// decomp.L  — lower triangular (unit diagonal)
// decomp.U  — upper triangular
// decomp.P  — permutation vector [2, 1, 0] etc.
\`\`\`

Returns \`null\` if the matrix is singular (a pivot is smaller than \`1e-12\`).

### luSolve(L, U, P, b) — Solve with Pre-computed LU

Reuses an existing LU decomposition to solve for a different right-hand side
without repeating the factorization.

\`\`\`typescript
const decomp = luDecompose(A);
if (decomp) {
  const x1 = luSolve(decomp.L, decomp.U, decomp.P, b1);
  const x2 = luSolve(decomp.L, decomp.U, decomp.P, b2);
}
\`\`\`

### determinant(A) — Matrix Determinant

Computes the determinant via LU decomposition. Returns \`0\` for singular
matrices.

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
determinant(m); // -2

const singular = matNFromArray(2, [1, 2, 2, 4]);
determinant(singular); // 0
\`\`\`

The sign is computed by counting swaps in the permutation vector.

### inverse(A) — Matrix Inverse

Returns the inverse matrix, or \`null\` if the matrix is singular.

\`\`\`typescript
const m = matNFromArray(2, [4, 7, 2, 6]);
const inv = inverse(m);
// inv is the 2x2 inverse matrix

// Verify: m * inv = identity
const product = matNMultiply(m, inv);
// product ~ matNIdentity(2)
\`\`\`

\`\`\`typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
inverse(singular); // null
\`\`\`

For an empty matrix (\`size === 0\`), \`inverse\` returns a zero-size identity
and \`determinant\` returns \`1\` by convention.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Zero-length vector passed to \`vec2Normalize\` / \`vec3Normalize\` | Returns a zero vector |
| Singular 4x4 matrix passed to \`mat4Inverse\` | Returns \`null\` (determinant < \`1e-15\`) |
| Zero-length quaternion passed to \`quatNormalize\` | Returns \`{ x: 0, y: 0, z: 0, w: 0 }\` |
| Zero-length quaternion passed to \`quatInverse\` | Returns \`{ x: 0, y: 0, z: 0, w: 0 }\` |
| \`mat4TransformVec3\` with \`w = 0\` | Uses \`invW = 1\` (no division by zero) |
| Singular matrix passed to \`solve\` | Returns \`null\` |
| Singular matrix passed to \`luDecompose\` | Returns \`null\` |
| Singular matrix passed to \`inverse\` | Returns \`null\` |
| Singular matrix passed to \`determinant\` | Returns \`0\` |
| Empty matrix (\`size === 0\`) | \`determinant\` returns \`1\`; \`inverse\` returns empty identity |

All functions are safe to call with any numeric input. NaN and Infinity propagate
through arithmetic as expected by IEEE 754.
`},{title:`Static Pre-rendering API`,path:`api/server`,content:`# Static Pre-rendering API

Import from \`specifyjs/server\`.

> **Important:** These APIs are for **build-time static HTML generation only** — use them in build scripts to produce static HTML files served as-is by a web server or CDN. They must NOT be used in server request handlers, middleware, or any runtime code that responds to HTTP requests.
>
> SpecifyJS is a **browser-side SPA framework**. For dynamic content, use client-side rendering with data fetched via HTTPS from API endpoints.

## When to Use Static Pre-rendering

- **Static site generation (SSG)** — Generate HTML pages at build time for SEO or initial page load performance
- **Build scripts** — Pre-render component trees to HTML files during \`npm run build\`
- **Testing** — Generate HTML snapshots for visual regression testing

## When NOT to Use These APIs

- **Request handlers** — Never call \`renderToString\` inside an Express route, Koa middleware, or any HTTP handler
- **Edge functions** — Never render components on Cloudflare Workers, Vercel Edge, etc. at request time
- **API responses** — Never return pre-rendered HTML as an API response

If you need dynamic content, have the SPA fetch it as JSON from an API endpoint.

## renderToString

Renders a component tree to an HTML string during the build process:

\`\`\`typescript
// build-script.ts — run with: SPECIFYJS_ALLOW_PRERENDER=true node build-script.ts
import { renderToString } from 'specifyjs/server';

const html = renderToString(createElement(App, null));
fs.writeFileSync('dist/index.html', wrapInShell(html));
\`\`\`

Set the environment variable \`SPECIFYJS_ALLOW_PRERENDER=true\` to confirm you are using this in a build context. Without it, a warning is emitted in production environments.

## renderToStaticMarkup

Same as \`renderToString\` but without hydration markers. Use for pages that don't need client-side interactivity after load:

\`\`\`typescript
const html = renderToStaticMarkup(createElement(StaticPage, null));
fs.writeFileSync('dist/about.html', html);
\`\`\`

## renderToPipeableStream

Writes pre-rendered HTML to a Node.js writable stream in chunks. Useful for generating large static pages during build:

\`\`\`typescript
import { renderToPipeableStream } from 'specifyjs/server';
import { createWriteStream } from 'fs';

const stream = renderToPipeableStream(createElement(App, null), {
  onAllReady() { console.log('Pre-render complete'); },
});
stream.pipe(createWriteStream('dist/index.html'));
\`\`\`

## renderToReadableStream

Returns a Web ReadableStream of pre-rendered HTML. Useful in build tools that work with Web Streams:

\`\`\`typescript
import { renderToReadableStream } from 'specifyjs/server';

const stream = await renderToReadableStream(createElement(App, null));
// Write stream to file during build
\`\`\`

## Security

These APIs execute component code (including any side effects in component functions). Running untrusted component code on a server at request time creates security risks:

- **Code injection** — Malicious components could access server resources (filesystem, environment variables, databases)
- **Denial of service** — Expensive component trees could block the server event loop
- **Data leakage** — Build-time state could leak into rendered HTML

By restricting these APIs to build-time usage, component code only runs in the build environment (which is already trusted), and the output is static HTML served by a simple file server with no execution context.

## HTML Escaping

All text content and attribute values are automatically escaped to prevent XSS in the generated HTML. Use \`dangerouslySetInnerHTML\` only for trusted content:

\`\`\`typescript
createElement('div', { dangerouslySetInnerHTML: { __html: trustedHtml } });
\`\`\`
`},{title:`TypeScript Types`,path:`api/types`,content:`# TypeScript Types

SpecifyJS is written in TypeScript strict mode. All public APIs are fully typed.

## Core Types

\`\`\`typescript
// Element
interface SpecElement<P extends Props = Props> {
  $$typeof: symbol;
  type: ComponentType<P>;
  props: P;
  key: Key;
  ref: Ref;
}

// Valid children
type SpecChild = SpecElement | string | number | boolean | null | undefined;
type SpecNode = SpecChild | SpecNode[];

// Props
type Props = Record<string, unknown> & { children?: SpecNode; key?: Key; ref?: Ref };
type Key = string | number | null;

// Refs
type Ref<T = unknown> = RefCallback<T> | RefObject<T> | null;
type RefCallback<T> = (instance: T | null) => void;
interface RefObject<T> { current: T | null; }

// Components
type FunctionComponent<P extends Props = Props> = (props: P) => SpecNode;
type ComponentType<P extends Props = Props> = FunctionComponent<P> | ClassComponentConstructor<P> | string | symbol;

// Context
interface SpecContext<T> {
  Provider: ComponentType;
  Consumer: ComponentType;
  _currentValue: T;
  displayName?: string;
}
\`\`\`

## Fiber Types (internal)

\`\`\`typescript
interface Fiber<P extends Props = Props> {
  tag: FiberTag;
  type: ComponentType<P> | null;
  key: Key;
  ref: Ref;
  stateNode: unknown;
  pendingProps: P;
  memoizedProps: P | null;
  memoizedState: unknown;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag: EffectTag;
}
\`\`\`

These internal types are exported for advanced use cases like DevTools integration but are not part of the stable public API.
`}]},{title:`Architecture`,children:[{title:`Architecture`,path:`architecture/README`,content:`# Architecture

SpecifyJS follows a three-phase rendering architecture similar to React's Fiber architecture.

## System Overview

\`\`\`
createElement()     Fiber Tree        DOM
     │                  │               │
     ▼                  ▼               ▼
  VNode ──► Reconciler ──► Work Loop ──► Commit ──► Browser
              (diff)      (begin/       (mutate
               │           complete)     real DOM)
               ▼
          Effect Queue ──► Run Effects
\`\`\`

## Phases

### 1. Begin Phase (top-down)
Walk the fiber tree, rendering components, reconciling children, and building the new fiber tree.

### 2. Complete Phase (bottom-up)
Create/update DOM nodes for host fibers. Build the DOM subtree bottom-up.

### 3. Commit Phase
Apply all DOM mutations atomically, attach refs, run lifecycle methods and effects.

## Key Modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| Types | \`src/shared/types.ts\` | Core type definitions, fiber tags, effect flags |
| createElement | \`src/core/create-element.ts\` | Virtual element creation |
| Fiber | \`src/core/fiber.ts\` | Fiber node creation, work-in-progress cloning |
| Reconciler | \`src/core/reconciler.ts\` | Two-pass keyed diffing algorithm |
| Scheduler | \`src/core/scheduler.ts\` | Batched updates, microtask scheduling |
| Hook State | \`src/hooks/hook-state.ts\` | Hook linked list, effect queue, deps comparison |
| Dispatcher | \`src/hooks/dispatcher.ts\` | Concrete hook implementations |
| Work Loop | \`src/dom/work-loop.ts\` | Begin/complete/commit phases, DOM mutations |
| Events | \`src/dom/synthetic-event.ts\` | Cross-browser event normalization |

## Detailed Architecture

- [Virtual DOM](virtual-dom.md) — Element creation and tree structure
- [Fiber & Reconciler](fiber-reconciler.md) — Diffing and tree updates
- [Hooks Internals](hooks-internals.md) — How hooks work under the hood
- [Event System](event-system.md) — Synthetic event delegation
`},{title:`Event System`,path:`architecture/event-system`,content:`# Event System

## Synthetic Events

SpecifyJS wraps native browser events in synthetic event objects for cross-browser consistency:

| Class | Native Event | Properties |
|-------|-------------|------------|
| \`SyntheticEvent\` | \`Event\` | type, target, preventDefault, stopPropagation |
| \`SyntheticMouseEvent\` | \`MouseEvent\` | clientX/Y, button, altKey, ctrlKey, getModifierState |
| \`SyntheticKeyboardEvent\` | \`KeyboardEvent\` | key, code, shiftKey, repeat, getModifierState |
| \`SyntheticFocusEvent\` | \`FocusEvent\` | relatedTarget |
| \`SyntheticInputEvent\` | \`InputEvent\` | data, inputType |
| \`SyntheticTouchEvent\` | \`TouchEvent\` | touches, targetTouches, changedTouches |
| \`SyntheticWheelEvent\` | \`WheelEvent\` | deltaX/Y/Z, deltaMode |

## Event Name Mapping

React-style camelCase names map to DOM events:

\`\`\`
onClick     → click
onKeyDown   → keydown
onChange    → change
onSubmit    → submit
onMouseMove → mousemove
\`\`\`

50+ events are supported including pointer, drag, clipboard, animation, and transition events.

## Event Registration

Events are registered directly on DOM elements via \`addEventListener\` during the commit phase. When props change, old listeners are removed and new ones attached.

\`\`\`typescript
// In updateDOMProperties:
if (EVENT_RE.test(key)) {
  const eventName = key.slice(2).toLowerCase();
  dom.addEventListener(eventName, handler);
}
\`\`\`

## No Event Pooling

Unlike React 16 and earlier, SpecifyJS does not pool synthetic events. The \`persist()\` method is a no-op for API compatibility.
`},{title:`Fiber & Reconciler`,path:`architecture/fiber-reconciler`,content:`# Fiber & Reconciler

## Fiber Nodes

Each element in the tree becomes a fiber — a mutable work unit:

\`\`\`typescript
interface Fiber {
  tag: FiberTag;        // HostComponent, FunctionComponent, ClassComponent, etc.
  type: ComponentType;  // 'div', MyComponent, Fragment symbol
  key: Key;             // Reconciliation identity
  stateNode: unknown;   // DOM node (host) or class instance
  pendingProps: Props;  // New props for this render
  memoizedProps: Props; // Props from last render
  memoizedState: unknown; // Hook linked list (functions) or state (classes)

  return: Fiber | null;  // Parent
  child: Fiber | null;   // First child
  sibling: Fiber | null; // Next sibling
  alternate: Fiber | null; // Previous render's fiber (double buffering)

  effectTag: EffectTag; // Placement, Update, Deletion
}
\`\`\`

## Double Buffering

SpecifyJS maintains two fiber trees:
- **Current** — represents what's on screen
- **Work-in-progress (WIP)** — being built during render

After commit, the WIP becomes the new current tree.

## Reconciliation Algorithm

### Single Child
Direct comparison: same type → reuse fiber, different type → replace.

### Multiple Children (Two-Pass)

**Pass 1 — Linear scan:**
Walk old and new children in order. Match by key. Break on first mismatch.

**Pass 2 — Map lookup:**
Build a Map of remaining old children by key. For each remaining new child, look up a match in the map. Matched fibers are reused; unmatched old fibers are deleted.

### Keyed Diffing

Keys enable O(n) reconciliation of reordered lists. Without keys, SpecifyJS falls back to index-based matching (O(n) but may cause unnecessary DOM mutations).

## Effect Tags

- \`Placement\` — New node, needs DOM insertion
- \`Update\` — Existing node with changed props
- \`Deletion\` — Node removed from tree
- \`Ref\` — Ref needs attaching/detaching

## Lane-Based Priority System

Each fiber has \`lanes\` and \`childLanes\` bitmask fields for concurrent rendering:

| Lane | Value | Purpose |
|------|-------|---------|
| \`SyncLane\` | 1 | \`flushSync\` — highest priority, synchronous |
| \`InputContinuousLane\` | 2 | Drag, scroll, hover |
| \`DefaultLane\` | 4 | Normal \`useState\`/\`useReducer\` updates |
| \`TransitionLane1/2\` | 8/16 | \`startTransition\` — interruptible, lower priority |
| \`IdleLane\` | 64 | Background/offscreen work |

### Scheduling

The work loop has two modes:
- **\`workLoopSync\`** — processes the entire tree without yielding (used by \`SyncLane\` and \`DefaultLane\`)
- **\`workLoopConcurrent\`** — yields to the host after each 5ms frame budget via \`shouldYieldToHost()\` (used by \`TransitionLane\` and \`IdleLane\`)

\`ensureRootIsScheduled\` inspects \`FiberRoot.pendingLanes\` and picks the appropriate mode. Higher-priority updates can interrupt in-progress lower-priority work.

### State Update Flow

1. \`setState()\` calls \`requestUpdateLane()\` → returns lane based on context (transition, flushSync, or default)
2. \`markFiberWithLane()\` propagates the lane up the fiber tree via \`childLanes\`
3. \`ensureRootIsScheduled()\` schedules sync or concurrent work based on the highest-priority pending lane
4. After commit, completed lanes are cleared from \`pendingLanes\`
`},{title:`Hooks Internals`,path:`architecture/hooks-internals`,content:`# Hooks Internals

## Hook Linked List

Each function component's fiber stores a linked list of hooks:

\`\`\`
fiber.memoizedState → Hook₁ → Hook₂ → Hook₃ → null
                       │        │        │
                    useState  useEffect  useRef
\`\`\`

On each render, \`allocateHook()\` advances through the list. Hooks must be called in the same order every render.

## Dispatcher Pattern

Hooks are thin functions that delegate to a dispatcher:

\`\`\`
useState() → resolveDispatcher().useState() → useStateImpl()
\`\`\`

The dispatcher is installed before rendering a function component and uninstalled after. Calling hooks outside a component body fails because the dispatcher is null.

## State Update Queue

Each \`useState\`/\`useReducer\` hook maintains a queue of pending updates:

\`\`\`typescript
hook.queue = [{ action: 5 }, { action: prev => prev + 1 }]
\`\`\`

The queue is a **shared mutable array** — the \`setState\` closure and the re-render both reference the same array. This enables state updates to accumulate between renders.

On re-render, the queue is processed in order and cleared in-place (\`queue.length = 0\`) to maintain closure reference stability.

## Effect System

Effects are pushed to a per-fiber effect list during render:

\`\`\`typescript
EffectHook {
  tag: HasEffect | Passive,  // Passive = useEffect, Layout = useLayoutEffect
  create: () => cleanup,
  destroy: cleanup | null,
  deps: [dep1, dep2],
  next: EffectHook | null,
}
\`\`\`

During commit:
1. Run \`destroy\` (cleanup) from previous render
2. Run \`create\` and store returned cleanup as \`destroy\`

Deps are compared with \`Object.is\` — if all match, the effect is skipped.

## Re-render Trigger

When \`setState\`/\`dispatch\` is called:
1. Update is pushed to the hook's queue
2. \`scheduleUpdate\` is called with a callback that finds the fiber's root
3. \`scheduleRender\` fires a microtask that re-renders from the root
4. The component re-executes, processes its queued updates, and produces new output
`},{title:`Virtual DOM`,path:`architecture/virtual-dom`,content:"# Virtual DOM\n\n## Elements\n\n`createElement` produces lightweight VNode objects:\n\n```typescript\n{\n  $$typeof: SPEC_ELEMENT_TYPE,  // Symbol — prevents JSON injection\n  type: 'div',                    // String for host, function/class for components\n  props: { className: 'card' },   // Includes children\n  key: null,                      // Reconciliation identity\n  ref: null,                      // DOM/instance ref\n}\n```\n\n## Type Symbols\n\nEach special component type has a unique symbol:\n- `SPEC_FRAGMENT_TYPE` — Fragment (no DOM wrapper)\n- `SPEC_PORTAL_TYPE` — Render into different DOM subtree\n- `SPEC_PROVIDER_TYPE` — Context Provider\n- `SPEC_CONSUMER_TYPE` — Context Consumer\n- `SPEC_FORWARD_REF_TYPE` — Ref forwarding wrapper\n- `SPEC_MEMO_TYPE` — Memoized component wrapper\n- `SPEC_LAZY_TYPE` — Lazy-loaded component\n- `SPEC_SUSPENSE_TYPE` — Suspense boundary\n\n## Children Normalization\n\nChildren are normalized during reconciliation:\n- `null`, `undefined`, `boolean` → filtered out\n- `string`, `number` → text nodes\n- Arrays → flattened recursively\n- Elements → fiber nodes\n\n## JSX Runtime\n\nThe automatic JSX transform (`jsx-runtime.ts`) is a thin wrapper over `createElement` that handles the `key` extraction differently (passed as a separate argument by the compiler).\n"}]},{title:`Components`,children:[{title:`Component Library Reference`,path:`components/README`,content:`# Component Library Reference

66 components across 9 families. All zero-dependency, pure SpecifyJS, ARIA accessible, keyboard navigable.

## Layout (10)

| Component | Description | Docs |
|-----------|-------------|------|
| Grid | CSS Grid container with areas, responsive breakpoints | [layout/grid.md](layout/grid.md) |
| FlexContainer | Flexbox layout with FlexItem children | [layout/flex-container.md](layout/flex-container.md) |
| Card | Content card with header/body/footer/image slots | [layout/card.md](layout/card.md) |
| Panel | Collapsible panel with animated transition | [layout/panel.md](layout/panel.md) |
| Splitter | Resizable split pane with draggable divider | [layout/splitter.md](layout/splitter.md) |
| Tabs | Tabbed content with line/card/pill variants | [layout/tabs.md](layout/tabs.md) |
| ScrollContainer | Scrollable container with edge shadow indicators | [layout/scroll-container.md](layout/scroll-container.md) |
| DraggableWindow | Draggable, resizable window with title bar and edge snapping | [layout/draggable-window.md](layout/draggable-window.md) |
| WindowManager | Context provider for multi-window state management | [layout/window-manager.md](layout/window-manager.md) |
| DesktopBackground | Full-area workspace background with color/gradient/image | [layout/desktop-background.md](layout/desktop-background.md) |

## Form (14)

| Component | Description | Docs |
|-----------|-------------|------|
| FormFieldWrapper | Base wrapper with label, help text, error display | [form/wrapper.md](form/wrapper.md) |
| TextField | Single-line input with prefix/suffix slots | [form/textfield.md](form/textfield.md) |
| MultilineField | Textarea with auto-resize and character count | [form/multiline.md](form/multiline.md) |
| TextEditor | WYSIWYG rich text editor with toolbar | [form/texteditor.md](form/texteditor.md) |
| Select | Custom dropdown with search, multi-select, groups | [form/select.md](form/select.md) |
| Checkbox | Styled checkbox with indeterminate state | [form/checkbox.md](form/checkbox.md) |
| RadioGroup | Radio button group with horizontal/vertical layout | [form/radio.md](form/radio.md) |
| Toggle | Sliding pill switch with configurable colors | [form/toggle.md](form/toggle.md) |
| Slider | Range slider with marks, dual-handle mode | [form/slider.md](form/slider.md) |
| DatePicker | Calendar dropdown with month/year navigation | [form/datepicker.md](form/datepicker.md) |
| TimePicker | Hour/minute spinners with 12h/24h format | [form/timepicker.md](form/timepicker.md) |
| ColorPicker | Swatch grid with hex input | [form/color-picker.md](form/color-picker.md) |
| FileUpload | Drag-and-drop zone with file list | [form/file-upload.md](form/file-upload.md) |
| NumberSpinner | Numeric input with +/- buttons | [form/number-spinner.md](form/number-spinner.md) |

## Navigation (12)

| Component | Description | Docs |
|-----------|-------------|------|
| NavWrapper | Base container with orientation, ARIA, keyboard nav | [nav/wrapper.md](nav/wrapper.md) |
| Dropdown | Dropdown menu with nested submenus | [nav/dropdown.md](nav/dropdown.md) |
| TreeNav | Tree navigation with extensible TreeNode class | [nav/treenav.md](nav/treenav.md) |
| Accordion | Collapsible sections with animated transitions | [nav/accordion.md](nav/accordion.md) |
| Breadcrumb | Breadcrumb trail with separator and collapse | [nav/breadcrumb.md](nav/breadcrumb.md) |
| Pagination | Page numbers with ellipsis and prev/next | [nav/pagination.md](nav/pagination.md) |
| Stepper | Step wizard with circle/dot variants | [nav/stepper.md](nav/stepper.md) |
| Sidebar | Collapsible sidebar with nested sections | [nav/sidebar.md](nav/sidebar.md) |
| Toolbar | Horizontal toolbar with button groups | [nav/toolbar.md](nav/toolbar.md) |
| Menubar | Menu bar with hover-switch dropdowns | [nav/menubar.md](nav/menubar.md) |
| Dock | Application launcher bar with active indicators and badges | [nav/dock.md](nav/dock.md) |
| SystemTray | Top panel with clock, indicators, and user menu | [nav/system-tray.md](nav/system-tray.md) |

## Overlay (6)

| Component | Description | Docs |
|-----------|-------------|------|
| Modal | Dialog with backdrop and focus trap | [overlay/modal.md](overlay/modal.md) |
| Drawer | Slide-in panel from any edge | [overlay/drawer.md](overlay/drawer.md) |
| Popover | Positioned popover with arrow | [overlay/popover.md](overlay/popover.md) |
| Tooltip | Hover tooltip with delay | [overlay/tooltip.md](overlay/tooltip.md) |
| Toast | Notification system with useToast hook | [overlay/toast.md](overlay/toast.md) |
| ContextMenu | Right-click menu with nested submenus | [overlay/context-menu.md](overlay/context-menu.md) |

## Data Display (6)

| Component | Description | Docs |
|-----------|-------------|------|
| DataGrid | Full-featured table with sort, filter, pagination | [data/data-grid.md](data/data-grid.md) |
| ListView | Styled list with custom item rendering | [data/list-view.md](data/list-view.md) |
| VirtualScroll | Virtualized list for large datasets | [data/virtual-scroll.md](data/virtual-scroll.md) |
| Tag | Rounded pill with solid/outline/subtle variants | [data/tag.md](data/tag.md) |
| Badge | Count or dot indicator overlay | [data/badge.md](data/badge.md) |
| Avatar | Image/initials avatar with status dot | [data/avatar.md](data/avatar.md) |

## Feedback (5)

| Component | Description | Docs |
|-----------|-------------|------|
| ProgressBar | Bar and circular progress indicators | [feedback/progress-bar.md](feedback/progress-bar.md) |
| Spinner | Rotating loading spinner | [feedback/spinner.md](feedback/spinner.md) |
| Skeleton | Content placeholder with shimmer animation | [feedback/skeleton.md](feedback/skeleton.md) |
| Alert | Info/success/warning/error banners | [feedback/alert.md](feedback/alert.md) |
| EmptyState | Empty content placeholder with CTA | [feedback/empty-state.md](feedback/empty-state.md) |

## Media (3)

| Component | Description | Docs |
|-----------|-------------|------|
| Image | Enhanced image with lazy loading and fallback | [media/image.md](media/image.md) |
| Carousel | Image/content slider with arrows and dots | [media/carousel.md](media/carousel.md) |
| VideoPlayer | Video player with custom controls overlay | [media/video-player.md](media/video-player.md) |

## Page Layouts (4)

| Component | Description | Docs |
|-----------|-------------|------|
| UnityDesktop | Configurable Unity desktop with WindowManager, Dock, SystemTray, and DraggableWindow integration | [page/unity-desktop.md](page/unity-desktop.md) |
| WordProcessor | Word processor layout with menu bar, toolbar, ruler, and document page | [page/word-processor.md](page/word-processor.md) |
| IDE | VS Code-style IDE with file explorer, editor, terminal, and status bar | [page/ide.md](page/ide.md) |
| TradingDashboard | Stock trading terminal with chart, order book, and watchlist grid | [page/trading-dashboard.md](page/trading-dashboard.md) |

## Visualization (6)

| Component | Description | Docs |
|-----------|-------------|------|
| VizWrapper | Container with title, legend, CSS isolation | [viz/wrapper.md](viz/wrapper.md) |
| HypercubeGraph | N-dimensional hypercube with rotation | [viz/graph.md](viz/graph.md) |
| LineGraph | 2D line chart with multi-line support | [viz/2D-line-graph.md](viz/2D-line-graph.md) |
| BarGraph | Vertical/horizontal bar chart | [viz/2D-bar-graph.md](viz/2D-bar-graph.md) |
| PieGraph | Pie and donut chart | [viz/2D-pie-graph.md](viz/2D-pie-graph.md) |
| Space3D | Composable 3D scene with camera, lighting, and CPU/WebGL pipelines | [viz/3d-space.md](viz/3d-space.md) |
`},{title:`Button`,path:`components/form/button`,content:"# Button\n\nA configurable, accessible button component. Supports multiple visual variants, sizes, disabled state, full-width mode, and an active/toggled state.\n\n## Import\n\n```ts\nimport { Button } from '@aspect/form/button';\nimport type { ButtonProps } from '@aspect/form/button';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `children` | `unknown` | `undefined` | Button label or child elements |\n| `onClick` | `(e: Event) => void` | `undefined` | Click handler |\n| `variant` | `'primary' \\| 'secondary' \\| 'outline' \\| 'ghost' \\| 'danger'` | `'secondary'` | Visual variant |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Size variant |\n| `disabled` | `boolean` | `false` | Disabled state. Reduces opacity and prevents clicks |\n| `fullWidth` | `boolean` | `false` | Whether the button spans the full width of its container |\n| `type` | `'button' \\| 'submit' \\| 'reset'` | `'button'` | HTML button type attribute |\n| `className` | `string` | `undefined` | Custom CSS class name |\n| `style` | `Record<string, string>` | `undefined` | Custom inline style overrides |\n| `ariaLabel` | `string` | `undefined` | Accessible label (useful when children is an icon) |\n| `active` | `boolean` | `false` | Whether the button is in an active/toggled state |\n\n### Size dimensions\n\n| Size | Padding | Font Size | Border Radius |\n|------|---------|-----------|---------------|\n| `sm` | 3px 10px | 12px | 4px |\n| `md` | 6px 14px | 13px | 6px |\n| `lg` | 8px 20px | 15px | 6px |\n\n### Variant colors\n\n| Variant | Background | Text Color | Border |\n|---------|-----------|------------|--------|\n| `primary` | #3b82f6 | white | #3b82f6 |\n| `secondary` | #f8fafc | #0f172a | #d1d5db |\n| `outline` | transparent | #0f172a | #d1d5db |\n| `ghost` | transparent | #0f172a | transparent |\n| `danger` | #ef4444 | white | #ef4444 |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Button } from '@aspect/form/button';\n\n// Basic secondary button\nconst basic = createElement(Button, {\n  onClick: () => console.log('clicked'),\n}, 'Click me');\n\n// Primary button\nconst primary = createElement(Button, {\n  variant: 'primary',\n  onClick: handleSubmit,\n}, 'Submit');\n\n// Danger button, large\nconst danger = createElement(Button, {\n  variant: 'danger',\n  size: 'lg',\n  onClick: handleDelete,\n}, 'Delete');\n\n// Full-width disabled button\nconst disabled = createElement(Button, {\n  variant: 'primary',\n  fullWidth: true,\n  disabled: true,\n  onClick: () => {},\n}, 'Loading...');\n\n// Icon button with aria-label\nconst icon = createElement(Button, {\n  variant: 'ghost',\n  ariaLabel: 'Close dialog',\n  onClick: handleClose,\n}, '\\u00D7');\n\n// Toggle button with active state\nconst toggle = createElement(Button, {\n  active: isActive,\n  onClick: () => setActive(!isActive),\n}, 'Bold');\n```\n\n## Accessibility\n\n- Renders a native `<button>` element for built-in keyboard and screen reader support.\n- `aria-label` prop provides an accessible name when the button content is non-textual (e.g., an icon).\n- `aria-pressed` is set to `'true'` when the `active` prop is enabled, indicating a toggle state.\n- The `disabled` attribute is set on the native button element when disabled.\n- Click handler is removed when disabled, preventing interaction.\n"},{title:`Checkbox`,path:`components/form/checkbox`,content:`# Checkbox

Custom styled checkbox with label. Uses a hidden native input paired with a visible styled div showing a checkmark or indeterminate indicator.

## Import

\`\`\`ts
import { Checkbox } from '@aspect/form/checkbox';
import type { CheckboxProps } from '@aspect/form/checkbox';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`checked\` | \`boolean\` | required | Whether the checkbox is checked |
| \`onChange\` | \`(checked: boolean) => void\` | required | Change handler |
| \`label\` | \`string\` | \`undefined\` | Label text displayed next to the checkbox |
| \`indeterminate\` | \`boolean\` | \`false\` | Indeterminate state. Overrides checkmark display with a dash |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`error\` | \`string\` | \`undefined\` | Error message |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size variant |

### Size dimensions

| Size | Box | Icon | Font Size |
|------|-----|------|-----------|
| \`sm\` | 14px | 10px | 12px |
| \`md\` | 18px | 12px | 14px |
| \`lg\` | 22px | 16px | 16px |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Checkbox } from '@aspect/form/checkbox';

// Basic checkbox
const basic = createElement(Checkbox, {
  label: 'Accept terms and conditions',
  checked: accepted,
  onChange: (val) => setAccepted(val),
});

// Indeterminate state (e.g., parent of partially selected children)
const parent = createElement(Checkbox, {
  label: 'Select all',
  checked: allSelected,
  indeterminate: someSelected && !allSelected,
  onChange: (val) => toggleAll(val),
});

// Small disabled checkbox
const disabled = createElement(Checkbox, {
  label: 'Read-only option',
  checked: true,
  onChange: () => {},
  disabled: true,
  size: 'sm',
});
\`\`\`

## Features

- Three size variants (sm, md, lg) controlling box dimensions, icon size, and label font size.
- Indeterminate state displays a dash icon instead of a checkmark, useful for "select all" parent checkboxes.
- Checked and indeterminate states use a blue (#3b82f6) background with a white icon. Unchecked state shows a white background with a gray border.
- Error state changes the border color to red.
- Hidden native \`<input type="checkbox">\` is synced for form compatibility and indeterminate property support.
- Smooth transition on border color, background color, and opacity changes.
- Click and keyboard (Space, Enter) toggle the checked state.

## Accessibility

- The container uses \`role="checkbox"\` with \`aria-checked\` set to \`'true'\`, \`'false'\`, or \`'mixed'\` (for indeterminate).
- \`aria-disabled\` is set when the checkbox is disabled.
- The component is keyboard-focusable via \`tabIndex\` and responds to Space and Enter key presses.
- A hidden native checkbox input is rendered for form submission compatibility.
- The label is rendered as a \`<span>\` adjacent to the visual checkbox for consistent click targeting.
`},{title:`ColorPicker`,path:`components/form/color-picker`,content:`# ColorPicker

Color selection component with a swatch grid, hex input field, and optional preset colors. Displays a color preview trigger that opens a dropdown panel.

## Import

\`\`\`ts
import { ColorPicker } from '@aspect/form/color-picker';
import type { ColorPickerProps } from '@aspect/form/color-picker';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`string\` | required | Current color value as a hex string (e.g., \`'#ff0000'\`) |
| \`onChange\` | \`(value: string) => void\` | required | Change handler. Receives a normalized hex string |
| \`presets\` | \`string[]\` | 30 default colors | Preset color swatches displayed in the dropdown grid |
| \`showInput\` | \`boolean\` | \`true\` | Show the hex text input field in the dropdown |
| \`showAlpha\` | \`boolean\` | \`false\` | Reserved for future alpha/opacity slider support |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`label\` | \`string\` | \`undefined\` | Label text |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { ColorPicker } from '@aspect/form/color-picker';

// Basic color picker
const basic = createElement(ColorPicker, {
  label: 'Background Color',
  value: bgColor,
  onChange: (val) => setBgColor(val),
});

// Custom presets without hex input
const custom = createElement(ColorPicker, {
  label: 'Theme Color',
  value: themeColor,
  onChange: (val) => setThemeColor(val),
  presets: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
  showInput: false,
});

// Disabled
const disabled = createElement(ColorPicker, {
  label: 'Locked Color',
  value: '#000000',
  onChange: () => {},
  disabled: true,
});
\`\`\`

## Features

- Trigger displays a 36x36px color swatch preview alongside the hex value text.
- Dropdown panel (240px wide) contains a swatch grid and optional hex input.
- Default preset palette includes 30 colors arranged in a 10-column grid covering grays, primaries, and pastels.
- Swatch grid renders each color as a 20x20px clickable square. The selected color shows a darker border.
- Hex input field with live validation. Invalid hex values are reset to the current value on blur.
- Supports 3-digit, 6-digit, and 8-digit hex formats. Short hex values are automatically expanded (e.g., \`#f00\` becomes \`#ff0000\`).
- All output values are normalized to lowercase hex format.
- Hex input includes a small color preview square next to the text field.
- Outside click detection closes the dropdown automatically.
- Input value syncs with the \`value\` prop when it changes externally.

## Accessibility

- The hex text input has \`aria-label="Hex color value"\` for screen reader identification.
- Each swatch has a \`title\` attribute showing its hex value.
- The component is wrapped in a FormFieldWrapper for label display.
- Disabled state applies \`cursor: not-allowed\` to the trigger and all interactive elements.
`},{title:`ColorWheel`,path:`components/form/color-wheel`,content:"# ColorWheel\n\nA color picker component that renders a native color input wrapped in a styled swatch. Displays the selected color as a visual preview and optionally shows the hex value below.\n\n## Import\n\n```ts\nimport { ColorWheel } from '@aspect/form/color-wheel';\nimport type { ColorWheelProps } from '@aspect/form/color-wheel';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | `'#000000'` | Current color value as a hex string |\n| `onChange` | `(color: string) => void` | `undefined` | Called when the color changes |\n| `size` | `number` | `32` | Swatch size in pixels |\n| `showLabel` | `boolean` | `true` | Whether to show the hex label below the swatch |\n| `disabled` | `boolean` | `false` | Disabled state |\n| `label` | `string` | `undefined` | Label text displayed above the color input via FormFieldWrapper |\n| `id` | `string` | auto-generated | HTML id for the input element |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ColorWheel } from '@aspect/form/color-wheel';\n\n// Basic color picker\nconst picker = createElement(ColorWheel, {\n  value: '#3b82f6',\n  onChange: (color) => console.log('Selected:', color),\n});\n\n// With label and larger swatch\nconst labeled = createElement(ColorWheel, {\n  label: 'Background Color',\n  value: currentColor,\n  onChange: setColor,\n  size: 48,\n});\n\n// Without hex label\nconst minimal = createElement(ColorWheel, {\n  value: '#ef4444',\n  onChange: handleColorChange,\n  showLabel: false,\n});\n\n// Disabled state\nconst disabled = createElement(ColorWheel, {\n  value: '#cccccc',\n  disabled: true,\n});\n```\n\n## Features\n\n- Renders a native `<input type=\"color\">` inside a styled swatch container for a consistent visual appearance.\n- The swatch background updates in real time to reflect the selected color.\n- Hex color value is displayed below the swatch in monospace font when `showLabel` is enabled.\n- Wraps content in a `FormFieldWrapper` for consistent label rendering.\n- Generates a unique `id` via `useId` when none is provided, ensuring label-input association.\n\n## Accessibility\n\n- The hidden color input receives an `aria-label` set to the `label` prop value, or `'Color'` as a fallback.\n- The `label` prop is rendered via `FormFieldWrapper` with a proper `htmlFor` association to the input.\n- Disabled state applies `cursor: not-allowed` to both the swatch and the input.\n"},{title:`DatePicker`,path:`components/form/datepicker`,content:"# DatePicker\n\nCalendar dropdown date picker. Features month/year navigation, a day grid, today highlight, selected date highlight, and min/max date constraints.\n\n## Import\n\n```ts\nimport { DatePicker } from '@aspect/form/datepicker';\nimport type { DatePickerProps } from '@aspect/form/datepicker';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `Date \\| string \\| null` | required | Current value as a Date object or `'YYYY-MM-DD'` string |\n| `onChange` | `(value: string) => void` | required | Change handler. Receives an ISO date string (`YYYY-MM-DD`) |\n| `format` | `string` | `'YYYY-MM-DD'` | Display format for the trigger text. Supports `YYYY`, `MM`, `DD` tokens |\n| `minDate` | `Date \\| string` | `undefined` | Earliest selectable date |\n| `maxDate` | `Date \\| string` | `undefined` | Latest selectable date |\n| `disabled` | `boolean` | `false` | Disabled state |\n| `placeholder` | `string` | `'Select date...'` | Placeholder text when no date is selected |\n| `label` | `string` | `undefined` | Label text |\n| `error` | `string` | `undefined` | Error message |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { DatePicker } from '@aspect/form/datepicker';\n\n// Basic date picker\nconst basic = createElement(DatePicker, {\n  label: 'Start Date',\n  value: startDate,\n  onChange: (val) => setStartDate(val),\n});\n\n// With min/max constraints\nconst constrained = createElement(DatePicker, {\n  label: 'Appointment',\n  value: appointment,\n  onChange: (val) => setAppointment(val),\n  minDate: '2024-01-01',\n  maxDate: '2024-12-31',\n  format: 'MM/DD/YYYY',\n});\n\n// With error\nconst withError = createElement(DatePicker, {\n  label: 'Due Date',\n  value: null,\n  onChange: (val) => setDueDate(val),\n  error: 'A due date is required',\n});\n```\n\n## Features\n\n- Dropdown calendar panel (280px wide) opens below the trigger on click.\n- Month/year navigation with left and right arrow buttons in the calendar header.\n- 7-column day grid with abbreviated day names (Su, Mo, Tu, We, Th, Fr, Sa).\n- Today is highlighted with a bold font weight and blue border.\n- Selected date is highlighted with a blue background and white text.\n- Dates outside the min/max range are grayed out and cannot be selected.\n- Configurable display format using `YYYY`, `MM`, and `DD` tokens.\n- Calendar icon displayed in the trigger alongside the formatted date or placeholder.\n- Outside click detection closes the dropdown automatically.\n- The view month/year initializes to the selected date, or the current date if no selection.\n\n## Accessibility\n\n- The trigger uses `role=\"button\"` with `aria-label=\"Pick a date\"`.\n- The trigger is keyboard-focusable via `tabIndex`.\n- Out-of-range dates use `cursor: not-allowed` as a visual indicator.\n- The component is wrapped in a FormFieldWrapper for label and error display, with error messages using `role=\"alert\"`.\n"},{title:`FileUpload`,path:`components/form/file-upload`,content:`# FileUpload

File upload component with drag-and-drop support. Features a drop zone with drag-over highlight, file list display with remove buttons, and file size validation.

## Import

\`\`\`ts
import { FileUpload } from '@aspect/form/file-upload';
import type { FileUploadProps } from '@aspect/form/file-upload';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`onChange\` | \`(files: File[]) => void\` | required | Change handler. Receives the current array of selected files |
| \`accept\` | \`string\` | \`undefined\` | Accepted file types (e.g., \`'image/*,.pdf'\`) |
| \`multiple\` | \`boolean\` | \`false\` | Allow multiple file selection |
| \`maxSize\` | \`number\` | \`undefined\` | Maximum file size in bytes |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`label\` | \`string\` | \`undefined\` | Label text |
| \`helpText\` | \`string\` | \`undefined\` | Help text below the component |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { FileUpload } from '@aspect/form/file-upload';

// Basic file upload
const basic = createElement(FileUpload, {
  label: 'Attachment',
  onChange: (files) => setFiles(files),
});

// Image upload with size limit
const images = createElement(FileUpload, {
  label: 'Photos',
  accept: 'image/*',
  multiple: true,
  maxSize: 5 * 1024 * 1024, // 5 MB
  onChange: (files) => setPhotos(files),
  helpText: 'Upload one or more images',
});

// Single PDF upload
const pdf = createElement(FileUpload, {
  label: 'Document',
  accept: '.pdf',
  maxSize: 10 * 1024 * 1024, // 10 MB
  onChange: (files) => setDocument(files),
});
\`\`\`

## Features

- Drag-and-drop zone with a dashed border and centered upload icon and text.
- Drag-over state highlights the zone with a blue border and light blue background.
- Click-to-browse triggers a hidden file input for standard file picker dialog.
- File size validation with configurable \`maxSize\`. Files exceeding the limit produce an error message with a human-readable size display.
- Human-readable file size formatting (B, KB, MB, GB).
- File list displayed below the drop zone with file name, size, and a remove button for each file.
- Multiple mode appends new files to the existing list. Single mode replaces the file.
- The hidden file input is reset after each selection so the same file can be re-selected.
- Accepted file types are displayed as secondary text in the drop zone.
- Max size constraint is displayed as secondary text in the drop zone.
- Error state changes the drop zone border to red.

## Accessibility

- The drop zone uses \`role="button"\` with \`aria-label="Upload files"\`.
- The drop zone is keyboard-focusable via \`tabIndex\`.
- Each file's remove button has \`aria-label="Remove {filename}"\` for screen reader identification.
- The hidden file input has \`tabIndex: -1\` to keep it out of the tab order.
- The component is wrapped in a FormFieldWrapper for label, help text, and error display.
- Error messages use \`role="alert"\` via the wrapper.
`},{title:`MultilineField`,path:`components/form/multiline`,content:"# MultilineField\n\nMulti-line textarea input with integrated FormFieldWrapper. Supports auto-resize, character counting, and configurable row height.\n\n## Import\n\n```ts\nimport { MultilineField } from '@aspect/form/multiline';\nimport type { MultilineFieldProps } from '@aspect/form/multiline';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | `undefined` | Current value (controlled mode) |\n| `defaultValue` | `string` | `undefined` | Default value (uncontrolled mode) |\n| `onChange` | `(value: string) => void` | `undefined` | Change handler |\n| `onBlur` | `(value: string) => void` | `undefined` | Blur handler |\n| `placeholder` | `string` | `undefined` | Placeholder text |\n| `name` | `string` | `undefined` | HTML name attribute |\n| `id` | `string` | auto-generated | HTML id |\n| `rows` | `number` | `4` | Number of visible text rows |\n| `maxLength` | `number` | `undefined` | Maximum character length |\n| `autoResize` | `boolean` | `false` | Auto-resize the textarea to fit content |\n| `minHeight` | `string` | `undefined` | Minimum height when auto-resizing |\n| `maxHeight` | `string` | `undefined` | Maximum height when auto-resizing |\n| `readOnly` | `boolean` | `undefined` | Read-only state |\n| `disabled` | `boolean` | `undefined` | Disabled state |\n| `showCount` | `boolean` | `false` | Show character count below the textarea |\n| `label` | `string` | `undefined` | Label text |\n| `helpText` | `string` | `undefined` | Help text below the field |\n| `error` | `string` | `undefined` | Error message. Activates error styling |\n| `required` | `boolean` | `undefined` | Shows required asterisk |\n| `wrapperStyle` | `FormFieldWrapperStyle` | `undefined` | Styling for the FormFieldWrapper |\n| `inputStyle` | `InputBaseStyle` | `undefined` | Styling for the textarea element |\n| `className` | `string` | `undefined` | Extra CSS class on the textarea |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { MultilineField } from '@aspect/form/multiline';\n\n// Basic textarea\nconst bio = createElement(MultilineField, {\n  label: 'Bio',\n  placeholder: 'Tell us about yourself...',\n  rows: 5,\n  value: bio,\n  onChange: (val) => setBio(val),\n});\n\n// With character count and max length\nconst comment = createElement(MultilineField, {\n  label: 'Comment',\n  maxLength: 500,\n  showCount: true,\n  value: comment,\n  onChange: (val) => setComment(val),\n});\n\n// Auto-resizing textarea\nconst notes = createElement(MultilineField, {\n  label: 'Notes',\n  autoResize: true,\n  minHeight: '100px',\n  maxHeight: '400px',\n  value: notes,\n  onChange: (val) => setNotes(val),\n});\n```\n\n## Features\n\n- Wraps a native `<textarea>` element inside a FormFieldWrapper.\n- Configurable visible rows with the `rows` prop (default: 4).\n- Auto-resize mode dynamically adjusts height to fit content, with optional min/max height constraints. Disables manual vertical resize when active.\n- Character counter displayed below the textarea when `showCount` is enabled. Shows \"N/maxLength\" when `maxLength` is set, or \"N characters\" otherwise.\n- Counter text turns red when the character count exceeds 90% of the maximum length.\n- Focus state tracking with border color and box-shadow transitions.\n- Line height set to 1.5 for comfortable multi-line reading.\n\n## Accessibility\n\n- The label is linked to the textarea via `htmlFor`/`id` association.\n- `aria-invalid=\"true\"` is set when an error message is present.\n- `aria-required=\"true\"` is set when the field is marked as required.\n- The textarea is natively focusable and supports standard keyboard interaction.\n- Error messages in the wrapper use `role=\"alert\"`.\n"},{title:`NumberSpinner`,path:`components/form/number-spinner`,content:`# NumberSpinner

Numeric input with increment and decrement buttons. Features +/- buttons on either side of the input, keyboard arrow support, optional prefix/suffix, and min/max value clamping.

## Import

\`\`\`ts
import { NumberSpinner } from '@aspect/form/number-spinner';
import type { NumberSpinnerProps } from '@aspect/form/number-spinner';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`number\` | required | Current numeric value |
| \`onChange\` | \`(value: number) => void\` | required | Change handler |
| \`min\` | \`number\` | \`undefined\` | Minimum allowed value |
| \`max\` | \`number\` | \`undefined\` | Maximum allowed value |
| \`step\` | \`number\` | \`1\` | Step increment for the buttons and keyboard arrows |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`prefix\` | \`string\` | \`undefined\` | Prefix text displayed before the input (e.g., \`'$'\`) |
| \`suffix\` | \`string\` | \`undefined\` | Suffix text displayed after the input (e.g., \`'kg'\`) |
| \`label\` | \`string\` | \`undefined\` | Label text |
| \`error\` | \`string\` | \`undefined\` | Error message |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { NumberSpinner } from '@aspect/form/number-spinner';

// Basic number spinner
const basic = createElement(NumberSpinner, {
  label: 'Quantity',
  value: quantity,
  onChange: (val) => setQuantity(val),
  min: 0,
  max: 99,
});

// With prefix and suffix
const weight = createElement(NumberSpinner, {
  label: 'Weight',
  value: weight,
  onChange: (val) => setWeight(val),
  min: 0,
  step: 0.5,
  suffix: 'kg',
});

// Currency input
const price = createElement(NumberSpinner, {
  label: 'Price',
  value: price,
  onChange: (val) => setPrice(val),
  min: 0,
  step: 0.01,
  prefix: '$',
});
\`\`\`

## Features

- Decrement (-) button on the left and increment (+) button on the right, flanking the text input.
- Buttons automatically disable when the value reaches the min or max boundary. Disabled buttons show grayed-out text and \`not-allowed\` cursor.
- Direct text input for manual numeric entry with \`parseFloat\` parsing and min/max clamping.
- Keyboard support: ArrowUp increments, ArrowDown decrements by the step value.
- Optional prefix and suffix text displayed in styled affix areas between the buttons and the input.
- Focus state shows a blue border with a subtle box-shadow ring on the container.
- Error state changes the container border to red.
- Values are clamped to the min/max range on every change (button click, keyboard, or text input).
- The input field is center-aligned with a minimum width of 48px.
- Disabled state reduces opacity to 0.6 and disables all interactive elements.

## Accessibility

- The input uses \`role="spinbutton"\` to identify the component as a numeric spinner.
- \`aria-valuenow\` reflects the current value.
- \`aria-valuemin\` and \`aria-valuemax\` are set when min/max props are provided.
- \`aria-label\` is set to the label text, or falls back to "Number".
- Decrement and increment buttons have \`aria-label\` values of "Decrement" and "Increment" respectively.
- Buttons have \`tabIndex: -1\` to keep them out of the tab order, directing keyboard focus to the input.
- The component is wrapped in a FormFieldWrapper for label and error display.
`},{title:`RadioGroup`,path:`components/form/radio`,content:`# RadioGroup

Radio button group component. Wraps individual radio buttons with support for horizontal and vertical layout, keyboard navigation, and error states.

## Import

\`\`\`ts
import { RadioGroup } from '@aspect/form/radio';
import type { RadioGroupProps, RadioOption } from '@aspect/form/radio';
\`\`\`

## Props

### RadioGroupProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`options\` | \`RadioOption[]\` | required | Available options |
| \`value\` | \`string\` | required | Currently selected value |
| \`onChange\` | \`(value: string) => void\` | required | Change handler |
| \`name\` | \`string\` | required | HTML name attribute for the radio group |
| \`direction\` | \`'horizontal' \\| 'vertical'\` | \`'vertical'\` | Layout direction |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state for the entire group |
| \`error\` | \`string\` | \`undefined\` | Error message |
| \`label\` | \`string\` | \`undefined\` | Label for the group |

### RadioOption

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`string\` | required | Option value |
| \`label\` | \`string\` | required | Display label |
| \`disabled\` | \`boolean\` | \`undefined\` | Whether this individual option is disabled |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { RadioGroup } from '@aspect/form/radio';

// Vertical radio group
const vertical = createElement(RadioGroup, {
  label: 'Plan',
  name: 'plan',
  options: [
    { value: 'free', label: 'Free' },
    { value: 'pro', label: 'Pro' },
    { value: 'enterprise', label: 'Enterprise' },
  ],
  value: plan,
  onChange: (val) => setPlan(val),
});

// Horizontal layout with disabled option
const horizontal = createElement(RadioGroup, {
  label: 'Priority',
  name: 'priority',
  direction: 'horizontal',
  options: [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'critical', label: 'Critical', disabled: true },
  ],
  value: priority,
  onChange: (val) => setPriority(val),
});
\`\`\`

## Features

- Horizontal and vertical layout options. Horizontal uses 16px gap, vertical uses 8px gap.
- Custom styled radio buttons with an outer circle (18px) and animated inner dot (8px) that scales in/out on selection.
- Individual options can be independently disabled while the rest remain interactive.
- Hidden native \`<input type="radio">\` elements for form compatibility.
- Error state changes the outer circle border to red for all options.
- Arrow key navigation wraps around at the boundaries of enabled options.
- Smooth CSS transitions on border color and inner dot scale.

## Accessibility

- The group container uses \`role="radiogroup"\` with \`aria-label\` set to the label text.
- The group is keyboard-focusable via \`tabIndex\`.
- Arrow keys (Up/Down/Left/Right) navigate between enabled options, wrapping at boundaries.
- Each radio button renders a hidden native \`<input type="radio">\` with the shared \`name\` attribute for form submission.
- Disabled options have \`opacity: 0.5\` and \`cursor: not-allowed\` for clear visual distinction.
`},{title:`Select`,path:`components/form/select`,content:"# Select\n\nCustom dropdown select/combobox component. Renders a styled dropdown (not a native `<select>`) with support for search filtering, multiple selection, option grouping, keyboard navigation, and clearable selections.\n\n## Import\n\n```ts\nimport { Select } from '@aspect/form/select';\nimport type { SelectProps, SelectOption } from '@aspect/form/select';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `options` | `SelectOption[]` | required | Available options |\n| `value` | `string \\| string[]` | required | Current selected value. String for single select, array for multiple |\n| `onChange` | `(value: string \\| string[]) => void` | required | Change handler |\n| `placeholder` | `string` | `'Select...'` | Placeholder text shown when nothing is selected |\n| `searchable` | `boolean` | `false` | Enable search/filter by typing |\n| `multiple` | `boolean` | `false` | Allow multiple selection |\n| `clearable` | `boolean` | `false` | Show a clear button to reset the selection |\n| `disabled` | `boolean` | `false` | Disabled state |\n| `error` | `string` | `undefined` | Error message |\n| `label` | `string` | `undefined` | Label text |\n| `helpText` | `string` | `undefined` | Help text below the field |\n\n### SelectOption\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | required | Option value |\n| `label` | `string` | required | Display label |\n| `disabled` | `boolean` | `undefined` | Whether this option is disabled |\n| `group` | `string` | `undefined` | Group name. Options with the same group are displayed under a group header |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Select } from '@aspect/form/select';\n\n// Basic single select\nconst basic = createElement(Select, {\n  label: 'Country',\n  options: [\n    { value: 'us', label: 'United States' },\n    { value: 'ca', label: 'Canada' },\n    { value: 'uk', label: 'United Kingdom' },\n  ],\n  value: selected,\n  onChange: (val) => setSelected(val),\n  placeholder: 'Choose a country',\n});\n\n// Searchable multi-select with groups\nconst multi = createElement(Select, {\n  label: 'Tags',\n  options: [\n    { value: 'bug', label: 'Bug', group: 'Type' },\n    { value: 'feature', label: 'Feature', group: 'Type' },\n    { value: 'high', label: 'High', group: 'Priority' },\n    { value: 'low', label: 'Low', group: 'Priority' },\n  ],\n  value: selectedTags,\n  onChange: (vals) => setSelectedTags(vals),\n  searchable: true,\n  multiple: true,\n  clearable: true,\n});\n```\n\n## Features\n\n- Custom dropdown trigger with chevron indicator that rotates when open.\n- Option grouping with uppercase group headers rendered inline.\n- Search/filter input displayed at the top of the dropdown when `searchable` is enabled. Filters options by case-insensitive label match.\n- Multiple selection mode with checkmark indicators on selected options.\n- Clearable selection with an \"X\" button in the trigger area.\n- Keyboard navigation: Arrow keys move focus through options, Enter selects, Escape closes the dropdown, Space/Enter/ArrowDown open it.\n- Outside click detection closes the dropdown automatically.\n- Selected value display with comma-separated labels for multi-select, and text truncation with ellipsis for overflow.\n- Dropdown panel with max height of 240px and scroll overflow.\n- \"No options\" placeholder when the filtered list is empty.\n\n## Accessibility\n\n- The trigger uses `role=\"combobox\"` with `aria-expanded` and `aria-haspopup=\"listbox\"`.\n- The dropdown panel uses `role=\"listbox\"`.\n- Each option uses `role=\"option\"` with `aria-selected` and `aria-disabled`.\n- The clear button has `role=\"button\"` with `aria-label=\"Clear selection\"`.\n- The trigger is focusable via `tabIndex` and supports full keyboard navigation.\n- Disabled options are styled distinctly and cannot be selected.\n"},{title:`Slider`,path:`components/form/slider`,content:"# Slider\n\nCustom range slider with support for single and dual handles (range mode), marks/ticks, and value display labels.\n\n## Import\n\n```ts\nimport { Slider } from '@aspect/form/slider';\nimport type { SliderProps, SliderMark } from '@aspect/form/slider';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `number \\| [number, number]` | required | Current value. Number for single mode, tuple for range mode |\n| `onChange` | `(value: number \\| [number, number]) => void` | required | Change handler |\n| `min` | `number` | `0` | Minimum value |\n| `max` | `number` | `100` | Maximum value |\n| `step` | `number` | `1` | Step increment |\n| `showValue` | `boolean` | `false` | Show current value label above the thumb |\n| `showTicks` | `boolean` | `false` | Show tick marks at each step along the track |\n| `disabled` | `boolean` | `false` | Disabled state |\n| `marks` | `SliderMark[]` | `undefined` | Named marks along the track |\n| `range` | `boolean` | `false` | Enable range mode with dual handles |\n| `label` | `string` | `undefined` | Label text |\n| `error` | `string` | `undefined` | Error message |\n\n### SliderMark\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `value` | `number` | Position value along the slider |\n| `label` | `string` | Text label displayed below the mark |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Slider } from '@aspect/form/slider';\n\n// Basic slider\nconst basic = createElement(Slider, {\n  label: 'Volume',\n  value: volume,\n  onChange: (val) => setVolume(val),\n  min: 0,\n  max: 100,\n});\n\n// Range slider with value labels\nconst priceRange = createElement(Slider, {\n  label: 'Price Range',\n  value: [minPrice, maxPrice],\n  onChange: (val) => setPriceRange(val),\n  range: true,\n  min: 0,\n  max: 1000,\n  step: 50,\n  showValue: true,\n});\n\n// Slider with marks\nconst temperature = createElement(Slider, {\n  label: 'Temperature',\n  value: temp,\n  onChange: (val) => setTemp(val),\n  min: 0,\n  max: 100,\n  marks: [\n    { value: 0, label: 'Cold' },\n    { value: 50, label: 'Warm' },\n    { value: 100, label: 'Hot' },\n  ],\n  showTicks: true,\n  step: 10,\n});\n```\n\n## Features\n\n- Single handle mode for selecting a single value, or dual handle range mode for selecting a value interval.\n- Mouse drag interaction on thumb handles with global mousemove/mouseup listeners for smooth dragging.\n- Click-on-track support that moves the nearest handle to the clicked position.\n- Value snapping to step increments with min/max clamping.\n- Value tooltip labels displayed above thumbs when `showValue` is enabled (dark background pill).\n- Tick marks rendered at each step position when `showTicks` is enabled.\n- Named marks with text labels positioned below the track.\n- Blue fill bar indicates the selected range between min and the current value (or between the two handles in range mode).\n- Disabled state grays out the fill bar and thumb borders, reduces opacity to 0.6.\n- Keyboard support with Arrow keys for single mode: Left/Down decrements, Right/Up increments by step.\n\n## Accessibility\n\n- Each thumb uses `role=\"slider\"` with `aria-valuenow`, `aria-valuemin`, and `aria-valuemax`.\n- Thumbs are keyboard-focusable via `tabIndex` and respond to arrow key input.\n- Disabled thumbs have `tabIndex: -1` to remove them from the tab order.\n- The track uses a pointer cursor (or `not-allowed` when disabled) to indicate interactivity.\n"},{title:`TextEditor`,path:`components/form/texteditor`,content:"# TextEditor\n\nSimple WYSIWYG rich text editor using `contentEditable`. Provides a toolbar with basic formatting commands (bold, italic, underline, lists, headings, links) and a contentEditable editing area. Zero dependencies -- uses `document.execCommand` for formatting.\n\n## Import\n\n```ts\nimport { TextEditor } from '@aspect/form/texteditor';\nimport type { TextEditorProps, ToolbarButton } from '@aspect/form/texteditor';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | `undefined` | Initial HTML content |\n| `onChange` | `(html: string) => void` | `undefined` | Change handler. Receives the HTML string |\n| `onBlur` | `(html: string) => void` | `undefined` | Blur handler |\n| `placeholder` | `string` | `''` | Placeholder text (via `data-placeholder` attribute) |\n| `minHeight` | `string` | `'200px'` | Minimum height of the editing area |\n| `maxHeight` | `string` | `'none'` | Maximum height (grows to fit by default) |\n| `readOnly` | `boolean` | `undefined` | Read-only mode. Disables toolbar and editing |\n| `disabled` | `boolean` | `undefined` | Disabled state. Sets `contentEditable` to false |\n| `toolbar` | `ToolbarButton[]` | all buttons | Which toolbar buttons to display |\n| `id` | `string` | auto-generated | HTML id for the editor area |\n| `toolbarStyle` | `object` | `undefined` | Toolbar styling overrides (see below) |\n| `editorStyle` | `object` | `undefined` | Editor area styling overrides (see below) |\n| `label` | `string` | `undefined` | Label text |\n| `helpText` | `string` | `undefined` | Help text below the editor |\n| `error` | `string` | `undefined` | Error message. Activates error styling |\n| `required` | `boolean` | `undefined` | Shows required asterisk |\n| `wrapperStyle` | `FormFieldWrapperStyle` | `undefined` | Styling for the FormFieldWrapper |\n\n### ToolbarButton\n\nAvailable toolbar button identifiers:\n\n`'bold'` | `'italic'` | `'underline'` | `'strikethrough'` | `'heading1'` | `'heading2'` | `'heading3'` | `'bulletList'` | `'orderedList'` | `'blockquote'` | `'link'` | `'unlink'` | `'insertHR'` | `'removeFormat'` | `'undo'` | `'redo'`\n\n### toolbarStyle\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `backgroundColor` | `string` | `'#f9fafb'` | Toolbar background color |\n| `borderBottom` | `string` | `'1px solid #e5e7eb'` | Bottom border of toolbar |\n| `buttonColor` | `string` | `'#374151'` | Toolbar button text color |\n| `buttonHoverBackground` | `string` | `undefined` | Button hover background |\n| `buttonActiveBackground` | `string` | `undefined` | Button active background |\n| `buttonSize` | `string` | `'13px'` | Toolbar button font size |\n\n### editorStyle\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `padding` | `string` | `'12px 14px'` | Editor area padding |\n| `backgroundColor` | `string` | `'#ffffff'` | Editor background |\n| `color` | `string` | `'#1f2937'` | Editor text color |\n| `fontFamily` | `string` | `'inherit'` | Editor font family |\n| `fontSize` | `string` | `'14px'` | Editor font size |\n| `lineHeight` | `string` | `'1.6'` | Editor line height |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { TextEditor } from '@aspect/form/texteditor';\n\n// Basic rich text editor\nconst editor = createElement(TextEditor, {\n  label: 'Description',\n  value: '<p>Initial content</p>',\n  onChange: (html) => setContent(html),\n  placeholder: 'Start writing...',\n});\n\n// With limited toolbar\nconst simpleEditor = createElement(TextEditor, {\n  label: 'Comment',\n  toolbar: ['bold', 'italic', 'bulletList', 'link'],\n  minHeight: '120px',\n  maxHeight: '300px',\n  onChange: (html) => setComment(html),\n});\n\n// Read-only display\nconst readOnly = createElement(TextEditor, {\n  label: 'Preview',\n  value: savedHtml,\n  readOnly: true,\n});\n```\n\n## Features\n\n- Configurable toolbar with 16 formatting commands including bold, italic, underline, strikethrough, headings (H1-H3), bullet and ordered lists, blockquote, link/unlink, horizontal rule, clear formatting, undo, and redo.\n- Link insertion prompts the user for a URL via `prompt()`.\n- Toolbar and editor area are rendered inside a unified bordered container with rounded corners.\n- Focus state changes the container border color to blue; error state uses red.\n- Initial content is set via `innerHTML` on mount when the `value` prop is provided.\n- Customizable toolbar and editor area styling via separate style prop objects.\n- Scrollable editing area with configurable min/max height.\n\n## Accessibility\n\n- The editing area uses `role=\"textbox\"` and `aria-multiline=\"true\"` for screen reader identification.\n- `aria-label` is set to the label prop value, or falls back to \"Text editor\".\n- The `data-placeholder` attribute provides placeholder text guidance.\n- Toolbar buttons have descriptive `title` attributes for tooltip display.\n- Toolbar buttons are disabled in read-only and disabled states, with `cursor: not-allowed`.\n- `contentEditable` is set to `'false'` when the component is disabled.\n"},{title:`TextField`,path:`components/form/textfield`,content:"# TextField\n\nSingle-line text input with integrated FormFieldWrapper for label, help text, and error display. Supports prefix/suffix addons, multiple input types, and controlled/uncontrolled usage.\n\n## Import\n\n```ts\nimport { TextField } from '@aspect/form/textfield';\nimport type { TextFieldProps } from '@aspect/form/textfield';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `string` | `undefined` | Current value (controlled mode) |\n| `defaultValue` | `string` | `undefined` | Default value (uncontrolled mode) |\n| `onChange` | `(value: string) => void` | `undefined` | Change handler fired on every input event |\n| `onInput` | `(value: string) => void` | `undefined` | Input event handler (fires on every keystroke) |\n| `onBlur` | `(value: string) => void` | `undefined` | Blur handler |\n| `onEnter` | `(value: string) => void` | `undefined` | Enter key handler |\n| `placeholder` | `string` | `undefined` | Placeholder text |\n| `type` | `'text' \\| 'password' \\| 'email' \\| 'url' \\| 'tel' \\| 'search' \\| 'number'` | `'text'` | HTML input type |\n| `name` | `string` | `undefined` | HTML name attribute |\n| `id` | `string` | auto-generated | HTML id |\n| `maxLength` | `number` | `undefined` | Maximum character length |\n| `pattern` | `string` | `undefined` | Validation pattern |\n| `autoComplete` | `string` | `undefined` | Auto-complete hint |\n| `autoFocus` | `boolean` | `undefined` | Autofocus on mount |\n| `readOnly` | `boolean` | `undefined` | Read-only state |\n| `disabled` | `boolean` | `undefined` | Disabled state |\n| `prefix` | `unknown` | `undefined` | Prefix element (icon, text) rendered before the input |\n| `suffix` | `unknown` | `undefined` | Suffix element (icon, button) rendered after the input |\n| `label` | `string` | `undefined` | Label text |\n| `helpText` | `string` | `undefined` | Help text below the field |\n| `error` | `string` | `undefined` | Error message. Activates error styling |\n| `required` | `boolean` | `undefined` | Shows required asterisk |\n| `wrapperStyle` | `FormFieldWrapperStyle` | `undefined` | Styling for the FormFieldWrapper |\n| `inputStyle` | `InputBaseStyle` | `undefined` | Styling for the input element |\n| `className` | `string` | `undefined` | Extra CSS class on the input |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { TextField } from '@aspect/form/textfield';\n\n// Basic text field\nconst basic = createElement(TextField, {\n  label: 'Name',\n  placeholder: 'Enter your name',\n  value: name,\n  onChange: (val) => setName(val),\n});\n\n// Email field with validation error\nconst email = createElement(TextField, {\n  label: 'Email',\n  type: 'email',\n  placeholder: 'you@example.com',\n  value: email,\n  onChange: (val) => setEmail(val),\n  error: !isValidEmail ? 'Invalid email address' : undefined,\n  required: true,\n});\n\n// With prefix and suffix\nconst price = createElement(TextField, {\n  label: 'Price',\n  type: 'number',\n  prefix: '$',\n  suffix: 'USD',\n  value: price,\n  onChange: (val) => setPrice(val),\n});\n\n// With Enter key handler\nconst search = createElement(TextField, {\n  type: 'search',\n  placeholder: 'Search...',\n  onEnter: (val) => performSearch(val),\n});\n```\n\n## Features\n\n- Wraps a native `<input>` element inside a FormFieldWrapper for consistent label, help text, and error display.\n- Supports seven input types: text, password, email, url, tel, search, and number.\n- Prefix and suffix addon slots with automatic flex layout when either is provided.\n- Focus state tracking with border color and box-shadow transitions via `buildInputStyle`.\n- Enter key handler (`onEnter`) for search and submit use cases.\n- Auto-generated unique `id` when none is provided, ensuring label-input association.\n- Controlled and uncontrolled usage patterns.\n\n## Accessibility\n\n- The label is linked to the input via `htmlFor`/`id` association.\n- `aria-invalid=\"true\"` is set when an error message is present.\n- `aria-required=\"true\"` is set when the field is marked as required.\n- The input is natively focusable and supports keyboard interaction.\n- Error messages in the wrapper use `role=\"alert\"` for screen reader announcements.\n"},{title:`TimePicker`,path:`components/form/timepicker`,content:`# TimePicker

Time selection component with hour and minute spinners. Supports both 12-hour (AM/PM) and 24-hour formats with configurable minute step increments.

## Import

\`\`\`ts
import { TimePicker } from '@aspect/form/timepicker';
import type { TimePickerProps } from '@aspect/form/timepicker';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`value\` | \`string\` | required | Current value in \`'HH:MM'\` format (24-hour) |
| \`onChange\` | \`(value: string) => void\` | required | Change handler. Receives \`'HH:MM'\` string in 24-hour format |
| \`format\` | \`'12h' \\| '24h'\` | \`'24h'\` | Display format |
| \`minuteStep\` | \`number\` | \`1\` | Minute increment step for the up/down buttons |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`label\` | \`string\` | \`undefined\` | Label text |
| \`error\` | \`string\` | \`undefined\` | Error message |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { TimePicker } from '@aspect/form/timepicker';

// 24-hour time picker
const time24 = createElement(TimePicker, {
  label: 'Meeting Time',
  value: '14:30',
  onChange: (val) => setTime(val),
});

// 12-hour format with 15-minute steps
const time12 = createElement(TimePicker, {
  label: 'Alarm',
  value: '08:00',
  onChange: (val) => setAlarm(val),
  format: '12h',
  minuteStep: 15,
});

// Disabled
const disabled = createElement(TimePicker, {
  label: 'Locked Time',
  value: '09:00',
  onChange: () => {},
  disabled: true,
});
\`\`\`

## Features

- Dual spinner layout with hour and minute fields separated by a colon.
- Each spinner has up/down arrow buttons for incrementing and decrementing values.
- Direct text input in the hour and minute fields for manual entry.
- 12-hour format mode displays an AM/PM toggle button alongside the spinners.
- AM/PM toggle shifts the hour by 12 internally while the \`onChange\` handler always receives 24-hour format.
- Hours are clamped to the 0-23 range; minutes are clamped to 0-59.
- Values are zero-padded to two digits in both the display and the output.
- Configurable minute step for the increment/decrement buttons (e.g., step by 5 or 15).
- Focus state tracking with border color and box-shadow transitions on the container.
- Monospace font for the time inputs for consistent digit alignment.

## Accessibility

- Hour and minute inputs have \`aria-label\` attributes ("Hour" and "Minute" respectively).
- The AM/PM toggle button has \`aria-label="Toggle AM/PM"\`.
- Up/down arrow buttons are standard \`<button>\` elements with clear visual indicators.
- Inputs are disabled when the component is in disabled state.
- The component is wrapped in a FormFieldWrapper for label and error display.
`},{title:`Toggle`,path:`components/form/toggle`,content:`# Toggle

Toggle/switch component with a sliding pill animation. Provides an on/off control with configurable size, color, and label positioning.

## Import

\`\`\`ts
import { Toggle } from '@aspect/form/toggle';
import type { ToggleProps } from '@aspect/form/toggle';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`checked\` | \`boolean\` | required | Whether the toggle is on |
| \`onChange\` | \`(checked: boolean) => void\` | required | Change handler |
| \`label\` | \`string\` | \`undefined\` | Label text |
| \`labelPosition\` | \`'left' \\| 'right'\` | \`'right'\` | Label position relative to the toggle |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size variant |
| \`onColor\` | \`string\` | \`'#3b82f6'\` | Track color when on |
| \`offColor\` | \`string\` | \`'#d1d5db'\` | Track color when off |

### Size dimensions

| Size | Track Width | Track Height | Thumb Size |
|------|-------------|--------------|------------|
| \`sm\` | 32px | 18px | 14px |
| \`md\` | 44px | 24px | 20px |
| \`lg\` | 56px | 30px | 26px |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Toggle } from '@aspect/form/toggle';

// Basic toggle
const basic = createElement(Toggle, {
  label: 'Enable notifications',
  checked: enabled,
  onChange: (val) => setEnabled(val),
});

// Custom colors and size
const custom = createElement(Toggle, {
  label: 'Dark mode',
  checked: darkMode,
  onChange: (val) => setDarkMode(val),
  size: 'lg',
  onColor: '#10b981',
  offColor: '#9ca3af',
  labelPosition: 'left',
});

// Disabled toggle
const disabled = createElement(Toggle, {
  label: 'Feature locked',
  checked: false,
  onChange: () => {},
  disabled: true,
});
\`\`\`

## Features

- Three size variants (sm, md, lg) controlling track and thumb dimensions.
- Animated thumb slide with a 200ms CSS transition on \`left\` position.
- Track color animates between configurable on and off colors with a 200ms transition.
- Thumb rendered as a white circle with a subtle drop shadow.
- Label can be positioned to the left or right of the toggle track.
- Disabled state reduces opacity to 0.5 and changes cursor to \`not-allowed\`.
- Click and keyboard (Space, Enter) toggle the checked state.

## Accessibility

- The container uses \`role="switch"\` to identify the component as a toggle switch.
- \`aria-checked\` reflects the current on/off state.
- \`aria-disabled\` is set when the toggle is disabled.
- \`aria-label\` is set to the label text for screen reader identification.
- The component is keyboard-focusable via \`tabIndex\` and responds to Space and Enter key presses.
`},{title:`FormFieldWrapper`,path:`components/form/wrapper`,content:"# FormFieldWrapper\n\nBase container for all form components. Provides consistent label rendering, help text, error display, required indicator, and styling. Used as the foundation for TextField, MultilineField, TextEditor, and other form controls.\n\n## Import\n\n```ts\nimport { FormFieldWrapper, buildInputStyle } from '@aspect/form/wrapper';\nimport type { FormFieldWrapperProps, FormFieldWrapperStyle, InputBaseStyle } from '@aspect/form/wrapper';\n```\n\n## Props\n\n### FormFieldWrapperProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `label` | `string` | `undefined` | Label text displayed above the field |\n| `htmlFor` | `string` | `undefined` | HTML `id` to link the label to an input via `htmlFor` |\n| `helpText` | `string` | `undefined` | Help or description text shown below the field |\n| `error` | `string` | `undefined` | Error message. When set, the field enters an error state |\n| `required` | `boolean` | `false` | Shows a required asterisk next to the label |\n| `disabled` | `boolean` | `false` | Disabled state. Reduces container opacity to 0.6 |\n| `styling` | `FormFieldWrapperStyle` | `undefined` | Style overrides for the wrapper |\n| `className` | `string` | `undefined` | Extra CSS class appended to the container |\n| `children` | `unknown` | `undefined` | The form control to render inside the wrapper |\n\n### FormFieldWrapperStyle\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `fontFamily` | `string` | `'inherit'` | Container font family |\n| `fontSize` | `string` | `'14px'` | Container font size |\n| `labelColor` | `string` | `'#374151'` | Label text color |\n| `labelFontWeight` | `string` | `'500'` | Label font weight |\n| `labelFontSize` | `string` | `'14px'` | Label font size |\n| `helpColor` | `string` | `'#6b7280'` | Help text color |\n| `errorColor` | `string` | `'#ef4444'` | Error text color |\n| `errorBorderColor` | `string` | `'#ef4444'` | Error border color applied to the child |\n| `focusBorderColor` | `string` | `'#3b82f6'` | Focus border color hint |\n| `gap` | `string` | `'4px'` | Gap between label, field, and help text |\n| `width` | `string \\| number` | `'100%'` | Container width. Numbers are treated as pixels |\n| `custom` | `Record<string, string>` | `undefined` | Custom CSS overrides merged into the container style |\n\n### InputBaseStyle\n\nShared input styling interface used by `buildInputStyle` for TextField, MultilineField, and TextEditor.\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `padding` | `string` | `'8px 12px'` | Input padding |\n| `border` | `string` | `'1px solid #d1d5db'` | Default border |\n| `borderRadius` | `string` | `'6px'` | Border radius |\n| `fontSize` | `string` | `'14px'` | Font size |\n| `fontFamily` | `string` | `'inherit'` | Font family |\n| `backgroundColor` | `string` | `'#ffffff'` | Background color |\n| `color` | `string` | `'#1f2937'` | Text color |\n| `focusBorderColor` | `string` | `'#3b82f6'` | Border color when focused |\n| `errorBorderColor` | `string` | `'#ef4444'` | Border color in error state |\n| `transition` | `string` | `'border-color 0.15s'` | CSS transition |\n| `custom` | `Record<string, string>` | `undefined` | Custom CSS overrides |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { FormFieldWrapper } from '@aspect/form/wrapper';\n\nconst element = createElement(\n  FormFieldWrapper,\n  {\n    label: 'Username',\n    htmlFor: 'username-input',\n    helpText: 'Enter your preferred username',\n    required: true,\n  },\n  createElement('input', { id: 'username-input', type: 'text' })\n);\n```\n\n```ts\n// With error state\nconst errorField = createElement(\n  FormFieldWrapper,\n  {\n    label: 'Email',\n    error: 'Please enter a valid email address',\n    required: true,\n  },\n  createElement('input', { type: 'email' })\n);\n```\n\n```ts\n// Using buildInputStyle for custom inputs\nimport { buildInputStyle } from '@aspect/form/wrapper';\n\nconst style = buildInputStyle(\n  { borderRadius: '8px', focusBorderColor: '#10b981' },\n  { focused: true, error: false }\n);\n```\n\n## Features\n\n- Flexbox column layout with configurable gap between label, field, and help/error text.\n- Conditional label rendering with optional required asterisk indicator.\n- Error state automatically switches help text to error message with `role=\"alert\"`.\n- Disabled state reduces opacity to 0.6 for visual feedback.\n- `buildInputStyle` utility generates consistent input styles with focus ring (box-shadow) and error border handling for use across multiple form components.\n- CSS class `form-field--error` is applied when an error is present for external styling hooks.\n- Fully customizable via the `styling` prop and `custom` overrides.\n\n## Accessibility\n\n- The `label` element uses `htmlFor` to associate with the input control.\n- Required fields display a visual asterisk indicator.\n- Error messages are rendered with `role=\"alert\"` so screen readers announce them immediately.\n- The `disabled` state applies reduced opacity as a visual cue.\n"},{title:`AnalogClock`,path:`components/data/analog-clock`,content:`# AnalogClock

A live SVG clock face with configurable format, size, date display, and timezone support. Renders hour markers, numbers, and animated clock hands that update every second.

## Import

\`\`\`ts
import { AnalogClock } from '@aspect/data/analog-clock';
import type { AnalogClockProps } from '@aspect/data/analog-clock';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`format\` | \`'12h' \\| '24h'\` | \`'12h'\` | Display format. In 24h mode, an inner ring shows 0/13-23 numbers |
| \`size\` | \`number\` | \`200\` | Clock face diameter in pixels |
| \`showDate\` | \`boolean\` | \`false\` | Show the date below the clock |
| \`dateFormat\` | \`'short' \\| 'long' \\| 'iso'\` | \`'short'\` | Date format: short (MM/DD/YYYY), long (Month DD, YYYY), or iso (YYYY-MM-DD) |
| \`showSeconds\` | \`boolean\` | \`true\` | Whether to show the second hand |
| \`timezone\` | \`string\` | \`undefined\` | IANA timezone string (e.g., \`'America/New_York'\`). Defaults to local time |
| \`className\` | \`string\` | \`undefined\` | CSS class name for the wrapper element |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { AnalogClock } from '@aspect/data/analog-clock';

// Basic clock with defaults
const clock = createElement(AnalogClock, {});

// Large 24-hour clock with date
const clock24 = createElement(AnalogClock, {
  format: '24h',
  size: 300,
  showDate: true,
  dateFormat: 'long',
});

// Clock in a specific timezone without seconds
const nyClock = createElement(AnalogClock, {
  timezone: 'America/New_York',
  showSeconds: false,
  showDate: true,
  dateFormat: 'iso',
});

// Small clock
const mini = createElement(AnalogClock, {
  size: 100,
});
\`\`\`

## Features

- Renders as pure SVG with no external dependencies.
- Updates every second via \`setInterval\`.
- 12-hour mode shows numbers 1-12 around the face.
- 24-hour mode adds an inner ring with 0/13-23 at reduced opacity.
- Hour hand sweeps smoothly based on both hours and minutes.
- Minute hand sweeps smoothly based on both minutes and seconds.
- Second hand (red, #ef4444) can be hidden via \`showSeconds\`.
- Timezone support uses \`Intl.DateTimeFormat\` for accurate zone conversion.
- Clock face uses a light background (#f8fafc) with dark border (#334155).
`},{title:`Avatar`,path:`components/data/avatar`,content:`# Avatar

User avatar with image, initials fallback, colored circle, and optional status indicator.

## Import

\`\`\`typescript
import { Avatar } from '@specifyjs/avatar';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`src\` | \`string\` | \`undefined\` | Image source URL |
| \`alt\` | \`string\` | \`undefined\` | Alt text for image |
| \`name\` | \`string\` | \`undefined\` | User's name (used for initials fallback and color generation) |
| \`size\` | \`'xs' \\| 'sm' \\| 'md' \\| 'lg' \\| 'xl' \\| number\` | \`'md'\` | Size preset or pixel number |
| \`shape\` | \`'circle' \\| 'square'\` | \`'circle'\` | Shape of the avatar |
| \`fallbackColor\` | \`string\` | auto | Background color for initials/fallback |
| \`status\` | \`'online' \\| 'offline' \\| 'busy' \\| 'away'\` | \`undefined\` | Online status indicator |
| \`statusPosition\` | \`'top-right' \\| 'top-left' \\| 'bottom-right' \\| 'bottom-left'\` | \`'bottom-right'\` | Position of the status dot |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Avatar } from '@specifyjs/avatar';

function App() {
  return createElement('div', { style: { display: 'flex', gap: '12px' } },
    // Image avatar with status
    createElement(Avatar, {
      src: '/photos/alice.jpg',
      name: 'Alice Johnson',
      size: 'lg',
      status: 'online',
    }),
    // Initials fallback
    createElement(Avatar, {
      name: 'Bob Smith',
      size: 'md',
      status: 'away',
    }),
    // Custom size
    createElement(Avatar, {
      name: 'Carol',
      size: 64,
      shape: 'square',
    }),
  );
}
\`\`\`

## Features

- Image display with automatic fallback to initials on error
- Initials generated from first and last name parts
- Deterministic background color from user name (consistent across renders)
- Five size presets: xs (24px), sm (32px), md (40px), lg (56px), xl (80px), plus custom pixel values
- Circle and square shape options with proportional border radius
- Status indicator dot with four states: online (green), offline (gray), busy (red), away (yellow)
- Configurable status dot position at any corner
- Status dot scales proportionally with avatar size

## Accessibility

- Uses \`role="img"\` on the avatar container
- \`aria-label\` set to \`alt\`, \`name\`, or \`'avatar'\` as fallback
- Status dot includes \`aria-label\` with the status value
- Initials text marked \`aria-hidden="true"\` since the container carries the label
`},{title:`Badge`,path:`components/data/badge`,content:`# Badge

Count or dot indicator, positioned as an overlay or rendered inline.

## Import

\`\`\`typescript
import { Badge } from '@specifyjs/badge';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`count\` | \`number\` | \`undefined\` | Numeric count to display |
| \`max\` | \`number\` | \`undefined\` | Maximum count before showing "N+" |
| \`dot\` | \`boolean\` | \`false\` | Show a dot instead of a count |
| \`color\` | \`string\` | \`'#ef4444'\` | Badge color |
| \`size\` | \`'sm' \\| 'md' \\| 'lg'\` | \`'md'\` | Size preset |
| \`variant\` | \`'solid' \\| 'outline'\` | \`'solid'\` | Visual variant |
| \`children\` | \`unknown\` | \`undefined\` | Child element to overlay the badge on |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Badge } from '@specifyjs/badge';

// Overlay mode: badge on top-right of children
function NotificationIcon() {
  return createElement(Badge, { count: 5, max: 99 },
    createElement('span', null, 'Inbox'),
  );
}

// Inline mode: standalone badge
function StatusDot() {
  return createElement(Badge, { dot: true, color: '#22c55e' });
}
\`\`\`

## Features

- Two rendering modes: overlay (with children) and inline (standalone)
- Numeric count display with optional max cap (e.g., "99+")
- Dot mode for simple status indicators without text
- Three size presets: sm, md, lg
- Solid and outline visual variants
- Overlay badge positioned at top-right with \`translate(50%, -50%)\`
- Badge hidden when count is 0 or null and not in dot mode

## Accessibility

- Uses \`aria-label\` with descriptive text: \`"notification"\` for dots, \`"count {N}"\` for numeric badges
`},{title:`Board`,path:`components/data/board`,content:"# Board\n\nA canvas-based board component with pan/zoom for rendering draggable cards and containers. Supports nested containers, card links, context menus, search filtering, and undo/redo history.\n\n## Import\n\n```ts\nimport { Board } from '@aspect/data/board';\nimport type { BoardProps } from '@aspect/data/board';\nimport { useBoardReducer } from '@aspect/data/board';\nimport type { BoardState, BoardItem, Card, Container, CardType } from '@aspect/data/board';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `state` | `BoardState` | required | The board state containing items, viewport, and metadata |\n| `dispatch` | `(action: BoardAction) => void` | required | Dispatch function for board state mutations |\n| `selectedId` | `string \\| null` | `null` | ID of the currently selected item |\n| `onSelectItem` | `(itemId: string \\| null) => void` | `undefined` | Called when an item is selected or deselected |\n| `gridEnabled` | `boolean` | `false` | Enable snap-to-grid (20px grid) |\n| `searchQuery` | `string` | `''` | Search text to filter/dim non-matching items |\n| `colorFilter` | `string \\| null` | `null` | Color hex to filter cards by color |\n| `onOpenProject` | `(projectId: string) => void` | `undefined` | Called when a project-type card is opened |\n| `onCardContextMenu` | `(cardId: string, pos: { x: number; y: number }) => void` | `undefined` | Called when a card context menu is triggered |\n| `onUpdateItem` | `(cardId: string, updates: { card_title?: string; content?: unknown }) => void` | `undefined` | Called when a card is updated inline |\n\n## BoardState\n\n```ts\ninterface BoardState {\n  id: string;\n  name: string;\n  collection: BoardItem[];\n  viewport: { panX: number; panY: number; zoom: number };\n}\n```\n\n## BoardAction types\n\n| Action | Description |\n|--------|-------------|\n| `ADD_ITEM` | Add a card or container to the board or inside a container |\n| `REMOVE_ITEM` | Remove an item by ID from anywhere in the tree |\n| `MOVE_ITEM` | Update an item's position |\n| `RESIZE_ITEM` | Update an item's size |\n| `UPDATE_CARD` | Partially update a card's properties |\n| `CHANGE_CARD_TYPE` | Change a card's type (text, json, task, project) |\n| `ADD_CONTAINER` | Add a new container |\n| `NEST_ITEM` | Move an item into a container |\n| `UNNEST_ITEM` | Move an item out of a container to the top level |\n| `ADD_LINK` | Add a link between cards |\n| `REMOVE_LINK` | Remove a card link |\n| `PAN` | Update viewport pan offset |\n| `ZOOM` | Update viewport zoom level (clamped 0.25 - 4.0) |\n| `SET_BOARD` | Replace the entire board state |\n| `RENAME_BOARD` | Rename the board |\n\n## Card types\n\n| Type | Content Interface |\n|------|-------------------|\n| `text` | `{ text: string }` |\n| `json` | `{ [key: string]: unknown }` |\n| `task` | `{ [key: string]: unknown }` |\n| `project` | `{ project_id: string; project_name: string }` |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Board, useBoardReducer } from '@aspect/data/board';\n\nfunction MyBoard() {\n  const { state, dispatch, undo, redo, canUndo, canRedo } = useBoardReducer();\n\n  return createElement(Board, {\n    state,\n    dispatch,\n    gridEnabled: true,\n    onSelectItem: (id) => console.log('Selected:', id),\n  });\n}\n```\n\n## Features\n\n- Pan via middle-click or shift+left-click drag. Two-finger touch pan on mobile.\n- Zoom via ctrl+scroll wheel. Pinch-to-zoom on touch devices. Zoom clamped between 0.25x and 4.0x.\n- Cards support drag-and-drop into containers with visual drop target highlighting.\n- Card-to-card links rendered as an SVG overlay with drag-to-connect interaction.\n- Context menus for cards (change color, change type, detach, delete), containers (detach, delete), and links (change edge type, delete).\n- Search query dims non-matching items. Color filter dims cards that don't match.\n- `useBoardReducer` hook provides undo/redo with a 50-state history stack.\n- Nested containers with coordinate conversion between container-relative and canvas-absolute positions.\n\n## Accessibility\n\n- The board canvas uses `role=\"application\"` with an `aria-label` reflecting the board name.\n- The canvas is keyboard-focusable via `tabIndex`.\n- Context menus use `role=\"menu\"` with `role=\"menuitem\"` on each option.\n"},{title:`DataGrid`,path:`components/data/data-grid`,content:"# DataGrid\n\nFull-featured data table/grid with sorting, pagination, selection, filtering, and sticky header support.\n\n## Import\n\n```typescript\nimport { DataGrid } from '@specifyjs/data-grid';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `columns` | `DataGridColumn[]` | -- | Column definitions |\n| `data` | `Record<string, unknown>[]` | -- | Row data |\n| `pageSize` | `number` | `undefined` | Rows per page (enables pagination when set) |\n| `currentPage` | `number` | `0` | Current page index (0-based) |\n| `onPageChange` | `(page: number) => void` | `undefined` | Page change handler |\n| `sortBy` | `string` | `undefined` | Current sort column key |\n| `sortDir` | `'asc' \\| 'desc'` | `'asc'` | Sort direction |\n| `onSort` | `(key: string, dir: 'asc' \\| 'desc') => void` | `undefined` | Sort change handler |\n| `selectable` | `boolean` | `false` | Enable row selection checkboxes |\n| `selectedRows` | `number[]` | `[]` | Currently selected row indices |\n| `onSelectionChange` | `(indices: number[]) => void` | `undefined` | Selection change handler |\n| `striped` | `boolean` | `false` | Alternate row background colors |\n| `bordered` | `boolean` | `false` | Show cell borders |\n| `compact` | `boolean` | `false` | Compact row height |\n| `stickyHeader` | `boolean` | `false` | Sticky header on scroll |\n\n### DataGridColumn\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `key` | `string` | -- | Property key in the row data |\n| `header` | `string` | -- | Display header text |\n| `width` | `string` | `undefined` | Column width (CSS value) |\n| `sortable` | `boolean` | `false` | Whether this column is sortable |\n| `filterable` | `boolean` | `false` | Whether this column shows a filter input |\n| `render` | `(value: unknown, row: Record<string, unknown>) => unknown` | `undefined` | Custom cell renderer |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { DataGrid } from '@specifyjs/data-grid';\n\nfunction App() {\n  const columns = [\n    { key: 'name', header: 'Name', sortable: true, filterable: true },\n    { key: 'email', header: 'Email', width: '250px' },\n    { key: 'role', header: 'Role', sortable: true },\n  ];\n\n  const data = [\n    { name: 'Alice', email: 'alice@example.com', role: 'Admin' },\n    { name: 'Bob', email: 'bob@example.com', role: 'User' },\n  ];\n\n  return createElement(DataGrid, {\n    columns,\n    data,\n    pageSize: 10,\n    selectable: true,\n    striped: true,\n    stickyHeader: true,\n  });\n}\n```\n\n## Features\n\n- Column-based sorting with ascending/descending toggle and sort indicators\n- Per-column text filtering with automatic first-page reset\n- Pagination with page number buttons, prev/next, and ellipsis for large page counts\n- Row selection with individual and select-all checkboxes\n- Supports both controlled and uncontrolled modes for sort, page, and selection\n- Striped rows, bordered cells, and compact mode styling options\n- Sticky header for scrollable grids\n- Custom cell renderers per column\n\n## Accessibility\n\n- Table uses `role=\"grid\"` with `aria-rowcount`\n- Sort headers include `aria-sort` (`ascending` / `descending`)\n- Checkboxes include `aria-label` for \"Select all rows\" and \"Select row N\"\n- Filter inputs include `aria-label` for \"Filter by {column}\"\n- Pagination buttons include `aria-label` for \"Previous page\" / \"Next page\"\n- Active page uses `aria-current=\"page\"`\n"},{title:`DigitalClock`,path:`components/data/digital-clock`,content:`# DigitalClock

A real-time digital clock component with configurable format, timezone, date display, and seconds visibility. Renders with a dark background and monospace font.

## Import

\`\`\`ts
import { DigitalClock } from '@aspect/data/digital-clock';
import type { DigitalClockProps } from '@aspect/data/digital-clock';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`format\` | \`'12h' \\| '24h'\` | \`'12h'\` | Display format. 12h shows AM/PM indicator |
| \`showDate\` | \`boolean\` | \`false\` | Show date below the time |
| \`dateFormat\` | \`'short' \\| 'long' \\| 'iso'\` | \`'short'\` | Date format: short (MM/DD/YYYY), long (Month DD, YYYY), or iso (YYYY-MM-DD) |
| \`showSeconds\` | \`boolean\` | \`true\` | Whether to display seconds |
| \`timezone\` | \`string\` | \`undefined\` | IANA timezone string (e.g., \`'America/New_York'\`). Defaults to local time |
| \`className\` | \`string\` | \`undefined\` | CSS class name for the wrapper element |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { DigitalClock } from '@aspect/data/digital-clock';

// Basic 12-hour clock
const clock = createElement(DigitalClock, {});

// 24-hour clock with date
const clock24 = createElement(DigitalClock, {
  format: '24h',
  showDate: true,
  dateFormat: 'long',
});

// Clock for a specific timezone without seconds
const utcClock = createElement(DigitalClock, {
  timezone: 'UTC',
  showSeconds: false,
});

// Compact clock with ISO date
const compact = createElement(DigitalClock, {
  format: '24h',
  showDate: true,
  dateFormat: 'iso',
  showSeconds: false,
});
\`\`\`

## Features

- Updates every second via \`setInterval\`.
- 12-hour mode displays hours 1-12 with an AM/PM indicator rendered as a superscript.
- 24-hour mode displays hours 00-23 without a period indicator.
- Time is displayed in a monospace font at 2rem with letter-spacing.
- Dark theme: dark slate background (#1e293b) with light text (#e2e8f0).
- Date is shown in a smaller muted font (#94a3b8) below the time.
- Timezone support uses \`Intl.DateTimeFormat\` for accurate time and date extraction.
`},{title:`ListView`,path:`components/data/list-view`,content:"# ListView\n\nStyled list with configurable item rendering, dividers, selection, hover effects, and optional header/footer.\n\n## Import\n\n```typescript\nimport { ListView } from '@specifyjs/list-view';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `items` | `unknown[]` | -- | Array of items to render |\n| `renderItem` | `(item: unknown, index: number) => unknown` | -- | Render function for each item |\n| `keyExtractor` | `(item: unknown, index: number) => string` | -- | Unique key extractor per item |\n| `divider` | `boolean` | `false` | Show divider between items |\n| `hoverable` | `boolean` | `false` | Highlight items on hover |\n| `selectedIndex` | `number` | `undefined` | Currently selected item index |\n| `onSelect` | `(index: number) => void` | `undefined` | Selection handler |\n| `emptyMessage` | `string` | `'No items'` | Message shown when items is empty |\n| `header` | `unknown` | `undefined` | Optional header element |\n| `footer` | `unknown` | `undefined` | Optional footer element |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { ListView } from '@specifyjs/list-view';\n\nfunction App() {\n  const items = ['Apple', 'Banana', 'Cherry'];\n\n  return createElement(ListView, {\n    items,\n    renderItem: (item, index) => createElement('span', null, item),\n    keyExtractor: (item, index) => String(index),\n    divider: true,\n    hoverable: true,\n    onSelect: (index) => console.log('Selected:', index),\n    header: 'Fruits',\n    emptyMessage: 'No fruits available',\n  });\n}\n```\n\n## Features\n\n- Custom render function for each list item\n- Dividers between items (last item excluded)\n- Hover highlight with CSS transition\n- Single-item selection with visual highlight\n- Empty state message when no items are present\n- Optional header and footer sections with distinct styling\n- Flexible key extraction for efficient reconciliation\n\n## Accessibility\n\n- Uses `role=\"listbox\"` when `onSelect` is provided, `role=\"list\"` otherwise\n- Selectable items use `role=\"option\"` with `aria-selected`\n"},{title:`Tag`,path:`components/data/tag`,content:"# Tag\n\nRounded pill/chip element with optional remove button, icon, and click interaction.\n\n## Import\n\n```typescript\nimport { Tag } from '@specifyjs/tag';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `label` | `string` | -- | Tag label text |\n| `color` | `string` | `'#3b82f6'` | Color theme (CSS color or named color) |\n| `variant` | `'solid' \\| 'outline' \\| 'subtle'` | `'subtle'` | Visual variant |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Size preset |\n| `removable` | `boolean` | `false` | Show remove/close button |\n| `onRemove` | `() => void` | `undefined` | Remove button handler |\n| `icon` | `unknown` | `undefined` | Leading icon element |\n| `onClick` | `() => void` | `undefined` | Click handler (makes tag interactive) |\n| `disabled` | `boolean` | `false` | Disabled state |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { Tag } from '@specifyjs/tag';\n\nfunction App() {\n  return createElement('div', { style: { display: 'flex', gap: '8px' } },\n    createElement(Tag, { label: 'React', color: 'blue', variant: 'subtle' }),\n    createElement(Tag, {\n      label: 'TypeScript',\n      color: '#3178c6',\n      variant: 'solid',\n      removable: true,\n      onRemove: () => console.log('removed'),\n    }),\n    createElement(Tag, {\n      label: 'Clickable',\n      variant: 'outline',\n      onClick: () => console.log('clicked'),\n    }),\n  );\n}\n```\n\n## Features\n\n- Three visual variants: solid, outline, and subtle (translucent background)\n- Three size presets: sm, md, lg\n- Optional remove button with `stopPropagation` to avoid triggering tag click\n- Optional leading icon slot\n- Click handler turns the tag into an interactive button-like element\n- Disabled state with reduced opacity and `pointerEvents: none`\n- Supports named CSS colors (red, blue, green, etc.) with hex conversion for subtle backgrounds\n\n## Accessibility\n\n- Uses `role=\"button\"` and `tabIndex=\"0\"` when `onClick` is provided\n- Remove button includes `aria-label=\"Remove {label}\"`\n- Disabled state uses `aria-disabled=\"true\"`\n"},{title:`VirtualScroll`,path:`components/data/virtual-scroll`,content:`# VirtualScroll

Renders only visible items from a large list plus an overscan buffer for performant scrolling.

## Import

\`\`\`typescript
import { VirtualScroll } from '@specifyjs/virtual-scroll';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`unknown[]\` | -- | Full array of items |
| \`renderItem\` | \`(item: unknown, index: number) => unknown\` | -- | Render function for a single item |
| \`itemHeight\` | \`number\` | -- | Fixed height of each item in pixels |
| \`overscan\` | \`number\` | \`5\` | Extra items rendered above/below the viewport |
| \`height\` | \`string\` | -- | Container height (CSS value, e.g. \`'400px'\` or \`'100%'\`) |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { VirtualScroll } from '@specifyjs/virtual-scroll';

function App() {
  const items = Array.from({ length: 10000 }, (_, i) => \`Item \${i + 1}\`);

  return createElement(VirtualScroll, {
    items,
    itemHeight: 40,
    height: '400px',
    overscan: 10,
    renderItem: (item, index) =>
      createElement('div', { style: { padding: '8px 12px' } }, item),
  });
}
\`\`\`

## Features

- Only renders items within the visible viewport plus overscan buffer
- Spacer div maintains correct total scrollbar height
- Absolute positioning for each visible item for smooth scroll performance
- Recalculates visible range on every scroll event
- Configurable overscan count to reduce flicker during fast scrolling
- Fixed item height model for predictable layout calculations
`},{title:`Alert`,path:`components/feedback/alert`,content:`# Alert

Alert/banner message component with icon, title, message, and optional close and action buttons.

## Import

\`\`\`typescript
import { Alert } from '@specifyjs/alert';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`type\` | \`'info' \\| 'success' \\| 'warning' \\| 'error'\` | \`'info'\` | Alert severity type |
| \`title\` | \`string\` | \`undefined\` | Alert title |
| \`message\` | \`unknown\` | \`undefined\` | Alert message content |
| \`children\` | \`unknown\` | \`undefined\` | Children alias for message |
| \`closable\` | \`boolean\` | \`false\` | Show close button |
| \`onClose\` | \`() => void\` | \`undefined\` | Close callback |
| \`icon\` | \`string\` | auto | Custom icon text/emoji (auto-selected by type if omitted) |
| \`variant\` | \`'filled' \\| 'outline' \\| 'subtle'\` | \`'subtle'\` | Style variant |
| \`action\` | \`{ label: string; onClick: () => void }\` | \`undefined\` | Optional action button |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Alert } from '@specifyjs/alert';

function App() {
  return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
    createElement(Alert, {
      type: 'success',
      title: 'Saved',
      message: 'Your changes have been saved successfully.',
      closable: true,
    }),
    createElement(Alert, {
      type: 'error',
      variant: 'filled',
      title: 'Error',
      message: 'Something went wrong.',
      action: { label: 'Retry', onClick: () => console.log('retry') },
    }),
    createElement(Alert, {
      type: 'warning',
      variant: 'outline',
      message: 'Your session will expire in 5 minutes.',
    }),
  );
}
\`\`\`

## Features

- Four severity types with distinct color schemes: info (blue), success (green), warning (amber), error (red)
- Three style variants: filled (solid background), outline (border only), subtle (light background)
- Auto-selected icon per type (can be overridden)
- Optional title and message content
- Dismissible with close button and \`onClose\` callback
- Optional action button styled to match the alert theme
- Internal visibility state for dismiss behavior

## Accessibility

- Uses \`role="alert"\` for screen reader announcements
- Close button includes \`aria-label="Close"\`
`},{title:`Banner`,path:`components/feedback/banner`,content:`# Banner

A dismissible banner that displays at the top of the page with a three-column layout: severity icon, message text, and an optional dismiss button. Supports three severity levels with distinct color themes.

## Import

\`\`\`ts
import { Banner } from '@aspect/feedback/banner';
import type { BannerProps, BannerSeverity } from '@aspect/feedback/banner';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`severity\` | \`'info' \\| 'warning' \\| 'alert'\` | required | Determines the icon and color scheme |
| \`message\` | \`string\` | required | Plain text message to display |
| \`onDismiss\` | \`() => void\` | \`undefined\` | Called when the dismiss button is clicked. If omitted, the dismiss button is hidden |
| \`icon\` | \`unknown\` | \`undefined\` | Custom icon element to override the default severity icon |
| \`visible\` | \`boolean\` | \`true\` | Whether the banner is visible. When false, renders nothing |

### Severity themes

| Severity | Background | Border | Icon Color | Text Color |
|----------|-----------|--------|------------|------------|
| \`info\` | #eff6ff | #3b82f6 | #3b82f6 | #1e40af |
| \`warning\` | #fffbeb | #f59e0b | #f59e0b | #92400e |
| \`alert\` | #fef2f2 | #ef4444 | #ef4444 | #991b1b |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Banner } from '@aspect/feedback/banner';

// Info banner (non-dismissible)
const info = createElement(Banner, {
  severity: 'info',
  message: 'A new version is available.',
});

// Warning banner with dismiss
const warning = createElement(Banner, {
  severity: 'warning',
  message: 'Your session will expire in 5 minutes.',
  onDismiss: () => setShowWarning(false),
});

// Alert banner
const alert = createElement(Banner, {
  severity: 'alert',
  message: 'Failed to save changes. Please try again.',
  onDismiss: () => dismissAlert(),
});

// Banner with custom icon
const custom = createElement(Banner, {
  severity: 'info',
  message: 'Maintenance scheduled for tonight.',
  icon: myCustomIcon,
  onDismiss: handleDismiss,
});

// Conditionally visible banner
const conditional = createElement(Banner, {
  severity: 'warning',
  message: 'Unsaved changes detected.',
  visible: hasUnsavedChanges,
});
\`\`\`

## Features

- Three severity levels, each with a distinct SVG icon (info circle, warning triangle, alert circle).
- Three-column layout: 50x50px icon pane, flexible message pane, and a dismiss button pane.
- Dismiss button renders as a circular button with a multiplication sign, only when \`onDismiss\` is provided.
- Custom icon support overrides the default severity icon.
- \`visible\` prop allows declarative show/hide without unmounting logic.
- Full-width layout with a colored bottom border matching the severity theme.

## Accessibility

- Uses \`role="alert"\` for the \`alert\` severity and \`role="status"\` for \`info\` and \`warning\`.
- \`aria-live="polite"\` is set on the container for assistive technology announcements.
- The dismiss button has \`aria-label="Dismiss banner"\` for screen reader identification.
- Default SVG icons include \`aria-hidden="true"\` to prevent redundant announcement.
`},{title:`EmptyState`,path:`components/feedback/empty-state`,content:`# EmptyState

Empty content placeholder with icon, title, description, and call-to-action.

## Import

\`\`\`typescript
import { EmptyState } from '@specifyjs/empty-state';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`icon\` | \`string\` | \`undefined\` | Large icon or emoji displayed at the top |
| \`title\` | \`string\` | \`undefined\` | Title text |
| \`description\` | \`string\` | \`undefined\` | Description text |
| \`action\` | \`{ label: string; onClick: () => void }\` | \`undefined\` | Call-to-action button |
| \`image\` | \`string\` | \`undefined\` | Image URL displayed instead of or above the icon |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { EmptyState } from '@specifyjs/empty-state';

function App() {
  return createElement(EmptyState, {
    icon: '\\uD83D\\uDCC2',
    title: 'No files yet',
    description: 'Upload your first file to get started.',
    action: {
      label: 'Upload File',
      onClick: () => console.log('upload'),
    },
  });
}
\`\`\`

## Features

- Centered flexbox layout with vertical stacking
- Optional image element with constrained max dimensions (200x160)
- Large icon/emoji display at 48px font size
- Title with 20px bold text
- Description with muted color and constrained max width (360px)
- Call-to-action button with blue primary styling
- All sections are optional and conditionally rendered
`},{title:`ProgressBar`,path:`components/feedback/progress-bar`,content:"# ProgressBar\n\nProgress indicator with bar and circular variants, supporting determinate and indeterminate modes.\n\n## Import\n\n```typescript\nimport { ProgressBar } from '@specifyjs/progress-bar';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `value` | `number` | `0` | Current progress value (0 to max) |\n| `max` | `number` | `100` | Maximum value |\n| `color` | `string` | `'#3b82f6'` | Fill color |\n| `backgroundColor` | `string` | `'#e5e7eb'` | Track background color |\n| `height` | `string` | `'8px'` | Bar height (CSS value) |\n| `showLabel` | `boolean` | `false` | Show percentage label |\n| `animated` | `boolean` | `false` | Enable shimmer animation on the filled portion |\n| `variant` | `'bar' \\| 'circular'` | `'bar'` | Display variant |\n| `size` | `number \\| string` | `48` (circular) / `'8px'` (bar) | Size for circular variant (px) or bar height shorthand |\n| `indeterminate` | `boolean` | `false` | Indeterminate mode with animation |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { ProgressBar } from '@specifyjs/progress-bar';\n\nfunction App() {\n  return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },\n    // Determinate bar\n    createElement(ProgressBar, { value: 65, showLabel: true }),\n    // Indeterminate bar\n    createElement(ProgressBar, { indeterminate: true, color: '#22c55e' }),\n    // Circular variant\n    createElement(ProgressBar, { value: 75, variant: 'circular', size: 64, showLabel: true }),\n    // Animated shimmer\n    createElement(ProgressBar, { value: 50, animated: true }),\n  );\n}\n```\n\n## Features\n\n- Bar variant with rounded track and fill, smooth width transition\n- Circular variant using SVG with stroke-dasharray for arc rendering\n- Determinate mode showing exact progress percentage\n- Indeterminate mode with sliding/spinning animation\n- Shimmer animation effect via CSS gradient slide\n- Percentage label display (above bar or beside circle)\n- Configurable colors for fill and track\n- Unique animation IDs via `useId` to avoid CSS conflicts\n\n## Accessibility\n\n- Uses `role=\"progressbar\"` on the container\n- Includes `aria-valuenow`, `aria-valuemin=\"0\"`, and `aria-valuemax=\"100\"`\n- `aria-valuenow` is omitted in indeterminate mode\n"},{title:`Skeleton`,path:`components/feedback/skeleton`,content:`# Skeleton

Content placeholder with shimmer animation for loading states.

## Import

\`\`\`typescript
import { Skeleton } from '@specifyjs/skeleton';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`variant\` | \`'text' \\| 'circular' \\| 'rectangular'\` | \`'text'\` | Shape variant |
| \`width\` | \`string \\| number\` | \`'100%'\` | Width (CSS value or px number) |
| \`height\` | \`string \\| number\` | variant-dependent | Height (CSS value or px number) |
| \`lines\` | \`number\` | \`1\` | Number of text lines to render (text variant only) |
| \`animated\` | \`boolean\` | \`true\` | Enable shimmer animation |
| \`borderRadius\` | \`string\` | \`'4px'\` | Border radius (CSS value) |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Skeleton } from '@specifyjs/skeleton';

function App() {
  return createElement('div', { style: { display: 'flex', flexDirection: 'column', gap: '16px' } },
    // Multi-line text skeleton
    createElement(Skeleton, { variant: 'text', lines: 3 }),
    // Circular skeleton (avatar placeholder)
    createElement(Skeleton, { variant: 'circular', width: 48 }),
    // Rectangular skeleton (image placeholder)
    createElement(Skeleton, { variant: 'rectangular', width: '100%', height: 200 }),
  );
}
\`\`\`

## Features

- Three shape variants: text, circular, rectangular
- Text variant supports multiple lines with the last line rendered at 75% width
- Shimmer animation via CSS gradient slide (can be disabled)
- Configurable dimensions and border radius
- Unique animation keyframe IDs via \`useId\` to avoid CSS conflicts
- Gray placeholder color (#e5e7eb) with lighter shimmer highlight (#f3f4f6)

## Accessibility

- All skeleton elements are marked \`aria-hidden="true"\` since they are decorative placeholders
`},{title:`Spinner`,path:`components/feedback/spinner`,content:`# Spinner

Loading spinner indicator rendered as a rotating SVG circle.

## Import

\`\`\`typescript
import { Spinner } from '@specifyjs/spinner';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`size\` | \`'sm' \\| 'md' \\| 'lg' \\| number\` | \`'md'\` | Spinner size: preset name or pixel number |
| \`color\` | \`string\` | \`'#3b82f6'\` | Spinner color |
| \`thickness\` | \`number\` | auto | Stroke thickness in pixels (auto-calculated from size) |
| \`speed\` | \`'slow' \\| 'normal' \\| 'fast'\` | \`'normal'\` | Animation speed (1.2s / 0.75s / 0.45s) |
| \`label\` | \`string\` | \`'Loading'\` | Accessible label for screen readers |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Spinner } from '@specifyjs/spinner';

function App() {
  return createElement('div', { style: { display: 'flex', gap: '16px', alignItems: 'center' } },
    createElement(Spinner, { size: 'sm' }),
    createElement(Spinner, { size: 'md', color: '#22c55e' }),
    createElement(Spinner, { size: 'lg', speed: 'slow' }),
    createElement(Spinner, { size: 48, thickness: 4, color: '#ef4444' }),
  );
}
\`\`\`

## Features

- SVG-based circle with stroke-dasharray gap for the spinning effect
- Three size presets: sm (16px), md (24px), lg (40px), plus custom pixel values
- Three speed presets: slow (1.2s), normal (0.75s), fast (0.45s)
- Stroke thickness auto-calculated proportionally from size (or manually set)
- Inline keyframe injection with unique animation ID via \`useId\`
- Rounded stroke-linecap for smooth visual appearance

## Accessibility

- Uses \`role="status"\` for live region semantics
- \`aria-label\` set to the \`label\` prop (default: "Loading")
- Visually hidden text element contains the label for screen readers
`},{title:`Accordion`,path:`components/nav/accordion`,content:"# Accordion\n\nExpandable/collapsible section navigation component. Provides accessible accordion behavior with configurable single or multiple expansion, animation, keyboard navigation, and custom styling. Built on NavWrapper.\n\n## Import\n\n```ts\nimport { Accordion } from '@specifyjs/components/nav/accordion';\nimport type {\n  AccordionProps,\n  AccordionSection,\n  AccordionHeaderStyle,\n  AccordionContentStyle,\n} from '@specifyjs/components/nav/accordion';\n```\n\n## Props\n\n### AccordionProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `sections` | `AccordionSection[]` | *required* | Array of sections to render. |\n| `defaultExpanded` | `string[]` | `[]` | IDs of sections expanded on initial render. |\n| `allowMultiple` | `boolean` | `false` | Allow multiple sections to be open simultaneously. |\n| `headerStyle` | `AccordionHeaderStyle` | `{}` | Styling for section headers. |\n| `contentStyle` | `AccordionContentStyle` | `{}` | Styling for section content panels. |\n| `wrapperStyle` | `NavWrapperStyle` | `undefined` | Styling passed through to the NavWrapper container. |\n| `expandIcon` | `string` | `'+'` | Icon shown on collapsed sections. |\n| `collapseIcon` | `string` | `'\\u2212'` (minus) | Icon shown on expanded sections. |\n| `iconPosition` | `'left' \\| 'right'` | `'right'` | Position of the expand/collapse icon. |\n| `animated` | `boolean` | `true` | Enable smooth open/close animation via max-height transition. |\n| `onChange` | `(expandedIds: string[]) => void` | `undefined` | Callback fired with the array of currently expanded section IDs. |\n\n### AccordionSection\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `id` | `string` | *required* | Unique identifier for the section. |\n| `header` | `string` | *required* | Text displayed in the section header. |\n| `content` | `unknown` | *required* | Content rendered when the section is expanded. |\n| `icon` | `string` | `undefined` | Optional icon displayed in the header. |\n| `disabled` | `boolean` | `false` | When true, the section cannot be toggled. |\n\n### AccordionHeaderStyle\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `padding` | `string` | `'12px 16px'` | Header padding. |\n| `backgroundColor` | `string` | `'transparent'` | Header background color. |\n| `hoverBackground` | `string` | `'#f3f4f6'` | Background on hover. |\n| `color` | `string` | `'inherit'` | Header text color. |\n| `fontWeight` | `string` | `'600'` | Header font weight. |\n| `fontSize` | `string` | `'inherit'` | Header font size. |\n| `borderBottom` | `string` | `undefined` | Border between header and content. |\n\n### AccordionContentStyle\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `padding` | `string` | `'12px 16px'` | Content padding. |\n| `backgroundColor` | `string` | `'transparent'` | Content background color. |\n| `borderBottom` | `string` | `undefined` | Border at the bottom of the content panel. |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { Accordion } from '@specifyjs/components/nav/accordion';\n\nconst accordion = createElement(Accordion, {\n  sections: [\n    { id: 'general', header: 'General Settings', content: 'General content here...' },\n    { id: 'privacy', header: 'Privacy', icon: 'L', content: 'Privacy content here...' },\n    { id: 'advanced', header: 'Advanced', content: 'Advanced content here...', disabled: true },\n  ],\n  defaultExpanded: ['general'],\n  allowMultiple: false,\n  iconPosition: 'right',\n  onChange: (ids) => console.log('Expanded sections:', ids),\n});\n```\n\n## Features\n\n- **Single or multiple expansion** -- toggle between exclusive (only one open at a time) and independent section expansion.\n- **Animated transitions** -- smooth open/close via max-height CSS transition (can be disabled).\n- **Configurable icons** -- customize expand/collapse icons and their position (left or right).\n- **Section icons** -- each section header can display an optional icon.\n- **Disabled sections** -- individual sections can be locked from toggling, with visual feedback (grayed out, cursor not-allowed).\n- **Default expanded** -- specify which sections start in the expanded state.\n- **Change callback** -- `onChange` reports the current set of expanded section IDs after every toggle.\n\n## Accessibility\n\n- The outer wrapper uses `role=\"region\"` with `aria-label=\"Accordion\"`.\n- Each section header is a `<button>` element with `aria-expanded` reflecting its state.\n- Disabled sections are marked with `aria-disabled=\"true\"` and removed from the tab order (`tabIndex: -1`).\n- Content panels use `role=\"region\"` with `aria-hidden` toggled based on expansion state.\n- Headers respond to Enter and Space key presses for toggling.\n- Arrow-key keyboard navigation between section headers is provided by the NavWrapper.\n- Expand/collapse icons are hidden from assistive technology with `aria-hidden=\"true\"`.\n"},{title:`Breadcrumb`,path:`components/nav/breadcrumb`,content:"# Breadcrumb\n\nA breadcrumb trail navigation component. Renders an ordered list of navigation links with configurable separators, collapsible middle items, and proper ARIA semantics.\n\n## Import\n\n```ts\nimport { Breadcrumb } from '@specifyjs/components/nav/breadcrumb';\nimport type { BreadcrumbProps, BreadcrumbItem, BreadcrumbSize } from '@specifyjs/components/nav/breadcrumb';\n```\n\n## Props\n\n### BreadcrumbProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `items` | `BreadcrumbItem[]` | *required* | Ordered list of breadcrumb items (first = root, last = current page). |\n| `separator` | `string \\| unknown` | `'/'` | Separator rendered between items. Can be a string or a custom element. |\n| `maxItems` | `number` | `undefined` | When set, collapses middle items to \"...\" if the item count exceeds this value. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Size variant controlling font size and padding. |\n\n### BreadcrumbItem\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `label` | `string` | *required* | Display label. |\n| `href` | `string` | `undefined` | Optional link href. If omitted, the item is rendered as plain text or a button. |\n| `onClick` | `() => void` | `undefined` | Optional click handler. When combined with `href`, prevents default navigation. |\n\n### Size Variants\n\n| Size | Font Size | Padding |\n|------|-----------|---------|\n| `sm` | `12px` | `4px 0` |\n| `md` | `14px` | `6px 0` |\n| `lg` | `16px` | `8px 0` |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { Breadcrumb } from '@specifyjs/components/nav/breadcrumb';\n\nconst breadcrumb = createElement(Breadcrumb, {\n  items: [\n    { label: 'Home', href: '/' },\n    { label: 'Products', href: '/products' },\n    { label: 'Widgets', href: '/products/widgets' },\n    { label: 'Widget A' },\n  ],\n  separator: '/',\n  maxItems: 3,\n  size: 'md',\n});\n```\n\n## Features\n\n- **Ordered trail** -- renders items in an `<ol>` list reflecting the navigation hierarchy.\n- **Configurable separator** -- use a string character or a custom element between items.\n- **Collapsible middle items** -- when `maxItems` is set and the item count exceeds it, middle items collapse to an expandable \"...\" button.\n- **Size variants** -- three sizes (`sm`, `md`, `lg`) for different UI contexts.\n- **Link and button items** -- items with `href` render as `<a>` tags; items with only `onClick` render as `<button>` elements; items with neither render as plain `<span>` text.\n- **Current page highlighting** -- the last item is displayed with bold text and no link.\n\n## Accessibility\n\n- Wraps content in a NavWrapper with `role=\"navigation\"` and `aria-label=\"Breadcrumb\"`.\n- Items are rendered inside an `<ol>` element for proper semantic structure.\n- The last item (current page) is marked with `aria-current=\"page\"`.\n- Separators are hidden from assistive technology with `aria-hidden=\"true\"`.\n- The collapsible ellipsis button has `aria-label=\"Show all breadcrumb items\"` for screen reader users.\n- All interactive items (links and buttons) are keyboard-focusable.\n"},{title:`Dock`,path:`components/nav/dock`,content:`# Dock

Application launcher bar component. A configurable vertical or horizontal icon bar that displays application launchers with active/running indicators, badges, tooltips, and click-to-open behavior. Inspired by the Ubuntu Unity launcher and macOS dock.

## Import

\`\`\`ts
import { Dock } from 'specifyjs/components/nav/dock';
import type { DockProps, DockItem } from 'specifyjs/components/nav/dock';
\`\`\`

## Props

### DockProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`DockItem[]\` | *required* | The dock items to display |
| \`orientation\` | \`'vertical' \\| 'horizontal'\` | \`'vertical'\` | Orientation of the dock |
| \`position\` | \`'left' \\| 'right' \\| 'top' \\| 'bottom'\` | \`'left'\` | Position on the screen edge |
| \`iconSize\` | \`number\` | \`36\` | Icon size in pixels |
| \`autoHide\` | \`boolean\` | \`false\` | Whether to auto-hide the dock (slides out on hover, hidden otherwise) |
| \`showTrailingSeparator\` | \`boolean\` | \`false\` | Whether to show a separator before the last item |
| \`onItemClick\` | \`(id: string) => void\` | \`undefined\` | Called when a dock item is clicked |
| \`onItemContextMenu\` | \`(id: string, event: { x: number; y: number }) => void\` | \`undefined\` | Called when a dock item is right-clicked |
| \`children\` | \`unknown\` | -- | Extra children rendered at the end of the dock |

### DockItem

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`id\` | \`string\` | *required* | Unique identifier for this dock entry |
| \`icon\` | \`string\` | *required* | Icon source -- URL to an image/SVG, or an emoji/text character |
| \`label\` | \`string\` | *required* | Tooltip label shown on hover |
| \`active\` | \`boolean\` | \`false\` | Whether this item's application is currently running. Displays a dot indicator. |
| \`badge\` | \`number\` | \`undefined\` | Optional badge count (e.g., unread messages). Renders a number badge on the icon. |
| \`disabled\` | \`boolean\` | \`false\` | Whether this icon is disabled (greyed out, non-clickable) |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { Dock } from 'specifyjs/components/nav/dock';

const dock = createElement(Dock, {
  items: [
    { id: 'files', icon: '/icons/files.svg', label: 'Files', active: true },
    { id: 'browser', icon: '/icons/browser.svg', label: 'Browser' },
    { id: 'terminal', icon: '/icons/terminal.svg', label: 'Terminal', badge: 3 },
    { id: 'settings', icon: '/icons/settings.svg', label: 'Settings' },
  ],
  orientation: 'vertical',
  position: 'left',
  iconSize: 36,
  onItemClick: (id) => console.log('Clicked:', id),
});
\`\`\`

## Features

- **Active indicators** -- running applications show a small dot adjacent to the icon (position-aware based on dock edge).
- **Badge counts** -- items display a red number badge for notification counts. Counts above 99 show "99+".
- **Hover tooltips** -- hovering over an item shows a positioned tooltip with the item label. Tooltip placement is opposite to the dock edge.
- **Auto-hide mode** -- the dock slides off-screen when not hovered, with a thin trigger strip along the edge.
- **Trailing separator** -- a visual divider before the last item (useful for a "Show Applications" grid button).
- **Context menu support** -- right-clicking an item calls \`onItemContextMenu\` with the item ID and cursor position.
- **Keyboard navigation** -- arrow keys navigate between items in the dock. Home/End jump to first/last item. Enter/Space activates.
- **Hover scale effect** -- items scale up slightly (1.1x) with a background highlight on hover.

## Variants

### Horizontal bottom dock

\`\`\`ts
createElement(Dock, {
  items: [...],
  orientation: 'horizontal',
  position: 'bottom',
  iconSize: 48,
  onItemClick: handleClick,
});
\`\`\`

### Auto-hide dock

\`\`\`ts
createElement(Dock, {
  items: [...],
  autoHide: true,
  position: 'left',
  onItemClick: handleClick,
});
\`\`\`

### Dock with trailing separator

\`\`\`ts
createElement(Dock, {
  items: [
    { id: 'files', icon: 'F', label: 'Files', active: true },
    { id: 'browser', icon: 'B', label: 'Browser' },
    { id: 'grid', icon: '::::', label: 'Show Applications' },
  ],
  showTrailingSeparator: true,
  onItemClick: handleClick,
});
\`\`\`

## Accessibility

- The dock container has \`role="toolbar"\` and \`aria-label="Application launcher"\` with \`aria-orientation\` reflecting the layout direction.
- Each item is rendered as a \`<button>\` with an \`aria-label\` that includes the item label and badge count (e.g., "Terminal, 3 unread").
- Active state is communicated via \`aria-pressed\`.
- Disabled items have \`aria-disabled="true"\` and \`tabIndex={-1}\`.
- Arrow-key keyboard navigation (Up/Down for vertical, Left/Right for horizontal) with Home and End support.
- Tooltips use \`role="tooltip"\`.
- Separators have \`role="separator"\` and \`aria-hidden="true"\`.
`},{title:`Dropdown`,path:`components/nav/dropdown`,content:"# Dropdown\n\nA dropdown menu navigation component. Renders a trigger button that toggles a dropdown panel containing menu items. Supports nested submenus, dividers, icons, disabled states, and keyboard dismissal.\n\n## Import\n\n```ts\nimport { Dropdown } from '@specifyjs/components/nav/dropdown';\nimport type { DropdownProps, DropdownItem } from '@specifyjs/components/nav/dropdown';\n```\n\n## Props\n\n### DropdownProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `label` | `string` | *required* | Text displayed on the trigger button. |\n| `items` | `DropdownItem[]` | *required* | Array of menu items to display. |\n| `triggerStyle` | `Record<string, string>` | `undefined` | Custom inline styles for the trigger button. |\n| `menuStyle` | `NavWrapperStyle` | `undefined` | Styling passed to NavWrapper for the dropdown panel. |\n| `itemStyle` | `NavItemStyle` | `{}` | Styling for individual menu items. |\n| `placement` | `'bottom-start' \\| 'bottom-end'` | `'bottom-start'` | Placement of the dropdown relative to the trigger. |\n| `closeOnSelect` | `boolean` | `true` | Close the dropdown when an item is selected. |\n| `width` | `string \\| number` | `'220px'` | Width of the dropdown panel. |\n\n### DropdownItem\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `id` | `string` | *required* | Unique identifier for the item. |\n| `label` | `string` | *required* | Display label. |\n| `icon` | `string` | `undefined` | Icon rendered as a text span before the label (emoji or text). |\n| `disabled` | `boolean` | `false` | Whether the item is disabled (grayed out, non-interactive). |\n| `divider` | `boolean` | `false` | Render as a thin horizontal divider instead of a menu item. |\n| `onClick` | `() => void` | `undefined` | Click handler. |\n| `children` | `DropdownItem[]` | `undefined` | Nested submenu items -- shows a right chevron and expands on hover. |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { Dropdown } from '@specifyjs/components/nav/dropdown';\n\nconst menu = createElement(Dropdown, {\n  label: 'Actions',\n  placement: 'bottom-start',\n  items: [\n    { id: 'edit', label: 'Edit', icon: 'E', onClick: () => console.log('edit') },\n    { id: 'copy', label: 'Copy', icon: 'C', onClick: () => console.log('copy') },\n    { id: 'div1', label: '', divider: true },\n    { id: 'delete', label: 'Delete', icon: 'D', disabled: true },\n    {\n      id: 'more',\n      label: 'More options',\n      children: [\n        { id: 'export', label: 'Export', onClick: () => console.log('export') },\n        { id: 'archive', label: 'Archive', onClick: () => console.log('archive') },\n      ],\n    },\n  ],\n});\n```\n\n## Features\n\n- **Trigger button** -- styled button with a rotating chevron indicator for open/closed state.\n- **Nested submenus** -- items with `children` display a right chevron and expand on hover, positioned to the right of the parent item.\n- **Dividers** -- items with `divider: true` render as a horizontal separator line.\n- **Icons** -- optional icon text displayed before the label.\n- **Disabled items** -- grayed out and non-interactive, with reduced opacity and `aria-disabled`.\n- **Close on outside click** -- clicking outside the dropdown dismisses it.\n- **Escape key dismissal** -- pressing Escape closes the dropdown.\n- **Configurable placement** -- dropdown panel can align to the start or end of the trigger.\n- **Close on select** -- optionally close the menu when an item is clicked.\n\n## Accessibility\n\n- Trigger button has `aria-haspopup=\"true\"` and `aria-expanded` reflecting the open state.\n- The dropdown panel uses `role=\"menu\"` with an `aria-label` derived from the trigger label.\n- Each menu item uses `role=\"menuitem\"`.\n- Disabled items are marked with `aria-disabled` and have `tabIndex: -1`.\n- Items with submenus have `aria-haspopup` and `aria-expanded` attributes.\n- Dividers use `role=\"separator\"`.\n- Decorative icons are hidden from assistive technology with `aria-hidden=\"true\"`.\n"},{title:`Menubar`,path:`components/nav/menubar`,content:`# Menubar

Horizontal menu bar with dropdown menus. Renders a bar of top-level menu triggers that open dropdown panels on click or hover. Supports menu items with shortcuts, icons, dividers, disabled states, and nested submenus. Full keyboard navigation with arrow keys.

## Import

\`\`\`ts
import { Menubar } from '@specifyjs/components/nav/menubar';
import type { MenubarProps, MenuDefinition, MenuItem } from '@specifyjs/components/nav/menubar';
\`\`\`

## Props

### MenubarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`menus\` | \`MenuDefinition[]\` | *required* | Array of top-level menu definitions. |

### MenuDefinition

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`label\` | \`string\` | *required* | Top-level menu trigger label. |
| \`items\` | \`MenuItem[]\` | *required* | Items displayed in this menu's dropdown panel. |

### MenuItem

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`label\` | \`string\` | *required* | Display label. |
| \`onClick\` | \`() => void\` | \`undefined\` | Click handler. |
| \`shortcut\` | \`string\` | \`undefined\` | Keyboard shortcut hint (e.g., \`'Ctrl+S'\`). |
| \`icon\` | \`string\` | \`undefined\` | Icon text (emoji or character). |
| \`divider\` | \`boolean\` | \`false\` | Render as a horizontal divider line. |
| \`disabled\` | \`boolean\` | \`false\` | Whether the item is disabled. |
| \`children\` | \`MenuItem[]\` | \`undefined\` | Nested submenu items. |

## Usage

\`\`\`ts
import { createElement } from '@specifyjs/core';
import { Menubar } from '@specifyjs/components/nav/menubar';

const menubar = createElement(Menubar, {
  menus: [
    {
      label: 'File',
      items: [
        { label: 'New', shortcut: 'Ctrl+N', onClick: () => console.log('new') },
        { label: 'Open', shortcut: 'Ctrl+O', onClick: () => console.log('open') },
        { label: 'Save', shortcut: 'Ctrl+S', onClick: () => console.log('save') },
        { label: '', divider: true },
        { label: 'Exit', onClick: () => console.log('exit') },
      ],
    },
    {
      label: 'Edit',
      items: [
        { label: 'Undo', shortcut: 'Ctrl+Z', onClick: () => console.log('undo') },
        { label: 'Redo', shortcut: 'Ctrl+Y', onClick: () => console.log('redo') },
        { label: '', divider: true },
        { label: 'Cut', shortcut: 'Ctrl+X' },
        { label: 'Copy', shortcut: 'Ctrl+C' },
        { label: 'Paste', shortcut: 'Ctrl+V' },
      ],
    },
    {
      label: 'View',
      items: [
        {
          label: 'Zoom',
          children: [
            { label: 'Zoom In', shortcut: 'Ctrl++' },
            { label: 'Zoom Out', shortcut: 'Ctrl+-' },
            { label: 'Reset Zoom', shortcut: 'Ctrl+0' },
          ],
        },
        { label: 'Full Screen', shortcut: 'F11' },
      ],
    },
  ],
});
\`\`\`

## Features

- **Top-level menu triggers** -- horizontal bar of clickable menu labels with hover highlighting.
- **Hover switching** -- when any menu is open, hovering over another trigger immediately switches to that menu.
- **Nested submenus** -- menu items with \`children\` expand to a submenu panel on hover, positioned to the right.
- **Keyboard shortcut hints** -- items can display a right-aligned shortcut string (e.g., \`'Ctrl+S'\`).
- **Icons** -- optional icon text rendered before the label with a fixed-width slot for alignment.
- **Dividers** -- items with \`divider: true\` render as horizontal separator lines.
- **Disabled items** -- grayed out and non-interactive.
- **Close on outside click** -- clicking outside the menubar dismisses any open menu.
- **Escape key dismissal** -- pressing Escape closes the open menu.

## Accessibility

- The menubar container uses \`role="menubar"\` with \`aria-label="Menu bar"\`.
- Top-level triggers use \`role="menuitem"\` with \`aria-haspopup="true"\` and \`aria-expanded\` reflecting the open state.
- Dropdown panels use \`role="menu"\` with an \`aria-label\` derived from the menu label.
- Menu items use \`role="menuitem"\`.
- Disabled items are marked with \`aria-disabled\`.
- Items with submenus have \`aria-haspopup\` and \`aria-expanded\` attributes.
- Dividers use \`role="separator"\`.
- Full keyboard navigation: ArrowLeft/ArrowRight cycle through top-level menus, ArrowDown focuses the first item in an open menu, Escape closes the menu.
- Decorative icons and submenu chevrons are hidden from assistive technology with \`aria-hidden="true"\`.
`},{title:`Pagination`,path:`components/nav/pagination`,content:`# Pagination

Page navigation component. Renders First, Previous, page number buttons with ellipsis gaps, Next, and Last controls for navigating paginated data.

## Import

\`\`\`ts
import { Pagination } from '@specifyjs/components/nav/pagination';
import type { PaginationProps } from '@specifyjs/components/nav/pagination';
\`\`\`

## Props

### PaginationProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`total\` | \`number\` | *required* | Total number of items. |
| \`pageSize\` | \`number\` | *required* | Items per page. |
| \`currentPage\` | \`number\` | *required* | Current active page (1-based). |
| \`onChange\` | \`(page: number) => void\` | *required* | Called when the page changes. |
| \`siblingCount\` | \`number\` | \`1\` | Number of sibling pages shown around the current page. |
| \`showFirstLast\` | \`boolean\` | \`true\` | Show First/Last navigation buttons. |
| \`showPrevNext\` | \`boolean\` | \`true\` | Show Previous/Next navigation buttons. |
| \`disabled\` | \`boolean\` | \`false\` | Disable all controls. |

## Usage

\`\`\`ts
import { createElement } from '@specifyjs/core';
import { Pagination } from '@specifyjs/components/nav/pagination';

const pagination = createElement(Pagination, {
  total: 200,
  pageSize: 10,
  currentPage: 5,
  siblingCount: 1,
  showFirstLast: true,
  showPrevNext: true,
  onChange: (page) => console.log('Navigate to page:', page),
});
\`\`\`

## Features

- **Smart page range** -- displays page numbers with ellipsis gaps to avoid rendering every page number when the total page count is large.
- **Sibling count** -- configurable number of page buttons shown on each side of the current page.
- **First/Last buttons** -- optional buttons to jump to the first or last page.
- **Previous/Next buttons** -- optional buttons for sequential page navigation.
- **Disabled state** -- all controls can be globally disabled.
- **Boundary protection** -- navigation buttons are automatically disabled when at the first or last page.
- **Active page styling** -- the current page button is visually distinct with a blue background and bold text.
- **Horizontal layout** -- rendered as a horizontal row using NavWrapper with gap spacing.

## Accessibility

- Wraps content in a NavWrapper with \`role="navigation"\` and \`aria-label="Pagination"\`.
- The current page button is marked with \`aria-current="page"\`.
- First, Last, Previous, and Next buttons each have descriptive \`aria-label\` attributes (e.g., "Go to first page", "Go to previous page").
- Page number buttons have \`aria-label="Page N"\` for each page number.
- Disabled buttons use the native \`disabled\` attribute.
- Arrow-key keyboard navigation between buttons is enabled via NavWrapper's \`keyboardNav\`.
`},{title:`Sidebar`,path:`components/nav/sidebar`,content:`# Sidebar

Collapsible sidebar navigation component. Renders a vertical navigation panel with nested sections, badge indicators, icon-only collapsed mode, and tooltip labels when collapsed.

## Import

\`\`\`ts
import { Sidebar } from '@specifyjs/components/nav/sidebar';
import type { SidebarProps, SidebarItem } from '@specifyjs/components/nav/sidebar';
\`\`\`

## Props

### SidebarProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`SidebarItem[]\` | *required* | Navigation items to render. |
| \`collapsed\` | \`boolean\` | \`false\` | Whether the sidebar is collapsed to icon-only mode. |
| \`onToggleCollapse\` | \`() => void\` | \`undefined\` | Called to toggle the collapse state. When provided, a toggle button is rendered. |
| \`selectedId\` | \`string\` | \`undefined\` | ID of the currently selected item. |
| \`onSelect\` | \`(id: string) => void\` | \`undefined\` | Called when an item is selected. |
| \`width\` | \`string \\| number\` | \`'240px'\` | Expanded sidebar width. |
| \`collapsedWidth\` | \`string \\| number\` | \`'56px'\` | Collapsed sidebar width. |

### SidebarItem

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`id\` | \`string\` | *required* | Unique identifier. |
| \`label\` | \`string\` | *required* | Display label. |
| \`icon\` | \`string\` | \`undefined\` | Optional icon (emoji or text character). |
| \`children\` | \`SidebarItem[]\` | \`undefined\` | Nested child items. |
| \`badge\` | \`string\` | \`undefined\` | Optional badge text (e.g., a count) displayed as a red pill. |

## Usage

\`\`\`ts
import { createElement } from '@specifyjs/core';
import { Sidebar } from '@specifyjs/components/nav/sidebar';

const sidebar = createElement(Sidebar, {
  items: [
    { id: 'dashboard', label: 'Dashboard', icon: 'D' },
    { id: 'inbox', label: 'Inbox', icon: 'I', badge: '12' },
    {
      id: 'settings',
      label: 'Settings',
      icon: 'S',
      children: [
        { id: 'general', label: 'General' },
        { id: 'security', label: 'Security' },
      ],
    },
  ],
  selectedId: 'dashboard',
  collapsed: false,
  onToggleCollapse: () => console.log('Toggle sidebar'),
  onSelect: (id) => console.log('Selected:', id),
  width: '240px',
  collapsedWidth: '56px',
});
\`\`\`

## Features

- **Collapsible mode** -- toggle between full-width labels and icon-only mode with smooth width transition.
- **Nested items** -- child items expand/collapse on click with a rotating chevron indicator.
- **Badge indicators** -- items can display a red badge pill (e.g., unread counts).
- **Tooltips when collapsed** -- hovering over an icon-only item shows a tooltip with the item label.
- **Toggle button** -- when \`onToggleCollapse\` is provided, a toggle button is rendered at the top of the sidebar.
- **Selected state** -- the selected item is highlighted with a blue background and text color.
- **Hover feedback** -- items show a subtle background change on hover.
- **Depth indentation** -- nested items are progressively indented based on their depth level.
- **Animated width transition** -- the sidebar width animates when toggling between collapsed and expanded states.

## Accessibility

- Wraps content in a NavWrapper with \`role="navigation"\` and \`aria-label="Sidebar"\`.
- The collapse toggle button has \`aria-label\` that reflects the current state ("Expand sidebar" or "Collapse sidebar").
- Selected items are marked with \`aria-selected\`.
- In collapsed mode, each item has a \`title\` attribute for native browser tooltips.
- Tooltip elements use \`role="tooltip"\`.
- Nested child groups are wrapped in a \`role="group"\` container.
- All items are rendered as \`<button>\` elements for keyboard accessibility.
- Arrow-key keyboard navigation is enabled via NavWrapper's \`keyboardNav\`.
`},{title:`Stepper`,path:`components/nav/stepper`,content:`# Stepper

Step wizard indicator component. Renders a sequence of step circles or dots connected by lines, showing completed, active, and pending states. Supports horizontal and vertical orientations, clickable steps, and visual variants.

## Import

\`\`\`ts
import { Stepper } from '@specifyjs/components/nav/stepper';
import type { StepperProps, StepItem, StepperOrientation, StepperVariant } from '@specifyjs/components/nav/stepper';
\`\`\`

## Props

### StepperProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`steps\` | \`StepItem[]\` | *required* | Array of step definitions. |
| \`currentStep\` | \`number\` | *required* | Current active step (0-based index). |
| \`orientation\` | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` | Layout orientation. |
| \`onChange\` | \`(step: number) => void\` | \`undefined\` | Called when a step is clicked (receives the step index). |
| \`clickable\` | \`boolean\` | \`false\` | Whether steps are clickable. |
| \`variant\` | \`'circle' \\| 'dot'\` | \`'circle'\` | Visual variant for step indicators. |

### StepItem

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| \`label\` | \`string\` | *required* | Step label text. |
| \`description\` | \`string\` | \`undefined\` | Optional description shown below the label. |
| \`icon\` | \`string\` | \`undefined\` | Optional icon text (emoji or character) shown inside the circle. |

## Usage

\`\`\`ts
import { createElement } from '@specifyjs/core';
import { Stepper } from '@specifyjs/components/nav/stepper';

const stepper = createElement(Stepper, {
  steps: [
    { label: 'Account', description: 'Create your account' },
    { label: 'Profile', description: 'Set up your profile' },
    { label: 'Review', description: 'Review and confirm' },
    { label: 'Done', description: 'All set!' },
  ],
  currentStep: 1,
  orientation: 'horizontal',
  clickable: true,
  variant: 'circle',
  onChange: (step) => console.log('Step selected:', step),
});
\`\`\`

## Features

- **Three step states** -- steps are rendered as completed (filled blue circle with checkmark), active (outlined circle with shadow), or pending (outlined gray circle).
- **Circle and dot variants** -- \`circle\` shows numbered/icon indicators (32px); \`dot\` shows smaller indicators (12px).
- **Connector lines** -- lines between steps reflect completion state with color transitions.
- **Horizontal and vertical orientations** -- full layout support for both directions.
- **Clickable steps** -- optionally allow users to jump to any step by clicking.
- **Step descriptions** -- optional secondary text displayed below each step label.
- **Custom icons** -- provide icon text that replaces the default step number inside circle indicators.
- **Animated transitions** -- background color and border color transitions on state changes.

## Accessibility

- The component uses \`role="navigation"\` with \`aria-label="Progress steps"\`.
- The currently active step is marked with \`aria-current="step"\`.
- When clickable, steps render as \`<button>\` elements for keyboard access; otherwise they render as \`<div>\` elements.
- Step labels and descriptions provide textual context for screen readers.
- Visual indicators (circles, dots, connector lines) communicate progress through color differentiation.
`},{title:`SystemTray`,path:`components/nav/system-tray`,content:"# SystemTray\n\nHorizontal status bar for the top edge of a desktop layout. Displays the active application name, a real-time clock, system status indicators (icons with optional labels), and a user menu with avatar and name. Inspired by the Ubuntu Unity / GNOME top panel.\n\n## Import\n\n```ts\nimport { SystemTray } from 'specifyjs/components/nav/system-tray';\nimport type { SystemTrayProps, SystemTrayIndicator, SystemTrayUser } from 'specifyjs/components/nav/system-tray';\n```\n\n## Props\n\n### SystemTrayProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `activeAppName` | `string` | `undefined` | Text shown on the left -- typically the active application name |\n| `activitiesButton` | `{ label: string; onClick: () => void }` | `undefined` | Optional left-most button (e.g., \"Activities\"). Fires onClick. |\n| `clockFormat` | `'12h' \\| '24h'` | `'24h'` | Clock format |\n| `showSeconds` | `boolean` | `true` | Whether to show seconds in the clock |\n| `showDate` | `boolean` | `true` | Whether to show the date beside the clock |\n| `indicators` | `SystemTrayIndicator[]` | `undefined` | System status indicators displayed in the right section |\n| `user` | `SystemTrayUser` | `undefined` | User profile -- shown at the far right with avatar and name |\n| `userMenuItems` | `Array<{ label, icon?, onClick, divider? }>` | `undefined` | Items in the user dropdown menu (shown on click) |\n| `height` | `number` | `28` | Panel height in pixels |\n| `children` | `unknown` | -- | Additional elements rendered in the center area |\n\n### SystemTrayIndicator\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `id` | `string` | *required* | Unique identifier |\n| `icon` | `string` | *required* | Icon -- emoji, text character, or image URL |\n| `label` | `string` | `undefined` | Optional label shown next to the icon |\n| `onClick` | `() => void` | `undefined` | Click handler |\n\n### SystemTrayUser\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `name` | `string` | *required* | Display name |\n| `avatar` | `string` | `undefined` | Avatar URL or emoji fallback |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { SystemTray } from 'specifyjs/components/nav/system-tray';\n\nconst tray = createElement(SystemTray, {\n  activeAppName: 'Text Editor',\n  activitiesButton: { label: 'Activities', onClick: () => console.log('Activities') },\n  clockFormat: '24h',\n  showSeconds: true,\n  showDate: true,\n  indicators: [\n    { id: 'wifi', icon: 'W', label: 'Connected', onClick: () => {} },\n    { id: 'volume', icon: 'V', onClick: () => {} },\n    { id: 'battery', icon: 'B', label: '85%' },\n  ],\n  user: { name: 'Claude', avatar: '/avatar.png' },\n  userMenuItems: [\n    { label: 'Claude', onClick: () => {} },\n    { label: '', onClick: () => {}, divider: true },\n    { label: 'Settings', icon: 'S', onClick: () => {} },\n    { label: 'Log Out', onClick: () => handleLogout() },\n  ],\n});\n```\n\n## Features\n\n- **Activities button** -- a bold, clickable button at the left edge. Highlights on hover.\n- **Active app name** -- displays the focused application title with truncation/ellipsis.\n- **Real-time clock** -- updates every second. Supports 12h/24h format with optional seconds and date display.\n- **Status indicators** -- icon buttons with optional labels. Clickable when `onClick` is provided.\n- **User menu** -- avatar circle (image or initial), user name, and dropdown arrow. Click opens a dropdown menu.\n- **Dropdown menu** -- positioned below the user button. Supports labels, icons, dividers, and click-to-close behavior. Closes on outside click or Escape key.\n\n## Variants\n\n### Minimal panel (clock only)\n\n```ts\ncreateElement(SystemTray, {\n  clockFormat: '12h',\n  showSeconds: false,\n  showDate: false,\n  height: 24,\n});\n```\n\n### Panel with user menu\n\n```ts\ncreateElement(SystemTray, {\n  user: { name: 'Admin' },\n  userMenuItems: [\n    { label: 'Profile', icon: 'P', onClick: () => {} },\n    { label: '', onClick: () => {}, divider: true },\n    { label: 'Log Out', onClick: handleLogout },\n  ],\n});\n```\n\n## Accessibility\n\n- The panel container has `role=\"menubar\"` and `aria-label=\"System panel\"`.\n- The Activities button and indicator buttons have `aria-label` attributes and are keyboard-focusable.\n- The user menu button has `aria-haspopup=\"true\"` and `aria-expanded` reflecting the open state.\n- Dropdown menu items have `role=\"menuitem\"`.\n- The clock uses `role=\"timer\"` with `aria-live=\"polite\"` for assistive technology updates.\n- All interactive elements respond to Enter and Space key activation.\n- Outside-click and Escape close the user dropdown.\n"},{title:`Toolbar`,path:`components/nav/toolbar`,content:"# Toolbar\n\nHorizontal toolbar with button groups. Renders a row of buttons, separators (vertical lines), and spacers (flex-grow gaps). Supports size and variant props for consistent toolbar styling.\n\n## Import\n\n```ts\nimport { Toolbar } from '@specifyjs/components/nav/toolbar';\nimport type { ToolbarProps, ToolbarItem, ToolbarSize, ToolbarVariant } from '@specifyjs/components/nav/toolbar';\n```\n\n## Props\n\n### ToolbarProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `items` | `ToolbarItem[]` | *required* | Toolbar items to render. |\n| `size` | `'sm' \\| 'md' \\| 'lg'` | `'md'` | Size variant controlling height, padding, and font size. |\n| `variant` | `'flat' \\| 'raised'` | `'flat'` | Visual variant. `flat` has no border/shadow; `raised` has a border and box shadow. |\n\n### ToolbarItem\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `id` | `string` | *required* | Unique identifier. |\n| `label` | `string` | `undefined` | Display label (optional if `icon` is provided). |\n| `icon` | `string` | `undefined` | Icon text (emoji or character). |\n| `type` | `'button' \\| 'separator' \\| 'dropdown' \\| 'spacer'` | *required* | Item type. |\n| `onClick` | `() => void` | `undefined` | Click handler (for button and dropdown types). |\n| `disabled` | `boolean` | `false` | Whether the item is disabled. |\n| `active` | `boolean` | `false` | Whether the item is in an active/pressed state. |\n\n### Size Variants\n\n| Size | Height | Padding | Font Size | Icon Size |\n|------|--------|---------|-----------|-----------|\n| `sm` | `28px` | `4px 8px` | `12px` | `14px` |\n| `md` | `36px` | `6px 12px` | `14px` | `16px` |\n| `lg` | `44px` | `8px 16px` | `16px` | `18px` |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { Toolbar } from '@specifyjs/components/nav/toolbar';\n\nconst toolbar = createElement(Toolbar, {\n  size: 'md',\n  variant: 'raised',\n  items: [\n    { id: 'bold', type: 'button', icon: 'B', label: 'Bold', onClick: () => console.log('bold') },\n    { id: 'italic', type: 'button', icon: 'I', label: 'Italic', onClick: () => console.log('italic') },\n    { id: 'sep1', type: 'separator' },\n    { id: 'align', type: 'dropdown', label: 'Align', onClick: () => console.log('align') },\n    { id: 'spacer1', type: 'spacer' },\n    { id: 'save', type: 'button', label: 'Save', onClick: () => console.log('save') },\n  ],\n});\n```\n\n## Features\n\n- **Item types** -- supports buttons, separators (vertical divider lines), dropdown triggers (with a chevron indicator), and spacers (flex-grow gaps for right-alignment).\n- **Size variants** -- three sizes (`sm`, `md`, `lg`) controlling height, padding, and font sizing.\n- **Visual variants** -- `flat` for borderless toolbars and `raised` for bordered toolbars with box shadows.\n- **Active/pressed state** -- buttons can be toggled to an active state with distinct styling.\n- **Disabled items** -- buttons can be individually disabled with reduced opacity and non-interactive cursor.\n- **Icons and labels** -- buttons can display an icon, a label, or both.\n- **Hover feedback** -- buttons show a subtle background change on hover.\n\n## Accessibility\n\n- Wraps content in a NavWrapper with `role=\"toolbar\"` and `aria-label=\"Toolbar\"`.\n- Buttons have `aria-pressed` when in the active state.\n- Each button has an `aria-label` derived from its label or id, and a `title` attribute for tooltip display.\n- Disabled buttons use the native `disabled` attribute.\n- Separators use `role=\"separator\"` with `aria-orientation=\"vertical\"`.\n- Spacers are hidden from assistive technology with `aria-hidden=\"true\"`.\n- Decorative icons are hidden with `aria-hidden=\"true\"`.\n- Arrow-key keyboard navigation between toolbar buttons is enabled via NavWrapper's `keyboardNav`.\n"},{title:`TreeNav`,path:`components/nav/treenav`,content:"# TreeNav\n\nAccessible tree navigation component. Renders a hierarchical tree with expand/collapse toggling, connector lines, keyboard navigation, and optional custom node rendering. Built on NavWrapper with `role=\"tree\"`.\n\n## Import\n\n```ts\nimport { TreeNav, TreeNode } from '@specifyjs/components/nav/treenav';\nimport type { TreeNavProps, TreeNodeData } from '@specifyjs/components/nav/treenav';\n```\n\n## Props\n\n### TreeNavProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `root` | `TreeNodeData` | *required* | Tree data structure (nested object). |\n| `onNodeClick` | `(node: TreeNode) => void` | `undefined` | Fired when a node label is clicked. |\n| `onNodeExpand` | `(node: TreeNode) => void` | `undefined` | Fired when a node is expanded. |\n| `onNodeCollapse` | `(node: TreeNode) => void` | `undefined` | Fired when a node is collapsed. |\n| `selectedId` | `string` | `undefined` | ID of the currently selected node. |\n| `expandAll` | `boolean` | `false` | Start with all nodes expanded. |\n| `lineColor` | `string` | `'#000'` | Color of connector lines. |\n| `lineWidth` | `number` | `1` | Width of connector lines in pixels. |\n| `indentPx` | `number` | `20` | Pixels of indentation per depth level. |\n| `iconExpanded` | `string` | `'\\u2212'` (minus) | Icon shown for expanded non-leaf nodes. |\n| `iconCollapsed` | `string` | `'+'` | Icon shown for collapsed non-leaf nodes. |\n| `nodeStyle` | `NavItemStyle` | `{}` | Styling for individual node items. |\n| `wrapperStyle` | `NavWrapperStyle` | `undefined` | Styling for the outer NavWrapper. |\n| `renderNode` | `(node: TreeNode, isSelected: boolean) => unknown` | `undefined` | Custom node renderer for full control over node appearance. |\n\n### TreeNodeData\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `id` | `string` | *required* | Unique identifier for the node. |\n| `label` | `string` | *required* | Display label. |\n| `children` | `TreeNodeData[]` | `[]` | Nested child nodes. |\n| `expanded` | `boolean` | `false` | Whether the node starts expanded. |\n| `icon` | `string` | `undefined` | Text or emoji icon displayed alongside the label. |\n| `metadata` | `Record<string, unknown>` | `{}` | Extensible payload for attaching arbitrary data. |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { TreeNav } from '@specifyjs/components/nav/treenav';\n\nconst tree = createElement(TreeNav, {\n  root: {\n    id: 'root',\n    label: 'Project',\n    children: [\n      {\n        id: 'src',\n        label: 'src',\n        icon: 'F',\n        children: [\n          { id: 'index', label: 'index.ts' },\n          { id: 'app', label: 'App.ts' },\n        ],\n      },\n      { id: 'readme', label: 'README.md' },\n      { id: 'package', label: 'package.json' },\n    ],\n  },\n  selectedId: 'index',\n  expandAll: true,\n  onNodeClick: (node) => console.log('Selected:', node.label),\n});\n```\n\n## Features\n\n- **Hierarchical tree rendering** -- nested data is rendered with visual indentation and connector lines.\n- **Expand/collapse toggling** -- non-leaf nodes can be expanded or collapsed by clicking the toggle icon.\n- **Connector lines** -- vertical and horizontal lines visually connect parent and child nodes.\n- **Configurable indentation** -- control indent depth, line color, and line width.\n- **Custom node rendering** -- provide a `renderNode` function for full control over node appearance.\n- **Expand all** -- optionally start with the entire tree expanded.\n- **TreeNode data model** -- the `TreeNode` class supports traversal (`walk`, `find`), mutation (`addChild`, `removeChild`), and arbitrary metadata.\n- **Event callbacks** -- separate callbacks for node click, expand, and collapse events.\n\n## Accessibility\n\n- The outer wrapper uses `role=\"tree\"` with an `aria-label` of \"Tree navigation\".\n- Each node row uses `role=\"treeitem\"`.\n- Non-leaf nodes have `aria-expanded` indicating their open/closed state.\n- Selected nodes are marked with `aria-selected=\"true\"`.\n- Each node reports its depth via `aria-level` (1-based).\n- Full keyboard navigation: ArrowDown/ArrowUp move between visible nodes, ArrowRight expands or enters children, ArrowLeft collapses or moves to parent.\n- Enter selects a node; Space toggles expand/collapse.\n- Home and End keys jump to the first and last visible nodes.\n- Connector lines and toggle icons are hidden from assistive technology with `aria-hidden=\"true\"`.\n- Roving tabindex ensures only the focused node is in the tab order.\n"},{title:`NavWrapper`,path:`components/nav/wrapper`,content:"# NavWrapper\n\nBase container for all navigation components. Provides consistent layout, orientation, ARIA roles, focus management, and configurable styling. All nav components (Dropdown, TreeNav, Accordion, etc.) build on this foundation.\n\n## Import\n\n```ts\nimport { NavWrapper, buildNavItemStyle, useHover } from '@specifyjs/components/nav/wrapper';\nimport type { NavWrapperProps, NavWrapperStyle, NavOrientation, NavItemStyle } from '@specifyjs/components/nav/wrapper';\n```\n\n## Props\n\n### NavWrapperProps\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `orientation` | `'horizontal' \\| 'vertical'` | `'vertical'` | Orientation of child items. |\n| `role` | `string` | `'navigation'` | ARIA role applied to the container. |\n| `ariaLabel` | `string` | `undefined` | ARIA label for the navigation landmark. |\n| `styling` | `NavWrapperStyle` | `{}` | Styling configuration object (see below). |\n| `className` | `string` | `''` | Extra CSS class name appended to the container. |\n| `keyboardNav` | `boolean` | `true` | Enable arrow-key navigation between focusable children. |\n| `children` | `unknown` | `undefined` | Child elements to render inside the wrapper. |\n\n### NavWrapperStyle\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `backgroundColor` | `string` | `'#ffffff'` | Background color. |\n| `color` | `string` | `'#1f2937'` | Text color. |\n| `fontFamily` | `string` | `'inherit'` | Font family. |\n| `fontSize` | `string` | `'14px'` | Font size. |\n| `border` | `string` | `'1px solid #e5e7eb'` | Border style. |\n| `borderRadius` | `string` | `'8px'` | Border radius. |\n| `padding` | `string` | `'0'` | Padding. |\n| `boxShadow` | `string` | `undefined` | Box shadow. |\n| `width` | `string \\| number` | `'auto'` | Container width. |\n| `maxHeight` | `string \\| number` | `undefined` | Max height for scrollable content. |\n| `custom` | `Record<string, string>` | `undefined` | Custom inline styles merged last. |\n\n### NavItemStyle\n\nShared style configuration used by nav item helpers across all components.\n\n| Property | Type | Default | Description |\n|----------|------|---------|-------------|\n| `padding` | `string` | `'10px 16px'` | Item padding. |\n| `hoverBackground` | `string` | `'#f3f4f6'` | Background on hover. |\n| `activeBackground` | `string` | `'#eff6ff'` | Background when active/selected. |\n| `activeColor` | `string` | `'#2563eb'` | Text color when active/selected. |\n| `separator` | `string` | `undefined` | Border bottom between items. |\n| `cursor` | `string` | `'pointer'` | Cursor style. |\n| `transition` | `string` | `'background-color 0.15s'` | CSS transition. |\n\n## Usage\n\n```ts\nimport { createElement } from '@specifyjs/core';\nimport { NavWrapper } from '@specifyjs/components/nav/wrapper';\n\nconst nav = createElement(\n  NavWrapper,\n  {\n    orientation: 'vertical',\n    ariaLabel: 'Main navigation',\n    styling: {\n      width: '260px',\n      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',\n    },\n  },\n  createElement('button', { role: 'menuitem' }, 'Dashboard'),\n  createElement('button', { role: 'menuitem' }, 'Settings'),\n  createElement('button', { role: 'menuitem' }, 'Profile'),\n);\n```\n\n## Features\n\n- **Orientation support** -- renders as a flex row (horizontal) or column (vertical).\n- **Keyboard navigation** -- arrow keys move focus between focusable children; Home/End jump to first/last item.\n- **Configurable styling** -- comprehensive style object with sensible defaults and a `custom` escape hatch.\n- **Shared utilities** -- exports `buildNavItemStyle` for consistent item styling and `useHover` for hover state management.\n- **Foundation component** -- used internally by Dropdown, TreeNav, Accordion, Breadcrumb, Pagination, Sidebar, and Toolbar.\n\n## Accessibility\n\n- Renders a `<nav>` element with a configurable `role` attribute (defaults to `'navigation'`).\n- Supports `aria-label` for screen reader identification of the navigation landmark.\n- Sets `aria-orientation` to communicate layout direction to assistive technology.\n- Keyboard navigation via arrow keys respects the orientation (Up/Down for vertical, Left/Right for horizontal).\n- Home and End keys move focus to the first and last focusable items respectively.\n- Focusable children are queried using standard selectors: `button`, `[tabindex]`, `a[href]`, `[role=\"menuitem\"]`, `[role=\"treeitem\"]`.\n"},{title:`AppDragDrop`,path:`components/layout/app-drag-drop`,content:`# AppDragDrop

A typed drag-and-drop system for inter-app content transfer. Provides a context-based protocol where apps can initiate drags with typed payloads and register drop zones that accept specific types. Includes a visual drag preview overlay.

## Import

\`\`\`ts
import {
  DragDropProvider,
  useDragDrop,
  useDraggable,
  useDropZone,
} from '@aspect/layout/app-drag-drop';
import type {
  DragPayload,
  DropZone,
  DragDropContextValue,
  DragDropProviderProps,
} from '@aspect/layout/app-drag-drop';
\`\`\`

## DragDropProvider Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`unknown\` | \`undefined\` | Child elements that will have access to the drag-drop context |

## DragPayload

| Field | Type | Description |
|-------|------|-------------|
| \`type\` | \`string\` | MIME-like type identifier (e.g., \`'application/project-card'\`) |
| \`data\` | \`T\` | The dragged data |
| \`sourceAppId\` | \`string\` | Source app ID |
| \`preview\` | \`unknown\` | Optional visual preview element |

## Hooks

### \`useDragDrop()\`

Returns the full \`DragDropContextValue\` with \`startDrag\`, \`cancelDrag\`, \`registerDropZone\`, \`currentDrag\`, and \`isDragging\`.

### \`useDraggable<T>(type: string, data: T)\`

Makes an element draggable with a typed payload.

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| \`onMouseDown\` | \`(e: Event) => void\` | Attach to the draggable element's \`onMouseDown\` |
| \`isDragging\` | \`boolean\` | Whether this type is currently being dragged |

### \`useDropZone(config)\`

Makes an element a drop zone that accepts specific drag types.

**Config:**

| Field | Type | Description |
|-------|------|-------------|
| \`acceptTypes\` | \`string[]\` | Types this zone accepts |
| \`onDragEnter\` | \`(payload: DragPayload) => void\` | Called when a compatible drag enters |
| \`onDragLeave\` | \`() => void\` | Called when drag leaves |
| \`onDrop\` | \`(payload: DragPayload) => void\` | Called when a compatible payload is dropped |
| \`zoneId\` | \`string\` | Optional custom zone ID |

**Returns:**

| Field | Type | Description |
|-------|------|-------------|
| \`isOver\` | \`boolean\` | Whether a compatible drag is over this zone |
| \`canDrop\` | \`boolean\` | Whether the current drag type is accepted |
| \`zoneId\` | \`string\` | The zone's identifier |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { DragDropProvider, useDraggable, useDropZone } from '@aspect/layout/app-drag-drop';

// Wrap your app with the provider
const app = createElement(DragDropProvider, {}, content);

// In a draggable component
function DraggableCard(props) {
  const { onMouseDown, isDragging } = useDraggable('application/card', props.card);
  return createElement('div', {
    onMouseDown,
    style: { opacity: isDragging ? '0.5' : '1' },
  }, props.card.title);
}

// In a drop zone component
function DropTarget() {
  const { isOver, canDrop, zoneId } = useDropZone({
    acceptTypes: ['application/card'],
    onDrop: (payload) => console.log('Dropped:', payload.data),
  });

  return createElement('div', {
    'data-dropzone-id': zoneId,
    style: { border: isOver ? '2px solid blue' : '2px dashed gray' },
  }, 'Drop here');
}
\`\`\`

## Features

- MIME-like type system for drag payload classification.
- Drop zones only accept explicitly listed types.
- Visual drag preview overlay follows the cursor during drag operations.
- Escape key cancels the current drag.
- Source app ID is automatically injected via \`useAppId\` from the message bus.
- Drop zone hit-testing uses \`document.elementFromPoint\` with \`data-dropzone-id\` attribute matching.
- Enter/leave callbacks allow visual feedback on compatible drop targets.
`},{title:`AppMessageBus`,path:`components/layout/app-message-bus`,content:`# AppMessageBus

A publish/subscribe message bus for inter-app communication. Provides context-based messaging where apps can send typed messages to other apps (targeted or broadcast) and subscribe to specific channels.

## Import

\`\`\`ts
import {
  MessageBusProvider,
  AppContextProvider,
  useMessageBus,
  useAppId,
  useChannel,
} from '@aspect/layout/app-message-bus';
import type {
  AppMessage,
  MessageBusContextValue,
  MessageBusProviderProps,
  AppContextProviderProps,
} from '@aspect/layout/app-message-bus';
\`\`\`

## Provider Props

### MessageBusProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`children\` | \`unknown\` | \`undefined\` | Child elements with access to the message bus |

### AppContextProviderProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`appId\` | \`string\` | required | Unique identifier for the app |
| \`children\` | \`unknown\` | \`undefined\` | Child elements that inherit this app ID |

## AppMessage

| Field | Type | Description |
|-------|------|-------------|
| \`channel\` | \`string\` | Channel name (e.g., \`'clipboard'\`, \`'data-update'\`) |
| \`from\` | \`string\` | Sender app ID |
| \`to\` | \`string \\| null\` | Target app ID, or null for broadcast |
| \`payload\` | \`T\` | Message payload |
| \`timestamp\` | \`number\` | Timestamp (ms since epoch) |

## Hooks

### \`useMessageBus()\`

Returns a \`MessageBusContextValue\` with \`publish\`, \`subscribe\`, and \`subscribeAll\`. Automatically injects the current app's ID as the sender.

**Methods:**

| Method | Signature | Description |
|--------|-----------|-------------|
| \`publish\` | \`(channel: string, payload: T, to?: string) => void\` | Publish a message. Omit \`to\` for broadcast |
| \`subscribe\` | \`(channel: string, handler: (msg: AppMessage<T>) => void) => () => void\` | Subscribe to a channel. Returns unsubscribe function |
| \`subscribeAll\` | \`(handler: (msg: AppMessage) => void) => () => void\` | Subscribe to all messages (for debugging/logging) |

### \`useAppId()\`

Returns the current app's ID string from the nearest \`AppContextProvider\`.

### \`useChannel<T>(channel: string, handler: (msg: AppMessage<T>) => void)\`

Convenience hook that subscribes to a channel with automatic cleanup on unmount. Uses a ref for the handler to avoid stale closures.

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import {
  MessageBusProvider,
  AppContextProvider,
  useMessageBus,
  useChannel,
} from '@aspect/layout/app-message-bus';

// Wrap your app tree with both providers
const app = createElement(MessageBusProvider, {},
  createElement(AppContextProvider, { appId: 'editor' }, editorApp),
  createElement(AppContextProvider, { appId: 'preview' }, previewApp),
);

// In a sending component
function Editor() {
  const bus = useMessageBus();

  const handleSave = () => {
    bus.publish('file-saved', { path: '/doc.md' });
  };
}

// In a receiving component
function Preview() {
  useChannel('file-saved', (msg) => {
    console.log('File saved by:', msg.from, msg.payload);
  });
}

// Targeted message to a specific app
function Sender() {
  const bus = useMessageBus();
  bus.publish('clipboard', { text: 'Hello' }, 'editor');
}
\`\`\`

## Features

- Channel-based pub/sub with typed payloads.
- Targeted messages (specify \`to\` app ID) or broadcast (omit \`to\`).
- Broadcast messages skip the sender automatically.
- Targeted messages are only delivered to the specified app.
- \`subscribeAll\` enables cross-cutting concerns like logging or debugging.
- Subscriptions are stored in refs to avoid unnecessary re-renders.
- Each app identifies itself via \`AppContextProvider\`, and the message bus hooks automatically inject the sender ID.
`},{title:`Card`,path:`components/layout/card`,content:"# Card\n\nContent card with optional image, header (title, subtitle, action slot), body, and footer.\n\n## Import\n\n```ts\nimport { Card } from 'specifyjs/components/layout/card';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `string` | -- | Card title displayed in the header |\n| `subtitle` | `string` | -- | Subtitle shown below the title |\n| `headerAction` | `unknown` | -- | Slot rendered at the trailing edge of the header (e.g. an action button) |\n| `footer` | `unknown` | -- | Slot rendered as the card footer |\n| `image` | `string` | -- | URL for a top image |\n| `imageAlt` | `string` | `''` | Alt text for the top image |\n| `hoverable` | `boolean` | `false` | Enable hover elevation effect |\n| `bordered` | `boolean` | `true` | Show border |\n| `shadow` | `'none' \\| 'sm' \\| 'md' \\| 'lg'` | `'sm'` | Shadow level |\n| `padding` | `string` | `'16px'` | Inner padding (CSS value) |\n| `borderRadius` | `string` | `'8px'` | Border radius (CSS value) |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Body content |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { Card } from 'specifyjs/components/layout/card';\n\nconst card = createElement(\n  Card,\n  {\n    title: 'Project Update',\n    subtitle: 'Sprint 14 summary',\n    shadow: 'md',\n  },\n  'The sprint was completed on schedule with all deliverables met.',\n);\n```\n\n## Variants / Features\n\n### Basic card with body only\n\n```ts\ncreateElement(Card, null, 'Simple body content');\n```\n\n### Card with top image\n\n```ts\ncreateElement(\n  Card,\n  {\n    image: '/images/hero.jpg',\n    imageAlt: 'Hero banner',\n    title: 'Featured Article',\n  },\n  'Article body text...',\n);\n```\n\n### Header with action slot\n\nPlace a button or icon in the header action area.\n\n```ts\ncreateElement(\n  Card,\n  {\n    title: 'Settings',\n    headerAction: createElement('button', null, 'Edit'),\n  },\n  'Configuration details...',\n);\n```\n\n### Footer slot\n\n```ts\ncreateElement(\n  Card,\n  {\n    title: 'Invoice',\n    footer: createElement('button', null, 'Pay Now'),\n  },\n  'Invoice line items...',\n);\n```\n\n### Hoverable card\n\nAdds a pointer cursor and enables the `card--hoverable` CSS class for hover effects.\n\n```ts\ncreateElement(Card, { hoverable: true, title: 'Click me' }, 'Interactive card');\n```\n\n### Shadow levels\n\nFour shadow levels: `'none'`, `'sm'`, `'md'`, `'lg'`.\n\n```ts\ncreateElement(Card, { shadow: 'lg' }, 'High elevation card');\n```\n\n### Borderless card\n\n```ts\ncreateElement(Card, { bordered: false, shadow: 'md' }, 'No border, just shadow');\n```\n\n## Accessibility\n\n- The card renders as a plain `<div>`. No ARIA roles are applied by default.\n- When using `image`, an `<img>` element is rendered with the `imageAlt` prop as its `alt` attribute. Always provide meaningful alt text for informative images, or leave it empty for decorative ones.\n- If the card is `hoverable` and acts as a link or button, wrap it in an appropriate interactive element or add `role=\"button\"` and keyboard handlers to ensure it is accessible.\n- No keyboard shortcuts are added by the Card component itself.\n"},{title:`DesktopBackground`,path:`components/layout/desktop-background`,content:"# DesktopBackground\n\nFull-area workspace background with configurable color, gradient, or image. Supports right-click context menu integration and click handlers that only fire on direct background clicks (not bubbled from children).\n\n## Import\n\n```ts\nimport { DesktopBackground } from 'specifyjs/components/layout/desktop-background';\nimport type { DesktopBackgroundProps } from 'specifyjs/components/layout/desktop-background';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `backgroundColor` | `string` | `'#2c001e'` | Background color (Ubuntu aubergine default) |\n| `backgroundGradient` | `string` | `undefined` | CSS gradient string. Overrides `backgroundColor` if provided. |\n| `backgroundImage` | `string` | `undefined` | Background image URL. Rendered with cover/center. |\n| `backgroundImageOpacity` | `number` | `1` | Background image opacity (0-1). When less than 1, rendered as a separate overlay layer. |\n| `contextMenuItems` | `ContextMenuItem[]` | `undefined` | Context menu items shown on right-click of the background. |\n| `onClick` | `() => void` | `undefined` | Called when the background itself is clicked (not a child). |\n| `onDoubleClick` | `() => void` | `undefined` | Called when the background is double-clicked. |\n| `overflow` | `'hidden' \\| 'visible' \\| 'auto'` | `'visible'` | Overflow behavior. Use `'visible'` (default) when children use `position: absolute` (e.g., DraggableWindow). Use `'hidden'` to clip children at the container bounds. |\n| `children` | `unknown` | -- | Content rendered on top of the background |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { DesktopBackground } from 'specifyjs/components/layout/desktop-background';\n\nconst desktop = createElement(\n  DesktopBackground,\n  {\n    backgroundGradient: 'linear-gradient(135deg, #2c001e 0%, #5e2750 50%, #2c001e 100%)',\n    onClick: () => console.log('Background clicked'),\n  },\n  createElement('div', null, 'Desktop icons or windows here'),\n);\n```\n\n## Features\n\n### Solid color background\n\n```ts\ncreateElement(DesktopBackground, {\n  backgroundColor: '#1a1a2e',\n}, 'Content');\n```\n\n### Gradient background\n\n```ts\ncreateElement(DesktopBackground, {\n  backgroundGradient: 'linear-gradient(to bottom, #2c001e, #5e2750)',\n}, 'Content');\n```\n\n### Background image with opacity\n\nWhen `backgroundImageOpacity` is less than 1, the image is rendered as a separate absolutely-positioned overlay layer, allowing the color/gradient to show through.\n\n```ts\ncreateElement(DesktopBackground, {\n  backgroundColor: '#1a1a1a',\n  backgroundImage: '/wallpapers/mountains.jpg',\n  backgroundImageOpacity: 0.8,\n}, 'Content');\n```\n\n### Right-click context menu\n\nIntegrates with the ContextMenu overlay component. Items are shown when right-clicking directly on the background.\n\n```ts\ncreateElement(DesktopBackground, {\n  contextMenuItems: [\n    { label: 'Change Wallpaper', onClick: () => {} },\n    { label: 'Display Settings', onClick: () => {} },\n    { type: 'separator' },\n    { label: 'Open Terminal', onClick: () => {} },\n  ],\n}, 'Content');\n```\n\n### Click filtering\n\nThe `onClick` and `onDoubleClick` handlers only fire when clicking the background element directly. Clicks on child elements do not trigger these handlers.\n\n## Accessibility\n\n- The container has `role=\"application\"` and `aria-label=\"Desktop workspace\"`.\n- Image overlay layer is marked `aria-hidden=\"true\"` since it is purely decorative.\n- Sets `data-theme=\"dark\"` for downstream theming.\n- Children are rendered in a relatively-positioned wrapper above the image overlay to ensure correct stacking.\n"},{title:`DraggableWindow`,path:`components/layout/draggable-window`,content:"# DraggableWindow\n\nDesktop-style draggable, resizable window component. Provides window chrome with title bar, window controls (minimize, maximize, close), drag-to-move, 8-direction resize handles, edge snapping, boundary clamping, and focus management.\n\n## Import\n\n```ts\nimport { DraggableWindow } from 'specifyjs/components/layout/draggable-window';\nimport type { DraggableWindowProps } from 'specifyjs/components/layout/draggable-window';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `id` | `string` | *required* | Unique window identifier |\n| `title` | `string` | *required* | Window title displayed in the title bar |\n| `icon` | `string` | `undefined` | Optional icon (URL or emoji) displayed left of the title |\n| `defaultPosition` | `{ x: number; y: number }` | `{ x: 50, y: 50 }` | Initial position relative to the containing element (pixels) |\n| `defaultSize` | `{ width: number; height: number }` | `{ width: 400, height: 300 }` | Initial size (pixels) |\n| `minSize` | `{ width: number; height: number }` | `{ width: 200, height: 150 }` | Minimum size constraints (pixels) |\n| `maxSize` | `{ width: number; height: number }` | `undefined` | Maximum size constraints (pixels) |\n| `resizable` | `boolean` | `true` | Whether the window can be resized |\n| `draggable` | `boolean` | `true` | Whether the window can be dragged |\n| `windowState` | `'normal' \\| 'maximized' \\| 'minimized'` | `'normal'` | Current window state |\n| `focused` | `boolean` | `true` | Whether the window is currently focused (determines title bar styling) |\n| `zIndex` | `number` | `undefined` | Z-index for stacking order |\n| `onClose` | `() => void` | `undefined` | Called when the user clicks the close button |\n| `onMinimize` | `() => void` | `undefined` | Called when the user clicks the minimize button |\n| `onMaximize` | `() => void` | `undefined` | Called when the user clicks the maximize/restore button |\n| `onFocus` | `() => void` | `undefined` | Called when the window is clicked (for focus management) |\n| `onMove` | `(position: { x: number; y: number }) => void` | `undefined` | Called when the window is moved. Reports final position. |\n| `onResize` | `(size: { width: number; height: number }) => void` | `undefined` | Called when the window is resized. Reports final size. |\n| `children` | `unknown` | -- | Application content rendered inside the window body |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { DraggableWindow } from 'specifyjs/components/layout/draggable-window';\n\nconst window = createElement(\n  DraggableWindow,\n  {\n    id: 'editor',\n    title: 'Text Editor',\n    icon: '/icons/editor.svg',\n    defaultPosition: { x: 100, y: 80 },\n    defaultSize: { width: 600, height: 400 },\n    onClose: () => console.log('Window closed'),\n    onFocus: () => console.log('Window focused'),\n  },\n  createElement('div', null, 'Window body content'),\n);\n```\n\n## Features\n\n### Drag-to-move\n\nDrag the title bar to reposition the window. The window is clamped to the parent container bounds.\n\n```ts\ncreateElement(DraggableWindow, {\n  id: 'movable',\n  title: 'Drag Me',\n  onMove: (pos) => console.log('Moved to', pos.x, pos.y),\n}, 'Content');\n```\n\n### 8-direction resizing\n\nResize handles on all edges and corners allow proportional resizing. Size is clamped between `minSize` and `maxSize`.\n\n```ts\ncreateElement(DraggableWindow, {\n  id: 'resizable',\n  title: 'Resize Me',\n  minSize: { width: 300, height: 200 },\n  maxSize: { width: 800, height: 600 },\n  onResize: (size) => console.log('Resized to', size.width, size.height),\n}, 'Content');\n```\n\n### Edge snapping\n\nDragging the window to the left or right screen edge snaps it to fill half the workspace. Dragging to the top edge triggers maximize. A blue preview overlay shows the snap zone before release.\n\n### Window states\n\n```ts\n// Maximized: fills the entire parent container\ncreateElement(DraggableWindow, {\n  id: 'max',\n  title: 'Maximized',\n  windowState: 'maximized',\n  onMaximize: () => console.log('Toggle maximize'),\n}, 'Content');\n\n// Minimized: renders nothing (hidden)\ncreateElement(DraggableWindow, {\n  id: 'min',\n  title: 'Minimized',\n  windowState: 'minimized',\n}, 'Content');\n```\n\n### Window controls\n\nThe title bar includes three colored buttons: minimize (orange), maximize/restore (green), and close (red). Double-clicking the title bar also triggers maximize/restore.\n\n### Non-draggable / non-resizable\n\n```ts\ncreateElement(DraggableWindow, {\n  id: 'fixed',\n  title: 'Fixed Window',\n  draggable: false,\n  resizable: false,\n}, 'Cannot move or resize this window');\n```\n\n## Accessibility\n\n- The window container has `role=\"dialog\"` and `aria-label` set to the window title.\n- The title bar has `role=\"toolbar\"` with `aria-label` describing the window controls.\n- Window control buttons have descriptive `aria-label` attributes (\"Minimize\", \"Maximize\", \"Restore\", \"Close\").\n- The window element has `tabIndex={-1}` for programmatic focus management.\n- Pressing `Escape` when the window is focused triggers the `onClose` callback.\n- Focus and unfocus states are reflected with distinct shadow and opacity styling.\n"},{title:`FlexContainer`,path:`components/layout/flex-container`,content:"# FlexContainer\n\nDeclarative flexbox layout container with direction, wrap, gap, and alignment props.\n\n## Import\n\n```ts\nimport { FlexContainer, FlexItem } from 'specifyjs/components/layout/flex-container';\n```\n\n## Props\n\n### FlexContainer\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `direction` | `'row' \\| 'row-reverse' \\| 'column' \\| 'column-reverse'` | `'row'` | Flex direction |\n| `wrap` | `'nowrap' \\| 'wrap' \\| 'wrap-reverse'` | `'nowrap'` | Flex wrap behavior |\n| `gap` | `string` | -- | Gap between items (CSS value) |\n| `alignItems` | `string` | -- | CSS `align-items` |\n| `justifyContent` | `string` | -- | CSS `justify-content` |\n| `inline` | `boolean` | `false` | Use `inline-flex` instead of `flex` |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Children |\n\n### FlexItem\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `flex` | `string` | -- | Shorthand `flex` property (e.g. `'1 1 auto'`) |\n| `grow` | `number` | -- | `flex-grow` |\n| `shrink` | `number` | -- | `flex-shrink` |\n| `basis` | `string` | -- | `flex-basis` |\n| `alignSelf` | `string` | -- | `align-self` override |\n| `order` | `number` | -- | Item `order` |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Children |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { FlexContainer, FlexItem } from 'specifyjs/components/layout/flex-container';\n\nconst toolbar = createElement(\n  FlexContainer,\n  { direction: 'row', gap: '8px', alignItems: 'center' },\n  createElement(FlexItem, { flex: '1' }, 'Title'),\n  createElement(FlexItem, null, 'Action'),\n);\n```\n\n## Variants / Features\n\n### Row layout (default)\n\nItems flow horizontally left-to-right.\n\n```ts\ncreateElement(FlexContainer, { gap: '12px' }, ...children);\n```\n\n### Column layout\n\nStack items vertically.\n\n```ts\ncreateElement(FlexContainer, { direction: 'column', gap: '16px' }, ...children);\n```\n\n### Wrapping\n\nAllow items to wrap onto multiple lines.\n\n```ts\ncreateElement(FlexContainer, { wrap: 'wrap', gap: '8px' }, ...children);\n```\n\n### Inline flex\n\nRender as an inline-level flex container so it participates in text flow.\n\n```ts\ncreateElement(FlexContainer, { inline: true, gap: '4px' }, ...children);\n```\n\n### Per-item control with FlexItem\n\nOverride grow, shrink, basis, alignment, and order on individual children.\n\n```ts\ncreateElement(\n  FlexContainer,\n  { gap: '8px' },\n  createElement(FlexItem, { grow: 1, shrink: 0 }, 'Sidebar'),\n  createElement(FlexItem, { grow: 3 }, 'Main content'),\n);\n```\n\n### Alignment\n\nCenter items both horizontally and vertically.\n\n```ts\ncreateElement(\n  FlexContainer,\n  { alignItems: 'center', justifyContent: 'space-between' },\n  ...children,\n);\n```\n\n## Accessibility\n\n- FlexContainer renders a plain `<div>` with `display: flex`. No ARIA roles are applied by default since flexbox is a visual layout mechanism.\n- Visual order may differ from DOM order when using `order` or reverse directions. Ensure that the reading order remains logical for screen reader users.\n- No keyboard shortcuts are added by the FlexContainer component itself.\n"},{title:`Footer`,path:`components/layout/footer`,content:"# Footer\n\nA three-column footer with left, center, and right content areas. Uses flexbox layout with configurable styling and a max-width inner container.\n\n## Import\n\n```ts\nimport { Footer } from '@aspect/layout/footer';\nimport type { FooterProps } from '@aspect/layout/footer';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `left` | `unknown` | `undefined` | Content for the left section |\n| `center` | `unknown` | `undefined` | Content for the center section |\n| `right` | `unknown` | `undefined` | Content for the right section |\n| `borderTop` | `string` | `'1px solid var(--color-border, #e2e8f0)'` | Top border style |\n| `background` | `string` | `'var(--color-bg, transparent)'` | Background color |\n| `color` | `string` | `'var(--color-text-muted, #64748b)'` | Text color |\n| `fontSize` | `string` | `'13px'` | Font size |\n| `padding` | `string` | `'24px'` | Padding |\n| `maxWidth` | `string` | `'1200px'` | Max width for the inner container |\n| `className` | `string` | `undefined` | CSS class name |\n| `ariaLabel` | `string` | `'Site footer'` | ARIA label for the footer landmark |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Footer } from '@aspect/layout/footer';\n\n// Basic footer\nconst footer = createElement(Footer, {\n  left: createElement('span', null, '\\u00A9 2026 My Company'),\n  center: createElement('span', null, 'Built with SpecifyJS'),\n  right: createElement('a', { href: '/privacy' }, 'Privacy Policy'),\n});\n\n// Footer with custom styling\nconst styled = createElement(Footer, {\n  left: 'Copyright 2026',\n  center: 'v1.2.3',\n  right: 'All rights reserved',\n  background: '#1e293b',\n  color: '#94a3b8',\n  padding: '32px',\n  maxWidth: '960px',\n});\n\n// Minimal footer\nconst minimal = createElement(Footer, {\n  center: createElement('span', null, 'Powered by SpecifyJS'),\n});\n```\n\n## Features\n\n- Three-column flexbox layout with equal-width sections (left, center, right).\n- Each section has a minimum width of 150px and wraps on narrow screens via `flexWrap: wrap`.\n- Sections are text-aligned left, center, and right respectively.\n- Inner container is centered with a configurable max width.\n- A top margin of 48px provides spacing from preceding content.\n- Supports CSS custom properties for theme integration (`--color-border`, `--color-bg`, `--color-text-muted`).\n\n## Accessibility\n\n- Renders as a `<footer>` element with `role=\"contentinfo\"`.\n- `aria-label` defaults to `'Site footer'` and can be customized.\n"},{title:`Grid`,path:`components/layout/grid`,content:"# Grid\n\nCSS Grid layout container with declarative column, row, gap, area, and responsive breakpoint support.\n\n## Import\n\n```ts\nimport { Grid, GridItem } from 'specifyjs/components/layout/grid';\n```\n\n## Props\n\n### Grid\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `columns` | `number \\| string` | -- | Number of equal columns or a CSS `grid-template-columns` string |\n| `rows` | `string` | -- | CSS `grid-template-rows` value |\n| `gap` | `string` | -- | Gap between grid cells (e.g. `'16px'` or `'1rem 2rem'`) |\n| `alignItems` | `string` | -- | CSS `align-items` for the grid container |\n| `justifyItems` | `string` | -- | CSS `justify-items` for the grid container |\n| `minColWidth` | `string` | -- | When set, uses `auto-fit` with `minmax(minColWidth, 1fr)` for responsive columns |\n| `areas` | `string[]` | -- | Named grid areas (`grid-template-areas` lines) |\n| `responsive` | `GridBreakpoint[]` | -- | Responsive breakpoints rendered as inline style overrides |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Children |\n\n### GridItem\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `gridColumn` | `string` | -- | `grid-column` value (e.g. `'span 2'`, `'1 / 3'`) |\n| `gridRow` | `string` | -- | `grid-row` value |\n| `gridArea` | `string` | -- | `grid-area` name |\n| `alignSelf` | `string` | -- | CSS `align-self` |\n| `justifySelf` | `string` | -- | CSS `justify-self` |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Children |\n\n### GridBreakpoint\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `minWidth` | `string` | -- | Min-width media query value (e.g. `'768px'`) |\n| `columns` | `number \\| string` | -- | Column template override at this breakpoint |\n| `rows` | `string` | -- | Row template override |\n| `gap` | `string` | -- | Gap override |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { Grid, GridItem } from 'specifyjs/components/layout/grid';\n\nconst layout = createElement(\n  Grid,\n  { columns: 3, gap: '16px' },\n  createElement(GridItem, null, 'Cell 1'),\n  createElement(GridItem, { gridColumn: 'span 2' }, 'Cell 2 (wide)'),\n  createElement(GridItem, null, 'Cell 3'),\n);\n```\n\n## Variants / Features\n\n### Equal columns by number\n\nPass an integer to `columns` to create that many equal-width columns using `repeat(N, 1fr)`.\n\n```ts\ncreateElement(Grid, { columns: 4, gap: '12px' }, ...children);\n```\n\n### Custom column template\n\nPass a full CSS string for fine-grained control.\n\n```ts\ncreateElement(Grid, { columns: '200px 1fr 1fr', gap: '8px' }, ...children);\n```\n\n### Auto-fit responsive columns\n\nUse `minColWidth` to create a responsive grid that automatically fits as many columns as possible.\n\n```ts\ncreateElement(Grid, { minColWidth: '250px', gap: '16px' }, ...children);\n```\n\n### Named grid areas\n\nDefine named areas and place items with `gridArea`.\n\n```ts\ncreateElement(\n  Grid,\n  {\n    areas: ['header header', 'sidebar main', 'footer footer'],\n    columns: '200px 1fr',\n    rows: 'auto 1fr auto',\n    gap: '8px',\n  },\n  createElement(GridItem, { gridArea: 'header' }, 'Header'),\n  createElement(GridItem, { gridArea: 'sidebar' }, 'Sidebar'),\n  createElement(GridItem, { gridArea: 'main' }, 'Main'),\n  createElement(GridItem, { gridArea: 'footer' }, 'Footer'),\n);\n```\n\n### Alignment\n\nControl cross-axis and main-axis alignment of all items.\n\n```ts\ncreateElement(Grid, { columns: 3, alignItems: 'center', justifyItems: 'stretch' }, ...children);\n```\n\n## Accessibility\n\n- Grid renders a plain `<div>` with `display: grid`. It does not add any ARIA roles by default since CSS Grid is a visual layout mechanism, not a semantic structure.\n- Use appropriate semantic elements or ARIA landmarks inside grid cells to convey meaning to assistive technologies.\n- No keyboard shortcuts are added by the Grid component itself.\n"},{title:`Panel`,path:`components/layout/panel`,content:"# Panel\n\nCollapsible panel with a header bar, optional icon, and animated expand/collapse transition.\n\n## Import\n\n```ts\nimport { Panel } from 'specifyjs/components/layout/panel';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `string` | -- | Panel title |\n| `collapsible` | `boolean` | `false` | Whether the panel can be collapsed |\n| `defaultCollapsed` | `boolean` | `false` | Initial collapsed state when collapsible |\n| `icon` | `unknown` | -- | Icon element rendered before the title |\n| `headerRight` | `unknown` | -- | Slot rendered at the trailing edge of the header |\n| `bordered` | `boolean` | `true` | Show border |\n| `shadow` | `'none' \\| 'sm' \\| 'md'` | `'none'` | Shadow level |\n| `style` | `Record<string, string>` | -- | Extra inline styles |\n| `className` | `string` | -- | Extra class name |\n| `children` | `unknown` | -- | Body content |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { Panel } from 'specifyjs/components/layout/panel';\n\nconst panel = createElement(\n  Panel,\n  { title: 'Details', collapsible: true },\n  'Panel body content goes here.',\n);\n```\n\n## Variants / Features\n\n### Static panel (non-collapsible)\n\nA simple panel with a header bar and body.\n\n```ts\ncreateElement(Panel, { title: 'Information' }, 'Static content');\n```\n\n### Collapsible panel\n\nClick the header to toggle the body. An animated chevron indicates the current state.\n\n```ts\ncreateElement(\n  Panel,\n  { title: 'Advanced Options', collapsible: true, defaultCollapsed: true },\n  'Hidden by default, click header to expand.',\n);\n```\n\n### Panel with icon\n\n```ts\ncreateElement(\n  Panel,\n  { title: 'Notifications', icon: createElement('span', null, 'icon') },\n  'Notification list...',\n);\n```\n\n### Header right slot\n\nPlace actions or badges in the trailing header area.\n\n```ts\ncreateElement(\n  Panel,\n  {\n    title: 'Tasks',\n    headerRight: createElement('span', null, '3 remaining'),\n  },\n  'Task list...',\n);\n```\n\n### Shadow variants\n\n```ts\ncreateElement(Panel, { title: 'Elevated', shadow: 'md' }, 'Content with medium shadow');\n```\n\n### Borderless\n\n```ts\ncreateElement(Panel, { title: 'Clean', bordered: false }, 'No border panel');\n```\n\n## Accessibility\n\n- When `collapsible` is `true`, the header element receives `role=\"button\"` and `aria-expanded` set to `\"true\"` or `\"false\"` reflecting the current state.\n- The header is clickable to toggle collapse. Users can activate it by clicking.\n- The collapse animation uses `max-height` transition for a smooth expand/collapse effect.\n- When `collapsible` is `false`, no interactive ARIA attributes are added to the header.\n- No additional keyboard shortcuts are added beyond standard button activation (Enter/Space when focused).\n"},{title:`ScrollContainer`,path:`components/layout/scroll-container`,content:`# ScrollContainer

Scrollable container with configurable direction, scrollbar visibility, optional inset edge shadows, and padding.

## Import

\`\`\`ts
import { ScrollContainer } from 'specifyjs/components/layout/scroll-container';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`maxHeight\` | \`string\` | -- | Maximum height (CSS value) |
| \`maxWidth\` | \`string\` | -- | Maximum width (CSS value) |
| \`direction\` | \`'vertical' \\| 'horizontal' \\| 'both'\` | \`'vertical'\` | Scroll direction. Axes not included are set to \`overflow: hidden\`. |
| \`showScrollbar\` | \`'auto' \\| 'always' \\| 'hover' \\| 'never'\` | \`'auto'\` | Scrollbar visibility mode |
| \`padding\` | \`string\` | -- | Inner padding (CSS value) |
| \`shadow\` | \`boolean\` | \`false\` | Show inset shadow at scroll edges to hint overflow |
| \`style\` | \`Record<string, string>\` | -- | Extra inline styles |
| \`className\` | \`string\` | -- | Extra class name |
| \`children\` | \`unknown\` | -- | Children |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { ScrollContainer } from 'specifyjs/components/layout/scroll-container';

const scrollable = createElement(
  ScrollContainer,
  { maxHeight: '400px', shadow: true },
  createElement('div', null, 'Long content that overflows...'),
);
\`\`\`

## Variants / Features

### Vertical scroll (default)

Constrains height and scrolls vertically. Horizontal overflow is hidden.

\`\`\`ts
createElement(
  ScrollContainer,
  { maxHeight: '300px' },
  ...longContentList,
);
\`\`\`

### Horizontal scroll

Constrains width and scrolls horizontally. Vertical overflow is hidden.

\`\`\`ts
createElement(
  ScrollContainer,
  { direction: 'horizontal', maxWidth: '600px' },
  createElement('div', { style: { whiteSpace: 'nowrap', width: '2000px' } }, 'Wide content'),
);
\`\`\`

### Bidirectional scroll

Allows scrolling in both axes.

\`\`\`ts
createElement(
  ScrollContainer,
  { direction: 'both', maxHeight: '400px', maxWidth: '600px' },
  largeContent,
);
\`\`\`

### Edge shadow indicators

When \`shadow\` is \`true\`, inset shadows appear on edges where content overflows, providing a visual hint that more content is available.

\`\`\`ts
createElement(
  ScrollContainer,
  { maxHeight: '200px', shadow: true },
  ...items,
);
\`\`\`

### Scrollbar visibility

Control when scrollbars appear.

\`\`\`ts
// Always show thin scrollbars
createElement(ScrollContainer, { maxHeight: '300px', showScrollbar: 'always' }, ...children);

// Hide scrollbars entirely (content is still scrollable)
createElement(ScrollContainer, { maxHeight: '300px', showScrollbar: 'never' }, ...children);

// Thin scrollbar on hover
createElement(ScrollContainer, { maxHeight: '300px', showScrollbar: 'hover' }, ...children);
\`\`\`

### Custom padding

\`\`\`ts
createElement(
  ScrollContainer,
  { maxHeight: '400px', padding: '16px' },
  ...children,
);
\`\`\`

## Accessibility

- ScrollContainer renders a plain \`<div>\` with overflow styles. No ARIA roles are applied by default.
- The container is natively scrollable, meaning it is keyboard-accessible via standard browser behavior (arrow keys, Page Up/Down, Home/End when focused).
- The \`shadow\` feature is purely visual and does not affect assistive technology output.
- The \`showScrollbar: 'never'\` mode hides scrollbars using \`scrollbar-width: none\` but does not prevent scrolling, so content remains accessible via keyboard and touch.
- No additional keyboard shortcuts are added by the ScrollContainer component itself.
`},{title:`Splitter`,path:`components/layout/splitter`,content:`# Splitter

Resizable split pane that renders exactly two child panes separated by a draggable divider bar.

## Import

\`\`\`ts
import { Splitter } from 'specifyjs/components/layout/splitter';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`direction\` | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` | Split direction. Horizontal creates left/right panes; vertical creates top/bottom panes. |
| \`initialSplit\` | \`number\` | \`50\` | Initial split percentage for the first pane |
| \`minSize\` | \`number\` | \`50\` | Minimum size of either pane in pixels |
| \`maxSize\` | \`number\` | -- | Maximum size of the first pane in pixels |
| \`dividerSize\` | \`number\` | \`6\` | Divider bar width (horizontal) or height (vertical) in pixels |
| \`style\` | \`Record<string, string>\` | -- | Extra inline styles for the container |
| \`className\` | \`string\` | -- | Extra class name |
| \`children\` | \`unknown[]\` | -- | Exactly two children |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { Splitter } from 'specifyjs/components/layout/splitter';

const splitView = createElement(
  Splitter,
  { direction: 'horizontal', initialSplit: 30 },
  createElement('div', null, 'Left pane (sidebar)'),
  createElement('div', null, 'Right pane (main content)'),
);
\`\`\`

## Variants / Features

### Horizontal split (default)

Creates side-by-side left and right panes.

\`\`\`ts
createElement(
  Splitter,
  { initialSplit: 50 },
  createElement('div', null, 'Left'),
  createElement('div', null, 'Right'),
);
\`\`\`

### Vertical split

Creates top and bottom panes.

\`\`\`ts
createElement(
  Splitter,
  { direction: 'vertical', initialSplit: 60 },
  createElement('div', null, 'Top'),
  createElement('div', null, 'Bottom'),
);
\`\`\`

### Constrained sizing

Set minimum and maximum pane sizes to prevent collapsing or over-expanding.

\`\`\`ts
createElement(
  Splitter,
  { minSize: 100, maxSize: 400, initialSplit: 30 },
  createElement('div', null, 'Sidebar'),
  createElement('div', null, 'Content'),
);
\`\`\`

### Custom divider size

\`\`\`ts
createElement(
  Splitter,
  { dividerSize: 2, initialSplit: 50 },
  createElement('div', null, 'Pane A'),
  createElement('div', null, 'Pane B'),
);
\`\`\`

## Accessibility

- The divider element has \`role="separator"\` to identify it as a structural boundary between panes.
- \`aria-orientation\` is set on the divider: \`"vertical"\` for horizontal splits (the divider itself is a vertical bar) and \`"horizontal"\` for vertical splits.
- Resizing is performed via mouse drag (mousedown/mousemove/mouseup). During a drag, the document cursor changes to \`col-resize\` or \`row-resize\` and text selection is disabled.
- The component does not currently implement keyboard-based resizing. For full accessibility, consider adding arrow key handlers on the divider to adjust the split percentage incrementally.
`},{title:`Tabs`,path:`components/layout/tabs`,content:`# Tabs

Tabbed content container with configurable position, visual variant, keyboard navigation, and full ARIA support.

## Import

\`\`\`ts
import { Tabs } from 'specifyjs/components/layout/tabs';
\`\`\`

## Props

### Tabs

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`tabs\` | \`TabDefinition[]\` | -- | Tab definitions (required) |
| \`activeTab\` | \`string\` | -- | Controlled active tab id. When omitted, the component manages its own state. |
| \`onChange\` | \`(tabId: string) => void\` | -- | Callback invoked when the active tab changes |
| \`position\` | \`'top' \\| 'bottom' \\| 'left' \\| 'right'\` | \`'top'\` | Position of the tab list relative to the panel |
| \`variant\` | \`'line' \\| 'card' \\| 'pill'\` | \`'line'\` | Visual style of the tab buttons |
| \`style\` | \`Record<string, string>\` | -- | Extra inline styles |
| \`className\` | \`string\` | -- | Extra class name |

### TabDefinition

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`id\` | \`string\` | -- | Unique tab identifier (required) |
| \`label\` | \`string\` | -- | Display label (required) |
| \`icon\` | \`unknown\` | -- | Optional icon element |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`content\` | \`unknown\` | -- | Tab panel content (required) |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { Tabs } from 'specifyjs/components/layout/tabs';

const tabView = createElement(Tabs, {
  tabs: [
    { id: 'overview', label: 'Overview', content: 'Overview content here' },
    { id: 'details', label: 'Details', content: 'Detailed information' },
    { id: 'settings', label: 'Settings', content: 'Settings panel' },
  ],
});
\`\`\`

## Variants / Features

### Line variant (default)

An underline indicator marks the active tab.

\`\`\`ts
createElement(Tabs, { variant: 'line', tabs: [...] });
\`\`\`

### Card variant

Active tab appears as a raised card with a border, visually connected to the panel.

\`\`\`ts
createElement(Tabs, { variant: 'card', tabs: [...] });
\`\`\`

### Pill variant

Active tab is highlighted with a filled pill/capsule shape.

\`\`\`ts
createElement(Tabs, { variant: 'pill', tabs: [...] });
\`\`\`

### Tab list position

Place the tab list on any side of the content panel.

\`\`\`ts
createElement(Tabs, { position: 'left', tabs: [...] });
createElement(Tabs, { position: 'bottom', tabs: [...] });
\`\`\`

### Disabled tabs

Individual tabs can be disabled. Disabled tabs cannot be selected via click or keyboard.

\`\`\`ts
createElement(Tabs, {
  tabs: [
    { id: 'a', label: 'Active', content: '...' },
    { id: 'b', label: 'Disabled', disabled: true, content: '...' },
  ],
});
\`\`\`

### Tabs with icons

\`\`\`ts
createElement(Tabs, {
  tabs: [
    { id: 'home', label: 'Home', icon: createElement('span', null, 'icon'), content: '...' },
  ],
});
\`\`\`

### Controlled mode

Pass \`activeTab\` and \`onChange\` to control the active tab externally.

\`\`\`ts
createElement(Tabs, {
  activeTab: currentTab,
  onChange: (id) => setCurrentTab(id),
  tabs: [...],
});
\`\`\`

## Accessibility

- The tab list container has \`role="tablist"\` with \`aria-orientation\` set to \`"horizontal"\` or \`"vertical"\` depending on the \`position\` prop.
- Each tab button has \`role="tab"\`, \`aria-selected\` (\`"true"\` or \`"false"\`), and \`aria-controls\` pointing to its associated panel id.
- Disabled tabs receive \`aria-disabled="true"\`.
- The active tab has \`tabIndex="0"\`; all other tabs have \`tabIndex="-1"\`, implementing the roving tabindex pattern.
- The tab panel has \`role="tabpanel"\`, \`aria-labelledby\` pointing to its tab button, and \`tabIndex="0"\` so it is focusable.
- **Keyboard shortcuts:**
  - **ArrowLeft / ArrowRight** (horizontal position): Move focus to the previous/next enabled tab.
  - **ArrowUp / ArrowDown** (vertical position): Move focus to the previous/next enabled tab.
  - **Home**: Move focus to the first enabled tab.
  - **End**: Move focus to the last enabled tab.
  - Arrow keys wrap around from first to last and vice versa.
`},{title:`WindowManager`,path:`components/layout/window-manager`,content:"# WindowManager\n\nContext-based provider that manages multiple window states. Tracks positions, sizes, z-order, focus, and minimized/maximized state. Exposes an imperative API via context for opening, closing, focusing, and arranging windows.\n\n## Import\n\n```ts\nimport { WindowManagerProvider, useWindowManager } from 'specifyjs/components/layout/window-manager';\nimport type { WindowManagerProps, WindowManagerContextValue, WindowState } from 'specifyjs/components/layout/window-manager';\n```\n\n## Props (WindowManagerProvider)\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `workspaceBounds` | `{ top: number; left: number; width: number; height: number }` | `{ top: 0, left: 0, width: 1920, height: 1080 }` | Workspace bounds for tiling and cascade calculations |\n| `defaultWindowSize` | `{ width: number; height: number }` | `{ width: 600, height: 400 }` | Default size for new windows |\n| `cascadeOffset` | `{ x: number; y: number }` | `{ x: 30, y: 30 }` | Position offset for cascading new windows |\n| `onWindowOpen` | `(id: string) => void` | `undefined` | Called when any window is opened |\n| `onWindowClose` | `(id: string) => void` | `undefined` | Called when any window is closed |\n| `onFocusChange` | `(id: string \\| null) => void` | `undefined` | Called when focus changes |\n| `children` | `unknown` | -- | Descendant components that consume the window manager context |\n\n## Context API (useWindowManager)\n\n| Method | Signature | Description |\n|--------|-----------|-------------|\n| `windows` | `WindowState[]` | All currently tracked windows |\n| `openWindow` | `(config: { id, title, icon?, position?, size?, appProps? }) => void` | Open a new window or focus it if already open |\n| `closeWindow` | `(id: string) => void` | Close and remove a window |\n| `focusWindow` | `(id: string) => void` | Raise a window to the top and set it as focused |\n| `minimizeWindow` | `(id: string) => void` | Minimize a window |\n| `maximizeWindow` | `(id: string) => void` | Maximize a window to fill the workspace |\n| `restoreWindow` | `(id: string) => void` | Restore a window from maximized or minimized to normal |\n| `moveWindow` | `(id: string, position: { x, y }) => void` | Update a window's position |\n| `resizeWindow` | `(id: string, size: { width, height }) => void` | Update a window's size |\n| `tileWindows` | `() => void` | Tile all open, non-minimized windows in a grid |\n| `cascadeWindows` | `() => void` | Cascade all open, non-minimized windows with offset stacking |\n| `minimizeAll` | `() => void` | Minimize all windows |\n| `focusedWindowId` | `string \\| null` | Currently focused window ID, or null |\n\n## WindowState\n\n| Property | Type | Description |\n|----------|------|-------------|\n| `id` | `string` | Unique window identifier |\n| `title` | `string` | Window title |\n| `icon` | `string \\| undefined` | Optional icon |\n| `position` | `{ x: number; y: number }` | Current position (pixels) |\n| `size` | `{ width: number; height: number }` | Current size (pixels) |\n| `windowState` | `'normal' \\| 'maximized' \\| 'minimized'` | Window display state |\n| `zIndex` | `number` | Z-index for stacking order |\n| `focused` | `boolean` | Whether this window is currently focused |\n| `appProps` | `Record<string, unknown> \\| undefined` | Application-specific props |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs/core';\nimport { WindowManagerProvider, useWindowManager } from 'specifyjs/components/layout/window-manager';\n\n// Wrap your app in the provider\nconst app = createElement(\n  WindowManagerProvider,\n  {\n    workspaceBounds: { top: 28, left: 48, width: 1872, height: 1052 },\n    onFocusChange: (id) => console.log('Focused:', id),\n  },\n  createElement(MyDesktopContent, null),\n);\n\n// Inside a descendant component, use the hook\nfunction MyDesktopContent() {\n  const wm = useWindowManager();\n\n  const handleOpen = () => {\n    wm.openWindow({\n      id: 'editor',\n      title: 'Text Editor',\n      icon: '/icons/editor.svg',\n      size: { width: 800, height: 600 },\n    });\n  };\n\n  return createElement('button', { onClick: handleOpen }, 'Open Editor');\n}\n```\n\n## Features\n\n- **Auto-cascade positioning** -- new windows are offset from the previous window to prevent stacking directly on top.\n- **Z-order management** -- focusing a window brings it to the top. Z-indices are compacted periodically to prevent overflow.\n- **Focus transfer** -- closing or minimizing the focused window automatically focuses the next highest z-order window.\n- **Tile mode** -- arranges all non-minimized windows in an adaptive grid layout (1, 2, 3, or NxM grid).\n- **Cascade mode** -- offsets all non-minimized windows in stacking order.\n- **Minimize all** -- minimizes all windows and clears focus (show desktop).\n\n## Notes\n\n- WindowManagerProvider must wrap any components that use `useWindowManager()`.\n- Windows that are already open are focused (not duplicated) when `openWindow` is called with the same `id`.\n- The context compacts z-indices when they exceed 1000 to prevent integer overflow in long-running sessions.\n"},{title:`ContextMenu`,path:`components/overlay/context-menu`,content:`# ContextMenu

Right-click context menu with nested submenus and keyboard navigation.

## Import

\`\`\`typescript
import { ContextMenu } from '@specifyjs/context-menu';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`ContextMenuItem[]\` | -- | Menu item definitions |
| \`children\` | \`unknown\` | \`undefined\` | Trigger area children |

### ContextMenuItem

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`label\` | \`string\` | \`undefined\` | Display label |
| \`onClick\` | \`() => void\` | \`undefined\` | Click handler |
| \`icon\` | \`string\` | \`undefined\` | Optional icon (rendered as text/emoji) |
| \`disabled\` | \`boolean\` | \`false\` | Disabled state |
| \`divider\` | \`boolean\` | \`false\` | Render as a divider instead of a menu item |
| \`children\` | \`ContextMenuItem[]\` | \`undefined\` | Nested submenu items |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { ContextMenu } from '@specifyjs/context-menu';

function App() {
  const items = [
    { label: 'Cut', icon: '\\\\u2702', onClick: () => console.log('Cut') },
    { label: 'Copy', onClick: () => console.log('Copy') },
    { label: 'Paste', onClick: () => console.log('Paste') },
    { divider: true },
    {
      label: 'More',
      children: [
        { label: 'Select All', onClick: () => console.log('Select All') },
        { label: 'Find...', onClick: () => console.log('Find') },
      ],
    },
  ];

  return createElement(ContextMenu, { items },
    createElement('div', { style: { padding: '40px', border: '1px dashed #ccc' } },
      'Right-click here',
    ),
  );
}
\`\`\`

## Features

- Triggered by right-click (\`contextmenu\` event) on the child area
- Nested submenus with recursive rendering at arbitrary depth
- Divider items for visual separation between groups
- Optional icons per menu item
- Disabled state support for individual items
- Fixed positioning at the cursor location
- Click-outside to close
- Escape key to close

## Accessibility

- Menu items use \`role="menuitem"\`
- Container uses \`role="menu"\`
- Disabled items include \`aria-disabled="true"\`
- Full keyboard navigation: Arrow Up/Down to move, Arrow Right to open submenu, Arrow Left to close submenu, Enter to activate, Escape to close
`},{title:`Drawer`,path:`components/overlay/drawer`,content:"# Drawer\n\nSlide-in panel from any edge with optional overlay backdrop.\n\n## Import\n\n```typescript\nimport { Drawer } from '@specifyjs/drawer';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `open` | `boolean` | -- | Whether the drawer is open |\n| `onClose` | `() => void` | -- | Called when the drawer requests to close |\n| `position` | `'left' \\| 'right' \\| 'top' \\| 'bottom'` | `'right'` | Edge the drawer slides in from |\n| `size` | `string` | `'320px'` | Width (left/right) or height (top/bottom) |\n| `title` | `string` | `undefined` | Drawer title |\n| `overlay` | `boolean` | `true` | Show overlay backdrop behind the drawer |\n| `closeOnOverlay` | `boolean` | `true` | Close when clicking the overlay |\n| `closeOnEscape` | `boolean` | `true` | Close on Escape key |\n| `children` | `unknown` | `undefined` | Drawer body children |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { Drawer } from '@specifyjs/drawer';\n\nfunction App() {\n  const [open, setOpen] = useState(false);\n\n  return createElement('div', null,\n    createElement('button', { onClick: () => setOpen(true) }, 'Open Drawer'),\n    createElement(Drawer, {\n      open,\n      onClose: () => setOpen(false),\n      position: 'right',\n      size: '400px',\n      title: 'Settings',\n    },\n      createElement('p', null, 'Drawer content goes here.'),\n    ),\n  );\n}\n```\n\n## Features\n\n- Slides in from any of the four edges: left, right, top, bottom\n- CSS `translate3d` animation with 300ms ease transition\n- Optional semi-transparent overlay backdrop\n- Body scroll lock while open\n- Configurable size via CSS value (px, %, etc.)\n- Header with title and close button when `title` is provided\n- Visibility managed with open/close animation lifecycle\n\n## Accessibility\n\n- Uses `role=\"dialog\"` and `aria-modal=\"true\"` on the drawer panel\n- Close button includes `aria-label=\"Close drawer\"`\n- Escape key closes the drawer by default\n"},{title:`Modal`,path:`components/overlay/modal`,content:"# Modal\n\nDialog overlay with backdrop, focus trap, and scroll lock.\n\n## Import\n\n```typescript\nimport { Modal } from '@specifyjs/modal';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `open` | `boolean` | -- | Whether the modal is open |\n| `onClose` | `() => void` | -- | Called when the modal requests to close |\n| `title` | `string` | `undefined` | Modal title rendered in the header |\n| `size` | `'sm' \\| 'md' \\| 'lg' \\| 'full'` | `'md'` | Modal width preset (400px / 600px / 800px / 100vw) |\n| `closeOnOverlay` | `boolean` | `true` | Close when clicking the overlay backdrop |\n| `closeOnEscape` | `boolean` | `true` | Close when pressing Escape |\n| `footer` | `unknown` | `undefined` | Footer slot content |\n| `showCloseButton` | `boolean` | `true` | Show the X close button in the header |\n| `children` | `unknown` | `undefined` | Modal body children |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { Modal } from '@specifyjs/modal';\n\nfunction App() {\n  const [open, setOpen] = useState(false);\n\n  return createElement('div', null,\n    createElement('button', { onClick: () => setOpen(true) }, 'Open Modal'),\n    createElement(Modal, {\n      open,\n      onClose: () => setOpen(false),\n      title: 'Confirm Action',\n      size: 'md',\n      footer: createElement('button', { onClick: () => setOpen(false) }, 'Close'),\n    },\n      createElement('p', null, 'Are you sure you want to proceed?'),\n    ),\n  );\n}\n```\n\n## Features\n\n- Four size presets: `sm` (400px), `md` (600px), `lg` (800px), `full` (100vw)\n- Animated backdrop overlay with click-to-close support\n- Body scroll lock while modal is open\n- Focus trap -- focuses the dialog container on open\n- Configurable close behavior via Escape key and overlay click\n- Optional header with title and close button\n- Optional footer slot for action buttons\n\n## Accessibility\n\n- Uses `role=\"dialog\"` and `aria-modal=\"true\"` on the overlay\n- Uses `role=\"document\"` on the dialog content container\n- Close button includes `aria-label=\"Close modal\"`\n- Focus is moved to the dialog when opened\n- Escape key dismisses the modal by default\n"},{title:`Popover`,path:`components/overlay/popover`,content:"# Popover\n\nPositioned popover attached to a trigger element.\n\n## Import\n\n```typescript\nimport { Popover } from '@specifyjs/popover';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `trigger` | `unknown` | -- | Trigger element slot |\n| `content` | `unknown` | -- | Popover content slot |\n| `open` | `boolean` | `undefined` | Controlled open state (disables auto-toggle when provided) |\n| `placement` | `'top' \\| 'bottom' \\| 'left' \\| 'right'` | `'bottom'` | Placement relative to trigger |\n| `offset` | `number` | `4` | Offset from trigger in px |\n| `arrow` | `boolean` | `false` | Show an arrow pointing to the trigger |\n| `closeOnClickOutside` | `boolean` | `true` | Close when clicking outside the popover |\n| `onOpenChange` | `(open: boolean) => void` | `undefined` | Callback when open state changes (for controlled mode) |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { Popover } from '@specifyjs/popover';\n\nfunction App() {\n  return createElement(Popover, {\n    trigger: createElement('button', null, 'Click me'),\n    content: createElement('div', null, 'Popover content here'),\n    placement: 'bottom',\n    arrow: true,\n  });\n}\n```\n\n## Features\n\n- Four placement options: top, bottom, left, right\n- Supports both controlled (`open` prop) and uncontrolled modes\n- Optional CSS arrow pointing to the trigger\n- Click-outside detection to auto-close\n- Configurable offset from the trigger element\n- Absolute positioning relative to an inline-block container\n\n## Accessibility\n\n- Trigger responds to click events to toggle the popover\n- Click-outside handler allows dismissal without explicit close button\n"},{title:`Toast`,path:`components/overlay/toast`,content:`# Toast

Notification system with toaster factory, container, and hook.

## Import

\`\`\`typescript
import { createToaster, ToastContainer, useToast } from '@specifyjs/toast';
\`\`\`

## Props

### ToasterConfig

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`position\` | \`'top-right' \\| 'top-left' \\| 'bottom-right' \\| 'bottom-left' \\| 'top-center' \\| 'bottom-center'\` | \`'top-right'\` | Position of the toast stack |
| \`maxToasts\` | \`number\` | \`5\` | Maximum visible toasts |
| \`defaultDuration\` | \`number\` | \`4000\` | Default auto-dismiss duration in ms |

### ToastOptions

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`type\` | \`'info' \\| 'success' \\| 'warning' \\| 'error'\` | \`'info'\` | Toast type for styling |
| \`duration\` | \`number\` | \`4000\` | Duration in ms before auto-dismiss (0 = persistent) |
| \`action\` | \`{ label: string; onClick: () => void }\` | \`undefined\` | Optional action button |

### ToastContainer Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`toaster\` | \`Toaster\` | -- | Toaster instance to render |

## Usage

### Using the \`useToast\` hook

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useToast } from '@specifyjs/toast';

function App() {
  const { toast, ToastContainer } = useToast({ position: 'top-right' });

  return createElement('div', null,
    createElement('button', {
      onClick: () => toast('File saved successfully!', { type: 'success' }),
    }, 'Save'),
    createElement(ToastContainer, null),
  );
}
\`\`\`

### Using the \`createToaster\` factory

\`\`\`typescript
import { createElement } from 'specifyjs';
import { createToaster, ToastContainer } from '@specifyjs/toast';

const toaster = createToaster({ position: 'bottom-center', maxToasts: 3 });

// Trigger from anywhere
toaster.toast('Something went wrong', { type: 'error', duration: 0 });
toaster.dismiss(toastId);
toaster.dismissAll();
\`\`\`

## Features

- Six positioning options for the toast stack
- Four toast types with distinct color schemes: info, success, warning, error
- Auto-dismiss with configurable duration (set to 0 for persistent toasts)
- Configurable maximum visible toast count
- Optional action button on individual toasts
- Slide-in animation with CSS keyframes
- External toaster factory pattern for framework-agnostic usage
- Subscription-based state management for reactive updates

## Accessibility

- Each toast uses \`role="alert"\` for screen reader announcements
- Dismiss button includes \`aria-label="Dismiss toast"\`
`},{title:`Tooltip`,path:`components/overlay/tooltip`,content:`# Tooltip

Lightweight hover tooltip with configurable placement and delay.

## Import

\`\`\`typescript
import { Tooltip } from '@specifyjs/tooltip';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`text\` | \`string\` | -- | Tooltip text content |
| \`placement\` | \`'top' \\| 'bottom' \\| 'left' \\| 'right'\` | \`'top'\` | Placement relative to the trigger |
| \`delay\` | \`number\` | \`200\` | Delay in ms before showing |
| \`maxWidth\` | \`string\` | \`'250px'\` | Max width of the tooltip |
| \`children\` | \`unknown\` | \`undefined\` | Trigger element(s) |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Tooltip } from '@specifyjs/tooltip';

function App() {
  return createElement(Tooltip, {
    text: 'This is a helpful tooltip',
    placement: 'top',
    delay: 300,
  },
    createElement('button', null, 'Hover me'),
  );
}
\`\`\`

## Features

- Four placement options: top, bottom, left, right
- Configurable show delay to prevent flashing on quick mouse movements
- Fixed positioning calculated from trigger element's bounding rect
- Dark theme styling with rounded corners and arrow indicator
- Automatic word wrapping within configurable max width
- Shows on hover (\`mouseenter\`) and focus; hides on \`mouseleave\` and blur
- Timer cleanup on unmount to prevent memory leaks

## Accessibility

- Uses \`role="tooltip"\` on the tooltip element
- Trigger responds to \`focus\`/\`blur\` events for keyboard accessibility
- Tooltip is non-interactive (\`pointerEvents: none\`)
`},{title:`Carousel`,path:`components/media/carousel`,content:`# Carousel

Image/content carousel slider with arrows, dots, auto-play, and touch support.

## Import

\`\`\`typescript
import { Carousel } from '@specifyjs/carousel';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`items\` | \`CarouselItem[]\` | -- | Carousel items |
| \`autoPlay\` | \`boolean\` | \`false\` | Enable auto-advance |
| \`interval\` | \`number\` | \`5000\` | Auto-advance interval in ms |
| \`showDots\` | \`boolean\` | \`true\` | Show dot indicators |
| \`showArrows\` | \`boolean\` | \`true\` | Show prev/next arrows |
| \`loop\` | \`boolean\` | \`true\` | Loop from last to first |
| \`animation\` | \`'slide' \\| 'fade'\` | \`'slide'\` | Transition animation type |
| \`onChange\` | \`(index: number) => void\` | \`undefined\` | Called when the active index changes |

### CarouselItem

| Prop | Type | Description |
|------|------|-------------|
| \`content\` | \`unknown\` | Slide content element |
| \`caption\` | \`string\` | Optional caption text below the content |

## Usage

\`\`\`typescript
import { createElement } from 'specifyjs';
import { Carousel } from '@specifyjs/carousel';

function App() {
  const items = [
    { content: createElement('img', { src: '/slide1.jpg', style: { width: '100%' } }), caption: 'First slide' },
    { content: createElement('img', { src: '/slide2.jpg', style: { width: '100%' } }), caption: 'Second slide' },
    { content: createElement('img', { src: '/slide3.jpg', style: { width: '100%' } }) },
  ];

  return createElement(Carousel, {
    items,
    autoPlay: true,
    interval: 4000,
    animation: 'slide',
    loop: true,
  });
}
\`\`\`

## Features

- Slide and fade animation modes
- Auto-play with configurable interval
- Previous/next arrow buttons
- Dot indicators for direct slide navigation
- Loop mode wrapping from last to first slide and vice versa
- Keyboard navigation: Left/Right arrow keys
- Touch/pointer swipe support (50px threshold)
- Optional captions per slide
- CSS transform-based slide animation with 400ms ease transition

## Accessibility

- Container uses \`role="region"\` with \`aria-label="Carousel"\`
- Container is focusable (\`tabindex="0"\`) for keyboard navigation
- Arrow buttons include \`aria-label\` ("Previous slide" / "Next slide")
- Dot buttons include \`aria-label\` ("Go to slide N")
`},{title:`Image`,path:`components/media/image`,content:"# Image\n\nEnhanced image component with lazy loading, placeholder, and fallback.\n\n## Import\n\n```typescript\nimport { Image } from '@specifyjs/image';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `src` | `string` | -- | Image source URL |\n| `alt` | `string` | `''` | Alt text |\n| `width` | `string \\| number` | `undefined` | Width (CSS value or number) |\n| `height` | `string \\| number` | `undefined` | Height (CSS value or number) |\n| `fallback` | `string \\| unknown` | `undefined` | Fallback URL or element shown on error |\n| `placeholder` | `'blur' \\| 'skeleton' \\| unknown` | `undefined` | Placeholder shown while loading |\n| `lazy` | `boolean` | `true` | Enable lazy loading |\n| `objectFit` | `string` | `undefined` | CSS object-fit value |\n| `borderRadius` | `string` | `undefined` | CSS border-radius value |\n| `caption` | `string` | `undefined` | Caption text rendered below the image |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { Image } from '@specifyjs/image';\n\nfunction App() {\n  return createElement('div', { style: { display: 'flex', gap: '16px' } },\n    // With skeleton placeholder and fallback\n    createElement(Image, {\n      src: '/photos/hero.jpg',\n      alt: 'Hero image',\n      width: 400,\n      height: 300,\n      placeholder: 'skeleton',\n      fallback: '/photos/fallback.jpg',\n      objectFit: 'cover',\n      borderRadius: '8px',\n    }),\n    // With caption\n    createElement(Image, {\n      src: '/photos/landscape.jpg',\n      alt: 'Mountain landscape',\n      width: 300,\n      caption: 'Photo by John Doe',\n    }),\n  );\n}\n```\n\n## Features\n\n- Three loading states: loading, loaded, error\n- Skeleton placeholder with shimmer animation while loading\n- Blur placeholder with gray blurred background while loading\n- Custom placeholder element support\n- Fallback image URL or custom element on error\n- Native lazy loading via `loading=\"lazy\"` attribute (enabled by default)\n- Configurable `object-fit` and `border-radius`\n- Optional caption rendered as a `<figcaption>` inside a `<figure>`\n- Status resets when `src` prop changes\n\n## Accessibility\n\n- `alt` attribute always set (defaults to empty string)\n- Caption uses semantic `<figure>` and `<figcaption>` elements\n"},{title:`VideoPlayer`,path:`components/media/video-player`,content:"# VideoPlayer\n\nVideo player wrapper with optional custom controls overlay.\n\n## Import\n\n```typescript\nimport { VideoPlayer } from '@specifyjs/video-player';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `src` | `string` | -- | Video source URL |\n| `poster` | `string` | `undefined` | Poster image URL |\n| `width` | `string \\| number` | `'100%'` | Width (CSS value or number) |\n| `height` | `string \\| number` | `'auto'` | Height (CSS value or number) |\n| `autoPlay` | `boolean` | `false` | Auto-play video |\n| `loop` | `boolean` | `false` | Loop playback |\n| `muted` | `boolean` | `false` | Muted |\n| `controls` | `boolean` | `true` | Show custom controls (falls back to native when false) |\n| `onPlay` | `() => void` | `undefined` | Play callback |\n| `onPause` | `() => void` | `undefined` | Pause callback |\n| `onEnded` | `() => void` | `undefined` | Ended callback |\n| `onTimeUpdate` | `(currentTime: number, duration: number) => void` | `undefined` | Time update callback |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { VideoPlayer } from '@specifyjs/video-player';\n\nfunction App() {\n  return createElement(VideoPlayer, {\n    src: '/videos/demo.mp4',\n    poster: '/videos/poster.jpg',\n    width: 800,\n    height: 450,\n    controls: true,\n    onEnded: () => console.log('Video ended'),\n  });\n}\n```\n\n## Features\n\n- Custom controls overlay: play/pause, seekable progress bar, time display, volume slider, fullscreen button\n- Falls back to native browser controls when `controls` is set to `false`\n- Auto-hiding control bar that shows on mouse enter and hides during playback on mouse leave\n- Clickable video area to toggle play/pause\n- Seekable progress bar with click-to-seek\n- Volume slider (range input from 0 to 1)\n- Time display in `M:SS / M:SS` format\n- Fullscreen button via the Fullscreen API\n- Gradient overlay background on the control bar for readability\n- Event callbacks for play, pause, ended, and time updates\n\n## Accessibility\n\n- Play/pause button includes `aria-label` (\"Play\" / \"Pause\")\n- Volume slider includes `aria-label=\"Volume\"`\n- Fullscreen button includes `aria-label=\"Fullscreen\"`\n- Uses `playsinline` attribute for mobile compatibility\n"},{title:`BarGraph`,path:`components/viz/2D-bar-graph`,content:"# BarGraph\n\n2D bar chart SVG component with vertical/horizontal orientation, stacked bars, and grouped bars.\n\n## Import\n\n```typescript\nimport { BarGraph, useBarGraphScales } from '@specifyjs/2D-bar-graph';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `data` | `BarDatum[]` | `[]` | Simple bar data |\n| `width` | `number` | `600` | SVG width in pixels |\n| `height` | `number` | `400` | SVG height in pixels |\n| `orientation` | `'vertical' \\| 'horizontal'` | `'vertical'` | Bar orientation |\n| `barColor` | `string` | `'#3b82f6'` | Default bar fill color |\n| `barGap` | `number` | `8` | Gap between bars in px |\n| `barRadius` | `number` | `4` | Border radius on bar tops |\n| `showValues` | `boolean` | `true` | Show value labels on bars |\n| `showGrid` | `boolean` | `true` | Show grid lines |\n| `gridColor` | `string` | `'#e5e7eb'` | Grid line color |\n| `title` | `string` | `undefined` | Chart title |\n| `padding` | `number` | `50` | Padding around chart area in px |\n| `animate` | `boolean` | `false` | Enable bar grow animation |\n| `stacked` | `StackedBarDatum[]` | `undefined` | Stacked bar data (overrides `data`) |\n| `grouped` | `boolean` | `false` | Grouped mode for stacked data (side-by-side) |\n\n### BarDatum\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `label` | `string` | Category label |\n| `value` | `number` | Bar value |\n| `color` | `string` | Optional bar color |\n\n### StackedBarDatum\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `label` | `string` | Category label |\n| `values` | `{ category: string; value: number; color?: string }[]` | Segment values |\n\n## Usage\n\n### Simple bars\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { BarGraph } from '@specifyjs/2D-bar-graph';\n\nfunction App() {\n  const data = [\n    { label: 'Jan', value: 120 },\n    { label: 'Feb', value: 200 },\n    { label: 'Mar', value: 150 },\n    { label: 'Apr', value: 280 },\n  ];\n\n  return createElement(BarGraph, {\n    data,\n    width: 600,\n    height: 400,\n    title: 'Monthly Sales',\n    animate: true,\n  });\n}\n```\n\n### Stacked bars\n\n```typescript\ncreateElement(BarGraph, {\n  data: [],\n  stacked: [\n    { label: 'Q1', values: [{ category: 'A', value: 30 }, { category: 'B', value: 50 }] },\n    { label: 'Q2', values: [{ category: 'A', value: 40 }, { category: 'B', value: 60 }] },\n  ],\n  width: 600,\n  height: 400,\n});\n```\n\n### Grouped bars\n\n```typescript\ncreateElement(BarGraph, {\n  data: [],\n  stacked: [\n    { label: 'Q1', values: [{ category: 'A', value: 30 }, { category: 'B', value: 50 }] },\n    { label: 'Q2', values: [{ category: 'A', value: 40 }, { category: 'B', value: 60 }] },\n  ],\n  grouped: true,\n  width: 600,\n  height: 400,\n});\n```\n\n## Hook\n\n```typescript\nimport { useBarGraphScales } from '@specifyjs/2D-bar-graph';\n\nconst scales = useBarGraphScales(itemCount, maxValue, axisLength, categoryAxisLength, barGap);\n// scales.valueScale(v), scales.categoryScale(i), scales.barThickness\n```\n\n## Features\n\n- Vertical and horizontal bar orientation\n- Simple, stacked, and grouped bar modes\n- Rounded bar corners with configurable radius\n- Value labels on bars (conditionally hidden for small segments)\n- Grid lines with dashed styling and \"nice\" step calculation\n- Category and value axis with labels\n- Chart title\n- CSS keyframe animation for bar grow effect with staggered delay\n- Auto-computed scales from data\n- 10-color default palette for stacked/grouped segments\n- Zero dependencies (pure SpecifyJS + SVG)\n"},{title:`CartesianGraph2D`,path:`components/viz/2D-cartesian-raw`,content:"# CartesianGraph2D\n\nInteractive 2D Cartesian coordinate graph rendered as SVG. Supports plotting discrete data points and continuous functions with pan, zoom, and point interaction events. Functions can be evaluated synchronously or asynchronously with progressive rendering.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | `400` | SVG viewBox width in pixels |\n| height | `number` | `300` | SVG viewBox height in pixels |\n| points | `{ x: number; y: number }[]` | `[]` | Array of discrete data points to plot |\n| plotFunction | `(x: number) => number` | `undefined` | Function to plot: f(x) -> y |\n| plotResolution | `number` | `200` | Number of samples across the x range. Ignored if `xStep` is set |\n| xStep | `number` | `undefined` | Explicit step increment for function evaluation. Overrides `plotResolution` |\n| sync | `boolean` | `false` | If true, compute plotFunction synchronously. Otherwise computes asynchronously via requestIdleCallback with progressive rendering |\n| xRange | `[number, number]` | `[-5, 5]` | Initial x-axis range |\n| yRange | `[number, number]` | `[-5, 5]` | Initial y-axis range |\n| showGrid | `boolean` | `true` | Show grid lines |\n| showAxes | `boolean` | `true` | Show x and y axes |\n| pointRadius | `number` | `3` | Radius of data point circles |\n| pointColor | `string` | `'#3b82f6'` | Fill color for data points |\n| curveColor | `string` | `'#3b82f6'` | Stroke color for the plotted curve |\n| gridColor | `string` | `'#e2e8f0'` | Grid line color |\n| axisColor | `string` | `'#94a3b8'` | Axis line and label color |\n| onPointClick | `(info: PointEvent) => void` | `undefined` | Callback when a data point is clicked |\n| onPointDoubleClick | `(info: PointEvent) => void` | `undefined` | Callback when a data point is double-clicked |\n| onPointContextMenu | `(info: PointEvent) => void` | `undefined` | Callback when a data point is right-clicked |\n| onPointHover | `(info: PointEvent) => void` | `undefined` | Callback when the mouse enters a data point |\n\n### PointEvent\n\n```ts\ninterface PointEvent {\n  x: number;\n  y: number;\n  index: number;\n  event: Event;\n}\n```\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { CartesianGraph2D } from 'specifyjs/components/viz/2D-cartesian-raw';\n\n// Plot a sine curve\ncreateElement(CartesianGraph2D, {\n  width: 600,\n  height: 400,\n  plotFunction: (x) => Math.sin(x),\n  xRange: [-Math.PI * 2, Math.PI * 2],\n  yRange: [-1.5, 1.5],\n});\n\n// Plot discrete points with click handler\ncreateElement(CartesianGraph2D, {\n  points: [{ x: 1, y: 2 }, { x: 3, y: 4 }, { x: 5, y: 1 }],\n  onPointClick: (info) => console.log(`Clicked point ${info.index}`),\n});\n```\n\n## Notes\n\n- Renders entirely as SVG with no external dependencies.\n- Supports mouse-drag panning and scroll-wheel zooming.\n- When `sync` is false (default), the function curve renders progressively as batches of results arrive via `requestIdleCallback`.\n- Tick labels are auto-generated using a \"nice numbers\" algorithm.\n"},{title:`ComplexGraph2D`,path:`components/viz/2D-complex-graph`,content:"# ComplexGraph2D\n\nInteractive 2D complex plane visualization, rendering fractals (Mandelbrot by default) using either Canvas 2D (runtime computation) or SVG (precomputed data grids). Supports pan, zoom, and multiple color schemes.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | `400` | Width in pixels |\n| height | `number` | `300` | Height in pixels |\n| realRange | `[number, number]` | `[-2.5, 1]` | Real axis range |\n| imagRange | `[number, number]` | `[-1.25, 1.25]` | Imaginary axis range |\n| maxIterations | `number` | `100` | Maximum iteration count for divergence test |\n| colorScheme | `'classic' \\| 'fire' \\| 'ocean'` | `'classic'` | Color mapping scheme |\n| computeFunction | `(re: number, im: number, maxIter: number) => number` | Mandelbrot | Custom iteration function |\n| data | `number[][]` | `undefined` | Precomputed iteration grid (rows x cols). When provided, renders as SVG instead of canvas |\n| resolution | `number` | `2` | Pixel resolution for precomputed SVG rendering |\n| sync | `boolean` | `false` | If true, compute values synchronously |\n| onPointClick | `(info: ComplexPointInfo) => void` | `undefined` | Click callback |\n| onPointHover | `(info: ComplexPointInfo) => void` | `undefined` | Hover callback |\n| onPointDoubleClick | `(info: ComplexPointInfo) => void` | `undefined` | Double-click callback |\n| onPointContextMenu | `(info: ComplexPointInfo) => void` | `undefined` | Right-click callback |\n\n### ComplexPointInfo\n\n```ts\ninterface ComplexPointInfo {\n  re: number;\n  im: number;\n  iterations: number;\n  event: Event;\n}\n```\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ComplexGraph2D, computeMandelbrotGrid } from 'specifyjs/components/viz/2D-complex-graph';\n\n// Runtime canvas rendering (interactive)\ncreateElement(ComplexGraph2D, {\n  width: 600,\n  height: 400,\n  maxIterations: 200,\n  colorScheme: 'fire',\n});\n\n// Precomputed SVG rendering (for build-time / static output)\nconst grid = computeMandelbrotGrid(200, 150);\ncreateElement(ComplexGraph2D, { data: grid, width: 600, height: 400 });\n```\n\n## Notes\n\n- When `data` is provided, renders as SVG rectangles (suitable for static pre-rendering). Otherwise renders to a Canvas 2D element with interactive pan and zoom.\n- The `computeMandelbrotGrid` helper is exported for precomputing iteration grids at build time.\n- Canvas mode supports mouse-drag panning and scroll-wheel zooming.\n"},{title:`DiscreteCartesian2D`,path:`components/viz/2D-discrete-cartesian`,content:"# DiscreteCartesian2D\n\nRenders an NxM grid of discrete colored cells as SVG. Each cell's value maps to a color via a configurable color map. Useful for cellular automata, binary matrices, game-of-life grids, and similar discrete state visualizations.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `number[][]` | (required) | Grid data: rows x cols. Each value maps to a color via `colorMap` |\n| colorMap | `Record<number, string>` | `{ 0: '#1e293b', 1: '#3b82f6' }` | Map of cell values to colors |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `600` | SVG viewBox height |\n| cellGap | `number` | `1` | Gap between cells in pixels |\n| cellRadius | `number` | `0` | Cell border radius |\n| showGrid | `boolean` | `false` | Show grid lines between cells |\n| gridColor | `string` | `'#334155'` | Grid line color |\n| showIndices | `boolean` | `false` | Show row and column index labels |\n| backgroundColor | `string` | `'#0f172a'` | Background color |\n| padding | `number` | `10` | Padding around the grid |\n| onCellClick | `(row: number, col: number, value: number) => void` | `undefined` | Cell click callback |\n| onCellHover | `(row: number, col: number, value: number) => void` | `undefined` | Cell hover callback |\n| title | `string` | `undefined` | Chart title |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { DiscreteCartesian2D } from 'specifyjs/components/viz/2D-discrete-cartesian';\n\ncreateElement(DiscreteCartesian2D, {\n  data: [\n    [0, 1, 0, 1],\n    [1, 0, 1, 0],\n    [0, 1, 0, 1],\n  ],\n  colorMap: { 0: '#1e293b', 1: '#22c55e' },\n  showIndices: true,\n  onCellClick: (row, col, val) => console.log(`Cell (${row},${col}) = ${val}`),\n});\n```\n\n## Notes\n\n- Renders entirely as SVG with responsive viewBox sizing.\n- Interactive cells receive `role=\"button\"` and `tabIndex` for ARIA compliance.\n- Handles jagged arrays gracefully (rows may have different lengths).\n"},{title:`LineGraph`,path:`components/viz/2D-line-graph`,content:"# LineGraph\n\n2D line graph SVG component with multi-series support, area fill, and animation.\n\n## Import\n\n```typescript\nimport { LineGraph, useLineGraphScales } from '@specifyjs/2D-line-graph';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `data` | `Point[]` | -- | Array of `{ x, y }` data points |\n| `width` | `number` | `600` | SVG width in pixels |\n| `height` | `number` | `400` | SVG height in pixels |\n| `lineColor` | `string` | `'#3b82f6'` | Primary line color |\n| `lineWidth` | `number` | `2` | Line stroke width |\n| `pointRadius` | `number` | `4` | Data point circle radius |\n| `pointColor` | `string` | `'#3b82f6'` | Data point fill color |\n| `showPoints` | `boolean` | `true` | Show data point circles |\n| `showGrid` | `boolean` | `true` | Show grid lines |\n| `showArea` | `boolean` | `false` | Show filled area under the line |\n| `areaColor` | `string` | `'rgba(59,130,246,0.15)'` | Area fill color |\n| `xLabel` | `string` | `undefined` | X-axis label |\n| `yLabel` | `string` | `undefined` | Y-axis label |\n| `title` | `string` | `undefined` | Chart title |\n| `padding` | `number` | `50` | Padding around chart area in px |\n| `animate` | `boolean` | `false` | Enable line draw animation |\n| `multiLine` | `LineSeries[]` | `undefined` | Additional line series |\n\n### Point\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `x` | `number` | X coordinate |\n| `y` | `number` | Y coordinate |\n\n### LineSeries\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `data` | `Point[]` | Series data points |\n| `color` | `string` | Line color |\n| `label` | `string` | Legend label |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { LineGraph } from '@specifyjs/2D-line-graph';\n\nfunction App() {\n  const data = [\n    { x: 0, y: 10 },\n    { x: 1, y: 25 },\n    { x: 2, y: 18 },\n    { x: 3, y: 35 },\n    { x: 4, y: 28 },\n  ];\n\n  return createElement(LineGraph, {\n    data,\n    width: 600,\n    height: 400,\n    showArea: true,\n    showGrid: true,\n    xLabel: 'Time',\n    yLabel: 'Value',\n    title: 'Sample Data',\n    animate: true,\n  });\n}\n```\n\n### Multi-series example\n\n```typescript\ncreateElement(LineGraph, {\n  data: [{ x: 0, y: 10 }, { x: 1, y: 20 }],\n  multiLine: [\n    { data: [{ x: 0, y: 15 }, { x: 1, y: 12 }], color: '#ef4444', label: 'Series B' },\n  ],\n  width: 600,\n  height: 400,\n});\n```\n\n## Hook\n\n```typescript\nimport { useLineGraphScales } from '@specifyjs/2D-line-graph';\n\nconst scales = useLineGraphScales(data, 600, 400, 50);\n// scales.xScale(value), scales.yScale(value), scales.xTicks, scales.yTicks\n```\n\n## Features\n\n- Auto-computed linear scales from data extent\n- Grid lines with dashed styling\n- X and Y axis with tick marks and labels\n- Filled area under the line (polygon-based)\n- Multi-series rendering with color-coded legend\n- SVG `<animate>` stroke-dashoffset animation for line draw effect\n- Data points with optional fade-in animation\n- Axis labels and chart title\n- Data is auto-sorted by X value before rendering\n- Zero dependencies (pure SpecifyJS + SVG)\n"},{title:`PieGraph`,path:`components/viz/2D-pie-graph`,content:"# PieGraph\n\n2D pie and donut chart SVG component with labels, legend, and configurable styling.\n\n## Import\n\n```typescript\nimport { PieGraph, computeSlices, describeArc } from '@specifyjs/2D-pie-graph';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `data` | `PieSliceDatum[]` | -- | Slice data |\n| `width` | `number` | `400` | SVG width in pixels |\n| `height` | `number` | `400` | SVG height in pixels |\n| `innerRadius` | `number` | `0` | Inner radius for donut mode (0 = pie) |\n| `outerRadius` | `number` | auto | Outer radius (auto-fit by default) |\n| `padAngle` | `number` | `0.02` | Gap angle between slices in radians |\n| `showLabels` | `boolean` | `true` | Show slice labels |\n| `showValues` | `boolean` | `true` | Show percentage values |\n| `showLegend` | `boolean` | `true` | Show legend |\n| `legendPosition` | `'right' \\| 'bottom'` | `'right'` | Legend placement |\n| `title` | `string` | `undefined` | Chart title |\n| `centerLabel` | `string` | `undefined` | Center label (donut mode only) |\n| `colors` | `string[]` | auto HSL | Custom color palette |\n| `strokeColor` | `string` | `'#fff'` | Slice border color |\n| `strokeWidth` | `number` | `2` | Slice border width |\n\n### PieSliceDatum\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `label` | `string` | Slice label |\n| `value` | `number` | Slice value |\n| `color` | `string` | Optional slice color |\n\n## Usage\n\n### Pie chart\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { PieGraph } from '@specifyjs/2D-pie-graph';\n\nfunction App() {\n  const data = [\n    { label: 'Desktop', value: 55 },\n    { label: 'Mobile', value: 35 },\n    { label: 'Tablet', value: 10 },\n  ];\n\n  return createElement(PieGraph, {\n    data,\n    width: 500,\n    height: 400,\n    title: 'Device Usage',\n    showLegend: true,\n    legendPosition: 'right',\n  });\n}\n```\n\n### Donut chart\n\n```typescript\ncreateElement(PieGraph, {\n  data: [\n    { label: 'Used', value: 75, color: '#3b82f6' },\n    { label: 'Free', value: 25, color: '#e5e7eb' },\n  ],\n  innerRadius: 60,\n  centerLabel: '75%',\n  showLegend: false,\n  width: 300,\n  height: 300,\n});\n```\n\n## Utility Functions\n\n### `computeSlices(data, options?)`\n\nComputes start/end angles, percentages, and resolved colors for each slice.\n\n```typescript\nconst slices = computeSlices(data, { padAngle: 0.02, colors: ['#f00', '#0f0'] });\n// slices[0].startAngle, slices[0].endAngle, slices[0].percentage, slices[0].color\n```\n\n### `describeArc(cx, cy, innerR, outerR, startAngle, endAngle)`\n\nGenerates an SVG path `d` string for an arc or annular sector.\n\n## Features\n\n- Pie chart (solid) and donut chart (with inner radius) modes\n- Auto-generated HSL color palette or custom colors per slice\n- Configurable pad angle for gaps between slices\n- Slice labels and percentage values positioned at 65% radius for large slices\n- Small slices (less than 5%) labeled outside with connector lines\n- Center label for donut mode\n- Legend with right or bottom (two-column) placement\n- Chart title\n- White stroke between slices for visual separation\n- Exported utility functions for custom rendering\n- Zero dependencies (pure SpecifyJS + SVG)\n"},{title:`PolarGraph2D`,path:`components/viz/2D-polar-graph`,content:"# PolarGraph2D\n\nInteractive 2D polar coordinate graph rendered as SVG. Plots functions in polar form r = f(theta) and discrete polar data points. Supports pan, zoom, and point interaction events.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | `400` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| rRange | `[number, number]` | `[0, 2]` | Radial range |\n| plotFunction | `(theta: number) => number` | `undefined` | Function to plot: f(theta) -> r |\n| plotResolution | `number` | `360` | Number of samples around the circle. Ignored if `thetaStep` is set |\n| thetaStep | `number` | `undefined` | Explicit step increment in radians. Overrides `plotResolution` |\n| sync | `boolean` | `false` | If true, compute synchronously |\n| points | `{ r: number; theta: number }[]` | `[]` | Discrete polar data points |\n| showGrid | `boolean` | `true` | Show radial grid circles and angle lines |\n| pointRadius | `number` | `3` | Data point circle radius |\n| pointColor | `string` | `'#3b82f6'` | Data point fill color |\n| curveColor | `string` | `'#3b82f6'` | Curve stroke color |\n| onPointClick | `(info: PolarPointInfo) => void` | `undefined` | Point click callback |\n| onPointDoubleClick | `(info: PolarPointInfo) => void` | `undefined` | Point double-click callback |\n| onPointContextMenu | `(info: PolarPointInfo) => void` | `undefined` | Point right-click callback |\n| onPointHover | `(info: PolarPointInfo) => void` | `undefined` | Point hover callback |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { PolarGraph2D } from 'specifyjs/components/viz/2D-polar-graph';\n\n// Plot a cardioid: r = 1 + cos(theta)\ncreateElement(PolarGraph2D, {\n  plotFunction: (theta) => 1 + Math.cos(theta),\n  rRange: [0, 3],\n});\n```\n\n## Notes\n\n- Renders as SVG with grid circles at integer radial intervals and angle lines every 30 degrees.\n- Supports mouse-drag panning and scroll-wheel zooming of the radial range.\n- Async computation is the default; set `sync: true` for immediate rendering.\n"},{title:`ForceGraph3D`,path:`components/viz/3d-force-graph`,content:"# ForceGraph3D\n\n3D force-directed graph visualization using the SpecifyJS 3dSpace engine. Renders nodes as spheres or polyhedra and edges as cylinders in a physics-based simulation with repulsion, attraction, damping, collision detection, and automatic camera orbiting.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | (required) | Canvas width in pixels |\n| height | `number` | (required) | Canvas height in pixels |\n| nodes | `ForceGraph3DNode[]` | (required) | Array of graph nodes |\n| edges | `ForceGraph3DEdge[]` | (required) | Array of graph edges |\n| bounds | `{ min: Vec3; max: Vec3 }` | +/-50 on all axes | Simulation boundary |\n| repulsionStrength | `number` | `100` | Coulomb repulsion constant |\n| attractionStrength | `number` | `0.1` | Hooke spring constant |\n| damping | `number` | `0.9` | Velocity decay factor (0-1) |\n| centerGravity | `number` | `0.01` | Pull toward origin |\n| running | `boolean` | `true` | Whether the simulation is active |\n| timeStep | `number` | `0.016` | Seconds per simulation step |\n| cameraDistance | `number` | auto-fit | Camera distance from origin |\n| collisionEnabled | `boolean` | `true` | Enable sphere-sphere collision detection |\n| restitution | `number` | `0.8` | Collision bounciness (0-1) |\n| backgroundColor | `Color` | dark blue | Canvas background color |\n| apiRef | `(api: ForceGraph3DAPI) => void` | `undefined` | Callback receiving the imperative API |\n| onNodeClick | `(nodeId, node, event) => void` | `undefined` | Node click handler |\n| onNodeDoubleClick | `(nodeId, node, event) => void` | `undefined` | Node double-click handler |\n| onNodeRightClick | `(nodeId, node, event) => void` | `undefined` | Node right-click handler |\n| onNodeMouseDown | `(nodeId, node, event) => void` | `undefined` | Node mouse-down handler |\n| onNodeMouseUp | `(nodeId, node, event) => void` | `undefined` | Node mouse-up handler |\n| onNodeHover | `(nodeId, node, event) => void` | `undefined` | Node hover handler |\n| onEdgeClick | `(edge, event) => void` | `undefined` | Edge click handler |\n| onEdgeHover | `(edge, event) => void` | `undefined` | Edge hover handler |\n\n### ForceGraph3DNode\n\n| Field | Type | Default | Description |\n|-------|------|---------|-------------|\n| id | `string` | (required) | Unique identifier |\n| label | `string` | `undefined` | Display label |\n| position | `Vec3` | random | Initial position |\n| shape | `'sphere' \\| 'cube' \\| 'tetrahedron' \\| 'octahedron' \\| 'icosahedron' \\| 'custom'` | `'sphere'` | Node geometry |\n| size | `number` | `1.0` | Radius/scale |\n| color | `Color` | blue | Node color |\n| fixed | `boolean` | `false` | Exempt from simulation forces |\n| mass | `number` | `1.0` | Physics mass |\n| collisionRadius | `number` | same as size | Collision sphere radius |\n\n### ForceGraph3DEdge\n\n| Field | Type | Default | Description |\n|-------|------|---------|-------------|\n| source | `string` | (required) | Source node ID |\n| target | `string` | (required) | Target node ID |\n| style | `'cylinder-solid' \\| 'cylinder-mesh' \\| 'line'` | `'cylinder-solid'` | Edge visual style |\n| thickness | `number` | `0.1` | Edge width |\n| color | `Color` | gray | Edge color |\n| length | `number` | auto | Rest length for spring force |\n| stiffness | `number` | `0.1` | Spring constant |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ForceGraph3D } from 'specifyjs/components/viz/3d-force-graph';\n\ncreateElement(ForceGraph3D, {\n  width: 800,\n  height: 600,\n  nodes: [\n    { id: 'a', label: 'Node A' },\n    { id: 'b', label: 'Node B' },\n    { id: 'c', label: 'Node C' },\n  ],\n  edges: [\n    { source: 'a', target: 'b' },\n    { source: 'b', target: 'c' },\n  ],\n  apiRef: (api) => { /* store api for dynamic manipulation */ },\n});\n```\n\n## Notes\n\n- Renders to a Canvas element using the CpuPipeline (with async GPU upgrade when available).\n- The camera automatically orbits the graph. The simulation stops when kinetic energy drops below a threshold.\n- The imperative API (`ForceGraph3DAPI`) allows dynamic node/edge CRUD, camera control, and full graph replacement at runtime.\n- Raycasting-based hit testing enables per-node mouse event handling.\n"},{title:`ThreeDLayers`,path:`components/viz/3d-layers`,content:"# ThreeDLayers\n\nRenders pseudo-3D stacked surface/layer visualizations as isometric SVG. Each layer is a 2D grid of height values rendered as a colored surface with configurable perspective, rotation, and spacing.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| layers | `Layer3D[]` | (required) | Array of layers with 2D height data grids |\n| width | `number` | `700` | SVG width in pixels |\n| height | `number` | `500` | SVG height in pixels |\n| perspective | `number` | `0.5` | Perspective strength (0 = flat, 1 = strong) |\n| rotateX | `number` | `35` | X-axis rotation in degrees |\n| rotateY | `number` | `45` | Y-axis rotation in degrees |\n| rotateZ | `number` | `0` | Z-axis rotation in degrees |\n| showLabels | `boolean` | `true` | Show layer labels |\n| showAxes | `boolean` | `true` | Show 3D axes (X, Y, Z) |\n| layerSpacing | `number` | `2` | Vertical spacing between layers in data units |\n| colorScale | `string[]` | built-in palette | Color palette for layers |\n| gridColor | `string` | `'#94a3b8'` | Wireframe grid color |\n| title | `string` | `undefined` | Chart title |\n\n### Layer3D\n\n| Field | Type | Default | Description |\n|-------|------|---------|-------------|\n| label | `string` | (required) | Layer label |\n| data | `number[][]` | (required) | 2D grid of height values |\n| color | `string` | from palette | Layer color |\n| opacity | `number` | `0.7` | Layer fill opacity |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ThreeDLayers } from 'specifyjs/components/viz/3d-layers';\n\ncreateElement(ThreeDLayers, {\n  layers: [\n    { label: 'Surface A', data: [[1, 2], [3, 4]] },\n    { label: 'Surface B', data: [[2, 1], [1, 3]] },\n  ],\n  rotateX: 30,\n  rotateY: 40,\n  title: 'Stacked Surfaces',\n});\n```\n\n## Notes\n\n- Renders entirely as SVG using affine 3D-to-2D projection (no WebGL required).\n- Uses painter's algorithm (depth sorting) for correct polygon occlusion.\n- Shows an empty state message when no layers are provided.\n"},{title:`Space3D`,path:`components/viz/3d-space`,content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Space3D

Composable 3D scene renderer for SpecifyJS. Renders a 3D scene graph to an
HTML canvas using either a CPU software rasteriser or a WebGL pipeline. The
component assembles cameras, viewports, lights, a scene graph of objects, and
a pluggable lighting model into a \`requestAnimationFrame\` loop that drives
continuous rendering.

**Design philosophy:** Space3D provides a minimal, composable foundation for 3D
content. Every subsystem (camera, lighting, pipeline, object hierarchy) is a
plain class or interface that consumers instantiate and own. The component
itself is a thin orchestrator that wires those pieces together and runs the
render loop.

## Import

\`\`\`typescript
import {
  Space3D,
  Camera,
  Viewport,
  Mesh,
  Light,
  SceneObject,
  SceneGraph,
  CpuPipeline,
  WebGLPipeline,
  FlatShading,
  createMaterial,
} from 'specifyjs/components/viz/3dSpace';

import type {
  Space3DProps,
  ProjectionMode,
  LightingModel,
  RenderPipeline,
  Material,
  Color,
  Vertex,
  ShadeParams,
  Texture,
  ObjectPicker,
  LightType,
  Mat4,
  Quaternion,
} from 'specifyjs/components/viz/3dSpace';
\`\`\`

---

## Space3DProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`width\` | \`number\` | *required* | Canvas width in pixels |
| \`height\` | \`number\` | *required* | Canvas height in pixels |
| \`finiteSpace\` | \`boolean\` | \`true\` | Whether space is finite (bounded) |
| \`bounds\` | \`{ min: Vec3; max: Vec3 }\` | \`undefined\` | Bounds for finite space. Objects and camera are clamped within. |
| \`lightingModel\` | \`LightingModel\` | \`FlatShading\` | Pluggable lighting/shading model |
| \`onFrame\` | \`(dt: number, scene: SceneGraph, cameras: Camera[]) => void\` | \`undefined\` | Called every frame with delta time in seconds |
| \`objectPicker\` | \`ObjectPicker\` | \`DefaultObjectPicker\` (no-op) | Ray-cast object picking implementation |
| \`cameras\` | \`Camera[]\` | single default camera | Consumer-defined cameras |
| \`viewports\` | \`Viewport[]\` | single full-canvas viewport | Viewport-to-camera mappings |
| \`objects\` | \`SceneObject[]\` | \`[]\` | Scene objects to register |
| \`lights\` | \`Light[]\` | \`[]\` | Light sources in the scene |
| \`renderer\` | \`'webgl' \\| 'cpu' \\| 'auto'\` | \`'auto'\` | Preferred render pipeline (\`auto\` tries WebGL first, falls back to CPU) |

When no \`cameras\` are provided, a default perspective camera is created at
position \`(0, 5, 10)\` looking at the origin with a 45-degree field of view.
When no \`viewports\` are provided, a single viewport covering the full canvas
is created and bound to the first camera.

---

## Core Types

### Color

\`\`\`typescript
interface Color {
  r: number;  // 0-1
  g: number;  // 0-1
  b: number;  // 0-1
  a: number;  // 0-1
}
\`\`\`

### Vertex

\`\`\`typescript
interface Vertex {
  position: Vec3;
  normal: Vec3;
  uv?: Vec2;
  color?: Color;
}
\`\`\`

### ShadeParams

Parameters passed to a lighting model's \`shade\` function.

\`\`\`typescript
interface ShadeParams {
  normal: Vec3;
  lightDir: Vec3;
  viewDir: Vec3;
  lightColor: Color;
  materialColor: Color;
  ambientStrength: number;
}
\`\`\`

### Texture

\`\`\`typescript
interface Texture {
  width: number;
  height: number;
  sample(u: number, v: number): Color;
}
\`\`\`

### ObjectPicker

\`\`\`typescript
interface ObjectPicker {
  pick(origin: Vec3, direction: Vec3, objects: SceneObject[]): SceneObject | null;
}
\`\`\`

\`DefaultObjectPicker\` always returns \`null\` (no-op).

---

## Camera

Represents a viewpoint into the 3D scene. Supports perspective and orthographic
projection modes.

### Constructor

\`\`\`typescript
new Camera(options?: {
  position?: Vec3;            // default: { x: 0, y: 0, z: 0 }
  orientation?: Quaternion;   // default: identity quaternion
  projectionMode?: ProjectionMode;  // default: 'perspective'
  fov?: number;               // default: Math.PI / 4 (45 degrees)
  aspect?: number;            // default: 16 / 9
  near?: number;              // default: 0.1
  far?: number;               // default: 1000
  left?: number;              // default: -1 (orthographic)
  right?: number;             // default: 1  (orthographic)
  top?: number;               // default: 1  (orthographic)
  bottom?: number;            // default: -1 (orthographic)
})
\`\`\`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`position\` | \`Vec3\` | World-space position |
| \`orientation\` | \`Quaternion\` | Rotation as a unit quaternion |
| \`projectionMode\` | \`'perspective' \\| 'orthographic'\` | Projection type |
| \`fov\` | \`number\` | Vertical field of view in radians (perspective) |
| \`aspect\` | \`number\` | Width / height ratio (perspective) |
| \`near\` | \`number\` | Near clipping plane distance |
| \`far\` | \`number\` | Far clipping plane distance |
| \`left\`, \`right\`, \`top\`, \`bottom\` | \`number\` | Orthographic frustum bounds |

### Methods

#### \`move(delta: Vec3): void\`

Translate the camera by the given vector.

\`\`\`typescript
camera.move({ x: 0, y: 1, z: 0 }); // move up by 1
\`\`\`

#### \`rotate(q: Quaternion): void\`

Apply a quaternion rotation to the camera's current orientation (Hamilton
product).

\`\`\`typescript
import { quatFromAxisAngle } from 'specifyjs/math';

camera.rotate(quatFromAxisAngle({ x: 0, y: 1, z: 0 }, 0.1));
\`\`\`

#### \`lookAt(target: Vec3): void\`

Orient the camera to face the given world-space point. Uses the world up vector
\`(0, 1, 0)\`.

\`\`\`typescript
camera.lookAt({ x: 0, y: 0, z: 0 });
\`\`\`

#### \`getViewMatrix(): Mat4\`

Returns the 4x4 view matrix (Float64Array, column-major) computed from the
camera's position and orientation.

#### \`getProjectionMatrix(): Mat4\`

Returns the 4x4 projection matrix based on the current projection mode and
parameters.

---

## Viewport

Defines a rectangular region of the canvas and its associated camera. Supports
split-screen rendering when multiple viewports are used.

### Constructor

\`\`\`typescript
new Viewport(options: {
  x: number;           // left edge in pixels
  y: number;           // top edge in pixels
  width: number;       // width in pixels
  height: number;      // height in pixels
  camera: Camera;      // the camera this viewport renders from
  clearColor?: Color;  // default: { r: 0, g: 0, b: 0, a: 1 }
})
\`\`\`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`x\` | \`number\` | Left edge of the viewport (pixels) |
| \`y\` | \`number\` | Top edge of the viewport (pixels) |
| \`width\` | \`number\` | Viewport width (pixels) |
| \`height\` | \`number\` | Viewport height (pixels) |
| \`camera\` | \`Camera\` | Associated camera |
| \`clearColor\` | \`Color\` | Background color for this viewport |

---

## Mesh

Geometry data with packed vertex positions, normals, indices, and optional UVs
and per-vertex colours. Uses typed arrays (\`Float32Array\`, \`Uint32Array\`) for
efficient memory layout.

### Constructor

\`\`\`typescript
new Mesh(
  vertices: Float32Array,   // xyz triples
  normals: Float32Array,    // xyz triples (per vertex)
  indices: Uint32Array,     // triangle index list
  uvs?: Float32Array,       // uv pairs (optional)
  colors?: Float32Array,    // rgba quads (optional)
)
\`\`\`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`vertices\` | \`Float32Array\` | Flat array of vertex positions (x,y,z triples) |
| \`normals\` | \`Float32Array\` | Flat array of vertex normals |
| \`indices\` | \`Uint32Array\` | Triangle index list |
| \`uvs\` | \`Float32Array \\| undefined\` | Texture coordinates (u,v pairs) |
| \`colors\` | \`Float32Array \\| undefined\` | Per-vertex colours (r,g,b,a quads) |
| \`vertexCount\` | \`number\` | Number of vertices (computed: \`vertices.length / 3\`) |
| \`indexCount\` | \`number\` | Number of indices |

### Static Factories

#### \`Mesh.createBox(width, height, depth): Mesh\`

Creates an axis-aligned box centered at the origin. Generates 24 vertices
(4 per face for correct normals) and 36 indices (2 triangles per face).

\`\`\`typescript
const box = Mesh.createBox(2, 2, 2); // 2x2x2 cube
\`\`\`

#### \`Mesh.createPlane(width, depth, segmentsX?, segmentsZ?): Mesh\`

Creates a subdivided plane on the XZ plane (y = 0), centered at the origin.
Normal points up \`(0, 1, 0)\`. Generates UVs.

\`\`\`typescript
const ground = Mesh.createPlane(10, 10);          // single quad
const terrain = Mesh.createPlane(10, 10, 8, 8);   // 8x8 grid
\`\`\`

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| \`width\` | \`number\` | -- | Size along x axis |
| \`depth\` | \`number\` | -- | Size along z axis |
| \`segmentsX\` | \`number\` | \`1\` | Subdivisions along x |
| \`segmentsZ\` | \`number\` | \`1\` | Subdivisions along z |

---

## Material

A material describes the surface appearance of an object.

### Interface

\`\`\`typescript
interface Material {
  color: Color;
  texture?: Texture;
  wireframe: boolean;
}
\`\`\`

### Factory

\`\`\`typescript
function createMaterial(
  color: Color,
  options?: { texture?: Texture; wireframe?: boolean }
): Material
\`\`\`

\`wireframe\` defaults to \`false\`.

\`\`\`typescript
const red = createMaterial({ r: 0.9, g: 0.2, b: 0.2, a: 1 });
const wireframe = createMaterial({ r: 1, g: 1, b: 1, a: 1 }, { wireframe: true });
\`\`\`

---

## Light

A light source in the scene. Supports directional, point, and spot light types.

### Constructor

\`\`\`typescript
new Light(options: {
  type: LightType;          // 'directional' | 'point' | 'spot'
  position?: Vec3;          // default: { x: 0, y: 0, z: 0 }
  direction?: Vec3;         // default: { x: 0, y: -1, z: 0 }
  color?: Color;            // default: white
  intensity?: number;       // default: 1
  range?: number;           // default: 10 (point/spot)
  spotAngle?: number;       // default: Math.PI / 4 (spot)
})
\`\`\`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`type\` | \`'directional' \\| 'point' \\| 'spot'\` | Light type |
| \`position\` | \`Vec3\` | World-space position (point and spot) |
| \`direction\` | \`Vec3\` | Light direction (directional and spot) |
| \`color\` | \`Color\` | Light colour |
| \`intensity\` | \`number\` | Brightness multiplier |
| \`range\` | \`number\` | Attenuation distance (point and spot) |
| \`spotAngle\` | \`number\` | Cone half-angle in radians (spot) |

---

## SceneObject

Base class for all objects in the scene graph. Maintains a transform (position,
rotation, scale) and a parent/child hierarchy. Consumers extend this class or
use it directly by assigning a mesh and material.

### Constructor

\`\`\`typescript
new SceneObject(id: string)
\`\`\`

Initial state: position \`(0,0,0)\`, identity rotation, scale \`(1,1,1)\`, visible.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`id\` | \`string\` (readonly) | Unique identifier |
| \`position\` | \`Vec3\` | Local position |
| \`rotation\` | \`Quaternion\` | Local rotation |
| \`scale\` | \`Vec3\` | Local scale |
| \`mesh\` | \`Mesh \\| undefined\` | Geometry to render |
| \`material\` | \`Material \\| undefined\` | Surface material |
| \`children\` | \`SceneObject[]\` | Child objects |
| \`parent\` | \`SceneObject \\| null\` | Parent in the hierarchy |
| \`visible\` | \`boolean\` | Whether to render this object and its children |

### Methods

#### \`addChild(obj: SceneObject): void\`

Adds a child object. Automatically removes the child from its previous parent.

#### \`removeChild(obj: SceneObject): void\`

Removes a child by reference and clears its parent pointer.

#### \`getWorldMatrix(): Mat4\`

Computes the world transform by iteratively composing local transforms up the
parent chain (root-to-leaf order). Returns a \`Float64Array\` of 16 elements in
column-major order.

### Extending SceneObject

\`\`\`typescript
class Asteroid extends SceneObject {
  angularVelocity: number;

  constructor(id: string, angularVelocity: number) {
    super(id);
    this.angularVelocity = angularVelocity;
    this.mesh = Mesh.createBox(1, 1, 1);
    this.material = createMaterial({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
  }
}
\`\`\`

---

## SceneGraph

Manages a flat or hierarchical collection of scene objects under an invisible
root node. All registered objects become direct children of the root.

### Constructor

\`\`\`typescript
new SceneGraph()
\`\`\`

### Properties

| Property | Type | Description |
|----------|------|-------------|
| \`root\` | \`SceneObject\` (readonly) | Invisible root node (id \`'__root__'\`) |

### Methods

#### \`register(obj: SceneObject): void\`

Add an object as a child of the root.

#### \`unregister(id: string): void\`

Remove an object by id (depth-first search).

#### \`traverse(callback: (obj: SceneObject) => void): void\`

Depth-first traversal of all objects (iterative, using an explicit stack).
Does not visit the root node.

#### \`getVisibleObjects(): SceneObject[]\`

Returns all objects where \`visible === true\`.

---

## LightingModel Interface

Pluggable interface that controls how surfaces are shaded. Each lighting model
provides both GLSL shader source (for WebGL) and a CPU \`shade\` function (for
the software rasteriser).

\`\`\`typescript
interface LightingModel {
  name: string;
  vertexShaderSource(): string;
  fragmentShaderSource(): string;
  shade(params: ShadeParams): Color;
  uniforms(lights: Light[], material: Material): Record<string, unknown>;
}
\`\`\`

| Method | Description |
|--------|-------------|
| \`name\` | Unique identifier for shader caching |
| \`vertexShaderSource()\` | GLSL vertex shader source |
| \`fragmentShaderSource()\` | GLSL fragment shader source |
| \`shade(params)\` | CPU-side per-triangle shading |
| \`uniforms(lights, material)\` | Returns uniform values for the WebGL program |

### FlatShading (default)

Returns the material colour unchanged with no diffuse or specular computation.

\`\`\`typescript
const lighting = new FlatShading();
\`\`\`

### Implementing a Custom LightingModel

\`\`\`typescript
class LambertShading implements LightingModel {
  readonly name = 'LambertShading';

  vertexShaderSource(): string {
    return \`
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uModelViewProjection;
      uniform mat4 uModelMatrix;
      varying vec3 vNormal;
      void main() {
        vNormal = (uModelMatrix * vec4(aNormal, 0.0)).xyz;
        gl_Position = uModelViewProjection * vec4(aPosition, 1.0);
      }
    \`;
  }

  fragmentShaderSource(): string {
    return \`
      precision mediump float;
      uniform vec4 uColor;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      void main() {
        float diff = max(dot(normalize(vNormal), uLightDir), 0.0);
        float ambient = 0.2;
        gl_FragColor = vec4(uColor.rgb * (ambient + diff), uColor.a);
      }
    \`;
  }

  shade(params: ShadeParams): Color {
    const dot = Math.max(
      params.normal.x * params.lightDir.x +
      params.normal.y * params.lightDir.y +
      params.normal.z * params.lightDir.z,
      0,
    );
    const factor = params.ambientStrength + dot;
    return {
      r: Math.min(params.materialColor.r * factor, 1),
      g: Math.min(params.materialColor.g * factor, 1),
      b: Math.min(params.materialColor.b * factor, 1),
      a: params.materialColor.a,
    };
  }

  uniforms(lights: Light[], material: Material): Record<string, unknown> {
    return {
      uColor: [material.color.r, material.color.g, material.color.b, material.color.a],
      uLightDir: [0.5, 1.0, 0.3],
    };
  }
}
\`\`\`

---

## RenderPipeline Interface

The render pipeline takes a scene graph, camera, viewport, and lighting model
and produces a rendered frame.

\`\`\`typescript
interface RenderPipeline {
  name: string;
  initialize(canvas: HTMLCanvasElement): void;
  dispose(): void;
  render(scene: SceneGraph, camera: Camera, viewport: Viewport, lighting: LightingModel): void;
}
\`\`\`

### CpuPipeline

Software rasteriser that renders to a Canvas 2D context. Uses the painter's
algorithm (back-to-front depth sorting) and canvas path fills for triangle
rasterisation. No GPU required.

\`\`\`typescript
const pipeline = new CpuPipeline();
pipeline.initialize(canvas);
// ... render loop ...
pipeline.dispose();
\`\`\`

**Rendering steps:**
1. Compute view-projection matrix once per frame
2. For each visible object, compute model-view-projection and transform vertices to clip space
3. Perspective divide and viewport mapping to screen coordinates
4. Compute face normals and shade each triangle via the lighting model
5. Sort triangles back-to-front by average Z (painter's algorithm)
6. Fill triangles using Canvas 2D path operations

### WebGLPipeline

Hardware-accelerated pipeline using WebGL 1.0. Compiles GLSL shaders from the
lighting model, uploads vertex data per object, and draws with depth testing
enabled. Caches compiled shader programs by lighting model name.

\`\`\`typescript
const pipeline = new WebGLPipeline();
pipeline.initialize(canvas);  // throws if WebGL is unavailable
\`\`\`

**Features:**
- Automatic shader compilation and caching
- Supports \`OES_element_index_uint\` for large meshes
- Per-object MVP, model matrix, and lighting uniforms
- Wireframe mode via \`GL_LINES\` draw mode

### Helper Functions (WebGL)

| Function | Signature | Description |
|----------|-----------|-------------|
| \`toFloat32\` | \`(src: Float64Array) => Float32Array\` | Convert for WebGL uniform upload |
| \`compileShader\` | \`(gl, type, source) => WebGLShader\` | Compile a GLSL shader |
| \`linkProgram\` | \`(gl, vs, fs) => WebGLProgram\` | Link vertex + fragment shaders |
| \`setUniform\` | \`(gl, program, name, value) => void\` | Set a uniform (mat4, vec2/3/4, float) |

---

## Usage Examples

### Basic Scene with a Box

\`\`\`typescript
import { createElement } from 'specifyjs';
import {
  Space3D,
  SceneObject,
  Mesh,
  Camera,
  createMaterial,
} from 'specifyjs/components/viz/3dSpace';

function MyScene() {
  const box = new SceneObject('my-box');
  box.mesh = Mesh.createBox(2, 2, 2);
  box.material = createMaterial({ r: 0.2, g: 0.6, b: 1.0, a: 1 });
  box.position = { x: 0, y: 0, z: 0 };

  const camera = new Camera({
    position: { x: 0, y: 3, z: 8 },
    fov: Math.PI / 4,
    aspect: 800 / 600,
    near: 0.1,
    far: 100,
  });
  camera.lookAt({ x: 0, y: 0, z: 0 });

  return createElement(Space3D, {
    width: 800,
    height: 600,
    cameras: [camera],
    objects: [box],
  });
}
\`\`\`

### Multiple Objects with Camera Orbit

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useState, useEffect, useRef } from 'specifyjs/hooks';
import {
  Space3D,
  SceneObject,
  SceneGraph,
  Mesh,
  Camera,
  createMaterial,
} from 'specifyjs/components/viz/3dSpace';

function OrbitScene() {
  const camera = new Camera({
    position: { x: 10, y: 5, z: 10 },
    fov: Math.PI / 4,
    aspect: 800 / 600,
    near: 0.1,
    far: 200,
  });
  camera.lookAt({ x: 0, y: 0, z: 0 });

  const objects = [
    makeBox('center', 0, 0, 0, { r: 0.9, g: 0.2, b: 0.2, a: 1 }),
    makeBox('left',  -4, 0, 0, { r: 0.2, g: 0.8, b: 0.2, a: 1 }),
    makeBox('right',  4, 0, 0, { r: 0.2, g: 0.4, b: 0.9, a: 1 }),
  ];

  const onFrame = (dt: number, scene: SceneGraph, cameras: Camera[]) => {
    // Orbit the camera around the Y axis
    const cam = cameras[0];
    const t = performance.now() / 1000;
    const radius = 12;
    cam.position = {
      x: Math.cos(t * 0.5) * radius,
      y: 5,
      z: Math.sin(t * 0.5) * radius,
    };
    cam.lookAt({ x: 0, y: 0, z: 0 });
  };

  return createElement(Space3D, {
    width: 800,
    height: 600,
    cameras: [camera],
    objects,
    onFrame,
  });
}

function makeBox(id: string, x: number, y: number, z: number, color: Color) {
  const obj = new SceneObject(id);
  obj.mesh = Mesh.createBox(1.5, 1.5, 1.5);
  obj.material = createMaterial(color);
  obj.position = { x, y, z };
  return obj;
}
\`\`\`

### Custom Lighting Model (Interface Shape)

\`\`\`typescript
import type { LightingModel } from 'specifyjs/components/viz/3dSpace';

// A lighting model must implement these four methods:
const myLighting: LightingModel = {
  name: 'MyCustomLighting',

  vertexShaderSource() {
    return '...'; // GLSL vertex shader
  },

  fragmentShaderSource() {
    return '...'; // GLSL fragment shader
  },

  shade(params) {
    // CPU shading: compute final colour from normal, light, material
    return { ...params.materialColor };
  },

  uniforms(lights, material) {
    // Return key-value pairs uploaded to the WebGL program
    return {
      uColor: [material.color.r, material.color.g, material.color.b, material.color.a],
    };
  },
};

// Pass it to Space3D:
createElement(Space3D, {
  width: 800,
  height: 600,
  lightingModel: myLighting,
  objects: [/* ... */],
});
\`\`\`

---

## Architecture

\`\`\`
                        Space3D (component)
                             |
                  +----------+----------+
                  |                     |
            SceneGraph             onFrame callback
             /    \\                     |
      SceneObject  SceneObject   (consumer logic:
       / mesh       / mesh        orbit, physics, etc.)
      / material   / material
     |             |
     +------+------+
            |
       RenderPipeline
       /           \\
  CpuPipeline   WebGLPipeline
      |               |
  Canvas 2D       WebGL context
      |               |
   Painter's      GLSL shaders
   algorithm      + depth buffer
      |               |
      +-------+-------+
              |
        LightingModel
        (shade / GLSL)
\`\`\`

**Data flow per frame:**

1. \`requestAnimationFrame\` fires
2. \`onFrame\` callback is invoked (consumer updates transforms, cameras)
3. For each viewport, the pipeline's \`render()\` is called
4. Pipeline traverses \`scene.getVisibleObjects()\`
5. Each object's \`getWorldMatrix()\` is composed with the camera's view-projection
6. Triangles are projected, shaded via the \`LightingModel\`, and rasterised
7. Frame is presented on the canvas

**Transform hierarchy:**
SceneObject supports parent-child relationships. \`getWorldMatrix()\` iterates up
the parent chain and multiplies local transforms from root to leaf, producing
the final world-space matrix. This enables grouped transforms (e.g., a turret
mounted on a vehicle).

---

## Pipeline Selection

| \`renderer\` prop | Behaviour |
|-----------------|-----------|
| \`'auto'\` (default) | Tries WebGL first; falls back to CPU if unavailable |
| \`'webgl'\` | Uses WebGL; falls back to CPU if unavailable |
| \`'cpu'\` | Always uses the CPU software rasteriser |

In v1, the WebGL pipeline is fully implemented but the \`auto\`/\`webgl\` code
path currently falls back to CPU in the Space3D component. Use \`WebGLPipeline\`
directly for WebGL rendering (see the showcase demo for an example of direct
pipeline usage).
`},{title:`Space3D`,path:`components/viz/3dSpace`,content:"# Space3D\n\nFull 3D rendering engine component that manages a canvas-based scene graph with cameras, viewports, lighting, animations, collision detection, and pluggable render pipelines (CPU software rasterizer or WebGL/WebGPU).\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | (required) | Canvas width in pixels |\n| height | `number` | (required) | Canvas height in pixels |\n| finiteSpace | `boolean` | `true` | Whether the space is bounded |\n| bounds | `{ min: Vec3; max: Vec3 }` | `undefined` | Bounds for finite space clamping |\n| lightingModel | `LightingModel` | `FlatShading` | Lighting model instance |\n| onFrame | `(deltaTime, scene, cameras) => void` | `undefined` | Per-frame animation callback |\n| objectPicker | `ObjectPicker` | no-op | Object picking handler |\n| cameras | `Camera[]` | default camera | Array of cameras |\n| viewports | `Viewport[]` | auto | Viewports mapped to cameras |\n| objects | `SceneObject[]` | `undefined` | Scene objects to register |\n| lights | `Light[]` | `undefined` | Scene lights |\n| showGrid | `boolean` | `false` | Show a reference grid on the XZ plane |\n| gridSize | `number` | `20` | Grid size in world units |\n| gridDivisions | `number` | `20` | Grid subdivision count |\n| renderer | `'webgl' \\| 'cpu' \\| 'auto'` | `'auto'` | Preferred render pipeline |\n| cameraController | `CameraControllerFn` | `undefined` | Pluggable camera controller |\n| animations | `AnimationManager` | `undefined` | Per-object animation manager |\n| boundaryMode | `BoundaryMode` | `'none'` | Boundary enforcement behavior |\n| collisions | `CollisionManager` | `undefined` | Collision detection manager |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Space3D } from 'specifyjs/components/viz/3dSpace';\nimport { SceneObject } from 'specifyjs/components/viz/3dSpace/scene-object';\nimport { Camera } from 'specifyjs/components/viz/3dSpace/camera';\n\nconst cube = new SceneObject('my-cube');\nconst camera = new Camera({ position: { x: 0, y: 5, z: 10 }, fov: Math.PI / 4, aspect: 16/9, near: 0.1, far: 1000 });\ncamera.lookAt({ x: 0, y: 0, z: 0 });\n\ncreateElement(Space3D, {\n  width: 800,\n  height: 600,\n  objects: [cube],\n  cameras: [camera],\n  showGrid: true,\n  onFrame: (dt, scene, cams) => { /* animate objects */ },\n});\n```\n\n## Notes\n\n- Renders to a Canvas element using the selected pipeline (CPU software rasterizer by default, with automatic WebGL/WebGPU upgrade when available).\n- The scene graph, camera, viewport, and lighting systems are fully composable.\n- Supports pluggable camera controllers, animation managers, and collision managers.\n- The `onFrame` callback is called via `requestAnimationFrame` each frame.\n"},{title:`BigNumber`,path:`components/viz/big-number`,content:"# BigNumber\n\nKPI / metric card component rendered as SVG. Displays a large formatted number with optional prefix, suffix, trend indicator, label, and sparkline mini-chart.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| value | `number \\| string` | (required) | The main value to display |\n| label | `string` | `undefined` | Descriptive label beneath the value |\n| prefix | `string` | `''` | Prefix before the value (e.g. '$') |\n| suffix | `string` | `''` | Suffix after the value (e.g. '%') |\n| trend | `number` | `undefined` | Trend value (positive = up arrow, negative = down arrow) |\n| trendLabel | `string` | `undefined` | Trend context label (e.g. 'vs last week') |\n| sparkline | `number[]` | `undefined` | Array of data points for a mini line chart |\n| width | `number` | `280` | SVG viewBox width |\n| height | `number` | `160` | SVG viewBox height |\n| valueColor | `string` | `'currentColor'` | Main value text color |\n| trendUpColor | `string` | `'#22c55e'` | Trend arrow color when positive |\n| trendDownColor | `string` | `'#ef4444'` | Trend arrow color when negative |\n| backgroundColor | `string` | `'#ffffff'` | Card background color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { BigNumber } from 'specifyjs/components/viz/big-number';\n\ncreateElement(BigNumber, {\n  value: 42567,\n  prefix: '$',\n  label: 'Monthly Revenue',\n  trend: 12.5,\n  trendLabel: 'vs last month',\n  sparkline: [30, 35, 28, 42, 38, 45, 50],\n});\n```\n\n## Notes\n\n- Renders entirely as SVG with rounded card styling.\n- Numeric values are auto-formatted with thousand separators.\n- The sparkline includes a gradient fill area beneath the line.\n- ARIA attributes are applied for accessibility.\n"},{title:`BlochSphere`,path:`components/viz/bloch-sphere`,content:"# BlochSphere\n\nInteractive 3D Bloch sphere visualization for quantum states, rendered as SVG with orthographic projection. Displays a qubit state vector on a unit sphere with wireframe, axis labels, trajectory trail, and optional quantum gate animation.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| state | `BlochState` | `{ theta: 0, phi: 0 }` | Current qubit state (theta: polar, phi: azimuthal) |\n| gates | `GateOp[]` | `undefined` | Sequence of gates to animate (applied one per frame) |\n| width | `number` | `400` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| rotateY | `number` | `-25` | Initial Y-axis rotation in degrees |\n| rotateX | `number` | `15` | Initial X-axis rotation in degrees |\n| zoom | `number` | `1.0` | Zoom level (0.5-3.0) |\n| interactive | `boolean` | `true` | Allow drag rotation |\n| zoomable | `boolean` | `true` | Allow scroll zoom |\n| showVector | `boolean` | `true` | Show state vector arrow |\n| showLabels | `boolean` | `true` | Show axis labels (|0>, |1>, |+>, |->, |+i>, |-i>) |\n| showWireframe | `boolean` | `true` | Show wireframe circles (equator, meridians) |\n| showTrail | `boolean` | `true` | Show state trajectory trail |\n| trailMaxPoints | `number` | `200` | Maximum trail points |\n| trailColor | `string` | `'#ef4444'` | Trail path color |\n| wireframeColor | `string` | `'#cbd5e1'` | Wireframe circle color |\n| vectorColor | `string` | `'#3b82f6'` | State vector color |\n| backgroundColor | `string` | `undefined` | Background color (transparent if omitted) |\n| sphereRadius | `number` | `130` | Sphere radius in viewBox units |\n| title | `string` | `undefined` | Title text |\n| onStateChange | `(state: BlochState) => void` | `undefined` | Callback when state changes |\n\n### Supported Gates\n\n`'X'`, `'Y'`, `'Z'`, `'H'`, `'S'`, `'T'`, `'Rx'`, `'Ry'`, `'Rz'` (Rx/Ry/Rz accept an `angle` parameter in radians).\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { BlochSphere } from 'specifyjs/components/viz/bloch-sphere';\n\n// Display |+> state\ncreateElement(BlochSphere, {\n  state: { theta: Math.PI / 2, phi: 0 },\n  title: 'Qubit State',\n});\n\n// Animate a gate sequence\ncreateElement(BlochSphere, {\n  gates: [{ gate: 'H' }, { gate: 'T' }, { gate: 'H' }],\n  onStateChange: (state) => console.log(state),\n});\n```\n\n## Notes\n\n- Renders entirely as SVG with 3D-to-2D projection.\n- Interactive drag rotation and scroll zoom enabled by default.\n- Gate animations run one gate per animation frame via `requestAnimationFrame`.\n- The trail records the Bloch vector path as gates are applied.\n"},{title:`BoxPlot`,path:`components/viz/box-plot`,content:"# BoxPlot\n\nBox-and-whisker plot rendered as SVG. Automatically computes quartiles, whiskers, outliers, and optional mean markers from raw numeric data.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `BoxPlotDatum[]` | `[]` | Array of box plot data sets |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| orientation | `'horizontal' \\| 'vertical'` | `'vertical'` | Plot orientation |\n| showOutliers | `boolean` | `true` | Show outlier circles |\n| showMean | `boolean` | `false` | Show mean marker (circle) |\n| whiskerColor | `string` | `'#374151'` | Whisker and border color |\n| boxWidth | `number` | `0.6` | Box width as fraction of available space (0.1-0.95) |\n| showGrid | `boolean` | `true` | Show grid lines |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `60` | Padding around chart area |\n\n### BoxPlotDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| label | `string` | Category label |\n| values | `number[]` | Raw numeric values |\n| color | `string` | Optional box fill color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { BoxPlot } from 'specifyjs/components/viz/box-plot';\n\ncreateElement(BoxPlot, {\n  data: [\n    { label: 'Group A', values: [1, 2, 3, 4, 5, 6, 7, 8, 20] },\n    { label: 'Group B', values: [3, 4, 5, 5, 6, 7, 8] },\n  ],\n  showMean: true,\n  title: 'Distribution Comparison',\n});\n```\n\n## Notes\n\n- Renders as SVG with ARIA attributes on each box.\n- Whiskers extend to the closest data point within 1.5x IQR. Points beyond are rendered as outlier circles.\n- Quartiles computed using linear interpolation.\n"},{title:`BubbleChart`,path:`components/viz/bubble-chart`,content:"# BubbleChart\n\nScatter chart with three-dimensional data encoding (x, y, bubble radius) rendered as SVG. Auto-scales bubble sizes within configurable min/max radius bounds.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `BubbleDatum[]` | `[]` | Array of bubble data points |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| xLabel | `string` | `undefined` | X-axis label |\n| yLabel | `string` | `undefined` | Y-axis label |\n| showGrid | `boolean` | `true` | Show grid lines |\n| showAxes | `boolean` | `true` | Show axes |\n| showLabels | `boolean` | `false` | Show datum labels |\n| maxBubbleRadius | `number` | `40` | Maximum rendered bubble radius in px |\n| minBubbleRadius | `number` | `4` | Minimum rendered bubble radius in px |\n| defaultColor | `string` | `'#3b82f6'` | Default bubble fill color |\n| opacity | `number` | `0.7` | Bubble fill opacity |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `60` | Padding around chart area |\n\n### BubbleDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| x | `number` | X coordinate |\n| y | `number` | Y coordinate |\n| r | `number` | Bubble size value |\n| label | `string` | Optional label |\n| color | `string` | Optional fill color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { BubbleChart } from 'specifyjs/components/viz/bubble-chart';\n\ncreateElement(BubbleChart, {\n  data: [\n    { x: 10, y: 20, r: 30, label: 'A' },\n    { x: 40, y: 50, r: 15, label: 'B' },\n    { x: 25, y: 35, r: 45, label: 'C', color: '#ef4444' },\n  ],\n  xLabel: 'Revenue',\n  yLabel: 'Growth',\n  showLabels: true,\n});\n```\n\n## Notes\n\n- Renders as SVG. Invalid data points (NaN, Infinity) are filtered out.\n- Bubble radius is linearly interpolated between `minBubbleRadius` and `maxBubbleRadius`.\n- ARIA labels are applied to each bubble circle.\n"},{title:`CalendarHeatMap`,path:`components/viz/calendar-heat-map`,content:"# CalendarHeatMap\n\nGitHub-style contribution calendar rendered as SVG. Days are colored squares arranged in week columns with color intensity proportional to value.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `CalendarDatum[]` | `[]` | Array of date/value pairs |\n| width | `number` | `800` | SVG viewBox width |\n| height | `number` | `160` | SVG viewBox height |\n| colorScale | `string[]` | `['#9be9a8', '#40c463', '#30a14e', '#216e39']` | Color gradient from low to high |\n| cellSize | `number` | `12` | Size of each day cell in px |\n| cellGap | `number` | `2` | Gap between cells in px |\n| showMonthLabels | `boolean` | `true` | Show month labels above the calendar |\n| showDayLabels | `boolean` | `true` | Show day-of-week labels on the left |\n| emptyColor | `string` | `'#ebedf0'` | Color for days with no data |\n| title | `string` | `undefined` | Chart title |\n\n### CalendarDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| date | `string` | Date string in 'YYYY-MM-DD' format |\n| value | `number` | Numeric value for this date |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { CalendarHeatMap } from 'specifyjs/components/viz/calendar-heat-map';\n\ncreateElement(CalendarHeatMap, {\n  data: [\n    { date: '2026-01-01', value: 5 },\n    { date: '2026-01-02', value: 12 },\n    { date: '2026-01-03', value: 3 },\n  ],\n  title: 'Activity',\n});\n```\n\n## Notes\n\n- Renders as SVG. Date range is auto-detected from data and extended to full weeks.\n- Multiple values on the same date are summed.\n- Color interpolation uses linear blending through the color scale.\n"},{title:`ChordDiagram`,path:`components/viz/chord`,content:"# ChordDiagram\n\nCircular chord diagram rendered as SVG, showing directional flow between groups. Outer arcs are proportional to total flow; ribbons show inter-group connections.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| matrix | `number[][]` | (required) | Square matrix where `matrix[i][j]` = flow from group i to group j |\n| labels | `string[]` | (required) | Labels for each group (must match matrix dimensions) |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `600` | SVG viewBox height |\n| colors | `string[]` | built-in palette | Color palette for groups |\n| padAngle | `number` | `0.05` | Angular padding between arcs in radians |\n| showLabels | `boolean` | `true` | Show group labels |\n| showValues | `boolean` | `false` | Show flow values in labels |\n| ribbonOpacity | `number` | `0.5` | Ribbon fill opacity (0-1) |\n| innerRadiusRatio | `number` | `0.9` | Inner radius as ratio of outer radius (0.5-0.99) |\n| title | `string` | `undefined` | Chart title |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ChordDiagram } from 'specifyjs/components/viz/chord';\n\ncreateElement(ChordDiagram, {\n  matrix: [\n    [0, 10, 5],\n    [8, 0, 3],\n    [2, 7, 0],\n  ],\n  labels: ['A', 'B', 'C'],\n  showValues: true,\n});\n```\n\n## Notes\n\n- Renders as SVG with quadratic Bezier ribbons through the center.\n- Labels are rotated for readability based on their angular position.\n- Shows an empty state message when no data is provided.\n"},{title:`DecompositionTree`,path:`components/viz/decomposition-tree`,content:"# DecompositionTree\n\nHierarchical tree layout rendered as SVG with labeled rectangle nodes and curved connector lines. Supports horizontal (root-left) and vertical (root-top) orientation.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `DecompNode` | (required) | Root node of the tree |\n| width | `number` | `800` | SVG viewBox width |\n| height | `number` | `500` | SVG viewBox height |\n| orientation | `'horizontal' \\| 'vertical'` | `'horizontal'` | Layout direction |\n| nodeWidth | `number` | `120` | Width of each node rectangle |\n| nodeHeight | `number` | `40` | Height of each node rectangle |\n| showValues | `boolean` | `true` | Show values inside nodes |\n| showConnectors | `boolean` | `true` | Show connector lines |\n| connectorColor | `string` | `'#94a3b8'` | Connector line color |\n| colors | `string[]` | built-in palette | Color palette by depth |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `40` | Padding around chart area |\n\n### DecompNode\n\n| Field | Type | Description |\n|-------|------|-------------|\n| label | `string` | Node label |\n| value | `number \\| string` | Optional node value |\n| color | `string` | Optional node color |\n| children | `DecompNode[]` | Child nodes |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { DecompositionTree } from 'specifyjs/components/viz/decomposition-tree';\n\ncreateElement(DecompositionTree, {\n  data: {\n    label: 'Revenue',\n    value: 1000,\n    children: [\n      { label: 'Product A', value: 600 },\n      { label: 'Product B', value: 400, children: [\n        { label: 'Region 1', value: 250 },\n        { label: 'Region 2', value: 150 },\n      ]},\n    ],\n  },\n  title: 'Revenue Breakdown',\n});\n```\n\n## Notes\n\n- Renders as SVG with iterative BFS-based layout (no recursion).\n- Connectors use cubic Bezier curves.\n- Nodes are colored by depth using the palette, overridden by per-node `color`.\n"},{title:`EarthGlobe`,path:`components/viz/earth-globe`,content:"# EarthGlobe\n\nInteractive 3D-looking Earth globe rendered as SVG with orthographic projection. Displays country outlines with per-country coloring, hover effects, click handlers, and drag-to-rotate interaction.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | `400` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| rotation | `{ longitude: number; latitude: number }` | `{ longitude: -95, latitude: 38 }` | Initial center point |\n| fillColor | `string` | `'#22c55e'` | Land fill color |\n| oceanColor | `string` | `'#3b82f6'` | Ocean/background color |\n| strokeColor | `string` | `'#ffffff'` | Country border color |\n| strokeWidth | `number` | `0.5` | Country border width |\n| showGraticule | `boolean` | `true` | Show latitude/longitude grid |\n| graticuleColor | `string` | `'rgba(255,255,255,0.2)'` | Grid line color |\n| interactive | `boolean` | `true` | Allow drag-to-rotate |\n| onCountryClick | `(countryId: string) => void` | `undefined` | Country click callback |\n| onCountryHover | `(countryId: string \\| null) => void` | `undefined` | Country hover callback |\n| hoverColor | `string` | `'#16a34a'` | Country hover highlight color |\n| title | `string` | `'Earth Globe'` | Accessible title |\n| highlightCountries | `Record<string, string>` | `{}` | Map of country ID to highlight color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { EarthGlobe } from 'specifyjs/components/viz/earth-globe';\n\ncreateElement(EarthGlobe, {\n  highlightCountries: { US: '#ef4444', GB: '#3b82f6' },\n  onCountryClick: (id) => console.log(`Clicked: ${id}`),\n  rotation: { longitude: 0, latitude: 30 },\n});\n```\n\n## Notes\n\n- Renders as SVG with built-in country path data (public domain).\n- Orthographic projection correctly handles visibility (near side only).\n- Graticule lines are drawn at 30-degree intervals.\n- Countries have ARIA labels and keyboard support when `onCountryClick` is provided.\n"},{title:`ForceGraph`,path:`components/viz/force-graph`,content:"# ForceGraph\n\n2D force-directed graph layout rendered as SVG with animated physics simulation. Supports node dragging, pinning, custom force functions, collision detection, edge arrows, and node path trails.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| nodes | `ForceNode[]` | (required) | Array of graph nodes |\n| edges | `ForceEdge[]` | (required) | Array of edges |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| nodeRadius | `number` | `12` | Node circle radius |\n| nodeStrokeWidth | `number` | `2` | Node border width (0 for no border) |\n| showLabels | `boolean` | `true` | Show node labels |\n| showArrows | `boolean` | `false` | Show edge arrowheads |\n| repulsionForce | `number` | `300` | Coulomb repulsion constant |\n| attractionForce | `number` | `0.01` | Spring attraction constant |\n| damping | `number` | `0.9` | Velocity damping (0-1) |\n| edgeLength | `number` | `100` | Ideal edge length in pixels |\n| edgeColor | `string` | `'#94a3b8'` | Default edge color |\n| edgeWidth | `number` | `1.5` | Default edge width |\n| solidNodes | `boolean` | `true` | Enable elastic collision between nodes |\n| customForce | `CustomForceFunction` | `undefined` | Custom force function replacing default physics |\n| trails | `TrailConfig[]` | `undefined` | Trail configurations for specific nodes |\n| title | `string` | `undefined` | Chart title |\n\n### ForceNode\n\n| Field | Type | Default | Description |\n|-------|------|---------|-------------|\n| id | `string` | (required) | Unique identifier |\n| label | `string` | same as id | Display label |\n| color | `string` | from palette | Fill color |\n| x | `number` | circular layout | Initial x position |\n| y | `number` | circular layout | Initial y position |\n| fixed | `boolean` | `false` | Pinned in place |\n| solid | `boolean` | `true` | Participates in collision detection |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { ForceGraph } from 'specifyjs/components/viz/force-graph';\n\ncreateElement(ForceGraph, {\n  nodes: [\n    { id: 'a', label: 'Alice' },\n    { id: 'b', label: 'Bob' },\n    { id: 'c', label: 'Carol' },\n  ],\n  edges: [\n    { source: 'a', target: 'b' },\n    { source: 'b', target: 'c', weight: 2 },\n  ],\n  showArrows: true,\n});\n```\n\n## Notes\n\n- Renders as SVG with `requestAnimationFrame`-driven physics simulation.\n- Drag nodes to reposition; double-click to toggle fixed/pinned state.\n- Solid nodes collide elastically (Newtonian bounce). Fixed nodes act as immovable walls.\n- The `customForce` prop replaces all default physics with a user-supplied function called each frame.\n- Trails render fading path histories for designated nodes.\n"},{title:`FunnelChart`,path:`components/viz/funnel`,content:"# FunnelChart\n\nFunnel/pipeline visualization rendered as SVG. Each section is a trapezoid whose width is proportional to its value. Supports vertical and horizontal orientation.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `FunnelDatum[]` | `[]` | Data sections (in funnel order, largest first) |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| orientation | `'vertical' \\| 'horizontal'` | `'vertical'` | Funnel direction |\n| showLabels | `boolean` | `true` | Show section labels |\n| showValues | `boolean` | `true` | Show values |\n| showPercentage | `boolean` | `true` | Show percentage of first item |\n| gapSize | `number` | `2` | Gap between sections in px |\n| colors | `string[]` | blue gradient palette | Color palette |\n| title | `string` | `undefined` | Chart title |\n\n### FunnelDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| label | `string` | Section label |\n| value | `number` | Section value |\n| color | `string` | Optional fill color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { FunnelChart } from 'specifyjs/components/viz/funnel';\n\ncreateElement(FunnelChart, {\n  data: [\n    { label: 'Visitors', value: 1000 },\n    { label: 'Signups', value: 600 },\n    { label: 'Active', value: 300 },\n    { label: 'Paid', value: 100 },\n  ],\n  title: 'Conversion Funnel',\n});\n```\n\n## Notes\n\n- Renders as SVG. Each section tapers from its value width to the next section's width.\n- Percentages are computed relative to the first item's value.\n- Zero values are rendered at a minimum 5% width for visibility.\n"},{title:`GanttChart`,path:`components/viz/gantt-chart`,content:"# GanttChart\n\nTimeline bar chart rendered as SVG. Tasks are positioned horizontally by start time and duration with optional grouping, grid lines, and progress display.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| tasks | `GanttTask[]` | `[]` | Array of tasks |\n| width | `number` | `800` | SVG width |\n| height | `number` | auto-computed | SVG height (auto-fits to task count if omitted) |\n| barHeight | `number` | `24` | Height of each task bar |\n| barGap | `number` | `8` | Vertical gap between bars |\n| showGrid | `boolean` | `true` | Show vertical grid lines |\n| showLabels | `boolean` | `true` | Show task labels on the left |\n| showProgress | `boolean` | `false` | Show time range text on bars |\n| timeUnit | `string` | `'days'` | Time unit label for the axis |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `50` | Padding around chart area |\n\n### GanttTask\n\n| Field | Type | Description |\n|-------|------|-------------|\n| id | `string` | Unique task identifier |\n| label | `string` | Task label |\n| start | `number` | Start time |\n| duration | `number` | Task duration |\n| color | `string` | Optional bar color |\n| group | `string` | Optional group name (for visual grouping) |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { GanttChart } from 'specifyjs/components/viz/gantt-chart';\n\ncreateElement(GanttChart, {\n  tasks: [\n    { id: '1', label: 'Design', start: 0, duration: 5, group: 'Phase 1' },\n    { id: '2', label: 'Develop', start: 3, duration: 10, group: 'Phase 1' },\n    { id: '3', label: 'Test', start: 10, duration: 5, group: 'Phase 2' },\n  ],\n  title: 'Project Timeline',\n});\n```\n\n## Notes\n\n- Renders as SVG. Tasks are sorted by group then start time.\n- Height auto-computes based on task count if not specified.\n- Long labels are truncated with ellipsis.\n"},{title:`Gauge`,path:`components/viz/gauge`,content:"# Gauge\n\nSemicircular gauge meter rendered as SVG with colored arc segments, animated needle, tick marks, and value/label display.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| value | `number` | (required) | Current gauge value |\n| min | `number` | `0` | Minimum value |\n| max | `number` | `100` | Maximum value |\n| width | `number` | `300` | SVG viewBox width |\n| height | `number` | `200` | SVG viewBox height |\n| startAngle | `number` | `-135` | Arc start angle in degrees |\n| endAngle | `number` | `135` | Arc end angle in degrees |\n| arcWidth | `number` | `20` | Arc stroke width |\n| showValue | `boolean` | `true` | Show numeric value |\n| showMinMax | `boolean` | `true` | Show min/max labels |\n| showTicks | `boolean` | `true` | Show tick marks |\n| tickCount | `number` | `10` | Number of tick divisions |\n| label | `string` | `undefined` | Label text below value |\n| unit | `string` | `undefined` | Unit text after value (e.g. 'rpm', '%') |\n| colors | `string[]` | `['#22c55e', '#f59e0b', '#ef4444']` | Arc segment colors (evenly distributed) |\n| needleColor | `string` | `'#374151'` | Needle fill color |\n| backgroundColor | `string` | `'#e5e7eb'` | Background arc color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Gauge } from 'specifyjs/components/viz/gauge';\n\ncreateElement(Gauge, {\n  value: 72,\n  min: 0,\n  max: 100,\n  unit: '%',\n  label: 'CPU Usage',\n  colors: ['#22c55e', '#f59e0b', '#ef4444'],\n});\n```\n\n## Notes\n\n- Renders as SVG with `role=\"meter\"` and ARIA value attributes.\n- The needle is a triangular polygon with a center cap circle.\n- Value is clamped to the min/max range.\n- Default angle span of 270 degrees (from -135 to 135) is typical for dashboard gauges.\n"},{title:`HypercubeGraph`,path:`components/viz/graph`,content:"# HypercubeGraph\n\nHypercube graph visualization component for SpecifyJS. Renders an N-dimensional hypercube as an SVG with colored vertex balls and heavy black edges.\n\n## Import\n\n```typescript\nimport { HypercubeGraph } from '@specifyjs/graph';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `dimension` | `number` | `4` | Hypercube dimension (2-8) |\n| `width` | `number` | `600` | SVG width in px |\n| `height` | `number` | `600` | SVG height in px |\n| `vertexRadius` | `number` | `10` | Ball radius in px |\n| `edgeWidth` | `number` | `3` | Edge stroke width |\n| `edgeColor` | `string` | `'#111'` | Edge color |\n| `vertexColors` | `string[] \\| 'auto'` | `'auto'` | Vertex colors (auto generates a palette) |\n| `perspective` | `number` | `0.25` | Perspective strength (0 = orthographic) |\n| `rotationSpeed` | `number` | `0.008` | Radians/frame (0 = static) |\n| `showLabels` | `boolean` | `false` | Show binary vertex labels |\n| `backgroundColor` | `string` | `'transparent'` | SVG background |\n| `scale` | `number` | auto | Coordinate scale factor (auto-fit by default) |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { HypercubeGraph } from '@specifyjs/graph';\n\nfunction App() {\n  return createElement(HypercubeGraph, {\n    dimension: 4,          // tesseract\n    width: 600,\n    height: 600,\n    vertexRadius: 12,\n    edgeWidth: 3,\n    edgeColor: '#111',\n    vertexColors: 'auto',\n    perspective: 0.25,\n    rotationSpeed: 0.008,\n    showLabels: true,\n  });\n}\n```\n\n## Hook\n\n```typescript\nimport { useHypercube } from '@specifyjs/graph';\n\nconst { data, angles, setAngles } = useHypercube({\n  dimension: 4,\n  rotationSpeed: 0.01,\n});\n// data.vertices, data.edges available for custom rendering\n```\n\n## Features\n\n- Configurable dimension (2D square through 8D hypercube)\n- Auto-rotation with configurable speed per plane pair\n- Mouse-drag rotation for interactive exploration\n- Perspective or orthographic projection\n- Depth-sorted rendering via painter's algorithm\n- Depth-based opacity and vertex scaling for 3D effect\n- Custom vertex colors or auto-generated palette\n- Optional binary vertex labels\n- Zero dependencies (pure SpecifyJS + SVG)\n"},{title:`HeatMap`,path:`components/viz/heat-map`,content:"# HeatMap\n\n2D heat map rendered as SVG. Each cell's color intensity is proportional to its value, with configurable color gradient, row/column labels, and optional value text.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `number[][]` | `[]` | 2D grid of values (data[row][col]) |\n| rowLabels | `string[]` | `undefined` | Labels for rows (Y axis) |\n| columnLabels | `string[]` | `undefined` | Labels for columns (X axis) |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| colorScale | `string[]` | `['#3b82f6', '#fbbf24', '#ef4444']` | Color gradient (low to high) |\n| minValue | `number` | auto-detected | Minimum value for color mapping |\n| maxValue | `number` | auto-detected | Maximum value for color mapping |\n| showValues | `boolean` | `false` | Show numeric value in each cell |\n| cellBorderColor | `string` | `'#fff'` | Cell border color |\n| cellBorderWidth | `number` | `1` | Cell border width |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `60` | Padding around chart |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { HeatMap } from 'specifyjs/components/viz/heat-map';\n\ncreateElement(HeatMap, {\n  data: [[1, 5, 3], [7, 2, 8], [4, 6, 1]],\n  rowLabels: ['A', 'B', 'C'],\n  columnLabels: ['X', 'Y', 'Z'],\n  showValues: true,\n  title: 'Correlation Matrix',\n});\n```\n\n## Notes\n\n- Renders as SVG. Value text color automatically adjusts for contrast (light/dark) based on cell fill luminance.\n- Min/max values are auto-detected from data if not specified.\n- Shows an empty state message when data has no rows or columns.\n"},{title:`Histogram`,path:`components/viz/histogram`,content:"# Histogram\n\nBins raw numeric data and renders vertical bar charts as SVG. Supports automatic or user-specified bin counts with grid lines, value labels, and axis labels.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `number[]` | `[]` | Raw data values to bin |\n| bins | `number` | `10` | Number of bins |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| barColor | `string` | `'#3b82f6'` | Bar fill color |\n| barGap | `number` | `2` | Gap between bars in px |\n| showGrid | `boolean` | `true` | Show grid lines |\n| showValues | `boolean` | `true` | Show count labels above bars |\n| title | `string` | `undefined` | Chart title |\n| xLabel | `string` | `undefined` | X-axis label |\n| yLabel | `string` | `undefined` | Y-axis label |\n| padding | `number` | `60` | Padding around chart area |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Histogram } from 'specifyjs/components/viz/histogram';\n\ncreateElement(Histogram, {\n  data: [1, 2, 2, 3, 3, 3, 4, 5, 5, 6, 7, 8, 8, 9, 10],\n  bins: 5,\n  title: 'Value Distribution',\n  xLabel: 'Value',\n  yLabel: 'Count',\n});\n```\n\n## Notes\n\n- Renders as SVG. Bin ranges are computed automatically as equal-width intervals.\n- Handles edge cases: empty data, single value, all-same values.\n- Bin range labels are shown on the x-axis; the final bin's upper bound is also displayed.\n"},{title:`LollipopChart`,path:`components/viz/lollipop`,content:"# LollipopChart\n\nLollipop chart rendered as SVG. Each data point is a thin stem (line) with a circle at the tip, providing a lighter visual alternative to bar charts.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `LollipopDatum[]` | `[]` | Data points to render |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| orientation | `'horizontal' \\| 'vertical'` | `'vertical'` | Chart orientation |\n| stemColor | `string` | `'#94a3b8'` | Stem line color |\n| stemWidth | `number` | `2` | Stem line width |\n| dotRadius | `number` | `6` | Dot circle radius |\n| dotColor | `string` | `'#3b82f6'` | Default dot fill color |\n| showGrid | `boolean` | `true` | Show grid lines |\n| showValues | `boolean` | `true` | Show value labels |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `60` | Padding around chart area |\n\n### LollipopDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| label | `string` | Category label |\n| value | `number` | Data value |\n| color | `string` | Optional dot color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { LollipopChart } from 'specifyjs/components/viz/lollipop';\n\ncreateElement(LollipopChart, {\n  data: [\n    { label: 'Jan', value: 30 },\n    { label: 'Feb', value: 45 },\n    { label: 'Mar', value: 28 },\n  ],\n  title: 'Monthly Sales',\n});\n```\n\n## Notes\n\n- Renders as SVG. Category labels are rotated -45 degrees in vertical orientation to prevent overlap.\n- Shows an empty state message when no data is provided.\n"},{title:`Matrix`,path:`components/viz/matrix`,content:"# Matrix\n\nCorrelation/confusion matrix visualization rendered as SVG. Displays a colored grid with intensity proportional to value, optional diagonal highlighting, and symmetric mirroring for correlation matrices.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `number[][]` | `[]` | 2D grid of values (data[row][col]) |\n| labels | `string[]` | `undefined` | Shared row/column labels for square matrices |\n| rowLabels | `string[]` | `undefined` | Explicit row labels (overrides `labels`) |\n| columnLabels | `string[]` | `undefined` | Explicit column labels (overrides `labels`) |\n| width | `number` | `500` | SVG viewBox width |\n| height | `number` | `500` | SVG viewBox height |\n| colorScale | `string[]` | `['#f0f9ff', '#3b82f6', '#1e3a8a']` | Color gradient (low to high) |\n| showValues | `boolean` | `true` | Show numeric value in each cell |\n| showDiagonal | `boolean` | `true` | Highlight diagonal cells with bold border |\n| cellBorderColor | `string` | `'#e5e7eb'` | Cell border color |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `70` | Padding around chart |\n| symmetric | `boolean` | `false` | Mirror values across diagonal |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { Matrix } from 'specifyjs/components/viz/matrix';\n\ncreateElement(Matrix, {\n  data: [[1.0, 0.8, 0.3], [0.8, 1.0, 0.5], [0.3, 0.5, 1.0]],\n  labels: ['A', 'B', 'C'],\n  symmetric: true,\n  title: 'Correlation Matrix',\n});\n```\n\n## Notes\n\n- Renders as SVG. Text color automatically adjusts for contrast based on cell background luminance.\n- When `symmetric` is true, zero values are filled from the mirror position across the diagonal.\n- Diagonal cells get a bold border when `showDiagonal` is enabled.\n"},{title:`Partition`,path:`components/viz/partition`,content:`# Partition

Icicle/partition diagram rendered as SVG. Subdivides hierarchical data into proportional rectangles across depth levels. Supports horizontal (icicle) and vertical (flame) orientation.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | \`PartitionNode\` | (required) | Root node of the partition data |
| width | \`number\` | \`600\` | SVG viewBox width |
| height | \`number\` | \`400\` | SVG viewBox height |
| orientation | \`'horizontal' \\| 'vertical'\` | \`'horizontal'\` | Layout direction |
| showLabels | \`boolean\` | \`true\` | Show labels inside cells |
| showValues | \`boolean\` | \`true\` | Show values inside cells |
| colors | \`string[]\` | built-in palette | Color palette |
| borderColor | \`string\` | \`'#ffffff'\` | Cell border color |
| borderWidth | \`number\` | \`1\` | Cell border width |
| title | \`string\` | \`undefined\` | Chart title |
| padding | \`number\` | \`10\` | Padding around chart area |

### PartitionNode

| Field | Type | Description |
|-------|------|-------------|
| label | \`string\` | Node label |
| value | \`number\` | Leaf node value (internal nodes sum descendants) |
| color | \`string\` | Optional fill color |
| children | \`PartitionNode[]\` | Child nodes |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Partition } from 'specifyjs/components/viz/partition';

createElement(Partition, {
  data: {
    label: 'Root',
    children: [
      { label: 'A', value: 30 },
      { label: 'B', children: [
        { label: 'B1', value: 20 },
        { label: 'B2', value: 10 },
      ]},
    ],
  },
  title: 'Icicle Diagram',
});
\`\`\`

## Notes

- Renders as SVG using iterative tree traversal (no recursion).
- Each depth level occupies a full row (horizontal) or column (vertical).
- Labels and values are hidden for cells that are too small.
`},{title:`PivotTable`,path:`components/viz/pivot-table`,content:"# PivotTable\n\nCross-tabulation table rendered as SVG. Aggregates data records across row and column dimensions with configurable aggregation functions and optional totals.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `Record<string, unknown>[]` | `[]` | Array of data records |\n| rows | `string[]` | `[]` | Row dimension field names |\n| columns | `string[]` | `[]` | Column dimension field names |\n| values | `string[]` | `[]` | Value field names to aggregate |\n| aggregation | `'sum' \\| 'count' \\| 'avg' \\| 'min' \\| 'max'` | `'sum'` | Aggregation function |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| showTotals | `boolean` | `true` | Show totals row and column |\n| title | `string` | `undefined` | Chart title |\n| headerColor | `string` | `'#3b82f6'` | Header background color |\n| cellPadding | `number` | `8` | Cell padding in px |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { PivotTable } from 'specifyjs/components/viz/pivot-table';\n\ncreateElement(PivotTable, {\n  data: [\n    { region: 'North', product: 'A', sales: 100 },\n    { region: 'North', product: 'B', sales: 150 },\n    { region: 'South', product: 'A', sales: 200 },\n    { region: 'South', product: 'B', sales: 120 },\n  ],\n  rows: ['region'],\n  columns: ['product'],\n  values: ['sales'],\n  aggregation: 'sum',\n  showTotals: true,\n  title: 'Sales by Region and Product',\n});\n```\n\n## Notes\n\n- Renders as SVG with `role=\"table\"` for accessibility.\n- Supports multiple row/column dimension fields (composite keys).\n- Alternating row backgrounds for readability.\n- Long labels are truncated with ellipsis.\n"},{title:`RadarChart`,path:`components/viz/radar-chart`,content:`# RadarChart

Spider/radar chart rendered as SVG. Supports multiple overlaid data series with concentric grid rings, axis labels, filled polygons, data point dots, and a legend.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| axes | \`RadarAxis[]\` | \`[]\` | Axes definition (one per spoke) |
| series | \`RadarSeries[]\` | \`[]\` | Data series to overlay |
| width | \`number\` | \`500\` | SVG viewBox width |
| height | \`number\` | \`500\` | SVG viewBox height |
| levels | \`number\` | \`5\` | Number of concentric grid rings |
| showLabels | \`boolean\` | \`true\` | Show axis labels around the perimeter |
| showValues | \`boolean\` | \`false\` | Show value annotations at data points |
| showLegend | \`boolean\` | \`true\` | Show legend |
| showDots | \`boolean\` | \`true\` | Show dots at data points |
| gridColor | \`string\` | \`'#d1d5db'\` | Grid line color |
| title | \`string\` | \`undefined\` | Chart title |

### RadarAxis

| Field | Type | Description |
|-------|------|-------------|
| label | \`string\` | Axis label |
| max | \`number\` | Optional axis maximum (auto-detected if omitted) |

### RadarSeries

| Field | Type | Description |
|-------|------|-------------|
| label | \`string\` | Series label |
| values | \`number[]\` | Values for each axis |
| color | \`string\` | Series color |
| fillOpacity | \`number\` | Fill opacity (default: 0.15) |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { RadarChart } from 'specifyjs/components/viz/radar-chart';

createElement(RadarChart, {
  axes: [
    { label: 'Speed' },
    { label: 'Power' },
    { label: 'Range' },
    { label: 'Armor' },
    { label: 'Stealth' },
  ],
  series: [
    { label: 'Unit A', values: [8, 6, 7, 5, 9], color: '#3b82f6' },
    { label: 'Unit B', values: [5, 9, 4, 8, 3], color: '#ef4444' },
  ],
  title: 'Unit Comparison',
});
\`\`\`

## Notes

- Renders as SVG. Requires at least 3 axes (shows error message otherwise).
- Each series renders as a filled polygon with an outlined border.
- Axis maximum is auto-detected from data if not specified per axis.
`},{title:`SankeyDiagram`,path:`components/viz/sankey`,content:`# SankeyDiagram

Sankey/flow diagram rendered as SVG. Nodes are positioned in columns from sources to sinks; curved Bezier paths show flow between nodes with width proportional to value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| nodes | \`SankeyNode[]\` | (required) | Array of nodes |
| links | \`SankeyLink[]\` | (required) | Array of flow links |
| width | \`number\` | \`800\` | SVG viewBox width |
| height | \`number\` | \`500\` | SVG viewBox height |
| nodeWidth | \`number\` | \`20\` | Width of node rectangles |
| nodePadding | \`number\` | \`10\` | Vertical padding between nodes |
| showLabels | \`boolean\` | \`true\` | Show node labels |
| showValues | \`boolean\` | \`false\` | Show flow values on links |
| linkOpacity | \`number\` | \`0.4\` | Link fill opacity (0-1) |
| colors | \`string[]\` | built-in palette | Node color palette |
| title | \`string\` | \`undefined\` | Chart title |
| padding | \`number\` | \`40\` | Padding around chart area |

### SankeyNode

| Field | Type | Description |
|-------|------|-------------|
| id | \`string\` | Unique identifier |
| label | \`string\` | Display label |
| color | \`string\` | Optional node color |

### SankeyLink

| Field | Type | Description |
|-------|------|-------------|
| source | \`string\` | Source node ID |
| target | \`string\` | Target node ID |
| value | \`number\` | Flow value |
| color | \`string\` | Optional link color |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { SankeyDiagram } from 'specifyjs/components/viz/sankey';

createElement(SankeyDiagram, {
  nodes: [
    { id: 'a', label: 'Source A' },
    { id: 'b', label: 'Source B' },
    { id: 'c', label: 'Target C' },
  ],
  links: [
    { source: 'a', target: 'c', value: 30 },
    { source: 'b', target: 'c', value: 20 },
  ],
  title: 'Flow Diagram',
});
\`\`\`

## Notes

- Renders as SVG with cubic Bezier flow paths.
- Column assignment uses iterative BFS from source nodes (nodes with no incoming links).
- Node heights are proportional to total throughput within each column.
- Labels are placed to the left of first-column nodes and to the right of last-column nodes.
`},{title:`Sunburst`,path:`components/viz/sunburst`,content:`# Sunburst

Multi-level donut/ring chart rendered as SVG. Hierarchical data is displayed as concentric ring segments with angles proportional to value.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | \`SunburstNode\` | (required) | Root node of the sunburst data |
| width | \`number\` | \`500\` | SVG viewBox width |
| height | \`number\` | \`500\` | SVG viewBox height |
| innerRadius | \`number\` | \`40\` | Inner radius of the first ring |
| showLabels | \`boolean\` | \`true\` | Show labels on segments |
| colors | \`string[]\` | built-in palette | Color palette |
| strokeColor | \`string\` | \`'#ffffff'\` | Stroke color between segments |
| strokeWidth | \`number\` | \`1\` | Stroke width between segments |
| title | \`string\` | \`undefined\` | Chart title |

### SunburstNode

| Field | Type | Description |
|-------|------|-------------|
| label | \`string\` | Segment label |
| value | \`number\` | Leaf node value |
| color | \`string\` | Optional fill color |
| children | \`SunburstNode[]\` | Child nodes |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Sunburst } from 'specifyjs/components/viz/sunburst';

createElement(Sunburst, {
  data: {
    label: 'Total',
    children: [
      { label: 'A', value: 30, children: [
        { label: 'A1', value: 15 },
        { label: 'A2', value: 15 },
      ]},
      { label: 'B', value: 20 },
    ],
  },
  title: 'Hierarchical Breakdown',
});
\`\`\`

## Notes

- Renders as SVG using iterative BFS layout (no recursion).
- Ring width is evenly divided across depth levels.
- Labels are hidden on segments that are too small to fit text.
- Full-circle arcs (single child at any level) are handled with special SVG path logic.
`},{title:`TreeMap`,path:`components/viz/tree-map`,content:`# TreeMap

Treemap visualization rendered as SVG using a squarified layout algorithm. Hierarchical data is displayed as nested proportional rectangles.

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| data | \`TreeMapNode\` | (required) | Root node of the treemap data |
| width | \`number\` | \`600\` | SVG viewBox width |
| height | \`number\` | \`400\` | SVG viewBox height |
| showLabels | \`boolean\` | \`true\` | Show labels inside cells |
| showValues | \`boolean\` | \`true\` | Show values inside cells |
| colors | \`string[]\` | built-in palette | Color palette |
| borderColor | \`string\` | \`'#ffffff'\` | Cell border color |
| borderWidth | \`number\` | \`2\` | Cell border width |
| padding | \`number\` | \`2\` | Inner padding for nested cells |
| title | \`string\` | \`undefined\` | Chart title |

### TreeMapNode

| Field | Type | Description |
|-------|------|-------------|
| label | \`string\` | Node label |
| value | \`number\` | Leaf node value |
| color | \`string\` | Optional fill color |
| children | \`TreeMapNode[]\` | Child nodes |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { TreeMap } from 'specifyjs/components/viz/tree-map';

createElement(TreeMap, {
  data: {
    label: 'Portfolio',
    value: 0,
    children: [
      { label: 'Stocks', value: 60 },
      { label: 'Bonds', value: 25 },
      { label: 'Cash', value: 15 },
    ],
  },
  title: 'Asset Allocation',
});
\`\`\`

## Notes

- Renders as SVG using an iterative squarified treemap algorithm (optimizes for square-like aspect ratios).
- Nested children are laid out within their parent cell with a small header offset for the parent label.
- Labels and values are hidden for cells too small to display them.
`},{title:`USStateMap`,path:`components/viz/us-state-map`,content:"# USStateMap\n\nInteractive SVG map of the United States with per-state coloring, hover effects, and click handlers. Uses built-in public domain SVG path data.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| width | `number` | `959` | SVG viewBox width |\n| height | `number` | `593` | SVG viewBox height |\n| stateColors | `Record<string, string>` | `{}` | Map of state abbreviation to fill color |\n| defaultColor | `string` | `'#D0D0D0'` | Default fill color for uncolored states |\n| strokeColor | `string` | `'#FFFFFF'` | Border color between states |\n| strokeWidth | `number` | `1` | Border width |\n| onStateClick | `(stateId: string) => void` | `undefined` | Click handler (receives state abbreviation) |\n| onStateHover | `(stateId: string \\| null) => void` | `undefined` | Hover handler (null on mouse leave) |\n| hoverColor | `string` | `'#FFD700'` | Highlight color on hover |\n| title | `string` | `'Map of the United States'` | Accessible SVG title |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { USStateMap } from 'specifyjs/components/viz/us-state-map';\n\ncreateElement(USStateMap, {\n  stateColors: {\n    CA: '#3b82f6',\n    TX: '#ef4444',\n    NY: '#22c55e',\n  },\n  onStateClick: (id) => console.log(`Clicked: ${id}`),\n  onStateHover: (id) => console.log(`Hovered: ${id}`),\n});\n```\n\n## Notes\n\n- Renders as SVG with built-in state path data (public domain CC0).\n- States with `onStateClick` receive `role=\"button\"`, `tabindex`, and keyboard support (Enter/Space).\n- Hover effects are applied via direct DOM attribute manipulation for performance.\n"},{title:`VectorField`,path:`components/viz/vector-field`,content:"# VectorField\n\n2D vector field plot rendered as SVG or Canvas. Displays arrows at grid points showing vector direction and magnitude, with optional color-by-magnitude encoding.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `VectorDatum[]` | `undefined` | Pre-computed vector data |\n| vectorFunction | `(x, y) => { dx, dy }` | `undefined` | Function computing vector at each grid point |\n| width | `number` | `600` | Width in pixels |\n| height | `number` | `600` | Height in pixels |\n| gridSize | `number` | `15` | Arrows per axis (max: 50) |\n| xRange | `[number, number]` | `[-5, 5]` | X-axis domain |\n| yRange | `[number, number]` | `[-5, 5]` | Y-axis domain |\n| arrowScale | `number` | `1` | Scale factor for arrow length |\n| arrowColor | `string` | `'#3b82f6'` | Default arrow color |\n| showGrid | `boolean` | `true` | Show background grid |\n| showAxes | `boolean` | `true` | Show axes through origin |\n| colorByMagnitude | `boolean` | `false` | Color arrows by magnitude |\n| colorScale | `string[]` | `['#3b82f6', '#8b5cf6', '#ef4444']` | Magnitude color scale |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `50` | Padding around chart |\n| tickFontSize | `number` | `10` | Axis tick label font size |\n| arrowWidth | `number` | `1.5` | Arrow stroke width |\n| renderer | `'svg' \\| 'canvas'` | `'svg'` | Rendering mode |\n| computeWorker | `ComputeWorkerFn` | `undefined` | Custom compute function for vector calculation |\n\n### VectorDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| x | `number` | X position |\n| y | `number` | Y position |\n| dx | `number` | Vector x component |\n| dy | `number` | Vector y component |\n| magnitude | `number` | Optional pre-computed magnitude |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { VectorField } from 'specifyjs/components/viz/vector-field';\n\n// Rotation field\ncreateElement(VectorField, {\n  vectorFunction: (x, y) => ({ dx: -y, dy: x }),\n  colorByMagnitude: true,\n  title: 'Rotation Field',\n});\n\n// Canvas mode for high arrow counts\ncreateElement(VectorField, {\n  vectorFunction: (x, y) => ({ dx: Math.sin(y), dy: Math.cos(x) }),\n  gridSize: 40,\n  renderer: 'canvas',\n});\n```\n\n## Notes\n\n- SVG mode (default) renders each arrow as an SVG line + polygon arrowhead.\n- Canvas mode uses `requestAnimationFrame` for smooth rendering and is recommended for `gridSize > 25`.\n- Arrow scale is auto-computed based on grid density and maximum magnitude.\n- The `computeWorker` prop allows offloading vector computation to a custom function (e.g., for GPU-accelerated or radio propagation simulations).\n"},{title:`WaterfallChart`,path:`components/viz/waterfall`,content:"# WaterfallChart\n\nWaterfall/cascade chart rendered as SVG. Each bar starts where the previous bar ended, showing cumulative effect. Bars are color-coded as increases (green), decreases (red), or totals (blue).\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| data | `WaterfallDatum[]` | `[]` | Data points to render |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| increaseColor | `string` | `'#10b981'` | Color for increase bars |\n| decreaseColor | `string` | `'#ef4444'` | Color for decrease bars |\n| totalColor | `string` | `'#3b82f6'` | Color for total bars |\n| connectorColor | `string` | `'#94a3b8'` | Connector line color |\n| showValues | `boolean` | `true` | Show value labels on bars |\n| showGrid | `boolean` | `true` | Show grid lines |\n| showConnectors | `boolean` | `true` | Show connector lines between bars |\n| title | `string` | `undefined` | Chart title |\n| padding | `number` | `60` | Padding around chart area |\n\n### WaterfallDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| label | `string` | Category label |\n| value | `number` | Change value |\n| type | `'increase' \\| 'decrease' \\| 'total'` | Bar type (auto-detected from sign if omitted) |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { WaterfallChart } from 'specifyjs/components/viz/waterfall';\n\ncreateElement(WaterfallChart, {\n  data: [\n    { label: 'Revenue', value: 500 },\n    { label: 'COGS', value: -200, type: 'decrease' },\n    { label: 'Gross Profit', value: 0, type: 'total' },\n    { label: 'Expenses', value: -150, type: 'decrease' },\n    { label: 'Net Income', value: 0, type: 'total' },\n  ],\n  title: 'Income Waterfall',\n});\n```\n\n## Notes\n\n- Renders as SVG. Total bars start from zero and show the running cumulative.\n- Connector lines (dashed) link the end of each bar to the start of the next (skipped before totals).\n- Value labels show +/- prefix for non-total bars.\n- Handles negative cumulative values correctly (bars can extend below zero).\n"},{title:`WordCloud`,path:`components/viz/word-cloud`,content:"# WordCloud\n\nWord cloud visualization rendered as SVG. Font size is proportional to word weight, with spiral placement to avoid overlaps.\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| words | `WordDatum[]` | `[]` | Array of words with weights |\n| width | `number` | `600` | SVG viewBox width |\n| height | `number` | `400` | SVG viewBox height |\n| minFontSize | `number` | `10` | Minimum font size in px |\n| maxFontSize | `number` | `64` | Maximum font size in px |\n| fontFamily | `string` | `'sans-serif'` | Font family |\n| colors | `string[]` | built-in palette | Color palette |\n| rotations | `number[]` | `[0, -45, 45, 90]` | Allowed rotation angles in degrees |\n| padding | `number` | `4` | Padding between words in px |\n| spiral | `'archimedean' \\| 'rectangular'` | `'archimedean'` | Spiral placement algorithm |\n| title | `string` | `undefined` | Chart title |\n\n### WordDatum\n\n| Field | Type | Description |\n|-------|------|-------------|\n| text | `string` | Word text |\n| weight | `number` | Word weight (determines font size) |\n| color | `string` | Optional fill color |\n\n## Usage\n\n```ts\nimport { createElement } from 'specifyjs';\nimport { WordCloud } from 'specifyjs/components/viz/word-cloud';\n\ncreateElement(WordCloud, {\n  words: [\n    { text: 'JavaScript', weight: 100 },\n    { text: 'TypeScript', weight: 80 },\n    { text: 'SpecifyJS', weight: 90 },\n    { text: 'SVG', weight: 50 },\n    { text: 'Canvas', weight: 40 },\n  ],\n  title: 'Technology Cloud',\n});\n```\n\n## Notes\n\n- Renders as SVG. Placement is deterministic for the same input.\n- Words are placed largest-first using a spiral outward from center.\n- Word width is estimated using character count (since DOM text measurement is unavailable during pre-rendering).\n- Words that cannot be placed without overlap or going out of bounds are gracefully skipped.\n- Rotation is assigned per-word using a deterministic hash of the word text.\n"},{title:`VizWrapper`,path:`components/viz/wrapper`,content:"# VizWrapper\n\nContainer component for visualization components with configurable title, legend, and CSS containment for style isolation.\n\n## Import\n\n```typescript\nimport { VizWrapper } from '@specifyjs/viz-wrapper';\n```\n\n## Props\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `title` | `string` | `undefined` | Title text |\n| `titlePosition` | `'top' \\| 'bottom' \\| 'left' \\| 'right'` | `'top'` | Position of the title relative to content |\n| `titleAlign` | `'start' \\| 'center' \\| 'end'` | `'center'` | Title alignment |\n| `titleFontSize` | `string` | `'16px'` | Title font size |\n| `titleFontWeight` | `string` | `'600'` | Title font weight |\n| `titleColor` | `string` | `'#1f2937'` | Title color |\n| `legend` | `LegendItem[]` | `undefined` | Legend items |\n| `legendPosition` | `'top' \\| 'bottom' \\| 'left' \\| 'right'` | `'bottom'` | Position of the legend relative to content |\n| `legendAlign` | `'start' \\| 'center' \\| 'end'` | `'center'` | Legend alignment |\n| `legendFontSize` | `string` | `'12px'` | Legend font size |\n| `legendGap` | `number` | `16` | Legend item spacing in px |\n| `width` | `string \\| number` | `'auto'` | Container width |\n| `height` | `string \\| number` | `'auto'` | Container height |\n| `backgroundColor` | `string` | `'#ffffff'` | Background color |\n| `border` | `string` | `'1px solid #e5e7eb'` | Border |\n| `borderRadius` | `string` | `'8px'` | Border radius |\n| `padding` | `string` | `'16px'` | Padding around the entire wrapper |\n| `gap` | `string` | `'12px'` | Gap between title/legend/content |\n| `boxShadow` | `string` | `undefined` | Box shadow |\n| `fontFamily` | `string` | `'inherit'` | Font family |\n| `contain` | `string` | `'layout style paint'` | CSS contain value for isolation |\n| `className` | `string` | `undefined` | Extra className on the outer container |\n| `style` | `Record<string, string>` | `undefined` | Extra inline style on the outer container |\n| `children` | `unknown` | `undefined` | The visualization content |\n\n### LegendItem\n\n| Prop | Type | Default | Description |\n|------|------|---------|-------------|\n| `label` | `string` | -- | Legend label text |\n| `color` | `string` | -- | Swatch color |\n| `dash` | `string` | `undefined` | Dash pattern for line shape (e.g. `'5,3'`) |\n| `shape` | `'circle' \\| 'square' \\| 'line'` | `'circle'` | Swatch shape |\n\n## Usage\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { VizWrapper } from '@specifyjs/viz-wrapper';\nimport { LineGraph } from '@specifyjs/2D-line-graph';\n\nfunction App() {\n  return createElement(VizWrapper, {\n    title: 'Monthly Revenue',\n    titlePosition: 'top',\n    legend: [\n      { label: 'Revenue', color: '#3b82f6', shape: 'line' },\n      { label: 'Expenses', color: '#ef4444', shape: 'line', dash: '5,3' },\n    ],\n    legendPosition: 'bottom',\n    width: 800,\n    height: 500,\n    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',\n  },\n    createElement(LineGraph, {\n      data: [{ x: 1, y: 100 }, { x: 2, y: 200 }, { x: 3, y: 150 }],\n      width: 750,\n      height: 380,\n    }),\n  );\n}\n```\n\n## Features\n\n- Configurable title with positional placement (top, bottom, left, right) and text alignment\n- Legend with circle, square, and line swatch shapes (line supports dash patterns)\n- Flexible layout: title and legend can be placed on any edge independently\n- CSS containment (`contain: layout style paint`) for style isolation from the surrounding DOM\n- Row-based sub-layout when title or legend is placed on left/right edges\n- Configurable container styling: background, border, border-radius, padding, box shadow\n- Content area centered with flex layout, filling available space\n"},{title:`IDE`,path:`components/page/ide`,content:`# IDE

Full-screen layout resembling a programmer's IDE (VS Code style). Features a title bar, menu bar, left sidebar file explorer, main editor area with line numbers and syntax-highlighted TypeScript, a right minimap strip, a bottom terminal panel, and a status bar.

## Import

\`\`\`ts
import { IDE } from 'specifyjs/components/page/ide';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`className\` | \`string\` | -- | Extra class name |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { IDE } from 'specifyjs/components/page/ide';

const ide = createElement(IDE, { className: 'my-ide' });
\`\`\`

## Features

- **Title bar** displaying "SpecifyJS IDE".
- **Menu bar** with File, Edit, Selection, View, Go, Run, Terminal, and Help items.
- **File explorer sidebar** (220px) with a nested file tree showing folders and files with indentation and icons.
- **Editor area** with a tab bar (active tab: App.ts), line numbers, and syntax-colored TypeScript sample code. Colors differentiate imports, keywords, functions, and comments.
- **Minimap** strip on the right edge representing code density as thin colored bars.
- **Bottom terminal panel** (120px) with Terminal, Problems, and Output tabs. The Terminal tab displays sample \`npm run dev\` output.
- **Status bar** (blue, VS Code style) showing branch name, error/warning counts, cursor position, encoding, and language.

## Accessibility

- The menu bar renders with \`role="menubar"\` and each item has \`role="menuitem"\` with an \`aria-label\`.
- The file explorer sidebar is a \`<nav>\` with \`aria-label="File explorer"\`.
- Line numbers and the minimap are marked \`aria-hidden="true"\` as decorative elements.
- The bottom panel tab bar uses \`role="tablist"\` with \`role="tab"\` and \`aria-selected\` on each tab.
- The terminal content area has \`role="log"\` for assistive technology.
`},{title:`TradingDashboard`,path:`components/page/trading-dashboard`,content:`# TradingDashboard

Full-screen layout resembling a stock trading terminal. Features a header bar and a 3x2 CSS grid containing a price chart (SVG), order book, watchlist, position summary, recent trades, and market depth visualization. Uses \`useState\` and \`useEffect\` for a simulated live price ticker.

## Import

\`\`\`ts
import { TradingDashboard } from 'specifyjs/components/page/trading-dashboard';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`className\` | \`string\` | -- | Extra class name |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { TradingDashboard } from 'specifyjs/components/page/trading-dashboard';

const dashboard = createElement(TradingDashboard, null);
\`\`\`

## Features

- **Header bar** with platform title, account number, balance, and connection status.
- **Price chart** rendered as an SVG with colored line segments (green for up, red for down) and horizontal grid lines. Displays the current AAPL price.
- **Order book** with bid/ask price and quantity columns. Row backgrounds are shaded proportionally to quantity for visual depth.
- **Watchlist** table showing symbol, price, percentage change (color-coded), and volume for 6 stocks.
- **Positions** table listing open positions with symbol, quantity, average price, and color-coded P&L.
- **Recent trades** table with timestamp, symbol, buy/sell side (color-coded), quantity, and price.
- **Market depth** visualization with horizontal bid (green) and ask (red) bars sized proportionally to volume.
- **Live price simulation** using a 2-second interval that randomly adjusts the AAPL price via \`useState\`/\`useEffect\`.

## Accessibility

- The price chart SVG has \`role="img"\` and \`aria-label="Price chart"\` for screen readers.
- The header uses a \`<header>\` element for landmark navigation.
- Tables use semantic \`<thead>\`/\`<tbody>\` structure with header cells.
- Color-coded values (green/red) convey meaning through color alone; consider adding text indicators (e.g., up/down arrows) for color-blind users in production use.
`},{title:`UnityDesktop`,path:`components/page/unity-desktop`,content:`# UnityDesktop

Configurable top-level layout that assembles the Ubuntu Unity desktop environment from reusable sub-components: SystemTray (top panel), Dock (left launcher), DesktopBackground (workspace), and WindowManager (context provider for window state). Includes toast notifications and automatic dock-to-window integration.

## Import

\`\`\`ts
import { UnityDesktop } from 'specifyjs/components/page/unity-desktop';
import { UnityApp } from 'specifyjs/components/page/unity-desktop';
import type { UnityDesktopProps, UnityDesktopApp, UnityDesktopUser, UnityAppProps } from 'specifyjs/components/page/unity-desktop';
\`\`\`

## Props

### UnityDesktopProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`apps\` | \`UnityDesktopApp[]\` | *required* | Application definitions for the dock launcher |
| \`user\` | \`UnityDesktopUser\` | \`undefined\` | User info for the system tray |
| \`onAppOpen\` | \`(appId: string) => void\` | \`undefined\` | Called when an app icon is clicked in the dock |
| \`onLogout\` | \`() => void\` | \`undefined\` | Called when the user selects logout from the user menu |
| \`theme\` | \`'dark' \\| 'light'\` | \`'dark'\` | Color theme |
| \`children\` | \`unknown\` | -- | UnityApp windows render here |

### UnityDesktopApp

| Property | Type | Description |
|----------|------|-------------|
| \`id\` | \`string\` | Unique application identifier |
| \`icon\` | \`string\` | Icon URL or emoji |
| \`label\` | \`string\` | Application display name |

### UnityDesktopUser

| Property | Type | Description |
|----------|------|-------------|
| \`name\` | \`string\` | Display name |
| \`avatar\` | \`string \\| undefined\` | Avatar URL |

### UnityAppProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`id\` | \`string\` | *required* | Unique identifier for this app window |
| \`title\` | \`string\` | *required* | Window title |
| \`icon\` | \`string\` | \`undefined\` | Optional icon (URL or emoji) |
| \`defaultPosition\` | \`{ x: number; y: number }\` | \`undefined\` | Default position when first opened |
| \`defaultSize\` | \`{ width: number; height: number }\` | \`undefined\` | Default size when first opened |
| \`minSize\` | \`{ width: number; height: number }\` | \`undefined\` | Minimum size constraints |
| \`resizable\` | \`boolean\` | \`true\` | Whether the window can be resized |
| \`onClose\` | \`() => void\` | \`undefined\` | Called when the window is closed |
| \`children\` | \`unknown\` | -- | Application content |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { UnityDesktop, UnityApp } from 'specifyjs/components/page/unity-desktop';

const desktop = createElement(
  UnityDesktop,
  {
    apps: [
      { id: 'files', icon: '/icons/files.svg', label: 'Files' },
      { id: 'browser', icon: '/icons/browser.svg', label: 'Browser' },
      { id: 'terminal', icon: '/icons/terminal.svg', label: 'Terminal' },
      { id: 'settings', icon: '/icons/settings.svg', label: 'Settings' },
    ],
    user: { name: 'Claude', avatar: '/avatar.png' },
    onAppOpen: (id) => console.log('Opened:', id),
    onLogout: () => console.log('Logout'),
    theme: 'dark',
  },
  // UnityApp children register themselves with the WindowManager
  createElement(UnityApp, {
    id: 'files',
    title: 'Files',
    icon: '/icons/files.svg',
    defaultSize: { width: 700, height: 500 },
  }, createElement('div', null, 'File manager content')),
  createElement(UnityApp, {
    id: 'terminal',
    title: 'Terminal',
    icon: '/icons/terminal.svg',
    defaultSize: { width: 600, height: 400 },
  }, createElement('div', null, 'Terminal content')),
);
\`\`\`

## Features

- **Integrated WindowManager** -- UnityDesktop wraps its children in a \`WindowManagerProvider\`. All window state (position, size, focus, z-order) is managed automatically.
- **Dock integration** -- clicking a dock icon opens the app window or focuses it if already open. Minimized windows are restored on click. Running apps show an active indicator dot.
- **SystemTray** -- displays the focused window title, Activities button, 24h clock with date, and user menu with logout option.
- **DesktopBackground** -- aubergine gradient (dark theme) or light gradient (light theme) fills the workspace.
- **Toast notifications** -- auto-dismiss notifications with info/warning/error severity levels. Toasts appear in the top-right corner and dismiss on click or after 5 seconds.
- **Theme support** -- \`dark\` and \`light\` themes affect the dock, background, and panel colors.

## Architecture

UnityDesktop composes these sub-components:

1. **WindowManagerProvider** -- wraps everything, providing window state context.
2. **SystemTray** -- top panel (28px height) with clock, app name, and user menu.
3. **Dock** -- left launcher (vertical, 36px icons) with items derived from the \`apps\` prop.
4. **DesktopBackground** -- fills the remaining workspace area.
5. **UnityApp** (children) -- each child self-registers with the WindowManager and renders as a DraggableWindow.

### UnityApp behavior

UnityApp is a thin wrapper around DraggableWindow that integrates with the WindowManager context:

- On first render, it calls \`openWindow()\` to register itself if not already tracked.
- Close, minimize, maximize, move, and resize events are forwarded to the WindowManager.
- The maximize button toggles between maximized and normal state.
- Window state (position, size, focus, z-index) is driven by the WindowManager.

## Variants

### Light theme

\`\`\`ts
createElement(UnityDesktop, {
  apps: [...],
  theme: 'light',
}, ...children);
\`\`\`

### Minimal (no user menu)

\`\`\`ts
createElement(UnityDesktop, {
  apps: [...],
  theme: 'dark',
}, ...children);
\`\`\`

## Accessibility

- The dock sidebar renders as a \`<div>\` with \`role="toolbar"\` and \`aria-label="Application launcher"\`.
- The top panel uses \`role="menubar"\` with \`aria-label="System panel"\`.
- The main desktop area uses a \`<main>\` element for landmark navigation.
- Each UnityApp window has \`role="dialog"\` with \`aria-label\` set to the window title.
- Toast notifications use \`role="alert"\` with \`aria-live="polite"\`.
`},{title:`WordProcessor`,path:`components/page/word-processor`,content:`# WordProcessor

Full-screen layout resembling a word processor application. Features a menu bar, formatting toolbar, ruler bar, centered document page on a gray background, and a status bar with page/word count and zoom.

## Import

\`\`\`ts
import { WordProcessor } from 'specifyjs/components/page/word-processor';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`content\` | \`string\` | \`'Start typing...'\` | Document content rendered in the page area |
| \`className\` | \`string\` | -- | Extra class name |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs/core';
import { WordProcessor } from 'specifyjs/components/page/word-processor';

const doc = createElement(
  WordProcessor,
  { content: 'Hello, world! This is my document.' },
);
\`\`\`

## Features

- **Menu bar** with File, Edit, View, Insert, Format, Tools, and Help menu buttons.
- **Formatting toolbar** with grouped controls for Bold, Italic, Underline, font size, and text alignment.
- **Ruler bar** with major/minor tick marks and numeric labels, marked as decorative (\`aria-hidden\`).
- **Document page** centered on a gray canvas (680px wide, serif font, letter-style padding).
- **Status bar** showing page count, live word count computed from \`content\`, and zoom percentage.
- **Word count** is automatically calculated from the \`content\` prop.

## Accessibility

- The menu bar renders with \`role="menubar"\` and each menu item has \`role="menuitem"\` with an \`aria-label\`.
- The formatting toolbar uses \`role="toolbar"\` with \`aria-label="Formatting toolbar"\`. Each button has a \`title\` and \`aria-label\`.
- The ruler is marked \`aria-hidden="true"\` since it is decorative.
- The document area uses a \`<main>\` element for landmark navigation.
- No keyboard shortcuts are bound by the component itself.
`},{title:`Http400`,path:`components/errors/http-400`,content:`# Http400

Bad Request error page component. Displays a full-page 400 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 400-specific defaults.

## Import

\`\`\`ts
import { Http400 } from '@aspect/errors/http-400';
import type { Http400Props } from '@aspect/errors/http-400';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The request could not be understood. Please check your input."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http400 } from '@aspect/errors/http-400';

// Default 400 page
const badRequest = createElement(Http400, {});

// Custom description and action
const custom = createElement(Http400, {
  description: 'The form data was invalid. Please correct the highlighted fields.',
  actionLabel: 'Back to Form',
  onAction: () => navigateTo('/form'),
});
\`\`\`

## Features

- Displays status code 400 as a large background watermark.
- Title is fixed to "Bad Request".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http401`,path:`components/errors/http-401`,content:`# Http401

Unauthorized error page component. Displays a full-page 401 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 401-specific defaults.

## Import

\`\`\`ts
import { Http401 } from '@aspect/errors/http-401';
import type { Http401Props } from '@aspect/errors/http-401';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"You must sign in to access this page."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http401 } from '@aspect/errors/http-401';

// Default 401 page
const unauthorized = createElement(Http401, {});

// Redirect to login
const withLogin = createElement(Http401, {
  description: 'Your session has expired. Please sign in again.',
  actionLabel: 'Sign In',
  onAction: () => navigateTo('/login'),
});
\`\`\`

## Features

- Displays status code 401 as a large background watermark.
- Title is fixed to "Unauthorized".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http403`,path:`components/errors/http-403`,content:`# Http403

Forbidden error page component. Displays a full-page 403 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 403-specific defaults.

## Import

\`\`\`ts
import { Http403 } from '@aspect/errors/http-403';
import type { Http403Props } from '@aspect/errors/http-403';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"You do not have permission to access this resource."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http403 } from '@aspect/errors/http-403';

// Default 403 page
const forbidden = createElement(Http403, {});

// Custom action to request access
const withRequest = createElement(Http403, {
  description: 'This resource requires elevated privileges.',
  actionLabel: 'Request Access',
  onAction: () => navigateTo('/request-access'),
});
\`\`\`

## Features

- Displays status code 403 as a large background watermark.
- Title is fixed to "Forbidden".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http404`,path:`components/errors/http-404`,content:`# Http404

Not Found error page component. Displays a full-page 404 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 404-specific defaults.

## Import

\`\`\`ts
import { Http404 } from '@aspect/errors/http-404';
import type { Http404Props } from '@aspect/errors/http-404';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The page you are looking for does not exist or has been moved."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http404 } from '@aspect/errors/http-404';

// Default 404 page
const notFound = createElement(Http404, {});

// Custom 404 with search suggestion
const withSearch = createElement(Http404, {
  description: 'We could not find that page. Try searching instead.',
  actionLabel: 'Search',
  onAction: () => navigateTo('/search'),
});
\`\`\`

## Features

- Displays status code 404 as a large background watermark.
- Title is fixed to "Not Found".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http405`,path:`components/errors/http-405`,content:`# Http405

Method Not Allowed error page component. Displays a full-page 405 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 405-specific defaults.

## Import

\`\`\`ts
import { Http405 } from '@aspect/errors/http-405';
import type { Http405Props } from '@aspect/errors/http-405';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The request method is not supported for this resource."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http405 } from '@aspect/errors/http-405';

// Default 405 page
const methodNotAllowed = createElement(Http405, {});

// Custom description
const custom = createElement(Http405, {
  description: 'POST requests are not accepted on this endpoint.',
  actionLabel: 'View API Docs',
  onAction: () => navigateTo('/docs/api'),
});
\`\`\`

## Features

- Displays status code 405 as a large background watermark.
- Title is fixed to "Method Not Allowed".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http408`,path:`components/errors/http-408`,content:`# Http408

Request Timeout error page component. Displays a full-page 408 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 408-specific defaults.

## Import

\`\`\`ts
import { Http408 } from '@aspect/errors/http-408';
import type { Http408Props } from '@aspect/errors/http-408';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The server timed out waiting for the request. Please try again."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http408 } from '@aspect/errors/http-408';

// Default 408 page
const timeout = createElement(Http408, {});

// Custom retry action
const withRetry = createElement(Http408, {
  description: 'The upload took too long. Please try with a smaller file.',
  actionLabel: 'Try Again',
  onAction: () => window.location.reload(),
});
\`\`\`

## Features

- Displays status code 408 as a large background watermark.
- Title is fixed to "Request Timeout".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http429`,path:`components/errors/http-429`,content:`# Http429

Too Many Requests error page component. Displays a full-page 429 error with a watermark status code, title, description, and action buttons. Wraps the shared \`HttpErrorPage\` layout with 429-specific defaults.

## Import

\`\`\`ts
import { Http429 } from '@aspect/errors/http-429';
import type { Http429Props } from '@aspect/errors/http-429';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"You have sent too many requests. Please wait and try again."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http429 } from '@aspect/errors/http-429';

// Default 429 page
const rateLimited = createElement(Http429, {});

// Custom with wait suggestion
const withWait = createElement(Http429, {
  description: 'Rate limit exceeded. Please wait 60 seconds before retrying.',
  actionLabel: 'Go to Dashboard',
  onAction: () => navigateTo('/dashboard'),
});
\`\`\`

## Features

- Displays status code 429 as a large background watermark.
- Title is fixed to "Too Many Requests".
- Includes a secondary "Go Back" button that calls \`window.history.back()\`.
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- Action buttons use \`<button type="button">\` for proper keyboard support.
`},{title:`Http500`,path:`components/errors/http-500`,content:`# Http500

Internal Server Error page component. Displays a full-page 500 error with a watermark status code, title, description, and a primary action button. Wraps the shared \`HttpErrorPage\` layout with 500-specific defaults.

## Import

\`\`\`ts
import { Http500 } from '@aspect/errors/http-500';
import type { Http500Props } from '@aspect/errors/http-500';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"Something went wrong on the server. Please try again later."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http500 } from '@aspect/errors/http-500';

// Default 500 page
const serverError = createElement(Http500, {});

// Custom with status page link
const withStatus = createElement(Http500, {
  description: 'Our engineers have been notified. Check the status page for updates.',
  actionLabel: 'Status Page',
  onAction: () => navigateTo('/status'),
});
\`\`\`

## Features

- Displays status code 500 as a large background watermark.
- Title is fixed to "Internal Server Error".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- The action button uses \`<button type="button">\` for proper keyboard support.
`},{title:`Http502`,path:`components/errors/http-502`,content:`# Http502

Bad Gateway error page component. Displays a full-page 502 error with a watermark status code, title, description, and a primary action button. Wraps the shared \`HttpErrorPage\` layout with 502-specific defaults.

## Import

\`\`\`ts
import { Http502 } from '@aspect/errors/http-502';
import type { Http502Props } from '@aspect/errors/http-502';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The server received an invalid response. Please try again later."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http502 } from '@aspect/errors/http-502';

// Default 502 page
const badGateway = createElement(Http502, {});

// Custom with retry
const withRetry = createElement(Http502, {
  description: 'The upstream service is not responding. This is usually temporary.',
  actionLabel: 'Retry',
  onAction: () => window.location.reload(),
});
\`\`\`

## Features

- Displays status code 502 as a large background watermark.
- Title is fixed to "Bad Gateway".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- The action button uses \`<button type="button">\` for proper keyboard support.
`},{title:`Http503`,path:`components/errors/http-503`,content:`# Http503

Service Unavailable error page component. Displays a full-page 503 error with a watermark status code, title, description, and a primary action button. Wraps the shared \`HttpErrorPage\` layout with 503-specific defaults.

## Import

\`\`\`ts
import { Http503 } from '@aspect/errors/http-503';
import type { Http503Props } from '@aspect/errors/http-503';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The service is temporarily unavailable. Please try again later."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http503 } from '@aspect/errors/http-503';

// Default 503 page
const unavailable = createElement(Http503, {});

// Custom maintenance page
const maintenance = createElement(Http503, {
  description: 'We are performing scheduled maintenance. Expected back at 3:00 PM UTC.',
  actionLabel: 'Status Page',
  onAction: () => navigateTo('/status'),
});
\`\`\`

## Features

- Displays status code 503 as a large background watermark.
- Title is fixed to "Service Unavailable".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- The action button uses \`<button type="button">\` for proper keyboard support.
`},{title:`Http504`,path:`components/errors/http-504`,content:`# Http504

Gateway Timeout error page component. Displays a full-page 504 error with a watermark status code, title, description, and a primary action button. Wraps the shared \`HttpErrorPage\` layout with 504-specific defaults.

## Import

\`\`\`ts
import { Http504 } from '@aspect/errors/http-504';
import type { Http504Props } from '@aspect/errors/http-504';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`description\` | \`string\` | \`"The server did not respond in time. Please try again later."\` | Override the default description text |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Override the primary action button label |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Override the primary action handler |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { Http504 } from '@aspect/errors/http-504';

// Default 504 page
const gatewayTimeout = createElement(Http504, {});

// Custom with retry
const withRetry = createElement(Http504, {
  description: 'The request to the backend timed out. The server may be under heavy load.',
  actionLabel: 'Retry',
  onAction: () => window.location.reload(),
});
\`\`\`

## Features

- Displays status code 504 as a large background watermark.
- Title is fixed to "Gateway Timeout".
- Does **not** include a secondary "Go Back" button (server errors are not caused by navigation).
- Falls back to navigating to \`"/"\` if no \`onAction\` handler is provided.

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers.
- The watermark status code is marked \`aria-hidden="true"\`.
- The action button uses \`<button type="button">\` for proper keyboard support.
`},{title:`HttpErrorPage`,path:`components/errors/http-error-page`,content:`# HttpErrorPage

Base layout component for HTTP error pages. Renders a centered full-height container with a large watermark status code, title, description, and optional action buttons.

This is an internal shared component used by all specific HTTP error page components (Http400, Http404, Http500, etc.). You typically will not use this directly -- prefer the specific error components instead.

## Import

\`\`\`ts
import { HttpErrorPage } from '@aspect/errors/_shared';
import type { HttpErrorPageProps } from '@aspect/errors/_shared';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`statusCode\` | \`number\` | required | HTTP status code displayed as a large watermark (e.g. 404) |
| \`title\` | \`string\` | required | Error title displayed as an h1 heading (e.g. "Not Found") |
| \`description\` | \`string\` | \`undefined\` | Descriptive message displayed below the title |
| \`actionLabel\` | \`string\` | \`"Go Home"\` | Label for the primary action button |
| \`onAction\` | \`() => void\` | navigates to \`"/"\` | Handler for the primary action button |
| \`showGoBack\` | \`boolean\` | \`undefined\` | Whether to show a secondary "Go Back" button that calls \`window.history.back()\` |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { HttpErrorPage } from '@aspect/errors/_shared';

// Custom error page
const errorPage = createElement(HttpErrorPage, {
  statusCode: 418,
  title: "I'm a Teapot",
  description: 'The server refuses to brew coffee because it is a teapot.',
  actionLabel: 'Try Coffee Maker',
  onAction: () => navigateTo('/coffee'),
  showGoBack: true,
});
\`\`\`

## Layout

The component renders the following structure:

1. A full-viewport centered flex container (\`role="alert"\`, \`aria-live="assertive"\`)
2. A large watermark showing the status code (120px, 15% opacity, \`aria-hidden="true"\`)
3. An \`<h1>\` title
4. An optional \`<p>\` description (max-width 480px, 70% opacity)
5. A primary action \`<button>\`
6. An optional secondary "Go Back" \`<button>\` (underlined, 70% opacity)

## Accessibility

- The outer container uses \`role="alert"\` with \`aria-live="assertive"\` to announce the error to screen readers immediately.
- The watermark status code is marked \`aria-hidden="true"\` since the meaningful title conveys the same information.
- Both action buttons use \`<button type="button">\` for proper keyboard and assistive technology support.
`},{title:`AdSense`,path:`components/ad/adsense`,content:`# AdSense

A Google AdSense advertisement component that injects the AdSense script and renders an ad unit. Supports a test mode that displays a placeholder instead of real ads.

## Import

\`\`\`ts
import { AdSense } from '@aspect/ad/adsense';
import type { AdSenseProps } from '@aspect/ad/adsense';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`client\` | \`string\` | required | Google AdSense client ID (e.g., \`'ca-pub-1234567890'\`) |
| \`slot\` | \`string\` | required | Ad slot ID |
| \`format\` | \`'auto' \\| 'rectangle' \\| 'horizontal' \\| 'vertical'\` | \`'auto'\` | Ad format |
| \`responsive\` | \`boolean\` | \`false\` | Enable responsive sizing (sets \`data-full-width-responsive="true"\`) |
| \`width\` | \`number\` | \`undefined\` | Custom width in pixels |
| \`height\` | \`number\` | \`undefined\` | Custom height in pixels |
| \`className\` | \`string\` | \`undefined\` | CSS class name |
| \`testMode\` | \`boolean\` | \`false\` | Show a placeholder instead of real ads |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { AdSense } from '@aspect/ad/adsense';

// Basic ad unit
const ad = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
});

// Responsive ad
const responsive = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  format: 'auto',
  responsive: true,
});

// Fixed-size rectangle ad
const rectangle = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  format: 'rectangle',
  width: 300,
  height: 250,
});

// Test mode placeholder (for development)
const testAd = createElement(AdSense, {
  client: 'ca-pub-1234567890',
  slot: '1234567890',
  testMode: true,
  width: 728,
  height: 90,
});
\`\`\`

## Features

- Injects the AdSense loader script into \`<head>\` once per client ID.
- Pushes to \`window.adsbygoogle\` to request an ad fill for each slot.
- Production mode renders an \`<ins class="adsbygoogle">\` element with the required data attributes.
- Test mode renders a styled placeholder \`<div>\` with a dashed border showing the slot ID, useful during development.
- Supports four ad formats: auto, rectangle, horizontal, and vertical.
- Custom width and height override the default ad sizing.
- Responsive mode adds \`data-full-width-responsive="true"\` for full-width ad units.
`},{title:`GoogleAnalytics`,path:`components/analytics/google-analytics`,content:`# GoogleAnalytics

An invisible component that injects the Google Analytics (gtag.js) script and configures it with a site-specific measurement ID. Renders nothing to the DOM -- this is a side-effect-only component.

## Import

\`\`\`ts
import { GoogleAnalytics } from '@aspect/analytics/google-analytics';
import type { GoogleAnalyticsProps } from '@aspect/analytics/google-analytics';
\`\`\`

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| \`measurementId\` | \`string\` | required | Google Analytics measurement ID (e.g., \`'G-XXXXXXXXXX'\`) |
| \`disabled\` | \`boolean\` | \`false\` | Disable tracking (useful for development/testing) |
| \`debug\` | \`boolean\` | \`false\` | Enable debug mode (logs events to console via GA debug_mode) |
| \`anonymizeIp\` | \`boolean\` | \`false\` | Anonymize IP addresses |
| \`config\` | \`Record<string, unknown>\` | \`undefined\` | Custom config parameters passed to \`gtag('config', ...)\` |

## Usage

\`\`\`ts
import { createElement } from 'specifyjs';
import { GoogleAnalytics } from '@aspect/analytics/google-analytics';

// Basic usage -- place once at the top of your app
const analytics = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
});

// With debug mode and IP anonymization
const analyticsDebug = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  debug: true,
  anonymizeIp: true,
});

// Disabled in development
const analyticsDev = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  disabled: process.env.NODE_ENV !== 'production',
});

// With custom config
const analyticsCustom = createElement(GoogleAnalytics, {
  measurementId: 'G-XXXXXXXXXX',
  config: {
    page_title: 'My App',
    send_page_view: true,
  },
});
\`\`\`

## Features

- Injects the gtag.js script tag into \`<head>\` only once, even if multiple instances mount.
- Initializes the \`dataLayer\` and \`gtag\` function on the window object.
- Calls \`gtag('config', measurementId, ...)\` with merged config parameters.
- The script tag is removed on component unmount for clean teardown.
- When \`disabled\` is true, no script injection or configuration occurs.
- Debug mode sets \`debug_mode: true\` in the gtag config.
- IP anonymization sets \`anonymize_ip: true\` in the gtag config.
`},{title:`Math`,path:`components/math/math`,content:"# Math\n\nA zero-dependency math library providing vector, matrix, quaternion, and linear algebra operations for 2D and 3D applications.\n\n## Import\n\n```ts\nimport {\n  // Vec2\n  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Length, vec2Normalize, vec2Dist, vec2Lerp,\n  // Vec3\n  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot, vec3Cross, vec3Length, vec3Normalize,\n  // MatN (NxN)\n  matN, matNIdentity, matNGet, matNSet, matNMultiply, matNMultiplyVec,\n  matNTranspose, matNScale, matNAdd, matNCopy, matNFromArray,\n  // Mat4 (4x4, column-major)\n  mat4Identity, mat4Multiply, mat4Transpose, mat4Inverse,\n  mat4Translate, mat4Scale, mat4RotateX, mat4RotateY, mat4RotateZ,\n  mat4Perspective, mat4Orthographic, mat4LookAt, mat4FromQuaternion,\n  mat4TransformVec3, mat4TransformDirection,\n  // Quaternion\n  quatIdentity, quatFromAxisAngle, quatFromEuler, quatMultiply,\n  quatConjugate, quatInverse, quatNormalize, quatLength, quatDot,\n  quatSlerp, quatRotateVec3, quatToEuler, quatLookAt,\n  // Solver\n  solve, luDecompose, luSolve, determinant, inverse,\n} from '@aspect/math';\n```\n\n## Modules\n\n### Vec2 / Vec3 -- Vector Operations\n\n2D and 3D vector types with standard linear algebra operations.\n\n**Types:**\n\n| Type | Fields | Description |\n|------|--------|-------------|\n| `Vec2` | `{ x: number; y: number }` | 2D vector (readonly) |\n| `Vec3` | `{ x: number; y: number; z: number }` | 3D vector (readonly) |\n\n**Vec2 functions:**\n\n| Function | Signature | Description |\n|----------|-----------|-------------|\n| `vec2` | `(x, y) => Vec2` | Create a Vec2 |\n| `vec2Add` | `(a, b) => Vec2` | Add two Vec2s |\n| `vec2Sub` | `(a, b) => Vec2` | Subtract b from a |\n| `vec2Scale` | `(v, s) => Vec2` | Scale by scalar |\n| `vec2Dot` | `(a, b) => number` | Dot product |\n| `vec2Length` | `(v) => number` | Magnitude |\n| `vec2Normalize` | `(v) => Vec2` | Normalize to unit length |\n| `vec2Dist` | `(a, b) => number` | Euclidean distance |\n| `vec2Lerp` | `(a, b, t) => Vec2` | Linear interpolation |\n\n**Vec3 functions:**\n\n| Function | Signature | Description |\n|----------|-----------|-------------|\n| `vec3` | `(x, y, z) => Vec3` | Create a Vec3 |\n| `vec3Add` | `(a, b) => Vec3` | Add two Vec3s |\n| `vec3Sub` | `(a, b) => Vec3` | Subtract b from a |\n| `vec3Scale` | `(v, s) => Vec3` | Scale by scalar |\n| `vec3Dot` | `(a, b) => number` | Dot product |\n| `vec3Cross` | `(a, b) => Vec3` | Cross product |\n| `vec3Length` | `(v) => number` | Magnitude |\n| `vec3Normalize` | `(v) => Vec3` | Normalize to unit length |\n\n### MatN -- NxN Matrix Operations\n\nGeneral-purpose NxN matrices stored as flat row-major `Float64Array`.\n\n**Type:** `MatN = { data: Float64Array; size: number }`\n\n| Function | Description |\n|----------|-------------|\n| `matN(size)` | Create a zero-initialized NxN matrix |\n| `matNIdentity(size)` | Create an identity matrix |\n| `matNGet(m, row, col)` | Get value at position |\n| `matNSet(m, row, col, val)` | Return new matrix with value set |\n| `matNMultiply(a, b)` | Multiply two NxN matrices |\n| `matNMultiplyVec(m, v)` | Multiply matrix by column vector |\n| `matNTranspose(m)` | Transpose a matrix |\n| `matNScale(m, s)` | Scale all elements by scalar |\n| `matNAdd(a, b)` | Element-wise addition |\n| `matNCopy(m)` | Deep copy |\n| `matNFromArray(size, values)` | Create from flat row-major array |\n\n### Mat4 -- 4x4 Matrix Operations\n\nSpecialized 4x4 matrices in column-major order (OpenGL convention), stored as `Float64Array` of 16 elements.\n\n**Type:** `Mat4 = Float64Array`\n\n| Function | Description |\n|----------|-------------|\n| `mat4Identity()` | Create a 4x4 identity matrix |\n| `mat4Multiply(a, b)` | Multiply two 4x4 matrices |\n| `mat4Transpose(m)` | Transpose |\n| `mat4Inverse(m)` | Inverse (returns null if singular) |\n| `mat4Translate(m, v)` | Apply translation |\n| `mat4Scale(m, v)` | Apply scale |\n| `mat4RotateX(m, radians)` | Rotate around X axis |\n| `mat4RotateY(m, radians)` | Rotate around Y axis |\n| `mat4RotateZ(m, radians)` | Rotate around Z axis |\n| `mat4Perspective(fovY, aspect, near, far)` | Perspective projection |\n| `mat4Orthographic(left, right, bottom, top, near, far)` | Orthographic projection |\n| `mat4LookAt(eye, target, up)` | View matrix |\n| `mat4FromQuaternion(q)` | Rotation matrix from quaternion |\n| `mat4TransformVec3(m, v)` | Transform a point (w=1, with perspective division) |\n| `mat4TransformDirection(m, v)` | Transform a direction (w=0, no translation) |\n\n### Quaternion\n\nQuaternion operations for rotation representation.\n\n**Type:** `Quaternion = { x: number; y: number; z: number; w: number }`\n\n| Function | Description |\n|----------|-------------|\n| `quatIdentity()` | Identity quaternion (no rotation) |\n| `quatFromAxisAngle(axis, radians)` | Create from axis and angle |\n| `quatFromEuler(pitch, yaw, roll)` | Create from Euler angles (intrinsic ZYX) |\n| `quatMultiply(a, b)` | Hamilton product (compose rotations) |\n| `quatConjugate(q)` | Conjugate |\n| `quatInverse(q)` | Inverse |\n| `quatNormalize(q)` | Normalize to unit length |\n| `quatLength(q)` | Magnitude |\n| `quatDot(a, b)` | Dot product |\n| `quatSlerp(a, b, t)` | Spherical linear interpolation |\n| `quatRotateVec3(q, v)` | Rotate a Vec3 by a quaternion |\n| `quatToEuler(q)` | Convert to Euler angles (returns Vec3: x=roll, y=pitch, z=yaw) |\n| `quatLookAt(forward, up)` | Create a look-at rotation quaternion |\n\n### Solver -- Linear Algebra\n\nLU decomposition and linear system solving for NxN matrices.\n\n| Function | Description |\n|----------|-------------|\n| `solve(A, b)` | Solve Ax=b via Gaussian elimination with partial pivoting. Returns null if singular |\n| `luDecompose(A)` | LU decomposition with partial pivoting (PA=LU). Returns `{ L, U, P }` or null |\n| `luSolve(L, U, P, b)` | Solve using pre-computed LU decomposition |\n| `determinant(A)` | Compute determinant via LU decomposition |\n| `inverse(A)` | Compute matrix inverse. Returns null if singular |\n\n## Usage\n\n```ts\nimport { vec3, vec3Add, vec3Cross, mat4Perspective, mat4LookAt, mat4Multiply } from '@aspect/math';\n\n// Vector operations\nconst a = vec3(1, 2, 3);\nconst b = vec3(4, 5, 6);\nconst sum = vec3Add(a, b);       // { x: 5, y: 7, z: 9 }\nconst cross = vec3Cross(a, b);   // perpendicular vector\n\n// Build a view-projection matrix\nconst proj = mat4Perspective(Math.PI / 4, 16 / 9, 0.1, 100);\nconst view = mat4LookAt(vec3(0, 5, 10), vec3(0, 0, 0), vec3(0, 1, 0));\nconst vp = mat4Multiply(proj, view);\n\n// Solve a linear system\nimport { solve, matNFromArray } from '@aspect/math';\nconst A = matNFromArray(2, [2, 1, 5, 3]);\nconst b = new Float64Array([4, 7]);\nconst x = solve(A, b); // solution vector\n```\n"}]},{title:`Contributing`,children:[{title:`Contributing`,path:`contributing/README`,content:`# Contributing

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (JavaScript/TypeScript runtime and package manager)
- Docker (for local CI testing)

### Clone and Install

\`\`\`bash
git clone <repo-url>
cd specifyjs

# Core framework
cd core
bun install
\`\`\`

### Run Tests

\`\`\`bash
# Core — unit/integration
cd core && bun run test

# Core — E2E
cd core && bun run test:e2e
\`\`\`

### Run All CI Locally

\`\`\`bash
./scripts/act-run.sh          # All jobs
./scripts/act-run.sh --list   # See available jobs
\`\`\`

## Monorepo Structure

| Directory | Purpose | Language |
|-----------|---------|----------|
| \`core/\` | SpecifyJS framework | TypeScript |
| \`components/\` | Reusable components | TypeScript |
| \`docs/\` | Documentation | Markdown |
| \`skills/\` | Claude AI skills | YAML/Markdown |

## Workflow

1. Fork the repository
2. Create a feature branch from \`main\`
3. Make changes with tests
4. Verify locally: \`./scripts/act-run.sh\`
5. Open a pull request

## See Also

- [Code Style](code-style.md) — Formatting and conventions
- [CI/CD](ci-cd.md) — Pipeline details
`},{title:`CI/CD`,path:`contributing/ci-cd`,content:`# CI/CD

## GitHub Actions

The CI pipeline (\`.github/workflows/ci.yml\`) runs on every push and PR to \`main\`.

### Jobs

| Job | What it does | Duration |
|-----|-------------|----------|
| **lint** | TypeScript type check + Prettier format check | ~10s |
| **test** | 465 Vitest tests with coverage thresholds | ~15s |
| **build** | Rollup build + verify outputs + bundle size check (< 512KB) | ~15s |
| **e2e** | Install Playwright + run 27 browser tests | ~30s |

### Coverage Thresholds

Enforced in \`vitest.config.ts\`:
- Statements: 95%
- Branches: 94%
- Functions: 97%
- Lines: 95%

## Local Testing with act

[nektos/act](https://github.com/nektos/act) runs GitHub Actions workflows locally in Docker containers.

### Install act

\`\`\`bash
curl -sSL https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz | tar -xz -C ~/bin act
\`\`\`

### Run Workflows

\`\`\`bash
./scripts/act-run.sh              # All jobs
./scripts/act-run.sh lint         # Single job
./scripts/act-run.sh --list       # List jobs
\`\`\`

### Container Image

The \`.actrc\` file maps \`ubuntu-latest\` to \`catthehacker/ubuntu:act-latest\`, which includes Node.js and system dependencies needed for Playwright.

### Artifact Uploads

\`upload-artifact\` steps are guarded with \`!env.ACT\` and skipped during local testing (the GitHub artifact API isn't available locally).

## Adding New CI Steps

1. Edit \`.github/workflows/ci.yml\`
2. Test locally: \`./scripts/act-run.sh <job-name>\`
3. Verify all jobs pass: \`./scripts/act-run.sh\`
4. Commit
`},{title:`Code Style`,path:`contributing/code-style`,content:`# Code Style

## TypeScript (core/)

- **Strict mode** — \`strict: true\` in tsconfig
- **No \`any\`** — Avoid unless documented
- **\`const\` over \`let\`** — Never \`var\`
- **Named exports** — No default exports
- **Formatting** — Prettier with: single quotes, trailing commas, 100 char width
- **Semicolons** — Always
- **Arrow parens** — Always (\`(x) => x\`, not \`x => x\`)

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: add useOptimistic hook
fix: prevent stale closure in setState
test: add coverage for pre-render context restoration
refactor: simplify fiber cloning in memo bail-out
docs: add sourcemap command documentation
chore: update playwright to v1.60
perf: reduce allocation in reconciler hot path
\`\`\`

## Documentation (docs/)

- Markdown with GitHub-flavored extensions
- Code blocks with language tags
- Internal links use relative paths
- One concept per page, linked from index
`}]}],t={};for(let n of e)for(let e of n.children)t[e.path]=e;export{e as n,t};