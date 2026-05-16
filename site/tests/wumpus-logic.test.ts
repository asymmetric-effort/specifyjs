// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';

/** Helper: check that an array of arrays contains a specific sub-array (deep equality) */
function containsEqual(arr: unknown[][], target: unknown[]): boolean {
  return arr.some(item => JSON.stringify(item) === JSON.stringify(target));
}

import {
  // Constants
  GRID_SIZE, START_ROW, START_COL,
  EMPTY, PIT, WUMPUS, GOLD, AGENT, STENCH, BREEZE, VISITED,
  RIGHT, UP, LEFT, DOWN,
  DIR_LABELS, DIR_NAMES, DIR_DELTA,
  // Color constants
  C_UNKNOWN, C_EMPTY, C_AGENT, C_PIT, C_WUMPUS, C_GOLD,
  C_STENCH, C_BREEZE, C_BOTH, C_DEAD, C_WIN,
  COLOR_MAP,
  // Functions
  emptyGrid4, neighbors, addPercepts, generateBoard,
  getPercepts, displayCoord,
  createKnowledgeBase, createInitialState,
  addLog, doMoveForward, doTurnLeft, doTurnRight,
  doShoot, doGrab, doClimb,
  buildDisplayGrid, getCellLabel, executeAction,
  // Types
  type GameState, type Direction, type KnowledgeBase,
} from '../src/screens/wumpus-logic';

// ── Helpers ─────────────────────────────────────────────────────────

/** Create a minimal GameState with a clean board for deterministic testing. */
function makeState(overrides?: Partial<GameState>): GameState {
  const board = emptyGrid4<number>(EMPTY);
  board[START_ROW]![START_COL]! |= AGENT | VISITED;
  const revealed = emptyGrid4<boolean>(false);
  revealed[START_ROW]![START_COL] = true;
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
    log: ['Start'],
    revealed,
    kb: createKnowledgeBase(),
    aiPlan: [],
    aiReasoning: '',
  };
  return { ...base, ...overrides };
}

// ── Constants ───────────────────────────────────────────────────────

describe('Constants', () => {
  it('GRID_SIZE is 10', () => {
    expect(GRID_SIZE).toBe(10);
  });

  it('START_ROW is 9 and START_COL is 0', () => {
    expect(START_ROW).toBe(9);
    expect(START_COL).toBe(0);
  });

  it('cell flags are correct bitmask values', () => {
    expect(EMPTY).toBe(0);
    expect(PIT).toBe(1);
    expect(WUMPUS).toBe(2);
    expect(GOLD).toBe(4);
    expect(AGENT).toBe(8);
    expect(STENCH).toBe(16);
    expect(BREEZE).toBe(32);
    expect(VISITED).toBe(64);
  });

  it('cell flags are non-overlapping powers of 2', () => {
    const flags = [PIT, WUMPUS, GOLD, AGENT, STENCH, BREEZE, VISITED];
    for (let i = 0; i < flags.length; i++) {
      for (let j = i + 1; j < flags.length; j++) {
        expect(flags[i]! & flags[j]!).toBe(0);
      }
    }
  });

  it('direction constants are 0-3', () => {
    expect(RIGHT).toBe(0);
    expect(UP).toBe(1);
    expect(LEFT).toBe(2);
    expect(DOWN).toBe(3);
  });

  it('DIR_LABELS has correct arrows', () => {
    expect(DIR_LABELS).toEqual(['\u2192', '\u2191', '\u2190', '\u2193']);
  });

  it('DIR_NAMES has correct names', () => {
    expect(DIR_NAMES).toEqual(['East', 'North', 'West', 'South']);
  });

  it('DIR_DELTA has correct deltas', () => {
    expect(DIR_DELTA[RIGHT]).toEqual([0, 1]);
    expect(DIR_DELTA[UP]).toEqual([-1, 0]);
    expect(DIR_DELTA[LEFT]).toEqual([0, -1]);
    expect(DIR_DELTA[DOWN]).toEqual([1, 0]);
  });
});

// ── emptyGrid4 ──────────────────────────────────────────────────────

describe('emptyGrid4', () => {
  it('creates a GRID_SIZE x GRID_SIZE grid', () => {
    const g = emptyGrid4(0);
    expect(g.length).toBe(GRID_SIZE);
    for (const row of g) expect(row.length).toBe(GRID_SIZE);
  });

  it('fills with the given numeric value', () => {
    const g = emptyGrid4(42);
    for (const row of g) {
      for (const cell of row) expect(cell).toBe(42);
    }
  });

  it('fills with the given boolean value', () => {
    const gTrue = emptyGrid4(true);
    const gFalse = emptyGrid4(false);
    for (const row of gTrue) {
      for (const cell of row) expect(cell).toBe(true);
    }
    for (const row of gFalse) {
      for (const cell of row) expect(cell).toBe(false);
    }
  });

  it('each row is an independent array', () => {
    const g = emptyGrid4(0);
    g[0]![0] = 99;
    expect(g[1]![0]).toBe(0);
  });
});

// ── neighbors ───────────────────────────────────────────────────────

