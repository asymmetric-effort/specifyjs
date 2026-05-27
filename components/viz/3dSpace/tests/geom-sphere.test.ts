// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { createGeomSphere } from '../src/geom-sphere';
import type { GeomSphereConfig } from '../src/geom-sphere';

describe('createGeomSphere', () => {
  const defaultConfig: GeomSphereConfig = {
    radius: 1,
    surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
  };

  describe('happy path', () => {
    it('creates a SceneObject with correct ID', () => {
      const obj = createGeomSphere('sphere-1', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.id).toBe('sphere-1');
    });

    it('sets position correctly', () => {
      const pos = { x: 3, y: 5, z: -2 };
      const obj = createGeomSphere('s', pos, defaultConfig);
      expect(obj.position.x).toBe(3);
      expect(obj.position.y).toBe(5);
      expect(obj.position.z).toBe(-2);
    });

    it('creates sphere mesh with correct vertex count for default segments=24', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, defaultConfig);
      // createSphere(radius, stacks=24, slices=24) → (24+1)*(24+1) = 625 vertices
      expect(obj.mesh!.vertexCount).toBe(625);
    });

    it('creates sphere mesh with custom segment count', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        segments: 8,
      });
      // createSphere(radius, stacks=8, slices=8) → (8+1)*(8+1) = 81 vertices
      expect(obj.mesh!.vertexCount).toBe(81);
    });

    it('sets material color to surfaceColor', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        radius: 1,
        surfaceColor: { r: 0.2, g: 0.4, b: 0.6, a: 0.8 },
      });
      expect(obj.material!.color.r).toBeCloseTo(0.2);
      expect(obj.material!.color.g).toBeCloseTo(0.4);
      expect(obj.material!.color.b).toBeCloseTo(0.6);
      expect(obj.material!.color.a).toBeCloseTo(0.8);
    });

    it('creates label child when label is provided', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Hello',
      });
      expect(obj.children.length).toBe(1);
      expect(obj.children[0]!.id).toBe('s-label');
    });

    it('does not create label child when label is omitted', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.children.length).toBe(0);
    });

    it('does not create label child when label is empty string', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: '',
      });
      expect(obj.children.length).toBe(0);
    });

    it('label child has textColor on material', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Test',
        textColor: { r: 0, g: 1, b: 0, a: 1 },
      });
      expect(obj.children[0]!.material!.color.g).toBe(1);
    });

    it('label child uses default white textColor when not specified', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Test',
      });
      const c = obj.children[0]!.material!.color;
      expect(c.r).toBe(1);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
    });

    it('renderMode defaults to triangles', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.renderMode).toBe('triangles');
    });

    it('mesh vertices are within radius bounds', () => {
      const radius = 2;
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        radius,
        segments: 8,
      });
      const mesh = obj.mesh!;
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const y = mesh.vertices[i * 3 + 1]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + y * y + z * z);
        expect(dist).toBeLessThanOrEqual(radius + 0.001);
      }
    });
  });

  describe('sad path', () => {
    it('handles zero radius', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        radius: 0,
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      expect(obj.mesh).toBeDefined();
      expect(obj.mesh!.vertexCount).toBeGreaterThan(0);
    });

    it('handles negative radius (uses absolute value)', () => {
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        radius: -3,
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
        segments: 8,
      });
      const mesh = obj.mesh!;
      for (let i = 0; i < mesh.vertexCount; i++) {
        const x = mesh.vertices[i * 3]!;
        const y = mesh.vertices[i * 3 + 1]!;
        const z = mesh.vertices[i * 3 + 2]!;
        const dist = Math.sqrt(x * x + y * y + z * z);
        expect(dist).toBeLessThanOrEqual(3.001);
      }
    });

    it('handles very long label without crashing', () => {
      const longLabel = 'A'.repeat(10000);
      const obj = createGeomSphere('s', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: longLabel,
      });
      expect(obj.children.length).toBe(1);
    });
  });
});
