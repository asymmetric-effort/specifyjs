// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { SceneObject } from './scene-object';

/**
 * Boundary behavior when an object reaches the edge of finite space.
 */
export type BoundaryMode = 'none' | 'clamp' | 'wrap' | 'bounce' | 'destroy';

/** Axis-aligned bounding box defined by min and max corners. */
export interface SpaceBounds {
  min: Vec3;
  max: Vec3;
}

/** Clamp a position to stay within the given bounds. */
export function clampToBounds(
  position: Vec3,
  bounds: { min: Vec3; max: Vec3 },
): Vec3 {
  return {
    x: Math.max(bounds.min.x, Math.min(bounds.max.x, position.x)),
    y: Math.max(bounds.min.y, Math.min(bounds.max.y, position.y)),
    z: Math.max(bounds.min.z, Math.min(bounds.max.z, position.z)),
  };
}

/** Check if a position is within bounds. */
export function isInBounds(position: Vec3, bounds: SpaceBounds): boolean {
  return position.x >= bounds.min.x && position.x <= bounds.max.x &&
         position.y >= bounds.min.y && position.y <= bounds.max.y &&
         position.z >= bounds.min.z && position.z <= bounds.max.z;
}

/** Compute the center of bounds. */
export function boundsCenter(bounds: SpaceBounds): Vec3 {
  return {
    x: (bounds.min.x + bounds.max.x) / 2,
    y: (bounds.min.y + bounds.max.y) / 2,
    z: (bounds.min.z + bounds.max.z) / 2,
  };
}

/** Compute the size (extents) of bounds. */
export function boundsSize(bounds: SpaceBounds): Vec3 {
  return {
    x: bounds.max.x - bounds.min.x,
    y: bounds.max.y - bounds.min.y,
    z: bounds.max.z - bounds.min.z,
  };
}

/**
 * Apply boundary behavior to a scene object's position.
 *
 * @param obj - The scene object to check
 * @param bounds - The space boundaries
 * @param mode - The boundary behavior mode
 * @param velocity - Object velocity (required for 'bounce' mode, modified in-place)
 * @returns true if the object should remain in the scene, false if it should be destroyed
 */
export function applyBoundary(
  obj: SceneObject,
  bounds: SpaceBounds,
  mode: BoundaryMode,
  velocity?: { x: number; y: number; z: number },
): boolean {
  if (mode === 'none') return true;

  const pos = obj.position;

  switch (mode) {
    case 'clamp':
      obj.position = clampToBounds(pos, bounds);
      return true;

    case 'wrap': {
      const size = boundsSize(bounds);
      let { x, y, z } = pos;
      if (x < bounds.min.x) x = bounds.max.x - ((bounds.min.x - x) % size.x);
      if (x > bounds.max.x) x = bounds.min.x + ((x - bounds.max.x) % size.x);
      if (y < bounds.min.y) y = bounds.max.y - ((bounds.min.y - y) % size.y);
      if (y > bounds.max.y) y = bounds.min.y + ((y - bounds.max.y) % size.y);
      if (z < bounds.min.z) z = bounds.max.z - ((bounds.min.z - z) % size.z);
      if (z > bounds.max.z) z = bounds.min.z + ((z - bounds.max.z) % size.z);
      obj.position = { x, y, z };
      return true;
    }

    case 'bounce': {
      let { x, y, z } = pos;
      const vel = velocity ?? { x: 0, y: 0, z: 0 };
      if (x < bounds.min.x) { x = bounds.min.x; vel.x = Math.abs(vel.x); }
      if (x > bounds.max.x) { x = bounds.max.x; vel.x = -Math.abs(vel.x); }
      if (y < bounds.min.y) { y = bounds.min.y; vel.y = Math.abs(vel.y); }
      if (y > bounds.max.y) { y = bounds.max.y; vel.y = -Math.abs(vel.y); }
      if (z < bounds.min.z) { z = bounds.min.z; vel.z = Math.abs(vel.z); }
      if (z > bounds.max.z) { z = bounds.max.z; vel.z = -Math.abs(vel.z); }
      obj.position = { x, y, z };
      if (velocity) {
        velocity.x = vel.x;
        velocity.y = vel.y;
        velocity.z = vel.z;
      }
      return true;
    }

    case 'destroy':
      return isInBounds(pos, bounds);
  }
}
