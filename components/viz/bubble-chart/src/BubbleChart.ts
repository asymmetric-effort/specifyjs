// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BubbleChart — A SpecifyJS component that renders bubble (scatter) charts as SVG.
 *
 * Supports:
 *  - Three-dimensional data encoding (x, y, bubble radius)
 *  - Auto-scaling of bubble sizes within configurable min/max radius
 *  - Grid lines and axes
 *  - Per-datum labels and colors
 *  - Configurable opacity
 *  - ARIA accessibility attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface BubbleDatum {
  x: number;
  y: number;
  r: number;
  label?: string;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface BubbleChartProps {
  /** Array of bubble data points */
  data: BubbleDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Show axes (default: true) */
  showAxes?: boolean;
  /** Show datum labels (default: false) */
  showLabels?: boolean;
  /** Maximum rendered bubble radius in px (default: 40) */
  maxBubbleRadius?: number;
  /** Minimum rendered bubble radius in px (default: 4) */
  minBubbleRadius?: number;
  /** Default bubble fill color (default: '#3b82f6') */
  defaultColor?: string;
  /** Bubble fill opacity (default: 0.7) */
  opacity?: number;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 60) */
  padding?: number;
}

// -- Helpers ------------------------------------------------------------------

/** Compute a nice round step for grid lines targeting ~5 lines. */
function niceStep(maxVal: number): number {
  if (maxVal <= 0) return 1;
  const rough = maxVal / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

/** Clamp a number within bounds. */
function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Check if a number is finite and not NaN. */
function isFiniteNum(n: number): boolean {
  return typeof n === 'number' && isFinite(n) && !isNaN(n);
}

// -- Component ----------------------------------------------------------------

export function BubbleChart(props: BubbleChartProps) {
  const {
    data = [],
    width = 600,
    height = 400,
    xLabel,
    yLabel,
    showGrid = true,
    showAxes = true,
    showLabels = false,
    maxBubbleRadius = 40,
    minBubbleRadius = 4,
    defaultColor = '#3b82f6',
    opacity = 0.7,
    title,
    padding = 60,
  } = props;

  // Filter out invalid data points
  const validData = useMemo(() => {
    const result: BubbleDatum[] = [];
    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      if (isFiniteNum(d.x) && isFiniteNum(d.y) && isFiniteNum(d.r)) {
        result.push(d);
      }
    }
    return result;
  }, [data]);

  // Chart area dimensions
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Compute data extents
  const extents = useMemo(() => {
    if (validData.length === 0) {
      return { xMin: 0, xMax: 1, yMin: 0, yMax: 1, rMin: 0, rMax: 1 };
    }
    let xMin = Infinity;
    let xMax = -Infinity;
    let yMin = Infinity;
    let yMax = -Infinity;
    let rMin = Infinity;
    let rMax = -Infinity;
    for (const d of validData) {
      if (d.x < xMin) xMin = d.x;
      if (d.x > xMax) xMax = d.x;
      if (d.y < yMin) yMin = d.y;
      if (d.y > yMax) yMax = d.y;
      if (d.r < rMin) rMin = d.r;
      if (d.r > rMax) rMax = d.r;
    }
    // Ensure non-zero ranges
    if (xMin === xMax) { xMin -= 1; xMax += 1; }
    if (yMin === yMax) { yMin -= 1; yMax += 1; }
    if (rMin === rMax) { rMin = 0; rMax = rMax > 0 ? rMax : 1; }
    return { xMin, xMax, yMin, yMax, rMin, rMax };
  }, [validData]);

  // Scale functions
  const scaleX = useCallback(
    (v: number): number => {
      const range = extents.xMax - extents.xMin;
      return padding + ((v - extents.xMin) / range) * chartWidth;
    },
    [extents, padding, chartWidth],
  );

  const scaleY = useCallback(
    (v: number): number => {
      const range = extents.yMax - extents.yMin;
      return padding + chartHeight - ((v - extents.yMin) / range) * chartHeight;
    },
    [extents, padding, chartHeight],
  );

  const scaleR = useCallback(
    (v: number): number => {
      const range = extents.rMax - extents.rMin;
      if (range === 0) return (minBubbleRadius + maxBubbleRadius) / 2;
      const t = (v - extents.rMin) / range;
      return minBubbleRadius + t * (maxBubbleRadius - minBubbleRadius);
    },
    [extents, minBubbleRadius, maxBubbleRadius],
  );

  // ---- Grid lines -----------------------------------------------------------

  const buildGrid = useCallback(() => {
    if (!showGrid) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    // X-axis grid lines
    const xStep = niceStep(extents.xMax - extents.xMin);
    const xStart = Math.ceil(extents.xMin / xStep) * xStep;
    for (let v = xStart; v <= extents.xMax; v += xStep) {
      const x = scaleX(v);
      elements.push(
        createElement('line', {
          key: `grid-x-${v}`,
          x1: String(x),
          y1: String(padding),
          x2: String(x),
          y2: String(padding + chartHeight),
          stroke: '#e5e7eb',
          'stroke-width': '1',
          'stroke-dasharray': '4 2',
        }),
      );
      elements.push(
        createElement(
          'text',
          {
            key: `grid-xlabel-${v}`,
            x: String(x),
            y: String(padding + chartHeight + 16),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(Math.round(v * 1000) / 1000),
        ),
      );
    }

    // Y-axis grid lines
    const yStep = niceStep(extents.yMax - extents.yMin);
    const yStart = Math.ceil(extents.yMin / yStep) * yStep;
    for (let v = yStart; v <= extents.yMax; v += yStep) {
      const y = scaleY(v);
      elements.push(
        createElement('line', {
          key: `grid-y-${v}`,
          x1: String(padding),
          y1: String(y),
          x2: String(padding + chartWidth),
          y2: String(y),
          stroke: '#e5e7eb',
          'stroke-width': '1',
          'stroke-dasharray': '4 2',
        }),
      );
      elements.push(
        createElement(
          'text',
          {
            key: `grid-ylabel-${v}`,
            x: String(padding - 6),
            y: String(y + 4),
            'text-anchor': 'end',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(Math.round(v * 1000) / 1000),
        ),
      );
    }

    return elements;
  }, [showGrid, extents, scaleX, scaleY, padding, chartWidth, chartHeight]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    if (!showAxes) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    // Y axis
    elements.push(
      createElement('line', {
        key: 'axis-y',
        x1: String(padding),
        y1: String(padding),
        x2: String(padding),
        y2: String(padding + chartHeight),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );

    // X axis
    elements.push(
      createElement('line', {
        key: 'axis-x',
        x1: String(padding),
        y1: String(padding + chartHeight),
        x2: String(padding + chartWidth),
        y2: String(padding + chartHeight),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );

    // X-axis label
    if (xLabel) {
      elements.push(
        createElement(
          'text',
          {
            key: 'x-label',
            x: String(padding + chartWidth / 2),
            y: String(padding + chartHeight + 40),
            'text-anchor': 'middle',
            'font-size': '13',
            'font-family': 'sans-serif',
            fill: '#374151',
          },
          xLabel,
        ),
      );
    }

    // Y-axis label (rotated)
    if (yLabel) {
      elements.push(
        createElement(
          'text',
          {
            key: 'y-label',
            x: String(padding - 40),
            y: String(padding + chartHeight / 2),
            'text-anchor': 'middle',
            'font-size': '13',
            'font-family': 'sans-serif',
            fill: '#374151',
            transform: `rotate(-90, ${padding - 40}, ${padding + chartHeight / 2})`,
          },
          yLabel,
        ),
      );
    }

    return elements;
  }, [showAxes, padding, chartWidth, chartHeight, xLabel, yLabel]);

  // ---- Bubbles --------------------------------------------------------------

  const buildBubbles = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < validData.length; i++) {
      const d = validData[i]!;
      const cx = scaleX(d.x);
      const cy = scaleY(d.y);
      const r = clamp(scaleR(d.r), minBubbleRadius, maxBubbleRadius);
      const fill = d.color ?? defaultColor;

      elements.push(
        createElement('circle', {
          key: `bubble-${i}`,
          cx: String(cx),
          cy: String(cy),
          r: String(r),
          fill,
          opacity: String(opacity),
          stroke: fill,
          'stroke-width': '1',
          'stroke-opacity': '0.8',
          'aria-label': d.label ?? `Bubble at (${d.x}, ${d.y}) size ${d.r}`,
          role: 'img',
        }),
      );

      if (showLabels && d.label) {
        elements.push(
          createElement(
            'text',
            {
              key: `label-${i}`,
              x: String(cx),
              y: String(cy - r - 4),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            d.label,
          ),
        );
      }
    }

    return elements;
  }, [validData, scaleX, scaleY, scaleR, defaultColor, opacity, showLabels, minBubbleRadius, maxBubbleRadius]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(padding / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width, padding]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridElements = buildGrid();
  const axesElements = buildAxes();
  const bubbleElements = buildBubbles();
  const titleElements = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Bubble chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleElements,
    ...gridElements,
    ...axesElements,
    ...bubbleElements,
  );
}
