// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { Mesh } from '../src/mesh';

describe('Mesh.createCylinderSolid', () => {
  describe('happy path', () => {
    it('creates a mesh with default parameters (24 radial, caps=true)', () => {
      const mesh = Mesh.createCylinderSolid(1, 2);
      // Body: 2 * (24+1) = 50 vertices
      // Bottom cap: 1 + 25 = 26 vertices
      // Top cap: 1 + 25 = 26 vertices
      expect(mesh.vertexCount).toBe(50 + 26 + 26);
      // Body: 24 * 2 triangles = 48 * 3 = 144 indices
      // Caps: 24 * 2 triangles = 48 * 3 = 144 indices
      expect(mesh.indexCount).toBe(144 + 144);
    });

    it('creates correct vertex count without caps', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { caps: false });
      // Body only: 2 * (24+1) = 50
      expect(mesh.vertexCount).toBe(50);
      expect(mesh.indexCount).toBe(24 * 2 * 3);
    });

    it('body vertex positions lie on correct circles', () => {
      const radius = 2;
      const height = 4;
      const mesh = Mesh.createCylinderSolid(radius, height, { caps: false });
      const halfH = height / 2;
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const y = mesh.vertices[i * 3 + 1]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(radius + 0.001);
        expect(Math.abs(y)).toBeLessThanOrEqual(halfH + 0.001);
      }
    });

    it('body normals point radially outward', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { caps: false });
      for (let i = 0; i < mesh.vertexCount; i++) {
        const nx = mesh.normals[i * 3]!;
        const ny = mesh.normals[i * 3 + 1]!;
        const nz = mesh.normals[i * 3 + 2]!;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        expect(len).toBeCloseTo(1, 3);
        // For a straight cylinder (no taper), Y component should be ~0
        expect(Math.abs(ny)).toBeLessThan(0.01);
      }
    });

    it('cap normals point along axis', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { caps: true, radialSegments: 8 });
      // Body: 2 * 9 = 18 vertices
      // Bottom cap: 1 + 9 = 10
      // Top cap: 1 + 9 = 10
      const bodyVerts = 18;
      const capVerts = 10;

      // Bottom cap normals (y = -1)
      for (let i = bodyVerts; i < bodyVerts + capVerts; i++) {
        expect(mesh.normals[i * 3 + 1]).toBeCloseTo(-1, 5);
      }

      // Top cap normals (y = +1)
      for (let i = bodyVerts + capVerts; i < bodyVerts + capVerts * 2; i++) {
        expect(mesh.normals[i * 3 + 1]).toBeCloseTo(1, 5);
      }
    });

    it('index buffer references valid vertices', () => {
      const mesh = Mesh.createCylinderSolid(1, 2);
      for (let i = 0; i < mesh.indexCount; i++) {
        expect(mesh.indices[i]).toBeGreaterThanOrEqual(0);
        expect(mesh.indices[i]).toBeLessThan(mesh.vertexCount);
      }
    });

    it('topRadius=0 produces a cone (top ring at origin)', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { topRadius: 0, caps: false, radialSegments: 8 });
      const topRingStart = 9; // second ring
      for (let i = topRingStart; i < topRingStart + 9; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        expect(Math.abs(x)).toBeLessThan(0.001);
        expect(Math.abs(z)).toBeLessThan(0.001);
      }
    });

    it('topRadius different from radius creates tapered cylinder', () => {
      const botR = 2;
      const topR = 1;
      const mesh = Mesh.createCylinderSolid(botR, 4, { topRadius: topR, caps: false, radialSegments: 8 });
      const vertsPerRing = 9;

      // Check bottom ring radius
      for (let i = 0; i < vertsPerRing; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(botR + 0.001);
      }

      // Check top ring radius
      for (let i = vertsPerRing; i < vertsPerRing * 2; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(topR + 0.001);
      }
    });

    it('normals are unit length for tapered cylinder', () => {
      const mesh = Mesh.createCylinderSolid(2, 4, { topRadius: 0.5, caps: false });
      for (let i = 0; i < mesh.vertexCount; i++) {
        const nx = mesh.normals[i * 3]!;
        const ny = mesh.normals[i * 3 + 1]!;
        const nz = mesh.normals[i * 3 + 2]!;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        expect(len).toBeCloseTo(1, 3);
      }
    });
  });

  describe('sad path', () => {
    it('handles zero radius gracefully', () => {
      const mesh = Mesh.createCylinderSolid(0, 2);
      expect(mesh.vertexCount).toBeGreaterThan(0);
    });

    it('handles negative height gracefully (uses absolute value)', () => {
      const mesh = Mesh.createCylinderSolid(1, -3);
      expect(mesh.vertexCount).toBeGreaterThan(0);
      const halfH = 1.5;
      // Check body vertices (caps: false to simplify)
      const meshNoCaps = Mesh.createCylinderSolid(1, -3, { caps: false });
      for (let i = 0; i < meshNoCaps.vertexCount; i++) {
        const y = meshNoCaps.vertices[i * 3 + 1]!;
        expect(y).toBeGreaterThanOrEqual(-halfH - 0.001);
        expect(y).toBeLessThanOrEqual(halfH + 0.001);
      }
    });

    it('handles negative radius gracefully (uses absolute value)', () => {
      const mesh = Mesh.createCylinderSolid(-2, 4, { caps: false });
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(2.001);
      }
    });

    it('clamps radialSegments to minimum 3', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { radialSegments: 1, caps: false });
      // Body: 2 * (3+1) = 8 vertices
      expect(mesh.vertexCount).toBe(8);
    });

    it('handles very large segment count without crashing', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { radialSegments: 256, caps: false });
      expect(mesh.vertexCount).toBe(2 * 257);
    });

    it('handles height=0 gracefully', () => {
      const mesh = Mesh.createCylinderSolid(1, 0, { caps: false });
      expect(mesh.vertexCount).toBeGreaterThan(0);
      // Both rings should be at y=0
      for (let i = 0; i < mesh.vertexCount; i++) {
        expect(mesh.vertices[i * 3 + 1]).toBeCloseTo(0, 5);
      }
    });

    it('negative topRadius uses absolute value', () => {
      const mesh = Mesh.createCylinderSolid(1, 2, { topRadius: -0.5, caps: false, radialSegments: 8 });
      const vertsPerRing = 9;
      for (let i = vertsPerRing; i < vertsPerRing * 2; i++) {
        const x = mesh.vertices[i * 3]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + z * z);
        expect(dist).toBeLessThanOrEqual(0.501);
      }
    });
  });
});
