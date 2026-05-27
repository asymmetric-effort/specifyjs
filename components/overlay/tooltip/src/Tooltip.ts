// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Tooltip — Lightweight hover tooltip with configurable placement and delay.
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useRef, useCallback } from 'specifyjs/hooks';

export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** Tooltip text content */
  text: string;
  /** Placement relative to the trigger */
  placement?: TooltipPlacement;
  /** Delay in ms before showing (default 200) */
  delay?: number;
  /** Max width of the tooltip */
  maxWidth?: string;
  /** Trigger element(s) */
  children?: unknown;
}

const ARROW_SIZE = 6;
const TOOLTIP_GAP = 8;

function computeTooltipPosition(
  triggerRect: DOMRect,
  placement: TooltipPlacement,
): Record<string, string> {
  const scrollX = window.scrollX || window.pageXOffset;
  const scrollY = window.scrollY || window.pageYOffset;
  const gap = TOOLTIP_GAP;

  switch (placement) {
    case 'top':
      return {
        position: 'fixed',
        left: `${triggerRect.left + triggerRect.width / 2}px`,
        top: `${triggerRect.top - gap}px`,
        transform: 'translate(-50%, -100%)',
      };
    case 'bottom':
      return {
        position: 'fixed',
        left: `${triggerRect.left + triggerRect.width / 2}px`,
        top: `${triggerRect.bottom + gap}px`,
        transform: 'translateX(-50%)',
      };
    case 'left':
      return {
        position: 'fixed',
        left: `${triggerRect.left - gap}px`,
        top: `${triggerRect.top + triggerRect.height / 2}px`,
        transform: 'translate(-100%, -50%)',
      };
    case 'right':
      return {
        position: 'fixed',
        left: `${triggerRect.right + gap}px`,
        top: `${triggerRect.top + triggerRect.height / 2}px`,
        transform: 'translateY(-50%)',
      };
  }
}

function getArrowStyle(placement: TooltipPlacement): Record<string, string> {
  const base: Record<string, string> = {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid',
  };
  const s = `${ARROW_SIZE}px`;
  const t = 'transparent';
  const c = '#1f2937';

  switch (placement) {
    case 'top':
      return {
        ...base,
        bottom: `-${s}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${s} ${s} 0 ${s}`,
        borderColor: `${c} ${t} ${t} ${t}`,
      };
    case 'bottom':
      return {
        ...base,
        top: `-${s}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${s} ${s} ${s}`,
        borderColor: `${t} ${t} ${c} ${t}`,
      };
    case 'left':
      return {
        ...base,
        right: `-${s}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${s} 0 ${s} ${s}`,
        borderColor: `${t} ${t} ${t} ${c}`,
      };
    case 'right':
      return {
        ...base,
        left: `-${s}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${s} ${s} ${s} 0`,
        borderColor: `${t} ${c} ${t} ${t}`,
      };
  }
}

export function Tooltip(props: TooltipProps) {
  const {
    text,
    placement = 'top',
    delay = 200,
    maxWidth = '250px',
    children,
  } = props;

  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<Record<string, string> | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const tooltipId = `tooltip-${Math.random().toString(36).slice(2, 9)}`;

  const show = useCallback(() => {
    timerRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        setPosition(computeTooltipPosition(rect, placement));
      }
      setVisible(true);
    }, delay);
  }, [delay, placement]);

  const hide = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const triggerStyle: Record<string, string> = {
    display: 'inline-block',
  };

  const tooltipStyle: Record<string, string> = {
    ...(position ?? {}),
    backgroundColor: '#1f2937',
    color: '#fff',
    fontSize: '13px',
    lineHeight: '1.4',
    padding: '6px 10px',
    borderRadius: '6px',
    maxWidth,
    zIndex: '10002',
    pointerEvents: 'none',
    whiteSpace: 'normal',
    wordWrap: 'break-word',
  };

  const elements: unknown[] = [
    createElement(
      'div',
      {
        ref: triggerRef,
        style: triggerStyle,
        onMouseEnter: show,
        onMouseLeave: hide,
        onFocus: show,
        onBlur: hide,
        'aria-describedby': visible ? tooltipId : undefined,
      },
      children,
    ),
  ];

  if (visible && position) {
    elements.push(
      createElement(
        'div',
        { id: tooltipId, style: tooltipStyle, role: 'tooltip' },
        text,
        createElement('div', { style: getArrowStyle(placement) }),
      ),
    );
  }

  return createElement('div', { style: { display: 'inline-block', position: 'relative' } }, ...elements);
}
