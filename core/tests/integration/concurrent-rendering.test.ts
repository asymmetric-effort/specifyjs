/**
 * Integration tests for concurrent rendering.
 * Tests the interruptible work loop, lane-based scheduling, and
 * concurrent rendering entry points.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import { useState } from '../../src/hooks/index';
import { createFiberRoot, markRootUpdated, ensureRootIsScheduled } from '../../src/dom/work-loop';
import { SyncLane, DefaultLane, TransitionLane1, NoLanes } from '../../src/core/lanes';
import { flushAllWork } from '../../src/core/scheduler-host-config';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

describe('concurrent rendering infrastructure', () => {
  it('markRootUpdated sets pending lanes', () => {
    const root = createFiberRoot(container);
    expect(root.pendingLanes).toBe(NoLanes);
    markRootUpdated(root, DefaultLane);
    expect(root.pendingLanes).toBe(DefaultLane);
    markRootUpdated(root, TransitionLane1);
    expect(root.pendingLanes).toBe(DefaultLane | TransitionLane1);
  });

  it('ensureRootIsScheduled does nothing with no pending lanes', () => {
    const root = createFiberRoot(container);
    ensureRootIsScheduled(root);
    expect(root.callbackNode).toBeNull();
  });

  it('ensureRootIsScheduled schedules sync work for DefaultLane', () => {
    const root = createFiberRoot(container);
    markRootUpdated(root, DefaultLane);
    ensureRootIsScheduled(root);
    // DefaultLane uses microtask scheduling (existing behavior)
    expect(root.callbackPriority).toBe(DefaultLane);
  });

  it('ensureRootIsScheduled schedules concurrent work for TransitionLane', () => {
    const root = createFiberRoot(container);
    markRootUpdated(root, TransitionLane1);
    ensureRootIsScheduled(root);
    // TransitionLane uses MessageChannel-based scheduling
    expect(root.callbackNode).not.toBeNull();
    expect(root.callbackPriority).toBe(TransitionLane1);
    // Clean up
    flushAllWork();
  });
});

describe('synchronous rendering path (existing behavior)', () => {
  it('renders normally via createRoot.render', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, 'hello'));
    expect(container.textContent).toBe('hello');
    root.unmount();
  });

  it('state updates re-render via microtask', async () => {
    let setText: (v: string) => void;
    function App() {
      const [text, st] = useState('initial');
      setText = st;
      return createElement('div', null, text);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.textContent).toBe('initial');

    setText!('updated');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe('updated');
    root.unmount();
  });

  it('handles rapid state updates with batching', async () => {
    let setCount: (fn: (n: number) => number) => void;
    function Counter() {
      const [count, sc] = useState(0);
      setCount = sc;
      return createElement('span', null, String(count));
    }
    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.textContent).toBe('0');

    // Multiple updates should batch
    setCount!((n) => n + 1);
    setCount!((n) => n + 1);
    setCount!((n) => n + 1);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toBe('3');
    root.unmount();
  });
});

describe('concurrent rendering path', () => {
  it('concurrent work on TransitionLane completes via flushAllWork', () => {
    const root = createFiberRoot(container);
    // Simulate setting up a render via the concurrent path
    root.pendingChildren = createElement('div', null, 'concurrent') as any;
    markRootUpdated(root, TransitionLane1);
    ensureRootIsScheduled(root);

    // Work is scheduled but not yet executed
    expect(container.textContent).toBe('');

    // Flush the scheduled work
    flushAllWork();

    // After flushing, the concurrent work should be committed
    expect(container.textContent).toBe('concurrent');
  });
});
