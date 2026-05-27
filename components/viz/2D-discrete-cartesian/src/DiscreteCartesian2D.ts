// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DiscreteCartesian2D — A SpecifyJS component that renders an NxM grid of
 * discrete cells as SVG, where each cell's value determines its color.
 *
 * Supports:
 *  - Arbitrary NxM grids with per-cell coloring via a color map
 *  - Configurable cell gap, border radius, and padding
 *  - Optional grid lines and row/column indices
 *  - Click and hover callbacks per cell
 *  - Responsive SVG sizing via viewBox
 *  - ARIA-compliant with role="img" and role="button" on interactive cells
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import {
  useMemo,
  useCallback,
} from 'specifyjs/hooks';

// -- Props --------------------------------------------------------------------

export interface DiscreteCartesian2DProps {
  /** Grid data: rows x cols. Each value maps to a color via colorMap. */
  data: number[][];
  /** Map cell values to colors (e.g., {0: '#1e293b', 1: '#3b82f6'}) */
  colorMap?: Record<number, string>;
  /** SVG viewBox width (default: 600) */
  width?: number;
  /** SVG viewBox height (default: 600) */
  height?: number;
  /** Gap between cells in pixels (default: 1) */
  cellGap?: number;
  /** Cell border radius (default: 0) */
  cellRadius?: number;
  /** Show grid lines (default: false) */
  showGrid?: boolean;
  /** Grid line color (default: '#334155') */
  gridColor?: string;
  /** Show row/column indices (default: false) */
  showIndices?: boolean;
  /** Background color (default: '#0f172a') */
  backgroundColor?: string;
  /** Padding around grid (default: 10) */
  padding?: number;
  /** Called when a cell is clicked: (row, col, value) */
  onCellClick?: (row: number, col: number, value: number) => void;
  /** Called when mouse enters a cell */
  onCellHover?: (row: number, col: number, value: number) => void;
  /** Title */
  title?: string;
}

// -- Default color map --------------------------------------------------------

const DEFAULT_COLOR_MAP: Record<number, string> = {
  0: '#1e293b',
  1: '#3b82f6',
};

const FALLBACK_COLOR = '#666';

// -- Component ----------------------------------------------------------------

