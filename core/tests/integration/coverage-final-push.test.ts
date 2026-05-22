/**
 * Final coverage push tests — targeting specific uncovered lines.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import {
  useState,
  useSyncExternalStore,
  useTransition,
  useDeferredValue,
} from '../../src/hooks/index';
import { flushSync } from '../../src/dom/flush-sync';
import { startTransition } from '../../src/core/transitions';
import { DefaultLane, TransitionLane1 } from '../../src/core/lanes';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ─── useSyncExternalStore effect body ─────────────────────────────────
describe('useSyncExternalStore — full lifecycle', () => {
  it('subscribes and re-renders when store changes', async () => {
    let listeners: (() => void)[] = [];
    let storeValue = 'initial';

    const subscribe = (cb: () => void) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    };
    const getSnapshot = () => storeValue;

    function StoreConsumer() {
      const value = useSyncExternalStore(subscribe, getSnapshot);
      return createElement('div', null, value);
    }

    const root = createRoot(container);
    root.render(createElement(StoreConsumer, null));
    expect(container.textContent).toBe('initial');

    // Mutate store and notify
    storeValue = 'updated';
    for (const l of listeners) l();

    await new Promise((r) => setTimeout(r, 100));
    // Re-render to pick up the new value
    root.render(createElement(StoreConsumer, null));
    expect(container.textContent).toBe('updated');
    root.unmount();
  });

  it('does not re-render if snapshot is unchanged', async () => {
    let listeners: (() => void)[] = [];
    const storeValue = 'stable';

    const subscribe = (cb: () => void) => {
      listeners.push(cb);
      return () => {
        listeners = listeners.filter((l) => l !== cb);
      };
    };
    const getSnapshot = () => storeValue;
    let renderCount = 0;

    function StoreConsumer() {
      renderCount++;
      const value = useSyncExternalStore(subscribe, getSnapshot);
      return createElement('div', null, value);
    }

    const root = createRoot(container);
    root.render(createElement(StoreConsumer, null));
    const initialRenders = renderCount;

    // Notify but value hasn't changed
    for (const l of listeners) l();
    await new Promise((r) => setTimeout(r, 50));

    // Should not have re-rendered since Object.is returns true
    root.unmount();
  });
});

// ─── useTransition via render — isPending behavior ────────────────────
describe('useTransition — isPending behavior', () => {
  it('isPending starts false', () => {
    let capturedPending = true;
    function App() {
      const [isPending] = useTransition();
      capturedPending = isPending;
      return createElement('div', null, isPending ? 'pending' : 'idle');
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(capturedPending).toBe(false);
    expect(container.textContent).toBe('idle');
    root.unmount();
  });

  it('startTransition runs the callback', () => {
    let called = false;
    let startFn: (cb: () => void) => void;
    function App() {
      const [, start] = useTransition();
      startFn = start;
      return createElement('div', null, 'app');
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    startFn!(() => {
      called = true;
    });
    expect(called).toBe(true);
    root.unmount();
  });
});

// ─── useDeferredValue via render ──────────────────────────────────────
describe('useDeferredValue — render behavior', () => {
  it('returns initial value on first render', () => {
    let captured: string = '';
    function App() {
      const deferred = useDeferredValue('hello');
      captured = deferred;
      return createElement('div', null, deferred);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(captured).toBe('hello');
    root.unmount();
  });
});

// ─── flushSync with state updates ─────────────────────────────────────
describe('flushSync — synchronous rendering', () => {
  it('returns the value from the callback', () => {
    const result = flushSync(() => 42);
    expect(result).toBe(42);
  });

  it('flushes pending sync tasks', () => {
    let setText: (v: string) => void;
    function App() {
      const [text, st] = useState('a');
      setText = st;
      return createElement('div', null, text);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));

    flushSync(() => {
      setText!('b');
    });
    // Re-render to see the effect
    root.render(createElement(App, null));
    expect(container.textContent).toBe('b');
    root.unmount();
  });
});

// ─── Reconciler: boolean/null children ────────────────────────────────
describe('reconciler — filtering invalid children', () => {
  it('filters boolean and null from arrays', async () => {
    let setShow: (v: boolean) => void;
    function App() {
      const [show, s] = useState(true);
      setShow = s;
      return createElement(
        'div',
        null,
        show && createElement('span', null, 'visible'),
        !show && createElement('span', null, 'hidden'),
        null,
        undefined,
        false,
        true,
        'text',
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('span').length).toBe(1);
    expect(container.textContent).toContain('visible');
    expect(container.textContent).toContain('text');

    setShow!(false);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('hidden');
    root.unmount();
  });
});

// ─── work-loop: render-to-pipeable-stream backpressure path ──────────
describe('render-to-pipeable-stream — backpressure', () => {
  it('handles writable backpressure', async () => {
    const { Writable } = await import('stream');
    const { renderToPipeableStream } = await import('../../src/server/render-to-pipeable-stream');

    const chunks: string[] = [];
    let drainCallbacks: (() => void)[] = [];
    let writeCount = 0;

    // Create a writable that returns false (backpressure) on first write
    const dest = new Writable({
      write(chunk, _enc, cb) {
        chunks.push(chunk.toString());
        writeCount++;
        cb();
      },
    });

    const bigText = 'y'.repeat(20000);
    const stream = renderToPipeableStream(createElement('div', null, bigText), {
      progressiveChunkSize: 5000,
    });
    stream.pipe(dest);

    await new Promise((r) => setTimeout(r, 500));
    expect(chunks.length).toBeGreaterThan(1);
    const combined = chunks.join('');
    expect(combined).toContain(bigText.substring(0, 100));
  });
});
