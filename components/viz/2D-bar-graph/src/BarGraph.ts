// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BarGraph — A SpecifyJS component that renders 2D bar charts as SVG.
 *
 * Supports:
 *  - Vertical and horizontal orientation
 *  - Rounded bar corners
 *  - Value labels on bars
 *  - Grid lines
 *  - Stacked bars (multiple segments per category)
 *  - Grouped bars (side-by-side per category)
 *  - Optional animation
 *  - Configurable colors, gaps, padding
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Data types ---------------------------------------------------------------

export interface BarDatum {
  label: string;
  value: number;
  color?: string;
}

export interface StackedBarDatum {
  label: string;
  values: { category: string; value: number; color?: string }[];
}

// -- Props --------------------------------------------------------------------

export interface BarGraphProps {
  /** Simple bar data */
  data: BarDatum[];
  /** SVG width in pixels (default: 600) */
  width?: number;
  /** SVG height in pixels (default: 400) */
  height?: number;
  /** Bar orientation (default: 'vertical') */
  orientation?: 'vertical' | 'horizontal';
  /** Default bar fill color (default: '#3b82f6') */
  barColor?: string;
  /** Gap between bars in px (default: 8) */
  barGap?: number;
  /** Border radius on bar tops (default: 4) */
  barRadius?: number;
  /** Show value labels on bars (default: true) */
  showValues?: boolean;
  /** Show grid lines perpendicular to bars (default: true) */
  showGrid?: boolean;
  /** Grid line color (default: '#e5e7eb') */
  gridColor?: string;
  /** Chart title */
  title?: string;
  /** Padding around chart area in px (default: 50) */
  padding?: number;
  /** Enable animation (default: false) */
  animate?: boolean;
  /** Stacked bar data — overrides `data` when provided */
  stacked?: StackedBarDatum[];
  /** Grouped mode — side-by-side bars when using stacked data (default: false) */
  grouped?: boolean;
}

// -- Scale types --------------------------------------------------------------

export interface BarGraphScales {
  /** Maps a value to a pixel length along the value axis */
  valueScale: (v: number) => number;
  /** Maps a category index to a pixel position along the category axis */
  categoryScale: (i: number) => number;
  /** Width/thickness of a single bar in px */
  barThickness: number;
  /** Maximum data value (used for scale domain) */
  maxValue: number;
  /** Length of the value axis in px */
  valueAxisLength: number;
  /** Length of the category axis in px */
  categoryAxisLength: number;
}

// -- Hook: useBarGraphScales --------------------------------------------------

export function useBarGraphScales(
  count: number,
  maxValue: number,
  axisLength: number,
  categoryAxisLength: number,
  barGap: number,
): BarGraphScales {
  return useMemo(() => {
    const barThickness = Math.max(1, (categoryAxisLength - barGap * (count + 1)) / count);

    const valueScale = (v: number): number => {
      if (maxValue === 0) return 0;
      return (v / maxValue) * axisLength;
    };

    const categoryScale = (i: number): number => {
      return barGap + i * (barThickness + barGap);
    };

    return {
      valueScale,
      categoryScale,
      barThickness,
      maxValue,
      valueAxisLength: axisLength,
      categoryAxisLength,
    };
  }, [count, maxValue, axisLength, categoryAxisLength, barGap]);
}

// -- Helpers ------------------------------------------------------------------

/** Compute the maximum value across simple or stacked data. */
function computeMaxValue(
  data: BarDatum[],
  stacked?: StackedBarDatum[],
  grouped?: boolean,
): number {
  if (stacked && stacked.length > 0) {
    if (grouped) {
      // Grouped: max of any individual segment value
      let m = 0;
      for (const item of stacked) {
        for (const v of item.values) {
          if (v.value > m) m = v.value;
        }
      }
      return m;
    }
    // Stacked: max of sum per category
    let m = 0;
    for (const item of stacked) {
      let sum = 0;
      for (const v of item.values) {
        sum += v.value;
      }
      if (sum > m) m = sum;
    }
    return m;
  }

  let m = 0;
  for (const d of data) {
    if (d.value > m) m = d.value;
  }
  return m;
}

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

