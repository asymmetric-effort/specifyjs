// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Puerto Rico — SVG map outline component.
 */
export const PR = createStateMapComponent({
  name: "Puerto Rico",
  pathData: `M 0,5 L 30,0 L 45,2 L 50,8 L 48,15 L 35,20 L 15,18 L 5,15 L 0,10 Z`,
  viewBox: { minX: -2, minY: -2, width: 54, height: 24 },
});

export type { StateMapProps };
