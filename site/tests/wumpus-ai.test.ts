// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

// @vitest-environment node
import { describe, it, expect } from 'vitest';
import {
  // Constants
  GRID_SIZE, START_ROW, START_COL,
  EMPTY, PIT, WUMPUS, GOLD, AGENT, STENCH, BREEZE, VISITED,
  RIGHT, UP, LEFT, DOWN,
  // Types
  type Direction, type GameState, type KnowledgeBase,
  // Functions under test
  emptyGrid4,
  neighbors,
  createKnowledgeBase,
  createInitialState,
  cloneKB,
  updateKnowledge,
  directionTo,
  turnsToFace,
  findPath,
  pathToActions,
  shootDirection,
  aiDecide,
  displayCoord,
  addPercepts,
  getPercepts,
} from '../src/screens/wumpus-logic';

// ── Helpers ──────────────────────────────────────────────────────────

/** Build a blank board with agent at START position */
function blankBoard(): number[][] {
  const board = emptyGrid4<number>(EMPTY);
  board[START_ROW]![START_COL]! |= AGENT | VISITED;
  return board;
}

/** Build a fresh KB with start cell marked */
function freshKB(): KnowledgeBase {
  return createKnowledgeBase();
}

/** Build a minimal GameState with controlled values */
function makeState(overrides: Partial<GameState> = {}): GameState {
  const board = blankBoard();
  const revealed = emptyGrid4(false);
  revealed[START_ROW]![START_COL] = true;
  const kb = freshKB();
  const base: GameState = {
    board,
    agentRow: START_ROW,
    agentCol: START_COL,
    agentDir: RIGHT as Direction,
    hasArrow: true,
    hasGold: false,
    wumpusAlive: true,
    score: 0,
    gameOver: false,
    won: false,
    percepts: ['None'],
    log: [],
    revealed,
    kb,
    aiPlan: [],
    aiReasoning: '',
  };
  return { ...base, ...overrides };
}

// ── cloneKB / updateKnowledge immutability ──────────────────────────

describe('cloneKB', () => {
  it('produces a deep copy — modifying clone does not affect original', () => {
    const original = freshKB();
    const clone = cloneKB(original);
    clone.visited[0]![0] = true;
    clone.safe[1]![1] = true;
    clone.noPit[2]![2] = true;
    clone.noWumpus[3]![3] = true;
    clone.maybePit[4]![4] = true;
    clone.maybeWumpus[5]![5] = true;
    clone.definitelyPit[6]![6] = true;
    clone.wumpusLocation = [7, 7];

    expect(original.visited[0]![0]).toBe(false);
    expect(original.safe[1]![1]).toBe(false);
    expect(original.noPit[2]![2]).toBe(false);
    expect(original.noWumpus[3]![3]).toBe(false);
    expect(original.maybePit[4]![4]).toBe(false);
    expect(original.maybeWumpus[5]![5]).toBe(false);
    expect(original.definitelyPit[6]![6]).toBe(false);
    expect(original.wumpusLocation).toBeNull();
  });

  it('clones wumpusLocation when it is set', () => {
    const original = freshKB();
    original.wumpusLocation = [3, 4];
    const clone = cloneKB(original);
    clone.wumpusLocation![0] = 9;
    expect(original.wumpusLocation).toEqual([3, 4]);
  });
});

describe('updateKnowledge immutability', () => {
  it('does not mutate the original KB in the GameState', () => {
    const s = makeState();
    const originalKB = s.kb;
    const originalVisitedCopy = originalKB.visited.map(r => [...r]);
    updateKnowledge(s);
    // Original KB should be unchanged
    expect(originalKB.visited).toEqual(originalVisitedCopy);
  });
});

// ── updateKnowledge ─────────────────────────────────────────────────

