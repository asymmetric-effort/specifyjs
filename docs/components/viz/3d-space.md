<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Space3D

Composable 3D scene renderer for SpecifyJS. Renders a 3D scene graph to an
HTML canvas using either a CPU software rasteriser or a WebGL pipeline. The
component assembles cameras, viewports, lights, a scene graph of objects, and
a pluggable lighting model into a `requestAnimationFrame` loop that drives
continuous rendering.

**Design philosophy:** Space3D provides a minimal, composable foundation for 3D
content. Every subsystem (camera, lighting, pipeline, object hierarchy) is a
plain class or interface that consumers instantiate and own. The component
itself is a thin orchestrator that wires those pieces together and runs the
render loop.

## Import

```typescript
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
```

---

## Space3DProps

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `width` | `number` | *required* | Canvas width in pixels |
| `height` | `number` | *required* | Canvas height in pixels |
| `finiteSpace` | `boolean` | `true` | Whether space is finite (bounded) |
| `bounds` | `{ min: Vec3; max: Vec3 }` | `undefined` | Bounds for finite space. Objects and camera are clamped within. |
| `lightingModel` | `LightingModel` | `FlatShading` | Pluggable lighting/shading model |
| `onFrame` | `(dt: number, scene: SceneGraph, cameras: Camera[]) => void` | `undefined` | Called every frame with delta time in seconds |
| `objectPicker` | `ObjectPicker` | `DefaultObjectPicker` (no-op) | Ray-cast object picking implementation |
| `cameras` | `Camera[]` | single default camera | Consumer-defined cameras |
| `viewports` | `Viewport[]` | single full-canvas viewport | Viewport-to-camera mappings |
| `objects` | `SceneObject[]` | `[]` | Scene objects to register |
| `lights` | `Light[]` | `[]` | Light sources in the scene |
| `renderer` | `'webgl' \| 'cpu' \| 'auto'` | `'auto'` | Preferred render pipeline (`auto` tries WebGL first, falls back to CPU) |

When no `cameras` are provided, a default perspective camera is created at
position `(0, 5, 10)` looking at the origin with a 45-degree field of view.
When no `viewports` are provided, a single viewport covering the full canvas
is created and bound to the first camera.

---

## Core Types

### Color

```typescript
interface Color {
  r: number;  // 0-1
  g: number;  // 0-1
  b: number;  // 0-1
  a: number;  // 0-1
}
```

### Vertex

```typescript
interface Vertex {
  position: Vec3;
  normal: Vec3;
  uv?: Vec2;
  color?: Color;
}
```

### ShadeParams

Parameters passed to a lighting model's `shade` function.

```typescript
interface ShadeParams {
  normal: Vec3;
  lightDir: Vec3;
  viewDir: Vec3;
  lightColor: Color;
  materialColor: Color;
  ambientStrength: number;
}
```

### Texture

```typescript
interface Texture {
  width: number;
  height: number;
  sample(u: number, v: number): Color;
}
```

### ObjectPicker

```typescript
interface ObjectPicker {
  pick(origin: Vec3, direction: Vec3, objects: SceneObject[]): SceneObject | null;
}
```

`DefaultObjectPicker` always returns `null` (no-op).

---

## Camera

Represents a viewpoint into the 3D scene. Supports perspective and orthographic
projection modes.

### Constructor

```typescript
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
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `position` | `Vec3` | World-space position |
| `orientation` | `Quaternion` | Rotation as a unit quaternion |
| `projectionMode` | `'perspective' \| 'orthographic'` | Projection type |
| `fov` | `number` | Vertical field of view in radians (perspective) |
| `aspect` | `number` | Width / height ratio (perspective) |
| `near` | `number` | Near clipping plane distance |
| `far` | `number` | Far clipping plane distance |
| `left`, `right`, `top`, `bottom` | `number` | Orthographic frustum bounds |

### Methods

#### `move(delta: Vec3): void`

Translate the camera by the given vector.

```typescript
camera.move({ x: 0, y: 1, z: 0 }); // move up by 1
```

#### `rotate(q: Quaternion): void`

Apply a quaternion rotation to the camera's current orientation (Hamilton
product).

```typescript
import { quatFromAxisAngle } from 'specifyjs/math';

