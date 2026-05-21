// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Camera } from './camera';
import type { Color } from './types';

/** A viewport defines the screen rectangle and associated camera. */
export class Viewport {
  x: number;
  y: number;
  width: number;
  height: number;
  camera: Camera;
  clearColor: Color;

  constructor(options: {
    x: number;
    y: number;
    width: number;
    height: number;
    camera: Camera;
    clearColor?: Color;
  }) {
    this.x = options.x;
    this.y = options.y;
    this.width = options.width;
    this.height = options.height;
    this.camera = options.camera;
    this.clearColor = options.clearColor ?? { r: 0, g: 0, b: 0, a: 1 };
  }
}
