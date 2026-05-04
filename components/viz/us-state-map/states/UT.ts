// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createStateMapComponent } from "./factory";
import type { StateMapProps } from "./types";

/**
 * Utah — SVG map outline component.
 */
export const UT = createStateMapComponent({
  name: "Utah",
  pathData: `m 233.2,217.9 3.3,-21.9 -47.9,-8.2 -21,109 46.2,8.2 40,6 11.5,-88.3 z`,
  viewBox: { minX: 161.4, minY: 181.6, width: 110.0, height: 135.5 },
});

export type { StateMapProps };
