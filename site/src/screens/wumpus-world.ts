// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Wumpus World — A 2D demonstration of the classic AI problem using
 * the DiscreteCartesian2D grid component.
 *
 * Two modes:
 *   - Human: manual control via buttons
 *   - AI: knowledge-based agent using logical inference, one turn/second
 *
 * The agent explores a 10x10 cave to find gold while avoiding:
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
import { useState, useEffect, useCallback, useMemo, useRef } from 'specifyjs/hooks';
import { DiscreteCartesian2D } from '../../../components/viz/2D-discrete-cartesian/src/index';
import { Button } from '../../../components/form/button/src/index';

import {
  GRID_SIZE,
  GOLD,
  DIR_LABELS,
  DIR_NAMES,
  C_UNKNOWN,
  C_EMPTY,
  C_AGENT,
  C_PIT,
  C_WUMPUS,
  C_GOLD,
  C_STENCH,
  C_BREEZE,
  C_BOTH,
  COLOR_MAP,
  createInitialState,
  displayCoord,
  buildDisplayGrid,
  getCellLabel,
  doMoveForward,
  doTurnLeft,
  doTurnRight,
  doShoot,
  doGrab,
  doClimb,
  updateKnowledge,
  aiDecide,
  executeAction,
} from './wumpus-logic';

import type {
  PlayMode,
  GameState,
} from './wumpus-logic';

// ── Component ────────────────────────────────────────────────────────

