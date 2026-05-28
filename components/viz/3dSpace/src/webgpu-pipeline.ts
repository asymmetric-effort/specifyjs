// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * WebGPU-based render pipeline.
 * Uses hardware-accelerated GPU rendering with WGSL shaders.
 * Provides depth buffer via GPUTexture for correct occlusion.
 */

import type { RenderPipeline } from './render-pipeline';
import type { SceneGraph } from './scene-graph';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { LightingModel } from './lighting-model';
import type { Light } from './light';
import type { SceneObject } from './scene-object';
import { mat4Multiply } from '../../../math/src/mat4';

// ---- WGSL Shaders ─────────────────────────────────────────────────────

const VERTEX_SHADER = /* wgsl */ `
struct Uniforms {
  mvp: mat4x4<f32>,
  color: vec4<f32>,
  lightDir: vec3<f32>,
  _pad: f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

struct VertexInput {
  @location(0) position: vec3<f32>,
  @location(1) normal: vec3<f32>,
};

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) normal: vec3<f32>,
};

@vertex
fn main(input: VertexInput) -> VertexOutput {
  var output: VertexOutput;
  output.position = u.mvp * vec4<f32>(input.position, 1.0);
  output.normal = input.normal;
  return output;
}
`;

const FRAGMENT_SHADER = /* wgsl */ `
struct Uniforms {
  mvp: mat4x4<f32>,
  color: vec4<f32>,
  lightDir: vec3<f32>,
  _pad: f32,
};

@group(0) @binding(0) var<uniform> u: Uniforms;

@fragment
fn main(@location(0) normal: vec3<f32>) -> @location(0) vec4<f32> {
  let n = normalize(normal);
  let ambient = 0.2;
  let diffuse = max(dot(n, normalize(u.lightDir)), 0.0);
  let intensity = ambient + diffuse * 0.8;
  return vec4<f32>(u.color.rgb * intensity, u.color.a);
}
`;

// ---- Uniform buffer layout ────────────────────────────────────────────

// mat4x4<f32> = 64 bytes, vec4<f32> = 16 bytes, vec3<f32>+pad = 16 bytes
// Total: 64 + 16 + 16 = 96 bytes
const UNIFORM_SIZE = 96;

// ---- Pipeline ─────────────────────────────────────────────────────────

export class WebGPUPipeline implements RenderPipeline {
  readonly name = 'webgpu';

  private device: GPUDevice | null = null;
  private context: GPUCanvasContext | null = null;
  private pipeline: GPURenderPipeline | null = null;
  private depthTexture: GPUTexture | null = null;
  private uniformBuffer: GPUBuffer | null = null;
  private uniformData: Float32Array = new Float32Array(UNIFORM_SIZE / 4);
  private _canvas: HTMLCanvasElement | null = null;

  // Label overlay: a second 2D canvas layered on top for text
  private overlayCanvas: HTMLCanvasElement | null = null;
  private overlayCtx: CanvasRenderingContext2D | null = null;

  initialize(canvas: HTMLCanvasElement): void {
    this._canvas = canvas;
    // Synchronous stub — actual init happens in initializeAsync
  }

