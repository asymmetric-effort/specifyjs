// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import { vec3, vec3Sub, vec3Add, vec3Scale, vec3Normalize, vec3Length } from '../../../math/src/vec';
import type { SceneObject } from './scene-object';

// ── Types ────────────────────────────────────────────────────────────

/** Collision detection method */
export type ColliderType = 'sphere' | 'aabb';

/** Information about a detected collision */
export interface CollisionInfo {
  objectA: SceneObject;
  objectB: SceneObject;
  /** Overlap distance (penetration depth) */
  overlap: number;
  /** Collision normal (from A toward B) */
  normal: Vec3;
  /** Contact point (approximate midpoint of overlap) */
  contactPoint: Vec3;
}

/** Consumer-provided collision response function */
export type CollisionResponse = (info: CollisionInfo) => void;

// ── Bounding volume computation ──────────────────────────────────────

/** Compute bounding sphere radius from mesh vertices */
export function computeBoundingSphereRadius(obj: SceneObject): number {
  if (!obj.mesh) return 0;
  const verts = obj.mesh.vertices;
  const count = obj.mesh.vertexCount;
  let maxR2 = 0;
  for (let i = 0; i < count; i++) {
    const x = verts[i * 3]!;
    const y = verts[i * 3 + 1]!;
    const z = verts[i * 3 + 2]!;
    const r2 = x * x + y * y + z * z;
    if (r2 > maxR2) maxR2 = r2;
  }
  return Math.sqrt(maxR2) * Math.max(obj.scale.x, obj.scale.y, obj.scale.z);
}

/** Axis-aligned bounding box */
export interface AABB {
  min: Vec3;
  max: Vec3;
}

/** Compute AABB from mesh vertices in world space */
export function computeAABB(obj: SceneObject): AABB {
  if (!obj.mesh) {
    return { min: obj.position, max: obj.position };
  }
  const verts = obj.mesh.vertices;
  const count = obj.mesh.vertexCount;
  const s = obj.scale;
  const p = obj.position;
  let minX = Infinity, minY = Infinity, minZ = Infinity;
  let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
  for (let i = 0; i < count; i++) {
    const x = p.x + verts[i * 3]! * s.x;
    const y = p.y + verts[i * 3 + 1]! * s.y;
    const z = p.z + verts[i * 3 + 2]! * s.z;
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
    if (z < minZ) minZ = z;
    if (z > maxZ) maxZ = z;
  }
  return { min: vec3(minX, minY, minZ), max: vec3(maxX, maxY, maxZ) };
}

// ── Built-in collision tests ─────────────────────────────────────────

/** Test sphere-sphere overlap. Returns CollisionInfo or null. */
export function sphereSphereTest(a: SceneObject, b: SceneObject): CollisionInfo | null {
  const rA = computeBoundingSphereRadius(a);
  const rB = computeBoundingSphereRadius(b);
  const diff = vec3Sub(b.position, a.position);
  const dist = vec3Length(diff);
  const overlap = (rA + rB) - dist;
  if (overlap <= 0) return null;
  const normal = dist > 0 ? vec3Normalize(diff) : vec3(0, 1, 0);
  const contactPoint = vec3Add(a.position, vec3Scale(normal, rA - overlap / 2));
  return { objectA: a, objectB: b, overlap, normal, contactPoint };
}

/** Test AABB-AABB overlap. Returns CollisionInfo or null. */
export function aabbTest(a: SceneObject, b: SceneObject): CollisionInfo | null {
  const boxA = computeAABB(a);
  const boxB = computeAABB(b);

  // Check overlap on all 3 axes
  const overlapX = Math.min(boxA.max.x, boxB.max.x) - Math.max(boxA.min.x, boxB.min.x);
  const overlapY = Math.min(boxA.max.y, boxB.max.y) - Math.max(boxA.min.y, boxB.min.y);
  const overlapZ = Math.min(boxA.max.z, boxB.max.z) - Math.max(boxA.min.z, boxB.min.z);

  if (overlapX <= 0 || overlapY <= 0 || overlapZ <= 0) return null;

  // Find minimum overlap axis (separation axis)
  let overlap: number;
  let normal: Vec3;
  if (overlapX <= overlapY && overlapX <= overlapZ) {
    overlap = overlapX;
    normal = a.position.x < b.position.x ? vec3(1, 0, 0) : vec3(-1, 0, 0);
  } else if (overlapY <= overlapZ) {
    overlap = overlapY;
    normal = a.position.y < b.position.y ? vec3(0, 1, 0) : vec3(0, -1, 0);
  } else {
    overlap = overlapZ;
    normal = a.position.z < b.position.z ? vec3(0, 0, 1) : vec3(0, 0, -1);
  }

  const contactPoint = vec3Scale(vec3Add(a.position, b.position), 0.5);
  return { objectA: a, objectB: b, overlap, normal, contactPoint };
}

// ── Collision Manager ────────────────────────────────────────────────

/**
 * CollisionManager detects collisions between registered objects
 * each frame and calls the consumer's response function.
 */
export class CollisionManager {
  private colliderType: ColliderType;
  private response: CollisionResponse;
  private pairs: Set<string> = new Set(); // track active collision pairs

  constructor(options?: {
    colliderType?: ColliderType;
    response?: CollisionResponse;
  }) {
    this.colliderType = options?.colliderType ?? 'sphere';
    this.response = options?.response ?? (() => {});
  }

  /** Update the collision response function */
  setResponse(fn: CollisionResponse): void {
    this.response = fn;
  }

  /** Update the collider type */
  setColliderType(type: ColliderType): void {
    this.colliderType = type;
  }

  /** Get active collision pair keys from last frame */
  getActivePairs(): string[] {
    return Array.from(this.pairs);
  }

  /**
   * Check all object pairs for collisions.
   * Call this once per frame with the visible objects.
   */
  update(objects: SceneObject[]): CollisionInfo[] {
    const collisions: CollisionInfo[] = [];
    this.pairs.clear();

    const testFn = this.colliderType === 'sphere' ? sphereSphereTest : aabbTest;

    // O(n^2) broad phase — fine for small scenes
    for (let i = 0; i < objects.length; i++) {
      for (let j = i + 1; j < objects.length; j++) {
        const a = objects[i]!;
        const b = objects[j]!;
        if (!a.visible || !b.visible) continue;
        if (!a.mesh || !b.mesh) continue;

        const info = testFn(a, b);
        if (info) {
          collisions.push(info);
          this.pairs.add(`${a.id}:${b.id}`);
          this.response(info);
        }
      }
    }

    return collisions;
  }
}
