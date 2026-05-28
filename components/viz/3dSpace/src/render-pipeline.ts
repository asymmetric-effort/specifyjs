// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { SceneGraph } from './scene-graph';
import type { Camera } from './camera';
import type { Viewport } from './viewport';
import type { LightingModel } from './lighting-model';
import type { Light } from './light';

/** Pluggable render pipeline interface. */
export interface RenderPipeline {
  name: string;
  initialize(canvas: HTMLCanvasElement): void;
  /** Async initialization for pipelines that need it (e.g., WebGPU). */
  initializeAsync?(canvas: HTMLCanvasElement): Promise<void>;
  dispose(): void;
  render(scene: SceneGraph, camera: Camera, viewport: Viewport, lighting: LightingModel, lights?: Light[]): void;
}