  async initializeAsync(canvas: HTMLCanvasElement): Promise<void> {
    this._canvas = canvas;

    const gpu = (navigator as any).gpu as GPU | undefined;
    if (!gpu) throw new Error('WebGPU not available');

    const adapter = await gpu.requestAdapter();
    if (!adapter) throw new Error('No WebGPU adapter found');

    this.device = await adapter.requestDevice();

    this.context = canvas.getContext('webgpu') as GPUCanvasContext | null;
    if (!this.context) throw new Error('Could not get WebGPU canvas context');

    const format = gpu.getPreferredCanvasFormat();
    this.context.configure({
      device: this.device,
      format,
      alphaMode: 'premultiplied',
    });

    // Create render pipeline
    const vertexModule = this.device.createShaderModule({ code: VERTEX_SHADER });
    const fragmentModule = this.device.createShaderModule({ code: FRAGMENT_SHADER });

    this.pipeline = this.device.createRenderPipeline({
      layout: 'auto',
      vertex: {
        module: vertexModule,
        entryPoint: 'main',
        buffers: [
          {
            // Position
            arrayStride: 12,
            attributes: [{ shaderLocation: 0, offset: 0, format: 'float32x3' as GPUVertexFormat }],
          },
          {
            // Normals
            arrayStride: 12,
            attributes: [{ shaderLocation: 1, offset: 0, format: 'float32x3' as GPUVertexFormat }],
          },
        ],
      },
      fragment: {
        module: fragmentModule,
        entryPoint: 'main',
        targets: [{ format }],
      },
      primitive: { topology: 'triangle-list', cullMode: 'back' },
      depthStencil: {
        format: 'depth24plus',
        depthWriteEnabled: true,
        depthCompare: 'less',
      },
    });

    // Create depth texture
    this.depthTexture = this.device.createTexture({
      size: { width: canvas.width, height: canvas.height },
      format: 'depth24plus',
      usage: GPUTextureUsage.RENDER_ATTACHMENT,
    });

    // Create uniform buffer
    this.uniformBuffer = this.device.createBuffer({
      size: UNIFORM_SIZE,
      usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
    });

    // Create label overlay canvas
    this.overlayCanvas = document.createElement('canvas');
    this.overlayCanvas.width = canvas.width;
    this.overlayCanvas.height = canvas.height;
    this.overlayCanvas.style.position = 'absolute';
    this.overlayCanvas.style.top = '0';
    this.overlayCanvas.style.left = '0';
    this.overlayCanvas.style.pointerEvents = 'none';
    if (canvas.parentElement) {
      canvas.parentElement.style.position = 'relative';
      canvas.parentElement.appendChild(this.overlayCanvas);
    }
    this.overlayCtx = this.overlayCanvas.getContext('2d');
  }

  dispose(): void {
    this.depthTexture?.destroy();
    this.uniformBuffer?.destroy();
    this.device?.destroy();
    this.overlayCanvas?.remove();
    this.device = null;
    this.context = null;
    this.pipeline = null;
    this.depthTexture = null;
    this.uniformBuffer = null;
    this.overlayCanvas = null;
    this.overlayCtx = null;
  }

