// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VectorField — A SpecifyJS component that renders 2D vector field plots.
 *
 * Supports:
 *  - Pre-computed vector data arrays
 *  - Functional vector fields: (x, y) => { dx, dy }
 *  - Configurable grid resolution
 *  - Arrow rendering with proper arrowheads
 *  - Color-by-magnitude with configurable color scale
 *  - Optional grid lines and axes
 *  - SVG rendering mode (default) for DOM-based output
 *  - Canvas rendering mode for high-performance rendering of many arrows
 *  - Custom compute worker for offloading vector computation
 *  - requestAnimationFrame-based animation in canvas mode
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG/Canvas.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface VectorDatum {
  x: number;
  y: number;
  dx: number;
  dy: number;
  magnitude?: number;
}

/** Function signature for a custom compute worker */
export type ComputeWorkerFn = (
  gridPoints: { x: number; y: number }[],
  uniforms: Record<string, number>,
) => { dx: number; dy: number }[];

// -- Props --------------------------------------------------------------------

export interface VectorFieldProps {
  /** Pre-computed vector data */
  data?: VectorDatum[];
  /** Function that computes vector at each grid point */
  vectorFunction?: (x: number, y: number) => { dx: number; dy: number };
  /** Width in pixels (default: 600) */
  width?: number;
  /** Height in pixels (default: 600) */
  height?: number;
  /** Number of arrows per axis when using vectorFunction (default: 15, max: 50) */
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
  /** Font size for axis tick labels in px (default: 10) */
  tickFontSize?: number;
  /** Arrow stroke width (default: 1.5) */
  arrowWidth?: number;
  /** Rendering mode: 'svg' for DOM-based, 'canvas' for Canvas 2D (default: 'svg') */
  renderer?: 'svg' | 'canvas';
  /** Enable GPU-accelerated compute via a custom worker function (default: false) */
  useGPU?: boolean;
  /** Custom compute function for vector field calculation (e.g. for radio propagation) */
  computeWorker?: ComputeWorkerFn;
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

// -- Shared vector computation ------------------------------------------------

function computeVectors(
  data: VectorDatum[] | undefined,
  vectorFunction: ((x: number, y: number) => { dx: number; dy: number }) | undefined,
  computeWorker: ComputeWorkerFn | undefined,
  gridSize: number,
  xMin: number,
  xMax: number,
  yMin: number,
  yMax: number,
  xSpan: number,
  ySpan: number,
): VectorDatum[] {
  if (data && data.length > 0) return data;

  const clampedGridSize = Math.max(2, Math.min(50, gridSize));
  const stepX = xSpan / (clampedGridSize - 1);
  const stepY = ySpan / (clampedGridSize - 1);

  // If a computeWorker is provided, use it
  if (computeWorker) {
    const gridPoints: { x: number; y: number }[] = [];
    for (let iy = 0; iy < clampedGridSize; iy++) {
      for (let ix = 0; ix < clampedGridSize; ix++) {
        gridPoints.push({
          x: xMin + ix * stepX,
          y: yMin + iy * stepY,
        });
      }
    }
    const uniforms: Record<string, number> = {
      gridSize: clampedGridSize,
      xMin,
      xMax,
      yMin,
      yMax,
    };
    const results = computeWorker(gridPoints, uniforms);
    const output: VectorDatum[] = [];
    for (let i = 0; i < gridPoints.length; i++) {
      const pt = gridPoints[i]!;
      const v = results[i] ?? { dx: 0, dy: 0 };
      const mag = Math.sqrt(v.dx * v.dx + v.dy * v.dy);
      output.push({ x: pt.x, y: pt.y, dx: v.dx, dy: v.dy, magnitude: mag });
    }
    return output;
  }

  if (!vectorFunction) return [];

  const result: VectorDatum[] = [];
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
}

// -- Canvas drawing -----------------------------------------------------------

function drawCanvasVectorField(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  vectors: VectorDatum[],
  options: {
    padding: number;
    chartWidth: number;
    chartHeight: number;
    xMin: number;
    xMax: number;
    yMin: number;
    yMax: number;
    xSpan: number;
    ySpan: number;
    showGrid: boolean;
    showAxes: boolean;
    colorByMagnitude: boolean;
    colorScale: string[];
    arrowColor: string;
    arrowWidth: number;
    effectiveArrowScale: number;
    maxMagnitude: number;
    title?: string;
    tickFontSize: number;
  },
): void {
  const {
    padding, chartWidth, chartHeight,
    xMin, xMax, yMin, yMax, xSpan, ySpan,
    showGrid, showAxes,
    colorByMagnitude, colorScale, arrowColor, arrowWidth,
    effectiveArrowScale, maxMagnitude,
    title, tickFontSize,
  } = options;

  // Coordinate transforms
  const toPixelX = (x: number) => padding + ((x - xMin) / xSpan) * chartWidth;
  const toPixelY = (y: number) => padding + ((yMax - y) / ySpan) * chartHeight;

  // Clear canvas
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  // Draw title
  if (title) {
    ctx.save();
    ctx.font = 'bold 16px sans-serif';
    ctx.fillStyle = '#111827';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(title, canvasWidth / 2, padding / 2 + 4);
    ctx.restore();
  }

  // Draw grid
  if (showGrid) {
    ctx.save();
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 0.5;
    ctx.font = `${tickFontSize}px sans-serif`;
    ctx.fillStyle = '#6b7280';

    // Vertical grid lines
    const xStep = niceStep(xSpan, 10);
    const xStart = Math.ceil(xMin / xStep) * xStep;
    for (let xVal = xStart; xVal <= xMax; xVal += xStep) {
      const px = toPixelX(xVal);
      ctx.beginPath();
      ctx.moveTo(px, padding);
      ctx.lineTo(px, padding + chartHeight);
      ctx.stroke();

      // Tick label
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(String(Math.round(xVal * 100) / 100), px, padding + chartHeight + 4);
    }

    // Horizontal grid lines
    const yStep = niceStep(ySpan, 10);
    const yStart = Math.ceil(yMin / yStep) * yStep;
    for (let yVal = yStart; yVal <= yMax; yVal += yStep) {
      const py = toPixelY(yVal);
      ctx.beginPath();
      ctx.moveTo(padding, py);
      ctx.lineTo(padding + chartWidth, py);
      ctx.stroke();

      // Tick label
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(Math.round(yVal * 100) / 100), padding - 6, py);
    }
    ctx.restore();
  }

