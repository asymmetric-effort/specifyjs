// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import {
  boardReducer,
  historyReducer,
  DEFAULT_BOARD_STATE,
} from '../src/BoardReducer';
import type { BoardAction, HistoryState } from '../src/BoardReducer';
import type { Card, Container, BoardState, CardLink } from '../src/types';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

function makeCard(overrides?: Partial<Card>): Card {
  return {
    type: 'card',
    card_id: 'test-card-1',
    card_type: 'text',
    card_title: 'Test Card',
    card_link: [],
    content: { text: 'hello' },
    position: { x: 100, y: 200 },
    size: { width: 200, height: 150 },
    color: '#fef9c3',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function makeContainer(overrides?: Partial<Container>): Container {
  return {
    type: 'container',
    container_id: 'test-container-1',
    name: 'Test Container',
    position: { x: 0, y: 0 },
    size: { width: 400, height: 300 },
    contents: [],
    ...overrides,
  };
}

function makeState(overrides?: Partial<BoardState>): BoardState {
  return {
    id: 'board-1',
    name: 'Test Board',
    collection: [],
    viewport: { panX: 0, panY: 0, zoom: 1 },
    ...overrides,
  };
}

function makeHistory(present?: BoardState): HistoryState {
  return {
    past: [],
    present: present || makeState(),
    future: [],
  };
}

// ---------------------------------------------------------------------------
// boardReducer: ADD_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — ADD_ITEM', () => {
  it('adds a card to the top-level collection', () => {
    const state = makeState();
    const card = makeCard();
    const result = boardReducer(state, { type: 'ADD_ITEM', item: card });
    expect(result.collection.length).toBe(1);
    expect(result.collection[0]).toEqual(card);
  });

  it('adds a container to the top-level collection', () => {
    const state = makeState();
    const container = makeContainer();
    const result = boardReducer(state, { type: 'ADD_ITEM', item: container });
    expect(result.collection.length).toBe(1);
    expect(result.collection[0].type).toBe('container');
  });

  it('adds an item inside a specific container', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const card = makeCard();
    const result = boardReducer(state, { type: 'ADD_ITEM', item: card, containerId: 'test-container-1' });
    const resultContainer = result.collection[0] as Container;
    expect(resultContainer.contents.length).toBe(1);
    expect(resultContainer.contents[0]).toEqual(card);
  });

  it('preserves existing items when adding', () => {
    const existing = makeCard({ card_id: 'existing' });
    const state = makeState({ collection: [existing] });
    const newCard = makeCard({ card_id: 'new' });
    const result = boardReducer(state, { type: 'ADD_ITEM', item: newCard });
    expect(result.collection.length).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: REMOVE_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — REMOVE_ITEM', () => {
  it('removes a card from top-level', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'REMOVE_ITEM', itemId: 'test-card-1' });
    expect(result.collection.length).toBe(0);
  });

  it('removes a card from inside a container', () => {
    const card = makeCard();
    const container = makeContainer({ contents: [card] });
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'REMOVE_ITEM', itemId: 'test-card-1' });
    const resultContainer = result.collection[0] as Container;
    expect(resultContainer.contents.length).toBe(0);
  });

  it('removes a container with its contents', () => {
    const card = makeCard();
    const container = makeContainer({ contents: [card] });
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'REMOVE_ITEM', itemId: 'test-container-1' });
    expect(result.collection.length).toBe(0);
  });

  it('does nothing when item not found', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'REMOVE_ITEM', itemId: 'nonexistent' });
    expect(result.collection.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: MOVE_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — MOVE_ITEM', () => {
  it('moves a card to a new position', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'test-card-1', position: { x: 500, y: 600 } });
    const movedCard = result.collection[0] as Card;
    expect(movedCard.position).toEqual({ x: 500, y: 600 });
  });

  it('updates updatedAt when moving a card', () => {
    const card = makeCard({ updatedAt: 1000 });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'test-card-1', position: { x: 0, y: 0 } });
    const movedCard = result.collection[0] as Card;
    expect(movedCard.updatedAt).toBeGreaterThan(1000);
  });

  it('moves a container', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'test-container-1', position: { x: 300, y: 400 } });
    const movedContainer = result.collection[0] as Container;
    expect(movedContainer.position).toEqual({ x: 300, y: 400 });
  });
});

