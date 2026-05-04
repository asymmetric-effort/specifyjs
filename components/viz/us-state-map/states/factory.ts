// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Factory function that creates a US state/territory map component
 * given its SVG path data, viewBox, and default name.
 */

import { createElement } from "../../../../core/src/index";
import type { StateMapProps } from "./types";

export interface StatePathConfig {
  /** The full name of the state/territory */
  name: string;
  /** The SVG path `d` attribute(s) — may contain multiple sub-paths */
  pathData: string;
  /** The viewBox dimensions for this state */
  viewBox: { minX: number; minY: number; width: number; height: number };
}

/**
 * Creates a SpecifyJS component function for a single US state or territory.
 *
 * @param config - The path data, name, and viewBox for the state
 * @returns A SpecifyJS component function
 */
export function createStateMapComponent(config: StatePathConfig) {
  const { name, pathData, viewBox } = config;
  const aspectRatio = viewBox.width / viewBox.height;

  function StateMap(props: StateMapProps) {
    const {
      fillColor = "#3b82f6",
      strokeColor = "#ffffff",
      strokeWidth = 1,
      onClick,
      onMouseEnter,
      onMouseLeave,
      title = name,
      className,
    } = props;

    // Compute default dimensions preserving aspect ratio
    const defaultSize = 200;
    let width: number;
    let height: number;
    if (props.width !== undefined && props.height !== undefined) {
      width = props.width;
      height = props.height;
    } else if (props.width !== undefined) {
      width = props.width;
      height = Math.round(width / aspectRatio);
    } else if (props.height !== undefined) {
      height = props.height;
      width = Math.round(height * aspectRatio);
    } else {
      if (aspectRatio >= 1) {
        width = defaultSize;
        height = Math.round(defaultSize / aspectRatio);
      } else {
        height = defaultSize;
        width = Math.round(defaultSize * aspectRatio);
      }
    }

    const svgProps: Record<string, unknown> = {
      width: String(width),
      height: String(height),
      viewBox: `${viewBox.minX} ${viewBox.minY} ${viewBox.width} ${viewBox.height}`,
      preserveAspectRatio: "xMidYMid meet",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": title,
    };

    if (className) {
      svgProps["class"] = className;
    }

    const pathProps: Record<string, unknown> = {
      d: pathData,
      fill: fillColor,
      stroke: strokeColor,
      "stroke-width": String(strokeWidth),
      "stroke-linejoin": "round",
    };

    if (onClick) {
      pathProps["onclick"] = onClick;
      pathProps["style"] = "cursor: pointer";
    }
    if (onMouseEnter) {
      pathProps["onmouseenter"] = onMouseEnter;
    }
    if (onMouseLeave) {
      pathProps["onmouseleave"] = onMouseLeave;
    }

    return createElement(
      "svg",
      svgProps,
      createElement("title", {}, title),
      createElement("path", pathProps),
    );
  }

  // Set displayName for debugging
  Object.defineProperty(StateMap, "name", {
    value: `StateMap_${name.replace(/\s+/g, "_")}`,
  });

  return StateMap;
}
