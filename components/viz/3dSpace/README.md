# @specifyjs/3d-space

3D scene graph, camera, lighting, and render pipeline component for SpecifyJS.

## Features

- Scene graph with parent/child hierarchy and depth-first traversal
- Perspective and orthographic cameras
- Mesh geometry with static factories (box, plane)
- Pluggable materials with texture support
- Directional, point, and spot lights
- Pluggable lighting models (ships with FlatShading)
- Pluggable render pipeline interface
- Object picking interface

## Usage

```typescript
import {
  SceneGraph,
  Camera,
  Viewport,
  Mesh,
  SceneObject,
  FlatShading,
} from '@specifyjs/3d-space';
```
