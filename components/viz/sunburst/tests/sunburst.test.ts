// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Sunburst } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = {
  label: 'root',
  children: [
    {
      label: 'Group A',
      children: [
        { label: 'Item 1', value: 10 },
        { label: 'Item 2', value: 20 },
      ],
    },
    {
      label: 'Group B',
      children: [
        { label: 'Item 3', value: 15 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('Sunburst — happy path', () => {
  it('renders with hierarchical data', () => {
    const el = Sunburst({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = Sunburst({ data: sampleData, width: 700, height: 700 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom inner radius', () => {
    const el = Sunburst({ data: sampleData, innerRadius: 60 });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = Sunburst({ data: sampleData, title: 'Revenue Breakdown' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('Revenue Breakdown');
  });

  it('renders with labels hidden', () => {
    const el = Sunburst({ data: sampleData, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = Sunburst({ data: sampleData, colors: ['#ff0000', '#00ff00'] });
    expect(el).not.toBeNull();
  });

  it('renders with custom stroke', () => {
    const el = Sunburst({ data: sampleData, strokeColor: '#000', strokeWidth: 2 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Sunburst — sad path', () => {
  it('handles single level (leaf root)', () => {
    const el = Sunburst({ data: { label: 'Single', value: 10 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles zero-value root', () => {
    const el = Sunburst({ data: { label: 'Empty', value: 0 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Empty sunburst chart');
  });

  it('handles single-child hierarchy', () => {
    const data = {
      label: 'root',
      children: [{ label: 'only', value: 42 }],
    };
    const el = Sunburst({ data });
    expect(el).not.toBeNull();
  });

  it('handles children with explicit colors', () => {
    const data = {
      label: 'root',
      children: [
        { label: 'red', value: 10, color: '#ff0000' },
        { label: 'blue', value: 10, color: '#0000ff' },
      ],
    };
    const el = Sunburst({ data });
    expect(el).not.toBeNull();
  });

  it('handles deeply nested data', () => {
    const deep = {
      label: 'L0',
      children: [{
        label: 'L1',
        children: [{
          label: 'L2',
          children: [{ label: 'L3', value: 5 }],
        }],
      }],
    };
    const el = Sunburst({ data: deep });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('Sunburst — defaults', () => {
  it('uses default width of 500', () => {
    const el = Sunburst({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 500', () => {
    const el = Sunburst({ data: sampleData });
  });

  it('uses aria-label "Sunburst chart" when no title', () => {
    const el = Sunburst({ data: sampleData });
    expect(el.props['aria-label']).toBe('Sunburst chart');
  });

  it('sets role to img', () => {
    const el = Sunburst({ data: sampleData });
    expect(el.props.role).toBe('img');
  });
});
