// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * index.ts -- Exports the ProjectManagerApp component for use in the Unity Desktop.
 * This is a thin wrapper around the reusable Board component library,
 * providing sample data, toolbar config, and the app shell.
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useRef, useEffect } from 'specifyjs/hooks';
import { Board, snapToGrid, screenToCanvas, computeFitAll } from './Board';
import { BoardToolbar, CARD_COLORS } from './Toolbar';
import { useBoardState, DEFAULT_BOARD_STATE } from './BoardState';
import { LocalBoardStorage } from './LocalStorage';
import { InterAppWrapper } from './InterApp';
import type { Card, BoardState, BoardItem } from './types';
import { generateUUID, isCard, isContainer } from './types';

// Only export the app component — consumers should import the reusable
// board library directly from components/data/board/ for types and utilities.
// Re-exporting caused circular chunk references in the Vite build.

// ---------------------------------------------------------------------------
// Storage singleton
// ---------------------------------------------------------------------------

const storage = new LocalBoardStorage();

// ---------------------------------------------------------------------------
// Helper: collect all cards from the BoardItem tree
// ---------------------------------------------------------------------------

function collectAllCards(items: BoardItem[]): Card[] {
  const cards: Card[] = [];
  const stack: BoardItem[] = [...items];
  while (stack.length > 0) {
    const item = stack.pop()!;
    if (isCard(item)) {
      cards.push(item);
    } else if (isContainer(item)) {
      for (let i = item.contents.length - 1; i >= 0; i--) {
        stack.push(item.contents[i]);
      }
    }
  }
  return cards;
}

// ---------------------------------------------------------------------------
// Sample board data (feature #7)
// ---------------------------------------------------------------------------

const now = Date.now();

const SAMPLE_BOARD: BoardState = {
  id: 'sample-board-001',
  name: 'Sample Project',
  collection: [
    {
      type: 'card',
      card_id: 'sample-1',
      card_type: 'text',
      card_title: 'Auth API',
      card_link: [
        { link_id: 'link-1', link_name: 'blocks', target_card_id: 'sample-2', color: '#94a3b8', attributes: {} },
      ],
      content: { text: 'Design the auth flow' },
      position: { x: 50, y: 50 },
      size: { width: 180, height: 120 },
      color: '#3b82f6',
      priority: 'high',
      assignee: 'Alice',
      createdAt: now,
      updatedAt: now,
    },
    {
      type: 'card',
      card_id: 'sample-2',
      card_type: 'text',
      card_title: 'Dashboard',
      card_link: [],
      content: { text: 'Build the main dashboard' },
      position: { x: 300, y: 80 },
      size: { width: 180, height: 120 },
      color: '#22c55e',
      priority: 'medium',
      assignee: 'Bob',
      createdAt: now,
      updatedAt: now,
    },
    {
      type: 'card',
      card_id: 'sample-3',
      card_type: 'text',
      card_title: 'Deploy',
      card_link: [],
      content: { text: 'Set up CI pipeline' },
      position: { x: 150, y: 250 },
      size: { width: 180, height: 120 },
      color: '#f59e0b',
      priority: 'low',
      createdAt: now,
      updatedAt: now,
    },
    {
      type: 'card',
      card_id: 'sample-4',
      card_type: 'text',
      card_title: 'Docs',
      card_link: [],
      content: { text: 'Write API reference' },
      position: { x: 400, y: 280 },
      size: { width: 180, height: 120 },
      color: '#a855f7',
      priority: 'medium',
      assignee: 'Carol',
      createdAt: now,
      updatedAt: now,
    },
  ] as Card[],
  viewport: { panX: 0, panY: 0, zoom: 1 },
};

function isBoardEmpty(state: BoardState): boolean {
  return state.collection.length === 0;
}

// ---------------------------------------------------------------------------
// ProjectManagerApp
// ---------------------------------------------------------------------------

export interface ProjectManagerAppProps {
  boardId?: string;
  /** Called when the project name changes — consumer should update the window title */
  onTitleChange?: (title: string) => void;
}

