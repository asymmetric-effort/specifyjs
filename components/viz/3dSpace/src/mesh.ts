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

  /**
   * Create a wireframe cylinder mesh (intended for use with renderMode: 'lines').
   * Generates a triangle mesh whose edges trace longitudinal lines and circular cross-sections.
   * @param radius - Cylinder radius.
   * @param height - Cylinder height along Y axis.
   * @param options - Optional radialSegments (default 16) and heightSegments (default 4).
   */
  static createCylinderMesh(
    radius: number,
    height: number,
    options?: { radialSegments?: number; heightSegments?: number },
  ): Mesh {
    const radialSegments = Math.max(3, options?.radialSegments ?? 16);
    const heightSegments = Math.max(1, options?.heightSegments ?? 4);
    const r = Math.abs(radius);
    const h = Math.abs(height);
    const halfH = h / 2;

    // Vertices: (radialSegments + 1) per ring * (heightSegments + 1) rings
    // The +1 on radial duplicates the seam vertex for proper connectivity
    const rings = heightSegments + 1;
    const vertsPerRing = radialSegments + 1;
    const vertCount = rings * vertsPerRing;

    const vertices = new Float32Array(vertCount * 3);
    const normals = new Float32Array(vertCount * 3);

    let vi = 0;
    for (let ring = 0; ring < rings; ring++) {
      const y = -halfH + (ring / heightSegments) * h;
      for (let seg = 0; seg <= radialSegments; seg++) {
        const theta = (seg / radialSegments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        vertices[vi] = r * cos;
        vertices[vi + 1] = y;
        vertices[vi + 2] = r * sin;

        // Normals point radially outward
        normals[vi] = cos;
        normals[vi + 1] = 0;
        normals[vi + 2] = sin;

        vi += 3;
      }
    }

    // Indices: create quads (2 triangles each) between adjacent rings
    const triCount = heightSegments * radialSegments * 2;
    const indices = new Uint32Array(triCount * 3);
    let ii = 0;

    for (let ring = 0; ring < heightSegments; ring++) {
      for (let seg = 0; seg < radialSegments; seg++) {
        const a = ring * vertsPerRing + seg;
        const b = a + 1;
        const c = a + vertsPerRing;
        const d = c + 1;

        // Triangle 1
        indices[ii] = a;
        indices[ii + 1] = c;
        indices[ii + 2] = b;
        ii += 3;

        // Triangle 2
        indices[ii] = b;
        indices[ii + 1] = c;
        indices[ii + 2] = d;
        ii += 3;
      }
    }

    return new Mesh(vertices, normals, indices);
  }

  /**
   * Create a solid cylinder mesh with optional end caps and taper.
   * @param radius - Bottom radius.
   * @param height - Cylinder height along Y axis.
   * @param options - radialSegments (default 24), caps (default true), topRadius (default same as radius).
   */
  static createCylinderSolid(
    radius: number,
    height: number,
    options?: { radialSegments?: number; caps?: boolean; topRadius?: number },
  ): Mesh {
    const radialSegments = Math.max(3, options?.radialSegments ?? 24);
    const caps = options?.caps ?? true;
    const topRadius = Math.abs(options?.topRadius ?? radius);
    const botRadius = Math.abs(radius);
    const h = Math.abs(height);
    const halfH = h / 2;

    // Body: 2 rings of (radialSegments+1) vertices
    const bodyVertCount = 2 * (radialSegments + 1);
    // Caps: each cap has 1 center + (radialSegments+1) rim vertices
    const capVertCount = caps ? 2 * (1 + radialSegments + 1) : 0;
    const totalVertCount = bodyVertCount + capVertCount;

    const vertices = new Float32Array(totalVertCount * 3);
    const normals = new Float32Array(totalVertCount * 3);

    let vi = 0;

    // Compute slope angle for body normals (for tapered cylinders)
    const dr = botRadius - topRadius;
    const slopeLen = Math.sqrt(dr * dr + h * h);
    const nY = slopeLen > 0 ? dr / slopeLen : 0;
    const nR = slopeLen > 0 ? h / slopeLen : 1;

    // Body vertices: bottom ring then top ring
    for (let ring = 0; ring < 2; ring++) {
      const y = ring === 0 ? -halfH : halfH;
      const r = ring === 0 ? botRadius : topRadius;
      for (let seg = 0; seg <= radialSegments; seg++) {
        const theta = (seg / radialSegments) * Math.PI * 2;
        const cos = Math.cos(theta);
        const sin = Math.sin(theta);

        vertices[vi] = r * cos;
        vertices[vi + 1] = y;
        vertices[vi + 2] = r * sin;

        // Body normal accounts for taper
        const nx = nR * cos;
        const ny = nY;
        const nz = nR * sin;
        const len = Math.sqrt(nx * nx + ny * ny + nz * nz);
        normals[vi] = len > 0 ? nx / len : cos;
        normals[vi + 1] = len > 0 ? ny / len : 0;
        normals[vi + 2] = len > 0 ? nz / len : sin;

        vi += 3;
      }
    }

    // Body indices
    const bodyTriCount = radialSegments * 2;
    const vertsPerRing = radialSegments + 1;

    // Cap vertices and indices
    let capTriCount = 0;
    let bottomCapCenterIdx = 0;
    let topCapCenterIdx = 0;

    if (caps) {
      // Bottom cap: center at -halfH, normal pointing down
      bottomCapCenterIdx = vi / 3;
      vertices[vi] = 0;
      vertices[vi + 1] = -halfH;
      vertices[vi + 2] = 0;
      normals[vi] = 0;
      normals[vi + 1] = -1;
      normals[vi + 2] = 0;
      vi += 3;

      for (let seg = 0; seg <= radialSegments; seg++) {
        const theta = (seg / radialSegments) * Math.PI * 2;
        vertices[vi] = botRadius * Math.cos(theta);
        vertices[vi + 1] = -halfH;
        vertices[vi + 2] = botRadius * Math.sin(theta);
        normals[vi] = 0;
        normals[vi + 1] = -1;
        normals[vi + 2] = 0;
        vi += 3;
      }

      // Top cap: center at +halfH, normal pointing up
      topCapCenterIdx = vi / 3;
      vertices[vi] = 0;
      vertices[vi + 1] = halfH;
      vertices[vi + 2] = 0;
      normals[vi] = 0;
      normals[vi + 1] = 1;
      normals[vi + 2] = 0;
      vi += 3;

      for (let seg = 0; seg <= radialSegments; seg++) {
        const theta = (seg / radialSegments) * Math.PI * 2;
        vertices[vi] = topRadius * Math.cos(theta);
        vertices[vi + 1] = halfH;
        vertices[vi + 2] = topRadius * Math.sin(theta);
        normals[vi] = 0;
        normals[vi + 1] = 1;
        normals[vi + 2] = 0;
        vi += 3;
      }

      capTriCount = radialSegments * 2; // bottom + top
    }

    const totalTriCount = bodyTriCount + capTriCount;
    const indices = new Uint32Array(totalTriCount * 3);
    let ii = 0;

    // Body quads
    for (let seg = 0; seg < radialSegments; seg++) {
      const a = seg;
      const b = seg + 1;
      const c = seg + vertsPerRing;
      const d = seg + vertsPerRing + 1;

      // CCW winding
      indices[ii] = a;
      indices[ii + 1] = b;
      indices[ii + 2] = c;
      ii += 3;

      indices[ii] = b;
      indices[ii + 1] = d;
      indices[ii + 2] = c;
      ii += 3;
    }

    // Cap indices
    if (caps) {
      // Bottom cap (facing -Y): CCW when viewed from below = CW from above
      const botRimStart = bottomCapCenterIdx + 1;
      for (let seg = 0; seg < radialSegments; seg++) {
        indices[ii] = bottomCapCenterIdx;
        indices[ii + 1] = botRimStart + seg + 1;
        indices[ii + 2] = botRimStart + seg;
        ii += 3;
      }

      // Top cap (facing +Y): CCW when viewed from above
      const topRimStart = topCapCenterIdx + 1;
      for (let seg = 0; seg < radialSegments; seg++) {
        indices[ii] = topCapCenterIdx;
        indices[ii + 1] = topRimStart + seg;
        indices[ii + 2] = topRimStart + seg + 1;
        ii += 3;
      }
    }

    return new Mesh(vertices, normals, indices);
  }
}
