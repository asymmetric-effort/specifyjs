// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Northern Mariana Islands — SVG map outline component.
 */
export const MP = createStateMapComponent({
  name: "Northern Mariana Islands",
  pathData: `M 8,0 L 12,5 L 10,12 L 6,15 L 3,12 L 5,5 Z M 6,20 L 10,22 L 12,28 L 8,32 L 4,28 L 5,23 Z M 7,38 L 12,40 L 14,46 L 10,50 L 5,47 L 6,42 Z`,
  viewBox: { minX: 1, minY: -2, width: 15, height: 54 },
});

export type { StateMapProps };
