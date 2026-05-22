// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { ThreeDLayers } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleLayers = [
  {
    label: 'Layer A',
    data: [
      [1, 2, 3],
      [4, 5, 6],
      [7, 8, 9],
    ],
  },
  {
    label: 'Layer B',
    data: [
      [9, 8, 7],
      [6, 5, 4],
      [3, 2, 1],
    ],
  },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('ThreeDLayers — happy path', () => {
  it('renders with layer data', () => {
    const el = ThreeDLayers({ layers: sampleLayers });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with title', () => {
    const el = ThreeDLayers({ layers: sampleLayers, title: '3D View' });
    expect(el).not.toBeNull();
  });

  it('renders with custom dimensions', () => {
    const el = ThreeDLayers({ layers: sampleLayers, width: 900, height: 700 });
    expect(el).not.toBeNull();
  });

  it('renders with custom perspective', () => {
    const el = ThreeDLayers({ layers: sampleLayers, perspective: 0.8 });
    expect(el).not.toBeNull();
  });

  it('renders with custom rotation', () => {
    const el = ThreeDLayers({ layers: sampleLayers, rotateX: 45, rotateY: 30 });
    expect(el).not.toBeNull();
  });

  it('renders with showLabels disabled', () => {
    const el = ThreeDLayers({ layers: sampleLayers, showLabels: false });
    expect(el).not.toBeNull();
  });

  it('renders with showAxes disabled', () => {
    const el = ThreeDLayers({ layers: sampleLayers, showAxes: false });
    expect(el).not.toBeNull();
  });

  it('renders with custom layerSpacing', () => {
    const el = ThreeDLayers({ layers: sampleLayers, layerSpacing: 5 });
    expect(el).not.toBeNull();
  });

  it('renders with custom colorScale', () => {
    const el = ThreeDLayers({
      layers: sampleLayers,
      colorScale: ['#ff0000', '#00ff00'],
    });
    expect(el).not.toBeNull();
  });

  it('renders with custom gridColor', () => {
    const el = ThreeDLayers({ layers: sampleLayers, gridColor: '#cccccc' });
    expect(el).not.toBeNull();
  });

  it('renders with layer-specific color and opacity', () => {
    const layers = [
      { label: 'Custom', data: [[1, 2], [3, 4]], color: '#ff0000', opacity: 0.5 },
    ];
    const el = ThreeDLayers({ layers });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('ThreeDLayers — sad path', () => {
  it('handles empty layers array', () => {
    const el = ThreeDLayers({ layers: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles single layer with single point', () => {
    const el = ThreeDLayers({
      layers: [{ label: 'Point', data: [[5]] }],
    });
    expect(el).not.toBeNull();
  });

  it('handles single layer with single row', () => {
    const el = ThreeDLayers({
      layers: [{ label: 'Row', data: [[1, 2, 3]] }],
    });
    expect(el).not.toBeNull();
  });

  it('handles layer with all zeros', () => {
    const el = ThreeDLayers({
      layers: [{ label: 'Flat', data: [[0, 0], [0, 0]] }],
    });
    expect(el).not.toBeNull();
  });

  it('handles layer with negative values', () => {
    const el = ThreeDLayers({
      layers: [{ label: 'Neg', data: [[-1, -2], [-3, -4]] }],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('ThreeDLayers — defaults', () => {
  it('uses responsive width with viewBox', () => {
    const el = ThreeDLayers({ layers: sampleLayers });
    expect(el.props.width).toBe('100%');
    expect(el.props.viewBox).toBe('0 0 700 500');
  });

  it('uses role="img"', () => {
    const el = ThreeDLayers({ layers: sampleLayers });
    expect(el.props.role).toBe('img');
  });

  it('uses default aria-label when no title', () => {
    const el = ThreeDLayers({ layers: sampleLayers });
    expect(el.props['aria-label']).toBe('3D layer visualization');
  });

  it('uses title as aria-label when provided', () => {
    const el = ThreeDLayers({ layers: sampleLayers, title: 'Terrain' });
    expect(el.props['aria-label']).toBe('Terrain');
  });
});
