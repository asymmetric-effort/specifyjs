// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Mississippi — SVG map outline component.
 */
export const MS = createStateMapComponent({
  name: "Mississippi",
  pathData: `m 623.8,468.6 -5,.1 -2.4,-1.5 -7.9,2.5 -.9,-.7 -.5,.2 -.1,1.6 -.6,.1 -2.6,2.7 -.7,-.1 -.6,-.7 -1.2,-1.8 .3,-1.3 -4.8,-6.8 .9,-4.6 1,-1.4 .1,-1.4 -36,2 1.7,-11.9 2.4,-4.8 6,-8.4 -1.8,-2.5 h 2 v -3.3 l -2.4,-2.5 .5,-1.7 -1.2,-1 -1.6,-7.1 .6,-1.4 1.2,-1.5 .5,-3 -1.5,-2.3 -.5,-2.2 .9,-.7 v -.8 l -1.7,-1.1 -.1,-.7 1.6,-.9 -1.2,-1.1 1.7,-7.1 3.4,-1.6 v -.8 l -1.1,-1.4 2.9,-5.4 h 1.9 l 1.5,-1.2 -.3,-5.2 3.1,-4.5 1.8,-.6 -.5,-3.1 38.3,-2.6 1.3,2 -1.3,67 4.4,33.2 z`,
  viewBox: { minX: 557.4, minY: 359.7, width: 73.3, height: 119.4 },
});

export type { StateMapProps };