// ---------------------------------------------------------------------------
// boardReducer: RESIZE_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — RESIZE_ITEM', () => {
  it('resizes a card', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'RESIZE_ITEM', itemId: 'test-card-1', size: { width: 300, height: 250 } });
    const resized = result.collection[0] as Card;
    expect(resized.size).toEqual({ width: 300, height: 250 });
  });

  it('resizes a container', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'RESIZE_ITEM', itemId: 'test-container-1', size: { width: 600, height: 500 } });
    const resized = result.collection[0] as Container;
    expect(resized.size).toEqual({ width: 600, height: 500 });
  });
});

// ---------------------------------------------------------------------------
// boardReducer: UPDATE_CARD
// ---------------------------------------------------------------------------

describe('boardReducer — UPDATE_CARD', () => {
  it('updates card title', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'UPDATE_CARD', cardId: 'test-card-1', updates: { card_title: 'New Title' } });
    const updated = result.collection[0] as Card;
    expect(updated.card_title).toBe('New Title');
  });

  it('updates card color', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'UPDATE_CARD', cardId: 'test-card-1', updates: { color: '#ff0000' } });
    const updated = result.collection[0] as Card;
    expect(updated.color).toBe('#ff0000');
  });

  it('updates card priority', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'UPDATE_CARD', cardId: 'test-card-1', updates: { priority: 'critical' } });
    const updated = result.collection[0] as Card;
    expect(updated.priority).toBe('critical');
  });

  it('does not modify containers', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'UPDATE_CARD', cardId: 'test-container-1', updates: { color: '#red' } });
    expect(result.collection[0]).toEqual(container);
  });

  it('updates card inside a container', () => {
    const card = makeCard();
    const container = makeContainer({ contents: [card] });
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'UPDATE_CARD', cardId: 'test-card-1', updates: { card_title: 'Updated' } });
    const resultContainer = result.collection[0] as Container;
    const updated = resultContainer.contents[0] as Card;
    expect(updated.card_title).toBe('Updated');
  });
});

// ---------------------------------------------------------------------------
// boardReducer: CHANGE_CARD_TYPE
// ---------------------------------------------------------------------------

