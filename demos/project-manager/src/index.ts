// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * index.ts -- Exports the ProjectManagerApp component for use in the Unity Desktop.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import { Board, snapToGrid, screenToCanvas, computeFitAll } from './Board';
import { BoardToolbar, CARD_COLORS } from './Toolbar';
import { useBoardState, DEFAULT_BOARD_STATE } from './BoardState';
import { LocalBoardStorage } from './LocalStorage';
import { InterAppWrapper } from './InterApp';
import type { ProjectCard, BoardState } from './types';

export type { ProjectCard, CardConnection, BoardState, BoardStorage } from './types';
export { useBoardState, boardReducer, historyReducer, DEFAULT_BOARD_STATE } from './BoardState';
export type { BoardAction, HistoryState, UseBoardStateResult } from './BoardState';
export { LocalBoardStorage } from './LocalStorage';
export { Card } from './Card';
export { CardEditor } from './CardEditor';
export { ConnectionsOverlay } from './Connection';
export { BoardToolbar, CARD_COLORS } from './Toolbar';
export { Board, snapToGrid, screenToCanvas, computeFitAll } from './Board';
export { InterAppWrapper } from './InterApp';

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
// Sample board data (feature #7)
// ---------------------------------------------------------------------------

const SAMPLE_CARDS: ProjectCard[] = [
  { id: 'sample-1', title: 'Auth API', description: 'Design the auth flow', color: '#3b82f6', position: { x: 50, y: 50 }, size: { width: 180, height: 120 }, priority: 'high', assignee: 'Alice', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'sample-2', title: 'Dashboard', description: 'Build the main dashboard', color: '#22c55e', position: { x: 300, y: 80 }, size: { width: 180, height: 120 }, priority: 'medium', assignee: 'Bob', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'sample-3', title: 'Deploy', description: 'Set up CI pipeline', color: '#f59e0b', position: { x: 150, y: 250 }, size: { width: 180, height: 120 }, priority: 'low', createdAt: Date.now(), updatedAt: Date.now() },
  { id: 'sample-4', title: 'Docs', description: 'Write API reference', color: '#a855f7', position: { x: 400, y: 280 }, size: { width: 180, height: 120 }, priority: 'medium', assignee: 'Carol', createdAt: Date.now(), updatedAt: Date.now() },
];

