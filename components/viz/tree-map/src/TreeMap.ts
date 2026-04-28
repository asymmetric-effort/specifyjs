// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * TreeMap — A SpecifyJS component that renders treemap visualizations as SVG.
 *
 * Supports:
 *  - Squarified treemap layout (iterative, no recursion)
 *  - Nested hierarchical data
 *  - Configurable colors, borders, padding
 *  - Labels and value display
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface TreeMapNode {
  label: string;
  value: number;
  color?: string;
  children?: TreeMapNode[];
}

// -- Props --------------------------------------------------------------------

export interface TreeMapProps {
  /** Root node of the treemap data */
  data: TreeMapNode;
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Show labels inside cells (default: true) */
  showLabels?: boolean;
  /** Show values inside cells (default: true) */
  showValues?: boolean;
  /** Color palette for cells without explicit color */
  colors?: string[];
  /** Border color around cells (default: '#ffffff') */
  borderColor?: string;
  /** Border width in px (default: 2) */
  borderWidth?: number;
  /** Inner padding for nested cells in px (default: 2) */
  padding?: number;
  /** Chart title */
  title?: string;
}

// -- Constants ----------------------------------------------------------------

const DEFAULT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Layout types -------------------------------------------------------------

interface LayoutRect {
  x: number;
  y: number;
  w: number;
  h: number;
  label: string;
  value: number;
  color: string;
  depth: number;
}

// -- Squarified treemap layout (iterative) ------------------------------------

/** Compute the total value of a node, iteratively summing leaves. */
function computeNodeValue(node: TreeMapNode): number {
  if (!node.children || node.children.length === 0) {
    return Math.max(0, node.value);
  }
  // Iterative sum of all descendant leaves
  let total = 0;
  const stack: TreeMapNode[] = [node];
  while (stack.length > 0) {
    const current = stack.pop()!;
    if (!current.children || current.children.length === 0) {
      total += Math.max(0, current.value);
    } else {
      for (let i = current.children.length - 1; i >= 0; i--) {
        stack.push(current.children[i]!);
      }
    }
  }
  return total;
}

/** Worst aspect ratio of a row of areas laid out in a strip. */
function worstAspectRatio(areas: number[], stripLength: number): number {
  if (areas.length === 0 || stripLength <= 0) return Infinity;
  let totalArea = 0;
  for (const a of areas) totalArea += a;
  if (totalArea <= 0) return Infinity;

  const stripWidth = totalArea / stripLength;
  let worst = 0;
  for (const a of areas) {
    if (a <= 0) continue;
    const itemLen = a / stripWidth;
    const ratio = Math.max(itemLen / stripWidth, stripWidth / itemLen);
    if (ratio > worst) worst = ratio;
  }
  return worst;
}

interface SquarifyWorkItem {
  nodes: { label: string; value: number; area: number; color: string; node: TreeMapNode }[];
  rect: { x: number; y: number; w: number; h: number };
  depth: number;
}