describe('boardReducer — CHANGE_CARD_TYPE', () => {
  it('changes card type from text to json', () => {
    const card = makeCard({ card_type: 'text', content: { text: 'hello' } });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card-1', newType: 'json' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('json');
    expect(changed.content).toEqual({});
  });

  it('changes card type to project', () => {
    const card = makeCard({ card_type: 'text', content: { text: 'data' } });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card-1', newType: 'project' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('project');
    expect((changed.content as any).project_id).toBe('');
    expect((changed.content as any).project_name).toBe('');
  });

  it('changes card type to task', () => {
    const card = makeCard({ card_type: 'text' });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card-1', newType: 'task' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('task');
  });

  it('changes card type to text', () => {
    const card = makeCard({ card_type: 'json', content: { key: 'value' } });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card-1', newType: 'text' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('text');
    expect((changed.content as any).text).toBe('');
  });

  it('updates updatedAt timestamp', () => {
    const card = makeCard({ updatedAt: 1000 });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card-1', newType: 'json' });
    const changed = result.collection[0] as Card;
    expect(changed.updatedAt).toBeGreaterThan(1000);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: ADD_CONTAINER
// ---------------------------------------------------------------------------

describe('boardReducer — ADD_CONTAINER', () => {
  it('adds a container to top level', () => {
    const state = makeState();
    const container = makeContainer();
    const result = boardReducer(state, { type: 'ADD_CONTAINER', container });
    expect(result.collection.length).toBe(1);
  });

  it('adds a container inside another container', () => {
    const parent = makeContainer({ container_id: 'parent' });
    const state = makeState({ collection: [parent] });
    const child = makeContainer({ container_id: 'child', name: 'Child' });
    const result = boardReducer(state, { type: 'ADD_CONTAINER', container: child, parentContainerId: 'parent' });
    const resultParent = result.collection[0] as Container;
    expect(resultParent.contents.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: NEST_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — NEST_ITEM', () => {
  it('moves an item from top level into a container', () => {
    const card = makeCard();
    const container = makeContainer();
    const state = makeState({ collection: [card, container] });
    const result = boardReducer(state, { type: 'NEST_ITEM', itemId: 'test-card-1', containerId: 'test-container-1' });
    expect(result.collection.length).toBe(1);
    const resultContainer = result.collection[0] as Container;
    expect(resultContainer.contents.length).toBe(1);
  });

  it('does nothing when item not found', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'NEST_ITEM', itemId: 'nonexistent', containerId: 'test-container-1' });
    expect(result).toEqual(state);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: UNNEST_ITEM
// ---------------------------------------------------------------------------

describe('boardReducer — UNNEST_ITEM', () => {
  it('moves an item from a container to top level', () => {
    const card = makeCard();
    const container = makeContainer({ contents: [card] });
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'UNNEST_ITEM', itemId: 'test-card-1', containerId: 'test-container-1' });
    expect(result.collection.length).toBe(2);
    const resultContainer = result.collection[0] as Container;
    expect(resultContainer.contents.length).toBe(0);
  });

  it('does nothing when item not found in container', () => {
    const container = makeContainer();
    const state = makeState({ collection: [container] });
    const result = boardReducer(state, { type: 'UNNEST_ITEM', itemId: 'nonexistent', containerId: 'test-container-1' });
    expect(result).toEqual(state);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: ADD_LINK / REMOVE_LINK
// ---------------------------------------------------------------------------

describe('boardReducer — ADD_LINK', () => {
  it('adds a link to a card', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const link: CardLink = {
      link_id: 'link-1',
      link_name: 'depends on',
      target_card_id: 'c2',
      color: '#3b82f6',
      attributes: {},
    };
    const result = boardReducer(state, { type: 'ADD_LINK', cardId: 'test-card-1', link });
    const updated = result.collection[0] as Card;
    expect(updated.card_link.length).toBe(1);
    expect(updated.card_link[0].link_name).toBe('depends on');
  });

  it('appends to existing links', () => {
    const existingLink: CardLink = {
      link_id: 'existing',
      link_name: 'blocks',
      target_card_id: 'c3',
      color: '#ef4444',
      attributes: {},
    };
    const card = makeCard({ card_link: [existingLink] });
    const state = makeState({ collection: [card] });
    const newLink: CardLink = {
      link_id: 'new',
      link_name: 'related',
      target_card_id: 'c4',
      color: '#22c55e',
      attributes: {},
    };
    const result = boardReducer(state, { type: 'ADD_LINK', cardId: 'test-card-1', link: newLink });
    const updated = result.collection[0] as Card;
    expect(updated.card_link.length).toBe(2);
  });
});

describe('boardReducer — REMOVE_LINK', () => {
  it('removes a link from a card', () => {
    const link: CardLink = {
      link_id: 'link-1',
      link_name: 'blocks',
      target_card_id: 'c2',
      color: '#ef4444',
      attributes: {},
    };
    const card = makeCard({ card_link: [link] });
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'REMOVE_LINK', cardId: 'test-card-1', linkId: 'link-1' });
    const updated = result.collection[0] as Card;
    expect(updated.card_link.length).toBe(0);
  });

  it('does nothing when link not found', () => {
    const card = makeCard();
    const state = makeState({ collection: [card] });
    const result = boardReducer(state, { type: 'REMOVE_LINK', cardId: 'test-card-1', linkId: 'nonexistent' });
    const updated = result.collection[0] as Card;
    expect(updated.card_link.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: PAN / ZOOM
// ---------------------------------------------------------------------------

describe('boardReducer — PAN', () => {
  it('updates viewport pan coordinates', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'PAN', panX: 100, panY: -50 });
    expect(result.viewport.panX).toBe(100);
    expect(result.viewport.panY).toBe(-50);
  });

  it('preserves zoom when panning', () => {
    const state = makeState({ viewport: { panX: 0, panY: 0, zoom: 2 } });
    const result = boardReducer(state, { type: 'PAN', panX: 50, panY: 50 });
    expect(result.viewport.zoom).toBe(2);
  });
});

describe('boardReducer — ZOOM', () => {
  it('updates zoom level', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'ZOOM', zoom: 2.5 });
    expect(result.viewport.zoom).toBe(2.5);
  });

  it('clamps zoom to minimum 0.25', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'ZOOM', zoom: 0.1 });
    expect(result.viewport.zoom).toBe(0.25);
  });

  it('clamps zoom to maximum 4.0', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'ZOOM', zoom: 10 });
    expect(result.viewport.zoom).toBe(4.0);
  });

  it('preserves pan when zooming', () => {
    const state = makeState({ viewport: { panX: 100, panY: 200, zoom: 1 } });
    const result = boardReducer(state, { type: 'ZOOM', zoom: 1.5 });
    expect(result.viewport.panX).toBe(100);
    expect(result.viewport.panY).toBe(200);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: SET_BOARD
// ---------------------------------------------------------------------------

describe('boardReducer — SET_BOARD', () => {
  it('replaces entire state', () => {
    const state = makeState();
    const newState = makeState({ id: 'new-board', name: 'New Board' });
    const result = boardReducer(state, { type: 'SET_BOARD', state: newState });
    expect(result).toEqual(newState);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: RENAME_BOARD
// ---------------------------------------------------------------------------

describe('boardReducer — RENAME_BOARD', () => {
  it('changes the board name', () => {
    const state = makeState({ name: 'Old Name' });
    const result = boardReducer(state, { type: 'RENAME_BOARD', name: 'New Name' });
    expect(result.name).toBe('New Name');
  });

  it('preserves other state fields', () => {
    const card = makeCard();
    const state = makeState({ collection: [card], name: 'Before' });
    const result = boardReducer(state, { type: 'RENAME_BOARD', name: 'After' });
    expect(result.collection.length).toBe(1);
    expect(result.id).toBe(state.id);
  });
});

// ---------------------------------------------------------------------------
// boardReducer: unknown action
// ---------------------------------------------------------------------------

describe('boardReducer — unknown action', () => {
  it('returns state unchanged for unknown action type', () => {
    const state = makeState();
    const result = boardReducer(state, { type: 'UNKNOWN' } as any);
    expect(result).toBe(state);
  });
});

// ---------------------------------------------------------------------------
// historyReducer: UNDO / REDO
// ---------------------------------------------------------------------------

describe('historyReducer — UNDO', () => {
  it('restores previous state', () => {
    const past = makeState({ name: 'Previous' });
    const present = makeState({ name: 'Current' });
    const history: HistoryState = { past: [past], present, future: [] };
    const result = historyReducer(history, { type: 'UNDO' });
    expect(result.present.name).toBe('Previous');
    expect(result.past.length).toBe(0);
    expect(result.future.length).toBe(1);
    expect(result.future[0].name).toBe('Current');
  });

  it('does nothing when past is empty', () => {
    const history = makeHistory();
    const result = historyReducer(history, { type: 'UNDO' });
    expect(result).toBe(history);
  });

  it('handles multiple undo steps', () => {
    const s1 = makeState({ name: 'S1' });
    const s2 = makeState({ name: 'S2' });
    const s3 = makeState({ name: 'S3' });
    const history: HistoryState = { past: [s1, s2], present: s3, future: [] };

    let result = historyReducer(history, { type: 'UNDO' });
    expect(result.present.name).toBe('S2');

    result = historyReducer(result, { type: 'UNDO' });
    expect(result.present.name).toBe('S1');
    expect(result.past.length).toBe(0);
  });
});

describe('historyReducer — REDO', () => {
  it('restores next state', () => {
    const present = makeState({ name: 'Current' });
    const future = makeState({ name: 'Future' });
    const history: HistoryState = { past: [], present, future: [future] };
    const result = historyReducer(history, { type: 'REDO' });
    expect(result.present.name).toBe('Future');
    expect(result.future.length).toBe(0);
    expect(result.past.length).toBe(1);
  });

  it('does nothing when future is empty', () => {
    const history = makeHistory();
    const result = historyReducer(history, { type: 'REDO' });
    expect(result).toBe(history);
  });
});

// ---------------------------------------------------------------------------
// historyReducer: BOARD_ACTION
// ---------------------------------------------------------------------------

describe('historyReducer — BOARD_ACTION', () => {
  it('pushes current state to past on regular action', () => {
    const history = makeHistory();
    const card = makeCard();
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'ADD_ITEM', item: card },
    });
    expect(result.past.length).toBe(1);
    expect(result.present.collection.length).toBe(1);
    expect(result.future.length).toBe(0);
  });

  it('clears future on new action', () => {
    const future = makeState({ name: 'Future' });
    const history: HistoryState = { past: [], present: makeState(), future: [future] };
    const card = makeCard();
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'ADD_ITEM', item: card },
    });
    expect(result.future.length).toBe(0);
  });

  it('does not push PAN to history', () => {
    const history = makeHistory();
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'PAN', panX: 100, panY: 200 },
    });
    expect(result.past.length).toBe(0);
    expect(result.present.viewport.panX).toBe(100);
  });

  it('does not push ZOOM to history', () => {
    const history = makeHistory();
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'ZOOM', zoom: 2 },
    });
    expect(result.past.length).toBe(0);
    expect(result.present.viewport.zoom).toBe(2);
  });

  it('SET_BOARD resets history', () => {
    const past = makeState({ name: 'Old' });
    const history: HistoryState = { past: [past], present: makeState(), future: [] };
    const newState = makeState({ name: 'Brand New' });
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'SET_BOARD', state: newState },
    });
    expect(result.past.length).toBe(0);
    expect(result.future.length).toBe(0);
    expect(result.present.name).toBe('Brand New');
  });

  it('limits history to 50 entries', () => {
    let history = makeHistory();
    for (let i = 0; i < 55; i++) {
      history = historyReducer(history, {
        type: 'BOARD_ACTION',
        action: { type: 'RENAME_BOARD', name: `Board ${i}` },
      });
    }
    expect(history.past.length).toBeLessThanOrEqual(50);
  });

  it('returns different state reference even when boardReducer processes no-op removal', () => {
    const history = makeHistory();
    // REMOVE_ITEM with nonexistent ID still creates new arrays (by design)
    const result = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'REMOVE_ITEM', itemId: 'nonexistent' },
    });
    // The collection is rebuilt even for non-matching IDs, so the state
    // reference changes. This pushes to history.
    expect(result.present.collection).toEqual(history.present.collection);
  });
});

