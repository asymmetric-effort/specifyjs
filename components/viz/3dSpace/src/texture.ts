// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import type { Texture, Color } from './types';

/**
 * Create a solid color texture (single color everywhere).
 */
export function solidTexture(color: Color): Texture {
  return {
    width: 1,
    height: 1,
    sample: () => ({ ...color }),
  };
}

/**
 * Create a checkerboard texture.
 * @param color1 - First color (e.g., white)
 * @param color2 - Second color (e.g., black)
 * @param tilesU - Number of tiles along U axis (default 8)
 * @param tilesV - Number of tiles along V axis (default 8)
 */
export function checkerboardTexture(
  color1: Color,
  color2: Color,
  tilesU: number = 8,
  tilesV: number = 8,
): Texture {
  return {
    width: tilesU * 16,
    height: tilesV * 16,
    sample: (u: number, v: number) => {
      const cu = Math.floor(u * tilesU) % 2;
      const cv = Math.floor(v * tilesV) % 2;
      return (cu + cv) % 2 === 0 ? { ...color1 } : { ...color2 };
    },
  };
}

/**
 * Create a smooth gradient texture from one color to another along U axis.
 */
export function gradientTexture(colorA: Color, colorB: Color): Texture {
  return {
    width: 256,
    height: 1,
    sample: (u: number) => {
      const t = Math.max(0, Math.min(1, u));
      return {
        r: colorA.r + (colorB.r - colorA.r) * t,
        g: colorA.g + (colorB.g - colorA.g) * t,
        b: colorA.b + (colorB.b - colorA.b) * t,
        a: colorA.a + (colorB.a - colorA.a) * t,
      };
    },
  };
}

/**
 * Create a procedural noise texture (smooth random patterns).
 * Uses value noise with bilinear interpolation.
 */
export function noiseTexture(
  baseColor: Color,
  noiseColor: Color,
  resolution: number = 16,
): Texture {
  // Generate random grid
  const grid: number[][] = [];
  for (let y = 0; y <= resolution; y++) {
    const row: number[] = [];
    for (let x = 0; x <= resolution; x++) {
      row.push(Math.random());
    }
    grid.push(row);
  }

  return {
    width: resolution * 16,
    height: resolution * 16,
    sample: (u: number, v: number) => {
      const fx = ((u % 1) + 1) % 1 * resolution;
      const fy = ((v % 1) + 1) % 1 * resolution;
      const ix = Math.floor(fx);
      const iy = Math.floor(fy);
      const dx = fx - ix;
      const dy = fy - iy;

      // Bilinear interpolation
      const v00 = grid[iy % (resolution + 1)]![ix % (resolution + 1)]!;
      const v10 = grid[iy % (resolution + 1)]![(ix + 1) % (resolution + 1)]!;
      const v01 = grid[(iy + 1) % (resolution + 1)]![ix % (resolution + 1)]!;
      const v11 = grid[(iy + 1) % (resolution + 1)]![(ix + 1) % (resolution + 1)]!;

      const t = (v00 * (1 - dx) + v10 * dx) * (1 - dy) + (v01 * (1 - dx) + v11 * dx) * dy;

      return {
        r: baseColor.r + (noiseColor.r - baseColor.r) * t,
        g: baseColor.g + (noiseColor.g - baseColor.g) * t,
        b: baseColor.b + (noiseColor.b - baseColor.b) * t,
        a: 1,
      };
    },
  };
}
