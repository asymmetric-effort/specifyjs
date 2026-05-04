// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * New Mexico — SVG map outline component.
 */
export const NM = createStateMapComponent({
  name: "New Mexico",
  pathData: `m 357.5,332.9 h -.8 l -7.9,99.3 -31.8,-2.6 -34.4,-3.6 -.3,3 2,2.2 -30.8,-4.1 -1.4,10.2 -15.7,-2.2 17.4,-124.1 52.6,6.5 51.7,4.8 z`,
  viewBox: { minX: 230.1, minY: 304.7, width: 134.3, height: 138.9 },
});

export type { StateMapProps };
