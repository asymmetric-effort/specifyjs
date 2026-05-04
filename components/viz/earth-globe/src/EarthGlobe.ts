// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * EarthGlobe — A SpecifyJS component that renders an interactive 3D-looking
 * Earth globe using SVG with orthographic projection.
 *
 * Supports:
 *  - Orthographic (spherical) projection of country outlines
 *  - Latitude/longitude graticule grid
 *  - Mouse-drag rotation
 *  - Country hover and click events
 *  - Country highlight coloring
 *  - ARIA accessibility attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from "../../../../core/src/index";
import {
  useState,
  useRef,
  useMemo,
  useCallback,
} from "../../../../core/src/hooks/index";
import { COUNTRIES } from "./globe-data";
import type { CountryData } from "./globe-data";

// -- Props --------------------------------------------------------------------

export interface EarthGlobeProps {
  /** SVG width in pixels (default: 400) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Initial rotation: longitude and latitude of center point */
  rotation?: { longitude: number; latitude: number };
  /** Land fill color (default: '#22c55e') */
  fillColor?: string;
  /** Ocean/background color (default: '#3b82f6') */
  oceanColor?: string;
  /** Country border stroke color (default: '#ffffff') */
  strokeColor?: string;
  /** Country border stroke width (default: 0.5) */
  strokeWidth?: number;
  /** Show latitude/longitude grid lines (default: true) */
  showGraticule?: boolean;
  /** Graticule line color (default: 'rgba(255,255,255,0.2)') */
  graticuleColor?: string;
  /** Allow drag-to-rotate interaction (default: true) */
  interactive?: boolean;
  /** Callback when a country is clicked */
  onCountryClick?: (countryId: string) => void;
  /** Callback when a country is hovered (null when leaving) */
  onCountryHover?: (countryId: string | null) => void;
  /** Country hover color (default: '#16a34a') */
  hoverColor?: string;
  /** Accessible title (default: 'Earth Globe') */
  title?: string;
  /** Map of country ID to highlight color */
  highlightCountries?: Record<string, string>;
}

// -- Projection math ----------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/** Convert degrees to radians. */
export function toRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

/** Convert radians to degrees. */
export function toDeg(rad: number): number {
  return rad * RAD_TO_DEG;
}

/**
 * Orthographic projection: project a [lon, lat] point onto a 2D plane
 * centered at [centerLon, centerLat].
 *
 * Returns { x, y, visible } where x,y are in [-1,1] range and visible
 * indicates whether the point is on the near side of the globe.
 */
export function orthographicProject(
  lon: number,
  lat: number,
  centerLon: number,
  centerLat: number,
): { x: number; y: number; visible: boolean } {
  const lambda = toRad(lon);
  const phi = toRad(lat);
  const lambda0 = toRad(centerLon);
  const phi0 = toRad(centerLat);

  const cosC =
    Math.sin(phi0) * Math.sin(phi) +
    Math.cos(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);

  // Point is on the far side of the globe
  const visible = cosC > 0;

  const x = Math.cos(phi) * Math.sin(lambda - lambda0);
  const y =
    Math.cos(phi0) * Math.sin(phi) -
    Math.sin(phi0) * Math.cos(phi) * Math.cos(lambda - lambda0);

  return { x, y, visible };
}

/**
 * Project a polygon ring onto the SVG coordinate system, returning an SVG
 * path string. Only draws segments where both endpoints are visible.
 */
export function projectPolygonToPath(
  ring: [number, number][],
  centerLon: number,
  centerLat: number,
  cx: number,
  cy: number,
  radius: number,
): string {
  if (ring.length < 3) return "";

  const projected = ring.map(([lon, lat]) =>
    orthographicProject(lon, lat, centerLon, centerLat),
  );

  const parts: string[] = [];
  let inPath = false;

  for (let i = 0; i < projected.length; i++) {
    const p = projected[i]!;
    if (p.visible) {
      const sx = cx + p.x * radius;
      const sy = cy - p.y * radius;
      if (!inPath) {
        parts.push(`M${sx.toFixed(1)},${sy.toFixed(1)}`);
        inPath = true;
      } else {
        parts.push(`L${sx.toFixed(1)},${sy.toFixed(1)}`);
      }
    } else {
      inPath = false;
    }
  }

  // Close path if we have visible points
  if (parts.length > 1) {
    parts.push("Z");
  }

  return parts.join("");
}

/**
 * Generate graticule paths (lat/lon grid lines).
 * Returns an array of SVG path strings.
 */
