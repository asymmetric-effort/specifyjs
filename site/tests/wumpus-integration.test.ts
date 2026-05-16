// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Integration tests for the WumpusWorld component.
 *
 * Mounts the full component via createRoot and asserts on the rendered DOM.
 * Because hooks (useState, useEffect, etc.) require the SpecifyJS reconciler,
 * these tests exercise the real component tree including DiscreteCartesian2D
 * and Button sub-components.
 *
 * NOTE: These tests require createElementNS (SVG support) which is not yet
 * available in @asymmetric-effort/nogginlessdom v0.0.5. They will be
 * re-enabled once NogginLessDom adds SVG namespace support. Until then,
 * coverage is provided by unit tests (271) + E2E Playwright tests (38).
 */

// Skip until NogginLessDom supports createElementNS
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const SKIP = true;
if (SKIP) process.exit(0);

import { describe, it, expect, beforeEach, afterEach, createWindow, Document, Element, Node, Event, NodeList } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../core/src/index';
import { createRoot } from '../../core/src/dom/create-root';
import { WumpusWorld } from '../src/screens/wumpus-world';
import { GRID_SIZE } from '../src/screens/wumpus-logic';

// Install nogginlessdom's Window + Document as globals for SpecifyJS's DOM renderer
const win = createWindow();
const doc = win.document;
// Ensure body exists
if (!doc.body) {
  const body = doc.createElement('body');
  doc.appendChild(body);
}
(globalThis as any).window = win;
(globalThis as any).document = doc;
(globalThis as any).Document = Document;
(globalThis as any).Element = Element;
(globalThis as any).Node = Node;
(globalThis as any).NodeList = NodeList;
(globalThis as any).DocumentFragment = class DocumentFragment {};
(globalThis as any).HTMLElement = Element;
(globalThis as any).Event = Event;

let container: any;

beforeEach(() => {
  container = doc.createElement('div');
  doc.body!.appendChild(container);
});

afterEach(() => {
  doc.body!.removeChild(container);
});

// ── Helpers ─────────────────────────────────────────────────────────────

/** Render the WumpusWorld component into the container and return the root. */
function renderWumpus() {
  const root = createRoot(container);
  root.render(createElement(WumpusWorld, null));
  return root;
}

/** Collect all text content from buttons in the container. */
function getButtonTexts(): string[] {
  const buttons = container.querySelectorAll('button');
  return Array.from(buttons).map((b) => b.textContent ?? '');
}

/** Find a button by its text content (exact match). */
function findButton(text: string): HTMLButtonElement | null {
  const buttons = container.querySelectorAll('button');
  for (const btn of Array.from(buttons)) {
    if (btn.textContent === text) return btn as HTMLButtonElement;
  }
  return null;
}

// ── Component Rendering ─────────────────────────────────────────────────

describe('WumpusWorld component rendering', () => {
  it('renders without throwing', () => {
    expect(() => renderWumpus()).not.toThrow();
  });

  it('contains h2 "Wumpus World"', () => {
    renderWumpus();
    const h2 = container.querySelector('h2');
    expect(h2).not.toBeNull();
    expect(h2!.textContent).toBe('Wumpus World');
  });

  it('contains mode button with text "Mode: Human"', () => {
    renderWumpus();
    const btn = findButton('Mode: Human');
    expect(btn).not.toBeNull();
  });

  it('contains grid container (SVG element)', () => {
    renderWumpus();
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
  });

  it('contains action buttons (Forward, Turn Left, Turn Right, Shoot, Grab, Climb, New Game)', () => {
    renderWumpus();
    const expected = ['Forward', 'Turn Left', 'Turn Right', 'Shoot', 'Grab', 'Climb', 'New Game'];
    const texts = getButtonTexts();
    for (const label of expected) {
      expect(texts).toContain(label);
    }
  });

  it('contains percepts display with "Percepts:" text', () => {
    renderWumpus();
    const strong = container.querySelector('strong');
    expect(strong).not.toBeNull();
    expect(strong!.textContent).toBe('Percepts: ');
  });

  it('contains status bar with Score, Facing, Pos info', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Score:');
    expect(text).toContain('Facing:');
    expect(text).toContain('Pos:');
  });

  it('contains legend with color swatches', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    const legendLabels = ['Agent', 'Unknown', 'Safe', 'Stench', 'Breeze', 'Stench+Breeze', 'Pit', 'Wumpus', 'Gold'];
    for (const label of legendLabels) {
      expect(text).toContain(label);
    }
  });

  it('contains sidebar with "About Wumpus World" heading', () => {
    renderWumpus();
    const h3s = container.querySelectorAll('h3');
    const texts = Array.from(h3s).map((h) => h.textContent);
    expect(texts).toContain('About Wumpus World');
  });

  it('contains Action Log section', () => {
    renderWumpus();
    const h4s = container.querySelectorAll('h4');
    const texts = Array.from(h4s).map((h) => h.textContent);
    expect(texts).toContain('Action Log');
  });
});

