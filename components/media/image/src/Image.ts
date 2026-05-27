// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Image -- Enhanced image component with lazy loading, placeholder, and fallback.
 *
 * Handles loading/error states: shows a placeholder while loading and a
 * fallback element or URL on error. Supports lazy loading via the native
 * loading="lazy" attribute, object-fit, border-radius, and captions.
 */

import { createElement } from 'specifyjs';
import { useState, useRef, useEffect, useId, useMemo } from 'specifyjs/hooks';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ImageProps {
  /** Image source URL */
  src: string;
  /** Alt text */
  alt?: string;
  /** Width (CSS value or number) */
  width?: string | number;
  /** Height (CSS value or number) */
  height?: string | number;
  /** Fallback URL or element shown on error */
  fallback?: string | unknown;
  /** Placeholder shown while loading: 'blur', 'skeleton', or element */
  placeholder?: 'blur' | 'skeleton' | unknown;
  /** Enable lazy loading (default: true) */
  lazy?: boolean;
  /** CSS object-fit value */
  objectFit?: string;
  /** CSS border-radius value */
  borderRadius?: string;
  /** Caption text rendered below the image */
  caption?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Image(props: ImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const imgRef = useRef<HTMLImageElement | null>(null);
  const animId = useId().replace(/[^a-zA-Z0-9_-]/g, '');
  const lazy = props.lazy !== false;

  const cssWidth = typeof props.width === 'number' ? `${props.width}px` : props.width;
  const cssHeight = typeof props.height === 'number' ? `${props.height}px` : props.height;

  // Reset status when src changes
  useEffect(() => {
    setStatus('loading');
  }, [props.src]);

  const containerStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'inline-block',
      position: 'relative',
      overflow: 'hidden',
    };
    if (cssWidth) s.width = cssWidth;
    if (cssHeight) s.height = cssHeight;
    if (props.borderRadius) s.borderRadius = props.borderRadius;
    return s;
  }, [cssWidth, cssHeight, props.borderRadius]);

  const imgStyle = useMemo<Record<string, string>>(() => {
    const s: Record<string, string> = {
      display: 'block',
      width: '100%',
      height: '100%',
    };
    if (props.objectFit) s.objectFit = props.objectFit;
    if (status === 'loading') {
      s.opacity = '0';
      s.position = 'absolute';
    }
    if (status === 'error') {
      s.display = 'none';
    }
    return s;
  }, [props.objectFit, status]);

  // -----------------------------------------------------------------------
  // Placeholder
  // -----------------------------------------------------------------------

  let placeholderEl: unknown = null;

  if (status === 'loading') {
    if (props.placeholder === 'skeleton') {
      const shimmerKf = `@keyframes liq-img-shimmer-${animId}{0%{background-position:-200% 0}100%{background-position:200% 0}}`;
      placeholderEl = createElement(
        'div',
        null,
        createElement('style', null, shimmerKf),
        createElement('div', {
          style: {
            width: cssWidth ?? '100%',
            height: cssHeight ?? '200px',
            backgroundColor: '#e5e7eb',
            backgroundImage: 'linear-gradient(90deg, #e5e7eb 25%, #f3f4f6 50%, #e5e7eb 75%)',
            backgroundSize: '200% 100%',
            animation: `liq-img-shimmer-${animId} 1.5s ease-in-out infinite`,
          },
        }),
      );
    } else if (props.placeholder === 'blur') {
      placeholderEl = createElement('div', {
        style: {
          width: cssWidth ?? '100%',
          height: cssHeight ?? '200px',
          backgroundColor: '#d1d5db',
          filter: 'blur(20px)',
        },
      });
    } else if (props.placeholder != null && props.placeholder !== false) {
      placeholderEl = props.placeholder;
    }
  }

  // -----------------------------------------------------------------------
  // Fallback
  // -----------------------------------------------------------------------

  let fallbackEl: unknown = null;

  if (status === 'error' && props.fallback != null) {
    if (typeof props.fallback === 'string') {
      fallbackEl = createElement('img', {
        src: props.fallback,
        alt: props.alt ?? '',
        style: { display: 'block', width: '100%', height: '100%', objectFit: props.objectFit ?? 'cover' },
      });
    } else {
      fallbackEl = props.fallback;
    }
  }

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const figure = createElement(
    'div',
    { style: containerStyle },
    placeholderEl,
    createElement('img', {
      ref: imgRef,
      src: props.src,
      alt: props.alt ?? '',
      loading: lazy ? 'lazy' : undefined,
      style: imgStyle,
      onload: () => setStatus('loaded'),
      onerror: () => setStatus('error'),
    }),
    fallbackEl,
  );

  if (props.caption) {
    return createElement(
      'figure',
      { style: { margin: '0', display: 'inline-block' } },
      figure,
      createElement(
        'figcaption',
        {
          style: {
            fontSize: '13px',
            color: '#6b7280',
            marginTop: '6px',
            textAlign: 'center',
          },
        },
        props.caption,
      ),
    );
  }

  return figure;
}