export function buildGraticuleLines(
  centerLon: number,
  centerLat: number,
  cx: number,
  cy: number,
  radius: number,
  step: number,
): string[] {
  const paths: string[] = [];
  const pointsPerLine = 72; // points per great circle

  // Latitude lines (parallels)
  for (let lat = -90 + step; lat < 90; lat += step) {
    const parts: string[] = [];
    let inPath = false;
    for (let i = 0; i <= pointsPerLine; i++) {
      const lon = -180 + (360 * i) / pointsPerLine;
      const p = orthographicProject(lon, lat, centerLon, centerLat);
      if (p.visible) {
        const sx = cx + p.x * radius;
        const sy = cy - p.y * radius;
        if (!inPath) {
          parts.push(`M${sx.toFixed(1)},${sy.toFixed(1)}`);
          inPath = true;
        } else {
          parts.push(`L${sx.toFixed(1)},${sy.toFixed(1)}`);
        }
      } else {
        inPath = false;
      }
    }
    if (parts.length > 1) {
      paths.push(parts.join(""));
    }
  }

  // Longitude lines (meridians)
  for (let lon = -180; lon < 180; lon += step) {
    const parts: string[] = [];
    let inPath = false;
    for (let i = 0; i <= pointsPerLine; i++) {
      const lat = -90 + (180 * i) / pointsPerLine;
      const p = orthographicProject(lon, lat, centerLon, centerLat);
      if (p.visible) {
        const sx = cx + p.x * radius;
        const sy = cy - p.y * radius;
        if (!inPath) {
          parts.push(`M${sx.toFixed(1)},${sy.toFixed(1)}`);
          inPath = true;
        } else {
          parts.push(`L${sx.toFixed(1)},${sy.toFixed(1)}`);
        }
      } else {
        inPath = false;
      }
    }
    if (parts.length > 1) {
      paths.push(parts.join(""));
    }
  }

  return paths;
}

// -- Component ----------------------------------------------------------------

