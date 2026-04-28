// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VectorField — A SpecifyJS component that renders 2D vector field plots as SVG.
 *
 * Supports:
 *  - Pre-computed vector data arrays
 *  - Functional vector fields: (x, y) => { dx, dy }
 *  - Configurable grid resolution
 *  - Arrow rendering with proper arrowheads
 *  - Color-by-magnitude with configurable color scale
 *  - Optional grid lines and axes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface VectorDatum {
  x: number;
  y: number;
  dx: number;
  dy: number;
  magnitude?: number;
}

// -- Props --------------------------------------------------------------------

export interface VectorFieldProps {
  /** Pre-computed vector data */
  data?: VectorDatum[];
  /** Function that computes vector at each grid point */
  vectorFunction?: (x: number, y: number) => { dx: number; dy: number };
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 600) */
  height?: number;
  /** Number of arrows per axis when using vectorFunction (default: 15) */
  gridSize?: number;
  /** X-axis domain (default: [-5, 5]) */
  xRange?: [number, number];
  /** Y-axis domain (default: [-5, 5]) */
  yRange?: [number, number];
  /** Scale factor for arrow length (default: 1) */
  arrowScale?: number;
  /** Default arrow color (default: '#3b82f6') */
  arrowColor?: string;
  /** Show background grid (default: true) */
  showGrid?: boolean;
  /** Show axes through origin (default: true) */
  showAxes?: boolean;
  /** Color arrows by magnitude (default: false) */
  colorByMagnitude?: boolean;
  /** Color scale for magnitude coloring (default: blue-red) */
  colorScale?: string[];
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 50) */
  padding?: number;
}

// -- Color helpers ------------------------------------------------------------

function hexToRgb(hex: string): { r: number; g: number; b: number } {
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

  return { r: isNaN(r) ? 0 : r, g: isNaN(g) ? 0 : g, b: isNaN(b) ? 0 : b };
}

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

function interpolateColor(t: number, scale: string[]): string {
  if (scale.length === 0) return '#3b82f6';
  if (scale.length === 1) return scale[0]!;

  const clamped = Math.max(0, Math.min(1, t));
  const maxIdx = scale.length - 1;
  const position = clamped * maxIdx;
  const lower = Math.floor(position);
  const upper = Math.min(lower + 1, maxIdx);
  const frac = position - lower;

  const c1 = hexToRgb(scale[lower]!);
  const c2 = hexToRgb(scale[upper]!);

  return rgbToHex(
    c1.r + (c2.r - c1.r) * frac,
    c1.g + (c2.g - c1.g) * frac,
    c1.b + (c2.b - c1.b) * frac,
  );
}

// -- Nice grid step -----------------------------------------------------------

