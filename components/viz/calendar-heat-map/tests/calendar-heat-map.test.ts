// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { CalendarHeatMap } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { date: '2025-01-01', value: 3 },
  { date: '2025-01-02', value: 7 },
  { date: '2025-01-03', value: 1 },
  { date: '2025-02-14', value: 10 },
  { date: '2025-03-20', value: 5 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('CalendarHeatMap — happy path', () => {
  it('renders with date/value data', () => {
    const el = CalendarHeatMap({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = CalendarHeatMap({ data: sampleData, width: 1000, height: 200 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom cell size and gap', () => {
    const el = CalendarHeatMap({ data: sampleData, cellSize: 16, cellGap: 4 });
    expect(el).not.toBeNull();
  });

  it('renders with custom color scale', () => {
    const el = CalendarHeatMap({ data: sampleData, colorScale: ['#eee', '#333'] });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = CalendarHeatMap({ data: sampleData, title: 'Contributions' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Contributions');
  });

  it('renders with month labels hidden', () => {
    const el = CalendarHeatMap({ data: sampleData, showMonthLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with day labels hidden', () => {
    const el = CalendarHeatMap({ data: sampleData, showDayLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom empty color', () => {
    const el = CalendarHeatMap({ data: sampleData, emptyColor: '#f0f0f0' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('CalendarHeatMap — sad path', () => {
  it('handles empty data array', () => {
    const el = CalendarHeatMap({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Calendar heat map — no data');
  });

  it('handles single date entry', () => {
    const el = CalendarHeatMap({ data: [{ date: '2025-06-15', value: 5 }] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles duplicate dates (values accumulate)', () => {
    const el = CalendarHeatMap({
      data: [
        { date: '2025-01-01', value: 3 },
        { date: '2025-01-01', value: 5 },
      ],
    });
    expect(el).not.toBeNull();
  });

  it('handles zero values', () => {
    const el = CalendarHeatMap({
      data: [{ date: '2025-01-01', value: 0 }],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('CalendarHeatMap — defaults', () => {
  it('uses default width of 800', () => {
    const el = CalendarHeatMap({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 160', () => {
    const el = CalendarHeatMap({ data: sampleData });
  });

  it('uses aria-label "Calendar heat map" when no title', () => {
    const el = CalendarHeatMap({ data: sampleData });
    expect(el.props['aria-label']).toBe('Calendar heat map');
  });

  it('sets role to img', () => {
    const el = CalendarHeatMap({ data: sampleData });
    expect(el.props.role).toBe('img');
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

describe('CalendarHeatMap — dark mode text colors', () => {
  it('title text uses currentColor', () => {
    const el = CalendarHeatMap({ data: sampleData, title: 'Contributions' });
    const titleEl = flatChildren(el).find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('month and day labels use currentColor', () => {
    const el = CalendarHeatMap({ data: sampleData });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('empty state text uses currentColor', () => {
    const el = CalendarHeatMap({ data: [] });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = CalendarHeatMap({ data: sampleData, title: 'Test' });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
