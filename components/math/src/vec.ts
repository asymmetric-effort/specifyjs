// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/** A 2D vector with x and y components. */
export interface Vec2 {
  readonly x: number;
  readonly y: number;
}

/** A 3D vector with x, y, and z components. */
export interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}

// ---------------------------------------------------------------------------
// Vec2 operations
// ---------------------------------------------------------------------------

/** Create a new Vec2. */
export function vec2(x: number, y: number): Vec2 {
  return { x, y };
}

/** Add two Vec2 vectors. */
export function vec2Add(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x + b.x, y: a.y + b.y };
}

/** Subtract Vec2 b from Vec2 a. */
export function vec2Sub(a: Vec2, b: Vec2): Vec2 {
  return { x: a.x - b.x, y: a.y - b.y };
}

/** Scale a Vec2 by a scalar. */
export function vec2Scale(v: Vec2, s: number): Vec2 {
  return { x: v.x * s, y: v.y * s };
}

/** Compute the dot product of two Vec2 vectors. */
export function vec2Dot(a: Vec2, b: Vec2): number {
  return a.x * b.x + a.y * b.y;
}

/** Compute the length (magnitude) of a Vec2. */
export function vec2Length(v: Vec2): number {
  return Math.sqrt(v.x * v.x + v.y * v.y);
}

/**
 * Normalize a Vec2 to unit length.
 * Returns a zero vector if the input has zero length.
 */
export function vec2Normalize(v: Vec2): Vec2 {
  const len = vec2Length(v);
  if (len === 0) return { x: 0, y: 0 };
  return { x: v.x / len, y: v.y / len };
}

/** Compute the Euclidean distance between two Vec2 points. */
export function vec2Dist(a: Vec2, b: Vec2): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Linearly interpolate between two Vec2 vectors.
 * @param t - Interpolation factor (0 = a, 1 = b).
 */
export function vec2Lerp(a: Vec2, b: Vec2, t: number): Vec2 {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
  };
}

// ---------------------------------------------------------------------------
// Vec3 operations
// ---------------------------------------------------------------------------

/** Create a new Vec3. */
export function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

/** Add two Vec3 vectors. */
export function vec3Add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/** Subtract Vec3 b from Vec3 a. */
export function vec3Sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/** Scale a Vec3 by a scalar. */
export function vec3Scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

/** Compute the dot product of two Vec3 vectors. */
export function vec3Dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/** Compute the cross product of two Vec3 vectors. */
export function vec3Cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

/** Compute the length (magnitude) of a Vec3. */
export function vec3Length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * Normalize a Vec3 to unit length.
 * Returns a zero vector if the input has zero length.
 */
export function vec3Normalize(v: Vec3): Vec3 {
  const len = vec3Length(v);
  if (len === 0) return { x: 0, y: 0, z: 0 };
  return { x: v.x / len, y: v.y / len, z: v.z / len };
}