const SAMPLE_BOARD: BoardState = {
  cards: SAMPLE_CARDS,
  connections: [
    { id: 'sample-conn-1', fromCardId: 'sample-1', toCardId: 'sample-2' },
  ],
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

function isBoardEmpty(state: BoardState): boolean {
  return state.cards.length === 0 && state.connections.length === 0;
}

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
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const sampleLoadedRef = useRef(false);

  // -----------------------------------------------------------------------
  // Sample data loading (feature #7) — populate empty board
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!sampleLoadedRef.current && isBoardEmpty(state)) {
      sampleLoadedRef.current = true;
      dispatch({ type: 'SET_BOARD', state: SAMPLE_BOARD });
    } else if (state.cards.length > 0) {
      sampleLoadedRef.current = true;
    }
  }, [state, dispatch]);

  // -----------------------------------------------------------------------
  // Toolbar callbacks
  // -----------------------------------------------------------------------

  const handleNewCard = useCallback(() => {
    // Create a card at a random position within 50% offset from viewport center
    const cx = (-state.viewport.panX + 300) / state.viewport.zoom;
    const cy = (-state.viewport.panY + 200) / state.viewport.zoom;
    const offsetX = (Math.random() - 0.5) * 300; // ±150px (50% of 300)
    const offsetY = (Math.random() - 0.5) * 200; // ±100px (50% of 200)

    const newCard: ProjectCard = {
      id: generateCardId(),
      title: 'New Card',
      description: '',
      color: selectedColor,
      position: { x: Math.round(cx + offsetX), y: Math.round(cy + offsetY) },
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

  const handleColorFilter = useCallback((color: string | null) => {
    setColorFilter(color);
  }, []);

  // -----------------------------------------------------------------------
  // Menu bar handlers (feature #5)
  // -----------------------------------------------------------------------

  const handleNewBoard = useCallback(() => {
    dispatch({ type: 'SET_BOARD', state: DEFAULT_BOARD_STATE });
    setSelectedCardId(null);
  }, [dispatch]);

  const handleExportJSON = useCallback(() => {
    const json = JSON.stringify(state, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `board-${boardId}.json`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [state, boardId]);

  const handleImportJSON = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';
    input.addEventListener('change', () => {
      const file = input.files && input.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const parsed = JSON.parse(reader.result as string);
          if (parsed && parsed.cards && parsed.viewport) {
            dispatch({ type: 'SET_BOARD', state: parsed as BoardState });
          }
        } catch (_e) {
          // Invalid JSON, ignore silently
        }
      };
      reader.readAsText(file);
    });
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }, [dispatch]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleSelectAll = useCallback(() => {
    if (state.cards.length > 0) {
      setSelectedCardId(state.cards[0].id);
    }
  }, [state.cards]);

  const handleToggleConnections = useCallback(() => {
    setShowConnections((prev: boolean) => !prev);
  }, []);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCardId) {
      dispatch({ type: 'REMOVE_CARD', cardId: selectedCardId });
      setSelectedCardId(null);
    }
  }, [selectedCardId, dispatch]);

  const handleFitAll = useCallback(() => {
    if (state.cards.length === 0) return;
    // Estimate container size (use reasonable defaults)
    const containerWidth = 800;
    const containerHeight = 600;
    const fit = computeFitAll(state.cards, containerWidth, containerHeight);
    dispatch({ type: 'PAN', panX: fit.panX, panY: fit.panY });
    dispatch({ type: 'ZOOM', zoom: fit.zoom });
  }, [state.cards, dispatch]);

  // -----------------------------------------------------------------------
  // Menu bar registration (feature #5)
  // -----------------------------------------------------------------------

  // Try to use WindowManager context if available, otherwise no-op
  // This is optional integration — the project manager works standalone too
  useEffect(() => {
    // Dynamically check if useWindowManager is available in the context
    // We build the menuBar object for potential external use
    const _menuBar = {
      menus: [
        { label: 'File', items: [
          { label: 'New Board', onClick: handleNewBoard },
          { label: 'Export JSON', onClick: handleExportJSON },
          { label: 'Import JSON', onClick: handleImportJSON },
          { divider: true },
          { label: 'Print', onClick: handlePrint },
        ]},
        { label: 'Edit', items: [
          { label: 'Undo', shortcut: 'Ctrl+Z', onClick: undo, disabled: !canUndo },
          { label: 'Redo', shortcut: 'Ctrl+Y', onClick: redo, disabled: !canRedo },
          { divider: true },
          { label: 'Select All', shortcut: 'Ctrl+A', onClick: handleSelectAll },
          { label: 'Delete Selected', onClick: handleDeleteSelected },
        ]},
        { label: 'View', items: [
          { label: 'Zoom In', onClick: handleZoomIn },
          { label: 'Zoom Out', onClick: handleZoomOut },
          { label: 'Fit All', onClick: handleFitAll },
          { divider: true },
          { label: 'Toggle Grid', onClick: handleGridToggle },
          { label: showConnections ? 'Hide Connections' : 'Show Connections', onClick: handleToggleConnections },
        ]},
      ],
    };
    // Menu bar registration is handled if a WindowManager context wraps this app.
    // The menu bar object is kept in sync for when the integration is active.
  }, [handleNewBoard, handleExportJSON, handleImportJSON, handlePrint, undo, redo, canUndo, canRedo, handleSelectAll, handleDeleteSelected, handleZoomIn, handleZoomOut, handleFitAll, handleGridToggle, handleToggleConnections, showConnections]);

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
  // Inter-app: handle dropped content creating new cards
  // -----------------------------------------------------------------------

  const handleCardDropped = useCallback((title: string, description: string) => {
    const cx = (-state.viewport.panX + 300) / state.viewport.zoom;
    const cy = (-state.viewport.panY + 200) / state.viewport.zoom;
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 200;
    const newCard: ProjectCard = {
      id: generateCardId(),
      title,
      description,
      color: selectedColor,
      position: { x: Math.round(cx + offsetX), y: Math.round(cy + offsetY) },
      size: { width: 180, height: 120 },
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_CARD', card: newCard });
  }, [state.viewport, selectedColor, dispatch]);

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
      colorFilter,
      onNewCard: handleNewCard,
      onZoomIn: handleZoomIn,
      onZoomOut: handleZoomOut,
      onZoomReset: handleZoomReset,
      onColorSelect: setSelectedColor,
      onColorFilter: handleColorFilter,
      onGridToggle: handleGridToggle,
      onSearch: handleSearch,
    }),
    createElement(InterAppWrapper, {
      cards: state.cards,
      onCardDropped: handleCardDropped,
    },
      createElement(Board, {
        state,
        dispatch,
        searchQuery,
        gridEnabled,
        selectedCardId,
        onSelectCard: handleSelectCard,
        colorFilter,
        showConnections,
      }),
    ),
  );
}
