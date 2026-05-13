// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Radio Propagation Simulation — Demonstrates electromagnetic wave propagation
 * using a VectorField visualization. Users can place radio sources, absorbers,
 * and reflectors, then observe the superposition of waves in real time.
 */

import { createElement } from "specifyjs";
import {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "specifyjs/hooks";
import {
  VectorField,
  type VectorDatum,
} from "../../../components/viz/vector-field/src/index";
import { Slider } from "../../../components/form/slider/src/index";

// ── Types ─────────────────────────────────────────────────────────────

type ObjectType = "source" | "absorber" | "reflector";

interface SimObject {
  id: number;
  type: ObjectType;
  x: number;
  y: number;
  frequency: number;
  amplitude: number;
}

// ── Constants ─────────────────────────────────────────────────────────

const TWO_PI = 2 * Math.PI;
const GRID_SIZE = 30;
const X_RANGE: [number, number] = [0, 10];
const Y_RANGE: [number, number] = [0, 10];
const REFLECTOR_AMP_FACTOR = 0.4;
const FIELD_WIDTH = 800;
const FIELD_HEIGHT = 600;
const FIELD_PADDING = 30;

// ── Obstacle intersection check ─────────────────────────────────────

/**
 * Returns true if the line segment from (sx, sy) to (px, py) intersects
 * the circle centered at (ox, oy) with radius r.
 */
function lineIntersectsCircle(
  sx: number,
  sy: number,
  px: number,
  py: number,
  ox: number,
  oy: number,
  r: number,
): boolean {
  const dx = px - sx;
  const dy = py - sy;
  const fx = sx - ox;
  const fy = sy - oy;

  const a = dx * dx + dy * dy;
  if (a < 1e-12) return false;

  const b = 2 * (fx * dx + fy * dy);
  const c = fx * fx + fy * fy - r * r;
  let discriminant = b * b - 4 * a * c;

  if (discriminant < 0) return false;
  discriminant = Math.sqrt(discriminant);

  const t1 = (-b - discriminant) / (2 * a);
  const t2 = (-b + discriminant) / (2 * a);

  return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

// ── Compute vector field ────────────────────────────────────────────

function computeField(objects: SimObject[], time: number): VectorDatum[] {
  const result: VectorDatum[] = [];
  const sources = objects.filter((o) => o.type === "source");
  const absorbers = objects.filter((o) => o.type === "absorber");
  const reflectors = objects.filter((o) => o.type === "reflector");

  // Build a list of all emitters: real sources + reflector secondary sources
  const emitters: {
    x: number;
    y: number;
    frequency: number;
    amplitude: number;
  }[] = [];
  for (let i = 0; i < sources.length; i++) {
    const s = sources[i]!;
    emitters.push({
      x: s.x,
      y: s.y,
      frequency: s.frequency,
      amplitude: s.amplitude,
    });
  }
  // Reflectors act as secondary sources at reduced amplitude
  for (let i = 0; i < reflectors.length; i++) {
    const ref = reflectors[i]!;
    // Each reflector re-emits based on sources that can reach it
    let totalAmp = 0;
    for (let j = 0; j < sources.length; j++) {
      const s = sources[j]!;
      let blocked = false;
      for (let k = 0; k < absorbers.length; k++) {
        const abs = absorbers[k]!;
        if (lineIntersectsCircle(s.x, s.y, ref.x, ref.y, abs.x, abs.y, 0.3)) {
          blocked = true;
          break;
        }
      }
      if (!blocked) {
        totalAmp += s.amplitude;
      }
    }
    if (totalAmp > 0) {
      emitters.push({
        x: ref.x,
        y: ref.y,
        frequency: sources.length > 0 ? sources[0]!.frequency : 2,
        amplitude: totalAmp * REFLECTOR_AMP_FACTOR,
      });
    }
  }

  const xStep = (X_RANGE[1] - X_RANGE[0]) / (GRID_SIZE - 1);
  const yStep = (Y_RANGE[1] - Y_RANGE[0]) / (GRID_SIZE - 1);

  for (let iy = 0; iy < GRID_SIZE; iy++) {
    for (let ix = 0; ix < GRID_SIZE; ix++) {
      const px = X_RANGE[0] + ix * xStep;
      const py = Y_RANGE[0] + iy * yStep;

      let totalDx = 0;
      let totalDy = 0;

      for (let e = 0; e < emitters.length; e++) {
        const em = emitters[e]!;
        const ex = px - em.x;
        const ey = py - em.y;
        const r = Math.sqrt(ex * ex + ey * ey);

        if (r < 0.05) continue;

        // Check if blocked by absorbers
        let blocked = false;
        for (let a = 0; a < absorbers.length; a++) {
          const abs = absorbers[a]!;
          if (lineIntersectsCircle(em.x, em.y, px, py, abs.x, abs.y, 0.3)) {
            blocked = true;
            break;
          }
        }
        if (blocked) continue;

        const magnitude = em.amplitude / Math.max(r, 0.1);
        const phase = TWO_PI * em.frequency * r - TWO_PI * em.frequency * time;
        const cosPhase = Math.cos(phase);
        const dirX = ex / r;
        const dirY = ey / r;

        totalDx += magnitude * cosPhase * dirX;
        totalDy += magnitude * cosPhase * dirY;
      }

      const mag = Math.sqrt(totalDx * totalDx + totalDy * totalDy);
      result.push({ x: px, y: py, dx: totalDx, dy: totalDy, magnitude: mag });
    }
  }

  return result;
}

// ── Object colors ───────────────────────────────────────────────────

const OBJECT_COLORS: Record<ObjectType, { fill: string; stroke: string; glow: string }> = {
  source: { fill: "#ef4444", stroke: "#fca5a5", glow: "rgba(239, 68, 68, 0.25)" },
  absorber: { fill: "#22c55e", stroke: "#86efac", glow: "" },
  reflector: { fill: "#3b82f6", stroke: "#93c5fd", glow: "" },
};

// ── Object overlay circles (SVG) ────────────────────────────────────

function objectCircles(
  objects: SimObject[],
  chartWidth: number,
  chartHeight: number,
  padding: number,
  onMouseOver: (id: number) => void,
  onMouseOut: () => void,
): ReturnType<typeof createElement>[] {
  const elements: ReturnType<typeof createElement>[] = [];
  const xSpan = X_RANGE[1] - X_RANGE[0];
  const ySpan = Y_RANGE[1] - Y_RANGE[0];

  for (let i = 0; i < objects.length; i++) {
    const obj = objects[i]!;
    const cx = padding + ((obj.x - X_RANGE[0]) / xSpan) * chartWidth;
    const cy = padding + ((Y_RANGE[1] - obj.y) / ySpan) * chartHeight;
    const radius = 8;
    const colors = OBJECT_COLORS[obj.type];
    const hoverProps = {
      pointerEvents: "all" as const,
      onMouseOver: () => onMouseOver(obj.id),
      onMouseOut: () => onMouseOut(),
    };

    if (obj.type === "source") {
      // Pulsing glow for radio sources
      elements.push(
        createElement("circle", {
          key: `glow-${obj.id}`,
          cx: String(cx),
          cy: String(cy),
          r: "14",
          fill: colors.glow,
          stroke: "none",
        }),
      );
      elements.push(
        createElement("circle", {
          key: `src-${obj.id}`,
          cx: String(cx),
          cy: String(cy),
          r: String(radius),
          fill: colors.fill,
          stroke: colors.stroke,
          "stroke-width": "2",
          ...hoverProps,
        }),
      );
    } else if (obj.type === "absorber") {
      elements.push(
        createElement("circle", {
          key: `abs-${obj.id}`,
          cx: String(cx),
          cy: String(cy),
          r: String(radius),
          fill: colors.fill,
          stroke: colors.stroke,
          "stroke-width": "2",
          ...hoverProps,
        }),
      );
    } else {
      // Reflector
      elements.push(
        createElement("circle", {
          key: `ref-${obj.id}`,
          cx: String(cx),
          cy: String(cy),
          r: String(radius),
          fill: colors.fill,
          stroke: colors.stroke,
          "stroke-width": "2",
          ...hoverProps,
        }),
      );
    }
  }

  return elements;
}

// ── Main component ──────────────────────────────────────────────────

let nextId = 1;

export function RadioPropagation() {
  const [objects, setObjects] = useState<SimObject[]>([
    { id: nextId++, type: "source", x: 3, y: 5, frequency: 2, amplitude: 1 },
    { id: nextId++, type: "source", x: 7, y: 5, frequency: 2, amplitude: 1 },
  ]);
  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(1);
  const [contextTarget, setContextTarget] = useState<number | null>(null);
  const [contextPos, setContextPos] = useState<{ x: number; y: number } | null>(
    null,
  );
  const [time, setTime] = useState(0);
  const [animSpeed, setAnimSpeed] = useState(1);
  const [hoveredObject, setHoveredObject] = useState<number | null>(null);
  const [configMode, setConfigMode] = useState<{
    objectId: number;
    field: "frequency" | "amplitude";
    x: number;
    y: number;
  } | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Animation loop
  useEffect(() => {
    if (animSpeed === 0) return;
    const intervalMs = animSpeed * 1000;
    const id = setInterval(() => {
      setTime((prev: number) => prev + animSpeed);
    }, intervalMs);
    return () => clearInterval(id);
  }, [animSpeed]);

  // Compute the vector field data from current objects and time
  const fieldData = useMemo(() => computeField(objects, time), [objects, time]);

  // Chart area dimensions (must match VectorField padding)
  const chartWidth = FIELD_WIDTH - FIELD_PADDING * 2;
  const chartHeight = FIELD_HEIGHT - FIELD_PADDING * 2;

  // Hover handlers for overlay circles
  const onCircleMouseOver = useCallback((id: number) => {
    setHoveredObject(id);
  }, []);
  const onCircleMouseOut = useCallback(() => {
    setHoveredObject(null);
  }, []);

  // Build overlay circles
  const overlayCircles = useMemo(
    () =>
      objectCircles(
        objects,
        chartWidth,
        chartHeight,
        FIELD_PADDING,
        onCircleMouseOver,
        onCircleMouseOut,
      ),
    [objects, chartWidth, chartHeight, onCircleMouseOver, onCircleMouseOut],
  );

  // Convert pixel click to data coordinates
  const pixelToData = useCallback(
    (clientX: number, clientY: number): { x: number; y: number } | null => {
      if (!containerRef.current) return null;
      const svgEl = (containerRef.current as HTMLElement).querySelector("svg");
      if (!svgEl) return null;
      const rect = svgEl.getBoundingClientRect();

      // SVG uses viewBox so we need to scale
      const scaleX = FIELD_WIDTH / rect.width;
      const scaleY = FIELD_HEIGHT / rect.height;

      const svgX = (clientX - rect.left) * scaleX;
      const svgY = (clientY - rect.top) * scaleY;

      const dataX =
        X_RANGE[0] +
        ((svgX - FIELD_PADDING) / chartWidth) * (X_RANGE[1] - X_RANGE[0]);
      const dataY =
        Y_RANGE[1] -
        ((svgY - FIELD_PADDING) / chartHeight) * (Y_RANGE[1] - Y_RANGE[0]);

      // Clamp to range
      if (
        dataX < X_RANGE[0] ||
        dataX > X_RANGE[1] ||
        dataY < Y_RANGE[0] ||
        dataY > Y_RANGE[1]
      ) {
        return null;
      }
      return { x: dataX, y: dataY };
    },
    [chartWidth, chartHeight],
  );

  // Find object near a data coordinate
  const findObjectAt = useCallback(
    (dataX: number, dataY: number): SimObject | null => {
      const threshold = 0.4;
      for (let i = 0; i < objects.length; i++) {
        const obj = objects[i]!;
        const dx = obj.x - dataX;
        const dy = obj.y - dataY;
        if (Math.sqrt(dx * dx + dy * dy) < threshold) return obj;
      }
      return null;
    },
    [objects],
  );

  // Left-click: place a new source
  const handleClick = useCallback(
    (e: Event) => {
      const me = e as MouseEvent;
      // Ignore right-clicks
      if (me.button !== 0) return;
      const pos = pixelToData(me.clientX, me.clientY);
      if (!pos) return;
      // Don't place if near an existing object
      if (findObjectAt(pos.x, pos.y)) return;
      const newObj: SimObject = {
        id: nextId++,
        type: "source",
        x: pos.x,
        y: pos.y,
        frequency,
        amplitude,
      };
      setObjects((prev: SimObject[]) => [...prev, newObj]);
    },
    [pixelToData, findObjectAt, frequency, amplitude],
  );

  // Right-click: open context menu on object
  const handleContextMenu = useCallback(
    (e: Event) => {
      const me = e as MouseEvent;
      me.preventDefault();
      const pos = pixelToData(me.clientX, me.clientY);
      if (!pos) return;
      const obj = findObjectAt(pos.x, pos.y);
      if (obj) {
        setContextTarget(obj.id);
        setContextPos({ x: me.clientX, y: me.clientY });
      }
    },
    [pixelToData, findObjectAt],
  );

  // Close context menu on outside click or escape
  useEffect(() => {
    if (contextPos === null) return;
    const handleMouseDown = () => {
      setContextPos(null);
      setContextTarget(null);
    };
    const handleKeyDown = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape") {
        setContextPos(null);
        setContextTarget(null);
      }
    };
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleMouseDown);
      document.addEventListener("keydown", handleKeyDown);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleMouseDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [contextPos]);

  // Context menu actions
  const setObjectType = useCallback(
    (type: ObjectType) => {
      if (contextTarget === null) return;
      setObjects((prev: SimObject[]) =>
        prev.map((o: SimObject) =>
          o.id === contextTarget ? { ...o, type } : o,
        ),
      );
      setContextPos(null);
      setContextTarget(null);
    },
    [contextTarget],
  );

  const deleteObject = useCallback(() => {
    if (contextTarget === null) return;
    setObjects((prev: SimObject[]) =>
      prev.filter((o: SimObject) => o.id !== contextTarget),
    );
    setContextPos(null);
    setContextTarget(null);
  }, [contextTarget]);

  // Open inline input for per-source frequency or amplitude
  const openConfigInput = useCallback(
    (field: "frequency" | "amplitude") => {
      if (contextTarget === null || contextPos === null) return;
      setConfigMode({
        objectId: contextTarget,
        field,
        x: contextPos.x,
        y: contextPos.y,
      });
      setContextPos(null);
      setContextTarget(null);
    },
    [contextTarget, contextPos],
  );

  // Apply the configured value from the inline input
  const applyConfigValue = useCallback(
    (value: number) => {
      if (configMode === null) return;
      setObjects((prev: SimObject[]) =>
        prev.map((o: SimObject) =>
          o.id === configMode.objectId
            ? { ...o, [configMode.field]: value }
            : o,
        ),
      );
      setConfigMode(null);
    },
    [configMode],
  );

  // Close config input on Escape
  useEffect(() => {
    if (configMode === null) return;
    const handleKeyDown = (e: Event) => {
      if ((e as KeyboardEvent).key === "Escape") {
        setConfigMode(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [configMode]);

  // Context menu items — include per-source config options when target is a source
  const targetObj = contextTarget !== null
    ? objects.find((o) => o.id === contextTarget) ?? null
    : null;

  const contextMenuItems = useMemo(() => {
    const items: {
      label?: string;
      icon?: string;
      onClick?: () => void;
      divider?: true;
    }[] = [];

    // Per-source configuration options
    if (targetObj !== null && targetObj.type === "source") {
      items.push({
        label: "Set Frequency...",
        icon: "\uD83C\uDF10",
        onClick: () => openConfigInput("frequency"),
      });
      items.push({
        label: "Set Amplitude...",
        icon: "\uD83D\uDD0A",
        onClick: () => openConfigInput("amplitude"),
      });
      items.push({ divider: true as const });
    }

    items.push({
      label: "Radio Source",
      icon: "\uD83D\uDCE1",
      onClick: () => setObjectType("source"),
    });
    items.push({
      label: "Absorber",
      icon: "\u26AB",
      onClick: () => setObjectType("absorber"),
    });
    items.push({
      label: "Reflector",
      icon: "\uD83D\uDEE1\uFE0F",
      onClick: () => setObjectType("reflector"),
    });
    items.push({ divider: true as const });
    items.push({
      label: "Delete",
      icon: "\uD83D\uDDD1\uFE0F",
      onClick: deleteObject,
    });

    return items;
  }, [targetObj, setObjectType, deleteObject, openConfigInput]);

  // Frequency/amplitude change handlers (set defaults for new sources only)
  const onFrequencyChange = useCallback((v: number | [number, number]) => {
    const val = typeof v === "number" ? v : v[0];
    setFrequency(val);
  }, []);

  const onAmplitudeChange = useCallback((v: number | [number, number]) => {
    const val = typeof v === "number" ? v : v[0];
    setAmplitude(val);
  }, []);

  // Animation speed change handler
  const onAnimSpeedChange = useCallback((v: number | [number, number]) => {
    const val = typeof v === "number" ? v : v[0];
    setAnimSpeed(val);
  }, []);

  // Object counts
  const sourceCount = objects.filter((o) => o.type === "source").length;
  const absorberCount = objects.filter((o) => o.type === "absorber").length;
  const reflectorCount = objects.filter((o) => o.type === "reflector").length;

  // Build hover tooltip
  const hoveredObj = hoveredObject !== null
    ? objects.find((o) => o.id === hoveredObject) ?? null
    : null;

  const tooltipElement = hoveredObj !== null
    ? (() => {
        const xSpan = X_RANGE[1] - X_RANGE[0];
        const ySpan = Y_RANGE[1] - Y_RANGE[0];
        const tooltipX =
          FIELD_PADDING +
          ((hoveredObj.x - X_RANGE[0]) / xSpan) * chartWidth +
          16;
        const tooltipY =
          FIELD_PADDING +
          ((Y_RANGE[1] - hoveredObj.y) / ySpan) * chartHeight -
          20;
        return createElement(
          "g",
          { key: "tooltip" },
          createElement("rect", {
            x: String(tooltipX - 4),
            y: String(tooltipY - 14),
            width: "110",
            height: "36",
            rx: "4",
            fill: "rgba(15, 23, 42, 0.9)",
            stroke: "#475569",
            "stroke-width": "1",
          }),
          createElement(
            "text",
            {
              x: String(tooltipX),
              y: String(tooltipY),
              fill: "#e2e8f0",
              "font-size": "11",
              "font-family": "monospace",
            },
            `Freq: ${hoveredObj.frequency.toFixed(1)} Hz`,
          ),
          createElement(
            "text",
            {
              x: String(tooltipX),
              y: String(tooltipY + 14),
              fill: "#e2e8f0",
              "font-size": "11",
              "font-family": "monospace",
            },
            `Amp: ${hoveredObj.amplitude.toFixed(1)}`,
          ),
        );
      })()
    : null;

  // Build the SVG with overlaid circles using VectorField data prop + extra elements
  // We wrap VectorField in a div that has the overlay SVG on top
  const overlaySvgChildren = [...overlayCircles];
  if (tooltipElement !== null) {
    overlaySvgChildren.push(tooltipElement);
  }

  const fieldElement = createElement(
    "div",
    {
      ref: containerRef,
      style: {
        position: "relative",
        flex: "1",
        minWidth: "0",
        minHeight: "0",
        cursor: "crosshair",
      },
      onClick: handleClick,
      onContextMenu: handleContextMenu,
    },
    createElement(VectorField, {
      data: fieldData,
      width: FIELD_WIDTH,
      height: FIELD_HEIGHT,
      xRange: X_RANGE,
      yRange: Y_RANGE,
      colorByMagnitude: true,
      colorScale: ["#1e3a5f", "#3b82f6", "#8b5cf6", "#ef4444", "#fbbf24"],
      showGrid: true,
      showAxes: false,
      arrowScale: 0.8,
      padding: FIELD_PADDING,
      title: "",
      arrowWidth: 1.5,
      renderer: "canvas",
    }),
    // Overlay SVG for object circles (SVG-level pointerEvents none, individual circles all)
    createElement(
      "svg",
      {
        style: {
          position: "absolute",
          top: "0",
          left: "0",
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        },
        viewBox: `0 0 ${FIELD_WIDTH} ${FIELD_HEIGHT}`,
        preserveAspectRatio: "xMidYMid meet",
        "aria-hidden": "true",
      },
      ...overlaySvgChildren,
    ),
  );

  // Context menu overlay (rendered directly when contextPos is set)
  const contextMenuElement =
    contextPos !== null
      ? createElement(
          "div",
          {
            role: "menu",
            "aria-label": "Object actions",
            onMouseDown: (e: Event) => e.stopPropagation(),
            style: {
              position: "fixed",
              left: `${contextPos.x}px`,
              top: `${contextPos.y}px`,
              zIndex: "10200",
              backgroundColor: "var(--color-bg, #ffffff)",
              border: "1px solid var(--color-border, #e2e8f0)",
              borderRadius: "6px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              padding: "4px 0",
              minWidth: "160px",
              fontSize: "13px",
              color: "currentColor",
            },
          },
          ...contextMenuItems.map((item, i) =>
            item.divider
              ? createElement("div", {
                  key: `divider-${i}`,
                  style: {
                    height: "1px",
                    backgroundColor: "var(--color-border, #e2e8f0)",
                    margin: "4px 0",
                  },
                })
              : createElement(
                  "button",
                  {
                    key: `item-${i}`,
                    role: "menuitem",
                    type: "button",
                    onClick: item.onClick,
                    style: {
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      width: "100%",
                      padding: "6px 12px",
                      border: "none",
                      background: "none",
                      color: "currentColor",
                      cursor: "pointer",
                      fontSize: "13px",
                      fontFamily: "inherit",
                      textAlign: "left",
                    },
                  },
                  item.icon
                    ? createElement("span", { "aria-hidden": "true" }, item.icon)
                    : null,
                  item.label,
                ),
          ),
        )
      : null;

  // Inline config input for per-source frequency/amplitude editing
  const configInputElement =
    configMode !== null
      ? (() => {
          const configObj = objects.find((o) => o.id === configMode.objectId);
          if (!configObj) return null;
          const currentValue =
            configMode.field === "frequency"
              ? configObj.frequency
              : configObj.amplitude;
          const fieldLabel =
            configMode.field === "frequency" ? "Frequency (Hz)" : "Amplitude";
          return createElement(
            "div",
            {
              onMouseDown: (e: Event) => e.stopPropagation(),
              style: {
                position: "fixed",
                left: `${configMode.x}px`,
                top: `${configMode.y}px`,
                zIndex: "10200",
                backgroundColor: "var(--color-bg, #ffffff)",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "6px",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                padding: "8px 12px",
                fontSize: "13px",
                color: "currentColor",
              },
            },
            createElement(
              "label",
              {
                style: {
                  display: "block",
                  marginBottom: "4px",
                  fontSize: "11px",
                  fontWeight: "600",
                },
              },
              fieldLabel,
            ),
            createElement("input", {
              type: "number",
              defaultValue: String(currentValue),
              step: configMode.field === "frequency" ? "0.5" : "0.1",
              min: configMode.field === "frequency" ? "0.1" : "0.1",
              max: configMode.field === "frequency" ? "20" : "10",
              "aria-label": fieldLabel,
              style: {
                width: "80px",
                padding: "4px 6px",
                border: "1px solid var(--color-border, #e2e8f0)",
                borderRadius: "4px",
                fontSize: "13px",
                fontFamily: "monospace",
                outline: "none",
              },
              onKeyDown: (e: Event) => {
                const ke = e as KeyboardEvent;
                if (ke.key === "Enter") {
                  const val = parseFloat(
                    (ke.target as HTMLInputElement).value,
                  );
                  if (!isNaN(val) && val > 0) {
                    applyConfigValue(val);
                  }
                }
              },
              onBlur: (e: Event) => {
                const val = parseFloat(
                  (e.target as HTMLInputElement).value,
                );
                if (!isNaN(val) && val > 0) {
                  applyConfigValue(val);
                } else {
                  setConfigMode(null);
                }
              },
            }),
          );
        })()
      : null;

  // Controls panel
  const controlsPanel = createElement(
    "div",
    {
      style: {
        display: "flex",
        flexWrap: "wrap",
        gap: "16px",
        alignItems: "center",
        padding: "8px 12px",
        backgroundColor: "var(--color-surface, rgba(15, 23, 42, 0.05))",
        borderRadius: "8px",
        fontSize: "12px",
        color: "var(--color-text, #1f2937)",
      },
    },
    createElement(
      "div",
      { style: { minWidth: "140px", flex: "1" } },
      createElement(Slider, {
        value: frequency,
        onChange: onFrequencyChange,
        min: 0.5,
        max: 10,
        step: 0.5,
        label: "Frequency (Hz)",
      }),
    ),
    createElement(
      "div",
      { style: { minWidth: "140px", flex: "1" } },
      createElement(Slider, {
        value: amplitude,
        onChange: onAmplitudeChange,
        min: 0.1,
        max: 5,
        step: 0.1,
        label: "Amplitude",
      }),
    ),
    createElement(
      "div",
      { style: { minWidth: "140px", flex: "1" } },
      createElement(Slider, {
        value: animSpeed,
        onChange: onAnimSpeedChange,
        min: 0,
        max: 5,
        step: 0.1,
        label: "Animation Speed (s)",
      }),
    ),
    createElement(
      "div",
      {
        style: {
          display: "flex",
          gap: "12px",
          fontSize: "11px",
          whiteSpace: "nowrap",
        },
      },
      createElement("span", { style: { color: "#ef4444" } }, `Sources: ${sourceCount}`),
      createElement("span", { style: { color: "#22c55e" } }, `Absorbers: ${absorberCount}`),
      createElement("span", { style: { color: "#3b82f6" } }, `Reflectors: ${reflectorCount}`),
    ),
  );

  return createElement(
    "div",
    {
      style: {
        display: "flex",
        flexDirection: "column",
        height: "100%",
        gap: "8px",
        boxSizing: "border-box",
      },
    },
    // Controls at top — thin strip
    controlsPanel,
    // Instructions
    createElement(
      "p",
      {
        style: {
          fontSize: "10px",
          color: "var(--color-text-muted, #94a3b8)",
          margin: "0",
          padding: "0 4px",
          lineHeight: "1.4",
        },
      },
      "Left-click to place a radio source. Right-click an object to change its type, configure frequency/amplitude, or delete it.",
    ),
    // Vector field takes remaining space
    fieldElement,
    // Context menu (rendered as fixed overlay)
    contextMenuElement,
    // Inline config input (rendered as fixed overlay)
    configInputElement,
  );
}
