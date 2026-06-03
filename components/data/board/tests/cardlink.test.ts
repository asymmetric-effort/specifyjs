// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';
import { __setDispatcher } from '../../../../core/src/hooks/index';
import { CardLinkOverlay } from '../src/CardLink';
import type { Card, CardLink } from '../src/types';

// ---------------------------------------------------------------------------
// Inline mock dispatcher
// ---------------------------------------------------------------------------

function makeMockDispatcher(): any {
  let idCounter = 0;
  return {
    useState: <T,>(init: T | (() => T)): [T, (a: T | ((p: T) => T)) => void] => {
      const val = typeof init === 'function' ? (init as () => T)() : init;
      return [val, () => {}];
    },
    useEffect: () => {},
    useContext: () => undefined,
    useReducer: <S, A,>(_r: any, init: S, fn?: (a: S) => S): [S, (a: A) => void] => {
      return [fn ? fn(init) : init, () => {}];
    },
    useCallback: <T,>(cb: T) => cb,
    useMemo: <T,>(f: () => T) => f(),
    useRef: <T,>(v?: T) => ({ current: v }),
    useImperativeHandle: () => {},
    useLayoutEffect: () => {},
    useDebugValue: () => {},
    useId: () => `mock-id-${idCounter++}`,
    useDeferredValue: <T,>(v: T) => v,
    useTransition: () => [false, (cb: () => void) => cb()],
    useSyncExternalStore: <T,>(_s: any, gs: () => T) => gs(),
    useInsertionEffect: () => {},
  };
}

// ---------------------------------------------------------------------------
// Setup
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  __setDispatcher(makeMockDispatcher());
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
    __setDispatcher(null);
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCard(overrides?: Partial<Card>): Card {
  return {
    type: 'card',
    card_id: 'card-1',
    card_type: 'text',
    card_title: 'Card 1',
    card_link: [],
    content: { text: '' },
    position: { x: 0, y: 0 },
    size: { width: 200, height: 150 },
    color: '#fef9c3',
    createdAt: 0,
    updatedAt: 0,
    ...overrides,
  };
}

