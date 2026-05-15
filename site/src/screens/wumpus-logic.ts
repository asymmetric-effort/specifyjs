// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Wumpus World — Pure game logic module.
 *
 * Contains all constants, types, and pure functions for the Wumpus World game.
 * This module has NO framework dependencies and is independently testable.
 */

// ── Constants ────────────────────────────────────────────────────────

export const GRID_SIZE = 10;

// Agent start position (bottom-left corner)
export const START_ROW = GRID_SIZE - 1;
export const START_COL = 0;

// Cell content flags (bitmask)
export const EMPTY = 0;
export const PIT = 1;
export const WUMPUS = 2;
export const GOLD = 4;
export const AGENT = 8;
export const STENCH = 16;
export const BREEZE = 32;
export const VISITED = 64;

// Directions
export const RIGHT = 0;
export const UP = 1;
export const LEFT = 2;
export const DOWN = 3;

export type Direction = 0 | 1 | 2 | 3;

export const DIR_LABELS = ['\u2192', '\u2191', '\u2190', '\u2193'];
export const DIR_NAMES = ['East', 'North', 'West', 'South'];

// Direction deltas: [row, col] — row 0 is top
export const DIR_DELTA: Record<number, [number, number]> = {
  [RIGHT]: [0, 1],
  [UP]: [-1, 0],
  [LEFT]: [0, -1],
  [DOWN]: [1, 0],
};

// ── Types ────────────────────────────────────────────────────────────

export type PlayMode = 'human' | 'ai';

/** Per-cell knowledge flags for the AI's logical inference */
export interface KnowledgeBase {
  visited: boolean[][];
  safe: boolean[][];           // proven safe (no pit, no wumpus)
  noPit: boolean[][];          // proven no pit
  noWumpus: boolean[][];       // proven no wumpus
  maybePit: boolean[][];       // suspected pit
  maybeWumpus: boolean[][];    // suspected wumpus
  definitelyPit: boolean[][];  // proven pit
  wumpusLocation: [number, number] | null;
}

export interface GameState {
  board: number[][];
  agentRow: number;
  agentCol: number;
  agentDir: Direction;
  hasArrow: boolean;
  hasGold: boolean;
  wumpusAlive: boolean;
  score: number;
  gameOver: boolean;
  won: boolean;
  percepts: string[];
  log: string[];
  revealed: boolean[][];
  // AI fields
  kb: KnowledgeBase;
  aiPlan: string[];            // queued atomic actions
  aiReasoning: string;         // current inference explanation
}

// ── Board generation ─────────────────────────────────────────────────

export function emptyGrid4<T>(val: T): T[][] {
  const g: T[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: T[] = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(val);
    g.push(row);
  }
  return g;
}

export function neighbors(r: number, c: number): [number, number][] {
  const result: [number, number][] = [];
  if (r > 0) result.push([r - 1, c]);
  if (r < GRID_SIZE - 1) result.push([r + 1, c]);
  if (c > 0) result.push([r, c - 1]);
  if (c < GRID_SIZE - 1) result.push([r, c + 1]);
  return result;
}

export function addPercepts(board: number[][]): void {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r]![c]! & PIT) {
        for (const [nr, nc] of neighbors(r, c)) board[nr]![nc]! |= BREEZE;
      }
      if (board[r]![c]! & WUMPUS) {
        for (const [nr, nc] of neighbors(r, c)) board[nr]![nc]! |= STENCH;
      }
    }
  }
}

export function generateBoard(): number[][] {
  const board = emptyGrid4<number>(EMPTY);

  // Place Wumpus (not at agent start)
  let wr: number, wc: number;
  do {
    wr = Math.floor(Math.random() * GRID_SIZE);
    wc = Math.floor(Math.random() * GRID_SIZE);
  } while (wr === START_ROW && wc === START_COL);
  board[wr]![wc]! |= WUMPUS;

  // Place gold (not at agent start)
  let gr: number, gc: number;
  do {
    gr = Math.floor(Math.random() * GRID_SIZE);
    gc = Math.floor(Math.random() * GRID_SIZE);
  } while (gr === START_ROW && gc === START_COL);
  board[gr]![gc]! |= GOLD;

  // Place pits with 20% probability (not at agent start, not on wumpus/gold)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (r === START_ROW && c === START_COL) continue;
      if (board[r]![c]! & (WUMPUS | GOLD)) continue;
      if (Math.random() < 0.2) board[r]![c]! |= PIT;
    }
  }

  addPercepts(board);
  board[START_ROW]![START_COL]! |= AGENT;
  return board;
}