  render(
    scene: SceneGraph,
    camera: Camera,
    viewport: Viewport,
    lighting: LightingModel,
    lights?: Light[],
  ): void {
    const device = this.device;
    const context = this.context;
    const pipeline = this.pipeline;
    const depthTexture = this.depthTexture;
    const uniformBuffer = this.uniformBuffer;
    if (!device || !context || !pipeline || !depthTexture || !uniformBuffer) return;

    const viewMat = camera.getViewMatrix();
    const projMat = camera.getProjectionMatrix();
    const viewProj = mat4Multiply(projMat, viewMat);

    const cc = viewport.clearColor;

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();

    const renderPass = commandEncoder.beginRenderPass({
      colorAttachments: [{
        view: textureView,
        clearValue: { r: cc.r, g: cc.g, b: cc.b, a: cc.a },
        loadOp: 'clear' as GPULoadOp,
        storeOp: 'store' as GPUStoreOp,
      }],
      depthStencilAttachment: {
        view: depthTexture.createView(),
        depthClearValue: 1.0,
        depthLoadOp: 'clear' as GPULoadOp,
        depthStoreOp: 'store' as GPUStoreOp,
      },
    });

    renderPass.setPipeline(pipeline);

    const objects = scene.getVisibleObjects();

    // Default light direction
    const defaultLightDir = { x: 0.5, y: 1.0, z: 0.3 };
    const lightDir = lights && lights.length > 0
      ? lights[0]!.position
      : defaultLightDir;

    // Clear label overlay
    const overlayCtx = this.overlayCtx;
    const canvas = this._canvas;
    if (overlayCtx && canvas) {
      overlayCtx.clearRect(0, 0, canvas.width, canvas.height);
    }

    for (const obj of objects) {
      // Handle label objects (no mesh)
      if (obj.label && !obj.mesh && obj.material && overlayCtx && canvas) {
        this.renderLabel(obj, viewProj, viewport, overlayCtx, canvas.width, canvas.height);
        continue;
      }

      if (!obj.mesh || !obj.material) continue;

      const mesh = obj.mesh;
      const material = obj.material;

      // Compute MVP
      const modelMat = obj.getWorldMatrix();
      const mvp = mat4Multiply(viewProj, modelMat);

      // Write uniforms: MVP (64 bytes) + color (16 bytes) + lightDir (12+4 bytes)
      for (let i = 0; i < 16; i++) {
        this.uniformData[i] = mvp[i]!;
      }
      this.uniformData[16] = material.color.r;
      this.uniformData[17] = material.color.g;
      this.uniformData[18] = material.color.b;
      this.uniformData[19] = material.color.a;
      this.uniformData[20] = lightDir.x;
      this.uniformData[21] = lightDir.y;
      this.uniformData[22] = lightDir.z;
      this.uniformData[23] = 0; // padding

      device.queue.writeBuffer(uniformBuffer, 0, this.uniformData);

      // Create bind group
      const bindGroup = device.createBindGroup({
        layout: pipeline.getBindGroupLayout(0),
        entries: [{ binding: 0, resource: { buffer: uniformBuffer } }],
      });

      // Upload vertex data
      const vertexBuffer = device.createBuffer({
        size: mesh.vertices.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(vertexBuffer, 0, mesh.vertices);

      const normalBuffer = device.createBuffer({
        size: mesh.normals.byteLength,
        usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(normalBuffer, 0, mesh.normals);

      const indexBuffer = device.createBuffer({
        size: mesh.indices.byteLength,
        usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
      });
      device.queue.writeBuffer(indexBuffer, 0, mesh.indices);

      renderPass.setBindGroup(0, bindGroup);
      renderPass.setVertexBuffer(0, vertexBuffer);
      renderPass.setVertexBuffer(1, normalBuffer);
      renderPass.setIndexBuffer(indexBuffer, 'uint32');
      renderPass.drawIndexed(mesh.indexCount);
    }

    renderPass.end();
    device.queue.submit([commandEncoder.finish()]);
  }

  /** Project a label SceneObject to screen and draw as 2D text on the overlay. */
  private renderLabel(
    obj: SceneObject,
    viewProj: Float64Array,
    viewport: Viewport,
    ctx: CanvasRenderingContext2D,
    canvasW: number,
    canvasH: number,
  ): void {
    const modelMat = obj.getWorldMatrix();
    const wx = modelMat[12]!;
    const wy = modelMat[13]!;
    const wz = modelMat[14]!;

    const clipX = viewProj[0]! * wx + viewProj[4]! * wy + viewProj[8]! * wz + viewProj[12]!;
    const clipY = viewProj[1]! * wx + viewProj[5]! * wy + viewProj[9]! * wz + viewProj[13]!;
    const clipW = viewProj[3]! * wx + viewProj[7]! * wy + viewProj[11]! * wz + viewProj[15]!;
    if (clipW <= 0) return;

    const ndcX = clipX / clipW;
    const ndcY = clipY / clipW;
    const screenX = (ndcX + 1) * 0.5 * canvasW;
    const screenY = (1 - ndcY) * 0.5 * canvasH;

    const color = obj.material!.color;
    const r = (color.r * 255) | 0;
    const g = (color.g * 255) | 0;
    const b = (color.b * 255) | 0;

    ctx.font = '10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = `rgba(${r},${g},${b},${color.a})`;
    ctx.fillText(obj.label!, screenX, screenY);
  }
}
