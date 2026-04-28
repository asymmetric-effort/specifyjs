// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { BigNumber } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('BigNumber — happy path', () => {
  it('renders with numeric value', () => {
    const el = BigNumber({ value: 42000 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with string value', () => {
    const el = BigNumber({ value: 'N/A' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = BigNumber({ value: 100 });
    expect(el.props.width).toBe('280');
    expect(el.props.height).toBe('160');
  });

  it('renders with custom dimensions', () => {
    const el = BigNumber({ value: 100, width: 400, height: 200 });
    expect(el.props.width).toBe('400');
    expect(el.props.height).toBe('200');
  });

  it('renders with label', () => {
    const el = BigNumber({ value: 42000, label: 'Total Sales' });
    expect(el).not.toBeNull();
  });

  it('renders with prefix and suffix', () => {
    const el = BigNumber({ value: 42000, prefix: '$', suffix: 'USD' });
    expect(el).not.toBeNull();
  });

  it('renders with positive trend', () => {
    const el = BigNumber({ value: 42000, trend: 12.5 });
    expect(el).not.toBeNull();
  });

  it('renders with negative trend', () => {
    const el = BigNumber({ value: 42000, trend: -8.3 });
    expect(el).not.toBeNull();
  });

  it('renders with trend label', () => {
    const el = BigNumber({ value: 42000, trend: 5, trendLabel: 'vs last week' });
    expect(el).not.toBeNull();
  });

  it('renders with sparkline data', () => {
    const el = BigNumber({ value: 42000, sparkline: [10, 20, 15, 25, 30, 28, 35] });
    expect(el).not.toBeNull();
  });

  it('renders with trend and sparkline together', () => {
    const el = BigNumber({
      value: 42000,
      trend: 12.5,
      trendLabel: 'vs last month',
      sparkline: [10, 20, 15, 25, 30, 28, 35],
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom value color', () => {
    const el = BigNumber({ value: 42000, valueColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom trend colors', () => {
    const el = BigNumber({
      value: 42000,
      trend: 5,
      trendUpColor: '#00ff00',
      trendDownColor: '#ff0000',
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom background color', () => {
    const el = BigNumber({ value: 42000, backgroundColor: '#f0f0f0' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('BigNumber — sad path', () => {
  it('handles zero value', () => {
    const el = BigNumber({ value: 0 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles negative value', () => {
    const el = BigNumber({ value: -12345 });
    expect(el).not.toBeNull();
  });

  it('handles NaN value', () => {
    const el = BigNumber({ value: NaN });
    expect(el).not.toBeNull();
  });

  it('handles Infinity value', () => {
    const el = BigNumber({ value: Infinity });
    expect(el).not.toBeNull();
  });

  it('handles zero trend', () => {
    const el = BigNumber({ value: 100, trend: 0 });
    expect(el).not.toBeNull();
  });

  it('handles empty sparkline', () => {
    const el = BigNumber({ value: 100, sparkline: [] });
    expect(el).not.toBeNull();
  });

  it('handles single sparkline point', () => {
    const el = BigNumber({ value: 100, sparkline: [42] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('BigNumber — features', () => {
  it('renders text elements for value display', () => {
    const el = BigNumber({ value: 42000 });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const texts = children.filter((c: any) => c && c.type === 'text');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('renders path or polyline for sparkline', () => {
    const el = BigNumber({ value: 100, sparkline: [10, 20, 15, 25, 30] });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const paths = children.filter(
      (c: any) => c && (c.type === 'path' || c.type === 'polyline'),
    );
    expect(paths.length).toBeGreaterThan(0);
  });
});
