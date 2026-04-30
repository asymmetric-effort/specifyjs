// ============================================================================
// SpecifyJS — 2D Pie/Donut Chart SVG Component
// Zero-dependency pie and donut chart renderer using SpecifyJS createElement.
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement, type SpecElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PieSliceDatum {
  label: string;
  value: number;
  color?: string;
}

export interface ComputedSlice {
  label: string;
  value: number;
  startAngle: number;
  endAngle: number;
  percentage: number;
  color: string;
}

export interface PieGraphProps {
  data: PieSliceDatum[];
  width?: number;
  height?: number;
  innerRadius?: number;
  outerRadius?: number;
  padAngle?: number;
  showLabels?: boolean;
  showValues?: boolean;
  showLegend?: boolean;
  legendPosition?: 'right' | 'bottom';
  title?: string;
  centerLabel?: string;
  colors?: string[];
  strokeColor?: string;
  strokeWidth?: number;
}

// ---------------------------------------------------------------------------
// Color palette helpers
// ---------------------------------------------------------------------------

function generateHSLPalette(count: number): string[] {
  const palette: string[] = [];
  for (let i = 0; i < count; i++) {
    const hue = Math.round((360 * i) / count);
    palette.push(`hsl(${hue}, 70%, 55%)`);
  }
  return palette;
}

function resolveColors(
  data: PieSliceDatum[],
  customColors?: string[],
): string[] {
  const palette = customColors ?? generateHSLPalette(data.length);
  return data.map((d, i) => d.color ?? palette[i % palette.length]);
}

// ---------------------------------------------------------------------------
// Geometry helpers
// ---------------------------------------------------------------------------

/** Convert polar coordinates to cartesian. */
function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleRad: number,
): { x: number; y: number } {
  return {
    x: cx + radius * Math.cos(angleRad),
    y: cy + radius * Math.sin(angleRad),
  };
}

/**
 * Build an SVG path `d` string for an arc (or annular sector).
 *
 * Angles are in **radians**, measured clockwise from 12-o'clock
 * (i.e. -PI/2 offset so 0 rad = top).
 *
 * Exported as a public utility so consumers can draw custom arcs.
 */
export function describeArc(
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
): string {
  // Offset so 0 rad points up (12 o'clock)
  const sA = startAngle - Math.PI / 2;
  const eA = endAngle - Math.PI / 2;

  const outerStart = polarToCartesian(cx, cy, outerR, sA);
  const outerEnd = polarToCartesian(cx, cy, outerR, eA);

  const largeArc = endAngle - startAngle > Math.PI ? 1 : 0;

  if (innerR <= 0) {
    // Pie slice (no hole)
    return [
      `M ${cx} ${cy}`,
      `L ${outerStart.x} ${outerStart.y}`,
      `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
      'Z',
    ].join(' ');
  }

  // Donut / annular sector
  const innerStart = polarToCartesian(cx, cy, innerR, eA);
  const innerEnd = polarToCartesian(cx, cy, innerR, sA);

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerStart.x} ${innerStart.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEnd.x} ${innerEnd.y}`,
    'Z',
  ].join(' ');
}

// ---------------------------------------------------------------------------
// computeSlices — public utility
// ---------------------------------------------------------------------------

/**
 * Given raw data, compute start/end angles, percentages, and resolved colors.
 */
export function computeSlices(
  data: PieSliceDatum[],
  options?: {
    padAngle?: number;
    colors?: string[];
  },
): ComputedSlice[] {
  const padAngle = options?.padAngle ?? 0;
  const colors = resolveColors(data, options?.colors);
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total <= 0) return [];

  const totalPad = padAngle * data.length;
  const availableAngle = Math.PI * 2 - totalPad;

  const slices: ComputedSlice[] = [];
  let currentAngle = 0;

  for (let i = 0; i < data.length; i++) {
    const d = data[i];
    const sliceAngle = (d.value / total) * availableAngle;
    const startAngle = currentAngle + padAngle / 2;
    const endAngle = startAngle + sliceAngle;

    slices.push({
      label: d.label,
      value: d.value,
      startAngle,
      endAngle,
      percentage: (d.value / total) * 100,
      color: colors[i],
    });

    currentAngle = endAngle + padAngle / 2;
  }

  return slices;
}

// ---------------------------------------------------------------------------
// PieGraph component
// ---------------------------------------------------------------------------

