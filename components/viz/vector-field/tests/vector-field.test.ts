// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VectorField } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleData = [
  { x: 0, y: 0, dx: 1, dy: 0 },
  { x: 1, y: 0, dx: 0, dy: 1 },
  { x: 0, y: 1, dx: -1, dy: 0 },
  { x: 1, y: 1, dx: 0, dy: -1 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('VectorField — happy path', () => {
  it('renders with data array', () => {
    const el = VectorField({ data: sampleData });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with vectorFunction', () => {
    const el = VectorField({
      vectorFunction: (x, y) => ({ dx: -y, dy: x }),
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = VectorField({ data: sampleData, title: 'Flow Field' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = VectorField({ data: sampleData, width: 800, height: 800 });
    expect(el).not.toBeNull();
  });

  it('renders with custom gridSize', () => {
    const el = VectorField({
      vectorFunction: (x, y) => ({ dx: x, dy: y }),
      gridSize: 10,
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom ranges', () => {
    const el = VectorField({
      data: sampleData,
      xRange: [-10, 10],
      yRange: [-10, 10],
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom arrowScale', () => {
    const el = VectorField({ data: sampleData, arrowScale: 2 });
    expect(el).not.toBeNull();
  });

  it('renders with colorByMagnitude enabled', () => {
    const el = VectorField({ data: sampleData, colorByMagnitude: true });
    expect(el).not.toBeNull();
  });

  it('renders with custom colorScale', () => {
    const el = VectorField({
      data: sampleData,
      colorByMagnitude: true,
      colorScale: ['#00f', '#f00'],
    });
    expect(el).not.toBeNull();
  });

  it('renders with showGrid disabled', () => {
    const el = VectorField({ data: sampleData, showGrid: false });
    expect(el).not.toBeNull();
  });

  it('renders with showAxes disabled', () => {
    const el = VectorField({ data: sampleData, showAxes: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom arrowColor', () => {
    const el = VectorField({ data: sampleData, arrowColor: '#ff0000' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('VectorField — sad path', () => {
  it('handles no data and no vectorFunction', () => {
    const el = VectorField({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles empty data array', () => {
    const el = VectorField({ data: [] });
    expect(el).not.toBeNull();
  });

  it('handles zero-magnitude vectors', () => {
    const el = VectorField({
      data: [{ x: 0, y: 0, dx: 0, dy: 0 }],
    });
    expect(el).not.toBeNull();
  });

  it('handles single vector', () => {
    const el = VectorField({
      data: [{ x: 0, y: 0, dx: 1, dy: 1 }],
    });
    expect(el).not.toBeNull();
  });

  it('handles vectorFunction returning zero vectors', () => {
    const el = VectorField({
      vectorFunction: () => ({ dx: 0, dy: 0 }),
      gridSize: 3,
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('VectorField — defaults', () => {
  it('uses default width and height', () => {
    const el = VectorField({ data: sampleData });
    expect(el.props.width).toBe('600');
    expect(el.props.height).toBe('600');
  });

  it('uses role="img"', () => {
    const el = VectorField({ data: sampleData });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = VectorField({ data: sampleData });
    expect(el.props['aria-label']).toBe('Vector field plot');
  });

  it('uses title as aria-label when provided', () => {
    const el = VectorField({ data: sampleData, title: 'Magnetic Field' });
    expect(el.props['aria-label']).toBe('Magnetic Field');
  });
});