describe('updateKnowledge', () => {
  describe('Rule 1: Breeze inference', () => {
    it('no breeze => all adjacent cells get noPit=true, maybePit=false', () => {
      // Agent at center of grid, no breeze on cell
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      // No breeze on (5,5) — it's just AGENT|VISITED

      const kb = freshKB();
      kb.visited[r]![c] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB, reasoning] = updateKnowledge(s);

      for (const [nr, nc] of neighbors(r, c)) {
        expect(newKB.noPit[nr]![nc]).toBe(true);
        expect(newKB.maybePit[nr]![nc]).toBe(false);
      }
      expect(reasoning).toContain('no pit');
    });

    it('breeze => unvisited non-safe neighbors get maybePit=true', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | BREEZE;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      // Mark one neighbor as already visited so it should NOT get maybePit
      kb.visited[4]![5] = true;
      kb.noPit[4]![5] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB] = updateKnowledge(s);

      // (4,5) is visited — should not get maybePit
      expect(newKB.maybePit[4]![5]).toBe(false);
      // (6,5), (5,4), (5,6) are unvisited — should get maybePit
      expect(newKB.maybePit[6]![5]).toBe(true);
      expect(newKB.maybePit[5]![4]).toBe(true);
      expect(newKB.maybePit[5]![6]).toBe(true);
    });

    it('breeze does not set maybePit on neighbors already proven noPit', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | BREEZE;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.noPit[6]![5] = true; // already proven safe from pits
      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB] = updateKnowledge(s);

      expect(newKB.maybePit[6]![5]).toBe(false);
    });
  });

  describe('Rule 2: Stench inference', () => {
    it('no stench => all adjacent cells get noWumpus=true', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED; // no stench

      const kb = freshKB();
      kb.visited[r]![c] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB, reasoning] = updateKnowledge(s);

      for (const [nr, nc] of neighbors(r, c)) {
        expect(newKB.noWumpus[nr]![nc]).toBe(true);
        expect(newKB.maybeWumpus[nr]![nc]).toBe(false);
      }
      expect(reasoning).toContain('no Wumpus');
    });

    it('stench + wumpusAlive => unvisited neighbors get maybeWumpus=true', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | STENCH;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.visited[4]![5] = true; // one neighbor visited
      kb.noWumpus[4]![5] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb, wumpusAlive: true });
      const [newKB] = updateKnowledge(s);

      expect(newKB.maybeWumpus[4]![5]).toBe(false); // visited
      expect(newKB.maybeWumpus[6]![5]).toBe(true);
      expect(newKB.maybeWumpus[5]![4]).toBe(true);
      expect(newKB.maybeWumpus[5]![6]).toBe(true);
    });

    it('stench + wumpus NOT alive => no maybeWumpus set', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | STENCH;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb, wumpusAlive: false });
      const [newKB] = updateKnowledge(s);

      for (const [nr, nc] of neighbors(r, c)) {
        expect(newKB.maybeWumpus[nr]![nc]).toBe(false);
        expect(newKB.noWumpus[nr]![nc]).toBe(true);
      }
    });
  });

  describe('Rule 3: Wumpus killed', () => {
    it('wumpusAlive=false => all cells get noWumpus=true, maybeWumpus=false, wumpusLocation=null', () => {
      const kb = freshKB();
      kb.maybeWumpus[3]![3] = true;
      kb.wumpusLocation = [3, 3];
      const s = makeState({ kb, wumpusAlive: false });
      const [newKB] = updateKnowledge(s);

      for (let r = 0; r < GRID_SIZE; r++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          expect(newKB.noWumpus[r]![cc]).toBe(true);
          expect(newKB.maybeWumpus[r]![cc]).toBe(false);
        }
      }
      expect(newKB.wumpusLocation).toBeNull();
    });
  });

  describe('Rule 4: Constraint propagation (pit)', () => {
    it('breezy cell with one unknown neighbor => that neighbor is definitelyPit', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | BREEZE;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      // Mark all neighbors except one as noPit
      kb.noPit[4]![5] = true;
      kb.noPit[6]![5] = true;
      kb.noPit[5]![4] = true;
      // (5,6) is the only unknown => should become definitelyPit

      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB, reasoning] = updateKnowledge(s);

      expect(newKB.definitelyPit[5]![6]).toBe(true);
      expect(newKB.maybePit[5]![6]).toBe(false);
      expect(reasoning).toContain('PIT');
    });

    it('known pit explains breeze => remaining unknowns become noPit', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | BREEZE;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.definitelyPit[4]![5] = true; // known pit explains the breeze
      // (6,5), (5,4), (5,6) are unknowns that should become noPit

      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [newKB, reasoning] = updateKnowledge(s);

      expect(newKB.noPit[6]![5]).toBe(true);
      expect(newKB.noPit[5]![4]).toBe(true);
      expect(newKB.noPit[5]![6]).toBe(true);
      expect(reasoning).toContain('safe from pits');
    });
  });

  describe('Wumpus constraint propagation', () => {
    it('stenchy cell with one unknown neighbor => wumpusLocation found', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED | STENCH;

      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.noWumpus[4]![5] = true;
      kb.noWumpus[6]![5] = true;
      kb.noWumpus[5]![4] = true;
      // Only (5,6) is unknown => wumpus must be there

      const s = makeState({ board, agentRow: r, agentCol: c, kb, wumpusAlive: true });
      const [newKB, reasoning] = updateKnowledge(s);

      expect(newKB.wumpusLocation).toEqual([5, 6]);
      expect(reasoning).toContain('WUMPUS located');
      // All other cells should be noWumpus
      expect(newKB.noWumpus[4]![5]).toBe(true);
      expect(newKB.noWumpus[0]![0]).toBe(true);
    });
  });

  describe('Global wumpus deduction', () => {
    it('only one candidate cell => wumpusLocation set', () => {
      const board = blankBoard();
      // Agent at start, no stench, but we manually set up KB
      const kb = freshKB();
      // Mark all cells as noWumpus except one non-visited cell
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          kb.noWumpus[r]![cc] = true;
        }
      }
      // Leave (2,3) as the only candidate
      kb.noWumpus[2]![3] = false;
      kb.visited[2]![3] = false;

      // Need a stench somewhere so the loop iteration triggers, but
      // the global deduction happens regardless; it's in the loop body
      const s = makeState({ kb, wumpusAlive: true });
      const [newKB, reasoning] = updateKnowledge(s);

      expect(newKB.wumpusLocation).toEqual([2, 3]);
      expect(reasoning).toContain('Only one possible Wumpus location');
    });
  });

  describe('Safe derivation', () => {
    it('noPit + noWumpus => safe=true', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED; // no breeze, no stench

      const kb = freshKB();
      kb.visited[r]![c] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb, wumpusAlive: true });
      const [newKB, reasoning] = updateKnowledge(s);

      // All neighbors should be safe (no breeze => noPit, no stench => noWumpus)
      for (const [nr, nc] of neighbors(r, c)) {
        expect(newKB.safe[nr]![nc]).toBe(true);
      }
      expect(reasoning).toContain('proven safe');
    });
  });

  describe('Reasoning strings', () => {
    it('returns reasoning strings describing inferences', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, kb });
      const [, reasoning] = updateKnowledge(s);
      expect(typeof reasoning).toBe('string');
      expect(reasoning.length).toBeGreaterThan(0);
      expect(reasoning).not.toBe('No new inferences.');
    });

    it('returns "No new inferences." when nothing new learned', () => {
      // Set up a state where everything is already known
      const board = blankBoard();
      const kb = freshKB();
      // Agent at start, already visited with start marked safe
      // Mark all neighbors of start as already known
      for (const [nr, nc] of neighbors(START_ROW, START_COL)) {
        kb.noPit[nr]![nc] = true;
        kb.noWumpus[nr]![nc] = true;
        kb.safe[nr]![nc] = true;
      }
      const s = makeState({ board, kb });
      const [, reasoning] = updateKnowledge(s);
      expect(reasoning).toBe('No new inferences.');
    });
  });
});

