// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Conway's Game of Life — Full-screen demonstration using the
 * DiscreteCartesian2D grid component.
 *
 * Rules (B3/S23):
 *   - A dead cell with exactly 3 live neighbors becomes alive (birth)
 *   - A live cell with 2 or 3 live neighbors survives
 *   - All other live cells die (underpopulation or overpopulation)
 */

import { createElement } from 'specifyjs';
import { useState, useEffect, useCallback, useRef } from 'specifyjs/hooks';
import { DiscreteCartesian2D } from '../../../components/viz/2D-discrete-cartesian/src/index';
import { Button } from '../../../components/form/button/src/index';
import { NumberSpinner } from '../../../components/form/number-spinner/src/index';

// ── Grid helpers ─────────────────────────────────────────────────────

const ROWS = 40;
const COLS = 60;

function emptyGrid(): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < COLS; c++) row.push(0);
    grid.push(row);
  }
  return grid;
}

function randomGrid(density: number = 0.3): number[][] {
  const grid: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < COLS; c++) row.push(Math.random() < density ? 1 : 0);
    grid.push(row);
  }
  return grid;
}

/** Count live neighbors (8-connected, wrapping at edges) */
function countNeighbors(grid: number[][], r: number, c: number): number {
  let count = 0;
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      if (dr === 0 && dc === 0) continue;
      const nr = (r + dr + ROWS) % ROWS;
      const nc = (c + dc + COLS) % COLS;
      count += grid[nr]![nc]!;
    }
  }
  return count;
}

/** Advance one generation using B3/S23 rules */
function step(grid: number[][]): number[][] {
  const next: number[][] = [];
  for (let r = 0; r < ROWS; r++) {
    const row: number[] = [];
    for (let c = 0; c < COLS; c++) {
      const n = countNeighbors(grid, r, c);
      const alive = grid[r]![c]!;
      if (alive) {
        row.push(n === 2 || n === 3 ? 1 : 0);
      } else {
        row.push(n === 3 ? 1 : 0);
      }
    }
    next.push(row);
  }
  return next;
}

/** Count total live cells */
function population(grid: number[][]): number {
  let count = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) count += grid[r]![c]!;
  }
  return count;
}

// ── Preset patterns ──────────────────────────────────────────────────

function placePattern(grid: number[][], pattern: number[][], startR: number, startC: number): number[][] {
  const g = grid.map(row => [...row]);
  for (let r = 0; r < pattern.length; r++) {
    for (let c = 0; c < pattern[r]!.length; c++) {
      const gr = (startR + r) % ROWS;
      const gc = (startC + c) % COLS;
      g[gr]![gc] = pattern[r]![c]!;
    }
  }
  return g;
}