describe('neighbors', () => {
  it('corner (0,0) has 2 neighbors', () => {
    const n = neighbors(0, 0);
    expect(n.length).toBe(2);
    expect(containsEqual(n, [1, 0])).toBe(true);
    expect(containsEqual(n, [0, 1])).toBe(true);
  });

  it('corner (0, GRID_SIZE-1) has 2 neighbors', () => {
    const n = neighbors(0, GRID_SIZE - 1);
    expect(n.length).toBe(2);
    expect(containsEqual(n, [1, GRID_SIZE - 1])).toBe(true);
    expect(containsEqual(n, [0, GRID_SIZE - 2])).toBe(true);
  });

  it('corner (GRID_SIZE-1, 0) has 2 neighbors', () => {
    const n = neighbors(GRID_SIZE - 1, 0);
    expect(n.length).toBe(2);
    expect(containsEqual(n, [GRID_SIZE - 2, 0])).toBe(true);
    expect(containsEqual(n, [GRID_SIZE - 1, 1])).toBe(true);
  });

  it('corner (GRID_SIZE-1, GRID_SIZE-1) has 2 neighbors', () => {
    const n = neighbors(GRID_SIZE - 1, GRID_SIZE - 1);
    expect(n.length).toBe(2);
  });

  it('edge cell (0,5) has 3 neighbors', () => {
    const n = neighbors(0, 5);
    expect(n.length).toBe(3);
    expect(containsEqual(n, [1, 5])).toBe(true);
    expect(containsEqual(n, [0, 4])).toBe(true);
    expect(containsEqual(n, [0, 6])).toBe(true);
  });

  it('edge cell (5,0) has 3 neighbors', () => {
    const n = neighbors(5, 0);
    expect(n.length).toBe(3);
  });

  it('interior cell (5,5) has 4 neighbors', () => {
    const n = neighbors(5, 5);
    expect(n.length).toBe(4);
    expect(containsEqual(n, [4, 5])).toBe(true);
    expect(containsEqual(n, [6, 5])).toBe(true);
    expect(containsEqual(n, [5, 4])).toBe(true);
    expect(containsEqual(n, [5, 6])).toBe(true);
  });
});

// ── addPercepts ─────────────────────────────────────────────────────

describe('addPercepts', () => {
  it('places BREEZE adjacent to PIT', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5] = PIT;
    addPercepts(board);
    for (const [nr, nc] of neighbors(5, 5)) {
      expect(board[nr]![nc]! & BREEZE).toBeTruthy();
    }
  });

  it('places STENCH adjacent to WUMPUS', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[3]![3] = WUMPUS;
    addPercepts(board);
    for (const [nr, nc] of neighbors(3, 3)) {
      expect(board[nr]![nc]! & STENCH).toBeTruthy();
    }
  });

  it('does not affect the pit cell itself with BREEZE', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5] = PIT;
    addPercepts(board);
    expect(board[5]![5]! & BREEZE).toBeFalsy();
  });

  it('does not affect the wumpus cell itself with STENCH', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[3]![3] = WUMPUS;
    addPercepts(board);
    expect(board[3]![3]! & STENCH).toBeFalsy();
  });

  it('multiple pits create overlapping breezes', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[2]![2] = PIT;
    board[2]![4] = PIT;
    addPercepts(board);
    // (2,3) is adjacent to both pits
    expect(board[2]![3]! & BREEZE).toBeTruthy();
    // unique neighbors also get breeze
    expect(board[1]![2]! & BREEZE).toBeTruthy();
    expect(board[1]![4]! & BREEZE).toBeTruthy();
  });

  it('pit and wumpus on same cell creates both percepts on neighbors', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[5]![5] = PIT | WUMPUS;
    addPercepts(board);
    for (const [nr, nc] of neighbors(5, 5)) {
      expect(board[nr]![nc]! & BREEZE).toBeTruthy();
      expect(board[nr]![nc]! & STENCH).toBeTruthy();
    }
  });
});

// ── generateBoard ───────────────────────────────────────────────────

describe('generateBoard', () => {
  it('board is GRID_SIZE x GRID_SIZE', () => {
    const board = generateBoard();
    expect(board.length).toBe(GRID_SIZE);
    for (const row of board) expect(row.length).toBe(GRID_SIZE);
  });

  it('contains exactly one WUMPUS', () => {
    const board = generateBoard();
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell & WUMPUS) count++;
      }
    }
    expect(count).toBe(1);
  });

  it('contains exactly one GOLD', () => {
    const board = generateBoard();
    let count = 0;
    for (const row of board) {
      for (const cell of row) {
        if (cell & GOLD) count++;
      }
    }
    expect(count).toBe(1);
  });

  it('agent start cell has AGENT flag', () => {
    const board = generateBoard();
    expect(board[START_ROW]![START_COL]! & AGENT).toBeTruthy();
  });

  it('agent start cell never has WUMPUS, GOLD, or PIT', () => {
    for (let i = 0; i < 20; i++) {
      const board = generateBoard();
      const cell = board[START_ROW]![START_COL]!;
      expect(cell & WUMPUS).toBeFalsy();
      expect(cell & GOLD).toBeFalsy();
      expect(cell & PIT).toBeFalsy();
    }
  });

  it('STENCH placed adjacent to WUMPUS', () => {
    const board = generateBoard();
    let wr = -1, wc = -1;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r]![c]! & WUMPUS) { wr = r; wc = c; }
      }
    }
    for (const [nr, nc] of neighbors(wr, wc)) {
      expect(board[nr]![nc]! & STENCH).toBeTruthy();
    }
  });

  it('BREEZE placed adjacent to each PIT', () => {
    const board = generateBoard();
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (board[r]![c]! & PIT) {
          for (const [nr, nc] of neighbors(r, c)) {
            expect(board[nr]![nc]! & BREEZE).toBeTruthy();
          }
        }
      }
    }
  });

  it('invariants hold across multiple generations', () => {
    for (let i = 0; i < 10; i++) {
      const board = generateBoard();
      let wumpusCount = 0;
      let goldCount = 0;
      for (const row of board) {
        for (const cell of row) {
          if (cell & WUMPUS) wumpusCount++;
          if (cell & GOLD) goldCount++;
        }
      }
      expect(wumpusCount).toBe(1);
      expect(goldCount).toBe(1);
      expect(board[START_ROW]![START_COL]! & AGENT).toBeTruthy();
    }
  });
});