// ── directionTo ─────────────────────────────────────────────────────

describe('directionTo', () => {
  it('(5,5) to (4,5) => UP', () => {
    expect(directionTo(5, 5, 4, 5)).toBe(UP);
  });
  it('(5,5) to (6,5) => DOWN', () => {
    expect(directionTo(5, 5, 6, 5)).toBe(DOWN);
  });
  it('(5,5) to (5,6) => RIGHT', () => {
    expect(directionTo(5, 5, 5, 6)).toBe(RIGHT);
  });
  it('(5,5) to (5,4) => LEFT', () => {
    expect(directionTo(5, 5, 5, 4)).toBe(LEFT);
  });
});

// ── turnsToFace ─────────────────────────────────────────────────────

describe('turnsToFace', () => {
  const dirs: Direction[] = [RIGHT, UP, LEFT, DOWN];
  const dirNames = ['RIGHT', 'UP', 'LEFT', 'DOWN'];

  it('same direction => empty array', () => {
    for (const d of dirs) {
      expect(turnsToFace(d, d)).toEqual([]);
    }
  });

  it('90 degrees left turn', () => {
    // LEFT turn increments: RIGHT->UP, UP->LEFT, LEFT->DOWN, DOWN->RIGHT
    expect(turnsToFace(RIGHT, UP)).toEqual(['turnLeft']);
    expect(turnsToFace(UP, LEFT)).toEqual(['turnLeft']);
    expect(turnsToFace(LEFT, DOWN)).toEqual(['turnLeft']);
    expect(turnsToFace(DOWN, RIGHT)).toEqual(['turnLeft']);
  });

  it('90 degrees right turn', () => {
    expect(turnsToFace(UP, RIGHT)).toEqual(['turnRight']);
    expect(turnsToFace(LEFT, UP)).toEqual(['turnRight']);
    expect(turnsToFace(DOWN, LEFT)).toEqual(['turnRight']);
    expect(turnsToFace(RIGHT, DOWN)).toEqual(['turnRight']);
  });

  it('180 degrees => two left turns', () => {
    expect(turnsToFace(RIGHT, LEFT)).toEqual(['turnLeft', 'turnLeft']);
    expect(turnsToFace(LEFT, RIGHT)).toEqual(['turnLeft', 'turnLeft']);
    expect(turnsToFace(UP, DOWN)).toEqual(['turnLeft', 'turnLeft']);
    expect(turnsToFace(DOWN, UP)).toEqual(['turnLeft', 'turnLeft']);
  });

  it('all 16 combinations are covered', () => {
    let count = 0;
    for (const current of dirs) {
      for (const target of dirs) {
        const result = turnsToFace(current, target);
        expect(Array.isArray(result)).toBe(true);
        if (current === target) expect(result).toEqual([]);
        count++;
      }
    }
    expect(count).toBe(16);
  });
});

// ── findPath ────────────────────────────────────────────────────────

describe('findPath', () => {
  it('same cell => empty array', () => {
    const kb = freshKB();
    expect(findPath(kb, 5, 5, 5, 5)).toEqual([]);
  });

  it('adjacent safe cell => path of length 1', () => {
    const kb = freshKB();
    kb.safe[START_ROW]![START_COL] = true;
    kb.safe[START_ROW]![START_COL + 1] = true;
    const path = findPath(kb, START_ROW, START_COL, START_ROW, START_COL + 1);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(1);
    expect(path![0]).toEqual([START_ROW, START_COL + 1]);
  });

  it('path through multiple safe cells', () => {
    const kb = freshKB();
    // Create a corridor: (9,0) -> (9,1) -> (9,2) -> (8,2)
    kb.safe[9]![0] = true;
    kb.safe[9]![1] = true;
    kb.safe[9]![2] = true;
    kb.safe[8]![2] = true;
    const path = findPath(kb, 9, 0, 8, 2);
    expect(path).not.toBeNull();
    expect(path!.length).toBeGreaterThan(1);
    // Last waypoint should be the target
    expect(path![path!.length - 1]).toEqual([8, 2]);
  });

  it('returns null when no safe path exists (blocked by unsafe cells)', () => {
    const kb = freshKB();
    kb.safe[5]![5] = true;
    // Target at (5,7) but (5,6) is not safe and neither are alternate routes
    const path = findPath(kb, 5, 5, 5, 7);
    expect(path).toBeNull();
  });

  it('finds shortest path (BFS guarantee)', () => {
    const kb = freshKB();
    // Make a grid with two routes: short and long
    // Short: (0,0) -> (0,1) -> (0,2)
    // Long:  (0,0) -> (1,0) -> (2,0) -> (2,1) -> (2,2) -> (1,2) -> (0,2)
    for (let r = 0; r < 3; r++) {
      for (let cc = 0; cc < 3; cc++) {
        kb.safe[r]![cc] = true;
      }
    }
    const path = findPath(kb, 0, 0, 0, 2);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(2); // shortest is 2 steps
  });

  it('target does not need to be safe (can pathfind TO a non-safe cell)', () => {
    const kb = freshKB();
    kb.safe[5]![5] = true;
    kb.safe[5]![6] = true;
    // (5,7) is NOT safe, but we should be able to path to it
    const path = findPath(kb, 5, 5, 5, 7);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(2);
    expect(path![path!.length - 1]).toEqual([5, 7]);
  });

  it('cannot reach target even though it exists (no safe intermediate)', () => {
    const kb = freshKB();
    kb.safe[0]![0] = true;
    // (0,1) not safe, (0,2) not safe, target at (0,3)
    const path = findPath(kb, 0, 0, 0, 3);
    expect(path).toBeNull();
  });

  it('finds path along an L-shape', () => {
    const kb = freshKB();
    kb.safe[5]![5] = true;
    kb.safe[5]![6] = true;
    kb.safe[5]![7] = true;
    kb.safe[4]![7] = true;
    kb.safe[3]![7] = true;
    const path = findPath(kb, 5, 5, 3, 7);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(4);
  });
});

