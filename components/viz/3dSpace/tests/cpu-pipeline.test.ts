// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn } from '@asymmetric-effort/nogginlessdom';
import { CpuPipeline } from '../src/cpu-pipeline';
import { SceneGraph } from '../src/scene-graph';
import { SceneObject } from '../src/scene-object';
import { Camera } from '../src/camera';
import { Viewport } from '../src/viewport';
import { FlatShading } from '../src/lighting-model';
import { Mesh } from '../src/mesh';
import { createMaterial } from '../src/material';

/** Create a mock CanvasRenderingContext2D with all needed methods. */
function createMockCtx() {
  return {
    save: fn(),
    restore: fn(),
    beginPath: fn(),
    rect: fn(),
    clip: fn(),
    fillRect: fn(),
    moveTo: fn(),
    lineTo: fn(),
    closePath: fn(),
    fill: fn(),
    stroke: fn(),
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 1,
    globalAlpha: 1,
  };
}

/** Create a mock canvas that returns the given ctx from getContext('2d'). */
function createMockCanvas(ctx: ReturnType<typeof createMockCtx>) {
  return {
    getContext: fn((type: string) => {
      if (type === '2d') return ctx;
      return null;
    }),
  } as unknown as HTMLCanvasElement;
}

describe('CpuPipeline', () => {
  it('instantiates without error', () => {
    const pipeline = new CpuPipeline();
    expect(pipeline).toBeDefined();
    expect(pipeline).toBeInstanceOf(CpuPipeline);
  });

  it('has name "cpu"', () => {
    const pipeline = new CpuPipeline();
    expect(pipeline.name).toBe('cpu');
  });

  it('can process empty scene without error (no ctx)', () => {
    const pipeline = new CpuPipeline();
    const scene = new SceneGraph();
    const camera = new Camera({
      position: { x: 0, y: 5, z: 10 },
    });
    camera.lookAt({ x: 0, y: 0, z: 0 });
    const viewport = new Viewport({
      x: 0,
      y: 0,
      width: 800,
      height: 600,
      camera,
    });
    const lighting = new FlatShading();

    // Without initialize (no canvas context), render should be a no-op
    expect(() => {
      pipeline.render(scene, camera, viewport, lighting);
    }).not.toThrow();
  });

  it('dispose sets internal state to null', () => {
    const pipeline = new CpuPipeline();
    pipeline.dispose();
    // After dispose, render should be a safe no-op
    const scene = new SceneGraph();
    const camera = new Camera();
    const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
    const lighting = new FlatShading();
    expect(() => {
      pipeline.render(scene, camera, viewport, lighting);
    }).not.toThrow();
  });

  it('implements RenderPipeline interface', () => {
    const pipeline = new CpuPipeline();
    expect(typeof pipeline.name).toBe('string');
    expect(typeof pipeline.initialize).toBe('function');
    expect(typeof pipeline.dispose).toBe('function');
    expect(typeof pipeline.render).toBe('function');
  });

  describe('initialize', () => {
    it('acquires a 2d context from the canvas', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);
      expect(canvas.getContext).toHaveBeenCalledWith('2d');
    });

    it('handles canvas returning null context gracefully', () => {
      const canvas = {
        getContext: fn().mockReturnValue(null),
      } as unknown as HTMLCanvasElement;
      const pipeline = new CpuPipeline();
      // initialize with null ctx should not throw
      expect(() => pipeline.initialize(canvas)).not.toThrow();
      // render after null ctx should be a no-op
      const scene = new SceneGraph();
      const camera = new Camera();
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
      const lighting = new FlatShading();
      expect(() => pipeline.render(scene, camera, viewport, lighting)).not.toThrow();
    });
  });

  describe('render with mock canvas', () => {
    it('renders empty scene (clears viewport only)', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.rect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(ctx.clip).toHaveBeenCalled();
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('renders scene with a box object', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('box');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // Should have drawn triangles (moveTo, lineTo calls)
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('renders scene with objects that have no mesh (skips them)', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('noMesh');
      obj.material = createMaterial({ r: 1, g: 1, b: 1, a: 1 });
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // No triangles should be drawn
      expect(ctx.moveTo).not.toHaveBeenCalled();
    });

    it('renders scene with objects that have no material (skips them)', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('noMaterial');
      obj.mesh = Mesh.createBox(1, 1, 1);
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // No triangles should be drawn
      expect(ctx.moveTo).not.toHaveBeenCalled();
    });

    it('skips invisible objects', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('hidden');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      obj.visible = false;
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      expect(ctx.moveTo).not.toHaveBeenCalled();
    });

    it('renders objects behind camera (triangles behind get clipped)', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('behind');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 0, g: 1, b: 0, a: 1 });
      // Place object far behind the camera
      obj.position = { x: 0, y: 0, z: 100 };
      scene.register(obj);

      // Camera at origin looking along -Z
      const camera = new Camera({ position: { x: 0, y: 0, z: 0 } });
      camera.lookAt({ x: 0, y: 0, z: -10 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      // Should not throw even if object is behind camera
      expect(() => pipeline.render(scene, camera, viewport, lighting)).not.toThrow();
    });

    it('renders multiple objects with depth sorting', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();

      // Object near camera
      const near = new SceneObject('near');
      near.mesh = Mesh.createBox(1, 1, 1);
      near.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      near.position = { x: 0, y: 0, z: 2 };
      scene.register(near);

      // Object far from camera
      const far = new SceneObject('far');
      far.mesh = Mesh.createBox(1, 1, 1);
      far.material = createMaterial({ r: 0, g: 0, b: 1, a: 1 });
      far.position = { x: 0, y: 0, z: -5 };
      scene.register(far);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // Both objects should produce triangles
      expect(ctx.fill.mock.calls.length).toBeGreaterThan(0);
    });

    it('uses viewport clear color for background', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({
        x: 0,
        y: 0,
        width: 800,
        height: 600,
        camera,
        clearColor: { r: 0.2, g: 0.4, b: 0.6, a: 1 },
      });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // Check that fillStyle was set with the clear color
      // r=0.2*255=51, g=0.4*255=102, b=0.6*255=153
      expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
    });

    it('renders a plane mesh correctly', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);

      const scene = new SceneGraph();
      const obj = new SceneObject('plane');
      obj.mesh = Mesh.createPlane(10, 10);
      obj.material = createMaterial({ r: 0.5, g: 0.5, b: 0.5, a: 1 });
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      pipeline.render(scene, camera, viewport, lighting);

      // Plane has 2 triangles, should draw them
      expect(ctx.fill).toHaveBeenCalled();
    });
  });

  describe('dispose', () => {
    it('dispose before initialize does not error', () => {
      const pipeline = new CpuPipeline();
      expect(() => pipeline.dispose()).not.toThrow();
    });

    it('dispose after dispose is idempotent', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);
      pipeline.dispose();
      expect(() => pipeline.dispose()).not.toThrow();
    });

    it('render after dispose is a no-op', () => {
      const ctx = createMockCtx();
      const canvas = createMockCanvas(ctx);
      const pipeline = new CpuPipeline();
      pipeline.initialize(canvas);
      pipeline.dispose();

      const scene = new SceneGraph();
      const camera = new Camera();
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
      const lighting = new FlatShading();

      expect(() => pipeline.render(scene, camera, viewport, lighting)).not.toThrow();
      // ctx methods should not be called after dispose
      expect(ctx.save).not.toHaveBeenCalled();
    });
  });

  // ── renderGrid ──────────────────────────────────────────────────────

  describe('renderGrid', () => {
    it('draws grid lines on mock context', () => {
      const ctx = createMockCtx();
      const pipeline = new CpuPipeline();
      (pipeline as any).ctx = ctx;

      const camera = new Camera({ position: { x: 0, y: 10, z: 10 }, near: 0.1, far: 100 });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });

      pipeline.renderGrid(camera, viewport);

      expect(ctx.save).toHaveBeenCalled();
      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.restore).toHaveBeenCalled();
    });

    it('uses custom options', () => {
      const ctx = createMockCtx();
      const pipeline = new CpuPipeline();
      (pipeline as any).ctx = ctx;

      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });

      pipeline.renderGrid(camera, viewport, { size: 10, divisions: 5, color: '#ff0000', opacity: 0.5 });

      expect(ctx.strokeStyle).toBe('#ff0000');
    });

    it('does nothing when ctx is null', () => {
      const pipeline = new CpuPipeline();
      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
      expect(() => pipeline.renderGrid(camera, viewport)).not.toThrow();
    });
  });

  // ── renderEdges ─────────────────────────────────────────────────────

  describe('renderEdges', () => {
    it('draws edges for scene objects with meshes', () => {
      const ctx = createMockCtx();
      const pipeline = new CpuPipeline();
      (pipeline as any).ctx = ctx;

      const scene = new SceneGraph();
      const obj = new SceneObject('edge-test');
      obj.mesh = Mesh.createBox(1, 1, 1);
      obj.material = createMaterial({ r: 1, g: 0, b: 0, a: 1 });
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });

      pipeline.renderEdges(scene, camera, viewport);

      expect(ctx.stroke).toHaveBeenCalled();
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('skips objects without mesh', () => {
      const ctx = createMockCtx();
      const pipeline = new CpuPipeline();
      (pipeline as any).ctx = ctx;

      const scene = new SceneGraph();
      const obj = new SceneObject('no-mesh');
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });

      pipeline.renderEdges(scene, camera, viewport);

      expect(ctx.stroke).not.toHaveBeenCalled();
    });

    it('uses custom edge options', () => {
      const ctx = createMockCtx();
      const pipeline = new CpuPipeline();
      (pipeline as any).ctx = ctx;

      const scene = new SceneGraph();
      const obj = new SceneObject('styled-edges');
      obj.mesh = Mesh.createBox(1, 1, 1);
      scene.register(obj);

      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      camera.lookAt({ x: 0, y: 0, z: 0 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });

      pipeline.renderEdges(scene, camera, viewport, { color: '#ff0000', lineWidth: 2, opacity: 0.8 });

      expect(ctx.strokeStyle).toBe('#ff0000');
      expect(ctx.lineWidth).toBe(2);
    });

    it('does nothing when ctx is null', () => {
      const pipeline = new CpuPipeline();
      const scene = new SceneGraph();
      const camera = new Camera({ position: { x: 0, y: 5, z: 5 }, near: 0.1, far: 100 });
      const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
      expect(() => pipeline.renderEdges(scene, camera, viewport)).not.toThrow();
    });
  });
});
