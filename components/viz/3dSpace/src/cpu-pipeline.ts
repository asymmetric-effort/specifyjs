// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { RenderPipeline } from './render-pipeline';
import type { SceneGraph } from './scene-graph';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { LightingModel } from './lighting-model';
import type { Color } from './types';
import type { Vec3 } from '../../../math/src/vec';
import { vec3, vec3Sub, vec3Cross, vec3Normalize } from '../../../math/src/vec';
import { mat4Multiply } from '../../../math/src/mat4';
import type { Mat4 } from '../../../math/src/mat4';

/** Triangle ready for rasterization after projection. */
interface ProjectedTriangle {
  /** Screen-space x coordinates for the 3 vertices. */
  sx: [number, number, number];
  /** Screen-space y coordinates for the 3 vertices. */
  sy: [number, number, number];
  /** Average Z in clip space (used for depth sorting). */
  avgZ: number;
  /** Shaded fill color. */
  color: Color;
}

/**
 * CPU-based software render pipeline.
 * Renders 3D scenes to a Canvas 2D context using the painter's algorithm
 * and canvas path fills for triangle rasterization.
 */
export class CpuPipeline implements RenderPipeline {
  readonly name = 'cpu';
  private ctx: CanvasRenderingContext2D | null = null;

  initialize(canvas: HTMLCanvasElement): void {
    this.ctx = canvas.getContext('2d');
  }

  dispose(): void {
    this.ctx = null;
  }