// ── Human Mode Interactions (Static Render Checks) ──────────────────────

describe('WumpusWorld human mode interactions', () => {
  it('action log shows initial entry message', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    // The initial log entry mentions "Entered the cave"
    expect(text).toContain('Entered the cave');
  });

  it('Forward button is present and not disabled when game is active', () => {
    renderWumpus();
    const btn = findButton('Forward');
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });

  it('Turn Left button is present and not disabled when game is active', () => {
    renderWumpus();
    const btn = findButton('Turn Left');
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });

  it('Turn Right button is present and not disabled when game is active', () => {
    renderWumpus();
    const btn = findButton('Turn Right');
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });

  it('New Game button is never disabled', () => {
    renderWumpus();
    const btn = findButton('New Game');
    expect(btn).not.toBeNull();
    expect(btn!.disabled).toBe(false);
  });

  it('Shoot button has correct disabled state based on arrow availability', () => {
    renderWumpus();
    const btn = findButton('Shoot');
    expect(btn).not.toBeNull();
    // Initial state: hasArrow is true, gameOver is false, so Shoot should be enabled
    expect(btn!.disabled).toBe(false);
  });
});

// ── Mode Switching ──────────────────────────────────────────────────────

describe('WumpusWorld mode switching', () => {
  it('initial mode is Human', () => {
    renderWumpus();
    const btn = findButton('Mode: Human');
    expect(btn).not.toBeNull();
    expect(findButton('Mode: AI')).toBeNull();
  });

  it('does not show "Start AI" button in human mode', () => {
    renderWumpus();
    expect(findButton('Start AI')).toBeNull();
    expect(findButton('Pause AI')).toBeNull();
  });

  it('human mode shows "About Wumpus World" heading, not "About the AI Agent"', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('About Wumpus World');
    expect(text).not.toContain('About the AI Agent');
  });

  it('human mode does not show "AI Reasoning" heading', () => {
    renderWumpus();
    const h3s = container.querySelectorAll('h3');
    const texts = Array.from(h3s).map((h) => h.textContent);
    expect(texts).not.toContain('AI Reasoning');
  });

  it('human mode does not show "Knowledge Base" section', () => {
    renderWumpus();
    const h4s = container.querySelectorAll('h4');
    const texts = Array.from(h4s).map((h) => h.textContent);
    expect(texts).not.toContain('Knowledge Base');
  });

  it('human mode shows action buttons (Forward, Turn Left, etc.)', () => {
    renderWumpus();
    const expected = ['Forward', 'Turn Left', 'Turn Right', 'Shoot', 'Grab', 'Climb'];
    const texts = getButtonTexts();
    for (const label of expected) {
      expect(texts).toContain(label);
    }
  });
});

// ── Grid Display ────────────────────────────────────────────────────────

