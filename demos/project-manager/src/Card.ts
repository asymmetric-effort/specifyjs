// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Card.ts -- Individual sticky note card component for the project board.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef } from 'specifyjs/hooks';
import type { ProjectCard } from './types';

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

export interface CardProps {
  card: ProjectCard;
  selected: boolean;
  onSelect: (cardId: string) => void;
  onMove: (cardId: string, position: { x: number; y: number }) => void;
  onResize: (cardId: string, size: { width: number; height: number }) => void;
  onDelete: (cardId: string) => void;
  onDoubleClick: (cardId: string) => void;
  onDragStart?: (cardId: string, e: Event) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Card(props: CardProps) {
  const { card, selected, onSelect, onMove, onResize, onDelete, onDoubleClick, onDragStart } = props;
  const [hovered, setHovered] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cardX: number; cardY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);
  const cardRef = useRef<HTMLElement | null>(null);

  const priorityColor = card.priority ? PRIORITY_COLORS[card.priority] || '#94a3b8' : 'transparent';

  // -----------------------------------------------------------------------
  // Card body drag
  // -----------------------------------------------------------------------

  const handleMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    // Don't start drag if clicking delete button or resize handle
    const target = me.target as HTMLElement;
    if (target.dataset && (target.dataset.role === 'delete' || target.dataset.role === 'resize')) return;

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

  return createElement('div', {
    ref: cardRef,
    className: 'board-card',
    style: cardStyle,
    onMouseDown: handleMouseDown,
    onDblClick: handleDoubleClick,
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
  );
}