export function PieGraph(props: PieGraphProps): SpecElement {
  const {
    data,
    width = 400,
    height = 400,
    innerRadius = 0,
    padAngle = 0.02,
    showLabels = true,
    showValues = true,
    showLegend = true,
    legendPosition = 'right',
    title,
    centerLabel,
    colors: customColors,
    strokeColor = '#fff',
    strokeWidth = 2,
  } = props;

  // Determine chart area dimensions (leave room for legend / title)
  const legendWidth = showLegend && legendPosition === 'right' ? 140 : 0;
  const titleHeight = title ? 30 : 0;
  const legendBottomHeight =
    showLegend && legendPosition === 'bottom'
      ? Math.ceil(data.length / 2) * 22 + 10
      : 0;

  const chartWidth = width - legendWidth;
  const chartHeight = height - titleHeight - legendBottomHeight;

  const cx = chartWidth / 2;
  const cy = titleHeight + chartHeight / 2;
  const autoOuterRadius = Math.min(chartWidth, chartHeight) / 2 - 10;
  const outerRadius = props.outerRadius ?? autoOuterRadius;

  const slices = useMemo(
    () => computeSlices(data, { padAngle, colors: customColors }),
    [data, padAngle, customColors],
  );

  // ---- Build child elements ---

  const children: SpecElement[] = [];

  // Title
  if (title) {
    children.push(
      createElement('text', {
        key: 'title',
        x: chartWidth / 2,
        y: 20,
        textAnchor: 'middle',
        fontFamily: 'sans-serif',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#333',
      }, title),
    );
  }

  // Slices
  for (let i = 0; i < slices.length; i++) {
    const s = slices[i];
    const d = describeArc(cx, cy, innerRadius, outerRadius, s.startAngle, s.endAngle);

    children.push(
      createElement('path', {
        key: `slice-${i}`,
        d,
        fill: s.color,
        stroke: strokeColor,
        strokeWidth,
      }),
    );

    // Label & value positioning
    if (showLabels || showValues) {
      const midAngle = (s.startAngle + s.endAngle) / 2;
      const isSmallSlice = s.percentage < 5;

      // Place label at 70% radius for large slices, 110% for small
      const labelR = isSmallSlice
        ? outerRadius + 14
        : innerRadius + (outerRadius - innerRadius) * 0.65;
      const labelPos = polarToCartesian(
        cx,
        cy,
        labelR,
        midAngle - Math.PI / 2,
      );

      const textColor = isSmallSlice ? '#333' : '#fff';
      const fontSize = isSmallSlice ? 11 : 12;

      const labelParts: string[] = [];
      if (showLabels) labelParts.push(s.label);
      if (showValues) labelParts.push(`${s.percentage.toFixed(1)}%`);

      // For small slices rendered outside, draw a connector line
      if (isSmallSlice) {
        const edgePos = polarToCartesian(
          cx,
          cy,
          outerRadius + 2,
          midAngle - Math.PI / 2,
        );
        children.push(
          createElement('line', {
            key: `connector-${i}`,
            x1: edgePos.x,
            y1: edgePos.y,
            x2: labelPos.x,
            y2: labelPos.y,
            stroke: '#999',
            strokeWidth: 1,
          }),
        );
      }

      if (showLabels) {
        children.push(
          createElement('text', {
            key: `label-${i}`,
            x: labelPos.x,
            y: labelPos.y - (showValues ? 6 : 0),
            textAnchor: 'middle',
            fontFamily: 'sans-serif',
            fontSize,
            fill: textColor,
            pointerEvents: 'none',
          }, s.label),
        );
      }

      if (showValues) {
        children.push(
          createElement('text', {
            key: `value-${i}`,
            x: labelPos.x,
            y: labelPos.y + (showLabels ? 10 : 0),
            textAnchor: 'middle',
            fontFamily: 'sans-serif',
            fontSize: fontSize - 1,
            fill: textColor,
            pointerEvents: 'none',
          }, `${s.percentage.toFixed(1)}%`),
        );
      }
    }
  }

  // Center label (donut mode)
  if (centerLabel && innerRadius > 0) {
    children.push(
      createElement('text', {
        key: 'center-label',
        x: cx,
        y: cy,
        textAnchor: 'middle',
        dominantBaseline: 'central',
        fontFamily: 'sans-serif',
        fontSize: 14,
        fontWeight: 'bold',
        fill: '#333',
      }, centerLabel),
    );
  }

  // Legend
  if (showLegend) {
    const legendItems: SpecElement[] = [];

    if (legendPosition === 'right') {
      const legendX = chartWidth + 10;
      const legendStartY = titleHeight + 20;

      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        const itemY = legendStartY + i * 22;

        legendItems.push(
          createElement('circle', {
            key: `legend-dot-${i}`,
            cx: legendX + 6,
            cy: itemY,
            r: 6,
            fill: s.color,
          }),
        );

        legendItems.push(
          createElement('text', {
            key: `legend-text-${i}`,
            x: legendX + 18,
            y: itemY,
            dominantBaseline: 'central',
            fontFamily: 'sans-serif',
            fontSize: 12,
            fill: '#333',
          }, `${s.label} (${s.percentage.toFixed(1)}%)`),
        );
      }
    } else {
      // bottom legend — two columns
      const legendStartY = height - legendBottomHeight + 10;

      for (let i = 0; i < slices.length; i++) {
        const s = slices[i];
        const col = i % 2;
        const row = Math.floor(i / 2);
        const itemX = col * (width / 2) + 10;
        const itemY = legendStartY + row * 22;

        legendItems.push(
          createElement('circle', {
            key: `legend-dot-${i}`,
            cx: itemX + 6,
            cy: itemY,
            r: 6,
            fill: s.color,
          }),
        );

        legendItems.push(
          createElement('text', {
            key: `legend-text-${i}`,
            x: itemX + 18,
            y: itemY,
            dominantBaseline: 'central',
            fontFamily: 'sans-serif',
            fontSize: 12,
            fill: '#333',
          }, `${s.label} (${s.percentage.toFixed(1)}%)`),
        );
      }
    }

    children.push(...legendItems);
  }

  // Root SVG element
  return createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
    },
    ...children,
  );
}
