// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { Mesh } from '../src/mesh';
import { SceneObject } from '../src/scene-object';

describe('Mesh.createCylinderMesh', () => {
  describe('happy path', () => {
    it('creates a mesh with default parameters (16 radial, 4 height segments)', () => {
      const mesh = Mesh.createCylinderMesh(1, 2);
      // (16+1) verts per ring * (4+1) rings = 85 vertices
      expect(mesh.vertexCount).toBe(85);
      expect(mesh.indexCount).toBe(16 * 4 * 2 * 3); // 16 segs * 4 height * 2 tris * 3 indices
    });

    it('creates correct vertex count for custom parameters', () => {
      const mesh = Mesh.createCylinderMesh(2, 4, { radialSegments: 8, heightSegments: 2 });
      // (8+1) * (2+1) = 27 vertices
      expect(mesh.vertexCount).toBe(27);
      expect(mesh.indexCount).toBe(8 * 2 * 2 * 3);
    });

    it('has vertex positions within expected bounds', () => {
      const radius = 3;
      const height = 5;
      const mesh = Mesh.createCylinderMesh(radius, height);
      const halfH = height / 2;
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const y = mesh.vertices[i * 3 + 1]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(radius + 0.001);
        expect(y).toBeGreaterThanOrEqual(-halfH - 0.001);
        expect(y).toBeLessThanOrEqual(halfH + 0.001);
      }
    });

    it('produces unit-length normal vectors', () => {
      const mesh = Mesh.createCylinderMesh(1, 2);
      for (let i = 0; i < mesh.vertexCount; i++) {
        const nx = mesh.normals[i * 3]!;
        const ny = mesh.normals[i * 3 + 1]!;
        const nz = mesh.normals[i * 3 + 2]!;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        expect(len).toBeCloseTo(1, 4);
      }
    });

    it('has index buffer referencing valid vertices', () => {
      const mesh = Mesh.createCylinderMesh(1, 2);
      for (let i = 0; i < mesh.indexCount; i++) {
        expect(mesh.indices[i]).toBeGreaterThanOrEqual(0);
        expect(mesh.indices[i]).toBeLessThan(mesh.vertexCount);
      }
    });

    it('has normals pointing radially outward (y component is 0)', () => {
      const mesh = Mesh.createCylinderMesh(1, 2);
      for (let i = 0; i < mesh.vertexCount; i++) {
        expect(mesh.normals[i * 3 + 1]).toBeCloseTo(0, 10);
      }
    });
  });

  describe('sad path', () => {
    it('handles zero radius gracefully (produces mesh with zero-radius circle)', () => {
      const mesh = Mesh.createCylinderMesh(0, 2);
      expect(mesh.vertexCount).toBeGreaterThan(0);
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        expect(Math.abs(x)).toBeLessThan(0.001);
        expect(Math.abs(z)).toBeLessThan(0.001);
      }
    });

    it('handles negative height gracefully (uses absolute value)', () => {
      const mesh = Mesh.createCylinderMesh(1, -3);
      const halfH = 1.5;
      for (let i = 0; i < mesh.vertexCount; i++) {
        const y = mesh.vertices[i * 3 + 1]!;
        expect(y).toBeGreaterThanOrEqual(-halfH - 0.001);
        expect(y).toBeLessThanOrEqual(halfH + 0.001);
      }
    });

    it('handles negative radius gracefully (uses absolute value)', () => {
      const mesh = Mesh.createCylinderMesh(-2, 4);
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(2.001);
      }
    });

    it('clamps radialSegments to minimum 3', () => {
      const mesh = Mesh.createCylinderMesh(1, 2, { radialSegments: 1 });
      // Should use 3 segments: (3+1) * (4+1) = 20 vertices
      expect(mesh.vertexCount).toBe(20);
    });

    it('clamps heightSegments to minimum 1', () => {
      const mesh = Mesh.createCylinderMesh(1, 2, { heightSegments: 0 });
      // 1 height segment: (16+1) * 2 = 34 vertices
      expect(mesh.vertexCount).toBe(34);
    });

    it('handles very large segment count without crashing', () => {
      const mesh = Mesh.createCylinderMesh(1, 2, { radialSegments: 256, heightSegments: 64 });
      expect(mesh.vertexCount).toBe(257 * 65);
      expect(mesh.indexCount).toBe(256 * 64 * 2 * 3);
    });

    it('minimum radialSegments=3 produces valid geometry', () => {
      const mesh = Mesh.createCylinderMesh(1, 2, { radialSegments: 3 });
      // (3+1) * (4+1) = 20
      expect(mesh.vertexCount).toBe(20);
      for (let i = 0; i < mesh.indexCount; i++) {
        expect(mesh.indices[i]).toBeLessThan(mesh.vertexCount);
      }
    });
  });
});

describe('SceneObject.renderMode', () => {
  it('defaults to triangles', () => {
    const obj = new SceneObject('test');
    expect(obj.renderMode).toBe('triangles');
  });

  it('can be set to lines', () => {
    const obj = new SceneObject('test');
    obj.renderMode = 'lines';
    expect(obj.renderMode).toBe('lines');
  });

  it('can be toggled between modes', () => {
    const obj = new SceneObject('test');
    obj.renderMode = 'lines';
    expect(obj.renderMode).toBe('lines');
    obj.renderMode = 'triangles';
    expect(obj.renderMode).toBe('triangles');
  });
});
