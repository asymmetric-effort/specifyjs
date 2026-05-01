// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Popover — Positioned popover attached to a trigger element.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useEffect, useRef, useCallback } from '../../../../core/src/hooks/index';

export type PopoverPlacement = 'top' | 'bottom' | 'left' | 'right';

export interface PopoverProps {
  /** Trigger element slot */
  trigger: unknown;
  /** Popover content slot */
  content: unknown;
  /** Controlled open state (if provided, disables auto-toggle) */
  open?: boolean;
  /** Placement relative to trigger */
  placement?: PopoverPlacement;
  /** Offset from trigger in px */
  offset?: number;
  /** Show an arrow pointing to the trigger */
  arrow?: boolean;
  /** Close when clicking outside the popover */
  closeOnClickOutside?: boolean;
  /** Callback when open state changes (for controlled mode) */
  onOpenChange?: (open: boolean) => void;
}

const ARROW_SIZE = 8;

function getPopoverPosition(
  placement: PopoverPlacement,
  offset: number,
): Record<string, string> {
  const total = offset + ARROW_SIZE;
  switch (placement) {
    case 'top':
      return {
        position: 'absolute',
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: `${total}px`,
      };
    case 'bottom':
      return {
        position: 'absolute',
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: `${total}px`,
      };
    case 'left':
      return {
        position: 'absolute',
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: `${total}px`,
      };
    case 'right':
      return {
        position: 'absolute',
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: `${total}px`,
      };
  }
}

function getArrowStyle(placement: PopoverPlacement): Record<string, string> {
  const base: Record<string, string> = {
    position: 'absolute',
    width: '0',
    height: '0',
    borderStyle: 'solid',
  };
  const s = `${ARROW_SIZE}px`;
  const t = 'transparent';

  switch (placement) {
    case 'top':
      return {
        ...base,
        bottom: `-${s}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `${s} ${s} 0 ${s}`,
        borderColor: `#fff ${t} ${t} ${t}`,
      };
    case 'bottom':
      return {
        ...base,
        top: `-${s}`,
        left: '50%',
        transform: 'translateX(-50%)',
        borderWidth: `0 ${s} ${s} ${s}`,
        borderColor: `${t} ${t} #fff ${t}`,
      };
    case 'left':
      return {
        ...base,
        right: `-${s}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${s} 0 ${s} ${s}`,
        borderColor: `${t} ${t} ${t} #fff`,
      };
    case 'right':
      return {
        ...base,
        left: `-${s}`,
        top: '50%',
        transform: 'translateY(-50%)',
        borderWidth: `${s} ${s} ${s} 0`,
        borderColor: `${t} #fff ${t} ${t}`,
      };
  }
}

export function Popover(props: PopoverProps) {
  const {
    trigger,
    content,
    open: controlledOpen,
    placement = 'bottom',
    offset = 4,
    arrow = false,
    closeOnClickOutside = true,
    onOpenChange,
  } = props;

  const isControlled = controlledOpen !== undefined;
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isControlled ? controlledOpen : internalOpen;
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggleOpen = useCallback(() => {
    if (isControlled) {
      if (onOpenChange) onOpenChange(!controlledOpen);
    } else {
      setInternalOpen((prev: boolean) => !prev);
    }
  }, [isControlled, controlledOpen, onOpenChange]);

  // Click outside handler
  useEffect(() => {
    if (!isOpen || !closeOnClickOutside) return;
    const handler = (e: Event) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        if (isControlled) {
          if (onOpenChange) onOpenChange(false);
        } else {
          setInternalOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeOnClickOutside, isControlled, onOpenChange]);

  const containerStyle: Record<string, string> = {
    position: 'relative',
    display: 'inline-block',
  };

  const popoverStyle: Record<string, string> = {
    ...getPopoverPosition(placement, offset),
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
    border: '1px solid #e5e7eb',
    padding: '12px 16px',
    zIndex: '10000',
    whiteSpace: 'nowrap',
  };

  const popoverChildren: unknown[] = [content];
  if (arrow) {
    popoverChildren.push(createElement('div', { style: getArrowStyle(placement) }));
  }

  const handleTriggerKeyDown = useCallback((e: Event) => {
    const key = (e as KeyboardEvent).key;
    if (key === 'Enter' || key === ' ') {
      e.preventDefault();
      toggleOpen();
    }
  }, [toggleOpen]);

  const elements: unknown[] = [
    createElement('div', {
      onClick: toggleOpen,
      onKeyDown: handleTriggerKeyDown,
      role: 'button',
      tabIndex: 0,
      style: { display: 'inline-block' },
    }, trigger),
  ];

  if (isOpen) {
    elements.push(
      createElement('div', { style: popoverStyle }, ...popoverChildren),
    );
  }

  return createElement(
    'div',
    { ref: containerRef, style: containerStyle },
    ...elements,
  );
}
