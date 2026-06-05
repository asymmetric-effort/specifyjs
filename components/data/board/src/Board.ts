// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Board.ts -- Reusable canvas component with pan/zoom for rendering BoardItems.
 */

import { createElement } from '../../../../core/src/index';
import { useState, useCallback, useRef, useEffect } from '../../../../core/src/hooks/index';
import type { BoardState, BoardItem, Card as CardType, Container as ContainerType, CardLink as CardLinkType, CardType as CardTypeEnum } from './types';
import { isCard, isContainer, getItemId, generateUUID } from './types';
import type { BoardAction } from './BoardReducer';
import { CardComponent, CARD_TYPE_OPTIONS } from './Card';
import { ContainerComponent } from './Container';
import { CardLinkOverlay } from './CardLink';

// ---------------------------------------------------------------------------
// Context menu color options
// ---------------------------------------------------------------------------

const CONTEXT_COLORS = [
  { value: '#fef9c3', label: 'Yellow' },
  { value: '#fecaca', label: 'Red' },
  { value: '#fed7aa', label: 'Orange' },
  { value: '#bbf7d0', label: 'Green' },
  { value: '#bfdbfe', label: 'Blue' },
  { value: '#ddd6fe', label: 'Purple' },
  { value: '#fbcfe8', label: 'Pink' },
  { value: '#e5e7eb', label: 'Gray' },
];

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
  onCardContextMenu?: (cardId: string, pos: { x: number; y: number }) => void;
  onUpdateItem?: (cardId: string, updates: { card_title?: string; content?: unknown }) => void;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const GRID_SIZE = 20;
const CANVAS_SIZE = 5000;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Collect all descendant container IDs of a given container (iterative).
 * Used to prevent circular nesting (a container can't be dropped into itself
 * or any of its descendants).
 */
function collectDescendantContainerIds(collection: BoardItem[], containerId: string): Set<string> {
  const ids = new Set<string>();
  // First find the container in the tree
  const findStack: BoardItem[] = [...collection];
  let target: BoardItem | null = null;
  while (findStack.length > 0) {
    const item = findStack.pop()!;
    if (isContainer(item) && item.container_id === containerId) {
      target = item;
      break;
    }
    if (isContainer(item)) {
      for (let i = 0; i < item.contents.length; i++) findStack.push(item.contents[i]);
    }
  }
  if (!target || !isContainer(target)) return ids;
  // Collect all descendant container IDs
  const descStack: BoardItem[] = [...target.contents];
  while (descStack.length > 0) {
    const item = descStack.pop()!;
    if (isContainer(item)) {
      ids.add(item.container_id);
      for (let i = 0; i < item.contents.length; i++) descStack.push(item.contents[i]);
    }
  }
  return ids;
}

/**
 * Find the deepest container whose bounding box contains the given point.
 * Searches the full tree (including nested containers), converting positions
 * to canvas-absolute using accumulated parent offsets.
 * Excludes the dragged item and its descendants to prevent circular nesting.
 * Returns the most deeply nested matching container (most specific target).
 */
export function findContainerAtPoint(
  collection: BoardItem[],
  x: number,
  y: number,
  excludeId?: string,
): string | null {
  // Build exclusion set: the dragged item + all its descendant containers
  const excluded = new Set<string>();
  if (excludeId) {
    excluded.add(excludeId);
    const descendants = collectDescendantContainerIds(collection, excludeId);
    for (const id of descendants) excluded.add(id);
  }

  let bestMatch: string | null = null;
  let bestDepth = -1;

  // Stack entries: [items, parentOffsetX, parentOffsetY, depth]
  const stack: Array<[BoardItem[], number, number, number]> = [[collection, 0, 0, 0]];

  while (stack.length > 0) {
    const [items, offsetX, offsetY, depth] = stack.pop()!;
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (!isContainer(item)) continue;
      if (excluded.has(item.container_id)) continue;

      // Convert container position to canvas-absolute
      const absX = item.position.x + offsetX;
      const absY = item.position.y + offsetY;

      if (
        x >= absX &&
        x <= absX + item.size.width &&
        y >= absY &&
        y <= absY + item.size.height
      ) {
        // Deeper match wins (most specific container)
        if (depth > bestDepth) {
          bestMatch = item.container_id;
          bestDepth = depth;
        }
        // Search children — they are positioned relative to this container
        // +30 accounts for title bar height
        if (item.contents.length > 0) {
          stack.push([item.contents, absX, absY + 30, depth + 1]);
        }
      }
    }
  }

  return bestMatch;
}

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

