// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * WaterfallChart -- A SpecifyJS component that renders waterfall/cascade charts
 * as SVG.
 *
 * Each bar starts where the previous bar ended, showing cumulative effect.
 * Bars typed as 'total' start from zero. Increases go up (green), decreases
 * go down (red), and totals are a distinct color (blue).
 *
 * Supports:
 *  - Automatic cumulative positioning
 *  - Connector lines between bars
 *  - Color-coded increase/decrease/total
 *  - Grid lines, value labels, title
 *  - Edge cases: empty data, single item, all-zero values, negative cumulative
 *
 * Zero runtime dependencies -- pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import { useMemo, useCallback } from 'specifyjs/hooks';
import { useVizTheme } from '../../theme/src/index';
import { scaleValue as logScaleValue, generateLogTicks } from '../../wrapper/src/log-scale';
import type { ScaleType } from '../../wrapper/src/log-scale';
import { createPatternDefs, getPatternFill } from '../../wrapper/src/colorblind-patterns';

// -- Data types ---------------------------------------------------------------

export interface WaterfallDatum {
  label: string;
  value: number;
  type?: 'increase' | 'decrease' | 'total';
}

// -- Props --------------------------------------------------------------------

export interface WaterfallChartProps {
  /** Data points to render */
  data: WaterfallDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Color for increase bars (default: '#10b981') */
  increaseColor?: string;
  /** Color for decrease bars (default: '#ef4444') */
  decreaseColor?: string;
  /** Color for total bars (default: '#3b82f6') */
  totalColor?: string;
  /** Color for connector lines (default: '#94a3b8') */
  connectorColor?: string;
  /** Show value labels on bars (default: true) */
  showValues?: boolean;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Show connector lines between bars (default: true) */
  showConnectors?: boolean;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 60) */
  padding?: number;
  /** Scale type for the Y axis. Default: 'linear' */
  scaleType?: ScaleType;
  /** Base for logarithmic scale (default: 10) */
  logBase?: number;
  /** Show colorblind-accessible pattern overlays on bars (default: false) */
  colorblindPatterns?: boolean;
}

// -- Internal types -----------------------------------------------------------

interface ComputedBar {
  label: string;
  value: number;
  type: 'increase' | 'decrease' | 'total';
  start: number; // cumulative start
  end: number;   // cumulative end
}

// -- Helpers ------------------------------------------------------------------

