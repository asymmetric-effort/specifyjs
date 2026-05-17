# Wumpus World Demo

A 2D demonstration of the classic AI problem from Russell and Norvig's "Artificial Intelligence: A Modern Approach," implemented as a SpecifyJS showcase application. The demo is available at `/#/wumpus` on the showcase site.

## Overview

The agent explores a 10x10 cave to find gold while avoiding deadly hazards:

- **The Wumpus** -- a monster that kills the agent on contact.
- **Bottomless pits** -- falling in is fatal.

The agent must navigate using only local percepts, grab the gold, and return to the entrance to win.

## Game Mechanics

### Board Generation

- **Grid**: 10x10 cells.
- **Agent start**: Bottom-left corner (row 9, col 0).
- **Wumpus**: Exactly one, placed randomly (never at start).
- **Gold**: Exactly one, placed randomly (never at start).
- **Pits**: Each remaining cell has a 20% chance of containing a pit (not at start, not on wumpus/gold).

### Percepts

The agent receives percepts only for its current cell:

| Percept | Meaning |
|---------|---------|
| **Stench** | Adjacent (4-directional) to the Wumpus |
| **Breeze** | Adjacent to a pit |
| **Glitter** | In the same room as the gold |
| **Bump** | Walked into a wall |
| **Scream** | The Wumpus was killed by an arrow |

### Actions

| Action | Effect |
|--------|--------|
| **Move Forward** | Move one cell in the agent's facing direction |
| **Turn Left** | Rotate 90 degrees counter-clockwise |
| **Turn Right** | Rotate 90 degrees clockwise |
| **Shoot** | Fire an arrow in the facing direction (one arrow only) |
| **Grab** | Pick up the gold (must be in the same cell) |
| **Climb** | Exit the cave (must be at the entrance) |

### Scoring

| Event | Points |
|-------|--------|
| Each action taken | -1 |
| Shooting the arrow | -10 |
| Death (Wumpus or pit) | -1001 (including the move) |
| Exiting with gold | +1000 |
| Exiting without gold | 0 bonus |

The goal is to maximize the total score. A perfect game involves finding and grabbing the gold with minimal moves and returning to the entrance.

## Human Mode

In human mode, the player controls the agent manually using on-screen buttons:

- **Move/Turn buttons** -- Move Forward, Turn Left, Turn Right.
- **Action buttons** -- Shoot, Grab, Climb.
- The grid displays only cells the agent has visited (fog of war).
- Percepts are shown after each move.
- A log panel records all actions and events.

## AI Mode

In AI mode, a knowledge-based agent plays automatically at one action per second. The AI uses logical inference to deduce safe cells and locate hazards.

### AI Decision Priority

The agent follows this priority order each turn:

1. **Glitter detected** -- grab the gold immediately.
2. **Have gold** -- pathfind back to the entrance and climb out.
3. **Wumpus located + have arrow** -- if aligned for a shot, shoot the Wumpus.
4. **Safe unvisited cell adjacent** -- move to explore it.
5. **Safe unvisited cell reachable** -- pathfind to the nearest safe unvisited cell.
6. **Risky exploration** -- if no safe option exists, move to a "maybe" cell (calculated risk).
7. **Retreat** -- return to the entrance and climb out if no progress is possible.

### AI Inference Rules

The knowledge base tracks per-cell status: visited, safe, noPit, noWumpus, maybePit, maybeWumpus, definitelyPit, and wumpusLocation.

**Rule 1: No breeze at current cell** -- all adjacent cells are proven free of pits.

**Rule 2: No stench at current cell** -- all adjacent cells are proven free of the Wumpus.

**Rule 3: Wumpus killed** -- all cells are marked wumpus-safe.

**Rule 4: Constraint propagation (pits)** -- if a breezy cell has only one unproven adjacent cell, that cell must contain a pit. Conversely, if a known pit explains the breeze, remaining neighbors are safe.

**Rule 5: Constraint propagation (Wumpus)** -- if a stenchy cell has only one unproven adjacent cell, the Wumpus must be there. Once located, all other cells are marked safe from Wumpus.

**Rule 6: Global uniqueness** -- if only one cell in the entire grid remains a Wumpus candidate, it is identified as the Wumpus location.

**Rule 7: Combined safety** -- a cell is "safe" if it is proven to have no pit AND no Wumpus.

### AI Reasoning Display

The AI displays its current reasoning string explaining why it chose its action (e.g., "No breeze at (2,3) -> (2,4) has no pit" or "Have gold -> returning to entrance via (8,0) -> (9,0)").

### Auto-restart

In AI mode, when a game ends (win or loss), a new game automatically starts after recording the result. A running win/loss tally with win percentage is displayed.

## Technical Implementation

- **Pure logic module** (`wumpus-logic.ts`) -- zero framework dependencies, containing all game state, board generation, percept computation, action execution, knowledge base updates, and AI decision logic.
- **UI component** (`wumpus-world.ts`) -- SpecifyJS functional component using `useState`, `useEffect`, `useCallback`, `useMemo`, and `useRef`.
- **Visualization** -- uses the `DiscreteCartesian2D` grid component for the board display with color-coded cells.
- **Testing** -- comprehensive unit tests for the logic module and integration tests for the UI, plus Playwright E2E tests.

## Color Legend

| Color | Meaning |
|-------|---------|
| Dark gray | Unknown/unvisited cell |
| Light/white | Visited empty cell |
| Blue | Agent's current position |
| Black | Confirmed pit |
| Red | Wumpus |
| Yellow | Gold |
| Green (light) | Stench detected |
| Cyan (light) | Breeze detected |
| Mixed green/cyan | Both stench and breeze |
