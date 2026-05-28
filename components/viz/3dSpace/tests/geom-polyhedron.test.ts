// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  createGeomPolyhedron,
  tetrahedronGeometry,
  cubeGeometry,
  octahedronGeometry,
  dodecahedronGeometry,
  icosahedronGeometry,
} from '../src/geom-polyhedron';
import type { PolyhedronGeometry, GeomPolyhedronConfig } from '../src/geom-polyhedron';

describe('Platonic solid geometries', () => {
  it('tetrahedron has 4 vertices and 4 faces', () => {
    const g = tetrahedronGeometry();
    expect(g.vertices.length).toBe(4);
    expect(g.faces.length).toBe(4);
    for (const f of g.faces) {
      expect(f.vertices.length).toBe(3);
    }
  });

  it('cube has 8 vertices and 6 faces', () => {
    const g = cubeGeometry();
    expect(g.vertices.length).toBe(8);
    expect(g.faces.length).toBe(6);
    for (const f of g.faces) {
      expect(f.vertices.length).toBe(4);
    }
  });

  it('octahedron has 6 vertices and 8 faces', () => {
    const g = octahedronGeometry();
    expect(g.vertices.length).toBe(6);
    expect(g.faces.length).toBe(8);
    for (const f of g.faces) {
      expect(f.vertices.length).toBe(3);
    }
  });

  it('dodecahedron has 20 vertices and 12 faces', () => {
    const g = dodecahedronGeometry();
    expect(g.vertices.length).toBe(20);
    expect(g.faces.length).toBe(12);
    for (const f of g.faces) {
      expect(f.vertices.length).toBe(5);
    }
  });

  it('icosahedron has 12 vertices and 20 faces', () => {
    const g = icosahedronGeometry();
    expect(g.vertices.length).toBe(12);
    expect(g.faces.length).toBe(20);
    for (const f of g.faces) {
      expect(f.vertices.length).toBe(3);
    }
  });

  it('all Platonic solids have valid face indices', () => {
    const solids = [
      tetrahedronGeometry(),
      cubeGeometry(),
      octahedronGeometry(),
      dodecahedronGeometry(),
      icosahedronGeometry(),
    ];
    for (const g of solids) {
      for (const f of g.faces) {
        for (const idx of f.vertices) {
          expect(idx).toBeGreaterThanOrEqual(0);
          expect(idx).toBeLessThan(g.vertices.length);
        }
      }
    }
  });
});

