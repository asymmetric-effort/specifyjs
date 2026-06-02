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
  colorFilter?: string | null;
  showConnections?: boolean;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 20;
const CANVAS_SIZE = 5000;

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Exported helper: snap-to-grid
// ---------------------------------------------------------------------------

export function snapToGrid(pos: { x: number; y: number }, gridSize: number): { x: number; y: number } {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize,
  };
}

// ---------------------------------------------------------------------------
// Exported helper: screen-to-canvas coordinate conversion
// ---------------------------------------------------------------------------

export function screenToCanvas(
  screenX: number,
  screenY: number,
  viewport: { panX: number; panY: number; zoom: number },
): { x: number; y: number } {
  return {
    x: (screenX - viewport.panX) / viewport.zoom,
    y: (screenY - viewport.panY) / viewport.zoom,
  };
}

// ---------------------------------------------------------------------------
// Exported helper: fit-all bounding box calculation
// ---------------------------------------------------------------------------

export function computeFitAll(
  cards: ProjectCard[],
  containerWidth: number,
  containerHeight: number,
  padding?: number,
): { panX: number; panY: number; zoom: number } {
  const pad = padding ?? 40;
  if (cards.length === 0) {
    return { panX: 0, panY: 0, zoom: 1 };
  }
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (let i = 0; i < cards.length; i++) {
    const c = cards[i];
    if (c.position.x < minX) minX = c.position.x;
    if (c.position.y < minY) minY = c.position.y;
    const right = c.position.x + c.size.width;
    const bottom = c.position.y + c.size.height;
    if (right > maxX) maxX = right;
    if (bottom > maxY) maxY = bottom;
  }
  const contentW = maxX - minX + pad * 2;
  const contentH = maxY - minY + pad * 2;
  const zoomX = containerWidth / contentW;
  const zoomY = containerHeight / contentH;
  const zoom = Math.max(0.25, Math.min(4.0, Math.min(zoomX, zoomY)));
  const panX = -minX * zoom + (containerWidth - (maxX - minX) * zoom) / 2;
  const panY = -minY * zoom + (containerHeight - (maxY - minY) * zoom) / 2;
  return { panX, panY, zoom };
}

// ---------------------------------------------------------------------------
// Connection ID generator
// ---------------------------------------------------------------------------

let connIdCounter = 0;
function generateConnectionId(): string {
  connIdCounter++;
  return `conn-${Date.now()}-${connIdCounter}`;
}

