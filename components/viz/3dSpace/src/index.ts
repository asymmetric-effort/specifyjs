// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

export type { Color, Vertex, ShadeParams, Texture, ObjectPicker, Mat4, Quaternion } from './types';
export { DefaultObjectPicker } from './types';
export { Mesh } from './mesh';
export type { Material } from './material';
export { createMaterial } from './material';
export type { LightType } from './light';
export { Light } from './light';
export type { ProjectionMode } from './camera';
export { Camera } from './camera';
export { Viewport } from './viewport';
export { SceneObject } from './scene-object';
export type { LightingModel } from './lighting-model';
export { FlatShading, LambertianShading } from './lighting-model';
export { SceneGraph } from './scene-graph';
export type { RenderPipeline } from './render-pipeline';
export { WebGLPipeline, toFloat32, compileShader, linkProgram, setUniform } from './webgl-pipeline';
export { CpuPipeline } from './cpu-pipeline';
export type { SpaceBounds, BoundaryMode } from './bounds';
export { clampToBounds, isInBounds, boundsCenter, boundsSize, applyBoundary } from './bounds';
export { solidTexture, checkerboardTexture, gradientTexture, noiseTexture } from './texture';
export { Space3D } from './Space3D';
export type { Space3DProps } from './Space3D';
export type { CameraControllerFn, InputState } from './camera-controller';
export { createInputTracker, resetFrameDeltas, orbitController, flyController } from './camera-controller';
export type { HeightFunction, TerrainColorFunction } from './terrain';
export { generateTerrain, sineTerrain, heightGradientColor } from './terrain';
export type { Ray, PickResult } from './picking';
export { screenToRay, rayIntersectSphere, rayIntersectAABB, BoundingSpherePicker, pickAtScreen } from './picking';
export type { AnimationFn, AnimationBinding } from './animation';
export { AnimationManager, rotateY, bob, orbit, compose } from './animation';
export type { ColliderType, CollisionInfo, CollisionResponse, AABB } from './collision';
export { CollisionManager, computeBoundingSphereRadius, computeAABB, sphereSphereTest, aabbTest } from './collision';
