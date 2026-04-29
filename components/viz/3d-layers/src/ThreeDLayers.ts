// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ThreeDLayers — A SpecifyJS component that renders pseudo-3D stacked
 * surface/layer visualizations as isometric SVG.
 *
 * Supports:
 *  - Multiple stacked layers, each a 2D grid of height values
 *  - Configurable perspective, rotation, and layer spacing
 *  - Color-coded layers with opacity control
 *  - Axis labels and layer labels
 *  - Simple affine 3D-to-2D projection (no WebGL)
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface Layer3D {
  label: string;
  data: number[][];
  color?: string;
  opacity?: number;
}

// -- Props --------------------------------------------------------------------

export interface ThreeDLayersProps {
  /** Array of layers, each containing a 2D grid of height values */
  layers: Layer3D[];
  /** SVG width in pixels (default: 700) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Perspective strength (default: 0.5) — 0 = flat, 1 = strong perspective */
  perspective?: number;
  /** X-axis rotation in degrees (default: 35) */
  rotateX?: number;
  /** Y-axis rotation in degrees (default: 45) */
  rotateY?: number;
  /** Show layer labels (default: true) */
  showLabels?: boolean;
  /** Show 3D axes (default: true) */
  showAxes?: boolean;
  /** Vertical spacing between layers in data units (default: 2) */
  layerSpacing?: number;
  /** Color palette for layers (default: built-in palette) */
  colorScale?: string[];
  /** Grid wireframe color (default: '#94a3b8') */
  gridColor?: string;
  /** Chart title */
  title?: string;
}

// -- Default palette ----------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- 3D projection helpers ---------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;

/**
 * Project a 3D point (x, y, z) to 2D screen coordinates using
 * an isometric-style affine transformation.
 *
 * @param x - lateral position
 * @param y - depth position
 * @param z - height (vertical)
 * @param rotX - rotation around X axis in degrees
 * @param rotY - rotation around Y axis in degrees
 * @param perspective - perspective strength [0, 1]
 * @param centerX - screen center X
 * @param centerY - screen center Y
 * @param scale - overall scale factor
 */
function project3D(
  x: number,
  y: number,
  z: number,
  rotX: number,
  rotY: number,
  _perspective: number,
  centerX: number,
  centerY: number,
  scale: number,
): { sx: number; sy: number; depth: number } {
  const cosX = Math.cos(rotX * DEG_TO_RAD);
  const sinX = Math.sin(rotX * DEG_TO_RAD);
  const cosY = Math.cos(rotY * DEG_TO_RAD);
  const sinY = Math.sin(rotY * DEG_TO_RAD);

  // Rotate around Y axis first
  const x1 = x * cosY - y * sinY;
  const y1 = x * sinY + y * cosY;
  const z1 = z;

  // Then rotate around X axis
  const x2 = x1;
  const y2 = y1 * cosX - z1 * sinX;
  const z2 = y1 * sinX + z1 * cosX;

  // Project to 2D (perspective is handled via slight scale variation)
  const perspFactor = 1.0 + _perspective * 0.001 * z2;
  const sx = centerX + x2 * scale * perspFactor;
  const sy = centerY - y2 * scale * perspFactor;

  return { sx, sy, depth: z2 };
}

// -- Color helpers ------------------------------------------------------------

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  let r: number;
  let g: number;
  let b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0]! + clean[0]!, 16);
    g = parseInt(clean[1]! + clean[1]!, 16);
    b = parseInt(clean[2]! + clean[2]!, 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  r = isNaN(r) ? 0 : r;
  g = isNaN(g) ? 0 : g;
  b = isNaN(b) ? 0 : b;

  return `rgba(${r},${g},${b},${alpha})`;
}

function darkenHex(hex: string, factor: number): string {
  const clean = hex.replace('#', '');
  let r: number;
  let g: number;
  let b: number;

  if (clean.length === 3) {
    r = parseInt(clean[0]! + clean[0]!, 16);
    g = parseInt(clean[1]! + clean[1]!, 16);
    b = parseInt(clean[2]! + clean[2]!, 16);
  } else {
    r = parseInt(clean.substring(0, 2), 16);
    g = parseInt(clean.substring(2, 4), 16);
    b = parseInt(clean.substring(4, 6), 16);
  }

  r = isNaN(r) ? 0 : r;
  g = isNaN(g) ? 0 : g;
  b = isNaN(b) ? 0 : b;

  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');

  return '#' + toHex(r) + toHex(g) + toHex(b);
}