describe('WumpusWorld grid display', () => {
  it('SVG element has correct viewBox dimensions', () => {
    renderWumpus();
    const svg = container.querySelector('svg');
    expect(svg).not.toBeNull();
    const viewBox = svg!.getAttribute('viewBox');
    expect(viewBox).toBe('0 0 600 600');
  });

  it('grid overlay contains cells with "?" labels (unknown cells)', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    // At the start, most of the grid is unrevealed ('?')
    expect(text).toContain('?');
  });

  it('grid overlay contains agent direction arrow', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    // Initial direction is East, arrow is '\u2192'
    expect(text).toContain('\u2192');
  });

  it('grid overlay has GRID_SIZE * GRID_SIZE overlay cells', () => {
    renderWumpus();
    // The grid overlay is a div containing GRID_SIZE*GRID_SIZE child divs
    // It uses CSS grid with the gridTemplate pattern
    const allDivs = container.querySelectorAll('div');
    // Find the grid overlay parent by checking for grid-template-rows style
    let overlayCellCount = 0;
    for (const div of Array.from(allDivs)) {
      const style = div.getAttribute('style') ?? '';
      if (style.includes('grid-template-rows')) {
        overlayCellCount = div.children.length;
        break;
      }
    }
    expect(overlayCellCount).toBe(GRID_SIZE * GRID_SIZE);
  });

  it('SVG contains rect elements for the grid cells', () => {
    renderWumpus();
    const rects = container.querySelectorAll('svg rect');
    // At minimum, each cell in the 10x10 grid should be a rect
    expect(rects.length).toBeGreaterThanOrEqual(GRID_SIZE * GRID_SIZE);
  });
});

// ── Edge Cases ──────────────────────────────────────────────────────────

describe('WumpusWorld edge cases', () => {
  it('multiple renders do not crash', () => {
    const root = createRoot(container);
    expect(() => {
      root.render(createElement(WumpusWorld, null));
      root.render(createElement(WumpusWorld, null));
      root.render(createElement(WumpusWorld, null));
    }).not.toThrow();
  });

  it('re-rendering preserves basic structure', () => {
    const root = createRoot(container);
    root.render(createElement(WumpusWorld, null));
    const h2Before = container.querySelector('h2')?.textContent;
    root.render(createElement(WumpusWorld, null));
    const h2After = container.querySelector('h2')?.textContent;
    expect(h2Before).toBe('Wumpus World');
    expect(h2After).toBe('Wumpus World');
  });

  it('component renders with all expected top-level sections', () => {
    renderWumpus();
    // Top-level div should have at least two children: left panel and right sidebar
    const topDiv = container.firstElementChild as HTMLElement;
    expect(topDiv).not.toBeNull();
    expect(topDiv.children.length).toBeGreaterThanOrEqual(2);
  });

  it('unmounting the root does not throw', () => {
    const root = createRoot(container);
    root.render(createElement(WumpusWorld, null));
    expect(() => {
      root.unmount();
    }).not.toThrow();
  });
});

// ── Content Checks ──────────────────────────────────────────────────────

describe('WumpusWorld content details', () => {
  it('status bar shows initial score of 0', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Score: 0');
  });

  it('status bar shows initial facing direction "East"', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Facing: East');
  });

  it('status bar shows initial position at bottom-left', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    // displayCoord(START_ROW=9, START_COL=0) => [1,1]
    expect(text).toContain('Pos: [1,1]');
  });

  it('status bar shows arrow available initially', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Arrow: Yes');
  });

  it('status bar shows gold not found initially', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Gold: Not found');
  });

  it('about section mentions Hunt the Wumpus', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('Hunt the Wumpus');
  });

  it('about section mentions scoring rules', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    expect(text).toContain('+1000 for climbing out with gold');
  });

  it('percepts section lists percepts for starting cell', () => {
    renderWumpus();
    const text = container.textContent ?? '';
    // Percepts at start will be some combination of Stench/Breeze/None
    expect(text).toMatch(/Percepts:\s/);
  });
});
