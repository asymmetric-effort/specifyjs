// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LineGraph } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { x: 0, y: 10 },
  { x: 1, y: 20 },
  { x: 2, y: 15 },
  { x: 3, y: 30 },
  { x: 4, y: 25 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('LineGraph — happy path', () => {
  it('renders with data', () => {
    const el = LineGraph({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = LineGraph({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom line color', () => {
    const el = LineGraph({ data: sampleData, lineColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with area fill', () => {
    const el = LineGraph({ data: sampleData, showArea: true });
    expect(el).not.toBeNull();
  });

  it('renders with points hidden', () => {
    const el = LineGraph({ data: sampleData, showPoints: false });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = LineGraph({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with title and axis labels', () => {
    const el = LineGraph({ data: sampleData, title: 'My Chart', xLabel: 'X', yLabel: 'Y' });
    expect(el).not.toBeNull();
  });

  it('renders with animation', () => {
    const el = LineGraph({ data: sampleData, animate: true });
    expect(el).not.toBeNull();
  });

  it('renders multiLine series', () => {
    const el = LineGraph({
      data: sampleData,
      multiLine: [
        { data: [{ x: 0, y: 5 }, { x: 2, y: 15 }], color: '#ff0000', label: 'Series B' },
      ],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('LineGraph — sad path', () => {
  it('handles empty data array', () => {
    const el = LineGraph({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single data point', () => {
    const el = LineGraph({ data: [{ x: 5, y: 10 }] });
    expect(el).not.toBeNull();
  });

  it('handles negative values', () => {
    const el = LineGraph({ data: [{ x: -5, y: -10 }, { x: 5, y: 10 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = LineGraph({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });

  it('handles all same y values', () => {
    const el = LineGraph({ data: [{ x: 0, y: 5 }, { x: 1, y: 5 }, { x: 2, y: 5 }] });
    expect(el).not.toBeNull();
  });

  it('handles all same x values', () => {
    const el = LineGraph({ data: [{ x: 0, y: 1 }, { x: 0, y: 2 }, { x: 0, y: 3 }] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('LineGraph — features', () => {
  it('renders grid lines when showGrid is true', () => {
    const el = LineGraph({ data: sampleData, showGrid: true });
    const dashed = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter(
      (c: any) => c && c.type === 'line' && c.props['stroke-dasharray'],
    );
    expect(dashed.length).toBeGreaterThan(0);
  });

  it('renders data point circles when showPoints is true', () => {
    const el = LineGraph({ data: sampleData, showPoints: true });
    const circles = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'circle');
    expect(circles.length).toBe(sampleData.length);
  });

  it('renders polyline for the line', () => {
    const el = LineGraph({ data: sampleData });
    const polylines = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'polyline');
    expect(polylines.length).toBeGreaterThanOrEqual(1);
  });

  it('renders area polygon when showArea is true', () => {
    const el = LineGraph({ data: sampleData, showArea: true });
    const polygons = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'polygon');
    expect(polygons.length).toBe(1);
  });
});
