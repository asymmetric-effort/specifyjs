// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Dock -- Application launcher bar component.
 *
 * A configurable vertical or horizontal icon bar that displays application
 * launchers with active/running indicators, badges, tooltips, and
 * click-to-open behavior. Inspired by the Ubuntu Unity launcher and macOS dock.
 */

import { createElement, type SpecNode } from '../../../../core/src/index';
import { useState, useCallback, useRef } from '../../../../core/src/hooks/index';

// -- Types ------------------------------------------------------------------

export interface DockItem {
  /** Unique identifier for this dock entry */
  id: string;
  /** Icon source -- URL to an image/SVG, or an emoji/text character */
  icon: string;
  /** Tooltip label shown on hover */
  label: string;
  /** Whether this item's application is currently running/open. Displays a dot indicator. Default: false */
  active?: boolean;
  /** Optional badge count (e.g., unread messages). Renders a small number badge on the icon. */
  badge?: number;
  /** Whether this icon is disabled (greyed out, non-clickable). Default: false */
  disabled?: boolean;
}

export interface DockProps {
  /** The dock items to display */
  items: DockItem[];
  /** Orientation of the dock. Default: 'vertical' */
  orientation?: 'vertical' | 'horizontal';
  /** Position on the screen edge. Default: 'left' */
  position?: 'left' | 'right' | 'top' | 'bottom';
  /** Icon size in pixels. Default: 36 */
  iconSize?: number;
  /** Whether to auto-hide the dock (slides out on hover, hidden otherwise). Default: false */
  autoHide?: boolean;
  /** Whether to show a separator before the last item (e.g., "Show Applications" grid button). Default: false */
  showTrailingSeparator?: boolean;
  /** Called when a dock item is clicked */
  onItemClick?: (id: string) => void;
  /** Called when a dock item is right-clicked (for context menu integration) */
  onItemContextMenu?: (id: string, event: { x: number; y: number }) => void;
  /** Extra children rendered at the bottom/end of the dock (e.g., a "Show Applications" button) */
  children?: unknown;
}

// -- Helpers ----------------------------------------------------------------

function isImageUrl(icon: string): boolean {
  return icon.startsWith('http') || icon.startsWith('/') || icon.startsWith('.');
}

function formatBadge(badge: number): string {
  return badge > 99 ? '99+' : String(badge);
}

function buildAriaLabel(item: DockItem): string {
  if (item.badge && item.badge > 0) {
    return `${item.label}, ${item.badge} unread`;
  }
  return item.label;
}

// -- Tooltip position helpers -----------------------------------------------

function getTooltipPosition(position: string): Record<string, string> {
  switch (position) {
    case 'left':
      return {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
      };
    case 'right':
      return {
        right: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginRight: '8px',
      };
    case 'top':
      return {
        top: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginTop: '8px',
      };
    case 'bottom':
      return {
        bottom: '100%',
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: '8px',
      };
    default:
      return {
        left: '100%',
        top: '50%',
        transform: 'translateY(-50%)',
        marginLeft: '8px',
      };
  }
}

// -- Active dot position helpers --------------------------------------------

function getActiveDotPosition(
  position: string,
  orientation: string,
): Record<string, string> {
  if (orientation === 'vertical') {
    if (position === 'right') {
      return { position: 'absolute', right: '0', top: '50%', transform: 'translateY(-50%)' };
    }
    // left (default for vertical)
    return { position: 'absolute', left: '0', top: '50%', transform: 'translateY(-50%)' };
  }
  // horizontal
  if (position === 'bottom') {
    return { position: 'absolute', top: '0', left: '50%', transform: 'translateX(-50%)' };
  }
  // top (default for horizontal)
  return { position: 'absolute', bottom: '0', left: '50%', transform: 'translateX(-50%)' };
}

// -- DockItemComponent ------------------------------------------------------