// ── Percept computation ──────────────────────────────────────────────

export function getPercepts(board: number[][], row: number, col: number, bump: boolean, scream: boolean): string[] {
  const p: string[] = [];
  const cell = board[row]![col]!;
  if (cell & STENCH) p.push('Stench');
  if (cell & BREEZE) p.push('Breeze');
  if (cell & GOLD) p.push('Glitter');
  if (bump) p.push('Bump');
  if (scream) p.push('Scream');
  if (p.length === 0) p.push('None');
  return p;
}

// ── Initial state ────────────────────────────────────────────────────

export function createKnowledgeBase(): KnowledgeBase {
  const kb: KnowledgeBase = {
    visited: emptyGrid4(false),
    safe: emptyGrid4(false),
    noPit: emptyGrid4(false),
    noWumpus: emptyGrid4(false),
    maybePit: emptyGrid4(false),
    maybeWumpus: emptyGrid4(false),
    definitelyPit: emptyGrid4(false),
    wumpusLocation: null,
  };
  // Agent start is known safe
  kb.visited[START_ROW]![START_COL] = true;
  kb.safe[START_ROW]![START_COL] = true;
  kb.noPit[START_ROW]![START_COL] = true;
  kb.noWumpus[START_ROW]![START_COL] = true;
  return kb;
}

export function createInitialState(): GameState {
  const board = generateBoard();
  const revealed = emptyGrid4(false);
  revealed[START_ROW]![START_COL] = true;
  board[START_ROW]![START_COL]! |= VISITED;
  return {
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
    percepts: getPercepts(board, START_ROW, START_COL, false, false),
    log: [`Entered the cave at ${displayCoord(START_ROW, START_COL)}. Facing East.`],
    revealed,
    kb: createKnowledgeBase(),
    aiPlan: [],
    aiReasoning: '',
  };
}

// ── Display coordinates (1-indexed, bottom-left origin) ──────────────

export function displayCoord(row: number, col: number): string {
  return `[${col + 1},${GRID_SIZE - row}]`;
}

// ── Color map ────────────────────────────────────────────────────────

export const C_UNKNOWN = 0;
export const C_EMPTY = 1;
export const C_AGENT = 2;
export const C_PIT = 3;
export const C_WUMPUS = 4;
export const C_GOLD = 5;
export const C_STENCH = 6;
export const C_BREEZE = 7;
export const C_BOTH = 8;
export const C_DEAD = 9;
export const C_WIN = 10;

export const COLOR_MAP: Record<number, string> = {
  [C_UNKNOWN]: '#1e293b',
  [C_EMPTY]: '#334155',
  [C_AGENT]: '#3b82f6',
  [C_PIT]: '#0f172a',
  [C_WUMPUS]: '#dc2626',
  [C_GOLD]: '#eab308',
  [C_STENCH]: '#854d0e',
  [C_BREEZE]: '#0e7490',
  [C_BOTH]: '#7c3aed',
  [C_DEAD]: '#991b1b',
  [C_WIN]: '#16a34a',
};

export function buildDisplayGrid(state: GameState): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = state.board[r]![c]!;
      const rev = state.revealed[r]![c]!;
      if (state.gameOver && state.agentRow === r && state.agentCol === c) {
        row.push(state.won ? C_WIN : C_DEAD);
      } else if (r === state.agentRow && c === state.agentCol) {
        row.push(C_AGENT);
      } else if (!rev && !state.gameOver) {
        row.push(C_UNKNOWN);
      } else if (cell & WUMPUS && state.wumpusAlive) {
        row.push(C_WUMPUS);
      } else if (cell & PIT) {
        row.push(C_PIT);
      } else if (cell & GOLD && !state.hasGold) {
        row.push(C_GOLD);
      } else {
        const hasStench = !!(cell & STENCH);
        const hasBreeze = !!(cell & BREEZE);
        if (hasStench && hasBreeze) row.push(C_BOTH);
        else if (hasStench) row.push(C_STENCH);
        else if (hasBreeze) row.push(C_BREEZE);
        else row.push(rev || state.gameOver ? C_EMPTY : C_UNKNOWN);
      }
    }
    grid.push(row);
  }
  return grid;
}

