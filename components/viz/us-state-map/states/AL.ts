// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Alabama — SVG map outline component.
 */
export const AL = createStateMapComponent({
  name: "Alabama",
  pathData: `m 643,467.4 .4,-7.3 -.9,-1.2 -1.7,-.7 -2.5,-2.8 .5,-2.9 48.8,-5.1 -.7,-2.2 -1.5,-1.5 -.5,-1.4 .6,-6.3 -2.4,-5.7 .5,-2.6 .3,-3.7 2.2,-3.8 -.2,-1.1 -1.7,-1 v -3.2 l -1.8,-1.9 -2.9,-6.1 -12.9,-45.8 -45.7,4 1.3,2 -1.3,67 4.4,33.2 .9,-.5 1.3,.1 .6,.4 .8,-.1 2,-3.8 v -2.3 l 1.1,-1.1 1.4,.5 3.4,6.4 v .9 l -3.3,2.2 3.5,-.4 4.9,-1.6 z`,
  viewBox: { minX: 615.5, minY: 355.7, width: 77.6, height: 119.8 },
});

export type { StateMapProps };
