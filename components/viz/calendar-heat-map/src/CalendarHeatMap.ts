// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * CalendarHeatMap — A SpecifyJS component that renders GitHub-style
 * contribution calendars as SVG.
 *
 * Supports:
 *  - Days as colored squares arranged in weeks (columns) and days-of-week (rows)
 *  - Color intensity proportional to value
 *  - Month and day-of-week labels
 *  - Configurable cell size and gap
 *  - Auto-detection of date range from data
 *  - Proper ARIA attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import { useMemo, useCallback } from 'specifyjs/hooks';

// -- Data types ---------------------------------------------------------------

export interface CalendarDatum {
  /** Date string in 'YYYY-MM-DD' format */
  date: string;
  /** Numeric value for this date */
  value: number;
}

// -- Props --------------------------------------------------------------------

export interface CalendarHeatMapProps {
  /** Array of date/value pairs */
  data: CalendarDatum[];
  /** SVG width in pixels (default: 800) */
  width?: number;
  /** SVG height in pixels (default: 160) */
  height?: number;
  /** Color gradient from low to high */
  colorScale?: string[];
  /** Size of each day cell in px (default: 12) */
  cellSize?: number;
  /** Gap between cells in px (default: 2) */
  cellGap?: number;
  /** Show month labels above the calendar (default: true) */
  showMonthLabels?: boolean;
  /** Show day-of-week labels on the left (default: true) */
  showDayLabels?: boolean;
  /** Color for days with no data (default: '#ebedf0') */
  emptyColor?: string;
  /** Chart title */
  title?: string;
}

// -- Helpers ------------------------------------------------------------------

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Parse a 'YYYY-MM-DD' string to a Date in local time. */
function parseDate(dateStr: string): Date {
  const parts = dateStr.split('-');
  if (parts.length !== 3) return new Date(NaN);
  return new Date(
    parseInt(parts[0]!, 10),
    parseInt(parts[1]!, 10) - 1,
    parseInt(parts[2]!, 10),
  );
}

/** Format a Date to 'YYYY-MM-DD'. */
function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Parse hex to RGB. */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const cleaned = hex.replace('#', '');
  const full = cleaned.length === 3
    ? cleaned[0]! + cleaned[0]! + cleaned[1]! + cleaned[1]! + cleaned[2]! + cleaned[2]!
    : cleaned;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const h = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return h.length === 1 ? '0' + h : h;
  };
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function interpolateColor(t: number, scale: string[]): string {
  if (scale.length === 0) return '#000000';
  if (scale.length === 1) return scale[0]!;
  const clamped = Math.max(0, Math.min(1, t));
  const segCount = scale.length - 1;
  const seg = Math.min(Math.floor(clamped * segCount), segCount - 1);
  const segT = clamped * segCount - seg;
  const c1 = hexToRgb(scale[seg]!);
  const c2 = hexToRgb(scale[seg + 1]!);
  return rgbToHex(
    c1.r + (c2.r - c1.r) * segT,
    c1.g + (c2.g - c1.g) * segT,
    c1.b + (c2.b - c1.b) * segT,
  );
}

const DEFAULT_COLOR_SCALE = ['#9be9a8', '#40c463', '#30a14e', '#216e39'];

// -- Component ----------------------------------------------------------------

