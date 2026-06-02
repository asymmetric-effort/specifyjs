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

export const PRIORITY_COLORS: Record<string, string> = {
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

export const CONTEXT_MENU_COLORS = CARD_COLORS;

export const PRIORITY_OPTIONS: Array<{ label: string; value: 'low' | 'medium' | 'high' | 'critical' }> = [
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
  onUpdate?: (cardId: string, updates: { title?: string; description?: string }) => void;
  onDragStart?: (cardId: string, e: Event) => void;
  onDuplicate?: (cardId: string) => void;
  onChangeColor?: (cardId: string, color: string) => void;
  onChangePriority?: (cardId: string, priority: 'low' | 'medium' | 'high' | 'critical') => void;
  onAnchorDragStart?: (cardId: string, anchor: string, x: number, y: number) => void;
  onCardContextMenu?: (cardId: string, pos: { x: number; y: number }) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card(props: CardProps) {
  const {
    card, selected, onSelect, onMove, onResize, onDelete, onDoubleClick, onUpdate,
    onDragStart, onDuplicate, onChangeColor, onChangePriority, onAnchorDragStart,
    onCardContextMenu,
  } = props;
  const [hovered, setHovered] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cardX: number; cardY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);
  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const descTextareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    if (onCardContextMenu) {
      onCardContextMenu(card.id, { x: me.clientX, y: me.clientY });
    }
  }, [card.id, onCardContextMenu]);

  // -----------------------------------------------------------------------
  // Inline editing: focus inputs when editing state changes
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      const input = titleInputRef.current;
      input.focus();
      // Place cursor at end so existing text remains visible
      const len = input.value.length;
      input.setSelectionRange(len, len);
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingDescription && descTextareaRef.current) {
      const textarea = descTextareaRef.current;
      textarea.focus();
      // Place cursor at end so existing text remains visible
      const len = textarea.value.length;
      textarea.setSelectionRange(len, len);
    }
  }, [editingDescription]);

  const handleTitleDoubleClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingTitle(true);
  }, []);

  const handleTitleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter') {
      ke.preventDefault();
      const input = ke.target as HTMLInputElement;
      const newTitle = input.value.trim();
      if (newTitle && newTitle !== card.title && onUpdate) {
        onUpdate(card.id, { title: newTitle });
      }
      setEditingTitle(false);
    } else if (ke.key === 'Escape') {
      ke.preventDefault();
      setEditingTitle(false);
    }
  }, [card.id, card.title, onUpdate]);

  const handleTitleBlur = useCallback((e: Event) => {
    const input = e.target as HTMLInputElement;
    const newTitle = input.value.trim();
    if (newTitle && newTitle !== card.title && onUpdate) {
      onUpdate(card.id, { title: newTitle });
    }
    setEditingTitle(false);
  }, [card.id, card.title, onUpdate]);

  const handleDescriptionClick = useCallback((e: Event) => {
    e.stopPropagation();
    setEditingDescription(true);
  }, []);

  const handleDescriptionKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Escape') {
      ke.preventDefault();
      const textarea = ke.target as HTMLTextAreaElement;
      const newDesc = textarea.value;
      if (newDesc !== card.description && onUpdate) {
        onUpdate(card.id, { description: newDesc });
      }
      setEditingDescription(false);
    }
  }, [card.id, card.description, onUpdate]);

  const handleDescriptionBlur = useCallback((e: Event) => {
    const textarea = e.target as HTMLTextAreaElement;
    const newDesc = textarea.value;
    if (newDesc !== card.description && onUpdate) {
      onUpdate(card.id, { description: newDesc });
    }
    setEditingDescription(false);
  }, [card.id, card.description, onUpdate]);

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
    if (target.dataset && (target.dataset.role === 'delete' || target.dataset.role === 'resize' || target.dataset.role === 'anchor' || target.dataset.role === 'drag-handle' || target.dataset.role === 'inline-edit')) return;

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
    // No longer opens modal — inline editing handles title/description edits directly
  }, []);

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
    editingTitle
      ? createElement('input', {
          ref: titleInputRef,
          type: 'text',
          defaultValue: card.title || '',
          style: {
            ...titleStyle,
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            padding: '0',
            margin: '0',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
          },
          'data-role': 'inline-edit',
          'data-testid': `card-title-input-${card.id}`,
          onKeyDown: handleTitleKeyDown,
          onBlur: handleTitleBlur,
          onMouseDown: (e: Event) => e.stopPropagation(),
        })
      : createElement('div', {
          style: titleStyle,
          onDblClick: handleTitleDoubleClick,
          'data-testid': `card-title-${card.id}`,
        }, card.title || 'Untitled'),
    editingDescription
      ? createElement('textarea', {
          ref: descTextareaRef,
          defaultValue: card.description || '',
          style: {
            ...descStyle,
            width: '100%',
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            padding: '0',
            margin: '0',
            fontFamily: 'inherit',
            resize: 'none',
            boxSizing: 'border-box',
          },
          'data-role': 'inline-edit',
          'data-testid': `card-desc-input-${card.id}`,
          onKeyDown: handleDescriptionKeyDown,
          onBlur: handleDescriptionBlur,
          onMouseDown: (e: Event) => e.stopPropagation(),
        })
      : createElement('div', {
          style: descStyle,
          onClick: handleDescriptionClick,
          'data-testid': `card-desc-${card.id}`,
        }, card.description || ''),
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
  );
}