function niceStep(range: number, targetLines: number): number {
  if (range <= 0) return 1;
  const rough = range / targetLines;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

// -- Component ----------------------------------------------------------------

export function VectorField(props: VectorFieldProps) {
  const {
    data,
    vectorFunction,
    width = 600,
    height = 600,
    gridSize = 15,
    xRange = [-5, 5],
    yRange = [-5, 5],
    arrowScale = 1,
    arrowColor = '#3b82f6',
    showGrid = true,
    showAxes = true,
    colorByMagnitude = false,
    colorScale = ['#3b82f6', '#8b5cf6', '#ef4444'],
    title,
    padding = 50,
  } = props;

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xMin = xRange[0];
  const xMax = xRange[1];
  const yMin = yRange[0];
  const yMax = yRange[1];
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;

  // Map data-space to pixel-space
  const toPixelX = useCallback(
    (x: number) => padding + ((x - xMin) / xSpan) * chartWidth,
    [padding, xMin, xSpan, chartWidth],
  );

  const toPixelY = useCallback(
    (y: number) => padding + ((yMax - y) / ySpan) * chartHeight,
    [padding, yMax, ySpan, chartHeight],
  );

  // Build vector data (either from data prop or vectorFunction)
  const vectors = useMemo((): VectorDatum[] => {
    if (data && data.length > 0) return data;

    if (!vectorFunction) return [];

    const result: VectorDatum[] = [];
    const clampedGridSize = Math.max(2, Math.min(50, gridSize));
    const stepX = xSpan / (clampedGridSize - 1);
    const stepY = ySpan / (clampedGridSize - 1);

    for (let iy = 0; iy < clampedGridSize; iy++) {
      for (let ix = 0; ix < clampedGridSize; ix++) {
        const x = xMin + ix * stepX;
        const y = yMin + iy * stepY;
        const v = vectorFunction(x, y);
        const mag = Math.sqrt(v.dx * v.dx + v.dy * v.dy);
        result.push({ x, y, dx: v.dx, dy: v.dy, magnitude: mag });
      }
    }

    return result;
  }, [data, vectorFunction, gridSize, xMin, xMax, yMin, yMax, xSpan, ySpan]);

  // Compute max magnitude for normalization
  const maxMagnitude = useMemo(() => {
    let m = 0;
    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i]!;
      const mag = v.magnitude ?? Math.sqrt(v.dx * v.dx + v.dy * v.dy);
      if (mag > m) m = mag;
    }
    return m > 0 ? m : 1;
  }, [vectors]);

  // Auto-compute arrow scale based on grid density
  const effectiveArrowScale = useMemo(() => {
    const gridSpacing = Math.min(chartWidth, chartHeight) / Math.max(gridSize, 2);
    const baseScale = gridSpacing / (2 * maxMagnitude);
    return baseScale * arrowScale;
  }, [chartWidth, chartHeight, gridSize, maxMagnitude, arrowScale]);

  // ---- Grid lines -----------------------------------------------------------

  const buildGrid = useCallback(() => {
    if (!showGrid) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    // Vertical grid lines
    const xStep = niceStep(xSpan, 10);
    const xStart = Math.ceil(xMin / xStep) * xStep;
    for (let xVal = xStart; xVal <= xMax; xVal += xStep) {
      const px = toPixelX(xVal);
      elements.push(
        createElement('line', {
          key: `gridv-${xVal}`,
          x1: String(px),
          y1: String(padding),
          x2: String(px),
          y2: String(padding + chartHeight),
          stroke: '#e5e7eb',
          'stroke-width': '0.5',
        }),
      );

      // Tick label
      elements.push(
        createElement(
          'text',
          {
            key: `xtick-${xVal}`,
            x: String(px),
            y: String(padding + chartHeight + 16),
            'text-anchor': 'middle',
            'font-size': '10',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(Math.round(xVal * 100) / 100),
        ),
      );
    }

    // Horizontal grid lines
    const yStep = niceStep(ySpan, 10);
    const yStart = Math.ceil(yMin / yStep) * yStep;
    for (let yVal = yStart; yVal <= yMax; yVal += yStep) {
      const py = toPixelY(yVal);
      elements.push(
        createElement('line', {
          key: `gridh-${yVal}`,
          x1: String(padding),
          y1: String(py),
          x2: String(padding + chartWidth),
          y2: String(py),
          stroke: '#e5e7eb',
          'stroke-width': '0.5',
        }),
      );

      // Tick label
      elements.push(
        createElement(
          'text',
          {
            key: `ytick-${yVal}`,
            x: String(padding - 6),
            y: String(py + 4),
            'text-anchor': 'end',
            'font-size': '10',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(Math.round(yVal * 100) / 100),
        ),
      );
    }

    return elements;
  }, [showGrid, xMin, xMax, yMin, yMax, xSpan, ySpan, toPixelX, toPixelY, padding, chartWidth, chartHeight]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    if (!showAxes) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    // X axis (y = 0)
    if (yMin <= 0 && yMax >= 0) {
      const y0 = toPixelY(0);
      elements.push(
        createElement('line', {
          key: 'axis-x',
          x1: String(padding),
          y1: String(y0),
          x2: String(padding + chartWidth),
          y2: String(y0),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
    }

    // Y axis (x = 0)
    if (xMin <= 0 && xMax >= 0) {
      const x0 = toPixelX(0);
      elements.push(
        createElement('line', {
          key: 'axis-y',
          x1: String(x0),
          y1: String(padding),
          x2: String(x0),
          y2: String(padding + chartHeight),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
    }

    // Chart border
    elements.push(
      createElement('rect', {
        key: 'chart-border',
        x: String(padding),
        y: String(padding),
        width: String(chartWidth),
        height: String(chartHeight),
        fill: 'none',
        stroke: '#d1d5db',
        'stroke-width': '1',
      }),
    );

    return elements;
  }, [showAxes, xMin, xMax, yMin, yMax, toPixelX, toPixelY, padding, chartWidth, chartHeight]);

  // ---- Arrows ---------------------------------------------------------------

  const buildArrows = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];
    const arrowheadSize = 4;

    for (let i = 0; i < vectors.length; i++) {
      const v = vectors[i]!;
      const mag = v.magnitude ?? Math.sqrt(v.dx * v.dx + v.dy * v.dy);

      // Skip zero vectors
      if (mag < 1e-10) continue;

      const px = toPixelX(v.x);
      const py = toPixelY(v.y);

      // Scale the vector for display
      const scaledDx = v.dx * effectiveArrowScale;
      const scaledDy = -v.dy * effectiveArrowScale; // Flip y for SVG coordinates

      const endX = px + scaledDx;
      const endY = py + scaledDy;

      // Determine arrow color
      let color: string;
      if (colorByMagnitude) {
        const t = mag / maxMagnitude;
        color = interpolateColor(t, colorScale);
      } else {
        color = arrowColor;
      }

      // Arrow line
      elements.push(
        createElement('line', {
          key: `arrow-line-${i}`,
          x1: String(px),
          y1: String(py),
          x2: String(endX),
          y2: String(endY),
          stroke: color,
          'stroke-width': '1.5',
          'stroke-linecap': 'round',
        }),
      );

      // Arrowhead — two short lines from the tip
      const arrowLen = Math.sqrt(scaledDx * scaledDx + scaledDy * scaledDy);
      if (arrowLen > 2) {
        // Unit vector in arrow direction
        const ux = scaledDx / arrowLen;
        const uy = scaledDy / arrowLen;

        // Perpendicular vector
        const perpX = -uy;
        const perpY = ux;

        const headLen = Math.min(arrowheadSize, arrowLen * 0.4);

        const h1x = endX - ux * headLen + perpX * headLen * 0.5;
        const h1y = endY - uy * headLen + perpY * headLen * 0.5;
        const h2x = endX - ux * headLen - perpX * headLen * 0.5;
        const h2y = endY - uy * headLen - perpY * headLen * 0.5;

        elements.push(
          createElement('polygon', {
            key: `arrow-head-${i}`,
            points: `${endX},${endY} ${h1x},${h1y} ${h2x},${h2y}`,
            fill: color,
          }),
        );
      }
    }

    return elements;
  }, [vectors, toPixelX, toPixelY, effectiveArrowScale, colorByMagnitude, maxMagnitude, colorScale, arrowColor]);

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

  const gridEls = buildGrid();
  const axesEls = buildAxes();
  const arrowEls = buildArrows();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Vector field plot',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...gridEls,
    ...axesEls,
    ...arrowEls,
  );
}