export function EarthGlobe(props: EarthGlobeProps) {
  const {
    width = 400,
    height = 400,
    rotation = { longitude: -95, latitude: 38 },
    fillColor = "#22c55e",
    oceanColor = "#3b82f6",
    strokeColor = "#ffffff",
    strokeWidth = 0.5,
    showGraticule = true,
    graticuleColor = "rgba(255,255,255,0.2)",
    interactive = true,
    onCountryClick,
    onCountryHover,
    hoverColor = "#16a34a",
    title = "Earth Globe",
    highlightCountries = {},
  } = props;

  // Rotation state
  const [currentRotation, setCurrentRotation] = useState(rotation);

  // Drag tracking
  const dragRef = useRef<{
    isDragging: boolean;
    startX: number;
    startY: number;
    startLon: number;
    startLat: number;
  }>({
    isDragging: false,
    startX: 0,
    startY: 0,
    startLon: rotation.longitude,
    startLat: rotation.latitude,
  });

  // Hover state
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  // Geometry
  const cx = width / 2;
  const cy = height / 2;
  const radius = Math.min(width, height) / 2 - 4;

  // Sensitivity: degrees per pixel of drag
  const sensitivity = 0.4;

  // Event handlers
  const handleMouseDown = useCallback(
    (e: { clientX: number; clientY: number }) => {
      if (!interactive) return;
      const ref = dragRef.current;
      if (ref) {
        ref.isDragging = true;
        ref.startX = e.clientX;
        ref.startY = e.clientY;
        ref.startLon = currentRotation.longitude;
        ref.startLat = currentRotation.latitude;
      }
    },
    [interactive, currentRotation],
  );

  const handleMouseMove = useCallback(
    (e: { clientX: number; clientY: number }) => {
      const ref = dragRef.current;
      if (!ref || !ref.isDragging) return;
      const dx = e.clientX - ref.startX;
      const dy = e.clientY - ref.startY;
      const newLon = ref.startLon - dx * sensitivity;
      const newLat = clampLat(ref.startLat + dy * sensitivity);
      setCurrentRotation({ longitude: newLon, latitude: newLat });
    },
    [sensitivity],
  );

  const handleMouseUp = useCallback(() => {
    const ref = dragRef.current;
    if (ref) {
      ref.isDragging = false;
    }
  }, []);

  const handleCountryEnter = useCallback(
    (countryId: string) => {
      setHoveredCountry(countryId);
      if (onCountryHover) onCountryHover(countryId);
    },
    [onCountryHover],
  );

  const handleCountryLeave = useCallback(() => {
    setHoveredCountry(null);
    if (onCountryHover) onCountryHover(null);
  }, [onCountryHover]);

  const handleCountryClick = useCallback(
    (countryId: string) => {
      if (onCountryClick) onCountryClick(countryId);
    },
    [onCountryClick],
  );

  // -- Build graticule paths ---------------------------------------------------

  const graticulePaths = useMemo(() => {
    if (!showGraticule) return [];
    return buildGraticuleLines(
      currentRotation.longitude,
      currentRotation.latitude,
      cx,
      cy,
      radius,
      30,
    );
  }, [
    showGraticule,
    currentRotation.longitude,
    currentRotation.latitude,
    cx,
    cy,
    radius,
  ]);

  // -- Build country paths -----------------------------------------------------

  const countryElements = useMemo(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (const country of COUNTRIES) {
      const paths: string[] = [];
      for (const ring of country.polygons) {
        const p = projectPolygonToPath(
          ring,
          currentRotation.longitude,
          currentRotation.latitude,
          cx,
          cy,
          radius,
        );
        if (p) paths.push(p);
      }

      if (paths.length === 0) continue;

      const combinedPath = paths.join(" ");
      const isHovered = hoveredCountry === country.id;
      const highlightColor = highlightCountries[country.id];
      const countryFill = isHovered
        ? hoverColor
        : highlightColor
          ? highlightColor
          : fillColor;

      elements.push(
        createElement("path", {
          key: `country-${country.id}`,
          d: combinedPath,
          fill: countryFill,
          stroke: strokeColor,
          "stroke-width": String(strokeWidth),
          "stroke-linejoin": "round",
          role: "button",
          "aria-label": country.name,
          tabindex: "0",
          style: { cursor: onCountryClick ? "pointer" : "default" },
          onmouseenter: () => handleCountryEnter(country.id),
          onmouseleave: () => handleCountryLeave(),
          onclick: () => handleCountryClick(country.id),
        }),
      );
    }

    return elements;
  }, [
    currentRotation.longitude,
    currentRotation.latitude,
    cx,
    cy,
    radius,
    hoveredCountry,
    highlightCountries,
    hoverColor,
    fillColor,
    strokeColor,
    strokeWidth,
    onCountryClick,
    handleCountryEnter,
    handleCountryLeave,
    handleCountryClick,
  ]);

  // -- Assemble SVG -----------------------------------------------------------

  const clipId = "globe-clip";

  // Defs: clip path for the globe circle
  const defs = createElement(
    "defs",
    { key: "defs" },
    createElement(
      "clipPath",
      { id: clipId, key: "clip" },
      createElement("circle", {
        key: "clip-circle",
        cx: String(cx),
        cy: String(cy),
        r: String(radius),
      }),
    ),
  );

  // Ocean background
  const ocean = createElement("circle", {
    key: "ocean",
    cx: String(cx),
    cy: String(cy),
    r: String(radius),
    fill: oceanColor,
  });

  // Graticule group
  const graticuleElements = graticulePaths.map((d, i) =>
    createElement("path", {
      key: `grat-${i}`,
      d,
      fill: "none",
      stroke: graticuleColor,
      "stroke-width": "0.5",
    }),
  );

  const graticuleGroup = createElement(
    "g",
    {
      key: "graticule",
      "clip-path": `url(#${clipId})`,
    },
    ...graticuleElements,
  );

  // Countries group
  const countriesGroup = createElement(
    "g",
    {
      key: "countries",
      "clip-path": `url(#${clipId})`,
    },
    ...countryElements,
  );

  // Globe outline ring
  const outline = createElement("circle", {
    key: "outline",
    cx: String(cx),
    cy: String(cy),
    r: String(radius),
    fill: "none",
    stroke: strokeColor,
    "stroke-width": "1",
    opacity: "0.4",
  });

  // Interactive event layer (transparent overlay for drag)
  const interactionLayer = interactive
    ? createElement("circle", {
        key: "interaction",
        cx: String(cx),
        cy: String(cy),
        r: String(radius),
        fill: "transparent",
        style: { cursor: "grab" },
        onmousedown: handleMouseDown,
        onmousemove: handleMouseMove,
        onmouseup: handleMouseUp,
        onmouseleave: handleMouseUp,
      })
    : null;

  return createElement(
    "svg",
    {
      width: "100%",
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: "xMidYMid meet",
      xmlns: "http://www.w3.org/2000/svg",
      role: "img",
      "aria-label": title,
      style: { fontFamily: "sans-serif", userSelect: "none" },
    },
    defs,
    ocean,
    graticuleGroup,
    countriesGroup,
    outline,
    interactionLayer,
  );
}

// -- Utility ------------------------------------------------------------------

/** Clamp latitude to [-90, 90]. */
function clampLat(lat: number): number {
  if (lat > 90) return 90;
  if (lat < -90) return -90;
  return lat;
}
