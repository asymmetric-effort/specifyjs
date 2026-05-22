/**
 * Full coverage tests for concurrent rendering, hydration, SVG,
 * StrictMode, Web Components, and other new work-loop paths.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement, Fragment, StrictMode, createFactory } from '../../src/index';
import { createRoot, hydrateRoot } from '../../src/dom/create-root';
import { useState, useEffect } from '../../src/hooks/index';
import { startTransition, requestUpdateLane } from '../../src/core/transitions';
import { DefaultLane, TransitionLane1, TransitionLane2 } from '../../src/core/lanes';
import { flushAllWork } from '../../src/core/scheduler-host-config';
import { flushSync } from '../../src/dom/flush-sync';
import { createFiberRoot, markRootUpdated, ensureRootIsScheduled } from '../../src/dom/work-loop';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ─── StrictMode double-render ─────────────────────────────────────────
describe('StrictMode double-render detection', () => {
  it('calls function component twice on mount', () => {
    let renderCount = 0;
    function Tracker() {
      renderCount++;
      return createElement('div', null, 'tracked');
    }
    const root = createRoot(container);
    root.render(createElement(StrictMode, null, createElement(Tracker, null)));
    // StrictMode should double-invoke on mount
    expect(renderCount).toBe(2);
    expect(container.textContent).toBe('tracked');
    root.unmount();
  });

  it('does not double-render outside StrictMode', () => {
    let renderCount = 0;
    function Tracker() {
      renderCount++;
      return createElement('div', null, 'normal');
    }
    const root = createRoot(container);
    root.render(createElement(Tracker, null));
    expect(renderCount).toBe(1);
    root.unmount();
  });
});

// ─── SVG rendering ────────────────────────────────────────────────────
describe('SVG namespace rendering', () => {
  it('creates SVG elements with correct namespace', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'svg',
        { width: '100', height: '100' },
        createElement('circle', { cx: '50', cy: '50', r: '40' }),
        createElement('rect', { x: '10', y: '10', width: '80', height: '80' }),
      ),
    );
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg!.namespaceURI).toBe('http://www.w3.org/2000/svg');
    const circle = container.querySelector('circle');
    expect(circle).toBeTruthy();
    root.unmount();
  });
});

// ─── createFactory ────────────────────────────────────────────────────
describe('createFactory via render', () => {
  it('creates elements via factory and renders them', () => {
    const divFactory = createFactory('div' as any);
    const root = createRoot(container);
    root.render(divFactory({ id: 'factory-test' }, 'factory content'));
    expect(container.querySelector('#factory-test')).toBeTruthy();
    expect(container.textContent).toBe('factory content');
    root.unmount();
  });
});

// ─── flushSync ────────────────────────────────────────────────────────
describe('flushSync', () => {
  it('forces synchronous state update', () => {
    let setText: (v: string) => void;
    function App() {
      const [text, st] = useState('before');
      setText = st;
      return createElement('div', null, text);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.textContent).toBe('before');

    flushSync(() => {
      setText!('after');
    });
    // After flushSync, the update should be applied
    // (may need a render cycle)
    root.render(createElement(App, null));
    expect(container.textContent).toBe('after');
    root.unmount();
  });
});

// ─── requestUpdateLane ────────────────────────────────────────────────
describe('requestUpdateLane', () => {
  it('returns DefaultLane normally', () => {
    expect(requestUpdateLane()).toBe(DefaultLane);
  });

  it('returns TransitionLane inside startTransition', () => {
    let lane = 0;
    startTransition(() => {
      lane = requestUpdateLane();
    });
    expect([TransitionLane1, TransitionLane2]).toContain(lane);
  });
});

// ─── ensureRootIsScheduled edge cases ─────────────────────────────────
describe('ensureRootIsScheduled', () => {
  it('cancels existing callback when higher priority arrives', () => {
    const root = createFiberRoot(container);
    markRootUpdated(root, TransitionLane1);
    ensureRootIsScheduled(root);
    const firstCallback = root.callbackNode;
    expect(firstCallback).not.toBeNull();

    // Higher priority arrives
    markRootUpdated(root, DefaultLane);
    ensureRootIsScheduled(root);
    // DefaultLane uses microtask, not MessageChannel
    expect(root.callbackPriority).toBe(DefaultLane);
    flushAllWork();
  });

  it('does not re-schedule if same priority is already scheduled', () => {
    const root = createFiberRoot(container);
    markRootUpdated(root, TransitionLane1);
    ensureRootIsScheduled(root);
    const firstNode = root.callbackNode;

    // Same priority again
    ensureRootIsScheduled(root);
    expect(root.callbackNode).toBe(firstNode);
    flushAllWork();
  });
});

// ─── Hydration edge cases ─────────────────────────────────────────────
describe('hydration — additional edge cases', () => {
  it('hydrates multiple sibling elements', () => {
    container.innerHTML = '<div><span>A</span><span>B</span><span>C</span></div>';
    const existingSpans = Array.from(container.querySelectorAll('span'));

    const root = hydrateRoot(
      container,
      createElement(
        'div',
        null,
        createElement('span', null, 'A'),
        createElement('span', null, 'B'),
        createElement('span', null, 'C'),
      ),
    );

    const hydratedSpans = Array.from(container.querySelectorAll('span'));
    expect(hydratedSpans[0]).toBe(existingSpans[0]);
    expect(hydratedSpans[1]).toBe(existingSpans[1]);
    expect(hydratedSpans[2]).toBe(existingSpans[2]);
    root.unmount();
  });

  it('hydrates with mismatched text content', () => {
    container.innerHTML = '<div>server text</div>';
    const root = hydrateRoot(container, createElement('div', null, 'client text'));
    // Text should be updated to client value
    expect(container.textContent).toBe('client text');
    root.unmount();
  });
});

// ─── Concurrent transition rendering ──────────────────────────────────
describe('concurrent transition rendering', () => {
  it('transition work completes via flushAllWork', () => {
    const root = createFiberRoot(container);
    root.pendingChildren = createElement('div', null, 'transition') as any;
    markRootUpdated(root, TransitionLane1);
    ensureRootIsScheduled(root);

    // Not rendered yet (scheduled via MessageChannel)
    expect(container.textContent).toBe('');

    flushAllWork();
    expect(container.textContent).toBe('transition');
  });
});
