// @vitest-environment node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from '@asymmetric-effort/nogginlessdom';
import { createPipelineSync } from '../src/pipeline-factory';

describe('pipeline-factory', () => {
  describe('createPipelineSync', () => {
    it('returns a CpuPipeline', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 1,
        globalAlpha: 1,
      };
      const canvas = {
        getContext: vi.fn((type: string) => {
          if (type === '2d') return ctx;
          return null;
        }),
      } as unknown as HTMLCanvasElement;

      const pipeline = createPipelineSync(canvas);
      expect(pipeline).toBeDefined();
      expect(pipeline.name).toBe('cpu');
      expect(typeof pipeline.render).toBe('function');
      expect(typeof pipeline.dispose).toBe('function');
    });

    it('pipeline is ready to render after creation', () => {
      const ctx = {
        save: vi.fn(),
        restore: vi.fn(),
        beginPath: vi.fn(),
        rect: vi.fn(),
        clip: vi.fn(),
        fillRect: vi.fn(),
        fillText: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        closePath: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        fillStyle: '',
        strokeStyle: '',
        font: '',
        textAlign: '',
        textBaseline: '',
        lineWidth: 1,
        globalAlpha: 1,
      };
      const canvas = {
        getContext: vi.fn(() => ctx),
      } as unknown as HTMLCanvasElement;

      const { SceneGraph } = require('../src/scene-graph');
      const { Camera } = require('../src/camera');
      const { Viewport } = require('../src/viewport');
      const { FlatShading } = require('../src/lighting-model');

      const pipeline = createPipelineSync(canvas);
      const scene = new SceneGraph();
      const camera = new Camera({ position: { x: 0, y: 5, z: 10 } });
      const viewport = new Viewport({ x: 0, y: 0, width: 800, height: 600, camera });
      const lighting = new FlatShading();

      expect(() => pipeline.render(scene, camera, viewport, lighting)).not.toThrow();
    });
  });
});
