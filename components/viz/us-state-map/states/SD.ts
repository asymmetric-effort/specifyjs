// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * South Dakota — SVG map outline component.
 */
export const SD = createStateMapComponent({
  name: "South Dakota",
  pathData: `m 396.5,125.9 46,2.1 29.5,.4 -.1,2.2 -.9,2 -3.1,1.9 -.3,1.2 1.7,2.5 .4,1.8 2.6,.6 1.5,1.9 -.2,39.5 -2.2,-.1 -.1,1.6 1.3,1.5 -.1,1.1 -1,.5 .4,1.6 1.3,.4 .7,2 -1.7,5.1 -1,4.3 1.3,1.2 .3,1.3 .7,1.7 -1.5,.2 -1.8,-.7 -.9,-2.6 -1.2,-1.3 -6.1,-2.2 -.6,-1.1 -2,-.6 -1.4,.6 -1,-.5 -.9,.4 -.7,-.4 -.9,.4 -.7,-.5 -1,.7 -1.5,-.6 -1.8,2 -1.8,.1 -2.1,-2 -1.7,-.2 -3.4,-3.2 -38,-1.6 -51.1,-3.5 3.9,-43.9 2,-20.7 z`,
  viewBox: { minX: 345.3, minY: 116.9, width: 134.7, height: 93.6 },
});

export type { StateMapProps };
