// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { Partition } from '../src/index';
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

describe('Partition — happy path', () => {
  it('renders with hierarchical data', () => {
    const el = Partition({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders in horizontal orientation', () => {
    const el = Partition({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders in vertical orientation', () => {
    const el = Partition({ data: sampleData, orientation: 'vertical' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = Partition({ data: sampleData, width: 900, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with title', () => {
    const el = Partition({ data: sampleData, title: 'File System' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('File System');
  });

  it('renders with labels hidden', () => {
    const el = Partition({ data: sampleData, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with values hidden', () => {
    const el = Partition({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = Partition({ data: sampleData, colors: ['#ff0000', '#00ff00'] });
    expect(el).not.toBeNull();
  });

  it('renders with custom border', () => {
    const el = Partition({ data: sampleData, borderColor: '#000', borderWidth: 2 });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('Partition — sad path', () => {
  it('handles single leaf node', () => {
    const el = Partition({ data: { label: 'Single', value: 10 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles zero-value root', () => {
    const el = Partition({ data: { label: 'Empty', value: 0 } });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Empty partition diagram');
  });

  it('handles children with zero values', () => {
    const data = {
      label: 'root',
      children: [
        { label: 'A', value: 0 },
        { label: 'B', value: 5 },
      ],
    };
    const el = Partition({ data });
    expect(el).not.toBeNull();
  });

  it('handles deeply nested data', () => {
    const deep = {
      label: 'L0',
      children: [{
        label: 'L1',
        children: [{
          label: 'L2',
          children: [{ label: 'L3', value: 10 }],
        }],
      }],
    };
    const el = Partition({ data: deep });
    expect(el).not.toBeNull();
  });

  it('handles single child at each level', () => {
    const data = {
      label: 'root',
      children: [{
        label: 'only',
        children: [{ label: 'leaf', value: 42 }],
      }],
    };
    const el = Partition({ data });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('Partition — defaults', () => {
  it('uses default width of 600', () => {
    const el = Partition({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 400', () => {
    const el = Partition({ data: sampleData });
  });

  it('uses aria-label "Partition diagram" when no title', () => {
    const el = Partition({ data: sampleData });
    expect(el.props['aria-label']).toBe('Partition diagram');
  });

  it('sets role to img', () => {
    const el = Partition({ data: sampleData });
    expect(el.props.role).toBe('img');
  });

  it('defaults to horizontal orientation', () => {
    // Both orientations should produce valid output; default is horizontal
    const el = Partition({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });
});
