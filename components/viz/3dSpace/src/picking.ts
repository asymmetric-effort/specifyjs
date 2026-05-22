// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import { vec3, vec3Sub, vec3Normalize, vec3Dot, vec3Add, vec3Scale } from '../../../math/src/vec';
import { mat4Inverse, mat4Multiply, mat4TransformVec3 } from '../../../math/src/mat4';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { SceneObject } from './scene-object';
import type { ObjectPicker } from './types';

/**
 * A ray in 3D space defined by an origin point and a direction vector.
 */
export interface Ray {
  origin: Vec3;
  direction: Vec3;
}

/**
 * Result of a pick/raycast operation.
 */
export interface PickResult {
  /** The object that was hit */
  object: SceneObject;
  /** Distance from the ray origin to the hit point */
  distance: number;
  /** World-space position of the hit */
  hitPoint: Vec3;
}

/**
 * Convert a screen-space mouse position to a world-space ray.
 * Uses the camera's view and projection matrices to unproject.
 */
export function screenToRay(
  screenX: number,
  screenY: number,
  camera: Camera,
  viewport: Viewport,
): Ray {
  // Convert screen coords to NDC [-1, 1]
  const ndcX = ((screenX - viewport.x) / viewport.width) * 2 - 1;
  const ndcY = 1 - ((screenY - viewport.y) / viewport.height) * 2; // flip Y

  // Compute inverse view-projection matrix
  const viewMat = camera.getViewMatrix();
  const projMat = camera.getProjectionMatrix();
  const vpMat = mat4Multiply(projMat, viewMat);
  const invVP = mat4Inverse(vpMat);
  if (!invVP) return { origin: camera.position, direction: vec3(0, 0, -1) };

  // Unproject near and far points
  const nearPoint = mat4TransformVec3(invVP, vec3(ndcX, ndcY, -1));
  const farPoint = mat4TransformVec3(invVP, vec3(ndcX, ndcY, 1));

  const direction = vec3Normalize(vec3Sub(farPoint, nearPoint));

  return { origin: nearPoint, direction };
}

/**
 * Test if a ray intersects an axis-aligned bounding sphere.
 * Returns distance to intersection or null if no hit.
 */
export function rayIntersectSphere(
  ray: Ray,
  center: Vec3,
  radius: number,
): number | null {
  const oc = vec3Sub(ray.origin, center);
  const a = vec3Dot(ray.direction, ray.direction);
  const b = 2 * vec3Dot(oc, ray.direction);
  const c = vec3Dot(oc, oc) - radius * radius;
  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) return null;

  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  return t > 0 ? t : null;
}

/**
 * Test if a ray intersects an axis-aligned bounding box (AABB).
 * Returns distance to intersection or null if no hit.
 */
export function rayIntersectAABB(
  ray: Ray,
  min: Vec3,
  max: Vec3,
): number | null {
  let tmin = -Infinity;
  let tmax = Infinity;

  for (const axis of ['x', 'y', 'z'] as const) {
    const invD = 1 / ray.direction[axis];
    let t0 = (min[axis] - ray.origin[axis]) * invD;
    let t1 = (max[axis] - ray.origin[axis]) * invD;
    if (invD < 0) { const tmp = t0; t0 = t1; t1 = tmp; }
    tmin = Math.max(tmin, t0);
    tmax = Math.min(tmax, t1);
    if (tmax < tmin) return null;
  }

  return tmin > 0 ? tmin : (tmax > 0 ? tmax : null);
}

/**
 * Built-in bounding-sphere object picker.
 * Tests each object's bounding sphere (computed from mesh extents)
 * against the ray. Returns the closest hit.
 */
export class BoundingSpherePicker implements ObjectPicker {
  pick(origin: Vec3, direction: Vec3, objects: SceneObject[]): SceneObject | null {
    const ray: Ray = { origin, direction: vec3Normalize(direction) };
    let closest: SceneObject | null = null;
    let closestDist = Infinity;

    for (const obj of objects) {
      if (!obj.visible || !obj.mesh) continue;

      // Compute bounding sphere from mesh vertices
      const verts = obj.mesh.vertices;
      const count = obj.mesh.vertexCount;
      if (count === 0) continue;

      // Get object world position as sphere center
      const center = obj.position;

      // Estimate radius from mesh extents
      let maxR2 = 0;
      for (let i = 0; i < count; i++) {
        const vx = verts[i * 3]!;
        const vy = verts[i * 3 + 1]!;
        const vz = verts[i * 3 + 2]!;
        const r2 = vx * vx + vy * vy + vz * vz;
        if (r2 > maxR2) maxR2 = r2;
      }
      const radius = Math.sqrt(maxR2) * Math.max(obj.scale.x, obj.scale.y, obj.scale.z);

      const dist = rayIntersectSphere(ray, center, radius);
      if (dist !== null && dist < closestDist) {
        closestDist = dist;
        closest = obj;
      }
    }

    return closest;
  }
}

/**
 * Pick the nearest scene object at the given screen coordinates.
 * Convenience function that combines screenToRay + picker.pick.
 */
export function pickAtScreen(
  screenX: number,
  screenY: number,
  camera: Camera,
  viewport: Viewport,
  objects: SceneObject[],
  picker: ObjectPicker,
): SceneObject | null {
  const ray = screenToRay(screenX, screenY, camera, viewport);
  return picker.pick(ray.origin, ray.direction, objects);
}
