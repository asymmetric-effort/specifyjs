// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { RenderPipeline } from './render-pipeline';
import type { SceneGraph } from './scene-graph';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { LightingModel } from './lighting-model';
import type { Color } from './types';
import type { Light } from './light';
import type { Vec3 } from '../../../math/src/vec';
import { vec3, vec3Sub, vec3Cross, vec3Normalize } from '../../../math/src/vec';
import { mat4Multiply } from '../../../math/src/mat4';
import type { Mat4 } from '../../../math/src/mat4';
import type { SpaceBounds } from './bounds';

/** Triangle ready for rasterization after projection. */
interface ProjectedTriangle {
  /** Screen-space x coordinates for the 3 vertices. */
  sx: [number, number, number];
  /** Screen-space y coordinates for the 3 vertices. */
  sy: [number, number, number];
  /** Render order from SceneObject (lower = draw first). */
  renderOrder: number;
  /** Object center depth in view space (for coarse sorting). */
  objectDepth: number;
  /** Average Z in clip space (for fine sorting within an object). */
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

  render(scene: SceneGraph, camera: Camera, viewport: Viewport, lighting: LightingModel, lights?: Light[]): void {
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

      // Compute object center depth in view space for coarse depth sorting
      const viewModel = mat4Multiply(viewMat, modelMat);
      const objCenterZ = viewModel[14]!; // Translation Z in view space (negative = into screen)

      const vertices = mesh.vertices;
      const indices = mesh.indices;
      const meshColors = mesh.colors;
      const meshUvs = mesh.uvs;
      const materialTexture = material.texture;

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

      // Light sources: use provided array or fall back to default directional
      const activeLights = lights && lights.length > 0 ? lights : null;
      const defaultLightDir: Vec3 = vec3Normalize(vec3(0.5, 1.0, 0.3));
      const defaultLightColor: Color = { r: 1, g: 1, b: 1, a: 1 };

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

        // Triangle center in world space (for point light direction calculation)
        const cx = (p0.x + p1.x + p2.x) / 3;
        const cy = (p0.y + p1.y + p2.y) / 3;
        const cz = (p0.z + p1.z + p2.z) / 3;
        const wcx = modelMat[0]! * cx + modelMat[4]! * cy + modelMat[8]! * cz + modelMat[12]!;
        const wcy = modelMat[1]! * cx + modelMat[5]! * cy + modelMat[9]! * cz + modelMat[13]!;
        const wcz = modelMat[2]! * cx + modelMat[6]! * cy + modelMat[10]! * cz + modelMat[14]!;

        // Compute light direction from first light (for shade() call)
        let lightDir: Vec3;
        let lightColor: Color;
        if (activeLights) {
          lightDir = vec3Normalize(vec3Sub(activeLights[0]!.position, vec3(wcx, wcy, wcz)));
          lightColor = activeLights[0]!.color;
        } else {
          lightDir = defaultLightDir;
          lightColor = defaultLightColor;
        }

        // Determine material color: texture > per-vertex colors > material.color
        let materialColor: Color;
        if (materialTexture && meshUvs) {
          // Interpolate UV coordinates at the face center (average of 3 vertex UVs)
          const uv0i = i0 * 2;
          const uv1i = i1 * 2;
          const uv2i = i2 * 2;
          const avgU = (meshUvs[uv0i]! + meshUvs[uv1i]! + meshUvs[uv2i]!) / 3;
          const avgV = (meshUvs[uv0i + 1]! + meshUvs[uv1i + 1]! + meshUvs[uv2i + 1]!) / 3;
          materialColor = materialTexture.sample(avgU, avgV);
        } else if (meshColors) {
          const c0i = i0 * 4;
          const c1i = i1 * 4;
          const c2i = i2 * 4;
          materialColor = {
            r: (meshColors[c0i]! + meshColors[c1i]! + meshColors[c2i]!) / 3,
            g: (meshColors[c0i + 1]! + meshColors[c1i + 1]! + meshColors[c2i + 1]!) / 3,
            b: (meshColors[c0i + 2]! + meshColors[c1i + 2]! + meshColors[c2i + 2]!) / 3,
            a: (meshColors[c0i + 3]! + meshColors[c1i + 3]! + meshColors[c2i + 3]!) / 3,
          };
        } else {
          materialColor = material.color;
        }

        // Shade the triangle — accumulate contributions from all lights
        let color: Color;
        if (activeLights && activeLights.length > 1) {
          // Multi-light: accumulate diffuse from each light, single ambient pass
          const ambient = 0.15;
          let totalR = materialColor.r * ambient;
          let totalG = materialColor.g * ambient;
          let totalB = materialColor.b * ambient;

          const worldCenter = vec3(wcx, wcy, wcz);
          for (let li = 0; li < activeLights.length; li++) {
            const lt = activeLights[li]!;
            const ld = vec3Normalize(vec3Sub(lt.position, worldCenter));
            const NdotL = Math.max(
              faceNormal.x * ld.x + faceNormal.y * ld.y + faceNormal.z * ld.z,
              0,
            );
            totalR += materialColor.r * lt.color.r * NdotL * lt.intensity;
            totalG += materialColor.g * lt.color.g * NdotL * lt.intensity;
            totalB += materialColor.b * lt.color.b * NdotL * lt.intensity;
          }
          color = {
            r: Math.min(1, totalR),
            g: Math.min(1, totalG),
            b: Math.min(1, totalB),
            a: materialColor.a,
          };
        } else {
          color = lighting.shade({
            normal: faceNormal,
            lightDir,
            viewDir,
            lightColor,
            materialColor,
            ambientStrength: 0.2,
          });
        }

        // Average Z for painter's algorithm (more negative = farther)
        const avgZ = (ndcZ0 + ndcZ1 + ndcZ2) / 3;

        triangles.push({
          sx: [sx0, sx1, sx2],
          sy: [sy0, sy1, sy2],
          renderOrder: obj.renderOrder,
          objectDepth: objCenterZ,
          avgZ,
          color,
        });
      }
    }

    // Painter's algorithm: sort back-to-front
    // 1st key: renderOrder (lower draws first — background objects like terrain)
    // 2nd key: object center depth (more negative = farther in view space)
    // 3rd key: triangle average NDC Z (within same object)
    triangles.sort((a, b) => {
      if (a.renderOrder !== b.renderOrder) return a.renderOrder - b.renderOrder;
      const depthDiff = a.objectDepth - b.objectDepth;
      if (Math.abs(depthDiff) > 0.01) return depthDiff;
      return a.avgZ - b.avgZ;
    });

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

  /**
   * Render wireframe edges (black outlines) for all visible scene objects.
   * Call after render() to overlay edges on the filled triangles.
   */
  renderEdges(
    scene: SceneGraph,
    camera: Camera,
    viewport: Viewport,
    options?: { color?: string; lineWidth?: number; opacity?: number },
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const color = options?.color ?? '#000000';
    const lineWidth = options?.lineWidth ?? 1;
    const opacity = options?.opacity ?? 0.6;

    const viewMat = camera.getViewMatrix();
    const projMat = camera.getProjectionMatrix();
    const viewProj = mat4Multiply(projMat, viewMat);

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.clip();
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
    ctx.globalAlpha = opacity;

    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    for (const obj of scene.getVisibleObjects()) {
      const mesh = obj.mesh;
      if (!mesh) continue;

      const modelMat = obj.getWorldMatrix();
      const mvp = mat4Multiply(viewProj, modelMat);
      const vertices = mesh.vertices;
      const indices = mesh.indices;
      const vertCount = mesh.vertexCount;

      // Transform vertices
      const sx = new Float64Array(vertCount);
      const sy = new Float64Array(vertCount);
      const sw = new Float64Array(vertCount);

      for (let v = 0; v < vertCount; v++) {
        const vi = v * 3;
        const vx = vertices[vi]!;
        const vy = vertices[vi + 1]!;
        const vz = vertices[vi + 2]!;
        const cw = mvp[3]! * vx + mvp[7]! * vy + mvp[11]! * vz + mvp[15]!;
        sw[v] = cw;
        if (cw <= 0) continue;
        const invW = 1 / cw;
        const ndcX = (mvp[0]! * vx + mvp[4]! * vy + mvp[8]! * vz + mvp[12]!) * invW;
        const ndcY = (mvp[1]! * vx + mvp[5]! * vy + mvp[9]! * vz + mvp[13]!) * invW;
        sx[v] = viewport.x + (ndcX + 1) * halfW;
        sy[v] = viewport.y + (1 - ndcY) * halfH;
      }

      // Draw triangle edges
      for (let i = 0; i < indices.length; i += 3) {
        const i0 = indices[i]!;
        const i1 = indices[i + 1]!;
        const i2 = indices[i + 2]!;
        if (sw[i0]! <= 0 && sw[i1]! <= 0 && sw[i2]! <= 0) continue;

        ctx.beginPath();
        ctx.moveTo(sx[i0]!, sy[i0]!);
        ctx.lineTo(sx[i1]!, sy[i1]!);
        ctx.lineTo(sx[i2]!, sy[i2]!);
        ctx.closePath();
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Render a 3D grid on the XZ plane at y=0.
   * Call this after render() to overlay the grid on top of the scene
   * (or before render() to draw it behind — painter's order).
   */
  renderGrid(
    camera: Camera,
    viewport: Viewport,
    options?: { size?: number; divisions?: number; color?: string; opacity?: number },
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const size = options?.size ?? 20;
    const divisions = options?.divisions ?? 20;
    const color = options?.color ?? '#ffffff';
    const opacity = options?.opacity ?? 0.15;

    const viewMat = camera.getViewMatrix();
    const projMat = camera.getProjectionMatrix();
    const vp = mat4Multiply(projMat, viewMat);

    const half = size / 2;
    const step = size / divisions;

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;

    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    const project = (x: number, y: number, z: number): [number, number, number] | null => {
      const cx = vp[0]! * x + vp[4]! * y + vp[8]! * z + vp[12]!;
      const cy = vp[1]! * x + vp[5]! * y + vp[9]! * z + vp[13]!;
      const cz = vp[2]! * x + vp[6]! * y + vp[10]! * z + vp[14]!;
      const cw = vp[3]! * x + vp[7]! * y + vp[11]! * z + vp[15]!;
      if (cw <= 0) return null;
      const ndcX = cx / cw;
      const ndcY = cy / cw;
      return [
        viewport.x + (ndcX + 1) * halfW,
        viewport.y + (1 - ndcY) * halfH,
        cz / cw,
      ];
    };

    // Draw grid lines along X (varying Z)
    for (let i = 0; i <= divisions; i++) {
      const z = -half + i * step;
      const a = project(-half, 0, z);
      const b = project(half, 0, z);
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }

    // Draw grid lines along Z (varying X)
    for (let i = 0; i <= divisions; i++) {
      const x = -half + i * step;
      const a = project(x, 0, -half);
      const b = project(x, 0, half);
      if (a && b) {
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.lineTo(b[0], b[1]);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  /**
   * Render a wireframe bounding box showing space boundaries.
   * Draws the 12 edges of the box projected through the camera.
   */
  renderBounds(
    camera: Camera,
    viewport: Viewport,
    bounds: SpaceBounds,
    options?: { color?: string; opacity?: number },
  ): void {
    const ctx = this.ctx;
    if (!ctx) return;

    const color = options?.color ?? '#ffff00';
    const opacity = options?.opacity ?? 0.4;

    const viewMat = camera.getViewMatrix();
    const projMat = camera.getProjectionMatrix();
    const vp = mat4Multiply(projMat, viewMat);

    const halfW = viewport.width / 2;
    const halfH = viewport.height / 2;

    const project = (x: number, y: number, z: number): [number, number] | null => {
      const cw = vp[3]! * x + vp[7]! * y + vp[11]! * z + vp[15]!;
      if (cw <= 0) return null;
      const ndcX = (vp[0]! * x + vp[4]! * y + vp[8]! * z + vp[12]!) / cw;
      const ndcY = (vp[1]! * x + vp[5]! * y + vp[9]! * z + vp[13]!) / cw;
      return [
        viewport.x + (ndcX + 1) * halfW,
        viewport.y + (1 - ndcY) * halfH,
      ];
    };

    ctx.save();
    ctx.beginPath();
    ctx.rect(viewport.x, viewport.y, viewport.width, viewport.height);
    ctx.clip();

    ctx.strokeStyle = color;
    ctx.globalAlpha = opacity;
    ctx.lineWidth = 1;

    // 8 corners of the bounding box
    const mn = bounds.min;
    const mx = bounds.max;
    const corners: [number, number, number][] = [
      [mn.x, mn.y, mn.z], // 0
      [mx.x, mn.y, mn.z], // 1
      [mx.x, mx.y, mn.z], // 2
      [mn.x, mx.y, mn.z], // 3
      [mn.x, mn.y, mx.z], // 4
      [mx.x, mn.y, mx.z], // 5
      [mx.x, mx.y, mx.z], // 6
      [mn.x, mx.y, mx.z], // 7
    ];

    // 12 edges as pairs of corner indices
    const edges: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], // front face
      [4, 5], [5, 6], [6, 7], [7, 4], // back face
      [0, 4], [1, 5], [2, 6], [3, 7], // connecting edges
    ];

    for (const [a, b] of edges) {
      const ca = corners[a]!;
      const cb = corners[b]!;
      const pa = project(ca[0], ca[1], ca[2]);
      const pb = project(cb[0], cb[1], cb[2]);
      if (pa && pb) {
        ctx.beginPath();
        ctx.moveTo(pa[0], pa[1]);
        ctx.lineTo(pb[0], pb[1]);
        ctx.stroke();
      }
    }

    ctx.restore();
  }
}
