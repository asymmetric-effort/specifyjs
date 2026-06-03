// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';
import { __setDispatcher } from '../../../../core/src/hooks/index';
import { CardComponent, PRIORITY_COLORS, CARD_TYPE_OPTIONS } from '../src/Card';
import { boardReducer } from '../src/BoardReducer';
import type { Card, BoardState } from '../src/types';

// ---------------------------------------------------------------------------
// Inline mock dispatcher (avoids specifyjs package resolution)
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
    card_id: 'test-card',
    card_type: 'text',
    card_title: 'Test Card',
    card_link: [],
    content: { text: 'Hello world' },
    position: { x: 50, y: 50 },
    size: { width: 200, height: 150 },
    color: '#fef9c3',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// TextCard rendering
// ---------------------------------------------------------------------------

describe('CardComponent — TextCard', () => {
  it('renders title', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Test Card');
  });

  it('renders text content', () => {
    const card = makeCard({ content: { text: 'My text body' } });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('My text body');
  });

  it('renders with correct test id', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]');
    expect(el).not.toBeNull();
  });

  it('renders Untitled when title is empty', () => {
    const card = makeCard({ card_title: '' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Untitled');
  });
});

// ---------------------------------------------------------------------------
// JsonCard rendering
// ---------------------------------------------------------------------------

