// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Wyoming — SVG map outline component.
 */
export const WY = createStateMapComponent({
  name: "Wyoming",
  pathData: `m 355.3,143.7 -51,-5.3 -57.3,-7.9 -2,10.7 -8.5,54.8 -3.3,21.9 32.1,4.8 44.9,5.7 37.5,3.4 3.7,-44.2 z`,
  viewBox: { minX: 227.1, minY: 124.4, width: 134.3, height: 113.5 },
});

export type { StateMapProps };
