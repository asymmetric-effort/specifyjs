// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Partition — A SpecifyJS component that renders icicle/partition diagrams as SVG.
 *
 * Supports:
 *  - Horizontal (icicle) and vertical (flame) orientation
 *  - Hierarchical data with proportional subdivision
 *  - Iterative tree traversal (no recursion)
 *  - Labels and value display
 *  - Configurable colors, borders, padding
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface PartitionNode {
  label: string;
  value?: number;
  color?: string;
  children?: PartitionNode[];
}

// -- Props --------------------------------------------------------------------

export interface PartitionProps {
  /** Root node of the partition data */
  data: PartitionNode;
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Layout orientation (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';
  /** Show labels inside cells (default: true) */
  showLabels?: boolean;
  /** Show values inside cells (default: true) */
  showValues?: boolean;
  /** Color palette for cells without explicit color */
  colors?: string[];
  /** Border color around cells (default: '#ffffff') */
  borderColor?: string;
  /** Border width in px (default: 1) */
  borderWidth?: number;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 10) */
  padding?: number;
}

// -- Constants ----------------------------------------------------------------

const DEFAULT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Layout types -------------------------------------------------------------

interface PartitionRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  value: number;
  color: string;
  depth: number;
}

// -- Helpers ------------------------------------------------------------------

/** Compute node value iteratively. */
function computeNodeValue(node: PartitionNode): number {
  if (!node.children || node.children.length === 0) {
    return Math.max(0, node.value ?? 0);
  }
  let total = 0;
  const stack: PartitionNode[] = [node];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!current.children || current.children.length === 0) {
      total += Math.max(0, current.value ?? 0);
    } else {
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]!);
      }
    }
  }
  return total;
}

/** Compute max depth iteratively. */
function computeMaxDepth(root: PartitionNode): number {
  let maxDepth = 0;
  const stack: { node: PartitionNode; depth: number }[] = [{ node: root, depth: 0 }];
  while (stack.length > 0) {
    const { node, depth } = stack.pop()!;
    if (depth > maxDepth) maxDepth = depth;
    if (node.children) {
      for (let i = node.children.length - 1; i >= 0; i--) {
        stack.push({ node: node.children[i]!, depth: depth + 1 });
      }
    }
  }
  return maxDepth;
}

// -- Layout computation (iterative) -------------------------------------------

function computePartitionLayout(
  root: PartitionNode,
  chartX: number,
  chartY: number,
  chartW: number,
  chartH: number,
  orientation: 'horizontal' | 'vertical',
  colors: string[],
): PartitionRect[] {
  const results: PartitionRect[] = [];
  const rootValue = computeNodeValue(root);
  if (rootValue <= 0) return results;

  const maxDepth = computeMaxDepth(root);
  const numLevels = maxDepth + 1;

  // In horizontal mode: each depth level is a row (top to bottom), children span width
  // In vertical mode: each depth level is a column (left to right), children span height
  const isHorizontal = orientation === 'horizontal';
  const levelSize = isHorizontal
    ? chartH / numLevels
    : chartW / numLevels;

  // BFS queue
  const queue: {
    node: PartitionNode;
    depth: number;
    // Position along the "span" axis
    spanStart: number;
    spanEnd: number;
    colorIndex: number;
  }[] = [];

  // Root occupies full span
  queue.push({
    node: root,
    depth: 0,
    spanStart: isHorizontal ? chartX : chartY,
    spanEnd: isHorizontal ? chartX + chartW : chartY + chartH,
    colorIndex: 0,
  });

  while (queue.length > 0) {
    const item = queue.shift()!;
    const { node, depth, spanStart, spanEnd, colorIndex } = item;
    const nodeVal = computeNodeValue(node);
    if (nodeVal <= 0) continue;

    const spanLen = spanEnd - spanStart;
    let x: number, y: number, w: number, h: number;

    if (isHorizontal) {
      x = spanStart;
      y = chartY + depth * levelSize;
      w = spanLen;
      h = levelSize;
    } else {
      x = chartX + depth * levelSize;
      y = spanStart;
      w = levelSize;
      h = spanLen;
    }

    results.push({
      x,
      y,
      w,
      h,
      label: node.label,
      value: nodeVal,
      color: node.color ?? colors[colorIndex % colors.length]!,
      depth,
    });

    // Enqueue children
    if (node.children && node.children.length > 0) {
      let offset = spanStart;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!;
        const childVal = computeNodeValue(child);
        if (childVal <= 0) continue;
        const childSpan = (childVal / nodeVal) * spanLen;
        queue.push({
          node: child,
          depth: depth + 1,
          spanStart: offset,
          spanEnd: offset + childSpan,
          colorIndex: depth === 0 ? i : colorIndex,
        });
        offset += childSpan;
      }
    }
  }

  return results;
}

