// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Matrix — A SpecifyJS component that renders correlation/confusion matrices
 * as SVG.
 *
 * Supports:
 *  - Colored grid cells with intensity proportional to value
 *  - Row and column labels (or shared labels for square matrices)
 *  - Optional value text in each cell
 *  - Symmetric mode for correlation matrices (mirrors across diagonal)
 *  - Diagonal highlighting
 *  - Configurable color gradient
 *  - Proper ARIA attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo, useCallback } from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface MatrixProps {
  /** 2D grid of values — data[row][col] */
  data: number[][];
  /** Shared row/column labels for square matrices */
  labels?: string[];
  /** Explicit row labels (overrides `labels`) */
  rowLabels?: string[];
  /** Explicit column labels (overrides `labels`) */
  columnLabels?: string[];
  /** SVG width in pixels (default: 500) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Color gradient from low to high (default: white to blue) */
  colorScale?: string[];
  /** Show numeric value in each cell (default: true) */
  showValues?: boolean;
  /** Highlight diagonal cells (default: true) */
  showDiagonal?: boolean;
  /** Cell border color (default: '#e5e7eb') */
  cellBorderColor?: string;
  /** Chart title */
  title?: string;
  /** Padding around the chart in px (default: 70) */
  padding?: number;
  /** If true, mirror values across diagonal for correlation matrices (default: false) */
  symmetric?: boolean;
}

// -- Color helpers ------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned[0]! + cleaned[0]! + cleaned[1]! + cleaned[1]! + cleaned[2]! + cleaned[2]!
    : cleaned;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(t: number, scale: string[]): string {
  if (scale.length === 0) return '#000000';
  if (scale.length === 1) return scale[0]!;
  const clamped = Math.max(0, Math.min(1, t));
  const segCount = scale.length - 1;
  const seg = Math.min(Math.floor(clamped * segCount), segCount - 1);
  const segT = clamped * segCount - seg;
  const c1 = hexToRgb(scale[seg]!);
  const c2 = hexToRgb(scale[seg + 1]!);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * segT,
    c1.g + (c2.g - c1.g) * segT,
    c1.b + (c2.b - c1.b) * segT,
  );
}

function luminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
}

const DEFAULT_COLOR_SCALE = ['#f0f9ff', '#3b82f6', '#1e3a8a'];

// -- Component ----------------------------------------------------------------

