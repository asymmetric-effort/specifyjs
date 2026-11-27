// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VizTheme — Appearance tokens for visualization components.
 *
 * Controls typography, line geometry, spacing, borders, axis configuration,
 * legend sizing, and animation timing. Does NOT include color tokens —
 * colors are the consumer's concern via component props and CSS variables.
 */

export interface VizTheme {
  /** Primary font family for labels, titles, legends */
  fontFamily: string;
  /** Monospace font family for numeric values, code labels */
  fontFamilyMono: string;
  /** Font sizes for different chart text elements */
  fontSize: {
    /** Axis tick labels */
    axis: string;
    /** Data labels, legend text */
    label: string;
    /** Chart title */
    title: string;
  };
  /** Stroke widths for chart lines */
  lineWidth: {
    /** Grid lines */
    grid: number;
    /** Axis lines */
    axis: number;
    /** Data series lines */
    series: number;
  };
  /** SVG stroke-linecap: 'round' for casual, 'butt' for crisp */
  lineCap: 'round' | 'butt';
  /** Spacing around and within chart areas */
  spacing: {
    /** Chart padding (space between container edge and plot area) */
    padding: { top: number; right: number; bottom: number; left: number };
  };
  /** Container border styling */
  border: {
    /** Border radius (e.g., '8px' or '0') */
    radius: string;
    /** Border width (e.g., '1px' or '0') */
    width: string;
  };
  /** Axis configuration */
  axis: {
    /** Show major grid lines */
    showGrid: boolean;
    /** Show minor grid lines (between major lines) */
    showMinorGrid: boolean;
    /** Length of tick marks in pixels (0 = no ticks) */
    tickLength: number;
    /** Width of tick mark strokes in pixels */
    tickWidth: number;
  };
  /** Data point markers (line/scatter/bubble charts) */
  points: {
    /** Whether to show point markers by default */
    show: boolean;
    /** Point marker radius in pixels */
    radius: number;
  };
  /** Segment/slice styling (pie, donut, funnel, partition) */
  segments: {
    /** Stroke width between segments (0 = no borders) */
    strokeWidth: number;
  };
  /** Legend appearance */
  legend: {
    /** Size of color swatch in pixels */
    swatchSize: number;
    /** Spacing between legend items */
    spacing: string;
  };
  /** Animation configuration */
  animation: {
    /** Transition duration in milliseconds (0 = no animation) */
    duration: number;
  };
}