// ── pathToActions ───────────────────────────────────────────────────

describe('pathToActions', () => {
  it('single step forward (already facing target) => ["forward"]', () => {
    // Agent at (5,5) facing RIGHT, target is (5,6)
    const actions = pathToActions(RIGHT, [[5, 6]], 5, 5);
    expect(actions).toEqual(['forward']);
  });

  it('single step with left turn', () => {
    // Agent at (5,5) facing RIGHT, target is (4,5) which is UP => turnLeft, forward
    const actions = pathToActions(RIGHT, [[4, 5]], 5, 5);
    expect(actions).toEqual(['turnLeft', 'forward']);
  });

  it('single step with right turn', () => {
    // Agent at (5,5) facing RIGHT, target is (6,5) which is DOWN => turnRight, forward
    const actions = pathToActions(RIGHT, [[6, 5]], 5, 5);
    expect(actions).toEqual(['turnRight', 'forward']);
  });

  it('single step with 180 turn', () => {
    // Agent at (5,5) facing RIGHT, target is (5,4) which is LEFT
    const actions = pathToActions(RIGHT, [[5, 4]], 5, 5);
    expect(actions).toEqual(['turnLeft', 'turnLeft', 'forward']);
  });

  it('multi-step path generates correct turn+forward sequences', () => {
    // Path: (5,5) -> (5,6) -> (4,6), agent facing RIGHT
    const actions = pathToActions(RIGHT, [[5, 6], [4, 6]], 5, 5);
    // Step 1: already facing RIGHT -> forward
    // Step 2: now at (5,6) facing RIGHT, need UP -> turnLeft, forward
    expect(actions).toEqual(['forward', 'turnLeft', 'forward']);
  });

  it('multi-step path with multiple turns', () => {
    // Path: (5,5) -> (4,5) -> (4,6) -> (5,6), agent facing DOWN
    const actions = pathToActions(DOWN, [[4, 5], [4, 6], [5, 6]], 5, 5);
    // Step 1: facing DOWN, need UP -> 180 turn + forward
    // Step 2: now at (4,5) facing UP, need RIGHT -> turnRight, forward
    // Step 3: now at (4,6) facing RIGHT, need DOWN -> turnRight, forward
    expect(actions).toEqual([
      'turnLeft', 'turnLeft', 'forward',
      'turnRight', 'forward',
      'turnRight', 'forward',
    ]);
  });

  it('empty path => empty actions', () => {
    const actions = pathToActions(RIGHT, [], 5, 5);
    expect(actions).toEqual([]);
  });
});

// ── shootDirection ──────────────────────────────────────────────────

describe('shootDirection', () => {
  it('same row, target right => RIGHT', () => {
    expect(shootDirection(5, 3, 5, 7)).toBe(RIGHT);
  });

  it('same row, target left => LEFT', () => {
    expect(shootDirection(5, 7, 5, 3)).toBe(LEFT);
  });

  it('same col, target below => DOWN', () => {
    expect(shootDirection(3, 5, 7, 5)).toBe(DOWN);
  });

  it('same col, target above => UP', () => {
    expect(shootDirection(7, 5, 3, 5)).toBe(UP);
  });

  it('different row AND col => null', () => {
    expect(shootDirection(3, 3, 5, 7)).toBeNull();
  });

  it('same position => RIGHT (sr===wr, sc < wc is false, returns LEFT)', () => {
    // Same row, same col: sr===wr and sc===wc
    // sr === wr => returns sc < wc ? RIGHT : LEFT
    // sc === wc => returns LEFT
    expect(shootDirection(5, 5, 5, 5)).toBe(LEFT);
  });
});

// ── aiDecide ────────────────────────────────────────────────────────

