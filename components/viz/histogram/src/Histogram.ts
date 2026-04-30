// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Histogram -- A SpecifyJS component that bins raw numeric data and renders
 * vertical bars as SVG.
 *
 * Supports:
 *  - Automatic or user-specified bin count
 *  - Bin-range labels on the x-axis, counts on the y-axis
 *  - Optional grid lines, value labels, title, axis labels
 *  - Configurable colors, gap, and padding
 *  - Edge cases: empty data, single value, all-same values
 *
 * Zero runtime dependencies -- pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo, useCallback } from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface HistogramProps {
  /** Raw data values to bin */
  data: number[];
  /** Number of bins (default: 10) */
  bins?: number;
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Bar fill color (default: '#3b82f6') */
  barColor?: string;
  /** Gap between bars in px (default: 2) */
  barGap?: number;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Show count values above bars (default: true) */
  showValues?: boolean;
  /** Chart title */
  title?: string;
  /** X-axis label */
  xLabel?: string;
  /** Y-axis label */
  yLabel?: string;
  /** Padding around chart area in px (default: 60) */
  padding?: number;
}

// -- Types --------------------------------------------------------------------

interface Bin {
  min: number;
  max: number;
  count: number;
}

// -- Helpers ------------------------------------------------------------------

/** Compute histogram bins from raw data. */
function computeBins(data: number[], numBins: number): Bin[] {
  if (data.length === 0) return [];

  let min = data[0]!;
  let max = data[0]!;
  for (let i = 1; i < data.length; i++) {
    const v = data[i]!;
    if (v < min) min = v;
    if (v > max) max = v;
  }

  // Handle case where all values are the same
  if (min === max) {
    return [{ min, max: max + 1, count: data.length }];
  }

  const binWidth = (max - min) / numBins;
  const bins: Bin[] = [];
  for (let i = 0; i < numBins; i++) {
    bins.push({
      min: min + i * binWidth,
      max: min + (i + 1) * binWidth,
      count: 0,
    });
  }

  for (let i = 0; i < data.length; i++) {
    const v = data[i]!;
    let idx = Math.floor((v - min) / binWidth);
    // Clamp the last value into the final bin
    if (idx >= numBins) idx = numBins - 1;
    bins[idx]!.count++;
  }

  return bins;
}

/** Nice round grid step for a given max value aiming for ~5 grid lines. */
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

/** Format a number for display: integers stay as-is, floats get 1 decimal. */
function formatNum(v: number): string {
  if (Number.isInteger(v)) return String(v);
  return v.toFixed(1);
}

// -- Component ----------------------------------------------------------------

