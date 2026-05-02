// ============================================================================
// SpecifyJS — 2D Line Graph SVG Component
// Zero-dependency line graph rendered entirely via createElement calls.
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Supported point marker shapes */
export type PointShape = 'circle' | 'square' | 'diamond' | 'triangle' | 'triangle-down' | 'cross' | 'plus';

export interface Point {
  x: number;
  y: number;
  /** Per-point shape override */
  shape?: PointShape;
  /** Per-point radius override */
  radius?: number;
}

export interface LineSeries {
  data: Point[];
  color: string;
  label?: string;
  /** Point shape for this series */
  pointShape?: PointShape;
  /** Point radius for this series */
  pointRadius?: number;
}

export interface LineGraphProps {
  data: Point[];
  width?: number;
  height?: number;
  lineColor?: string;
  lineWidth?: number;
  pointRadius?: number;
  pointColor?: string;
  /** Default point marker shape (default: 'circle') */
  pointShape?: PointShape;
  showPoints?: boolean;
  showGrid?: boolean;
  showArea?: boolean;
  areaColor?: string;
  xLabel?: string;
  yLabel?: string;
  title?: string;
  padding?: number;
  animate?: boolean;
  multiLine?: LineSeries[];
}

// ---------------------------------------------------------------------------
// Scale helpers
// ---------------------------------------------------------------------------

interface ScaleResult {
  xScale: (v: number) => number;
  yScale: (v: number) => number;
  xTicks: number[];
  yTicks: number[];
  xMin: number;
  xMax: number;
  yMin: number;
  yMax: number;
}

function niceTickValues(min: number, max: number, count: number): number[] {
  if (min === max) {
    return [min];
  }
  const step = (max - min) / (count - 1);
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    const raw = min + step * i;
    // Round to avoid floating-point noise
    ticks.push(Math.round(raw * 1e10) / 1e10);
  }
  return ticks;
}

function computeScales(
  allPoints: Point[],
  width: number,
  height: number,
  padding: number,
): ScaleResult {
  if (allPoints.length === 0) {
    return {
      xScale: () => padding,
      yScale: () => height - padding,
      xTicks: [],
      yTicks: [],
      xMin: 0,
      xMax: 0,
      yMin: 0,
      yMax: 0,
    };
  }

  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;

  for (const p of allPoints) {
    if (p.x < xMin) xMin = p.x;
    if (p.x > xMax) xMax = p.x;
    if (p.y < yMin) yMin = p.y;
    if (p.y > yMax) yMax = p.y;
  }

  // Guard against single-value ranges
  if (xMin === xMax) {
    xMin -= 1;
    xMax += 1;
  }
  if (yMin === yMax) {
    yMin -= 1;
    yMax += 1;
  }

  const plotWidth = width - padding * 2;
  const plotHeight = height - padding * 2;

  const xScale = (v: number): number =>
    padding + ((v - xMin) / (xMax - xMin)) * plotWidth;

  const yScale = (v: number): number =>
    height - padding - ((v - yMin) / (yMax - yMin)) * plotHeight;

  const tickCount = 6;
  const xTicks = niceTickValues(xMin, xMax, tickCount);
  const yTicks = niceTickValues(yMin, yMax, tickCount);

  return { xScale, yScale, xTicks, yTicks, xMin, xMax, yMin, yMax };
}

// ---------------------------------------------------------------------------
// Public hook — useLineGraphScales
// ---------------------------------------------------------------------------

export function useLineGraphScales(
  data: Point[],
  width: number,
  height: number,
  padding: number,
): ScaleResult {
  return useMemo(
    () => computeScales(data, width, height, padding),
    [data, width, height, padding],
  );
}

// ---------------------------------------------------------------------------
// Internal helper: format a number for display on ticks
// ---------------------------------------------------------------------------

function formatTick(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(1);
}

// ---------------------------------------------------------------------------
// Point shape renderer
// ---------------------------------------------------------------------------

/**
 * Create an SVG element for a data point marker.
 * Supports: circle, square, diamond, triangle, triangle-down, cross, plus
 */
