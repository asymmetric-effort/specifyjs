// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SankeyDiagram — A SpecifyJS component that renders Sankey/flow diagrams as SVG.
 *
 * Supports:
 *  - Automatic multi-column layout (sources left, sinks right)
 *  - Curved Bezier flow paths between nodes
 *  - Flow width proportional to value
 *  - Node and flow labels with optional values
 *  - Configurable colors, padding, opacity
 *  - Iterative layout algorithm (no recursion)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import {
  useMemo,
  useCallback,
} from 'specifyjs/hooks';

// -- Data types ---------------------------------------------------------------

export interface SankeyNode {
  id: string;
  label: string;
  color?: string;
}

export interface SankeyLink {
  source: string;
  target: string;
  value: number;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface SankeyDiagramProps {
  /** Array of nodes */
  nodes: SankeyNode[];
  /** Array of links (flows) between nodes */
  links: SankeyLink[];
  /** SVG width in pixels (default: 800) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Width of each node rectangle in pixels (default: 20) */
  nodeWidth?: number;
  /** Vertical padding between nodes in pixels (default: 10) */
  nodePadding?: number;
  /** Show node labels (default: true) */
  showLabels?: boolean;
  /** Show flow values on links (default: false) */
  showValues?: boolean;
  /** Link fill opacity 0..1 (default: 0.4) */
  linkOpacity?: number;
  /** Color palette for auto-coloring nodes */
  colors?: string[];
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 40) */
  padding?: number;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Internal layout types ----------------------------------------------------

interface LayoutNode {
  id: string;
  label: string;
  color: string;
  column: number;
  x: number;
  y: number;
  height: number;
  totalIn: number;
  totalOut: number;
  totalValue: number;
}

interface LayoutLink {
  source: string;
  target: string;
  value: number;
  color: string;
  sourceY: number;
  targetY: number;
  width: number;
}

// -- Layout algorithm ---------------------------------------------------------

/**
 * Assign column (depth) to each node using iterative BFS from sources.
 * Sources (nodes with no incoming links) start at column 0.
 */
function assignColumns(
  nodeIds: string[],
  linkList: SankeyLink[],
): Map<string, number> {
  const columns = new Map<string, number>();
  const incoming = new Map<string, Set<string>>();
  const outgoing = new Map<string, string[]>();

  for (const id of nodeIds) {
    incoming.set(id, new Set());
    outgoing.set(id, []);
  }

  for (const link of linkList) {
    if (link.value <= 0) continue;
    const inc = incoming.get(link.target);
    if (inc) inc.add(link.source);
    const out = outgoing.get(link.source);
    if (out) out.push(link.target);
  }

  // Find sources (no incoming)
  const queue: string[] = [];
  for (const id of nodeIds) {
    const inc = incoming.get(id)!;
    if (inc.size === 0) {
      columns.set(id, 0);
      queue.push(id);
    }
  }

  // If no sources found (cycle), assign all to column 0
  if (queue.length === 0) {
    for (const id of nodeIds) {
      columns.set(id, 0);
    }
    return columns;
  }

  // BFS to assign columns
  let head = 0;
  while (head < queue.length) {
    const current = queue[head]!;
    head++;
    const currentCol = columns.get(current)!;
    const targets = outgoing.get(current) ?? [];

    for (const target of targets) {
      const existing = columns.get(target);
      const newCol = currentCol + 1;
      if (existing === undefined || newCol > existing) {
        columns.set(target, newCol);
      }
      // Add to queue if not already processed at this depth
      if (!queue.includes(target)) {
        queue.push(target);
      }
    }
  }

  // Assign any remaining unvisited nodes
  for (const id of nodeIds) {
    if (!columns.has(id)) {
      columns.set(id, 0);
    }
  }

  return columns;
}

/**
 * Compute full layout: node positions and link paths.
 */
function computeLayout(
  nodes: SankeyNode[],
  links: SankeyLink[],
  width: number,
  height: number,
  nodeWidth: number,
  nodePadding: number,
  padding: number,
  colors: string[],
): { layoutNodes: LayoutNode[]; layoutLinks: LayoutLink[] } {
  if (nodes.length === 0) {
    return { layoutNodes: [], layoutLinks: [] };
  }

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  // Filter out zero/negative value links
  const validLinks = links.filter((l) => l.value > 0);

  const nodeIds = nodes.map((n) => n.id);
  const columns = assignColumns(nodeIds, validLinks);

  // Compute total in/out for each node
  const totalIn = new Map<string, number>();
  const totalOut = new Map<string, number>();
  for (const id of nodeIds) {
    totalIn.set(id, 0);
    totalOut.set(id, 0);
  }
  for (const link of validLinks) {
    totalOut.set(link.source, (totalOut.get(link.source) ?? 0) + link.value);
    totalIn.set(link.target, (totalIn.get(link.target) ?? 0) + link.value);
  }

  // Determine max column
  let maxCol = 0;
  for (const col of columns.values()) {
    if (col > maxCol) maxCol = col;
  }

  // Group nodes by column
  const columnGroups = new Map<number, string[]>();
  for (let c = 0; c <= maxCol; c++) {
    columnGroups.set(c, []);
  }
  for (const [id, col] of columns) {
    const group = columnGroups.get(col)!;
    group.push(id);
  }

  // Calculate x positions for each column
  const columnX = new Map<number, number>();
  const columnSpacing = maxCol > 0 ? (chartWidth - nodeWidth) / maxCol : 0;
  for (let c = 0; c <= maxCol; c++) {
    columnX.set(c, padding + c * columnSpacing);
  }

  // Build node map for quick lookup
  const nodeMap = new Map<string, SankeyNode>();
  for (let i = 0; i < nodes.length; i++) {
    nodeMap.set(nodes[i]!.id, nodes[i]!);
  }

  // Compute node heights (proportional to total flow)
  // Find max total flow per column to scale heights
  const layoutNodes: LayoutNode[] = [];
  const nodeLayoutMap = new Map<string, LayoutNode>();

  for (let c = 0; c <= maxCol; c++) {
    const group = columnGroups.get(c)!;
    if (group.length === 0) continue;

    // Total value for this column
    let columnTotal = 0;
    for (const id of group) {
      const inVal = totalIn.get(id) ?? 0;
      const outVal = totalOut.get(id) ?? 0;
      columnTotal += Math.max(inVal, outVal, 1);
    }

    const availableHeight = chartHeight - nodePadding * (group.length - 1);
    const scale = columnTotal > 0 ? availableHeight / columnTotal : 1;

    let currentY = padding;
    for (let i = 0; i < group.length; i++) {
      const id = group[i]!;
      const srcNode = nodeMap.get(id)!;
      const inVal = totalIn.get(id) ?? 0;
      const outVal = totalOut.get(id) ?? 0;
      const nodeVal = Math.max(inVal, outVal, 1);
      const nodeHeight = Math.max(4, nodeVal * scale);

      const colorIndex = nodes.findIndex((n) => n.id === id);
      const layoutNode: LayoutNode = {
        id,
        label: srcNode.label,
        color: srcNode.color ?? colors[colorIndex % colors.length]!,
        column: c,
        x: columnX.get(c)!,
        y: currentY,
        height: nodeHeight,
        totalIn: inVal,
        totalOut: outVal,
        totalValue: nodeVal,
      };

      layoutNodes.push(layoutNode);
      nodeLayoutMap.set(id, layoutNode);
      currentY += nodeHeight + nodePadding;
    }
  }

  // Compute link positions
  // Track y-offsets for source and target ports
  const sourceOffsets = new Map<string, number>();
  const targetOffsets = new Map<string, number>();
  for (const id of nodeIds) {
    sourceOffsets.set(id, 0);
    targetOffsets.set(id, 0);
  }

  // Sort links by value (largest first for better visual)
  const sortedLinks = [...validLinks].sort((a, b) => b.value - a.value);

  const layoutLinks: LayoutLink[] = [];
  for (const link of sortedLinks) {
    const sourceLayout = nodeLayoutMap.get(link.source);
    const targetLayout = nodeLayoutMap.get(link.target);
    if (!sourceLayout || !targetLayout) continue;

    const sourceTotal = sourceLayout.totalOut || 1;
    const targetTotal = targetLayout.totalIn || 1;

    const linkWidthSource = (link.value / sourceTotal) * sourceLayout.height;
    const linkWidthTarget = (link.value / targetTotal) * targetLayout.height;
    const linkWidth = Math.max(1, (linkWidthSource + linkWidthTarget) / 2);

    const srcOffset = sourceOffsets.get(link.source)!;
    const tgtOffset = targetOffsets.get(link.target)!;

    const sourceY = sourceLayout.y + srcOffset + linkWidthSource / 2;
    const targetY = targetLayout.y + tgtOffset + linkWidthTarget / 2;

    sourceOffsets.set(link.source, srcOffset + linkWidthSource);
    targetOffsets.set(link.target, tgtOffset + linkWidthTarget);

    const sourceNode = nodeMap.get(link.source);
    layoutLinks.push({
      source: link.source,
      target: link.target,
      value: link.value,
      color: link.color ?? sourceNode?.color ?? sourceLayout.color,
      sourceY,
      targetY,
      width: linkWidth,
    });
  }

  return { layoutNodes, layoutLinks };
}

// -- Component ----------------------------------------------------------------

export function SankeyDiagram(props: SankeyDiagramProps) {
  const {
    nodes,
    links,
    width = 800,
    height = 500,
    nodeWidth = 20,
    nodePadding = 10,
    showLabels = true,
    showValues = false,
    linkOpacity = 0.4,
    colors = DEFAULT_PALETTE,
    title,
    padding = 40,
  } = props;

  // Handle empty data
  if (!nodes || nodes.length === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty Sankey diagram',
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

  const layout = useMemo(
    () => computeLayout(nodes, links, width, height, nodeWidth, nodePadding, padding, colors),
    [nodes, links, width, height, nodeWidth, nodePadding, padding, colors],
  );

  // ---- Build link paths (cubic Bezier curves) --------------------------------

  const buildLinks = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layout.layoutLinks.length; i++) {
      const link = layout.layoutLinks[i]!;
      const sourceNode = layout.layoutNodes.find((n) => n.id === link.source);
      const targetNode = layout.layoutNodes.find((n) => n.id === link.target);
      if (!sourceNode || !targetNode) continue;

      const x0 = sourceNode.x + nodeWidth;
      const x1 = targetNode.x;
      const midX = (x0 + x1) / 2;

      const pathD = `M ${x0} ${link.sourceY} C ${midX} ${link.sourceY}, ${midX} ${link.targetY}, ${x1} ${link.targetY}`;

      elements.push(
        createElement('path', {
          key: `link-${i}`,
          d: pathD,
          fill: 'none',
          stroke: link.color,
          'stroke-width': String(Math.max(1, link.width)),
          'stroke-opacity': String(linkOpacity),
          'stroke-linecap': 'butt',
        }),
      );

      // Show value label at midpoint
      if (showValues && link.value > 0) {
        elements.push(
          createElement(
            'text',
            {
              key: `link-val-${i}`,
              x: String(midX),
              y: String((link.sourceY + link.targetY) / 2 - 4),
              'text-anchor': 'middle',
              'font-size': '9',
              'font-family': 'sans-serif',
              fill: '#6b7280',
              'pointer-events': 'none',
            },
            String(link.value),
          ),
        );
      }
    }

    return elements;
  }, [layout, nodeWidth, linkOpacity, showValues]);

  // ---- Build node rectangles ------------------------------------------------

  const buildNodes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layout.layoutNodes.length; i++) {
      const node = layout.layoutNodes[i]!;

      elements.push(
        createElement('rect', {
          key: `node-${node.id}`,
          x: String(node.x),
          y: String(node.y),
          width: String(nodeWidth),
          height: String(node.height),
          fill: node.color,
          stroke: '#374151',
          'stroke-width': '0.5',
          role: 'img',
          'aria-label': `${node.label}: ${node.totalValue}`,
        }),
      );

      // Label
      if (showLabels) {
        // Place label to the right of last column nodes, left of others
        const maxCol = layout.layoutNodes.reduce((m, n) => Math.max(m, n.column), 0);
        const isLastCol = node.column === maxCol;
        const labelX = isLastCol
          ? node.x + nodeWidth + 6
          : node.x - 6;
        const anchor = isLastCol ? 'start' : 'end';

        // For first column, place label to the left
        const isFirstCol = node.column === 0;
        const finalX = isFirstCol ? node.x - 6 : labelX;
        const finalAnchor = isFirstCol ? 'end' : anchor;

        elements.push(
          createElement(
            'text',
            {
              key: `label-${node.id}`,
              x: String(finalX),
              y: String(node.y + node.height / 2 + 4),
              'text-anchor': finalAnchor,
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
              'pointer-events': 'none',
            },
            node.label,
          ),
        );
      }
    }

    return elements;
  }, [layout, nodeWidth, showLabels]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(padding / 2 + 4),
          'text-anchor': 'middle',
          'font-size': '16',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: '#111827',
        },
        title,
      ),
    ];
  }, [title, width, padding]);

  // ---- Assemble SVG ---------------------------------------------------------

  const linkElements = buildLinks();
  const nodeElements = buildNodes();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Sankey diagram',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...linkElements,
    ...nodeElements,
  );
}