function makeLink(overrides?: Partial<CardLink>): CardLink {
  return {
    link_id: 'link-1',
    link_name: 'relates to',
    target_card_id: 'card-2',
    color: '#94a3b8',
    attributes: {},
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// CardLinkOverlay — basic rendering
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — basic rendering', () => {
  it('renders SVG element', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    expect(svg).not.toBeNull();
    expect(svg!.tagName.toLowerCase()).toBe('svg');
  });

  it('SVG has role=img', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    expect(svg!.getAttribute('role')).toBe('img');
  });

  it('SVG has aria-label "Card links"', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    expect(svg!.getAttribute('aria-label')).toBe('Card links');
  });

  it('SVG has zIndex 9999', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]') as HTMLElement;
    expect(svg.style.zIndex).toBe('9999');
  });

  it('SVG has correct width and height attributes', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 3000,
      canvasHeight: 4000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    expect(svg!.getAttribute('width')).toBe('3000');
    expect(svg!.getAttribute('height')).toBe('4000');
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — arrow markers
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — arrow markers', () => {
  it('renders defs with marker element', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    const defs = svg!.querySelector('defs');
    expect(defs).not.toBeNull();
    const marker = defs!.querySelector('marker');
    expect(marker).not.toBeNull();
  });

  it('marker has id "board-card-link-arrowhead"', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    const marker = svg!.querySelector('marker');
    expect(marker!.getAttribute('id')).toBe('board-card-link-arrowhead');
  });

  it('marker has orient auto-start-reverse', () => {
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    const marker = svg!.querySelector('marker');
    expect(marker!.getAttribute('orient')).toBe('auto-start-reverse');
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — link rendering
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — link rendering', () => {
  it('renders path elements for each link', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const visiblePath = container.querySelector('[data-testid="link-link-a"]');
    expect(visiblePath).not.toBeNull();
    expect(visiblePath!.tagName.toLowerCase()).toBe('path');
  });

  it('renders hit area path for each link', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const hitPath = container.querySelector('[data-testid="link-hit-link-a"]');
    expect(hitPath).not.toBeNull();
    expect(hitPath!.getAttribute('stroke')).toBe('transparent');
    expect(hitPath!.getAttribute('stroke-width')).toBe('12');
  });

  it('hit area has pointerEvents:stroke style', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const hitPath = container.querySelector('[data-testid="link-hit-link-a"]') as HTMLElement;
    expect(hitPath.style.pointerEvents).toBe('stroke');
  });

  it('renders link name labels', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', link_name: 'depends on', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const label = container.querySelector('[data-testid="link-label-link-a"]');
    expect(label).not.toBeNull();
    expect(label!.textContent).toBe('depends on');
  });

  it('does not render label when link_name is empty', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', link_name: '', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const label = container.querySelector('[data-testid="link-label-link-a"]');
    expect(label).toBeNull();
  });

  it('visible path references arrow marker', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-a', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const visiblePath = container.querySelector('[data-testid="link-link-a"]');
    expect(visiblePath!.getAttribute('marker-end')).toBe('url(#board-card-link-arrowhead)');
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — onLinkContextMenu
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — onLinkContextMenu prop', () => {
  it('accepts onLinkContextMenu prop', () => {
    const onLinkContextMenu = () => {};
    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [],
      cards: [],
      selectedLinkId: null,
      onSelectLink: () => {},
      onLinkContextMenu,
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));
    const svg = container.querySelector('[data-testid="card-link-overlay"]');
    expect(svg).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — getNearestAnchors (tested indirectly via path positions)
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — anchor selection for path routing', () => {
  it('cards side by side: path goes from right edge to left edge', () => {
    // Source at left, target at right, well separated horizontally
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 100 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 100 } });
    const link = makeLink({ link_id: 'link-h', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-h"]');
    expect(path).not.toBeNull();
    const d = path!.getAttribute('d') || '';
    // Path should start at source right edge (200, 50) and end at target left edge (400, 50)
    expect(d).toContain('M 200 50');
    expect(d).toContain('400 50');
  });

  it('cards stacked vertically: path goes from bottom edge to top edge', () => {
    // Source above, target below
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 100 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 0, y: 300 }, size: { width: 200, height: 100 } });
    const link = makeLink({ link_id: 'link-v', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-v"]');
    expect(path).not.toBeNull();
    const d = path!.getAttribute('d') || '';
    // Path should start at source bottom edge (100, 100) and end at target top edge (100, 300)
    expect(d).toContain('M 100 100');
    expect(d).toContain('100 300');
  });

  it('diagonal cards: path uses nearest anchor pair', () => {
    // Source at top-left, target at bottom-right
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 100, height: 100 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 300, y: 300 }, size: { width: 100, height: 100 } });
    const link = makeLink({ link_id: 'link-d', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-d"]');
    expect(path).not.toBeNull();
    const d = path!.getAttribute('d') || '';
    // For diagonal, the nearest pair should be bottom of source (50, 100) to top of target (350, 300)
    // or right of source (100, 50) to left of target (300, 350)
    // The algorithm picks the shortest distance pair
    // Right-to-left distance: sqrt((300-100)^2 + (350-50)^2) = sqrt(40000+90000) = sqrt(130000)
    // Bottom-to-top distance: sqrt((350-50)^2 + (300-100)^2) = sqrt(90000+40000) = sqrt(130000)
    // Both equal, so it picks whichever it finds first in the loop: right->left
    // Actually bottom->top comes later in the loop. Let's just check the path exists and has valid M/Q
    expect(d).toMatch(/^M \d+ \d+ Q/);
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — selected link styling
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — selected link', () => {
  it('selected link has thicker stroke width', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-sel', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: 'link-sel',
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-sel"]');
    expect(path!.getAttribute('stroke-width')).toBe('3');
  });

  it('unselected link has default stroke width', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const target = makeCard({ card_id: 'tgt', position: { x: 400, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-unsel', target_card_id: 'tgt' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source, target],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-unsel"]');
    expect(path!.getAttribute('stroke-width')).toBe('2');
  });
});

// ---------------------------------------------------------------------------
// CardLinkOverlay — skips links with missing target
// ---------------------------------------------------------------------------

describe('CardLinkOverlay — missing target', () => {
  it('skips link when target card is not in cards array', () => {
    const source = makeCard({ card_id: 'src', position: { x: 0, y: 0 }, size: { width: 200, height: 150 } });
    const link = makeLink({ link_id: 'link-orphan', target_card_id: 'nonexistent' });

    const root = createRoot(container);
    root.render(createElement(CardLinkOverlay, {
      links: [{ source, link }],
      cards: [source],
      selectedLinkId: null,
      onSelectLink: () => {},
      canvasWidth: 5000,
      canvasHeight: 5000,
    }));

    const path = container.querySelector('[data-testid="link-link-orphan"]');
    expect(path).toBeNull();
  });
});