camera.rotate(quatFromAxisAngle({ x: 0, y: 1, z: 0 }, 0.1));
```

#### `lookAt(target: Vec3): void`

Orient the camera to face the given world-space point. Uses the world up vector
`(0, 1, 0)`.

```typescript
camera.lookAt({ x: 0, y: 0, z: 0 });
```

#### `getViewMatrix(): Mat4`

Returns the 4x4 view matrix (Float64Array, column-major) computed from the
camera's position and orientation.

#### `getProjectionMatrix(): Mat4`

Returns the 4x4 projection matrix based on the current projection mode and
parameters.

---

## Viewport

Defines a rectangular region of the canvas and its associated camera. Supports
split-screen rendering when multiple viewports are used.

### Constructor

```typescript
new Viewport(options: {
  x: number;           // left edge in pixels
  y: number;           // top edge in pixels
  width: number;       // width in pixels
  height: number;      // height in pixels
  camera: Camera;      // the camera this viewport renders from
  clearColor?: Color;  // default: { r: 0, g: 0, b: 0, a: 1 }
})
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `x` | `number` | Left edge of the viewport (pixels) |
| `y` | `number` | Top edge of the viewport (pixels) |
| `width` | `number` | Viewport width (pixels) |
| `height` | `number` | Viewport height (pixels) |
| `camera` | `Camera` | Associated camera |
| `clearColor` | `Color` | Background color for this viewport |

---

## Mesh

Geometry data with packed vertex positions, normals, indices, and optional UVs
and per-vertex colours. Uses typed arrays (`Float32Array`, `Uint32Array`) for
efficient memory layout.

### Constructor

```typescript
new Mesh(
  vertices: Float32Array,   // xyz triples
  normals: Float32Array,    // xyz triples (per vertex)
  indices: Uint32Array,     // triangle index list
  uvs?: Float32Array,       // uv pairs (optional)
  colors?: Float32Array,    // rgba quads (optional)
)
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `vertices` | `Float32Array` | Flat array of vertex positions (x,y,z triples) |
| `normals` | `Float32Array` | Flat array of vertex normals |
| `indices` | `Uint32Array` | Triangle index list |
| `uvs` | `Float32Array \| undefined` | Texture coordinates (u,v pairs) |
| `colors` | `Float32Array \| undefined` | Per-vertex colours (r,g,b,a quads) |
| `vertexCount` | `number` | Number of vertices (computed: `vertices.length / 3`) |
| `indexCount` | `number` | Number of indices |

### Static Factories

#### `Mesh.createBox(width, height, depth): Mesh`

Creates an axis-aligned box centered at the origin. Generates 24 vertices
(4 per face for correct normals) and 36 indices (2 triangles per face).

```typescript
const box = Mesh.createBox(2, 2, 2); // 2x2x2 cube
```

#### `Mesh.createPlane(width, depth, segmentsX?, segmentsZ?): Mesh`

Creates a subdivided plane on the XZ plane (y = 0), centered at the origin.
Normal points up `(0, 1, 0)`. Generates UVs.

```typescript
const ground = Mesh.createPlane(10, 10);          // single quad
const terrain = Mesh.createPlane(10, 10, 8, 8);   // 8x8 grid
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `width` | `number` | -- | Size along x axis |
| `depth` | `number` | -- | Size along z axis |
| `segmentsX` | `number` | `1` | Subdivisions along x |
| `segmentsZ` | `number` | `1` | Subdivisions along z |

---

## Material

A material describes the surface appearance of an object.

### Interface

```typescript
interface Material {
  color: Color;
  texture?: Texture;
  wireframe: boolean;
}
```

### Factory

```typescript
function createMaterial(
  color: Color,
  options?: { texture?: Texture; wireframe?: boolean }
): Material
```

`wireframe` defaults to `false`.

```typescript
const red = createMaterial({ r: 0.9, g: 0.2, b: 0.2, a: 1 });
const wireframe = createMaterial({ r: 1, g: 1, b: 1, a: 1 }, { wireframe: true });
```

---

## Light

A light source in the scene. Supports directional, point, and spot light types.

### Constructor

