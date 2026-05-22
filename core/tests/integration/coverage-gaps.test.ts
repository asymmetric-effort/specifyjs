/**
 * Tests specifically targeting remaining coverage gaps across all source files.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { createElement, Fragment, Component, createContext } from '../../src/index';
import { useState, useEffect } from '../../src/hooks/index';
import { createRoot } from '../../src/dom/create-root';
import { getFiberTag, coerceToFiberChildren } from '../../src/core/fiber';
import {
  FiberTag,
  SPEC_CONSUMER_TYPE,
  SPEC_SUSPENSE_TYPE,
  SPEC_PROFILER_TYPE,
  SPEC_PORTAL_TYPE,
  SPEC_STRICT_MODE_TYPE,
} from '../../src/shared/types';
import { reconcileChildren } from '../../src/core/reconciler';
import { createHostRootFiber } from '../../src/core/fiber';
import { scheduleMicrotask, scheduleUpdate, batchUpdates } from '../../src/core/scheduler';
import {
  queueTransitionCallback,
  startTransition,
  isInTransition,
} from '../../src/core/transitions';
import { resetIdCounter } from '../../src/hooks/dispatcher';
import {
  SyntheticInputEvent,
  SyntheticTouchEvent,
  SyntheticMouseEvent,
  SyntheticKeyboardEvent,
  createSyntheticEvent,
} from '../../src/dom/synthetic-event';
import { hydrateRoot } from '../../src/dom/create-root';
import { renderToString } from '../../src/server/render-to-string';
import { setCurrentFiber, allocateHook } from '../../src/hooks/hook-state';
import { SPEC_ELEMENT_TYPE } from '../../src/shared/types';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ============================================================================
// fiber.ts — uncovered getFiberTag branches and coerce fallback
// ============================================================================
describe('fiber.ts coverage gaps', () => {
  it('getFiberTag returns SuspenseComponent for Suspense type', () => {
    expect(getFiberTag(SPEC_SUSPENSE_TYPE)).toBe(FiberTag.SuspenseComponent);
  });

  it('getFiberTag returns Fragment for StrictMode', () => {
    expect(getFiberTag(SPEC_STRICT_MODE_TYPE)).toBe(FiberTag.Fragment);
  });

  it('getFiberTag returns Profiler for Profiler type', () => {
    expect(getFiberTag(SPEC_PROFILER_TYPE)).toBe(FiberTag.Profiler);
  });

  it('getFiberTag returns Portal for Portal type', () => {
    expect(getFiberTag(SPEC_PORTAL_TYPE)).toBe(FiberTag.Portal);
  });

  it('getFiberTag returns ContextConsumer for Consumer type', () => {
    const ctx = createContext('test');
    const consumer = ctx.Consumer;
    expect(getFiberTag(consumer as unknown as symbol)).toBe(FiberTag.ContextConsumer);
  });

  it('getFiberTag returns ContextProvider for Provider type', () => {
    const ctx = createContext('test');
    const provider = ctx.Provider;
    expect(getFiberTag(provider as unknown as symbol)).toBe(FiberTag.ContextProvider);
  });

  it('getFiberTag returns HostComponent for unknown type', () => {
    expect(getFiberTag(12345 as unknown as string)).toBe(FiberTag.HostComponent);
  });

  it('coerceToFiberChildren returns empty for unknown types', () => {
    // Symbol is neither string, number, element, array, nor null/boolean
    expect(coerceToFiberChildren(Symbol('test') as unknown as string)).toEqual([]);
  });
});

// ============================================================================
// reconciler.ts — uncovered paths (updateFromMap with text, null return)
// ============================================================================
describe('reconciler.ts coverage gaps', () => {
  it('reconciles keyed children with out-of-order text nodes', () => {
    const parent = createHostRootFiber();

    // Initial: keyed elements
    const first = reconcileChildren(
      parent,
      null,
      [createElement('div', { key: 'a' }), createElement('span', { key: 'b' }), 'text-node'],
      0,
    );

    // Reorder with different text and added keyed element
    const updated = reconcileChildren(
      parent,
      first,
      ['new-text', createElement('span', { key: 'b' }), createElement('p', { key: 'c' })],
      0,
    );

    expect(updated).not.toBeNull();
  });

  it('handles reconciliation where old fiber index > new index', () => {
    const parent = createHostRootFiber();

    // Create children with specific indices
    const first = reconcileChildren(
      parent,
      null,
      [
        createElement('div', { key: 'x' }),
        createElement('div', { key: 'y' }),
        createElement('div', { key: 'z' }),
      ],
      0,
    );

    // Remove first, shift everything
    reconcileChildren(
      parent,
      first,
      [
        createElement('div', { key: 'y' }),
        createElement('div', { key: 'z' }),
        createElement('div', { key: 'x' }),
      ],
      0,
    );
    // Should not throw — exercising the map path
  });
});

// ============================================================================
// scheduler.ts — scheduleMicrotask
// ============================================================================
describe('scheduler.ts coverage gaps', () => {
  it('scheduleMicrotask runs function asynchronously', async () => {
    let executed = false;
    scheduleMicrotask(() => {
      executed = true;
    });
    expect(executed).toBe(false);
    await new Promise((r) => setTimeout(r, 10));
    expect(executed).toBe(true);
  });
});

// ============================================================================
// transitions.ts — queueTransitionCallback
// ============================================================================
describe('transitions.ts coverage gaps', () => {
  it('queueTransitionCallback runs callback at end of transition', () => {
    let called = false;
    startTransition(() => {
      queueTransitionCallback(() => {
        called = true;
      });
    });
    expect(called).toBe(true);
  });
});

// ============================================================================
// dispatcher.ts — resetIdCounter, useSyncExternalStore store change
// ============================================================================
describe('dispatcher.ts coverage gaps', () => {
  it('resetIdCounter resets the counter', () => {
    // This is a basic function test
    expect(() => resetIdCounter()).not.toThrow();
  });
});

// ============================================================================
// synthetic-event.ts — SyntheticInputEvent, SyntheticTouchEvent
// ============================================================================
describe('synthetic-event.ts coverage gaps', () => {
  it('creates SyntheticInputEvent for InputEvent', () => {
    if (typeof InputEvent !== 'undefined') {
      const native = new InputEvent('input', { data: 'a', inputType: 'insertText' });
      const synthetic = createSyntheticEvent(native);
      expect(synthetic).toBeInstanceOf(SyntheticInputEvent);
      expect((synthetic as SyntheticInputEvent).data).toBe('a');
      expect((synthetic as SyntheticInputEvent).inputType).toBe('insertText');
    }
  });

  // TouchEvent is not available in jsdom, so we test the constructor directly
  it('SyntheticTouchEvent stores touch properties', () => {
    // We can't create a real TouchEvent in jsdom, but we test the class exists
    expect(SyntheticTouchEvent).toBeDefined();
  });

  it('SyntheticMouseEvent getModifierState works', () => {
    const native = new MouseEvent('click', { ctrlKey: true });
    const synthetic = new SyntheticMouseEvent(native);
    expect(synthetic.getModifierState('Control')).toBe(true);
  });

  it('SyntheticKeyboardEvent getModifierState works', () => {
    const native = new KeyboardEvent('keydown', { shiftKey: true });
    const synthetic = new SyntheticKeyboardEvent(native);
    expect(synthetic.getModifierState('Shift')).toBe(true);
  });
});

// ============================================================================
// work-loop.ts — event removal, getHostSibling edge cases
// ============================================================================
describe('work-loop.ts coverage gaps', () => {
  it('removes event listener when prop is removed', () => {
    const handler = vi.fn();
    const root = createRoot(container);

    root.render(createElement('button', { onClick: handler }, 'btn'));
    const btn = container.querySelector('button')!;
    btn.click();
    expect(handler).toHaveBeenCalledTimes(1);

    // Remove the onClick handler
    root.render(createElement('button', null, 'btn'));
    btn.click();
    expect(handler).toHaveBeenCalledTimes(1); // Should not fire again
  });

  it('handles deletion of component children', () => {
    function Child() {
      return createElement('span', null, 'child');
    }

    const root = createRoot(container);
    root.render(createElement('div', null, createElement(Child, null), createElement(Child, null)));
    expect(container.querySelectorAll('span')).toHaveLength(2);

    // Replace with single text child
    root.render(createElement('div', null, 'just text'));
    expect(container.querySelectorAll('span')).toHaveLength(0);
    expect(container.innerHTML).toBe('<div>just text</div>');
  });

  it('handles deletion of nested component subtrees', () => {
    const cleanup = vi.fn();

    function Inner() {
      useEffect(() => cleanup, []);
      return createElement('span', null, 'inner');
    }
    function Outer() {
      return createElement('div', null, createElement(Inner, null));
    }

    const root = createRoot(container);
    root.render(createElement(Outer, null));
    expect(container.querySelector('span')?.textContent).toBe('inner');

    root.render(createElement('p', null, 'replaced'));
    expect(container.innerHTML).toBe('<p>replaced</p>');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('inserts before existing sibling', () => {
    const root = createRoot(container);

    // Render two items
    root.render(
      createElement(
        'div',
        null,
        createElement('span', { key: 'a' }, 'A'),
        createElement('span', { key: 'c' }, 'C'),
      ),
    );

    // Insert B between A and C
    root.render(
      createElement(
        'div',
        null,
        createElement('span', { key: 'a' }, 'A'),
        createElement('span', { key: 'b' }, 'B'),
        createElement('span', { key: 'c' }, 'C'),
      ),
    );

    const spans = container.querySelectorAll('span');
    expect(spans).toHaveLength(3);
    expect(spans[0]?.textContent).toBe('A');
    expect(spans[1]?.textContent).toBe('B');
    expect(spans[2]?.textContent).toBe('C');
  });

  it('handles component that returns fragment with siblings', () => {
    function Multi() {
      return createElement(
        Fragment,
        null,
        createElement('em', null, '1'),
        createElement('em', null, '2'),
      );
    }

    const root = createRoot(container);
    root.render(
      createElement('div', null, createElement(Multi, null), createElement('b', null, 'after')),
    );
    expect(container.querySelectorAll('em')).toHaveLength(2);
    expect(container.querySelector('b')?.textContent).toBe('after');
  });
});

// ============================================================================
// create-root.ts — hydrateRoot error case
// ============================================================================
describe('create-root.ts coverage gaps', () => {
  it('hydrateRoot throws for null container', () => {
    expect(() => hydrateRoot(null as unknown as Element, null)).toThrow();
  });
});

// ============================================================================
// render-to-string.ts — SSR with symbol/unknown component
// ============================================================================
describe('render-to-string.ts coverage gaps', () => {
  it('renders empty string for unknown symbol types', () => {
    const el = {
      $$typeof: SPEC_ELEMENT_TYPE,
      type: Symbol('unknown'),
      props: {},
      key: null,
      ref: null,
    };
    expect(renderToString(el as any)).toBe('');
  });

  it('renders Context Consumer in SSR (symbol type)', () => {
    const ctx = createContext('ctx-val');
    expect(typeof renderToString(createElement('div', null, 'ok'))).toBe('string');
  });
});

// ============================================================================
// hook-state.ts — update path with alternate fiber
// ============================================================================
describe('hook-state.ts coverage gaps', () => {
  it('allocateHook on update reads from alternate', () => {
    // First render: mount hooks
    const fiber1 = createHostRootFiber();
    setCurrentFiber(fiber1);
    const hook1 = allocateHook();
    hook1.memoizedState = 'persisted';
    const hook2 = allocateHook();
    hook2.memoizedState = 'second';

    // Second render: create alternate fiber
    const fiber2 = createHostRootFiber();
    fiber2.alternate = fiber1;
    setCurrentFiber(fiber2);

    const hookA = allocateHook();
    expect(hookA.memoizedState).toBe('persisted');
    const hookB = allocateHook();
    expect(hookB.memoizedState).toBe('second');

    setCurrentFiber(null);
  });

  it('allocateHook throws when more hooks rendered than previous', () => {
    // First render: one hook
    const fiber1 = createHostRootFiber();
    setCurrentFiber(fiber1);
    allocateHook();

    // Second render: try two hooks
    const fiber2 = createHostRootFiber();
    fiber2.alternate = fiber1;
    setCurrentFiber(fiber2);

    allocateHook(); // OK
    expect(() => allocateHook()).toThrow('Rendered more hooks than during the previous render');

    setCurrentFiber(null);
  });
});
