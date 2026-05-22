// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { WebGLPipeline, toFloat32, compileShader, linkProgram, setUniform } from '../src/webgl-pipeline';
import { FlatShading } from '../src/lighting-model';
import { SceneGraph } from '../src/scene-graph';
import { SceneObject } from '../src/scene-object';
import { Camera } from '../src/camera';
import { Viewport } from '../src/viewport';
import { Mesh } from '../src/mesh';
import { createMaterial } from '../src/material';

describe('WebGLPipeline', () => {
  describe('class instantiation', () => {
    it('creates an instance with name "webgl"', () => {
      const pipeline = new WebGLPipeline();
      expect(pipeline.name).toBe('webgl');
    });

    it('implements all RenderPipeline methods', () => {
      const pipeline = new WebGLPipeline();
      expect(typeof pipeline.initialize).toBe('function');
      expect(typeof pipeline.dispose).toBe('function');
      expect(typeof pipeline.render).toBe('function');
    });
  });

  describe('initialize', () => {
    it('throws when WebGL is not available', () => {
      const canvas = {
        getContext: fn().mockReturnValue(null),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      expect(() => pipeline.initialize(canvas)).toThrow('WebGL not available');
      expect(canvas.getContext).toHaveBeenCalledWith('webgl', { preserveDrawingBuffer: true });
    });

    it('falls back to experimental-webgl if webgl context is null', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn((name: string, _opts?: object) => {
          if (name === 'experimental-webgl') return mockGl;
          return null;
        }),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);
      expect(canvas.getContext).toHaveBeenCalledWith('webgl', { preserveDrawingBuffer: true });
      expect(canvas.getContext).toHaveBeenCalledWith('experimental-webgl', { preserveDrawingBuffer: true });
    });

    it('enables depth testing and sets clear color on initialize', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      expect(mockGl.enable).toHaveBeenCalledWith(mockGl.DEPTH_TEST);
      expect(mockGl.clearColor).toHaveBeenCalledWith(0, 0, 0, 1);
    });
  });

  describe('dispose', () => {
    it('deletes cached programs on dispose', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      // Render to create a cached program
      const scene = new SceneGraph();
      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();
      pipeline.render(scene, cam, vp, lighting);

      pipeline.dispose();
      expect(mockGl.deleteProgram).toHaveBeenCalled();
    });

    it('is safe to call dispose without initialization', () => {
      const pipeline = new WebGLPipeline();
      expect(() => pipeline.dispose()).not.toThrow();
    });

    it('is safe to call dispose multiple times', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);
      pipeline.dispose();
      expect(() => pipeline.dispose()).not.toThrow();
    });
  });

  describe('render', () => {
    it('throws if not initialized', () => {
      const pipeline = new WebGLPipeline();
      const scene = new SceneGraph();
      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();
      expect(() => pipeline.render(scene, cam, vp, lighting)).toThrow('WebGLPipeline not initialized');
    });

    it('sets viewport and clears buffers', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const cam = new Camera();
      const vp = new Viewport({
        x: 10,
        y: 20,
        width: 640,
        height: 480,
        camera: cam,
        clearColor: { r: 0.5, g: 0.6, b: 0.7, a: 1 },
      });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.viewport).toHaveBeenCalledWith(10, 20, 640, 480);
      expect(mockGl.clearColor).toHaveBeenCalledWith(0.5, 0.6, 0.7, 1);
      expect(mockGl.clear).toHaveBeenCalledWith(
        mockGl.COLOR_BUFFER_BIT | mockGl.DEPTH_BUFFER_BIT,
      );
    });

    it('compiles and caches shader program from lighting model', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      // First render compiles the shader
      pipeline.render(scene, cam, vp, lighting);
      const firstCallCount = mockGl.createShader.mock.calls.length;
      expect(firstCallCount).toBe(2); // vertex + fragment

      // Second render reuses cached program
      pipeline.render(scene, cam, vp, lighting);
      expect(mockGl.createShader.mock.calls.length).toBe(firstCallCount);
    });

    it('renders visible scene objects with mesh and material', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('box');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      // Should have created buffers and drawn elements
      expect(mockGl.createBuffer).toHaveBeenCalled();
      expect(mockGl.bufferData).toHaveBeenCalled();
      expect(mockGl.drawElements).toHaveBeenCalled();
    });

    it('skips objects without mesh', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('noMesh');
      obj.material = createMaterial({ r: 1, g: 1, b: 1, a: 1 });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.drawElements).not.toHaveBeenCalled();
    });

    it('skips objects without material', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('noMaterial');
      obj.mesh = Mesh.createBox(1, 1, 1);
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.drawElements).not.toHaveBeenCalled();
    });

    it('skips invisible objects', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('hidden');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      obj.visible = false;
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.drawElements).not.toHaveBeenCalled();
    });

    it('uses wireframe draw mode when material has wireframe enabled', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('wireBox');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 }, { wireframe: true });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.drawElements).toHaveBeenCalledWith(
        mockGl.LINES,
        expect.any(Number),
        expect.any(Number),
        0,
      );
    });

    it('cleans up buffers after rendering each object', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('box');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      // 3 buffers: position, normal, index
      expect(mockGl.deleteBuffer).toHaveBeenCalledTimes(3);
    });
  });
});

