// ============================================================================
// SpecifyJS — 2D Polar Graph (SVG-based polar coordinate visualization)
// Zero-dependency polar graph rendered entirely via createElement calls.
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from "../../../../core/src/index";
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "../../../../core/src/hooks/index";
import {
  generateInputs,
  computeSync,
  computeAsync,
  type ComputedPoint,
} from "../../../../core/src/shared/async-compute";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface PolarPointInfo {
  r: number;
  theta: number;
  index: number;
  event: Event;
}

export interface PolarGraph2DProps {
  width?: number;
  height?: number;
  rRange?: [number, number];
  /** Function to plot: f(theta) → r */
  plotFunction?: (theta: number) => number;
  /** Number of samples around the full circle (default: 360). Ignored if thetaStep is set. */
  plotResolution?: number;
  /** Explicit step increment in radians for function evaluation (e.g., Math.PI/180).
   *  When set, overrides plotResolution and computes f(theta) at
   *  theta = 0, step, 2*step, ..., 2*PI. */
  thetaStep?: number;
  /** If true, compute plotFunction synchronously (blocks render).
   *  Default: false — computes asynchronously. */
  sync?: boolean;
  points?: { r: number; theta: number }[];
  showGrid?: boolean;
  pointRadius?: number;
  pointColor?: string;
  curveColor?: string;
  onPointClick?: (info: PolarPointInfo) => void;
  onPointDoubleClick?: (info: PolarPointInfo) => void;
  onPointContextMenu?: (info: PolarPointInfo) => void;
  onPointHover?: (info: PolarPointInfo) => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function polarToCartesian(
  r: number,
  theta: number,
  cx: number,
  cy: number,
  scale: number,
): { x: number; y: number } {
  return {
    x: cx + r * Math.cos(theta) * scale,
    y: cy - r * Math.sin(theta) * scale,
  };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function PolarGraph2D(props: PolarGraph2DProps) {
  const {
    width = 400,
    height = 400,
    rRange: initRange = [0, 2] as [number, number],
    plotFunction,
    plotResolution = 360,
    thetaStep,
    sync: syncMode = false,
    points = [],
    showGrid = true,
    pointRadius = 3,
    pointColor = "#3b82f6",
    curveColor = "#3b82f6",
    onPointClick,
    onPointDoubleClick,
    onPointContextMenu,
    onPointHover,
  } = props;

  const [rMax, setRMax] = useState(initRange[1]);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [dragState, setDragState] = useState<{
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);

  const cx = width / 2 + panX;
  const cy = height / 2 + panY;
  const padding = 30;
  const maxRadius = Math.min(width, height) / 2 - padding;
  const scale = maxRadius / rMax;

  // Grid circles count
  const gridCircles = useMemo(() => {
    const count = Math.max(1, Math.ceil(rMax));
    const circles: number[] = [];
    const step = rMax / count;
    for (let i = 1; i <= count; i++) circles.push(step * i);
    return circles;
  }, [rMax]);

  // Angle lines (every 30 degrees)
  const angleLines = useMemo(() => {
    const lines: number[] = [];
    for (let d = 0; d < 360; d += 30) lines.push((d * Math.PI) / 180);
    return lines;
  }, []);

  // ── Function evaluation (sync or async) ─────────────────────────────

  // Sync mode: compute inline during render
  const syncPoints = useMemo(() => {
    if (!plotFunction || !syncMode) return [];
    const effectiveStep = thetaStep ?? (2 * Math.PI) / plotResolution;
    const inputs = generateInputs({
      start: 0,
      end: 2 * Math.PI,
      step: effectiveStep,
    });
    return computeSync(plotFunction, inputs);
  }, [plotFunction, plotResolution, thetaStep, syncMode]);

  // Async mode: compute in batches
  const [asyncPoints, setAsyncPoints] = useState<ComputedPoint[]>([]);
  const cancelRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!plotFunction || syncMode) {
      setAsyncPoints([]);
      return;
    }
    const effectiveStep = thetaStep ?? (2 * Math.PI) / plotResolution;
    const inputs = generateInputs({
      start: 0,
      end: 2 * Math.PI,
      step: effectiveStep,
    });

    if (cancelRef.current) cancelRef.current();
    cancelRef.current = computeAsync(
      plotFunction,
      inputs,
      200,
      (results: ComputedPoint[]) => {
        setAsyncPoints([...results]);
      },
    );
    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [plotFunction, plotResolution, thetaStep, syncMode]);