export function DiscreteCartesian2D(props: DiscreteCartesian2DProps) {
  const {
    data = [],
    colorMap,
    width = 600,
    height = 600,
    cellGap = 1,
    cellRadius = 0,
    showGrid = false,
    gridColor = '#334155',
    showIndices = false,
    backgroundColor = '#0f172a',
    padding = 10,
    onCellClick,
    onCellHover,
    title,
  } = props;

  const effectiveColorMap = colorMap ?? DEFAULT_COLOR_MAP;

  // Compute grid dimensions
  const rows = data.length;
  const cols = useMemo(() => {
    let maxCols = 0;
    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (row !== undefined && row.length > maxCols) {
        maxCols = row.length;
      }
    }
    return maxCols;
  }, [data]);

  // Compute cell dimensions
  const indicesOffset = showIndices ? 20 : 0;
  const titleOffset = title ? 24 : 0;

  const cellDims = useMemo(() => {
    const availableWidth = width - padding * 2 - indicesOffset;
    const availableHeight = height - padding * 2 - indicesOffset - titleOffset;

    if (rows === 0 || cols === 0) {
      return { cellWidth: 0, cellHeight: 0 };
    }

    const cellWidth = Math.max(0, (availableWidth - cellGap * (cols - 1)) / cols);
    const cellHeight = Math.max(0, (availableHeight - cellGap * (rows - 1)) / rows);

    return { cellWidth, cellHeight };
  }, [width, height, padding, rows, cols, cellGap, indicesOffset, titleOffset]);

  // Resolve cell color
  const getCellColor = useCallback(
    (value: number): string => {
      const color = effectiveColorMap[value];
      if (color !== undefined) return color;
      return FALLBACK_COLOR;
    },
    [effectiveColorMap],
  );

  // ---- Background -----------------------------------------------------------

  const buildBackground = useCallback(() => {
    return createElement('rect', {
      key: 'bg',
      x: '0',
      y: '0',
      width: String(width),
      height: String(height),
      fill: backgroundColor,
    });
  }, [width, height, backgroundColor]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(padding + 14),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#e2e8f0',
        },
        title,
      ),
    ];
  }, [title, width, padding]);

  // ---- Grid lines -----------------------------------------------------------

  const buildGridLines = useCallback(() => {
    if (!showGrid || rows === 0 || cols === 0) return [];

    const { cellWidth, cellHeight } = cellDims;
    const originX = padding + indicesOffset;
    const originY = padding + indicesOffset + titleOffset;
    const totalWidth = cols * cellWidth + (cols - 1) * cellGap;
    const totalHeight = rows * cellHeight + (rows - 1) * cellGap;
    const lines: ReturnType<typeof createElement>[] = [];

    // Vertical grid lines
    for (let c = 0; c <= cols; c++) {
      const x = originX + c * (cellWidth + cellGap) - cellGap / 2;
      lines.push(
        createElement('line', {
          key: `vgrid-${c}`,
          x1: String(x),
          y1: String(originY - cellGap / 2),
          x2: String(x),
          y2: String(originY + totalHeight + cellGap / 2),
          stroke: gridColor,
          'stroke-width': '0.5',
        }),
      );
    }

    // Horizontal grid lines
    for (let r = 0; r <= rows; r++) {
      const y = originY + r * (cellHeight + cellGap) - cellGap / 2;
      lines.push(
        createElement('line', {
          key: `hgrid-${r}`,
          x1: String(originX - cellGap / 2),
          y1: String(y),
          x2: String(originX + totalWidth + cellGap / 2),
          y2: String(y),
          stroke: gridColor,
          'stroke-width': '0.5',
        }),
      );
    }

    return lines;
  }, [showGrid, rows, cols, cellDims, padding, indicesOffset, titleOffset, cellGap, gridColor]);

  // ---- Indices --------------------------------------------------------------

  const buildIndices = useCallback(() => {
    if (!showIndices || rows === 0 || cols === 0) return [];

    const { cellWidth, cellHeight } = cellDims;
    const originX = padding + indicesOffset;
    const originY = padding + indicesOffset + titleOffset;
    const labels: ReturnType<typeof createElement>[] = [];

    // Column indices
    for (let c = 0; c < cols; c++) {
      const x = originX + c * (cellWidth + cellGap) + cellWidth / 2;
      const y = originY - 6;
      labels.push(
        createElement(
          'text',
          {
            key: `col-idx-${c}`,
            x: String(x),
            y: String(y),
            'text-anchor': 'middle',
            'font-size': '10',
            'font-family': 'monospace',
            fill: '#94a3b8',
          },
          String(c),
        ),
      );
    }

    // Row indices
    for (let r = 0; r < rows; r++) {
      const x = originX - 6;
      const y = originY + r * (cellHeight + cellGap) + cellHeight / 2 + 3;
      labels.push(
        createElement(
          'text',
          {
            key: `row-idx-${r}`,
            x: String(x),
            y: String(y),
            'text-anchor': 'end',
            'font-size': '10',
            'font-family': 'monospace',
            fill: '#94a3b8',
          },
          String(r),
        ),
      );
    }

    return labels;
  }, [showIndices, rows, cols, cellDims, padding, indicesOffset, titleOffset, cellGap]);

  // ---- Cells ----------------------------------------------------------------

  const buildCells = useCallback(() => {
    if (rows === 0 || cols === 0) return [];

    const { cellWidth, cellHeight } = cellDims;
    const originX = padding + indicesOffset;
    const originY = padding + indicesOffset + titleOffset;
    const cells: ReturnType<typeof createElement>[] = [];

    for (let r = 0; r < rows; r++) {
      const row = data[r];
      if (row === undefined) continue;

      for (let c = 0; c < cols; c++) {
        const value = c < row.length ? row[c]! : 0;
        const x = originX + c * (cellWidth + cellGap);
        const y = originY + r * (cellHeight + cellGap);
        const fill = getCellColor(value);

        const cellProps: Record<string, unknown> = {
          key: `cell-${r}-${c}`,
          x: String(x),
          y: String(y),
          width: String(cellWidth),
          height: String(cellHeight),
          fill,
          rx: String(cellRadius),
          ry: String(cellRadius),
        };

        if (onCellClick) {
          const row_ = r;
          const col_ = c;
          const val_ = value;
          cellProps.onClick = () => onCellClick(row_, col_, val_);
          cellProps.role = 'button';
          cellProps.tabIndex = 0;
        }

        if (onCellHover) {
          const row_ = r;
          const col_ = c;
          const val_ = value;
          cellProps.onMouseEnter = () => onCellHover(row_, col_, val_);
        }

        cells.push(createElement('rect', cellProps));
      }
    }

    return cells;
  }, [rows, cols, data, cellDims, padding, indicesOffset, titleOffset, cellGap, cellRadius, getCellColor, onCellClick, onCellHover]);

  // ---- Assemble SVG ---------------------------------------------------------

  const bg = buildBackground();
  const titleEl = buildTitle();
  const gridLines = buildGridLines();
  const indices = buildIndices();
  const cells = buildCells();

  const ariaLabel = title
    ? `${title} — ${rows}x${cols} discrete grid`
    : `${rows}x${cols} discrete grid`;

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': ariaLabel,
    },
    bg,
    ...titleEl,
    ...gridLines,
    ...indices,
    ...cells,
  );
}
