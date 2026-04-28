// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BoxPlot — A SpecifyJS component that renders box-and-whisker plots as SVG.
 *
 * Supports:
 *  - Vertical and horizontal orientation
 *  - Automatic quartile, whisker, and outlier computation
 *  - Optional mean marker
 *  - Optional outlier display
 *  - Grid lines
 *  - Per-box colors
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

export interface BoxPlotDatum {
  /** Category label */
  label: string;
  /** Raw numeric values to compute statistics from */
  values: number[];
  /** Optional box fill color */
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface BoxPlotProps {
  /** Array of box plot data */
  data: BoxPlotDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Plot orientation (default: 'vertical') */
  orientation?: 'horizontal' | 'vertical';
  /** Show outlier circles (default: true) */
  showOutliers?: boolean;
  /** Show mean marker (default: false) */
  showMean?: boolean;
  /** Whisker line color (default: '#374151') */
  whiskerColor?: string;
  /** Box width as fraction of available space (default: 0.6) */
  boxWidth?: number;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 60) */
  padding?: number;
}

// -- Statistics ---------------------------------------------------------------

export interface BoxStats {
  q1: number;
  median: number;
  q3: number;
  iqr: number;
  whiskerLow: number;
  whiskerHigh: number;
  mean: number;
  outliers: number[];
  min: number;
  max: number;
}

/** Sort numbers ascending (non-destructive — copies first). */
function sortedCopy(arr: number[]): number[] {
  const copy: number[] = [];
  for (let i = 0; i < arr.length; i++) {
    const v = arr[i]!;
    if (typeof v === 'number' && isFinite(v) && !isNaN(v)) {
      copy.push(v);
    }
  }
  copy.sort((a, b) => a - b);
  return copy;
}

/** Compute the p-th percentile from sorted data using linear interpolation. */
function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  if (sorted.length === 1) return sorted[0]!;
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) return sorted[lower]!;
  const fraction = index - lower;
  return sorted[lower]! + fraction * (sorted[upper]! - sorted[lower]!);
}

/** Compute box-plot statistics from raw values. */
export function computeBoxStats(values: number[]): BoxStats | null {
  const sorted = sortedCopy(values);
  if (sorted.length === 0) return null;

  const q1 = percentile(sorted, 25);
  const median = percentile(sorted, 50);
  const q3 = percentile(sorted, 75);
  const iqr = q3 - q1;

  const whiskerLowBound = q1 - 1.5 * iqr;
  const whiskerHighBound = q3 + 1.5 * iqr;

  // Find actual whisker endpoints (closest data points within bounds)
  let whiskerLow = sorted[0]!;
  for (const v of sorted) {
    if (v >= whiskerLowBound) {
      whiskerLow = v;
      break;
    }
  }

  let whiskerHigh = sorted[sorted.length - 1]!;
  for (let i = sorted.length - 1; i >= 0; i--) {
    if (sorted[i]! <= whiskerHighBound) {
      whiskerHigh = sorted[i]!;
      break;
    }
  }

  // Compute mean
  let sum = 0;
  for (const v of sorted) {
    sum += v;
  }
  const mean = sum / sorted.length;

  // Collect outliers
  const outliers: number[] = [];
  for (const v of sorted) {
    if (v < whiskerLowBound || v > whiskerHighBound) {
      outliers.push(v);
    }
  }

  return {
    q1,
    median,
    q3,
    iqr,
    whiskerLow,
    whiskerHigh,
    mean,
    outliers,
    min: sorted[0]!,
    max: sorted[sorted.length - 1]!,
  };
}

// -- Helpers ------------------------------------------------------------------