// -- Component ----------------------------------------------------------------

export function ThreeDLayers(props: ThreeDLayersProps) {
  const {
    layers,
    width = 700,
    height = 500,
    perspective = 0.5,
    rotateX = 35,
    rotateY = 45,
    showLabels = true,
    showAxes = true,
    layerSpacing = 2,
    colorScale = DEFAULT_PALETTE,
    gridColor = '#94a3b8',
    title,
  } = props;

  // Determine grid dimensions from layer data
  const gridInfo = useMemo(() => {
    let maxRows = 0;
    let maxCols = 0;
    let maxHeight = 0;

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]!;
      const rows = layer.data.length;
      if (rows > maxRows) maxRows = rows;

      for (let r = 0; r < rows; r++) {
        const cols = layer.data[r]!.length;
        if (cols > maxCols) maxCols = cols;

        for (let c = 0; c < cols; c++) {
          const val = Math.abs(layer.data[r]![c] ?? 0);
          if (val > maxHeight) maxHeight = val;
        }
      }
    }

    return {
      maxRows: Math.max(maxRows, 1),
      maxCols: Math.max(maxCols, 1),
      maxHeight: maxHeight > 0 ? maxHeight : 1,
    };
  }, [layers]);

  // Compute scale so that the entire scene fits within the viewport
  const sceneScale = useMemo(() => {
    const totalVerticalExtent = gridInfo.maxHeight +
      (layers.length - 1) * layerSpacing + gridInfo.maxHeight;
    const sceneDiagonal = Math.sqrt(
      gridInfo.maxCols * gridInfo.maxCols +
      gridInfo.maxRows * gridInfo.maxRows +
      totalVerticalExtent * totalVerticalExtent,
    );
    const viewportMin = Math.min(width, height) * 0.75;
    return sceneDiagonal > 0 ? viewportMin / sceneDiagonal : 1;
  }, [gridInfo, layers.length, layerSpacing, width, height]);

  const centerX = width / 2;
  const centerY = height / 2;

  // Helper to project a point using current scene parameters
  const proj = useCallback(
    (x: number, y: number, z: number) =>
      project3D(x, y, z, rotateX, rotateY, perspective, centerX, centerY, sceneScale),
    [rotateX, rotateY, perspective, centerX, centerY, sceneScale],
  );

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    if (!showAxes) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const axisLen = Math.max(gridInfo.maxCols, gridInfo.maxRows);
    const halfCols = gridInfo.maxCols / 2;
    const halfRows = gridInfo.maxRows / 2;

    // X axis
    const xStart = proj(-halfCols, -halfRows, 0);
    const xEnd = proj(halfCols, -halfRows, 0);
    elements.push(
      createElement('line', {
        key: 'axis-x',
        x1: String(xStart.sx),
        y1: String(xStart.sy),
        x2: String(xEnd.sx),
        y2: String(xEnd.sy),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );
    elements.push(
      createElement(
        'text',
        {
          key: 'axis-x-label',
          x: String(xEnd.sx + 8),
          y: String(xEnd.sy + 4),
          'font-size': '11',
          'font-family': 'sans-serif',
          fill: '#374151',
        },
        'X',
      ),
    );

    // Y axis (depth)
    const yEnd = proj(-halfCols, halfRows, 0);
    elements.push(
      createElement('line', {
        key: 'axis-y',
        x1: String(xStart.sx),
        y1: String(xStart.sy),
        x2: String(yEnd.sx),
        y2: String(yEnd.sy),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );
    elements.push(
      createElement(
        'text',
        {
          key: 'axis-y-label',
          x: String(yEnd.sx - 12),
          y: String(yEnd.sy + 4),
          'font-size': '11',
          'font-family': 'sans-serif',
          fill: '#374151',
        },
        'Y',
      ),
    );

    // Z axis (height)
    const totalZ = gridInfo.maxHeight + (layers.length - 1) * layerSpacing;
    const zEnd = proj(-halfCols, -halfRows, totalZ);
    elements.push(
      createElement('line', {
        key: 'axis-z',
        x1: String(xStart.sx),
        y1: String(xStart.sy),
        x2: String(zEnd.sx),
        y2: String(zEnd.sy),
        stroke: '#374151',
        'stroke-width': '1.5',
      }),
    );
    elements.push(
      createElement(
        'text',
        {
          key: 'axis-z-label',
          x: String(zEnd.sx - 4),
          y: String(zEnd.sy - 8),
          'font-size': '11',
          'font-family': 'sans-serif',
          fill: '#374151',
        },
        'Z',
      ),
    );

    return elements;
  }, [showAxes, gridInfo, layers.length, layerSpacing, proj]);

  // ---- Layers (surfaces) ----------------------------------------------------

  const buildLayers = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    const halfCols = gridInfo.maxCols / 2;
    const halfRows = gridInfo.maxRows / 2;

    // We render layers from back to front (painter's algorithm).
    // Collect all polygons with depth, then sort.
    const polygons: Array<{
      points: string;
      fill: string;
      stroke: string;
      strokeWidth: string;
      depth: number;
      key: string;
    }> = [];

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]!;
      const layerColor = layer.color ?? colorScale[li % colorScale.length]!;
      const layerOpacity = layer.opacity ?? 0.7;
      const zOffset = li * layerSpacing;

      const rows = layer.data.length;

      for (let r = 0; r < rows - 1; r++) {
        const row0 = layer.data[r]!;
        const row1 = layer.data[r + 1]!;
        const cols = Math.min(row0.length, row1.length);

        for (let c = 0; c < cols - 1; c++) {
          // Four corners of the quad
          const x0 = c - halfCols;
          const x1 = (c + 1) - halfCols;
          const y0 = r - halfRows;
          const y1 = (r + 1) - halfRows;

          const z00 = (row0[c] ?? 0) + zOffset;
          const z10 = (row0[c + 1] ?? 0) + zOffset;
          const z01 = (row1[c] ?? 0) + zOffset;
          const z11 = (row1[c + 1] ?? 0) + zOffset;

          const p00 = proj(x0, y0, z00);
          const p10 = proj(x1, y0, z10);
          const p01 = proj(x0, y1, z01);
          const p11 = proj(x1, y1, z11);

          const avgDepth = (p00.depth + p10.depth + p01.depth + p11.depth) / 4;

          const pointsStr =
            `${p00.sx},${p00.sy} ${p10.sx},${p10.sy} ${p11.sx},${p11.sy} ${p01.sx},${p01.sy}`;

          polygons.push({
            points: pointsStr,
            fill: hexToRgba(layerColor, layerOpacity),
            stroke: darkenHex(layerColor, 0.7),
            strokeWidth: '0.5',
            depth: avgDepth,
            key: `quad-${li}-${r}-${c}`,
          });
        }
      }

      // If there are no grid cells (single row or single column), draw individual points
      if (rows === 1 || (rows > 0 && layer.data[0]!.length === 1)) {
        for (let r = 0; r < rows; r++) {
          const row = layer.data[r]!;
          for (let c = 0; c < row.length; c++) {
            const x = c - halfCols;
            const y = r - halfRows;
            const z = (row[c] ?? 0) + zOffset;
            const p = proj(x, y, z);

            // Render as a small diamond
            const sz = 3;
            const diamondPoints =
              `${p.sx},${p.sy - sz} ${p.sx + sz},${p.sy} ${p.sx},${p.sy + sz} ${p.sx - sz},${p.sy}`;

            polygons.push({
              points: diamondPoints,
              fill: hexToRgba(layerColor, layerOpacity),
              stroke: darkenHex(layerColor, 0.7),
              strokeWidth: '0.5',
              depth: p.depth,
              key: `point-${li}-${r}-${c}`,
            });
          }
        }
      }
    }

    // Sort polygons by depth (back-to-front: lowest depth first)
    polygons.sort((a, b) => a.depth - b.depth);

    for (let i = 0; i < polygons.length; i++) {
      const poly = polygons[i]!;
      elements.push(
        createElement('polygon', {
          key: poly.key,
          points: poly.points,
          fill: poly.fill,
          stroke: poly.stroke,
          'stroke-width': poly.strokeWidth,
          'stroke-linejoin': 'round',
        }),
      );
    }

    return elements;
  }, [layers, gridInfo, layerSpacing, colorScale, proj]);

  // ---- Base grid (wireframe on z=0 plane) -----------------------------------

  const buildBaseGrid = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    const halfCols = gridInfo.maxCols / 2;
    const halfRows = gridInfo.maxRows / 2;

    // Horizontal lines (along X)
    for (let r = 0; r <= gridInfo.maxRows; r++) {
      const y = r - halfRows;
      const start = proj(-halfCols, y, 0);
      const end = proj(halfCols, y, 0);
      elements.push(
        createElement('line', {
          key: `base-h-${r}`,
          x1: String(start.sx),
          y1: String(start.sy),
          x2: String(end.sx),
          y2: String(end.sy),
          stroke: gridColor,
          'stroke-width': '0.3',
          'stroke-dasharray': '2 2',
          opacity: '0.5',
        }),
      );
    }

    // Vertical lines (along Y)
    for (let c = 0; c <= gridInfo.maxCols; c++) {
      const x = c - halfCols;
      const start = proj(x, -halfRows, 0);
      const end = proj(x, halfRows, 0);
      elements.push(
        createElement('line', {
          key: `base-v-${c}`,
          x1: String(start.sx),
          y1: String(start.sy),
          x2: String(end.sx),
          y2: String(end.sy),
          stroke: gridColor,
          'stroke-width': '0.3',
          'stroke-dasharray': '2 2',
          opacity: '0.5',
        }),
      );
    }

    return elements;
  }, [gridInfo, gridColor, proj]);

  // ---- Layer labels ---------------------------------------------------------

  const buildLabels = useCallback(() => {
    if (!showLabels) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const halfCols = gridInfo.maxCols / 2;
    const halfRows = gridInfo.maxRows / 2;

    for (let li = 0; li < layers.length; li++) {
      const layer = layers[li]!;
      const zOffset = li * layerSpacing;

      // Compute average height for this layer
      let sumZ = 0;
      let count = 0;
      for (let r = 0; r < layer.data.length; r++) {
        const row = layer.data[r]!;
        for (let c = 0; c < row.length; c++) {
          sumZ += (row[c] ?? 0);
          count++;
        }
      }
      const avgZ = count > 0 ? sumZ / count : 0;

      // Place label at the right edge of the layer
      const labelPos = proj(halfCols + 1, 0, avgZ + zOffset);
      const layerColor = layer.color ?? colorScale[li % colorScale.length]!;

      elements.push(
        createElement(
          'text',
          {
            key: `layer-label-${li}`,
            x: String(labelPos.sx + 8),
            y: String(labelPos.sy + 4),
            'font-size': '11',
            'font-family': 'sans-serif',
            'font-weight': 'bold',
            fill: layerColor,
          },
          layer.label,
        ),
      );
    }

    return elements;
  }, [showLabels, layers, gridInfo, layerSpacing, colorScale, proj]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(24),
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

  const titleEl = buildTitle();
  const baseGridEls = buildBaseGrid();
  const axesEls = buildAxes();
  const layerEls = buildLayers();
  const labelEls = buildLabels();

  // Handle empty layers
  const emptyMessage = layers.length === 0
    ? [
        createElement(
          'text',
          {
            key: 'empty-msg',
            x: String(width / 2),
            y: String(height / 2),
            'text-anchor': 'middle',
            'font-size': '14',
            'font-family': 'sans-serif',
            fill: '#9ca3af',
          },
          'No layer data',
        ),
      ]
    : [];

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? '3D layer visualization',
      style: { fontFamily: 'sans-serif', maxWidth: '100%' },
    },
    ...titleEl,
    ...emptyMessage,
    ...baseGridEls,
    ...axesEls,
    ...layerEls,
    ...labelEls,
  );
}
