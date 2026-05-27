// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * FunnelChart -- A SpecifyJS component that renders funnel/pipeline
 * visualizations as SVG.
 *
 * Each section is a trapezoid whose width is proportional to its value,
 * tapering from the largest value toward the smallest. Supports both
 * vertical (top-to-bottom) and horizontal (left-to-right) orientation.
 *
 * Supports:
 *  - Vertical and horizontal orientation
 *  - Labels, values, and percentage display
 *  - Per-datum or palette-based colors
 *  - Configurable gap between sections
 *  - Edge cases: empty data, single item, zero values
 *
 * Zero runtime dependencies -- pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import { useMemo, useCallback } from 'specifyjs/hooks';

// -- Data types ---------------------------------------------------------------

export interface FunnelDatum {
  label: string;
  value: number;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface FunnelChartProps {
  /** Data sections to render (in funnel order, largest first typically) */
  data: FunnelDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Funnel orientation (default: 'vertical') */
  orientation?: 'vertical' | 'horizontal';
  /** Show labels on sections (default: true) */
  showLabels?: boolean;
  /** Show values on sections (default: true) */
  showValues?: boolean;
  /** Show percentage of first item (default: true) */
  showPercentage?: boolean;
  /** Gap between sections in px (default: 2) */
  gapSize?: number;
  /** Color palette (cycles through when per-datum color is absent) */
  colors?: string[];
  /** Chart title */
  title?: string;
}

// -- Defaults -----------------------------------------------------------------

const DEFAULT_COLORS = [
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#c084fc',
  '#d8b4fe',
  '#e9d5ff',
  '#f3e8ff',
];

// -- Component ----------------------------------------------------------------

export function FunnelChart(props: FunnelChartProps) {
  const {
    data = [],
    width = 600,
    height = 400,
    orientation = 'vertical',
    showLabels = true,
    showValues = true,
    showPercentage = true,
    gapSize = 2,
    colors = DEFAULT_COLORS,
    title,
  } = props;

  const isVertical = orientation === 'vertical';
  const titleOffset = title ? 30 : 0;
  const labelAreaSize = 120; // space for labels on the side or below

  const maxValue = useMemo(() => {
    let m = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i]!.value > m) m = data[i]!.value;
    }
    return m > 0 ? m : 1;
  }, [data]);

  /** Get the width ratio for a datum (0..1) based on its value relative to max. */
  const widthRatio = useCallback(
    (value: number) => {
      if (maxValue === 0) return 0;
      return Math.max(0.05, value / maxValue); // minimum 5% so zero values are visible
    },
    [maxValue],
  );

  /** Get color for index. */
  const getColor = useCallback(
    (index: number, explicit?: string) => {
      if (explicit) return explicit;
      return colors[index % colors.length] ?? DEFAULT_COLORS[0]!;
    },
    [colors],
  );

  // ---- Build vertical funnel ------------------------------------------------

  const buildVerticalFunnel = useCallback(() => {
    if (data.length === 0) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const chartPadding = 40;
    const funnelWidth = width - chartPadding * 2 - labelAreaSize;
    const funnelHeight = height - titleOffset - chartPadding * 2;
    const totalGaps = gapSize * (data.length - 1);
    const sectionHeight = Math.max(1, (funnelHeight - totalGaps) / data.length);
    const centerX = chartPadding + funnelWidth / 2;

    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const nextD = i < data.length - 1 ? data[i + 1] : null;
      const fill = getColor(i, d.color);

      const topRatio = widthRatio(d.value);
      const bottomRatio = nextD !== null ? widthRatio(nextD!.value) : topRatio * 0.6;

      const topHalfWidth = (funnelWidth / 2) * topRatio;
      const bottomHalfWidth = (funnelWidth / 2) * bottomRatio;

      const y = titleOffset + chartPadding + i * (sectionHeight + gapSize);

      // Trapezoid points: top-left, top-right, bottom-right, bottom-left
      const x1 = centerX - topHalfWidth;
      const x2 = centerX + topHalfWidth;
      const x3 = centerX + bottomHalfWidth;
      const x4 = centerX - bottomHalfWidth;

      const points = `${x1},${y} ${x2},${y} ${x3},${y + sectionHeight} ${x4},${y + sectionHeight}`;

      elements.push(
        createElement('polygon', {
          key: `section-${i}`,
          points,
          fill,
          stroke: '#fff',
          'stroke-width': '1',
        }),
      );

      // Labels and values to the right of the funnel
      const labelX = chartPadding + funnelWidth + 12;
      const labelY = y + sectionHeight / 2;

      if (showLabels) {
        elements.push(
          createElement(
            'text',
            {
              key: `label-${i}`,
              x: String(labelX),
              y: String(labelY - (showValues || showPercentage ? 6 : 0)),
              'text-anchor': 'start',
              'font-size': '12',
              'font-weight': 'bold',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            d.label,
          ),
        );
      }

      if (showValues || showPercentage) {
        let valueText = '';
        if (showValues) {
          valueText = String(d.value);
        }
        if (showPercentage && data.length > 0) {
          const firstValue = data[0]!.value;
          const pct = firstValue > 0 ? Math.round((d.value / firstValue) * 100) : 0;
          valueText += showValues ? ` (${pct}%)` : `${pct}%`;
        }

        elements.push(
          createElement(
            'text',
            {
              key: `value-${i}`,
              x: String(labelX),
              y: String(labelY + (showLabels ? 10 : 4)),
              'text-anchor': 'start',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#6b7280',
            },
            valueText,
          ),
        );
      }
    }

    return elements;
  }, [data, width, height, titleOffset, gapSize, showLabels, showValues, showPercentage, getColor, widthRatio, labelAreaSize]);

  // ---- Build horizontal funnel ----------------------------------------------

  const buildHorizontalFunnel = useCallback(() => {
    if (data.length === 0) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const chartPadding = 40;
    const funnelWidth = width - chartPadding * 2;
    const labelSpace = 40;
    const funnelHeight = height - titleOffset - chartPadding * 2 - labelSpace;
    const totalGaps = gapSize * (data.length - 1);
    const sectionWidth = Math.max(1, (funnelWidth - totalGaps) / data.length);
    const centerY = titleOffset + chartPadding + funnelHeight / 2;

    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const nextD = i < data.length - 1 ? data[i + 1] : null;
      const fill = getColor(i, d.color);

      const leftRatio = widthRatio(d.value);
      const rightRatio = nextD !== null ? widthRatio(nextD!.value) : leftRatio * 0.6;

      const leftHalfHeight = (funnelHeight / 2) * leftRatio;
      const rightHalfHeight = (funnelHeight / 2) * rightRatio;

      const x = chartPadding + i * (sectionWidth + gapSize);

      // Trapezoid points: top-left, top-right, bottom-right, bottom-left
      const y1 = centerY - leftHalfHeight;
      const y2 = centerY - rightHalfHeight;
      const y3 = centerY + rightHalfHeight;
      const y4 = centerY + leftHalfHeight;

      const points = `${x},${y1} ${x + sectionWidth},${y2} ${x + sectionWidth},${y3} ${x},${y4}`;

      elements.push(
        createElement('polygon', {
          key: `section-${i}`,
          points,
          fill,
          stroke: '#fff',
          'stroke-width': '1',
        }),
      );

      // Labels below each section
      const labelX = x + sectionWidth / 2;
      const labelY = titleOffset + chartPadding + funnelHeight + 14;

      if (showLabels) {
        elements.push(
          createElement(
            'text',
            {
              key: `label-${i}`,
              x: String(labelX),
              y: String(labelY),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-weight': 'bold',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            d.label,
          ),
        );
      }

      if (showValues || showPercentage) {
        let valueText = '';
        if (showValues) {
          valueText = String(d.value);
        }
        if (showPercentage && data.length > 0) {
          const firstValue = data[0]!.value;
          const pct = firstValue > 0 ? Math.round((d.value / firstValue) * 100) : 0;
          valueText += showValues ? ` (${pct}%)` : `${pct}%`;
        }

        elements.push(
          createElement(
            'text',
            {
              key: `value-${i}`,
              x: String(labelX),
              y: String(labelY + 14),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#6b7280',
            },
            valueText,
          ),
        );
      }
    }

    return elements;
  }, [data, width, height, titleOffset, gapSize, showLabels, showValues, showPercentage, getColor, widthRatio]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(20),
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width]);

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

  const titleEl = buildTitle();
  const funnelEls = isVertical ? buildVerticalFunnel() : buildHorizontalFunnel();
  const emptyState = buildEmptyState();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Funnel chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...funnelEls,
    ...emptyState,
  );
}
