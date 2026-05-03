// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * PivotTable — A SpecifyJS component that renders cross-tabulation tables as SVG.
 *
 * Supports:
 *  - Multiple row and column dimension fields
 *  - Aggregation: sum, count, avg, min, max
 *  - Optional totals row and column
 *  - Configurable styling (header color, cell padding)
 *  - Auto-sizing cells
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface PivotTableProps {
  /** Array of data records */
  data: Record<string, unknown>[];
  /** Row dimension field names */
  rows: string[];
  /** Column dimension field names */
  columns: string[];
  /** Value field names to aggregate */
  values: string[];
  /** Aggregation function (default: 'sum') */
  aggregation?: 'sum' | 'count' | 'avg' | 'min' | 'max';
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Show totals row and column (default: true) */
  showTotals?: boolean;
  /** Chart title */
  title?: string;
  /** Header background color (default: '#3b82f6') */
  headerColor?: string;
  /** Cell padding in px (default: 8) */
  cellPadding?: number;
}

// -- Helpers ------------------------------------------------------------------

/** Build a composite key from multiple dimension fields. */
function compositeKey(record: Record<string, unknown>, fields: string[]): string {
  const parts: string[] = [];
  for (const f of fields) {
    parts.push(String(record[f] ?? ''));
  }
  return parts.join(' | ');
}

/** Collect unique sorted keys for a set of fields across data. */
function collectKeys(data: Record<string, unknown>[], fields: string[]): string[] {
  const set = new Set<string>();
  for (const record of data) {
    set.add(compositeKey(record, fields));
  }
  const result = Array.from(set);
  result.sort();
  return result;
}

/** Aggregate an array of numbers. */
function aggregate(values: number[], method: 'sum' | 'count' | 'avg' | 'min' | 'max'): number {
  if (values.length === 0) return 0;
  switch (method) {
    case 'count':
      return values.length;
    case 'sum': {
      let s = 0;
      for (const v of values) s += v;
      return s;
    }
    case 'avg': {
      let s = 0;
      for (const v of values) s += v;
      return s / values.length;
    }
    case 'min': {
      let m = values[0]!;
      for (let i = 1; i < values.length; i++) {
        if (values[i]! < m) m = values[i]!;
      }
      return m;
    }
    case 'max': {
      let m = values[0]!;
      for (let i = 1; i < values.length; i++) {
        if (values[i]! > m) m = values[i]!;
      }
      return m;
    }
  }
}

/** Format a number for display. */
function formatNumber(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2);
}

// -- Pivot computation --------------------------------------------------------

interface PivotResult {
  rowKeys: string[];
  colKeys: string[];
  cells: Map<string, number>; // "rowKey::colKey" -> aggregated value
  rowTotals: Map<string, number>;
  colTotals: Map<string, number>;
  grandTotal: number;
}

function computePivot(
  data: Record<string, unknown>[],
  rows: string[],
  columns: string[],
  values: string[],
  method: 'sum' | 'count' | 'avg' | 'min' | 'max',
): PivotResult {
  const rowKeys = collectKeys(data, rows);
  const colKeys = collectKeys(data, columns);

  // Group values by (rowKey, colKey)
  const buckets = new Map<string, number[]>();

  for (const record of data) {
    const rk = compositeKey(record, rows);
    const ck = compositeKey(record, columns);
    const cellKey = `${rk}::${ck}`;

    if (!buckets.has(cellKey)) {
      buckets.set(cellKey, []);
    }
    const bucket = buckets.get(cellKey)!;

    // Sum all value fields for this record into a single number
    let recordVal = 0;
    for (const vf of values) {
      const v = record[vf];
      if (typeof v === 'number') {
        recordVal += v;
      } else if (typeof v === 'string') {
        const parsed = parseFloat(v);
        if (!isNaN(parsed)) recordVal += parsed;
      }
    }
    bucket.push(recordVal);
  }

  // Aggregate each cell
  const cells = new Map<string, number>();
  for (const [key, vals] of buckets) {
    cells.set(key, aggregate(vals, method));
  }

  // Row totals
  const rowTotals = new Map<string, number>();
  for (const rk of rowKeys) {
    const rowVals: number[] = [];
    for (const ck of colKeys) {
      const v = cells.get(`${rk}::${ck}`);
      if (v !== undefined) rowVals.push(v);
    }
    rowTotals.set(rk, aggregate(rowVals, method === 'count' ? 'sum' : method));
  }

  // Column totals
  const colTotals = new Map<string, number>();
  for (const ck of colKeys) {
    const colVals: number[] = [];
    for (const rk of rowKeys) {
      const v = cells.get(`${rk}::${ck}`);
      if (v !== undefined) colVals.push(v);
    }
    colTotals.set(ck, aggregate(colVals, method === 'count' ? 'sum' : method));
  }

  // Grand total
  const allVals: number[] = [];
  for (const v of rowTotals.values()) {
    allVals.push(v);
  }
  const grandTotal = aggregate(allVals, method === 'count' ? 'sum' : method);

  return { rowKeys, colKeys, cells, rowTotals, colTotals, grandTotal };
}