// ── getPercepts ─────────────────────────────────────────────────────

describe('getPercepts', () => {
  it('returns ["Stench"] for cell with STENCH', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = STENCH;
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['Stench']);
  });

  it('returns ["Breeze"] for cell with BREEZE', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = BREEZE;
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['Breeze']);
  });

  it('returns ["Glitter"] for cell with GOLD', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = GOLD;
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['Glitter']);
  });

  it('returns ["Bump"] when bump=true on empty cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 0, 0, true, false)).toEqual(['Bump']);
  });

  it('returns ["Scream"] when scream=true on empty cell', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 0, 0, false, true)).toEqual(['Scream']);
  });

  it('returns ["None"] for empty cell with no bump/scream', () => {
    const board = emptyGrid4<number>(EMPTY);
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['None']);
  });

  it('returns multiple percepts combined', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = STENCH | BREEZE | GOLD;
    const p = getPercepts(board, 0, 0, true, true);
    expect(p).toEqual(['Stench', 'Breeze', 'Glitter', 'Bump', 'Scream']);
  });

  it('order is Stench, Breeze, Glitter, Bump, Scream', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = GOLD | STENCH | BREEZE;
    const p = getPercepts(board, 0, 0, true, true);
    expect(p[0]).toBe('Stench');
    expect(p[1]).toBe('Breeze');
    expect(p[2]).toBe('Glitter');
    expect(p[3]).toBe('Bump');
    expect(p[4]).toBe('Scream');
  });
});

// ── displayCoord ────────────────────────────────────────────────────

describe('displayCoord', () => {
  it('converts (9,0) to [1,1] (bottom-left)', () => {
    expect(displayCoord(9, 0)).toBe('[1,1]');
  });

  it('converts (0,9) to [10,10] (top-right)', () => {
    expect(displayCoord(0, 9)).toBe('[10,10]');
  });

  it('converts (0,0) to [1,10]', () => {
    expect(displayCoord(0, 0)).toBe('[1,10]');
  });

  it('converts (9,9) to [10,1]', () => {
    expect(displayCoord(9, 9)).toBe('[10,1]');
  });

  it('converts (5,5) to [6,5]', () => {
    expect(displayCoord(5, 5)).toBe('[6,5]');
  });
});

// ── createKnowledgeBase ─────────────────────────────────────────────

describe('createKnowledgeBase', () => {
  let kb: KnowledgeBase;
  beforeEach(() => { kb = createKnowledgeBase(); });

  it('start cell is marked visited', () => {
    expect(kb.visited[START_ROW]![START_COL]).toBe(true);
  });

  it('start cell is marked safe', () => {
    expect(kb.safe[START_ROW]![START_COL]).toBe(true);
  });

  it('start cell is marked noPit', () => {
    expect(kb.noPit[START_ROW]![START_COL]).toBe(true);
  });

  it('start cell is marked noWumpus', () => {
    expect(kb.noWumpus[START_ROW]![START_COL]).toBe(true);
  });

  it('other cells are not visited', () => {
    expect(kb.visited[0]![0]).toBe(false);
    expect(kb.visited[5]![5]).toBe(false);
  });

  it('other cells are not safe', () => {
    expect(kb.safe[0]![0]).toBe(false);
    expect(kb.safe[5]![5]).toBe(false);
  });

  it('wumpusLocation is null', () => {
    expect(kb.wumpusLocation).toBeNull();
  });
});

// ── createInitialState ──────────────────────────────────────────────

describe('createInitialState', () => {
  let state: GameState;
  beforeEach(() => { state = createInitialState(); });

  it('agent starts at START_ROW, START_COL', () => {
    expect(state.agentRow).toBe(START_ROW);
    expect(state.agentCol).toBe(START_COL);
  });

  it('agent faces RIGHT', () => {
    expect(state.agentDir).toBe(RIGHT);
  });

  it('hasArrow is true', () => {
    expect(state.hasArrow).toBe(true);
  });

  it('hasGold is false', () => {
    expect(state.hasGold).toBe(false);
  });

  it('wumpusAlive is true', () => {
    expect(state.wumpusAlive).toBe(true);
  });

  it('score is 0', () => {
    expect(state.score).toBe(0);
  });

  it('gameOver is false', () => {
    expect(state.gameOver).toBe(false);
  });

  it('won is false', () => {
    expect(state.won).toBe(false);
  });

  it('start cell is revealed', () => {
    expect(state.revealed[START_ROW]![START_COL]).toBe(true);
  });

  it('non-start cells are not revealed', () => {
    expect(state.revealed[0]![0]).toBe(false);
  });

  it('KB is initialized correctly', () => {
    expect(state.kb.visited[START_ROW]![START_COL]).toBe(true);
    expect(state.kb.safe[START_ROW]![START_COL]).toBe(true);
    expect(state.kb.wumpusLocation).toBeNull();
  });

  it('board has AGENT and VISITED on start cell', () => {
    expect(state.board[START_ROW]![START_COL]! & AGENT).toBeTruthy();
    expect(state.board[START_ROW]![START_COL]! & VISITED).toBeTruthy();
  });

  it('log has initial entry', () => {
    expect(state.log.length).toBeGreaterThan(0);
    expect(state.log[0]).toContain('Entered the cave');
  });
});

