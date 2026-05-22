// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';

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
