// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * U.S. Virgin Islands — SVG map outline component.
 */
export const VI = createStateMapComponent({
  name: "U.S. Virgin Islands",
  pathData: `M 0,8 L 5,5 L 10,3 L 15,5 L 12,10 L 8,12 L 3,11 Z M 18,0 L 22,2 L 25,6 L 22,10 L 18,8 L 16,4 Z`,
  viewBox: { minX: -2, minY: -2, width: 29, height: 16 },
});

export type { StateMapProps };