describe('toFloat32', () => {
  it('converts Float64Array to Float32Array', () => {
    const src = new Float64Array([1.0, 2.5, 3.7, 0]);
    const result = toFloat32(src);
    expect(result).toBeInstanceOf(Float32Array);
    expect(result.length).toBe(4);
    expect(result[0]).toBeCloseTo(1.0);
    expect(result[1]).toBeCloseTo(2.5);
    expect(result[2]).toBeCloseTo(3.7);
    expect(result[3]).toBeCloseTo(0);
  });

  it('handles 16-element matrix data', () => {
    const identity = new Float64Array(16);
    identity[0] = 1;
    identity[5] = 1;
    identity[10] = 1;
    identity[15] = 1;
    const result = toFloat32(identity);
    expect(result.length).toBe(16);
    expect(result[0]).toBe(1);
    expect(result[5]).toBe(1);
    expect(result[10]).toBe(1);
    expect(result[15]).toBe(1);
  });

  it('handles empty array', () => {
    const result = toFloat32(new Float64Array(0));
    expect(result.length).toBe(0);
  });

  it('preserves values accurately', () => {
    const src = new Float64Array([0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
    const result = toFloat32(src);
    expect(result.length).toBe(8);
    for (let i = 0; i < src.length; i++) {
      expect(result[i]).toBeCloseTo(src[i]!, 5);
    }
  });

  it('handles large values', () => {
    const src = new Float64Array([1e10, -1e10, 3.14159265358979]);
    const result = toFloat32(src);
    expect(result[0]).toBeCloseTo(1e10, -5);
    expect(result[1]).toBeCloseTo(-1e10, -5);
    expect(result[2]).toBeCloseTo(3.14159, 4);
  });

  it('handles single element', () => {
    const src = new Float64Array([42.5]);
    const result = toFloat32(src);
    expect(result.length).toBe(1);
    expect(result[0]).toBeCloseTo(42.5);
  });
});

describe('FlatShading shader sources', () => {
  it('generates vertex shader source with aPosition attribute', () => {
    const shading = new FlatShading();
    const src = shading.vertexShaderSource();
    expect(src).toContain('aPosition');
    expect(src).toContain('uModelViewProjection');
    expect(src).toContain('gl_Position');
  });

  it('generates fragment shader source with uColor uniform', () => {
    const shading = new FlatShading();
    const src = shading.fragmentShaderSource();
    expect(src).toContain('uColor');
    expect(src).toContain('gl_FragColor');
  });

  it('returns material color as uniform', () => {
    const shading = new FlatShading();
    const material = createMaterial({ r: 0.5, g: 0.3, b: 0.8, a: 1.0 });
    const result = shading.uniforms([], material);
    expect(result['uColor']).toEqual([0.5, 0.3, 0.8, 1.0]);
  });
});

describe('compileShader', () => {
  it('throws when createShader returns null', () => {
    const gl = createMockGl();
    gl.createShader.mockReturnValue(null);
    expect(() => compileShader(gl as unknown as WebGLRenderingContext, gl.VERTEX_SHADER, 'void main(){}')).toThrow(
      'Failed to create shader',
    );
  });

  it('throws with info log when compilation fails', () => {
    const gl = createMockGl();
    gl.getShaderParameter.mockReturnValue(false);
    gl.getShaderInfoLog.mockReturnValue('syntax error at line 1');
    expect(() => compileShader(gl as unknown as WebGLRenderingContext, gl.VERTEX_SHADER, 'bad')).toThrow(
      'Shader compilation failed: syntax error at line 1',
    );
    expect(gl.deleteShader).toHaveBeenCalled();
  });

  it('returns shader on success', () => {
    const gl = createMockGl();
    const result = compileShader(gl as unknown as WebGLRenderingContext, gl.VERTEX_SHADER, 'void main(){}');
    expect(result).toBe('mockShader');
  });
});

describe('linkProgram', () => {
  it('throws when createProgram returns null', () => {
    const gl = createMockGl();
    gl.createProgram.mockReturnValue(null);
    expect(() => linkProgram(gl as unknown as WebGLRenderingContext, 'vs' as unknown as WebGLShader, 'fs' as unknown as WebGLShader)).toThrow(
      'Failed to create program',
    );
  });

  it('throws with info log when linking fails', () => {
    const gl = createMockGl();
    gl.getProgramParameter.mockReturnValue(false);
    gl.getProgramInfoLog.mockReturnValue('link error');
    expect(() => linkProgram(gl as unknown as WebGLRenderingContext, 'vs' as unknown as WebGLShader, 'fs' as unknown as WebGLShader)).toThrow(
      'Program link failed: link error',
    );
    expect(gl.deleteProgram).toHaveBeenCalled();
  });

  it('returns program on success', () => {
    const gl = createMockGl();
    const result = linkProgram(gl as unknown as WebGLRenderingContext, 'vs' as unknown as WebGLShader, 'fs' as unknown as WebGLShader);
    expect(result).toBe('mockProgram');
  });
});

describe('setUniform', () => {
  it('sets mat4 uniform with Float32Array of length 16', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    const mat = new Float32Array(16);
    mat[0] = 1;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uMatrix', mat);
    expect(gl.uniformMatrix4fv).toHaveBeenCalledWith('mockLocation', false, mat);
  });

  it('sets vec4 uniform from array of length 4', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uColor', [1, 0, 0, 1]);
    expect(gl.uniform4fv).toHaveBeenCalled();
  });

  it('sets vec3 uniform from array of length 3', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uDir', [1, 0, 0]);
    expect(gl.uniform3fv).toHaveBeenCalled();
  });

  it('sets vec2 uniform from array of length 2', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uOffset', [0.5, 0.5]);
    expect(gl.uniform2fv).toHaveBeenCalled();
  });

  it('sets float uniform from number', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uIntensity', 0.8);
    expect(gl.uniform1f).toHaveBeenCalledWith('mockLocation', 0.8);
  });

  it('sets float uniform from array of length 1', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uVal', [42]);
    expect(gl.uniform1f).toHaveBeenCalledWith('mockLocation', 42);
  });

  it('does nothing if uniform location is null (optimized out)', () => {
    const gl = createMockGl();
    gl.getUniformLocation.mockReturnValue(null);
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uMissing', [1, 0, 0, 1]);
    expect(gl.uniform4fv).not.toHaveBeenCalled();
  });
});

