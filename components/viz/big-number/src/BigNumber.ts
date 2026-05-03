// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BigNumber — A SpecifyJS component that renders KPI / metric cards as SVG.
 *
 * Supports:
 *  - Large formatted number display with prefix/suffix
 *  - Trend indicator (up/down arrow with color)
 *  - Optional sparkline (mini line chart)
 *  - Descriptive label and trend label
 *  - Configurable colors and sizing
 *  - ARIA accessibility attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from '../../../../core/src/index';
import {
  useMemo,
  useCallback,
} from '../../../../core/src/hooks/index';

// -- Props --------------------------------------------------------------------

export interface BigNumberProps {
  /** The main value to display */
  value: number | string;
  /** Descriptive label beneath the value */
  label?: string;
  /** Prefix before the value (e.g. '$') */
  prefix?: string;
  /** Suffix after the value (e.g. '%') */
  suffix?: string;
  /** Trend value — positive = up, negative = down */
  trend?: number;
  /** Trend context label (e.g. 'vs last week') */
  trendLabel?: string;
  /** Small line chart data points */
  sparkline?: number[];
  /** SVG width in pixels (default: 280) */
  width?: number;
  /** SVG height in pixels (default: 160) */
  height?: number;
  /** Main value text color (default: 'currentColor') */
  valueColor?: string;
  /** Trend arrow color when positive (default: '#22c55e') */
  trendUpColor?: string;
  /** Trend arrow color when negative (default: '#ef4444') */
  trendDownColor?: string;
  /** Card background color (default: '#ffffff') */
  backgroundColor?: string;
}

// -- Helpers ------------------------------------------------------------------

/** Format a numeric value for display (add thousand separators). */
function formatValue(value: number | string): string {
  if (typeof value === 'string') return value;
  if (!isFinite(value) || isNaN(value)) return '--';
  // Format with locale-style thousand separators
  const parts = value.toString().split('.');
  const intPart = parts[0]!;
  const decPart = parts.length > 1 ? '.' + parts[1] : '';
  const isNeg = intPart.startsWith('-');
  const digits = isNeg ? intPart.slice(1) : intPart;
  let formatted = '';
  for (let i = 0; i < digits.length; i++) {
    if (i > 0 && (digits.length - i) % 3 === 0) {
      formatted += ',';
    }
    formatted += digits[i];
  }
  return (isNeg ? '-' : '') + formatted + decPart;
}

/** Format a trend value for display. */
function formatTrend(trend: number): string {
  if (!isFinite(trend) || isNaN(trend)) return '--';
  const abs = Math.abs(trend);
  // Show as percentage-like if fractional, otherwise integer
  if (abs < 100 && abs !== Math.floor(abs)) {
    return abs.toFixed(1);
  }
  return String(Math.round(abs));
}

// -- Component ----------------------------------------------------------------

