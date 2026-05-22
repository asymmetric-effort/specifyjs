// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Gauge } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Gauge — happy path', () => {
  it('renders with value', () => {
    const el = Gauge({ value: 50 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with value, min, max', () => {
    const el = Gauge({ value: 75, min: 0, max: 100 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = Gauge({ value: 50 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = Gauge({ value: 50, width: 400, height: 300 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom colors array', () => {
    const el = Gauge({ value: 50, colors: ['#00ff00', '#ffff00', '#ff0000'] });
    expect(el).not.toBeNull();
  });

  it('renders with single color', () => {
    const el = Gauge({ value: 50, colors: ['#3b82f6'] });
    expect(el).not.toBeNull();
  });

  it('renders with label', () => {
    const el = Gauge({ value: 75, label: 'Speed' });
    expect(el).not.toBeNull();
  });

  it('renders with unit', () => {
    const el = Gauge({ value: 75, unit: 'rpm' });
    expect(el).not.toBeNull();
  });

  it('renders with label and unit', () => {
    const el = Gauge({ value: 75, label: 'Speed', unit: 'mph' });
    expect(el).not.toBeNull();
  });

  it('renders with custom arc width', () => {
    const el = Gauge({ value: 50, arcWidth: 30 });
    expect(el).not.toBeNull();
  });

  it('renders with custom angles', () => {
    const el = Gauge({ value: 50, startAngle: -180, endAngle: 0 });
    expect(el).not.toBeNull();
  });

  it('renders with value hidden', () => {
    const el = Gauge({ value: 50, showValue: false });
    expect(el).not.toBeNull();
  });

  it('renders with min/max labels hidden', () => {
    const el = Gauge({ value: 50, showMinMax: false });
    expect(el).not.toBeNull();
  });

  it('renders with ticks hidden', () => {
    const el = Gauge({ value: 50, showTicks: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom tick count', () => {
    const el = Gauge({ value: 50, tickCount: 20 });
    expect(el).not.toBeNull();
  });

  it('renders with custom needle color', () => {
    const el = Gauge({ value: 50, needleColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom background color', () => {
    const el = Gauge({ value: 50, backgroundColor: '#f0f0f0' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Gauge — sad path', () => {
  it('handles value at minimum', () => {
    const el = Gauge({ value: 0, min: 0, max: 100 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles value at maximum', () => {
    const el = Gauge({ value: 100, min: 0, max: 100 });
    expect(el).not.toBeNull();
  });

  it('handles value below minimum', () => {
    const el = Gauge({ value: -10, min: 0, max: 100 });
    expect(el).not.toBeNull();
  });

  it('handles value above maximum', () => {
    const el = Gauge({ value: 150, min: 0, max: 100 });
    expect(el).not.toBeNull();
  });

  it('handles equal min and max', () => {
    const el = Gauge({ value: 50, min: 50, max: 50 });
    expect(el).not.toBeNull();
  });

  it('handles negative range', () => {
    const el = Gauge({ value: -50, min: -100, max: 0 });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = Gauge({ value: 50, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('Gauge — features', () => {
  it('renders path elements for arcs', () => {
    const el = Gauge({ value: 50 });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const paths = children.filter((c: any) => c && c.type === 'path');
    expect(paths.length).toBeGreaterThan(0);
  });

  it('renders polygon elements (including needle)', () => {
    const el = Gauge({ value: 50 });
    // Children includes rest args which may contain nested arrays
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    // Flatten one level and check for polygon type elements
    const allChildren = children.reduce((acc: any[], c: any) => {
      if (Array.isArray(c)) return acc.concat(c);
      if (c) acc.push(c);
      return acc;
    }, []);
    const polygons = allChildren.filter((c: any) => c && c.type === 'polygon');
    expect(polygons.length).toBeGreaterThan(0);
  });

  it('renders text for value display when showValue is true', () => {
    const el = Gauge({ value: 50, showValue: true });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const texts = children.filter((c: any) => c && c.type === 'text');
    expect(texts.length).toBeGreaterThan(0);
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
const DARK_ONLY_STROKES = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563', '#9ca3af'];

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

function collectLineStrokes(root: any): { key: string; stroke: string }[] {
  const results: { key: string; stroke: string }[] = [];
  const stack: any[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'line' && node.props?.stroke) {
      results.push({ key: node.key ?? '(unknown)', stroke: node.props.stroke });
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

describe('Gauge — dark mode text colors', () => {
  it('value and label text use currentColor', () => {
    const el = Gauge({ value: 75, label: 'Speed', unit: 'mph', showValue: true });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('tick mark lines use currentColor instead of hardcoded gray', () => {
    const el = Gauge({ value: 50, showTicks: true });
    const strokes = collectLineStrokes(el);
    for (const entry of strokes) {
      expect(DARK_ONLY_STROKES).not.toContain(entry.stroke);
    }
  });

  it('min/max labels use currentColor', () => {
    const el = Gauge({ value: 50, showMinMax: true });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