export function getCellLabel(state: GameState, r: number, c: number): string {
  const cell = state.board[r]![c]!;
  const rev = state.revealed[r]![c]!;
  if (r === state.agentRow && c === state.agentCol) return DIR_LABELS[state.agentDir]!;
  if (!rev && !state.gameOver) return '?';
  const parts: string[] = [];
  if (cell & WUMPUS && state.wumpusAlive) parts.push('W');
  if (cell & WUMPUS && !state.wumpusAlive) parts.push('\u2620');
  if (cell & PIT) parts.push('P');
  if (cell & GOLD && !state.hasGold) parts.push('G');
  if (cell & STENCH) parts.push('~');
  if (cell & BREEZE) parts.push('\u2248');
  return parts.length > 0 ? parts.join('') : '';
}

// ── Pure action functions ────────────────────────────────────────────
// Each takes state and returns new state. Used by both human and AI.

export function addLog(s: GameState, msg: string): string[] {
  const next = [...s.log, msg];
  if (next.length > 50) next.splice(0, next.length - 50);
  return next;
}

export function doMoveForward(s: GameState): GameState {
  if (s.gameOver) return s;
  const [dr, dc] = DIR_DELTA[s.agentDir]!;
  const nr = s.agentRow + dr;
  const nc = s.agentCol + dc;

  if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) {
    return {
      ...s,
      score: s.score - 1,
      percepts: getPercepts(s.board, s.agentRow, s.agentCol, true, false),
      log: addLog(s, `Bump! Can't move ${DIR_NAMES[s.agentDir]}.`),
    };
  }

  const board = s.board.map(row => [...row]);
  board[s.agentRow]![s.agentCol]! &= ~AGENT;
  board[nr]![nc]! |= AGENT | VISITED;
  const revealed = s.revealed.map(row => [...row]);
  revealed[nr]![nc] = true;
  const cell = board[nr]![nc]!;

  if ((cell & PIT) || (cell & WUMPUS && s.wumpusAlive)) {
    const cause = (cell & PIT) ? 'fell into a pit' : 'was eaten by the Wumpus';
    return {
      ...s, board, revealed, agentRow: nr, agentCol: nc,
      score: s.score - 1001, gameOver: true, won: false,
      percepts: [(cell & PIT) ? 'Death by pit' : 'Death by Wumpus'],
      log: addLog(s, `Moved to ${displayCoord(nr, nc)} and ${cause}! Game Over. Score: ${s.score - 1001}`),
    };
  }

  const percepts = getPercepts(board, nr, nc, false, false);
  return {
    ...s, board, revealed, agentRow: nr, agentCol: nc,
    score: s.score - 1, percepts,
    log: addLog(s, `Moved to ${displayCoord(nr, nc)}. Percepts: ${percepts.join(', ')}`),
  };
}

export function doTurnLeft(s: GameState): GameState {
  if (s.gameOver) return s;
  const newDir = ((s.agentDir + 1) % 4) as Direction;
  return { ...s, agentDir: newDir, log: addLog(s, `Turned left. Now facing ${DIR_NAMES[newDir]}.`) };
}

export function doTurnRight(s: GameState): GameState {
  if (s.gameOver) return s;
  const newDir = ((s.agentDir + 3) % 4) as Direction;
  return { ...s, agentDir: newDir, log: addLog(s, `Turned right. Now facing ${DIR_NAMES[newDir]}.`) };
}

