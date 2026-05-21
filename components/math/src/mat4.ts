// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from './vec';
import { vec3, vec3Normalize, vec3Sub, vec3Cross, vec3Dot } from './vec';
import type { Quaternion } from './quaternion';

/**
 * A 4x4 matrix stored as a Float64Array of 16 elements in column-major order
 * (OpenGL convention).
 *
 * Index layout (column-major):
 *   [0]  [4]  [8]  [12]
 *   [1]  [5]  [9]  [13]
 *   [2]  [6]  [10] [14]
 *   [3]  [7]  [11] [15]
 */
export type Mat4 = Float64Array;

/** Create a new 4x4 identity matrix. */
export function mat4Identity(): Mat4 {
  const m = new Float64Array(16);
  m[0] = 1;
  m[5] = 1;
  m[10] = 1;
  m[15] = 1;
  return m;
}

/**
 * Multiply two 4x4 matrices: result = a * b.
 * Both matrices are in column-major order.
 */
export function mat4Multiply(a: Mat4, b: Mat4): Mat4 {
  const out = new Float64Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += a[k * 4 + row]! * b[col * 4 + k]!;
      }
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

/** Transpose a 4x4 matrix. */
export function mat4Transpose(m: Mat4): Mat4 {
  const out = new Float64Array(16);
  for (let col = 0; col < 4; col++) {
    for (let row = 0; row < 4; row++) {
      out[col * 4 + row] = m[row * 4 + col]!;
    }
  }
  return out;
}

/**
 * Compute the inverse of a 4x4 matrix.
 * Returns null if the matrix is singular (determinant is zero).
 */
export function mat4Inverse(m: Mat4): Mat4 | null {
  const a00 = m[0]!, a01 = m[1]!, a02 = m[2]!, a03 = m[3]!;
  const a10 = m[4]!, a11 = m[5]!, a12 = m[6]!, a13 = m[7]!;
  const a20 = m[8]!, a21 = m[9]!, a22 = m[10]!, a23 = m[11]!;
  const a30 = m[12]!, a31 = m[13]!, a32 = m[14]!, a33 = m[15]!;

  const b00 = a00 * a11 - a01 * a10;
  const b01 = a00 * a12 - a02 * a10;
  const b02 = a00 * a13 - a03 * a10;
  const b03 = a01 * a12 - a02 * a11;
  const b04 = a01 * a13 - a03 * a11;
  const b05 = a02 * a13 - a03 * a12;
  const b06 = a20 * a31 - a21 * a30;
  const b07 = a20 * a32 - a22 * a30;
  const b08 = a20 * a33 - a23 * a30;
  const b09 = a21 * a32 - a22 * a31;
  const b10 = a21 * a33 - a23 * a31;
  const b11 = a22 * a33 - a23 * a32;

  const det = b00 * b11 - b01 * b10 + b02 * b09 + b03 * b08 - b04 * b07 + b05 * b06;

  if (Math.abs(det) < 1e-15) return null;

  const invDet = 1 / det;
  const out = new Float64Array(16);

  out[0] = (a11 * b11 - a12 * b10 + a13 * b09) * invDet;
  out[1] = (a02 * b10 - a01 * b11 - a03 * b09) * invDet;
  out[2] = (a31 * b05 - a32 * b04 + a33 * b03) * invDet;
  out[3] = (a22 * b04 - a21 * b05 - a23 * b03) * invDet;
  out[4] = (a12 * b08 - a10 * b11 - a13 * b07) * invDet;
  out[5] = (a00 * b11 - a02 * b08 + a03 * b07) * invDet;
  out[6] = (a32 * b02 - a30 * b05 - a33 * b01) * invDet;
  out[7] = (a20 * b05 - a22 * b02 + a23 * b01) * invDet;
  out[8] = (a10 * b10 - a11 * b08 + a13 * b06) * invDet;
  out[9] = (a01 * b08 - a00 * b10 - a03 * b06) * invDet;
  out[10] = (a30 * b04 - a31 * b02 + a33 * b00) * invDet;
  out[11] = (a21 * b02 - a20 * b04 - a23 * b00) * invDet;
  out[12] = (a11 * b07 - a10 * b09 - a12 * b06) * invDet;
  out[13] = (a00 * b09 - a01 * b07 + a02 * b06) * invDet;
  out[14] = (a31 * b01 - a30 * b03 - a32 * b00) * invDet;
  out[15] = (a20 * b03 - a21 * b01 + a22 * b00) * invDet;

  return out;
}

/**
 * Apply a translation to a 4x4 matrix: result = m * T(v).
 * @param m - The matrix to translate.
 * @param v - The translation vector.
 */