export function Histogram(props: HistogramProps) {
  const {
    data = [],
    bins: numBins = 10,
    width = 600,
    height = 400,
    barColor = '#3b82f6',
    barGap = 2,
    showGrid = true,
    showValues = true,
    title,
    xLabel,
    yLabel,
    padding = 60,
  } = props;

  const effectiveBins = Math.max(1, Math.round(numBins));

  const binnedData = useMemo(
    () => computeBins(data, effectiveBins),
    [data, effectiveBins],
  );

  const maxCount = useMemo(() => {
    let m = 0;
    for (let i = 0; i < binnedData.length; i++) {
      if (binnedData[i]!.count > m) m = binnedData[i]!.count;
    }
    return m > 0 ? m : 1;
  }, [binnedData]);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // ---- Grid lines -----------------------------------------------------------

  const buildGridLines = useCallback(() => {
    if (!showGrid) return [];

    const step = niceStep(maxCount);
    const lines: ReturnType<typeof createElement>[] = [];

    for (let v = step; v <= maxCount; v += step) {
      const y = padding + chartHeight - (v / maxCount) * chartHeight;
      lines.push(
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
      lines.push(
        createElement(
          'text',
          {
            key: `grid-label-${v}`,
            x: String(padding - 8),
            y: String(y + 4),
            'text-anchor': 'end',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(v),
        ),
      );
    }

    return lines;
  }, [showGrid, maxCount, padding, chartWidth, chartHeight]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    // Y-axis
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

    // X-axis
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

    return elements;
  }, [padding, chartWidth, chartHeight]);

  // ---- Bars -----------------------------------------------------------------

  const buildBars = useCallback(() => {
    if (binnedData.length === 0) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const totalGap = barGap * (binnedData.length - 1);
    const barWidth = Math.max(1, (chartWidth - totalGap) / binnedData.length);

    for (let i = 0; i < binnedData.length; i++) {
      const bin = binnedData[i]!;
      const barHeight = (bin.count / maxCount) * chartHeight;
      const x = padding + i * (barWidth + barGap);
      const y = padding + chartHeight - barHeight;

      // Bar rect
      elements.push(
        createElement('rect', {
          key: `bar-${i}`,
          x: String(x),
          y: String(y),
          width: String(barWidth),
          height: String(barHeight),
          fill: barColor,
        }),
      );

      // Value label above bar
      if (showValues && bin.count > 0) {
        elements.push(
          createElement(
            'text',
            {
              key: `val-${i}`,
              x: String(x + barWidth / 2),
              y: String(y - 4),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            String(bin.count),
          ),
        );
      }

      // Bin range label on x-axis (show every label if <=15 bins, otherwise every other)
      const showLabel = binnedData.length <= 15 || i % 2 === 0 || i === binnedData.length - 1;
      if (showLabel) {
        const label = binnedData.length === 1
          ? formatNum(bin.min)
          : formatNum(bin.min);
        elements.push(
          createElement(
            'text',
            {
              key: `xlabel-${i}`,
              x: String(x + barWidth / 2),
              y: String(padding + chartHeight + 14),
              'text-anchor': 'middle',
              'font-size': '9',
              'font-family': 'sans-serif',
              fill: '#6b7280',
            },
            label,
          ),
        );
      }
    }

    // Final x-axis tick showing the upper bound of the last bin
    if (binnedData.length > 0) {
      const lastBin = binnedData[binnedData.length - 1]!;
      const lastX = padding + chartWidth;
      elements.push(
        createElement(
          'text',
          {
            key: 'xlabel-end',
            x: String(lastX),
            y: String(padding + chartHeight + 14),
            'text-anchor': 'middle',
            'font-size': '9',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          formatNum(lastBin.max),
        ),
      );
    }

    return elements;
  }, [binnedData, maxCount, barGap, barColor, showValues, padding, chartWidth, chartHeight]);

  // ---- Title & labels -------------------------------------------------------

  const buildTitle = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    if (title) {
      elements.push(
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
      );
    }

    if (xLabel) {
      elements.push(
        createElement(
          'text',
          {
            key: 'x-label',
            x: String(padding + chartWidth / 2),
            y: String(height - 8),
            'text-anchor': 'middle',
            'font-size': '12',
            'font-family': 'sans-serif',
            fill: '#374151',
          },
          xLabel,
        ),
      );
    }

    if (yLabel) {
      elements.push(
        createElement(
          'text',
          {
            key: 'y-label',
            x: String(14),
            y: String(padding + chartHeight / 2),
            'text-anchor': 'middle',
            'font-size': '12',
            'font-family': 'sans-serif',
            fill: '#374151',
            transform: `rotate(-90 14 ${padding + chartHeight / 2})`,
          },
          yLabel,
        ),
      );
    }

    return elements;
  }, [title, xLabel, yLabel, width, height, padding, chartWidth, chartHeight]);

  // ---- Empty state ----------------------------------------------------------

  const buildEmptyState = useCallback(() => {
    if (data.length > 0) return [];
    return [
      createElement(
        'text',
        {
          key: 'empty',
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#9ca3af',
        },
        'No data',
      ),
    ];
  }, [data.length, width, height]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridLines = buildGridLines();
  const axes = buildAxes();
  const bars = buildBars();
  const titleEls = buildTitle();
  const emptyState = buildEmptyState();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Histogram',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEls,
    ...gridLines,
    ...axes,
    ...bars,
    ...emptyState,
  );
}
