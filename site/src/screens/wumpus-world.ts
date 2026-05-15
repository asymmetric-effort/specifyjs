// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Wumpus World — A 2D demonstration of the classic AI problem using
 * the DiscreteCartesian2D grid component.
 *
 * The agent explores a 4x4 cave to find gold while avoiding:
 *   - The Wumpus (a monster that kills the agent)
 *   - Bottomless pits
 *
 * Percepts:
 *   - Stench: adjacent to Wumpus
 *   - Breeze: adjacent to a pit
 *   - Glitter: in the same room as gold
 *   - Bump: walked into a wall
 *   - Scream: Wumpus was killed
 *
 * Actions: Move Forward, Turn Left, Turn Right, Shoot, Grab, Climb
 */

import { createElement } from 'specifyjs';
import { useState, useCallback, useMemo } from 'specifyjs/hooks';
import { DiscreteCartesian2D } from '../../../components/viz/2D-discrete-cartesian/src/index';
import { Button } from '../../../components/form/button/src/index';

// ── Constants ────────────────────────────────────────────────────────

const GRID_SIZE = 4;

// Cell content flags (bitmask)
const EMPTY = 0;
const PIT = 1;
const WUMPUS = 2;
const GOLD = 4;
const AGENT = 8;
const STENCH = 16;
const BREEZE = 32;
const VISITED = 64;

// Directions
const RIGHT = 0;
const UP = 1;
const LEFT = 2;
const DOWN = 3;

type Direction = 0 | 1 | 2 | 3;

const DIR_LABELS = ['\u2192', '\u2191', '\u2190', '\u2193'];
const DIR_NAMES = ['East', 'North', 'West', 'South'];

// Direction deltas: [row, col] — row 0 is top
const DIR_DELTA: Record<number, [number, number]> = {
  [RIGHT]: [0, 1],
  [UP]: [-1, 0],
  [LEFT]: [0, -1],
  [DOWN]: [1, 0],
};

// ── Types ────────────────────────────────────────────────────────────

interface GameState {
  board: number[][];       // 4x4 grid with content flags
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
  revealed: boolean[][];   // fog of war
}

// ── Board generation ─────────────────────────────────────────────────

function emptyBoard(): number[][] {
  const board: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(EMPTY);
    board.push(row);
  }
  return board;
}

function emptyRevealed(): boolean[][] {
  const rev: boolean[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < GRID_SIZE; c++) row.push(false);
    rev.push(row);
  }
  return rev;
}

function neighbors(r: number, c: number): [number, number][] {
  const result: [number, number][] = [];
  if (r > 0) result.push([r - 1, c]);
  if (r < GRID_SIZE - 1) result.push([r + 1, c]);
  if (c > 0) result.push([r, c - 1]);
  if (c < GRID_SIZE - 1) result.push([r, c + 1]);
  return result;
}

function addPercepts(board: number[][]): void {
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (board[r]![c]! & PIT) {
        for (const [nr, nc] of neighbors(r, c)) {
          board[nr]![nc]! |= BREEZE;
        }
      }
      if (board[r]![c]! & WUMPUS) {
        for (const [nr, nc] of neighbors(r, c)) {
          board[nr]![nc]! |= STENCH;
        }
      }
    }
  }
}

function generateBoard(): { board: number[][]; wumpusRow: number; wumpusCol: number } {
  const board = emptyBoard();

  // Place Wumpus (not at [3,0] — agent start, row 3 = bottom-left visually)
  let wr: number, wc: number;
  do {
    wr = Math.floor(Math.random() * GRID_SIZE);
    wc = Math.floor(Math.random() * GRID_SIZE);
  } while (wr === 3 && wc === 0);
  board[wr]![wc]! |= WUMPUS;

  // Place gold (not at agent start)
  let gr: number, gc: number;
  do {
    gr = Math.floor(Math.random() * GRID_SIZE);
    gc = Math.floor(Math.random() * GRID_SIZE);
  } while (gr === 3 && gc === 0);
  board[gr]![gc]! |= GOLD;

  // Place pits with 20% probability (not at agent start)
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (r === 3 && c === 0) continue;
      if (board[r]![c]! & (WUMPUS | GOLD)) continue; // don't stack on wumpus/gold for clarity
      if (Math.random() < 0.2) {
        board[r]![c]! |= PIT;
      }
    }
  }

  addPercepts(board);

  // Place agent at bottom-left (row 3, col 0)
  board[3]![0]! |= AGENT;

  return { board, wumpusRow: wr, wumpusCol: wc };
}

