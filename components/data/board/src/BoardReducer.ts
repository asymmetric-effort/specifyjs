// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BoardReducer.ts -- State management for the Board component.
 * Uses useReducer with undo/redo via a history stack (last 50 states).
 */

import { useCallback, useReducer } from '../../../../core/src/hooks/index';
import type { BoardState, BoardItem, Card, Container, CardLink, CardType } from './types';
import { isCard, isContainer, generateUUID, getItemId } from './types';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type BoardAction =
  | { type: 'ADD_ITEM'; item: BoardItem; containerId?: string }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'MOVE_ITEM'; itemId: string; position: { x: number; y: number } }
  | { type: 'RESIZE_ITEM'; itemId: string; size: { width: number; height: number } }
  | { type: 'UPDATE_CARD'; cardId: string; updates: Partial<Card> }
  | { type: 'CHANGE_CARD_TYPE'; cardId: string; newType: CardType }
  | { type: 'ADD_CONTAINER'; container: Container; parentContainerId?: string }
  | { type: 'NEST_ITEM'; itemId: string; containerId: string }
  | { type: 'UNNEST_ITEM'; itemId: string; containerId: string }
  | { type: 'ADD_LINK'; cardId: string; link: CardLink }
  | { type: 'REMOVE_LINK'; cardId: string; linkId: string }
  | { type: 'PAN'; panX: number; panY: number }
  | { type: 'ZOOM'; zoom: number }
  | { type: 'SET_BOARD'; state: BoardState }
  | { type: 'RENAME_BOARD'; name: string };

// ---------------------------------------------------------------------------
// History wrapper
// ---------------------------------------------------------------------------

export interface HistoryState {
  past: BoardState[];
  present: BoardState;
  future: BoardState[];
}

const MAX_HISTORY = 50;

export const DEFAULT_BOARD_STATE: BoardState = {
  id: generateUUID(),
  name: 'Untitled',
  collection: [],
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

// ---------------------------------------------------------------------------
// Tree helpers (iterative to avoid stack overflow on deep trees)
// ---------------------------------------------------------------------------

/**
 * Find and remove an item from a collection tree by ID. Returns [updatedCollection, removedItem].
 */
function removeItemFromTree(
  collection: BoardItem[],
  itemId: string,
): [BoardItem[], BoardItem | null] {
  let removed: BoardItem | null = null;

  function process(items: BoardItem[]): BoardItem[] {
    const result: BoardItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const id = getItemId(item);
      if (id === itemId) {
        removed = item;
        continue;
      }
      if (isContainer(item)) {
        const newContents = process(item.contents);
        result.push({ ...item, contents: newContents });
      } else {
        result.push(item);
      }
    }
    return result;
  }

  const updated = process(collection);
  return [updated, removed];
}

/**
 * Recursively offset all child positions by a delta (used when moving a container).
 */
function offsetChildPositions(items: BoardItem[], dx: number, dy: number): BoardItem[] {
  return items.map((item) => {
    const moved = {
      ...item,
      position: { x: item.position.x + dx, y: item.position.y + dy },
    };
    if (isContainer(moved)) {
      moved.contents = offsetChildPositions(moved.contents, dx, dy);
    }
    return moved;
  });
}

/**
 * Update an item in the collection tree by ID.
 */
