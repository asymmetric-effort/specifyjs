// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Crisp theme — scientific/analytical visualization style.
 *
 * Designed for precision and data density: thinner lines, butt line caps,
 * tighter padding, no border radius, tick marks on axes, minor gridlines,
 * smaller monospace-friendly fonts, no animation.
 */

import type { VizTheme } from './VizTheme.types';
import { deepFreeze } from './freeze';

export const crisp: VizTheme = deepFreeze({
  fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  fontFamilyMono: '"JetBrains Mono", "Fira Code", "Consolas", monospace',
  fontSize: {
    axis: '11px',
    label: '11px',
    title: '13px',
  },
  lineWidth: {
    grid: 0.5,
    axis: 1,
    series: 1.5,
  },
  lineCap: 'butt',
  spacing: {
    padding: { top: 12, right: 12, bottom: 32, left: 44 },
  },
  border: {
    radius: '0',
    width: '0',
  },
  axis: {
    showGrid: true,
    showMinorGrid: true,
    tickLength: 4,
    tickWidth: 1,
  },
  points: {
    show: false,
    radius: 2,
  },
  segments: {
    strokeWidth: 0,
  },
  legend: {
    swatchSize: 8,
    spacing: '6px',
  },
  animation: {
    duration: 0,
  },
});