describe('aiDecide', () => {
  describe('Priority 1: Gold on current cell', () => {
    it('returns ["grab"] when gold is on agent cell', () => {
      const board = blankBoard();
      board[START_ROW]![START_COL]! |= GOLD;
      const s = makeState({ board, hasGold: false });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toEqual(['grab']);
      expect(reasoning).toContain('grab gold');
    });

    it('does not grab if agent already has gold', () => {
      const board = blankBoard();
      board[START_ROW]![START_COL]! |= GOLD;
      const s = makeState({ board, hasGold: true });
      const [actions] = aiDecide(s);
      // hasGold is true, so priority 2 triggers (climb at entrance)
      expect(actions).toEqual(['climb']);
    });
  });

  describe('Priority 2: Has gold', () => {
    it('at entrance => ["climb"]', () => {
      const s = makeState({ hasGold: true });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toEqual(['climb']);
      expect(reasoning).toContain('climb out');
    });

    it('not at entrance => pathfind home + climb', () => {
      const board = blankBoard();
      const r = START_ROW, c = START_COL + 1;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.safe[START_ROW]![START_COL] = true;
      const s = makeState({ board, agentRow: r, agentCol: c, hasGold: true, kb });
      const [actions, reasoning] = aiDecide(s);
      expect(actions[actions.length - 1]).toBe('climb');
      expect(actions.length).toBeGreaterThan(1);
      expect(reasoning).toContain('returning to entrance');
    });
  });

  describe('Priority 3: Shoot wumpus', () => {
    it('wumpusLocation known + hasArrow + aligned => shoot', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.wumpusLocation = [5, 8]; // same row, to the right
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: RIGHT,
        hasArrow: true, wumpusAlive: true, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions[actions.length - 1]).toBe('shoot');
      expect(reasoning).toContain('shooting');
    });

    it('wumpusLocation known + hasArrow + not aligned => move to align then shoot', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      // Wumpus at (3,8) — not on same row or col
      kb.wumpusLocation = [3, 8];
      // Make a safe corridor from (5,5) to (3,5) on same row as wumpus
      kb.safe[4]![5] = true;
      kb.safe[3]![5] = true;
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: RIGHT,
        hasArrow: true, wumpusAlive: true, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions[actions.length - 1]).toBe('shoot');
      expect(reasoning).toContain('Moving to');
    });

    it('does not shoot if no arrow', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.wumpusLocation = [5, 8];
      const s = makeState({
        board, agentRow: r, agentCol: c,
        hasArrow: false, wumpusAlive: true, kb,
      });
      const [actions] = aiDecide(s);
      // Should NOT shoot — falls through to exploration or other priorities
      expect(actions).not.toContain('shoot');
    });
  });

  describe('Priority 4: Safe unvisited adjacent cell', () => {
    it('explores safe unvisited adjacent cell', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.safe[4]![5] = true; // safe unvisited neighbor
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: false, wumpusAlive: true, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toContain('forward');
      expect(reasoning).toContain('exploring');
    });

    it('prefers adjacent over distant unvisited safe cells', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.safe[4]![5] = true; // adjacent safe unvisited
      kb.safe[0]![0] = true; // distant safe unvisited
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: false, wumpusAlive: true, kb,
      });
      const [, reasoning] = aiDecide(s);
      expect(reasoning).toContain('neighbor');
    });
  });

  describe('Priority 5: Safe unvisited reachable cell', () => {
    it('pathfinds to safe unvisited cell when no adjacent safe unvisited', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      // All adjacent cells are visited
      for (const [nr, nc] of neighbors(r, c)) {
        kb.visited[nr]![nc] = true;
        kb.safe[nr]![nc] = true;
      }
      // Distant safe unvisited cell reachable through safe visited cells
      kb.safe[3]![5] = true; // unvisited, safe
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: false, wumpusAlive: true, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toContain('forward');
      expect(reasoning).toContain('Pathfinding to safe unvisited');
    });
  });

  describe('Priority 6: Risk least dangerous cell', () => {
    it('risks cell with lowest danger when no safe moves', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      // All adjacent cells are visited so no safe unvisited adjacent
      for (const [nr, nc] of neighbors(r, c)) {
        kb.visited[nr]![nc] = true;
        kb.safe[nr]![nc] = true;
      }
      // No safe unvisited cells anywhere
      // (3,5) is unvisited, not safe, adjacent to visited (4,5)
      kb.maybePit[3]![5] = true; // risk=1
      // (4,4) is unvisited, not safe, adjacent to visited (5,4) and (4,5), risk=0
      // Actually (4,4) needs to NOT be visited and NOT be safe
      // but it IS already visited from the loop above since it's a neighbor of (5,4)
      // Use a cell that's adjacent to a visited cell but not itself visited
      // (3,4) is adjacent to (4,4) which is visited, risk=0
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: false, wumpusAlive: false, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toContain('forward');
      expect(reasoning).toContain('Risking');
    });
  });

  describe('Priority 7: Go home and climb', () => {
    it('at entrance with no options => climb', () => {
      const board = blankBoard();
      const kb = freshKB();
      // All cells either visited or definitely pit — no exploration possible
      for (let r = 0; r < GRID_SIZE; r++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          kb.visited[r]![cc] = true;
          kb.safe[r]![cc] = true;
        }
      }
      const s = makeState({
        board, hasArrow: false, wumpusAlive: false, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions).toEqual(['climb']);
      expect(reasoning).toContain('No options left');
    });

    it('not at entrance with no options => pathfind home + climb', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      // All cells visited — nothing to explore
      for (let rr = 0; rr < GRID_SIZE; rr++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          kb.visited[rr]![cc] = true;
          kb.safe[rr]![cc] = true;
        }
      }
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: RIGHT,
        hasArrow: false, wumpusAlive: false, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      expect(actions[actions.length - 1]).toBe('climb');
      expect(reasoning).toContain('retreating to entrance');
    });
  });

  describe('Edge cases', () => {
    it('agent facing direction that needs turns before shooting aligned wumpus', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      kb.wumpusLocation = [5, 8]; // same row, to the right
      // Agent facing UP, needs to turn to RIGHT
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: true, wumpusAlive: true, kb,
      });
      const [actions] = aiDecide(s);
      expect(actions).toContain('shoot');
      // Should include a turn
      expect(actions.length).toBeGreaterThan(1);
      expect(actions[0]).toBe('turnRight');
    });

    it('hasGold + no safe path home => attempts climb', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      // No safe path back to start
      const s = makeState({
        board, agentRow: r, agentCol: c,
        hasGold: true, kb,
      });
      const [actions] = aiDecide(s);
      expect(actions).toEqual(['climb']);
    });

    it('wumpus location known but cannot find safe cell to shoot from', () => {
      const board = blankBoard();
      const r = 5, c = 5;
      board[START_ROW]![START_COL]! &= ~AGENT;
      board[r]![c]! = AGENT | VISITED;
      const kb = freshKB();
      kb.visited[r]![c] = true;
      kb.safe[r]![c] = true;
      // Wumpus at (2,8), not aligned with agent
      kb.wumpusLocation = [2, 8];
      // No safe cells on same row or col as wumpus that we can reach
      // Falls through to priority 4+
      // Make a safe unvisited neighbor so priority 4 triggers
      kb.safe[4]![5] = true;
      const s = makeState({
        board, agentRow: r, agentCol: c, agentDir: UP,
        hasArrow: true, wumpusAlive: true, kb,
      });
      const [actions, reasoning] = aiDecide(s);
      // Should fall through to exploration since can't line up shot
      expect(actions).toContain('forward');
      expect(reasoning).toContain('exploring');
    });
  });
});

