// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Raycasting utilities for 3D object picking and hit testing.
 */

import type { Vec3 } from '../../../math/src/vec';
import { vec3, vec3Sub, vec3Dot, vec3Normalize } from '../../../math/src/vec';
import { mat4Inverse } from '../../../math/src/mat4';
import { mat4TransformVec3 } from '../../../math/src/mat4';
import type { Mat4 } from '../../../math/src/mat4';
import type { SceneObject } from './scene-object';
import type { ObjectPicker } from './types';

/** A ray defined by an origin point and a normalized direction. */
export interface Ray {
  origin: Vec3;
  direction: Vec3;
}

/**
 * Ray-sphere intersection test.
 * @returns Distance along the ray to the nearest intersection, or null if no hit.
 */
export function raySphereIntersect(
  ray: Ray,
  center: Vec3,
  radius: number,
): number | null {
  const oc: Vec3 = {
    x: ray.origin.x - center.x,
    y: ray.origin.y - center.y,
    z: ray.origin.z - center.z,
  };
  const a = ray.direction.x * ray.direction.x
    + ray.direction.y * ray.direction.y
    + ray.direction.z * ray.direction.z;
  const b = 2 * (oc.x * ray.direction.x + oc.y * ray.direction.y + oc.z * ray.direction.z);
  const c = oc.x * oc.x + oc.y * oc.y + oc.z * oc.z - radius * radius;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t0 = (-b - sqrtD) / (2 * a);
  const t1 = (-b + sqrtD) / (2 * a);

  // Return nearest positive intersection
  if (t0 >= 0) return t0;
  if (t1 >= 0) return t1;
  return null;
}

/**
 * Ray-AABB (axis-aligned bounding box) intersection test.
 * @returns Distance along the ray to the nearest intersection, or null if no hit.
 */
export function rayAABBIntersect(
  ray: Ray,
  min: Vec3,
  max: Vec3,
): number | null {
  const invDx = ray.direction.x !== 0 ? 1 / ray.direction.x : Infinity;
  const invDy = ray.direction.y !== 0 ? 1 / ray.direction.y : Infinity;
  const invDz = ray.direction.z !== 0 ? 1 / ray.direction.z : Infinity;

  let tmin = (min.x - ray.origin.x) * invDx;
  let tmax = (max.x - ray.origin.x) * invDx;
  if (tmin > tmax) { const tmp = tmin; tmin = tmax; tmax = tmp; }

  let tymin = (min.y - ray.origin.y) * invDy;
  let tymax = (max.y - ray.origin.y) * invDy;
  if (tymin > tymax) { const tmp = tymin; tymin = tymax; tymax = tmp; }

  if (tmin > tymax || tymin > tmax) return null;
  if (tymin > tmin) tmin = tymin;
  if (tymax < tmax) tmax = tymax;

  let tzmin = (min.z - ray.origin.z) * invDz;
  let tzmax = (max.z - ray.origin.z) * invDz;
  if (tzmin > tzmax) { const tmp = tzmin; tzmin = tzmax; tzmax = tmp; }

  if (tmin > tzmax || tzmin > tmax) return null;
  if (tzmin > tmin) tmin = tzmin;
  if (tzmax < tmax) tmax = tzmax;

  // tmin is the entry point, tmax is the exit point
  if (tmax < 0) return null; // box is behind the ray
  return tmin >= 0 ? tmin : 0; // origin inside box returns 0
}

/**
 * Ray-cylinder intersection test (finite cylinder along an axis).
 * @param ray - The ray to test.
 * @param start - One endpoint of the cylinder axis.
 * @param end - Other endpoint of the cylinder axis.
 * @param radius - Cylinder radius.
 * @returns Distance along the ray to the nearest intersection, or null if no hit.
 */
export function rayCylinderIntersect(
  ray: Ray,
  start: Vec3,
  end: Vec3,
  radius: number,
): number | null {
  // Cylinder axis
  const axis = vec3Sub(end, start);
  const axisLenSq = vec3Dot(axis, axis);
  if (axisLenSq < 1e-10) return null;

  const d = ray.direction;
  const m = vec3Sub(ray.origin, start);

  const md = vec3Dot(m, axis);
  const nd = vec3Dot(d, axis);
  const dd = vec3Dot(d, d);
  const mm = vec3Dot(m, m);
  const mn = vec3Dot(m, d);

  // Quadratic coefficients for infinite cylinder
  const a = dd * axisLenSq - nd * nd;
  const b = 2 * (mn * axisLenSq - md * nd);
  const c = mm * axisLenSq - md * md - radius * radius * axisLenSq;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null;

  const sqrtD = Math.sqrt(discriminant);
  const t0 = (-b - sqrtD) / (2 * a);
  const t1 = (-b + sqrtD) / (2 * a);

  // Check both intersections against finite height
  for (const t of [t0, t1]) {
    if (t < 0) continue;
    const h = md + t * nd;
    if (h >= 0 && h <= axisLenSq) {
      return t;
    }
  }

  return null;
}

/**
 * Convert screen coordinates to a world-space ray.
 * @param screenX - Screen x position (pixels).
 * @param screenY - Screen y position (pixels).
 * @param viewportW - Viewport width (pixels).
 * @param viewportH - Viewport height (pixels).
 * @param viewProj - The combined view * projection matrix.
 * @returns A ray in world space from the camera through the screen point.
 */
export function screenToRay(
  screenX: number,
  screenY: number,
  viewportW: number,
  viewportH: number,
  viewProj: Mat4,
): Ray {
  // Convert screen coords to NDC [-1, 1]
  const ndcX = (screenX / viewportW) * 2 - 1;
  const ndcY = 1 - (screenY / viewportH) * 2; // flip Y

  const invVP = mat4Inverse(viewProj);
  if (!invVP) {
    // Singular matrix — return a default ray
    return { origin: vec3(0, 0, 0), direction: vec3(0, 0, -1) };
  }

  // Unproject near and far points
  const nearPt = mat4TransformVec3(invVP, vec3(ndcX, ndcY, -1));
  const farPt = mat4TransformVec3(invVP, vec3(ndcX, ndcY, 1));

  const direction = vec3Normalize(vec3Sub(farPt, nearPt));
  return { origin: nearPt, direction };
}

/**
 * Pick the closest visible object intersected by a ray.
 * Uses bounding sphere for each object.
 * @returns The closest hit, or null if nothing was hit.
 */
export function pickObjects(
  ray: Ray,
  objects: SceneObject[],
): { object: SceneObject; distance: number } | null {
  let closest: { object: SceneObject; distance: number } | null = null;

  for (const obj of objects) {
    if (!obj.visible) continue;
    const radius = obj.boundingRadius;
    if (radius === undefined || radius <= 0) continue;

    // Get world position from world matrix
    const wm = obj.getWorldMatrix();
    const worldPos: Vec3 = { x: wm[12]!, y: wm[13]!, z: wm[14]! };

    const t = raySphereIntersect(ray, worldPos, radius);
    if (t !== null && (closest === null || t < closest.distance)) {
      closest = { object: obj, distance: t };
    }
  }

  return closest;
}

/**
 * RaycastPicker — implements the ObjectPicker interface using ray-sphere intersection.
 */
export class RaycastPicker implements ObjectPicker {
  pick(origin: Vec3, direction: Vec3, objects: SceneObject[]): SceneObject | null {
    const ray: Ray = { origin, direction: vec3Normalize(direction) };
    const hit = pickObjects(ray, objects);
    return hit ? hit.object : null;
  }
}
