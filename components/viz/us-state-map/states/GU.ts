// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Guam — SVG map outline component.
 */
export const GU = createStateMapComponent({
  name: "Guam",
  pathData: `M 10,0 L 15,3 L 16,10 L 18,18 L 16,25 L 12,30 L 8,28 L 5,22 L 4,15 L 5,8 L 8,2 Z`,
  viewBox: { minX: 2, minY: -2, width: 18, height: 34 },
});

export type { StateMapProps };