```typescript
new Light(options: {
  type: LightType;          // 'directional' | 'point' | 'spot'
  position?: Vec3;          // default: { x: 0, y: 0, z: 0 }
  direction?: Vec3;         // default: { x: 0, y: -1, z: 0 }
  color?: Color;            // default: white
  intensity?: number;       // default: 1
  range?: number;           // default: 10 (point/spot)
  spotAngle?: number;       // default: Math.PI / 4 (spot)
})
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `type` | `'directional' \| 'point' \| 'spot'` | Light type |
| `position` | `Vec3` | World-space position (point and spot) |
| `direction` | `Vec3` | Light direction (directional and spot) |
| `color` | `Color` | Light colour |
| `intensity` | `number` | Brightness multiplier |
| `range` | `number` | Attenuation distance (point and spot) |
| `spotAngle` | `number` | Cone half-angle in radians (spot) |

---

## SceneObject

Base class for all objects in the scene graph. Maintains a transform (position,
rotation, scale) and a parent/child hierarchy. Consumers extend this class or
use it directly by assigning a mesh and material.

### Constructor

```typescript
new SceneObject(id: string)
```

Initial state: position `(0,0,0)`, identity rotation, scale `(1,1,1)`, visible.

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `id` | `string` (readonly) | Unique identifier |
| `position` | `Vec3` | Local position |
| `rotation` | `Quaternion` | Local rotation |
| `scale` | `Vec3` | Local scale |
| `mesh` | `Mesh \| undefined` | Geometry to render |
| `material` | `Material \| undefined` | Surface material |
| `children` | `SceneObject[]` | Child objects |
| `parent` | `SceneObject \| null` | Parent in the hierarchy |
| `visible` | `boolean` | Whether to render this object and its children |

### Methods

#### `addChild(obj: SceneObject): void`

Adds a child object. Automatically removes the child from its previous parent.

#### `removeChild(obj: SceneObject): void`

Removes a child by reference and clears its parent pointer.

#### `getWorldMatrix(): Mat4`

Computes the world transform by iteratively composing local transforms up the
parent chain (root-to-leaf order). Returns a `Float64Array` of 16 elements in
column-major order.

### Extending SceneObject

```typescript
class Asteroid extends SceneObject {
  angularVelocity: number;

