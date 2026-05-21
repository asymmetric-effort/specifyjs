// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from './vec';
import { vec3, vec3Normalize, vec3Cross, vec3Dot, vec3Length } from './vec';

/** A quaternion representing a rotation, with w as the scalar component. */
export interface Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;
}

/** Create the identity quaternion (no rotation). */
export function quatIdentity(): Quaternion {
  return { x: 0, y: 0, z: 0, w: 1 };
}

/**
 * Create a quaternion from an axis and angle.
 * @param axis - The rotation axis (will be normalized).
 * @param radians - The rotation angle in radians.
 */
export function quatFromAxisAngle(axis: Vec3, radians: number): Quaternion {
  const half = radians * 0.5;
  const s = Math.sin(half);
  const n = vec3Normalize(axis);
  return { x: n.x * s, y: n.y * s, z: n.z * s, w: Math.cos(half) };
}

/**
 * Create a quaternion from Euler angles (intrinsic ZYX / yaw-pitch-roll).
 * @param pitch - Rotation around the X axis in radians.
 * @param yaw - Rotation around the Y axis in radians.
 * @param roll - Rotation around the Z axis in radians.
 */
export function quatFromEuler(pitch: number, yaw: number, roll: number): Quaternion {
  const cy = Math.cos(yaw * 0.5);
  const sy = Math.sin(yaw * 0.5);
  const cp = Math.cos(pitch * 0.5);
  const sp = Math.sin(pitch * 0.5);
  const cr = Math.cos(roll * 0.5);
  const sr = Math.sin(roll * 0.5);

  return {
    x: sr * cp * cy - cr * sp * sy,
    y: cr * sp * cy + sr * cp * sy,
    z: cr * cp * sy - sr * sp * cy,
    w: cr * cp * cy + sr * sp * sy,
  };
}

/**
 * Multiply two quaternions (Hamilton product).
 * Represents the composition of rotations: first b, then a.
 */
export function quatMultiply(a: Quaternion, b: Quaternion): Quaternion {
  return {
    x: a.w * b.x + a.x * b.w + a.y * b.z - a.z * b.y,
    y: a.w * b.y - a.x * b.z + a.y * b.w + a.z * b.x,
    z: a.w * b.z + a.x * b.y - a.y * b.x + a.z * b.w,
    w: a.w * b.w - a.x * b.x - a.y * b.y - a.z * b.z,
  };
}

/** Return the conjugate of a quaternion. */
export function quatConjugate(q: Quaternion): Quaternion {
  return { x: -q.x, y: -q.y, z: -q.z, w: q.w };
}

/** Return the inverse of a quaternion. */
export function quatInverse(q: Quaternion): Quaternion {
  const lenSq = q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w;
  if (lenSq === 0) return { x: 0, y: 0, z: 0, w: 0 };
  const inv = 1 / lenSq;
  return { x: -q.x * inv, y: -q.y * inv, z: -q.z * inv, w: q.w * inv };
}

/** Normalize a quaternion to unit length. */
export function quatNormalize(q: Quaternion): Quaternion {
  const len = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
  if (len === 0) return { x: 0, y: 0, z: 0, w: 0 };
  const inv = 1 / len;
  return { x: q.x * inv, y: q.y * inv, z: q.z * inv, w: q.w * inv };
}

/** Return the length (magnitude) of a quaternion. */
export function quatLength(q: Quaternion): number {
  return Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
}

/** Compute the dot product of two quaternions. */
export function quatDot(a: Quaternion, b: Quaternion): number {
  return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
}

/**
 * Spherical linear interpolation between two quaternions.
 * @param a - Start quaternion.
 * @param b - End quaternion.
 * @param t - Interpolation factor (0 = a, 1 = b).
 */
export function quatSlerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
  let dot = quatDot(a, b);

  // If the dot product is negative, negate one quaternion to take the shorter path.
  let bx = b.x, by = b.y, bz = b.z, bw = b.w;
  if (dot < 0) {
    dot = -dot;
    bx = -bx;
    by = -by;
    bz = -bz;
    bw = -bw;
  }

  // If quaternions are very close, use linear interpolation to avoid division by zero.
  if (dot > 0.9995) {
    return quatNormalize({
      x: a.x + (bx - a.x) * t,
      y: a.y + (by - a.y) * t,
      z: a.z + (bz - a.z) * t,
      w: a.w + (bw - a.w) * t,
    });
  }

  const theta = Math.acos(dot);
  const sinTheta = Math.sin(theta);
  const wa = Math.sin((1 - t) * theta) / sinTheta;
  const wb = Math.sin(t * theta) / sinTheta;

  return {
    x: a.x * wa + bx * wb,
    y: a.y * wa + by * wb,
    z: a.z * wa + bz * wb,
    w: a.w * wa + bw * wb,
  };
}

