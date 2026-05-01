// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DataGrid — Full-featured data table/grid with sorting, pagination,
 * selection, filtering, and sticky header support.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useMemo, useCallback, useRef, useEffect } from '../../../../core/src/hooks/index';

export interface DataGridColumn {
  /** Property key in the row data */
  key: string;
  /** Display header text */
  header: string;
  /** Column width (CSS value) */
  width?: string;
  /** Whether this column is sortable */
  sortable?: boolean;
  /** Whether this column shows a filter input */
  filterable?: boolean;
  /** Custom cell renderer */
  render?: (value: unknown, row: Record<string, unknown>) => unknown;
}

export interface DataGridProps {
  /** Column definitions */
  columns: DataGridColumn[];
  /** Row data */
  data: Record<string, unknown>[];
  /** Rows per page (enables pagination when set) */
  pageSize?: number;
  /** Current page index (0-based) */
  currentPage?: number;
  /** Page change handler */
  onPageChange?: (page: number) => void;
  /** Current sort column key */
  sortBy?: string;
  /** Sort direction */
  sortDir?: 'asc' | 'desc';
  /** Sort change handler */
  onSort?: (columnKey: string, direction: 'asc' | 'desc') => void;
  /** Enable row selection checkboxes */
  selectable?: boolean;
  /** Currently selected row indices */
  selectedRows?: number[];
  /** Selection change handler */
  onSelectionChange?: (selectedIndices: number[]) => void;
  /** Alternate row background colors */
  striped?: boolean;
  /** Show cell borders */
  bordered?: boolean;
  /** Compact row height */
  compact?: boolean;
  /** Sticky header on scroll */
  stickyHeader?: boolean;
}

// ── Styles ──────────────────────────────────────────────────────────────

const baseTableStyle: Record<string, string> = {
  width: '100%',
  borderCollapse: 'collapse',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: '14px',
  color: '#1f2937',
};

const baseHeaderCellStyle: Record<string, string> = {
  padding: '10px 12px',
  textAlign: 'left',
  fontWeight: '600',
  backgroundColor: '#f9fafb',
  borderBottom: '2px solid #e5e7eb',
  userSelect: 'none',
  whiteSpace: 'nowrap',
};

const baseCellStyle: Record<string, string> = {
  padding: '10px 12px',
  borderBottom: '1px solid #e5e7eb',
};

const compactCellPadding = '6px 8px';

const sortIndicatorStyle: Record<string, string> = {
  marginLeft: '4px',
  fontSize: '12px',
  color: '#6b7280',
};

const filterInputStyle: Record<string, string> = {
  width: '100%',
  padding: '4px 8px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  fontSize: '12px',
  boxSizing: 'border-box',
};

const paginationWrapperStyle: Record<string, string> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '10px 12px',
  fontSize: '13px',
  color: '#6b7280',
};

const pageButtonStyle: Record<string, string> = {
  padding: '4px 10px',
  margin: '0 2px',
  border: '1px solid #d1d5db',
  borderRadius: '4px',
  backgroundColor: '#fff',
  cursor: 'pointer',
  fontSize: '13px',
};

const pageButtonActiveStyle: Record<string, string> = {
  ...pageButtonStyle,
  backgroundColor: '#3b82f6',
  color: '#fff',
  borderColor: '#3b82f6',
};

const pageButtonDisabledStyle: Record<string, string> = {
  ...pageButtonStyle,
  opacity: '0.5',
  cursor: 'default',
};

const checkboxStyle: Record<string, string> = {
  cursor: 'pointer',
  width: '16px',
  height: '16px',
};

// ── Helpers ─────────────────────────────────────────────────────────────

function getSortIndicator(columnKey: string, sortBy?: string, sortDir?: 'asc' | 'desc'): string {
  if (columnKey !== sortBy) return '\u2195'; // up-down arrow
  return sortDir === 'asc' ? '\u2191' : '\u2193';
}

// ── Component ───────────────────────────────────────────────────────────