  // Build SVG path from computed polar points
  const activePoints = syncMode ? syncPoints : asyncPoints;
  const curvePoints = useMemo(() => {
    if (activePoints.length === 0) return "";
    const pts: string[] = [];
    for (let i = 0; i < activePoints.length; i++) {
      const cp = activePoints[i]!;
      const r = cp.output;
      if (r < 0 || !isFinite(r)) continue;
      const { x, y } = polarToCartesian(r, cp.input, cx, cy, scale);
      pts.push(
        `${pts.length === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`,
      );
    }
    return pts.join(" ");
  }, [activePoints, cx, cy, scale]);

  // Pan handlers
  const handleMouseDown = useCallback(
    (e: MouseEvent) => {
      setDragState({ x: e.clientX, y: e.clientY, px: panX, py: panY });
    },
    [panX, panY],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!dragState) return;
      setPanX(dragState.px + (e.clientX - dragState.x));
      setPanY(dragState.py + (e.clientY - dragState.y));
    },
    [dragState],
  );

  const handleMouseUp = useCallback(() => {
    setDragState(null);
  }, []);

  const handleWheel = useCallback(
    (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 1.15 : 1 / 1.15;
      setRMax(Math.max(0.1, rMax * factor));
    },
    [rMax],
  );

  // Build point event handler
  const makePointHandler = useCallback(
    (
      handler: ((info: PolarPointInfo) => void) | undefined,
      pt: { r: number; theta: number },
      idx: number,
    ) => {
      if (!handler) return undefined;
      return (e: Event) =>
        handler({ r: pt.r, theta: pt.theta, index: idx, event: e });
    },
    [],
  );

  // Build SVG children
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

  // Grid
  if (showGrid) {
    for (let i = 0; i < gridCircles.length; i++) {
      const r = gridCircles[i] * scale;
      children.push(
        createElement("circle", {
          cx,
          cy,
          r,
          fill: "none",
          stroke: "#e5e7eb",
          "stroke-width": 1,
          key: `gc-${i}`,
        }),
      );
      children.push(
        createElement(
          "text",
          {
            x: cx + r + 2,
            y: cy - 4,
            "font-size": 10,
            fill: "#9ca3af",
            key: `gl-${i}`,
          },
          gridCircles[i].toFixed(1),
        ),
      );
    }
    for (let i = 0; i < angleLines.length; i++) {
      const a = angleLines[i];
      const outerR = gridCircles[gridCircles.length - 1] * scale;
      const ex = cx + outerR * Math.cos(a);
      const ey = cy - outerR * Math.sin(a);
      children.push(
        createElement("line", {
          x1: cx,
          y1: cy,
          x2: ex,
          y2: ey,
          stroke: "#e5e7eb",
          "stroke-width": 1,
          key: `al-${i}`,
        }),
      );
      const deg = Math.round((a * 180) / Math.PI);
      const lx = cx + (outerR + 14) * Math.cos(a);
      const ly = cy - (outerR + 14) * Math.sin(a);
      children.push(
        createElement(
          "text",
          {
            x: lx,
            y: ly + 4,
            "text-anchor": "middle",
            "font-size": 10,
            fill: "#9ca3af",
            key: `at-${i}`,
          },
          `${deg}\u00B0`,
        ),
      );
    }
  }

  // Axes
  children.push(
    createElement("line", {
      x1: cx - maxRadius,
      y1: cy,
      x2: cx + maxRadius,
      y2: cy,
      stroke: "#d1d5db",
      "stroke-width": 1,
      key: "x-axis",
    }),
  );
  children.push(
    createElement("line", {
      x1: cx,
      y1: cy - maxRadius,
      x2: cx,
      y2: cy + maxRadius,
      stroke: "#d1d5db",
      "stroke-width": 1,
      key: "y-axis",
    }),
  );

  // Plot curve
  if (curvePoints) {
    children.push(
      createElement("path", {
        d: curvePoints,
        fill: "none",
        stroke: curveColor,
        "stroke-width": 2,
        key: "curve",
      }),
    );
  }

  // Data points
  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    const { x, y } = polarToCartesian(pt.r, pt.theta, cx, cy, scale);
    children.push(
      createElement("circle", {
        cx: x,
        cy: y,
        r: pointRadius,
        fill: pointColor,
        key: `pt-${i}`,
        style: { cursor: "pointer" },
        onclick: makePointHandler(onPointClick, pt, i),
        ondblclick: makePointHandler(onPointDoubleClick, pt, i),
        oncontextmenu: makePointHandler(onPointContextMenu, pt, i),
        onmouseenter: makePointHandler(onPointHover, pt, i),
      }),
    );
  }

  return createElement(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width,
      height,
      viewBox: `0 0 ${width} ${height}`,
      style: { cursor: dragState ? "grabbing" : "grab" },
      onmousedown: handleMouseDown,
      onmousemove: handleMouseMove,
      onmouseup: handleMouseUp,
      onmouseleave: handleMouseUp,
      onwheel: handleWheel,
    },
    ...children,
  );
}
