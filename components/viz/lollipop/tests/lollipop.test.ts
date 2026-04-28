// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { LollipopChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'A', value: 30 },
  { label: 'B', value: 50 },
  { label: 'C', value: 20 },
  { label: 'D', value: 45 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('LollipopChart — happy path', () => {
  it('renders with data', () => {
    const el = LollipopChart({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders vertical orientation (default)', () => {
    const el = LollipopChart({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders horizontal orientation', () => {
    const el = LollipopChart({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
  });

  it('renders with default dimensions', () => {
    const el = LollipopChart({ data: sampleData });
    expect(el.props.width).toBe('600');
    expect(el.props.height).toBe('400');
  });

  it('renders with custom dimensions', () => {
    const el = LollipopChart({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('800');
    expect(el.props.height).toBe('500');
  });

  it('renders with title', () => {
    const el = LollipopChart({ data: sampleData, title: 'Lollipop Test' });
    expect(el.props['aria-label']).toBe('Lollipop Test');
  });

  it('renders with custom stem color', () => {
    const el = LollipopChart({ data: sampleData, stemColor: '#000000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dot color and radius', () => {
    const el = LollipopChart({ data: sampleData, dotColor: '#ff0000', dotRadius: 10 });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = LollipopChart({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = LollipopChart({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with per-datum colors', () => {
    const data = [
      { label: 'A', value: 30, color: '#ff0000' },
      { label: 'B', value: 50, color: '#00ff00' },
    ];
    const el = LollipopChart({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('LollipopChart — sad path', () => {
  it('handles empty data array', () => {
    const el = LollipopChart({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single data point', () => {
    const el = LollipopChart({ data: [{ label: 'Only', value: 100 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const el = LollipopChart({ data: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = LollipopChart({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('LollipopChart — features', () => {
  it('renders circle elements for dots', () => {
    const el = LollipopChart({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const circles = children.filter((c: any) => c && c.type === 'circle');
    expect(circles.length).toBe(sampleData.length);
  });

  it('renders line elements for stems', () => {
    const el = LollipopChart({ data: sampleData });
    const children = Array.isArray(el.props.children) ? el.props.children.flat() : [el.props.children];
    const lines = children.filter(
      (c: any) => c && c.type === 'line',
    );
    // At minimum there should be axis lines + stem lines
    expect(lines.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('uses default aria-label when no title provided', () => {
    const el = LollipopChart({ data: sampleData });
    expect(el.props['aria-label']).toBe('Lollipop chart');
  });
});