export function DataGrid(props: DataGridProps) {
  const {
    columns,
    data,
    pageSize,
    currentPage: controlledPage,
    onPageChange,
    sortBy: controlledSortBy,
    sortDir: controlledSortDir,
    onSort,
    selectable = false,
    selectedRows: controlledSelected,
    onSelectionChange,
    striped = false,
    bordered = false,
    compact = false,
    stickyHeader = false,
  } = props;

  // ── Internal state (uncontrolled fallbacks) ─────────────────────────

  const [internalPage, setInternalPage] = useState(0);
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(undefined);
  const [internalSortDir, setInternalSortDir] = useState<'asc' | 'desc'>('asc');
  const [internalSelected, setInternalSelected] = useState<number[]>([]);
  const [filters, setFilters] = useState<Record<string, string>>({});

  const page = controlledPage ?? internalPage;
  const sortByKey = controlledSortBy ?? internalSortBy;
  const sortDir = controlledSortDir ?? internalSortDir;
  const selected = controlledSelected ?? internalSelected;

  // ── Filtering ───────────────────────────────────────────────────────

  const filteredData = useMemo(() => {
    const activeFilters = Object.entries(filters).filter(([, v]) => v.length > 0);
    if (activeFilters.length === 0) return data;
    return data.filter((row) =>
      activeFilters.every(([key, term]) => {
        const cellValue = String(row[key] ?? '').toLowerCase();
        return cellValue.includes(term.toLowerCase());
      }),
    );
  }, [data, filters]);

  // ── Sorting ─────────────────────────────────────────────────────────

  const sortedData = useMemo(() => {
    if (!sortByKey) return filteredData;
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortByKey];
      const bVal = b[sortByKey];
      if (aVal == null && bVal == null) return 0;
      if (aVal == null) return 1;
      if (bVal == null) return -1;
      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      }
      const aStr = String(aVal);
      const bStr = String(bVal);
      const cmp = aStr.localeCompare(bStr);
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return sorted;
  }, [filteredData, sortByKey, sortDir]);

  // ── Pagination ──────────────────────────────────────────────────────

  const totalRows = sortedData.length;
  const totalPages = pageSize ? Math.max(1, Math.ceil(totalRows / pageSize)) : 1;
  const pagedData = pageSize ? sortedData.slice(page * pageSize, (page + 1) * pageSize) : sortedData;

  const setPage = useCallback(
    (p: number) => {
      if (onPageChange) onPageChange(p);
      else setInternalPage(p);
    },
    [onPageChange],
  );

  // ── Sort handler ────────────────────────────────────────────────────

  const handleSort = useCallback(
    (key: string) => {
      const newDir = sortByKey === key && sortDir === 'asc' ? 'desc' : 'asc';
      if (onSort) {
        onSort(key, newDir);
      } else {
        setInternalSortBy(key);
        setInternalSortDir(newDir);
      }
    },
    [sortByKey, sortDir, onSort],
  );

  // ── Selection handlers ──────────────────────────────────────────────

  const toggleRow = useCallback(
    (index: number) => {
      const next = selected.includes(index)
        ? selected.filter((i) => i !== index)
        : [...selected, index];
      if (onSelectionChange) onSelectionChange(next);
      else setInternalSelected(next);
    },
    [selected, onSelectionChange],
  );

  const toggleAll = useCallback(() => {
    const allIndices = pagedData.map((_, i) => (pageSize ? page * pageSize + i : i));
    const allSelected = allIndices.every((i) => selected.includes(i));
    const next = allSelected
      ? selected.filter((i) => !allIndices.includes(i))
      : [...new Set([...selected, ...allIndices])];
    if (onSelectionChange) onSelectionChange(next);
    else setInternalSelected(next);
  }, [pagedData, selected, pageSize, page, onSelectionChange]);

  // ── Filter handler ──────────────────────────────────────────────────

  const handleFilter = useCallback(
    (key: string, value: string) => {
      setFilters((prev) => ({ ...prev, [key]: value }));
      // Reset to first page when filtering
      setPage(0);
    },
    [setPage],
  );

  // ── Determine if filter row is needed ───────────────────────────────

  const hasFilters = columns.some((c) => c.filterable);

  // ── Cell padding ────────────────────────────────────────────────────

  const cellPad = compact ? compactCellPadding : baseCellStyle.padding;

  // ── Build header cells ──────────────────────────────────────────────

  const headerCells: unknown[] = [];

  if (selectable) {
    const allPageIndices = pagedData.map((_, i) => (pageSize ? page * pageSize + i : i));
    const allChecked = allPageIndices.length > 0 && allPageIndices.every((i) => selected.includes(i));

    headerCells.push(
      createElement('th', {
        key: '__select_all',
        style: {
          ...baseHeaderCellStyle,
          padding: cellPad,
          width: '40px',
          textAlign: 'center',
          ...(stickyHeader ? { position: 'sticky', top: '0', zIndex: '2' } : {}),
        },
      },
        createElement('input', {
          type: 'checkbox',
          checked: allChecked,
          onChange: toggleAll,
          style: checkboxStyle,
          'aria-label': 'Select all rows',
        }),
      ),
    );
  }

  for (const col of columns) {
    const cellStyle: Record<string, string> = {
      ...baseHeaderCellStyle,
      padding: cellPad,
      ...(col.width ? { width: col.width } : {}),
      ...(col.sortable ? { cursor: 'pointer' } : {}),
      ...(bordered ? { border: '1px solid #e5e7eb' } : {}),
      ...(stickyHeader ? { position: 'sticky', top: '0', zIndex: '2' } : {}),
    };

    const children: unknown[] = [col.header];

    if (col.sortable) {
      children.push(
        createElement('span', { style: sortIndicatorStyle }, getSortIndicator(col.key, sortByKey, sortDir)),
      );
    }

    headerCells.push(
      createElement('th', {
        key: col.key,
        style: cellStyle,
        onClick: col.sortable ? () => handleSort(col.key) : undefined,
        onKeyDown: col.sortable ? (e: Event) => {
          const key = (e as KeyboardEvent).key;
          if (key === 'Enter' || key === ' ') {
            e.preventDefault();
            handleSort(col.key);
          }
        } : undefined,
        tabIndex: col.sortable ? 0 : undefined,
        role: col.sortable ? 'columnheader' : undefined,
        'aria-sort': sortByKey === col.key ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined,
      }, ...children),
    );
  }

  // ── Build filter row ────────────────────────────────────────────────

  let filterRow: unknown = null;

  if (hasFilters) {
    const filterCells: unknown[] = [];

    if (selectable) {
      filterCells.push(
        createElement('th', { key: '__filter_spacer', style: { padding: cellPad } }),
      );
    }

    for (const col of columns) {
      filterCells.push(
        createElement('th', {
          key: `filter_${col.key}`,
          style: { padding: '4px 8px', backgroundColor: '#f9fafb' },
        },
          col.filterable
            ? createElement('input', {
                type: 'text',
                placeholder: `Filter ${col.header}...`,
                style: filterInputStyle,
                value: filters[col.key] ?? '',
                onInput: (e: Event) => handleFilter(col.key, (e.target as HTMLInputElement).value),
                'aria-label': `Filter by ${col.header}`,
              })
            : null,
        ),
      );
    }

    filterRow = createElement('tr', { key: '__filter_row' }, ...filterCells);
  }

  // ── Build body rows ─────────────────────────────────────────────────

  const bodyRows: unknown[] = [];

  for (let i = 0; i < pagedData.length; i++) {
    const row = pagedData[i];
    const absoluteIndex = pageSize ? page * pageSize + i : i;
    const isSelected = selected.includes(absoluteIndex);

    const rowStyle: Record<string, string> = {};
    if (striped && i % 2 === 1) rowStyle.backgroundColor = '#f9fafb';
    if (isSelected) rowStyle.backgroundColor = '#eff6ff';

    const cells: unknown[] = [];

    if (selectable) {
      cells.push(
        createElement('td', {
          key: '__select',
          style: { padding: cellPad, textAlign: 'center', ...baseCellStyle, ...(bordered ? { border: '1px solid #e5e7eb' } : {}) },
        },
          createElement('input', {
            type: 'checkbox',
            checked: isSelected,
            onChange: () => toggleRow(absoluteIndex),
            style: checkboxStyle,
            'aria-label': `Select row ${absoluteIndex + 1}`,
          }),
        ),
      );
    }

    for (const col of columns) {
      const value = row[col.key];
      const cellContent = col.render ? col.render(value, row) : String(value ?? '');

      cells.push(
        createElement('td', {
          key: col.key,
          style: {
            ...baseCellStyle,
            padding: cellPad,
            ...(bordered ? { border: '1px solid #e5e7eb' } : {}),
          },
        }, cellContent),
      );
    }

    bodyRows.push(
      createElement('tr', { key: String(absoluteIndex), style: rowStyle }, ...cells),
    );
  }

  // ── Build pagination ────────────────────────────────────────────────

  let pagination: unknown = null;

  if (pageSize) {
    const startRow = totalRows === 0 ? 0 : page * pageSize + 1;
    const endRow = Math.min((page + 1) * pageSize, totalRows);

    const pageButtons: unknown[] = [];

    // Previous button
    pageButtons.push(
      createElement('button', {
        key: 'prev',
        style: page === 0 ? pageButtonDisabledStyle : pageButtonStyle,
        onClick: page > 0 ? () => setPage(page - 1) : undefined,
        disabled: page === 0,
        'aria-label': 'Previous page',
      }, '\u2190 Prev'),
    );

    // Page number buttons (show up to 7 pages with ellipsis)
    const maxButtons = 7;
    let startPage = Math.max(0, page - Math.floor(maxButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxButtons);
    if (endPage - startPage < maxButtons) {
      startPage = Math.max(0, endPage - maxButtons);
    }

    if (startPage > 0) {
      pageButtons.push(
        createElement('button', { key: 'p0', style: pageButtonStyle, onClick: () => setPage(0) }, '1'),
      );
      if (startPage > 1) {
        pageButtons.push(createElement('span', { key: 'e1', style: { margin: '0 4px' } }, '...'));
      }
    }

    for (let p = startPage; p < endPage; p++) {
      pageButtons.push(
        createElement('button', {
          key: `p${p}`,
          style: p === page ? pageButtonActiveStyle : pageButtonStyle,
          onClick: p !== page ? () => setPage(p) : undefined,
          'aria-current': p === page ? 'page' : undefined,
        }, String(p + 1)),
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageButtons.push(createElement('span', { key: 'e2', style: { margin: '0 4px' } }, '...'));
      }
      pageButtons.push(
        createElement('button', {
          key: `p${totalPages - 1}`,
          style: pageButtonStyle,
          onClick: () => setPage(totalPages - 1),
        }, String(totalPages)),
      );
    }

    // Next button
    pageButtons.push(
      createElement('button', {
        key: 'next',
        style: page >= totalPages - 1 ? pageButtonDisabledStyle : pageButtonStyle,
        onClick: page < totalPages - 1 ? () => setPage(page + 1) : undefined,
        disabled: page >= totalPages - 1,
        'aria-label': 'Next page',
      }, 'Next \u2192'),
    );

    pagination = createElement('div', { style: paginationWrapperStyle },
      createElement('span', null, `Showing ${startRow}\u2013${endRow} of ${totalRows}`),
      createElement('div', { style: { display: 'flex', alignItems: 'center', gap: '2px' } }, ...pageButtons),
    );
  }

  // ── Assemble table ──────────────────────────────────────────────────

  const wrapperStyle: Record<string, string> = {
    width: '100%',
    ...(stickyHeader ? { overflow: 'auto', maxHeight: '600px' } : {}),
  };

  const tableStyle: Record<string, string> = {
    ...baseTableStyle,
    ...(bordered ? { border: '1px solid #e5e7eb' } : {}),
  };

  const thead = createElement('thead', null,
    createElement('tr', null, ...headerCells),
    filterRow,
  );

  const tbody = createElement('tbody', null, ...bodyRows);

  const table = createElement('table', {
    style: tableStyle,
    role: 'grid',
    'aria-rowcount': String(totalRows),
  }, thead, tbody);

  return createElement('div', { style: wrapperStyle },
    table,
    pagination,
  );
}
