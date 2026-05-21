// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/** Mesh geometry with packed vertex data. */
export class Mesh {
  readonly vertices: Float32Array;
  readonly normals: Float32Array;
  readonly indices: Uint32Array;
  readonly uvs?: Float32Array;
  readonly colors?: Float32Array;

  constructor(
    vertices: Float32Array,
    normals: Float32Array,
    indices: Uint32Array,
    uvs?: Float32Array,
    colors?: Float32Array,
  ) {
    this.vertices = vertices;
    this.normals = normals;
    this.indices = indices;
    this.uvs = uvs;
    this.colors = colors;
  }

  /** Number of vertices (each vertex is 3 floats: x, y, z). */
  get vertexCount(): number {
    return this.vertices.length / 3;
  }

  /** Number of indices. */
  get indexCount(): number {
    return this.indices.length;
  }

  /**
   * Create a box mesh centered at the origin.
   * @param width - Size along x axis.
   * @param height - Size along y axis.
   * @param depth - Size along z axis.
   */
  static createBox(width: number, height: number, depth: number): Mesh {
    const hw = width / 2;
    const hh = height / 2;
    const hd = depth / 2;

    // 6 faces, 4 vertices each = 24 vertices
    // Each face has its own vertices for correct normals
    const vertices = new Float32Array([
      // Front face (z+)
      -hw, -hh, hd, hw, -hh, hd, hw, hh, hd, -hw, hh, hd,
      // Back face (z-)
      hw, -hh, -hd, -hw, -hh, -hd, -hw, hh, -hd, hw, hh, -hd,
      // Top face (y+)
      -hw, hh, hd, hw, hh, hd, hw, hh, -hd, -hw, hh, -hd,
      // Bottom face (y-)
      -hw, -hh, -hd, hw, -hh, -hd, hw, -hh, hd, -hw, -hh, hd,
      // Right face (x+)
      hw, -hh, hd, hw, -hh, -hd, hw, hh, -hd, hw, hh, hd,
      // Left face (x-)
      -hw, -hh, -hd, -hw, -hh, hd, -hw, hh, hd, -hw, hh, -hd,
    ]);

    const normals = new Float32Array([
      // Front
      0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
      // Back
      0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
      // Top
      0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
      // Bottom
      0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
      // Right
      1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
      // Left
      -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
    ]);

    // 6 faces, 2 triangles each = 36 indices
    const indices = new Uint32Array(36);
    for (let face = 0; face < 6; face++) {
      const base = face * 4;
      const idx = face * 6;
      indices[idx] = base;
      indices[idx + 1] = base + 1;
      indices[idx + 2] = base + 2;
      indices[idx + 3] = base;
      indices[idx + 4] = base + 2;
      indices[idx + 5] = base + 3;
    }

    return new Mesh(vertices, normals, indices);
  }

  /**
   * Create a plane mesh on the XZ plane centered at the origin.
   * @param width - Size along x axis.
   * @param depth - Size along z axis.
   * @param segmentsX - Number of segments along x.
   * @param segmentsZ - Number of segments along z.
   */
  static createPlane(width: number, depth: number, segmentsX: number = 1, segmentsZ: number = 1): Mesh {
    const vertsPerRow = segmentsX + 1;
    const vertsPerCol = segmentsZ + 1;
    const vertexCount = vertsPerRow * vertsPerCol;
    const triangleCount = segmentsX * segmentsZ * 2;

    const vertices = new Float32Array(vertexCount * 3);
    const normals = new Float32Array(vertexCount * 3);
    const uvs = new Float32Array(vertexCount * 2);
    const indices = new Uint32Array(triangleCount * 3);

    const hw = width / 2;
    const hd = depth / 2;

    // Generate vertices
    let vi = 0;
    let ui = 0;
    for (let iz = 0; iz <= segmentsZ; iz++) {
      const tz = iz / segmentsZ;
      const z = -hd + tz * depth;
      for (let ix = 0; ix <= segmentsX; ix++) {
        const tx = ix / segmentsX;
        const x = -hw + tx * width;
        vertices[vi] = x;
        vertices[vi + 1] = 0;
        vertices[vi + 2] = z;
        normals[vi] = 0;
        normals[vi + 1] = 1;
        normals[vi + 2] = 0;
        vi += 3;
        uvs[ui] = tx;
        uvs[ui + 1] = tz;
        ui += 2;
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

    return new Mesh(vertices, normals, indices, uvs);
  }

  /**
   * Create a UV sphere.
   * @param radius - Sphere radius.
   * @param stacks - Number of horizontal slices (latitude). Default 16.
   * @param slices - Number of vertical slices (longitude). Default 24.
   */
  static createSphere(radius: number, stacks: number = 16, slices: number = 24): Mesh {
    const vertCount = (stacks + 1) * (slices + 1);
    const triCount = stacks * slices * 2;
    const vertices = new Float32Array(vertCount * 3);
    const normals = new Float32Array(vertCount * 3);
    const indices = new Uint32Array(triCount * 3);

    let vi = 0;
    for (let st = 0; st <= stacks; st++) {
      const phi = (st / stacks) * Math.PI; // 0 to PI (top to bottom)
      const sinPhi = Math.sin(phi);
      const cosPhi = Math.cos(phi);

      for (let sl = 0; sl <= slices; sl++) {
        const theta = (sl / slices) * Math.PI * 2; // 0 to 2PI
        const sinTheta = Math.sin(theta);
        const cosTheta = Math.cos(theta);

        // Normal = unit sphere position
        const nx = sinPhi * cosTheta;
        const ny = cosPhi;
        const nz = sinPhi * sinTheta;

        normals[vi] = nx;
        normals[vi + 1] = ny;
        normals[vi + 2] = nz;

        vertices[vi] = nx * radius;
        vertices[vi + 1] = ny * radius;
        vertices[vi + 2] = nz * radius;

        vi += 3;
      }
    }

    let ii = 0;
    for (let st = 0; st < stacks; st++) {
      for (let sl = 0; sl < slices; sl++) {
        const a = st * (slices + 1) + sl;
        const b = a + slices + 1;

        indices[ii] = a;
        indices[ii + 1] = b;
        indices[ii + 2] = a + 1;

        indices[ii + 3] = a + 1;
        indices[ii + 4] = b;
        indices[ii + 5] = b + 1;

        ii += 6;
      }
    }

    return new Mesh(vertices, normals, indices);
  }
}