// ── Percept computation ──────────────────────────────────────────────

function getPercepts(board: number[][], row: number, col: number, bump: boolean, scream: boolean): string[] {
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

function createInitialState(): GameState {
  const { board, wumpusRow: _wr, wumpusCol: _wc } = generateBoard();
  const revealed = emptyRevealed();
  revealed[3]![0] = true;
  board[3]![0]! |= VISITED;
  return {
    board,
    agentRow: 3,
    agentCol: 0,
    agentDir: RIGHT as Direction,
    hasArrow: true,
    hasGold: false,
    wumpusAlive: true,
    score: 0,
    gameOver: false,
    won: false,
    percepts: getPercepts(board, 3, 0, false, false),
    log: ['Entered the cave at [1,1]. Facing East.'],
    revealed,
  };
}

// ── Display coordinates (1-indexed, bottom-left origin) ──────────────

function displayCoord(row: number, col: number): string {
  return `[${col + 1},${GRID_SIZE - row}]`;
}

// ── Color map for the visualization grid ─────────────────────────────
// We render an 8x8 grid (each 4x4 cell → 2x2 display cells) for richer visuals
// Actually let's keep it simple: 4x4 grid with numeric codes for coloring.

// Color codes for the display grid:
const C_UNKNOWN = 0;   // fog of war
const C_EMPTY = 1;     // visited empty
const C_AGENT = 2;     // agent position
const C_PIT = 3;       // revealed pit
const C_WUMPUS = 4;    // revealed wumpus
const C_GOLD = 5;      // revealed gold
const C_STENCH = 6;    // visited with stench
const C_BREEZE = 7;    // visited with breeze
const C_BOTH = 8;      // stench + breeze
const C_DEAD = 9;      // agent died here
const C_WIN = 10;      // agent won

const COLOR_MAP: Record<number, string> = {
  [C_UNKNOWN]: '#1e293b',    // dark slate — unexplored
  [C_EMPTY]: '#334155',      // lighter slate — safe visited
  [C_AGENT]: '#3b82f6',      // blue — agent
  [C_PIT]: '#0f172a',        // near-black — pit
  [C_WUMPUS]: '#dc2626',     // red — wumpus
  [C_GOLD]: '#eab308',       // gold — treasure
  [C_STENCH]: '#854d0e',     // brown — stench
  [C_BREEZE]: '#0e7490',     // cyan — breeze
  [C_BOTH]: '#7c3aed',       // purple — stench+breeze
  [C_DEAD]: '#991b1b',       // dark red — death
  [C_WIN]: '#16a34a',        // green — victory
};

function buildDisplayGrid(state: GameState): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    const row: number[] = [];
    for (let c = 0; c < GRID_SIZE; c++) {
      const cell = state.board[r]![c]!;
      const revealed = state.revealed[r]![c]!;

      if (state.gameOver && state.agentRow === r && state.agentCol === c) {
        row.push(state.won ? C_WIN : C_DEAD);
      } else if (r === state.agentRow && c === state.agentCol) {
        row.push(C_AGENT);
      } else if (!revealed && !state.gameOver) {
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
        else row.push(revealed || state.gameOver ? C_EMPTY : C_UNKNOWN);
      }
    }
    grid.push(row);
  }
  return grid;
}

// ── Cell labels for overlay ──────────────────────────────────────────

function getCellLabel(state: GameState, r: number, c: number): string {
  const cell = state.board[r]![c]!;
  const revealed = state.revealed[r]![c]!;
  const isAgent = r === state.agentRow && c === state.agentCol;

  if (isAgent) {
    return DIR_LABELS[state.agentDir]!;
  }

  if (!revealed && !state.gameOver) return '?';

  const parts: string[] = [];
  if (cell & WUMPUS && state.wumpusAlive) parts.push('W');
  if (cell & WUMPUS && !state.wumpusAlive) parts.push('\u2620');
  if (cell & PIT) parts.push('P');
  if (cell & GOLD && !state.hasGold) parts.push('G');
  if (cell & STENCH) parts.push('~');
  if (cell & BREEZE) parts.push('\u2248');

  return parts.length > 0 ? parts.join('') : '';
}

// ── Component ────────────────────────────────────────────────────────

