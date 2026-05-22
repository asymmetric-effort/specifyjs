// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { BubbleChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { x: 10, y: 20, r: 5, label: 'Alpha' },
  { x: 30, y: 40, r: 10, label: 'Beta' },
  { x: 50, y: 60, r: 15, label: 'Gamma' },
  { x: 70, y: 80, r: 8 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('BubbleChart — happy path', () => {
  it('renders with data points', () => {
    const el = BubbleChart({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = BubbleChart({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = BubbleChart({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = BubbleChart({ data: sampleData, title: 'Bubble Test' });
    expect(el.props['aria-label']).toBe('Bubble Test');
  });

  it('renders with axis labels', () => {
    const el = BubbleChart({ data: sampleData, xLabel: 'X Axis', yLabel: 'Y Axis' });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = BubbleChart({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with axes hidden', () => {
    const el = BubbleChart({ data: sampleData, showAxes: false });
    expect(el).not.toBeNull();
  });

  it('renders with labels shown', () => {
    const el = BubbleChart({ data: sampleData, showLabels: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom bubble radius range', () => {
    const el = BubbleChart({ data: sampleData, minBubbleRadius: 2, maxBubbleRadius: 50 });
    expect(el).not.toBeNull();
  });

  it('renders with custom default color', () => {
    const el = BubbleChart({ data: sampleData, defaultColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom opacity', () => {
    const el = BubbleChart({ data: sampleData, opacity: 0.5 });
    expect(el).not.toBeNull();
  });

  it('renders with per-datum colors', () => {
    const data = [
      { x: 10, y: 20, r: 5, color: '#ff0000' },
      { x: 30, y: 40, r: 10, color: '#00ff00' },
    ];
    const el = BubbleChart({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('BubbleChart — sad path', () => {
  it('handles empty data array', () => {
    const el = BubbleChart({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single data point', () => {
    const el = BubbleChart({ data: [{ x: 10, y: 20, r: 5 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero radius', () => {
    const el = BubbleChart({ data: [{ x: 10, y: 20, r: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = BubbleChart({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('BubbleChart — features', () => {
  it('renders circle elements for bubbles', () => {
    const el = BubbleChart({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const circles = children.filter((c: any) => c && c.type === 'circle');
    expect(circles.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('uses default aria-label when no title provided', () => {
    const el = BubbleChart({ data: sampleData });
    expect(el.props['aria-label']).toBeDefined();
  });
});