function DockItemComponent(props: {
  item: DockItem;
  iconSize: number;
  position: string;
  orientation: string;
  onItemClick?: (id: string) => void;
  onItemContextMenu?: (id: string, event: { x: number; y: number }) => void;
}): SpecNode {
  const { item, iconSize, position, orientation, onItemClick, onItemContextMenu } = props;
  const [hover, setHover] = useState(false);
  const disabled = item.disabled ?? false;

  const handleMouseEnter = useCallback(() => {
    if (!disabled) setHover(true);
  }, [disabled]);

  const handleMouseLeave = useCallback(() => {
    setHover(false);
  }, []);

  const handleClick = useCallback(() => {
    if (!disabled && onItemClick) {
      onItemClick(item.id);
    }
  }, [disabled, onItemClick, item.id]);

  const handleContextMenu = useCallback((e: Event) => {
    if (!disabled && onItemContextMenu) {
      const me = e as MouseEvent;
      me.preventDefault();
      onItemContextMenu(item.id, { x: me.clientX, y: me.clientY });
    }
  }, [disabled, onItemContextMenu, item.id]);

  const sizeStr = `${iconSize}px`;

  // Icon element
  const iconEl = isImageUrl(item.icon)
    ? createElement('img', {
        src: item.icon,
        alt: item.label,
        style: {
          width: sizeStr,
          height: sizeStr,
          objectFit: 'contain',
          display: 'block',
        },
      })
    : createElement('span', {
        style: {
          width: sizeStr,
          height: sizeStr,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${Math.round(iconSize * 0.6)}px`,
          userSelect: 'none',
        },
        'aria-hidden': 'true',
      }, item.icon);

  // Badge
  const badgeEl = (item.badge != null && item.badge > 0)
    ? createElement('span', {
        style: {
          position: 'absolute',
          top: '0',
          right: '0',
          backgroundColor: 'var(--dock-badge-bg, #e74c3c)',
          color: '#ffffff',
          fontSize: '9px',
          fontWeight: '700',
          lineHeight: '1',
          minWidth: '14px',
          height: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '7px',
          padding: '0 3px',
          pointerEvents: 'none',
          zIndex: '2',
        },
        'aria-hidden': 'true',
      }, formatBadge(item.badge))
    : null;

  // Active dot
  const activeDotEl = item.active
    ? createElement('span', {
        style: {
          ...getActiveDotPosition(position, orientation),
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: 'var(--dock-active-color, #ffffff)',
          pointerEvents: 'none',
          zIndex: '2',
        },
        'aria-hidden': 'true',
      })
    : null;

  // Tooltip
  const tooltipEl = hover
    ? createElement('div', {
        role: 'tooltip',
        style: {
          position: 'absolute',
          ...getTooltipPosition(position),
          padding: '4px 10px',
          backgroundColor: '#1f2937',
          color: '#ffffff',
          fontSize: '12px',
          borderRadius: '4px',
          whiteSpace: 'nowrap',
          zIndex: '1000',
          pointerEvents: 'none',
        },
      }, item.label)
    : null;

  // Button style
  const buttonStyle: Record<string, string> = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: disabled ? 'default' : 'pointer',
    opacity: disabled ? '0.4' : '1',
    pointerEvents: disabled ? 'none' : 'auto',
    transition: 'transform 100ms, background-color 100ms',
    borderRadius: '8px',
    outline: 'none',
    ...(hover && !disabled ? { transform: 'scale(1.1)', backgroundColor: 'rgba(255,255,255,0.15)' } : {}),
  };

  return createElement(
    'button',
    {
      type: 'button',
      role: 'button',
      style: buttonStyle,
      'aria-label': buildAriaLabel(item),
      'aria-pressed': item.active ? 'true' : 'false',
      'aria-disabled': disabled ? 'true' : undefined,
      tabIndex: disabled ? -1 : 0,
      onClick: handleClick,
      onContextMenu: handleContextMenu,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      'data-dock-item-id': item.id,
    },
    iconEl,
    badgeEl,
    activeDotEl,
    tooltipEl,
  );
}

// -- Main component ---------------------------------------------------------

export function Dock(props: DockProps): SpecNode {
  const {
    items,
    orientation = 'vertical',
    position = 'left',
    iconSize = 36,
    autoHide = false,
    showTrailingSeparator = false,
    onItemClick,
    onItemContextMenu,
    children,
  } = props;

  const [visible, setVisible] = useState(!autoHide);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (autoHide) {
      if (hideTimerRef.current != null) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
      setVisible(true);
    }
  }, [autoHide]);

  const handleMouseLeave = useCallback(() => {
    if (autoHide) {
      hideTimerRef.current = setTimeout(() => {
        setVisible(false);
      }, 300);
    }
  }, [autoHide]);

  const handleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    const target = ke.target as HTMLElement;
    const container = target.closest('[role="toolbar"]');
    if (!container) return;

    const buttons = Array.from(
      container.querySelectorAll('button[data-dock-item-id]'),
    ) as HTMLElement[];
    const idx = buttons.indexOf(target);
    if (idx < 0) return;

    const isVert = orientation === 'vertical';
    const nextKey = isVert ? 'ArrowDown' : 'ArrowRight';
    const prevKey = isVert ? 'ArrowUp' : 'ArrowLeft';

    if (ke.key === nextKey) {
      ke.preventDefault();
      const next = buttons[idx + 1];
      if (next) next.focus();
    } else if (ke.key === prevKey) {
      ke.preventDefault();
      const prev = buttons[idx - 1];
      if (prev) prev.focus();
    } else if (ke.key === 'Home') {
      ke.preventDefault();
      buttons[0]?.focus();
    } else if (ke.key === 'End') {
      ke.preventDefault();
      buttons[buttons.length - 1]?.focus();
    } else if (ke.key === 'Enter' || ke.key === ' ') {
      ke.preventDefault();
      target.click();
    }
  }, [orientation]);

  // Container styles
  const isVertical = orientation === 'vertical';

  const containerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    alignItems: 'center',
    gap: '2px',
    padding: '4px',
    backgroundColor: 'var(--dock-bg, rgba(0, 0, 0, 0.7))',
    border: '1px solid var(--dock-border, rgba(255, 255, 255, 0.1))',
    borderRadius: '8px',
    boxSizing: 'border-box',
    position: 'relative',
    transition: 'transform 200ms ease, opacity 200ms ease',
  };

  // Auto-hide: collapsed state
  if (autoHide && !visible) {
    if (position === 'left') {
      containerStyle.transform = 'translateX(-100%)';
      containerStyle.opacity = '0';
    } else if (position === 'right') {
      containerStyle.transform = 'translateX(100%)';
      containerStyle.opacity = '0';
    } else if (position === 'top') {
      containerStyle.transform = 'translateY(-100%)';
      containerStyle.opacity = '0';
    } else if (position === 'bottom') {
      containerStyle.transform = 'translateY(100%)';
      containerStyle.opacity = '0';
    }
  }

  // Build item elements
  const itemEls: SpecNode[] = [];
  for (let i = 0; i < items.length; i++) {
    // Insert trailing separator before last item
    if (showTrailingSeparator && i === items.length - 1 && items.length > 1) {
      const sepStyle: Record<string, string> = isVertical
        ? { width: '60%', height: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: '4px auto', flexShrink: '0' }
        : { height: '60%', width: '1px', backgroundColor: 'rgba(255,255,255,0.2)', margin: 'auto 4px', flexShrink: '0' };
      itemEls.push(createElement('div', {
        key: `sep-${i}`,
        style: sepStyle,
        'aria-hidden': 'true',
        role: 'separator',
      }));
    }

    itemEls.push(
      createElement(DockItemComponent as unknown as (props: Record<string, unknown>) => SpecNode, {
        key: items[i].id,
        item: items[i],
        iconSize,
        position,
        orientation,
        onItemClick,
        onItemContextMenu,
      }),
    );
  }

  // Auto-hide trigger strip
  const triggerStrip = autoHide && !visible
    ? createElement('div', {
        style: {
          position: 'absolute',
          ...(position === 'left' ? { left: '0', top: '0', width: '4px', height: '100%' } : {}),
          ...(position === 'right' ? { right: '0', top: '0', width: '4px', height: '100%' } : {}),
          ...(position === 'top' ? { top: '0', left: '0', height: '4px', width: '100%' } : {}),
          ...(position === 'bottom' ? { bottom: '0', left: '0', height: '4px', width: '100%' } : {}),
          zIndex: '10',
        },
        'aria-hidden': 'true',
      })
    : null;

  return createElement(
    'div',
    {
      role: 'toolbar',
      'aria-label': 'Application launcher',
      'aria-orientation': orientation,
      style: containerStyle,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
      onKeyDown: handleKeyDown,
    },
    triggerStrip,
    ...itemEls,
    children != null ? children : null,
  );
}
