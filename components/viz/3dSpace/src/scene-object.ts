// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { Mat4, Quaternion } from './types';
import type { Mesh } from './mesh';
import type { Material } from './material';

/**
 * Base scene object that consumers can extend.
 * Maintains a transform (position, rotation, scale) and a parent/child hierarchy.
 */
export class SceneObject {
  readonly id: string;
  position: Vec3;
  rotation: Quaternion;
  scale: Vec3;
  mesh?: Mesh;
  material?: Material;
  children: SceneObject[];
  parent: SceneObject | null;
  visible: boolean;

  constructor(id: string) {
    this.id = id;
    this.position = { x: 0, y: 0, z: 0 };
    this.rotation = { x: 0, y: 0, z: 0, w: 1 };
    this.scale = { x: 1, y: 1, z: 1 };
    this.children = [];
    this.parent = null;
    this.visible = true;
  }

  /** Add a child object. Sets the child's parent reference. */
  addChild(obj: SceneObject): void {
    if (obj.parent) {
      obj.parent.removeChild(obj);
    }
    obj.parent = this;
    this.children.push(obj);
  }

  /** Remove a child object by reference. Clears the child's parent reference. */
  removeChild(obj: SceneObject): void {
    const idx = this.children.indexOf(obj);
    if (idx !== -1) {
      this.children.splice(idx, 1);
      obj.parent = null;
    }
  }

  /**
   * Compute the world matrix by composing own transform with parent chain.
   * Uses iterative traversal up the parent chain.
   */
  getWorldMatrix(): Mat4 {
    // Collect transforms from this node up to the root
    const chain: SceneObject[] = [];
    let current: SceneObject | null = this;
    while (current !== null) {
      chain.push(current);
      current = current.parent;
    }

    // Start with identity and multiply from root down to this node
    const result = new Float64Array(16);
    result[0] = 1;
    result[5] = 1;
    result[10] = 1;
    result[15] = 1;

    // Process from root (end of chain) down to this node (start of chain)
    for (let i = chain.length - 1; i >= 0; i--) {
      const node = chain[i]!;
      const local = composeLocalMatrix(node.position, node.rotation, node.scale);
      multiplyMat4InPlace(result, local);
    }

    return result;
  }
}

/** Compose a local transform matrix from position, rotation (quaternion), and scale. */
function composeLocalMatrix(pos: Vec3, q: Quaternion, s: Vec3): Float64Array {
  const m = new Float64Array(16);

  // Rotation from quaternion
  const xx = q.x * q.x;
  const yy = q.y * q.y;
  const zz = q.z * q.z;
  const xy = q.x * q.y;
  const xz = q.x * q.z;
  const yz = q.y * q.z;
  const wx = q.w * q.x;
  const wy = q.w * q.y;
  const wz = q.w * q.z;

  m[0] = (1 - 2 * (yy + zz)) * s.x;
  m[1] = 2 * (xy + wz) * s.x;
  m[2] = 2 * (xz - wy) * s.x;
  m[3] = 0;

  m[4] = 2 * (xy - wz) * s.y;
  m[5] = (1 - 2 * (xx + zz)) * s.y;
  m[6] = 2 * (yz + wx) * s.y;
  m[7] = 0;

  m[8] = 2 * (xz + wy) * s.z;
  m[9] = 2 * (yz - wx) * s.z;
  m[10] = (1 - 2 * (xx + yy)) * s.z;
  m[11] = 0;

  m[12] = pos.x;
  m[13] = pos.y;
  m[14] = pos.z;
  m[15] = 1;

  return m;
}

/** Multiply two 4x4 matrices: result = result * b (in-place on result). */
function multiplyMat4InPlace(result: Float64Array, b: Float64Array): void {
  const tmp = new Float64Array(16);
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      let sum = 0;
      for (let k = 0; k < 4; k++) {
        sum += result[row + k * 4]! * b[k + col * 4]!;
      }
      tmp[row + col * 4] = sum;
    }
  }
  result.set(tmp);
}