// ---------------------------------------------------------------------------
// historyReducer: unknown action
// ---------------------------------------------------------------------------

describe('historyReducer — unknown action', () => {
  it('returns state unchanged for unknown action type', () => {
    const history = makeHistory();
    const result = historyReducer(history, { type: 'UNKNOWN' } as any);
    expect(result).toBe(history);
  });
});

// ---------------------------------------------------------------------------
// DEFAULT_BOARD_STATE
// ---------------------------------------------------------------------------

describe('DEFAULT_BOARD_STATE', () => {
  it('has an id', () => {
    expect(typeof DEFAULT_BOARD_STATE.id).toBe('string');
    expect(DEFAULT_BOARD_STATE.id.length).toBeGreaterThan(0);
  });

  it('has name Untitled', () => {
    expect(DEFAULT_BOARD_STATE.name).toBe('Untitled');
  });

  it('has empty collection', () => {
    expect(DEFAULT_BOARD_STATE.collection).toEqual([]);
  });

  it('has default viewport', () => {
    expect(DEFAULT_BOARD_STATE.viewport).toEqual({ panX: 0, panY: 0, zoom: 1 });
  });
});

// ---------------------------------------------------------------------------
// Undo/redo round-trip
// ---------------------------------------------------------------------------

describe('undo/redo round-trip', () => {
  it('undo then redo restores the same state', () => {
    let history = makeHistory();
    const card = makeCard();
    history = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'ADD_ITEM', item: card },
    });
    const afterAdd = history.present;

    history = historyReducer(history, { type: 'UNDO' });
    expect(history.present.collection.length).toBe(0);

    history = historyReducer(history, { type: 'REDO' });
    expect(history.present.collection.length).toBe(afterAdd.collection.length);
  });

  it('undo multiple then redo multiple', () => {
    let history = makeHistory();
    const actions: BoardAction[] = [
      { type: 'RENAME_BOARD', name: 'A' },
      { type: 'RENAME_BOARD', name: 'B' },
      { type: 'RENAME_BOARD', name: 'C' },
    ];

    for (const action of actions) {
      history = historyReducer(history, { type: 'BOARD_ACTION', action });
    }
    expect(history.present.name).toBe('C');

    history = historyReducer(history, { type: 'UNDO' });
    history = historyReducer(history, { type: 'UNDO' });
    expect(history.present.name).toBe('A');

    history = historyReducer(history, { type: 'REDO' });
    expect(history.present.name).toBe('B');

    history = historyReducer(history, { type: 'REDO' });
    expect(history.present.name).toBe('C');
  });

  it('new action after undo clears redo stack', () => {
    let history = makeHistory();
    history = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'RENAME_BOARD', name: 'A' },
    });
    history = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'RENAME_BOARD', name: 'B' },
    });

    history = historyReducer(history, { type: 'UNDO' });
    expect(history.future.length).toBe(1);

    history = historyReducer(history, {
      type: 'BOARD_ACTION',
      action: { type: 'RENAME_BOARD', name: 'C' },
    });
    expect(history.future.length).toBe(0);
    expect(history.present.name).toBe('C');
  });
});