export function doShoot(s: GameState): GameState {
  if (s.gameOver) return s;
  if (!s.hasArrow) return { ...s, log: addLog(s, 'No arrow left!') };

  const [dr, dc] = DIR_DELTA[s.agentDir]!;
  let sr = s.agentRow + dr;
  let sc = s.agentCol + dc;
  let killed = false;

  while (sr >= 0 && sr < GRID_SIZE && sc >= 0 && sc < GRID_SIZE) {
    if (s.board[sr]![sc]! & WUMPUS) { killed = true; break; }
    sr += dr;
    sc += dc;
  }

  if (killed) {
    const board = s.board.map(row => [...row]);
    for (const [nr, nc] of neighbors(sr, sc)) board[nr]![nc]! &= ~STENCH;
    return {
      ...s, board, hasArrow: false, wumpusAlive: false, score: s.score - 10,
      percepts: getPercepts(board, s.agentRow, s.agentCol, false, true),
      log: addLog(s, `Shot arrow ${DIR_NAMES[s.agentDir]}. Scream! The Wumpus is dead!`),
    };
  }

  return {
    ...s, hasArrow: false, score: s.score - 10,
    percepts: getPercepts(s.board, s.agentRow, s.agentCol, false, false),
    log: addLog(s, `Shot arrow ${DIR_NAMES[s.agentDir]}. Silence... missed.`),
  };
}

export function doGrab(s: GameState): GameState {
  if (s.gameOver) return s;
  if (!(s.board[s.agentRow]![s.agentCol]! & GOLD)) {
    return { ...s, log: addLog(s, 'Nothing to grab here.') };
  }
  const board = s.board.map(row => [...row]);
  board[s.agentRow]![s.agentCol]! &= ~GOLD;
  return { ...s, board, hasGold: true, log: addLog(s, 'Grabbed the gold!') };
}

export function doClimb(s: GameState): GameState {
  if (s.gameOver) return s;
  if (s.agentRow !== START_ROW || s.agentCol !== START_COL) {
    return { ...s, log: addLog(s, `Can only climb out at the entrance ${displayCoord(START_ROW, START_COL)}.`) };
  }
  const bonus = s.hasGold ? 1000 : 0;
  const finalScore = s.score + bonus;
  return {
    ...s, score: finalScore, gameOver: true, won: s.hasGold,
    percepts: s.hasGold ? ['Victory!'] : ['Escaped without gold'],
    log: addLog(s, s.hasGold
      ? `Climbed out with the gold! Score: ${finalScore}`
      : `Climbed out without gold. Score: ${finalScore}`),
  };
}

// ── AI Knowledge Base ────────────────────────────────────────────────

export function cloneKB(kb: KnowledgeBase): KnowledgeBase {
  return {
    visited: kb.visited.map(r => [...r]),
    safe: kb.safe.map(r => [...r]),
    noPit: kb.noPit.map(r => [...r]),
    noWumpus: kb.noWumpus.map(r => [...r]),
    maybePit: kb.maybePit.map(r => [...r]),
    maybeWumpus: kb.maybeWumpus.map(r => [...r]),
    definitelyPit: kb.definitelyPit.map(r => [...r]),
    wumpusLocation: kb.wumpusLocation ? [...kb.wumpusLocation] as [number, number] : null,
  };
}

/**
 * Update knowledge base from percepts at the agent's current position.
 * Returns [updatedKB, reasoning string].
 */
