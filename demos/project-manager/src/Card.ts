// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Card.ts -- Individual sticky note card component for the project board.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import { useDraggable } from '../../../components/layout/app-drag-drop/src/index';
import type { ProjectCard } from './types';
import { CARD_COLORS } from './Toolbar';

// ---------------------------------------------------------------------------
// Priority colors
// ---------------------------------------------------------------------------

const PRIORITY_COLORS: Record<string, string> = {
  low: '#22c55e',
  medium: '#f59e0b',
  high: '#f97316',
  critical: '#ef4444',
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Context menu color options
// ---------------------------------------------------------------------------

const CONTEXT_MENU_COLORS = CARD_COLORS;

const PRIORITY_OPTIONS: Array<{ label: string; value: 'low' | 'medium' | 'high' | 'critical' }> = [
  { label: 'Low', value: 'low' },
  { label: 'Medium', value: 'medium' },
  { label: 'High', value: 'high' },
  { label: 'Critical', value: 'critical' },
];

export interface CardProps {
  card: ProjectCard;
  selected: boolean;
  onSelect: (cardId: string) => void;
  onMove: (cardId: string, position: { x: number; y: number }) => void;
  onResize: (cardId: string, size: { width: number; height: number }) => void;
  onDelete: (cardId: string) => void;
  onDoubleClick: (cardId: string) => void;
  onDragStart?: (cardId: string, e: Event) => void;
  onDuplicate?: (cardId: string) => void;
  onChangeColor?: (cardId: string, color: string) => void;
  onChangePriority?: (cardId: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onAnchorDragStart?: (cardId: string, anchor: string, x: number, y: number) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card(props: CardProps) {
  const {
    card, selected, onSelect, onMove, onResize, onDelete, onDoubleClick, onDragStart,
    onDuplicate, onChangeColor, onChangePriority, onAnchorDragStart,
  } = props;
  const [hovered, setHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [colorSubmenuOpen, setColorSubmenuOpen] = useState(false);
  const [prioritySubmenuOpen, setPrioritySubmenuOpen] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cardX: number; cardY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const contextMenuRef = useRef<HTMLElement | null>(null);

  const priorityColor = card.priority ? PRIORITY_COLORS[card.priority] || '#94a3b8' : 'transparent';

  // -----------------------------------------------------------------------
  // Inter-app draggable (export drag handle)
  // -----------------------------------------------------------------------

  const { onMouseDown: onDragHandleMouseDown, isDragging: isExportDragging } = useDraggable(
    'application/project-card',
    { id: card.id, title: card.title, description: card.description, color: card.color },
  );

  // -----------------------------------------------------------------------
  // Context menu
  // -----------------------------------------------------------------------

  const handleContextMenu = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    setContextMenu({ x: me.clientX, y: me.clientY });
    setColorSubmenuOpen(false);
    setPrioritySubmenuOpen(false);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setColorSubmenuOpen(false);
    setPrioritySubmenuOpen(false);
  }, []);

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return;
    const handleClick = () => {
      closeContextMenu();
    };
    // Delay to avoid closing immediately on the same click
    const timer = setTimeout(() => {
      document.addEventListener('click', handleClick);
      document.addEventListener('contextmenu', handleClick);
    }, 0);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('click', handleClick);
      document.removeEventListener('contextmenu', handleClick);
    };
  }, [contextMenu, closeContextMenu]);

  const handleDuplicateClick = useCallback((e: Event) => {
    e.stopPropagation();
    closeContextMenu();
    if (onDuplicate) onDuplicate(card.id);
  }, [card.id, onDuplicate, closeContextMenu]);

  const handleContextDeleteClick = useCallback((e: Event) => {
    e.stopPropagation();
    closeContextMenu();
    onDelete(card.id);
  }, [card.id, onDelete, closeContextMenu]);

  const handleColorMenuEnter = useCallback(() => {
    setColorSubmenuOpen(true);
    setPrioritySubmenuOpen(false);
  }, []);

  const handlePriorityMenuEnter = useCallback(() => {
    setPrioritySubmenuOpen(true);
    setColorSubmenuOpen(false);
  }, []);

  const handleColorSelect = useCallback((color: string) => {
    closeContextMenu();
    if (onChangeColor) onChangeColor(card.id, color);
  }, [card.id, onChangeColor, closeContextMenu]);

  const handlePrioritySelect = useCallback((priority: 'low' | 'medium' | 'high' | 'critical') => {
    closeContextMenu();
    if (onChangePriority) onChangePriority(card.id, priority);
  }, [card.id, onChangePriority, closeContextMenu]);

  // -----------------------------------------------------------------------
  // Anchor drag (for connection creation)
  // -----------------------------------------------------------------------

  const handleAnchorMouseDown = useCallback((anchor: string, e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    if (onAnchorDragStart) {
      // Compute anchor position in canvas coords
      const cx = card.position.x + card.size.width / 2;
      const cy = card.position.y + card.size.height / 2;
      let ax = cx;
      let ay = cy;
      if (anchor === 'top') { ax = cx; ay = card.position.y; }
      else if (anchor === 'bottom') { ax = cx; ay = card.position.y + card.size.height; }
      else if (anchor === 'left') { ax = card.position.x; ay = cy; }
      else if (anchor === 'right') { ax = card.position.x + card.size.width; ay = cy; }
      onAnchorDragStart(card.id, anchor, ax, ay);
    }
  }, [card.id, card.position, card.size, onAnchorDragStart]);

  // -----------------------------------------------------------------------
  // Card body drag
  // -----------------------------------------------------------------------

  const handleMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    // Don't start drag if clicking delete button or resize handle
    const target = me.target as HTMLElement;
    if (target.dataset && (target.dataset.role === 'delete' || target.dataset.role === 'resize' || target.dataset.role === 'anchor' || target.dataset.role === 'drag-handle')) return;

    me.preventDefault();
    me.stopPropagation();
    onSelect(card.id);

    dragStartRef.current = {
      x: me.clientX,
      y: me.clientY,
      cardX: card.position.x,
      cardY: card.position.y,
    };

    const handleMouseMove = (ev: Event) => {
      const mev = ev as MouseEvent;
      if (!dragStartRef.current) return;
      const dx = mev.clientX - dragStartRef.current.x;
      const dy = mev.clientY - dragStartRef.current.y;
      onMove(card.id, {
        x: dragStartRef.current.cardX + dx,
        y: dragStartRef.current.cardY + dy,
      });
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    // Notify drag-drop system if handler provided
    if (onDragStart) {
      onDragStart(card.id, e);
    }
  }, [card.id, card.position.x, card.position.y, onSelect, onMove, onDragStart]);

  // -----------------------------------------------------------------------
  // Resize handle drag
  // -----------------------------------------------------------------------

  const handleResizeMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();

    resizeStartRef.current = {
      x: me.clientX,
      y: me.clientY,
      w: card.size.width,
      h: card.size.height,
    };

    const handleMouseMove = (ev: Event) => {
      const mev = ev as MouseEvent;
      if (!resizeStartRef.current) return;
      const dx = mev.clientX - resizeStartRef.current.x;
      const dy = mev.clientY - resizeStartRef.current.y;
      const newW = Math.max(120, resizeStartRef.current.w + dx);
      const newH = Math.max(80, resizeStartRef.current.h + dy);
      onResize(card.id, { width: newW, height: newH });
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [card.id, card.size.width, card.size.height, onResize]);

  const handleDoubleClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    onDoubleClick(card.id);
  }, [card.id, onDoubleClick]);

  const handleDeleteClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    onDelete(card.id);
  }, [card.id, onDelete]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const cardStyle: Record<string, string> = {
    position: 'absolute',
    left: `${card.position.x}px`,
    top: `${card.position.y}px`,
    width: `${card.size.width}px`,
    height: `${card.size.height}px`,
    backgroundColor: card.color || '#fef9c3',
    borderRadius: '6px',
    borderLeft: `4px solid ${priorityColor}`,
    boxShadow: selected
      ? '0 0 0 2px #3b82f6, 0 4px 12px rgba(0,0,0,0.15)'
      : '0 2px 8px rgba(0,0,0,0.1)',
    cursor: 'grab',
    userSelect: 'none',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    padding: '8px 10px',
    boxSizing: 'border-box',
    transition: 'box-shadow 150ms ease',
  };

  const titleStyle: Record<string, string> = {
    fontWeight: '600',
    fontSize: '14px',
    color: '#1a1a1a',
    marginBottom: '4px',
    lineHeight: '1.3',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  };

  const descStyle: Record<string, string> = {
    fontSize: '12px',
    color: '#555555',
    lineHeight: '1.4',
    overflow: 'hidden',
    flex: '1',
  };

  const deleteStyle: Record<string, string> = {
    position: 'absolute',
    top: '4px',
    right: '4px',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    backgroundColor: 'rgba(0,0,0,0.15)',
    color: '#333',
    fontSize: '12px',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'pointer',
    display: hovered ? 'block' : 'none',
    border: 'none',
    padding: '0',
  };

  const resizeStyle: Record<string, string> = {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '12px',
    height: '12px',
    cursor: 'nwse-resize',
    opacity: '0.4',
    background: 'linear-gradient(135deg, transparent 50%, #666 50%)',
  };

  // Tags
  const tagsEl = card.tags && card.tags.length > 0
    ? createElement('div', {
        style: {
          display: 'flex',
          gap: '4px',
          flexWrap: 'wrap',
          marginTop: '4px',
        },
      },
        ...card.tags.map((tag: string, i: number) =>
          createElement('span', {
            key: String(i),
            style: {
              fontSize: '10px',
              padding: '1px 4px',
              borderRadius: '3px',
              backgroundColor: 'rgba(0,0,0,0.08)',
              color: '#444',
            },
          }, tag),
        ),
      )
    : null;

  // -----------------------------------------------------------------------
  // Assignee display
  // -----------------------------------------------------------------------

  const assigneeEl = card.assignee
    ? createElement('div', {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '4px',
          fontSize: '10px',
          color: '#555',
        },
        'data-testid': `card-assignee-${card.id}`,
      },
        createElement('span', {
          style: {
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#3b82f6',
            color: '#fff',
            fontSize: '9px',
            fontWeight: '700',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: '0',
          },
        }, card.assignee.charAt(0).toUpperCase()),
        createElement('span', {}, card.assignee),
      )
    : null;

  // -----------------------------------------------------------------------
  // Export drag handle style
  // -----------------------------------------------------------------------

  const dragHandleStyle: Record<string, string> = {
    position: 'absolute',
    top: '4px',
    right: '24px',
    width: '18px',
    height: '18px',
    borderRadius: '3px',
    backgroundColor: isExportDragging ? 'rgba(59,130,246,0.4)' : 'rgba(0,0,0,0.1)',
    color: '#333',
    fontSize: '10px',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'grab',
    display: hovered ? 'block' : 'none',
    border: 'none',
    padding: '0',
  };

  // -----------------------------------------------------------------------
  // Anchor styles (connection creation points)
  // -----------------------------------------------------------------------

  const anchorBaseStyle: Record<string, string> = {
    position: 'absolute',
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid #ffffff',
    cursor: 'crosshair',
    display: hovered ? 'block' : 'none',
    zIndex: '10',
    boxSizing: 'border-box',
  };

  const anchorTop: Record<string, string> = { ...anchorBaseStyle, top: '-5px', left: '50%', transform: 'translateX(-50%)' };
  const anchorRight: Record<string, string> = { ...anchorBaseStyle, top: '50%', right: '-5px', transform: 'translateY(-50%)' };
  const anchorBottom: Record<string, string> = { ...anchorBaseStyle, bottom: '-5px', left: '50%', transform: 'translateX(-50%)' };
  const anchorLeft: Record<string, string> = { ...anchorBaseStyle, top: '50%', left: '-5px', transform: 'translateY(-50%)' };

  // -----------------------------------------------------------------------
  // Context menu rendering
  // -----------------------------------------------------------------------

  const contextMenuStyle: Record<string, string> = {
    position: 'fixed',
    left: contextMenu ? `${contextMenu.x}px` : '0',
    top: contextMenu ? `${contextMenu.y}px` : '0',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    padding: '4px 0',
    zIndex: '10000',
    minWidth: '160px',
    fontSize: '13px',
    color: '#1a1a1a',
  };

  const menuItemStyle: Record<string, string> = {
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
  };

  const submenuContainerStyle: Record<string, string> = {
    position: 'absolute',
    left: '100%',
    top: '0',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    padding: '4px 0',
    minWidth: '120px',
  };

  const contextMenuEl = contextMenu ? createElement('div', {
    ref: contextMenuRef,
    className: 'card-context-menu',
    style: contextMenuStyle,
    'data-testid': `context-menu-${card.id}`,
    role: 'menu',
    'aria-label': 'Card context menu',
  },
    // Duplicate
    createElement('div', {
      style: menuItemStyle,
      onClick: handleDuplicateClick,
      role: 'menuitem',
      'data-testid': `context-menu-duplicate-${card.id}`,
    }, 'Duplicate'),
    // Delete
    createElement('div', {
      style: menuItemStyle,
      onClick: handleContextDeleteClick,
      role: 'menuitem',
      'data-testid': `context-menu-delete-${card.id}`,
    }, 'Delete'),
    // Change Color submenu
    createElement('div', {
      style: { ...menuItemStyle, position: 'relative' as string },
      onMouseEnter: handleColorMenuEnter,
      role: 'menuitem',
      'aria-haspopup': 'true',
      'data-testid': `context-menu-color-${card.id}`,
    },
      'Change Color',
      createElement('span', { style: { marginLeft: '8px' } }, '\u25B6'),
      colorSubmenuOpen ? createElement('div', {
        style: submenuContainerStyle,
        role: 'menu',
        'data-testid': `context-submenu-color-${card.id}`,
      },
        ...CONTEXT_MENU_COLORS.map((color: string) =>
          createElement('div', {
            key: color,
            style: {
              ...menuItemStyle,
              gap: '8px',
            },
            onClick: (e: Event) => { e.stopPropagation(); handleColorSelect(color); },
            role: 'menuitem',
            'data-testid': `context-color-${color}`,
          },
            createElement('span', {
              style: {
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                backgroundColor: color,
                border: '1px solid rgba(0,0,0,0.15)',
                display: 'inline-block',
                flexShrink: '0',
              },
            }),
            color === card.color ? '\u2713' : '',
          ),
        ),
      ) : null,
    ),
    // Set Priority submenu
    createElement('div', {
      style: { ...menuItemStyle, position: 'relative' as string },
      onMouseEnter: handlePriorityMenuEnter,
      role: 'menuitem',
      'aria-haspopup': 'true',
      'data-testid': `context-menu-priority-${card.id}`,
    },
      'Set Priority',
      createElement('span', { style: { marginLeft: '8px' } }, '\u25B6'),
      prioritySubmenuOpen ? createElement('div', {
        style: submenuContainerStyle,
        role: 'menu',
        'data-testid': `context-submenu-priority-${card.id}`,
      },
        ...PRIORITY_OPTIONS.map((opt: { label: string; value: string }) =>
          createElement('div', {
            key: opt.value,
            style: {
              ...menuItemStyle,
              gap: '8px',
            },
            onClick: (e: Event) => { e.stopPropagation(); handlePrioritySelect(opt.value as 'low' | 'medium' | 'high' | 'critical'); },
            role: 'menuitem',
            'data-testid': `context-priority-${opt.value}`,
          },
            createElement('span', {
              style: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                backgroundColor: PRIORITY_COLORS[opt.value] || '#94a3b8',
                display: 'inline-block',
                flexShrink: '0',
              },
            }),
            opt.label,
            opt.value === card.priority ? ' \u2713' : '',
          ),
        ),
      ) : null,
    ),
  ) : null;

  return createElement('div', {
    ref: cardRef,
    className: 'board-card',
    style: cardStyle,
    onMouseDown: handleMouseDown,
    onDblClick: handleDoubleClick,
    onContextMenu: handleContextMenu,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
    'data-card-id': card.id,
    'data-testid': `card-${card.id}`,
    role: 'button',
    'aria-label': `Card: ${card.title}`,
    tabIndex: 0,
  },
    createElement('div', { style: titleStyle }, card.title || 'Untitled'),
    createElement('div', { style: descStyle }, card.description || ''),
    tagsEl,
    assigneeEl,
    createElement('div', {
      style: dragHandleStyle,
      'data-role': 'drag-handle',
      'data-testid': `card-drag-handle-${card.id}`,
      onMouseDown: (e: Event) => { e.stopPropagation(); onDragHandleMouseDown(e); },
      'aria-label': `Export drag handle for ${card.title}`,
      title: 'Drag to export card',
    }, '\u2630'),
    createElement('button', {
      style: deleteStyle,
      'data-role': 'delete',
      'data-testid': `card-delete-${card.id}`,
      onClick: handleDeleteClick,
      'aria-label': `Delete ${card.title}`,
      tabIndex: -1,
    }, '\u00D7'),
    createElement('div', {
      style: resizeStyle,
      'data-role': 'resize',
      onMouseDown: handleResizeMouseDown,
      'aria-label': 'Resize card',
    }),
    // Anchor circles for connection creation
    createElement('div', {
      style: anchorTop,
      'data-role': 'anchor',
      'data-anchor': 'top',
      'data-testid': `anchor-top-${card.id}`,
      onMouseDown: (e: Event) => handleAnchorMouseDown('top', e),
      'aria-label': 'Connection anchor top',
    }),
    createElement('div', {
      style: anchorRight,
      'data-role': 'anchor',
      'data-anchor': 'right',
      'data-testid': `anchor-right-${card.id}`,
      onMouseDown: (e: Event) => handleAnchorMouseDown('right', e),
      'aria-label': 'Connection anchor right',
    }),
    createElement('div', {
      style: anchorBottom,
      'data-role': 'anchor',
      'data-anchor': 'bottom',
      'data-testid': `anchor-bottom-${card.id}`,
      onMouseDown: (e: Event) => handleAnchorMouseDown('bottom', e),
      'aria-label': 'Connection anchor bottom',
    }),
    createElement('div', {
      style: anchorLeft,
      'data-role': 'anchor',
      'data-anchor': 'left',
      'data-testid': `anchor-left-${card.id}`,
      onMouseDown: (e: Event) => handleAnchorMouseDown('left', e),
      'aria-label': 'Connection anchor left',
    }),
    contextMenuEl,
  );
}
