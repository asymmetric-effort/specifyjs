// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Casual theme — the default SpecifyJS visualization style.
 *
 * Matches the current hardcoded appearance across all viz components:
 * rounded line caps, generous padding, rounded borders, larger fonts,
 * no tick marks, standard animation.
 */

import type { VizTheme } from './VizTheme.types';
import { deepFreeze } from './freeze';

export const casual: VizTheme = deepFreeze({
  fontFamily: 'sans-serif',
  fontFamilyMono: 'monospace',
  fontSize: {
    axis: '12px',
    label: '13px',
    title: '16px',
  },
  lineWidth: {
    grid: 1,
    axis: 1,
    series: 2,
  },
  lineCap: 'round',
  spacing: {
    padding: { top: 20, right: 20, bottom: 40, left: 50 },
  },
  border: {
    radius: '8px',
    width: '1px',
  },
  axis: {
    showGrid: true,
    showMinorGrid: false,
    tickLength: 0,
    tickWidth: 0,
  },
  points: {
    show: true,
    radius: 4,
  },
  legend: {
    swatchSize: 12,
    spacing: '8px',
  },
  animation: {
    duration: 300,
  },
});
