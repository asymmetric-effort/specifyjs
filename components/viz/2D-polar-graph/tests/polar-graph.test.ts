// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, fn } from '@asymmetric-effort/nogginlessdom';
import { PolarGraph2D } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// ---------------------------------------------------------------------------
// Helper: recursively collect children of a given type
// ---------------------------------------------------------------------------

function collectByType(vnode: any, type: string): any[] {
  const results: any[] = [];
  if (!vnode) return results;
  if (vnode.type === type) results.push(vnode);
  const kids = vnode.props?.children;
  if (Array.isArray(kids)) {
    for (const child of kids) {
      results.push(...collectByType(child, type));
    }
  } else if (kids && typeof kids === 'object' && kids.type) {
    results.push(...collectByType(kids, type));
  }
  return results;
}

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('PolarGraph2D — happy path', () => {
  it('renders with defaults (svg element)', () => {
    const el = PolarGraph2D({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = PolarGraph2D({ width: 600, height: 600 });
    expect(el.props.width).toBe('100%');
  });

  it('renders plotFunction curve (path element)', () => {
    // r = 1 + cos(theta), a cardioid
    const el = PolarGraph2D({
      plotFunction: (theta: number) => 1 + Math.cos(theta),
      sync: true,
    });
    const paths = collectByType(el, 'path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
    const curvePath = paths.find((p: any) => p.props.d && p.props.d.includes('M'));
    expect(curvePath).toBeDefined();
  });

  it('renders points', () => {
    const el = PolarGraph2D({
      points: [
        { r: 1, theta: 0 },
        { r: 2, theta: Math.PI / 2 },
        { r: 0.5, theta: Math.PI },
      ],
    });
    const circles = collectByType(el, 'circle');
    // Grid concentric circles + 3 data point circles
    const dataPoints = circles.filter((c: any) => c.props.fill !== 'none');
    expect(dataPoints.length).toBeGreaterThanOrEqual(3);
  });

  it('renders grid (concentric circles)', () => {
    const el = PolarGraph2D({ showGrid: true });
    const circles = collectByType(el, 'circle');
    // Grid produces concentric circles with fill='none'
    const gridCircles = circles.filter((c: any) => c.props.fill === 'none');
    expect(gridCircles.length).toBeGreaterThan(0);
  });

  it('renders fewer elements when showGrid=false', () => {
    const elWithGrid = PolarGraph2D({ showGrid: true });
    const elNoGrid = PolarGraph2D({ showGrid: false });
    const circlesWithGrid = collectByType(elWithGrid, 'circle');
    const circlesNoGrid = collectByType(elNoGrid, 'circle');
    expect(circlesNoGrid.length).toBeLessThan(circlesWithGrid.length);
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('PolarGraph2D — interaction', () => {
  it('fires onPointClick', () => {
    const handler = fn();
    const el = PolarGraph2D({
      points: [{ r: 1, theta: 0 }],
      onPointClick: handler,
    });
    const circles = collectByType(el, 'circle');
    const pointCircle = circles.find((c: any) => c.props.onClick);
    expect(pointCircle).toBeDefined();
    const fakeEvent = new Event('click');
    pointCircle.props.onClick(fakeEvent);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ r: 1, theta: 0, index: 0, event: fakeEvent }),
    );
  });

  it('fires onPointHover on mouseenter', () => {
    const handler = fn();
    const el = PolarGraph2D({
      points: [{ r: 2, theta: Math.PI }],
      onPointHover: handler,
    });
    const circles = collectByType(el, 'circle');
    const pointCircle = circles.find((c: any) => c.props.onMouseEnter);
    expect(pointCircle).toBeDefined();
    const fakeEvent = new Event('mouseenter');
    pointCircle.props.onMouseEnter(fakeEvent);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ r: 2, theta: Math.PI, index: 0, event: fakeEvent }),
    );
  });

  it('has mouse event handlers for pan interaction', () => {
    const el = PolarGraph2D({});
    expect(el.props.onMouseDown).toBeDefined();
    expect(el.props.onMouseMove).toBeDefined();
    expect(el.props.onMouseUp).toBeDefined();
    expect(el.props.onMouseLeave).toBeDefined();
  });

  it('has wheel handler for zoom', () => {
    const el = PolarGraph2D({});
    expect(el.props.onWheel).toBeDefined();
  });
});