function updateItemInTree(
  collection: BoardItem[],
  itemId: string,
  updater: (item: BoardItem) => BoardItem,
): BoardItem[] {
  const result: BoardItem[] = [];
  for (let i = 0; i < collection.length; i++) {
    const item = collection[i];
    const id = getItemId(item);
    if (id === itemId) {
      result.push(updater(item));
    } else if (isContainer(item)) {
      result.push({
        ...item,
        contents: updateItemInTree(item.contents, itemId, updater),
      });
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Add an item inside a specific container in the tree.
 */
function addItemToContainer(
  collection: BoardItem[],
  containerId: string,
  newItem: BoardItem,
): BoardItem[] {
  const result: BoardItem[] = [];
  for (let i = 0; i < collection.length; i++) {
    const item = collection[i];
    if (isContainer(item) && item.container_id === containerId) {
      result.push({
        ...item,
        contents: [...item.contents, newItem],
      });
    } else if (isContainer(item)) {
      result.push({
        ...item,
        contents: addItemToContainer(item.contents, containerId, newItem),
      });
    } else {
      result.push(item);
    }
  }
  return result;
}

/**
 * Remove an item from a specific container and return it at the top level.
 */
function removeItemFromContainer(
  collection: BoardItem[],
  containerId: string,
  itemId: string,
): [BoardItem[], BoardItem | null] {
  let removed: BoardItem | null = null;

  function process(items: BoardItem[]): BoardItem[] {
    const result: BoardItem[] = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (isContainer(item) && item.container_id === containerId) {
        const newContents: BoardItem[] = [];
        for (let j = 0; j < item.contents.length; j++) {
          const child = item.contents[j];
          if (getItemId(child) === itemId) {
            removed = child;
          } else {
            newContents.push(child);
          }
        }
        result.push({ ...item, contents: newContents });
      } else if (isContainer(item)) {
        result.push({
          ...item,
          contents: process(item.contents),
        });
      } else {
        result.push(item);
      }
    }
    return result;
  }

  const updated = process(collection);
  return [updated, removed];
}

/**
 * Get default content for a card type.
 */
function getDefaultContent(cardType: CardType): Card['content'] {
  switch (cardType) {
    case 'text':
      return { text: '' };
    case 'json':
      return {};
    case 'task':
      return {};
    case 'project':
      return { project_id: '', project_name: '' };
  }
}

// ---------------------------------------------------------------------------
// Board reducer (pure state transitions)
// ---------------------------------------------------------------------------

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_ITEM': {
      if (action.containerId) {
        return {
          ...state,
          collection: addItemToContainer(state.collection, action.containerId, action.item),
        };
      }
      return {
        ...state,
        collection: [...state.collection, action.item],
      };
    }

    case 'REMOVE_ITEM': {
      const [newCollection] = removeItemFromTree(state.collection, action.itemId);
      return {
        ...state,
        collection: newCollection,
      };
    }

    case 'MOVE_ITEM': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.itemId, (item) => {
          const dx = action.position.x - item.position.x;
          const dy = action.position.y - item.position.y;
          // Move the item itself
          const moved = {
            ...item,
            position: action.position,
            ...(isCard(item) ? { updatedAt: Date.now() } : {}),
          };
          // If it's a container, also offset all child positions by the same delta
          if (isContainer(moved) && (dx !== 0 || dy !== 0)) {
            moved.contents = offsetChildPositions(moved.contents, dx, dy);
          }
          return moved;
        }),
      };
    }

    case 'RESIZE_ITEM': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.itemId, (item) => ({
          ...item,
          size: action.size,
          ...(isCard(item) ? { updatedAt: Date.now() } : {}),
        })),
      };
    }

    case 'UPDATE_CARD': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.cardId, (item) => {
          if (!isCard(item)) return item;
          return { ...item, ...action.updates, updatedAt: Date.now() };
        }),
      };
    }

    case 'CHANGE_CARD_TYPE': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.cardId, (item) => {
          if (!isCard(item)) return item;
          return {
            ...item,
            card_type: action.newType,
            content: getDefaultContent(action.newType),
            updatedAt: Date.now(),
          };
        }),
      };
    }

    case 'ADD_CONTAINER': {
      if (action.parentContainerId) {
        return {
          ...state,
          collection: addItemToContainer(
            state.collection,
            action.parentContainerId,
            action.container,
          ),
        };
      }
      return {
        ...state,
        collection: [...state.collection, action.container],
      };
    }

    case 'NEST_ITEM': {
      const [withoutItem, movedItem] = removeItemFromTree(
        state.collection,
        action.itemId,
      );
      if (!movedItem) return state;
      return {
        ...state,
        collection: addItemToContainer(withoutItem, action.containerId, movedItem),
      };
    }

    case 'UNNEST_ITEM': {
      const [withoutItem, movedItem] = removeItemFromContainer(
        state.collection,
        action.containerId,
        action.itemId,
      );
      if (!movedItem) return state;
      return {
        ...state,
        collection: [...withoutItem, movedItem],
      };
    }

    case 'ADD_LINK': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.cardId, (item) => {
          if (!isCard(item)) return item;
          return {
            ...item,
            card_link: [...item.card_link, action.link],
            updatedAt: Date.now(),
          };
        }),
      };
    }

    case 'REMOVE_LINK': {
      return {
        ...state,
        collection: updateItemInTree(state.collection, action.cardId, (item) => {
          if (!isCard(item)) return item;
          return {
            ...item,
            card_link: item.card_link.filter((l: CardLink) => l.link_id !== action.linkId),
            updatedAt: Date.now(),
          };
        }),
      };
    }

    case 'PAN':
      return {
        ...state,
        viewport: { ...state.viewport, panX: action.panX, panY: action.panY },
      };

    case 'ZOOM': {
      const clamped = Math.max(0.25, Math.min(4.0, action.zoom));
      return {
        ...state,
        viewport: { ...state.viewport, zoom: clamped },
      };
    }

    case 'SET_BOARD':
      return action.state;

    case 'RENAME_BOARD':
      return { ...state, name: action.name };

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// History reducer
// ---------------------------------------------------------------------------

