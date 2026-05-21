// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import { CpuPipeline } from '../src/cpu-pipeline';
import { SceneGraph } from '../src/scene-graph';
import { Camera } from '../src/camera';
import { Viewport } from '../src/viewport';
import { FlatShading } from '../src/lighting-model';

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

  it('can process empty scene without error', () => {
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
});