export function Matrix(props: MatrixProps) {
  const {
    data = [],
    labels,
    rowLabels: propRowLabels,
    columnLabels: propColumnLabels,
    width = 500,
    height = 500,
    colorScale = DEFAULT_COLOR_SCALE,
    showValues = true,
    showDiagonal = true,
    cellBorderColor = '#e5e7eb',
    title,
    padding = 70,
    symmetric = false,
  } = props;

  // Resolve labels
  const effectiveRowLabels = propRowLabels ?? labels;
  const effectiveColLabels = propColumnLabels ?? labels;

  const rowCount = data.length;
  const colCount = useMemo(() => {
    let max = 0;
    for (const row of data) {
      if (row.length > max) max = row.length;
    }
    return max;
  }, [data]);

  // Build effective data (apply symmetric mirroring if needed)
  const effectiveData = useMemo(() => {
    if (!symmetric || rowCount === 0) return data;
    const result: number[][] = [];
    const size = Math.max(rowCount, colCount);
    for (let r = 0; r < size; r++) {
      const row: number[] = [];
      for (let c = 0; c < size; c++) {
        const sourceRow = data[r];
        const val = sourceRow && c < sourceRow.length ? sourceRow[c]! : 0;
        const mirrorRow = data[c];
        const mirrorVal = mirrorRow && r < mirrorRow.length ? mirrorRow[r]! : 0;
        // Use whichever is non-zero, preferring the explicit value
        if (val !== 0) {
          row.push(val);
        } else {
          row.push(mirrorVal);
        }
      }
      result.push(row);
    }
    return result;
  }, [data, symmetric, rowCount, colCount]);

  const effectiveRowCount = effectiveData.length;
  const effectiveColCount = useMemo(() => {
    let max = 0;
    for (const row of effectiveData) {
      if (row.length > max) max = row.length;
    }
    return max;
  }, [effectiveData]);

  // Auto-detect value range
  const { minVal, maxVal } = useMemo(() => {
    let mn = Infinity;
    let mx = -Infinity;
    for (const row of effectiveData) {
      for (const v of row) {
        if (v < mn) mn = v;
        if (v > mx) mx = v;
      }
    }
    if (mn === Infinity) mn = 0;
    if (mx === -Infinity) mx = 1;
    if (mn === mx) mx = mn + 1;
    return { minVal: mn, maxVal: mx };
  }, [effectiveData]);

  const titleOffset = title ? 30 : 0;
  const labelPadLeft = effectiveRowLabels ? padding : 20;
  const labelPadBottom = effectiveColLabels ? padding : 20;

  const chartWidth = width - labelPadLeft - 20;
  const chartHeight = height - titleOffset - labelPadBottom - 20;
  const cellWidth = effectiveColCount > 0 ? chartWidth / effectiveColCount : 0;
  const cellHeight = effectiveRowCount > 0 ? chartHeight / effectiveRowCount : 0;

  // ---- Cells ----------------------------------------------------------------

  const buildCells = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let r = 0; r < effectiveRowCount; r++) {
      const row = effectiveData[r]!;
      for (let c = 0; c < effectiveColCount; c++) {
        const value = c < row.length ? row[c]! : 0;
        const t = (value - minVal) / (maxVal - minVal);
        const fillColor = interpolateColor(t, colorScale);

        const x = labelPadLeft + c * cellWidth;
        const y = titleOffset + 20 + r * cellHeight;

        // Diagonal highlight
        const isDiagonal = r === c;
        const strokeColor = isDiagonal && showDiagonal ? '#374151' : cellBorderColor;
        const strokeWidth = isDiagonal && showDiagonal ? '2' : '1';

        elements.push(
          createElement('rect', {
            key: `cell-${r}-${c}`,
            x: String(x),
            y: String(y),
            width: String(cellWidth),
            height: String(cellHeight),
            fill: fillColor,
            stroke: strokeColor,
            'stroke-width': strokeWidth,
          }),
        );

        if (showValues) {
          const textColor = luminance(fillColor) > 0.5 ? '#111827' : '#ffffff';
          const fontSize = Math.min(12, cellWidth * 0.3, cellHeight * 0.35);
          elements.push(
            createElement(
              'text',
              {
                key: `val-${r}-${c}`,
                x: String(x + cellWidth / 2),
                y: String(y + cellHeight / 2),
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                'font-size': String(Math.max(8, fontSize)),
                'font-weight': isDiagonal && showDiagonal ? 'bold' : 'normal',
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
  }, [effectiveData, effectiveRowCount, effectiveColCount, minVal, maxVal,
      colorScale, cellWidth, cellHeight, labelPadLeft, titleOffset,
      showValues, showDiagonal, cellBorderColor]);

  // ---- Labels ---------------------------------------------------------------

  const buildLabels = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    // Row labels
    if (effectiveRowLabels) {
      for (let r = 0; r < effectiveRowCount; r++) {
        const label = r < effectiveRowLabels.length ? effectiveRowLabels[r]! : '';
        const y = titleOffset + 20 + r * cellHeight + cellHeight / 2;
        elements.push(
          createElement(
            'text',
            {
              key: `row-label-${r}`,
              x: String(labelPadLeft - 8),
              y: String(y),
              'text-anchor': 'end',
              'dominant-baseline': 'central',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            label,
          ),
        );
      }
    }

    // Column labels (rotated for better fit)
    if (effectiveColLabels) {
      for (let c = 0; c < effectiveColCount; c++) {
        const label = c < effectiveColLabels.length ? effectiveColLabels[c]! : '';
        const x = labelPadLeft + c * cellWidth + cellWidth / 2;
        const y = titleOffset + 20 + effectiveRowCount * cellHeight + 12;
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
              fill: '#374151',
            },
            label,
          ),
        );
      }
    }

    return elements;
  }, [effectiveRowLabels, effectiveColLabels, effectiveRowCount, effectiveColCount,
      cellWidth, cellHeight, labelPadLeft, titleOffset]);

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
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width]);

  // ---- Empty state ----------------------------------------------------------

  if (effectiveRowCount === 0 || effectiveColCount === 0) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Matrix — no data',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#6b7280',
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
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Matrix visualization',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEls,
    ...cellEls,
    ...labelEls,
  );
}
