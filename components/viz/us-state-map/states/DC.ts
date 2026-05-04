// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * District of Columbia — SVG map outline component.
 */
export const DC = createStateMapComponent({
  name: "District of Columbia",
  pathData: `m 803.5,252 -2.6,-1.8 -1,1.7 .5,.4 .4,.1 .6,.5 .3,.7 -.1,.5 .2,.5 z`,
  viewBox: { minX: 797.9, minY: 248.2, width: 7.6, height: 8.4 },
});

export type { StateMapProps };
