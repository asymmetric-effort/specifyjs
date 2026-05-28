// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { SceneObject } from '../src/scene-object';
import { Mesh } from '../src/mesh';

describe('SceneObject.boundingRadius', () => {
  it('defaults to undefined', () => {
    const obj = new SceneObject('test');
    expect(obj.boundingRadius).toBeUndefined();
  });

  it('can be set manually', () => {
    const obj = new SceneObject('test');
    obj.boundingRadius = 5;
    expect(obj.boundingRadius).toBe(5);
  });
});

describe('SceneObject.computeBoundingRadius', () => {
  it('returns 0 for object with no mesh', () => {
    const obj = new SceneObject('empty');
    const r = obj.computeBoundingRadius();
    expect(r).toBe(0);
    expect(obj.boundingRadius).toBe(0);
  });

  it('computes radius from unit box mesh', () => {
    const obj = new SceneObject('box');
    obj.mesh = Mesh.createBox(2, 2, 2);
    const r = obj.computeBoundingRadius();
    // Box corners are at (1,1,1) distance = sqrt(3) ≈ 1.732
    expect(r).toBeGreaterThan(1.7);
    expect(r).toBeLessThan(1.75);
    expect(obj.boundingRadius).toBe(r);
  });

  it('computes radius from sphere mesh', () => {
    const obj = new SceneObject('sphere');
    obj.mesh = Mesh.createSphere(3, 12, 12);
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(2.9);
    expect(r).toBeLessThanOrEqual(3.01);
  });

  it('accounts for scale', () => {
    const obj = new SceneObject('scaled');
    obj.mesh = Mesh.createBox(1, 1, 1);
    obj.scale = { x: 2, y: 2, z: 2 };
    const r = obj.computeBoundingRadius();
    // Box corners at 0.5 from origin, scale 2x = radius ~= sqrt(3)*0.5*2
    const unscaled = new SceneObject('unscaled');
    unscaled.mesh = Mesh.createBox(1, 1, 1);
    const rUnscaled = unscaled.computeBoundingRadius();
    expect(r).toBeCloseTo(rUnscaled * 2, 5);
  });

  it('uses max scale axis for non-uniform scale', () => {
    const obj = new SceneObject('nonuniform');
    obj.mesh = Mesh.createBox(1, 1, 1);
    obj.scale = { x: 1, y: 5, z: 1 };
    const r = obj.computeBoundingRadius();
    const unit = new SceneObject('unit');
    unit.mesh = Mesh.createBox(1, 1, 1);
    const rUnit = unit.computeBoundingRadius();
    expect(r).toBeCloseTo(rUnit * 5, 5);
  });

  it('handles negative scale', () => {
    const obj = new SceneObject('negscale');
    obj.mesh = Mesh.createBox(1, 1, 1);
    obj.scale = { x: -3, y: 1, z: 1 };
    const r = obj.computeBoundingRadius();
    expect(r).toBeGreaterThan(0);
    const unit = new SceneObject('unit');
    unit.mesh = Mesh.createBox(1, 1, 1);
    const rUnit = unit.computeBoundingRadius();
    expect(r).toBeCloseTo(rUnit * 3, 5);
  });
});