describe('WebGLPipeline (additional)', () => {
  describe('render with Uint16 fallback (no OES_element_index_uint)', () => {
    it('falls back to Uint16Array indices when extension is not available', () => {
      const mockGl = createMockGl();
      mockGl.getExtension.mockReturnValue(null);
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('box');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      expect(mockGl.drawElements).toHaveBeenCalledWith(
        mockGl.TRIANGLES,
        expect.any(Number),
        mockGl.UNSIGNED_SHORT,
        0,
      );
    });
  });

  describe('render with multiple objects', () => {
    it('renders multiple objects in sequence', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj1 = new SceneObject('box1');
      obj1.mesh = Mesh.createBox(1, 1, 1);
      obj1.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj1);

      const obj2 = new SceneObject('box2');
      obj2.mesh = Mesh.createBox(2, 2, 2);
      obj2.material = createMaterial({ r: 0, g: 1, b: 0, a: 1 });
      obj2.position = { x: 5, y: 0, z: 0 };
      scene.register(obj2);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      // Should draw two objects: 2 calls to drawElements
      expect(mockGl.drawElements).toHaveBeenCalledTimes(2);
      // Should create and delete 6 buffers (3 per object)
      expect(mockGl.deleteBuffer).toHaveBeenCalledTimes(6);
    });
  });

  describe('render handles attrib location -1', () => {
    it('skips enableVertexAttribArray when attrib location is -1', () => {
      const mockGl = createMockGl();
      mockGl.getAttribLocation.mockReturnValue(-1);
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('box');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      pipeline.render(scene, cam, vp, lighting);

      // Should not enable vertex attrib arrays when location is -1
      expect(mockGl.enableVertexAttribArray).not.toHaveBeenCalled();
    });
  });

  describe('dispose after render clears cache', () => {
    it('deletes all cached programs on dispose', () => {
      const mockGl = createMockGl();
      const canvas = {
        getContext: fn().mockReturnValue(mockGl),
      } as unknown as HTMLCanvasElement;

      const pipeline = new WebGLPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const cam = new Camera();
      const vp = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera: cam });
      const lighting = new FlatShading();

      // Render to populate cache
      pipeline.render(scene, cam, vp, lighting);

      pipeline.dispose();
      expect(mockGl.deleteProgram).toHaveBeenCalledWith('mockProgram');

      // After dispose, render should throw
      expect(() => pipeline.render(scene, cam, vp, lighting)).toThrow('WebGLPipeline not initialized');
    });
  });
});

