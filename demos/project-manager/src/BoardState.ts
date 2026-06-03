// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BoardState.ts -- State management for the whiteboard project manager.
 * Uses useReducer with undo/redo via a history stack (last 50 states).
 */

import { useCallback, useEffect, useRef } from 'specifyjs/hooks';
import { useReducer } from 'specifyjs/hooks';
import type { BoardState, BoardStorage, ProjectCard, CardConnection } from './types';

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export type BoardAction =
  | { type: 'ADD_CARD'; card: ProjectCard }
  | { type: 'REMOVE_CARD'; cardId: string }
  | { type: 'MOVE_CARD'; cardId: string; position: { x: number; y: number } }
  | { type: 'RESIZE_CARD'; cardId: string; size: { width: number; height: number } }
  | { type: 'UPDATE_CARD'; cardId: string; updates: Partial<ProjectCard> }
  | { type: 'DUPLICATE_CARD'; cardId: string; newId: string; offset?: { x: number; y: number } }
  | { type: 'ADD_CONNECTION'; connection: CardConnection }
  | { type: 'REMOVE_CONNECTION'; connectionId: string }
  | { type: 'PAN'; panX: number; panY: number }
  | { type: 'ZOOM'; zoom: number }
  | { type: 'SET_BOARD'; state: BoardState };

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
  id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  name: 'Untitled',
  cards: [],
  connections: [],
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

// ---------------------------------------------------------------------------
// Board reducer (pure state transitions)
// ---------------------------------------------------------------------------

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'ADD_CARD':
      return {
        ...state,
        cards: [...state.cards, action.card],
      };

    case 'REMOVE_CARD':
      return {
        ...state,
        cards: state.cards.filter((c: ProjectCard) => c.id !== action.cardId),
        connections: state.connections.filter(
          (conn: CardConnection) =>
            conn.fromCardId !== action.cardId && conn.toCardId !== action.cardId,
        ),
      };

    case 'MOVE_CARD':
      return {
        ...state,
        cards: state.cards.map((c: ProjectCard) =>
          c.id === action.cardId
            ? { ...c, position: action.position, updatedAt: Date.now() }
            : c,
        ),
      };

    case 'RESIZE_CARD':
      return {
        ...state,
        cards: state.cards.map((c: ProjectCard) =>
          c.id === action.cardId
            ? { ...c, size: action.size, updatedAt: Date.now() }
            : c,
        ),
      };

    case 'UPDATE_CARD':
      return {
        ...state,
        cards: state.cards.map((c: ProjectCard) =>
          c.id === action.cardId
            ? { ...c, ...action.updates, updatedAt: Date.now() }
            : c,
        ),
      };

    case 'DUPLICATE_CARD': {
      const source = state.cards.find((c: ProjectCard) => c.id === action.cardId);
      if (!source) return state;
      const offset = action.offset || { x: 20, y: 20 };
      const duplicate: ProjectCard = {
        ...source,
        id: action.newId,
        position: {
          x: source.position.x + offset.x,
          y: source.position.y + offset.y,
        },
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      return {
        ...state,
        cards: [...state.cards, duplicate],
      };
    }

    case 'ADD_CONNECTION':
      return {
        ...state,
        connections: [...state.connections, action.connection],
      };

    case 'REMOVE_CONNECTION':
      return {
        ...state,
        connections: state.connections.filter(
          (conn: CardConnection) => conn.id !== action.connectionId,
        ),
      };

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

export interface UseBoardStateResult {
  state: BoardState;
  dispatch: (action: BoardAction) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
}

export function useBoardState(storage?: BoardStorage, boardId?: string): UseBoardStateResult {
  const initialHistory: HistoryState = {
    past: [],
    present: DEFAULT_BOARD_STATE,
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

  // Load from storage on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (storage && boardId && !loadedRef.current) {
      loadedRef.current = true;
      storage.load(boardId).then((loaded: BoardState) => {
        dispatch({ type: 'SET_BOARD', state: loaded });
      }).catch(() => {
        // Storage load failed, use default state
      });
    }
  }, [storage, boardId, dispatch]);

  // Auto-save with debounce (500ms)
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef(history.present);
  stateRef.current = history.present;

  useEffect(() => {
    if (!storage || !boardId) return;

    if (saveTimerRef.current !== null) {
      clearTimeout(saveTimerRef.current);
    }

    saveTimerRef.current = setTimeout(() => {
      storage.save(boardId, stateRef.current).catch(() => {
        // Save failed silently
      });
      saveTimerRef.current = null;
    }, 500);

    return () => {
      if (saveTimerRef.current !== null) {
        clearTimeout(saveTimerRef.current);
      }
    };
  }, [storage, boardId, history.present]);

  return {
    state: history.present,
    dispatch,
    undo,
    redo,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
  };
}