// ── addLog ──────────────────────────────────────────────────────────

describe('addLog', () => {
  it('appends message to log', () => {
    const s = makeState({ log: ['first'] });
    const result = addLog(s, 'second');
    expect(result).toEqual(['first', 'second']);
  });

  it('does not mutate original log', () => {
    const s = makeState({ log: ['first'] });
    addLog(s, 'second');
    expect(s.log).toEqual(['first']);
  });

  it('truncates to 50 entries max', () => {
    const longLog = Array.from({ length: 55 }, (_, i) => `msg${i}`);
    const s = makeState({ log: longLog });
    const result = addLog(s, 'new');
    expect(result.length).toBe(50);
    expect(result[result.length - 1]).toBe('new');
  });

  it('keeps last 50 entries when truncating', () => {
    const longLog = Array.from({ length: 50 }, (_, i) => `msg${i}`);
    const s = makeState({ log: longLog });
    const result = addLog(s, 'new');
    expect(result.length).toBe(50);
    expect(result[0]).toBe('msg1');
    expect(result[49]).toBe('new');
  });
});

// ── doMoveForward ───────────────────────────────────────────────────

describe('doMoveForward', () => {
  it('moves agent right when facing RIGHT', () => {
    const s = makeState();
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(START_ROW);
    expect(next.agentCol).toBe(START_COL + 1);
  });

  it('moves agent up when facing UP', () => {
    const s = makeState({ agentDir: UP });
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(START_ROW - 1);
    expect(next.agentCol).toBe(START_COL);
  });

  it('decrements score by 1', () => {
    const s = makeState();
    const next = doMoveForward(s);
    expect(next.score).toBe(-1);
  });

  it('removes AGENT from old cell and adds to new cell', () => {
    const s = makeState();
    const next = doMoveForward(s);
    expect(next.board[START_ROW]![START_COL]! & AGENT).toBeFalsy();
    expect(next.board[START_ROW]![START_COL + 1]! & AGENT).toBeTruthy();
  });

  it('marks new cell as VISITED', () => {
    const s = makeState();
    const next = doMoveForward(s);
    expect(next.board[START_ROW]![START_COL + 1]! & VISITED).toBeTruthy();
  });

  it('reveals new cell', () => {
    const s = makeState();
    const next = doMoveForward(s);
    expect(next.revealed[START_ROW]![START_COL + 1]).toBe(true);
  });

  it('bump: hitting wall returns Bump percept and does not move', () => {
    // Agent at bottom-left facing DOWN (off grid)
    const s = makeState({ agentDir: DOWN });
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(START_ROW);
    expect(next.agentCol).toBe(START_COL);
    expect(next.percepts).toContain('Bump');
    expect(next.score).toBe(-1);
  });

  it('bump: hitting left wall', () => {
    const s = makeState({ agentDir: LEFT });
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(START_ROW);
    expect(next.agentCol).toBe(START_COL);
    expect(next.percepts).toContain('Bump');
  });

  it('bump: hitting top wall', () => {
    const s = makeState({ agentRow: 0, agentCol: 5, agentDir: UP });
    s.board[0]![5]! |= AGENT;
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(0);
    expect(next.percepts).toContain('Bump');
  });

  it('bump: hitting right wall', () => {
    const s = makeState({ agentRow: 5, agentCol: GRID_SIZE - 1, agentDir: RIGHT });
    s.board[5]![GRID_SIZE - 1]! |= AGENT;
    const next = doMoveForward(s);
    expect(next.agentCol).toBe(GRID_SIZE - 1);
    expect(next.percepts).toContain('Bump');
  });

  it('death by pit: gameOver=true, won=false, score -1001', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = PIT;
    const next = doMoveForward(s);
    expect(next.gameOver).toBe(true);
    expect(next.won).toBe(false);
    expect(next.score).toBe(-1001);
  });

  it('death by wumpus: gameOver=true, won=false, score -1001', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = WUMPUS;
    const next = doMoveForward(s);
    expect(next.gameOver).toBe(true);
    expect(next.won).toBe(false);
    expect(next.score).toBe(-1001);
  });

  it('moving onto dead wumpus is safe', () => {
    const s = makeState({ wumpusAlive: false });
    s.board[START_ROW]![START_COL + 1] = WUMPUS;
    const next = doMoveForward(s);
    expect(next.gameOver).toBe(false);
    expect(next.agentCol).toBe(START_COL + 1);
    expect(next.score).toBe(-1);
  });

  it('no-op when gameOver is true', () => {
    const s = makeState({ gameOver: true });
    const next = doMoveForward(s);
    expect(next).toBe(s);
  });

  it('does not mutate original state board', () => {
    const s = makeState();
    const origBoard = s.board.map(r => [...r]);
    doMoveForward(s);
    expect(s.board).toEqual(origBoard);
  });

  it('updates percepts for new cell', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = STENCH;
    const next = doMoveForward(s);
    expect(next.percepts).toContain('Stench');
  });
});