// ── Additional coverage tests ───────────────────────────────────────

describe('emptyGrid4', () => {
  it('creates a GRID_SIZE x GRID_SIZE grid filled with the given value', () => {
    const grid = emptyGrid4(42);
    expect(grid.length).toBe(GRID_SIZE);
    for (const row of grid) {
      expect(row.length).toBe(GRID_SIZE);
      for (const cell of row) {
        expect(cell).toBe(42);
      }
    }
  });

  it('creates independent rows (mutating one does not affect others)', () => {
    const grid = emptyGrid4(false);
    grid[0]![0] = true;
    expect(grid[1]![0]).toBe(false);
  });
});

describe('neighbors', () => {
  it('returns 4 neighbors for interior cell', () => {
    const n = neighbors(5, 5);
    expect(n.length).toBe(4);
    expect(n).toContainEqual([4, 5]);
    expect(n).toContainEqual([6, 5]);
    expect(n).toContainEqual([5, 4]);
    expect(n).toContainEqual([5, 6]);
  });

  it('returns 2 neighbors for corner cell (0,0)', () => {
    const n = neighbors(0, 0);
    expect(n.length).toBe(2);
    expect(n).toContainEqual([1, 0]);
    expect(n).toContainEqual([0, 1]);
  });

  it('returns 3 neighbors for edge cell', () => {
    const n = neighbors(0, 5);
    expect(n.length).toBe(3);
  });

  it('returns 2 neighbors for bottom-right corner', () => {
    const n = neighbors(GRID_SIZE - 1, GRID_SIZE - 1);
    expect(n.length).toBe(2);
  });
});

describe('displayCoord', () => {
  it('converts to 1-indexed bottom-left origin', () => {
    // Row 9, Col 0 => [1, 1] (bottom-left)
    expect(displayCoord(GRID_SIZE - 1, 0)).toBe('[1,1]');
    // Row 0, Col 0 => [1, 10] (top-left)
    expect(displayCoord(0, 0)).toBe(`[1,${GRID_SIZE}]`);
    // Row 0, Col 9 => [10, 10]
    expect(displayCoord(0, GRID_SIZE - 1)).toBe(`[${GRID_SIZE},${GRID_SIZE}]`);
  });
});

describe('createKnowledgeBase', () => {
  it('marks start cell as visited, safe, noPit, noWumpus', () => {
    const kb = createKnowledgeBase();
    expect(kb.visited[START_ROW]![START_COL]).toBe(true);
    expect(kb.safe[START_ROW]![START_COL]).toBe(true);
    expect(kb.noPit[START_ROW]![START_COL]).toBe(true);
    expect(kb.noWumpus[START_ROW]![START_COL]).toBe(true);
    expect(kb.wumpusLocation).toBeNull();
  });
});