export function WumpusWorld() {
  const [state, setState] = useState<GameState>(createInitialState);

  const displayGrid = useMemo(() => buildDisplayGrid(state), [
    state.board, state.agentRow, state.agentCol, state.gameOver,
    state.won, state.wumpusAlive, state.hasGold, state.revealed,
  ]);

  const addLog = (s: GameState, msg: string): string[] => {
    const next = [...s.log, msg];
    if (next.length > 50) next.splice(0, next.length - 50);
    return next;
  };

  const moveForward = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      const [dr, dc] = DIR_DELTA[s.agentDir]!;
      const nr = s.agentRow + dr;
      const nc = s.agentCol + dc;

      // Bump into wall
      if (nr < 0 || nr >= GRID_SIZE || nc < 0 || nc >= GRID_SIZE) {
        const percepts = getPercepts(s.board, s.agentRow, s.agentCol, true, false);
        return {
          ...s,
          score: s.score - 1,
          percepts,
          log: addLog(s, `Bump! Can't move ${DIR_NAMES[s.agentDir]}.`),
        };
      }

      // Move agent
      const board = s.board.map(row => [...row]);
      board[s.agentRow]![s.agentCol]! &= ~AGENT;
      board[nr]![nc]! |= AGENT | VISITED;

      const revealed = s.revealed.map(row => [...row]);
      revealed[nr]![nc] = true;

      const cell = board[nr]![nc]!;

      // Check for death
      if ((cell & PIT) || (cell & WUMPUS && s.wumpusAlive)) {
        const cause = (cell & PIT) ? 'fell into a pit' : 'was eaten by the Wumpus';
        return {
          ...s,
          board,
          agentRow: nr,
          agentCol: nc,
          score: s.score - 1001,
          gameOver: true,
          won: false,
          percepts: [(cell & PIT) ? 'Death by pit' : 'Death by Wumpus'],
          log: addLog(s, `Moved to ${displayCoord(nr, nc)} and ${cause}! Game Over. Score: ${s.score - 1001}`),
          revealed,
        };
      }

      const percepts = getPercepts(board, nr, nc, false, false);
      return {
        ...s,
        board,
        agentRow: nr,
        agentCol: nc,
        score: s.score - 1,
        percepts,
        log: addLog(s, `Moved to ${displayCoord(nr, nc)}. Percepts: ${percepts.join(', ')}`),
        revealed,
      };
    });
  }, []);

  const turnLeft = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      const newDir = ((s.agentDir + 1) % 4) as Direction;
      return {
        ...s,
        agentDir: newDir,
        log: addLog(s, `Turned left. Now facing ${DIR_NAMES[newDir]}.`),
      };
    });
  }, []);

  const turnRight = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      const newDir = ((s.agentDir + 3) % 4) as Direction;
      return {
        ...s,
        agentDir: newDir,
        log: addLog(s, `Turned right. Now facing ${DIR_NAMES[newDir]}.`),
      };
    });
  }, []);

  const shoot = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      if (!s.hasArrow) {
        return { ...s, log: addLog(s, 'No arrow left!') };
      }

      const [dr, dc] = DIR_DELTA[s.agentDir]!;
      let sr = s.agentRow + dr;
      let sc = s.agentCol + dc;
      let killed = false;

      while (sr >= 0 && sr < GRID_SIZE && sc >= 0 && sc < GRID_SIZE) {
        if (s.board[sr]![sc]! & WUMPUS) {
          killed = true;
          break;
        }
        sr += dr;
        sc += dc;
      }

      if (killed) {
        const board = s.board.map(row => [...row]);
        // Remove stench from neighbors
        for (const [nr, nc] of neighbors(sr, sc)) {
          // Only remove stench if no other wumpus nearby (there's only one)
          board[nr]![nc]! &= ~STENCH;
        }
        const percepts = getPercepts(board, s.agentRow, s.agentCol, false, true);
        return {
          ...s,
          board,
          hasArrow: false,
          wumpusAlive: false,
          score: s.score - 10,
          percepts,
          log: addLog(s, `Shot arrow ${DIR_NAMES[s.agentDir]}. Scream! The Wumpus is dead!`),
        };
      }

      const percepts = getPercepts(s.board, s.agentRow, s.agentCol, false, false);
      return {
        ...s,
        hasArrow: false,
        score: s.score - 10,
        percepts,
        log: addLog(s, `Shot arrow ${DIR_NAMES[s.agentDir]}. Silence... missed.`),
      };
    });
  }, []);

  const grab = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      const cell = s.board[s.agentRow]![s.agentCol]!;
      if (!(cell & GOLD)) {
        return { ...s, log: addLog(s, 'Nothing to grab here.') };
      }
      const board = s.board.map(row => [...row]);
      board[s.agentRow]![s.agentCol]! &= ~GOLD;
      return {
        ...s,
        board,
        hasGold: true,
        log: addLog(s, 'Grabbed the gold!'),
      };
    });
  }, []);

  const climb = useCallback(() => {
    setState((s: GameState) => {
      if (s.gameOver) return s;
      if (s.agentRow !== 3 || s.agentCol !== 0) {
        return { ...s, log: addLog(s, 'Can only climb out at the entrance [1,1].') };
      }
      const bonus = s.hasGold ? 1000 : 0;
      const finalScore = s.score + bonus;
      return {
        ...s,
        score: finalScore,
        gameOver: true,
        won: s.hasGold,
        percepts: s.hasGold ? ['Victory!'] : ['Escaped without gold'],
        log: addLog(s, s.hasGold
          ? `Climbed out with the gold! Score: ${finalScore}`
          : `Climbed out without gold. Score: ${finalScore}`),
      };
    });
  }, []);

  const newGame = useCallback(() => {
    setState(createInitialState());
  }, []);

  // Status bar info
  const statusItems = [
    `Score: ${state.score}`,
    `Facing: ${DIR_NAMES[state.agentDir]}`,
    `Pos: ${displayCoord(state.agentRow, state.agentCol)}`,
    state.hasArrow ? 'Arrow: Yes' : 'Arrow: No',
    state.hasGold ? 'Gold: Carrying' : 'Gold: Not found',
  ];

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box', gap: '20px' },
  },
    // Left: grid + controls
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, 'Wumpus World'),

      // Grid with overlay labels
      createElement('div', { style: { position: 'relative', width: '480px', height: '480px' } },
        createElement(DiscreteCartesian2D, {
          data: displayGrid,
          width: 480,
          height: 480,
          cellGap: 2,
          cellRadius: 4,
          backgroundColor: '#0f172a',
          colorMap: COLOR_MAP,
        }),
        // Text overlay for cell labels
        createElement('div', {
          style: {
            position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
            display: 'grid', gridTemplateRows: 'repeat(4, 1fr)', gridTemplateColumns: 'repeat(4, 1fr)',
            pointerEvents: 'none',
          },
        },
          ...Array.from({ length: GRID_SIZE * GRID_SIZE }, (_, i) => {
            const r = Math.floor(i / GRID_SIZE);
            const c = i % GRID_SIZE;
            const label = getCellLabel(state, r, c);
            const isAgent = r === state.agentRow && c === state.agentCol;
            return createElement('div', {
              key: `${r}-${c}`,
              style: {
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: isAgent ? '28px' : '18px',
                fontWeight: isAgent ? '700' : '600',
                color: 'white',
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
              },
            }, label);
          }),
        ),
      ),

      // Percepts display
      createElement('div', {
        style: {
          marginTop: '10px', padding: '8px 12px', borderRadius: '6px',
          backgroundColor: 'var(--color-surface, #f1f5f9)',
          fontSize: '13px', color: 'var(--color-text, #1f2937)',
          border: '1px solid var(--color-border, #e2e8f0)',
        },
      },
        createElement('strong', null, 'Percepts: '),
        state.percepts.join(', '),
      ),

      // Status bar
      createElement('div', {
        style: {
          marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap',
          fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)',
        },
      },
        ...statusItems.map((item, i) =>
          createElement('span', { key: `s${i}` }, item),
        ),
      ),

      // Action buttons
      createElement('div', {
        style: { display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' },
      },
        createElement(Button, {
          size: 'sm', variant: 'primary',
          onClick: moveForward, disabled: state.gameOver,
        }, 'Forward'),
        createElement(Button, {
          size: 'sm', onClick: turnLeft, disabled: state.gameOver,
        }, 'Turn Left'),
        createElement(Button, {
          size: 'sm', onClick: turnRight, disabled: state.gameOver,
        }, 'Turn Right'),
        createElement(Button, {
          size: 'sm', variant: 'danger',
          onClick: shoot, disabled: state.gameOver || !state.hasArrow,
        }, 'Shoot'),
        createElement(Button, {
          size: 'sm', onClick: grab, disabled: state.gameOver,
        }, 'Grab'),
        createElement(Button, {
          size: 'sm', onClick: climb, disabled: state.gameOver,
        }, 'Climb'),
        createElement(Button, {
          size: 'sm', onClick: newGame,
        }, 'New Game'),
      ),

      // Legend
      createElement('div', {
        style: {
          display: 'flex', gap: '12px', marginTop: '10px', flexWrap: 'wrap',
          fontSize: '10px', color: 'var(--color-text-muted, #94a3b8)',
        },
      },
        ...([
          [COLOR_MAP[C_AGENT]!, 'Agent'],
          [COLOR_MAP[C_UNKNOWN]!, 'Unknown'],
          [COLOR_MAP[C_EMPTY]!, 'Safe'],
          [COLOR_MAP[C_STENCH]!, 'Stench'],
          [COLOR_MAP[C_BREEZE]!, 'Breeze'],
          [COLOR_MAP[C_BOTH]!, 'Stench+Breeze'],
          [COLOR_MAP[C_PIT]!, 'Pit'],
          [COLOR_MAP[C_WUMPUS]!, 'Wumpus'],
          [COLOR_MAP[C_GOLD]!, 'Gold'],
        ] as [string, string][]).map(([color, label], i) =>
          createElement('div', {
            key: `l${i}`,
            style: { display: 'flex', alignItems: 'center', gap: '4px' },
          },
            createElement('div', {
              style: {
                width: '12px', height: '12px', borderRadius: '2px',
                backgroundColor: color, border: '1px solid #475569',
              },
            }),
            label,
          ),
        ),
      ),
    ),

    // Right: info sidebar
    createElement('div', {
      style: {
        width: '280px', flexShrink: '0', overflowY: 'auto',
        fontSize: '13px', lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '20px',
        display: 'flex', flexDirection: 'column', gap: '4px',
      },
    },
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '8px' } }, 'About Wumpus World'),
      createElement('p', null,
        'The Wumpus World is a classic problem in artificial intelligence, introduced by Gregory Yob in 1973 as the text game ',
        createElement('em', null, 'Hunt the Wumpus'),
        '. It was later formalized by Stuart Russell and Peter Norvig in ',
        createElement('em', null, 'Artificial Intelligence: A Modern Approach'),
        ' as a testbed for knowledge-based agents.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'The Cave'),
      createElement('p', null,
        'The world is a 4\u00d74 grid of rooms connected by passageways. Somewhere in the cave lurks the Wumpus, a beast that eats anyone entering its room. Some rooms contain bottomless pits. One room contains a heap of gold.',
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Percepts'),
      createElement('ul', { style: { paddingLeft: '18px', margin: '4px 0' } },
        createElement('li', null, createElement('strong', null, 'Stench'), ' \u2014 adjacent to the Wumpus'),
        createElement('li', null, createElement('strong', null, 'Breeze'), ' \u2014 adjacent to a pit'),
        createElement('li', null, createElement('strong', null, 'Glitter'), ' \u2014 gold is in this room'),
        createElement('li', null, createElement('strong', null, 'Bump'), ' \u2014 walked into a wall'),
        createElement('li', null, createElement('strong', null, 'Scream'), ' \u2014 the Wumpus has been slain'),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Scoring'),
      createElement('ul', { style: { paddingLeft: '18px', margin: '4px 0' } },
        createElement('li', null, '+1000 for climbing out with gold'),
        createElement('li', null, '\u22121 per action taken'),
        createElement('li', null, '\u221210 for shooting the arrow'),
        createElement('li', null, '\u22121000 for dying'),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'AI Significance'),
      createElement('p', null,
        'Wumpus World demonstrates key AI concepts: logical inference (deducing safe rooms from percepts), planning under uncertainty, and the explore\u2013exploit tradeoff. An ideal agent uses propositional or first-order logic to track which rooms are safe, risky, or certain death.',
      ),

      // Action log
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Action Log'),
      createElement('div', {
        style: {
          flex: '1', overflowY: 'auto', fontSize: '11px', lineHeight: '1.5',
          fontFamily: 'monospace', padding: '8px',
          backgroundColor: 'var(--color-surface, #f8fafc)',
          borderRadius: '4px', border: '1px solid var(--color-border, #e2e8f0)',
          maxHeight: '200px',
          color: 'var(--color-text-muted, #64748b)',
        },
      },
        ...state.log.map((entry, i) =>
          createElement('div', { key: `log${i}` }, entry),
        ),
      ),
    ),
  );
}