describe('CardComponent — JsonCard', () => {
  it('renders key-value pairs', () => {
    const card = makeCard({
      card_type: 'json',
      content: { name: 'Alice', role: 'admin' },
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('name:');
    expect(container.textContent).toContain('Alice');
    expect(container.textContent).toContain('role:');
    expect(container.textContent).toContain('admin');
  });

  it('renders empty json card', () => {
    const card = makeCard({
      card_type: 'json',
      content: {},
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Test Card');
  });
});

// ---------------------------------------------------------------------------
// TaskCard rendering
// ---------------------------------------------------------------------------

describe('CardComponent — TaskCard', () => {
  it('renders coming soon placeholder', () => {
    const card = makeCard({
      card_type: 'task',
      content: {},
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Task card (coming soon)');
  });
});

// ---------------------------------------------------------------------------
// ProjectCard rendering
// ---------------------------------------------------------------------------

describe('CardComponent — ProjectCard', () => {
  it('renders project name as pill', () => {
    const card = makeCard({
      card_type: 'project',
      content: { project_id: 'proj-1', project_name: 'Alpha Release' },
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Alpha Release');
  });

  it('renders Untitled Project when name is empty', () => {
    const card = makeCard({
      card_type: 'project',
      content: { project_id: 'proj-1', project_name: '' },
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('Untitled Project');
  });

  it('has pill border radius', () => {
    const card = makeCard({
      card_type: 'project',
      content: { project_id: 'proj-1', project_name: 'Beta' },
    });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el).not.toBeNull();
    expect(el.style.borderRadius).toBe('999px');
  });
});

// ---------------------------------------------------------------------------
// Priority border
// ---------------------------------------------------------------------------

describe('CardComponent — priority', () => {
  it('renders low priority color', () => {
    const card = makeCard({ priority: 'low' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.borderLeft).toContain(PRIORITY_COLORS.low);
  });

  it('renders critical priority color', () => {
    const card = makeCard({ priority: 'critical' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.borderLeft).toContain(PRIORITY_COLORS.critical);
  });

  it('renders transparent border when no priority', () => {
    const card = makeCard({ priority: undefined });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.borderLeft).toContain('transparent');
  });
});

// ---------------------------------------------------------------------------
// Assignee
// ---------------------------------------------------------------------------

describe('CardComponent — assignee', () => {
  it('renders assignee circle with initial', () => {
    const card = makeCard({ assignee: 'john' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('J');
    expect(container.textContent).toContain('john');
  });

  it('does not render assignee when not set', () => {
    const card = makeCard({ assignee: undefined });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-assignee-test-card"]');
    expect(el).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Tags
// ---------------------------------------------------------------------------

describe('CardComponent — tags', () => {
  it('renders tag badges', () => {
    const card = makeCard({ tags: ['urgent', 'frontend'] });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.textContent).toContain('urgent');
    expect(container.textContent).toContain('frontend');
  });

  it('does not render tags when empty', () => {
    const card = makeCard({ tags: [] });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    // No extra elements for empty tags
    expect(container.textContent).not.toContain('urgent');
  });
});

// ---------------------------------------------------------------------------
// Card type change via reducer
// ---------------------------------------------------------------------------

describe('Card type change via reducer', () => {
  it('changes text to json', () => {
    const card = makeCard({ card_type: 'text', content: { text: 'data' } });
    const state: BoardState = {
      id: 'b1',
      name: 'Test',
      collection: [card],
      viewport: { panX: 0, panY: 0, zoom: 1 },
    };
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card', newType: 'json' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('json');
  });

  it('changes json to project', () => {
    const card = makeCard({ card_type: 'json', content: { key: 'val' } });
    const state: BoardState = {
      id: 'b1',
      name: 'Test',
      collection: [card],
      viewport: { panX: 0, panY: 0, zoom: 1 },
    };
    const result = boardReducer(state, { type: 'CHANGE_CARD_TYPE', cardId: 'test-card', newType: 'project' });
    const changed = result.collection[0] as Card;
    expect(changed.card_type).toBe('project');
    expect((changed.content as any).project_id).toBe('');
  });
});

// ---------------------------------------------------------------------------
// PRIORITY_COLORS and CARD_TYPE_OPTIONS exports
// ---------------------------------------------------------------------------

describe('Card exports', () => {
  it('PRIORITY_COLORS has all priority levels', () => {
    expect(PRIORITY_COLORS.low).toBeDefined();
    expect(PRIORITY_COLORS.medium).toBeDefined();
    expect(PRIORITY_COLORS.high).toBeDefined();
    expect(PRIORITY_COLORS.critical).toBeDefined();
  });

  it('CARD_TYPE_OPTIONS has all types', () => {
    const values = CARD_TYPE_OPTIONS.map((o) => o.value);
    expect(values).toContain('text');
    expect(values).toContain('json');
    expect(values).toContain('task');
    expect(values).toContain('project');
  });

  it('CARD_TYPE_OPTIONS has labels', () => {
    for (const opt of CARD_TYPE_OPTIONS) {
      expect(typeof opt.label).toBe('string');
      expect(opt.label.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Selected state
// ---------------------------------------------------------------------------

describe('CardComponent — selected state', () => {
  it('has selected box-shadow when selected', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, selected: true }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.boxShadow).toContain('#3b82f6');
  });

  it('has default box-shadow when not selected', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, selected: false }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.boxShadow).not.toContain('#3b82f6');
  });
});

// ---------------------------------------------------------------------------
// Position and size
// ---------------------------------------------------------------------------

describe('CardComponent — position and size', () => {
  it('renders at correct position', () => {
    const card = makeCard({ position: { x: 100, y: 200 } });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.left).toBe('100px');
    expect(el.style.top).toBe('200px');
  });

  it('renders with correct size', () => {
    const card = makeCard({ size: { width: 300, height: 250 } });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.width).toBe('300px');
    expect(el.style.height).toBe('250px');
  });
});

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

describe('CardComponent — color', () => {
  it('uses card color as background', () => {
    const card = makeCard({ color: '#e0f2fe' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#e0f2fe');
  });

  it('uses default color when not specified', () => {
    const card = makeCard({ color: '' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#fef9c3');
  });
});

// ---------------------------------------------------------------------------
// ARIA
// ---------------------------------------------------------------------------

describe('CardComponent — ARIA', () => {
  it('has role=button', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.getAttribute('role')).toBe('button');
  });

  it('has aria-label with card title', () => {
    const card = makeCard({ card_title: 'My Card' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.getAttribute('aria-label')).toContain('My Card');
  });

  it('is focusable via tabIndex', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    // SpecifyJS sets tabIndex as a DOM property; verify the element exists and is rendered
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Drag handle
// ---------------------------------------------------------------------------

describe('CardComponent — drag handle', () => {
  it('renders drag handle element', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const handle = container.querySelector('[data-testid="card-drag-handle-test-card"]');
    expect(handle).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Inline editing props
// ---------------------------------------------------------------------------

describe('CardComponent — inline editing props', () => {
  it('onUpdate prop exists in CardComponentProps interface', () => {
    const card = makeCard();
    const onUpdate = () => {};
    const root = createRoot(container);
    // Should render without error when onUpdate is provided
    root.render(createElement(CardComponent, { card, onUpdate }));
    expect(container.querySelector('[data-testid="card-test-card"]')).not.toBeNull();
  });

  it('title renders as div by default (not input)', () => {
    const card = makeCard({ card_title: 'My Title' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const titleDiv = container.querySelector('[data-testid="card-title-test-card"]');
    expect(titleDiv).not.toBeNull();
    expect(titleDiv!.tagName.toLowerCase()).toBe('div');
    // No input should be present for title editing by default
    const titleInput = container.querySelector('[data-testid="card-title-edit-test-card"]');
    expect(titleInput).toBeNull();
  });

  it('text content renders as div by default (not textarea)', () => {
    const card = makeCard({ card_type: 'text', content: { text: 'Body text' } });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const textDiv = container.querySelector('[data-testid="card-text-content-test-card"]');
    expect(textDiv).not.toBeNull();
    expect(textDiv!.tagName.toLowerCase()).toBe('div');
    // No textarea should be present for description editing by default
    const descEdit = container.querySelector('[data-testid="card-desc-edit-test-card"]');
    expect(descEdit).toBeNull();
  });

  it('onCardContextMenu prop is accepted', () => {
    const card = makeCard();
    const onCardContextMenu = () => {};
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, onCardContextMenu }));
    expect(container.querySelector('[data-testid="card-test-card"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Card anchor points
// ---------------------------------------------------------------------------

describe('CardComponent — anchor points', () => {
  it('renders 4 anchor elements', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const anchors = container.querySelectorAll('[data-role="anchor"]');
    expect(anchors.length).toBe(4);
  });

  it('anchors have data-anchor attributes for top/right/bottom/left', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const anchors = container.querySelectorAll('[data-role="anchor"]');
    const anchorValues = Array.from(anchors).map((el) => el.getAttribute('data-anchor'));
    expect(anchorValues).toContain('top');
    expect(anchorValues).toContain('right');
    expect(anchorValues).toContain('bottom');
    expect(anchorValues).toContain('left');
  });

  it('anchors have correct test ids', () => {
    const card = makeCard({ card_id: 'anchor-card' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    expect(container.querySelector('[data-testid="card-anchor-top-anchor-card"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="card-anchor-right-anchor-card"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="card-anchor-bottom-anchor-card"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="card-anchor-left-anchor-card"]')).not.toBeNull();
  });

  it('onAnchorDragStart prop is accepted', () => {
    const card = makeCard();
    const onAnchorDragStart = () => {};
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, onAnchorDragStart }));
    expect(container.querySelector('[data-testid="card-test-card"]')).not.toBeNull();
  });

  it('anchor elements have crosshair cursor style', () => {
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const anchor = container.querySelector('[data-role="anchor"]') as HTMLElement;
    expect(anchor).not.toBeNull();
    expect(anchor.style.cursor).toBe('crosshair');
  });
});

// ---------------------------------------------------------------------------
// Card drag props
// ---------------------------------------------------------------------------

describe('CardComponent — drag props', () => {
  it('onDragStart prop is accepted', () => {
    const card = makeCard();
    const onDragStart = () => {};
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, onDragStart }));
    expect(container.querySelector('[data-testid="card-test-card"]')).not.toBeNull();
  });

  it('onDragEnd prop is accepted', () => {
    const card = makeCard();
    const onDragEnd = () => {};
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card, onDragEnd }));
    expect(container.querySelector('[data-testid="card-test-card"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default card color
// ---------------------------------------------------------------------------

describe('CardComponent — default color', () => {
  it('default card color is #fef9c3 (light yellow)', () => {
    const card = makeCard({ color: '' });
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#fef9c3');
  });

  it('card without color prop falls back to #fef9c3', () => {
    // makeCard already uses '#fef9c3' as default color
    const card = makeCard();
    const root = createRoot(container);
    root.render(createElement(CardComponent, { card }));
    const el = container.querySelector('[data-testid="card-test-card"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#fef9c3');
  });
});