// ── doTurnLeft ──────────────────────────────────────────────────────

describe('doTurnLeft', () => {
  it('RIGHT -> UP', () => {
    const s = makeState({ agentDir: RIGHT });
    expect(doTurnLeft(s).agentDir).toBe(UP);
  });

  it('UP -> LEFT', () => {
    const s = makeState({ agentDir: UP });
    expect(doTurnLeft(s).agentDir).toBe(LEFT);
  });

  it('LEFT -> DOWN', () => {
    const s = makeState({ agentDir: LEFT });
    expect(doTurnLeft(s).agentDir).toBe(DOWN);
  });

  it('DOWN -> RIGHT', () => {
    const s = makeState({ agentDir: DOWN });
    expect(doTurnLeft(s).agentDir).toBe(RIGHT);
  });

  it('full cycle returns to original', () => {
    let s = makeState({ agentDir: RIGHT });
    s = doTurnLeft(s);
    s = doTurnLeft(s);
    s = doTurnLeft(s);
    s = doTurnLeft(s);
    expect(s.agentDir).toBe(RIGHT);
  });

  it('no-op when gameOver', () => {
    const s = makeState({ gameOver: true, agentDir: RIGHT });
    expect(doTurnLeft(s)).toBe(s);
  });
});

// ── doTurnRight ─────────────────────────────────────────────────────

describe('doTurnRight', () => {
  it('RIGHT -> DOWN', () => {
    const s = makeState({ agentDir: RIGHT });
    expect(doTurnRight(s).agentDir).toBe(DOWN);
  });

  it('DOWN -> LEFT', () => {
    const s = makeState({ agentDir: DOWN });
    expect(doTurnRight(s).agentDir).toBe(LEFT);
  });

  it('LEFT -> UP', () => {
    const s = makeState({ agentDir: LEFT });
    expect(doTurnRight(s).agentDir).toBe(UP);
  });

  it('UP -> RIGHT', () => {
    const s = makeState({ agentDir: UP });
    expect(doTurnRight(s).agentDir).toBe(RIGHT);
  });

  it('full cycle returns to original', () => {
    let s = makeState({ agentDir: RIGHT });
    s = doTurnRight(s);
    s = doTurnRight(s);
    s = doTurnRight(s);
    s = doTurnRight(s);
    expect(s.agentDir).toBe(RIGHT);
  });

  it('no-op when gameOver', () => {
    const s = makeState({ gameOver: true, agentDir: UP });
    expect(doTurnRight(s)).toBe(s);
  });
});

// ── doShoot ─────────────────────────────────────────────────────────

describe('doShoot', () => {
  it('kills wumpus in line of fire (facing right)', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 3] = WUMPUS;
    addPercepts(s.board);
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(false);
    expect(next.hasArrow).toBe(false);
    expect(next.percepts).toContain('Scream');
  });

  it('kills wumpus in line of fire (facing up)', () => {
    const s = makeState({ agentDir: UP });
    s.board[5]![START_COL] = WUMPUS;
    addPercepts(s.board);
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(false);
  });

  it('misses when wumpus not in line', () => {
    const s = makeState();
    s.board[0]![5] = WUMPUS; // not on same row/col line of fire (agent facing right)
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(true);
    expect(next.hasArrow).toBe(false);
    expect(next.percepts).not.toContain('Scream');
  });

  it('uses arrow (hasArrow becomes false)', () => {
    const s = makeState();
    const next = doShoot(s);
    expect(next.hasArrow).toBe(false);
  });

  it('cannot shoot without arrow', () => {
    const s = makeState({ hasArrow: false });
    const next = doShoot(s);
    expect(next.log[next.log.length - 1]).toContain('No arrow');
    expect(next.score).toBe(0); // no cost
  });

  it('costs 10 points', () => {
    const s = makeState();
    const next = doShoot(s);
    expect(next.score).toBe(-10);
  });

  it('removes stench from wumpus neighbors when killed', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 2] = WUMPUS;
    addPercepts(s.board);
    // verify stench is there before
    expect(s.board[START_ROW]![START_COL + 1]! & STENCH).toBeTruthy();
    const next = doShoot(s);
    // stench should be removed from neighbors
    for (const [nr, nc] of neighbors(START_ROW, START_COL + 2)) {
      expect(next.board[nr]![nc]! & STENCH).toBeFalsy();
    }
  });

  it('no-op when gameOver', () => {
    const s = makeState({ gameOver: true });
    expect(doShoot(s)).toBe(s);
  });

  it('wumpus behind agent is not hit (wrong direction)', () => {
    // Agent faces RIGHT, wumpus is to the LEFT
    const s = makeState({ agentRow: 5, agentCol: 5, agentDir: RIGHT });
    s.board[5]![5]! |= AGENT;
    s.board[5]![2] = WUMPUS;
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(true);
  });
});

