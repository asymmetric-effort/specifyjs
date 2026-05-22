// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, fn } from '@asymmetric-effort/nogginlessdom';
import { CartesianGraph2D } from '../src/index';
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

describe('CartesianGraph2D — happy path', () => {
  it('renders with defaults (svg element)', () => {
    const el = CartesianGraph2D({});
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom width/height', () => {
    const el = CartesianGraph2D({ width: 800, height: 600 });
    expect(el.props.width).toBe('100%');
  });

  it('renders points (circle elements exist)', () => {
    const el = CartesianGraph2D({
      points: [
        { x: 0, y: 0 },
        { x: 1, y: 1 },
        { x: -1, y: -1 },
      ],
    });
    const circles = collectByType(el, 'circle');
    // At least 3 circles for 3 data points
    expect(circles.length).toBeGreaterThanOrEqual(3);
  });

  it('renders plotFunction curve (path element)', () => {
    const el = CartesianGraph2D({
      plotFunction: (x: number) => x * x,
      sync: true,
    });
    const paths = collectByType(el, 'path');
    expect(paths.length).toBeGreaterThanOrEqual(1);
    // The curve path should have a d attribute with M and L commands
    const curvePath = paths.find((p: any) => p.props.d && p.props.d.includes('M'));
    expect(curvePath).toBeDefined();
  });

  it('renders grid lines when showGrid=true', () => {
    const el = CartesianGraph2D({ showGrid: true });
    const lines = collectByType(el, 'line');
    // Grid produces many lines plus axes
    expect(lines.length).toBeGreaterThan(2);
  });

  it('hides grid when showGrid=false', () => {
    const elWithGrid = CartesianGraph2D({ showGrid: true, showAxes: false });
    const elNoGrid = CartesianGraph2D({ showGrid: false, showAxes: false });
    const linesWithGrid = collectByType(elWithGrid, 'line');
    const linesNoGrid = collectByType(elNoGrid, 'line');
    expect(linesNoGrid.length).toBeLessThan(linesWithGrid.length);
  });

  it('renders axes when showAxes=true', () => {
    const el = CartesianGraph2D({ showAxes: true, showGrid: false });
    const lines = collectByType(el, 'line');
    // x-axis and y-axis
    expect(lines.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Interaction tests
// ---------------------------------------------------------------------------

describe('CartesianGraph2D — interaction', () => {
  it('fires onPointClick when point clicked', () => {
    const handler = fn();
    const el = CartesianGraph2D({
      points: [{ x: 1, y: 2 }],
      onPointClick: handler,
    });
    const circles = collectByType(el, 'circle');
    // Find the data point circle (has onclick)
    const pointCircle = circles.find((c: any) => c.props.onClick);
    expect(pointCircle).toBeDefined();
    // Simulate click
    const fakeEvent = new Event('click');
    pointCircle.props.onClick(fakeEvent);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ x: 1, y: 2, index: 0, event: fakeEvent }),
    );
  });

  it('fires onPointHover on mouseenter', () => {
    const handler = fn();
    const el = CartesianGraph2D({
      points: [{ x: 3, y: 4 }],
      onPointHover: handler,
    });
    const circles = collectByType(el, 'circle');
    const pointCircle = circles.find((c: any) => c.props.onMouseOver);
    expect(pointCircle).toBeDefined();
    const fakeEvent = new Event('mouseover');
    pointCircle.props.onMouseOver(fakeEvent);
    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({ x: 3, y: 4, index: 0, event: fakeEvent }),
    );
  });

  it('has mouse event handlers for pan interaction', () => {
    const el = CartesianGraph2D({});
    expect(el.props.onMouseDown).toBeDefined();
    expect(el.props.onMouseMove).toBeDefined();
    expect(el.props.onMouseUp).toBeDefined();
    expect(el.props.onMouseLeave).toBeDefined();
  });

  it('has wheel handler for zoom', () => {
    const el = CartesianGraph2D({});
    expect(el.props.onWheel).toBeDefined();
  });
});
