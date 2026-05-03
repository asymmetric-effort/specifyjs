// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * LollipopChart -- A SpecifyJS component that renders lollipop charts as SVG.
 *
 * Each data point is rendered as a thin stem (line) with a circle at the end,
 * similar to a bar chart but with a lighter visual footprint.
 *
 * Supports:
 *  - Vertical and horizontal orientation
 *  - Configurable stem and dot styling
 *  - Grid lines, value labels, title
 *  - Per-datum colors
 *  - Edge cases: empty data, single item, zero values
 *
 * Zero runtime dependencies -- pure SpecifyJS + SVG.
 */

import { createElement } from "../../../../core/src/index";
import { useMemo, useCallback } from "../../../../core/src/hooks/index";

// -- Data types ---------------------------------------------------------------

export interface LollipopDatum {
  label: string;
  value: number;
  color?: string;
}

// -- Props --------------------------------------------------------------------

export interface LollipopChartProps {
  /** Data points to render */
  data: LollipopDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Chart orientation (default: 'vertical') */
  orientation?: "horizontal" | "vertical";
  /** Stem line color (default: '#94a3b8') */
  stemColor?: string;
  /** Stem line width in px (default: 2) */
  stemWidth?: number;
  /** Dot radius in px (default: 6) */
  dotRadius?: number;
  /** Dot fill color (default: '#3b82f6') */
  dotColor?: string;
  /** Show grid lines (default: true) */
  showGrid?: boolean;
  /** Show value labels (default: true) */
  showValues?: boolean;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 60) */
  padding?: number;
}

// -- Helpers ------------------------------------------------------------------

