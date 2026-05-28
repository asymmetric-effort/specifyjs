// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { WebGPUPipeline } from '../src/webgpu-pipeline';

describe('WebGPUPipeline', () => {
  it('creates an instance with name "webgpu"', () => {
    const pipeline = new WebGPUPipeline();
    expect(pipeline.name).toBe('webgpu');
  });

  it('implements all RenderPipeline methods', () => {
    const pipeline = new WebGPUPipeline();
    expect(typeof pipeline.initialize).toBe('function');
    expect(typeof pipeline.initializeAsync).toBe('function');
    expect(typeof pipeline.dispose).toBe('function');
    expect(typeof pipeline.render).toBe('function');
  });

  it('render is a no-op before initialization', () => {
    const pipeline = new WebGPUPipeline();
    const { SceneGraph } = require('../src/scene-graph');
    const { Camera } = require('../src/camera');
    const { Viewport } = require('../src/viewport');
    const { FlatShading } = require('../src/lighting-model');

    const scene = new SceneGraph();
    const camera = new Camera();
    const viewport = new Viewport({ x: 0, y: 0, width: 100, height: 100, camera });
    const lighting = new FlatShading();

    // Should not throw — just silently return since device is null
    expect(() => pipeline.render(scene, camera, viewport, lighting)).not.toThrow();
  });

  it('dispose is safe to call before initialization', () => {
    const pipeline = new WebGPUPipeline();
    expect(() => pipeline.dispose()).not.toThrow();
  });

  it('dispose is safe to call multiple times', () => {
    const pipeline = new WebGPUPipeline();
    expect(() => {
      pipeline.dispose();
      pipeline.dispose();
    }).not.toThrow();
  });
});