export function mat4Translate(m: Mat4, v: Vec3): Mat4 {
  const out = new Float64Array(m);
  out[12] = m[0]! * v.x + m[4]! * v.y + m[8]! * v.z + m[12]!;
  out[13] = m[1]! * v.x + m[5]! * v.y + m[9]! * v.z + m[13]!;
  out[14] = m[2]! * v.x + m[6]! * v.y + m[10]! * v.z + m[14]!;
  out[15] = m[3]! * v.x + m[7]! * v.y + m[11]! * v.z + m[15]!;
  return out;
}

/**
 * Apply a scale to a 4x4 matrix: result = m * S(v).
 * @param m - The matrix to scale.
 * @param v - The scale factors for each axis.
 */
export function mat4Scale(m: Mat4, v: Vec3): Mat4 {
  const out = new Float64Array(16);
  out[0] = m[0]! * v.x;  out[1] = m[1]! * v.x;  out[2] = m[2]! * v.x;  out[3] = m[3]! * v.x;
  out[4] = m[4]! * v.y;  out[5] = m[5]! * v.y;  out[6] = m[6]! * v.y;  out[7] = m[7]! * v.y;
  out[8] = m[8]! * v.z;  out[9] = m[9]! * v.z;  out[10] = m[10]! * v.z; out[11] = m[11]! * v.z;
  out[12] = m[12]!;      out[13] = m[13]!;       out[14] = m[14]!;       out[15] = m[15]!;
  return out;
}

/**
 * Rotate a 4x4 matrix around the X axis: result = m * Rx(radians).
 * @param m - The matrix to rotate.
 * @param radians - The rotation angle in radians.
 */
export function mat4RotateX(m: Mat4, radians: number): Mat4 {
  const s = Math.sin(radians);
  const c = Math.cos(radians);
  const out = new Float64Array(m);

  const a10 = m[4]!, a11 = m[5]!, a12 = m[6]!, a13 = m[7]!;
  const a20 = m[8]!, a21 = m[9]!, a22 = m[10]!, a23 = m[11]!;

  out[4] = a10 * c + a20 * s;
  out[5] = a11 * c + a21 * s;
  out[6] = a12 * c + a22 * s;
  out[7] = a13 * c + a23 * s;
  out[8] = a20 * c - a10 * s;
  out[9] = a21 * c - a11 * s;
  out[10] = a22 * c - a12 * s;
  out[11] = a23 * c - a13 * s;

  return out;
}

/**
 * Rotate a 4x4 matrix around the Y axis: result = m * Ry(radians).
 * @param m - The matrix to rotate.
 * @param radians - The rotation angle in radians.
 */
export function mat4RotateY(m: Mat4, radians: number): Mat4 {
  const s = Math.sin(radians);
  const c = Math.cos(radians);
  const out = new Float64Array(m);

  const a00 = m[0]!, a01 = m[1]!, a02 = m[2]!, a03 = m[3]!;
  const a20 = m[8]!, a21 = m[9]!, a22 = m[10]!, a23 = m[11]!;

  out[0] = a00 * c - a20 * s;
  out[1] = a01 * c - a21 * s;
  out[2] = a02 * c - a22 * s;
  out[3] = a03 * c - a23 * s;
  out[8] = a00 * s + a20 * c;
  out[9] = a01 * s + a21 * c;
  out[10] = a02 * s + a22 * c;
  out[11] = a03 * s + a23 * c;

  return out;
}

/**
 * Rotate a 4x4 matrix around the Z axis: result = m * Rz(radians).
 * @param m - The matrix to rotate.
 * @param radians - The rotation angle in radians.
 */
export function mat4RotateZ(m: Mat4, radians: number): Mat4 {
  const s = Math.sin(radians);
  const c = Math.cos(radians);
  const out = new Float64Array(m);

  const a00 = m[0]!, a01 = m[1]!, a02 = m[2]!, a03 = m[3]!;
  const a10 = m[4]!, a11 = m[5]!, a12 = m[6]!, a13 = m[7]!;

  out[0] = a00 * c + a10 * s;
  out[1] = a01 * c + a11 * s;
  out[2] = a02 * c + a12 * s;
  out[3] = a03 * c + a13 * s;
  out[4] = a10 * c - a00 * s;
  out[5] = a11 * c - a01 * s;
  out[6] = a12 * c - a02 * s;
  out[7] = a13 * c - a03 * s;

  return out;
}

/**
 * Create a perspective projection matrix.
 * @param fovY - Vertical field of view in radians.
 * @param aspect - Aspect ratio (width / height).
 * @param near - Distance to the near clipping plane.
 * @param far - Distance to the far clipping plane.
 */
