// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * DecompositionTree — A SpecifyJS component that renders hierarchical tree layouts as SVG.
 *
 * Supports:
 *  - Horizontal (root-left) and vertical (root-top) orientation
 *  - Labeled rectangle nodes with optional values
 *  - Curved or straight connector lines
 *  - Configurable colors, dimensions, padding
 *  - Iterative BFS-based layout (no recursion)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface DecompNode {
  label: string;
  value?: number | string;
  color?: string;
  children?: DecompNode[];
}

// -- Props --------------------------------------------------------------------

export interface DecompositionTreeProps {
  /** Root node of the tree */
  data: DecompNode;
  /** SVG width in pixels (default: 800) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Layout orientation (default: 'horizontal') */
  orientation?: 'horizontal' | 'vertical';
  /** Width of each node rectangle (default: 120) */
  nodeWidth?: number;
  /** Height of each node rectangle (default: 40) */
  nodeHeight?: number;
  /** Show value inside nodes (default: true) */
  showValues?: boolean;
  /** Show connector lines between nodes (default: true) */
  showConnectors?: boolean;
  /** Connector line color (default: '#94a3b8') */
  connectorColor?: string;
  /** Color palette for nodes by depth */
  colors?: string[];
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 40) */
  padding?: number;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6', '#22c55e', '#f59e0b', '#8b5cf6', '#ef4444',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Internal layout types ----------------------------------------------------

interface LayoutNode {
  id: number;
  label: string;
  value: string;
  color: string;
  depth: number;
  x: number;
  y: number;
  parentId: number | null;
  childCount: number;
  subtreeLeafCount: number;
}

// -- Layout algorithm (iterative BFS) -----------------------------------------

/**
 * Flatten the tree into a list of layout nodes using BFS (no recursion).
 * Assigns depth to each node.
 */
function flattenTree(root: DecompNode): {
  flatNodes: Array<{
    id: number;
    node: DecompNode;
    depth: number;
    parentId: number | null;
    childIndices: number[];
  }>;
  maxDepth: number;
} {
  const flatNodes: Array<{
    id: number;
    node: DecompNode;
    depth: number;
    parentId: number | null;
    childIndices: number[];
  }> = [];

  let nextId = 0;

  // BFS queue: [DecompNode, depth, parentId]
  const queue: Array<[DecompNode, number, number | null]> = [];
  queue.push([root, 0, null]);

  let maxDepth = 0;

  while (queue.length > 0) {
    const [node, depth, parentId] = queue.shift()!;
    const id = nextId++;
    maxDepth = Math.max(maxDepth, depth);

    const children = node.children ?? [];
    const childIndices: number[] = [];

    // Pre-compute child IDs (they will be sequential starting from nextId)
    for (let i = 0; i < children.length; i++) {
      childIndices.push(nextId + queue.length + i);
    }

    flatNodes.push({
      id,
      node,
      depth,
      parentId,
      childIndices,
    });

    // Enqueue children
    for (let i = 0; i < children.length; i++) {
      queue.push([children[i]!, depth + 1, id]);
    }
  }

  return { flatNodes, maxDepth };
}

/**
 * Count leaf nodes in each subtree iteratively (post-order using explicit stack).
 */
function countSubtreeLeaves(
  flatNodes: Array<{
    id: number;
    node: DecompNode;
    depth: number;
    parentId: number | null;
    childIndices: number[];
  }>,
): number[] {
  const n = flatNodes.length;
  const leafCounts = new Array<number>(n).fill(0);

  // Process in reverse order (children before parents in BFS, but we need
  // post-order). Since BFS gives us parents first, reverse iteration gives
  // us a bottom-up traversal.
  for (let i = n - 1; i >= 0; i--) {
    const entry = flatNodes[i]!;
    if (entry.childIndices.length === 0) {
      // Leaf node
      leafCounts[i] = 1;
    } else {
      let total = 0;
      for (const ci of entry.childIndices) {
        if (ci < n) {
          total += leafCounts[ci]!;
        }
      }
      leafCounts[i] = Math.max(total, 1);
    }
  }

  return leafCounts;
}

