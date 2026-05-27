// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Vec3 } from '../../../math/src/vec';
import type { Color } from './types';
import { Mesh } from './mesh';
import { SceneObject } from './scene-object';
import { createMaterial } from './material';

/** A single face of a polyhedron, defined by indices into the vertex array. */
export interface PolyhedronFace {
  /** Indices into the vertices array (ordered, convex polygon). */
  vertices: number[];
}

/** Geometry descriptor for a polyhedron: vertices and faces. */
export interface PolyhedronGeometry {
  /** Vertex positions in local space. */
  vertices: Vec3[];
  /** Face definitions. */
  faces: PolyhedronFace[];
}

/** Configuration for creating a geometry polyhedron. */
export interface GeomPolyhedronConfig {
  /** Polyhedron geometry descriptor. */
  geometry: PolyhedronGeometry;
  /** Uniform scale factor. Default: 1.0. */
  scale?: number;
  /** Surface color (base albedo). */
  surfaceColor: Color;
  /** Optional billboard text label. */
  label?: string;
  /** Text color for the label. Default: white. */
  textColor?: Color;
  /** Label font size relative to scale. Default: 0.3. */
  labelScale?: number;
}

/**
 * Create a SceneObject with a solid polyhedron mesh and optional billboard label.
 *
 * @param id - Unique SceneObject identifier.
 * @param position - Initial position in world space.
 * @param config - Polyhedron geometry and visual configuration.
 * @returns A SceneObject ready to add to a SceneGraph.
 */
export function createGeomPolyhedron(
  id: string,
  position: Vec3,
  config: GeomPolyhedronConfig,
): SceneObject {
  const scale = config.scale ?? 1.0;
  const geometry = config.geometry;

  // Validate and triangulate
  const triVertices: number[] = [];
  const triNormals: number[] = [];
  const triIndices: number[] = [];

  let vertexIdx = 0;

  for (const face of geometry.faces) {
    if (face.vertices.length < 3) continue;

    // Validate indices
    const validFace = face.vertices.every(
      (idx) => idx >= 0 && idx < geometry.vertices.length,
    );
    if (!validFace) continue;

    // Compute face normal from first 3 vertices
    const v0 = geometry.vertices[face.vertices[0]!]!;
    const v1 = geometry.vertices[face.vertices[1]!]!;
    const v2 = geometry.vertices[face.vertices[2]!]!;

    const e1x = (v1.x - v0.x) * scale;
    const e1y = (v1.y - v0.y) * scale;
    const e1z = (v1.z - v0.z) * scale;
    const e2x = (v2.x - v0.x) * scale;
    const e2y = (v2.y - v0.y) * scale;
    const e2z = (v2.z - v0.z) * scale;

    let nx = e1y * e2z - e1z * e2y;
    let ny = e1z * e2x - e1x * e2z;
    let nz = e1x * e2y - e1y * e2x;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      nx /= len;
      ny /= len;
      nz /= len;
    }

    // Fan triangulation for convex faces
    const baseIdx = vertexIdx;
    for (let i = 0; i < face.vertices.length; i++) {
      const v = geometry.vertices[face.vertices[i]!]!;
      triVertices.push(v.x * scale, v.y * scale, v.z * scale);
      triNormals.push(nx, ny, nz);
      vertexIdx++;
    }

    for (let i = 1; i < face.vertices.length - 1; i++) {
      triIndices.push(baseIdx, baseIdx + i, baseIdx + i + 1);
    }
  }

  const mesh = new Mesh(
    new Float32Array(triVertices),
    new Float32Array(triNormals),
    new Uint32Array(triIndices),
  );

  const obj = new SceneObject(id);
  obj.position = { x: position.x, y: position.y, z: position.z };
  obj.mesh = mesh;
  obj.material = createMaterial(config.surfaceColor);

  // Label child (same pattern as GeomSphere)
  if (config.label && config.label.length > 0) {
    const labelObj = new SceneObject(`${id}-label`);
    labelObj.position = { x: 0, y: 0, z: 0 };
    const textColor = config.textColor ?? { r: 1, g: 1, b: 1, a: 1 };
    labelObj.material = createMaterial(textColor);
    const _labelScale = config.labelScale ?? 0.3;
    obj.addChild(labelObj);
  }

  return obj;
}

// ── Preset geometries (Platonic solids) ─────────────────────────────

/** Regular tetrahedron (4 triangular faces). */
export function tetrahedronGeometry(): PolyhedronGeometry {
  const a = 1;
  return {
    vertices: [
      { x: a, y: a, z: a },
      { x: a, y: -a, z: -a },
      { x: -a, y: a, z: -a },
      { x: -a, y: -a, z: a },
    ],
    faces: [
      { vertices: [0, 1, 2] },
      { vertices: [0, 3, 1] },
      { vertices: [0, 2, 3] },
      { vertices: [1, 3, 2] },
    ],
  };
}

/** Cube / hexahedron (6 square faces). */
export function cubeGeometry(): PolyhedronGeometry {
  const a = 1;
  return {
    vertices: [
      { x: -a, y: -a, z: -a }, // 0
      { x: a, y: -a, z: -a },  // 1
      { x: a, y: a, z: -a },   // 2
      { x: -a, y: a, z: -a },  // 3
      { x: -a, y: -a, z: a },  // 4
      { x: a, y: -a, z: a },   // 5
      { x: a, y: a, z: a },    // 6
      { x: -a, y: a, z: a },   // 7
    ],
    faces: [
      { vertices: [0, 3, 2, 1] }, // front (z-)
      { vertices: [4, 5, 6, 7] }, // back (z+)
      { vertices: [3, 7, 6, 2] }, // top (y+)
      { vertices: [0, 1, 5, 4] }, // bottom (y-)
      { vertices: [1, 2, 6, 5] }, // right (x+)
      { vertices: [0, 4, 7, 3] }, // left (x-)
    ],
  };
}