const GLIDER = [[0,1,0],[0,0,1],[1,1,1]];
const BLINKER = [[1,1,1]];
const PULSAR = [
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [1,0,0,0,0,1,0,1,0,0,0,0,1],
  [0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,1,1,1,0,0,0,1,1,1,0,0],
];
const GLIDER_GUN = [
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,1,1],
  [1,1,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [1,1,0,0,0,0,0,0,0,0,1,0,0,0,1,0,1,1,0,0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,1,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
  [0,0,0,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
];

// ── Component ────────────────────────────────────────────────────────

export function ConwaysGameOfLife() {
  const [grid, setGrid] = useState(randomGrid);
  const [running, setRunning] = useState(false);
  const [gen, setGen] = useState(0);
  const [speed, setSpeed] = useState(100);
  const runningRef = useRef(false);

  // Keep ref in sync
  useEffect(() => { runningRef.current = running; }, [running]);

  // Animation loop
  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      if (!runningRef.current) return;
      setGrid((g: number[][]) => step(g));
      setGen((n: number) => n + 1);
    }, speed);
    return () => clearInterval(id);
  }, [running, speed]);

  const toggleCell = useCallback((r: number, c: number) => {
    setGrid((g: number[][]) => {
      const next = g.map(row => [...row]);
      next[r]![c] = next[r]![c]! ? 0 : 1;
      return next;
    });
  }, []);

  const handleClear = useCallback(() => { setGrid(emptyGrid()); setGen(0); setRunning(false); }, []);
  const handleRandom = useCallback(() => { setGrid(randomGrid()); setGen(0); }, []);
  const handleStep = useCallback(() => { setGrid((g: number[][]) => step(g)); setGen((n: number) => n + 1); }, []);

  const loadPreset = useCallback((pattern: number[][], label: string) => {
    const g = emptyGrid();
    const sr = Math.floor((ROWS - pattern.length) / 2);
    const sc = Math.floor((COLS - (pattern[0]?.length ?? 0)) / 2);
    setGrid(placePattern(g, pattern, sr, sc));
    setGen(0);
    setRunning(false);
  }, []);

  const pop = population(grid);

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box', gap: '20px' },
  },
    // Left: grid + controls
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' } },
      createElement('h2', {
        style: { fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: 'var(--color-text, #0f172a)' },
      }, "Conway's Game of Life"),
      // Grid
      createElement('div', { style: { flex: '1', minHeight: '300px' } },
        createElement(DiscreteCartesian2D, {
          data: grid,
          width: 720,
          height: 480,
          cellGap: 1,
          backgroundColor: '#0f172a',
          colorMap: { 0: '#1e293b', 1: '#3b82f6' },
          onCellClick: toggleCell,
        }),
      ),
      // Controls
      createElement('div', {
        style: { display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' },
      },
        createElement(Button, {
          size: 'sm', variant: running ? 'danger' : 'primary',
          onClick: () => setRunning((r: boolean) => !r),
        }, running ? 'Pause' : 'Play'),
        createElement(Button, { size: 'sm', onClick: handleStep, disabled: running }, 'Step'),
        createElement(Button, { size: 'sm', onClick: handleRandom }, 'Random'),
        createElement(Button, { size: 'sm', onClick: handleClear }, 'Clear'),
        createElement('span', {
          style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)', marginLeft: '8px' },
        }, `Gen: ${gen} | Pop: ${pop}`),
      ),
      // Presets + speed
      createElement('div', {
        style: { display: 'flex', gap: '6px', marginTop: '8px', alignItems: 'center', flexWrap: 'wrap' },
      },
        createElement('span', { style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' } }, 'Presets:'),
        createElement(Button, { size: 'sm', onClick: () => loadPreset(GLIDER, 'Glider') }, 'Glider'),
        createElement(Button, { size: 'sm', onClick: () => loadPreset(BLINKER, 'Blinker') }, 'Blinker'),
        createElement(Button, { size: 'sm', onClick: () => loadPreset(PULSAR, 'Pulsar') }, 'Pulsar'),
        createElement(Button, { size: 'sm', onClick: () => loadPreset(GLIDER_GUN, 'Glider Gun') }, 'Glider Gun'),
        createElement('div', {
          style: { marginLeft: '12px', fontSize: '10px', color: 'var(--color-text, #1f2937)', maxWidth: '100px' },
        },
          createElement(NumberSpinner, { value: speed, onChange: setSpeed, min: 10, max: 1000, step: 10, label: 'ms/gen' }),
        ),
      ),
    ),
    // Right: history sidebar
    createElement('div', {
      style: {
        width: '280px', flexShrink: '0', overflowY: 'auto',
        fontSize: '13px', lineHeight: '1.6',
        color: 'var(--color-text, #1f2937)',
        borderLeft: '1px solid var(--color-border, #e2e8f0)',
        paddingLeft: '20px',
      },
    },
      createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '12px' } }, 'History'),
      createElement('p', null,
        "The Game of Life was devised by British mathematician ",
        createElement('strong', null, 'John Horton Conway'),
        " in 1970. It is a zero-player game — its evolution is determined entirely by its initial state. Conway designed the rules to produce unpredictable, complex behavior from simple foundations.",
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Rules'),
      createElement('p', null,
        "The universe is an infinite 2D grid of cells, each either alive or dead. At each generation:",
      ),
      createElement('ol', { style: { paddingLeft: '18px', margin: '8px 0' } },
        createElement('li', null, 'A live cell with 2 or 3 live neighbors survives.'),
        createElement('li', null, 'A dead cell with exactly 3 live neighbors is born.'),
        createElement('li', null, 'All other cells die or stay dead.'),
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Significance'),
      createElement('p', null,
        "Conway's Game of Life is Turing-complete — any computation that can be performed by a computer can be simulated within it. This was proven by constructing logic gates, memory, and a universal constructor entirely from Life patterns.",
      ),
      createElement('p', { style: { marginTop: '8px' } },
        "The game became widely known after Martin Gardner featured it in his ",
        createElement('em', null, 'Mathematical Games'),
        " column in Scientific American (October 1970). It sparked a global community of enthusiasts who discovered remarkable structures: gliders that travel across the grid, guns that emit gliders periodically, and spaceships of various sizes.",
      ),
      createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '16px', marginBottom: '4px' } }, 'Notable Patterns'),
      createElement('ul', { style: { paddingLeft: '18px', margin: '8px 0' } },
        createElement('li', null, createElement('strong', null, 'Glider'), ' — the smallest spaceship, discovered in 1970'),
        createElement('li', null, createElement('strong', null, 'Blinker'), ' — the simplest oscillator (period 2)'),
        createElement('li', null, createElement('strong', null, 'Pulsar'), ' — a period-3 oscillator, the most common'),
        createElement('li', null, createElement('strong', null, 'Gosper Glider Gun'), ' — first known finite pattern with infinite growth, discovered by Bill Gosper in 1970'),
      ),
      createElement('p', { style: { marginTop: '12px', fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' } },
        "John Conway (1937–2020) was a prolific mathematician who contributed to group theory, number theory, combinatorial game theory, and geometry. He died on April 11, 2020.",
      ),
    ),
  );
}
