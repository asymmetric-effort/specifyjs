// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * RadarChart — A SpecifyJS component that renders spider/radar charts as SVG.
 *
 * Supports:
 *  - Multiple overlaid data series
 *  - Configurable number of concentric grid rings
 *  - Axis labels and value annotations
 *  - Filled polygons with configurable opacity
 *  - Data point dots
 *  - Legend
 *  - Proper ARIA attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo, useCallback } from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface RadarAxis {
  label: string;
  max?: number;
}

export interface RadarSeries {
  label: string;
  values: number[];
  color: string;
  fillOpacity?: number;
}

// -- Props --------------------------------------------------------------------

export interface RadarChartProps {
  /** Axes definition — one per spoke of the radar */
  axes: RadarAxis[];
  /** Data series to overlay on the chart */
  series: RadarSeries[];
  /** SVG width in pixels (default: 500) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Number of concentric grid rings (default: 5) */
  levels?: number;
  /** Show axis labels around the perimeter (default: true) */
  showLabels?: boolean;
  /** Show value annotations at data points (default: false) */
  showValues?: boolean;
  /** Show legend (default: true) */
  showLegend?: boolean;
  /** Show dots at data points (default: true) */
  showDots?: boolean;
  /** Grid line color (default: '#d1d5db') */
  gridColor?: string;
  /** Chart title */
  title?: string;
}

// -- Helpers ------------------------------------------------------------------

/** Compute the angle in radians for axis index `i` out of `total` axes. */
function axisAngle(i: number, total: number): number {
  return (Math.PI * 2 * i) / total - Math.PI / 2;
}

/** Convert polar coordinates to cartesian, relative to center. */
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

// -- Component ----------------------------------------------------------------

