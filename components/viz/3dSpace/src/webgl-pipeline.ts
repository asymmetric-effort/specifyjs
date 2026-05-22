// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { RenderPipeline } from './render-pipeline';
import type { SceneGraph } from './scene-graph';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { LightingModel } from './lighting-model';
import type { Light } from './light';
import type { SceneObject } from './scene-object';
import { mat4Multiply } from '../../../math/src/mat4';

/**
 * Convert a Float64Array to Float32Array for WebGL uniform uploads.
 * WebGL expects Float32Array for matrix uniforms.
 */
export function toFloat32(src: Float64Array): Float32Array {
  const dst = new Float32Array(src.length);
  for (let i = 0; i < src.length; i++) {
    dst[i] = src[i]!;
  }
  return dst;
}

/**
 * Compile a WebGL shader from source.
 * @param gl - The WebGL rendering context.
 * @param type - gl.VERTEX_SHADER or gl.FRAGMENT_SHADER.
 * @param source - GLSL source code.
 * @returns The compiled shader.
 * @throws Error if compilation fails.
 */
export function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) {
    throw new Error('Failed to create shader');
  }
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const info = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`Shader compilation failed: ${info}`);
  }
  return shader;
}

/**
 * Link a vertex and fragment shader into a program.
 * @param gl - The WebGL rendering context.
 * @param vertexShader - Compiled vertex shader.
 * @param fragmentShader - Compiled fragment shader.
 * @returns The linked program.
 * @throws Error if linking fails.
 */
export function linkProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader,
): WebGLProgram {
  const program = gl.createProgram();
  if (!program) {
    throw new Error('Failed to create program');
  }
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const info = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`Program link failed: ${info}`);
  }
  return program;
}

/**
 * Set a uniform value on a WebGL program. Supports vec4 (number[]) and mat4 (Float32Array).
 * @param gl - The WebGL rendering context.
 * @param program - The active WebGL program.
 * @param name - Uniform name.
 * @param value - Uniform value.
 */
export function setUniform(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  name: string,
  value: unknown,
): void {
  const location = gl.getUniformLocation(program, name);
  if (location === null) {
    return; // Uniform may have been optimized out by the driver
  }
  if (value instanceof Float32Array && value.length === 16) {
    gl.uniformMatrix4fv(location, false, value);
  } else if (Array.isArray(value)) {
    if (value.length === 4) {
      gl.uniform4fv(location, new Float32Array(value as number[]));
    } else if (value.length === 3) {
      gl.uniform3fv(location, new Float32Array(value as number[]));
    } else if (value.length === 2) {
      gl.uniform2fv(location, new Float32Array(value as number[]));
    } else if (value.length === 1) {
      gl.uniform1f(location, (value as number[])[0]!);
    }
  } else if (typeof value === 'number') {
    gl.uniform1f(location, value);
  }
}

/** WebGL-based render pipeline implementing the RenderPipeline interface. */
export class WebGLPipeline implements RenderPipeline {
  name = 'webgl';

  private gl: WebGLRenderingContext | null = null;
  private shaderCache: Map<string, WebGLProgram> = new Map();

