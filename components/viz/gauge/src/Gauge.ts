// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Gauge — A SpecifyJS component that renders semicircular gauge meters as SVG.
 *
 * Supports:
 *  - Configurable arc angles (start/end)
 *  - Colored arc segments (e.g. green/yellow/red zones)
 *  - Animated needle
 *  - Tick marks with labels
 *  - Value and unit display
 *  - Min/max labels
 *  - ARIA accessibility attributes
 *
 * Zero runtime dependencies — pure SpecifyJS + SVG.
 */

import { createElement } from 'specifyjs';
import {
  useMemo,
  useCallback,
} from 'specifyjs/hooks';

// -- Props --------------------------------------------------------------------

export interface GaugeProps {
  /** Current gauge value */
  value: number;
  /** Minimum value (default: 0) */
  min?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** SVG width in pixels (default: 300) */
  width?: number;
  /** SVG height in pixels (default: 200) */
  height?: number;
  /** Arc start angle in degrees (default: -135) */
  startAngle?: number;
  /** Arc end angle in degrees (default: 135) */
  endAngle?: number;
  /** Arc stroke width (default: 20) */
  arcWidth?: number;
  /** Show the numeric value (default: true) */
  showValue?: boolean;
  /** Show min/max labels (default: true) */
  showMinMax?: boolean;
  /** Show tick marks (default: true) */
  showTicks?: boolean;
  /** Number of tick divisions (default: 10) */
  tickCount?: number;
  /** Label text below the value */
  label?: string;
  /** Unit text after the value (e.g. 'rpm', '%') */
  unit?: string;
  /** Colors for arc segments — evenly distributed (default: ['#22c55e', '#f59e0b', '#ef4444']) */
  colors?: string[];
  /** Needle color (default: '#374151') */
  needleColor?: string;
  /** Background arc color (default: '#e5e7eb') */
  backgroundColor?: string;
}

// -- Helpers ------------------------------------------------------------------

const DEG_TO_RAD = Math.PI / 180;

/** Convert degrees to radians. */
function degToRad(deg: number): number {
  return deg * DEG_TO_RAD;
}

