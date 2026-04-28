// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * GeoMap — A SpecifyJS component that renders geographic maps as SVG.
 *
 * Supports:
 *  - Choropleth coloring of regions via pre-computed SVG path data
 *  - Point markers via lat/lon with Mercator or equirectangular projection
 *  - Configurable color scales for value-based region coloring
 *  - Region labels
 *  - Demo helper: generateUSMapOutline() returns ~10 simplified US state regions
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface GeoRegion {
  id: string;
  label: string;
  path: string;
  value?: number;
  color?: string;
}

export interface GeoMarker {
  lat: number;
  lon: number;
  label?: string;
  color?: string;
  radius?: number;
}

// -- Props --------------------------------------------------------------------

export interface GeoMapProps {
  /** SVG path data for each region */
  regions?: GeoRegion[];
  /** Point markers */
  markers?: GeoMarker[];
  /** SVG width in pixels (default: 800) */
  width?: number;
  /** SVG height in pixels (default: 500) */
  height?: number;
  /** Map projection type (default: 'equirectangular') */
  projection?: 'mercator' | 'equirectangular';
  /** Gradient colors for choropleth coloring (default: blue scale) */
  colorScale?: string[];
  /** Minimum value for color scale domain */
  minValue?: number;
  /** Maximum value for color scale domain */
  maxValue?: number;
  /** Show region labels (default: false) */
  showLabels?: boolean;
  /** SVG background color (default: '#f0f4f8') */
  backgroundColor?: string;
  /** Region border color (default: '#94a3b8') */
  borderColor?: string;
  /** Region border width (default: 1) */
  borderWidth?: number;
  /** Default fill color for regions without a value (default: '#cbd5e1') */
  defaultRegionColor?: string;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 20) */
  padding?: number;
}

// -- Projection helpers -------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;

/**
 * Project latitude/longitude to x/y using equirectangular projection.
 * Maps lon [-180, 180] to [0, width] and lat [90, -90] to [0, height].
 */
function projectEquirectangular(
  lat: number,
  lon: number,
  width: number,
  height: number,
  padding: number,
): { x: number; y: number } {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;
  const x = padding + ((lon + 180) / 360) * innerW;
  const y = padding + ((90 - lat) / 180) * innerH;
  return { x, y };
}

/**
 * Project latitude/longitude to x/y using Mercator projection.
 * Clamps latitude to [-85, 85] to avoid singularity at poles.
 */
function projectMercator(
  lat: number,
  lon: number,
  width: number,
  height: number,
  padding: number,
): { x: number; y: number } {
  const innerW = width - padding * 2;
  const innerH = height - padding * 2;

  const clampedLat = Math.max(-85, Math.min(85, lat));

  const x = padding + ((lon + 180) / 360) * innerW;

  const latRad = clampedLat * DEG_TO_RAD;
  const mercY = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  // Mercator Y range for [-85, 85] degrees
  const maxMercY = Math.log(Math.tan(Math.PI / 4 + (85 * DEG_TO_RAD) / 2));
  const normalizedY = (maxMercY - mercY) / (2 * maxMercY);
  const y = padding + normalizedY * innerH;

  return { x, y };
}

// -- Color interpolation ------------------------------------------------------

/**
 * Parse a hex color string to RGB components.
 */
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

/**
 * Convert RGB to hex string.
 */
function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const toHex = (v: number) => clamp(v).toString(16).padStart(2, '0');
  return '#' + toHex(r) + toHex(g) + toHex(b);
}

/**
 * Interpolate across a multi-stop color scale.
 * @param t - value in [0, 1]
 * @param scale - array of hex color strings
 */