// -- Component ----------------------------------------------------------------

export function PivotTable(props: PivotTableProps) {
  const {
    data = [],
    rows = [],
    columns = [],
    values = [],
    aggregation = 'sum',
    width = 600,
    height = 400,
    showTotals = true,
    title,
    headerColor = '#3b82f6',
    cellPadding = 8,
  } = props;

  // Handle empty data
  if (data.length === 0 || (rows.length === 0 && columns.length === 0) || values.length === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'table',
        'aria-label': title ?? 'Empty pivot table',
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
          opacity: '0.4',
        },
        'No data to display',
      ),
    );
  }

  const pivot = useMemo(
    () => computePivot(data, rows, columns, values, aggregation),
    [data, rows, columns, values, aggregation],
  );

  const { rowKeys, colKeys, cells, rowTotals, colTotals, grandTotal } = pivot;

  // Layout calculations
  const titleOffset = title ? 30 : 0;
  const numDataCols = colKeys.length + (showTotals ? 1 : 0);
  const numDataRows = rowKeys.length + (showTotals ? 1 : 0);
  const totalCols = 1 + numDataCols; // 1 for row header
  const totalRows = 1 + numDataRows; // 1 for column header

  const cellW = Math.max(40, (width - cellPadding * 2) / totalCols);
  const cellH = Math.max(20, Math.min(36, (height - titleOffset - cellPadding * 2) / totalRows));

  const tableW = cellW * totalCols;
  const tableH = cellH * totalRows;
  const startX = Math.max(0, (width - tableW) / 2);
  const startY = titleOffset + Math.max(0, (height - titleOffset - tableH) / 2);

  const elements: ReturnType<typeof createElement>[] = [];

  // Title
  if (title) {
    elements.push(
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
          fill: 'currentColor',
        },
        title,
      ),
    );
  }

  // Header row background
  elements.push(
    createElement('rect', {
      key: 'header-row-bg',
      x: String(startX),
      y: String(startY),
      width: String(tableW),
      height: String(cellH),
      fill: headerColor,
    }),
  );

  // Header column background
  elements.push(
    createElement('rect', {
      key: 'header-col-bg',
      x: String(startX),
      y: String(startY + cellH),
      width: String(cellW),
      height: String(cellH * numDataRows),
      fill: headerColor,
      opacity: '0.85',
    }),
  );

  // Corner cell: aggregation label
  elements.push(
    createElement(
      'text',
      {
        key: 'corner',
        x: String(startX + cellW / 2),
        y: String(startY + cellH / 2 + 4),
        'text-anchor': 'middle',
        'font-size': '10',
        'font-family': 'sans-serif',
        'font-weight': 'bold',
        fill: '#ffffff',
      },
      aggregation.toUpperCase(),
    ),
  );

  // Column headers
  for (let c = 0; c < colKeys.length; c++) {
    const x = startX + (c + 1) * cellW;
    const maxChars = Math.floor(cellW / 7);
    const label = colKeys[c]!;
    const displayLabel = label.length > maxChars
      ? label.substring(0, Math.max(1, maxChars - 2)) + '..'
      : label;

    elements.push(
      createElement(
        'text',
        {
          key: `ch-${c}`,
          x: String(x + cellW / 2),
          y: String(startY + cellH / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-family': 'sans-serif',
          'font-weight': 'bold',
          fill: '#ffffff',
        },
        displayLabel,
      ),
    );
  }

  // Totals column header
  if (showTotals) {
    elements.push(
      createElement(
        'text',
        {
          key: 'ch-total',
          x: String(startX + (colKeys.length + 1) * cellW + cellW / 2),
          y: String(startY + cellH / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-family': 'sans-serif',
          'font-weight': 'bold',
          fill: '#ffffff',
        },
        'Total',
      ),
    );
  }

  // Data rows
  for (let r = 0; r < rowKeys.length; r++) {
    const rk = rowKeys[r]!;
    const rowY = startY + (r + 1) * cellH;

    // Alternating row background
    if (r % 2 === 0) {
      elements.push(
        createElement('rect', {
          key: `row-bg-${r}`,
          x: String(startX + cellW),
          y: String(rowY),
          width: String(cellW * numDataCols),
          height: String(cellH),
          fill: '#f9fafb',
        }),
      );
    }

    // Row header
    const maxRowChars = Math.floor(cellW / 7);
    const rowLabel = rk.length > maxRowChars
      ? rk.substring(0, Math.max(1, maxRowChars - 2)) + '..'
      : rk;

    elements.push(
      createElement(
        'text',
        {
          key: `rh-${r}`,
          x: String(startX + cellW / 2),
          y: String(rowY + cellH / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-family': 'sans-serif',
          'font-weight': 'bold',
          fill: '#ffffff',
        },
        rowLabel,
      ),
    );

    // Data cells
    for (let c = 0; c < colKeys.length; c++) {
      const ck = colKeys[c]!;
      const cellKey = `${rk}::${ck}`;
      const value = cells.get(cellKey);
      const cellX = startX + (c + 1) * cellW;

      // Cell border
      elements.push(
        createElement('rect', {
          key: `border-${r}-${c}`,
          x: String(cellX),
          y: String(rowY),
          width: String(cellW),
          height: String(cellH),
          fill: 'none',
          stroke: '#e5e7eb',
          'stroke-width': '0.5',
        }),
      );

      // Cell value
      elements.push(
        createElement(
          'text',
          {
            key: `cell-${r}-${c}`,
            x: String(cellX + cellW / 2),
            y: String(rowY + cellH / 2 + 4),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: 'currentColor',
          },
          value !== undefined ? formatNumber(value) : '-',
        ),
      );
    }

    // Row total
    if (showTotals) {
      const totalX = startX + (colKeys.length + 1) * cellW;
      const rowTotal = rowTotals.get(rk) ?? 0;

      elements.push(
        createElement('rect', {
          key: `rt-bg-${r}`,
          x: String(totalX),
          y: String(rowY),
          width: String(cellW),
          height: String(cellH),
          fill: '#eff6ff',
        }),
      );

      elements.push(
        createElement(
          'text',
          {
            key: `rt-${r}`,
            x: String(totalX + cellW / 2),
            y: String(rowY + cellH / 2 + 4),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            'font-weight': 'bold',
            fill: '#1e40af',
          },
          formatNumber(rowTotal),
        ),
      );
    }
  }

  // Totals row
  if (showTotals) {
    const totalRowY = startY + (rowKeys.length + 1) * cellH;

    // Background
    elements.push(
      createElement('rect', {
        key: 'total-row-bg',
        x: String(startX),
        y: String(totalRowY),
        width: String(tableW),
        height: String(cellH),
        fill: '#eff6ff',
      }),
    );

    // Label
    elements.push(
      createElement(
        'text',
        {
          key: 'total-label',
          x: String(startX + cellW / 2),
          y: String(totalRowY + cellH / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-family': 'sans-serif',
          'font-weight': 'bold',
          fill: '#1e40af',
        },
        'Total',
      ),
    );

    // Column totals
    for (let c = 0; c < colKeys.length; c++) {
      const ck = colKeys[c]!;
      const colTotal = colTotals.get(ck) ?? 0;
      const cellX = startX + (c + 1) * cellW;

      elements.push(
        createElement(
          'text',
          {
            key: `ct-${c}`,
            x: String(cellX + cellW / 2),
            y: String(totalRowY + cellH / 2 + 4),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            'font-weight': 'bold',
            fill: '#1e40af',
          },
          formatNumber(colTotal),
        ),
      );
    }

    // Grand total
    const gtX = startX + (colKeys.length + 1) * cellW;
    elements.push(
      createElement(
        'text',
        {
          key: 'grand-total',
          x: String(gtX + cellW / 2),
          y: String(totalRowY + cellH / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '12',
          'font-family': 'sans-serif',
          'font-weight': 'bold',
          fill: '#1e3a8a',
        },
        formatNumber(grandTotal),
      ),
    );
  }

  // Outer border
  elements.push(
    createElement('rect', {
      key: 'outer-border',
      x: String(startX),
      y: String(startY),
      width: String(tableW),
      height: String(tableH),
      fill: 'none',
      stroke: '#d1d5db',
      'stroke-width': '1',
    }),
  );

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'table',
      'aria-label': title ?? 'Pivot table',
      style: { fontFamily: 'sans-serif' },
    },
    ...elements,
  );
}
