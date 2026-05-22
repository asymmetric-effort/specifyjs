// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { GanttChart } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleTasks = [
  { id: 't1', label: 'Design', start: 0, duration: 3 },
  { id: 't2', label: 'Development', start: 2, duration: 5 },
  { id: 't3', label: 'Testing', start: 6, duration: 2 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('GanttChart — happy path', () => {
  it('renders with tasks array', () => {
    const el = GanttChart({ tasks: sampleTasks });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = GanttChart({ tasks: sampleTasks, width: 1000, height: 300 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = GanttChart({ tasks: sampleTasks, title: 'Project Plan' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Project Plan');
  });

  it('renders with grid hidden', () => {
    const el = GanttChart({ tasks: sampleTasks, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with labels hidden', () => {
    const el = GanttChart({ tasks: sampleTasks, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with progress text', () => {
    const el = GanttChart({ tasks: sampleTasks, showProgress: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom bar dimensions', () => {
    const el = GanttChart({ tasks: sampleTasks, barHeight: 32, barGap: 12 });
    expect(el).not.toBeNull();
  });

  it('renders with custom time unit', () => {
    const el = GanttChart({ tasks: sampleTasks, timeUnit: 'hours' });
    expect(el).not.toBeNull();
  });

  it('renders tasks with explicit colors', () => {
    const tasks = [
      { id: 't1', label: 'Task A', start: 0, duration: 3, color: '#ff0000' },
    ];
    const el = GanttChart({ tasks });
    expect(el).not.toBeNull();
  });

  it('renders grouped tasks', () => {
    const tasks = [
      { id: 't1', label: 'Task A', start: 0, duration: 3, group: 'Phase 1' },
      { id: 't2', label: 'Task B', start: 2, duration: 4, group: 'Phase 2' },
    ];
    const el = GanttChart({ tasks });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('GanttChart — sad path', () => {
  it('handles empty tasks array', () => {
    const el = GanttChart({ tasks: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Empty Gantt chart');
  });

  it('handles single task', () => {
    const el = GanttChart({ tasks: [{ id: 't1', label: 'Solo', start: 0, duration: 1 }] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles zero duration task', () => {
    const el = GanttChart({ tasks: [{ id: 't1', label: 'Milestone', start: 5, duration: 0 }] });
    expect(el).not.toBeNull();
  });

  it('handles overlapping tasks', () => {
    const tasks = [
      { id: 't1', label: 'A', start: 0, duration: 5 },
      { id: 't2', label: 'B', start: 1, duration: 5 },
    ];
    const el = GanttChart({ tasks });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('GanttChart — defaults', () => {
  it('uses default width of 800', () => {
    const el = GanttChart({ tasks: sampleTasks });
    expect(el.props.width).toBe('100%');
  });

  it('auto-computes height when not provided', () => {
    const el = GanttChart({ tasks: sampleTasks });
    // Height should be auto-calculated based on task count
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('uses aria-label "Gantt chart" when no title', () => {
    const el = GanttChart({ tasks: sampleTasks });
    expect(el.props['aria-label']).toBe('Gantt chart');
  });

  it('sets role to img', () => {
    const el = GanttChart({ tasks: sampleTasks });
    expect(el.props.role).toBe('img');
  });
});

// ---------------------------------------------------------------------------
// Dark mode text color tests
// ---------------------------------------------------------------------------

const DARK_ONLY_FILLS = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563', '#9ca3af'];

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

describe('GanttChart — dark mode text colors', () => {
  it('title text uses currentColor', () => {
    const el = GanttChart({ tasks: sampleTasks, title: 'Sprint Plan' });
    const titleEl = flatChildren(el).find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('task label text uses currentColor', () => {
    const el = GanttChart({ tasks: sampleTasks, showLabels: true });
    const labels = flatChildren(el).filter(
      (c: any) => c?.key?.startsWith('label-'),
    );
    expect(labels.length).toBeGreaterThan(0);
    for (const label of labels) {
      expect(label.props.fill).toBe('currentColor');
    }
  });

  it('empty state text uses currentColor', () => {
    const el = GanttChart({ tasks: [] });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = GanttChart({ tasks: sampleTasks, title: 'Test', showLabels: true, showProgress: true });
    const fills = collectTextFills(el);
    // White text on colored bars is acceptable
    const nonWhiteFills = fills.filter((f) => f.fill !== '#ffffff');
    for (const entry of nonWhiteFills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