// ── doGrab ──────────────────────────────────────────────────────────

describe('doGrab', () => {
  it('grabs gold when on gold cell', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL]! |= GOLD;
    const next = doGrab(s);
    expect(next.hasGold).toBe(true);
  });

  it('removes GOLD from board when grabbed', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL]! |= GOLD;
    const next = doGrab(s);
    expect(next.board[START_ROW]![START_COL]! & GOLD).toBeFalsy();
  });

  it('does nothing when no gold present', () => {
    const s = makeState();
    const next = doGrab(s);
    expect(next.hasGold).toBe(false);
    expect(next.log[next.log.length - 1]).toContain('Nothing to grab');
  });

  it('no-op when gameOver', () => {
    const s = makeState({ gameOver: true });
    expect(doGrab(s)).toBe(s);
  });
});

// ── doClimb ─────────────────────────────────────────────────────────

describe('doClimb', () => {
  it('at entrance with gold: gameOver=true, won=true, score +1000', () => {
    const s = makeState({ hasGold: true, score: -10 });
    const next = doClimb(s);
    expect(next.gameOver).toBe(true);
    expect(next.won).toBe(true);
    expect(next.score).toBe(990);
  });

  it('at entrance without gold: gameOver=true, won=false', () => {
    const s = makeState({ hasGold: false });
    const next = doClimb(s);
    expect(next.gameOver).toBe(true);
    expect(next.won).toBe(false);
    expect(next.score).toBe(0);
  });

  it('not at entrance: refuses and logs message', () => {
    const s = makeState({ agentRow: 5, agentCol: 5 });
    const next = doClimb(s);
    expect(next.gameOver).toBe(false);
    expect(next.log[next.log.length - 1]).toContain('entrance');
  });

  it('no-op when gameOver', () => {
    const s = makeState({ gameOver: true });
    expect(doClimb(s)).toBe(s);
  });

  it('victory percepts when climbing with gold', () => {
    const s = makeState({ hasGold: true });
    const next = doClimb(s);
    expect(next.percepts).toContain('Victory!');
  });

  it('escape percepts when climbing without gold', () => {
    const s = makeState({ hasGold: false });
    const next = doClimb(s);
    expect(next.percepts).toContain('Escaped without gold');
  });
});

// ── buildDisplayGrid ────────────────────────────────────────────────

describe('buildDisplayGrid', () => {
  it('agent cell shows C_AGENT', () => {
    const s = makeState();
    const grid = buildDisplayGrid(s);
    expect(grid[START_ROW]![START_COL]).toBe(C_AGENT);
  });

  it('unrevealed cells show C_UNKNOWN', () => {
    const s = makeState();
    const grid = buildDisplayGrid(s);
    expect(grid[0]![0]).toBe(C_UNKNOWN);
  });

  it('game over with win shows C_WIN at agent position', () => {
    const s = makeState({ gameOver: true, won: true });
    const grid = buildDisplayGrid(s);
    expect(grid[START_ROW]![START_COL]).toBe(C_WIN);
  });

  it('game over with loss shows C_DEAD at agent position', () => {
    const s = makeState({ gameOver: true, won: false });
    const grid = buildDisplayGrid(s);
    expect(grid[START_ROW]![START_COL]).toBe(C_DEAD);
  });

  it('revealed pit shows C_PIT', () => {
    const s = makeState();
    s.board[5]![5] = PIT;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_PIT);
  });

  it('revealed alive wumpus shows C_WUMPUS', () => {
    const s = makeState({ wumpusAlive: true });
    s.board[5]![5] = WUMPUS;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_WUMPUS);
  });

  it('revealed dead wumpus does not show C_WUMPUS', () => {
    const s = makeState({ wumpusAlive: false });
    s.board[5]![5] = WUMPUS;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).not.toBe(C_WUMPUS);
  });

  it('revealed gold shows C_GOLD', () => {
    const s = makeState({ hasGold: false });
    s.board[5]![5] = GOLD;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_GOLD);
  });

  it('gold not shown if hasGold is true', () => {
    const s = makeState({ hasGold: true });
    s.board[5]![5] = GOLD;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).not.toBe(C_GOLD);
  });

  it('stench cell shows C_STENCH', () => {
    const s = makeState();
    s.board[5]![5] = STENCH;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_STENCH);
  });

  it('breeze cell shows C_BREEZE', () => {
    const s = makeState();
    s.board[5]![5] = BREEZE;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_BREEZE);
  });

  it('stench + breeze cell shows C_BOTH', () => {
    const s = makeState();
    s.board[5]![5] = STENCH | BREEZE;
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_BOTH);
  });

  it('game over reveals all cells', () => {
    const s = makeState({ gameOver: true, won: false });
    s.board[0]![5] = PIT;
    const grid = buildDisplayGrid(s);
    // Unrevealed pit should be shown since gameOver
    expect(grid[0]![5]).toBe(C_PIT);
  });

  it('revealed empty cell shows C_EMPTY', () => {
    const s = makeState();
    s.revealed[5]![5] = true;
    const grid = buildDisplayGrid(s);
    expect(grid[5]![5]).toBe(C_EMPTY);
  });

  it('unrevealed cell during game over without content shows C_EMPTY', () => {
    const s = makeState({ gameOver: true, won: false });
    // cell at (0,5) is empty and unrevealed
    const grid = buildDisplayGrid(s);
    // Agent is at START_ROW, START_COL so (0,5) should be C_EMPTY
    expect(grid[0]![5]).toBe(C_EMPTY);
  });
});

