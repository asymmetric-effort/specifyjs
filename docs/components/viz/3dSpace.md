# Space3D

Full 3D rendering engine component that manages a canvas-based scene graph with cameras, viewports, lighting, animations, collision detection, and pluggable render pipelines (CPU software rasterizer or WebGL/WebGPU).

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| width | `number` | (required) | Canvas width in pixels |
| height | `number` | (required) | Canvas height in pixels |
| finiteSpace | `boolean` | `true` | Whether the space is bounded |
| bounds | `{ min: Vec3; max: Vec3 }` | `undefined` | Bounds for finite space clamping |
| lightingModel | `LightingModel` | `FlatShading` | Lighting model instance |
| onFrame | `(deltaTime, scene, cameras) => void` | `undefined` | Per-frame animation callback |
| objectPicker | `ObjectPicker` | no-op | Object picking handler |
| cameras | `Camera[]` | default camera | Array of cameras |
| viewports | `Viewport[]` | auto | Viewports mapped to cameras |
| objects | `SceneObject[]` | `undefined` | Scene objects to register |
| lights | `Light[]` | `undefined` | Scene lights |
| showGrid | `boolean` | `false` | Show a reference grid on the XZ plane |
| gridSize | `number` | `20` | Grid size in world units |
| gridDivisions | `number` | `20` | Grid subdivision count |
| renderer | `'webgl' \| 'cpu' \| 'auto'` | `'auto'` | Preferred render pipeline |
| cameraController | `CameraControllerFn` | `undefined` | Pluggable camera controller |
| animations | `AnimationManager` | `undefined` | Per-object animation manager |
| boundaryMode | `BoundaryMode` | `'none'` | Boundary enforcement behavior |
| collisions | `CollisionManager` | `undefined` | Collision detection manager |

## Usage

```ts
import { createElement } from 'specifyjs';
import { Space3D } from 'specifyjs/components/viz/3dSpace';
import { SceneObject } from 'specifyjs/components/viz/3dSpace/scene-object';
import { Camera } from 'specifyjs/components/viz/3dSpace/camera';

const cube = new SceneObject('my-cube');
const camera = new Camera({ position: { x: 0, y: 5, z: 10 }, fov: Math.PI / 4, aspect: 16/9, near: 0.1, far: 1000 });
camera.lookAt({ x: 0, y: 0, z: 0 });

createElement(Space3D, {
  width: 800,
  height: 600,
  objects: [cube],
  cameras: [camera],
  showGrid: true,
  onFrame: (dt, scene, cams) => { /* animate objects */ },
});
```

## Notes

- Renders to a Canvas element using the selected pipeline (CPU software rasterizer by default, with automatic WebGL/WebGPU upgrade when available).
- The scene graph, camera, viewport, and lighting systems are fully composable.
- Supports pluggable camera controllers, animation managers, and collision managers.
- The `onFrame` callback is called via `requestAnimationFrame` each frame.
