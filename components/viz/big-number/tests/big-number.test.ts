// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
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
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = BigNumber({ value: 100, width: 400, height: 200 });
    expect(el.props.width).toBe('100%');
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

// ---------------------------------------------------------------------------
// Dark mode text color tests
// ---------------------------------------------------------------------------

const DARK_ONLY_FILLS = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563'];

function flatChildren(el: any): any[] {
  const c = el?.props?.children;
  if (Array.isArray(c)) return c.flat(Infinity).filter(Boolean);
  return c ? [c] : [];
}

function collectTextFills(root: any): { key: string; fill: string }[] {
  const results: { key: string; fill: string }[] = [];
  const stack: any[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'text' && node.props?.fill) {
      results.push({ key: node.key ?? '(unknown)', fill: node.props.fill });
    }
    const children = node.children ?? node.props?.children;
    if (Array.isArray(children)) {
      for (const child of children) stack.push(child);
    } else if (children) {
      stack.push(children);
    }
  }
  return results;
}

describe('BigNumber — dark mode text colors', () => {
  it('default valueColor is currentColor', () => {
    const el = BigNumber({ value: 42000 });
    const valueText = flatChildren(el).find((c: any) => c?.key === 'value');
    expect(valueText).toBeTruthy();
    expect(valueText.props.fill).toBe('currentColor');
  });

  it('label text uses currentColor with opacity', () => {
    const el = BigNumber({ value: 42000, label: 'Revenue' });
    const labelEl = flatChildren(el).find((c: any) => c?.key === 'label');
    expect(labelEl).toBeTruthy();
    expect(labelEl.props.fill).toBe('currentColor');
    expect(labelEl.props.opacity).toBe('0.6');
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = BigNumber({
      value: 42000,
      label: 'Revenue',
      prefix: '$',
      trend: 12.5,
      trendLabel: 'vs last week',
      sparkline: [10, 20, 30],
    });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
