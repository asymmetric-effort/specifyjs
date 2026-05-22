// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { VectorField } from '../src/index';
import type { ComputeWorkerFn } from '../src/index';
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
    expect(el.props.width).toBe('100%');
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

// ---------------------------------------------------------------------------
// Canvas rendering mode tests
// ---------------------------------------------------------------------------

describe('VectorField — canvas renderer', () => {
  it('renders a canvas element when renderer is canvas', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('canvas element has correct width and height', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas', width: 800, height: 600 });
    expect(el.props.width).toBe(800);
    expect(el.props.height).toBe(600);
  });

  it('canvas element has role="img"', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas' });
    expect(el.props.role).toBe('img');
  });

  it('canvas element uses default aria-label when no title', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas' });
    expect(el.props['aria-label']).toBe('Vector field plot');
  });

  it('canvas element uses title as aria-label when provided', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas', title: 'Wave Field' });
    expect(el.props['aria-label']).toBe('Wave Field');
  });

  it('canvas element has ref or ref is extracted by createElement', () => {
    const el = VectorField({ data: sampleData, renderer: 'canvas' });
    // ref may be stored on props or extracted by createElement into el.ref
    const hasRef = el.props.ref !== undefined || el.ref !== undefined;
    expect(hasRef).toBe(true);
  });

  it('renders canvas with vectorFunction', () => {
    const el = VectorField({
      vectorFunction: (x, y) => ({ dx: -y, dy: x }),
      renderer: 'canvas',
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('renders canvas with empty data', () => {
    const el = VectorField({ data: [], renderer: 'canvas' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('renders canvas with colorByMagnitude', () => {
    const el = VectorField({
      data: sampleData,
      renderer: 'canvas',
      colorByMagnitude: true,
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('renders canvas with showGrid disabled', () => {
    const el = VectorField({
      data: sampleData,
      renderer: 'canvas',
      showGrid: false,
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('renders canvas with showAxes disabled', () => {
    const el = VectorField({
      data: sampleData,
      renderer: 'canvas',
      showAxes: false,
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });
});

// ---------------------------------------------------------------------------
// SVG renderer prop tests (backwards compatibility)
// ---------------------------------------------------------------------------

describe('VectorField — renderer prop', () => {
  it('defaults to svg renderer', () => {
    const el = VectorField({ data: sampleData });
    expect(el.type).toBe('svg');
  });

  it('explicitly uses svg renderer', () => {
    const el = VectorField({ data: sampleData, renderer: 'svg' });
    expect(el.type).toBe('svg');
  });
});

// ---------------------------------------------------------------------------
// computeWorker prop tests
// ---------------------------------------------------------------------------

describe('VectorField — computeWorker', () => {
  it('uses computeWorker to generate vector data', () => {
    const worker: ComputeWorkerFn = (gridPoints, _uniforms) => {
      return gridPoints.map((pt) => ({ dx: pt.x * 0.5, dy: pt.y * 0.5 }));
    };
    const el = VectorField({ computeWorker: worker, gridSize: 3 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('computeWorker receives correct uniforms', () => {
    let capturedUniforms: Record<string, number> = {};
    const worker: ComputeWorkerFn = (gridPoints, uniforms) => {
      capturedUniforms = uniforms;
      return gridPoints.map(() => ({ dx: 1, dy: 0 }));
    };
    VectorField({
      computeWorker: worker,
      gridSize: 5,
      xRange: [-2, 2],
      yRange: [-3, 3],
    });
    expect(capturedUniforms.gridSize).toBe(5);
    expect(capturedUniforms.xMin).toBe(-2);
    expect(capturedUniforms.xMax).toBe(2);
    expect(capturedUniforms.yMin).toBe(-3);
    expect(capturedUniforms.yMax).toBe(3);
  });

  it('computeWorker receives correct grid points count', () => {
    let capturedPointCount = 0;
    const worker: ComputeWorkerFn = (gridPoints, _uniforms) => {
      capturedPointCount = gridPoints.length;
      return gridPoints.map(() => ({ dx: 0, dy: 0 }));
    };
    VectorField({ computeWorker: worker, gridSize: 4 });
    expect(capturedPointCount).toBe(16); // 4 * 4
  });

  it('computeWorker works with canvas renderer', () => {
    const worker: ComputeWorkerFn = (gridPoints) => {
      return gridPoints.map(() => ({ dx: 1, dy: 1 }));
    };
    const el = VectorField({
      computeWorker: worker,
      renderer: 'canvas',
      gridSize: 3,
    });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });

  it('data prop takes priority over computeWorker', () => {
    let workerCalled = false;
    const worker: ComputeWorkerFn = (gridPoints) => {
      workerCalled = true;
      return gridPoints.map(() => ({ dx: 1, dy: 1 }));
    };
    const el = VectorField({
      data: sampleData,
      computeWorker: worker,
    });
    expect(el).not.toBeNull();
    expect(workerCalled).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// gridSize clamping tests
// ---------------------------------------------------------------------------

describe('VectorField — gridSize clamping', () => {
  it('clamps gridSize to max 50', () => {
    let capturedPointCount = 0;
    const worker: ComputeWorkerFn = (gridPoints) => {
      capturedPointCount = gridPoints.length;
      return gridPoints.map(() => ({ dx: 0, dy: 0 }));
    };
    VectorField({ computeWorker: worker, gridSize: 100 });
    expect(capturedPointCount).toBe(2500); // 50 * 50
  });

  it('clamps gridSize to min 2', () => {
    let capturedPointCount = 0;
    const worker: ComputeWorkerFn = (gridPoints) => {
      capturedPointCount = gridPoints.length;
      return gridPoints.map(() => ({ dx: 0, dy: 0 }));
    };
    VectorField({ computeWorker: worker, gridSize: 0 });
    expect(capturedPointCount).toBe(4); // 2 * 2
  });

  it('clamps negative gridSize to min 2', () => {
    let capturedPointCount = 0;
    const worker: ComputeWorkerFn = (gridPoints) => {
      capturedPointCount = gridPoints.length;
      return gridPoints.map(() => ({ dx: 0, dy: 0 }));
    };
    VectorField({ computeWorker: worker, gridSize: -5 });
    expect(capturedPointCount).toBe(4); // 2 * 2
  });
});

// ---------------------------------------------------------------------------
// useGPU prop tests
// ---------------------------------------------------------------------------

describe('VectorField — useGPU prop', () => {
  it('accepts useGPU prop without error', () => {
    const el = VectorField({ data: sampleData, useGPU: true });
    expect(el).not.toBeNull();
  });

  it('useGPU with canvas renderer works', () => {
    const el = VectorField({ data: sampleData, useGPU: true, renderer: 'canvas' });
    expect(el).not.toBeNull();
    expect(el.type).toBe('canvas');
  });
});

// ---------------------------------------------------------------------------
// Type export tests
// ---------------------------------------------------------------------------

describe('VectorField — type exports', () => {
  it('ComputeWorkerFn type is correctly shaped', () => {
    // Verify the type is usable at runtime
    const fn: ComputeWorkerFn = (pts, _u) => pts.map(() => ({ dx: 0, dy: 0 }));
    const result = fn([{ x: 0, y: 0 }], { time: 0 });
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ dx: 0, dy: 0 });
  });
});