describe('setUniform (additional)', () => {
  it('ignores unsupported value types', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    // Passing a string should not call any uniform setter
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uVal', 'not_a_number');
    expect(gl.uniform1f).not.toHaveBeenCalled();
    expect(gl.uniform4fv).not.toHaveBeenCalled();
    expect(gl.uniformMatrix4fv).not.toHaveBeenCalled();
  });

  it('handles Float32Array of non-16 length (no-op for non-mat4)', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    const val = new Float32Array([1, 2, 3, 4]);
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uVal', val);
    // Float32Array of length 4 is NOT treated as mat4
    expect(gl.uniformMatrix4fv).not.toHaveBeenCalled();
  });

  it('handles empty array (no-op)', () => {
    const gl = createMockGl();
    const program = 'mockProgram' as unknown as WebGLProgram;
    setUniform(gl as unknown as WebGLRenderingContext, program, 'uVal', []);
    expect(gl.uniform1f).not.toHaveBeenCalled();
    expect(gl.uniform2fv).not.toHaveBeenCalled();
    expect(gl.uniform3fv).not.toHaveBeenCalled();
    expect(gl.uniform4fv).not.toHaveBeenCalled();
  });
});

/**
 * Create a mock WebGL rendering context for testing.
 */
function createMockGl() {
  return {
    VERTEX_SHADER: 35633,
    FRAGMENT_SHADER: 35632,
    DEPTH_TEST: 2929,
    COLOR_BUFFER_BIT: 16384,
    DEPTH_BUFFER_BIT: 256,
    ARRAY_BUFFER: 34962,
    ELEMENT_ARRAY_BUFFER: 34963,
    STATIC_DRAW: 35044,
    FLOAT: 5126,
    UNSIGNED_INT: 5125,
    UNSIGNED_SHORT: 5123,
    TRIANGLES: 4,
    LINES: 1,
    COMPILE_STATUS: 35713,
    LINK_STATUS: 35714,
    enable: fn(),
    clearColor: fn(),
    clear: fn(),
    viewport: fn(),
    createShader: fn().mockReturnValue('mockShader'),
    shaderSource: fn(),
    compileShader: fn(),
    getShaderParameter: fn().mockReturnValue(true),
    getShaderInfoLog: fn().mockReturnValue(''),
    deleteShader: fn(),
    createProgram: fn().mockReturnValue('mockProgram'),
    attachShader: fn(),
    linkProgram: fn(),
    getProgramParameter: fn().mockReturnValue(true),
    getProgramInfoLog: fn().mockReturnValue(''),
    deleteProgram: fn(),
    useProgram: fn(),
    getUniformLocation: fn().mockReturnValue('mockLocation'),
    uniformMatrix4fv: fn(),
    uniform4fv: fn(),
    uniform3fv: fn(),
    uniform2fv: fn(),
    uniform1f: fn(),
    getAttribLocation: fn().mockReturnValue(0),
    enableVertexAttribArray: fn(),
    vertexAttribPointer: fn(),
    createBuffer: fn().mockReturnValue('mockBuffer'),
    bindBuffer: fn(),
    bufferData: fn(),
    deleteBuffer: fn(),
    drawElements: fn(),
    getExtension: fn().mockReturnValue(true),
  };
}