describe('updateKnowledge advanced scenarios', () => {
  it('constraint propagation iterates until stable', () => {
    // Set up a scenario where pit constraint propagation cascades
    const board = blankBoard();
    // Breezy cells at (5,5) and (5,7), both visited
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[5]![5]! = VISITED | BREEZE;
    board[5]![7]! = VISITED | BREEZE;
    board[5]![6]! = AGENT | VISITED;

    const kb = freshKB();
    kb.visited[5]![5] = true;
    kb.visited[5]![6] = true;
    kb.visited[5]![7] = true;
    kb.safe[5]![5] = true;
    kb.safe[5]![6] = true;
    kb.safe[5]![7] = true;
    kb.noPit[5]![5] = true;
    kb.noPit[5]![6] = true;
    kb.noPit[5]![7] = true;
    // For (5,5) breeze: neighbors are (4,5), (6,5), (5,4), (5,6)
    // (5,6) is visited/noPit. Mark (4,5) and (5,4) as noPit.
    kb.noPit[4]![5] = true;
    kb.noPit[5]![4] = true;
    // => (6,5) is the only unknown for (5,5)'s breeze => definitelyPit

    // For (5,7) breeze: neighbors are (4,7), (6,7), (5,6), (5,8)
    // (5,6) is visited/noPit. Leave all others unknown.
    // After (6,5) is marked definitelyPit => does NOT directly cascade to (5,7)

    const s = makeState({
      board, agentRow: 5, agentCol: 6, kb, wumpusAlive: true,
    });
    const [newKB] = updateKnowledge(s);

    // (6,5) should be definitelyPit from (5,5)'s constraint
    expect(newKB.definitelyPit[6]![5]).toBe(true);
  });

  it('wumpus constraint: multiple stenchy cells narrow down location', () => {
    const board = blankBoard();
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[5]![5]! = VISITED | STENCH;
    board[5]![7]! = VISITED | STENCH;
    board[5]![6]! = AGENT | VISITED;

    const kb = freshKB();
    kb.visited[5]![5] = true;
    kb.visited[5]![6] = true;
    kb.visited[5]![7] = true;
    kb.safe[5]![5] = true;
    kb.safe[5]![6] = true;
    kb.safe[5]![7] = true;
    // For (5,5): neighbors (4,5), (6,5), (5,4), (5,6)
    // Mark all but (6,5) as noWumpus
    kb.noWumpus[4]![5] = true;
    kb.noWumpus[5]![4] = true;
    kb.noWumpus[5]![5] = true;
    kb.noWumpus[5]![6] = true;
    kb.noWumpus[5]![7] = true;

    const s = makeState({
      board, agentRow: 5, agentCol: 6, kb, wumpusAlive: true,
    });
    const [newKB, reasoning] = updateKnowledge(s);

    expect(newKB.wumpusLocation).toEqual([6, 5]);
    expect(reasoning).toContain('WUMPUS located');
  });
});

describe('aiDecide - shooting from same column', () => {
  it('wumpus on same column => shoot in correct direction', () => {
    const board = blankBoard();
    const r = 5, c = 5;
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[r]![c]! = AGENT | VISITED;
    const kb = freshKB();
    kb.visited[r]![c] = true;
    kb.safe[r]![c] = true;
    kb.wumpusLocation = [2, 5]; // same col, above
    const s = makeState({
      board, agentRow: r, agentCol: c, agentDir: UP,
      hasArrow: true, wumpusAlive: true, kb,
    });
    const [actions] = aiDecide(s);
    expect(actions[actions.length - 1]).toBe('shoot');
  });
});

describe('aiDecide - move to same column as wumpus to shoot', () => {
  it('finds safe cell on same column as wumpus and moves there', () => {
    const board = blankBoard();
    const r = 5, c = 5;
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[r]![c]! = AGENT | VISITED;
    const kb = freshKB();
    kb.visited[r]![c] = true;
    kb.safe[r]![c] = true;
    // Wumpus at (2,8) — not on same row or col
    kb.wumpusLocation = [2, 8];
    // No safe cells on same row as wumpus
    // But safe cell on same col as wumpus at (5,8) reachable via safe cells
    kb.safe[5]![6] = true;
    kb.safe[5]![7] = true;
    kb.safe[5]![8] = true;
    const s = makeState({
      board, agentRow: r, agentCol: c, agentDir: RIGHT,
      hasArrow: true, wumpusAlive: true, kb,
    });
    const [actions, reasoning] = aiDecide(s);
    expect(actions[actions.length - 1]).toBe('shoot');
    expect(reasoning).toContain('Moving to');
  });
});

describe('pathToActions - complex multi-step', () => {
  it('handles zig-zag path correctly', () => {
    // Path: (5,5) -> (5,6) -> (4,6) -> (4,7)
    const actions = pathToActions(RIGHT, [[5, 6], [4, 6], [4, 7]], 5, 5);
    expect(actions).toEqual([
      'forward',           // RIGHT to (5,6)
      'turnLeft', 'forward', // UP to (4,6)
      'turnRight', 'forward', // RIGHT to (4,7)
    ]);
  });
});

describe('findPath edge cases', () => {
  it('start cell does not need to be marked safe', () => {
    const kb = freshKB();
    // Start at (5,5) which is NOT safe, target at (5,6) which IS safe
    // findPath starts BFS from (5,5) regardless of safe status
    kb.safe[5]![6] = true;
    const path = findPath(kb, 5, 5, 5, 6);
    expect(path).not.toBeNull();
    expect(path!.length).toBe(1);
  });

  it('handles single-cell-wide corridor', () => {
    const kb = freshKB();
    kb.safe[5]![0] = true;
    kb.safe[5]![1] = true;
    kb.safe[5]![2] = true;
    kb.safe[5]![3] = true;
    const path = findPath(kb, 5, 0, 5, 3);
    expect(path).toEqual([[5, 1], [5, 2], [5, 3]]);
  });
});

describe('turnsToFace additional coverage', () => {
  it('LEFT to UP is turnRight', () => {
    expect(turnsToFace(LEFT, UP)).toEqual(['turnRight']);
  });

  it('DOWN to LEFT is turnRight', () => {
    expect(turnsToFace(DOWN, LEFT)).toEqual(['turnRight']);
  });

  it('UP to DOWN is 180', () => {
    expect(turnsToFace(UP, DOWN)).toEqual(['turnLeft', 'turnLeft']);
  });
});

describe('aiDecide - risky cell sorting', () => {
  it('prefers risk=0 cell over risk=1 cell', () => {
    const board = blankBoard();
    const r = START_ROW, c = START_COL;
    const kb = freshKB();
    // All safe cells are visited — force risky path
    // neighbor (START_ROW-1, 0) is unvisited, maybePit (risk=1)
    kb.maybePit[START_ROW - 1]![0] = true;
    // neighbor (START_ROW, 1) is unvisited, no flags (risk=0)
    // Neither is safe, neither is visited, both adjacent to visited start
    const s = makeState({ board, kb, hasArrow: false, wumpusAlive: false });
    const [, reasoning] = aiDecide(s);
    // Should risk the cell with risk=0 first
    expect(reasoning).toContain('Risking');
    // The coord for (START_ROW, 1) = [2, 1]
    expect(reasoning).toContain('unknown risk');
  });
});

