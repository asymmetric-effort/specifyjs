// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Color, ShadeParams } from './types';
import type { Light } from './light';
import type { Material } from './material';

/** Pluggable lighting model interface. */
export interface LightingModel {
  name: string;
  vertexShaderSource(): string;
  fragmentShaderSource(): string;
  shade(params: ShadeParams): Color;
  uniforms(lights: Light[], material: Material): Record<string, unknown>;
}

/**
 * Flat shading: returns the material color unchanged.
 * No diffuse/specular computation.
 */
export class FlatShading implements LightingModel {
  readonly name = 'FlatShading';

  vertexShaderSource(): string {
    return `
      attribute vec3 aPosition;
      uniform mat4 uModelViewProjection;
      void main() {
        gl_Position = uModelViewProjection * vec4(aPosition, 1.0);
      }
    `;
  }

  fragmentShaderSource(): string {
    return `
      precision mediump float;
      uniform vec4 uColor;
      void main() {
        gl_FragColor = uColor;
      }
    `;
  }

  shade(params: ShadeParams): Color {
    return { ...params.materialColor };
  }

  uniforms(_lights: Light[], material: Material): Record<string, unknown> {
    return {
      uColor: [material.color.r, material.color.g, material.color.b, material.color.a],
    };
  }
}
