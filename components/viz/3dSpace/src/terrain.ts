// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { Mesh } from './mesh';
import type { Color } from './types';

/**
 * Consumer-provided terrain height function.
 * Returns the height (Y value) at a given (x, z) world position.
 */
export type HeightFunction = (x: number, z: number) => number;

/**
 * Consumer-provided terrain color function.
 * Returns the color at a given (x, z) world position based on height.
 * If not provided, a default green-brown gradient based on height is used.
 */
export type TerrainColorFunction = (x: number, z: number, height: number) => Color;

/**
 * Generate a terrain mesh from a consumer-provided height function.
 * Creates a grid of vertices in the XZ plane with Y values from the height function.
 *
 * @param width - Total width of the terrain in world units (X axis)
 * @param depth - Total depth of the terrain in world units (Z axis)
 * @param segmentsX - Number of segments along X
 * @param segmentsZ - Number of segments along Z
 * @param heightFn - Function that returns height at (x, z)
 * @param colorFn - Optional function that returns color at (x, z, height)
 */
export function generateTerrain(
  width: number,
  depth: number,
  segmentsX: number,
  segmentsZ: number,
  heightFn: HeightFunction,
  colorFn?: TerrainColorFunction,
): Mesh {
  const vertsPerRow = segmentsX + 1;
  const vertsPerCol = segmentsZ + 1;
  const vertexCount = vertsPerRow * vertsPerCol;
  const triangleCount = segmentsX * segmentsZ * 2;

  const vertices = new Float32Array(vertexCount * 3);
  const normals = new Float32Array(vertexCount * 3);
  const indices = new Uint32Array(triangleCount * 3);
  const colors = colorFn ? new Float32Array(vertexCount * 4) : undefined;

  const hw = width / 2;
  const hd = depth / 2;
  const stepX = width / segmentsX;
  const stepZ = depth / segmentsZ;

  // Generate vertices
  let vi = 0;
  let ci = 0;
  for (let iz = 0; iz <= segmentsZ; iz++) {
    const z = -hd + iz * stepZ;
    for (let ix = 0; ix <= segmentsX; ix++) {
      const x = -hw + ix * stepX;
      const y = heightFn(x, z);
      vertices[vi] = x;
      vertices[vi + 1] = y;
      vertices[vi + 2] = z;
      vi += 3;

      if (colorFn && colors) {
        const c = colorFn(x, z, y);
        colors[ci] = c.r;
        colors[ci + 1] = c.g;
        colors[ci + 2] = c.b;
        colors[ci + 3] = c.a;
        ci += 4;
      }
    }
  }

  // Generate indices
  let ii = 0;
  for (let iz = 0; iz < segmentsZ; iz++) {
    for (let ix = 0; ix < segmentsX; ix++) {
      const a = iz * vertsPerRow + ix;
      const b = a + 1;
      const c = a + vertsPerRow;
      const d = c + 1;
      indices[ii] = a;
      indices[ii + 1] = b;
      indices[ii + 2] = c;
      indices[ii + 3] = b;
      indices[ii + 4] = d;
      indices[ii + 5] = c;
      ii += 6;
    }
  }

  // Compute normals: for each vertex, average the normals of all adjacent faces
  // First, accumulate face normals into each vertex
  for (let i = 0; i < indices.length; i += 3) {
    const i0 = indices[i]!;
    const i1 = indices[i + 1]!;
    const i2 = indices[i + 2]!;

    const v0x = vertices[i0 * 3]!;
    const v0y = vertices[i0 * 3 + 1]!;
    const v0z = vertices[i0 * 3 + 2]!;
    const v1x = vertices[i1 * 3]!;
    const v1y = vertices[i1 * 3 + 1]!;
    const v1z = vertices[i1 * 3 + 2]!;
    const v2x = vertices[i2 * 3]!;
    const v2y = vertices[i2 * 3 + 1]!;
    const v2z = vertices[i2 * 3 + 2]!;

    // Edge vectors
    const e1x = v1x - v0x;
    const e1y = v1y - v0y;
    const e1z = v1z - v0z;
    const e2x = v2x - v0x;
    const e2y = v2y - v0y;
    const e2z = v2z - v0z;

    // Cross product (face normal, not normalized - area-weighted)
    const nx = e1y * e2z - e1z * e2y;
    const ny = e1z * e2x - e1x * e2z;
    const nz = e1x * e2y - e1y * e2x;

    // Accumulate into each vertex
    normals[i0 * 3] += nx;
    normals[i0 * 3 + 1] += ny;
    normals[i0 * 3 + 2] += nz;
    normals[i1 * 3] += nx;
    normals[i1 * 3 + 1] += ny;
    normals[i1 * 3 + 2] += nz;
    normals[i2 * 3] += nx;
    normals[i2 * 3 + 1] += ny;
    normals[i2 * 3 + 2] += nz;
  }

  // Normalize all vertex normals
  for (let i = 0; i < normals.length; i += 3) {
    const nx = normals[i]!;
    const ny = normals[i + 1]!;
    const nz = normals[i + 2]!;
    const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
    if (len > 0) {
      normals[i] = nx / len;
      normals[i + 1] = ny / len;
      normals[i + 2] = nz / len;
    } else {
      // Default to up if degenerate
      normals[i] = 0;
      normals[i + 1] = 1;
      normals[i + 2] = 0;
    }
  }

  return new Mesh(vertices, normals, indices, undefined, colors);
}

/**
 * Simple procedural terrain using sine waves (no external noise library).
 * Returns height values between -amplitude and +amplitude.
 */
export function sineTerrain(amplitude: number = 3, frequency: number = 0.3): HeightFunction {
  return (x: number, z: number) => {
    return amplitude * (
      Math.sin(x * frequency) * Math.cos(z * frequency * 0.7) +
      Math.sin(x * frequency * 2.3 + 1.7) * 0.3 +
      Math.cos(z * frequency * 1.5 + 0.5) * 0.4
    );
  };
}

/**
 * Default terrain coloring: green at low elevation, brown at mid, white at peaks.
 */
export function heightGradientColor(minH: number, maxH: number): TerrainColorFunction {
  return (_x: number, _z: number, h: number) => {
    const t = (h - minH) / (maxH - minH); // 0 to 1
    if (t < 0.3) return { r: 0.2, g: 0.5 + t, b: 0.15, a: 1 }; // green
    if (t < 0.7) return { r: 0.5 + (t - 0.3) * 0.5, g: 0.4, b: 0.2, a: 1 }; // brown
    return { r: 0.8 + (t - 0.7) * 0.6, g: 0.8 + (t - 0.7) * 0.6, b: 0.85 + (t - 0.7) * 0.5, a: 1 }; // snow
  };
}