type HistoryAction =
  | { type: 'UNDO' }
  | { type: 'REDO' }
  | { type: 'BOARD_ACTION'; action: BoardAction };

function isViewportOnly(action: BoardAction): boolean {
  return action.type === 'PAN' || action.type === 'ZOOM';
}

export function historyReducer(state: HistoryState, action: HistoryAction): HistoryState {
  switch (action.type) {
    case 'UNDO': {
      if (state.past.length === 0) return state;
      const previous = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      return {
        past: newPast,
        present: previous,
        future: [state.present, ...state.future],
      };
    }

    case 'REDO': {
      if (state.future.length === 0) return state;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      return {
        past: [...state.past, state.present],
        present: next,
        future: newFuture,
      };
    }

    case 'BOARD_ACTION': {
      const newPresent = boardReducer(state.present, action.action);
      if (newPresent === state.present) return state;

      // Viewport-only changes (pan/zoom) don't push to history
      if (isViewportOnly(action.action)) {
        return { ...state, present: newPresent };
      }

      // SET_BOARD replaces entirely, no history push
      if (action.action.type === 'SET_BOARD') {
        return { past: [], present: newPresent, future: [] };
      }

      const newPast = [...state.past, state.present];
      // Keep only last MAX_HISTORY entries
      if (newPast.length > MAX_HISTORY) {
        newPast.splice(0, newPast.length - MAX_HISTORY);
      }

      return {
        past: newPast,
        present: newPresent,
        future: [],
      };
    }

    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseBoardReducerResult {
  state: BoardState;
  dispatch: (action: BoardAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useBoardReducer(initialState?: BoardState): UseBoardReducerResult {
  const initialHistory: HistoryState = {
    past: [],
    present: initialState || DEFAULT_BOARD_STATE,
    future: [],
  };

  const [history, historyDispatch] = useReducer(historyReducer, initialHistory);

  const dispatch = useCallback((action: BoardAction) => {
    historyDispatch({ type: 'BOARD_ACTION', action });
  }, [historyDispatch]);

  const undo = useCallback(() => {
    historyDispatch({ type: 'UNDO' });
  }, [historyDispatch]);

  const redo = useCallback(() => {
    historyDispatch({ type: 'REDO' });
  }, [historyDispatch]);

  return {
    state: history.present,
    dispatch,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
