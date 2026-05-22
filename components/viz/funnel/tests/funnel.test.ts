// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { FunnelChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'Visits', value: 1000 },
  { label: 'Signups', value: 600 },
  { label: 'Trials', value: 300 },
  { label: 'Paid', value: 100 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('FunnelChart — happy path', () => {
  it('renders with data', () => {
    const el = FunnelChart({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders vertical orientation (default)', () => {
    const el = FunnelChart({ data: sampleData });
    expect(el).not.toBeNull();
  });

  it('renders horizontal orientation', () => {
    const el = FunnelChart({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
  });

  it('renders with default dimensions', () => {
    const el = FunnelChart({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = FunnelChart({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = FunnelChart({ data: sampleData, title: 'Funnel Test' });
    expect(el.props['aria-label']).toBe('Funnel Test');
  });

  it('renders with custom colors', () => {
    const el = FunnelChart({ data: sampleData, colors: ['#ff0000', '#00ff00', '#0000ff'] });
    expect(el).not.toBeNull();
  });

  it('renders with labels hidden', () => {
    const el = FunnelChart({ data: sampleData, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = FunnelChart({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with percentage hidden', () => {
    const el = FunnelChart({ data: sampleData, showPercentage: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom gap size', () => {
    const el = FunnelChart({ data: sampleData, gapSize: 6 });
    expect(el).not.toBeNull();
  });

  it('renders with per-datum colors', () => {
    const data = [
      { label: 'A', value: 100, color: '#ff0000' },
      { label: 'B', value: 50, color: '#00ff00' },
    ];
    const el = FunnelChart({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('FunnelChart — sad path', () => {
  it('handles empty data array', () => {
    const el = FunnelChart({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single item', () => {
    const el = FunnelChart({ data: [{ label: 'Only', value: 100 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const el = FunnelChart({ data: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = FunnelChart({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('FunnelChart — features', () => {
  it('renders polygon or path elements for sections', () => {
    const el = FunnelChart({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const shapes = children.filter(
      (c: any) => c && (c.type === 'polygon' || c.type === 'path' || c.type === 'rect'),
    );
    expect(shapes.length).toBeGreaterThan(0);
  });

  it('uses default aria-label when no title provided', () => {
    const el = FunnelChart({ data: sampleData });
    expect(el.props['aria-label']).toBeDefined();
  });
});