  render(scene: SceneGraph, camera: Camera, viewport: Viewport, lighting: LightingModel): void {
    const ctx = this.ctx;
    if (!ctx) return;

    // Compute view * projection once per frame
    const viewMat = camera.getViewMatrix();
    const projMat = camera.getProjectionMatrix();
    const viewProj = mat4Multiply(projMat, viewMat);

    // Clear viewport region
    const cc = viewport.clearColor;
    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.clip();
    ctx.fillStyle = `rgba(${(cc.r * 255) | 0},${(cc.g * 255) | 0},${(cc.b * 255) | 0},${cc.a})`;
    ctx.fillRect(viewport.x, viewport.y, viewport.width, viewport.height);

    // Collect all projected triangles for depth sorting
    const triangles: ProjectedTriangle[] = [];

    const visibleObjects = scene.getVisibleObjects();

    for (const obj of visibleObjects) {
      const mesh = obj.mesh;
      const material = obj.material;
      if (!mesh || !material) continue;

      // model * view * projection
      const modelMat = obj.getWorldMatrix();
      const mvp = mat4Multiply(viewProj, modelMat);

      const vertices = mesh.vertices;
      const indices = mesh.indices;

      // Transform all vertices to clip space
      const vertCount = mesh.vertexCount;
      const clipX = new Float64Array(vertCount);
      const clipY = new Float64Array(vertCount);
      const clipZ = new Float64Array(vertCount);
      const clipW = new Float64Array(vertCount);

      for (let v = 0; v < vertCount; v++) {
        const vi = v * 3;
        const vx = vertices[vi]!;
        const vy = vertices[vi + 1]!;
        const vz = vertices[vi + 2]!;

        // Apply MVP: clip = mvp * vec4(vx, vy, vz, 1)
        clipX[v] = mvp[0]! * vx + mvp[4]! * vy + mvp[8]! * vz + mvp[12]!;
        clipY[v] = mvp[1]! * vx + mvp[5]! * vy + mvp[9]! * vz + mvp[13]!;
        clipZ[v] = mvp[2]! * vx + mvp[6]! * vy + mvp[10]! * vz + mvp[14]!;
        clipW[v] = mvp[3]! * vx + mvp[7]! * vy + mvp[11]! * vz + mvp[15]!;
      }

      // Default light direction for shading (from above-right-front)
      const lightDir: Vec3 = vec3Normalize(vec3(0.5, 1.0, 0.3));
      // View direction approximation (camera forward)
      const viewDir: Vec3 = vec3Normalize(vec3(
        -viewMat[2]!,
        -viewMat[6]!,
        -viewMat[10]!,
      ));

      // Process each triangle
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i]!;
        const i1 = indices[i + 1]!;
        const i2 = indices[i + 2]!;

        const w0 = clipW[i0]!;
        const w1 = clipW[i1]!;
        const w2 = clipW[i2]!;

        // Skip triangles behind the camera (all w <= 0)
        if (w0 <= 0 && w1 <= 0 && w2 <= 0) continue;

        // Perspective divide
        const invW0 = w0 !== 0 ? 1 / w0 : 1;
        const invW1 = w1 !== 0 ? 1 / w1 : 1;
        const invW2 = w2 !== 0 ? 1 / w2 : 1;

        const ndcX0 = clipX[i0]! * invW0;
        const ndcY0 = clipY[i0]! * invW0;
        const ndcZ0 = clipZ[i0]! * invW0;
        const ndcX1 = clipX[i1]! * invW1;
        const ndcY1 = clipY[i1]! * invW1;
        const ndcZ1 = clipZ[i1]! * invW1;
        const ndcX2 = clipX[i2]! * invW2;
        const ndcY2 = clipY[i2]! * invW2;
        const ndcZ2 = clipZ[i2]! * invW2;

        // Map NDC [-1,1] to viewport coordinates
        const halfW = viewport.width / 2;
        const halfH = viewport.height / 2;
        const sx0 = viewport.x + (ndcX0 + 1) * halfW;
        const sy0 = viewport.y + (1 - ndcY0) * halfH; // flip Y
        const sx1 = viewport.x + (ndcX1 + 1) * halfW;
        const sy1 = viewport.y + (1 - ndcY1) * halfH;
        const sx2 = viewport.x + (ndcX2 + 1) * halfW;
        const sy2 = viewport.y + (1 - ndcY2) * halfH;

        // Compute face normal in world space from original vertices
        const v0Idx = i0 * 3;
        const v1Idx = i1 * 3;
        const v2Idx = i2 * 3;
        const p0 = vec3(vertices[v0Idx]!, vertices[v0Idx + 1]!, vertices[v0Idx + 2]!);
        const p1 = vec3(vertices[v1Idx]!, vertices[v1Idx + 1]!, vertices[v1Idx + 2]!);
        const p2 = vec3(vertices[v2Idx]!, vertices[v2Idx + 1]!, vertices[v2Idx + 2]!);

        const edge1 = vec3Sub(p1, p0);
        const edge2 = vec3Sub(p2, p0);
        const faceNormal = vec3Normalize(vec3Cross(edge1, edge2));

        // Shade the triangle
        const color = lighting.shade({
          normal: faceNormal,
          lightDir,
          viewDir,
          lightColor: { r: 1, g: 1, b: 1, a: 1 },
          materialColor: material.color,
          ambientStrength: 0.2,
        });

        // Average Z for painter's algorithm (more negative = farther)
        const avgZ = (ndcZ0 + ndcZ1 + ndcZ2) / 3;

        triangles.push({
          sx: [sx0, sx1, sx2],
          sy: [sy0, sy1, sy2],
          avgZ,
          color,
        });
      }
    }

    // Painter's algorithm: sort back-to-front (larger Z = closer in NDC)
    triangles.sort((a, b) => a.avgZ - b.avgZ);

    // Render sorted triangles
    for (const tri of triangles) {
      const r = (tri.color.r * 255) | 0;
      const g = (tri.color.g * 255) | 0;
      const b = (tri.color.b * 255) | 0;
      const a = tri.color.a;

      ctx.fillStyle = `rgba(${r},${g},${b},${a})`;
      ctx.beginPath();
      ctx.moveTo(tri.sx[0]!, tri.sy[0]!);
      ctx.lineTo(tri.sx[1]!, tri.sy[1]!);
      ctx.lineTo(tri.sx[2]!, tri.sy[2]!);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}