/** Regular octahedron (8 triangular faces). */
export function octahedronGeometry(): PolyhedronGeometry {
  const a = 1;
  return {
    vertices: [
      { x: a, y: 0, z: 0 },   // 0: +X
      { x: -a, y: 0, z: 0 },  // 1: -X
      { x: 0, y: a, z: 0 },   // 2: +Y
      { x: 0, y: -a, z: 0 },  // 3: -Y
      { x: 0, y: 0, z: a },   // 4: +Z
      { x: 0, y: 0, z: -a },  // 5: -Z
    ],
    faces: [
      { vertices: [0, 2, 4] },
      { vertices: [0, 4, 3] },
      { vertices: [0, 3, 5] },
      { vertices: [0, 5, 2] },
      { vertices: [1, 4, 2] },
      { vertices: [1, 3, 4] },
      { vertices: [1, 5, 3] },
      { vertices: [1, 2, 5] },
    ],
  };
}

/** Regular dodecahedron (12 pentagonal faces). */
export function dodecahedronGeometry(): PolyhedronGeometry {
  const phi = (1 + Math.sqrt(5)) / 2; // golden ratio
  const invPhi = 1 / phi;

  const vertices: Vec3[] = [
    // Cube vertices
    { x: 1, y: 1, z: 1 },     // 0
    { x: 1, y: 1, z: -1 },    // 1
    { x: 1, y: -1, z: 1 },    // 2
    { x: 1, y: -1, z: -1 },   // 3
    { x: -1, y: 1, z: 1 },    // 4
    { x: -1, y: 1, z: -1 },   // 5
    { x: -1, y: -1, z: 1 },   // 6
    { x: -1, y: -1, z: -1 },  // 7
    // XY plane rectangles
    { x: 0, y: phi, z: invPhi },   // 8
    { x: 0, y: phi, z: -invPhi },  // 9
    { x: 0, y: -phi, z: invPhi },  // 10
    { x: 0, y: -phi, z: -invPhi }, // 11
    // XZ plane rectangles
    { x: invPhi, y: 0, z: phi },   // 12
    { x: -invPhi, y: 0, z: phi },  // 13
    { x: invPhi, y: 0, z: -phi },  // 14
    { x: -invPhi, y: 0, z: -phi }, // 15
    // YZ plane rectangles
    { x: phi, y: invPhi, z: 0 },   // 16
    { x: phi, y: -invPhi, z: 0 },  // 17
    { x: -phi, y: invPhi, z: 0 },  // 18
    { x: -phi, y: -invPhi, z: 0 }, // 19
  ];

  const faces: PolyhedronFace[] = [
    { vertices: [0, 8, 4, 13, 12] },
    { vertices: [0, 12, 2, 17, 16] },
    { vertices: [0, 16, 1, 9, 8] },
    { vertices: [1, 16, 17, 3, 14] },
    { vertices: [1, 14, 15, 5, 9] },
    { vertices: [2, 12, 13, 6, 10] },
    { vertices: [2, 10, 11, 3, 17] },
    { vertices: [3, 11, 7, 15, 14] },
    { vertices: [4, 8, 9, 5, 18] },
    { vertices: [4, 18, 19, 6, 13] },
    { vertices: [5, 15, 7, 19, 18] },
    { vertices: [6, 19, 7, 11, 10] },
  ];

  return { vertices, faces };
}

/** Regular icosahedron (20 triangular faces). */
export function icosahedronGeometry(): PolyhedronGeometry {
  const phi = (1 + Math.sqrt(5)) / 2;

  const vertices: Vec3[] = [
    { x: 0, y: 1, z: phi },
    { x: 0, y: 1, z: -phi },
    { x: 0, y: -1, z: phi },
    { x: 0, y: -1, z: -phi },
    { x: 1, y: phi, z: 0 },
    { x: 1, y: -phi, z: 0 },
    { x: -1, y: phi, z: 0 },
    { x: -1, y: -phi, z: 0 },
    { x: phi, y: 0, z: 1 },
    { x: phi, y: 0, z: -1 },
    { x: -phi, y: 0, z: 1 },
    { x: -phi, y: 0, z: -1 },
  ];

  const faces: PolyhedronFace[] = [
    { vertices: [0, 2, 8] },
    { vertices: [0, 8, 4] },
    { vertices: [0, 4, 6] },
    { vertices: [0, 6, 10] },
    { vertices: [0, 10, 2] },
    { vertices: [1, 9, 3] },
    { vertices: [1, 4, 9] },
    { vertices: [1, 6, 4] },
    { vertices: [1, 11, 6] },
    { vertices: [1, 3, 11] },
    { vertices: [2, 5, 8] },
    { vertices: [2, 7, 5] },
    { vertices: [2, 10, 7] },
    { vertices: [3, 9, 5] },
    { vertices: [3, 5, 7] },
    { vertices: [3, 7, 11] },
    { vertices: [4, 8, 9] },
    { vertices: [5, 9, 8] },
    { vertices: [6, 11, 10] },
    { vertices: [7, 10, 11] },
  ];

  return { vertices, faces };
}