export function updateKnowledge(s: GameState): [KnowledgeBase, string] {
  const kb = cloneKB(s.kb);
  const r = s.agentRow;
  const c = s.agentCol;
  const cell = s.board[r]![c]!;
  const reasons: string[] = [];

  // Mark current cell
  kb.visited[r]![c] = true;
  kb.safe[r]![c] = true;
  kb.noPit[r]![c] = true;
  kb.noWumpus[r]![c] = true;
  kb.maybePit[r]![c] = false;
  kb.maybeWumpus[r]![c] = false;

  const hasBreeze = !!(cell & BREEZE);
  const hasStench = !!(cell & STENCH);
  const adj = neighbors(r, c);

  // ── Rule 1: No breeze → all adjacent cells have no pit ──
  if (!hasBreeze) {
    for (const [nr, nc] of adj) {
      if (!kb.noPit[nr]![nc]) {
        kb.noPit[nr]![nc] = true;
        kb.maybePit[nr]![nc] = false;
        kb.definitelyPit[nr]![nc] = false;
        reasons.push(`No breeze at ${displayCoord(r, c)} \u2192 ${displayCoord(nr, nc)} has no pit`);
      }
    }
  } else {
    // Breeze → unvisited, non-safe neighbors may have pit
    for (const [nr, nc] of adj) {
      if (!kb.visited[nr]![nc] && !kb.noPit[nr]![nc]) {
        kb.maybePit[nr]![nc] = true;
      }
    }
  }

  // ── Rule 2: No stench → all adjacent cells have no wumpus ──
  if (!hasStench) {
    for (const [nr, nc] of adj) {
      if (!kb.noWumpus[nr]![nc]) {
        kb.noWumpus[nr]![nc] = true;
        kb.maybeWumpus[nr]![nc] = false;
        reasons.push(`No stench at ${displayCoord(r, c)} \u2192 ${displayCoord(nr, nc)} has no Wumpus`);
      }
    }
  } else if (s.wumpusAlive) {
    // Stench → unvisited, non-safe neighbors may have wumpus
    for (const [nr, nc] of adj) {
      if (!kb.visited[nr]![nc] && !kb.noWumpus[nr]![nc]) {
        kb.maybeWumpus[nr]![nc] = true;
      }
    }
  }

  // ── Rule 3: Wumpus killed → all cells are wumpus-safe ──
  if (!s.wumpusAlive) {
    kb.wumpusLocation = null;
    for (let rr = 0; rr < GRID_SIZE; rr++) {
      for (let cc = 0; cc < GRID_SIZE; cc++) {
        kb.noWumpus[rr]![cc] = true;
        kb.maybeWumpus[rr]![cc] = false;
      }
    }
  }

  // ── Rule 4: Constraint propagation ──
  // For each visited breezy cell, if all adjacent unknowns except one are proven noPit,
  // the remaining one must be a pit.
  let changed = true;
  while (changed) {
    changed = false;

    for (let rr = 0; rr < GRID_SIZE; rr++) {
      for (let cc = 0; cc < GRID_SIZE; cc++) {
        if (!kb.visited[rr]![cc]) continue;
        const c2 = s.board[rr]![cc]!;

        // Pit constraint propagation
        if (c2 & BREEZE) {
          const adjCells = neighbors(rr, cc);
          const unknowns = adjCells.filter(([ar, ac]) => !kb.noPit[ar]![ac] && !kb.definitelyPit[ar]![ac]);
          const knownPits = adjCells.filter(([ar, ac]) => kb.definitelyPit[ar]![ac]);
          if (unknowns.length === 1 && knownPits.length === 0) {
            const [pr, pc] = unknowns[0]!;
            if (!kb.definitelyPit[pr]![pc]) {
              kb.definitelyPit[pr]![pc] = true;
              kb.maybePit[pr]![pc] = false;
              reasons.push(`Breeze at ${displayCoord(rr, cc)}, only unknown neighbor is ${displayCoord(pr, pc)} \u2192 PIT`);
              changed = true;
            }
          }
          // If a pit is already known, remaining neighbors are safe
          if (knownPits.length > 0) {
            for (const [ur, uc] of unknowns) {
              if (!kb.noPit[ur]![uc]) {
                kb.noPit[ur]![uc] = true;
                kb.maybePit[ur]![uc] = false;
                reasons.push(`Pit at ${displayCoord(knownPits[0]![0], knownPits[0]![1])} explains breeze at ${displayCoord(rr, cc)} \u2192 ${displayCoord(ur, uc)} safe from pits`);
                changed = true;
              }
            }
          }
        }

        // Wumpus constraint propagation
        if ((c2 & STENCH) && s.wumpusAlive && !kb.wumpusLocation) {
          const adjCells = neighbors(rr, cc);
          const unknowns = adjCells.filter(([ar, ac]) => !kb.noWumpus[ar]![ac]);
          if (unknowns.length === 1) {
            const [wr, wc] = unknowns[0]!;
            if (!kb.wumpusLocation) {
              kb.wumpusLocation = [wr, wc];
              reasons.push(`Stench at ${displayCoord(rr, cc)}, only candidate is ${displayCoord(wr, wc)} \u2192 WUMPUS located`);
              // Mark all other cells as noWumpus
              for (let i = 0; i < GRID_SIZE; i++) {
                for (let j = 0; j < GRID_SIZE; j++) {
                  if (i === wr && j === wc) continue;
                  kb.noWumpus[i]![j] = true;
                  kb.maybeWumpus[i]![j] = false;
                }
              }
              changed = true;
            }
          }
        }
      }
    }

    // Cross-reference: if only one cell in the entire grid can be the wumpus
    if (s.wumpusAlive && !kb.wumpusLocation) {
      const candidates: [number, number][] = [];
      for (let rr = 0; rr < GRID_SIZE; rr++) {
        for (let cc = 0; cc < GRID_SIZE; cc++) {
          if (!kb.noWumpus[rr]![cc] && !kb.visited[rr]![cc]) candidates.push([rr, cc]);
        }
      }
      if (candidates.length === 1) {
        const [wr, wc] = candidates[0]!;
        kb.wumpusLocation = [wr, wc];
        reasons.push(`Only one possible Wumpus location: ${displayCoord(wr, wc)}`);
        for (let i = 0; i < GRID_SIZE; i++) {
          for (let j = 0; j < GRID_SIZE; j++) {
            if (i === wr && j === wc) continue;
            kb.noWumpus[i]![j] = true;
            kb.maybeWumpus[i]![j] = false;
          }
        }
        changed = true;
      }
    }

    // Derive safe from noPit + noWumpus
    for (let rr = 0; rr < GRID_SIZE; rr++) {
      for (let cc = 0; cc < GRID_SIZE; cc++) {
        if (!kb.safe[rr]![cc] && kb.noPit[rr]![cc] && kb.noWumpus[rr]![cc]) {
          kb.safe[rr]![cc] = true;
          reasons.push(`${displayCoord(rr, cc)} proven safe (no pit + no Wumpus)`);
          changed = true;
        }
      }
    }
  }

  return [kb, reasons.length > 0 ? reasons.join('\n') : 'No new inferences.'];
}