/** Compute cumulative bar positions from data. */
function computeBars(data: WaterfallDatum[]): ComputedBar[] {
  const bars: ComputedBar[] = [];
  let cumulative = 0;

  for (let i = 0; i < data.length; i++) {
    const d = data[i]!;
    const type = d.type ?? (d.value >= 0 ? 'increase' : 'decrease');

    if (type === 'total') {
      bars.push({
        label: d.label,
        value: cumulative,
        type: 'total',
        start: 0,
        end: cumulative,
      });
    } else {
      const start = cumulative;
      cumulative += d.value;
      bars.push({
        label: d.label,
        value: d.value,
        type,
        start,
        end: cumulative,
      });
    }
  }

  return bars;
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

// -- Component ----------------------------------------------------------------

export function WaterfallChart(props: WaterfallChartProps) {
  const theme = useVizTheme();
  const {
    data = [],
    width = 600,
    height = 400,
    increaseColor = '#10b981',
    decreaseColor = '#ef4444',
    totalColor = '#3b82f6',
    connectorColor = '#94a3b8',
    showValues = true,
    showGrid = true,
    showConnectors = true,
    title,
    padding = 60,
    scaleType = 'linear' as ScaleType,
    logBase = 10,
    colorblindPatterns = false,
  } = props;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const bars = useMemo(() => computeBars(data), [data]);

  // Find the value range (min and max cumulative positions)
  const { minVal, maxVal } = useMemo(() => {
    let lo = 0;
    let hi = 0;
    for (let i = 0; i < bars.length; i++) {
      const b = bars[i]!;
      if (b.start < lo) lo = b.start;
      if (b.end < lo) lo = b.end;
      if (b.start > hi) hi = b.start;
      if (b.end > hi) hi = b.end;
    }
    // Ensure we always have some range
    if (lo === hi) {
      hi = lo + 1;
    }
    return { minVal: lo, maxVal: hi };
  }, [bars]);

  const valueRange = maxVal - minVal;

  /** Map a cumulative value to a Y coordinate (top of chart = maxVal). */
  const valueToY = useCallback(
    (v: number) => {
      if (scaleType === 'log') {
        const logMin = logScaleValue(Math.max(minVal, 1), 'log', logBase);
        const logMax = logScaleValue(maxVal, 'log', logBase);
        const logRange = logMax - logMin;
        const logV = logScaleValue(Math.max(v, 1), 'log', logBase);
        if (logRange === 0) return padding + chartHeight;
        return padding + chartHeight - ((logV - logMin) / logRange) * chartHeight;
      }
      return padding + chartHeight - ((v - minVal) / valueRange) * chartHeight;
    },
    [padding, chartHeight, minVal, maxVal, valueRange, scaleType, logBase],
  );

  const barSpacing = useMemo(() => {
    if (bars.length === 0) return 0;
    return chartWidth / bars.length;
  }, [bars.length, chartWidth]);

  const barGap = 6;
  const barWidth = Math.max(1, barSpacing - barGap);

  // ---- Grid lines -----------------------------------------------------------

  const buildGridLines = useCallback(() => {
    if (!showGrid) return [];

    const lines: ReturnType<typeof createElement>[] = [];
    let gridValues: number[];

    if (scaleType === 'log') {
      gridValues = generateLogTicks(Math.max(minVal, 1), maxVal, logBase);
    } else {
      const step = niceStep(valueRange);
      gridValues = [];
      const startVal = Math.ceil(minVal / step) * step;
      for (let v = startVal; v <= maxVal; v += step) {
        gridValues.push(v);
      }
    }

    for (let idx = 0; idx < gridValues.length; idx++) {
      const v = gridValues[idx]!;
      const y = valueToY(v);
      lines.push(
        createElement('line', {
          key: `grid-${idx}`,
          x1: String(padding),
          y1: String(y),
          x2: String(padding + chartWidth),
          y2: String(y),
          stroke: '#e5e7eb',
          'stroke-width': String(theme.lineWidth.grid),
          'stroke-dasharray': '4 2',
        }),
      );
      lines.push(
        createElement(
          'text',
          {
            key: `grid-label-${idx}`,
            x: String(padding - 8),
            y: String(y + 4),
            'text-anchor': 'end',
            'font-size': '11',
            'font-family': theme.fontFamily,
            fill: '#6b7280',
          },
          String(v),
        ),
      );
    }

    return lines;
  }, [showGrid, valueRange, minVal, maxVal, valueToY, padding, chartWidth, scaleType, logBase]);

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
        'stroke-width': String(theme.lineWidth.axis),
      }),
    );

    // X-axis (at y = 0 if 0 is in range, otherwise at bottom)
    const zeroY = minVal <= 0 && maxVal >= 0 ? valueToY(0) : padding + chartHeight;
    elements.push(
      createElement('line', {
        key: 'axis-x',
        x1: String(padding),
        y1: String(zeroY),
        x2: String(padding + chartWidth),
        y2: String(zeroY),
        stroke: '#374151',
        'stroke-width': String(theme.lineWidth.axis),
      }),
    );

    return elements;
  }, [padding, chartWidth, chartHeight, minVal, maxVal, valueToY]);

  // ---- Bars & connectors ----------------------------------------------------

  const buildBars = useCallback(() => {
    if (bars.length === 0) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < bars.length; i++) {
      const b = bars[i]!;
      const x = padding + i * barSpacing + barGap / 2;
      const topVal = Math.max(b.start, b.end);
      const bottomVal = Math.min(b.start, b.end);
      const yTop = valueToY(topVal);
      const yBottom = valueToY(bottomVal);
      const barHeight = Math.max(0, yBottom - yTop);

      let fill: string;
      if (b.type === 'total') {
        fill = totalColor;
      } else if (b.type === 'decrease') {
        fill = decreaseColor;
      } else {
        fill = increaseColor;
      }

      // Bar rect
      elements.push(
        createElement('rect', {
          key: `bar-${i}`,
          x: String(x),
          y: String(yTop),
          width: String(barWidth),
          height: String(barHeight),
          fill,
          rx: '2',
          ry: '2',
        }),
      );

      // Colorblind pattern overlay (opt-in)
      if (colorblindPatterns) {
        elements.push(
          createElement('rect', {
            key: `bar-pattern-${i}`,
            x: String(x),
            y: String(yTop),
            width: String(barWidth),
            height: String(barHeight),
            fill: getPatternFill(i),
            'pointer-events': 'none',
          }),
        );
      }

      // Value label
      if (showValues) {
        const labelY = b.type === 'decrease' || b.value < 0
          ? yBottom + 14
          : yTop - 4;
        const displayValue = b.type === 'total'
          ? String(b.value)
          : (b.value >= 0 ? '+' : '') + String(b.value);
        elements.push(
          createElement(
            'text',
            {
              key: `val-${i}`,
              x: String(x + barWidth / 2),
              y: String(labelY),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': theme.fontFamily,
              fill: '#374151',
            },
            displayValue,
          ),
        );
      }

      // Category label
      elements.push(
        createElement(
          'text',
          {
            key: `cat-${i}`,
            x: String(x + barWidth / 2),
            y: String(padding + chartHeight + 16),
            'text-anchor': 'middle',
            'font-size': '10',
            'font-family': theme.fontFamily,
            fill: '#374151',
          },
          b.label,
        ),
      );

      // Connector line to next bar
      if (showConnectors && i < bars.length - 1) {
        const nextBar = bars[i + 1]!;
        const connectorY = valueToY(b.end);
        const nextX = padding + (i + 1) * barSpacing + barGap / 2;

        // Only draw connector if next bar is not a 'total'
        if (nextBar.type !== 'total') {
          elements.push(
            createElement('line', {
              key: `conn-${i}`,
              x1: String(x + barWidth),
              y1: String(connectorY),
              x2: String(nextX),
              y2: String(connectorY),
              stroke: connectorColor,
              'stroke-width': String(theme.lineWidth.grid),
              'stroke-dasharray': '3 2',
            }),
          );
        }
      }
    }

    return elements;
  }, [bars, barSpacing, barWidth, valueToY, increaseColor, decreaseColor, totalColor, connectorColor, showValues, showConnectors, padding, chartHeight]);

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
          'font-family': theme.fontFamily,
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width, padding]);

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
          'font-family': theme.fontFamily,
          fill: '#9ca3af',
        },
        'No data',
      ),
    ];
  }, [data.length, width, height]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridLines = buildGridLines();
  const axes = buildAxes();
  const barEls = buildBars();
  const titleEl = buildTitle();
  const emptyState = buildEmptyState();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Waterfall chart',
      style: { fontFamily: theme.fontFamily },
    },
    ...(colorblindPatterns ? [createPatternDefs() as ReturnType<typeof createElement>] : []),
    ...titleEl,
    ...gridLines,
    ...axes,
    ...barEls,
    ...emptyState,
  );
}
