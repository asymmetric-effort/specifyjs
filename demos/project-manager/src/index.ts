// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * index.ts -- Exports the ProjectManagerApp component for use in the Unity Desktop.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import { Board } from './Board';
import { BoardToolbar, CARD_COLORS } from './Toolbar';
import { useBoardState } from './BoardState';
import { LocalBoardStorage } from './LocalStorage';
import type { ProjectCard } from './types';

export type { ProjectCard, CardConnection, BoardState, BoardStorage } from './types';
export { useBoardState, boardReducer, historyReducer, DEFAULT_BOARD_STATE } from './BoardState';
export type { BoardAction, HistoryState, UseBoardStateResult } from './BoardState';
export { LocalBoardStorage } from './LocalStorage';
export { Card } from './Card';
export { CardEditor } from './CardEditor';
export { ConnectionsOverlay } from './Connection';
export { BoardToolbar, CARD_COLORS } from './Toolbar';
export { Board } from './Board';

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

let cardIdCounter = 0;

function generateCardId(): string {
  cardIdCounter++;
  return `card-${Date.now()}-${cardIdCounter}`;
}

// ---------------------------------------------------------------------------
// Storage singleton
// ---------------------------------------------------------------------------

const storage = new LocalBoardStorage();

// ---------------------------------------------------------------------------
// ProjectManagerApp
// ---------------------------------------------------------------------------

export interface ProjectManagerAppProps {
  boardId?: string;
}

export function ProjectManagerApp(props: ProjectManagerAppProps) {
  const boardId = props.boardId || 'default';
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBoardState(storage, boardId);

  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  // -----------------------------------------------------------------------
  // Toolbar callbacks
  // -----------------------------------------------------------------------

  const handleNewCard = useCallback(() => {
    // Create a card at the viewport center
    const cx = (-state.viewport.panX + 300) / state.viewport.zoom;
    const cy = (-state.viewport.panY + 200) / state.viewport.zoom;

    const newCard: ProjectCard = {
      id: generateCardId(),
      title: 'New Card',
      description: '',
      color: selectedColor,
      position: { x: Math.round(cx), y: Math.round(cy) },
      size: { width: 180, height: 120 },
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'ADD_CARD', card: newCard });
  }, [state.viewport, selectedColor, dispatch]);

  const handleZoomIn = useCallback(() => {
    dispatch({ type: 'ZOOM', zoom: state.viewport.zoom + 0.1 });
  }, [state.viewport.zoom, dispatch]);

  const handleZoomOut = useCallback(() => {
    dispatch({ type: 'ZOOM', zoom: state.viewport.zoom - 0.1 });
  }, [state.viewport.zoom, dispatch]);

  const handleZoomReset = useCallback(() => {
    dispatch({ type: 'ZOOM', zoom: 1 });
  }, [dispatch]);

  const handleGridToggle = useCallback(() => {
    setGridEnabled((prev: boolean) => !prev);
  }, []);

  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const handleSelectCard = useCallback((cardId: string | null) => {
    setSelectedCardId(cardId);
  }, []);

  // -----------------------------------------------------------------------
  // Keyboard shortcuts
  // -----------------------------------------------------------------------

  useEffect(() => {
    const handleKeyDown = (e: Event) => {
      const ke = e as KeyboardEvent;
      if (ke.ctrlKey && ke.key === 'z') {
        ke.preventDefault();
        undo();
      } else if (ke.ctrlKey && ke.key === 'y') {
        ke.preventDefault();
        redo();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  // -----------------------------------------------------------------------
  // Styles
  // -----------------------------------------------------------------------

  const containerStyle: Record<string, string> = {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    backgroundColor: '#f8fafc',
    overflow: 'hidden',
  };

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  return createElement('div', {
    className: 'project-manager-app',
    style: containerStyle,
    'data-testid': 'project-manager-app',
  },
    createElement(BoardToolbar, {
      zoom: state.viewport.zoom,
      gridEnabled,
      selectedColor,
      onNewCard: handleNewCard,
      onZoomIn: handleZoomIn,
      onZoomOut: handleZoomOut,
      onZoomReset: handleZoomReset,
      onColorSelect: setSelectedColor,
      onGridToggle: handleGridToggle,
      onSearch: handleSearch,
    }),
    createElement(Board, {
      state,
      dispatch,
      searchQuery,
      gridEnabled,
      selectedCardId,
      onSelectCard: handleSelectCard,
    }),
  );
}