// -- Component ----------------------------------------------------------------

export function Partition(props: PartitionProps) {
  const {
    data,
    width = 600,
    height = 400,
    orientation = 'horizontal',
    showLabels = true,
    showValues = true,
    colors = DEFAULT_COLORS,
    borderColor = '#ffffff',
    borderWidth = 1,
    title,
    padding = 10,
  } = props;

  const titleOffset = title ? 30 : 0;
  const chartX = padding;
  const chartY = padding + titleOffset;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2 - titleOffset;

  // Handle empty data
  const totalValue = useMemo(() => computeNodeValue(data), [data]);

  if (totalValue <= 0 || chartW <= 0 || chartH <= 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty partition diagram',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#9ca3af',
        },
        'No data to display',
      ),
    );
  }

  const rects = useMemo(
    () => computePartitionLayout(data, chartX, chartY, chartW, chartH, orientation, colors),
    [data, chartX, chartY, chartW, chartH, orientation, colors],
  );

  const elements: ReturnType<typeof createElement>[] = [];

  // Title
  if (title) {
    elements.push(
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(padding + 16),
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#111827',
        },
        title,
      ),
    );
  }

  // Cells
  for (let i = 0; i < rects.length; i++) {
    const r = rects[i]!;

    // Rectangle
    elements.push(
      createElement('rect', {
        key: `cell-${i}`,
        x: String(r.x),
        y: String(r.y),
        width: String(Math.max(0, r.w)),
        height: String(Math.max(0, r.h)),
        fill: r.color,
        stroke: borderColor,
        'stroke-width': String(borderWidth),
        role: 'graphics-symbol',
        'aria-label': `${r.label}: ${r.value}`,
      }),
    );

    // Label
    if (showLabels && r.w > 20 && r.h > 14) {
      const maxChars = Math.floor(r.w / 7);
      const displayLabel = r.label.length > maxChars
        ? r.label.substring(0, Math.max(1, maxChars - 2)) + '..'
        : r.label;

      elements.push(
        createElement(
          'text',
          {
            key: `label-${i}`,
            x: String(r.x + r.w / 2),
            y: String(r.y + r.h / 2 + (showValues ? -2 : 4)),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-family': 'sans-serif',
            fill: '#ffffff',
            'pointer-events': 'none',
          },
          displayLabel,
        ),
      );
    }

    // Value
    if (showValues && r.w > 30 && r.h > 28) {
      elements.push(
        createElement(
          'text',
          {
            key: `value-${i}`,
            x: String(r.x + r.w / 2),
            y: String(r.y + r.h / 2 + 12),
            'text-anchor': 'middle',
            'font-size': '10',
            'font-family': 'sans-serif',
            fill: 'rgba(255,255,255,0.8)',
            'pointer-events': 'none',
          },
          String(r.value),
        ),
      );
    }
  }

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Partition diagram',
      style: { fontFamily: 'sans-serif' },
    },
    ...elements,
  );
}
