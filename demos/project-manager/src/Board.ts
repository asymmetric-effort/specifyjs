// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Board.ts -- The main 2D canvas component with pan/zoom for the project board.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import type { ProjectCard } from './types';
import { Card } from './Card';
import { CardEditor } from './CardEditor';
import { ConnectionsOverlay } from './Connection';
import type { BoardState } from './types';
import type { BoardAction } from './BoardState';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BoardProps {
  state: BoardState;
  dispatch: (action: BoardAction) => void;
  searchQuery: string;
  gridEnabled: boolean;
  selectedCardId: string | null;
  onSelectCard: (cardId: string | null) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 20;
const CANVAS_SIZE = 5000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Board(props: BoardProps) {
  const { state, dispatch, searchQuery, gridEnabled, selectedCardId, onSelectCard } = props;
  const { cards, connections, viewport } = state;

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // -----------------------------------------------------------------------
  // Pan handlers (middle-click or shift+left-click)
  // -----------------------------------------------------------------------

  const handleCanvasMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    const target = me.target as HTMLElement;

    // Only start pan on the canvas itself, not on cards
    if (target.closest('.board-card')) return;

    const isMiddle = me.button === 1;
    const isShiftLeft = me.button === 0 && me.shiftKey;

    if (isMiddle || isShiftLeft) {
      me.preventDefault();
      isPanningRef.current = true;
      panStartRef.current = {
        x: me.clientX,
        y: me.clientY,
        panX: viewport.panX,
        panY: viewport.panY,
      };
    } else if (me.button === 0) {
      // Clicking on empty canvas clears selection
      onSelectCard(null);
      setSelectedConnectionId(null);
    }
  }, [viewport.panX, viewport.panY, onSelectCard]);

  useEffect(() => {
    const handleMouseMove = (e: Event) => {
      if (!isPanningRef.current || !panStartRef.current) return;
      const me = e as MouseEvent;
      const dx = me.clientX - panStartRef.current.x;
      const dy = me.clientY - panStartRef.current.y;
      dispatch({
        type: 'PAN',
        panX: panStartRef.current.panX + dx,
        panY: panStartRef.current.panY + dy,
      });
    };

    const handleMouseUp = () => {
      isPanningRef.current = false;
      panStartRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [dispatch]);

  // -----------------------------------------------------------------------
  // Zoom handler (ctrl + scroll wheel)
  // -----------------------------------------------------------------------

  const handleWheel = useCallback((e: Event) => {
    const we = e as WheelEvent;
    if (!we.ctrlKey) return;
    we.preventDefault();
    const delta = we.deltaY > 0 ? -0.1 : 0.1;
    dispatch({ type: 'ZOOM', zoom: viewport.zoom + delta });
  }, [viewport.zoom, dispatch]);

  // -----------------------------------------------------------------------
  // Keyboard handler (Delete removes selected connection)
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.key === 'Delete' || ke.key === 'Backspace') {
        if (selectedConnectionId) {
          dispatch({ type: 'REMOVE_CONNECTION', connectionId: selectedConnectionId });
          setSelectedConnectionId(null);
        } else if (selectedCardId) {
          dispatch({ type: 'REMOVE_CARD', cardId: selectedCardId });
          onSelectCard(null);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedConnectionId, selectedCardId, dispatch, onSelectCard]);

  // -----------------------------------------------------------------------
  // Card handlers
  // -----------------------------------------------------------------------

  const handleSelectCard = useCallback((cardId: string) => {
    onSelectCard(cardId);
    setSelectedConnectionId(null);
  }, [onSelectCard]);

  const handleMoveCard = useCallback((cardId: string, position: { x: number; y: number }) => {
    let pos = position;
    if (gridEnabled) {
      pos = {
        x: Math.round(position.x / GRID_SIZE) * GRID_SIZE,
        y: Math.round(position.y / GRID_SIZE) * GRID_SIZE,
      };
    }
    dispatch({ type: 'MOVE_CARD', cardId, position: pos });
  }, [dispatch, gridEnabled]);

  const handleResizeCard = useCallback((cardId: string, size: { width: number; height: number }) => {
    dispatch({ type: 'RESIZE_CARD', cardId, size });
  }, [dispatch]);

  const handleDeleteCard = useCallback((cardId: string) => {
    dispatch({ type: 'REMOVE_CARD', cardId });
    if (selectedCardId === cardId) onSelectCard(null);
  }, [dispatch, selectedCardId, onSelectCard]);

  const handleDoubleClickCard = useCallback((cardId: string) => {
    setEditingCardId(cardId);
  }, []);

  const handleEditorSave = useCallback((cardId: string, updates: { title: string; description: string }) => {
    dispatch({ type: 'UPDATE_CARD', cardId, updates });
  }, [dispatch]);

  const handleEditorClose = useCallback(() => {
    setEditingCardId(null);
  }, []);

  const handleSelectConnection = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
    onSelectCard(null);
  }, [onSelectCard]);

  const handleDeleteConnection = useCallback((connectionId: string) => {
    dispatch({ type: 'REMOVE_CONNECTION', connectionId });
    setSelectedConnectionId(null);
  }, [dispatch]);

  // -----------------------------------------------------------------------
  // Filter cards by search
  // -----------------------------------------------------------------------

  const lowerSearch = searchQuery.toLowerCase();
  const filteredCards = lowerSearch
    ? cards.filter((c: ProjectCard) => c.title.toLowerCase().includes(lowerSearch))
    : cards;

  const dimmedCardIds = new Set<string>();
  if (lowerSearch) {
    for (let i = 0; i < cards.length; i++) {
      if (!cards[i].title.toLowerCase().includes(lowerSearch)) {
        dimmedCardIds.add(cards[i].id);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle: Record<string, string> = {
    flex: '1',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8fafc',
    cursor: isPanningRef.current ? 'grabbing' : 'default',
    backgroundImage: 'radial-gradient(circle, #d1d5db 1px, transparent 1px)',
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  const transformStyle: Record<string, string> = {
    transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
    transformOrigin: '0 0',
    position: 'relative',
    width: `${CANVAS_SIZE}px`,
    height: `${CANVAS_SIZE}px`,
  };

  // -----------------------------------------------------------------------
  // Card elements
  // -----------------------------------------------------------------------

  const cardElements = cards.map((card: ProjectCard) => {
    const isDimmed = dimmedCardIds.has(card.id);
    const cardEl = createElement(Card, {
      key: card.id,
      card,
      selected: card.id === selectedCardId,
      onSelect: handleSelectCard,
      onMove: handleMoveCard,
      onResize: handleResizeCard,
      onDelete: handleDeleteCard,
      onDoubleClick: handleDoubleClickCard,
    });

    if (isDimmed) {
      return createElement('div', {
        key: `dim-${card.id}`,
        style: { opacity: '0.3' },
      }, cardEl);
    }
    return cardEl;
  });

  // -----------------------------------------------------------------------
  // Editor overlay
  // -----------------------------------------------------------------------

  const editingCard = editingCardId ? cards.find((c: ProjectCard) => c.id === editingCardId) : null;
  const editorEl = editingCard
    ? createElement(CardEditor, {
        card: editingCard,
        onSave: handleEditorSave,
        onClose: handleEditorClose,
      })
    : null;

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return createElement('div', {
    ref: containerRef,
    className: 'board-canvas',
    style: containerStyle,
    onMouseDown: handleCanvasMouseDown,
    onWheel: handleWheel,
    'data-testid': 'board-canvas',
    role: 'application',
    'aria-label': 'Project board canvas',
    tabIndex: 0,
  },
    createElement('div', {
      className: 'board-canvas__inner',
      style: transformStyle,
      'data-testid': 'board-canvas-inner',
    },
      createElement(ConnectionsOverlay, {
        connections,
        cards,
        selectedConnectionId,
        onSelectConnection: handleSelectConnection,
        onDeleteConnection: handleDeleteConnection,
        canvasWidth: CANVAS_SIZE,
        canvasHeight: CANVAS_SIZE,
      }),
      ...cardElements,
    ),
    editorEl,
  );
}
