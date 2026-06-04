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
  onCardContextMenu?: (cardId: string, pos: { x: number; y: number }) => void;
  onUpdate?: (cardId: string, updates: { card_title?: string; content?: unknown }) => void;
  onDragStart?: (cardId: string) => void;
  onDragEnd?: (cardId: string) => void;
  onAnchorDragStart?: (cardId: string, anchor: string, pos: { x: number; y: number }) => void;
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
  const { card, selected = false, onSelect, onMove, onResize, onDelete, dispatch, onOpenProject, onCardContextMenu, onUpdate, onDragStart, onDragEnd, onAnchorDragStart } = props;
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [typeSubmenuOpen, setTypeSubmenuOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const [editingDescription, setEditingDescription] = useState(false);
  const [titleDraft, setTitleDraft] = useState(card.card_title || '');
  const [descDraft, setDescDraft] = useState('');
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
    if (onCardContextMenu) {
      onCardContextMenu(card.card_id, { x: me.clientX, y: me.clientY });
    }
  }, [onCardContextMenu, card.card_id]);

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
    if (target.dataset && (target.dataset.role === 'delete' || target.dataset.role === 'resize' || target.dataset.role === 'drag-handle' || target.dataset.role === 'inline-edit' || target.dataset.role === 'anchor')) return;

    me.preventDefault();
    me.stopPropagation();
    if (onSelect) onSelect(card.card_id);

    dragStartRef.current = {
      x: me.clientX,
      y: me.clientY,
      cardX: card.position.x,
      cardY: card.position.y,
    };

    if (onDragStart) onDragStart(card.card_id);
    setIsDragging(true);

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
      setIsDragging(false);
      if (onDragEnd) onDragEnd(card.card_id);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [card.card_id, card.position.x, card.position.y, onSelect, onMove, onDragStart, onDragEnd]);

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
  // Anchor drag (link creation)
  // -----------------------------------------------------------------------

  const handleAnchorMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    me.preventDefault();
    me.stopPropagation();
    const target = me.target as HTMLElement;
    const anchor = target.dataset.anchor;
    if (!anchor || !onAnchorDragStart) return;

    // Compute anchor position in canvas coordinates (center of card edge)
    const posX = card.position.x;
    const posY = card.position.y;
    const w = card.size.width;
    const h = card.size.height;
    let ax = posX + w / 2;
    let ay = posY + h / 2;
    if (anchor === 'top') { ax = posX + w / 2; ay = posY; }
    else if (anchor === 'right') { ax = posX + w; ay = posY + h / 2; }
    else if (anchor === 'bottom') { ax = posX + w / 2; ay = posY + h; }
    else if (anchor === 'left') { ax = posX; ay = posY + h / 2; }

    onAnchorDragStart(card.card_id, anchor, { x: ax, y: ay });
  }, [card.card_id, card.position.x, card.position.y, card.size.width, card.size.height, onAnchorDragStart]);

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
  // Inline editing handlers
  // -----------------------------------------------------------------------

  const handleTitleDblClick = useCallback((e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    setTitleDraft(card.card_title || '');
    setEditingTitle(true);
  }, [card.card_title]);

  const handleTitleSave = useCallback(() => {
    setEditingTitle(false);
    if (onUpdate && titleDraft !== card.card_title) {
      onUpdate(card.card_id, { card_title: titleDraft });
    }
  }, [onUpdate, card.card_id, card.card_title, titleDraft]);

  const handleTitleKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter') {
      ke.preventDefault();
      handleTitleSave();
    } else if (ke.key === 'Escape') {
      ke.preventDefault();
      setEditingTitle(false);
      setTitleDraft(card.card_title || '');
    }
  }, [handleTitleSave, card.card_title]);

  const handleTitleInput = useCallback((e: Event) => {
    const target = e.target as HTMLInputElement;
    setTitleDraft(target.value);
  }, []);

  const handleDescClick = useCallback((e: Event) => {
    e.stopPropagation();
    const content = card.content as TextContent;
    setDescDraft(content.text || '');
    setEditingDescription(true);
  }, [card.content]);

  const handleDescSave = useCallback(() => {
    setEditingDescription(false);
    if (onUpdate) {
      onUpdate(card.card_id, { content: { text: descDraft } });
    }
  }, [onUpdate, card.card_id, descDraft]);

  const handleDescKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Escape') {
      ke.preventDefault();
      setEditingDescription(false);
      const content = card.content as TextContent;
      setDescDraft(content.text || '');
    }
  }, [card.content]);

  const handleDescInput = useCallback((e: Event) => {
    const target = e.target as HTMLTextAreaElement;
    setDescDraft(target.value);
  }, []);

  // -----------------------------------------------------------------------
  // Content rendering
  // -----------------------------------------------------------------------

  let contentEl: unknown;
  switch (card.card_type) {
    case 'text':
      if (editingDescription) {
        contentEl = createElement('textarea', {
          'data-role': 'inline-edit',
          'data-testid': `card-desc-edit-${card.card_id}`,
          value: descDraft,
          onInput: handleDescInput,
          onBlur: handleDescSave,
          onKeyDown: handleDescKeyDown,
          onFocus: (e: Event) => {
            const ta = e.target as HTMLTextAreaElement;
            ta.setSelectionRange(ta.value.length, ta.value.length);
          },
          style: {
            fontSize: '12px',
            color: '#555555',
            lineHeight: '1.4',
            flex: '1',
            border: '1px solid #3b82f6',
            borderRadius: '3px',
            padding: '2px 4px',
            resize: 'none',
            outline: 'none',
            fontFamily: 'inherit',
            backgroundColor: '#fff',
            width: '100%',
            boxSizing: 'border-box',
          },
        });
      } else {
        contentEl = createElement('div', {
          style: {
            fontSize: '12px',
            color: '#555555',
            lineHeight: '1.4',
            overflow: 'hidden',
            flex: '1',
            cursor: 'text',
          },
          'data-testid': `card-text-content-${card.card_id}`,
          onClick: handleDescClick,
        }, (card.content as TextContent).text || '');
      }
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
    zIndex: isDragging ? '9999' : '1',
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

  // -----------------------------------------------------------------------
  // Anchor circles (visible on hover)
  // -----------------------------------------------------------------------

  const anchorSize = 8;
  const anchorBaseStyle: Record<string, string> = {
    position: 'absolute',
    width: `${anchorSize}px`,
    height: `${anchorSize}px`,
    borderRadius: '50%',
    backgroundColor: '#3b82f6',
    border: '2px solid #fff',
    boxSizing: 'border-box',
    cursor: 'crosshair',
    display: hovered ? 'block' : 'none',
    zIndex: '10',
  };

  const anchorPositions: Array<{ anchor: string; style: Record<string, string> }> = [
    {
      anchor: 'top',
      style: { ...anchorBaseStyle, top: `${-anchorSize / 2}px`, left: '50%', marginLeft: `${-anchorSize / 2}px` },
    },
    {
      anchor: 'right',
      style: { ...anchorBaseStyle, top: '50%', right: `${-anchorSize / 2}px`, marginTop: `${-anchorSize / 2}px` },
    },
    {
      anchor: 'bottom',
      style: { ...anchorBaseStyle, bottom: `${-anchorSize / 2}px`, left: '50%', marginLeft: `${-anchorSize / 2}px` },
    },
    {
      anchor: 'left',
      style: { ...anchorBaseStyle, top: '50%', left: `${-anchorSize / 2}px`, marginTop: `${-anchorSize / 2}px` },
    },
  ];

  const anchorElements = anchorPositions.map((ap, i) =>
    createElement('div', {
      key: `anchor-${ap.anchor}`,
      style: ap.style,
      'data-role': 'anchor',
      'data-anchor': ap.anchor,
      'data-testid': `card-anchor-${ap.anchor}-${card.card_id}`,
      onMouseDown: handleAnchorMouseDown,
    }),
  );

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
      ...anchorElements,
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
    editingTitle
      ? createElement('input', {
          'data-role': 'inline-edit',
          'data-testid': `card-title-edit-${card.card_id}`,
          value: titleDraft,
          onInput: handleTitleInput,
          onBlur: handleTitleSave,
          onKeyDown: handleTitleKeyDown,
          onFocus: (e: Event) => {
            const inp = e.target as HTMLInputElement;
            inp.setSelectionRange(inp.value.length, inp.value.length);
          },
          style: {
            ...titleStyle,
            border: '1px solid #3b82f6',
            borderRadius: '3px',
            padding: '1px 4px',
            outline: 'none',
            width: '100%',
            boxSizing: 'border-box',
            backgroundColor: '#fff',
          },
        })
      : createElement('div', {
          style: titleStyle,
          'data-testid': `card-title-${card.card_id}`,
          onDblClick: handleTitleDblClick,
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
    ...anchorElements,
    contextMenuEl,
  );
}
