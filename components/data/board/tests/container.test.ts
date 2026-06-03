// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';
import { __setDispatcher } from '../../../../core/src/hooks/index';
import { ContainerComponent } from '../src/Container';
import type { Container } from '../src/types';

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

let domContainer: HTMLDivElement;

beforeEach(() => {
  __setDispatcher(makeMockDispatcher());
  domContainer = document.createElement('div');
  document.body.appendChild(domContainer);
  return () => {
    document.body.removeChild(domContainer);
    __setDispatcher(null);
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeContainer(overrides?: Partial<Container>): Container {
  return {
    type: 'container',
    container_id: 'ct-test',
    name: 'Test Container',
    position: { x: 50, y: 100 },
    size: { width: 400, height: 300 },
    contents: [],
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Basic rendering
// ---------------------------------------------------------------------------

describe('ContainerComponent — rendering', () => {
  it('renders container name', () => {
    const ct = makeContainer({ name: 'Sprint 1' });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    expect(domContainer.textContent).toContain('Sprint 1');
  });

  it('renders with correct test id', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]');
    expect(el).not.toBeNull();
  });

  it('renders title bar with name', () => {
    const ct = makeContainer({ name: 'My Group' });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleEl = domContainer.querySelector('[data-testid="container-title-ct-test"]');
    expect(titleEl).not.toBeNull();
    expect(titleEl!.textContent).toContain('My Group');
  });

  it('renders contents area', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const contentsEl = domContainer.querySelector('[data-testid="container-contents-ct-test"]');
    expect(contentsEl).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Position and size
// ---------------------------------------------------------------------------

describe('ContainerComponent — position and size', () => {
  it('renders at correct position', () => {
    const ct = makeContainer({ position: { x: 200, y: 300 } });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.left).toBe('200px');
    expect(el.style.top).toBe('300px');
  });

  it('renders with correct size', () => {
    const ct = makeContainer({ size: { width: 500, height: 400 } });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.width).toBe('500px');
    expect(el.style.height).toBe('400px');
  });
});

// ---------------------------------------------------------------------------
// Selected state
// ---------------------------------------------------------------------------

describe('ContainerComponent — selected state', () => {
  it('has blue border when selected', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, selected: true }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.border).toContain('#3b82f6');
  });

  it('has default border when not selected', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, selected: false }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.border).toContain('#d1d5db');
  });
});

// ---------------------------------------------------------------------------
// Children rendering (nesting)
// ---------------------------------------------------------------------------

describe('ContainerComponent — nesting', () => {
  it('renders children inside contents area', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(
      createElement(ContainerComponent, { container: ct },
        createElement('div', { 'data-testid': 'child-item' }, 'Child Content'),
      ),
    );
    const child = domContainer.querySelector('[data-testid="child-item"]');
    expect(child).not.toBeNull();
    expect(child!.textContent).toBe('Child Content');
  });

  it('renders multiple children', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(
      createElement(ContainerComponent, { container: ct },
        createElement('div', { 'data-testid': 'child-1' }, 'A'),
        createElement('div', { 'data-testid': 'child-2' }, 'B'),
      ),
    );
    expect(domContainer.querySelector('[data-testid="child-1"]')).not.toBeNull();
    expect(domContainer.querySelector('[data-testid="child-2"]')).not.toBeNull();
  });

  it('children appear inside contents container', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(
      createElement(ContainerComponent, { container: ct },
        createElement('span', {}, 'Nested'),
      ),
    );
    const contentsEl = domContainer.querySelector('[data-testid="container-contents-ct-test"]');
    expect(contentsEl).not.toBeNull();
    expect(contentsEl!.textContent).toContain('Nested');
  });
});

// ---------------------------------------------------------------------------
// Z-order
// ---------------------------------------------------------------------------

describe('ContainerComponent — z-order', () => {
  it('container has z-index 0 (renders behind children)', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.zIndex).toBe('0');
  });
});

// ---------------------------------------------------------------------------
// Scroll overflow
// ---------------------------------------------------------------------------

describe('ContainerComponent — scroll overflow', () => {
  it('contents area has overflow auto', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const contentsEl = domContainer.querySelector('[data-testid="container-contents-ct-test"]') as HTMLElement;
    expect(contentsEl.style.overflow).toBe('auto');
  });
});

// ---------------------------------------------------------------------------
// ARIA
// ---------------------------------------------------------------------------

describe('ContainerComponent — ARIA', () => {
  it('has role=group', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.getAttribute('role')).toBe('group');
  });

  it('has aria-label with container name', () => {
    const ct = makeContainer({ name: 'Backend Tasks' });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.getAttribute('aria-label')).toContain('Backend Tasks');
  });
});

// ---------------------------------------------------------------------------
// Resize handle
// ---------------------------------------------------------------------------

