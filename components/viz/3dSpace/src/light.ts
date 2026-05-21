// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { Color } from './types';

/** Types of light source. */
export type LightType = 'directional' | 'point' | 'spot';

/** A light source in the scene. */
export class Light {
  type: LightType;
  position: Vec3;
  direction: Vec3;
  color: Color;
  intensity: number;
  range: number;
  spotAngle: number;

  constructor(options: {
    type: LightType;
    position?: Vec3;
    direction?: Vec3;
    color?: Color;
    intensity?: number;
    range?: number;
    spotAngle?: number;
  }) {
    this.type = options.type;
    this.position = options.position ?? { x: 0, y: 0, z: 0 };
    this.direction = options.direction ?? { x: 0, y: -1, z: 0 };
    this.color = options.color ?? { r: 1, g: 1, b: 1, a: 1 };
    this.intensity = options.intensity ?? 1;
    this.range = options.range ?? 10;
    this.spotAngle = options.spotAngle ?? Math.PI / 4;
  }
}
