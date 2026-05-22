// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Histogram } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 30];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Histogram — happy path', () => {
  it('renders with sample data', () => {
    const el = Histogram({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default props', () => {
    const el = Histogram({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom bins count', () => {
    const el = Histogram({ data: sampleData, bins: 5 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with many bins', () => {
    const el = Histogram({ data: sampleData, bins: 20 });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = Histogram({ data: sampleData, width: 800, height: 500 });
    expect(el).not.toBeNull();
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom bar color', () => {
    const el = Histogram({ data: sampleData, barColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = Histogram({ data: sampleData, title: 'Test Histogram' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Test Histogram');
  });

  it('renders with axis labels', () => {
    const el = Histogram({ data: sampleData, xLabel: 'X', yLabel: 'Y' });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = Histogram({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = Histogram({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom padding', () => {
    const el = Histogram({ data: sampleData, padding: 80 });
    expect(el).not.toBeNull();
  });

  it('renders with custom bar gap', () => {
    const el = Histogram({ data: sampleData, barGap: 4 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Histogram — sad path', () => {
  it('handles empty data array', () => {
    const el = Histogram({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single value', () => {
    const el = Histogram({ data: [42] });
    expect(el).not.toBeNull();
  });

  it('handles all-same values', () => {
    const el = Histogram({ data: [5, 5, 5, 5, 5] });
    expect(el).not.toBeNull();
  });

  it('handles negative values', () => {
    const el = Histogram({ data: [-10, -5, 0, 5, 10] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = Histogram({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });

  it('handles bins count of 1', () => {
    const el = Histogram({ data: sampleData, bins: 1 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('Histogram — features', () => {
  it('renders rect elements for bars', () => {
    const el = Histogram({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const rects = children.filter((c: any) => c && c.type === 'rect');
    expect(rects.length).toBeGreaterThan(0);
  });

  it('renders grid lines when showGrid is true', () => {
    const el = Histogram({ data: sampleData, showGrid: true });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const dashed = children.filter(
      (c: any) => c && c.type === 'line' && c.props['stroke-dasharray'],
    );
    expect(dashed.length).toBeGreaterThan(0);
  });

  it('renders no grid lines when showGrid is false', () => {
    const el = Histogram({ data: sampleData, showGrid: false });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const dashed = children.filter(
      (c: any) => c && c.type === 'line' && c.props['stroke-dasharray'],
    );
    expect(dashed.length).toBe(0);
  });

  it('uses default aria-label when no title provided', () => {
    const el = Histogram({ data: sampleData });
    expect(el.props['aria-label']).toBe('Histogram');
  });
});