describe('ContainerComponent — resize handle', () => {
  it('renders resize handle', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const resize = domContainer.querySelector('[data-role="resize"]');
    expect(resize).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Background and styling
// ---------------------------------------------------------------------------

describe('ContainerComponent — styling', () => {
  it('has white background (opaque)', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#ffffff');
  });

  it('has box-shadow', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.boxShadow.length).toBeGreaterThan(0);
  });

  it('has border-radius', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.borderRadius).toBe('8px');
  });

  it('title bar has grab cursor', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleEl = domContainer.querySelector('[data-testid="container-title-ct-test"]') as HTMLElement;
    expect(titleEl.style.cursor).toBe('grab');
  });

  it('title is bold and centered', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleEl = domContainer.querySelector('[data-testid="container-title-ct-test"]') as HTMLElement;
    expect(titleEl.style.fontWeight).toBe('700');
    expect(titleEl.style.textAlign).toBe('center');
  });
});

// ---------------------------------------------------------------------------
// Data attributes
// ---------------------------------------------------------------------------

describe('ContainerComponent — data attributes', () => {
  it('has data-container-id', () => {
    const ct = makeContainer({ container_id: 'my-unique-id' });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const el = domContainer.querySelector('[data-container-id="my-unique-id"]');
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// onDelete prop
// ---------------------------------------------------------------------------

describe('ContainerComponent — onDelete prop', () => {
  it('accepts onDelete prop without error', () => {
    const ct = makeContainer();
    const onDelete = () => {};
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, onDelete }));
    expect(domContainer.querySelector('[data-testid="container-ct-test"]')).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Delete and Minimize buttons in title bar
// ---------------------------------------------------------------------------

describe('ContainerComponent — title bar buttons', () => {
  it('renders delete button in title bar', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleBar = domContainer.querySelector('[data-testid="container-title-ct-test"]');
    expect(titleBar).not.toBeNull();
    const deleteBtn = titleBar!.querySelector('[aria-label="Delete container"]');
    expect(deleteBtn).not.toBeNull();
    expect(deleteBtn!.textContent).toBe('\u00D7');
  });

  it('renders minimize button in title bar', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleBar = domContainer.querySelector('[data-testid="container-title-ct-test"]');
    expect(titleBar).not.toBeNull();
    const minimizeBtn = titleBar!.querySelector('[aria-label="Minimize container"]');
    expect(minimizeBtn).not.toBeNull();
    // The em-dash character for minimize
    expect(minimizeBtn!.textContent).toBe('\u2014');
  });

  it('delete button has aria-label "Delete container"', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const deleteBtn = domContainer.querySelector('[aria-label="Delete container"]');
    expect(deleteBtn).not.toBeNull();
    expect(deleteBtn!.tagName.toLowerCase()).toBe('button');
  });

  it('title bar has flex layout with buttons on right', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleBar = domContainer.querySelector('[data-testid="container-title-ct-test"]') as HTMLElement;
    expect(titleBar.style.display).toBe('flex');
    expect(titleBar.style.justifyContent).toBe('space-between');
    expect(titleBar.style.alignItems).toBe('center');
  });
});

// ---------------------------------------------------------------------------
// Minimized state
// ---------------------------------------------------------------------------

describe('ContainerComponent — minimized state', () => {
  it('shows contents area when not minimized (default)', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const contentsEl = domContainer.querySelector('[data-testid="container-contents-ct-test"]');
    expect(contentsEl).not.toBeNull();
  });

  it('shows resize handle when not minimized (default)', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const resize = domContainer.querySelector('[data-role="resize"]');
    expect(resize).not.toBeNull();
  });

  it('always shows title bar regardless of minimized state', () => {
    const ct = makeContainer({ name: 'Always Visible' });
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const titleBar = domContainer.querySelector('[data-testid="container-title-ct-test"]');
    expect(titleBar).not.toBeNull();
    expect(titleBar!.textContent).toContain('Always Visible');
  });

  it('minimize button initial aria-label is "Minimize container"', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct }));
    const minimizeBtn = domContainer.querySelector('[aria-label="Minimize container"]');
    expect(minimizeBtn).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Highlighted state
// ---------------------------------------------------------------------------

describe('ContainerComponent — highlighted state', () => {
  it('highlighted prop changes border to blue dashed', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, highlighted: true }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.border).toContain('dashed');
    expect(el.style.border).toContain('#3b82f6');
  });

  it('highlighted prop changes background to light blue', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, highlighted: true }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.backgroundColor).toBe('#eff6ff');
  });

  it('not highlighted has solid border', () => {
    const ct = makeContainer();
    const root = createRoot(domContainer);
    root.render(createElement(ContainerComponent, { container: ct, highlighted: false }));
    const el = domContainer.querySelector('[data-testid="container-ct-test"]') as HTMLElement;
    expect(el.style.border).not.toContain('dashed');
  });
});
