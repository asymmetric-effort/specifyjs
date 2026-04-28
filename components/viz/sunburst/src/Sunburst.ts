// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Sunburst — A SpecifyJS component that renders multi-level donut/ring charts as SVG.
 *
 * Supports:
 *  - Multi-level hierarchical data rendered as concentric ring segments
 *  - Iterative tree traversal (no recursion)
 *  - Configurable inner radius, colors, stroke
 *  - Optional labels on segments
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import { useMemo } from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface SunburstNode {
  label: string;
  value?: number;
  color?: string;
  children?: SunburstNode[];
}

// -- Props --------------------------------------------------------------------

export interface SunburstProps {
  /** Root node of the sunburst data */
  data: SunburstNode;
  /** SVG width in pixels (default: 500) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Inner radius of the first ring (default: 40) */
  innerRadius?: number;
  /** Show labels on segments (default: true) */
  showLabels?: boolean;
  /** Color palette for segments without explicit color */
  colors?: string[];
  /** Stroke color between segments (default: '#ffffff') */
  strokeColor?: string;
  /** Stroke width between segments (default: 1) */
  strokeWidth?: number;
  /** Chart title */
  title?: string;
}

// -- Constants ----------------------------------------------------------------

const DEFAULT_COLORS = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

const TWO_PI = 2 * Math.PI;

// -- Layout types -------------------------------------------------------------

interface ArcSegment {
  startAngle: number;
  endAngle: number;
  innerR: number;
  outerR: number;
  label: string;
  value: number;
  color: string;
  depth: number;
}

// -- Helpers ------------------------------------------------------------------

/** Compute node value iteratively. Leaf value or sum of descendant leaves. */
function computeNodeValue(node: SunburstNode): number {
  if (!node.children || node.children.length === 0) {
    return Math.max(0, node.value ?? 0);
  }
  let total = 0;
  const stack: SunburstNode[] = [node];
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

/** Compute max depth of tree iteratively. */
function computeMaxDepth(root: SunburstNode): number {
  let maxDepth = 0;
  const stack: { node: SunburstNode; depth: number }[] = [{ node: root, depth: 0 }];
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

/** Convert polar to SVG arc path. */
function describeArc(cx: number, cy: number, innerR: number, outerR: number, startAngle: number, endAngle: number): string {
  const angleDiff = endAngle - startAngle;
  const largeArc = angleDiff > Math.PI ? 1 : 0;

  // Offset by -PI/2 so 0 angle is at top
  const sa = startAngle - Math.PI / 2;
  const ea = endAngle - Math.PI / 2;

  const outerStartX = cx + outerR * Math.cos(sa);
  const outerStartY = cy + outerR * Math.sin(sa);
  const outerEndX = cx + outerR * Math.cos(ea);
  const outerEndY = cy + outerR * Math.sin(ea);
  const innerStartX = cx + innerR * Math.cos(ea);
  const innerStartY = cy + innerR * Math.sin(ea);
  const innerEndX = cx + innerR * Math.cos(sa);
  const innerEndY = cy + innerR * Math.sin(sa);

  // Handle full circle case
  if (angleDiff >= TWO_PI - 0.001) {
    const mid = sa + Math.PI;
    const outerMidX = cx + outerR * Math.cos(mid);
    const outerMidY = cy + outerR * Math.sin(mid);
    const innerMidX = cx + innerR * Math.cos(mid);
    const innerMidY = cy + innerR * Math.sin(mid);
    return [
      `M ${outerStartX} ${outerStartY}`,
      `A ${outerR} ${outerR} 0 1 1 ${outerMidX} ${outerMidY}`,
      `A ${outerR} ${outerR} 0 1 1 ${outerStartX} ${outerStartY}`,
      `L ${innerEndX} ${innerEndY}`,
      `A ${innerR} ${innerR} 0 1 0 ${innerMidX} ${innerMidY}`,
      `A ${innerR} ${innerR} 0 1 0 ${innerEndX} ${innerEndY}`,
      'Z',
    ].join(' ');
  }

  return [
    `M ${outerStartX} ${outerStartY}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEndX} ${outerEndY}`,
    `L ${innerStartX} ${innerStartY}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerEndX} ${innerEndY}`,
    'Z',
  ].join(' ');
}

// -- Layout computation (iterative) -------------------------------------------

function computeLayout(
  root: SunburstNode,
  innerRadius: number,
  maxRadius: number,
  colors: string[],
): ArcSegment[] {
  const segments: ArcSegment[] = [];
  const rootValue = computeNodeValue(root);
  if (rootValue <= 0) return segments;

  const maxDepth = computeMaxDepth(root);
  const ringWidth = maxDepth > 0 ? (maxRadius - innerRadius) / (maxDepth + 1) : maxRadius - innerRadius;

  // BFS queue: each item has node, startAngle, endAngle, depth, colorIndex
  const queue: {
    node: SunburstNode;
    startAngle: number;
    endAngle: number;
    depth: number;
    colorIndex: number;
  }[] = [];

  // Initialize with root's children (or root itself if leaf)
  if (root.children && root.children.length > 0) {
    let angle = 0;
    for (let i = 0; i < root.children.length; i++) {
      const child = root.children[i]!;
      const childVal = computeNodeValue(child);
      if (childVal <= 0) continue;
      const sweep = (childVal / rootValue) * TWO_PI;
      queue.push({
        node: child,
        startAngle: angle,
        endAngle: angle + sweep,
        depth: 0,
        colorIndex: i,
      });
      angle += sweep;
    }
  } else {
    // Single leaf root
    segments.push({
      startAngle: 0,
      endAngle: TWO_PI,
      innerR: innerRadius,
      outerR: innerRadius + ringWidth,
      label: root.label,
      value: rootValue,
      color: root.color ?? colors[0]!,
      depth: 0,
    });
    return segments;
  }

  while (queue.length > 0) {
    const item = queue.shift()!;
    const { node, startAngle, endAngle, depth, colorIndex } = item;
    const nodeVal = computeNodeValue(node);
    if (nodeVal <= 0) continue;

    const iR = innerRadius + depth * ringWidth;
    const oR = iR + ringWidth;

    segments.push({
      startAngle,
      endAngle,
      innerR: iR,
      outerR: oR,
      label: node.label,
      value: nodeVal,
      color: node.color ?? colors[colorIndex % colors.length]!,
      depth,
    });

    // Enqueue children
    if (node.children && node.children.length > 0) {
      let childAngle = startAngle;
      const angleSweep = endAngle - startAngle;
      for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i]!;
        const childVal = computeNodeValue(child);
        if (childVal <= 0) continue;
        const childSweep = (childVal / nodeVal) * angleSweep;
        queue.push({
          node: child,
          startAngle: childAngle,
          endAngle: childAngle + childSweep,
          depth: depth + 1,
          colorIndex,
        });
        childAngle += childSweep;
      }
    }
  }

  return segments;
}

