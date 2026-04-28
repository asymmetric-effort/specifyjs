// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
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
    expect(el.props.width).toBe('800');
    expect(el.props.height).toBe('600');
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
    expect(el.props.width).toBe('600');
  });

  it('uses default height of 400', () => {
    const el = HeatMap({ data: sampleData });
    expect(el.props.height).toBe('400');
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