export function BigNumber(props: BigNumberProps) {
  const {
    value,
    label,
    prefix = '',
    suffix = '',
    trend,
    trendLabel,
    sparkline,
    width = 280,
    height = 160,
    valueColor = 'currentColor',
    trendUpColor = '#22c55e',
    trendDownColor = '#ef4444',
    backgroundColor = '#ffffff',
  } = props;

  const displayValue = useMemo(() => formatValue(value), [value]);

  const hasTrend = trend !== undefined && trend !== null && isFinite(trend as number) && !isNaN(trend as number);
  const hasSparkline = sparkline !== undefined && sparkline !== null && sparkline.length > 1;
  const hasLabel = label !== undefined && label !== null && label.length > 0;

  const trendColor = hasTrend && (trend as number) >= 0 ? trendUpColor : trendDownColor;

  // Layout calculations
  const cardPadding = 20;
  const valueY = hasLabel ? height * 0.38 : height * 0.45;
  const valueFontSize = Math.min(width * 0.15, 48);
  const prefixSuffixSize = valueFontSize * 0.55;
  const labelY = valueY + valueFontSize * 0.4 + 8;
  const trendY = hasLabel ? labelY + 22 : valueY + valueFontSize * 0.4 + 22;

  // Sparkline geometry
  const sparklineHeight = hasSparkline ? Math.min(height * 0.22, 36) : 0;
  const sparklineY = height - cardPadding - sparklineHeight;
  const sparklineWidth = width - cardPadding * 2;

  // ---- Background -----------------------------------------------------------

  const buildBackground = useCallback(() => {
    return [
      createElement('rect', {
        key: 'bg',
        x: '0',
        y: '0',
        width: '100%',
        rx: '8',
        ry: '8',
        fill: backgroundColor,
        stroke: '#e5e7eb',
        'stroke-width': '1',
      }),
    ];
  }, [width, height, backgroundColor]);

  // ---- Value display --------------------------------------------------------

  const buildValue = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];
    const fullText = prefix + displayValue + suffix;

    // Main value
    elements.push(
      createElement(
        'text',
        {
          key: 'value',
          x: String(width / 2),
          y: String(valueY),
          'text-anchor': 'middle',
          'dominant-baseline': 'central',
          'font-size': String(valueFontSize),
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: valueColor,
          'aria-label': `Value: ${fullText}`,
        },
        // Render prefix, value, and suffix as tspans for sizing
        prefix
          ? createElement('tspan', {
              key: 'prefix',
              'font-size': String(prefixSuffixSize),
              'font-weight': 'normal',
            }, prefix)
          : null,
        displayValue,
        suffix
          ? createElement('tspan', {
              key: 'suffix',
              'font-size': String(prefixSuffixSize),
              'font-weight': 'normal',
            }, suffix)
          : null,
      ),
    );

    return elements;
  }, [width, valueY, valueFontSize, prefixSuffixSize, displayValue, prefix, suffix, valueColor]);

  // ---- Label ----------------------------------------------------------------

  const buildLabel = useCallback(() => {
    if (!hasLabel) return [];
    return [
      createElement(
        'text',
        {
          key: 'label',
          x: String(width / 2),
          y: String(labelY),
          'text-anchor': 'middle',
          'font-size': '13',
          'font-family': 'sans-serif',
          fill: 'currentColor',
          opacity: '0.6',
        },
        label!,
      ),
    ];
  }, [hasLabel, width, labelY, label]);

  // ---- Trend indicator ------------------------------------------------------

  const buildTrend = useCallback(() => {
    if (!hasTrend) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    const trendVal = trend as number;
    const isUp = trendVal >= 0;
    const arrowSize = 8;
    const trendText = formatTrend(trendVal);
    const fullTrendText = (isUp ? '+' : '-') + trendText + (trendLabel ? ' ' + trendLabel : '');

    // Arrow polygon
    const arrowX = width / 2 - 40;
    const arrowY2 = trendY;
    if (isUp) {
      // Up arrow
      const points = `${arrowX},${arrowY2} ${arrowX - arrowSize / 2},${arrowY2 + arrowSize} ${arrowX + arrowSize / 2},${arrowY2 + arrowSize}`;
      elements.push(
        createElement('polygon', {
          key: 'trend-arrow',
          points,
          fill: trendColor,
        }),
      );
    } else {
      // Down arrow
      const points = `${arrowX},${arrowY2 + arrowSize} ${arrowX - arrowSize / 2},${arrowY2} ${arrowX + arrowSize / 2},${arrowY2}`;
      elements.push(
        createElement('polygon', {
          key: 'trend-arrow',
          points,
          fill: trendColor,
        }),
      );
    }

    // Trend text
    elements.push(
      createElement(
        'text',
        {
          key: 'trend-text',
          x: String(arrowX + arrowSize + 4),
          y: String(arrowY2 + arrowSize * 0.7),
          'text-anchor': 'start',
          'font-size': '12',
          'font-family': 'sans-serif',
          fill: trendColor,
          'aria-label': `Trend: ${fullTrendText}`,
        },
        fullTrendText,
      ),
    );

    return elements;
  }, [hasTrend, trend, trendLabel, trendColor, width, trendY]);

  // ---- Sparkline ------------------------------------------------------------

  const buildSparkline = useCallback(() => {
    if (!hasSparkline) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const pts = sparkline!;

    // Filter valid values
    const validPts: number[] = [];
    for (const p of pts) {
      if (typeof p === 'number' && isFinite(p) && !isNaN(p)) {
        validPts.push(p);
      }
    }
    if (validPts.length < 2) return [];

    let min = Infinity;
    let max = -Infinity;
    for (const v of validPts) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    if (min === max) { min -= 1; max += 1; }

    const range = max - min;
    const stepX = sparklineWidth / (validPts.length - 1);

    // Build path
    let pathD = '';
    for (let i = 0; i < validPts.length; i++) {
      const x = cardPadding + i * stepX;
      const y = sparklineY + sparklineHeight - ((validPts[i]! - min) / range) * sparklineHeight;
      if (i === 0) {
        pathD += `M ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
      }
    }

    // Gradient fill under the line
    const lastX = cardPadding + (validPts.length - 1) * stepX;
    const fillD = pathD + ` L ${lastX} ${sparklineY + sparklineHeight} L ${cardPadding} ${sparklineY + sparklineHeight} Z`;

    elements.push(
      createElement('defs', { key: 'spark-defs' },
        createElement('linearGradient', {
          key: 'spark-grad',
          id: 'sparkGrad',
          x1: '0',
          y1: '0',
          x2: '0',
          y2: '1',
        },
          createElement('stop', { key: 'stop1', offset: '0%', 'stop-color': '#3b82f6', 'stop-opacity': '0.3' }),
          createElement('stop', { key: 'stop2', offset: '100%', 'stop-color': '#3b82f6', 'stop-opacity': '0.05' }),
        ),
      ),
    );

    // Fill area
    elements.push(
      createElement('path', {
        key: 'spark-fill',
        d: fillD,
        fill: 'url(#sparkGrad)',
      }),
    );

    // Line
    elements.push(
      createElement('path', {
        key: 'spark-line',
        d: pathD,
        fill: 'none',
        stroke: '#3b82f6',
        'stroke-width': '1.5',
        'stroke-linecap': 'round',
        'stroke-linejoin': 'round',
      }),
    );

    return elements;
  }, [hasSparkline, sparkline, sparklineWidth, sparklineY, sparklineHeight, cardPadding]);

  // ---- Assemble SVG ---------------------------------------------------------

  const bgElements = buildBackground();
  const valueElements = buildValue();
  const labelElements = buildLabel();
  const trendElements = buildTrend();
  const sparkElements = buildSparkline();

  const ariaDesc = `${prefix}${displayValue}${suffix}${hasLabel ? `, ${label}` : ''}`;

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'img',
      'aria-label': ariaDesc,
      style: { fontFamily: 'sans-serif' },
    },
    ...bgElements,
    ...sparkElements,
    ...valueElements,
    ...labelElements,
    ...trendElements,
  );
}