describe('createGeomPolyhedron', () => {
  const defaultConfig: GeomPolyhedronConfig = {
    geometry: tetrahedronGeometry(),
    surfaceColor: { r: 0, g: 0.5, b: 1, a: 1 },
  };

  describe('happy path', () => {
    it('creates a SceneObject with correct ID', () => {
      const obj = createGeomPolyhedron('poly-1', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.id).toBe('poly-1');
    });

    it('sets position correctly', () => {
      const obj = createGeomPolyhedron('p', { x: 1, y: 2, z: 3 }, defaultConfig);
      expect(obj.position.x).toBe(1);
      expect(obj.position.y).toBe(2);
      expect(obj.position.z).toBe(3);
    });

    it('tetrahedron mesh has correct triangle count (4 faces * 1 tri each)', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, defaultConfig);
      // 4 triangular faces → 4 triangles → 12 indices
      expect(obj.mesh!.indexCount).toBe(12);
    });

    it('cube mesh has correct triangle count (6 faces * 2 tris each)', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        geometry: cubeGeometry(),
      });
      // 6 quad faces → 12 triangles → 36 indices
      expect(obj.mesh!.indexCount).toBe(36);
    });

    it('dodecahedron mesh has correct triangle count (12 faces * 3 tris each)', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        geometry: dodecahedronGeometry(),
      });
      // 12 pentagonal faces → 36 triangles → 108 indices
      expect(obj.mesh!.indexCount).toBe(108);
    });

    it('sets material color correctly', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.material!.color.r).toBeCloseTo(0);
      expect(obj.material!.color.g).toBeCloseTo(0.5);
      expect(obj.material!.color.b).toBeCloseTo(1);
    });

    it('scale factor applies to vertex positions', () => {
      const scale = 3;
      const objUnscaled = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, defaultConfig);
      const objScaled = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        scale,
      });
      const meshU = objUnscaled.mesh!;
      const meshS = objScaled.mesh!;
      expect(meshU.vertexCount).toBe(meshS.vertexCount);
      // Scaled vertices should be approximately scale * unscaled
      for (let i = 0; i < meshU.vertices.length; i++) {
        expect(meshS.vertices[i]).toBeCloseTo(meshU.vertices[i]! * scale, 5);
      }
    });

    it('creates label child when label is provided', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Tetra',
      });
      expect(obj.children.length).toBe(1);
      expect(obj.children[0]!.id).toBe('p-label');
      expect(obj.children[0]!.label).toBe('Tetra');
    });

    it('does not create label when label is omitted', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, defaultConfig);
      expect(obj.children.length).toBe(0);
    });

    it('does not create label when label is empty string', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: '',
      });
      expect(obj.children.length).toBe(0);
    });

    it('label child uses custom textColor', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Test',
        textColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      expect(obj.children[0]!.material!.color.r).toBe(1);
    });

    it('label child uses default white textColor', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        label: 'Test',
      });
      const c = obj.children[0]!.material!.color;
      expect(c.r).toBe(1);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
    });

    it('normals are unit length for all faces', () => {
      const solids = [
        tetrahedronGeometry(),
        cubeGeometry(),
        octahedronGeometry(),
        dodecahedronGeometry(),
        icosahedronGeometry(),
      ];
      for (const g of solids) {
        const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
          geometry: g,
          surfaceColor: { r: 1, g: 1, b: 1, a: 1 },
        });
        const mesh = obj.mesh!;
        for (let i = 0; i < mesh.vertexCount; i++) {
          const nx = mesh.normals[i * 3]!;
          const ny = mesh.normals[i * 3 + 1]!;
          const nz = mesh.normals[i * 3 + 2]!;
          const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
          expect(len).toBeCloseTo(1, 3);
        }
      }
    });

    it('all indices reference valid vertices', () => {
      const solids = [
        tetrahedronGeometry(),
        cubeGeometry(),
        octahedronGeometry(),
        dodecahedronGeometry(),
        icosahedronGeometry(),
      ];
      for (const g of solids) {
        const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
          geometry: g,
          surfaceColor: { r: 1, g: 1, b: 1, a: 1 },
        });
        const mesh = obj.mesh!;
        for (let i = 0; i < mesh.indexCount; i++) {
          expect(mesh.indices[i]).toBeGreaterThanOrEqual(0);
          expect(mesh.indices[i]).toBeLessThan(mesh.vertexCount);
        }
      }
    });

    it('custom geometry from JSON-like input works', () => {
      const geometry: PolyhedronGeometry = {
        vertices: [
          { x: 0, y: 1, z: 0 },
          { x: -1, y: -1, z: 1 },
          { x: 1, y: -1, z: 1 },
          { x: 1, y: -1, z: -1 },
          { x: -1, y: -1, z: -1 },
        ],
        faces: [
          { vertices: [0, 1, 2] },
          { vertices: [0, 2, 3] },
          { vertices: [0, 3, 4] },
          { vertices: [0, 4, 1] },
          { vertices: [1, 4, 3, 2] },
        ],
      };
      const obj = createGeomPolyhedron('custom', { x: 0, y: 0, z: 0 }, {
        geometry,
        surfaceColor: { r: 1, g: 1, b: 1, a: 1 },
      });
      expect(obj.mesh).toBeDefined();
      // 4 triangular faces + 1 quad face = 4 + 2 = 6 triangles → 18 indices
      expect(obj.mesh!.indexCount).toBe(18);
    });

    it('all 5 Platonic solids create renderable meshes', () => {
      const geometries = [
        tetrahedronGeometry(),
        cubeGeometry(),
        octahedronGeometry(),
        dodecahedronGeometry(),
        icosahedronGeometry(),
      ];
      for (const g of geometries) {
        const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
          geometry: g,
          surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
        });
        expect(obj.mesh).toBeDefined();
        expect(obj.mesh!.vertexCount).toBeGreaterThan(0);
        expect(obj.mesh!.indexCount).toBeGreaterThan(0);
      }
    });
  });

  describe('sad path', () => {
    it('handles empty vertices array', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        geometry: { vertices: [], faces: [{ vertices: [0, 1, 2] }] },
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      // Faces reference out-of-bounds vertices, so they are skipped
      expect(obj.mesh!.indexCount).toBe(0);
    });

    it('handles empty faces array', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        geometry: { vertices: [{ x: 0, y: 0, z: 0 }], faces: [] },
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      expect(obj.mesh!.indexCount).toBe(0);
      expect(obj.mesh!.vertexCount).toBe(0);
    });

    it('handles face referencing out-of-bounds vertex index', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }],
          faces: [{ vertices: [0, 1, 99] }], // 99 is out of bounds
        },
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      // Face should be skipped
      expect(obj.mesh!.indexCount).toBe(0);
    });

    it('handles degenerate face with fewer than 3 vertices', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }],
          faces: [{ vertices: [0, 1] }], // only 2 vertices
        },
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      expect(obj.mesh!.indexCount).toBe(0);
    });

    it('handles zero scale', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        scale: 0,
      });
      expect(obj.mesh).toBeDefined();
      // All vertices should be at origin
      for (let i = 0; i < obj.mesh!.vertices.length; i++) {
        expect(obj.mesh!.vertices[i]).toBeCloseTo(0, 5);
      }
    });

    it('handles negative scale', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        scale: -2,
      });
      const objPos = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        scale: 2,
      });
      // Negative scale flips vertices
      expect(obj.mesh!.vertexCount).toBe(objPos.mesh!.vertexCount);
    });

    it('handles face with negative vertex index', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        geometry: {
          vertices: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 }, { x: 0, y: 1, z: 0 }],
          faces: [{ vertices: [-1, 0, 1] }],
        },
        surfaceColor: { r: 1, g: 0, b: 0, a: 1 },
      });
      expect(obj.mesh!.indexCount).toBe(0);
    });

    it('default scale is 1.0', () => {
      const obj = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, defaultConfig);
      const objExplicit = createGeomPolyhedron('p', { x: 0, y: 0, z: 0 }, {
        ...defaultConfig,
        scale: 1,
      });
      for (let i = 0; i < obj.mesh!.vertices.length; i++) {
        expect(obj.mesh!.vertices[i]).toBeCloseTo(objExplicit.mesh!.vertices[i]!, 10);
      }
    });
  });
});