// ── AI Pathfinding & Planning ────────────────────────────────────────

/** Direction needed to move from (r1,c1) to adjacent (r2,c2) */
export function directionTo(r1: number, c1: number, r2: number, c2: number): Direction {
  if (r2 < r1) return UP;
  if (r2 > r1) return DOWN;
  if (c2 > c1) return RIGHT;
  return LEFT;
}

/** Produce turn actions to face a target direction from current direction */
export function turnsToFace(current: Direction, target: Direction): string[] {
  if (current === target) return [];
  // Left turn increments direction: RIGHT→UP→LEFT→DOWN
  const leftTurns = ((target - current) + 4) % 4;
  if (leftTurns === 1) return ['turnLeft'];
  if (leftTurns === 3) return ['turnRight'];
  // 2 turns either way
  return ['turnLeft', 'turnLeft'];
}

/**
 * BFS to find shortest path from (sr,sc) to (tr,tc) through safe cells.
 * Returns list of [row,col] waypoints (excluding start).
 */
export function findPath(kb: KnowledgeBase, sr: number, sc: number, tr: number, tc: number): [number, number][] | null {
  if (sr === tr && sc === tc) return [];

  const visited = emptyGrid4(false);
  const parent: ([number, number] | null)[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: ([number, number] | null)[] = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(null);
    parent.push(row);
  }

  const queue: [number, number][] = [[sr, sc]];
  visited[sr]![sc] = true;

  while (queue.length > 0) {
    const [cr, cc] = queue.shift()!;
    for (const [nr, nc] of neighbors(cr, cc)) {
      if (visited[nr]![nc]) continue;
      // Only traverse safe cells (or the target itself if we're willing to go there)
      if (nr === tr && nc === tc) {
        // Reconstruct path
        const path: [number, number][] = [[nr, nc]];
        let cur: [number, number] = [cr, cc];
        while (cur[0] !== sr || cur[1] !== sc) {
          path.unshift(cur);
          cur = parent[cur[0]]![cur[1]]!;
        }
        return path;
      }
      if (!kb.safe[nr]![nc]) continue;
      visited[nr]![nc] = true;
      parent[nr]![nc] = [cr, cc];
      queue.push([nr, nc]);
    }
  }

  return null;
}

/**
 * Convert a path of waypoints into atomic actions (turn + forward).
 */
