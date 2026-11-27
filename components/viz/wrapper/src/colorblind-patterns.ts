// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SVG pattern definitions for colorblind accessibility.
 * Each pattern is a subtle overlay that differentiates segments
 * without relying on color alone.
 */

import { createElement } from 'specifyjs';

const PATTERNS = [
  { id: 'cb-diag-right', d: 'M0,4 l4,-4 M-1,1 l2,-2 M3,5 l2,-2' },  // diagonal right
  { id: 'cb-diag-left', d: 'M0,0 l4,4 M-1,3 l2,2 M3,-1 l2,2' },     // diagonal left
  { id: 'cb-dots', type: 'dots' as const },                             // dots
  { id: 'cb-cross', d: 'M0,4 l4,-4 M0,0 l4,4' },                      // crosshatch
  { id: 'cb-horiz', d: 'M0,2 l4,0' },                                   // horizontal
  { id: 'cb-vert', d: 'M2,0 l0,4' },                                    // vertical
];

export function createPatternDefs(): unknown {
  return createElement('defs', { key: 'cb-patterns' },
    ...PATTERNS.map((p, i) => {
      if (p.type === 'dots') {
        return createElement('pattern', {
          key: p.id, id: p.id, width: '4', height: '4',
          patternUnits: 'userSpaceOnUse',
        },
          createElement('circle', { cx: '2', cy: '2', r: '0.8', fill: 'rgba(0,0,0,0.15)' }),
        );
      }
      return createElement('pattern', {
        key: p.id, id: p.id, width: '4', height: '4',
        patternUnits: 'userSpaceOnUse',
      },
        createElement('path', {
          d: p.d, stroke: 'rgba(0,0,0,0.12)', 'stroke-width': '0.5', fill: 'none',
        }),
      );
    }),
  );
}

export function getPatternId(index: number): string {
  return PATTERNS[index % PATTERNS.length]!.id;
}

export function getPatternFill(index: number): string {
  return `url(#${getPatternId(index)})`;
}
