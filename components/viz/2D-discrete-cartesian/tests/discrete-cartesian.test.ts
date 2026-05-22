// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach, vi } from '@asymmetric-effort/nogginlessdom';
import { DiscreteCartesian2D } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

// Helper: collect all children (flattened) from a VNode
function collectChildren(el: any): any[] {
  const raw = el.props?.children;
  if (raw === undefined || raw === null) return [];
  if (Array.isArray(raw)) return raw.filter((c: any) => c != null);
  return [raw];
}

// Helper: filter children that are cell rects (not the background rect)
function cellRects(el: any): any[] {
  return collectChildren(el).filter(
    (c: any) => c && c.type === 'rect' && c.key !== 'bg',
  );
}

const sample3x3: number[][] = [
  [0, 1, 0],
  [1, 0, 1],
  [0, 1, 0],
];

const sample2x4: number[][] = [
  [0, 1, 2, 3],
  [3, 2, 1, 0],
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('DiscreteCartesian2D — happy path', () => {
  it('renders with valid NxM data', () => {
    const el = DiscreteCartesian2D({ data: sample3x3 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders correct number of cell rects for 3x3 grid', () => {
    const el = DiscreteCartesian2D({ data: sample3x3 });
    const rects = cellRects(el);
    expect(rects.length).toBe(9);
  });

  it('renders with non-square data (2x4)', () => {
    const el = DiscreteCartesian2D({ data: sample2x4 });
    expect(el).not.toBeNull();
    const rects = cellRects(el);
    expect(rects.length).toBe(8);
  });

  it('renders single cell (1x1)', () => {
    const el = DiscreteCartesian2D({ data: [[1]] });
    expect(el).not.toBeNull();
    const rects = cellRects(el);
    expect(rects.length).toBe(1);
  });

  it('applies custom colorMap correctly', () => {
    const colorMap = { 0: '#ff0000', 1: '#00ff00' };
    const el = DiscreteCartesian2D({ data: [[0, 1]], colorMap });
    const rects = cellRects(el);
    expect(rects.length).toBe(2);
    expect(rects[0].props.fill).toBe('#ff0000');
    expect(rects[1].props.fill).toBe('#00ff00');
  });

  it('uses default colorMap when not provided', () => {
    const el = DiscreteCartesian2D({ data: [[0, 1]] });
    const rects = cellRects(el);
    expect(rects[0].props.fill).toBe('#1e293b');
    expect(rects[1].props.fill).toBe('#3b82f6');
  });

  it('falls back to #666 for unknown values in colorMap', () => {
    const el = DiscreteCartesian2D({ data: [[99]] });
    const rects = cellRects(el);
    expect(rects[0].props.fill).toBe('#666');
  });

  it('uses responsive width="100%"', () => {
    const el = DiscreteCartesian2D({ data: sample3x3 });
    expect(el.props.width).toBe('100%');
  });

  it('has role="img" and aria-label', () => {
    const el = DiscreteCartesian2D({ data: sample3x3 });
    expect(el.props.role).toBe('img');
    expect(el.props['aria-label']).toContain('3x3');
    expect(el.props['aria-label']).toContain('discrete grid');
  });

  it('includes title in aria-label when provided', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, title: 'Game of Life' });
    expect(el.props['aria-label']).toContain('Game of Life');
  });

  it('renders title text element', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, title: 'My Grid' });
    const texts = collectChildren(el).filter((c: any) => c && c.type === 'text');
    const titleText = texts.find((t: any) => {
      const ch = t.props?.children;
      return ch === 'My Grid';
    });
    expect(titleText).toBeDefined();
  });

  it('applies custom dimensions via viewBox', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, width: 800, height: 400 });
    expect(el.props.viewBox).toBe('0 0 800 400');
  });
});

// ---------------------------------------------------------------------------
// Edge-case / sad-path tests
// ---------------------------------------------------------------------------

describe('DiscreteCartesian2D — edge cases', () => {
  it('handles empty data (renders SVG with background only)', () => {
    const el = DiscreteCartesian2D({ data: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    // No cell rects
    const rects = cellRects(el);
    expect(rects.length).toBe(0);
  });

  it('handles ragged rows (different column counts)', () => {
    const raggedData = [[0, 1, 0], [1]];
    const el = DiscreteCartesian2D({ data: raggedData });
    expect(el).not.toBeNull();
    // cols is determined by max row length (3), short rows fill with value 0
    const rects = cellRects(el);
    // 2 rows x 3 cols = 6 cells
    expect(rects.length).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// Feature / option tests
// ---------------------------------------------------------------------------

describe('DiscreteCartesian2D — features', () => {
  it('onCellClick callback receives correct row/col/value', () => {
    const clickHandler = vi.fn();
    const el = DiscreteCartesian2D({ data: sample3x3, onCellClick: clickHandler });
    // Find cell at row=1, col=2 (value=1)
    const rects = cellRects(el);
    const cell = rects.find((r: any) => r.key === 'cell-1-2');
    expect(cell).toBeDefined();
    expect(cell.props.role).toBe('button');
    expect(cell.props.tabIndex).toBe(0);
    // Simulate click
    cell.props.onClick();
    expect(clickHandler).toHaveBeenCalledWith(1, 2, 1);
  });

  it('onCellHover callback fires on mouseEnter', () => {
    const hoverHandler = vi.fn();
    const el = DiscreteCartesian2D({ data: sample3x3, onCellHover: hoverHandler });
    const rects = cellRects(el);
    const cell = rects.find((r: any) => r.key === 'cell-0-1');
    expect(cell).toBeDefined();
    cell.props.onMouseEnter();
    expect(hoverHandler).toHaveBeenCalledWith(0, 1, 1);
  });

  it('showGrid option renders grid lines', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, showGrid: true });
    const lines = collectChildren(el).filter((c: any) => c && c.type === 'line');
    // 4 vertical + 4 horizontal = 8 lines for a 3x3 grid
    expect(lines.length).toBe(8);
  });

  it('showGrid false renders no grid lines', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, showGrid: false });
    const lines = collectChildren(el).filter((c: any) => c && c.type === 'line');
    expect(lines.length).toBe(0);
  });

  it('showIndices option renders row and column labels', () => {
    const el = DiscreteCartesian2D({ data: sample3x3, showIndices: true });
    const texts = collectChildren(el).filter((c: any) => c && c.type === 'text');
    // 3 col indices + 3 row indices = 6
    expect(texts.length).toBe(6);
  });

  it('cellGap spacing is reflected in cell positions', () => {
    // Use 3 columns so gap*(cols-1) differs between gap=0 and gap=10
    const gap0 = DiscreteCartesian2D({ data: [[0, 1, 0]], cellGap: 0 });
    const gap10 = DiscreteCartesian2D({ data: [[0, 1, 0]], cellGap: 10 });
    const rects0 = cellRects(gap0);
    const rects10 = cellRects(gap10);
    // With larger gap, cells should be smaller (wider gap eats into available space)
    const width0 = parseFloat(rects0[0].props.width);
    const width10 = parseFloat(rects10[0].props.width);
    expect(width10).toBeLessThan(width0);
  });

  it('padding is applied to cell positioning', () => {
    const el = DiscreteCartesian2D({ data: [[1]], padding: 50 });
    const cells = cellRects(el);
    const cellX = parseFloat(cells[0].props.x);
    // With padding=50 and no indices, cell should start at x=50
    expect(cellX).toBe(50);
  });
});