export function RadarChart(props: RadarChartProps) {
  const {
    axes = [],
    series = [],
    width = 500,
    height = 500,
    levels = 5,
    showLabels = true,
    showValues = false,
    showLegend = true,
    showDots = true,
    gridColor = '#d1d5db',
    title,
  } = props;

  const axisCount = axes.length;
  const titleOffset = title ? 30 : 0;
  const legendHeight = showLegend && series.length > 0 ? 30 : 0;
  const chartPadding = 60;
  const radius = Math.min(
    (width - chartPadding * 2) / 2,
    (height - chartPadding * 2 - titleOffset - legendHeight) / 2,
  );
  const cx = width / 2;
  const cy = chartPadding + titleOffset + radius;

  // Compute effective max for each axis
  const axisMaxValues = useMemo(() => {
    const maxes: number[] = [];
    for (let i = 0; i < axisCount; i++) {
      const axisMax = axes[i]?.max;
      if (axisMax !== undefined && axisMax > 0) {
        maxes.push(axisMax);
        continue;
      }
      // Auto-detect from series data
      let m = 0;
      for (const s of series) {
        const v = s.values[i];
        if (v !== undefined && v > m) m = v;
      }
      maxes.push(m > 0 ? m : 1);
    }
    return maxes;
  }, [axes, series, axisCount]);

  // ---- Grid rings -----------------------------------------------------------

  const buildGrid = useCallback(() => {
    if (axisCount < 3) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    // Concentric polygon rings
    for (let lvl = 1; lvl <= levels; lvl++) {
      const r = (radius * lvl) / levels;
      const points: string[] = [];
      for (let i = 0; i < axisCount; i++) {
        const angle = axisAngle(i, axisCount);
        const pt = polarToCartesian(cx, cy, r, angle);
        points.push(`${pt.x},${pt.y}`);
      }
      elements.push(
        createElement('polygon', {
          key: `ring-${lvl}`,
          points: points.join(' '),
          fill: 'none',
          stroke: gridColor,
          'stroke-width': lvl === levels ? '1.5' : '0.5',
          'stroke-dasharray': lvl === levels ? 'none' : '3 2',
        }),
      );
    }

    // Axis spokes
    for (let i = 0; i < axisCount; i++) {
      const angle = axisAngle(i, axisCount);
      const end = polarToCartesian(cx, cy, radius, angle);
      elements.push(
        createElement('line', {
          key: `spoke-${i}`,
          x1: String(cx),
          y1: String(cy),
          x2: String(end.x),
          y2: String(end.y),
          stroke: gridColor,
          'stroke-width': '0.75',
        }),
      );
    }

    return elements;
  }, [axisCount, levels, radius, cx, cy, gridColor]);

  // ---- Axis labels ----------------------------------------------------------

  const buildLabels = useCallback(() => {
    if (!showLabels || axisCount < 3) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const labelOffset = 16;

    for (let i = 0; i < axisCount; i++) {
      const angle = axisAngle(i, axisCount);
      const pt = polarToCartesian(cx, cy, radius + labelOffset, angle);

      // Determine text-anchor based on position
      let anchor = 'middle';
      if (pt.x < cx - 5) anchor = 'end';
      else if (pt.x > cx + 5) anchor = 'start';

      const dy = Math.abs(pt.y - cy) < 5 ? '0.35em' : pt.y < cy ? '0em' : '0.7em';

      elements.push(
        createElement(
          'text',
          {
            key: `label-${i}`,
            x: String(pt.x),
            y: String(pt.y),
            'text-anchor': anchor,
            dy,
            'font-size': '12',
            'font-family': 'sans-serif',
            fill: 'currentColor',
          },
          axes[i]?.label ?? `Axis ${i}`,
        ),
      );
    }

    return elements;
  }, [showLabels, axisCount, axes, radius, cx, cy]);

  // ---- Data series polygons -------------------------------------------------

  const buildSeries = useCallback(() => {
    if (axisCount < 3 || series.length === 0) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    for (let si = 0; si < series.length; si++) {
      const s = series[si]!;
      const polyPoints: string[] = [];
      const dotElements: ReturnType<typeof createElement>[] = [];
      const valueElements: ReturnType<typeof createElement>[] = [];

      for (let i = 0; i < axisCount; i++) {
        const val = s.values[i] ?? 0;
        const maxVal = axisMaxValues[i]!;
        const ratio = Math.min(val / maxVal, 1);
        const r = radius * ratio;
        const angle = axisAngle(i, axisCount);
        const pt = polarToCartesian(cx, cy, r, angle);
        polyPoints.push(`${pt.x},${pt.y}`);

        if (showDots) {
          dotElements.push(
            createElement('circle', {
              key: `dot-${si}-${i}`,
              cx: String(pt.x),
              cy: String(pt.y),
              r: '3.5',
              fill: s.color,
              stroke: '#fff',
              'stroke-width': '1.5',
            }),
          );
        }

        if (showValues) {
          valueElements.push(
            createElement(
              'text',
              {
                key: `val-${si}-${i}`,
                x: String(pt.x),
                y: String(pt.y - 8),
                'text-anchor': 'middle',
                'font-size': '10',
                'font-family': 'sans-serif',
                fill: s.color,
              },
              String(Math.round(val * 100) / 100),
            ),
          );
        }
      }

      // Filled polygon
      elements.push(
        createElement('polygon', {
          key: `series-fill-${si}`,
          points: polyPoints.join(' '),
          fill: s.color,
          'fill-opacity': String(s.fillOpacity ?? 0.15),
          stroke: 'none',
        }),
      );

      // Outline polygon
      elements.push(
        createElement('polygon', {
          key: `series-line-${si}`,
          points: polyPoints.join(' '),
          fill: 'none',
          stroke: s.color,
          'stroke-width': '2',
          'stroke-linejoin': 'round',
        }),
      );

      for (const d of dotElements) elements.push(d);
      for (const v of valueElements) elements.push(v);
    }

    return elements;
  }, [axisCount, series, axisMaxValues, radius, cx, cy, showDots, showValues]);

  // ---- Legend ---------------------------------------------------------------

  const buildLegend = useCallback(() => {
    if (!showLegend || series.length === 0) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const legendY = cy + radius + 40;
    const itemWidth = 100;
    const totalWidth = series.length * itemWidth;
    const startX = cx - totalWidth / 2;

    for (let i = 0; i < series.length; i++) {
      const s = series[i]!;
      const x = startX + i * itemWidth;

      elements.push(
        createElement('rect', {
          key: `legend-swatch-${i}`,
          x: String(x),
          y: String(legendY),
          width: '12',
          height: '12',
          rx: '2',
          fill: s.color,
        }),
      );

      elements.push(
        createElement(
          'text',
          {
            key: `legend-text-${i}`,
            x: String(x + 16),
            y: String(legendY + 10),
            'font-size': '12',
            'font-family': 'sans-serif',
            fill: 'currentColor',
          },
          s.label,
        ),
      );
    }

    return elements;
  }, [showLegend, series, cx, cy, radius]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: '24',
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: 'currentColor',
        },
        title,
      ),
    ];
  }, [title, width]);

  // ---- Empty state ----------------------------------------------------------

  if (axisCount < 3) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Radar chart — insufficient axes',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: 'currentColor',
          opacity: '0.6',
        },
        'Radar chart requires at least 3 axes.',
      ),
    );
  }

  // ---- Assemble SVG ---------------------------------------------------------

  const gridEls = buildGrid();
  const labelEls = buildLabels();
  const seriesEls = buildSeries();
  const legendEls = buildLegend();
  const titleEls = buildTitle();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Radar chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEls,
    ...gridEls,
    ...labelEls,
    ...seriesEls,
    ...legendEls,
  );
}