  initialize(canvas: HTMLCanvasElement): void {
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) {
      throw new Error('WebGL not available');
    }
    this.gl = gl as WebGLRenderingContext;
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.clearColor(0, 0, 0, 1);
  }

  dispose(): void {
    if (!this.gl) return;
    for (const program of this.shaderCache.values()) {
      this.gl.deleteProgram(program);
    }
    this.shaderCache.clear();
    this.gl = null;
  }

  render(
    scene: SceneGraph,
    camera: Camera,
    viewport: Viewport,
    lighting: LightingModel,
    lights?: Light[],
  ): void {
    const gl = this.gl;
    if (!gl) {
      throw new Error('WebGLPipeline not initialized');
    }

    // 1. Set viewport
    gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);

    // 2. Clear with viewport clear color
    const cc = viewport.clearColor;
    gl.clearColor(cc.r, cc.g, cc.b, cc.a);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 3. Get or compile shader program
    const program = this.getOrCompileProgram(lighting);
    gl.useProgram(program);

    // 4. Get view and projection matrices from camera
    const viewData = camera.getViewMatrix();
    const projData = camera.getProjectionMatrix();

    // Set view and projection matrix uniforms if the shader uses them
    setUniform(gl, program, 'uViewMatrix', toFloat32(viewData));
    setUniform(gl, program, 'uProjectionMatrix', toFloat32(projData));

    // 5. Traverse scene and render visible objects with meshes
    const activeLights = lights ?? [];
    const objects = scene.getVisibleObjects();
    for (let i = 0; i < objects.length; i++) {
      this.renderObject(gl, program, objects[i]!, viewData, projData, lighting, activeLights);
    }
  }

  /**
   * Get a cached shader program or compile a new one from the lighting model's source.
   */
  private getOrCompileProgram(lighting: LightingModel): WebGLProgram {
    const gl = this.gl!;
    const cached = this.shaderCache.get(lighting.name);
    if (cached) return cached;

    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, lighting.vertexShaderSource());
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, lighting.fragmentShaderSource());
    const program = linkProgram(gl, vertexShader, fragmentShader);

    // Shaders can be detached/deleted after linking
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    this.shaderCache.set(lighting.name, program);
    return program;
  }

  /**
   * Render a single scene object.
   */
  private renderObject(
    gl: WebGLRenderingContext,
    program: WebGLProgram,
    obj: SceneObject,
    viewData: Float64Array,
    projData: Float64Array,
    lighting: LightingModel,
    lights: Light[],
  ): void {
    if (!obj.mesh || !obj.material) return;

    const mesh = obj.mesh;
    const material = obj.material;

    // Compute model matrix
    const modelData = obj.getWorldMatrix();

    // Compute model-view-projection matrix: MVP = proj * view * model
    const mv = mat4Multiply(viewData, modelData);
    const mvp = mat4Multiply(projData, mv);

    // Set the MVP uniform (used by FlatShading and similar models)
    setUniform(gl, program, 'uModelViewProjection', toFloat32(mvp));

    // Set individual matrix uniforms for more advanced shaders (matches LambertianShading's uModel)
    setUniform(gl, program, 'uModel', toFloat32(modelData));

    // Set lighting model uniforms (e.g., uColor for FlatShading, light params for Lambertian)
    const uniforms = lighting.uniforms(lights, material);
    const uniformNames = Object.keys(uniforms);
    for (let i = 0; i < uniformNames.length; i++) {
      const name = uniformNames[i]!;
      const value = uniforms[name];
      if (Array.isArray(value)) {
        setUniform(gl, program, name, value);
      } else if (typeof value === 'number') {
        setUniform(gl, program, name, value);
      }
    }

    // Upload vertex positions
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW);

    const aPosition = gl.getAttribLocation(program, 'aPosition');
    if (aPosition >= 0) {
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 3, gl.FLOAT, false, 0, 0);
    }

    // Upload normals
    const normalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, mesh.normals, gl.STATIC_DRAW);

    const aNormal = gl.getAttribLocation(program, 'aNormal');
    if (aNormal >= 0) {
      gl.enableVertexAttribArray(aNormal);
      gl.vertexAttribPointer(aNormal, 3, gl.FLOAT, false, 0, 0);
    }

    // Upload indices and draw
    const indexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);

    // WebGL1 requires Uint16Array for element indices unless OES_element_index_uint is available
    const hasUint32 = gl.getExtension('OES_element_index_uint');
    if (hasUint32) {
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
      const drawMode = material.wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawElements(drawMode, mesh.indexCount, gl.UNSIGNED_INT, 0);
    } else {
      const indices16 = new Uint16Array(mesh.indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices16, gl.STATIC_DRAW);
      const drawMode = material.wireframe ? gl.LINES : gl.TRIANGLES;
      gl.drawElements(drawMode, mesh.indexCount, gl.UNSIGNED_SHORT, 0);
    }

    // Clean up buffers (v1: re-create each frame)
    gl.deleteBuffer(positionBuffer);
    gl.deleteBuffer(normalBuffer);
    gl.deleteBuffer(indexBuffer);
  }
}
