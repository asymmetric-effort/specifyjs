// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Skeleton -- Content placeholder with shimmer animation.
 *
 * Renders gray placeholder shapes (text lines, circles, rectangles)
 * with an animated CSS shimmer (background gradient slide).
 */

import { createElement } from 'specifyjs';
import { useId, useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SkeletonProps {
  /** Shape variant */
  variant?: 'text' | 'circular' | 'rectangular';
  /** Width (CSS value) */
  width?: string | number;
  /** Height (CSS value) */
  height?: string | number;
  /** Number of text lines to render (text variant only) */
  lines?: number;
  /** Enable shimmer animation (default: true) */
  animated?: boolean;
  /** Border radius (CSS value) */
  borderRadius?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Skeleton(props: SkeletonProps) {
  const variant = props.variant ?? 'text';
  const animated = props.animated !== false;
  const animId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const keyframes = useMemo(
    () =>
      animated
        ? `@keyframes liq-shimmer-${animId}{0%{background-position:-200% 0}100%{background-position:200% 0}}`
        : '',
    [animated, animId],
  );

  const cssWidth = typeof props.width === 'number' ? `${props.width}px` : props.width;
  const cssHeight = typeof props.height === 'number' ? `${props.height}px` : props.height;

  // -----------------------------------------------------------------------
  // Text variant with multiple lines
  // -----------------------------------------------------------------------

  if (variant === 'text') {
    const lineCount = props.lines ?? 1;
    const lines: unknown[] = [];

    for (let i = 0; i < lineCount; i++) {
      const isLast = i === lineCount - 1 && lineCount > 1;
      lines.push(
        createElement('div', {
          key: String(i),
          style: buildShimmerStyle({
            width: isLast ? '75%' : (cssWidth ?? '100%'),
            height: cssHeight ?? '1em',
            borderRadius: props.borderRadius ?? '4px',
            animated,
            animId,
            marginBottom: i < lineCount - 1 ? '8px' : '0',
          }),
        }),
      );
    }

    return createElement(
      'div',
      { 'aria-hidden': 'true', style: { width: cssWidth ?? '100%' } },
      keyframes ? createElement('style', null, keyframes) : null,
      ...lines,
    );
  }

  // -----------------------------------------------------------------------
  // Circular variant
  // -----------------------------------------------------------------------

  if (variant === 'circular') {
    const size = cssWidth ?? cssHeight ?? '40px';
    return createElement(
      'div',
      { 'aria-hidden': 'true' },
      keyframes ? createElement('style', null, keyframes) : null,
      createElement('div', {
        style: buildShimmerStyle({
          width: size,
          height: size,
          borderRadius: '50%',
          animated,
          animId,
        }),
      }),
    );
  }

  // -----------------------------------------------------------------------
  // Rectangular variant
  // -----------------------------------------------------------------------

  return createElement(
    'div',
    { 'aria-hidden': 'true' },
    keyframes ? createElement('style', null, keyframes) : null,
    createElement('div', {
      style: buildShimmerStyle({
        width: cssWidth ?? '100%',
        height: cssHeight ?? '100px',
        borderRadius: props.borderRadius ?? '4px',
        animated,
        animId,
      }),
    }),
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

interface ShimmerStyleOpts {
  width: string;
  height: string;
  borderRadius: string;
  animated: boolean;
  animId: string;
  marginBottom?: string;
}

function buildShimmerStyle(opts: ShimmerStyleOpts): Record<string, string> {
  const s: Record<string, string> = {
    width: opts.width,
    height: opts.height,
    borderRadius: opts.borderRadius,
    backgroundColor: '#e5e7eb',
  };

  if (opts.animated) {
    s.backgroundImage = 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)';
    s.backgroundSize = '200% 100%';
    s.animation = `liq-shimmer-${opts.animId} 1.5s ease-in-out infinite`;
  }

  if (opts.marginBottom) {
    s.marginBottom = opts.marginBottom;
  }

  return s;
}
