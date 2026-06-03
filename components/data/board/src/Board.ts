// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Board.ts -- Reusable canvas component with pan/zoom for rendering BoardItems.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef, useEffect } from '../../../../core/src/hooks/index';
import type { BoardState, BoardItem, Card as CardType, Container as ContainerType, CardLink as CardLinkType } from './types';
import { isCard, isContainer, getItemId } from './types';
import type { BoardAction } from './BoardReducer';
import { CardComponent } from './Card';
import { ContainerComponent } from './Container';
import { CardLinkOverlay } from './CardLink';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BoardProps {
  state: BoardState;
  dispatch: (action: BoardAction) => void;
  selectedId?: string | null;
  onSelectItem?: (itemId: string | null) => void;
  gridEnabled?: boolean;
  searchQuery?: string;
  colorFilter?: string | null;
  onOpenProject?: (projectId: string) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 20;
const CANVAS_SIZE = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function snapToGrid(pos: { x: number; y: number }, gridSize: number): { x: number; y: number } {
  return {
    x: Math.round(pos.x / gridSize) * gridSize,
    y: Math.round(pos.y / gridSize) * gridSize,
  };
}

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
// Collect all cards and links from the tree (iterative)
// ---------------------------------------------------------------------------

function collectCardsAndLinks(items: BoardItem[]): { cards: CardType[]; links: Array<{ source: CardType; link: CardLinkType }> } {
  const cards: CardType[] = [];
  const links: Array<{ source: CardType; link: CardLinkType }> = [];
  const stack: BoardItem[] = [...items];

  while (stack.length > 0) {
    const item = stack.pop()!;
    if (isCard(item)) {
      cards.push(item);
      for (let j = 0; j < item.card_link.length; j++) {
        links.push({ source: item, link: item.card_link[j] });
      }
    } else if (isContainer(item)) {
      for (let j = item.contents.length - 1; j >= 0; j--) {
        stack.push(item.contents[j]);
      }
    }
  }

  return { cards, links };
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Board(props: BoardProps) {
  const {
    state,
    dispatch,
    selectedId = null,
    onSelectItem,
    gridEnabled = false,
    searchQuery = '',
    colorFilter = null,
    onOpenProject,
  } = props;
  const { collection, viewport } = state;

  const containerRef = useRef<HTMLElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // -----------------------------------------------------------------------
  // Pan handlers (middle-click or shift+left-click)
  // -----------------------------------------------------------------------

  const handleCanvasMouseDown = useCallback((e: Event) => {
    const me = e as MouseEvent;
    const target = me.target as HTMLElement;
    if (target.closest('.board-card') || target.closest('.board-container')) return;

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
      if (onSelectItem) onSelectItem(null);
    }
  }, [viewport.panX, viewport.panY, onSelectItem]);

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

  const touchStartRef = useRef<{
    touches: Array<{ x: number; y: number }>;
    panX: number; panY: number; zoom: number; dist: number;
  } | null>(null);

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

      const startMidX = (start.touches[0].x + start.touches[1].x) / 2;
      const startMidY = (start.touches[0].y + start.touches[1].y) / 2;
      const curMidX = (pts[0].x + pts[1].x) / 2;
      const curMidY = (pts[0].y + pts[1].y) / 2;
      dispatch({ type: 'PAN', panX: start.panX + (curMidX - startMidX), panY: start.panY + (curMidY - startMidY) });

      const curDist = getDist(pts[0], pts[1]);
      if (start.dist > 0) {
        dispatch({ type: 'ZOOM', zoom: start.zoom * (curDist / start.dist) });
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
  // Handlers for items
  // -----------------------------------------------------------------------

  const handleSelectItem = useCallback((itemId: string) => {
    if (onSelectItem) onSelectItem(itemId);
  }, [onSelectItem]);

  const handleMoveItem = useCallback((itemId: string, position: { x: number; y: number }) => {
    let pos = position;
    if (gridEnabled) {
      pos = snapToGrid(position, GRID_SIZE);
    }
    dispatch({ type: 'MOVE_ITEM', itemId, position: pos });
  }, [dispatch, gridEnabled]);

  const handleResizeItem = useCallback((itemId: string, size: { width: number; height: number }) => {
    dispatch({ type: 'RESIZE_ITEM', itemId, size });
  }, [dispatch]);

  const handleDeleteItem = useCallback((itemId: string) => {
    dispatch({ type: 'REMOVE_ITEM', itemId });
    if (onSelectItem && selectedId === itemId) onSelectItem(null);
  }, [dispatch, selectedId, onSelectItem]);

  const handleDropIntoContainer = useCallback((itemId: string, containerId: string) => {
    dispatch({ type: 'NEST_ITEM', itemId, containerId });
  }, [dispatch]);

  // -----------------------------------------------------------------------
  // Filter/dim by search & color
  // -----------------------------------------------------------------------

  const lowerSearch = searchQuery.toLowerCase();
  const dimmedIds = new Set<string>();
  const allItems: BoardItem[] = [];
  const itemStack: BoardItem[] = [...collection];
  while (itemStack.length > 0) {
    const item = itemStack.pop()!;
    allItems.push(item);
    if (isContainer(item)) {
      for (let i = 0; i < item.contents.length; i++) {
        itemStack.push(item.contents[i]);
      }
    }
  }

  if (lowerSearch) {
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      const name = isCard(item) ? item.card_title : item.name;
      if (!name.toLowerCase().includes(lowerSearch)) {
        dimmedIds.add(getItemId(item));
      }
    }
  }
  if (colorFilter) {
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      if (isCard(item) && item.color !== colorFilter) {
        dimmedIds.add(item.card_id);
      }
    }
  }

  // -----------------------------------------------------------------------
  // Collect cards and links for SVG overlay
  // -----------------------------------------------------------------------

  const { cards: allCards, links: allLinks } = collectCardsAndLinks(collection);

  // -----------------------------------------------------------------------
  // Render items
  // -----------------------------------------------------------------------

  function renderItem(item: BoardItem): unknown {
    const id = getItemId(item);
    const isDimmed = dimmedIds.has(id);

    let el: unknown;
    if (isCard(item)) {
      el = createElement(CardComponent, {
        key: id,
        card: item,
        selected: id === selectedId,
        onSelect: handleSelectItem,
        onMove: handleMoveItem,
        onResize: handleResizeItem,
        onDelete: handleDeleteItem,
        dispatch,
        onOpenProject,
      });
    } else {
      const childElements = item.contents.map((child: BoardItem) => renderItem(child));
      el = createElement(ContainerComponent, {
        key: id,
        container: item,
        selected: id === selectedId,
        onSelect: handleSelectItem,
        onMove: handleMoveItem,
        onResize: handleResizeItem,
        onDrop: handleDropIntoContainer,
      }, ...childElements);
    }

    if (isDimmed) {
      return createElement('div', {
        key: `dim-${id}`,
        style: { opacity: '0.3' },
      }, el);
    }
    return el;
  }

  const itemElements = collection.map((item: BoardItem) => renderItem(item));

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle: Record<string, string> = {
    flex: '1',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f8fafc',
    cursor: 'default',
    backgroundImage: gridEnabled
      ? 'radial-gradient(circle, #d1d5db 1px, transparent 1px)'
      : 'none',
    backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`,
  };

  const transformStyle: Record<string, string> = {
    transform: `translate(${viewport.panX}px, ${viewport.panY}px) scale(${viewport.zoom})`,
    transformOrigin: '0 0',
    position: 'relative',
    width: `${CANVAS_SIZE}px`,
    height: `${CANVAS_SIZE}px`,
  };

  return createElement('div', {
    ref: containerRef,
    className: 'board-canvas',
    style: containerStyle,
    onMouseDown: handleCanvasMouseDown,
    onWheel: handleWheel,
    'data-testid': 'board-canvas',
    role: 'application',
    'aria-label': `Board: ${state.name}`,
    tabIndex: 0,
  },
    createElement('div', {
      className: 'board-canvas__inner',
      style: transformStyle,
      'data-testid': 'board-canvas-inner',
    },
      createElement(CardLinkOverlay, {
        links: allLinks,
        cards: allCards,
        selectedLinkId: null,
        onSelectLink: () => {},
        canvasWidth: CANVAS_SIZE,
        canvasHeight: CANVAS_SIZE,
      }),
      ...itemElements,
    ),
  );
}
