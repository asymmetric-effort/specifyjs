// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BoxPlot, computeBoxStats } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'Group A', values: [2, 4, 5, 7, 8, 9, 10, 12, 15, 20] },
  { label: 'Group B', values: [1, 3, 5, 6, 8, 10, 12, 14, 16, 18] },
  { label: 'Group C', values: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14] },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('BoxPlot — happy path', () => {
  it('renders with data', () => {
    const el = BoxPlot({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = BoxPlot({ data: sampleData });
    expect(el.props.width).toBe('600');
    expect(el.props.height).toBe('400');
  });

  it('renders with custom dimensions', () => {
    const el = BoxPlot({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('800');
    expect(el.props.height).toBe('500');
  });

  it('renders vertical orientation (default)', () => {
    const el = BoxPlot({ data: sampleData, orientation: 'vertical' });
    expect(el).not.toBeNull();
  });

  it('renders horizontal orientation', () => {
    const el = BoxPlot({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = BoxPlot({ data: sampleData, title: 'Box Plot Test' });
    expect(el.props['aria-label']).toBe('Box Plot Test');
  });

  it('renders with outliers shown (default)', () => {
    const el = BoxPlot({ data: sampleData, showOutliers: true });
    expect(el).not.toBeNull();
  });

  it('renders with outliers hidden', () => {
    const el = BoxPlot({ data: sampleData, showOutliers: false });
    expect(el).not.toBeNull();
  });

  it('renders with mean marker', () => {
    const el = BoxPlot({ data: sampleData, showMean: true });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = BoxPlot({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom box width', () => {
    const el = BoxPlot({ data: sampleData, boxWidth: 0.8 });
    expect(el).not.toBeNull();
  });

  it('renders with custom whisker color', () => {
    const el = BoxPlot({ data: sampleData, whiskerColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with per-datum colors', () => {
    const data = [
      { label: 'A', values: [1, 2, 3, 4, 5], color: '#ff0000' },
      { label: 'B', values: [2, 3, 4, 5, 6], color: '#00ff00' },
    ];
    const el = BoxPlot({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('BoxPlot — sad path', () => {
  it('handles empty data array', () => {
    const el = BoxPlot({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single group', () => {
    const el = BoxPlot({ data: [{ label: 'Only', values: [1, 2, 3, 4, 5] }] });
    expect(el).not.toBeNull();
  });

  it('handles group with single value', () => {
    const el = BoxPlot({ data: [{ label: 'Single', values: [42] }] });
    expect(el).not.toBeNull();
  });

  it('handles group with empty values', () => {
    const el = BoxPlot({ data: [{ label: 'Empty', values: [] }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = BoxPlot({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// computeBoxStats tests
// ---------------------------------------------------------------------------

describe('computeBoxStats', () => {
  it('computes correct stats for a sorted dataset', () => {
    const stats = computeBoxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(stats).not.toBeNull();
    expect(stats.median).toBeDefined();
    expect(stats.q1).toBeDefined();
    expect(stats.q3).toBeDefined();
    expect(stats.iqr).toBe(stats.q3 - stats.q1);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(10);
    expect(stats.mean).toBeDefined();
  });

  it('computes whiskers within 1.5 IQR', () => {
    const stats = computeBoxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    expect(stats.whiskerLow).toBeGreaterThanOrEqual(stats.q1 - 1.5 * stats.iqr);
    expect(stats.whiskerHigh).toBeLessThanOrEqual(stats.q3 + 1.5 * stats.iqr);
  });

  it('identifies outliers correctly', () => {
    const stats = computeBoxStats([1, 2, 3, 4, 5, 6, 7, 8, 9, 100]);
    expect(stats.outliers).toBeDefined();
    expect(Array.isArray(stats.outliers)).toBe(true);
  });

  it('handles single value', () => {
    const stats = computeBoxStats([42]);
    expect(stats).not.toBeNull();
    expect(stats.median).toBe(42);
  });

  it('handles empty array', () => {
    const stats = computeBoxStats([]);
    expect(stats).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('BoxPlot — features', () => {
  it('renders rect elements for boxes', () => {
    const el = BoxPlot({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const rects = children.filter((c: any) => c && c.type === 'rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('uses default aria-label when no title provided', () => {
    const el = BoxPlot({ data: sampleData });
    expect(el.props['aria-label']).toBeDefined();
  });
});