export function mat4Perspective(fovY: number, aspect: number, near: number, far: number): Mat4 {
  const f = 1 / Math.tan(fovY / 2);
  const nf = 1 / (near - far);
  const out = new Float64Array(16);

  out[0] = f / aspect;
  out[5] = f;
  out[10] = (far + near) * nf;
  out[11] = -1;
  out[14] = 2 * far * near * nf;

  return out;
}

/**
 * Create an orthographic projection matrix.
 * @param left - Left clipping plane.
 * @param right - Right clipping plane.
 * @param bottom - Bottom clipping plane.
 * @param top - Top clipping plane.
 * @param near - Near clipping plane.
 * @param far - Far clipping plane.
 */
export function mat4Orthographic(
  left: number, right: number,
  bottom: number, top: number,
  near: number, far: number,
): Mat4 {
  const lr = 1 / (left - right);
  const bt = 1 / (bottom - top);
  const nf = 1 / (near - far);
  const out = new Float64Array(16);

  out[0] = -2 * lr;
  out[5] = -2 * bt;
  out[10] = 2 * nf;
  out[12] = (left + right) * lr;
  out[13] = (top + bottom) * bt;
  out[14] = (far + near) * nf;
  out[15] = 1;

  return out;
}

/**
 * Create a view matrix that looks from eye toward target.
 * @param eye - The camera position.
 * @param target - The point the camera is looking at.
 * @param up - The world up vector.
 */
export function mat4LookAt(eye: Vec3, target: Vec3, up: Vec3): Mat4 {
  const f = vec3Normalize(vec3Sub(target, eye));
  const s = vec3Normalize(vec3Cross(f, up));
  const u = vec3Cross(s, f);

  const out = new Float64Array(16);
  out[0] = s.x;
  out[1] = u.x;
  out[2] = -f.x;
  out[3] = 0;
  out[4] = s.y;
  out[5] = u.y;
  out[6] = -f.y;
  out[7] = 0;
  out[8] = s.z;
  out[9] = u.z;
  out[10] = -f.z;
  out[11] = 0;
  out[12] = -vec3Dot(s, eye);
  out[13] = -vec3Dot(u, eye);
  out[14] = vec3Dot(f, eye);
  out[15] = 1;

  return out;
}

/**
 * Create a 4x4 rotation matrix from a unit quaternion.
 * @param q - The quaternion (should be normalized).
 */
export function mat4FromQuaternion(q: Quaternion): Mat4 {
  const x = q.x, y = q.y, z = q.z, w = q.w;
  const x2 = x + x, y2 = y + y, z2 = z + z;
  const xx = x * x2, xy = x * y2, xz = x * z2;
  const yy = y * y2, yz = y * z2, zz = z * z2;
  const wx = w * x2, wy = w * y2, wz = w * z2;

  const out = new Float64Array(16);
  out[0] = 1 - (yy + zz);
  out[1] = xy + wz;
  out[2] = xz - wy;
  out[3] = 0;
  out[4] = xy - wz;
  out[5] = 1 - (xx + zz);
  out[6] = yz + wx;
  out[7] = 0;
  out[8] = xz + wy;
  out[9] = yz - wx;
  out[10] = 1 - (xx + yy);
  out[11] = 0;
  out[12] = 0;
  out[13] = 0;
  out[14] = 0;
  out[15] = 1;

  return out;
}

/**
 * Transform a 3D point by a 4x4 matrix (applies translation).
 * Treats the point as a vec4 with w=1 and performs perspective division.
 * @param m - The transformation matrix.
 * @param v - The point to transform.
 */
export function mat4TransformVec3(m: Mat4, v: Vec3): Vec3 {
  const w = m[3]! * v.x + m[7]! * v.y + m[11]! * v.z + m[15]!;
  const invW = w !== 0 ? 1 / w : 1;
  return vec3(
    (m[0]! * v.x + m[4]! * v.y + m[8]! * v.z + m[12]!) * invW,
    (m[1]! * v.x + m[5]! * v.y + m[9]! * v.z + m[13]!) * invW,
    (m[2]! * v.x + m[6]! * v.y + m[10]! * v.z + m[14]!) * invW,
  );
}

/**
 * Transform a direction vector by a 4x4 matrix (ignores translation).
 * Treats the vector as a vec4 with w=0.
 * @param m - The transformation matrix.
 * @param v - The direction vector to transform.
 */
export function mat4TransformDirection(m: Mat4, v: Vec3): Vec3 {
  return vec3(
    m[0]! * v.x + m[4]! * v.y + m[8]! * v.z,
    m[1]! * v.x + m[5]! * v.y + m[9]! * v.z,
    m[2]! * v.x + m[6]! * v.y + m[10]! * v.z,
  );
}
