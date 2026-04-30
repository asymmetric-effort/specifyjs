// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import {
  vec2,
  vec2Add,
  vec2Sub,
  vec2Scale,
  vec2Dot,
  vec2Length,
  vec2Normalize,
  vec2Dist,
  vec2Lerp,
  vec3,
  vec3Add,
  vec3Sub,
  vec3Scale,
  vec3Dot,
  vec3Cross,
  vec3Length,
  vec3Normalize,
} from '../../../src/math/index';

describe('Vec2', () => {
  it('should create a Vec2 with given x and y', () => {
    const v = vec2(3, 4);
    expect(v.x).toBe(3);
    expect(v.y).toBe(4);
  });

  it('should create a zero Vec2', () => {
    const v = vec2(0, 0);
    expect(v.x).toBe(0);
    expect(v.y).toBe(0);
  });

  it('should add two Vec2 vectors', () => {
    const result = vec2Add(vec2(1, 2), vec2(3, 4));
    expect(result.x).toBe(4);
    expect(result.y).toBe(6);
  });

  it('should subtract two Vec2 vectors', () => {
    const result = vec2Sub(vec2(5, 7), vec2(2, 3));
    expect(result.x).toBe(3);
    expect(result.y).toBe(4);
  });

  it('should scale a Vec2 by a scalar', () => {
    const result = vec2Scale(vec2(3, 4), 2);
    expect(result.x).toBe(6);
    expect(result.y).toBe(8);
  });

  it('should scale a Vec2 by zero', () => {
    const result = vec2Scale(vec2(3, 4), 0);
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
  });

  it('should scale a Vec2 by a negative scalar', () => {
    const result = vec2Scale(vec2(3, 4), -1);
    expect(result.x).toBe(-3);
    expect(result.y).toBe(-4);
  });

  it('should compute the dot product of two Vec2 vectors', () => {
    expect(vec2Dot(vec2(1, 2), vec2(3, 4))).toBe(11);
  });

  it('should return 0 for dot product of perpendicular Vec2 vectors', () => {
    expect(vec2Dot(vec2(1, 0), vec2(0, 1))).toBe(0);
  });

  it('should compute the length of a Vec2', () => {
    expect(vec2Length(vec2(3, 4))).toBe(5);
  });

  it('should return 0 for the length of a zero Vec2', () => {
    expect(vec2Length(vec2(0, 0))).toBe(0);
  });

  it('should normalize a Vec2 to unit length', () => {
    const n = vec2Normalize(vec2(3, 4));
    expect(n.x).toBeCloseTo(0.6);
    expect(n.y).toBeCloseTo(0.8);
    expect(vec2Length(n)).toBeCloseTo(1);
  });

  it('should return zero vector when normalizing a zero Vec2', () => {
    const n = vec2Normalize(vec2(0, 0));
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
  });

  it('should compute the distance between two Vec2 points', () => {
    expect(vec2Dist(vec2(0, 0), vec2(3, 4))).toBe(5);
  });

  it('should return 0 for distance between identical Vec2 points', () => {
    expect(vec2Dist(vec2(7, 8), vec2(7, 8))).toBe(0);
  });

  it('should lerp at t=0 returning the first Vec2', () => {
    const result = vec2Lerp(vec2(1, 2), vec2(5, 6), 0);
    expect(result.x).toBe(1);
    expect(result.y).toBe(2);
  });

  it('should lerp at t=1 returning the second Vec2', () => {
    const result = vec2Lerp(vec2(1, 2), vec2(5, 6), 1);
    expect(result.x).toBe(5);
    expect(result.y).toBe(6);
  });

  it('should lerp at t=0.5 returning the midpoint', () => {
    const result = vec2Lerp(vec2(0, 0), vec2(10, 20), 0.5);
    expect(result.x).toBe(5);
    expect(result.y).toBe(10);
  });

  it('should handle NaN components in Vec2', () => {
    const v = vec2(NaN, 1);
    expect(vec2Length(v)).toBeNaN();
  });

  it('should handle Infinity components in Vec2', () => {
    const v = vec2(Infinity, 0);
    expect(vec2Length(v)).toBe(Infinity);
  });

  it('should handle negative components in Vec2 operations', () => {
    const result = vec2Add(vec2(-3, -4), vec2(-1, -2));
    expect(result.x).toBe(-4);
    expect(result.y).toBe(-6);
  });
});

describe('Vec3', () => {
  it('should create a Vec3 with given x, y, and z', () => {
    const v = vec3(1, 2, 3);
    expect(v.x).toBe(1);
    expect(v.y).toBe(2);
    expect(v.z).toBe(3);
  });

  it('should add two Vec3 vectors', () => {
    const result = vec3Add(vec3(1, 2, 3), vec3(4, 5, 6));
    expect(result.x).toBe(5);
    expect(result.y).toBe(7);
    expect(result.z).toBe(9);
  });

  it('should subtract two Vec3 vectors', () => {
    const result = vec3Sub(vec3(4, 5, 6), vec3(1, 2, 3));
    expect(result.x).toBe(3);
    expect(result.y).toBe(3);
    expect(result.z).toBe(3);
  });

  it('should scale a Vec3 by a scalar', () => {
    const result = vec3Scale(vec3(1, 2, 3), 3);
    expect(result.x).toBe(3);
    expect(result.y).toBe(6);
    expect(result.z).toBe(9);
  });

  it('should compute the dot product of two Vec3 vectors', () => {
    expect(vec3Dot(vec3(1, 2, 3), vec3(4, 5, 6))).toBe(32);
  });

  it('should return 0 for dot product of perpendicular Vec3 vectors', () => {
    expect(vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0))).toBe(0);
  });

  it('should compute the cross product of two Vec3 vectors', () => {
    const result = vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0));
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(1);
  });

  it('should return zero vector for cross product of parallel Vec3 vectors', () => {
    const result = vec3Cross(vec3(2, 4, 6), vec3(1, 2, 3));
    expect(result.x).toBe(0);
    expect(result.y).toBe(0);
    expect(result.z).toBe(0);
  });

  it('should compute the length of a Vec3', () => {
    expect(vec3Length(vec3(2, 3, 6))).toBe(7);
  });

  it('should return 0 for the length of a zero Vec3', () => {
    expect(vec3Length(vec3(0, 0, 0))).toBe(0);
  });

  it('should normalize a Vec3 to unit length', () => {
    const n = vec3Normalize(vec3(0, 0, 5));
    expect(n.x).toBeCloseTo(0);
    expect(n.y).toBeCloseTo(0);
    expect(n.z).toBeCloseTo(1);
    expect(vec3Length(n)).toBeCloseTo(1);
  });

  it('should return zero vector when normalizing a zero Vec3', () => {
    const n = vec3Normalize(vec3(0, 0, 0));
    expect(n.x).toBe(0);
    expect(n.y).toBe(0);
    expect(n.z).toBe(0);
  });

  it('should handle NaN components in Vec3', () => {
    const v = vec3(1, NaN, 3);
    expect(vec3Length(v)).toBeNaN();
  });

  it('should handle Infinity components in Vec3', () => {
    const v = vec3(Infinity, 0, 0);
    expect(vec3Length(v)).toBe(Infinity);
  });

  it('should handle negative components in Vec3 operations', () => {
    const result = vec3Add(vec3(-1, -2, -3), vec3(-4, -5, -6));
    expect(result.x).toBe(-5);
    expect(result.y).toBe(-7);
    expect(result.z).toBe(-9);
  });
});
