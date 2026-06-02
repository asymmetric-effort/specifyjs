// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  boardReducer,
  historyReducer,
  DEFAULT_BOARD_STATE,
} from '../src/BoardState';
import type { BoardAction, HistoryState } from '../src/BoardState';
import type { BoardState, ProjectCard, CardConnection } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCard(overrides: Partial<ProjectCard> = {}): ProjectCard {
  return {
    id: 'card-1',
    title: 'Test Card',
    description: 'A test card',
    color: '#fef9c3',
    position: { x: 100, y: 100 },
    size: { width: 180, height: 120 },
    priority: 'medium',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function makeConnection(overrides: Partial<CardConnection> = {}): CardConnection {
  return {
    id: 'conn-1',
    fromCardId: 'card-1',
    toCardId: 'card-2',
    ...overrides,
  };
}

function makeState(overrides: Partial<BoardState> = {}): BoardState {
  return {
    ...DEFAULT_BOARD_STATE,
    ...overrides,
  };
}

function makeHistory(present?: BoardState): HistoryState {
  return {
    past: [],
    present: present || DEFAULT_BOARD_STATE,
    future: [],
  };
}

// ---------------------------------------------------------------------------
// boardReducer tests
// ---------------------------------------------------------------------------

describe('boardReducer', () => {
  it('should return initial state for unknown action', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'UNKNOWN' } as unknown as BoardAction);
    expect(result).toBe(state);
  });

  // ADD_CARD
  describe('ADD_CARD', () => {
    it('should add a card to empty board', () => {
      const card = makeCard();
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'ADD_CARD', card });
      expect(result.cards).toHaveLength(1);
      expect(result.cards[0]).toBe(card);
    });

    it('should append card to existing cards', () => {
      const card1 = makeCard({ id: 'card-1' });
      const card2 = makeCard({ id: 'card-2' });
      const state = makeState({ cards: [card1] });
      const result = boardReducer(state, { type: 'ADD_CARD', card: card2 });
      expect(result.cards).toHaveLength(2);
      expect(result.cards[1].id).toBe('card-2');
    });

    it('should not modify connections or viewport', () => {
      const card = makeCard();
      const state = makeState({ viewport: { panX: 50, panY: 50, zoom: 1.5 } });
      const result = boardReducer(state, { type: 'ADD_CARD', card });
      expect(result.viewport).toEqual({ panX: 50, panY: 50, zoom: 1.5 });
      expect(result.connections).toEqual([]);
    });
  });

  // REMOVE_CARD
  describe('REMOVE_CARD', () => {
    it('should remove a card by id', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, { type: 'REMOVE_CARD', cardId: 'card-1' });
      expect(result.cards).toHaveLength(0);
    });

    it('should remove associated connections when card is removed', () => {
      const card1 = makeCard({ id: 'card-1' });
      const card2 = makeCard({ id: 'card-2' });
      const conn = makeConnection({ id: 'conn-1', fromCardId: 'card-1', toCardId: 'card-2' });
      const state = makeState({ cards: [card1, card2], connections: [conn] });
      const result = boardReducer(state, { type: 'REMOVE_CARD', cardId: 'card-1' });
      expect(result.cards).toHaveLength(1);
      expect(result.connections).toHaveLength(0);
    });

    it('should not modify state if card not found', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, { type: 'REMOVE_CARD', cardId: 'nonexistent' });
      expect(result.cards).toHaveLength(1);
    });

    it('should remove connections where card is target', () => {
      const card1 = makeCard({ id: 'card-1' });
      const card2 = makeCard({ id: 'card-2' });
      const conn = makeConnection({ fromCardId: 'card-2', toCardId: 'card-1' });
      const state = makeState({ cards: [card1, card2], connections: [conn] });
      const result = boardReducer(state, { type: 'REMOVE_CARD', cardId: 'card-1' });
      expect(result.connections).toHaveLength(0);
    });
  });

  // MOVE_CARD
  describe('MOVE_CARD', () => {
    it('should update card position', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'MOVE_CARD',
        cardId: 'card-1',
        position: { x: 200, y: 300 },
      });
      expect(result.cards[0].position).toEqual({ x: 200, y: 300 });
    });

    it('should update the updatedAt timestamp', () => {
      const card = makeCard({ updatedAt: 1000 });
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'MOVE_CARD',
        cardId: 'card-1',
        position: { x: 200, y: 300 },
      });
      expect(result.cards[0].updatedAt).toBeGreaterThan(1000);
    });

    it('should not modify other cards', () => {
      const card1 = makeCard({ id: 'card-1' });
      const card2 = makeCard({ id: 'card-2', position: { x: 50, y: 50 } });
      const state = makeState({ cards: [card1, card2] });
      const result = boardReducer(state, {
        type: 'MOVE_CARD',
        cardId: 'card-1',
        position: { x: 200, y: 300 },
      });
      expect(result.cards[1].position).toEqual({ x: 50, y: 50 });
    });
  });

  // RESIZE_CARD
  describe('RESIZE_CARD', () => {
    it('should update card size', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'RESIZE_CARD',
        cardId: 'card-1',
        size: { width: 250, height: 180 },
      });
      expect(result.cards[0].size).toEqual({ width: 250, height: 180 });
    });

    it('should update the updatedAt timestamp', () => {
      const card = makeCard({ updatedAt: 1000 });
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'RESIZE_CARD',
        cardId: 'card-1',
        size: { width: 250, height: 180 },
      });
      expect(result.cards[0].updatedAt).toBeGreaterThan(1000);
    });
  });

  // UPDATE_CARD
  describe('UPDATE_CARD', () => {
    it('should update card title', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { title: 'Updated Title' },
      });
      expect(result.cards[0].title).toBe('Updated Title');
    });

    it('should update card description', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { description: 'New desc' },
      });
      expect(result.cards[0].description).toBe('New desc');
    });

    it('should update card color', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { color: '#ff0000' },
      });
      expect(result.cards[0].color).toBe('#ff0000');
    });

    it('should update card priority', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { priority: 'critical' },
      });
      expect(result.cards[0].priority).toBe('critical');
    });

    it('should update card tags', () => {
      const card = makeCard();
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { tags: ['frontend', 'urgent'] },
      });
      expect(result.cards[0].tags).toEqual(['frontend', 'urgent']);
    });

    it('should update the updatedAt timestamp', () => {
      const card = makeCard({ updatedAt: 1000 });
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { title: 'Changed' },
      });
      expect(result.cards[0].updatedAt).toBeGreaterThan(1000);
    });

    it('should preserve other card fields', () => {
      const card = makeCard({ title: 'Original', description: 'Orig desc' });
      const state = makeState({ cards: [card] });
      const result = boardReducer(state, {
        type: 'UPDATE_CARD',
        cardId: 'card-1',
        updates: { title: 'Changed' },
      });
      expect(result.cards[0].description).toBe('Orig desc');
      expect(result.cards[0].color).toBe('#fef9c3');
    });
  });

  // ADD_CONNECTION
  describe('ADD_CONNECTION', () => {
    it('should add a connection', () => {
      const conn = makeConnection();
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'ADD_CONNECTION', connection: conn });
      expect(result.connections).toHaveLength(1);
      expect(result.connections[0]).toBe(conn);
    });

    it('should append to existing connections', () => {
      const conn1 = makeConnection({ id: 'conn-1' });
      const conn2 = makeConnection({ id: 'conn-2' });
      const state = makeState({ connections: [conn1] });
      const result = boardReducer(state, { type: 'ADD_CONNECTION', connection: conn2 });
      expect(result.connections).toHaveLength(2);
    });
  });

  // REMOVE_CONNECTION
  describe('REMOVE_CONNECTION', () => {
    it('should remove a connection by id', () => {
      const conn = makeConnection();
      const state = makeState({ connections: [conn] });
      const result = boardReducer(state, { type: 'REMOVE_CONNECTION', connectionId: 'conn-1' });
      expect(result.connections).toHaveLength(0);
    });

    it('should not modify state if connection not found', () => {
      const conn = makeConnection();
      const state = makeState({ connections: [conn] });
      const result = boardReducer(state, { type: 'REMOVE_CONNECTION', connectionId: 'nonexistent' });
      expect(result.connections).toHaveLength(1);
    });
  });

  // PAN
  describe('PAN', () => {
    it('should update viewport pan', () => {
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'PAN', panX: 100, panY: 200 });
      expect(result.viewport.panX).toBe(100);
      expect(result.viewport.panY).toBe(200);
    });

    it('should preserve zoom level', () => {
      const state = makeState({ viewport: { panX: 0, panY: 0, zoom: 2.0 } });
      const result = boardReducer(state, { type: 'PAN', panX: 50, panY: 50 });
      expect(result.viewport.zoom).toBe(2.0);
    });
  });

  // ZOOM
  describe('ZOOM', () => {
    it('should update viewport zoom', () => {
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'ZOOM', zoom: 1.5 });
      expect(result.viewport.zoom).toBe(1.5);
    });

    it('should clamp zoom to minimum 0.25', () => {
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'ZOOM', zoom: 0.1 });
      expect(result.viewport.zoom).toBe(0.25);
    });

    it('should clamp zoom to maximum 4.0', () => {
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'ZOOM', zoom: 5.0 });
      expect(result.viewport.zoom).toBe(4.0);
    });

    it('should preserve pan position', () => {
      const state = makeState({ viewport: { panX: 100, panY: 200, zoom: 1.0 } });
      const result = boardReducer(state, { type: 'ZOOM', zoom: 2.0 });
      expect(result.viewport.panX).toBe(100);
      expect(result.viewport.panY).toBe(200);
    });
  });

  // SET_BOARD
  describe('SET_BOARD', () => {
    it('should replace entire state', () => {
      const newState: BoardState = {
        cards: [makeCard()],
        connections: [makeConnection()],
        viewport: { panX: 50, panY: 50, zoom: 2.0 },
      };
      const result = boardReducer(DEFAULT_BOARD_STATE, { type: 'SET_BOARD', state: newState });
      expect(result).toBe(newState);
    });
  });
});