/** Collect all unique categories from stacked data. */
function collectCategories(stacked: StackedBarDatum[]): string[] {
  const set = new Set<string>();
  for (const item of stacked) {
    for (const v of item.values) {
      set.add(v.category);
    }
  }
  return Array.from(set);
}

/** Default category color palette for stacked/grouped segments. */
const CATEGORY_PALETTE = [
  '#3b82f6', '#ef4444', '#22c55e', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
];

function categoryColor(index: number, explicit?: string): string {
  if (explicit) return explicit;
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length]!;
}

// -- Component ----------------------------------------------------------------

export function BarGraph(props: BarGraphProps) {
  const {
    data = [],
    width = 600,
    height = 400,
    orientation = 'vertical',
    barColor = '#3b82f6',
    barGap = 8,
    barRadius = 4,
    showValues = true,
    showGrid = true,
    gridColor = '#e5e7eb',
    title,
    padding = 50,
    animate = false,
    stacked,
    grouped = false,
  } = props;

  const isVertical = orientation === 'vertical';

  // Chart area dimensions (inside padding)
  const chartWidth = width - padding * 2;
  const chartHeight = height - padding * 2;

  const valueAxisLength = isVertical ? chartHeight : chartWidth;
  const categoryAxisLength = isVertical ? chartWidth : chartHeight;

  // Determine items to render
  const useStacked = stacked !== undefined && stacked.length > 0;
  const categories = useMemo(
    () => (useStacked ? collectCategories(stacked!) : []),
    [useStacked, stacked],
  );
  const itemCount = useStacked ? stacked!.length : data.length;
  const maxValue = useMemo(
    () => computeMaxValue(data, stacked, grouped),
    [data, stacked, grouped],
  );

  // Ensure we have a ceiling that is at least slightly above 0
  const effectiveMax = maxValue > 0 ? maxValue : 1;

  const scales = useBarGraphScales(
    itemCount,
    effectiveMax,
    valueAxisLength,
    categoryAxisLength,
    barGap,
  );

  // ---- Grid lines -----------------------------------------------------------

  const buildGridLines = useCallback(() => {
    if (!showGrid) return [];

    const step = niceStep(effectiveMax);
    const lines: ReturnType<typeof createElement>[] = [];

    for (let v = step; v <= effectiveMax; v += step) {
      const pos = scales.valueScale(v);

      if (isVertical) {
        const y = padding + chartHeight - pos;
        lines.push(
          createElement('line', {
            key: `grid-${v}`,
            x1: String(padding),
            y1: String(y),
            x2: String(padding + chartWidth),
            y2: String(y),
            stroke: gridColor,
            'stroke-width': '1',
            'stroke-dasharray': '4 2',
          }),
        );
        // grid label
        lines.push(
          createElement(
            'text',
            {
              key: `grid-label-${v}`,
              x: String(padding - 6),
              y: String(y + 4),
              'text-anchor': 'end',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#6b7280',
            },
            String(v),
          ),
        );
      } else {
        const x = padding + pos;
        lines.push(
          createElement('line', {
            key: `grid-${v}`,
            x1: String(x),
            y1: String(padding),
            x2: String(x),
            y2: String(padding + chartHeight),
            stroke: gridColor,
            'stroke-width': '1',
            'stroke-dasharray': '4 2',
          }),
        );
        lines.push(
          createElement(
            'text',
            {
              key: `grid-label-${v}`,
              x: String(x),
              y: String(padding + chartHeight + 16),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#6b7280',
            },
            String(v),
          ),
        );
      }
    }

    return lines;
  }, [showGrid, effectiveMax, scales, isVertical, padding, chartWidth, chartHeight, gridColor]);

  // ---- Axes -----------------------------------------------------------------

  const buildAxes = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    // Value axis line
    if (isVertical) {
      elements.push(
        createElement('line', {
          key: 'axis-y',
          x1: String(padding),
          y1: String(padding),
          x2: String(padding),
          y2: String(padding + chartHeight),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
      // Category axis line
      elements.push(
        createElement('line', {
          key: 'axis-x',
          x1: String(padding),
          y1: String(padding + chartHeight),
          x2: String(padding + chartWidth),
          y2: String(padding + chartHeight),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
    } else {
      elements.push(
        createElement('line', {
          key: 'axis-x',
          x1: String(padding),
          y1: String(padding + chartHeight),
          x2: String(padding + chartWidth),
          y2: String(padding + chartHeight),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
      elements.push(
        createElement('line', {
          key: 'axis-y',
          x1: String(padding),
          y1: String(padding),
          x2: String(padding),
          y2: String(padding + chartHeight),
          stroke: '#374151',
          'stroke-width': '1.5',
        }),
      );
    }

    return elements;
  }, [isVertical, padding, chartWidth, chartHeight]);

  // ---- Simple bars ----------------------------------------------------------

  const buildSimpleBars = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < data.length; i++) {
      const d = data[i]!;
      const barLen = scales.valueScale(d.value);
      const catPos = scales.categoryScale(i);
      const fill = d.color ?? barColor;

      let rectProps: Record<string, string>;
      let labelProps: Record<string, string>;
      let labelText = String(d.value);

      if (isVertical) {
        const x = padding + catPos;
        const y = padding + chartHeight - barLen;
        rectProps = {
          x: String(x),
          y: String(y),
          width: String(scales.barThickness),
          height: String(barLen),
          rx: String(barRadius),
          ry: String(barRadius),
          fill,
        };
        labelProps = {
          x: String(x + scales.barThickness / 2),
          y: String(y - 6),
          'text-anchor': 'middle',
          'font-size': '11',
          'font-family': 'sans-serif',
          fill: '#374151',
        };
      } else {
        const y = padding + catPos;
        const x = padding;
        rectProps = {
          x: String(x),
          y: String(y),
          width: String(barLen),
          height: String(scales.barThickness),
          rx: String(barRadius),
          ry: String(barRadius),
          fill,
        };
        labelProps = {
          x: String(x + barLen + 6),
          y: String(y + scales.barThickness / 2 + 4),
          'text-anchor': 'start',
          'font-size': '11',
          'font-family': 'sans-serif',
          fill: '#374151',
        };
      }

      if (animate) {
        rectProps.style = isVertical
          ? `animation: barGrow 0.6s ease-out ${i * 0.05}s both`
          : `animation: barGrow 0.6s ease-out ${i * 0.05}s both`;
      }

      elements.push(
        createElement('rect', { key: `bar-${i}`, ...rectProps }),
      );

      if (showValues) {
        elements.push(
          createElement('text', { key: `val-${i}`, ...labelProps }, labelText),
        );
      }

      // Category label
      if (isVertical) {
        elements.push(
          createElement(
            'text',
            {
              key: `cat-${i}`,
              x: String(padding + catPos + scales.barThickness / 2),
              y: String(padding + chartHeight + 16),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            d.label,
          ),
        );
      } else {
        elements.push(
          createElement(
            'text',
            {
              key: `cat-${i}`,
              x: String(padding - 6),
              y: String(padding + catPos + scales.barThickness / 2 + 4),
              'text-anchor': 'end',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            d.label,
          ),
        );
      }
    }

    return elements;
  }, [data, scales, barColor, barRadius, showValues, animate, isVertical, padding, chartHeight]);

  // ---- Stacked bars ---------------------------------------------------------

  const buildStackedBars = useCallback(() => {
    if (!stacked) return [];

    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < stacked.length; i++) {
      const item = stacked[i]!;
      const catPos = scales.categoryScale(i);
      let cumulative = 0;

      for (let j = 0; j < item.values.length; j++) {
        const seg = item.values[j]!;
        const segLen = scales.valueScale(seg.value);
        const offset = scales.valueScale(cumulative);
        const fill = categoryColor(j, seg.color);

        if (isVertical) {
          const x = padding + catPos;
          const y = padding + chartHeight - offset - segLen;
          elements.push(
            createElement('rect', {
              key: `sbar-${i}-${j}`,
              x: String(x),
              y: String(y),
              width: String(scales.barThickness),
              height: String(segLen),
              rx: j === item.values.length - 1 ? String(barRadius) : '0',
              ry: j === item.values.length - 1 ? String(barRadius) : '0',
              fill,
              ...(animate
                ? { style: `animation: barGrow 0.6s ease-out ${(i * item.values.length + j) * 0.03}s both` }
                : {}),
            }),
          );

          if (showValues && segLen > 14) {
            elements.push(
              createElement(
                'text',
                {
                  key: `sval-${i}-${j}`,
                  x: String(x + scales.barThickness / 2),
                  y: String(y + segLen / 2 + 4),
                  'text-anchor': 'middle',
                  'font-size': '10',
                  'font-family': 'sans-serif',
                  fill: '#fff',
                },
                String(seg.value),
              ),
            );
          }
        } else {
          const x = padding + offset;
          const y = padding + catPos;
          elements.push(
            createElement('rect', {
              key: `sbar-${i}-${j}`,
              x: String(x),
              y: String(y),
              width: String(segLen),
              height: String(scales.barThickness),
              rx: j === item.values.length - 1 ? String(barRadius) : '0',
              ry: j === item.values.length - 1 ? String(barRadius) : '0',
              fill,
              ...(animate
                ? { style: `animation: barGrow 0.6s ease-out ${(i * item.values.length + j) * 0.03}s both` }
                : {}),
            }),
          );

          if (showValues && segLen > 20) {
            elements.push(
              createElement(
                'text',
                {
                  key: `sval-${i}-${j}`,
                  x: String(x + segLen / 2),
                  y: String(y + scales.barThickness / 2 + 4),
                  'text-anchor': 'middle',
                  'font-size': '10',
                  'font-family': 'sans-serif',
                  fill: '#fff',
                },
                String(seg.value),
              ),
            );
          }
        }

        cumulative += seg.value;
      }

      // Total value label above/beside the full stacked bar
      if (showValues) {
        const totalLen = scales.valueScale(cumulative);
        if (isVertical) {
          elements.push(
            createElement(
              'text',
              {
                key: `stotal-${i}`,
                x: String(padding + catPos + scales.barThickness / 2),
                y: String(padding + chartHeight - totalLen - 6),
                'text-anchor': 'middle',
                'font-size': '11',
                'font-family': 'sans-serif',
                fill: '#374151',
              },
              String(cumulative),
            ),
          );
        } else {
          elements.push(
            createElement(
              'text',
              {
                key: `stotal-${i}`,
                x: String(padding + totalLen + 6),
                y: String(padding + catPos + scales.barThickness / 2 + 4),
                'text-anchor': 'start',
                'font-size': '11',
                'font-family': 'sans-serif',
                fill: '#374151',
              },
              String(cumulative),
            ),
          );
        }
      }

      // Category label
      if (isVertical) {
        elements.push(
          createElement(
            'text',
            {
              key: `scat-${i}`,
              x: String(padding + catPos + scales.barThickness / 2),
              y: String(padding + chartHeight + 16),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            item.label,
          ),
        );
      } else {
        elements.push(
          createElement(
            'text',
            {
              key: `scat-${i}`,
              x: String(padding - 6),
              y: String(padding + catPos + scales.barThickness / 2 + 4),
              'text-anchor': 'end',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            item.label,
          ),
        );
      }
    }

    return elements;
  }, [stacked, scales, barRadius, showValues, animate, isVertical, padding, chartHeight]);

  // ---- Grouped bars ---------------------------------------------------------

  const buildGroupedBars = useCallback(() => {
    if (!stacked) return [];

    const numCategories = categories.length;
    const elements: ReturnType<typeof createElement>[] = [];

    for (let i = 0; i < stacked.length; i++) {
      const item = stacked[i]!;
      const catPos = scales.categoryScale(i);
      const subBarGap = 2;
      const subBarThickness = Math.max(
        1,
        (scales.barThickness - subBarGap * (numCategories - 1)) / numCategories,
      );

      for (let j = 0; j < item.values.length; j++) {
        const seg = item.values[j]!;
        const catIndex = categories.indexOf(seg.category);
        const subOffset = catIndex * (subBarThickness + subBarGap);
        const barLen = scales.valueScale(seg.value);
        const fill = categoryColor(catIndex >= 0 ? catIndex : j, seg.color);

        if (isVertical) {
          const x = padding + catPos + subOffset;
          const y = padding + chartHeight - barLen;
          elements.push(
            createElement('rect', {
              key: `gbar-${i}-${j}`,
              x: String(x),
              y: String(y),
              width: String(subBarThickness),
              height: String(barLen),
              rx: String(barRadius),
              ry: String(barRadius),
              fill,
              ...(animate
                ? { style: `animation: barGrow 0.6s ease-out ${(i * numCategories + j) * 0.04}s both` }
                : {}),
            }),
          );

          if (showValues) {
            elements.push(
              createElement(
                'text',
                {
                  key: `gval-${i}-${j}`,
                  x: String(x + subBarThickness / 2),
                  y: String(y - 4),
                  'text-anchor': 'middle',
                  'font-size': '9',
                  'font-family': 'sans-serif',
                  fill: '#374151',
                },
                String(seg.value),
              ),
            );
          }
        } else {
          const x = padding;
          const y = padding + catPos + subOffset;
          elements.push(
            createElement('rect', {
              key: `gbar-${i}-${j}`,
              x: String(x),
              y: String(y),
              width: String(barLen),
              height: String(subBarThickness),
              rx: String(barRadius),
              ry: String(barRadius),
              fill,
              ...(animate
                ? { style: `animation: barGrow 0.6s ease-out ${(i * numCategories + j) * 0.04}s both` }
                : {}),
            }),
          );

          if (showValues) {
            elements.push(
              createElement(
                'text',
                {
                  key: `gval-${i}-${j}`,
                  x: String(x + barLen + 4),
                  y: String(y + subBarThickness / 2 + 3),
                  'text-anchor': 'start',
                  'font-size': '9',
                  'font-family': 'sans-serif',
                  fill: '#374151',
                },
                String(seg.value),
              ),
            );
          }
        }
      }

      // Category label
      if (isVertical) {
        elements.push(
          createElement(
            'text',
            {
              key: `gcat-${i}`,
              x: String(padding + catPos + scales.barThickness / 2),
              y: String(padding + chartHeight + 16),
              'text-anchor': 'middle',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            item.label,
          ),
        );
      } else {
        elements.push(
          createElement(
            'text',
            {
              key: `gcat-${i}`,
              x: String(padding - 6),
              y: String(padding + catPos + scales.barThickness / 2 + 4),
              'text-anchor': 'end',
              'font-size': '11',
              'font-family': 'sans-serif',
              fill: '#374151',
            },
            item.label,
          ),
        );
      }
    }

    return elements;
  }, [stacked, categories, scales, barRadius, showValues, animate, isVertical, padding, chartHeight]);

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

  // ---- Animation defs -------------------------------------------------------

  const buildAnimationDefs = useCallback(() => {
    if (!animate) return [];
    return [
      createElement(
        'defs',
        { key: 'anim-defs' },
        createElement(
          'style',
          { key: 'anim-style' },
          isVertical
            ? '@keyframes barGrow { from { transform: scaleY(0); transform-origin: bottom; } to { transform: scaleY(1); transform-origin: bottom; } }'
            : '@keyframes barGrow { from { transform: scaleX(0); transform-origin: left; } to { transform: scaleX(1); transform-origin: left; } }',
        ),
      ),
    ];
  }, [animate, isVertical]);

  // ---- Assemble SVG ---------------------------------------------------------

  const gridLines = buildGridLines();
  const axes = buildAxes();
  const titleEl = buildTitle();
  const animDefs = buildAnimationDefs();

  let bars: ReturnType<typeof createElement>[];
  if (useStacked && grouped) {
    bars = buildGroupedBars();
  } else if (useStacked) {
    bars = buildStackedBars();
  } else {
    bars = buildSimpleBars();
  }

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      style: { fontFamily: 'sans-serif' },
    },
    ...animDefs,
    ...titleEl,
    ...gridLines,
    ...axes,
    ...bars,
  );
}
