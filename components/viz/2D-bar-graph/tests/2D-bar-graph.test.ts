// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BarGraph } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { label: 'A', value: 30 },
  { label: 'B', value: 50 },
  { label: 'C', value: 20 },
  { label: 'D', value: 45 },
];

const stackedData = [
  { label: 'Q1', values: [{ category: 'Sales', value: 30 }, { category: 'Cost', value: 20 }] },
  { label: 'Q2', values: [{ category: 'Sales', value: 45 }, { category: 'Cost', value: 25 }] },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('BarGraph — happy path', () => {
  it('renders with data', () => {
    const el = BarGraph({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders vertical orientation (default)', () => {
    const el = BarGraph({ data: sampleData, orientation: 'vertical' });
    expect(el).not.toBeNull();
  });

  it('renders horizontal orientation', () => {
    const el = BarGraph({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
  });

  it('renders with custom bar color', () => {
    const el = BarGraph({ data: sampleData, barColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = BarGraph({ data: sampleData, title: 'Sales Data' });
    expect(el).not.toBeNull();
  });

  it('renders with animation', () => {
    const el = BarGraph({ data: sampleData, animate: true });
    expect(el).not.toBeNull();
  });

  it('renders stacked bars', () => {
    const el = BarGraph({ data: [], stacked: stackedData });
    expect(el).not.toBeNull();
  });

  it('renders grouped bars', () => {
    const el = BarGraph({ data: [], stacked: stackedData, grouped: true });
    expect(el).not.toBeNull();
  });

  it('renders with grid hidden', () => {
    const el = BarGraph({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = BarGraph({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('BarGraph — sad path', () => {
  it('handles empty data array', () => {
    const el = BarGraph({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single bar', () => {
    const el = BarGraph({ data: [{ label: 'X', value: 100 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const el = BarGraph({ data: [{ label: 'A', value: 0 }, { label: 'B', value: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles negative values', () => {
    const el = BarGraph({ data: [{ label: 'A', value: -10 }] });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = BarGraph({ data: sampleData, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('BarGraph — features', () => {
  it('renders rect elements for bars', () => {
    const el = BarGraph({ data: sampleData });
    const rects = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'rect');
    expect(rects.length).toBeGreaterThanOrEqual(sampleData.length);
  });

  it('renders value labels when showValues is true', () => {
    const el = BarGraph({ data: sampleData, showValues: true });
    const texts = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter((c: any) => c && c.type === 'text');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('renders grid lines when showGrid is true', () => {
    const el = BarGraph({ data: sampleData, showGrid: true });
    const dashed = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter(
      (c: any) => c && c.type === 'line' && c.props['stroke-dasharray'],
    );
    expect(dashed.length).toBeGreaterThan(0);
  });

  it('renders category labels', () => {
    const el = BarGraph({ data: sampleData });
    const texts = (Array.isArray(el.props.children) ? el.props.children : [el.props.children]).filter(
      (c: any) => c && c.type === 'text' && sampleData.some((d) => {
        const ch = c.props?.children;
        return Array.isArray(ch) ? ch.includes(d.label) : ch === d.label;
      }),
    );
    expect(texts.length).toBe(sampleData.length);
  });
});
