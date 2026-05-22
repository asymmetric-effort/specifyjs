// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  quatIdentity,
  quatFromAxisAngle,
  quatFromEuler,
  quatMultiply,
  quatConjugate,
  quatInverse,
  quatNormalize,
  quatLength,
  quatDot,
  quatSlerp,
  quatRotateVec3,
  quatToEuler,
  quatLookAt,
} from '../src/quaternion';
import type { Quaternion } from '../src/quaternion';
import { vec3 } from '../src/vec';
import { mat4FromQuaternion, mat4RotateX, mat4RotateY, mat4RotateZ, mat4Identity, mat4TransformVec3 } from '../src/mat4';

const EPS = 1e-10;

function near(a: number, b: number, eps = EPS): void {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

/** Check if two quaternions represent the same rotation (q and -q are equivalent). */
function quatNear(a: Quaternion, b: Quaternion, eps = EPS): void {
  // q and -q represent the same rotation
  const posDiff = Math.abs(a.x - b.x) + Math.abs(a.y - b.y) + Math.abs(a.z - b.z) + Math.abs(a.w - b.w);
  const negDiff = Math.abs(a.x + b.x) + Math.abs(a.y + b.y) + Math.abs(a.z + b.z) + Math.abs(a.w + b.w);
  expect(Math.min(posDiff, negDiff)).toBeLessThan(eps);
}

describe('Quaternion', () => {
  describe('quatIdentity', () => {
    it('should return (0, 0, 0, 1)', () => {
      const q = quatIdentity();
      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
    });

    it('should have unit length', () => {
      near(quatLength(quatIdentity()), 1);
    });

    it('should not rotate a vector', () => {
      const v = vec3(3, -4, 5);
      const r = quatRotateVec3(quatIdentity(), v);
      near(r.x, 3);
      near(r.y, -4);
      near(r.z, 5);
    });
  });

  describe('quatFromAxisAngle', () => {
    it('should create identity for angle=0', () => {
      const q = quatFromAxisAngle(vec3(1, 0, 0), 0);
      quatNear(q, quatIdentity());
    });

    it('should produce a unit quaternion', () => {
      const q = quatFromAxisAngle(vec3(1, 1, 0), Math.PI / 3);
      near(quatLength(q), 1);
    });

    it('should round-trip: axis-angle -> quaternion -> rotate vector', () => {
      // Rotate (1,0,0) 90 degrees around Z axis -> (0,1,0)
      const q = quatFromAxisAngle(vec3(0, 0, 1), Math.PI / 2);
      const r = quatRotateVec3(q, vec3(1, 0, 0));
      near(r.x, 0);
      near(r.y, 1);
      near(r.z, 0);
    });

    it('should handle non-unit axis input', () => {
      const q = quatFromAxisAngle(vec3(0, 0, 5), Math.PI / 2);
      near(quatLength(q), 1);
      const r = quatRotateVec3(q, vec3(1, 0, 0));
      near(r.x, 0);
      near(r.y, 1);
      near(r.z, 0);
    });
  });

  describe('quatFromEuler / quatToEuler', () => {
    it('should round-trip through Euler angles for small rotations', () => {
      const pitch = 0.3;
      const yaw = 0.5;
      const roll = 0.1;
      const q = quatFromEuler(pitch, yaw, roll);
      const euler = quatToEuler(q);
      // quatToEuler returns (roll, pitch, yaw)
      near(euler.x, roll);
      near(euler.y, pitch);
      near(euler.z, yaw);
    });

    it('should round-trip zero Euler angles', () => {
      const q = quatFromEuler(0, 0, 0);
      quatNear(q, quatIdentity());
      const euler = quatToEuler(q);
      near(euler.x, 0);
      near(euler.y, 0);
      near(euler.z, 0);
    });

    it('should handle pure pitch rotation', () => {
      const q = quatFromEuler(0.7, 0, 0);
      const euler = quatToEuler(q);
      near(euler.y, 0.7);
      near(euler.x, 0);
      near(euler.z, 0);
    });
  });

  describe('quatMultiply', () => {
    it('should return q when multiplying identity * q', () => {
      const q = quatFromAxisAngle(vec3(1, 0, 0), 1.0);
      const r = quatMultiply(quatIdentity(), q);
      quatNear(r, q);
    });

    it('should return q when multiplying q * identity', () => {
      const q = quatFromAxisAngle(vec3(0, 1, 0), 0.5);
      const r = quatMultiply(q, quatIdentity());
      quatNear(r, q);
    });

    it('should compose rotations correctly', () => {
      // Rotate 90 deg around Z, then 90 deg around Z = 180 deg around Z
      const q = quatFromAxisAngle(vec3(0, 0, 1), Math.PI / 2);
      const q2 = quatMultiply(q, q);
      const r = quatRotateVec3(q2, vec3(1, 0, 0));
      near(r.x, -1);
      near(r.y, 0);
      near(r.z, 0);
    });
  });

  describe('quatConjugate', () => {
    it('should negate the vector part', () => {
      const q = { x: 1, y: 2, z: 3, w: 4 };
      const c = quatConjugate(q);
      expect(c.x).toBe(-1);
      expect(c.y).toBe(-2);
      expect(c.z).toBe(-3);
      expect(c.w).toBe(4);
    });

    it('should equal the inverse for unit quaternions', () => {
      const q = quatNormalize(quatFromAxisAngle(vec3(1, 1, 1), 1.0));
      const c = quatConjugate(q);
      const inv = quatInverse(q);
      near(c.x, inv.x);
      near(c.y, inv.y);
      near(c.z, inv.z);
      near(c.w, inv.w);
    });
  });

  describe('quatInverse', () => {
    it('should satisfy q * q^-1 = identity', () => {
      const q = quatFromAxisAngle(vec3(1, 2, 3), 0.8);
      const inv = quatInverse(q);
      const result = quatMultiply(q, inv);
      quatNear(result, quatIdentity());
    });

    it('should handle zero quaternion', () => {
      const inv = quatInverse({ x: 0, y: 0, z: 0, w: 0 });
      expect(inv.x).toBe(0);
      expect(inv.y).toBe(0);
      expect(inv.z).toBe(0);
      expect(inv.w).toBe(0);
    });
  });

  describe('quatNormalize', () => {
    it('should produce a unit quaternion', () => {
      const q = quatNormalize({ x: 3, y: 4, z: 0, w: 0 });
      near(quatLength(q), 1);
    });

    it('should handle zero quaternion', () => {
      const q = quatNormalize({ x: 0, y: 0, z: 0, w: 0 });
      expect(q.x).toBe(0);
      expect(q.w).toBe(0);
    });

    it('should not change a unit quaternion', () => {
      const q = quatIdentity();
      const n = quatNormalize(q);
      near(n.x, 0);
      near(n.y, 0);
      near(n.z, 0);
      near(n.w, 1);
    });
  });

  describe('quatLength', () => {
    it('should be 1 for identity', () => {
      near(quatLength(quatIdentity()), 1);
    });

    it('should compute correct length', () => {
      near(quatLength({ x: 1, y: 0, z: 0, w: 0 }), 1);
      near(quatLength({ x: 1, y: 1, z: 1, w: 1 }), 2);
    });
  });

  describe('quatDot', () => {
    it('should be 1 for identity dot identity', () => {
      near(quatDot(quatIdentity(), quatIdentity()), 1);
    });

    it('should compute correct dot product', () => {
      const a = { x: 1, y: 2, z: 3, w: 4 };
      const b = { x: 5, y: 6, z: 7, w: 8 };
      // 1*5 + 2*6 + 3*7 + 4*8 = 5+12+21+32 = 70
      near(quatDot(a, b), 70);
    });
  });

  describe('quatSlerp', () => {
    it('should return a at t=0', () => {
      const a = quatFromAxisAngle(vec3(0, 1, 0), 0);
      const b = quatFromAxisAngle(vec3(0, 1, 0), Math.PI);
      const r = quatSlerp(a, b, 0);
      quatNear(r, a);
    });

    it('should return b at t=1', () => {
      const a = quatFromAxisAngle(vec3(0, 1, 0), 0);
      const b = quatFromAxisAngle(vec3(0, 1, 0), Math.PI / 2);
      const r = quatSlerp(a, b, 1);
      quatNear(r, b);
    });

    it('should interpolate to the midpoint at t=0.5', () => {
      const a = quatFromAxisAngle(vec3(0, 0, 1), 0);
      const b = quatFromAxisAngle(vec3(0, 0, 1), Math.PI / 2);
      const mid = quatSlerp(a, b, 0.5);

      // At t=0.5, should be 45 degrees around Z
      const expected = quatFromAxisAngle(vec3(0, 0, 1), Math.PI / 4);
      quatNear(mid, expected);
    });

    it('should handle nearly identical quaternions', () => {
      const a = quatIdentity();
      const b = quatFromAxisAngle(vec3(1, 0, 0), 1e-8);
      const r = quatSlerp(a, b, 0.5);
      near(quatLength(r), 1, 1e-6);
    });

    it('should negate b when dot product is negative (opposite quaternions)', () => {
      // q and -q represent the same rotation, but slerp should take the short path.
      // Create two quaternions that are nearly opposite (dot < 0).
      const a = quatFromAxisAngle(vec3(0, 1, 0), 0.1);
      // Negate a to get the antipodal quaternion representing the same rotation
      const negA: Quaternion = { x: -a.x, y: -a.y, z: -a.z, w: -a.w };
      const b = quatFromAxisAngle(vec3(0, 1, 0), 0.3);

      // quatDot(negA, b) should be negative since negA is negated
      // This triggers the dot < 0 branch (lines 110-114)
      const r = quatSlerp(negA, b, 0.5);
      near(quatLength(r), 1, 1e-6);

      // The result should be a valid interpolation between the two rotations
      // (same rotation as slerp(a, b, 0.5) since negA == a rotationally)
      const rNormal = quatSlerp(a, b, 0.5);
      quatNear(r, rNormal);
    });

    it('should always produce a unit quaternion', () => {
      const a = quatFromAxisAngle(vec3(1, 0, 0), 0.5);
      const b = quatFromAxisAngle(vec3(0, 1, 0), 1.5);
      for (const t of [0, 0.25, 0.5, 0.75, 1.0]) {
        near(quatLength(quatSlerp(a, b, t)), 1, 1e-6);
      }
    });
  });

  describe('quatRotateVec3', () => {
    it('should rotate (1,0,0) to (0,1,0) by 90 deg around Z', () => {
      const q = quatFromAxisAngle(vec3(0, 0, 1), Math.PI / 2);
      const r = quatRotateVec3(q, vec3(1, 0, 0));
      near(r.x, 0);
      near(r.y, 1);
      near(r.z, 0);
    });

    it('should preserve vector length', () => {
      const q = quatFromAxisAngle(vec3(1, 1, 1), 1.23);
      const v = vec3(3, 4, 5);
      const r = quatRotateVec3(q, v);
      const origLen = Math.sqrt(3 * 3 + 4 * 4 + 5 * 5);
      const newLen = Math.sqrt(r.x * r.x + r.y * r.y + r.z * r.z);
      near(newLen, origLen);
    });

    it('should match mat4 rotation result', () => {
      const angle = 1.5;
      const q = quatFromAxisAngle(vec3(1, 0, 0), angle);
      const m = mat4RotateX(mat4Identity(), angle);
      const v = vec3(0, 1, 0);
      const rq = quatRotateVec3(q, v);
      const rm = mat4TransformVec3(m, v);
      near(rq.x, rm.x);
      near(rq.y, rm.y);
      near(rq.z, rm.z);
    });
  });

  describe('quatToEuler', () => {
    it('should return zeros for identity quaternion', () => {
      const e = quatToEuler(quatIdentity());
      near(e.x, 0);
      near(e.y, 0);
      near(e.z, 0);
    });

    it('should handle 90-degree pitch', () => {
      const q = quatFromEuler(Math.PI / 4, 0, 0);
      const e = quatToEuler(q);
      near(e.y, Math.PI / 4);
    });

    it('should handle gimbal lock when sinp >= 1 (pitch = +PI/2)', () => {
      // Create a quaternion with exact 90-degree pitch to trigger gimbal lock (line 172)
      // sinp = 2*(q.w*q.y - q.z*q.x) should be >= 1
      // For pitch = PI/2: q = (0, sin(PI/4), 0, cos(PI/4)) = (0, sqrt(2)/2, 0, sqrt(2)/2)
      const q: Quaternion = { x: 0, y: Math.SQRT2 / 2, z: 0, w: Math.SQRT2 / 2 };
      const e = quatToEuler(q);
      near(e.y, Math.PI / 2); // pitch should clamp to PI/2
    });

    it('should handle gimbal lock when sinp <= -1 (pitch = -PI/2)', () => {
      // sinp = 2*(q.w*q.y - q.z*q.x) should be <= -1
      const q: Quaternion = { x: 0, y: -Math.SQRT2 / 2, z: 0, w: Math.SQRT2 / 2 };
      const e = quatToEuler(q);
      near(e.y, -Math.PI / 2); // pitch should clamp to -PI/2
    });
  });

  describe('quatLookAt', () => {
    it('should produce identity-like rotation looking down +Z with +Y up', () => {
      const q = quatLookAt(vec3(0, 0, 1), vec3(0, 1, 0));
      // Looking down +Z with +Y up should be close to identity
      const r = quatRotateVec3(q, vec3(0, 0, 1));
      near(r.x, 0);
      near(r.y, 0);
      near(r.z, 1);
    });

    it('should produce a unit quaternion', () => {
      const q = quatLookAt(vec3(1, 0, 0), vec3(0, 1, 0));
      near(quatLength(q), 1, 1e-6);
    });

    it('should rotate the forward direction correctly', () => {
      const forward = vec3(1, 0, 0);
      const q = quatLookAt(forward, vec3(0, 1, 0));
      // Rotating +Z by this quaternion should give us the forward direction
      const r = quatRotateVec3(q, vec3(0, 0, 1));
      near(r.x, forward.x);
      near(r.y, forward.y);
      near(r.z, forward.z);
    });

    it('should handle lookAt where m00 > m11 && m00 > m22 (line 214-221)', () => {
      // forward=(-1,-1,-1), up=(-1,-1,0) produces trace<0 with m00 as largest diagonal
      const q = quatLookAt(vec3(-1, -1, -1), vec3(-1, -1, 0));
      near(quatLength(q), 1, 1e-6);
      // The rotated +Z should point in the normalized forward direction
      const fwd = vec3(-1 / Math.sqrt(3), -1 / Math.sqrt(3), -1 / Math.sqrt(3));
      const r = quatRotateVec3(q, vec3(0, 0, 1));
      near(r.x, fwd.x, 1e-6);
      near(r.y, fwd.y, 1e-6);
      near(r.z, fwd.z, 1e-6);
    });

    it('should handle lookAt where m11 > m22 (line 222-229)', () => {
      // forward=(-1,-1,-1), up=(-1,0,-1) produces trace<0 with m11 as largest diagonal
      const q = quatLookAt(vec3(-1, -1, -1), vec3(-1, 0, -1));
      near(quatLength(q), 1, 1e-6);
      const fwd = vec3(-1 / Math.sqrt(3), -1 / Math.sqrt(3), -1 / Math.sqrt(3));
      const r = quatRotateVec3(q, vec3(0, 0, 1));
      near(r.x, fwd.x, 1e-6);
      near(r.y, fwd.y, 1e-6);
      near(r.z, fwd.z, 1e-6);
    });

    it('should handle lookAt where m22 is largest (else branch, line 230-237)', () => {
      // forward=(-1,-1,0), up=(0,0,-1) produces trace<0 with m22 as largest diagonal
      const q = quatLookAt(vec3(-1, -1, 0), vec3(0, 0, -1));
      near(quatLength(q), 1, 1e-6);
      const fwd = vec3(-1 / Math.sqrt(2), -1 / Math.sqrt(2), 0);
      const r = quatRotateVec3(q, vec3(0, 0, 1));
      near(r.x, fwd.x, 1e-6);
      near(r.y, fwd.y, 1e-6);
      near(r.z, fwd.z, 1e-6);
    });

    it('should handle lookAt with trace > 0 path', () => {
      // A small rotation (trace > 0): looking slightly off +Z
      const q = quatLookAt(vec3(0.1, 0.1, 1), vec3(0, 1, 0));
      near(quatLength(q), 1, 1e-6);
    });
  });

  describe('Mat4 <-> Quaternion consistency', () => {
    it('should produce consistent rotation for an arbitrary axis', () => {
      const axis = vec3(1, 2, 3);
      const angle = 1.1;
      const q = quatFromAxisAngle(axis, angle);
      const m = mat4FromQuaternion(q);

      const testVectors = [
        vec3(1, 0, 0),
        vec3(0, 1, 0),
        vec3(0, 0, 1),
        vec3(1, 2, 3),
        vec3(-5, 0.5, 7),
      ];

      for (const v of testVectors) {
        const rq = quatRotateVec3(q, v);
        const rm = mat4TransformVec3(m, v);
        near(rq.x, rm.x);
        near(rq.y, rm.y);
        near(rq.z, rm.z);
      }
    });

    it('should compose rotations the same way', () => {
      const q1 = quatFromAxisAngle(vec3(1, 0, 0), 0.5);
      const q2 = quatFromAxisAngle(vec3(0, 1, 0), 0.7);
      const qComposed = quatMultiply(q1, q2);
      const mComposed = mat4FromQuaternion(qComposed);

      const v = vec3(1, 2, 3);
      const rq = quatRotateVec3(qComposed, v);
      const rm = mat4TransformVec3(mComposed, v);
      near(rq.x, rm.x);
      near(rq.y, rm.y);
      near(rq.z, rm.z);
    });
  });
});
