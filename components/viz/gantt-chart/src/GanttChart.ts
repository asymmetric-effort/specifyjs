// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * GanttChart — A SpecifyJS component that renders timeline bar charts as SVG.
 *
 * Supports:
 *  - Horizontal task bars positioned by start time and duration
 *  - Optional task grouping
 *  - Configurable bar height and gap
 *  - Time axis with grid lines
 *  - Labels on left side
 *  - Progress indicators
 *  - Configurable colors per task
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface GanttTask {
  id: string;
  label: string;
  start: number;
  duration: number;
  color?: string;
  group?: string;
}

// -- Props --------------------------------------------------------------------

export interface GanttChartProps {
  /** Array of tasks to render */
  tasks: GanttTask[];
  /** SVG width in pixels (default: 800) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Height of each task bar in px (default: 24) */
  barHeight?: number;
  /** Vertical gap between task bars in px (default: 8) */
  barGap?: number;
  /** Show vertical grid lines (default: true) */
  showGrid?: boolean;
  /** Show task labels on the left (default: true) */
  showLabels?: boolean;
  /** Show progress text on bars (default: false) */
  showProgress?: boolean;
  /** Label for the time unit displayed on axis (default: 'days') */
  timeUnit?: string;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 50) */
  padding?: number;
}

// -- Constants ----------------------------------------------------------------