function interpolateColor(t: number, scale: string[]): string {
  if (scale.length === 0) return '#cbd5e1';
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

// -- Bounding box helper for label placement ----------------------------------

/**
 * Estimate the centroid of an SVG path by parsing M/L/m/l commands.
 * This is a rough approximation — it averages all coordinate points found.
 */
function estimatePathCentroid(pathData: string): { cx: number; cy: number } {
  const coordRegex = /[ML]\s*([\d.eE+-]+)[,\s]+([\d.eE+-]+)/gi;
  let sumX = 0;
  let sumY = 0;
  let count = 0;

  let match = coordRegex.exec(pathData);
  while (match !== null) {
    const px = parseFloat(match[1]!);
    const py = parseFloat(match[2]!);
    if (!isNaN(px) && !isNaN(py)) {
      sumX += px;
      sumY += py;
      count++;
    }
    match = coordRegex.exec(pathData);
  }

  if (count === 0) return { cx: 0, cy: 0 };
  return { cx: sumX / count, cy: sumY / count };
}

// -- Demo data generator ------------------------------------------------------

/**
 * Generate simplified US map outline with ~10 state-like regions.
 * Coordinates are pre-computed SVG path data (not geographic coordinates).
 * Designed for a viewBox of roughly 800x500.
 */
export function generateUSMapOutline(): GeoRegion[] {
  return [
    {
      id: 'west',
      label: 'West',
      path: 'M 50 80 L 120 60 L 140 180 L 100 280 L 50 260 Z',
      value: 42,
    },
    {
      id: 'mountain',
      label: 'Mountain',
      path: 'M 120 60 L 220 50 L 240 170 L 200 270 L 100 280 L 140 180 Z',
      value: 28,
    },
    {
      id: 'plains',
      label: 'Plains',
      path: 'M 220 50 L 340 60 L 360 180 L 330 280 L 200 270 L 240 170 Z',
      value: 55,
    },
    {
      id: 'midwest',
      label: 'Midwest',
      path: 'M 340 60 L 460 50 L 490 140 L 470 230 L 330 280 L 360 180 Z',
      value: 71,
    },
    {
      id: 'south-central',
      label: 'South Central',
      path: 'M 240 280 L 330 280 L 380 380 L 260 400 L 220 350 Z',
      value: 35,
    },
    {
      id: 'southeast',
      label: 'Southeast',
      path: 'M 330 280 L 470 230 L 540 280 L 520 380 L 380 380 Z',
      value: 63,
    },
    {
      id: 'northeast',
      label: 'Northeast',
      path: 'M 460 50 L 560 40 L 600 100 L 580 180 L 540 200 L 490 140 Z',
      value: 88,
    },
    {
      id: 'mid-atlantic',
      label: 'Mid-Atlantic',
      path: 'M 490 140 L 540 200 L 580 180 L 600 240 L 540 280 L 470 230 Z',
      value: 76,
    },
    {
      id: 'sw-desert',
      label: 'SW Desert',
      path: 'M 100 280 L 200 270 L 240 280 L 220 350 L 160 380 L 80 340 Z',
      value: 19,
    },
    {
      id: 'pacific-nw',
      label: 'Pacific NW',
      path: 'M 30 30 L 120 20 L 120 60 L 50 80 L 30 60 Z',
      value: 47,
    },
  ];
}

// -- Component ----------------------------------------------------------------

export function GeoMap(props: GeoMapProps) {
  const {
    regions = [],
    markers = [],
    width = 800,
    height = 500,
    projection = 'equirectangular',
    colorScale = ['#dbeafe', '#3b82f6', '#1e3a8a'],
    minValue,
    maxValue,
    showLabels = false,
    backgroundColor = '#f0f4f8',
    borderColor = '#94a3b8',
    borderWidth = 1,
    defaultRegionColor = '#cbd5e1',
    title,
    padding = 20,
  } = props;

  // Compute min/max values from data if not explicitly provided
  const valueRange = useMemo(() => {
    let lo = minValue ?? Infinity;
    let hi = maxValue ?? -Infinity;

    for (let i = 0; i < regions.length; i++) {
      const v = regions[i]!.value;
      if (v !== undefined) {
        if (minValue === undefined && v < lo) lo = v;
        if (maxValue === undefined && v > hi) hi = v;
      }
    }

    if (!isFinite(lo)) lo = 0;
    if (!isFinite(hi)) hi = 100;
    if (lo === hi) hi = lo + 1;

    return { lo, hi };
  }, [regions, minValue, maxValue]);

  // Project function based on projection type
  const project = useCallback(
    (lat: number, lon: number) => {
      if (projection === 'mercator') {
        return projectMercator(lat, lon, width, height, padding);
      }
      return projectEquirectangular(lat, lon, width, height, padding);
    },
    [projection, width, height, padding],
  );

  // ---- Background -----------------------------------------------------------

  const buildBackground = useCallback(() => {
    return [
      createElement('rect', {
        key: 'bg',
        x: '0',
        y: '0',
        width: String(width),
        height: String(height),
        fill: backgroundColor,
        rx: '4',
        ry: '4',
      }),
    ];
  }, [width, height, backgroundColor]);

  // ---- Regions --------------------------------------------------------------

  const buildRegions = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < regions.length; i++) {
      const region = regions[i]!;

      let fill: string;
      if (region.color) {
        fill = region.color;
      } else if (region.value !== undefined) {
        const t = (region.value - valueRange.lo) / (valueRange.hi - valueRange.lo);
        fill = interpolateColor(t, colorScale);
      } else {
        fill = defaultRegionColor;
      }

      elements.push(
        createElement('path', {
          key: `region-${region.id}`,
          d: region.path,
          fill,
          stroke: borderColor,
          'stroke-width': String(borderWidth),
          'stroke-linejoin': 'round',
          role: 'img',
          'aria-label': region.label + (region.value !== undefined ? ': ' + String(region.value) : ''),
        }),
      );

      if (showLabels) {
        const centroid = estimatePathCentroid(region.path);
        elements.push(
          createElement(
            'text',
            {
              key: `label-${region.id}`,
              x: String(centroid.cx),
              y: String(centroid.cy),
              'text-anchor': 'middle',
              'dominant-baseline': 'central',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#1e293b',
              'pointer-events': 'none',
            },
            region.label,
          ),
        );
      }
    }

    return elements;
  }, [regions, valueRange, colorScale, defaultRegionColor, borderColor, borderWidth, showLabels]);

  // ---- Markers --------------------------------------------------------------

  const buildMarkers = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < markers.length; i++) {
      const marker = markers[i]!;
      const pos = project(marker.lat, marker.lon);
      const r = marker.radius ?? 5;
      const color = marker.color ?? '#ef4444';

      // Drop shadow
      elements.push(
        createElement('circle', {
          key: `marker-shadow-${i}`,
          cx: String(pos.x + 1),
          cy: String(pos.y + 1),
          r: String(r),
          fill: 'rgba(0,0,0,0.15)',
        }),
      );

      // Marker circle
      elements.push(
        createElement('circle', {
          key: `marker-${i}`,
          cx: String(pos.x),
          cy: String(pos.y),
          r: String(r),
          fill: color,
          stroke: '#fff',
          'stroke-width': '1.5',
          role: 'img',
          'aria-label': marker.label ?? `Marker at ${marker.lat}, ${marker.lon}`,
        }),
      );

      // Label
      if (marker.label) {
        elements.push(
          createElement(
            'text',
            {
              key: `marker-label-${i}`,
              x: String(pos.x),
              y: String(pos.y - r - 4),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#1e293b',
              'pointer-events': 'none',
            },
            marker.label,
          ),
        );
      }
    }

    return elements;
  }, [markers, project]);

  // ---- Legend (color scale) -------------------------------------------------

  const buildLegend = useCallback(() => {
    // Only show legend if we have regions with values
    let hasValues = false;
    for (let i = 0; i < regions.length; i++) {
      if (regions[i]!.value !== undefined) {
        hasValues = true;
        break;
      }
    }
    if (!hasValues) return [];

    const elements: ReturnType<typeof createElement>[] = [];
    const legendWidth = 150;
    const legendHeight = 12;
    const legendX = width - padding - legendWidth;
    const legendY = height - padding - legendHeight - 20;
    const numStops = 20;

    // Render color gradient as small rectangles
    const stepWidth = legendWidth / numStops;
    for (let i = 0; i < numStops; i++) {
      const t = i / (numStops - 1);
      const color = interpolateColor(t, colorScale);
      elements.push(
        createElement('rect', {
          key: `legend-stop-${i}`,
          x: String(legendX + i * stepWidth),
          y: String(legendY),
          width: String(stepWidth + 0.5), // slight overlap to prevent gaps
          height: String(legendHeight),
          fill: color,
        }),
      );
    }

    // Border
    elements.push(
      createElement('rect', {
        key: 'legend-border',
        x: String(legendX),
        y: String(legendY),
        width: String(legendWidth),
        height: String(legendHeight),
        fill: 'none',
        stroke: '#94a3b8',
        'stroke-width': '0.5',
      }),
    );

    // Min/max labels
    elements.push(
      createElement(
        'text',
        {
          key: 'legend-min',
          x: String(legendX),
          y: String(legendY + legendHeight + 14),
          'text-anchor': 'start',
          'font-size': '10',
          'font-family': 'sans-serif',
          fill: '#64748b',
        },
        String(valueRange.lo),
      ),
    );

    elements.push(
      createElement(
        'text',
        {
          key: 'legend-max',
          x: String(legendX + legendWidth),
          y: String(legendY + legendHeight + 14),
          'text-anchor': 'end',
          'font-size': '10',
          'font-family': 'sans-serif',
          fill: '#64748b',
        },
        String(valueRange.hi),
      ),
    );

    return elements;
  }, [regions, width, height, padding, colorScale, valueRange]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: String(padding + 6),
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

  const bg = buildBackground();
  const regionEls = buildRegions();
  const markerEls = buildMarkers();
  const legend = buildLegend();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(height),
      viewBox: `0 0 ${width} ${height}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Geographic map',
      style: { fontFamily: 'sans-serif' },
    },
    ...bg,
    ...titleEl,
    ...regionEls,
    ...markerEls,
    ...legend,
  );
}
