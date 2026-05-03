// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Carousel -- Image/content carousel slider.
 *
 * Supports left/right arrows, dot indicators, auto-advance timer,
 * CSS transform slide animation, keyboard navigation (left/right arrows),
 * touch swipe via pointer events, and fade/slide animation modes.
 */

import { createElement } from '../../../../core/src/index';
import {
  useState,
  useEffect,
  useRef,
  useCallback,
  useId,
  useMemo,
} from '../../../../core/src/hooks/index';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CarouselItem {
  content: unknown;
  caption?: string;
}

export interface CarouselProps {
  /** Carousel items */
  items: CarouselItem[];
  /** Enable auto-advance */
  autoPlay?: boolean;
  /** Auto-advance interval in ms (default: 5000) */
  interval?: number;
  /** Show dot indicators (default: true) */
  showDots?: boolean;
  /** Show prev/next arrows (default: true) */
  showArrows?: boolean;
  /** Loop from last to first (default: true) */
  loop?: boolean;
  /** Transition animation type */
  animation?: 'slide' | 'fade';
  /** Called when the active index changes */
  onChange?: (index: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Carousel(props: CarouselProps) {
  const items = props.items ?? [];
  const count = items.length;
  const loop = props.loop !== false;
  const showDots = props.showDots !== false;
  const showArrows = props.showArrows !== false;
  const animation = props.animation ?? 'slide';
  const interval = props.interval ?? 5000;
  const animId = useId().replace(/[^a-zA-Z0-9_-]/g, '');

  const [current, setCurrent] = useState(0);
  const pointerStart = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // -----------------------------------------------------------------------
  // Navigation helpers
  // -----------------------------------------------------------------------

  const goTo = useCallback(
    (index: number) => {
      let next = index;
      if (loop) {
        next = ((index % count) + count) % count;
      } else {
        next = Math.max(0, Math.min(index, count - 1));
      }
      setCurrent(next);
      if (props.onChange) props.onChange(next);
    },
    [count, loop, props.onChange],
  );

  const goNext = useCallback(() => goTo(current + 1), [current, goTo]);
  const goPrev = useCallback(() => goTo(current - 1), [current, goTo]);

  // -----------------------------------------------------------------------
  // Auto-play
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!props.autoPlay || count <= 1) return;
    const timer = setInterval(goNext, interval);
    return () => clearInterval(timer);
  }, [props.autoPlay, interval, goNext, count]);

  // -----------------------------------------------------------------------
  // Keyboard navigation
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'ArrowRight') goNext();
    };
    const el = containerRef.current;
    if (el) {
      (el as unknown as HTMLElement).addEventListener('keydown', handler as EventListener);
      return () => (el as unknown as HTMLElement).removeEventListener('keydown', handler as EventListener);
    }
  }, [goNext, goPrev]);

  // -----------------------------------------------------------------------
  // Keyframes
  // -----------------------------------------------------------------------

  const fadeKeyframes = animation === 'fade'
    ? `@keyframes liq-fade-in-${animId}{from{opacity:0}to{opacity:1}}`
    : '';

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle: Record<string, string> = {
    position: 'relative',
    overflow: 'hidden',
    width: '100%',
    outline: 'none',
  };

  const trackStyle = useMemo<Record<string, string>>(() => {
    if (animation === 'fade') {
      return { position: 'relative', width: '100%' } as Record<string, string>;
    }
    return {
      display: 'flex',
      transition: 'transform 0.4s ease',
      transform: `translateX(-${current * 100}%)`,
      width: '100%',
    } as Record<string, string>;
  }, [current, animation]);

  const arrowStyle: Record<string, string> = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: '2',
    background: 'rgba(255,255,255,0.8)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    fontSize: '18px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#111827',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  };

  // -----------------------------------------------------------------------
  // Render items
  // -----------------------------------------------------------------------

  const renderedItems = items.map((item, i) => {
    const itemStyle: Record<string, string> =
      animation === 'fade'
        ? {
            position: i === current ? 'relative' : 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            opacity: i === current ? '1' : '0',
            transition: 'opacity 0.4s ease',
          }
        : {
            flex: '0 0 100%',
            width: '100%',
          };

    return createElement(
      'div',
      { key: String(i), style: itemStyle },
      item.content,
      item.caption
        ? createElement(
            'div',
            {
              style: {
                textAlign: 'center',
                padding: '8px 12px',
                fontSize: '13px',
                color: '#6b7280',
              },
            },
            item.caption,
          )
        : null,
    );
  });

  // -----------------------------------------------------------------------
  // Dot indicators
  // -----------------------------------------------------------------------

  const dots = showDots
    ? createElement(
        'div',
        {
          style: {
            display: 'flex',
            justifyContent: 'center',
            gap: '8px',
            padding: '12px 0',
          },
        },
        ...items.map((_: unknown, i: number) =>
          createElement('button', {
            key: String(i),
            'aria-label': `Go to slide ${i + 1}`,
            onclick: () => goTo(i),
            style: {
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: i === current ? '#3b82f6' : '#d1d5db',
              transition: 'background-color 0.2s',
              padding: '0',
            },
          }),
        ),
      )
    : null;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return createElement(
    'div',
    {
      ref: containerRef,
      tabindex: '0',
      role: 'region',
      'aria-label': 'Carousel',
      style: containerStyle,
      onpointerdown: (e: PointerEvent) => {
        pointerStart.current = e.clientX;
      },
      onpointerup: (e: PointerEvent) => {
        if (pointerStart.current == null) return;
        const diff = e.clientX - pointerStart.current;
        if (diff > 50) goPrev();
        else if (diff < -50) goNext();
        pointerStart.current = null;
      },
    },
    fadeKeyframes ? createElement('style', null, fadeKeyframes) : null,
    // Track
    createElement('div', { style: trackStyle }, ...renderedItems),
    // Prev arrow
    showArrows && count > 1
      ? createElement(
          'button',
          {
            'aria-label': 'Previous slide',
            onclick: goPrev,
            style: { ...arrowStyle, left: '8px' },
          },
          '\u2039',
        )
      : null,
    // Next arrow
    showArrows && count > 1
      ? createElement(
          'button',
          {
            'aria-label': 'Next slide',
            onclick: goNext,
            style: { ...arrowStyle, right: '8px' },
          },
          '\u203A',
        )
      : null,
    // Dots
    dots,
  );
}