/**
 * Compute positions for all nodes.
 * Horizontal: x based on depth (columns), y distributed by subtree leaf count.
 * Vertical: y based on depth (rows), x distributed by subtree leaf count.
 */
function computeLayout(
  root: DecompNode,
  width: number,
  height: number,
  nodeWidth: number,
  nodeHeight: number,
  padding: number,
  orientation: 'horizontal' | 'vertical',
  colors: string[],
): LayoutNode[] {
  const { flatNodes, maxDepth } = flattenTree(root);
  if (flatNodes.length === 0) return [];

  const leafCounts = countSubtreeLeaves(flatNodes);

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const isHorizontal = orientation === 'horizontal';

  // Spacing between depth levels
  const levelCount = maxDepth + 1;
  const levelSpacing = isHorizontal
    ? levelCount > 1 ? (chartWidth - nodeWidth) / maxDepth : 0
    : levelCount > 1 ? (chartHeight - nodeHeight) / maxDepth : 0;

  // Assign positions using iterative approach
  // For each node, compute its span in the cross-axis based on leaf count
  const layoutNodes: LayoutNode[] = new Array(flatNodes.length);

  // Total leaf count for root determines the full cross-axis span
  const totalLeaves = leafCounts[0]!;
  const crossAxisLength = isHorizontal ? chartHeight : chartWidth;
  const leafSlotSize = totalLeaves > 0 ? crossAxisLength / totalLeaves : crossAxisLength;

  // Track cross-axis offset allocation per node
  // We store [startSlot, endSlot] for each node
  const slotRanges: Array<[number, number]> = new Array(flatNodes.length);
  slotRanges[0] = [0, totalLeaves];

  // BFS to assign slot ranges to children
  const posQueue: number[] = [0];
  let head = 0;
  while (head < posQueue.length) {
    const idx = posQueue[head]!;
    head++;

    const entry = flatNodes[idx]!;
    const [rangeStart, rangeEnd] = slotRanges[idx]!;

    // Position this node at center of its range
    const centerSlot = (rangeStart + rangeEnd) / 2;

    const depthPos = padding + entry.depth * levelSpacing;
    const crossPos = padding + (centerSlot - 0.5) * leafSlotSize;

    const x = isHorizontal ? depthPos : crossPos;
    const y = isHorizontal ? crossPos : depthPos;

    const nodeColor = entry.node.color ?? colors[entry.depth % colors.length]!;

    layoutNodes[idx] = {
      id: entry.id,
      label: entry.node.label,
      value: entry.node.value !== undefined ? String(entry.node.value) : '',
      color: nodeColor,
      depth: entry.depth,
      x,
      y,
      parentId: entry.parentId,
      childCount: entry.childIndices.length,
      subtreeLeafCount: leafCounts[idx]!,
    };

    // Distribute slot range among children proportional to their leaf counts
    let childSlotStart = rangeStart;
    for (const ci of entry.childIndices) {
      if (ci < flatNodes.length) {
        const childLeaves = leafCounts[ci]!;
        const childSlotEnd = childSlotStart + childLeaves;
        slotRanges[ci] = [childSlotStart, childSlotEnd];
        childSlotStart = childSlotEnd;
        posQueue.push(ci);
      }
    }
  }

  return layoutNodes;
}

// -- Component ----------------------------------------------------------------