/**
 * Collect all cards with canvas-absolute positions and their links.
 * Nested cards have container-relative positions in the state tree,
 * so we accumulate parent container offsets to produce absolute coords
 * for the SVG link overlay.
 */
function collectCardsAndLinks(items: BoardItem[]): { cards: CardType[]; links: Array<{ source: CardType; link: CardLinkType }> } {
  const cards: CardType[] = [];
  const links: Array<{ source: CardType; link: CardLinkType }> = [];
  // Stack entries: [item, parentOffsetX, parentOffsetY]
  const stack: Array<[BoardItem, number, number]> = [];
  for (let i = items.length - 1; i >= 0; i--) {
    stack.push([items[i], 0, 0]);
  }

  while (stack.length > 0) {
    const [item, offsetX, offsetY] = stack.pop()!;
    if (isCard(item)) {
      // Create a copy with canvas-absolute position for link rendering
      const absCard: CardType = {
        ...item,
        position: {
          x: item.position.x + offsetX,
          y: item.position.y + offsetY,
        },
      };
      cards.push(absCard);
      for (let j = 0; j < item.card_link.length; j++) {
        links.push({ source: absCard, link: item.card_link[j] });
      }
    } else if (isContainer(item)) {
      // Children are relative to this container; accumulate offset
      // +30 accounts for the title bar height
      const childOffsetX = offsetX + item.position.x;
      const childOffsetY = offsetY + item.position.y + 30;
      for (let j = item.contents.length - 1; j >= 0; j--) {
        stack.push([item.contents[j], childOffsetX, childOffsetY]);
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
    onCardContextMenu,
    onUpdateItem,
  } = props;
  const { collection, viewport } = state;

  const containerRef = useRef<HTMLElement | null>(null);
  const isPanningRef = useRef(false);
  const panStartRef = useRef<{ x: number; y: number; panX: number; panY: number } | null>(null);

  // -----------------------------------------------------------------------
  // Item-to-container drag-and-drop state (cards and containers)
  // -----------------------------------------------------------------------

  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Link-drag state (anchor-to-anchor link creation)
  // -----------------------------------------------------------------------

  const [linkDrag, setLinkDrag] = useState<{
    fromCardId: string;
    fromAnchor: string;
    fromPos: { x: number; y: number };
    currentPos: { x: number; y: number };
  } | null>(null);

  // -----------------------------------------------------------------------
  // Card context menu state (managed by Board, rendered outside transform)
  // -----------------------------------------------------------------------

  const [cardContextMenu, setCardContextMenu] = useState<{ cardId: string; x: number; y: number } | null>(null);
  const [colorSubmenuOpen, setColorSubmenuOpen] = useState(false);
  const [typeSubmenuOpen, setTypeSubmenuOpen] = useState(false);
  const [linkContextMenu, setLinkContextMenu] = useState<{ linkId: string; cardId: string; x: number; y: number } | null>(null);

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
  // Board-level card context menu handler
  // -----------------------------------------------------------------------

  const handleCardContextMenu = useCallback((cardId: string, pos: { x: number; y: number }) => {
    setCardContextMenu({ cardId, x: pos.x, y: pos.y });
    setColorSubmenuOpen(false);
    setTypeSubmenuOpen(false);
    // Also forward to consumer if provided
    if (onCardContextMenu) {
      onCardContextMenu(cardId, pos);
    }
  }, [onCardContextMenu]);

  const closeCardContextMenu = useCallback(() => {
    setCardContextMenu(null);
    setColorSubmenuOpen(false);
    setTypeSubmenuOpen(false);
  }, []);

  // Close context menu on outside click
  useEffect(() => {
    if (!cardContextMenu) return;
    const handleDocumentClick = () => {
      closeCardContextMenu();
    };
    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, [cardContextMenu, closeCardContextMenu]);

  // Link context menu handlers
  const handleLinkContextMenu = useCallback((linkId: string, cardId: string, pos: { x: number; y: number }) => {
    setLinkContextMenu({ linkId, cardId, x: pos.x, y: pos.y });
    closeCardContextMenu();
  }, [closeCardContextMenu]);

  const closeLinkContextMenu = useCallback(() => {
    setLinkContextMenu(null);
  }, []);

  useEffect(() => {
    if (!linkContextMenu) return;
    const handleDocumentClick = () => closeLinkContextMenu();
    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, [linkContextMenu, closeLinkContextMenu]);

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

    // During item drag (card or container), check for container overlap.
    // Use ref to avoid stale closure — component captures onMove at mousedown,
    // before setDraggingItemId state update has taken effect.
    const currentDragging = draggingItemIdRef.current;
    if (currentDragging === itemId) {
      // Find the dragged item in the full tree to get its size
      let itemWidth = 0;
      let itemHeight = 0;
      const searchStack: BoardItem[] = [...collection];
      while (searchStack.length > 0) {
        const si = searchStack.pop()!;
        if (getItemId(si) === itemId) {
          itemWidth = si.size.width;
          itemHeight = si.size.height;
          break;
        }
        if (isContainer(si)) {
          for (let k = 0; k < si.contents.length; k++) searchStack.push(si.contents[k]);
        }
      }
      const centerX = pos.x + itemWidth / 2;
      const centerY = pos.y + itemHeight / 2;
      const containerId = findContainerAtPoint(collection, centerX, centerY, itemId);
      setDropTargetId(containerId);
    }
  }, [dispatch, gridEnabled, collection]);

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

  const handleItemDragStart = useCallback((itemId: string) => {
    setDraggingItemId(itemId);
    draggingItemIdRef.current = itemId;
    setDropTargetId(null);
  }, []);

  // Use refs to avoid stale closures in drag handlers.
  // Card.ts/Container.ts capture onMove/onDragEnd at mousedown time, but
  // draggingItemId is set via async state update — captured callbacks read null.
  const draggingItemIdRef = useRef<string | null>(null);
  draggingItemIdRef.current = draggingItemId;

  const dropTargetIdRef = useRef<string | null>(null);
  dropTargetIdRef.current = dropTargetId;

  const handleItemDragEnd = useCallback((itemId: string) => {
    const target = dropTargetIdRef.current;
    if (target) {
      dispatch({ type: 'NEST_ITEM', itemId, containerId: target });
    }
    setDraggingItemId(null);
    draggingItemIdRef.current = null;
    setDropTargetId(null);
  }, [dispatch]);

  // -----------------------------------------------------------------------
  // Anchor drag start (link creation)
  // -----------------------------------------------------------------------

  const handleAnchorDragStart = useCallback((cardId: string, anchor: string, pos: { x: number; y: number }) => {
    setLinkDrag({
      fromCardId: cardId,
      fromAnchor: anchor,
      fromPos: pos,
      currentPos: pos,
    });
  }, []);

  // Keep a ref for linkDrag so the effect cleanup/listeners can read current value
  const linkDragRef = useRef<typeof linkDrag>(null);
  linkDragRef.current = linkDrag;

  useEffect(() => {
    if (!linkDrag) return;

    const handleMouseMove = (e: Event) => {
      const me = e as MouseEvent;
      // Convert screen position to canvas coordinates, accounting for container offset
      let offsetX = 0;
      let offsetY = 0;
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        offsetX = rect.left;
        offsetY = rect.top;
      }
      const canvasPos = screenToCanvas(me.clientX - offsetX, me.clientY - offsetY, viewport);
      setLinkDrag((prev) => prev ? { ...prev, currentPos: canvasPos } : null);
    };

    const handleMouseUp = (e: Event) => {
      const me = e as MouseEvent;
      const current = linkDragRef.current;
      if (!current) {
        setLinkDrag(null);
        return;
      }

      // Check if cursor is over another card's anchor
      const el = document.elementFromPoint(me.clientX, me.clientY) as HTMLElement | null;
      if (el && el.dataset && el.dataset.role === 'anchor' && el.dataset.anchor) {
        // Find the card ID by walking up to the card element
        const cardEl = el.closest('[data-card-id]') as HTMLElement | null;
        if (cardEl && cardEl.dataset.cardId && cardEl.dataset.cardId !== current.fromCardId) {
          const targetCardId = cardEl.dataset.cardId;
          dispatch({
            type: 'ADD_LINK',
            cardId: current.fromCardId,
            link: {
              link_id: generateUUID(),
              link_name: 'relates to',
              target_card_id: targetCardId,
              color: '#94a3b8',
              attributes: {},
            },
          });
        }
      }

      setLinkDrag(null);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [linkDrag !== null, viewport.panX, viewport.panY, viewport.zoom, dispatch]);

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
        onCardContextMenu: handleCardContextMenu,
        onUpdate: onUpdateItem,
        onDragStart: handleItemDragStart,
        onDragEnd: handleItemDragEnd,
        onAnchorDragStart: handleAnchorDragStart,
      });
    } else {
      const childElements = item.contents.map((child: BoardItem) => renderItem(child));
      el = createElement(ContainerComponent, {
        key: id,
        container: item,
        selected: id === selectedId,
        highlighted: dropTargetId === item.container_id,
        onSelect: handleSelectItem,
        onMove: handleMoveItem,
        onResize: handleResizeItem,
        onDelete: handleDeleteItem,
        onDrop: handleDropIntoContainer,
        onDragStart: handleItemDragStart,
        onDragEnd: handleItemDragEnd,
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

  // -----------------------------------------------------------------------
  // Context menu element (rendered OUTSIDE the transform container)
  // -----------------------------------------------------------------------

  const ctxMenuItemStyle: Record<string, string> = {
    padding: '6px 12px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    whiteSpace: 'nowrap',
    fontSize: '13px',
    color: '#1a1a1a',
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

  const ctxSeparatorStyle: Record<string, string> = {
    height: '1px',
    backgroundColor: '#e5e7eb',
    margin: '4px 0',
  };

  const boardContextMenuEl = cardContextMenu ? createElement('div', {
    className: 'board-context-menu',
    style: {
      position: 'fixed',
      left: `${cardContextMenu.x}px`,
      top: `${cardContextMenu.y}px`,
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
    'data-testid': `board-context-menu-${cardContextMenu.cardId}`,
    role: 'menu',
    'aria-label': 'Card context menu',
    onClick: (e: Event) => e.stopPropagation(),
  },
    // Change Color submenu
    createElement('div', {
      style: { ...ctxMenuItemStyle, position: 'relative' as string },
      onMouseEnter: () => { setColorSubmenuOpen(true); setTypeSubmenuOpen(false); },
      role: 'menuitem',
      'aria-haspopup': 'true',
      'data-testid': `board-ctx-change-color-${cardContextMenu.cardId}`,
    },
      'Change Color',
      createElement('span', { style: { marginLeft: '8px' } }, '\u25B6'),
      colorSubmenuOpen ? createElement('div', {
        style: ctxSubmenuStyle,
        role: 'menu',
        'data-testid': `board-ctx-color-submenu-${cardContextMenu.cardId}`,
      },
        ...CONTEXT_COLORS.map((opt) =>
          createElement('div', {
            key: opt.value,
            style: {
              ...ctxMenuItemStyle,
              gap: '8px',
            },
            onClick: (e: Event) => {
              e.stopPropagation();
              dispatch({ type: 'UPDATE_CARD', cardId: cardContextMenu.cardId, updates: { color: opt.value } });
              closeCardContextMenu();
            },
            role: 'menuitem',
            'data-testid': `board-ctx-color-${opt.label.toLowerCase()}-${cardContextMenu.cardId}`,
          },
            createElement('span', {
              style: {
                display: 'inline-block',
                width: '14px',
                height: '14px',
                borderRadius: '3px',
                backgroundColor: opt.value,
                border: '1px solid #d1d5db',
                flexShrink: '0',
              },
            }),
            opt.label,
          ),
        ),
      ) : null,
    ),
    // Change Type submenu
    createElement('div', {
      style: { ...ctxMenuItemStyle, position: 'relative' as string },
      onMouseEnter: () => { setTypeSubmenuOpen(true); setColorSubmenuOpen(false); },
      role: 'menuitem',
      'aria-haspopup': 'true',
      'data-testid': `board-ctx-change-type-${cardContextMenu.cardId}`,
    },
      'Change Type',
      createElement('span', { style: { marginLeft: '8px' } }, '\u25B6'),
      typeSubmenuOpen ? createElement('div', {
        style: ctxSubmenuStyle,
        role: 'menu',
        'data-testid': `board-ctx-type-submenu-${cardContextMenu.cardId}`,
      },
        ...CARD_TYPE_OPTIONS.map((opt) =>
          createElement('div', {
            key: opt.value,
            style: ctxMenuItemStyle,
            onClick: (e: Event) => {
              e.stopPropagation();
              dispatch({ type: 'CHANGE_CARD_TYPE', cardId: cardContextMenu.cardId, newType: opt.value });
              closeCardContextMenu();
            },
            role: 'menuitem',
            'data-testid': `board-ctx-type-${opt.value}-${cardContextMenu.cardId}`,
          }, opt.label),
        ),
      ) : null,
    ),
    // Separator
    createElement('div', { style: ctxSeparatorStyle, role: 'separator' }),
    // Delete
    createElement('div', {
      style: { ...ctxMenuItemStyle, color: '#dc2626' },
      onClick: (e: Event) => {
        e.stopPropagation();
        dispatch({ type: 'REMOVE_ITEM', itemId: cardContextMenu.cardId });
        if (onSelectItem && selectedId === cardContextMenu.cardId) onSelectItem(null);
        closeCardContextMenu();
      },
      role: 'menuitem',
      'data-testid': `board-ctx-delete-${cardContextMenu.cardId}`,
    }, 'Delete'),
  ) : null;

  // -----------------------------------------------------------------------
  // Link context menu — edge type selection
  // -----------------------------------------------------------------------

  const EDGE_TYPES = [
    'relates to',
    'depends on',
    'blocks',
    'is blocked by',
    'implements',
    'is implemented by',
    'extends',
    'includes',
    'references',
    'duplicates',
    'parent of',
    'child of',
  ];

  const linkContextMenuEl = linkContextMenu ? createElement('div', {
    className: 'board-link-context-menu',
    style: {
      position: 'fixed',
      left: `${linkContextMenu.x}px`,
      top: `${linkContextMenu.y}px`,
      backgroundColor: '#ffffff',
      border: '1px solid #d1d5db',
      borderRadius: '6px',
      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
      padding: '4px 0',
      minWidth: '180px',
      maxHeight: '240px',
      overflowY: 'auto',
      zIndex: '10001',
      fontSize: '13px',
    },
    onClick: (e: Event) => e.stopPropagation(),
  },
    createElement('div', {
      style: { padding: '4px 14px', fontSize: '11px', color: '#94a3b8', fontWeight: '600' },
    }, 'Edge Type'),
    ...EDGE_TYPES.map((edgeType: string) =>
      createElement('button', {
        key: edgeType,
        style: {
          display: 'block',
          width: '100%',
          padding: '6px 14px',
          border: 'none',
          backgroundColor: 'transparent',
          textAlign: 'left',
          cursor: 'pointer',
          fontSize: '13px',
          color: '#334155',
          fontFamily: 'inherit',
          boxSizing: 'border-box',
        },
        onClick: () => {
          // Update the link's name
          dispatch({
            type: 'UPDATE_CARD',
            cardId: linkContextMenu.cardId,
            updates: {
              card_link: (() => {
                // Find the card and update the specific link's name
                let targetCard: CardType | null = null;
                const stack: BoardItem[] = [...collection];
                while (stack.length > 0) {
                  const item = stack.pop()!;
                  if (isCard(item) && item.card_id === linkContextMenu.cardId) {
                    targetCard = item;
                    break;
                  }
                  if (isContainer(item)) {
                    for (const child of item.contents) stack.push(child);
                  }
                }
                if (!targetCard) return [];
                return targetCard.card_link.map((l) =>
                  l.link_id === linkContextMenu.linkId
                    ? { ...l, link_name: edgeType }
                    : l,
                );
              })(),
            },
          });
          closeLinkContextMenu();
        },
        role: 'menuitem',
      }, edgeType),
    ),
    createElement('div', { style: { height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' } }),
    createElement('button', {
      style: {
        display: 'block',
        width: '100%',
        padding: '6px 14px',
        border: 'none',
        backgroundColor: 'transparent',
        textAlign: 'left',
        cursor: 'pointer',
        fontSize: '13px',
        color: '#ef4444',
        fontFamily: 'inherit',
      },
      onClick: () => {
        dispatch({ type: 'REMOVE_LINK', cardId: linkContextMenu.cardId, linkId: linkContextMenu.linkId });
        closeLinkContextMenu();
      },
      role: 'menuitem',
    }, 'Delete Link'),
  ) : null;

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
        onLinkContextMenu: handleLinkContextMenu,
        canvasWidth: CANVAS_SIZE,
        canvasHeight: CANVAS_SIZE,
      }),
      linkDrag ? createElement('svg', {
        style: {
          position: 'absolute',
          top: '0',
          left: '0',
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          overflow: 'visible',
        },
        width: String(CANVAS_SIZE),
        height: String(CANVAS_SIZE),
        className: 'link-drag-overlay',
        'data-testid': 'link-drag-overlay',
      },
        createElement('line', {
          x1: String(linkDrag.fromPos.x),
          y1: String(linkDrag.fromPos.y),
          x2: String(linkDrag.currentPos.x),
          y2: String(linkDrag.currentPos.y),
          stroke: '#3b82f6',
          'stroke-width': '2',
          'stroke-dasharray': '6 4',
          'pointer-events': 'none',
          'data-testid': 'link-drag-line',
        }),
      ) : null,
      ...itemElements,
    ),
    boardContextMenuEl,
    linkContextMenuEl,
  );
}
