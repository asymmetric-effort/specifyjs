// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import {
  mat4Identity,
  mat4Multiply,
  mat4Transpose,
  mat4Inverse,
  mat4Translate,
  mat4Scale,
  mat4RotateX,
  mat4RotateY,
  mat4RotateZ,
  mat4Perspective,
  mat4Orthographic,
  mat4LookAt,
  mat4FromQuaternion,
  mat4TransformVec3,
  mat4TransformDirection,
} from '../src/mat4';
import { vec3 } from '../src/vec';
import { quatIdentity, quatFromAxisAngle, quatNormalize } from '../src/quaternion';

const EPS = 1e-10;

/** Assert two numbers are approximately equal. */
function near(a: number, b: number, eps = EPS): void {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

/** Assert two Mat4 arrays are approximately equal element-wise. */
function mat4Near(a: Float64Array, b: Float64Array, eps = EPS): void {
  expect(a.length).toBe(16);
  expect(b.length).toBe(16);
  for (let i = 0; i < 16; i++) {
    expect(Math.abs(a[i]! - b[i]!)).toBeLessThan(eps);
  }
}

describe('Mat4', () => {
  describe('mat4Identity', () => {
    it('should create a 16-element Float64Array', () => {
      const m = mat4Identity();
      expect(m).toBeInstanceOf(Float64Array);
      expect(m.length).toBe(16);
    });

    it('should have 1s on the diagonal and 0s elsewhere', () => {
      const m = mat4Identity();
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          const expected = col === row ? 1 : 0;
          expect(m[col * 4 + row]).toBe(expected);
        }
      }
    });

    it('should not modify points when multiplied (identity property)', () => {
      const m = mat4Identity();
      const p = vec3(3, -7, 12);
      const result = mat4TransformVec3(m, p);
      near(result.x, 3);
      near(result.y, -7);
      near(result.z, 12);
    });
  });

  describe('mat4Multiply', () => {
    it('should return identity when multiplying identity * identity', () => {
      const I = mat4Identity();
      const result = mat4Multiply(I, I);
      mat4Near(result, I);
    });

    it('should return M when multiplying identity * M', () => {
      const I = mat4Identity();
      const M = mat4Translate(I, vec3(1, 2, 3));
      mat4Near(mat4Multiply(I, M), M);
    });

    it('should return M when multiplying M * identity', () => {
      const I = mat4Identity();
      const M = mat4Scale(I, vec3(2, 3, 4));
      mat4Near(mat4Multiply(M, I), M);
    });

    it('should be associative: (A*B)*C = A*(B*C)', () => {
      const A = mat4Translate(mat4Identity(), vec3(1, 2, 3));
      const B = mat4Scale(mat4Identity(), vec3(2, 2, 2));
      const C = mat4RotateX(mat4Identity(), Math.PI / 4);

      const AB_C = mat4Multiply(mat4Multiply(A, B), C);
      const A_BC = mat4Multiply(A, mat4Multiply(B, C));
      mat4Near(AB_C, A_BC);
    });
  });

  describe('mat4Transpose', () => {
    it('should swap rows and columns', () => {
      const m = mat4Translate(mat4Identity(), vec3(5, 6, 7));
      const t = mat4Transpose(m);
      for (let col = 0; col < 4; col++) {
        for (let row = 0; row < 4; row++) {
          near(t[col * 4 + row]!, m[row * 4 + col]!);
        }
      }
    });

    it('should be its own inverse: transpose(transpose(M)) = M', () => {
      const m = mat4RotateZ(mat4Identity(), 1.23);
      mat4Near(mat4Transpose(mat4Transpose(m)), m);
    });

    it('should leave identity unchanged', () => {
      mat4Near(mat4Transpose(mat4Identity()), mat4Identity());
    });
  });

  describe('mat4Inverse', () => {
    it('should return identity for identity inverse', () => {
      const inv = mat4Inverse(mat4Identity());
      expect(inv).not.toBeNull();
      mat4Near(inv!, mat4Identity());
    });

    it('should satisfy M * M^-1 = I', () => {
      const M = mat4Translate(
        mat4RotateY(mat4Scale(mat4Identity(), vec3(2, 3, 4)), 0.5),
        vec3(10, -5, 3),
      );
      const inv = mat4Inverse(M);
      expect(inv).not.toBeNull();
      mat4Near(mat4Multiply(M, inv!), mat4Identity());
    });

    it('should satisfy M^-1 * M = I', () => {
      const M = mat4RotateX(mat4Translate(mat4Identity(), vec3(1, 2, 3)), Math.PI / 3);
      const inv = mat4Inverse(M);
      expect(inv).not.toBeNull();
      mat4Near(mat4Multiply(inv!, M), mat4Identity());
    });

    it('should return null for a singular matrix', () => {
      const m = new Float64Array(16); // all zeros
      expect(mat4Inverse(m)).toBeNull();
    });
  });

  describe('mat4Translate', () => {
    it('should add translation to the last column', () => {
      const m = mat4Translate(mat4Identity(), vec3(5, 10, 15));
      near(m[12]!, 5);
      near(m[13]!, 10);
      near(m[14]!, 15);
    });

    it('should transform the origin to the translation vector', () => {
      const m = mat4Translate(mat4Identity(), vec3(3, 4, 5));
      const p = mat4TransformVec3(m, vec3(0, 0, 0));
      near(p.x, 3);
      near(p.y, 4);
      near(p.z, 5);
    });
  });

  describe('mat4Scale', () => {
    it('should scale a point', () => {
      const m = mat4Scale(mat4Identity(), vec3(2, 3, 4));
      const p = mat4TransformVec3(m, vec3(1, 1, 1));
      near(p.x, 2);
      near(p.y, 3);
      near(p.z, 4);
    });

    it('should not affect w component', () => {
      const m = mat4Scale(mat4Identity(), vec3(5, 5, 5));
      near(m[15]!, 1);
    });
  });

  describe('mat4RotateX', () => {
    it('should rotate (0,1,0) to (0,0,1) by PI/2', () => {
      const m = mat4RotateX(mat4Identity(), Math.PI / 2);
      const p = mat4TransformVec3(m, vec3(0, 1, 0));
      near(p.x, 0);
      near(p.y, 0);
      near(p.z, 1);
    });

    it('should leave x axis unchanged', () => {
      const m = mat4RotateX(mat4Identity(), 1.5);
      const p = mat4TransformVec3(m, vec3(1, 0, 0));
      near(p.x, 1);
      near(p.y, 0);
      near(p.z, 0);
    });
  });

  describe('mat4RotateY', () => {
    it('should rotate (0,0,1) to (1,0,0) by PI/2', () => {
      const m = mat4RotateY(mat4Identity(), Math.PI / 2);
      const p = mat4TransformVec3(m, vec3(0, 0, 1));
      near(p.x, 1);
      near(p.y, 0);
      near(p.z, 0, 1e-9);
    });

    it('should leave y axis unchanged', () => {
      const m = mat4RotateY(mat4Identity(), 2.0);
      const p = mat4TransformVec3(m, vec3(0, 1, 0));
      near(p.x, 0);
      near(p.y, 1);
      near(p.z, 0);
    });
  });

  describe('mat4RotateZ', () => {
    it('should rotate (1,0,0) to (0,1,0) by PI/2', () => {
      const m = mat4RotateZ(mat4Identity(), Math.PI / 2);
      const p = mat4TransformVec3(m, vec3(1, 0, 0));
      near(p.x, 0);
      near(p.y, 1);
      near(p.z, 0);
    });

    it('should leave z axis unchanged', () => {
      const m = mat4RotateZ(mat4Identity(), 0.7);
      const p = mat4TransformVec3(m, vec3(0, 0, 1));
      near(p.x, 0);
      near(p.y, 0);
      near(p.z, 1);
    });
  });

  describe('mat4Perspective', () => {
    it('should map a point on the near plane to z=-1 in NDC', () => {
      const fov = Math.PI / 4;
      const aspect = 1;
      const nearPlane = 0.1;
      const farPlane = 100;
      const m = mat4Perspective(fov, aspect, nearPlane, farPlane);

      // A point at (0, 0, -near) in view space
      const p = mat4TransformVec3(m, vec3(0, 0, -nearPlane));
      near(p.z, -1, 1e-6);
    });

    it('should map a point on the far plane to z=1 in NDC', () => {
      const fov = Math.PI / 4;
      const aspect = 1;
      const nearPlane = 0.1;
      const farPlane = 100;
      const m = mat4Perspective(fov, aspect, nearPlane, farPlane);

      const p = mat4TransformVec3(m, vec3(0, 0, -farPlane));
      near(p.z, 1, 1e-6);
    });

    it('should produce a matrix with -1 at index 11', () => {
      const m = mat4Perspective(Math.PI / 3, 16 / 9, 1, 1000);
      expect(m[11]).toBe(-1);
    });

    it('should have 0 at index 15 (no affine component)', () => {
      const m = mat4Perspective(Math.PI / 4, 1, 0.1, 100);
      expect(m[15]).toBe(0);
    });
  });

  describe('mat4Orthographic', () => {
    it('should produce correct diagonal elements', () => {
      const m = mat4Orthographic(-1, 1, -1, 1, 0.1, 100);
      near(m[0]!, 1);
      near(m[5]!, 1);
      near(m[15]!, 1);
    });

    it('should map the center of the box to the origin', () => {
      const m = mat4Orthographic(-10, 10, -5, 5, 1, 100);
      const center = vec3(0, 0, -50.5);
      const p = mat4TransformVec3(m, center);
      near(p.x, 0);
      near(p.y, 0);
    });
  });

  describe('mat4LookAt', () => {
    it('should produce identity-like result when looking down -Z from origin', () => {
      const m = mat4LookAt(vec3(0, 0, 0), vec3(0, 0, -1), vec3(0, 1, 0));
      // The upper-left 3x3 should be close to identity
      near(m[0]!, 1);
      near(m[5]!, 1);
      near(m[10]!, 1);
    });

    it('should place the eye at the origin in view space', () => {
      const eye = vec3(5, 3, 8);
      const m = mat4LookAt(eye, vec3(0, 0, 0), vec3(0, 1, 0));
      const p = mat4TransformVec3(m, eye);
      near(p.x, 0);
      near(p.y, 0);
      near(p.z, 0);
    });

    it('should map the target to a point on the -Z axis in view space', () => {
      const eye = vec3(0, 0, 5);
      const target = vec3(0, 0, 0);
      const m = mat4LookAt(eye, target, vec3(0, 1, 0));
      const p = mat4TransformVec3(m, target);
      near(p.x, 0);
      near(p.y, 0);
      expect(p.z).toBeLessThan(0);
    });
  });

  describe('mat4FromQuaternion', () => {
    it('should produce identity matrix from identity quaternion', () => {
      const m = mat4FromQuaternion(quatIdentity());
      mat4Near(m, mat4Identity());
    });

    it('should produce the same rotation as mat4RotateX', () => {
      const angle = Math.PI / 3;
      const q = quatFromAxisAngle(vec3(1, 0, 0), angle);
      const mq = mat4FromQuaternion(q);
      const mr = mat4RotateX(mat4Identity(), angle);
      mat4Near(mq, mr);
    });

    it('should produce the same rotation as mat4RotateY', () => {
      const angle = 1.2;
      const q = quatFromAxisAngle(vec3(0, 1, 0), angle);
      const mq = mat4FromQuaternion(q);
      const mr = mat4RotateY(mat4Identity(), angle);
      mat4Near(mq, mr);
    });

    it('should produce the same rotation as mat4RotateZ', () => {
      const angle = -0.7;
      const q = quatFromAxisAngle(vec3(0, 0, 1), angle);
      const mq = mat4FromQuaternion(q);
      const mr = mat4RotateZ(mat4Identity(), angle);
      mat4Near(mq, mr);
    });
  });

  describe('mat4TransformVec3', () => {
    it('should apply translation to a point', () => {
      const m = mat4Translate(mat4Identity(), vec3(10, 20, 30));
      const p = mat4TransformVec3(m, vec3(1, 2, 3));
      near(p.x, 11);
      near(p.y, 22);
      near(p.z, 33);
    });

    it('should chain scale then translate correctly', () => {
      const s = mat4Scale(mat4Identity(), vec3(2, 2, 2));
      const t = mat4Translate(mat4Identity(), vec3(5, 0, 0));
      const m = mat4Multiply(t, s); // translate after scale
      const p = mat4TransformVec3(m, vec3(1, 0, 0));
      near(p.x, 7); // 1*2 + 5
      near(p.y, 0);
      near(p.z, 0);
    });
  });

  describe('mat4TransformDirection', () => {
    it('should ignore translation', () => {
      const m = mat4Translate(mat4Identity(), vec3(100, 200, 300));
      const d = mat4TransformDirection(m, vec3(1, 0, 0));
      near(d.x, 1);
      near(d.y, 0);
      near(d.z, 0);
    });

    it('should apply rotation', () => {
      const m = mat4RotateZ(mat4Identity(), Math.PI / 2);
      const d = mat4TransformDirection(m, vec3(1, 0, 0));
      near(d.x, 0);
      near(d.y, 1);
      near(d.z, 0);
    });

    it('should apply scale', () => {
      const m = mat4Scale(mat4Identity(), vec3(3, 1, 1));
      const d = mat4TransformDirection(m, vec3(1, 0, 0));
      near(d.x, 3);
      near(d.y, 0);
      near(d.z, 0);
    });
  });

  describe('projection pipeline', () => {
    it('should transform a point through model-view-projection', () => {
      // Model: translate a point
      const model = mat4Translate(mat4Identity(), vec3(0, 0, -5));
      // View: camera at origin looking down -Z
      const view = mat4LookAt(vec3(0, 0, 0), vec3(0, 0, -1), vec3(0, 1, 0));
      // Projection: perspective
      const proj = mat4Perspective(Math.PI / 4, 1, 0.1, 100);

      const mvp = mat4Multiply(proj, mat4Multiply(view, model));

      // Transform origin through the pipeline
      const p = mat4TransformVec3(mvp, vec3(0, 0, 0));

      // Point at (0,0,-5) should end up at (0,0,something) in NDC
      near(p.x, 0);
      near(p.y, 0);
      // z should be between -1 and 1
      expect(p.z).toBeGreaterThan(-1);
      expect(p.z).toBeLessThan(1);
    });
  });
});