export function Board(props: BoardProps) {
  const { state, dispatch, searchQuery, gridEnabled, selectedCardId, onSelectCard, colorFilter, showConnections } = props;
  const shouldShowConnections = showConnections !== false;
  const { cards, connections, viewport } = state;

  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // Connection creation drag state
  const [connectionDrag, setConnectionDrag] = useState<{
    fromCardId: string;
    fromAnchor: string;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
  } | null>(null);
  const connectionDragRef = useRef(connectionDrag);
  connectionDragRef.current = connectionDrag;

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
  // Touch handlers (two-finger pan + pinch-to-zoom)
  // -----------------------------------------------------------------------

  const touchStartRef = useRef<{ touches: Array<{ x: number; y: number }>; panX: number; panY: number; zoom: number; dist: number } | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const getTouchPoints = (e: TouchEvent) => {
      const pts: Array<{ x: number; y: number }> = [];
      for (let i = 0; i < e.touches.length; i++) {
        pts.push({ x: e.touches[i].clientX, y: e.touches[i].clientY });
      }
      return pts;
    };

    const getDist = (a: { x: number; y: number }, b: { x: number; y: number }) =>
      Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2);

    const handleTouchStart = (e: Event) => {
      const te = e as TouchEvent;
      if (te.touches.length === 2) {
        te.preventDefault();
        const pts = getTouchPoints(te);
        touchStartRef.current = {
          touches: pts,
          panX: viewport.panX,
          panY: viewport.panY,
          zoom: viewport.zoom,
          dist: getDist(pts[0], pts[1]),
        };
      }
    };

    const handleTouchMove = (e: Event) => {
      const te = e as TouchEvent;
      if (te.touches.length !== 2 || !touchStartRef.current) return;
      te.preventDefault();
      const pts = getTouchPoints(te);
      const start = touchStartRef.current;

      // Pan: average movement of two fingers
      const startMidX = (start.touches[0].x + start.touches[1].x) / 2;
      const startMidY = (start.touches[0].y + start.touches[1].y) / 2;
      const curMidX = (pts[0].x + pts[1].x) / 2;
      const curMidY = (pts[0].y + pts[1].y) / 2;
      const dx = curMidX - startMidX;
      const dy = curMidY - startMidY;
      dispatch({ type: 'PAN', panX: start.panX + dx, panY: start.panY + dy });

      // Pinch: zoom proportional to distance change
      const curDist = getDist(pts[0], pts[1]);
      if (start.dist > 0) {
        const scale = curDist / start.dist;
        dispatch({ type: 'ZOOM', zoom: start.zoom * scale });
      }
    };

    const handleTouchEnd = () => {
      touchStartRef.current = null;
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [viewport.panX, viewport.panY, viewport.zoom, dispatch]);

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

  const handleDoubleClickCard = useCallback((_cardId: string) => {
    // No longer opens CardEditor modal on double-click.
    // Inline editing on the Card component handles title/description edits directly.
    // The CardEditor overlay remains available for potential menu-based "Edit Card" action.
  }, []);

  const handleUpdateCard = useCallback((cardId: string, updates: { title?: string; description?: string }) => {
    dispatch({ type: 'UPDATE_CARD', cardId, updates });
  }, [dispatch]);

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
  // Card context menu handlers (duplicate, color, priority)
  // -----------------------------------------------------------------------

  const handleDuplicateCard = useCallback((cardId: string) => {
    const newId = `card-${Date.now()}-dup`;
    dispatch({ type: 'DUPLICATE_CARD', cardId, newId });
  }, [dispatch]);

  const handleChangeColor = useCallback((cardId: string, color: string) => {
    dispatch({ type: 'UPDATE_CARD', cardId, updates: { color } });
  }, [dispatch]);

  const handleChangePriority = useCallback((cardId: string, priority: 'low' | 'medium' | 'high' | 'critical') => {
    dispatch({ type: 'UPDATE_CARD', cardId, updates: { priority } });
  }, [dispatch]);

  // -----------------------------------------------------------------------
  // Connection creation via anchor drag
  // -----------------------------------------------------------------------

  const handleAnchorDragStart = useCallback((cardId: string, anchor: string, ax: number, ay: number) => {
    setConnectionDrag({
      fromCardId: cardId,
      fromAnchor: anchor,
      fromX: ax,
      fromY: ay,
      toX: ax,
      toY: ay,
    });
  }, []);

  useEffect(() => {
    if (!connectionDragRef.current) return;

    const handleMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      if (!connectionDragRef.current) return;
      // Convert screen coords to canvas coords
      const canvasPos = screenToCanvas(me.clientX, me.clientY, viewport);
      setConnectionDrag((prev: typeof connectionDrag) => prev ? {
        ...prev,
        toX: canvasPos.x,
        toY: canvasPos.y,
      } : null);
    };

    const handleMouseUp = (e: Event) => {
      const me = e as MouseEvent;
      if (!connectionDragRef.current) return;
      const drag = connectionDragRef.current;
      // Check if mouse is over another card's anchor
      const target = me.target as HTMLElement;
      const anchorEl = target.closest ? target.closest('[data-anchor]') : null;
      const cardEl = target.closest ? target.closest('[data-card-id]') : null;
      if (anchorEl && cardEl) {
        const targetCardId = cardEl.getAttribute('data-card-id');
        if (targetCardId && targetCardId !== drag.fromCardId) {
          dispatch({
            type: 'ADD_CONNECTION',
            connection: {
              id: generateConnectionId(),
              fromCardId: drag.fromCardId,
              toCardId: targetCardId,
            },
          });
        }
      }
      setConnectionDrag(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connectionDrag, viewport, dispatch]);

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
  // Color filter dimming
  if (colorFilter) {
    for (let i = 0; i < cards.length; i++) {
      if (cards[i].color !== colorFilter) {
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
      onUpdate: handleUpdateCard,
      onDuplicate: handleDuplicateCard,
      onChangeColor: handleChangeColor,
      onChangePriority: handleChangePriority,
      onAnchorDragStart: handleAnchorDragStart,
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

  // -----------------------------------------------------------------------
  // Temporary connection line (during connection drag)
  // -----------------------------------------------------------------------

  const connectionDragLine = connectionDrag ? createElement('svg', {
    style: {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      pointerEvents: 'none',
      overflow: 'visible',
      zIndex: '5',
    },
    width: String(CANVAS_SIZE),
    height: String(CANVAS_SIZE),
    'data-testid': 'connection-drag-line',
  },
    createElement('line', {
      x1: String(connectionDrag.fromX),
      y1: String(connectionDrag.fromY),
      x2: String(connectionDrag.toX),
      y2: String(connectionDrag.toY),
      stroke: '#3b82f6',
      'stroke-width': '2',
      'stroke-dasharray': '6,4',
      'pointer-events': 'none',
    }),
  ) : null;

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
      shouldShowConnections ? createElement(ConnectionsOverlay, {
        connections,
        cards,
        selectedConnectionId,
        onSelectConnection: handleSelectConnection,
        onDeleteConnection: handleDeleteConnection,
        canvasWidth: CANVAS_SIZE,
        canvasHeight: CANVAS_SIZE,
      }) : null,
      connectionDragLine,
      ...cardElements,
    ),
    editorEl,
  );
}
