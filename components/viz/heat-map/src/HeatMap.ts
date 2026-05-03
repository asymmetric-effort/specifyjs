// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * HeatMap — A SpecifyJS component that renders 2D heat maps as SVG.
 *
 * Supports:
 *  - 2D grid of colored cells with intensity proportional to value
 *  - Row and column labels
 *  - Optional value text in each cell
 *  - Configurable color gradient
 *  - Cell borders
 *  - Auto-detection of min/max values
 *  - Proper ARIA attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo, useCallback } from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface HeatMapProps {
  /** 2D grid of values — data[row][col] */
  data: number[][];
  /** Labels for rows (Y axis) */
  rowLabels?: string[];
  /** Labels for columns (X axis) */
  columnLabels?: string[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Color gradient from low to high (default: blue to red) */
  colorScale?: string[];
  /** Minimum value for color mapping (auto-detected if omitted) */
  minValue?: number;
  /** Maximum value for color mapping (auto-detected if omitted) */
  maxValue?: number;
  /** Show numeric value in each cell (default: false) */
  showValues?: boolean;
  /** Cell border color (default: '#fff') */
  cellBorderColor?: string;
  /** Cell border width (default: 1) */
  cellBorderWidth?: number;
  /** Chart title */
  title?: string;
  /** Padding around the chart in px (default: 60) */
  padding?: number;
}

// -- Color helpers ------------------------------------------------------------

/** Parse a hex color string to RGB components. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned[0]! + cleaned[0]! + cleaned[1]! + cleaned[1]! + cleaned[2]! + cleaned[2]!
    : cleaned;
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

/** Convert RGB to hex string. */
function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Interpolate through a color scale based on a normalized value [0, 1].
 */
function interpolateColor(t: number, scale: string[]): string {
  if (scale.length === 0) return '#000000';
  if (scale.length === 1) return scale[0]!;

  const clamped = Math.max(0, Math.min(1, t));
  const segmentCount = scale.length - 1;
  const segment = Math.min(Math.floor(clamped * segmentCount), segmentCount - 1);
  const segmentT = (clamped * segmentCount) - segment;

  const c1 = hexToRgb(scale[segment]!);
  const c2 = hexToRgb(scale[segment + 1]!);

  return rgbToHex(
    c1.r + (c2.r - c1.r) * segmentT,
    c1.g + (c2.g - c1.g) * segmentT,
    c1.b + (c2.b - c1.b) * segmentT,
  );
}

/** Compute perceived brightness to decide text color for contrast. */
function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DEFAULT_COLOR_SCALE = ['#3b82f6', '#fbbf24', '#ef4444'];

// -- Component ----------------------------------------------------------------

export function HeatMap(props: HeatMapProps) {
  const {
    data = [],
    rowLabels,
    columnLabels,
    width = 600,
    height = 400,
    colorScale = DEFAULT_COLOR_SCALE,
    minValue: propMin,
    maxValue: propMax,
    showValues = false,
    cellBorderColor = '#fff',
    cellBorderWidth = 1,
    title,
    padding = 60,
  } = props;

  const rowCount = data.length;
  const colCount = useMemo(() => {
    let max = 0;
    for (const row of data) {
      if (row.length > max) max = row.length;
    }
    return max;
  }, [data]);

  // Auto-detect value range
  const { minVal, maxVal } = useMemo(() => {
    let mn = propMin ?? Infinity;
    let mx = propMax ?? -Infinity;
    for (const row of data) {
      for (const v of row) {
        if (propMin === undefined && v < mn) mn = v;
        if (propMax === undefined && v > mx) mx = v;
      }
    }
    if (mn === Infinity) mn = 0;
    if (mx === -Infinity) mx = 1;
    if (mn === mx) mx = mn + 1;
    return { minVal: mn, maxVal: mx };
  }, [data, propMin, propMax]);

  const titleOffset = title ? 30 : 0;
  const labelPaddingLeft = rowLabels ? padding : 20;
  const labelPaddingBottom = columnLabels ? padding : 20;

  const chartWidth = width - labelPaddingLeft - 20;
  const chartHeight = height - titleOffset - labelPaddingBottom - 20;
  const cellWidth = colCount > 0 ? chartWidth / colCount : 0;
  const cellHeight = rowCount > 0 ? chartHeight / rowCount : 0;

  // ---- Cells ----------------------------------------------------------------

  const buildCells = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let r = 0; r < rowCount; r++) {
      const row = data[r]!;
      for (let c = 0; c < colCount; c++) {
        const value = c < row.length ? row[c]! : 0;
        const t = (value - minVal) / (maxVal - minVal);
        const fillColor = interpolateColor(t, colorScale);

        const x = labelPaddingLeft + c * cellWidth;
        const y = titleOffset + 20 + r * cellHeight;

        elements.push(
          createElement('rect', {
            key: `cell-${r}-${c}`,
            x: String(x),
            y: String(y),
            width: String(cellWidth),
            height: String(cellHeight),
            fill: fillColor,
            stroke: cellBorderColor,
            'stroke-width': String(cellBorderWidth),
          }),
        );

        if (showValues) {
          const textColor = luminance(fillColor) > 0.5 ? '#111827' : '#ffffff';
          elements.push(
            createElement(
              'text',
              {
                key: `val-${r}-${c}`,
                x: String(x + cellWidth / 2),
                y: String(y + cellHeight / 2),
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'font-size': String(Math.min(11, cellWidth * 0.3, cellHeight * 0.4)),
                'font-family': 'sans-serif',
                fill: textColor,
              },
              String(Math.round(value * 100) / 100),
            ),
          );
        }
      }
    }

    return elements;
  }, [data, rowCount, colCount, minVal, maxVal, colorScale, cellWidth, cellHeight,
      labelPaddingLeft, titleOffset, showValues, cellBorderColor, cellBorderWidth]);

  // ---- Labels ---------------------------------------------------------------

  const buildLabels = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    // Row labels
    if (rowLabels) {
      for (let r = 0; r < rowCount; r++) {
        const label = r < rowLabels.length ? rowLabels[r]! : '';
        const y = titleOffset + 20 + r * cellHeight + cellHeight / 2;
        elements.push(
          createElement(
            'text',
            {
              key: `row-label-${r}`,
              x: String(labelPaddingLeft - 8),
              y: String(y),
              'text-anchor': 'end',
              'dominant-baseline': 'central',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: 'currentColor',
            },
            label,
          ),
        );
      }
    }

    // Column labels
    if (columnLabels) {
      for (let c = 0; c < colCount; c++) {
        const label = c < columnLabels.length ? columnLabels[c]! : '';
        const x = labelPaddingLeft + c * cellWidth + cellWidth / 2;
        const y = titleOffset + 20 + rowCount * cellHeight + 16;
        elements.push(
          createElement(
            'text',
            {
              key: `col-label-${c}`,
              x: String(x),
              y: String(y),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: 'currentColor',
            },
            label,
          ),
        );
      }
    }

    return elements;
  }, [rowLabels, columnLabels, rowCount, colCount, cellWidth, cellHeight,
      labelPaddingLeft, titleOffset]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: '22',
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

  if (rowCount === 0 || colCount === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Heat map — no data',
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
        'No data to display.',
      ),
    );
  }

  // ---- Assemble SVG ---------------------------------------------------------

  const titleEls = buildTitle();
  const cellEls = buildCells();
  const labelEls = buildLabels();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Heat map',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEls,
    ...cellEls,
    ...labelEls,
  );
}
