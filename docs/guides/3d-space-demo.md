<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# 3D Space Demo Guide

The 3D Space demo is a showcase page available at `/#/3dSpace` on the SpecifyJS
site. It renders five coloured boxes in 3D space with an orbiting camera, using
the CPU software rasteriser directly.

## What the Demo Shows

- **CPU rasterisation** -- every triangle is projected, clipped, shaded, and
  painted to a 2D canvas each frame with no GPU involvement
- **Scene graph** -- five `SceneObject` instances registered in a `SceneGraph`
- **Camera orbit** -- the camera follows a circular path (radius 15) with
  sinusoidal vertical motion, always looking at the origin
- **Flat shading** -- `FlatShading` lighting model returns material colours
  unchanged
- **Direct pipeline usage** -- bypasses the `Space3D` component and drives the
  `CpuPipeline` manually for full control

## Scene Layout

| Box | Colour | Position (x, y, z) |
|-----|--------|---------------------|
| Red | `(0.9, 0.2, 0.2)` | `(0, 0, 0)` |
| Green | `(0.2, 0.8, 0.2)` | `(5, 0, 0)` |
| Blue | `(0.2, 0.4, 0.9)` | `(-3, 2, 5)` |
| Yellow | `(0.9, 0.8, 0.1)` | `(0, -2, -4)` |
| Cyan | `(0.1, 0.8, 0.8)` | `(7, 3, -2)` |

All boxes share a single `Mesh.createBox(1, 1, 1)` geometry. Each has its own
material created with `createMaterial`.

## Camera Motion

The camera orbits at a radius of 15 units around the Y axis. Its height
oscillates sinusoidally between approximately -3 and +5 units. It always faces
the origin via `camera.lookAt({ x: 0, y: 0, z: 0 })`. One full revolution
takes roughly 20 seconds.

```
x = cos(t * 0.3) * 15
z = sin(t * 0.3) * 15
y = sin(t * 0.2) * 4 + 1
```

## How It Works

The demo uses a ref callback pattern instead of the `Space3D` component. When
the container `<div>` mounts, the callback:

1. Creates a `<canvas>` element (720 x 480) and appends it to the DOM
2. Builds the `SceneGraph` and registers five box objects
3. Creates a `Camera` and `Viewport`
4. Initialises the `CpuPipeline`
5. Starts a `requestAnimationFrame` loop that:
   - Computes delta time
   - Updates the camera position and orientation
   - Calls `pipeline.render(scene, camera, viewport, lighting)`

On unmount, the cleanup function cancels the animation frame, disposes the
pipeline, and removes the canvas from the DOM.

## Running the Demo

Start the SpecifyJS showcase site locally:

```bash
cd site
npm run dev
```

Navigate to `http://localhost:5173/#/3dSpace` in a browser.

## Extending the Demo

### Add a new object

```typescript
const sphere = new SceneObject('my-sphere');
sphere.position = { x: -5, y: 1, z: 3 };
sphere.mesh = Mesh.createBox(1, 1, 1);  // or a custom mesh
sphere.material = createMaterial({ r: 1, g: 0.5, b: 0, a: 1 });
scene.register(sphere);
```

### Switch to WebGL

Replace `CpuPipeline` with `WebGLPipeline`:

```typescript
import { WebGLPipeline } from 'specifyjs/components/viz/3dSpace';

const pipeline = new WebGLPipeline();
pipeline.initialize(canvas);
```

### Add a custom lighting model

Implement the `LightingModel` interface and pass it to `pipeline.render()` as
the fourth argument. See the [3d-space component docs](../components/viz/3d-space.md)
for a full Lambertian shading example.

## Source Files

| File | Description |
|------|-------------|
| `site/src/screens/3d-space.ts` | Demo component |
| `components/viz/3dSpace/src/` | 3dSpace library sources |
| `site/e2e/3d-space.spec.ts` | E2E tests for the demo |
| `site/e2e/3d-space-pdv.spec.ts` | Pre-deploy validation tests |
