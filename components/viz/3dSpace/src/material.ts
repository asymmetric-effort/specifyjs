// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Color, Texture } from './types';

/** Material definition for a scene object. */
export interface Material {
  color: Color;
  texture?: Texture;
  wireframe: boolean;
}

/** Create a default material with the given color. */
export function createMaterial(color: Color, options?: { texture?: Texture; wireframe?: boolean }): Material {
  return {
    color,
    texture: options?.texture,
    wireframe: options?.wireframe ?? false,
  };
}