export function WumpusWorld() {
  const [state, setState] = useState<GameState>(createInitialState);
  const [mode, setMode] = useState<PlayMode>('human');
  const [aiRunning, setAiRunning] = useState(false);
  const aiRunningRef = useRef(false);
  const [wins, setWins] = useState(0);
  const [losses, setLosses] = useState(0);
  const totalGames = wins + losses;
  const winPct = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  useEffect(() => { aiRunningRef.current = aiRunning; }, [aiRunning]);

  const displayGrid = useMemo(() => buildDisplayGrid(state), [
    state.board, state.agentRow, state.agentCol, state.gameOver,
    state.won, state.wumpusAlive, state.hasGold, state.revealed,
  ]);

  // ── AI timer: one action per second ──
  useEffect(() => {
    if (mode !== 'ai' || !aiRunning) return;

    const id = setInterval(() => {
      if (!aiRunningRef.current) return;

      setState((s: GameState) => {
        if (s.gameOver) {
          // Record result before auto-restart
          if (s.won) setWins((w: number) => w + 1);
          else setLosses((l: number) => l + 1);
          const fresh = createInitialState();
          fresh.log = [...s.log, '--- New Game ---'];
          if (fresh.log.length > 50) fresh.log.splice(0, fresh.log.length - 50);
          fresh.aiReasoning = s.won ? 'Victory! Starting new game...' : 'Died. Starting new game...';
          return fresh;
        }

        // If there's a queued plan, execute next action
        if (s.aiPlan.length > 0) {
          const action = s.aiPlan[0]!;
          const remaining = s.aiPlan.slice(1);
          let next = executeAction(s, action);
          next = { ...next, aiPlan: remaining };

          // If we just moved to a new cell, update knowledge
          if (action === 'forward' && !next.gameOver &&
              (next.agentRow !== s.agentRow || next.agentCol !== s.agentCol)) {
            const [newKB, reasoning] = updateKnowledge(next);
            next = { ...next, kb: newKB, aiReasoning: `Action: ${action}\n${reasoning}` };
          } else {
            next = { ...next, aiReasoning: `Action: ${action}` };
          }
          return next;
        }

        // No plan — run inference and decide
        const [newKB, inferenceReasoning] = updateKnowledge(s);
        const updatedState = { ...s, kb: newKB };
        const [plan, decisionReasoning] = aiDecide(updatedState);

        const fullReasoning = `Inference:\n${inferenceReasoning}\n\nDecision:\n${decisionReasoning}`;

        // Execute first action immediately
        if (plan.length > 0) {
          const action = plan[0]!;
          const remaining = plan.slice(1);
          let next = executeAction(updatedState, action);
          next = { ...next, aiPlan: remaining, aiReasoning: fullReasoning };

          // Update knowledge if moved
          if (action === 'forward' && !next.gameOver &&
              (next.agentRow !== updatedState.agentRow || next.agentCol !== updatedState.agentCol)) {
            const [moveKB, moveReasoning] = updateKnowledge(next);
            next = { ...next, kb: moveKB, aiReasoning: fullReasoning + '\n' + moveReasoning };
          }
          return next;
        }

        return { ...updatedState, aiReasoning: fullReasoning };
      });
    }, 1000);

    return () => clearInterval(id);
  }, [mode, aiRunning]);

  // ── Human action callbacks ──
  const doAction = useCallback((fn: (s: GameState) => GameState) => {
    setState((s: GameState) => fn(s));
  }, []);

  const newGame = useCallback(() => {
    setAiRunning(false);
    setState((s: GameState) => {
      if (s.gameOver) {
        if (s.won) setWins((w: number) => w + 1);
        else setLosses((l: number) => l + 1);
      }
      return createInitialState();
    });
  }, []);

  const toggleMode = useCallback(() => {
    setAiRunning(false);
    setWins(0);
    setLosses(0);
    setMode((m: PlayMode) => m === 'human' ? 'ai' : 'human');
    setState(createInitialState());
  }, []);

  const toggleAi = useCallback(() => {
    setAiRunning((r: boolean) => !r);
  }, []);

  // Status bar
  const statusItems = [
    `Score: ${state.score}`,
    `Facing: ${DIR_NAMES[state.agentDir]}`,
    `Pos: ${displayCoord(state.agentRow, state.agentCol)}`,
    state.hasArrow ? 'Arrow: Yes' : 'Arrow: No',
    state.hasGold ? 'Gold: Carrying' : 'Gold: Not found',
  ];

  const isHuman = mode === 'human';

  return createElement('div', {
    style: { display: 'flex', height: '100%', padding: '16px', boxSizing: 'border-box', gap: '20px' },
  },
    // Left: grid + controls
    createElement('div', { style: { flex: '1', display: 'flex', flexDirection: 'column', minWidth: '400px' } },
      // Title + mode toggle
      createElement('div', {
        style: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
      },
        createElement('h2', {
          style: { fontSize: '18px', fontWeight: '600', margin: '0', color: 'var(--color-text, #0f172a)' },
        }, 'Wumpus World'),
        createElement(Button, {
          size: 'sm',
          variant: isHuman ? 'primary' : 'danger',
          onClick: toggleMode,
        }, isHuman ? 'Mode: Human' : 'Mode: AI'),
        !isHuman ? createElement(Button, {
          size: 'sm',
          variant: aiRunning ? 'danger' : 'primary',
          onClick: toggleAi,
        }, aiRunning ? 'Pause AI' : 'Start AI') : null,
      ),

      // Grid with overlay labels
      createElement('div', { style: { position: 'relative', width: '600px', height: '600px' } },
        createElement(DiscreteCartesian2D, {
          data: displayGrid,
          width: 600,
          height: 600,
          cellGap: 2,
          cellRadius: 4,
          backgroundColor: '#0f172a',
          colorMap: COLOR_MAP,
        }),
        createElement('div', {
          style: {
            position: 'absolute', top: '10px', left: '10px', right: '10px', bottom: '10px',
            display: 'grid', gridTemplateRows: `repeat(${GRID_SIZE}, 1fr)`, gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
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
                fontSize: isAgent ? '18px' : '11px',
                fontWeight: isAgent ? '700' : '600',
                color: 'white',
                textShadow: '0 0 4px rgba(0,0,0,0.8)',
              },
            }, label);
          }),
        ),
      ),

      // Percepts
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

      // Scoreboard + Status bar
      createElement('div', {
        style: {
          marginTop: '6px', display: 'flex', gap: '16px', flexWrap: 'wrap',
          fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)',
          alignItems: 'center',
        },
      },
        createElement('span', {
          style: { fontWeight: '600', color: 'var(--color-text, #1f2937)' },
        }, `W:${wins} L:${losses} (${winPct}%)`),
        ...statusItems.map((item, i) =>
          createElement('span', { key: `s${i}` }, item),
        ),
      ),

      // Action buttons (human mode) or AI info
      isHuman
        ? createElement('div', {
            style: { display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center', flexWrap: 'wrap' },
          },
            createElement(Button, { size: 'sm', variant: 'primary', onClick: () => doAction(doMoveForward), disabled: state.gameOver }, 'Forward'),
            createElement(Button, { size: 'sm', onClick: () => doAction(doTurnLeft), disabled: state.gameOver }, 'Turn Left'),
            createElement(Button, { size: 'sm', onClick: () => doAction(doTurnRight), disabled: state.gameOver }, 'Turn Right'),
            createElement(Button, { size: 'sm', variant: 'danger', onClick: () => doAction(doShoot), disabled: state.gameOver || !state.hasArrow }, 'Shoot'),
            createElement(Button, { size: 'sm', onClick: () => doAction(doGrab), disabled: state.gameOver }, 'Grab'),
            createElement(Button, { size: 'sm', onClick: () => doAction(doClimb), disabled: state.gameOver }, 'Climb'),
            createElement(Button, { size: 'sm', onClick: newGame }, 'New Game'),
          )
        : createElement('div', {
            style: { display: 'flex', gap: '8px', marginTop: '10px', alignItems: 'center' },
          },
            createElement(Button, { size: 'sm', onClick: newGame }, 'New Game'),
            state.aiPlan.length > 0
              ? createElement('span', {
                  style: { fontSize: '11px', color: 'var(--color-text-muted, #94a3b8)' },
                }, `Plan: ${state.aiPlan.join(' \u2192 ')}`)
              : null,
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

    // Right: sidebar (context-dependent)
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
      // AI Reasoning panel (AI mode only)
      !isHuman
        ? createElement('div', null,
            createElement('h3', { style: { fontSize: '15px', fontWeight: '600', marginBottom: '8px' } }, 'AI Reasoning'),
            createElement('div', {
              style: {
                fontSize: '11px', lineHeight: '1.5', fontFamily: 'monospace',
                padding: '8px', borderRadius: '4px',
                backgroundColor: 'var(--color-surface, #f8fafc)',
                border: '1px solid var(--color-border, #e2e8f0)',
                whiteSpace: 'pre-wrap', maxHeight: '200px', overflowY: 'auto',
                color: 'var(--color-text-muted, #64748b)',
              },
            }, state.aiReasoning || 'Waiting for AI to start...'),
            createElement('h4', {
              style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' },
            }, 'Knowledge Base'),
            createElement('div', {
              style: {
                fontSize: '10px', fontFamily: 'monospace', lineHeight: '1.4',
                color: 'var(--color-text-muted, #64748b)',
              },
            },
              state.kb.wumpusLocation
                ? `Wumpus: ${displayCoord(state.kb.wumpusLocation[0], state.kb.wumpusLocation[1])}`
                : 'Wumpus: unknown',
              createElement('br', null),
              `Safe cells: ${(() => {
                const cells: string[] = [];
                for (let rr = 0; rr < GRID_SIZE; rr++)
                  for (let cc = 0; cc < GRID_SIZE; cc++)
                    if (state.kb.safe[rr]![cc]) cells.push(displayCoord(rr, cc));
                return cells.join(' ');
              })()}`,
              createElement('br', null),
              `Risky cells: ${(() => {
                const cells: string[] = [];
                for (let rr = 0; rr < GRID_SIZE; rr++)
                  for (let cc = 0; cc < GRID_SIZE; cc++)
                    if ((state.kb.maybePit[rr]![cc] || state.kb.maybeWumpus[rr]![cc]) && !state.kb.safe[rr]![cc])
                      cells.push(displayCoord(rr, cc));
                return cells.length > 0 ? cells.join(' ') : 'none';
              })()}`,
              createElement('br', null),
              `Known pits: ${(() => {
                const cells: string[] = [];
                for (let rr = 0; rr < GRID_SIZE; rr++)
                  for (let cc = 0; cc < GRID_SIZE; cc++)
                    if (state.kb.definitelyPit[rr]![cc]) cells.push(displayCoord(rr, cc));
                return cells.length > 0 ? cells.join(' ') : 'none';
              })()}`,
            ),
          )
        : null,

      // About section
      createElement('h3', {
        style: { fontSize: '15px', fontWeight: '600', marginTop: isHuman ? '0' : '16px', marginBottom: '8px' },
      }, isHuman ? 'About Wumpus World' : 'About the AI Agent'),

      isHuman
        ? createElement('div', null,
            createElement('p', null,
              'The Wumpus World is a classic problem in artificial intelligence, introduced by Gregory Yob in 1973 as the text game ',
              createElement('em', null, 'Hunt the Wumpus'),
              '. It was later formalized by Stuart Russell and Peter Norvig in ',
              createElement('em', null, 'Artificial Intelligence: A Modern Approach'),
              ' as a testbed for knowledge-based agents.',
            ),
            createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'The Cave'),
            createElement('p', null,
              'The world is a 10\u00d710 grid of rooms connected by passageways. Somewhere in the cave lurks the Wumpus, a beast that eats anyone entering its room. Some rooms contain bottomless pits. One room contains a heap of gold.',
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
          )
        : createElement('div', null,
            createElement('p', null,
              'This AI agent uses ',
              createElement('strong', null, 'propositional logic'),
              ' to deduce which rooms are safe. It maintains a knowledge base updated after each move and applies inference rules:',
            ),
            createElement('ol', { style: { paddingLeft: '18px', margin: '4px 0' } },
              createElement('li', null, 'No breeze \u2192 all adjacent rooms are pit-free'),
              createElement('li', null, 'No stench \u2192 all adjacent rooms are Wumpus-free'),
              createElement('li', null, 'Pit-free + Wumpus-free \u2192 room is safe'),
              createElement('li', null, 'Constraint propagation: if a breezy room has only one unknown neighbor, that neighbor must be a pit'),
              createElement('li', null, 'Global constraint: if only one cell in the grid can be the Wumpus, its location is deduced'),
            ),
            createElement('h4', { style: { fontSize: '13px', fontWeight: '600', marginTop: '12px', marginBottom: '4px' } }, 'Strategy'),
            createElement('ol', { style: { paddingLeft: '18px', margin: '4px 0' } },
              createElement('li', null, 'Grab gold if glitter detected'),
              createElement('li', null, 'Return to entrance if carrying gold'),
              createElement('li', null, 'Shoot Wumpus if location deduced'),
              createElement('li', null, 'Explore nearest safe unvisited room'),
              createElement('li', null, 'Take calculated risk on least-dangerous unknown'),
              createElement('li', null, 'Retreat to entrance if stuck'),
            ),
            createElement('p', { style: { marginTop: '8px' } },
              'The agent uses BFS pathfinding through known-safe cells and plans multi-step action sequences (turn + move). Watch the reasoning panel above to see inference in real time.',
            ),
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