// ---------------------------------------------------------------------------
// historyReducer tests
// ---------------------------------------------------------------------------

describe('historyReducer', () => {
  describe('BOARD_ACTION', () => {
    it('should apply board action and push to history', () => {
      const card = makeCard();
      const history = makeHistory();
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'ADD_CARD', card },
      });
      expect(result.present.cards).toHaveLength(1);
      expect(result.past).toHaveLength(1);
      expect(result.past[0]).toBe(DEFAULT_BOARD_STATE);
    });

    it('should clear future on new action', () => {
      const card1 = makeCard({ id: 'card-1' });
      const card2 = makeCard({ id: 'card-2' });
      const stateWithCard = makeState({ cards: [card1] });
      const history: HistoryState = {
        past: [DEFAULT_BOARD_STATE],
        present: stateWithCard,
        future: [makeState({ cards: [card1, card2] })],
      };
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'REMOVE_CARD', cardId: 'card-1' },
      });
      expect(result.future).toHaveLength(0);
    });

    it('should not push viewport-only actions to history (PAN)', () => {
      const history = makeHistory();
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'PAN', panX: 100, panY: 200 },
      });
      expect(result.past).toHaveLength(0);
      expect(result.present.viewport.panX).toBe(100);
    });

    it('should not push ZOOM to history', () => {
      const history = makeHistory();
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'ZOOM', zoom: 2.0 },
      });
      expect(result.past).toHaveLength(0);
    });

    it('should cap history at 50 entries', () => {
      let history = makeHistory();
      for (let i = 0; i < 55; i++) {
        history = historyReducer(history, {
          type: 'BOARD_ACTION',
          action: { type: 'ADD_CARD', card: makeCard({ id: `card-${i}` }) },
        });
      }
      expect(history.past.length).toBeLessThanOrEqual(50);
    });

    it('should return same state if board action produces no change', () => {
      const state = makeState();
      const history: HistoryState = { past: [], present: state, future: [] };
      // Unknown action returns same state reference
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'UNKNOWN' } as unknown as BoardAction,
      });
      expect(result).toBe(history);
    });

    it('should reset history on SET_BOARD', () => {
      const card = makeCard();
      const history: HistoryState = {
        past: [DEFAULT_BOARD_STATE, DEFAULT_BOARD_STATE],
        present: makeState({ cards: [card] }),
        future: [DEFAULT_BOARD_STATE],
      };
      const newState: BoardState = {
        cards: [],
        connections: [],
        viewport: { panX: 0, panY: 0, zoom: 1 },
      };
      const result = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'SET_BOARD', state: newState },
      });
      expect(result.past).toHaveLength(0);
      expect(result.future).toHaveLength(0);
    });
  });

  describe('UNDO', () => {
    it('should restore previous state', () => {
      const card = makeCard();
      const prev = DEFAULT_BOARD_STATE;
      const current = makeState({ cards: [card] });
      const history: HistoryState = {
        past: [prev],
        present: current,
        future: [],
      };
      const result = historyReducer(history, { type: 'UNDO' });
      expect(result.present.cards).toHaveLength(0);
      expect(result.past).toHaveLength(0);
      expect(result.future).toHaveLength(1);
    });

    it('should do nothing if past is empty', () => {
      const history = makeHistory();
      const result = historyReducer(history, { type: 'UNDO' });
      expect(result).toBe(history);
    });

    it('should push current state to future', () => {
      const card = makeCard();
      const current = makeState({ cards: [card] });
      const history: HistoryState = {
        past: [DEFAULT_BOARD_STATE],
        present: current,
        future: [],
      };
      const result = historyReducer(history, { type: 'UNDO' });
      expect(result.future[0]).toBe(current);
    });

    it('should handle multiple undos', () => {
      const state1 = makeState({ cards: [makeCard({ id: 'c1' })] });
      const state2 = makeState({ cards: [makeCard({ id: 'c1' }), makeCard({ id: 'c2' })] });
      const state3 = makeState({ cards: [makeCard({ id: 'c1' }), makeCard({ id: 'c2' }), makeCard({ id: 'c3' })] });
      const history: HistoryState = {
        past: [state1, state2],
        present: state3,
        future: [],
      };
      let result = historyReducer(history, { type: 'UNDO' });
      expect(result.present.cards).toHaveLength(2);
      result = historyReducer(result, { type: 'UNDO' });
      expect(result.present.cards).toHaveLength(1);
    });
  });

  describe('REDO', () => {
    it('should restore next state from future', () => {
      const card = makeCard();
      const futureState = makeState({ cards: [card] });
      const history: HistoryState = {
        past: [],
        present: DEFAULT_BOARD_STATE,
        future: [futureState],
      };
      const result = historyReducer(history, { type: 'REDO' });
      expect(result.present.cards).toHaveLength(1);
      expect(result.future).toHaveLength(0);
      expect(result.past).toHaveLength(1);
    });

    it('should do nothing if future is empty', () => {
      const history = makeHistory();
      const result = historyReducer(history, { type: 'REDO' });
      expect(result).toBe(history);
    });

    it('should push current state to past', () => {
      const futureState = makeState({ cards: [makeCard()] });
      const history: HistoryState = {
        past: [],
        present: DEFAULT_BOARD_STATE,
        future: [futureState],
      };
      const result = historyReducer(history, { type: 'REDO' });
      expect(result.past[0]).toBe(DEFAULT_BOARD_STATE);
    });

    it('should handle multiple redos', () => {
      const state1 = makeState({ cards: [makeCard({ id: 'c1' })] });
      const state2 = makeState({ cards: [makeCard({ id: 'c1' }), makeCard({ id: 'c2' })] });
      const history: HistoryState = {
        past: [],
        present: DEFAULT_BOARD_STATE,
        future: [state1, state2],
      };
      let result = historyReducer(history, { type: 'REDO' });
      expect(result.present.cards).toHaveLength(1);
      result = historyReducer(result, { type: 'REDO' });
      expect(result.present.cards).toHaveLength(2);
    });
  });

  describe('unknown action', () => {
    it('should return same state', () => {
      const history = makeHistory();
      const result = historyReducer(history, { type: 'UNKNOWN' } as unknown as { type: 'UNDO' });
      expect(result).toBe(history);
    });
  });
});