  constructor(id: string, angularVelocity: number) {
    super(id);
    this.angularVelocity = angularVelocity;
    this.mesh = Mesh.createBox(1, 1, 1);
    this.material = createMaterial({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
  }
}
```

---

## SceneGraph

Manages a flat or hierarchical collection of scene objects under an invisible
root node. All registered objects become direct children of the root.

### Constructor

```typescript
new SceneGraph()
```

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `root` | `SceneObject` (readonly) | Invisible root node (id `'__root__'`) |

### Methods

#### `register(obj: SceneObject): void`

Add an object as a child of the root.

#### `unregister(id: string): void`

Remove an object by id (depth-first search).

#### `traverse(callback: (obj: SceneObject) => void): void`

Depth-first traversal of all objects (iterative, using an explicit stack).
Does not visit the root node.

#### `getVisibleObjects(): SceneObject[]`

Returns all objects where `visible === true`.

---

## LightingModel Interface

Pluggable interface that controls how surfaces are shaded. Each lighting model
provides both GLSL shader source (for WebGL) and a CPU `shade` function (for
the software rasteriser).

```typescript
interface LightingModel {
  name: string;
  vertexShaderSource(): string;
  fragmentShaderSource(): string;
  shade(params: ShadeParams): Color;
  uniforms(lights: Light[], material: Material): Record<string, unknown>;
}
```

| Method | Description |
|--------|-------------|
| `name` | Unique identifier for shader caching |
| `vertexShaderSource()` | GLSL vertex shader source |
| `fragmentShaderSource()` | GLSL fragment shader source |
| `shade(params)` | CPU-side per-triangle shading |
| `uniforms(lights, material)` | Returns uniform values for the WebGL program |

### FlatShading (default)

Returns the material colour unchanged with no diffuse or specular computation.

```typescript
const lighting = new FlatShading();
```

### Implementing a Custom LightingModel

```typescript
class LambertShading implements LightingModel {
  readonly name = 'LambertShading';

  vertexShaderSource(): string {
    return `
      attribute vec3 aPosition;
      attribute vec3 aNormal;
      uniform mat4 uModelViewProjection;
      uniform mat4 uModelMatrix;
      varying vec3 vNormal;
      void main() {
        vNormal = (uModelMatrix * vec4(aNormal, 0.0)).xyz;
        gl_Position = uModelViewProjection * vec4(aPosition, 1.0);
      }
    `;
  }

  fragmentShaderSource(): string {
    return `
      precision mediump float;
      uniform vec4 uColor;
      uniform vec3 uLightDir;
      varying vec3 vNormal;
      void main() {
        float diff = max(dot(normalize(vNormal), uLightDir), 0.0);
        float ambient = 0.2;
        gl_FragColor = vec4(uColor.rgb * (ambient + diff), uColor.a);
      }
    `;
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
```

---

## RenderPipeline Interface

The render pipeline takes a scene graph, camera, viewport, and lighting model
and produces a rendered frame.

```typescript
interface RenderPipeline {
  name: string;
  initialize(canvas: HTMLCanvasElement): void;
  dispose(): void;
  render(scene: SceneGraph, camera: Camera, viewport: Viewport, lighting: LightingModel): void;
}
```

### CpuPipeline

Software rasteriser that renders to a Canvas 2D context. Uses the painter's
algorithm (back-to-front depth sorting) and canvas path fills for triangle
rasterisation. No GPU required.

```typescript
const pipeline = new CpuPipeline();
pipeline.initialize(canvas);
// ... render loop ...
pipeline.dispose();
```

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

```typescript
const pipeline = new WebGLPipeline();
pipeline.initialize(canvas);  // throws if WebGL is unavailable
```

**Features:**
- Automatic shader compilation and caching
- Supports `OES_element_index_uint` for large meshes
- Per-object MVP, model matrix, and lighting uniforms
- Wireframe mode via `GL_LINES` draw mode

### Helper Functions (WebGL)

| Function | Signature | Description |
|----------|-----------|-------------|
| `toFloat32` | `(src: Float64Array) => Float32Array` | Convert for WebGL uniform upload |
| `compileShader` | `(gl, type, source) => WebGLShader` | Compile a GLSL shader |
| `linkProgram` | `(gl, vs, fs) => WebGLProgram` | Link vertex + fragment shaders |
| `setUniform` | `(gl, program, name, value) => void` | Set a uniform (mat4, vec2/3/4, float) |

---

## Usage Examples

### Basic Scene with a Box

```typescript
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
```

### Multiple Objects with Camera Orbit

```typescript
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
```

### Custom Lighting Model (Interface Shape)

```typescript
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
```

---

## Architecture

```
                        Space3D (component)
                             |
                  +----------+----------+
                  |                     |
            SceneGraph             onFrame callback
             /    \                     |
      SceneObject  SceneObject   (consumer logic:
       / mesh       / mesh        orbit, physics, etc.)
      / material   / material
     |             |
     +------+------+
            |
       RenderPipeline
       /           \
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
```

**Data flow per frame:**

1. `requestAnimationFrame` fires
2. `onFrame` callback is invoked (consumer updates transforms, cameras)
3. For each viewport, the pipeline's `render()` is called
4. Pipeline traverses `scene.getVisibleObjects()`
5. Each object's `getWorldMatrix()` is composed with the camera's view-projection
6. Triangles are projected, shaded via the `LightingModel`, and rasterised
7. Frame is presented on the canvas

**Transform hierarchy:**
SceneObject supports parent-child relationships. `getWorldMatrix()` iterates up
the parent chain and multiplies local transforms from root to leaf, producing
the final world-space matrix. This enables grouped transforms (e.g., a turret
mounted on a vehicle).

---

## Pipeline Selection

| `renderer` prop | Behaviour |
|-----------------|-----------|
| `'auto'` (default) | Tries WebGL first; falls back to CPU if unavailable |
| `'webgl'` | Uses WebGL; falls back to CPU if unavailable |
| `'cpu'` | Always uses the CPU software rasteriser |

In v1, the WebGL pipeline is fully implemented but the `auto`/`webgl` code
path currently falls back to CPU in the Space3D component. Use `WebGLPipeline`
directly for WebGL rendering (see the showcase demo for an example of direct
pipeline usage).
