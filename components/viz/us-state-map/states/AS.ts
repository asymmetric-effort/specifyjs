// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * American Samoa — SVG map outline component.
 */
export const AS = createStateMapComponent({
  name: "American Samoa",
  pathData: `M 0,10 L 8,5 L 20,3 L 30,5 L 35,10 L 30,15 L 20,18 L 8,15 L 2,12 Z`,
  viewBox: { minX: -2, minY: 1, width: 39, height: 19 },
});

export type { StateMapProps };