// ── getCellLabel ────────────────────────────────────────────────────

describe('getCellLabel', () => {
  it('agent cell shows direction arrow for RIGHT', () => {
    const s = makeState({ agentDir: RIGHT });
    expect(getCellLabel(s, START_ROW, START_COL)).toBe('\u2192');
  });

  it('agent cell shows direction arrow for UP', () => {
    const s = makeState({ agentDir: UP });
    expect(getCellLabel(s, START_ROW, START_COL)).toBe('\u2191');
  });

  it('agent cell shows direction arrow for LEFT', () => {
    const s = makeState({ agentDir: LEFT });
    expect(getCellLabel(s, START_ROW, START_COL)).toBe('\u2190');
  });

  it('agent cell shows direction arrow for DOWN', () => {
    const s = makeState({ agentDir: DOWN });
    expect(getCellLabel(s, START_ROW, START_COL)).toBe('\u2193');
  });

  it('unrevealed non-game-over cell shows "?"', () => {
    const s = makeState();
    expect(getCellLabel(s, 0, 0)).toBe('?');
  });

  it('wumpus alive shows "W"', () => {
    const s = makeState({ wumpusAlive: true, gameOver: true });
    s.board[5]![5] = WUMPUS;
    expect(getCellLabel(s, 5, 5)).toBe('W');
  });

  it('wumpus dead shows skull', () => {
    const s = makeState({ wumpusAlive: false, gameOver: true });
    s.board[5]![5] = WUMPUS;
    expect(getCellLabel(s, 5, 5)).toBe('\u2620');
  });

  it('pit shows "P"', () => {
    const s = makeState({ gameOver: true });
    s.board[5]![5] = PIT;
    expect(getCellLabel(s, 5, 5)).toBe('P');
  });

  it('gold shows "G"', () => {
    const s = makeState({ hasGold: false, gameOver: true });
    s.board[5]![5] = GOLD;
    expect(getCellLabel(s, 5, 5)).toBe('G');
  });

  it('gold not shown if hasGold is true', () => {
    const s = makeState({ hasGold: true, gameOver: true });
    s.board[5]![5] = GOLD;
    expect(getCellLabel(s, 5, 5)).toBe('');
  });

  it('stench shows "~"', () => {
    const s = makeState({ gameOver: true });
    s.board[5]![5] = STENCH;
    expect(getCellLabel(s, 5, 5)).toBe('~');
  });

  it('breeze shows approx symbol', () => {
    const s = makeState({ gameOver: true });
    s.board[5]![5] = BREEZE;
    expect(getCellLabel(s, 5, 5)).toBe('\u2248');
  });

  it('multiple labels combine', () => {
    const s = makeState({ wumpusAlive: true, gameOver: true });
    s.board[5]![5] = WUMPUS | STENCH | BREEZE;
    const label = getCellLabel(s, 5, 5);
    expect(label).toContain('W');
    expect(label).toContain('~');
    expect(label).toContain('\u2248');
  });

  it('empty revealed cell returns empty string', () => {
    const s = makeState();
    s.revealed[5]![5] = true;
    expect(getCellLabel(s, 5, 5)).toBe('');
  });

  it('revealed cell shows label (not ?)', () => {
    const s = makeState();
    s.board[5]![5] = PIT;
    s.revealed[5]![5] = true;
    expect(getCellLabel(s, 5, 5)).toBe('P');
  });
});

// ── executeAction ───────────────────────────────────────────────────

describe('executeAction', () => {
  it('dispatches "forward" to doMoveForward', () => {
    const s = makeState();
    const next = executeAction(s, 'forward');
    expect(next.agentCol).toBe(START_COL + 1);
  });

  it('dispatches "turnLeft"', () => {
    const s = makeState({ agentDir: RIGHT });
    const next = executeAction(s, 'turnLeft');
    expect(next.agentDir).toBe(UP);
  });

  it('dispatches "turnRight"', () => {
    const s = makeState({ agentDir: RIGHT });
    const next = executeAction(s, 'turnRight');
    expect(next.agentDir).toBe(DOWN);
  });

  it('dispatches "shoot"', () => {
    const s = makeState();
    const next = executeAction(s, 'shoot');
    expect(next.hasArrow).toBe(false);
  });

  it('dispatches "grab"', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL]! |= GOLD;
    const next = executeAction(s, 'grab');
    expect(next.hasGold).toBe(true);
  });

  it('dispatches "climb"', () => {
    const s = makeState({ hasGold: true });
    const next = executeAction(s, 'climb');
    expect(next.gameOver).toBe(true);
    expect(next.won).toBe(true);
  });

  it('unknown action returns state unchanged', () => {
    const s = makeState();
    const next = executeAction(s, 'dance');
    expect(next).toBe(s);
  });
});

// ── COLOR_MAP ───────────────────────────────────────────────────────