export function DecompositionTree(props: DecompositionTreeProps) {
  const {
    data,
    width = 800,
    height = 500,
    orientation = 'horizontal',
    nodeWidth = 120,
    nodeHeight = 40,
    showValues = true,
    showConnectors = true,
    connectorColor = '#94a3b8',
    colors = DEFAULT_PALETTE,
    title,
    padding = 40,
  } = props;

  // Handle null/undefined data
  if (!data) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty decomposition tree',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#6b7280',
        },
        'No data',
      ),
    );
  }

  const isHorizontal = orientation === 'horizontal';

  const layoutNodes = useMemo(
    () => computeLayout(data, width, height, nodeWidth, nodeHeight, padding, orientation, colors),
    [data, width, height, nodeWidth, nodeHeight, padding, orientation, colors],
  );

  // Build node index for parent lookups
  const nodeById = useMemo(() => {
    const map = new Map<number, LayoutNode>();
    for (let i = 0; i < layoutNodes.length; i++) {
      const n = layoutNodes[i]!;
      map.set(n.id, n);
    }
    return map;
  }, [layoutNodes]);

  // ---- Build connectors -----------------------------------------------------

  const buildConnectors = useCallback(() => {
    if (!showConnectors) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layoutNodes.length; i++) {
      const node = layoutNodes[i]!;
      if (node.parentId === null) continue;

      const parent = nodeById.get(node.parentId);
      if (!parent) continue;

      // Connect from parent's right/bottom edge to child's left/top edge
      let x1: number, y1: number, x2: number, y2: number;

      if (isHorizontal) {
        x1 = parent.x + nodeWidth;
        y1 = parent.y + nodeHeight / 2;
        x2 = node.x;
        y2 = node.y + nodeHeight / 2;
      } else {
        x1 = parent.x + nodeWidth / 2;
        y1 = parent.y + nodeHeight;
        x2 = node.x + nodeWidth / 2;
        y2 = node.y;
      }

      // Curved connector (cubic Bezier)
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      let pathD: string;
      if (isHorizontal) {
        pathD = `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`;
      } else {
        pathD = `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`;
      }

      elements.push(
        createElement('path', {
          key: `conn-${i}`,
          d: pathD,
          fill: 'none',
          stroke: connectorColor,
          'stroke-width': '1.5',
          'stroke-opacity': '0.7',
        }),
      );
    }

    return elements;
  }, [layoutNodes, nodeById, isHorizontal, nodeWidth, nodeHeight, showConnectors, connectorColor]);

  // ---- Build nodes ----------------------------------------------------------

  const buildNodeElements = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layoutNodes.length; i++) {
      const node = layoutNodes[i]!;

      // Node rectangle
      elements.push(
        createElement('rect', {
          key: `node-rect-${node.id}`,
          x: String(node.x),
          y: String(node.y),
          width: String(nodeWidth),
          height: String(nodeHeight),
          rx: '4',
          ry: '4',
          fill: node.color,
          stroke: '#374151',
          'stroke-width': '1',
          role: 'img',
          'aria-label': node.value
            ? `${node.label}: ${node.value}`
            : node.label,
        }),
      );

      // Label text
      const labelY = showValues && node.value
        ? node.y + nodeHeight / 2 - 2
        : node.y + nodeHeight / 2 + 4;

      elements.push(
        createElement(
          'text',
          {
            key: `node-label-${node.id}`,
            x: String(node.x + nodeWidth / 2),
            y: String(labelY),
            'text-anchor': 'middle',
            'font-size': '11',
            'font-weight': 'bold',
            'font-family': 'sans-serif',
            fill: '#fff',
            'pointer-events': 'none',
          },
          node.label,
        ),
      );

      // Value text
      if (showValues && node.value) {
        elements.push(
          createElement(
            'text',
            {
              key: `node-value-${node.id}`,
              x: String(node.x + nodeWidth / 2),
              y: String(node.y + nodeHeight / 2 + 12),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: 'rgba(255,255,255,0.85)',
              'pointer-events': 'none',
            },
            node.value,
          ),
        );
      }
    }

    return elements;
  }, [layoutNodes, nodeWidth, nodeHeight, showValues]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: '24',
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width]);

  // ---- Assemble SVG ---------------------------------------------------------

  const connectorElements = buildConnectors();
  const nodeElements = buildNodeElements();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Decomposition tree',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...connectorElements,
    ...nodeElements,
  );
}
