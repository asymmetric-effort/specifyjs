// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Kansas — SVG map outline component.
 */
export const KS = createStateMapComponent({
  name: "Kansas",
  pathData: `m 459.1,259.5 -43.7,-1.2 -36,-2 -4.8,67 67.7,2.9 62,.1 -.5,-48.1 -3.2,-.7 -2.6,-4.7 -2.5,-2.5 .5,-2.3 2.7,-2.6 .1,-1.2 -1.5,-2.1 -.9,1 -2,-.6 -2.9,-3 z`,
  viewBox: { minX: 368.1, minY: 249.8, width: 142.7, height: 83.0 },
});

export type { StateMapProps };