  // Draw axes
  if (showAxes) {
    ctx.save();
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = arrowWidth;

    // X axis (y = 0)
    if (yMin <= 0 && yMax >= 0) {
      const y0 = toPixelY(0);
      ctx.beginPath();
      ctx.moveTo(padding, y0);
      ctx.lineTo(padding + chartWidth, y0);
      ctx.stroke();
    }

    // Y axis (x = 0)
    if (xMin <= 0 && xMax >= 0) {
      const x0 = toPixelX(0);
      ctx.beginPath();
      ctx.moveTo(x0, padding);
      ctx.lineTo(x0, padding + chartHeight);
      ctx.stroke();
    }

    // Chart border
    ctx.strokeStyle = '#d1d5db';
    ctx.lineWidth = 1;
    ctx.strokeRect(padding, padding, chartWidth, chartHeight);
    ctx.restore();
  }

  // Draw arrows
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
    const scaledDy = -v.dy * effectiveArrowScale; // Flip y for screen coordinates

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
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = arrowWidth;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(endX, endY);
    ctx.stroke();

    // Arrowhead
    const arrowLen = Math.sqrt(scaledDx * scaledDx + scaledDy * scaledDy);
    if (arrowLen > 2) {
      const ux = scaledDx / arrowLen;
      const uy = scaledDy / arrowLen;
      const perpX = -uy;
      const perpY = ux;
      const headLen = Math.min(arrowheadSize, arrowLen * 0.4);

      const h1x = endX - ux * headLen + perpX * headLen * 0.5;
      const h1y = endY - uy * headLen + perpY * headLen * 0.5;
      const h2x = endX - ux * headLen - perpX * headLen * 0.5;
      const h2y = endY - uy * headLen - perpY * headLen * 0.5;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(endX, endY);
      ctx.lineTo(h1x, h1y);
      ctx.lineTo(h2x, h2y);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }
}

// -- Component ----------------------------------------------------------------

export function VectorField(props: VectorFieldProps) {
  const {
    data,
    vectorFunction,
    width = 600,
    height = 600,
    gridSize: rawGridSize = 15,
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
    tickFontSize = 10,
    arrowWidth = 1.5,
    renderer = 'svg',
    useGPU: _useGPU = false,
    computeWorker,
  } = props;

  // Clamp gridSize to prevent excessive computation
  const gridSize = Math.max(2, Math.min(50, rawGridSize));

  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const xMin = xRange[0];
  const xMax = xRange[1];
  const yMin = yRange[0];
  const yMax = yRange[1];
  const xSpan = xMax - xMin;
  const ySpan = yMax - yMin;

  // Memoize coordinate transformations
  const toPixelX = useMemo(
    () => (x: number) => padding + ((x - xMin) / xSpan) * chartWidth,
    [padding, xMin, xSpan, chartWidth],
  );

  const toPixelY = useMemo(
    () => (y: number) => padding + ((yMax - y) / ySpan) * chartHeight,
    [padding, yMax, ySpan, chartHeight],
  );

  // Build vector data (either from data prop, computeWorker, or vectorFunction)
  const vectors = useMemo((): VectorDatum[] => {
    return computeVectors(
      data, vectorFunction, computeWorker,
      gridSize, xMin, xMax, yMin, yMax, xSpan, ySpan,
    );
  }, [data, vectorFunction, computeWorker, gridSize, xMin, xMax, yMin, yMax, xSpan, ySpan]);

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

  // ---- Canvas rendering mode ------------------------------------------------

  if (renderer === 'canvas') {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>(0);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Cancel any pending animation frame
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }

      // Use requestAnimationFrame for smooth rendering
      rafRef.current = requestAnimationFrame(() => {
        drawCanvasVectorField(ctx, width, height, vectors, {
          padding,
          chartWidth,
          chartHeight,
          xMin,
          xMax,
          yMin,
          yMax,
          xSpan,
          ySpan,
          showGrid,
          showAxes,
          colorByMagnitude,
          colorScale,
          arrowColor,
          arrowWidth,
          effectiveArrowScale,
          maxMagnitude,
          title,
          tickFontSize,
        });
      });

      return () => {
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }, [
      vectors, width, height, padding, chartWidth, chartHeight,
      xMin, xMax, yMin, yMax, xSpan, ySpan,
      showGrid, showAxes, colorByMagnitude, colorScale,
      arrowColor, arrowWidth, effectiveArrowScale, maxMagnitude,
      title, tickFontSize,
    ]);

    return createElement('canvas', {
      ref: canvasRef,
      width,
      height,
      role: 'img',
      'aria-label': title ?? 'Vector field plot',
      style: { fontFamily: 'sans-serif', maxWidth: '100%' },
    });
  }

  // ---- SVG rendering mode (default) ----------------------------------------

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
            'font-size': String(tickFontSize),
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
            'font-size': String(tickFontSize),
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
          'stroke-width': String(arrowWidth),
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
          'stroke-width': String(arrowWidth),
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
          'stroke-width': String(arrowWidth),
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
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
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
