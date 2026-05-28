// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  raySphereIntersect,
  rayAABBIntersect,
  rayCylinderIntersect,
  screenToRay,
  pickObjects,
  RaycastPicker,
} from '../src/raycast';
import type { Ray } from '../src/raycast';
import { SceneObject } from '../src/scene-object';
import { Mesh } from '../src/mesh';
import { createMaterial } from '../src/material';
import { mat4Identity, mat4Multiply, mat4Perspective, mat4LookAt } from '../../../../components/math/src/mat4';
import { vec3 } from '../../../../components/math/src/vec';

describe('raySphereIntersect', () => {
  it('returns distance for a direct hit', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 1);
    expect(t).not.toBeNull();
    expect(t!).toBeCloseTo(9, 5); // 10 - 1 = 9
  });

  it('returns null for a miss', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 100, y: 0, z: 0 }, 1);
    expect(t).toBeNull();
  });

  it('returns null when sphere is behind ray origin', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: 1 } }; // pointing away
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 1);
    expect(t).toBeNull();
  });

  it('returns 0 when ray origin is inside sphere', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 5);
    expect(t).not.toBeNull();
    // Origin inside sphere: nearest intersection is behind, return exit point
    expect(t!).toBeGreaterThanOrEqual(0);
  });

  it('returns distance for tangent hit', () => {
    // Ray just grazing the sphere
    const ray: Ray = { origin: { x: 1, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 1);
    // tangent: discriminant = 0
    expect(t).not.toBeNull();
  });

  it('returns distance for off-center hit', () => {
    const ray: Ray = { origin: { x: 0.5, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 2);
    expect(t).not.toBeNull();
    expect(t!).toBeGreaterThan(0);
    expect(t!).toBeLessThan(10);
  });

  it('handles large radius', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 100 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 50);
    expect(t).not.toBeNull();
    expect(t!).toBeCloseTo(50, 5);
  });

  it('handles zero radius (point)', () => {
    // Zero radius sphere = point, nearly impossible to hit with a ray
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = raySphereIntersect(ray, { x: 0, y: 0, z: 0 }, 0);
    // Discriminant = 0 for exact hit along axis
    expect(t).not.toBeNull();
  });
});

describe('rayAABBIntersect', () => {
  it('returns distance for a direct hit', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = rayAABBIntersect(ray, { x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 });
    expect(t).not.toBeNull();
    expect(t!).toBeCloseTo(9, 5); // 10 - 1 = 9
  });

  it('returns null for a miss', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const t = rayAABBIntersect(ray, { x: 5, y: 5, z: 5 }, { x: 6, y: 6, z: 6 });
    expect(t).toBeNull();
  });

  it('returns null when box is behind ray', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: 1 } };
    const t = rayAABBIntersect(ray, { x: -1, y: -1, z: -1 }, { x: 1, y: 1, z: 1 });
    expect(t).toBeNull();
  });

  it('returns 0 when origin is inside box', () => {
    const ray: Ray = { origin: { x: 0, y: 0, z: 0 }, direction: { x: 0, y: 0, z: -1 } };
    const t = rayAABBIntersect(ray, { x: -5, y: -5, z: -5 }, { x: 5, y: 5, z: 5 });
    expect(t).not.toBeNull();
    expect(t!).toBe(0);
  });

  it('handles diagonal ray', () => {
    const dir = { x: 1 / Math.sqrt(3), y: 1 / Math.sqrt(3), z: -1 / Math.sqrt(3) };
    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: dir };
    const t = rayAABBIntersect(ray, { x: -5, y: -5, z: -5 }, { x: 5, y: 5, z: 5 });
    expect(t).not.toBeNull();
  });
});

describe('rayCylinderIntersect', () => {
  it('returns distance for hit on vertical cylinder', () => {
    const ray: Ray = { origin: { x: 5, y: 0, z: 0 }, direction: { x: -1, y: 0, z: 0 } };
    const t = rayCylinderIntersect(ray, { x: 0, y: -2, z: 0 }, { x: 0, y: 2, z: 0 }, 1);
    expect(t).not.toBeNull();
    expect(t!).toBeCloseTo(4, 1); // 5 - 1 = 4
  });

  it('returns null for miss', () => {
    const ray: Ray = { origin: { x: 5, y: 10, z: 0 }, direction: { x: -1, y: 0, z: 0 } };
    const t = rayCylinderIntersect(ray, { x: 0, y: -1, z: 0 }, { x: 0, y: 1, z: 0 }, 1);
    expect(t).toBeNull(); // ray above the cylinder
  });

  it('returns null when cylinder is behind ray', () => {
    const ray: Ray = { origin: { x: 5, y: 0, z: 0 }, direction: { x: 1, y: 0, z: 0 } };
    const t = rayCylinderIntersect(ray, { x: 0, y: -2, z: 0 }, { x: 0, y: 2, z: 0 }, 1);
    expect(t).toBeNull();
  });
});

