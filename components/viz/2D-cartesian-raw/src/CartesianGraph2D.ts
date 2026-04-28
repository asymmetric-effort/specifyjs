// ============================================================================
// SpecifyJS — 2D Cartesian Graph (Raw SVG, Interactive)
// Zero-dependency interactive cartesian graph with pan, zoom, and point events.
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT
import { createElement } from "../../../../core/src/index";
import {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "../../../../core/src/hooks/index";
import {
  generateInputs,
  computeSync,
  computeAsync,
  type ComputedPoint,
} from "../../../../core/src/shared/async-compute";

// ---------------------------------------------------------------------------
// Types

export interface PointEvent {
  x: number;
  y: number;
  index: number;
  event: Event;
}

export interface CartesianGraph2DProps {
  width?: number;
  height?: number;
  points?: { x: number; y: number }[];
  /** Function to plot: f(x) → y */
  plotFunction?: (x: number) => number;
  /** Number of samples across the x range (default: 200). Ignored if xStep is set. */
  plotResolution?: number;
  /** Explicit step increment for function evaluation (e.g., 0.1).
   *  When set, overrides plotResolution and computes f(x) at
   *  x = xRange[0], xRange[0]+step, xRange[0]+2*step, ..., xRange[1]. */
  xStep?: number;
  /** If true, compute plotFunction synchronously (blocks render).
   *  Default: false — computes asynchronously via requestIdleCallback,
   *  rendering progressively as results arrive. */
  sync?: boolean;
  xRange?: [number, number];
  yRange?: [number, number];
  showGrid?: boolean;
  showAxes?: boolean;
  pointRadius?: number;
  pointColor?: string;
  curveColor?: string;
  gridColor?: string;
  axisColor?: string;
  onPointClick?: (info: PointEvent) => void;
  onPointDoubleClick?: (info: PointEvent) => void;
  onPointContextMenu?: (info: PointEvent) => void;
  onPointHover?: (info: PointEvent) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function niceStep(range: number, count: number): number {
  const raw = range / count;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const nice = norm < 1.5 ? 1 : norm < 3 ? 2 : norm < 7 ? 5 : 10;
  return nice * mag;
}

function generateTicks(min: number, max: number): number[] {
  const range = max - min;
  if (range <= 0) return [min];
  const step = niceStep(range, 8);
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 0.001; v += step) {
    ticks.push(Math.round(v * 1e10) / 1e10);
  }
  return ticks;
}

function formatTick(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");
}

const PADDING = 40;
const ZOOM_FACTOR = 1.1;
const MIN_RANGE = 0.01;
const MAX_RANGE = 1e6;

// ---------------------------------------------------------------------------
// CartesianGraph2D Component
// ---------------------------------------------------------------------------

export function CartesianGraph2D(props: CartesianGraph2DProps) {
  const {
    width = 400,
    height = 300,
    points = [],
    plotFunction,
    plotResolution = 200,
    xStep,
    sync: syncMode = false,
    xRange: initXRange = [-5, 5],
    yRange: initYRange = [-5, 5],
    showGrid = true,
    showAxes = true,
    pointRadius = 3,
    pointColor = "#3b82f6",
    curveColor = "#3b82f6",
    gridColor = "#e2e8f0",
    axisColor = "#94a3b8",
    onPointClick,
    onPointDoubleClick,
    onPointContextMenu,
    onPointHover,
  } = props;

  const [xMin, setXMin] = useState(initXRange[0]);
  const [xMax, setXMax] = useState(initXRange[1]);
  const [yMin, setYMin] = useState(initYRange[0]);
  const [yMax, setYMax] = useState(initYRange[1]);
  const dragging = useRef(false);
  const dragStart = useRef<{
    mx: number;
    my: number;
    x0: number;
    x1: number;
    y0: number;
    y1: number;
  } | null>(null);

  // Coordinate transforms
  const toSvgX = useCallback(
    (wx: number) =>
      PADDING + ((wx - xMin) / (xMax - xMin)) * (width - 2 * PADDING),
    [xMin, xMax, width],
  );
  const toSvgY = useCallback(
    (wy: number) =>
      height - PADDING - ((wy - yMin) / (yMax - yMin)) * (height - 2 * PADDING),
    [yMin, yMax, height],
  );
  const toWorldX = useCallback(
    (sx: number) =>
      xMin + ((sx - PADDING) / (width - 2 * PADDING)) * (xMax - xMin),
    [xMin, xMax, width],
  );
  const toWorldY = useCallback(
    (sy: number) =>
      yMin + ((height - PADDING - sy) / (height - 2 * PADDING)) * (yMax - yMin),
    [yMin, yMax, height],
  );

  // Pan handlers
  const onMouseDown = useCallback(
    (e: Event) => {
      const me = e as MouseEvent;
      dragging.current = true;
      dragStart.current = {
        mx: me.clientX,
        my: me.clientY,
        x0: xMin,
        x1: xMax,
        y0: yMin,
        y1: yMax,
      };
    },
    [xMin, xMax, yMin, yMax],
  );

  const onMouseMove = useCallback(
    (e: Event) => {
      if (!dragging.current || !dragStart.current) return;
      const me = e as MouseEvent;
      const ds = dragStart.current;
      const dxPx = me.clientX - ds.mx;
      const dyPx = me.clientY - ds.my;
      const dxWorld = (dxPx / (width - 2 * PADDING)) * (ds.x1 - ds.x0);
      const dyWorld = (dyPx / (height - 2 * PADDING)) * (ds.y1 - ds.y0);
      setXMin(ds.x0 - dxWorld);
      setXMax(ds.x1 - dxWorld);
      setYMin(ds.y0 + dyWorld);
      setYMax(ds.y1 + dyWorld);
    },
    [width, height],
  );

  const onMouseUp = useCallback(() => {
    dragging.current = false;
    dragStart.current = null;
  }, []);

  // Zoom handler
  const onWheel = useCallback(
    (e: Event) => {
      const we = e as WheelEvent;
      we.preventDefault();
      const rect = (we.currentTarget as SVGSVGElement).getBoundingClientRect();
      const sx = we.clientX - rect.left;
      const sy = we.clientY - rect.top;
      const wx = toWorldX(sx);
      const wy = toWorldY(sy);
      const factor = we.deltaY > 0 ? ZOOM_FACTOR : 1 / ZOOM_FACTOR;
      const newXRange = (xMax - xMin) * factor;
      const newYRange = (yMax - yMin) * factor;
      if (
        newXRange < MIN_RANGE ||
        newYRange < MIN_RANGE ||
        newXRange > MAX_RANGE ||
        newYRange > MAX_RANGE
      )
        return;
      const rx = (wx - xMin) / (xMax - xMin);
      const ry = (wy - yMin) / (yMax - yMin);
      setXMin(wx - rx * newXRange);
      setXMax(wx + (1 - rx) * newXRange);
      setYMin(wy - ry * newYRange);
      setYMax(wy + (1 - ry) * newYRange);
    },
    [xMin, xMax, yMin, yMax, toWorldX, toWorldY],
  );

  // Build children
  const children: unknown[] = [];

  // Background
  children.push(
    createElement("rect", {
      x: 0,
      y: 0,
      width,
      height,
      fill: "white",
      key: "bg",
    }),
  );

  // Grid lines
  if (showGrid) {
    const xTicks = generateTicks(xMin, xMax);
    const yTicks = generateTicks(yMin, yMax);
    for (let i = 0; i < xTicks.length; i++) {
      const sx = toSvgX(xTicks[i]);
      children.push(
        createElement("line", {
          x1: sx,
          y1: PADDING,
          x2: sx,
          y2: height - PADDING,
          stroke: gridColor,
          "stroke-width": 0.5,
          key: `gx-${i}`,
        }),
      );
      children.push(
        createElement(
          "text",
          {
            x: sx,
            y: height - PADDING + 14,
            "text-anchor": "middle",
            "font-size": 10,
            fill: axisColor,
            key: `lx-${i}`,
          },
          formatTick(xTicks[i]),
        ),
      );
    }
    for (let i = 0; i < yTicks.length; i++) {
      const sy = toSvgY(yTicks[i]);
      children.push(
        createElement("line", {
          x1: PADDING,
          y1: sy,
          x2: width - PADDING,
          y2: sy,
          stroke: gridColor,
          "stroke-width": 0.5,
          key: `gy-${i}`,
        }),
      );
      children.push(
        createElement(
          "text",
          {
            x: PADDING - 6,
            y: sy + 3,
            "text-anchor": "end",
            "font-size": 10,
            fill: axisColor,
            key: `ly-${i}`,
          },
          formatTick(yTicks[i]),
        ),
      );
    }
  }

  // Axes
  if (showAxes) {
    const originX = Math.max(PADDING, Math.min(width - PADDING, toSvgX(0)));
    const originY = Math.max(PADDING, Math.min(height - PADDING, toSvgY(0)));
    children.push(
      createElement("line", {
        x1: PADDING,
        y1: originY,
        x2: width - PADDING,
        y2: originY,
        stroke: axisColor,
        "stroke-width": 1,
        key: "x-axis",
      }),
    );
    children.push(
      createElement("line", {
        x1: originX,
        y1: PADDING,
        x2: originX,
        y2: height - PADDING,
        stroke: axisColor,
        "stroke-width": 1,
        key: "y-axis",
      }),
    );
  }

  // ── Function curve (async or sync) ────────────────────────────────

  // Sync mode: compute inline during render via useMemo (no effects needed)
  const syncCurvePoints = useMemo(() => {
    if (!plotFunction || !syncMode) return [];
    const effectiveStep = xStep ?? (xMax - xMin) / plotResolution;
    const inputs = generateInputs({
      start: xMin,
      end: xMax,
      step: effectiveStep,
    });
    return computeSync(plotFunction, inputs);
  }, [plotFunction, xMin, xMax, xStep, plotResolution, syncMode]);

  // Async mode: compute in batches via useEffect, progressive rendering
  const [asyncCurvePoints, setAsyncCurvePoints] = useState<ComputedPoint[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!plotFunction || syncMode) {
      setAsyncCurvePoints([]);
      return;
    }
    const effectiveStep = xStep ?? (xMax - xMin) / plotResolution;
    const inputs = generateInputs({
      start: xMin,
      end: xMax,
      step: effectiveStep,
    });

    if (cancelRef.current) cancelRef.current();
    cancelRef.current = computeAsync(
      plotFunction,
      inputs,
      200,
      (results: ComputedPoint[]) => {
        setAsyncCurvePoints([...results]);
      },
    );
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [plotFunction, xMin, xMax, xStep, plotResolution, syncMode]);

  // Render the curve from whichever source has data
  const curveData = syncMode ? syncCurvePoints : asyncCurvePoints;
  if (curveData.length > 0) {
    const segments: string[] = [];
    for (let i = 0; i < curveData.length; i++) {
      const pt = curveData[i]!;
      const sx = toSvgX(pt.input);
      const sy = toSvgY(pt.output);
      segments.push(`${segments.length === 0 ? "M" : "L"}${sx},${sy}`);
    }
    children.push(
      createElement("path", {
        d: segments.join(" "),
        fill: "none",
        stroke: curveColor,
        "stroke-width": 1.5,
        key: "curve",
      }),
    );
  }

  // Data points
  const makeHandler = (
    type: string,
    handler: ((info: PointEvent) => void) | undefined,
    idx: number,
    pt: { x: number; y: number },
  ) => {
    if (!handler) return undefined;
    return (e: Event) => handler({ x: pt.x, y: pt.y, index: idx, event: e });
  };

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const cx = toSvgX(pt.x);
    const cy = toSvgY(pt.y);
    const circleProps: Record<string, unknown> = {
      cx,
      cy,
      r: pointRadius,
      fill: pointColor,
      cursor: "pointer",
      key: `pt-${i}`,
    };
    if (onPointClick)
      circleProps.onclick = makeHandler("click", onPointClick, i, pt);
    if (onPointDoubleClick)
      circleProps.ondblclick = makeHandler(
        "dblclick",
        onPointDoubleClick,
        i,
        pt,
      );
    if (onPointContextMenu)
      circleProps.oncontextmenu = makeHandler(
        "contextmenu",
        onPointContextMenu,
        i,
        pt,
      );
    if (onPointHover)
      circleProps.onmouseover = makeHandler("mouseover", onPointHover, i, pt);
    children.push(createElement("circle", circleProps));
  }

  // Clip path for plot area
  const defs = createElement(
    "defs",
    { key: "defs" },
    createElement(
      "clipPath",
      { id: "plot-clip" },
      createElement("rect", {
        x: PADDING,
        y: PADDING,
        width: width - 2 * PADDING,
        height: height - 2 * PADDING,
      }),
    ),
  );

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: "user-select: none; touch-action: none;",
      onmousedown: onMouseDown,
      onmousemove: onMouseMove,
      onmouseup: onMouseUp,
      onmouseleave: onMouseUp,
      onwheel: onWheel,
    },
    defs,
    ...children,
  );
}