/** Nice round grid step for a given range targeting ~5 lines. */
function niceStep(range: number): number {
  if (range <= 0) return 1;
  const rough = range / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

// -- Component ----------------------------------------------------------------

export function BoxPlot(props: BoxPlotProps) {
  const {
    data = [],
    width = 600,
    height = 400,
    orientation = 'vertical',
    showOutliers = true,
    showMean = false,
    whiskerColor = '#374151',
    boxWidth = 0.6,
    showGrid = true,
    title,
    padding = 60,
  } = props;

  const isVertical = orientation === 'vertical';

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const defaultColors = ['#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16'];

  // Compute statistics for each datum
  const stats = useMemo(() => {
    const result: (BoxStats | null)[] = [];
    for (const d of data) {
      result.push(computeBoxStats(d.values));
    }
    return result;
  }, [data]);

  // Compute global value range
  const valueExtent = useMemo(() => {
    let globalMin = Infinity;
    let globalMax = -Infinity;
    for (const s of stats) {
      if (s === null) continue;
      const lo = showOutliers && s.outliers.length > 0
        ? Math.min(s.whiskerLow, s.outliers[0]!)
        : s.whiskerLow;
      const hi = showOutliers && s.outliers.length > 0
        ? Math.max(s.whiskerHigh, s.outliers[s.outliers.length - 1]!)
        : s.whiskerHigh;
      if (lo < globalMin) globalMin = lo;
      if (hi > globalMax) globalMax = hi;
    }
    if (!isFinite(globalMin)) { globalMin = 0; globalMax = 1; }
    // Add 5% padding to range
    const range = globalMax - globalMin;
    const pad = range > 0 ? range * 0.05 : 0.5;
    return { min: globalMin - pad, max: globalMax + pad };
  }, [stats, showOutliers]);

  const valueAxisLength = isVertical ? chartHeight : chartWidth;
  const categoryAxisLength = isVertical ? chartWidth : chartHeight;
  const itemCount = data.length > 0 ? data.length : 1;
  const categorySlot = categoryAxisLength / itemCount;
  const effectiveBoxWidth = categorySlot * Math.min(Math.max(boxWidth, 0.1), 0.95);

  // Map a value to a pixel position along the value axis
  const scaleValue = useCallback(
    (v: number): number => {
      const range = valueExtent.max - valueExtent.min;
      if (range === 0) return valueAxisLength / 2;
      return ((v - valueExtent.min) / range) * valueAxisLength;
    },
    [valueExtent, valueAxisLength],
  );

  // ---- Grid -----------------------------------------------------------------

  const buildGrid = useCallback(() => {
    if (!showGrid) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const range = valueExtent.max - valueExtent.min;
    const step = niceStep(range);
    const start = Math.ceil(valueExtent.min / step) * step;

    for (let v = start; v <= valueExtent.max; v += step) {
      const pos = scaleValue(v);
      const label = String(Math.round(v * 1000) / 1000);

      if (isVertical) {
        const y = padding + chartHeight - pos;
        elements.push(
          createElement('line', {
            key: `grid-${v}`,
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
          createElement('text', {
            key: `glabel-${v}`,
            x: String(padding - 6),
            y: String(y + 4),
            'text-anchor': 'end',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          }, label),
        );
      } else {
        const x = padding + pos;
        elements.push(
          createElement('line', {
            key: `grid-${v}`,
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
          createElement('text', {
            key: `glabel-${v}`,
            x: String(x),
            y: String(padding + chartHeight + 16),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          }, label),
        );
      }
    }

    return elements;
  }, [showGrid, valueExtent, scaleValue, isVertical, padding, chartWidth, chartHeight]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    elements.push(
      createElement('line', {
        key: 'axis-value',
        x1: String(padding),
        y1: isVertical ? String(padding) : String(padding + chartHeight),
        x2: String(padding),
        y2: String(padding + chartHeight),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );

    elements.push(
      createElement('line', {
        key: 'axis-category',
        x1: String(padding),
        y1: String(padding + chartHeight),
        x2: String(padding + chartWidth),
        y2: String(padding + chartHeight),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );

    return elements;
  }, [padding, chartWidth, chartHeight, isVertical]);

  // ---- Boxes ----------------------------------------------------------------

  const buildBoxes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < data.length; i++) {
      const s = stats[i];
      if (s === null) continue;
      const d = data[i]!;
      const fill = d.color ?? defaultColors[i % defaultColors.length]!;

      const catCenter = categorySlot * i + categorySlot / 2;
      const halfBox = effectiveBoxWidth / 2;

      if (isVertical) {
        const q1y = padding + chartHeight - scaleValue(s.q1);
        const q3y = padding + chartHeight - scaleValue(s.q3);
        const medY = padding + chartHeight - scaleValue(s.median);
        const wLowY = padding + chartHeight - scaleValue(s.whiskerLow);
        const wHighY = padding + chartHeight - scaleValue(s.whiskerHigh);
        const cx = padding + catCenter;

        // Whisker low line (vertical)
        elements.push(
          createElement('line', {
            key: `wl-${i}`,
            x1: String(cx),
            y1: String(q1y),
            x2: String(cx),
            y2: String(wLowY),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );
        // Whisker low cap
        elements.push(
          createElement('line', {
            key: `wlc-${i}`,
            x1: String(cx - halfBox * 0.4),
            y1: String(wLowY),
            x2: String(cx + halfBox * 0.4),
            y2: String(wLowY),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );

        // Whisker high line (vertical)
        elements.push(
          createElement('line', {
            key: `wh-${i}`,
            x1: String(cx),
            y1: String(q3y),
            x2: String(cx),
            y2: String(wHighY),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );
        // Whisker high cap
        elements.push(
          createElement('line', {
            key: `whc-${i}`,
            x1: String(cx - halfBox * 0.4),
            y1: String(wHighY),
            x2: String(cx + halfBox * 0.4),
            y2: String(wHighY),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );

        // Box (Q1 to Q3)
        const boxTop = Math.min(q1y, q3y);
        const boxHeight = Math.abs(q1y - q3y);
        elements.push(
          createElement('rect', {
            key: `box-${i}`,
            x: String(cx - halfBox),
            y: String(boxTop),
            width: String(effectiveBoxWidth),
            height: String(Math.max(boxHeight, 1)),
            fill,
            stroke: whiskerColor,
            'stroke-width': '1.5',
            opacity: '0.8',
            'aria-label': `${d.label}: Q1=${s.q1.toFixed(1)}, median=${s.median.toFixed(1)}, Q3=${s.q3.toFixed(1)}`,
            role: 'img',
          }),
        );

        // Median line
        elements.push(
          createElement('line', {
            key: `med-${i}`,
            x1: String(cx - halfBox),
            y1: String(medY),
            x2: String(cx + halfBox),
            y2: String(medY),
            stroke: '#fff',
            'stroke-width': '2.5',
          }),
        );

        // Mean marker
        if (showMean) {
          const meanY = padding + chartHeight - scaleValue(s.mean);
          elements.push(
            createElement('circle', {
              key: `mean-${i}`,
              cx: String(cx),
              cy: String(meanY),
              r: '3.5',
              fill: '#fff',
              stroke: whiskerColor,
              'stroke-width': '1.5',
              'aria-label': `Mean: ${s.mean.toFixed(1)}`,
            }),
          );
        }

        // Outliers
        if (showOutliers) {
          for (let j = 0; j < s.outliers.length; j++) {
            const oy = padding + chartHeight - scaleValue(s.outliers[j]!);
            elements.push(
              createElement('circle', {
                key: `out-${i}-${j}`,
                cx: String(cx),
                cy: String(oy),
                r: '3',
                fill: 'none',
                stroke: whiskerColor,
                'stroke-width': '1.5',
                'aria-label': `Outlier: ${s.outliers[j]}`,
              }),
            );
          }
        }

        // Category label
        elements.push(
          createElement('text', {
            key: `cat-${i}`,
            x: String(cx),
            y: String(padding + chartHeight + 18),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#374151',
          }, d.label),
        );
      } else {
        // Horizontal orientation
        const q1x = padding + scaleValue(s.q1);
        const q3x = padding + scaleValue(s.q3);
        const medX = padding + scaleValue(s.median);
        const wLowX = padding + scaleValue(s.whiskerLow);
        const wHighX = padding + scaleValue(s.whiskerHigh);
        const cy = padding + catCenter;

        // Whisker low
        elements.push(
          createElement('line', {
            key: `wl-${i}`,
            x1: String(q1x),
            y1: String(cy),
            x2: String(wLowX),
            y2: String(cy),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );
        elements.push(
          createElement('line', {
            key: `wlc-${i}`,
            x1: String(wLowX),
            y1: String(cy - halfBox * 0.4),
            x2: String(wLowX),
            y2: String(cy + halfBox * 0.4),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );

        // Whisker high
        elements.push(
          createElement('line', {
            key: `wh-${i}`,
            x1: String(q3x),
            y1: String(cy),
            x2: String(wHighX),
            y2: String(cy),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );
        elements.push(
          createElement('line', {
            key: `whc-${i}`,
            x1: String(wHighX),
            y1: String(cy - halfBox * 0.4),
            x2: String(wHighX),
            y2: String(cy + halfBox * 0.4),
            stroke: whiskerColor,
            'stroke-width': '1.5',
          }),
        );

        // Box
        const boxLeft = Math.min(q1x, q3x);
        const boxW = Math.abs(q3x - q1x);
        elements.push(
          createElement('rect', {
            key: `box-${i}`,
            x: String(boxLeft),
            y: String(cy - halfBox),
            width: String(Math.max(boxW, 1)),
            height: String(effectiveBoxWidth),
            fill,
            stroke: whiskerColor,
            'stroke-width': '1.5',
            opacity: '0.8',
            'aria-label': `${d.label}: Q1=${s.q1.toFixed(1)}, median=${s.median.toFixed(1)}, Q3=${s.q3.toFixed(1)}`,
            role: 'img',
          }),
        );

        // Median line
        elements.push(
          createElement('line', {
            key: `med-${i}`,
            x1: String(medX),
            y1: String(cy - halfBox),
            x2: String(medX),
            y2: String(cy + halfBox),
            stroke: '#fff',
            'stroke-width': '2.5',
          }),
        );

        // Mean marker
        if (showMean) {
          const meanX = padding + scaleValue(s.mean);
          elements.push(
            createElement('circle', {
              key: `mean-${i}`,
              cx: String(meanX),
              cy: String(cy),
              r: '3.5',
              fill: '#fff',
              stroke: whiskerColor,
              'stroke-width': '1.5',
              'aria-label': `Mean: ${s.mean.toFixed(1)}`,
            }),
          );
        }

        // Outliers
        if (showOutliers) {
          for (let j = 0; j < s.outliers.length; j++) {
            const ox = padding + scaleValue(s.outliers[j]!);
            elements.push(
              createElement('circle', {
                key: `out-${i}-${j}`,
                cx: String(ox),
                cy: String(cy),
                r: '3',
                fill: 'none',
                stroke: whiskerColor,
                'stroke-width': '1.5',
                'aria-label': `Outlier: ${s.outliers[j]}`,
              }),
            );
          }
        }

        // Category label
        elements.push(
          createElement('text', {
            key: `cat-${i}`,
            x: String(padding - 6),
            y: String(cy + 4),
            'text-anchor': 'end',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#374151',
          }, d.label),
        );
      }
    }

    return elements;
  }, [data, stats, scaleValue, isVertical, padding, chartWidth, chartHeight,
    categorySlot, effectiveBoxWidth, whiskerColor, showOutliers, showMean, defaultColors]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement('text', {
        key: 'title',
        x: String(width / 2),
        y: String(padding / 2 + 4),
        'text-anchor': 'middle',
        'font-size': '16',
        'font-weight': 'bold',
        'font-family': 'sans-serif',
        fill: '#111827',
      }, title),
    ];
  }, [title, width, padding]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridElements = buildGrid();
  const axesElements = buildAxes();
  const boxElements = buildBoxes();
  const titleElements = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Box plot',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleElements,
    ...gridElements,
    ...axesElements,
    ...boxElements,
  );
}