export function ProjectManagerApp(props: ProjectManagerAppProps) {
  const boardId = props.boardId || 'default';
  const { state, dispatch, undo, redo, canUndo, canRedo } = useBoardState(storage, boardId);

  const [selectedColor, setSelectedColor] = useState(CARD_COLORS[0]);
  const [gridEnabled, setGridEnabled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [colorFilter, setColorFilter] = useState<string | null>(null);
  const [projectName, setProjectName] = useState(state.name || 'Untitled');
  const [showRenameDialog, setShowRenameDialog] = useState(false);
  const [renameDraft, setRenameDraft] = useState('');
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [showConnections, setShowConnections] = useState(true);
  const sampleLoadedRef = useRef(false);

  // -----------------------------------------------------------------------
  // Sample data loading (feature #7) -- populate empty board
  // -----------------------------------------------------------------------

  useEffect(() => {
    if (!sampleLoadedRef.current && isBoardEmpty(state)) {
      sampleLoadedRef.current = true;
      dispatch({ type: 'SET_BOARD', state: SAMPLE_BOARD });
    } else if (state.collection.length > 0) {
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
    const offsetX = (Math.random() - 0.5) * 300; // +/-150px (50% of 300)
    const offsetY = (Math.random() - 0.5) * 200; // +/-100px (50% of 200)

    const newCard: Card = {
      type: 'card',
      card_id: generateUUID(),
      card_type: 'text',
      card_title: 'New Card',
      card_link: [],
      content: { text: '' },
      color: selectedColor,
      position: { x: Math.round(cx + offsetX), y: Math.round(cy + offsetY) },
      size: { width: 180, height: 120 },
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    dispatch({ type: 'ADD_ITEM', item: newCard });
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

  const handleToggleConnections = useCallback(() => {
    setShowConnections((prev: boolean) => !prev);
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
          if (parsed && parsed.collection && parsed.viewport) {
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

  const allCards = collectAllCards(state.collection);

  const handleSelectAll = useCallback(() => {
    const cards = collectAllCards(state.collection);
    if (cards.length > 0) {
      setSelectedCardId(cards[0].card_id);
    }
  }, [state.collection]);

  const handleDeleteSelected = useCallback(() => {
    if (selectedCardId) {
      dispatch({ type: 'REMOVE_ITEM', itemId: selectedCardId });
      setSelectedCardId(null);
    }
  }, [selectedCardId, dispatch]);

  const handleFitAll = useCallback(() => {
    if (state.collection.length === 0) return;
    // Estimate container size (use reasonable defaults)
    const containerWidth = 800;
    const containerHeight = 600;
    const fit = computeFitAll(state.collection, containerWidth, containerHeight);
    dispatch({ type: 'PAN', panX: fit.panX, panY: fit.panY });
    dispatch({ type: 'ZOOM', zoom: fit.zoom });
  }, [state.collection, dispatch]);

  // -----------------------------------------------------------------------
  // Menu bar handlers (continued)
  // -----------------------------------------------------------------------

  useEffect(() => {
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
        ]},
      ],
    };
  }, [handleNewBoard, handleExportJSON, handleImportJSON, handlePrint, undo, redo, canUndo, canRedo, handleSelectAll, handleDeleteSelected, handleZoomIn, handleZoomOut, handleFitAll, handleGridToggle]);

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

  // Close app menu dropdown on outside click
  useEffect(() => {
    if (!openMenu) return;
    const handleClick = () => setOpenMenu(null);
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 0);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClick); };
  }, [openMenu]);

  // -----------------------------------------------------------------------
  // Rename project
  // -----------------------------------------------------------------------

  const handleRenameProject = useCallback(() => {
    setRenameDraft(projectName);
    setShowRenameDialog(true);
  }, [projectName]);

  const handleRenameConfirm = useCallback(() => {
    const name = renameDraft.trim();
    if (name) {
      setProjectName(name);
      dispatch({ type: 'RENAME_BOARD', name });
      if (props.onTitleChange) props.onTitleChange(`Project Board: ${name}`);
    }
    setShowRenameDialog(false);
  }, [renameDraft, dispatch, props.onTitleChange]);

  const handleRenameCancel = useCallback(() => {
    setShowRenameDialog(false);
  }, []);

  const handleRenameDraftChange = useCallback((e: Event) => {
    setRenameDraft((e.target as HTMLInputElement).value);
  }, []);

  const handleRenameKeyDown = useCallback((e: Event) => {
    const ke = e as KeyboardEvent;
    if (ke.key === 'Enter') { ke.preventDefault(); handleRenameConfirm(); }
    if (ke.key === 'Escape') { ke.preventDefault(); handleRenameCancel(); }
  }, [handleRenameConfirm, handleRenameCancel]);

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
    const newCard: Card = {
      type: 'card',
      card_id: generateUUID(),
      card_type: 'text',
      card_title: title,
      card_link: [],
      content: { text: description },
      color: selectedColor,
      position: { x: Math.round(cx + offsetX), y: Math.round(cy + offsetY) },
      size: { width: 180, height: 120 },
      priority: 'medium',
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    dispatch({ type: 'ADD_ITEM', item: newCard });
  }, [state.viewport, selectedColor, dispatch]);

  // -----------------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------------

  const menuBarStyle: Record<string, string> = {
    display: 'flex',
    alignItems: 'center',
    height: '28px',
    backgroundColor: '#f1f5f9',
    borderBottom: '1px solid #e2e8f0',
    padding: '0 8px',
    fontSize: '13px',
    flexShrink: '0',
  };

  const menuBtnStyle: Record<string, string> = {
    padding: '2px 10px',
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: '13px',
    color: '#334155',
    borderRadius: '4px',
    fontFamily: 'inherit',
  };

  // -----------------------------------------------------------------------
  // App menu dropdowns
  // -----------------------------------------------------------------------

  const handleNewContainer = useCallback(() => {
    const cx = (-state.viewport.panX + 300) / state.viewport.zoom;
    const cy = (-state.viewport.panY + 200) / state.viewport.zoom;
    const offsetX = (Math.random() - 0.5) * 300;
    const offsetY = (Math.random() - 0.5) * 200;
    dispatch({
      type: 'ADD_CONTAINER',
      container: {
        type: 'container',
        container_id: generateUUID(),
        name: 'New Container',
        position: { x: Math.round(cx + offsetX), y: Math.round(cy + offsetY) },
        size: { width: 300, height: 250 },
        contents: [],
      },
    });
    setOpenMenu(null);
  }, [state.viewport, dispatch]);

  const menuDropdownStyle: Record<string, string> = {
    position: 'absolute',
    top: '100%',
    left: '0',
    marginTop: '2px',
    backgroundColor: '#ffffff',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    padding: '4px 0',
    minWidth: '180px',
    zIndex: '1000',
  };

  const menuDropdownItemStyle: Record<string, string> = {
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
  };

  const appMenuBar = createElement('div', {
    style: menuBarStyle,
    'data-testid': 'app-menu-bar',
  },
    // Project menu
    createElement('div', { style: { position: 'relative', display: 'inline-flex' } },
      createElement('button', {
        style: menuBtnStyle,
        onClick: () => setOpenMenu(openMenu === 'project' ? null : 'project'),
      }, 'Project'),
      openMenu === 'project' ? createElement('div', { style: menuDropdownStyle },
        createElement('button', { style: menuDropdownItemStyle, onClick: () => { handleRenameProject(); setOpenMenu(null); } }, 'Rename Project...'),
        createElement('div', { style: { height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' } }),
        createElement('button', { style: menuDropdownItemStyle, onClick: () => { handleNewContainer(); } }, 'New Container'),
        createElement('button', { style: menuDropdownItemStyle, onClick: () => { handleNewCard(); setOpenMenu(null); } }, 'New Card'),
      ) : null,
    ),
    // Settings menu
    createElement('div', { style: { position: 'relative', display: 'inline-flex' } },
      createElement('button', {
        style: menuBtnStyle,
        onClick: () => setOpenMenu(openMenu === 'settings' ? null : 'settings'),
      }, 'Settings'),
      openMenu === 'settings' ? createElement('div', { style: menuDropdownStyle },
        createElement('button', { style: menuDropdownItemStyle, onClick: () => { handleGridToggle(); setOpenMenu(null); } },
          gridEnabled ? 'Disable Grid Snap' : 'Enable Grid Snap'),
        createElement('button', { style: menuDropdownItemStyle, onClick: () => { handleToggleConnections(); setOpenMenu(null); } },
          showConnections ? 'Hide Links' : 'Show Links'),
      ) : null,
    ),
    // Help menu
    createElement('div', { style: { position: 'relative', display: 'inline-flex' } },
      createElement('button', {
        style: menuBtnStyle,
        onClick: () => setOpenMenu(openMenu === 'help' ? null : 'help'),
      }, 'Help'),
      openMenu === 'help' ? createElement('div', { style: menuDropdownStyle },
        createElement('button', { style: menuDropdownItemStyle, onClick: () => setOpenMenu(null) }, 'About Project Board'),
        createElement('button', { style: menuDropdownItemStyle, onClick: () => setOpenMenu(null) }, 'Keyboard Shortcuts'),
      ) : null,
    ),
    createElement('span', {
      style: { marginLeft: 'auto', fontSize: '12px', color: '#94a3b8' },
    }, `Project Board: ${projectName}`),
  );

  // -----------------------------------------------------------------------
  // Rename dialog
  // -----------------------------------------------------------------------

  const renameDialogEl = showRenameDialog ? createElement('div', {
    style: {
      position: 'absolute',
      inset: '0',
      backgroundColor: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: '200',
    },
    onClick: handleRenameCancel,
  },
    createElement('div', {
      style: {
        backgroundColor: '#ffffff',
        borderRadius: '8px',
        padding: '20px',
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        minWidth: '300px',
      },
      onClick: (e: Event) => e.stopPropagation(),
      role: 'dialog',
      'aria-label': 'Rename project',
    },
      createElement('div', {
        style: { fontWeight: '600', fontSize: '14px', marginBottom: '12px', color: '#1a1a1a' },
      }, 'Rename Project'),
      createElement('input', {
        type: 'text',
        value: renameDraft,
        onInput: handleRenameDraftChange,
        onKeyDown: handleRenameKeyDown,
        autoFocus: true,
        style: {
          width: '100%',
          padding: '8px 10px',
          border: '1px solid #d1d5db',
          borderRadius: '6px',
          fontSize: '14px',
          boxSizing: 'border-box',
          outline: 'none',
          fontFamily: 'inherit',
        },
        'data-testid': 'rename-input',
      }),
      createElement('div', {
        style: { display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '12px' },
      },
        createElement('button', {
          onClick: handleRenameCancel,
          style: {
            padding: '6px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            backgroundColor: '#ffffff',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'inherit',
          },
        }, 'Cancel'),
        createElement('button', {
          onClick: handleRenameConfirm,
          style: {
            padding: '6px 14px',
            border: 'none',
            borderRadius: '6px',
            backgroundColor: '#3b82f6',
            color: '#ffffff',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '600',
            fontFamily: 'inherit',
          },
          'data-testid': 'rename-confirm',
        }, 'Rename'),
      ),
    ),
  ) : null;

  return createElement('div', {
    className: 'project-manager-app',
    style: containerStyle,
    'data-testid': 'project-manager-app',
  },
    appMenuBar,
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
      collection: state.collection,
      onCardDropped: handleCardDropped,
    },
      createElement(Board, {
        state,
        dispatch,
        searchQuery,
        gridEnabled,
        selectedId: selectedCardId,
        onSelectItem: handleSelectCard,
        colorFilter,
        onUpdateItem: (cardId: string, updates: { card_title?: string; content?: unknown }) => {
          dispatch({ type: 'UPDATE_CARD', cardId, updates });
        },
        onCardContextMenu: (cardId: string, pos: { x: number; y: number }) => {
          // Context menu handled by Board internally for now
        },
      }),
    ),
    renameDialogEl,
  );
}
