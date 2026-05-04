// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * USStateMap — A SpecifyJS component that renders an interactive SVG map
 * of the United States with per-state coloring, hover effects, and click handlers.
 *
 * SVG path data sourced from a public domain (CC0) blank US map.
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from "../../../../core/src/index";
import { useMemo, useCallback } from "../../../../core/src/hooks/index";
import { US_STATE_PATHS } from "./us-state-paths";

// -- Props --------------------------------------------------------------------

export interface USStateMapProps {
  /** SVG width in pixels (default: 959) */
  width?: number;
  /** SVG height in pixels (default: 593) */
  height?: number;
  /** Map of state abbreviation to fill color */
  stateColors?: Record<string, string>;
  /** Default fill color for states not in stateColors (default: '#D0D0D0') */
  defaultColor?: string;
  /** Border color between states (default: '#FFFFFF') */
  strokeColor?: string;
  /** Border width between states (default: 1) */
  strokeWidth?: number;
  /** Click handler — receives the state abbreviation */
  onStateClick?: (stateId: string) => void;
  /** Hover handler — receives the state abbreviation or null on mouse leave */
  onStateHover?: (stateId: string | null) => void;
  /** Highlight color on hover (default: '#FFD700') */
  hoverColor?: string;
  /** Accessible title for the SVG (default: 'Map of the United States') */
  title?: string;
}

// -- Component ----------------------------------------------------------------

export function USStateMap(props: USStateMapProps) {
  const {
    width = 959,
    height = 593,
    stateColors = {},
    defaultColor = "#D0D0D0",
    strokeColor = "#FFFFFF",
    strokeWidth = 1,
    onStateClick,
    onStateHover,
    hoverColor = "#FFD700",
    title = "Map of the United States",
  } = props;

  const stateIds = useMemo(() => Object.keys(US_STATE_PATHS), []);

  const handleClick = useCallback(
    (stateId: string) => {
      if (onStateClick) {
        onStateClick(stateId);
      }
    },
    [onStateClick],
  );

  const handleMouseOver = useCallback(
    (stateId: string, e: Event) => {
      const target = e.currentTarget as SVGElement;
      if (target) {
        target.setAttribute("fill", hoverColor);
      }
      if (onStateHover) {
        onStateHover(stateId);
      }
    },
    [onStateHover, hoverColor],
  );

  const handleMouseOut = useCallback(
    (stateId: string, e: Event) => {
      const target = e.currentTarget as SVGElement;
      if (target) {
        const originalColor = stateColors[stateId] ?? defaultColor;
        target.setAttribute("fill", originalColor);
      }
      if (onStateHover) {
        onStateHover(null);
      }
    },
    [onStateHover, stateColors, defaultColor],
  );

  // Build state path elements
  const stateElements = useMemo(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < stateIds.length; i++) {
      const stateId = stateIds[i]!;
      const stateData = US_STATE_PATHS[stateId]!;
      const fill = stateColors[stateId] ?? defaultColor;

      const pathProps: Record<string, unknown> = {
        key: `state-${stateId}`,
        d: stateData.path,
        fill,
        stroke: strokeColor,
        "stroke-width": String(strokeWidth),
        "stroke-linejoin": "round",
        "data-state": stateId,
        role: "img",
        "aria-label": stateData.name,
        style: { cursor: onStateClick ? "pointer" : "default" },
      };

      if (onStateClick) {
        const sid = stateId;
        pathProps.onClick = () => handleClick(sid);
        pathProps.onKeyDown = (e: Event) => {
          if (
            (e as KeyboardEvent).key === "Enter" ||
            (e as KeyboardEvent).key === " "
          ) {
            handleClick(sid);
          }
        };
        pathProps.tabIndex = 0;
        pathProps.role = "button";
        pathProps["aria-label"] = stateData.name;
      }

      // Always attach hover handlers for visual feedback
      const sid = stateId;
      pathProps.onMouseOver = (e: Event) => handleMouseOver(sid, e);
      pathProps.onMouseOut = (e: Event) => handleMouseOut(sid, e);

      elements.push(createElement("path", pathProps));
    }

    return elements;
  }, [
    stateIds,
    stateColors,
    defaultColor,
    strokeColor,
    strokeWidth,
    onStateClick,
    handleClick,
    handleMouseOver,
    handleMouseOut,
  ]);

  // Build title element
  const titleElement = createElement("title", { key: "map-title" }, title);

  return createElement(
    "svg",
    {
      width: "100%",
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "xMidYMid meet",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": title,
      style: { fontFamily: "sans-serif" },
    },
    titleElement,
    ...stateElements,
  );
}