/**
 * Rotate a Vec3 by a unit quaternion.
 * Uses the formula: v' = q * v * q^-1 (optimized).
 */
export function quatRotateVec3(q: Quaternion, v: Vec3): Vec3 {
  const ux = q.x, uy = q.y, uz = q.z, uw = q.w;
  // t = 2 * cross(q.xyz, v)
  const tx = 2 * (uy * v.z - uz * v.y);
  const ty = 2 * (uz * v.x - ux * v.z);
  const tz = 2 * (ux * v.y - uy * v.x);
  return {
    x: v.x + uw * tx + (uy * tz - uz * ty),
    y: v.y + uw * ty + (uz * tx - ux * tz),
    z: v.z + uw * tz + (ux * ty - uy * tx),
  };
}

/**
 * Convert a quaternion to Euler angles (pitch, yaw, roll) in radians.
 * Uses intrinsic ZYX convention.
 * @returns A Vec3 where x = pitch, y = yaw, z = roll.
 */
export function quatToEuler(q: Quaternion): Vec3 {
  // Roll (Z axis)
  const sinrCosp = 2 * (q.w * q.x + q.y * q.z);
  const cosrCosp = 1 - 2 * (q.x * q.x + q.y * q.y);
  const roll = Math.atan2(sinrCosp, cosrCosp);

  // Pitch (Y axis) — clamp to avoid NaN from asin
  const sinp = 2 * (q.w * q.y - q.z * q.x);
  let pitch: number;
  if (Math.abs(sinp) >= 1) {
    pitch = Math.sign(sinp) * (Math.PI / 2);
  } else {
    pitch = Math.asin(sinp);
  }

  // Yaw (X axis)
  const sinyCosp = 2 * (q.w * q.z + q.x * q.y);
  const cosyCosp = 1 - 2 * (q.y * q.y + q.z * q.z);
  const yaw = Math.atan2(sinyCosp, cosyCosp);

  return vec3(roll, pitch, yaw);
}

/**
 * Create a quaternion representing a rotation that looks in the given direction.
 * @param forward - The direction to look at (will be normalized).
 * @param up - The up vector (will be normalized).
 */
export function quatLookAt(forward: Vec3, up: Vec3): Quaternion {
  const f = vec3Normalize(forward);
  const u = vec3Normalize(up);

  // Build an orthonormal basis
  const right = vec3Normalize(vec3Cross(u, f));
  const correctedUp = vec3Cross(f, right);

  // Convert rotation matrix to quaternion
  // The matrix columns are: right, correctedUp, f
  const m00 = right.x, m01 = correctedUp.x, m02 = f.x;
  const m10 = right.y, m11 = correctedUp.y, m12 = f.y;
  const m20 = right.z, m21 = correctedUp.z, m22 = f.z;

  const trace = m00 + m11 + m22;

  if (trace > 0) {
    const s = 0.5 / Math.sqrt(trace + 1);
    return {
      w: 0.25 / s,
      x: (m21 - m12) * s,
      y: (m02 - m20) * s,
      z: (m10 - m01) * s,
    };
  } else if (m00 > m11 && m00 > m22) {
    const s = 2 * Math.sqrt(1 + m00 - m11 - m22);
    return {
      w: (m21 - m12) / s,
      x: 0.25 * s,
      y: (m01 + m10) / s,
      z: (m02 + m20) / s,
    };
  } else if (m11 > m22) {
    const s = 2 * Math.sqrt(1 + m11 - m00 - m22);
    return {
      w: (m02 - m20) / s,
      x: (m01 + m10) / s,
      y: 0.25 * s,
      z: (m12 + m21) / s,
    };
  } else {
    const s = 2 * Math.sqrt(1 + m22 - m00 - m11);
    return {
      w: (m10 - m01) / s,
      x: (m02 + m20) / s,
      y: (m12 + m21) / s,
      z: 0.25 * s,
    };
  }
}
