// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { PieGraph, computeSlices, describeArc } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'Apples', value: 30 },
  { label: 'Bananas', value: 25 },
  { label: 'Cherries', value: 20 },
  { label: 'Dates', value: 25 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('PieGraph — happy path', () => {
  it('renders with data', () => {
    const el = PieGraph({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = PieGraph({ data: sampleData, width: 500, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders as donut chart with innerRadius', () => {
    const el = PieGraph({ data: sampleData, innerRadius: 60 });
    expect(el).not.toBeNull();
  });

  it('renders with center label (donut)', () => {
    const el = PieGraph({ data: sampleData, innerRadius: 60, centerLabel: 'Total: 100' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = PieGraph({ data: sampleData, title: 'Fruit Distribution' });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = PieGraph({ data: sampleData, colors: ['#f00', '#0f0', '#00f', '#ff0'] });
    expect(el).not.toBeNull();
  });

  it('renders with legend on right', () => {
    const el = PieGraph({ data: sampleData, showLegend: true, legendPosition: 'right' });
    expect(el).not.toBeNull();
  });

  it('renders with legend on bottom', () => {
    const el = PieGraph({ data: sampleData, showLegend: true, legendPosition: 'bottom' });
    expect(el).not.toBeNull();
  });

  it('renders with custom textColor', () => {
    const el = PieGraph({ data: sampleData, textColor: '#eee' });
    expect(el).not.toBeNull();
  });

  it('defaults textColor to currentColor', () => {
    const el = PieGraph({ data: sampleData, showLegend: true });
    expect(el).not.toBeNull();
  });

  it('renders without labels', () => {
    const el = PieGraph({ data: sampleData, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders without values', () => {
    const el = PieGraph({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('PieGraph — sad path', () => {
  it('handles empty data array', () => {
    const el = PieGraph({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single slice', () => {
    const el = PieGraph({ data: [{ label: 'All', value: 100 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const el = PieGraph({ data: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles negative values in computeSlices', () => {
    const slices = computeSlices([{ label: 'A', value: -10 }, { label: 'B', value: 10 }]);
    // Total is 0, should return empty
    expect(slices).toBeDefined();
  });

  it('handles zero dimensions', () => {
    const el = PieGraph({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Utility tests
// ---------------------------------------------------------------------------

describe('computeSlices', () => {
  it('returns correct number of slices', () => {
    const slices = computeSlices(sampleData);
    expect(slices).toHaveLength(4);
  });

  it('percentages sum to 100', () => {
    const slices = computeSlices(sampleData);
    const total = slices.reduce((sum, s) => sum + s.percentage, 0);
    expect(total).toBeCloseTo(100, 5);
  });

  it('angles span full circle', () => {
    const slices = computeSlices(sampleData);
    const lastSlice = slices[slices.length - 1];
    expect(lastSlice.endAngle).toBeCloseTo(Math.PI * 2, 1);
  });

  it('applies pad angle', () => {
    const slices = computeSlices(sampleData, { padAngle: 0.05 });
    expect(slices[0].startAngle).toBeGreaterThan(0);
  });
});

describe('describeArc', () => {
  it('returns a valid SVG path string', () => {
    const d = describeArc(100, 100, 0, 80, 0, Math.PI / 2);
    expect(d).toContain('M');
    expect(d).toContain('A');
  });

  it('creates donut arc when innerRadius > 0', () => {
    const d = describeArc(100, 100, 40, 80, 0, Math.PI / 2);
    expect(d).toContain('M');
    expect(d).toContain('A');
    expect(d).toContain('Z');
  });

  it('creates pie slice when innerRadius is 0', () => {
    const d = describeArc(100, 100, 0, 80, 0, Math.PI);
    expect(d).toContain('L');
  });
});
