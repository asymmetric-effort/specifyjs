// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DecompositionTree } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = {
  label: 'Revenue',
  value: 1000,
  children: [
    {
      label: 'Product A',
      value: 600,
      children: [
        { label: 'Region 1', value: 350 },
        { label: 'Region 2', value: 250 },
      ],
    },
    {
      label: 'Product B',
      value: 400,
      children: [
        { label: 'Region 1', value: 200 },
        { label: 'Region 2', value: 200 },
      ],
    },
  ],
};

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('DecompositionTree — happy path', () => {
  it('renders with hierarchical data', () => {
    const el = DecompositionTree({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = DecompositionTree({ data: sampleData, title: 'Revenue Breakdown' });
    expect(el).not.toBeNull();
  });

  it('renders horizontal orientation (default)', () => {
    const el = DecompositionTree({ data: sampleData, orientation: 'horizontal' });
    expect(el).not.toBeNull();
  });

  it('renders vertical orientation', () => {
    const el = DecompositionTree({ data: sampleData, orientation: 'vertical' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = DecompositionTree({ data: sampleData, width: 1000, height: 700 });
    expect(el).not.toBeNull();
  });

  it('renders with showValues disabled', () => {
    const el = DecompositionTree({ data: sampleData, showValues: false });
    expect(el).not.toBeNull();
  });

  it('renders with showConnectors disabled', () => {
    const el = DecompositionTree({ data: sampleData, showConnectors: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom node dimensions', () => {
    const el = DecompositionTree({ data: sampleData, nodeWidth: 150, nodeHeight: 50 });
    expect(el).not.toBeNull();
  });

  it('renders with custom connectorColor', () => {
    const el = DecompositionTree({ data: sampleData, connectorColor: '#ff0000' });
    expect(el).not.toBeNull();
  });

  it('renders with custom colors', () => {
    const el = DecompositionTree({
      data: sampleData,
      colors: ['#ff0000', '#00ff00', '#0000ff'],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('DecompositionTree — sad path', () => {
  it('handles null data', () => {
    const el = DecompositionTree({ data: null as any });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles leaf node with no children', () => {
    const el = DecompositionTree({ data: { label: 'Leaf', value: 42 } });
    expect(el).not.toBeNull();
  });

  it('handles node without value', () => {
    const el = DecompositionTree({ data: { label: 'NoValue' } });
    expect(el).not.toBeNull();
  });

  it('handles deep tree', () => {
    const deep = {
      label: 'L0',
      children: [{
        label: 'L1',
        children: [{
          label: 'L2',
          children: [{
            label: 'L3',
            value: 1,
          }],
        }],
      }],
    };
    const el = DecompositionTree({ data: deep });
    expect(el).not.toBeNull();
  });

  it('handles node with empty children array', () => {
    const el = DecompositionTree({ data: { label: 'Empty', children: [] } });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('DecompositionTree — defaults', () => {
  it('uses default width and height', () => {
    const el = DecompositionTree({ data: sampleData });
    expect(el.props.width).toBe('100%');
  });

  it('uses role="img"', () => {
    const el = DecompositionTree({ data: sampleData });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = DecompositionTree({ data: sampleData });
    expect(el.props['aria-label']).toBe('Decomposition tree');
  });

  it('uses title as aria-label when provided', () => {
    const el = DecompositionTree({ data: sampleData, title: 'Breakdown' });
    expect(el.props['aria-label']).toBe('Breakdown');
  });

  it('shows empty state aria-label for null data', () => {
    const el = DecompositionTree({ data: null as any });
    expect(el.props['aria-label']).toBe('Empty decomposition tree');
  });
});
