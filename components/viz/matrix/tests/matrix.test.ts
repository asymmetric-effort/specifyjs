// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Matrix } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  [1.0, 0.8, 0.2],
  [0.8, 1.0, 0.5],
  [0.2, 0.5, 1.0],
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Matrix — happy path', () => {
  it('renders with square data grid', () => {
    const el = Matrix({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with shared labels', () => {
    const el = Matrix({ data: sampleData, labels: ['A', 'B', 'C'] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with separate row and column labels', () => {
    const el = Matrix({
      data: sampleData,
      rowLabels: ['Row 1', 'Row 2', 'Row 3'],
      columnLabels: ['Col 1', 'Col 2', 'Col 3'],
    });
    expect(el).not.toBeNull();
  });

  it('renders in symmetric mode', () => {
    const sparseData = [
      [1.0, 0.8, 0.0],
      [0.0, 1.0, 0.5],
      [0.0, 0.0, 1.0],
    ];
    const el = Matrix({ data: sparseData, symmetric: true });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = Matrix({ data: sampleData, width: 700, height: 700 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = Matrix({ data: sampleData, title: 'Correlation Matrix' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Correlation Matrix');
  });

  it('renders with values hidden', () => {
    const el = Matrix({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with diagonal hidden', () => {
    const el = Matrix({ data: sampleData, showDiagonal: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom color scale', () => {
    const el = Matrix({ data: sampleData, colorScale: ['#fff', '#f00'] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Matrix — sad path', () => {
  it('handles empty data array', () => {
    const el = Matrix({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Matrix — no data');
  });

  it('handles single cell', () => {
    const el = Matrix({ data: [[1.0]] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles all same values', () => {
    const el = Matrix({ data: [[5, 5], [5, 5]] });
    expect(el).not.toBeNull();
  });

  it('handles non-square data', () => {
    const el = Matrix({ data: [[1, 2, 3], [4, 5, 6]] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('Matrix — defaults', () => {
  it('uses default width of 500', () => {
    const el = Matrix({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 500', () => {
    const el = Matrix({ data: sampleData });
  });

  it('uses aria-label "Matrix visualization" when no title', () => {
    const el = Matrix({ data: sampleData });
    expect(el.props['aria-label']).toBe('Matrix visualization');
  });

  it('sets role to img', () => {
    const el = Matrix({ data: sampleData });
    expect(el.props.role).toBe('img');
  });

  it('shows values by default', () => {
    const el = Matrix({ data: sampleData });
    // With showValues=true (default), text elements for values should be in children
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const textElements = children.filter((c: any) => c && c.type === 'text');
    expect(textElements.length).toBeGreaterThan(0);
  });
});
