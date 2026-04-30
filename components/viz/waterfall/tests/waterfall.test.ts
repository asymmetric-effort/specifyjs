// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WaterfallChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'Start', value: 100, type: 'increase' as const },
  { label: 'Growth', value: 50, type: 'increase' as const },
  { label: 'Loss', value: -30, type: 'decrease' as const },
  { label: 'Total', value: 120, type: 'total' as const },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('WaterfallChart — happy path', () => {
  it('renders with data', () => {
    const el = WaterfallChart({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = WaterfallChart({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = WaterfallChart({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = WaterfallChart({ data: sampleData, title: 'Waterfall Test' });
    expect(el.props['aria-label']).toBe('Waterfall Test');
  });

  it('renders with custom colors', () => {
    const el = WaterfallChart({
      data: sampleData,
      increaseColor: '#00ff00',
      decreaseColor: '#ff0000',
      totalColor: '#0000ff',
    });
    expect(el).not.toBeNull();
  });

  it('renders with connectors shown (default)', () => {
    const el = WaterfallChart({ data: sampleData, showConnectors: true });
    expect(el).not.toBeNull();
  });

  it('renders with connectors hidden', () => {
    const el = WaterfallChart({ data: sampleData, showConnectors: false });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = WaterfallChart({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = WaterfallChart({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with auto-detected types (no explicit type)', () => {
    const data = [
      { label: 'Gain', value: 100 },
      { label: 'Loss', value: -30 },
    ];
    const el = WaterfallChart({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('WaterfallChart — sad path', () => {
  it('handles empty data array', () => {
    const el = WaterfallChart({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single item', () => {
    const el = WaterfallChart({ data: [{ label: 'Only', value: 100 }] });
    expect(el).not.toBeNull();
  });

  it('handles all-zero values', () => {
    const el = WaterfallChart({
      data: [
        { label: 'A', value: 0 },
        { label: 'B', value: 0 },
      ],
    });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = WaterfallChart({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('WaterfallChart — features', () => {
  it('renders rect elements for bars', () => {
    const el = WaterfallChart({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const rects = children.filter((c: any) => c && c.type === 'rect');
    expect(rects.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('uses default aria-label when no title provided', () => {
    const el = WaterfallChart({ data: sampleData });
    expect(el.props['aria-label']).toBeDefined();
  });
});
