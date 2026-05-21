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
export { FlatShading } from './lighting-model';
export { SceneGraph } from './scene-graph';
export type { RenderPipeline } from './render-pipeline';
export { WebGLPipeline, toFloat32, compileShader, linkProgram, setUniform } from './webgl-pipeline';
export { CpuPipeline } from './cpu-pipeline';
export { Space3D } from './Space3D';
export type { Space3DProps } from './Space3D';