describe('screenToRay', () => {
  it('produces a ray pointing into the scene from screen center', () => {
    // Create a simple view-proj matrix: camera at z=10, looking at origin
    const view = mat4LookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    const proj = mat4Perspective(Math.PI / 4, 800 / 600, 0.1, 1000);
    const vp = mat4Multiply(proj, view);

    const ray = screenToRay(400, 300, 800, 600, vp);
    expect(ray).toBeDefined();
    // Origin should be near camera position
    expect(ray.origin.z).toBeGreaterThan(5);
    // Direction should point toward -Z (into the scene)
    expect(ray.direction.z).toBeLessThan(0);
  });

  it('produces different rays for different screen positions', () => {
    const view = mat4LookAt(vec3(0, 0, 10), vec3(0, 0, 0), vec3(0, 1, 0));
    const proj = mat4Perspective(Math.PI / 4, 800 / 600, 0.1, 1000);
    const vp = mat4Multiply(proj, view);

    const rayCenter = screenToRay(400, 300, 800, 600, vp);
    const rayLeft = screenToRay(0, 300, 800, 600, vp);

    // Different screen positions should produce different ray directions
    expect(rayCenter.direction.x).not.toBeCloseTo(rayLeft.direction.x, 2);
  });
});

describe('pickObjects', () => {
  it('returns closest hit when multiple objects are on the ray', () => {
    const near = new SceneObject('near');
    near.position = { x: 0, y: 0, z: 2 };
    near.boundingRadius = 1;
    near.mesh = Mesh.createSphere(1, 4, 4);
    near.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });

    const far = new SceneObject('far');
    far.position = { x: 0, y: 0, z: -5 };
    far.boundingRadius = 1;
    far.mesh = Mesh.createSphere(1, 4, 4);
    far.material = createMaterial({ r: 0, g: 0, b: 1, a: 1 });

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [far, near]); // far first in array
    expect(hit).not.toBeNull();
    expect(hit!.object.id).toBe('near'); // nearest hit wins
  });

  it('returns null when no objects are hit', () => {
    const obj = new SceneObject('off');
    obj.position = { x: 100, y: 0, z: 0 };
    obj.boundingRadius = 1;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [obj]);
    expect(hit).toBeNull();
  });

  it('skips invisible objects', () => {
    const obj = new SceneObject('hidden');
    obj.position = { x: 0, y: 0, z: 0 };
    obj.boundingRadius = 1;
    obj.visible = false;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [obj]);
    expect(hit).toBeNull();
  });

  it('uses world position for child objects', () => {
    const parent = new SceneObject('parent');
    parent.position = { x: 0, y: 0, z: 0 };

    const child = new SceneObject('child');
    child.position = { x: 5, y: 0, z: 0 };
    child.boundingRadius = 1;
    parent.addChild(child);

    // Ray aimed at x=5 should hit the child
    const ray: Ray = { origin: { x: 5, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [child]);
    expect(hit).not.toBeNull();
    expect(hit!.object.id).toBe('child');
  });

  it('returns correct distance', () => {
    const obj = new SceneObject('test');
    obj.position = { x: 0, y: 0, z: 0 };
    obj.boundingRadius = 2;

    const ray: Ray = { origin: { x: 0, y: 0, z: 10 }, direction: { x: 0, y: 0, z: -1 } };
    const hit = pickObjects(ray, [obj]);
    expect(hit).not.toBeNull();
    expect(hit!.distance).toBeCloseTo(8, 1); // 10 - 2 = 8
  });
});

describe('RaycastPicker', () => {
  it('implements ObjectPicker interface', () => {
    const picker = new RaycastPicker();
    expect(typeof picker.pick).toBe('function');
  });

  it('returns the closest hit object', () => {
    const picker = new RaycastPicker();

    const obj = new SceneObject('target');
    obj.position = { x: 0, y: 0, z: 0 };
    obj.boundingRadius = 1;

    const origin = { x: 0, y: 0, z: 10 };
    const direction = { x: 0, y: 0, z: -1 };
    const result = picker.pick(origin, direction, [obj]);
    expect(result).not.toBeNull();
    expect(result!.id).toBe('target');
  });

  it('returns null for no hits', () => {
    const picker = new RaycastPicker();
    const obj = new SceneObject('far');
    obj.position = { x: 100, y: 100, z: 100 };
    obj.boundingRadius = 1;

    const result = picker.pick({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: -1 }, [obj]);
    expect(result).toBeNull();
  });
});