// -- Component ----------------------------------------------------------------

export function Sunburst(props: SunburstProps) {
  const {
    data,
    width = 500,
    height = 500,
    innerRadius = 40,
    showLabels = true,
    colors = DEFAULT_COLORS,
    strokeColor = '#ffffff',
    strokeWidth = 1,
    title,
  } = props;

  const cx = width / 2;
  const cy = height / 2;
  const titleOffset = title ? 20 : 0;
  const maxRadius = Math.min(cx, cy - titleOffset) - 10;

  // Handle empty data
  const totalValue = useMemo(() => computeNodeValue(data), [data]);

  if (totalValue <= 0) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty sunburst chart',
      },
      createElement(
        'text',
        {
          x: String(cx),
          y: String(cy),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#9ca3af',
        },
        'No data to display',
      ),
    );
  }

  const segments = useMemo(
    () => computeLayout(data, innerRadius, maxRadius, colors),
    [data, innerRadius, maxRadius, colors],
  );

  const elements: ReturnType<typeof createElement>[] = [];

  // Title
  if (title) {
    elements.push(
      createElement(
        'text',
        {
          key: 'title',
          x: String(cx),
          y: String(20),
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

  // Arc segments
  const effectiveCy = cy + titleOffset / 2;

  for (let i = 0; i < segments.length; i++) {
    const seg = segments[i]!;
    const d = describeArc(cx, effectiveCy, seg.innerR, seg.outerR, seg.startAngle, seg.endAngle);

    elements.push(
      createElement('path', {
        key: `arc-${i}`,
        d,
        fill: seg.color,
        stroke: strokeColor,
        'stroke-width': String(strokeWidth),
        role: 'graphics-symbol',
        'aria-label': `${seg.label}: ${seg.value}`,
      }),
    );

    // Label
    if (showLabels) {
      const angleDiff = seg.endAngle - seg.startAngle;
      const midAngle = seg.startAngle + angleDiff / 2 - Math.PI / 2;
      const midR = (seg.innerR + seg.outerR) / 2;
      const ringW = seg.outerR - seg.innerR;
      const arcLen = angleDiff * midR;

      // Only show label if segment is large enough
      if (arcLen > 20 && ringW > 14) {
        const lx = cx + midR * Math.cos(midAngle);
        const ly = effectiveCy + midR * Math.sin(midAngle);
        const maxChars = Math.floor(Math.min(arcLen, ringW) / 7);
        const displayLabel = seg.label.length > maxChars
          ? seg.label.substring(0, Math.max(1, maxChars - 1)) + '..'
          : seg.label;

        elements.push(
          createElement(
            'text',
            {
              key: `label-${i}`,
              x: String(lx),
              y: String(ly + 4),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#ffffff',
              'pointer-events': 'none',
            },
            displayLabel,
          ),
        );
      }
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
      'aria-label': title ?? 'Sunburst chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...elements,
  );
}
