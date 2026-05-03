// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Spinner -- Loading spinner indicator.
 *
 * Renders a rotating SVG circle with a stroke-dasharray gap.
 * Injects an inline style element for the @keyframes rotation animation.
 */

import { createElement } from '../../../../core/src/index';
import { useId, useMemo } from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SpinnerProps {
  /** Spinner size: preset name or pixel number */
  size?: 'sm' | 'md' | 'lg' | number;
  /** Spinner color */
  color?: string;
  /** Stroke thickness in pixels */
  thickness?: number;
  /** Animation speed */
  speed?: 'slow' | 'normal' | 'fast';
  /** Accessible label for screen readers */
  label?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<string, number> = { sm: 16, md: 24, lg: 40 };
const SPEED_MAP: Record<string, string> = { slow: '1.2s', normal: '0.75s', fast: '0.45s' };

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Spinner(props: SpinnerProps) {
  const sizeVal = typeof props.size === 'number' ? props.size : SIZE_MAP[props.size ?? 'md'] ?? 24;
  const color = props.color ?? '#3b82f6';
  const thickness = props.thickness ?? Math.max(2, Math.round(sizeVal / 8));
  const speed = SPEED_MAP[props.speed ?? 'normal'] ?? SPEED_MAP.normal;
  const label = props.label ?? 'Loading';
  const rawId = useId();
  const animId = rawId.replace(/[^a-zA-Z0-9_-]/g, '');

  const radius = (sizeVal - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const keyframes = useMemo(
    () => `@keyframes liq-rotate-${animId}{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`,
    [animId],
  );

  return createElement(
    'span',
    {
      role: 'status',
      'aria-label': label,
      style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center' },
    },
    createElement('style', null, keyframes),
    createElement(
      'svg',
      {
        width: String(sizeVal),
        height: String(sizeVal),
        viewBox: `0 0 ${sizeVal} ${sizeVal}`,
        style: { animation: `liq-rotate-${animId} ${speed} linear infinite` },
      },
      createElement('circle', {
        cx: String(sizeVal / 2),
        cy: String(sizeVal / 2),
        r: String(radius),
        fill: 'none',
        stroke: color,
        'stroke-width': String(thickness),
        'stroke-dasharray': `${circumference * 0.7} ${circumference * 0.3}`,
        'stroke-linecap': 'round',
      }),
    ),
    createElement(
      'span',
      {
        style: {
          position: 'absolute',
          width: '1px',
          height: '1px',
          padding: '0',
          margin: '-1px',
          overflow: 'hidden',
          clip: 'rect(0,0,0,0)',
          whiteSpace: 'nowrap',
          borderWidth: '0',
        },
      },
      label,
    ),
  );
}
