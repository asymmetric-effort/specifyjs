// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Arizona — SVG map outline component.
 */
export const AZ = createStateMapComponent({
  name: "Arizona",
  pathData: `m 139.6,387.6 3,-2.2 .8,-2.4 -1,-1.6 -1.8,-.2 -1.1,-1.6 1.1,-6.9 1.6,-.3 2.4,-3.2 1.6,-7 2.4,-3.6 4.8,-1.7 1.3,-1.3 -.4,-1.9 -2.3,-2.5 -1.2,-5.8 -1.4,-1.8 -1.3,-3.4 .9,-2.1 1.4,-3 .5,-2.9 -.5,-4.9 1,-13.6 3.5,-.6 3.7,1.4 1.2,2.7 h 2 l 2.4,-2.9 3.4,-17.5 46.2,8.2 40,6 -17.4,124.1 -37.3,-5.4 -64.2,-37.5 .5,-2.9 2,-1.8 z`,
  viewBox: { minX: 128.0, minY: 289.9, width: 132.7, height: 152.1 },
});

export type { StateMapProps };
