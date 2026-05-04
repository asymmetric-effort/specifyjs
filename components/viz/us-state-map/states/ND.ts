// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * North Dakota — SVG map outline component.
 */
export const ND = createStateMapComponent({
  name: "North Dakota",
  pathData: `m 464.7,68.6 -1.1,2.8 .8,1.4 -.3,5.1 -.5,1.1 2.7,9.1 1.3,2.5 .7,14 1,2.7 -.4,5.8 2.9,7.4 .3,5.8 -.1,2.1 -29.5,-.4 -46,-2.1 -39.2,-2.9 5.2,-66.7 44.5,3.4 55.3,1.6 z`,
  viewBox: { minX: 351.6, minY: 50.6, width: 126.3, height: 83.6 },
});

export type { StateMapProps };
