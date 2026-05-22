// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { DataGrid } from '../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

const sampleColumns = [
  { key: 'name', header: 'Name', sortable: true },
  { key: 'age', header: 'Age', sortable: true },
  { key: 'city', header: 'City' },
];

const sampleData = [
  { name: 'Alice', age: 30, city: 'NYC' },
  { name: 'Bob', age: 25, city: 'LA' },
  { name: 'Charlie', age: 35, city: 'Chicago' },
  { name: 'Diana', age: 28, city: 'Boston' },
  { name: 'Eve', age: 22, city: 'Seattle' },
];

// ── Happy Path ─────────────────────────────────────────────────────────

describe('DataGrid — happy path', () => {
  it('renders all rows and columns correctly', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, { columns: sampleColumns, data: sampleData }));

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(5);

    const headerCells = container.querySelectorAll('thead th');
    expect(headerCells.length).toBe(3);
    expect(headerCells[0]!.textContent).toContain('Name');
    expect(headerCells[1]!.textContent).toContain('Age');
    expect(headerCells[2]!.textContent).toContain('City');
  });

  it('renders cell content from data', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, { columns: sampleColumns, data: sampleData }));

    const cells = container.querySelectorAll('tbody td');
    expect(cells[0]!.textContent).toBe('Alice');
    expect(cells[1]!.textContent).toBe('30');
    expect(cells[2]!.textContent).toBe('NYC');
  });

  it('pagination shows correct page of data', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      pageSize: 2,
    }));

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);

    // Should show pagination info
    const paginationText = container.textContent;
    expect(paginationText).toContain('1');
    expect(paginationText).toContain('2');
  });

  it('selection checkboxes render when selectable', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      selectable: true,
    }));

    const checkboxes = container.querySelectorAll('input[type="checkbox"]');
    // 1 select-all + 5 row checkboxes
    expect(checkboxes.length).toBe(6);
  });

  it('applies custom render function for columns', () => {
    const columnsWithRender = [
      { key: 'name', header: 'Name', render: (v: unknown) => `**${v}**` },
      { key: 'age', header: 'Age' },
    ];
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: columnsWithRender,
      data: sampleData,
    }));

    const firstCell = container.querySelector('tbody td');
    expect(firstCell!.textContent).toBe('**Alice**');
  });

  it('striped prop adds alternating backgrounds', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      striped: true,
    }));

    const rows = container.querySelectorAll('tbody tr');
    // Odd rows (index 1, 3) should have background
    const row1Style = (rows[1] as HTMLElement).style.backgroundColor;
    expect(row1Style).toBeTruthy();
  });
});

// ── Sad Path ───────────────────────────────────────────────────────────

describe('DataGrid — sad path', () => {
  it('renders empty table when data is empty', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, { columns: sampleColumns, data: [] }));

    const rows = container.querySelectorAll('tbody tr');
    expect(rows.length).toBe(0);

    // Headers should still render
    const headers = container.querySelectorAll('thead th');
    expect(headers.length).toBe(3);
  });

  it('handles missing column keys gracefully', () => {
    const columns = [
      { key: 'name', header: 'Name' },
      { key: 'nonexistent', header: 'Missing' },
    ];
    const root = createRoot(container);
    root.render(createElement(DataGrid, { columns, data: sampleData }));

    const cells = container.querySelectorAll('tbody tr:first-child td');
    expect(cells[0]!.textContent).toBe('Alice');
    expect(cells[1]!.textContent).toBe('');
  });

  it('handles data with null/undefined values', () => {
    const data = [
      { name: null, age: undefined, city: 'NYC' },
    ];
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: data as any,
    }));

    const cells = container.querySelectorAll('tbody td');
    expect(cells[0]!.textContent).toBe('');
    expect(cells[1]!.textContent).toBe('');
    expect(cells[2]!.textContent).toBe('NYC');
  });

  it('pagination with zero data shows 0 of 0', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: [],
      pageSize: 5,
    }));

    const text = container.textContent;
    expect(text).toContain('0');
  });
});

// ── Interaction ────────────────────────────────────────────────────────

describe('DataGrid — interaction', () => {
  it('sort click on header changes sort indicator', () => {
    let sortedColumn = '';
    let sortedDir = '';
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      onSort: (col: string, dir: string) => { sortedColumn = col; sortedDir = dir; },
    }));

    const nameHeader = container.querySelector('thead th');
    nameHeader!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(sortedColumn).toBe('name');
    expect(sortedDir).toBe('asc');
  });

  it('page change fires onPageChange callback', () => {
    let changedPage = -1;
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      pageSize: 2,
      currentPage: 0,
      onPageChange: (p: number) => { changedPage = p; },
    }));

    const nextButton = container.querySelector('button[aria-label="Next page"]');
    expect(nextButton).toBeTruthy();
    nextButton!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(changedPage).toBe(1);
  });

  it('row selection toggle fires onSelectionChange', () => {
    let selectedRows: number[] = [];
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      selectable: true,
      selectedRows: [],
      onSelectionChange: (rows: number[]) => { selectedRows = rows; },
    }));

    const rowCheckboxes = container.querySelectorAll('tbody input[type="checkbox"]');
    rowCheckboxes[0]!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(selectedRows).toContain(0);
  });

  it('select-all checkbox toggles all visible rows', () => {
    let selectedRows: number[] = [];
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      selectable: true,
      selectedRows: [],
      onSelectionChange: (rows: number[]) => { selectedRows = rows; },
    }));

    const selectAll = container.querySelector('thead input[type="checkbox"]');
    selectAll!.dispatchEvent(new Event('change', { bubbles: true }));
    expect(selectedRows.length).toBe(5);
  });

  it('previous page button is disabled on first page', () => {
    const root = createRoot(container);
    root.render(createElement(DataGrid, {
      columns: sampleColumns,
      data: sampleData,
      pageSize: 2,
      currentPage: 0,
    }));

    const prevButton = container.querySelector('button[aria-label="Previous page"]');
    expect(prevButton).toBeTruthy();
    expect((prevButton as HTMLButtonElement).disabled).toBe(true);
  });
});