/** Nice round grid step for a given max value aiming for ~5 grid lines. */
function niceStep(maxVal: number): number {
  if (maxVal <= 0) return 1;
  const rough = maxVal / 5;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

// -- Component ----------------------------------------------------------------

export function LollipopChart(props: LollipopChartProps) {
  const {
    data = [],
    width = 600,
    height = 400,
    orientation = "vertical",
    stemColor = "#94a3b8",
    stemWidth = 2,
    dotRadius = 6,
    dotColor = "#3b82f6",
    showGrid = true,
    showValues = true,
    title,
    padding = 60,
  } = props;

  const isVertical = orientation === "vertical";

  const bottomExtra = isVertical ? 30 : 0;
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2 - bottomExtra;

  const valueAxisLength = isVertical ? chartHeight : chartWidth;
  const categoryAxisLength = isVertical ? chartWidth : chartHeight;

  const maxValue = useMemo(() => {
    let m = 0;
    for (let i = 0; i < data.length; i++) {
      if (data[i]!.value > m) m = data[i]!.value;
    }
    return m > 0 ? m : 1;
  }, [data]);

  const itemSpacing = useMemo(() => {
    if (data.length === 0) return 0;
    return categoryAxisLength / data.length;
  }, [data.length, categoryAxisLength]);

  // ---- Grid lines -----------------------------------------------------------

  const buildGridLines = useCallback(() => {
    if (!showGrid) return [];

    const step = niceStep(maxValue);
    const lines: ReturnType<typeof createElement>[] = [];

    for (let v = step; v <= maxValue; v += step) {
      const pos = (v / maxValue) * valueAxisLength;

      if (isVertical) {
        const y = padding + chartHeight - pos;
        lines.push(
          createElement("line", {
            key: `grid-${v}`,
            x1: String(padding),
            y1: String(y),
            x2: String(padding + chartWidth),
            y2: String(y),
            stroke: "#e5e7eb",
            "stroke-width": "1",
            "stroke-dasharray": "4 2",
          }),
        );
        lines.push(
          createElement(
            "text",
            {
              key: `grid-label-${v}`,
              x: String(padding - 8),
              y: String(y + 4),
              "text-anchor": "end",
              "font-size": "11",
              "font-family": "sans-serif",
              fill: "#6b7280",
            },
            String(v),
          ),
        );
      } else {
        const x = padding + pos;
        lines.push(
          createElement("line", {
            key: `grid-${v}`,
            x1: String(x),
            y1: String(padding),
            x2: String(x),
            y2: String(padding + chartHeight),
            stroke: "#e5e7eb",
            "stroke-width": "1",
            "stroke-dasharray": "4 2",
          }),
        );
        lines.push(
          createElement(
            "text",
            {
              key: `grid-label-${v}`,
              x: String(x),
              y: String(padding + chartHeight + 16),
              "text-anchor": "middle",
              "font-size": "11",
              "font-family": "sans-serif",
              fill: "#6b7280",
            },
            String(v),
          ),
        );
      }
    }

    return lines;
  }, [
    showGrid,
    maxValue,
    isVertical,
    padding,
    chartWidth,
    chartHeight,
    valueAxisLength,
  ]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    // Value axis
    if (isVertical) {
      elements.push(
        createElement("line", {
          key: "axis-y",
          x1: String(padding),
          y1: String(padding),
          x2: String(padding),
          y2: String(padding + chartHeight),
          stroke: "#374151",
          "stroke-width": "1.5",
        }),
      );
    } else {
      elements.push(
        createElement("line", {
          key: "axis-y",
          x1: String(padding),
          y1: String(padding),
          x2: String(padding),
          y2: String(padding + chartHeight),
          stroke: "#374151",
          "stroke-width": "1.5",
        }),
      );
    }

    // Category axis
    elements.push(
      createElement("line", {
        key: "axis-x",
        x1: String(padding),
        y1: String(padding + chartHeight),
        x2: String(padding + chartWidth),
        y2: String(padding + chartHeight),
        stroke: "#374151",
        "stroke-width": "1.5",
      }),
    );

    return elements;
  }, [isVertical, padding, chartWidth, chartHeight]);

  // ---- Lollipops ------------------------------------------------------------

  const buildLollipops = useCallback(() => {
    if (data.length === 0) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const valueLen = (d.value / maxValue) * valueAxisLength;
      const catPos = itemSpacing * i + itemSpacing / 2;
      const fill = d.color ?? dotColor;

      if (isVertical) {
        const cx = padding + catPos;
        const baseY = padding + chartHeight;
        const tipY = padding + chartHeight - valueLen;

        // Stem
        elements.push(
          createElement("line", {
            key: `stem-${i}`,
            x1: String(cx),
            y1: String(baseY),
            x2: String(cx),
            y2: String(tipY),
            stroke: stemColor,
            "stroke-width": String(stemWidth),
          }),
        );

        // Dot
        elements.push(
          createElement("circle", {
            key: `dot-${i}`,
            cx: String(cx),
            cy: String(tipY),
            r: String(dotRadius),
            fill,
          }),
        );

        // Value label
        if (showValues) {
          elements.push(
            createElement(
              "text",
              {
                key: `val-${i}`,
                x: String(cx),
                y: String(tipY - dotRadius - 4),
                "text-anchor": "middle",
                "font-size": "11",
                "font-family": "sans-serif",
                fill: "#374151",
              },
              String(d.value),
            ),
          );
        }

        // Category label (rotated -45° to prevent overlap)
        const catLabelX = cx;
        const catLabelY = padding + chartHeight + 16;
        elements.push(
          createElement(
            "text",
            {
              key: `cat-${i}`,
              x: String(catLabelX),
              y: String(catLabelY),
              "text-anchor": "end",
              "font-size": "11",
              "font-family": "sans-serif",
              fill: "#374151",
              transform: `rotate(-45, ${catLabelX}, ${catLabelY})`,
            },
            d.label,
          ),
        );
      } else {
        // Horizontal orientation
        const cy = padding + catPos;
        const baseX = padding;
        const tipX = padding + valueLen;

        // Stem
        elements.push(
          createElement("line", {
            key: `stem-${i}`,
            x1: String(baseX),
            y1: String(cy),
            x2: String(tipX),
            y2: String(cy),
            stroke: stemColor,
            "stroke-width": String(stemWidth),
          }),
        );

        // Dot
        elements.push(
          createElement("circle", {
            key: `dot-${i}`,
            cx: String(tipX),
            cy: String(cy),
            r: String(dotRadius),
            fill,
          }),
        );

        // Value label
        if (showValues) {
          elements.push(
            createElement(
              "text",
              {
                key: `val-${i}`,
                x: String(tipX + dotRadius + 4),
                y: String(cy + 4),
                "text-anchor": "start",
                "font-size": "11",
                "font-family": "sans-serif",
                fill: "#374151",
              },
              String(d.value),
            ),
          );
        }

        // Category label
        elements.push(
          createElement(
            "text",
            {
              key: `cat-${i}`,
              x: String(padding - 8),
              y: String(cy + 4),
              "text-anchor": "end",
              "font-size": "11",
              "font-family": "sans-serif",
              fill: "#374151",
            },
            d.label,
          ),
        );
      }
    }

    return elements;
  }, [
    data,
    maxValue,
    itemSpacing,
    dotColor,
    dotRadius,
    stemColor,
    stemWidth,
    showValues,
    isVertical,
    padding,
    chartWidth,
    chartHeight,
    valueAxisLength,
  ]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        "text",
        {
          key: "title",
          x: String(width / 2),
          y: String(padding / 2 + 4),
          "text-anchor": "middle",
          "font-size": "16",
          "font-weight": "bold",
          "font-family": "sans-serif",
          fill: "#111827",
        },
        title,
      ),
    ];
  }, [title, width, padding]);

  // ---- Empty state ----------------------------------------------------------

  const buildEmptyState = useCallback(() => {
    if (data.length > 0) return [];
    return [
      createElement(
        "text",
        {
          key: "empty",
          x: String(width / 2),
          y: String(height / 2),
          "text-anchor": "middle",
          "font-size": "14",
          "font-family": "sans-serif",
          fill: "#9ca3af",
        },
        "No data",
      ),
    ];
  }, [data.length, width, height]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridLines = buildGridLines();
  const axes = buildAxes();
  const lollipops = buildLollipops();
  const titleEl = buildTitle();
  const emptyState = buildEmptyState();

  return createElement(
    "svg",
    {
      width: "100%",
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "xMidYMid meet",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": title ?? "Lollipop chart",
      style: { fontFamily: "sans-serif" },
    },
    ...titleEl,
    ...gridLines,
    ...axes,
    ...lollipops,
    ...emptyState,
  );
}