export function CalendarHeatMap(props: CalendarHeatMapProps) {
  const {
    data = [],
    width = 800,
    height = 160,
    colorScale = DEFAULT_COLOR_SCALE,
    cellSize = 12,
    cellGap = 2,
    showMonthLabels = true,
    showDayLabels = true,
    emptyColor = '#ebedf0',
    title,
  } = props;

  // Build a lookup map from date string to value
  const { dateMap, startDate, endDate, maxVal } = useMemo(() => {
    const map = new Map<string, number>();
    let mx = 0;
    let earliest: Date | null = null;
    let latest: Date | null = null;

    for (const d of data) {
      const parsed = parseDate(d.date);
      if (isNaN(parsed.getTime())) continue;
      const key = formatDate(parsed);
      map.set(key, (map.get(key) ?? 0) + d.value);
      const v = map.get(key)!;
      if (v > mx) mx = v;
      if (earliest === null || parsed < earliest) earliest = parsed;
      if (latest === null || parsed > latest) latest = parsed;
    }

    // Default to current year if no data
    if (earliest === null || latest === null) {
      const now = new Date();
      earliest = new Date(now.getFullYear(), 0, 1);
      latest = new Date(now.getFullYear(), 11, 31);
    }

    // Extend to full weeks (start on Sunday)
    const start = new Date(earliest);
    start.setDate(start.getDate() - start.getDay());
    const end = new Date(latest);
    end.setDate(end.getDate() + (6 - end.getDay()));

    return { dateMap: map, startDate: start, endDate: end, maxVal: mx > 0 ? mx : 1 };
  }, [data]);

  // ---- Layout ---------------------------------------------------------------

  const dayLabelWidth = showDayLabels ? 30 : 0;
  const monthLabelHeight = showMonthLabels ? 16 : 0;
  const titleHeight = title ? 28 : 0;
  const offsetX = dayLabelWidth + 10;
  const offsetY = titleHeight + monthLabelHeight + 4;

  // ---- Build cells ----------------------------------------------------------

  const buildCells = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    const current = new Date(startDate);
    let weekCol = 0;

    while (current <= endDate) {
      const dayOfWeek = current.getDay();

      // Start a new column on Sunday
      if (dayOfWeek === 0 && current > startDate) {
        weekCol++;
      }

      const key = formatDate(current);
      const value = dateMap.get(key);
      const fill = value !== undefined && value > 0
        ? interpolateColor(value / maxVal, colorScale)
        : emptyColor;

      const x = offsetX + weekCol * (cellSize + cellGap);
      const y = offsetY + dayOfWeek * (cellSize + cellGap);

      elements.push(
        createElement('rect', {
          key: `day-${key}`,
          x: String(x),
          y: String(y),
          width: String(cellSize),
          height: String(cellSize),
          rx: '2',
          ry: '2',
          fill,
          'aria-label': `${key}: ${value ?? 0}`,
        }),
      );

      current.setDate(current.getDate() + 1);
    }

    return elements;
  }, [startDate, endDate, dateMap, maxVal, colorScale, emptyColor,
      cellSize, cellGap, offsetX, offsetY]);

  // ---- Month labels ---------------------------------------------------------

  const buildMonthLabels = useCallback(() => {
    if (!showMonthLabels) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    const current = new Date(startDate);
    let weekCol = 0;
    let lastMonth = -1;

    while (current <= endDate) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek === 0 && current > startDate) weekCol++;

      const month = current.getMonth();
      if (month !== lastMonth && dayOfWeek === 0) {
        lastMonth = month;
        const x = offsetX + weekCol * (cellSize + cellGap);
        elements.push(
          createElement(
            'text',
            {
              key: `month-${weekCol}`,
              x: String(x),
              y: String(titleHeight + monthLabelHeight - 2),
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: 'currentColor',
              opacity: '0.6',
            },
            MONTH_NAMES[month]!,
          ),
        );
      }

      current.setDate(current.getDate() + 1);
    }

    return elements;
  }, [showMonthLabels, startDate, endDate, cellSize, cellGap, offsetX,
      titleHeight, monthLabelHeight]);

  // ---- Day labels -----------------------------------------------------------

  const buildDayLabels = useCallback(() => {
    if (!showDayLabels) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    // Show Mon, Wed, Fri
    const displayDays = [1, 3, 5];
    for (const d of displayDays) {
      const y = offsetY + d * (cellSize + cellGap) + cellSize / 2;
      elements.push(
        createElement(
          'text',
          {
            key: `day-label-${d}`,
            x: String(dayLabelWidth),
            y: String(y),
            'text-anchor': 'end',
            'dominant-baseline': 'central',
            'font-size': '10',
            'font-family': 'sans-serif',
            fill: 'currentColor',
            opacity: '0.6',
          },
          DAY_LABELS[d]!,
        ),
      );
    }

    return elements;
  }, [showDayLabels, cellSize, cellGap, offsetY, dayLabelWidth]);

  // ---- Title ----------------------------------------------------------------

  const buildTitle = useCallback(() => {
    if (!title) return [];
    return [
      createElement(
        'text',
        {
          key: 'title',
          x: String(width / 2),
          y: '18',
          'text-anchor': 'middle',
          'font-size': '14',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: 'currentColor',
        },
        title,
      ),
    ];
  }, [title, width]);

  // ---- Empty state ----------------------------------------------------------

  if (data.length === 0) {
    return createElement(
      'svg',
      {
        width: '100%',
        viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Calendar heat map — no data',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String(height / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: 'currentColor',
          opacity: '0.6',
        },
        'No data to display.',
      ),
    );
  }

  // ---- Assemble SVG ---------------------------------------------------------

  const titleEls = buildTitle();
  const monthEls = buildMonthLabels();
  const dayLabelEls = buildDayLabels();
  const cellEls = buildCells();

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Calendar heat map',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEls,
    ...monthEls,
    ...dayLabelEls,
    ...cellEls,
  );
}
