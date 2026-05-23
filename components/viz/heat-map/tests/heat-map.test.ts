// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { HeatMap } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('HeatMap — happy path', () => {
  it('renders with 2D data grid', () => {
    const el = HeatMap({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with row and column labels', () => {
    const el = HeatMap({
      data: sampleData,
      rowLabels: ['Row A', 'Row B', 'Row C'],
      columnLabels: ['Col 1', 'Col 2', 'Col 3'],
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = HeatMap({ data: sampleData, width: 800, height: 600 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with showValues enabled', () => {
    const el = HeatMap({ data: sampleData, showValues: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom color scale', () => {
    const el = HeatMap({ data: sampleData, colorScale: ['#000000', '#ffffff'] });
    expect(el).not.toBeNull();
  });

  it('renders with explicit min/max values', () => {
    const el = HeatMap({ data: sampleData, minValue: 0, maxValue: 100 });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = HeatMap({ data: sampleData, title: 'Temperature' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Temperature');
  });

  it('renders with custom cell border', () => {
    const el = HeatMap({ data: sampleData, cellBorderColor: '#ccc', cellBorderWidth: 2 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('HeatMap — sad path', () => {
  it('handles empty data array', () => {
    const el = HeatMap({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Heat map — no data');
  });

  it('handles single cell', () => {
    const el = HeatMap({ data: [[42]] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles rows of different lengths', () => {
    const el = HeatMap({ data: [[1, 2], [3]] });
    expect(el).not.toBeNull();
  });

  it('handles all same values', () => {
    const el = HeatMap({ data: [[5, 5], [5, 5]] });
    expect(el).not.toBeNull();
  });

  it('handles negative values', () => {
    const el = HeatMap({ data: [[-10, 0], [5, 10]] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('HeatMap — defaults', () => {
  it('uses default width of 600', () => {
    const el = HeatMap({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 400', () => {
    const el = HeatMap({ data: sampleData });
  });

  it('uses aria-label "Heat map" when no title', () => {
    const el = HeatMap({ data: sampleData });
    expect(el.props['aria-label']).toBe('Heat map');
  });

  it('sets role to img', () => {
    const el = HeatMap({ data: sampleData });
    expect(el.props.role).toBe('img');
  });
});

// ---------------------------------------------------------------------------
// Dark mode text color tests
// ---------------------------------------------------------------------------

/** Hardcoded dark text colors that are invisible on dark backgrounds. */
const DARK_ONLY_FILLS = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563'];

/** Flatten props.children into an array of vnodes. */
function flatChildren(el: any): any[] {
  const c = el?.props?.children;
  if (Array.isArray(c)) return c.flat(Infinity).filter(Boolean);
  return c ? [c] : [];
}

/** Collect all fill attributes from an SVG vnode tree (non-recursive, iterative). */
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

describe('HeatMap — dark mode text colors', () => {
  it('title text uses currentColor instead of hardcoded dark fill', () => {
    const el = HeatMap({ data: sampleData, title: 'My Heat Map' });
    const children = flatChildren(el);
    const titleEl = children.find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('row and column labels use currentColor', () => {
    const el = HeatMap({
      data: sampleData,
      rowLabels: ['A', 'B', 'C'],
      columnLabels: ['X', 'Y', 'Z'],
    });
    const children = flatChildren(el);
    const labels = children.filter(
      (c: any) => c?.key?.startsWith('row-label-') || c?.key?.startsWith('col-label-'),
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.props.fill).toBe('currentColor');
    }
  });

  it('empty state text uses currentColor with opacity', () => {
    const el = HeatMap({ data: [] });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = HeatMap({
      data: sampleData,
      title: 'Test',
      rowLabels: ['A', 'B', 'C'],
      columnLabels: ['X', 'Y', 'Z'],
    });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
