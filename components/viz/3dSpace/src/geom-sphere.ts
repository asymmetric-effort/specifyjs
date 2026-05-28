// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { Color } from './types';
import { Mesh } from './mesh';
import { SceneObject } from './scene-object';
import { createMaterial } from './material';

/** Configuration for creating a geometry sphere. */
export interface GeomSphereConfig {
  /** Sphere radius. */
  radius: number;
  /** Surface color (base albedo for lighting). */
  surfaceColor: Color;
  /** Optional text label rendered as billboard at the sphere center. */
  label?: string;
  /** Text color for the label. Default: { r: 1, g: 1, b: 1, a: 1 } (white). */
  textColor?: Color;
  /** Label font size relative to sphere radius. Default: 0.3. */
  labelScale?: number;
  /** Sphere tessellation quality (stacks/slices). Default: 24. */
  segments?: number;
}

/**
 * Create a SceneObject with a solid sphere mesh and optional billboard label.
 *
 * @param id - Unique SceneObject identifier (used for lookup, NOT for app data storage).
 * @param position - Initial position in world space.
 * @param config - Sphere geometry and visual configuration.
 * @returns A SceneObject ready to add to a SceneGraph.
 */
export function createGeomSphere(
  id: string,
  position: Vec3,
  config: GeomSphereConfig,
): SceneObject {
  const segments = config.segments ?? 24;
  const radius = Math.abs(config.radius);

  const obj = new SceneObject(id);
  obj.position = { x: position.x, y: position.y, z: position.z };
  obj.mesh = Mesh.createSphere(radius, segments, segments);
  obj.material = createMaterial(config.surfaceColor);

  // Label: create a child SceneObject as a placeholder for billboard text.
  // TODO: Full canvas text rendering requires texture pipeline support.
  // For now, create a child object with label metadata so consumers can
  // implement overlay rendering.
  if (config.label && config.label.length > 0) {
    const labelObj = new SceneObject(`${id}-label`);
    labelObj.position = { x: 0, y: 0, z: 0 };
    labelObj.label = config.label;
    const textColor = config.textColor ?? { r: 1, g: 1, b: 1, a: 1 };
    labelObj.material = createMaterial(textColor);
    obj.addChild(labelObj);
  }

  return obj;
}
