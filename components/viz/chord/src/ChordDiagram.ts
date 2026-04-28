// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ChordDiagram — A SpecifyJS component that renders circular chord diagrams as SVG.
 *
 * Supports:
 *  - Outer arcs proportional to total flow
 *  - Ribbons between arcs showing directional flow
 *  - Labels and value annotations
 *  - Configurable colors, padding angle, opacity
 *  - Matrix-based input (matrix[i][j] = flow from i to j)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface ChordDiagramProps {
  /** Square matrix where matrix[i][j] = flow from group i to group j */
  matrix: number[][];
  /** Labels for each group (must match matrix dimensions) */
  labels: string[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 600) */
  height?: number;
  /** Color palette for groups */
  colors?: string[];
  /** Angular padding between arcs in radians (default: 0.05) */
  padAngle?: number;
  /** Show group labels (default: true) */
  showLabels?: boolean;
  /** Show flow values on hover/annotation (default: false) */
  showValues?: boolean;
  /** Ribbon fill opacity 0..1 (default: 0.5) */
  ribbonOpacity?: number;
  /** Inner radius as ratio of outer radius (default: 0.9) */
  innerRadiusRatio?: number;
  /** Chart title */
  title?: string;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Layout types -------------------------------------------------------------

interface GroupArc {
  index: number;
  label: string;
  color: string;
  startAngle: number;
  endAngle: number;
  value: number;
}

interface ChordRibbon {
  sourceIndex: number;
  targetIndex: number;
  sourceStartAngle: number;
  sourceEndAngle: number;
  targetStartAngle: number;
  targetEndAngle: number;
  value: number;
  color: string;
}

// -- Geometry helpers ---------------------------------------------------------

/** Convert polar to Cartesian. Angle 0 = top (12 o'clock). */
function polarToCartesian(
  cx: number,
  cy: number,
  r: number,
  angleRad: number,
): { x: number; y: number } {
  // Offset by -PI/2 so 0 starts at top
  const a = angleRad - Math.PI / 2;
  return {
    x: cx + r * Math.cos(a),
    y: cy + r * Math.sin(a),
  };
}

/** SVG arc path from startAngle to endAngle. */
function arcPath(
  cx: number,
  cy: number,
  r: number,
  startAngle: number,
  endAngle: number,
): string {
  const start = polarToCartesian(cx, cy, r, startAngle);
  const end = polarToCartesian(cx, cy, r, endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

/** SVG path for the outer band (thick arc) of a group. */
function bandPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const outerStart = polarToCartesian(cx, cy, outerR, startAngle);
  const outerEnd = polarToCartesian(cx, cy, outerR, endAngle);
  const innerStart = polarToCartesian(cx, cy, innerR, startAngle);
  const innerEnd = polarToCartesian(cx, cy, innerR, endAngle);
  const sweep = endAngle - startAngle;
  const largeArc = sweep > Math.PI ? 1 : 0;

  return [
    `M ${outerStart.x} ${outerStart.y}`,
    `A ${outerR} ${outerR} 0 ${largeArc} 1 ${outerEnd.x} ${outerEnd.y}`,
    `L ${innerEnd.x} ${innerEnd.y}`,
    `A ${innerR} ${innerR} 0 ${largeArc} 0 ${innerStart.x} ${innerStart.y}`,
    'Z',
  ].join(' ');
}

/** SVG path for a ribbon connecting two arcs via quadratic Bezier through center. */
function ribbonPath(
  cx: number,
  cy: number,
  r: number,
  srcStart: number,
  srcEnd: number,
  tgtStart: number,
  tgtEnd: number,
): string {
  const s0 = polarToCartesian(cx, cy, r, srcStart);
  const s1 = polarToCartesian(cx, cy, r, srcEnd);
  const t0 = polarToCartesian(cx, cy, r, tgtStart);
  const t1 = polarToCartesian(cx, cy, r, tgtEnd);

  const srcSweep = srcEnd - srcStart;
  const tgtSweep = tgtEnd - tgtStart;
  const srcLargeArc = srcSweep > Math.PI ? 1 : 0;
  const tgtLargeArc = tgtSweep > Math.PI ? 1 : 0;

  return [
    `M ${s0.x} ${s0.y}`,
    `A ${r} ${r} 0 ${srcLargeArc} 1 ${s1.x} ${s1.y}`,
    `Q ${cx} ${cy} ${t0.x} ${t0.y}`,
    `A ${r} ${r} 0 ${tgtLargeArc} 1 ${t1.x} ${t1.y}`,
    `Q ${cx} ${cy} ${s0.x} ${s0.y}`,
    'Z',
  ].join(' ');
}

// -- Layout computation -------------------------------------------------------

function computeChordLayout(
  matrix: number[][],
  labels: string[],
  colors: string[],
  padAngle: number,
): { groups: GroupArc[]; chords: ChordRibbon[] } {
  const n = matrix.length;
  if (n === 0) return { groups: [], chords: [] };

  // Compute row totals
  const totals: number[] = [];
  let grandTotal = 0;
  for (let i = 0; i < n; i++) {
    let rowTotal = 0;
    for (let j = 0; j < n; j++) {
      const val = matrix[i]?.[j] ?? 0;
      rowTotal += Math.max(0, val);
    }
    totals.push(rowTotal);
    grandTotal += rowTotal;
  }

  // If grand total is 0, distribute evenly
  if (grandTotal === 0) {
    const anglePerGroup = (2 * Math.PI - n * padAngle) / Math.max(n, 1);
    const groups: GroupArc[] = [];
    let angle = 0;
    for (let i = 0; i < n; i++) {
      groups.push({
        index: i,
        label: labels[i] ?? `Group ${i}`,
        color: colors[i % colors.length]!,
        startAngle: angle,
        endAngle: angle + anglePerGroup,
        value: 0,
      });
      angle += anglePerGroup + padAngle;
    }
    return { groups, chords: [] };
  }

  // Assign angles proportional to totals
  const totalAngle = 2 * Math.PI - n * padAngle;
  const groups: GroupArc[] = [];
  let currentAngle = 0;

  for (let i = 0; i < n; i++) {
    const groupAngle = (totals[i]! / grandTotal) * totalAngle;
    groups.push({
      index: i,
      label: labels[i] ?? `Group ${i}`,
      color: colors[i % colors.length]!,
      startAngle: currentAngle,
      endAngle: currentAngle + groupAngle,
      value: totals[i]!,
    });
    currentAngle += groupAngle + padAngle;
  }

  // Compute chords (ribbons)
  // Track angle offsets within each group for placing chord endpoints
  const offsets: number[] = [];
  for (let i = 0; i < n; i++) {
    offsets.push(groups[i]!.startAngle);
  }

  const chords: ChordRibbon[] = [];
  for (let i = 0; i < n; i++) {
    for (let j = i; j < n; j++) {
      const valIJ = Math.max(0, matrix[i]?.[j] ?? 0);
      const valJI = i === j ? 0 : Math.max(0, matrix[j]?.[i] ?? 0);

      if (valIJ === 0 && valJI === 0) continue;

      const totalVal = valIJ + valJI;

      // Source arc span
      const srcSpanI = totals[i]! > 0
        ? (valIJ / grandTotal) * totalAngle
        : 0;
      const srcStartI = offsets[i]!;
      const srcEndI = srcStartI + srcSpanI;
      offsets[i] = srcEndI;

      // Target arc span for i->j
      const tgtSpanJ = totals[j]! > 0
        ? (valIJ / grandTotal) * totalAngle
        : 0;
      const tgtStartJ = offsets[j]!;
      const tgtEndJ = tgtStartJ + tgtSpanJ;
      offsets[j] = tgtEndJ;

      if (i === j) {
        // Self-loop chord
        if (valIJ > 0) {
          chords.push({
            sourceIndex: i,
            targetIndex: j,
            sourceStartAngle: srcStartI,
            sourceEndAngle: srcEndI,
            targetStartAngle: tgtStartJ,
            targetEndAngle: tgtEndJ,
            value: valIJ,
            color: groups[i]!.color,
          });
        }
        continue;
      }

      // j->i portion
      const srcSpanJ = totals[j]! > 0
        ? (valJI / grandTotal) * totalAngle
        : 0;
      const srcStartJ = offsets[j]!;
      const srcEndJ = srcStartJ + srcSpanJ;
      offsets[j] = srcEndJ;

      const tgtSpanI = totals[i]! > 0
        ? (valJI / grandTotal) * totalAngle
        : 0;
      const tgtStartI = offsets[i]!;
      const tgtEndI = tgtStartI + tgtSpanI;
      offsets[i] = tgtEndI;

      if (valIJ > 0 || valJI > 0) {
        chords.push({
          sourceIndex: i,
          targetIndex: j,
          sourceStartAngle: srcStartI,
          sourceEndAngle: Math.max(srcEndI, srcStartI + 0.001),
          targetStartAngle: tgtStartJ,
          targetEndAngle: Math.max(tgtEndJ, tgtStartJ + 0.001),
          value: totalVal,
          color: groups[i]!.color,
        });
      }
    }
  }

  return { groups, chords };
}

// -- Component ----------------------------------------------------------------

export function ChordDiagram(props: ChordDiagramProps) {
  const {
    matrix,
    labels,
    width = 600,
    height = 600,
    colors = DEFAULT_PALETTE,
    padAngle = 0.05,
    showLabels = true,
    showValues = false,
    ribbonOpacity = 0.5,
    innerRadiusRatio = 0.9,
    title,
  } = props;

  // Handle empty/invalid data
  if (!matrix || matrix.length === 0 || !labels || labels.length === 0) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(height),
        viewBox: `0 0 ${width} ${height}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty chord diagram',
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

  const cx = width / 2;
  const cy = height / 2;
  const outerRadius = Math.min(width, height) / 2 - 40;
  const innerRadius = outerRadius * Math.max(0.5, Math.min(0.99, innerRadiusRatio));
  const labelRadius = outerRadius + 16;

  const layout = useMemo(
    () => computeChordLayout(matrix, labels, colors, padAngle),
    [matrix, labels, colors, padAngle],
  );

  // ---- Build group arcs -----------------------------------------------------

  const buildArcs = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layout.groups.length; i++) {
      const group = layout.groups[i]!;
      const arcSweep = group.endAngle - group.startAngle;
      if (arcSweep < 0.001) continue;

      // Outer band (thick arc)
      const d = bandPath(cx, cy, outerRadius, innerRadius, group.startAngle, group.endAngle);

      elements.push(
        createElement('path', {
          key: `arc-${i}`,
          d,
          fill: group.color,
          stroke: '#fff',
          'stroke-width': '1',
          role: 'img',
          'aria-label': `${group.label}: ${group.value}`,
        }),
      );

      // Label
      if (showLabels) {
        const midAngle = (group.startAngle + group.endAngle) / 2;
        const labelPos = polarToCartesian(cx, cy, labelRadius, midAngle);

        // Determine text anchor based on position
        const adjustedAngle = midAngle - Math.PI / 2;
        const normalizedAngle = ((adjustedAngle % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const isRightSide = normalizedAngle < Math.PI;
        const textAnchor = isRightSide ? 'start' : 'end';

        // Rotation for readability
        let rotation = (midAngle * 180) / Math.PI - 90;
        if (!isRightSide) {
          rotation += 180;
        }

        const labelText = showValues
          ? `${group.label} (${group.value})`
          : group.label;

        elements.push(
          createElement(
            'text',
            {
              key: `label-${i}`,
              x: String(labelPos.x),
              y: String(labelPos.y),
              'text-anchor': textAnchor,
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
              transform: `rotate(${rotation}, ${labelPos.x}, ${labelPos.y})`,
              'dominant-baseline': 'central',
              'pointer-events': 'none',
            },
            labelText,
          ),
        );
      }
    }

    return elements;
  }, [layout, cx, cy, outerRadius, innerRadius, labelRadius, showLabels, showValues]);

  // ---- Build ribbons --------------------------------------------------------

  const buildRibbons = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < layout.chords.length; i++) {
      const chord = layout.chords[i]!;

      const d = ribbonPath(
        cx, cy, innerRadius,
        chord.sourceStartAngle, chord.sourceEndAngle,
        chord.targetStartAngle, chord.targetEndAngle,
      );

      elements.push(
        createElement('path', {
          key: `ribbon-${i}`,
          d,
          fill: chord.color,
          'fill-opacity': String(ribbonOpacity),
          stroke: chord.color,
          'stroke-width': '0.5',
          'stroke-opacity': '0.3',
        }),
      );
    }

    return elements;
  }, [layout, cx, cy, innerRadius, ribbonOpacity]);

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

  const ribbonElements = buildRibbons();
  const arcElements = buildArcs();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Chord diagram',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...ribbonElements,
    ...arcElements,
  );
}
