// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Colorado — SVG map outline component.
 */
export const CO = createStateMapComponent({
  name: "Colorado",
  pathData: `m 374.6,323.3 -16.5,-1 -51.7,-4.8 -52.6,-6.5 11.5,-88.3 44.9,5.7 37.5,3.4 33.1,2.4 -1.4,22.1 z`,
  viewBox: { minX: 247.5, minY: 216.3, width: 139.7, height: 113.3 },
});

export type { StateMapProps };
