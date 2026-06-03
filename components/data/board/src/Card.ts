// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Card.ts -- Typed card renderer for the Board component.
 * Supports text, json, task, and project card types.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef } from '../../../../core/src/hooks/index';
import type { Card, TextContent, ProjectContent, CardType } from './types';
import type { BoardAction } from './BoardReducer';

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
// Card type labels
// ---------------------------------------------------------------------------

export const CARD_TYPE_OPTIONS: Array<{ label: string; value: CardType }> = [
  { label: 'Text', value: 'text' },
  { label: 'JSON', value: 'json' },
  { label: 'Task', value: 'task' },
  { label: 'Project', value: 'project' },
];

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface CardComponentProps {
  card: Card;
  selected?: boolean;
  onSelect?: (cardId: string) => void;
  onMove?: (cardId: string, position: { x: number; y: number }) => void;
  onResize?: (cardId: string, size: { width: number; height: number }) => void;
  onDelete?: (cardId: string) => void;
  dispatch?: (action: BoardAction) => void;
  onOpenProject?: (projectId: string) => void;
}

// ---------------------------------------------------------------------------
// Sub-renderers for each card type
// ---------------------------------------------------------------------------

function renderTextContent(card: Card): unknown {
  const content = card.content as TextContent;
  return createElement('div', {
    style: {
      fontSize: '12px',
      color: '#555555',
      lineHeight: '1.4',
      overflow: 'hidden',
      flex: '1',
    },
    'data-testid': `card-text-content-${card.card_id}`,
  }, content.text || '');
}

function renderJsonContent(card: Card): unknown {
  const content = card.content as Record<string, unknown>;
  const entries = Object.entries(content);
  const fields = entries.map(([key, value]: [string, unknown], i: number) =>
    createElement('div', {
      key: String(i),
      style: {
        display: 'flex',
        gap: '4px',
        fontSize: '11px',
        lineHeight: '1.6',
        borderBottom: '1px solid rgba(0,0,0,0.05)',
        padding: '2px 0',
      },
    },
      createElement('span', {
        style: { fontWeight: '600', color: '#374151', minWidth: '60px' },
      }, `${key}:`),
      createElement('span', {
        style: { color: '#555555' },
      }, String(value ?? '')),
    ),
  );

  return createElement('div', {
    style: { flex: '1', overflow: 'auto' },
    'data-testid': `card-json-content-${card.card_id}`,
  }, ...fields);
}