const DEFAULT_PALETTE = [
  '#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

// -- Helpers ------------------------------------------------------------------

/** Compute a nice round step for grid lines, aiming for ~5-8 lines. */
function niceStep(range: number): number {
  if (range <= 0) return 1;
  const rough = range / 6;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const residual = rough / mag;
  if (residual <= 1.5) return mag;
  if (residual <= 3.5) return 2 * mag;
  if (residual <= 7.5) return 5 * mag;
  return 10 * mag;
}

/** Get color for a task, falling back to palette by index. */
function taskColor(index: number, explicit?: string): string {
  if (explicit) return explicit;
  return DEFAULT_PALETTE[index % DEFAULT_PALETTE.length]!;
}

// -- Component ----------------------------------------------------------------

export function GanttChart(props: GanttChartProps) {
  const {
    tasks = [],
    width = 800,
    height: propHeight,
    barHeight = 24,
    barGap = 8,
    showGrid = true,
    showLabels = true,
    showProgress = false,
    timeUnit = 'days',
    title,
    padding = 50,
  } = props;

  // Handle empty data
  if (tasks.length === 0) {
    return createElement(
      'svg',
      {
        width: String(width),
        height: String(propHeight ?? 100),
        viewBox: `0 0 ${width} ${propHeight ?? 100}`,
        xmlns: 'http://www.w3.org/2000/svg',
        role: 'img',
        'aria-label': title ?? 'Empty Gantt chart',
      },
      createElement(
        'text',
        {
          x: String(width / 2),
          y: String((propHeight ?? 100) / 2),
          'text-anchor': 'middle',
          'font-size': '14',
          'font-family': 'sans-serif',
          fill: '#9ca3af',
        },
        'No tasks to display',
      ),
    );
  }

  // Label area width
  const labelWidth = showLabels ? 120 : 0;

  // Compute time range
  const timeRange = useMemo(() => {
    let minStart = Infinity;
    let maxEnd = -Infinity;
    for (const task of tasks) {
      if (task.start < minStart) minStart = task.start;
      const end = task.start + task.duration;
      if (end > maxEnd) maxEnd = end;
    }
    if (minStart === Infinity) {
      minStart = 0;
      maxEnd = 1;
    }
    return { min: minStart, max: maxEnd, range: maxEnd - minStart };
  }, [tasks]);

  // Sort tasks by group then start time (stable order)
  const sortedTasks = useMemo(() => {
    const copy = tasks.slice();
    copy.sort((a, b) => {
      if (a.group !== b.group) {
        return (a.group ?? '').localeCompare(b.group ?? '');
      }
      return a.start - b.start;
    });
    return copy;
  }, [tasks]);

  // Auto height
  const computedHeight = propHeight ?? (padding * 2 + sortedTasks.length * (barHeight + barGap) + barGap + 20);
  const chartWidth = width - padding - labelWidth - padding;
  const chartTop = padding + (title ? 20 : 0);

  // Scale: time value to x pixel position
  const timeToX = useCallback(
    (t: number): number => {
      if (timeRange.range === 0) return labelWidth + padding;
      return labelWidth + padding + ((t - timeRange.min) / timeRange.range) * chartWidth;
    },
    [timeRange, chartWidth, labelWidth, padding],
  );

  // ---- Grid lines -----------------------------------------------------------

  const buildGrid = useCallback(() => {
    if (!showGrid) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const step = niceStep(timeRange.range);
    const startVal = Math.ceil(timeRange.min / step) * step;
    const chartBottom = chartTop + sortedTasks.length * (barHeight + barGap) + barGap;

    for (let v = startVal; v <= timeRange.max; v += step) {
      const x = timeToX(v);
      elements.push(
        createElement('line', {
          key: `grid-${v}`,
          x1: String(x),
          y1: String(chartTop),
          x2: String(x),
          y2: String(chartBottom),
          stroke: '#e5e7eb',
          'stroke-width': '1',
          'stroke-dasharray': '4 2',
        }),
      );
    }
    return elements;
  }, [showGrid, timeRange, chartTop, sortedTasks.length, barHeight, barGap, timeToX]);

  // ---- Time axis ------------------------------------------------------------

  const buildTimeAxis = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];
    const step = niceStep(timeRange.range);
    const startVal = Math.ceil(timeRange.min / step) * step;
    const axisY = chartTop - 8;

    for (let v = startVal; v <= timeRange.max; v += step) {
      const x = timeToX(v);
      elements.push(
        createElement(
          'text',
          {
            key: `taxis-${v}`,
            x: String(x),
            y: String(axisY),
            'text-anchor': 'middle',
            'font-size': '10',
            'font-family': 'sans-serif',
            fill: '#6b7280',
          },
          String(v),
        ),
      );
    }

    // Time unit label
    elements.push(
      createElement(
        'text',
        {
          key: 'time-unit',
          x: String(width - padding),
          y: String(axisY),
          'text-anchor': 'end',
          'font-size': '10',
          'font-family': 'sans-serif',
          fill: '#9ca3af',
          'font-style': 'italic',
        },
        timeUnit,
      ),
    );

    return elements;
  }, [timeRange, chartTop, timeToX, timeUnit, width, padding]);

  // ---- Task bars ------------------------------------------------------------

  const buildBars = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];
    let currentGroup = '';

    for (let i = 0; i < sortedTasks.length; i++) {
      const task = sortedTasks[i]!;
      const y = chartTop + i * (barHeight + barGap) + barGap;
      const x = timeToX(task.start);
      const barW = Math.max(2, timeToX(task.start + task.duration) - x);
      const fill = taskColor(i, task.color);

      // Group header
      if (task.group && task.group !== currentGroup) {
        currentGroup = task.group;
        if (showLabels) {
          elements.push(
            createElement(
              'text',
              {
                key: `group-${i}`,
                x: String(padding),
                y: String(y + barHeight / 2 - 12),
                'font-size': '9',
                'font-family': 'sans-serif',
                'font-weight': 'bold',
                fill: '#9ca3af',
                'text-transform': 'uppercase',
              },
              task.group,
            ),
          );
        }
      }

      // Task bar
      elements.push(
        createElement('rect', {
          key: `bar-${task.id}`,
          x: String(x),
          y: String(y),
          width: String(barW),
          height: String(barHeight),
          rx: '4',
          ry: '4',
          fill,
          role: 'graphics-symbol',
          'aria-label': `${task.label}: start ${task.start}, duration ${task.duration}`,
        }),
      );

      // Label on left
      if (showLabels) {
        elements.push(
          createElement(
            'text',
            {
              key: `label-${task.id}`,
              x: String(labelWidth + padding - 8),
              y: String(y + barHeight / 2 + 4),
              'text-anchor': 'end',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            task.label.length > 16 ? task.label.substring(0, 14) + '..' : task.label,
          ),
        );
      }

      // Progress text on bar
      if (showProgress && barW > 30) {
        elements.push(
          createElement(
            'text',
            {
              key: `prog-${task.id}`,
              x: String(x + barW / 2),
              y: String(y + barHeight / 2 + 4),
              'text-anchor': 'middle',
              'font-size': '10',
              'font-family': 'sans-serif',
              fill: '#ffffff',
            },
            `${task.start}-${task.start + task.duration}`,
          ),
        );
      }
    }

    return elements;
  }, [sortedTasks, chartTop, barHeight, barGap, timeToX, showLabels, showProgress, labelWidth, padding]);

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

  const gridLines = buildGrid();
  const timeAxis = buildTimeAxis();
  const bars = buildBars();
  const titleEl = buildTitle();

  return createElement(
    'svg',
    {
      width: String(width),
      height: String(computedHeight),
      viewBox: `0 0 ${width} ${computedHeight}`,
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': title ?? 'Gantt chart',
      style: { fontFamily: 'sans-serif' },
    },
    ...titleEl,
    ...gridLines,
    ...timeAxis,
    ...bars,
  );
}
