// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec2, Vec3 } from '../../../math/src/vec';
import type { Mat4 } from '../../../math/src/mat4';
import type { Quaternion } from '../../../math/src/quaternion';
import type { SceneObject } from './scene-object';

export type { Mat4, Quaternion };

/** RGBA color with channels in the 0-1 range. */
export interface Color {
  r: number;
  g: number;
  b: number;
  a: number;
}

/** Vertex data for a mesh. */
export interface Vertex {
  position: Vec3;
  normal: Vec3;
  uv?: Vec2;
  color?: Color;
}

/** Parameters passed to a lighting model's shade function. */
export interface ShadeParams {
  normal: Vec3;
  lightDir: Vec3;
  viewDir: Vec3;
  lightColor: Color;
  materialColor: Color;
  ambientStrength: number;
}

/** Pluggable texture interface. */
export interface Texture {
  width: number;
  height: number;
  sample(u: number, v: number): Color;
}

/** Pluggable object picking interface. */
export interface ObjectPicker {
  pick(origin: Vec3, direction: Vec3, objects: SceneObject[]): SceneObject | null;
}

/** No-op default picker that always returns null. */
export class DefaultObjectPicker implements ObjectPicker {
  pick(): SceneObject | null {
    return null;
  }
}