function renderTaskContent(card: Card): unknown {
  return createElement('div', {
    style: {
      fontSize: '12px',
      color: '#9ca3af',
      fontStyle: 'italic',
      flex: '1',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    'data-testid': `card-task-content-${card.card_id}`,
  }, 'Task card (coming soon)');
}

function renderProjectContent(card: Card, onOpenProject?: (projectId: string) => void): unknown {
  const content = card.content as ProjectContent;
  return createElement('div', {
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '4px 16px',
      borderRadius: '999px',
      backgroundColor: card.color || '#e0e7ff',
      fontSize: '13px',
      fontWeight: '600',
      color: '#1e3a5f',
      cursor: 'pointer',
      flex: '1',
    },
    onDblClick: (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      if (onOpenProject && content.project_id) {
        onOpenProject(content.project_id);
      }
    },
    'data-testid': `card-project-content-${card.card_id}`,
  }, content.project_name || 'Untitled Project');
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CardComponent(props: CardComponentProps) {
  const { card, selected = false, onSelect, onMove, onResize, onDelete, dispatch, onOpenProject } = props;
  const [hovered, setHovered] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [typeSubmenuOpen, setTypeSubmenuOpen] = useState(false);
  const dragStartRef = useRef<{ x: number; y: number; cardX: number; cardY: number } | null>(null);
  const resizeStartRef = useRef<{ x: number; y: number; w: number; h: number } | null>(null);

  const priorityColor = card.priority ? PRIORITY_COLORS[card.priority] || '#94a3b8' : 'transparent';

  // -----------------------------------------------------------------------
  // Context menu
  // -----------------------------------------------------------------------

  const handleContextMenu = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    setContextMenu({ x: me.clientX, y: me.clientY });
    setTypeSubmenuOpen(false);
  }, []);

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
    setTypeSubmenuOpen(false);
  }, []);

  // -----------------------------------------------------------------------
  // Drag (move card)
  // -----------------------------------------------------------------------

  const handleMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    const target = me.target as HTMLElement;
    if (target.dataset && (target.dataset.role === 'delete' || target.dataset.role === 'resize' || target.dataset.role === 'drag-handle')) return;

    me.preventDefault();
    me.stopPropagation();
    if (onSelect) onSelect(card.card_id);

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
      if (onMove) {
        onMove(card.card_id, {
          x: dragStartRef.current.cardX + dx,
          y: dragStartRef.current.cardY + dy,
        });
      }
    };

    const handleMouseUp = () => {
      dragStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [card.card_id, card.position.x, card.position.y, onSelect, onMove]);

  // -----------------------------------------------------------------------
  // Resize handle
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
      if (onResize) {
        onResize(card.card_id, { width: newW, height: newH });
      }
    };

    const handleMouseUp = () => {
      resizeStartRef.current = null;
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [card.card_id, card.size.width, card.size.height, onResize]);

  // -----------------------------------------------------------------------
  // Delete
  // -----------------------------------------------------------------------

  const handleDeleteClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) onDelete(card.card_id);
  }, [card.card_id, onDelete]);

  // -----------------------------------------------------------------------
  // Change type via context menu
  // -----------------------------------------------------------------------

  const handleChangeType = useCallback((newType: CardType) => {
    if (dispatch) {
      dispatch({ type: 'CHANGE_CARD_TYPE', cardId: card.card_id, newType });
    }
    closeContextMenu();
  }, [card.card_id, dispatch, closeContextMenu]);

  // -----------------------------------------------------------------------
  // Content rendering
  // -----------------------------------------------------------------------

  let contentEl: unknown;
  switch (card.card_type) {
    case 'text':
      contentEl = renderTextContent(card);
      break;
    case 'json':
      contentEl = renderJsonContent(card);
      break;
    case 'task':
      contentEl = renderTaskContent(card);
      break;
    case 'project':
      contentEl = renderProjectContent(card, onOpenProject);
      break;
    default:
      contentEl = renderTextContent(card);
  }

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const isProjectPill = card.card_type === 'project';

  const cardStyle: Record<string, string> = {
    position: 'absolute',
    left: `${card.position.x}px`,
    top: `${card.position.y}px`,
    width: `${card.size.width}px`,
    height: `${card.size.height}px`,
    backgroundColor: card.color || '#fef9c3',
    borderRadius: isProjectPill ? '999px' : '6px',
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
    zIndex: '1',
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

  const dragHandleStyle: Record<string, string> = {
    position: 'absolute',
    top: '4px',
    right: '24px',
    width: '18px',
    height: '18px',
    borderRadius: '3px',
    backgroundColor: 'rgba(0,0,0,0.1)',
    color: '#333',
    fontSize: '10px',
    lineHeight: '18px',
    textAlign: 'center',
    cursor: 'grab',
    display: hovered ? 'block' : 'none',
    border: 'none',
    padding: '0',
  };

  // Assignee circle
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
        'data-testid': `card-assignee-${card.card_id}`,
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
  // Context menu element
  // -----------------------------------------------------------------------

  const ctxMenuItemStyle: Record<string, string> = {
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
  };

  const ctxSubmenuStyle: Record<string, string> = {
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
    className: 'card-context-menu',
    style: {
      position: 'fixed',
      left: `${contextMenu.x}px`,
      top: `${contextMenu.y}px`,
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      padding: '4px 0',
      zIndex: '10000',
      minWidth: '160px',
      fontSize: '13px',
      color: '#1a1a1a',
    },
    'data-testid': `card-context-menu-${card.card_id}`,
    role: 'menu',
    'aria-label': 'Card context menu',
    onClick: (e: Event) => e.stopPropagation(),
  },
    // Delete
    createElement('div', {
      style: ctxMenuItemStyle,
      onClick: (e: Event) => { e.stopPropagation(); if (onDelete) onDelete(card.card_id); closeContextMenu(); },
      role: 'menuitem',
      'data-testid': `ctx-delete-${card.card_id}`,
    }, 'Delete'),
    // Change Type submenu
    createElement('div', {
      style: { ...ctxMenuItemStyle, position: 'relative' as string },
      onMouseEnter: () => setTypeSubmenuOpen(true),
      role: 'menuitem',
      'aria-haspopup': 'true',
      'data-testid': `ctx-change-type-${card.card_id}`,
    },
      'Change Type',
      createElement('span', { style: { marginLeft: '8px' } }, '\u25B6'),
      typeSubmenuOpen ? createElement('div', {
        style: ctxSubmenuStyle,
        role: 'menu',
        'data-testid': `ctx-type-submenu-${card.card_id}`,
      },
        ...CARD_TYPE_OPTIONS.map((opt) =>
          createElement('div', {
            key: opt.value,
            style: {
              ...ctxMenuItemStyle,
              fontWeight: card.card_type === opt.value ? '700' : '400',
            },
            onClick: (e: Event) => { e.stopPropagation(); handleChangeType(opt.value); },
            role: 'menuitem',
            'data-testid': `ctx-type-${opt.value}-${card.card_id}`,
          },
            opt.label,
            card.card_type === opt.value ? ' \u2713' : '',
          ),
        ),
      ) : null,
    ),
  ) : null;

  // -----------------------------------------------------------------------
  // For project cards, render as pill (title is the project name, no separate title bar)
  // -----------------------------------------------------------------------

  if (isProjectPill) {
    return createElement('div', {
      className: 'board-card board-card--project',
      style: cardStyle,
      onMouseDown: handleMouseDown,
      onContextMenu: handleContextMenu,
      onMouseEnter: () => setHovered(true),
      onMouseLeave: () => { setHovered(false); closeContextMenu(); },
      'data-card-id': card.card_id,
      'data-testid': `card-${card.card_id}`,
      role: 'button',
      'aria-label': `Project card: ${card.card_title}`,
      tabIndex: 0,
    },
      contentEl,
      createElement('div', {
        style: dragHandleStyle,
        'data-role': 'drag-handle',
        'data-testid': `card-drag-handle-${card.card_id}`,
        'aria-label': 'Export drag handle',
        title: 'Drag to export card',
      }, '\u2630'),
      contextMenuEl,
    );
  }

  // -----------------------------------------------------------------------
  // Standard card rendering (text, json, task)
  // -----------------------------------------------------------------------

  return createElement('div', {
    className: 'board-card',
    style: cardStyle,
    onMouseDown: handleMouseDown,
    onContextMenu: handleContextMenu,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => { setHovered(false); closeContextMenu(); },
    'data-card-id': card.card_id,
    'data-testid': `card-${card.card_id}`,
    role: 'button',
    'aria-label': `Card: ${card.card_title}`,
    tabIndex: 0,
  },
    createElement('div', {
      style: titleStyle,
      'data-testid': `card-title-${card.card_id}`,
    }, card.card_title || 'Untitled'),
    contentEl,
    tagsEl,
    assigneeEl,
    createElement('div', {
      style: dragHandleStyle,
      'data-role': 'drag-handle',
      'data-testid': `card-drag-handle-${card.card_id}`,
      'aria-label': `Export drag handle for ${card.card_title}`,
      title: 'Drag to export card',
    }, '\u2630'),
    createElement('button', {
      style: deleteStyle,
      'data-role': 'delete',
      'data-testid': `card-delete-${card.card_id}`,
      onClick: handleDeleteClick,
      'aria-label': `Delete ${card.card_title}`,
      tabIndex: -1,
    }, '\u00D7'),
    createElement('div', {
      style: resizeStyle,
      'data-role': 'resize',
      onMouseDown: handleResizeMouseDown,
      'aria-label': 'Resize card',
    }),
    contextMenuEl,
  );
}
