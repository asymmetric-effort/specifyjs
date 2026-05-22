// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot,
  vec2Length, vec2Normalize, vec2Dist, vec2Lerp,
  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot,
  vec3Cross, vec3Length, vec3Normalize,
} from '../src/vec';

const EPS = 1e-10;

function near(a: number, b: number, eps = EPS): void {
  expect(Math.abs(a - b)).toBeLessThan(eps);
}

describe('Vec2', () => {
  describe('vec2', () => {
    it('should create a Vec2 with given x and y', () => {
      const v = vec2(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });

    it('should handle negative values', () => {
      const v = vec2(-1, -2);
      expect(v.x).toBe(-1);
      expect(v.y).toBe(-2);
    });

    it('should handle zero', () => {
      const v = vec2(0, 0);
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });
  });

  describe('vec2Add', () => {
    it('should add two vectors', () => {
      const r = vec2Add(vec2(1, 2), vec2(3, 4));
      expect(r.x).toBe(4);
      expect(r.y).toBe(6);
    });

    it('should handle adding zero vector', () => {
      const r = vec2Add(vec2(5, 7), vec2(0, 0));
      expect(r.x).toBe(5);
      expect(r.y).toBe(7);
    });

    it('should handle negative values', () => {
      const r = vec2Add(vec2(1, 2), vec2(-3, -4));
      expect(r.x).toBe(-2);
      expect(r.y).toBe(-2);
    });
  });

  describe('vec2Sub', () => {
    it('should subtract two vectors', () => {
      const r = vec2Sub(vec2(5, 7), vec2(2, 3));
      expect(r.x).toBe(3);
      expect(r.y).toBe(4);
    });

    it('should return zero when subtracting same vector', () => {
      const v = vec2(3, 4);
      const r = vec2Sub(v, v);
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
    });
  });

  describe('vec2Scale', () => {
    it('should scale a vector', () => {
      const r = vec2Scale(vec2(2, 3), 4);
      expect(r.x).toBe(8);
      expect(r.y).toBe(12);
    });

    it('should handle scale by zero', () => {
      const r = vec2Scale(vec2(5, 7), 0);
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
    });

    it('should handle negative scale', () => {
      const r = vec2Scale(vec2(2, 3), -1);
      expect(r.x).toBe(-2);
      expect(r.y).toBe(-3);
    });
  });

  describe('vec2Dot', () => {
    it('should compute dot product', () => {
      // 1*3 + 2*4 = 11
      near(vec2Dot(vec2(1, 2), vec2(3, 4)), 11);
    });

    it('should return 0 for perpendicular vectors', () => {
      near(vec2Dot(vec2(1, 0), vec2(0, 1)), 0);
    });

    it('should return squared length for self dot', () => {
      const v = vec2(3, 4);
      near(vec2Dot(v, v), 25);
    });
  });

  describe('vec2Length', () => {
    it('should compute length', () => {
      near(vec2Length(vec2(3, 4)), 5);
    });

    it('should return 0 for zero vector', () => {
      near(vec2Length(vec2(0, 0)), 0);
    });

    it('should return 1 for unit vectors', () => {
      near(vec2Length(vec2(1, 0)), 1);
      near(vec2Length(vec2(0, 1)), 1);
    });
  });

  describe('vec2Normalize', () => {
    it('should normalize a vector to unit length', () => {
      const r = vec2Normalize(vec2(3, 4));
      near(r.x, 0.6);
      near(r.y, 0.8);
      near(vec2Length(r), 1);
    });

    it('should return zero vector for zero input', () => {
      const r = vec2Normalize(vec2(0, 0));
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
    });

    it('should handle already-normalized vectors', () => {
      const r = vec2Normalize(vec2(1, 0));
      near(r.x, 1);
      near(r.y, 0);
    });

    it('should handle very large values', () => {
      const r = vec2Normalize(vec2(1e15, 0));
      near(r.x, 1);
      near(r.y, 0);
    });
  });

  describe('vec2Dist', () => {
    it('should compute distance between two points', () => {
      near(vec2Dist(vec2(0, 0), vec2(3, 4)), 5);
    });

    it('should return 0 for same point', () => {
      near(vec2Dist(vec2(5, 5), vec2(5, 5)), 0);
    });

    it('should be symmetric', () => {
      const a = vec2(1, 2);
      const b = vec2(4, 6);
      near(vec2Dist(a, b), vec2Dist(b, a));
    });
  });

  describe('vec2Lerp', () => {
    it('should return a at t=0', () => {
      const a = vec2(1, 2);
      const b = vec2(5, 6);
      const r = vec2Lerp(a, b, 0);
      near(r.x, 1);
      near(r.y, 2);
    });

    it('should return b at t=1', () => {
      const a = vec2(1, 2);
      const b = vec2(5, 6);
      const r = vec2Lerp(a, b, 1);
      near(r.x, 5);
      near(r.y, 6);
    });

    it('should return midpoint at t=0.5', () => {
      const a = vec2(0, 0);
      const b = vec2(10, 20);
      const r = vec2Lerp(a, b, 0.5);
      near(r.x, 5);
      near(r.y, 10);
    });

    it('should handle extrapolation (t > 1)', () => {
      const a = vec2(0, 0);
      const b = vec2(10, 10);
      const r = vec2Lerp(a, b, 2);
      near(r.x, 20);
      near(r.y, 20);
    });
  });
});

describe('Vec3', () => {
  describe('vec3', () => {
    it('should create a Vec3 with given x, y, z', () => {
      const v = vec3(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });

  describe('vec3Add', () => {
    it('should add two vectors', () => {
      const r = vec3Add(vec3(1, 2, 3), vec3(4, 5, 6));
      expect(r.x).toBe(5);
      expect(r.y).toBe(7);
      expect(r.z).toBe(9);
    });

    it('should handle zero vector', () => {
      const r = vec3Add(vec3(1, 2, 3), vec3(0, 0, 0));
      expect(r.x).toBe(1);
      expect(r.y).toBe(2);
      expect(r.z).toBe(3);
    });
  });

  describe('vec3Sub', () => {
    it('should subtract two vectors', () => {
      const r = vec3Sub(vec3(5, 7, 9), vec3(1, 2, 3));
      expect(r.x).toBe(4);
      expect(r.y).toBe(5);
      expect(r.z).toBe(6);
    });

    it('should return zero for same vector', () => {
      const v = vec3(3, 4, 5);
      const r = vec3Sub(v, v);
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
      expect(r.z).toBe(0);
    });
  });

  describe('vec3Scale', () => {
    it('should scale a vector', () => {
      const r = vec3Scale(vec3(1, 2, 3), 3);
      expect(r.x).toBe(3);
      expect(r.y).toBe(6);
      expect(r.z).toBe(9);
    });

    it('should handle scale by zero', () => {
      const r = vec3Scale(vec3(5, 7, 9), 0);
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
      expect(r.z).toBe(0);
    });
  });

  describe('vec3Dot', () => {
    it('should compute dot product', () => {
      // 1*4 + 2*5 + 3*6 = 32
      near(vec3Dot(vec3(1, 2, 3), vec3(4, 5, 6)), 32);
    });

    it('should return 0 for perpendicular vectors', () => {
      near(vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0)), 0);
    });
  });

  describe('vec3Cross', () => {
    it('should compute cross product of basis vectors', () => {
      // x cross y = z
      const r = vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0));
      near(r.x, 0);
      near(r.y, 0);
      near(r.z, 1);
    });

    it('should return zero for parallel vectors', () => {
      const r = vec3Cross(vec3(1, 0, 0), vec3(2, 0, 0));
      near(r.x, 0);
      near(r.y, 0);
      near(r.z, 0);
    });

    it('should be anti-commutative', () => {
      const a = vec3(1, 2, 3);
      const b = vec3(4, 5, 6);
      const ab = vec3Cross(a, b);
      const ba = vec3Cross(b, a);
      near(ab.x, -ba.x);
      near(ab.y, -ba.y);
      near(ab.z, -ba.z);
    });
  });

  describe('vec3Length', () => {
    it('should compute length', () => {
      // sqrt(1+4+4) = 3
      near(vec3Length(vec3(1, 2, 2)), 3);
    });

    it('should return 0 for zero vector', () => {
      near(vec3Length(vec3(0, 0, 0)), 0);
    });
  });

  describe('vec3Normalize', () => {
    it('should normalize a vector to unit length', () => {
      const r = vec3Normalize(vec3(0, 3, 4));
      near(r.x, 0);
      near(r.y, 0.6);
      near(r.z, 0.8);
      near(vec3Length(r), 1);
    });

    it('should return zero vector for zero input', () => {
      const r = vec3Normalize(vec3(0, 0, 0));
      expect(r.x).toBe(0);
      expect(r.y).toBe(0);
      expect(r.z).toBe(0);
    });

    it('should handle very large values', () => {
      const r = vec3Normalize(vec3(1e15, 0, 0));
      near(r.x, 1);
      near(r.y, 0);
      near(r.z, 0);
    });
  });
});
