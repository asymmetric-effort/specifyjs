// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * BoardState.ts -- Re-exports state management from the reusable Board component library.
 * Adds a thin wrapper (useBoardState) that integrates storage load/save.
 */

import { useCallback, useEffect, useRef } from 'specifyjs/hooks';
import type { BoardState } from './types';
import type { BoardStorage } from './types';

// Re-export everything from the reusable library
export type { BoardAction, HistoryState, UseBoardReducerResult } from '../../../components/data/board/src/BoardReducer';
export { boardReducer, historyReducer, useBoardReducer, DEFAULT_BOARD_STATE } from '../../../components/data/board/src/BoardReducer';

// Alias for backwards compatibility
export type UseBoardStateResult = import('../../../components/data/board/src/BoardReducer').UseBoardReducerResult;

// ---------------------------------------------------------------------------
// Hook: useBoardState -- wraps useBoardReducer with storage integration
// ---------------------------------------------------------------------------

import { useBoardReducer } from '../../../components/data/board/src/BoardReducer';
import type { BoardAction } from '../../../components/data/board/src/BoardReducer';

export function useBoardState(storage?: BoardStorage, boardId?: string): import('../../../components/data/board/src/BoardReducer').UseBoardReducerResult {
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBoardReducer();

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
  const stateRef = useRef(state);
  stateRef.current = state;

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
  }, [storage, boardId, state]);

  return {
    state,
    dispatch,
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