// ── Container child position offset on move ─────────────────────────

describe('MOVE_ITEM with container children', () => {
  it('offsets child card positions when container moves', () => {
    const container = {
      type: 'container' as const,
      container_id: 'c1',
      name: 'Box',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
      contents: [
        {
          type: 'card' as const,
          card_id: 'card1',
          card_type: 'text' as const,
          card_title: 'Inside',
          card_link: [],
          content: { text: '' },
          position: { x: 120, y: 130 },
          size: { width: 150, height: 100 },
          color: '#fef9c3',
          createdAt: 0,
          updatedAt: 0,
        },
      ],
    };
    const state = { ...DEFAULT_BOARD_STATE, collection: [container] };
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'c1', position: { x: 200, y: 150 } });
    const movedContainer = result.collection[0] as any;
    expect(movedContainer.position.x).toBe(200);
    expect(movedContainer.position.y).toBe(150);
    // Child should be offset by dx=100, dy=50
    expect(movedContainer.contents[0].position.x).toBe(220);
    expect(movedContainer.contents[0].position.y).toBe(180);
  });

  it('offsets nested container children recursively', () => {
    const inner = {
      type: 'container' as const,
      container_id: 'inner',
      name: 'Inner',
      position: { x: 110, y: 110 },
      size: { width: 100, height: 80 },
      contents: [
        {
          type: 'card' as const,
          card_id: 'deep',
          card_type: 'text' as const,
          card_title: 'Deep',
          card_link: [],
          content: { text: '' },
          position: { x: 115, y: 115 },
          size: { width: 80, height: 60 },
          color: '#fef9c3',
          createdAt: 0,
          updatedAt: 0,
        },
      ],
    };
    const outer = {
      type: 'container' as const,
      container_id: 'outer',
      name: 'Outer',
      position: { x: 100, y: 100 },
      size: { width: 300, height: 200 },
      contents: [inner],
    };
    const state = { ...DEFAULT_BOARD_STATE, collection: [outer] };
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'outer', position: { x: 200, y: 200 } });
    const o = result.collection[0] as any;
    expect(o.position).toEqual({ x: 200, y: 200 });
    expect(o.contents[0].position).toEqual({ x: 210, y: 210 });
    expect(o.contents[0].contents[0].position).toEqual({ x: 215, y: 215 });
  });

  it('does not offset children when card moves', () => {
    const card = {
      type: 'card' as const,
      card_id: 'c1',
      card_type: 'text' as const,
      card_title: 'Solo',
      card_link: [],
      content: { text: '' },
      position: { x: 50, y: 50 },
      size: { width: 150, height: 100 },
      color: '#fef9c3',
      createdAt: 0,
      updatedAt: 0,
    };
    const state = { ...DEFAULT_BOARD_STATE, collection: [card] };
    const result = boardReducer(state, { type: 'MOVE_ITEM', itemId: 'c1', position: { x: 100, y: 100 } });
    expect((result.collection[0] as any).position).toEqual({ x: 100, y: 100 });
  });
});