export function pathToActions(startDir: Direction, path: [number, number][], startR: number, startC: number): string[] {
  const actions: string[] = [];
  let curR = startR;
  let curC = startC;
  let curDir = startDir;

  for (const [nr, nc] of path) {
    const targetDir = directionTo(curR, curC, nr, nc);
    actions.push(...turnsToFace(curDir, targetDir));
    actions.push('forward');
    curR = nr;
    curC = nc;
    curDir = targetDir;
  }

  return actions;
}

/** Direction to face to shoot the wumpus from (sr,sc) at (wr,wc). Returns null if not on same row/col. */
export function shootDirection(sr: number, sc: number, wr: number, wc: number): Direction | null {
  if (sr === wr) return sc < wc ? RIGHT : LEFT;
  if (sc === wc) return sr < wr ? DOWN : UP;
  return null;
}

/**
 * AI decision engine. Examines knowledge base and returns a plan of
 * atomic actions plus a reasoning explanation.
 */
export function aiDecide(s: GameState): [string[], string] {
  const kb = s.kb;
  const r = s.agentRow;
  const c = s.agentCol;

  // 1. Glitter → grab gold
  if (s.board[r]![c]! & GOLD && !s.hasGold) {
    return [['grab'], 'Glitter detected \u2192 grab gold'];
  }

  // 2. Have gold → go home and climb
  if (s.hasGold) {
    if (r === START_ROW && c === START_COL) {
      return [['climb'], 'At entrance with gold \u2192 climb out'];
    }
    const path = findPath(kb, r, c, START_ROW, START_COL);
    if (path && path.length > 0) {
      const actions = pathToActions(s.agentDir, path, r, c);
      actions.push('climb');
      return [actions, `Have gold \u2192 returning to entrance via ${path.map(([pr, pc]) => displayCoord(pr, pc)).join(' \u2192 ')}`];
    }
    // Can't find safe path home — try anyway via closest safe route
    return [['climb'], 'Have gold but no safe path home \u2192 attempting climb'];
  }

  // 3. If wumpus location known, have arrow, and can line up a shot → shoot
  if (kb.wumpusLocation && s.hasArrow && s.wumpusAlive) {
    const [wr, wc] = kb.wumpusLocation;
    // Check if we can shoot from current position
    const dir = shootDirection(r, c, wr, wc);
    if (dir !== null) {
      const turns = turnsToFace(s.agentDir, dir);
      return [[...turns, 'shoot'], `Wumpus at ${displayCoord(wr, wc)}, aligned \u2192 shooting ${DIR_NAMES[dir]}`];
    }
    // Move to a safe cell on same row or column as wumpus to take the shot
    for (let i = 0; i < GRID_SIZE; i++) {
      // Same row as wumpus
      if (kb.safe[wr]![i] && (i !== wc)) {
        const path = findPath(kb, r, c, wr, i);
        if (path) {
          const actions = pathToActions(s.agentDir, path, r, c);
          const sDir = shootDirection(wr, i, wr, wc)!;
          actions.push(...turnsToFace(path.length > 0 ? directionTo(
            path.length > 1 ? path[path.length - 2]![0] : r,
            path.length > 1 ? path[path.length - 2]![1] : c,
            wr, i,
          ) : s.agentDir, sDir));
          actions.push('shoot');
          return [actions, `Moving to ${displayCoord(wr, i)} to shoot Wumpus at ${displayCoord(wr, wc)}`];
        }
      }
      // Same column as wumpus
      if (kb.safe[i]![wc] && (i !== wr)) {
        const path = findPath(kb, r, c, i, wc);
        if (path) {
          const actions = pathToActions(s.agentDir, path, r, c);
          const sDir = shootDirection(i, wc, wr, wc)!;
          actions.push(...turnsToFace(path.length > 0 ? directionTo(
            path.length > 1 ? path[path.length - 2]![0] : r,
            path.length > 1 ? path[path.length - 2]![1] : c,
            i, wc,
          ) : s.agentDir, sDir));
          actions.push('shoot');
          return [actions, `Moving to ${displayCoord(i, wc)} to shoot Wumpus at ${displayCoord(wr, wc)}`];
        }
      }
    }
  }

  // 4. Explore safe unvisited cells — prefer adjacent first
  const safeUnvisitedAdj = neighbors(r, c).filter(([nr, nc]) =>
    kb.safe[nr]![nc] && !kb.visited[nr]![nc],
  );
  if (safeUnvisitedAdj.length > 0) {
    const [tr, tc] = safeUnvisitedAdj[0]!;
    const targetDir = directionTo(r, c, tr, tc);
    const actions = [...turnsToFace(s.agentDir, targetDir), 'forward'];
    return [actions, `Safe unvisited neighbor ${displayCoord(tr, tc)} \u2192 exploring`];
  }

  // 5. Safe unvisited cells reachable via path
  let bestPath: [number, number][] | null = null;
  let bestTarget: [number, number] | null = null;
  for (let rr = 0; rr < GRID_SIZE; rr++) {
    for (let cc = 0; cc < GRID_SIZE; cc++) {
      if (kb.safe[rr]![cc] && !kb.visited[rr]![cc]) {
        const path = findPath(kb, r, c, rr, cc);
        if (path && (!bestPath || path.length < bestPath.length)) {
          bestPath = path;
          bestTarget = [rr, cc];
        }
      }
    }
  }
  if (bestPath && bestTarget) {
    const actions = pathToActions(s.agentDir, bestPath, r, c);
    return [actions, `Pathfinding to safe unvisited ${displayCoord(bestTarget[0], bestTarget[1])}`];
  }

  // 6. No safe moves — take a calculated risk on least-dangerous cell
  const risky: { r: number; c: number; risk: number }[] = [];
  for (let rr = 0; rr < GRID_SIZE; rr++) {
    for (let cc = 0; cc < GRID_SIZE; cc++) {
      if (kb.visited[rr]![cc] || kb.definitelyPit[rr]![cc]) continue;
      if (kb.wumpusLocation && kb.wumpusLocation[0] === rr && kb.wumpusLocation[1] === cc && s.wumpusAlive) continue;
      let risk = 0;
      if (kb.maybePit[rr]![cc]) risk += 1;
      if (kb.maybeWumpus[rr]![cc]) risk += 1;
      // Must be reachable (adjacent to a visited cell)
      const adjVisited = neighbors(rr, cc).some(([nr, nc]) => kb.visited[nr]![nc]);
      if (adjVisited) risky.push({ r: rr, c: cc, risk });
    }
  }
  risky.sort((a, b) => a.risk - b.risk);

  if (risky.length > 0) {
    const target = risky[0]!;
    // Find a visited neighbor to approach from
    const approachFrom = neighbors(target.r, target.c).find(([nr, nc]) => kb.visited[nr]![nc]);
    if (approachFrom) {
      const path = findPath(kb, r, c, approachFrom[0], approachFrom[1]);
      if (path) {
        const actions = pathToActions(s.agentDir, path, r, c);
        // Now face and enter the risky cell
        const finalDir = directionTo(approachFrom[0], approachFrom[1], target.r, target.c);
        const lastDir = path.length > 0
          ? directionTo(
            path.length > 1 ? path[path.length - 2]![0] : r,
            path.length > 1 ? path[path.length - 2]![1] : c,
            approachFrom[0], approachFrom[1])
          : s.agentDir;
        actions.push(...turnsToFace(lastDir, finalDir));
        actions.push('forward');
        const riskLabel = target.risk === 0 ? 'unknown risk' : `risk=${target.risk}`;
        return [actions, `No safe moves. Risking ${displayCoord(target.r, target.c)} (${riskLabel})`];
      }
    }
  }

  // 7. Give up — go home
  if (r === START_ROW && c === START_COL) {
    return [['climb'], 'No options left \u2192 climbing out'];
  }
  const homePath = findPath(kb, r, c, START_ROW, START_COL);
  if (homePath) {
    const actions = pathToActions(s.agentDir, homePath, r, c);
    actions.push('climb');
    return [actions, 'No options left \u2192 retreating to entrance'];
  }

  return [['climb'], 'Completely stuck \u2192 attempting to climb'];
}

// ── Execute a single named action ────────────────────────────────────

export function executeAction(s: GameState, action: string): GameState {
  switch (action) {
    case 'forward': return doMoveForward(s);
    case 'turnLeft': return doTurnLeft(s);
    case 'turnRight': return doTurnRight(s);
    case 'shoot': return doShoot(s);
    case 'grab': return doGrab(s);
    case 'climb': return doClimb(s);
    default: return s;
  }
}