/** Compute a point on a circle given center, radius, and angle in degrees. */
function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number): { x: number; y: number } {
  const rad = degToRad(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

/** Build an SVG arc path from startAngle to endAngle (degrees). */
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const angleDiff = endAngle - startAngle;
  const largeArcFlag = Math.abs(angleDiff) > 180 ? 1 : 0;
  // Determine sweep direction
  const sweepFlag = angleDiff > 0 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} ${sweepFlag === 1 ? 0 : 1} ${end.x} ${end.y}`;
}

/** Clamp a value between min and max. */
function clamp(value: number, min: number, max: number): number {
  if (value < min) return min;
  if (value > max) return max;
  return value;
}

/** Format a number for display. */
function formatNumber(v: number): string {
  if (!isFinite(v) || isNaN(v)) return '--';
  if (Math.abs(v) >= 1000) return Math.round(v).toString();
  if (v === Math.floor(v)) return v.toString();
  return v.toFixed(1);
}

// -- Component ----------------------------------------------------------------

export function Gauge(props: GaugeProps) {
  const {
    value,
    min = 0,
    max = 100,
    width = 300,
    height = 200,
    startAngle = -135,
    endAngle = 135,
    arcWidth = 20,
    showValue = true,
    showMinMax = true,
    showTicks = true,
    tickCount = 10,
    label,
    unit,
    colors = ['#22c55e', '#f59e0b', '#ef4444'],
    needleColor = '#374151',
    backgroundColor = '#e5e7eb',
  } = props;

  // Ensure valid range
  const effectiveMin = isFinite(min) && !isNaN(min) ? min : 0;
  const effectiveMax = isFinite(max) && !isNaN(max) && max > effectiveMin ? max : effectiveMin + 100;
  const effectiveValue = isFinite(value) && !isNaN(value) ? clamp(value, effectiveMin, effectiveMax) : effectiveMin;

  // Gauge geometry — reserve space at the bottom for value/label text
  const textReserve = (showValue ? 24 : 0) + (label ? 18 : 0);
  const cx = width / 2;
  const cy = (height - textReserve) * 0.6;
  const outerRadius = Math.min(width / 2, (height - textReserve) * 0.55) - arcWidth / 2 - 10;
  const innerRadius = outerRadius - arcWidth;
  const midRadius = outerRadius - arcWidth / 2;

  // Offset angles: SVG uses 0 = 3 o'clock, we want 0 = 12 o'clock for intuitive gauge
  // Actually, let's use the angle system where -90 is top, and our start/end
  // are relative to the bottom of the gauge.
  // startAngle=-135 means 135 degrees counterclockwise from bottom = upper-left
  // endAngle=135 means 135 degrees clockwise from bottom = upper-right

  // Map angles: SVG circle 0 deg = right (3 o'clock)
  // Our convention: 0 deg = bottom (6 o'clock) -> SVG 90 deg
  // So offset by +90 and negate for the SVG coordinate system
  // Actually let's keep it simple: treat startAngle/endAngle as SVG angles
  // where -135 = upper-left and 135 = upper-right (with 0 = right/3 o'clock)
  // The default -135 to 135 gives a 270-degree sweep, typical for gauges

  const totalAngleSpan = endAngle - startAngle;

  // Value to angle
  const valueToAngle = useCallback(
    (v: number): number => {
      const range = effectiveMax - effectiveMin;
      if (range === 0) return startAngle;
      const t = (v - effectiveMin) / range;
      return startAngle + t * totalAngleSpan;
    },
    [effectiveMin, effectiveMax, startAngle, totalAngleSpan],
  );

  // ---- Background arc -------------------------------------------------------

  const buildBackgroundArc = useCallback(() => {
    const d = describeArc(cx, cy, midRadius, startAngle, endAngle);
    return [
      createElement('path', {
        key: 'bg-arc',
        d,
        fill: 'none',
        stroke: backgroundColor,
        'stroke-width': String(arcWidth),
        'stroke-linecap': 'round',
      }),
    ];
  }, [cx, cy, midRadius, startAngle, endAngle, backgroundColor, arcWidth]);

  // ---- Colored arc segments -------------------------------------------------

  const buildColorSegments = useCallback(() => {
    if (colors.length === 0) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const segmentSpan = totalAngleSpan / colors.length;

    for (let i = 0; i < colors.length; i++) {
      const segStart = startAngle + i * segmentSpan;
      const segEnd = segStart + segmentSpan;
      const d = describeArc(cx, cy, midRadius, segStart, segEnd);

      elements.push(
        createElement('path', {
          key: `seg-${i}`,
          d,
          fill: 'none',
          stroke: colors[i]!,
          'stroke-width': String(arcWidth),
          'stroke-linecap': i === 0 || i === colors.length - 1 ? 'round' : 'butt',
          opacity: '0.85',
        }),
      );
    }

    return elements;
  }, [colors, totalAngleSpan, startAngle, cx, cy, midRadius, arcWidth]);

  // ---- Tick marks -----------------------------------------------------------

  const buildTicks = useCallback(() => {
    if (!showTicks || tickCount <= 0) return [];
    const elements: ReturnType<typeof createElement>[] = [];
    const effectiveTickCount = Math.max(1, Math.min(tickCount, 100));

    for (let i = 0; i <= effectiveTickCount; i++) {
      const t = i / effectiveTickCount;
      const angle = startAngle + t * totalAngleSpan;
      const isMajor = i % 2 === 0;
      const tickLength = isMajor ? 10 : 6;

      const outerPt = polarToCartesian(cx, cy, outerRadius + 4, angle);
      const innerPt = polarToCartesian(cx, cy, outerRadius + 4 + tickLength, angle);

      elements.push(
        createElement('line', {
          key: `tick-${i}`,
          x1: String(outerPt.x),
          y1: String(outerPt.y),
          x2: String(innerPt.x),
          y2: String(innerPt.y),
          stroke: 'currentColor',
          opacity: '0.4',
          'stroke-width': isMajor ? '2' : '1',
        }),
      );

      // Tick label for major ticks
      if (isMajor) {
        const tickValue = effectiveMin + t * (effectiveMax - effectiveMin);
        const labelPt = polarToCartesian(cx, cy, outerRadius + 4 + tickLength + 12, angle);
        elements.push(
          createElement('text', {
            key: `tick-label-${i}`,
            x: String(labelPt.x),
            y: String(labelPt.y + 3),
            'text-anchor': 'middle',
            'font-size': '9',
            'font-family': 'sans-serif',
            fill: 'currentColor',
            opacity: '0.55',
          }, formatNumber(tickValue)),
        );
      }
    }

    return elements;
  }, [showTicks, tickCount, startAngle, totalAngleSpan, cx, cy, outerRadius, effectiveMin, effectiveMax]);

  // ---- Needle ---------------------------------------------------------------

  const buildNeedle = useCallback(() => {
    const elements: ReturnType<typeof createElement>[] = [];
    const needleAngle = valueToAngle(effectiveValue);
    const needleLength = innerRadius - 8;
    const needleTip = polarToCartesian(cx, cy, needleLength, needleAngle);

    // Needle base width
    const baseSize = 6;
    const baseAngleLeft = needleAngle + 90;
    const baseAngleRight = needleAngle - 90;
    const baseLeft = polarToCartesian(cx, cy, baseSize, baseAngleLeft);
    const baseRight = polarToCartesian(cx, cy, baseSize, baseAngleRight);

    // Needle triangle
    elements.push(
      createElement('polygon', {
        key: 'needle',
        points: `${needleTip.x},${needleTip.y} ${baseLeft.x},${baseLeft.y} ${baseRight.x},${baseRight.y}`,
        fill: needleColor,
        stroke: 'none',
      }),
    );

    // Center cap circle
    elements.push(
      createElement('circle', {
        key: 'needle-cap',
        cx: String(cx),
        cy: String(cy),
        r: '8',
        fill: needleColor,
        stroke: '#fff',
        'stroke-width': '2',
      }),
    );

    return elements;
  }, [effectiveValue, valueToAngle, cx, cy, innerRadius, needleColor]);

  // ---- Value display --------------------------------------------------------

  const buildValueDisplay = useCallback(() => {
    if (!showValue) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    const displayText = formatNumber(effectiveValue);
    const fullText = displayText + (unit ? ' ' + unit : '');

    // Position value text below the arc to avoid overlap
    const valueY = cy + midRadius + 20;

    elements.push(
      createElement(
        'text',
        {
          key: 'value-text',
          x: String(cx),
          y: String(valueY),
          'text-anchor': 'middle',
          'font-size': '22',
          'font-weight': 'bold',
          'font-family': 'sans-serif',
          fill: 'currentColor',
          'aria-label': `Value: ${fullText}`,
        },
        displayText,
        unit
          ? createElement('tspan', {
              key: 'unit',
              'font-size': '14',
              'font-weight': 'normal',
              opacity: '0.6',
              fill: 'currentColor',
            }, ' ' + unit)
          : null,
      ),
    );

    return elements;
  }, [showValue, effectiveValue, unit, cx, cy, midRadius]);

  // ---- Label ----------------------------------------------------------------

  const buildLabel = useCallback(() => {
    if (!label) return [];
    // Position label below the value text
    const labelY = cy + midRadius + (showValue ? 40 : 20);
    return [
      createElement('text', {
        key: 'label',
        x: String(cx),
        y: String(labelY),
        'text-anchor': 'middle',
        'font-size': '13',
        'font-family': 'sans-serif',
        fill: 'currentColor',
        opacity: '0.6',
      }, label),
    ];
  }, [label, cx, cy, midRadius, showValue]);

  // ---- Min/Max labels -------------------------------------------------------

  const buildMinMax = useCallback(() => {
    if (!showMinMax) return [];
    const elements: ReturnType<typeof createElement>[] = [];

    const minPt = polarToCartesian(cx, cy, midRadius, startAngle);
    const maxPt = polarToCartesian(cx, cy, midRadius, endAngle);

    elements.push(
      createElement('text', {
        key: 'min-label',
        x: String(minPt.x - 4),
        y: String(minPt.y + 18),
        'text-anchor': 'middle',
        'font-size': '11',
        'font-family': 'sans-serif',
        fill: 'currentColor',
        opacity: '0.55',
      }, formatNumber(effectiveMin)),
    );

    elements.push(
      createElement('text', {
        key: 'max-label',
        x: String(maxPt.x + 4),
        y: String(maxPt.y + 18),
        'text-anchor': 'middle',
        'font-size': '11',
        'font-family': 'sans-serif',
        fill: 'currentColor',
        opacity: '0.55',
      }, formatNumber(effectiveMax)),
    );

    return elements;
  }, [showMinMax, cx, cy, midRadius, startAngle, endAngle, effectiveMin, effectiveMax]);

  // ---- Assemble SVG ---------------------------------------------------------

  const bgArc = buildBackgroundArc();
  const colorSegments = buildColorSegments();
  const ticks = buildTicks();
  const needle = buildNeedle();
  const valueDisplay = buildValueDisplay();
  const labelElements = buildLabel();
  const minMaxElements = buildMinMax();

  const ariaDesc = `Gauge: ${formatNumber(effectiveValue)}${unit ? ' ' + unit : ''}, range ${formatNumber(effectiveMin)} to ${formatNumber(effectiveMax)}${label ? ', ' + label : ''}`;

  return createElement(
    'svg',
    {
      width: '100%',
      viewBox: `0 0 ${width} ${height}`,
      preserveAspectRatio: 'xMidYMid meet',
      xmlns: 'http://www.w3.org/2000/svg',
      role: 'meter',
      'aria-valuenow': String(effectiveValue),
      'aria-valuemin': String(effectiveMin),
      'aria-valuemax': String(effectiveMax),
      'aria-label': ariaDesc,
      style: { fontFamily: 'sans-serif' },
    },
    ...bgArc,
    ...colorSegments,
    ...ticks,
    ...needle,
    ...valueDisplay,
    ...labelElements,
    ...minMaxElements,
  );
}