describe('COLOR_MAP', () => {
  it('has entries for all 11 color codes', () => {
    const codes = [C_UNKNOWN, C_EMPTY, C_AGENT, C_PIT, C_WUMPUS, C_GOLD,
      C_STENCH, C_BREEZE, C_BOTH, C_DEAD, C_WIN];
    expect(Object.keys(COLOR_MAP).length).toBe(11);
    for (const code of codes) {
      expect(COLOR_MAP[code]).toBeDefined();
      expect(typeof COLOR_MAP[code]).toBe('string');
    }
  });

  it('C_UNKNOWN is dark', () => {
    expect(COLOR_MAP[C_UNKNOWN]).toBe('#1e293b');
  });

  it('C_AGENT is blue', () => {
    expect(COLOR_MAP[C_AGENT]).toBe('#3b82f6');
  });

  it('C_WIN is green', () => {
    expect(COLOR_MAP[C_WIN]).toBe('#16a34a');
  });

  it('C_DEAD is dark red', () => {
    expect(COLOR_MAP[C_DEAD]).toBe('#991b1b');
  });

  it('all color values are valid hex colors', () => {
    for (const color of Object.values(COLOR_MAP)) {
      expect(color).toMatch(/^#[0-9a-f]{6}$/);
    }
  });
});

// ── Edge cases & integration ────────────────────────────────────────

describe('Edge cases', () => {
  it('multiple moves accumulate score', () => {
    let s = makeState();
    s = doMoveForward(s); // -1
    s = doMoveForward(s); // -2
    s = doMoveForward(s); // -3
    expect(s.score).toBe(-3);
  });

  it('shoot then move forward onto dead wumpus', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = WUMPUS;
    addPercepts(s.board);
    let next = doShoot(s);
    expect(next.wumpusAlive).toBe(false);
    next = doMoveForward(next);
    expect(next.gameOver).toBe(false);
    expect(next.agentCol).toBe(START_COL + 1);
  });

  it('grab gold then climb for victory', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL]! |= GOLD;
    let next = doGrab(s);
    expect(next.hasGold).toBe(true);
    next = doClimb(next);
    expect(next.won).toBe(true);
    expect(next.score).toBe(1000);
  });

  it('dying on wumpus cell gives correct death percept', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = WUMPUS;
    const next = doMoveForward(s);
    expect(next.percepts).toContain('Death by Wumpus');
  });

  it('dying on pit cell gives correct death percept', () => {
    const s = makeState();
    s.board[START_ROW]![START_COL + 1] = PIT;
    const next = doMoveForward(s);
    expect(next.percepts).toContain('Death by pit');
  });

  it('all actions no-op after game over', () => {
    const s = makeState({ gameOver: true, won: false });
    expect(doMoveForward(s)).toBe(s);
    expect(doTurnLeft(s)).toBe(s);
    expect(doTurnRight(s)).toBe(s);
    expect(doShoot(s)).toBe(s);
    expect(doGrab(s)).toBe(s);
    expect(doClimb(s)).toBe(s);
  });

  it('bump cost is 1 point', () => {
    const s = makeState({ agentDir: DOWN, score: 0 });
    const next = doMoveForward(s);
    expect(next.score).toBe(-1);
  });

  it('doMoveForward moves agent left when facing LEFT from interior', () => {
    const s = makeState({ agentRow: 5, agentCol: 5, agentDir: LEFT });
    s.board[5]![5]! |= AGENT;
    const next = doMoveForward(s);
    expect(next.agentCol).toBe(4);
    expect(next.agentRow).toBe(5);
  });

  it('doMoveForward moves agent down when facing DOWN from interior', () => {
    const s = makeState({ agentRow: 5, agentCol: 5, agentDir: DOWN });
    s.board[5]![5]! |= AGENT;
    const next = doMoveForward(s);
    expect(next.agentRow).toBe(6);
    expect(next.agentCol).toBe(5);
  });

  it('shoot arrow facing LEFT kills wumpus', () => {
    const s = makeState({ agentRow: 5, agentCol: 5, agentDir: LEFT });
    s.board[5]![5]! |= AGENT;
    s.board[5]![2] = WUMPUS;
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(false);
  });

  it('shoot arrow facing DOWN kills wumpus', () => {
    const s = makeState({ agentRow: 2, agentCol: 3, agentDir: DOWN });
    s.board[2]![3]! |= AGENT;
    s.board[7]![3] = WUMPUS;
    const next = doShoot(s);
    expect(next.wumpusAlive).toBe(false);
  });

  it('getPercepts with AGENT flag on cell does not affect percepts', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = AGENT;
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['None']);
  });

  it('getPercepts with VISITED flag on cell does not affect percepts', () => {
    const board = emptyGrid4<number>(EMPTY);
    board[0]![0] = VISITED;
    expect(getPercepts(board, 0, 0, false, false)).toEqual(['None']);
  });

  it('displayCoord handles middle of grid', () => {
    // row=4, col=4 => [5, 6]
    expect(displayCoord(4, 4)).toBe('[5,6]');
  });

  it('addPercepts on board with no hazards adds nothing', () => {
    const board = emptyGrid4<number>(EMPTY);
    addPercepts(board);
    for (const row of board) {
      for (const cell of row) {
        expect(cell).toBe(EMPTY);
      }
    }
  });

  it('buildDisplayGrid produces GRID_SIZE x GRID_SIZE grid', () => {
    const s = makeState();
    const grid = buildDisplayGrid(s);
    expect(grid.length).toBe(GRID_SIZE);
    for (const row of grid) expect(row.length).toBe(GRID_SIZE);
  });
});