function squarifiedLayout(root: TreeMapNode, x: number, y: number, w: number, h: number, colors: string[]): LayoutRect[] {
  const results: LayoutRect[] = [];

  // Work queue for iterative processing (BFS-style)
  const workQueue: SquarifyWorkItem[] = [];

  // Prepare root's children
  const rootValue = computeNodeValue(root);
  if (rootValue <= 0 || w <= 0 || h <= 0) return results;

  const rootChildren = root.children && root.children.length > 0 ? root.children : [root];
  const totalArea = w * h;

  const initialNodes: SquarifyWorkItem['nodes'] = [];
  for (let i = 0; i < rootChildren.length; i++) {
    const child = rootChildren[i]!;
    const val = computeNodeValue(child);
    if (val <= 0) continue;
    initialNodes.push({
      label: child.label,
      value: val,
      area: (val / rootValue) * totalArea,
      color: child.color ?? colors[i % colors.length]!,
      node: child,
    });
  }

  // Sort by area descending
  initialNodes.sort((a, b) => b.area - a.area);

  workQueue.push({
    nodes: initialNodes,
    rect: { x, y, w, h },
    depth: 0,
  });

  while (workQueue.length > 0) {
    const work = workQueue.shift()!;
    const { nodes, rect, depth } = work;

    if (nodes.length === 0) continue;

    // Squarify: lay out nodes into rows within the rect
    let remainingRect = { ...rect };
    let idx = 0;

    while (idx < nodes.length && remainingRect.w > 0 && remainingRect.h > 0) {
      const isWide = remainingRect.w >= remainingRect.h;
      const stripLength = isWide ? remainingRect.h : remainingRect.w;

      // Build a row
      const row: typeof nodes = [];
      const rowAreas: number[] = [];
      row.push(nodes[idx]!);
      rowAreas.push(nodes[idx]!.area);
      idx++;

      let currentWorst = worstAspectRatio(rowAreas, stripLength);

      while (idx < nodes.length) {
        const candidate = [...rowAreas, nodes[idx]!.area];
        const newWorst = worstAspectRatio(candidate, stripLength);
        if (newWorst > currentWorst) break;
        row.push(nodes[idx]!);
        rowAreas.push(nodes[idx]!.area);
        currentWorst = newWorst;
        idx++;
      }

      // Layout this row
      let totalRowArea = 0;
      for (const a of rowAreas) totalRowArea += a;

      const stripWidth = stripLength > 0 ? totalRowArea / stripLength : 0;
      let offset = 0;

      for (let i = 0; i < row.length; i++) {
        const item = row[i]!;
        const itemLen = stripWidth > 0 ? item.area / stripWidth : 0;

        let cellX: number, cellY: number, cellW: number, cellH: number;
        if (isWide) {
          cellX = remainingRect.x;
          cellY = remainingRect.y + offset;
          cellW = stripWidth;
          cellH = itemLen;
        } else {
          cellX = remainingRect.x + offset;
          cellY = remainingRect.y;
          cellW = itemLen;
          cellH = stripWidth;
        }

        results.push({
          x: cellX,
          y: cellY,
          w: cellW,
          h: cellH,
          label: item.label,
          value: item.value,
          color: item.color,
          depth,
        });

        // If this node has children, queue them for layout within this cell
        if (item.node.children && item.node.children.length > 0) {
          const childPad = 2;
          const innerX = cellX + childPad;
          const innerY = cellY + childPad + 14; // leave room for label
          const innerW = cellW - childPad * 2;
          const innerH = cellH - childPad * 2 - 14;

          if (innerW > 4 && innerH > 4) {
            const childNodes: SquarifyWorkItem['nodes'] = [];
            const parentVal = item.value;
            const innerArea = innerW * innerH;

            for (let ci = 0; ci < item.node.children.length; ci++) {
              const child = item.node.children[ci]!;
              const cv = computeNodeValue(child);
              if (cv <= 0) continue;
              childNodes.push({
                label: child.label,
                value: cv,
                area: (cv / parentVal) * innerArea,
                color: child.color ?? colors[(ci + depth + 1) % colors.length]!,
                node: child,
              });
            }

            childNodes.sort((a, b) => b.area - a.area);

            workQueue.push({
              nodes: childNodes,
              rect: { x: innerX, y: innerY, w: innerW, h: innerH },
              depth: depth + 1,
            });
          }
        }

        offset += itemLen;
      }

      // Reduce the remaining rect
      if (isWide) {
        remainingRect = {
          x: remainingRect.x + stripWidth,
          y: remainingRect.y,
          w: remainingRect.w - stripWidth,
          h: remainingRect.h,
        };
      } else {
        remainingRect = {
          x: remainingRect.x,
          y: remainingRect.y + stripWidth,
          w: remainingRect.w,
          h: remainingRect.h - stripWidth,
        };
      }
    }
  }

  return results;
}

// -- Component ----------------------------------------------------------------

export function TreeMap(props: TreeMapProps) {
  const {
    data,
    width = 600,
    height = 400,
    showLabels = true,
    showValues = true,
    colors = DEFAULT_COLORS,
    borderColor = '#ffffff',
    borderWidth = 2,
    padding = 2,
    title,
  } = props;

  const titleOffset = title ? 30 : 0;
  const chartX = padding;
  const chartY = padding + titleOffset;
  const chartW = width - padding * 2;
  const chartH = height - padding * 2 - titleOffset;

  // Handle empty / zero-value data
  const totalValue = useMemo(() => computeNodeValue(data), [data]);

  if (totalValue <= 0 || chartW <= 0 || chartH <= 0) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty treemap',
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

  // Compute layout
  const rects = useMemo(
    () => squarifiedLayout(data, chartX, chartY, chartW, chartH, colors),
    [data, chartX, chartY, chartW, chartH, colors],
  );

  // Build SVG elements
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
            x: String(r.x + 4),
            y: String(r.y + 12),
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
            x: String(r.x + 4),
            y: String(r.y + 24),
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
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Treemap chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...elements,
  );
}
