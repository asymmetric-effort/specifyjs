// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PivotTable } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { region: 'North', product: 'Widget', revenue: 100 },
  { region: 'North', product: 'Gadget', revenue: 200 },
  { region: 'South', product: 'Widget', revenue: 150 },
  { region: 'South', product: 'Gadget', revenue: 250 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('PivotTable — happy path', () => {
  it('renders with valid data', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      title: 'Revenue Pivot',
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      width: 800,
      height: 600,
    });
    expect(el).not.toBeNull();
  });

  it('renders with showTotals disabled', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      showTotals: false,
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom headerColor and cellPadding', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      headerColor: '#ff0000',
      cellPadding: 16,
    });
    expect(el).not.toBeNull();
  });

  it('renders with sum aggregation (default)', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      aggregation: 'sum',
    });
    expect(el).not.toBeNull();
  });

  it('renders with count aggregation', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      aggregation: 'count',
    });
    expect(el).not.toBeNull();
  });

  it('renders with avg aggregation', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      aggregation: 'avg',
    });
    expect(el).not.toBeNull();
  });

  it('renders with min aggregation', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      aggregation: 'min',
    });
    expect(el).not.toBeNull();
  });

  it('renders with max aggregation', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      aggregation: 'max',
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('PivotTable — sad path', () => {
  it('handles empty data array', () => {
    const el = PivotTable({
      data: [],
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles empty rows array', () => {
    const el = PivotTable({
      data: sampleData,
      rows: [],
      columns: [],
      values: ['revenue'],
    });
    expect(el).not.toBeNull();
  });

  it('handles empty values array', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: [],
    });
    expect(el).not.toBeNull();
  });

  it('handles single record', () => {
    const el = PivotTable({
      data: [{ region: 'X', product: 'Y', revenue: 10 }],
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('PivotTable — defaults', () => {
  it('uses default width and height', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="table"', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el.props.role).toBe('table');
  });

  it('uses default aria-label when no title', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    expect(el.props['aria-label']).toBe('Pivot table');
  });

  it('uses title as aria-label when provided', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      title: 'My Pivot',
    });
    expect(el.props['aria-label']).toBe('My Pivot');
  });
});

// ---------------------------------------------------------------------------
// Dark mode text color tests
// ---------------------------------------------------------------------------

const DARK_ONLY_FILLS = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563', '#9ca3af'];

function flatChildren(el: any): any[] {
  const c = el?.props?.children;
  if (Array.isArray(c)) return c.flat(Infinity).filter(Boolean);
  return c ? [c] : [];
}

function collectTextFills(root: any): { key: string; fill: string }[] {
  const results: { key: string; fill: string }[] = [];
  const stack: any[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'text' && node.props?.fill) {
      results.push({ key: node.key ?? '(unknown)', fill: node.props.fill });
    }
    const children = node.children ?? node.props?.children;
    if (Array.isArray(children)) {
      for (const child of children) stack.push(child);
    } else if (children) {
      stack.push(children);
    }
  }
  return results;
}

describe('PivotTable — dark mode text colors', () => {
  it('title text uses currentColor', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      title: 'Sales Pivot',
    });
    const titleEl = flatChildren(el).find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('data cell text uses currentColor', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    const cellTexts = flatChildren(el).filter(
      (c: any) => c?.key?.startsWith('cell-'),
    );
    expect(cellTexts.length).toBeGreaterThan(0);
    for (const cell of cellTexts) {
      expect(cell.props.fill).toBe('currentColor');
    }
  });

  it('empty state text uses currentColor', () => {
    const el = PivotTable({
      data: [],
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
    });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = PivotTable({
      data: sampleData,
      rows: ['region'],
      columns: ['product'],
      values: ['revenue'],
      title: 'Test',
      showTotals: true,
    });
    const fills = collectTextFills(el);
    // Exclude white text on colored header backgrounds
    const nonWhiteFills = fills.filter((f) => f.fill !== '#ffffff');
    for (const entry of nonWhiteFills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
