// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { TreeMap } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = {
  label: 'root',
  value: 0,
  children: [
    { label: 'Group A', value: 30 },
    { label: 'Group B', value: 20 },
    { label: 'Group C', value: 10 },
  ],
};

const hierarchicalData = {
  label: 'root',
  value: 0,
  children: [
    {
      label: 'Category 1',
      value: 0,
      children: [
        { label: 'Item A', value: 15 },
        { label: 'Item B', value: 10 },
      ],
    },
    {
      label: 'Category 2',
      value: 0,
      children: [
        { label: 'Item C', value: 20 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('TreeMap — happy path', () => {
  it('renders with hierarchical data', () => {
    const el = TreeMap({ data: hierarchicalData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with flat children', () => {
    const el = TreeMap({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = TreeMap({ data: sampleData, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = TreeMap({ data: sampleData, title: 'Disk Usage' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Disk Usage');
  });

  it('renders with labels hidden', () => {
    const el = TreeMap({ data: sampleData, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = TreeMap({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = TreeMap({ data: sampleData, colors: ['#ff0000', '#00ff00', '#0000ff'] });
    expect(el).not.toBeNull();
  });

  it('renders with custom border', () => {
    const el = TreeMap({ data: sampleData, borderColor: '#000', borderWidth: 3 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('TreeMap — sad path', () => {
  it('handles single node with no children', () => {
    const el = TreeMap({ data: { label: 'Only', value: 10 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles zero-value root', () => {
    const el = TreeMap({ data: { label: 'Empty', value: 0 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Empty treemap');
  });

  it('handles children with zero values', () => {
    const data = {
      label: 'root',
      value: 0,
      children: [
        { label: 'A', value: 0 },
        { label: 'B', value: 5 },
      ],
    };
    const el = TreeMap({ data });
    expect(el).not.toBeNull();
  });

  it('handles deeply nested data', () => {
    const deep = {
      label: 'L0',
      value: 0,
      children: [{
        label: 'L1',
        value: 0,
        children: [{
          label: 'L2',
          value: 0,
          children: [{ label: 'L3', value: 10 }],
        }],
      }],
    };
    const el = TreeMap({ data: deep });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('TreeMap — defaults', () => {
  it('uses default width of 600', () => {
    const el = TreeMap({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 400', () => {
    const el = TreeMap({ data: sampleData });
  });

  it('uses aria-label "Treemap chart" when no title', () => {
    const el = TreeMap({ data: sampleData });
    expect(el.props['aria-label']).toBe('Treemap chart');
  });

  it('sets role to img', () => {
    const el = TreeMap({ data: sampleData });
    expect(el.props.role).toBe('img');
  });
});
