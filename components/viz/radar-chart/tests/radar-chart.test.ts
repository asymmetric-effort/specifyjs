// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { RadarChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleAxes = [
  { label: 'Speed' },
  { label: 'Power' },
  { label: 'Handling' },
  { label: 'Durability' },
  { label: 'Comfort' },
];

const sampleSeries = [
  { label: 'Car A', values: [80, 90, 70, 60, 85], color: '#3b82f6' },
  { label: 'Car B', values: [60, 70, 90, 80, 65], color: '#ef4444' },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('RadarChart — happy path', () => {
  it('renders with axes and series', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with default dimensions', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom dimensions', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, width: 800, height: 800 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, title: 'Radar Test' });
    expect(el.props['aria-label']).toBe('Radar Test');
  });

  it('renders with custom levels', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, levels: 10 });
    expect(el).not.toBeNull();
  });

  it('renders with labels hidden', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with values shown', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showValues: true });
    expect(el).not.toBeNull();
  });

  it('renders with legend hidden', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showLegend: false });
    expect(el).not.toBeNull();
  });

  it('renders with dots hidden', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showDots: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom grid color', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, gridColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with axes that have custom max values', () => {
    const axes = [
      { label: 'Speed', max: 100 },
      { label: 'Power', max: 200 },
      { label: 'Handling', max: 150 },
    ];
    const series = [{ label: 'Test', values: [80, 150, 100], color: '#3b82f6' }];
    const el = RadarChart({ axes, series });
    expect(el).not.toBeNull();
  });

  it('renders with custom fill opacity', () => {
    const series = [
      { label: 'Test', values: [80, 90, 70, 60, 85], color: '#3b82f6', fillOpacity: 0.3 },
    ];
    const el = RadarChart({ axes: sampleAxes, series });
    expect(el).not.toBeNull();
  });

  it('renders single series', () => {
    const el = RadarChart({ axes: sampleAxes, series: [sampleSeries[0]!] });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('RadarChart — sad path', () => {
  it('handles empty series', () => {
    const el = RadarChart({ axes: sampleAxes, series: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles empty axes', () => {
    const el = RadarChart({ axes: [], series: sampleSeries });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles both axes and series empty', () => {
    const el = RadarChart({ axes: [], series: [] });
    expect(el).not.toBeNull();
  });

  it('handles three axes (minimum polygon)', () => {
    const axes = [{ label: 'A' }, { label: 'B' }, { label: 'C' }];
    const series = [{ label: 'Test', values: [50, 60, 70], color: '#3b82f6' }];
    const el = RadarChart({ axes, series });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const series = [{ label: 'Zero', values: [0, 0, 0, 0, 0], color: '#3b82f6' }];
    const el = RadarChart({ axes: sampleAxes, series });
    expect(el).not.toBeNull();
  });

  it('handles zero dimensions', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, width: 0, height: 0 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Feature tests
// ---------------------------------------------------------------------------

describe('RadarChart — features', () => {
  it('renders polygon or path elements for series', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const shapes = children.filter(
      (c: any) => c && (c.type === 'polygon' || c.type === 'path'),
    );
    expect(shapes.length).toBeGreaterThan(0);
  });

  it('renders axis labels when showLabels is true', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showLabels: true });
    const children = Array.isArray(el.props.children) ? el.props.children : [el.props.children];
    const texts = children.filter((c: any) => c && c.type === 'text');
    expect(texts.length).toBeGreaterThan(0);
  });

  it('uses default aria-label when no title provided', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries });
    expect(el.props['aria-label']).toBeDefined();
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

describe('RadarChart — dark mode text colors', () => {
  it('title text uses currentColor', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, title: 'Skills' });
    const titleEl = flatChildren(el).find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('axis labels use currentColor', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showLabels: true });
    const labels = flatChildren(el).filter(
      (c: any) => c?.key?.startsWith('label-'),
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.props.fill).toBe('currentColor');
    }
  });

  it('legend text uses currentColor', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, showLegend: true });
    const legendTexts = flatChildren(el).filter(
      (c: any) => c?.key?.startsWith('legend-text-'),
    );
    expect(legendTexts.length).toBeGreaterThan(0);
    for (const lt of legendTexts) {
      expect(lt.props.fill).toBe('currentColor');
    }
  });

  it('empty state text does not use hardcoded dark fill', () => {
    const el = RadarChart({ axes: [], series: [] });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = RadarChart({ axes: sampleAxes, series: sampleSeries, title: 'Test', showLabels: true, showLegend: true });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