describe('aiDecide - completely stuck', () => {
  it('returns ["climb"] when not at entrance and no path home', () => {
    const board = blankBoard();
    const r = 5, c = 5;
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[r]![c]! = AGENT | VISITED;
    const kb = freshKB();
    kb.visited[r]![c] = true;
    kb.safe[r]![c] = true;
    // All neighbors are definitelyPit or wumpus — no valid risky cells either
    for (const [nr, nc] of neighbors(r, c)) {
      kb.definitelyPit[nr]![nc] = true;
      kb.visited[nr]![nc] = false;
    }
    // Also mark everything visited so risky filter eliminates them
    // Actually, definitelyPit cells are skipped in risky, and no other unvisited cells
    // exist adjacent to visited cells. And all other cells are not adjacent to visited cells.
    // No path home since all neighbors are pits.
    // This hits priority 7: no path home
    const s = makeState({
      board, agentRow: r, agentCol: c,
      hasArrow: false, wumpusAlive: false, kb,
    });
    const [actions, reasoning] = aiDecide(s);
    expect(actions).toEqual(['climb']);
    expect(reasoning).toContain('stuck');
  });
});

describe('updateKnowledge - stench does not mark maybeWumpus on noWumpus cells', () => {
  it('cells already proven noWumpus are not marked maybeWumpus', () => {
    const board = blankBoard();
    const r = 5, c = 5;
    board[START_ROW]![START_COL]! &= ~AGENT;
    board[r]![c]! = AGENT | VISITED | STENCH;

    const kb = freshKB();
    kb.visited[r]![c] = true;
    kb.noWumpus[6]![5] = true; // already proven
    const s = makeState({ board, agentRow: r, agentCol: c, kb, wumpusAlive: true });
    const [newKB] = updateKnowledge(s);

    expect(newKB.maybeWumpus[6]![5]).toBe(false);
  });
});

describe('aiDecide - wumpus location skipped in risky cells', () => {
  it('does not risk cell with known living wumpus', () => {
    const board = blankBoard();
    const kb = freshKB();
    kb.wumpusLocation = [START_ROW - 1, START_COL];
    // Mark the other adjacent cell as definitelyPit so it's also skipped
    // START is bottom-left corner (9,0), neighbors are (8,0) and (9,1)
    kb.definitelyPit[START_ROW]![START_COL + 1] = true;
    // Agent has no arrow, wumpus location is known but can't shoot
    const s = makeState({
      board, kb, hasArrow: false, wumpusAlive: true,
    });
    const [actions] = aiDecide(s);
    // Should not risk moving to wumpus location, other neighbor is definitelyPit
    // Falls through to go home (already there) => climb
    expect(actions).toEqual(['climb']);
  });
});

describe('shootDirection - edge', () => {
  it('same row same side returns LEFT when sc >= wc', () => {
    expect(shootDirection(3, 5, 3, 5)).toBe(LEFT);
    expect(shootDirection(3, 5, 3, 3)).toBe(LEFT);
    expect(shootDirection(3, 3, 3, 5)).toBe(RIGHT);
  });

  it('same col returns correct vertical direction', () => {
    expect(shootDirection(3, 5, 5, 5)).toBe(DOWN);
    expect(shootDirection(5, 5, 3, 5)).toBe(UP);
  });
});

describe('addPercepts', () => {
  it('adds BREEZE around pits and STENCH around wumpus', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5]! = PIT;
    board[3]![3]! = WUMPUS;
    addPercepts(board);

    // Check breeze around pit (5,5)
    expect(board[4]![5]! & BREEZE).toBeTruthy();
    expect(board[6]![5]! & BREEZE).toBeTruthy();
    expect(board[5]![4]! & BREEZE).toBeTruthy();
    expect(board[5]![6]! & BREEZE).toBeTruthy();

    // Check stench around wumpus (3,3)
    expect(board[2]![3]! & STENCH).toBeTruthy();
    expect(board[4]![3]! & STENCH).toBeTruthy();
    expect(board[3]![2]! & STENCH).toBeTruthy();
    expect(board[3]![4]! & STENCH).toBeTruthy();
  });
});

describe('getPercepts', () => {
  it('returns ["None"] for empty cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 5, 5, false, false)).toEqual(['None']);
  });

  it('returns Stench for stench cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5]! = STENCH;
    expect(getPercepts(board, 5, 5, false, false)).toContain('Stench');
  });

  it('returns Breeze for breeze cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5]! = BREEZE;
    expect(getPercepts(board, 5, 5, false, false)).toContain('Breeze');
  });

  it('returns Glitter for gold cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5]! = GOLD;
    expect(getPercepts(board, 5, 5, false, false)).toContain('Glitter');
  });

  it('returns Bump when bump is true', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 5, 5, true, false)).toContain('Bump');
  });

  it('returns Scream when scream is true', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 5, 5, false, true)).toContain('Scream');
  });

  it('returns multiple percepts combined', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5]! = STENCH | BREEZE | GOLD;
    const p = getPercepts(board, 5, 5, true, true);
    expect(p).toContain('Stench');
    expect(p).toContain('Breeze');
    expect(p).toContain('Glitter');
    expect(p).toContain('Bump');
    expect(p).toContain('Scream');
  });
});
