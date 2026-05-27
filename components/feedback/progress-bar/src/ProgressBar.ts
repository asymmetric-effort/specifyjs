// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * ProgressBar -- Progress indicator bar with bar and circular variants.
 *
 * Supports determinate (value-based) and indeterminate (animated) modes,
 * optional percentage label, shimmer animation, and a circular SVG variant.
 */

import { createElement } from 'specifyjs';
import { useMemo, useId } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ProgressBarProps {
  /** Current progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Fill color */
  color?: string;
  /** Track background color */
  backgroundColor?: string;
  /** Bar height (CSS value) */
  height?: string;
  /** Show percentage label */
  showLabel?: boolean;
  /** Enable shimmer animation on the filled portion */
  animated?: boolean;
  /** Display variant */
  variant?: 'bar' | 'circular';
  /** Size for circular variant or bar height shorthand */
  size?: number | string;
  /** Indeterminate mode -- animated without a specific value */
  indeterminate?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ProgressBar(props: ProgressBarProps) {
  const max = props.max ?? 100;
  const value = props.indeterminate ? 0 : Math.min(Math.max(props.value ?? 0, 0), max);
  const pct = max > 0 ? (value / max) * 100 : 0;
  const color = props.color ?? '#3b82f6';
  const bgColor = props.backgroundColor ?? '#e5e7eb';
  const height = props.height ?? (typeof props.size === 'string' ? props.size : typeof props.size === 'number' ? `${props.size}px` : '8px');
  const variant = props.variant ?? 'bar';
  const animId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  // -----------------------------------------------------------------------
  // Circular variant
  // -----------------------------------------------------------------------

  if (variant === 'circular') {
    const sizeNum = typeof props.size === 'number' ? props.size : 48;
    const strokeWidth = Math.max(2, Math.round(sizeNum / 10));
    const radius = (sizeNum - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = props.indeterminate ? circumference * 0.75 : circumference - (pct / 100) * circumference;

    const keyframes = props.indeterminate
      ? `@keyframes liq-spin-${animId}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`
      : props.animated
        ? `@keyframes liq-pulse-${animId}{0%,100%{opacity:1}50%{opacity:0.6}}`
        : '';

    return createElement(
      'div',
      {
        role: 'progressbar',
        'aria-valuenow': props.indeterminate ? undefined : String(Math.round(pct)),
        'aria-valuemin': '0',
        'aria-valuemax': '100',
        'aria-label': 'Progress',
        style: { display: 'inline-flex', alignItems: 'center', gap: '8px' },
      },
      keyframes ? createElement('style', null, keyframes) : null,
      createElement(
        'svg',
        {
          width: String(sizeNum),
          height: String(sizeNum),
          viewBox: `0 0 ${sizeNum} ${sizeNum}`,
          style: props.indeterminate
            ? { animation: `liq-spin-${animId} 1s linear infinite` }
            : props.animated
              ? { animation: `liq-pulse-${animId} 1.5s ease-in-out infinite` }
              : {},
        },
        createElement('circle', {
          cx: String(sizeNum / 2),
          cy: String(sizeNum / 2),
          r: String(radius),
          fill: 'none',
          stroke: bgColor,
          'stroke-width': String(strokeWidth),
        }),
        createElement('circle', {
          cx: String(sizeNum / 2),
          cy: String(sizeNum / 2),
          r: String(radius),
          fill: 'none',
          stroke: color,
          'stroke-width': String(strokeWidth),
          'stroke-dasharray': String(circumference),
          'stroke-dashoffset': String(offset),
          'stroke-linecap': 'round',
          transform: `rotate(-90 ${sizeNum / 2} ${sizeNum / 2})`,
          style: { transition: 'stroke-dashoffset 0.3s ease' },
        }),
      ),
      props.showLabel && !props.indeterminate
        ? createElement('span', { style: { fontSize: '14px', color: '#374151' } }, `${Math.round(pct)}%`)
        : null,
    );
  }

  // -----------------------------------------------------------------------
  // Bar variant (default)
  // -----------------------------------------------------------------------

  const shimmerKeyframes = props.animated || props.indeterminate
    ? `@keyframes liq-shimmer-${animId}{0%{background-position:-200% 0}100%{background-position:200% 0}}`
    : '';

  const indeterminateKeyframes = props.indeterminate
    ? `@keyframes liq-indeterminate-${animId}{0%{left:-40%;width:40%}50%{left:20%;width:60%}100%{left:100%;width:40%}}`
    : '';

  const trackStyle: Record<string, string> = {
    width: '100%',
    height,
    backgroundColor: bgColor,
    borderRadius: height,
    overflow: 'hidden',
    position: 'relative',
  };

  const fillStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      height: '100%',
      borderRadius: height,
      transition: 'width 0.3s ease',
    };

    if (props.indeterminate) {
      s.position = 'absolute';
      s.animation = `liq-indeterminate-${animId} 1.5s ease-in-out infinite`;
      s.backgroundColor = color;
    } else {
      s.width = `${pct}%`;
      s.backgroundColor = color;
    }

    if (props.animated && !props.indeterminate) {
      s.backgroundImage = `linear-gradient(90deg, ${color} 0%, ${lighten(color)} 50%, ${color} 100%)`;
      s.backgroundSize = '200% 100%';
      s.animation = `liq-shimmer-${animId} 1.5s ease-in-out infinite`;
    }

    return s;
  }, [pct, color, height, props.animated, props.indeterminate, animId]);

  return createElement(
    'div',
    {
      role: 'progressbar',
      'aria-valuenow': props.indeterminate ? undefined : String(Math.round(pct)),
      'aria-valuemin': '0',
      'aria-valuemax': '100',
      'aria-label': 'Progress',
      style: { width: '100%' },
    },
    shimmerKeyframes || indeterminateKeyframes
      ? createElement('style', null, shimmerKeyframes + indeterminateKeyframes)
      : null,
    props.showLabel && !props.indeterminate
      ? createElement(
          'div',
          { style: { marginBottom: '4px', fontSize: '12px', color: '#374151', textAlign: 'right' } },
          `${Math.round(pct)}%`,
        )
      : null,
    createElement(
      'div',
      { style: trackStyle },
      createElement('div', { style: fillStyle }),
    ),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function lighten(hex: string): string {
  const h = hex.replace('#', '');
  if (h.length !== 6) return hex;
  const r = Math.min(255, parseInt(h.slice(0, 2), 16) + 40);
  const g = Math.min(255, parseInt(h.slice(2, 4), 16) + 40);
  const b = Math.min(255, parseInt(h.slice(4, 6), 16) + 40);
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}