function renderPointShape(
  shape: PointShape,
  cx: number,
  cy: number,
  r: number,
  fill: string,
  key: string,
  extraProps?: Record<string, unknown>,
): ReturnType<typeof createElement> {
  const base = { fill, key, ...extraProps };
  switch (shape) {
    case 'square':
      return createElement('rect', { ...base, x: cx - r, y: cy - r, width: r * 2, height: r * 2 });
    case 'diamond': {
      const pts = `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
      return createElement('polygon', { ...base, points: pts });
    }
    case 'triangle': {
      const h = r * 1.15;
      const pts = `${cx},${cy - h} ${cx + r},${cy + r * 0.6} ${cx - r},${cy + r * 0.6}`;
      return createElement('polygon', { ...base, points: pts });
    }
    case 'triangle-down': {
      const h = r * 1.15;
      const pts = `${cx - r},${cy - r * 0.6} ${cx + r},${cy - r * 0.6} ${cx},${cy + h}`;
      return createElement('polygon', { ...base, points: pts });
    }
    case 'cross': {
      const w = r * 0.35;
      return createElement('path', {
        ...base, fill: 'none', stroke: fill, 'stroke-width': String(w * 2), 'stroke-linecap': 'round',
        d: `M${cx - r},${cy - r}L${cx + r},${cy + r}M${cx + r},${cy - r}L${cx - r},${cy + r}`,
      });
    }
    case 'plus': {
      const w = r * 0.35;
      return createElement('path', {
        ...base, fill: 'none', stroke: fill, 'stroke-width': String(w * 2), 'stroke-linecap': 'round',
        d: `M${cx},${cy - r}L${cx},${cy + r}M${cx - r},${cy}L${cx + r},${cy}`,
      });
    }
    case 'circle':
    default:
      return createElement('circle', { ...base, cx, cy, r });
  }
}

// ---------------------------------------------------------------------------
// LineGraph component
// ---------------------------------------------------------------------------

export function LineGraph(props: LineGraphProps) {
  const {
    data,
    width = 600,
    height = 400,
    lineColor = '#3b82f6',
    lineWidth = 2,
    pointRadius = 4,
    pointColor = '#3b82f6',
    pointShape = 'circle' as PointShape,
    showPoints = true,
    showGrid = true,
    showArea = false,
    areaColor = 'rgba(59,130,246,0.15)',
    xLabel,
    yLabel,
    title,
    padding = 50,
    animate = false,
    multiLine,
  } = props;

  // Collect all points for scale computation
  const allPoints = useMemo(() => {
    const pts: Point[] = [...data];
    if (multiLine) {
      for (const series of multiLine) {
        pts.push(...series.data);
      }
    }
    return pts;
  }, [data, multiLine]);

  const scales = useLineGraphScales(allPoints, width, height, padding);
  const { xScale, yScale, xTicks, yTicks } = scales;

  // ---- Build children array ----
  const children: unknown[] = [];

  // Background
  children.push(
    createElement('rect', {
      x: 0,
      y: 0,
      width: '100%',
      fill: 'white',
      key: 'bg',
    }),
  );

  // Grid lines
  if (showGrid) {
    for (let i = 0; i < xTicks.length; i++) {
      const px = xScale(xTicks[i]);
      children.push(
        createElement('line', {
          x1: px,
          y1: padding,
          x2: px,
          y2: height - padding,
          stroke: '#e5e7eb',
          'stroke-dasharray': '4,4',
          key: `grid-x-${i}`,
        }),
      );
    }
    for (let i = 0; i < yTicks.length; i++) {
      const py = yScale(yTicks[i]);
      children.push(
        createElement('line', {
          x1: padding,
          y1: py,
          x2: width - padding,
          y2: py,
          stroke: '#e5e7eb',
          'stroke-dasharray': '4,4',
          key: `grid-y-${i}`,
        }),
      );
    }
  }

  // Axes
  // X axis
  children.push(
    createElement('line', {
      x1: padding,
      y1: height - padding,
      x2: width - padding,
      y2: height - padding,
      stroke: '#374151',
      'stroke-width': 1,
      key: 'x-axis',
    }),
  );
  // Y axis
  children.push(
    createElement('line', {
      x1: padding,
      y1: padding,
      x2: padding,
      y2: height - padding,
      stroke: '#374151',
      'stroke-width': 1,
      key: 'y-axis',
    }),
  );

  // X ticks and labels
  for (let i = 0; i < xTicks.length; i++) {
    const px = xScale(xTicks[i]);
    children.push(
      createElement('line', {
        x1: px,
        y1: height - padding,
        x2: px,
        y2: height - padding + 5,
        stroke: '#374151',
        key: `xtick-${i}`,
      }),
    );
    children.push(
      createElement(
        'text',
        {
          x: px,
          y: height - padding + 18,
          'text-anchor': 'end',
          'font-size': 11,
          fill: '#6b7280',
          transform: `rotate(-45, ${px}, ${height - padding + 18})`,
          key: `xlabel-${i}`,
        },
        formatTick(xTicks[i]),
      ),
    );
  }

  // Y ticks and labels
  for (let i = 0; i < yTicks.length; i++) {
    const py = yScale(yTicks[i]);
    children.push(
      createElement('line', {
        x1: padding - 5,
        y1: py,
        x2: padding,
        y2: py,
        stroke: '#374151',
        key: `ytick-${i}`,
      }),
    );
    children.push(
      createElement(
        'text',
        {
          x: padding - 10,
          y: py + 4,
          'text-anchor': 'end',
          'font-size': 11,
          fill: '#6b7280',
          key: `ylabel-${i}`,
        },
        formatTick(yTicks[i]),
      ),
    );
  }

  // ---- Helper to render a single line series ----
  function renderSeries(
    seriesData: Point[],
    color: string,
    seriesLineWidth: number,
    seriesShowArea: boolean,
    seriesAreaColor: string,
    seriesShowPoints: boolean,
    seriesPointColor: string,
    seriesPointRadius: number,
    seriesPointShape: PointShape,
    keyPrefix: string,
  ): void {
    if (seriesData.length === 0) return;

    const sorted = [...seriesData].sort((a, b) => a.x - b.x);

    // Area fill
    if (seriesShowArea) {
      const baseY = yScale(scales.yMin);
      const areaPoints = sorted
        .map((p) => `${xScale(p.x)},${yScale(p.y)}`)
        .join(' ');
      const firstX = xScale(sorted[0].x);
      const lastX = xScale(sorted[sorted.length - 1].x);
      const polygonPoints = `${firstX},${baseY} ${areaPoints} ${lastX},${baseY}`;

      children.push(
        createElement('polygon', {
          points: polygonPoints,
          fill: seriesAreaColor,
          key: `${keyPrefix}-area`,
        }),
      );
    }

    // Line path
    const linePoints = sorted
      .map((p) => `${xScale(p.x)},${yScale(p.y)}`)
      .join(' ');

    const polylineProps: Record<string, unknown> = {
      points: linePoints,
      fill: 'none',
      stroke: color,
      'stroke-width': seriesLineWidth,
      'stroke-linejoin': 'round',
      'stroke-linecap': 'round',
      key: `${keyPrefix}-line`,
    };

    if (animate) {
      polylineProps['stroke-dasharray'] = '1000';
      polylineProps['stroke-dashoffset'] = '1000';
      children.push(
        createElement(
          'polyline',
          polylineProps,
          createElement('animate', {
            attributeName: 'stroke-dashoffset',
            from: 1000,
            to: 0,
            dur: '1.5s',
            fill: 'freeze',
          }),
        ),
      );
    } else {
      children.push(createElement('polyline', polylineProps));
    }

    // Data points — supports per-point shape and radius overrides
    if (seriesShowPoints) {
      for (let i = 0; i < sorted.length; i++) {
        const px = xScale(sorted[i].x);
        const py = yScale(sorted[i].y);
        const ptShape = sorted[i].shape ?? seriesPointShape;
        const ptRadius = sorted[i].radius ?? seriesPointRadius;
        const ptKey = `${keyPrefix}-pt-${i}`;

        if (animate) {
          const marker = renderPointShape(ptShape, px, py, ptRadius, seriesPointColor, ptKey, { opacity: 0 });
          children.push(
            createElement('g', { key: `${ptKey}-g` },
              marker,
              createElement('animate', {
                attributeName: 'opacity',
                from: 0, to: 1, dur: '0.3s', begin: '1.2s', fill: 'freeze',
              }),
            ),
          );
        } else {
          children.push(renderPointShape(ptShape, px, py, ptRadius, seriesPointColor, ptKey));
        }
      }
    }
  }

  // Render primary data series
  renderSeries(
    data,
    lineColor,
    lineWidth,
    showArea,
    areaColor,
    showPoints,
    pointColor,
    pointRadius,
    pointShape,
    'primary',
  );

  // Render additional multiLine series
  if (multiLine) {
    for (let s = 0; s < multiLine.length; s++) {
      const series = multiLine[s];
      renderSeries(
        series.data,
        series.color,
        lineWidth,
        false,
        'transparent',
        showPoints,
        series.color,
        series.pointRadius ?? pointRadius,
        series.pointShape ?? pointShape,
        `series-${s}`,
      );
    }
  }

  // Legend (when multiLine is provided)
  if (multiLine && multiLine.length > 0) {
    const legendItems: unknown[] = [];
    const allSeries: { color: string; label: string }[] = [
      { color: lineColor, label: 'Primary' },
      ...multiLine.map((s, i) => ({
        color: s.color,
        label: s.label ?? `Series ${i + 1}`,
      })),
    ];

    const legendStartX = padding + 10;
    const legendGap = 16; // horizontal gap between items
    const rowHeight = 22; // vertical spacing between rows
    const charWidth = 7.2; // approximate width per character at font-size 12
    const swatchWidth = 14;
    const swatchTextGap = 6;
    const availableWidth = width - padding * 2 - 20;

    let cursorX = 0;
    let cursorY = 0;

    for (let i = 0; i < allSeries.length; i++) {
      const labelWidth = allSeries[i].label.length * charWidth;
      const itemWidth = swatchWidth + swatchTextGap + labelWidth;

      // Wrap to next line if this item would exceed available width
      if (cursorX > 0 && cursorX + itemWidth > availableWidth) {
        cursorX = 0;
        cursorY += rowHeight;
      }

      const lx = legendStartX + cursorX;
      const ly = padding - 30 - cursorY; // grow upward for additional rows

      legendItems.push(
        createElement('rect', {
          x: lx,
          y: ly,
          width: swatchWidth,
          height: 14,
          fill: allSeries[i].color,
          rx: 2,
          key: `legend-rect-${i}`,
        }),
      );
      legendItems.push(
        createElement(
          'text',
          {
            x: lx + swatchWidth + swatchTextGap,
            y: ly + 12,
            'font-size': 12,
            fill: '#374151',
            key: `legend-text-${i}`,
          },
          allSeries[i].label,
        ),
      );

      cursorX += itemWidth + legendGap;
    }

    children.push(
      createElement('g', { key: 'legend' }, ...legendItems),
    );
  }

  // Axis labels
  if (xLabel) {
    children.push(
      createElement(
        'text',
        {
          x: width / 2,
          y: height - 8,
          'text-anchor': 'middle',
          'font-size': 13,
          fill: '#374151',
          key: 'x-axis-label',
        },
        xLabel,
      ),
    );
  }

  if (yLabel) {
    children.push(
      createElement(
        'text',
        {
          x: 14,
          y: height / 2,
          'text-anchor': 'middle',
          'font-size': 13,
          fill: '#374151',
          transform: `rotate(-90, 14, ${height / 2})`,
          key: 'y-axis-label',
        },
        yLabel,
      ),
    );
  }

  // Title
  if (title) {
    children.push(
      createElement(
        'text',
        {
          x: width / 2,
          y: 20,
          'text-anchor': 'middle',
          'font-size': 16,
          'font-weight': 'bold',
          fill: '#111827',
          key: 'title',
        },
        title,
      ),
    );
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
