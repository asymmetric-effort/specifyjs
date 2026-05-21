// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import { vec3Sub, vec3Cross, vec3Normalize } from '../../../math/src/vec';
import type { Mat4, Quaternion } from './types';

/** Projection mode for the camera. */
export type ProjectionMode = 'perspective' | 'orthographic';

/** Camera for viewing a 3D scene. */
export class Camera {
  position: Vec3;
  orientation: Quaternion;
  projectionMode: ProjectionMode;

  // Perspective parameters
  fov: number;
  aspect: number;
  near: number;
  far: number;

  // Orthographic parameters
  left: number;
  right: number;
  top: number;
  bottom: number;

  constructor(options?: {
    position?: Vec3;
    orientation?: Quaternion;
    projectionMode?: ProjectionMode;
    fov?: number;
    aspect?: number;
    near?: number;
    far?: number;
    left?: number;
    right?: number;
    top?: number;
    bottom?: number;
  }) {
    this.position = options?.position ?? { x: 0, y: 0, z: 0 };
    this.orientation = options?.orientation ?? { x: 0, y: 0, z: 0, w: 1 };
    this.projectionMode = options?.projectionMode ?? 'perspective';
    this.fov = options?.fov ?? Math.PI / 4;
    this.aspect = options?.aspect ?? 16 / 9;
    this.near = options?.near ?? 0.1;
    this.far = options?.far ?? 1000;
    this.left = options?.left ?? -1;
    this.right = options?.right ?? 1;
    this.top = options?.top ?? 1;
    this.bottom = options?.bottom ?? -1;
  }

  /** Compute the view matrix from camera position and orientation. */
  getViewMatrix(): Mat4 {
    const q = this.orientation;
    const data = new Float64Array(16);

    // Rotation matrix from quaternion (transposed for view matrix)
    const xx = q.x * q.x;
    const yy = q.y * q.y;
    const zz = q.z * q.z;
    const xy = q.x * q.y;
    const xz = q.x * q.z;
    const yz = q.y * q.z;
    const wx = q.w * q.x;
    const wy = q.w * q.y;
    const wz = q.w * q.z;

    // Transposed rotation (inverse for orthonormal)
    const r00 = 1 - 2 * (yy + zz);
    const r01 = 2 * (xy + wz);
    const r02 = 2 * (xz - wy);
    const r10 = 2 * (xy - wz);
    const r11 = 1 - 2 * (xx + zz);
    const r12 = 2 * (yz + wx);
    const r20 = 2 * (xz + wy);
    const r21 = 2 * (yz - wx);
    const r22 = 1 - 2 * (xx + yy);

    // Column-major storage
    data[0] = r00;
    data[1] = r10;
    data[2] = r20;
    data[3] = 0;
    data[4] = r01;
    data[5] = r11;
    data[6] = r21;
    data[7] = 0;
    data[8] = r02;
    data[9] = r12;
    data[10] = r22;
    data[11] = 0;

    // Translation: -R^T * position
    const px = this.position.x;
    const py = this.position.y;
    const pz = this.position.z;
    data[12] = -(r00 * px + r01 * py + r02 * pz);
    data[13] = -(r10 * px + r11 * py + r12 * pz);
    data[14] = -(r20 * px + r21 * py + r22 * pz);
    data[15] = 1;

    return data;
  }

  /** Compute the projection matrix based on the current projection mode. */
  getProjectionMatrix(): Mat4 {
    if (this.projectionMode === 'perspective') {
      return this.perspectiveMatrix();
    }
    return this.orthographicMatrix();
  }

  /** Move the camera by a delta vector. */
  move(delta: Vec3): void {
    this.position = {
      x: this.position.x + delta.x,
      y: this.position.y + delta.y,
      z: this.position.z + delta.z,
    };
  }

  /** Rotate the camera by multiplying a quaternion. */
  rotate(q: Quaternion): void {
    const a = this.orientation;
    this.orientation = {
      w: a.w * q.w - a.x * q.x - a.y * q.y - a.z * q.z,
      x: a.w * q.x + a.x * q.w + a.y * q.z - a.z * q.y,
      y: a.w * q.y - a.x * q.z + a.y * q.w + a.z * q.x,
      z: a.w * q.z + a.x * q.y - a.y * q.x + a.z * q.w,
    };
  }

  /** Orient the camera to look at a target position. */
  lookAt(target: Vec3): void {
    const forward = vec3Normalize(vec3Sub(target, this.position));
    const worldUp: Vec3 = { x: 0, y: 1, z: 0 };
    const right = vec3Normalize(vec3Cross(forward, worldUp));
    const up = vec3Cross(right, forward);

    // Convert rotation matrix to quaternion
    // Matrix rows: right, up, -forward
    const m00 = right.x;
    const m01 = right.y;
    const m02 = right.z;
    const m10 = up.x;
    const m11 = up.y;
    const m12 = up.z;
    const m20 = -forward.x;
    const m21 = -forward.y;
    const m22 = -forward.z;

    const trace = m00 + m11 + m22;
    if (trace > 0) {
      const s = 0.5 / Math.sqrt(trace + 1.0);
      this.orientation = {
        w: 0.25 / s,
        x: (m12 - m21) * s,
        y: (m20 - m02) * s,
        z: (m01 - m10) * s,
      };
    } else if (m00 > m11 && m00 > m22) {
      const s = 2.0 * Math.sqrt(1.0 + m00 - m11 - m22);
      this.orientation = {
        w: (m12 - m21) / s,
        x: 0.25 * s,
        y: (m01 + m10) / s,
        z: (m02 + m20) / s,
      };
    } else if (m11 > m22) {
      const s = 2.0 * Math.sqrt(1.0 + m11 - m00 - m22);
      this.orientation = {
        w: (m20 - m02) / s,
        x: (m01 + m10) / s,
        y: 0.25 * s,
        z: (m12 + m21) / s,
      };
    } else {
      const s = 2.0 * Math.sqrt(1.0 + m22 - m00 - m11);
      this.orientation = {
        w: (m01 - m10) / s,
        x: (m02 + m20) / s,
        y: (m12 + m21) / s,
        z: 0.25 * s,
      };
    }
  }

  private perspectiveMatrix(): Mat4 {
    const data = new Float64Array(16);
    const f = 1.0 / Math.tan(this.fov / 2);
    const rangeInv = 1 / (this.near - this.far);

    data[0] = f / this.aspect;
    data[5] = f;
    data[10] = (this.near + this.far) * rangeInv;
    data[11] = -1;
    data[14] = 2 * this.near * this.far * rangeInv;

    return data;
  }

  private orthographicMatrix(): Mat4 {
    const data = new Float64Array(16);
    const lr = 1 / (this.left - this.right);
    const bt = 1 / (this.bottom - this.top);
    const nf = 1 / (this.near - this.far);

    data[0] = -2 * lr;
    data[5] = -2 * bt;
    data[10] = 2 * nf;
    data[12] = (this.left + this.right) * lr;
    data[13] = (this.top + this.bottom) * bt;
    data[14] = (this.far + this.near) * nf;
    data[15] = 1;

    return data;
  }
}
