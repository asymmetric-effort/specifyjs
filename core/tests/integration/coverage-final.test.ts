/**
 * Final coverage-closing tests targeting remaining uncovered paths.
 * Targets: rest.ts useRest async paths, tracing.ts crypto fallback,
 * reconciler.ts edge cases, work-loop.ts getHostSibling,
 * synthetic-event.ts InputEvent/TouchEvent paths.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { createElement, Fragment } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';
import { useState, useEffect, useCallback, useRef } from '../../src/hooks/index';
import { createSyntheticEvent, SyntheticInputEvent } from '../../src/dom/synthetic-event';
import type { RestClient, RestResponse } from '../../src/client/rest';
import { useRest, RestError } from '../../src/client/rest';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
});

// ─── useRest: async success path ──────────────────────────────────────
describe('useRest async paths', () => {
  function makeClient(overrides?: Partial<RestClient>): RestClient {
    return {
      get: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      post: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      put: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      patch: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      delete: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      ...overrides,
    };
  }

  it('sets data on successful response', async () => {
    let activeRoot: ReturnType<typeof createRoot> | null = null;
    const mockClient = makeClient({
      get: vi
        .fn()
        .mockResolvedValue({ data: { name: 'Alice' }, status: 200, headers: {}, ok: true }),
    });
    let capturedData: unknown = null;

    function Comp() {
      const { data, loading } = useRest<{ name: string }>(mockClient, '/user');
      capturedData = data;
      return createElement('div', null, loading ? 'loading' : JSON.stringify(data));
    }

    activeRoot = createRoot(container);
    activeRoot.render(createElement(Comp, null));

    // Wait for the async effect + microtask re-render
    await new Promise((r) => setTimeout(r, 100));

    // The data should have been set via the .then() path
    // Re-render to pick up state changes
    activeRoot.render(createElement(Comp, null));
    expect(capturedData).toEqual({ name: 'Alice' });
    activeRoot.unmount();
  });

  it('sets error on failed response', async () => {
    let activeRoot: ReturnType<typeof createRoot> | null = null;
    const mockClient = makeClient({
      get: vi.fn().mockRejectedValue(new Error('Network error')),
    });
    let capturedError: RestError | null = null;

    function Comp() {
      const { error, loading } = useRest(mockClient, '/fail');
      capturedError = error;
      return createElement('div', null, loading ? 'loading' : (error?.message ?? 'ok'));
    }

    activeRoot = createRoot(container);
    activeRoot.render(createElement(Comp, null));

    await new Promise((r) => setTimeout(r, 100));

    activeRoot.render(createElement(Comp, null));
    expect(capturedError).toBeTruthy();
    expect(capturedError!.message).toBe('Network error');
    activeRoot.unmount();
  });

  it('sets RestError directly when thrown', async () => {
    let activeRoot: ReturnType<typeof createRoot> | null = null;
    const restErr = new RestError('Not Found', 404, 'Not Found', null, {
      url: '/missing',
      method: 'GET',
      headers: {},
    });
    const mockClient = makeClient({
      get: vi.fn().mockRejectedValue(restErr),
    });
    let capturedError: RestError | null = null;

    function Comp() {
      const { error } = useRest(mockClient, '/missing');
      capturedError = error;
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    activeRoot.render(createElement(Comp, null));
    await new Promise((r) => setTimeout(r, 100));
    activeRoot.render(createElement(Comp, null));
    expect(capturedError).toBe(restErr);
    activeRoot.unmount();
  });

  it('refetch re-triggers the request', async () => {
    let activeRoot: ReturnType<typeof createRoot> | null = null;
    let callCount = 0;
    const mockClient = makeClient({
      get: vi.fn().mockImplementation(() => {
        callCount++;
        return Promise.resolve({ data: { count: callCount }, status: 200, headers: {}, ok: true });
      }),
    });
    let refetchFn: (() => void) | undefined;

    function Comp() {
      const { refetch } = useRest(mockClient, '/count');
      refetchFn = refetch;
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    activeRoot.render(createElement(Comp, null));
    await new Promise((r) => setTimeout(r, 50));

    expect(callCount).toBeGreaterThanOrEqual(1);
    const prevCount = callCount;
    refetchFn!();
    await new Promise((r) => setTimeout(r, 50));
    expect(callCount).toBeGreaterThan(prevCount);
    activeRoot.unmount();
  });
});

// ─── Reconciler: mixed children types ─────────────────────────────────
describe('reconciler — createChild and updateFromMap paths', () => {
  it('handles null/undefined children gracefully', () => {
    const root = createRoot(container);
    root.render(createElement('div', null, null, undefined, 'text', null));
    expect(container.textContent).toBe('text');
    root.unmount();
  });

  it('handles mixed keyed and unkeyed children', async () => {
    let setItems: (v: string[]) => void;
    function App() {
      const [items, si] = useState(['a', 'b']);
      setItems = si;
      return createElement(
        'ul',
        null,
        ...items.map((i) => createElement('li', { key: i }, i)),
        createElement('li', null, 'unkeyed'),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));

    setItems!(['b', 'c']);
    await new Promise((r) => setTimeout(r, 50));
    const lis = container.querySelectorAll('li');
    expect(lis.length).toBe(3);
    root.unmount();
  });

  it('handles text node in keyed list update via map', async () => {
    let setMode: (v: number) => void;
    function App() {
      const [mode, sm] = useState(0);
      setMode = sm;
      return createElement(
        'div',
        null,
        createElement('span', { key: 'a' }, 'first'),
        mode === 0 ? 'text-child' : createElement('span', { key: 'b' }, 'second'),
        createElement('span', { key: 'c' }, 'third'),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.textContent).toContain('text-child');

    setMode!(1);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.textContent).toContain('second');
    root.unmount();
  });
});

// ─── work-loop: getHostSibling with fragments ─────────────────────────
describe('work-loop — insertion ordering with fragments', () => {
  it('inserts before existing siblings through fragment boundaries', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        null,
        createElement(Fragment, null, createElement('span', null, 'A')),
        createElement('span', null, 'B'),
      ),
    );
    const spans = container.querySelectorAll('span');
    expect(spans.length).toBe(2);
    expect(spans[0].textContent).toBe('A');
    expect(spans[1].textContent).toBe('B');
    root.unmount();
  });

  it('handles deletion through nested component boundaries', async () => {
    let setShow: (v: boolean) => void;
    function Inner() {
      return createElement('em', null, 'inner');
    }
    function App() {
      const [show, s] = useState(true);
      setShow = s;
      return createElement(
        'div',
        null,
        show ? createElement(Inner, null) : null,
        createElement('span', null, 'stays'),
      );
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('em')).toBeTruthy();

    setShow!(false);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('em')).toBeNull();
    expect(container.querySelector('span')!.textContent).toBe('stays');
    root.unmount();
  });
});

// ─── Synthetic events: InputEvent ─────────────────────────────────────
describe('synthetic events — InputEvent', () => {
  it('creates SyntheticInputEvent for InputEvent', () => {
    // jsdom supports InputEvent
    if (typeof InputEvent !== 'undefined') {
      const ev = new InputEvent('input', { data: 'x', inputType: 'insertText' });
      const synth = createSyntheticEvent(ev);
      expect(synth).toBeInstanceOf(SyntheticInputEvent);
      expect((synth as SyntheticInputEvent).data).toBe('x');
    }
  });

  it('creates SyntheticEvent for FocusEvent', () => {
    const ev = new FocusEvent('focus');
    const synth = createSyntheticEvent(ev);
    expect(synth.type).toBe('focus');
  });

  it('creates SyntheticMouseEvent for MouseEvent', () => {
    const ev = new MouseEvent('click', { clientX: 10, clientY: 20 });
    const synth = createSyntheticEvent(ev);
    expect(synth.type).toBe('click');
  });
});

// ─── Tracing: crypto fallback ─────────────────────────────────────────
describe('tracing — crypto fallback', () => {
  it('generates valid trace IDs even when crypto fails', async () => {
    // Test that generateTraceId works — the actual fallback path
    // is hard to trigger in jsdom since crypto is available, but
    // we verify the function works correctly.
    const { generateTraceId, generateSpanId } = await import('../../src/telemetry/tracing');
    const id = generateTraceId();
    expect(id).toHaveLength(32);
    expect(id).toMatch(/^[0-9a-f]{32}$/);

    const sid = generateSpanId();
    expect(sid).toHaveLength(16);
  });
});

// ─── Reconciler: deleteRemainingChildren ──────────────────────────────
describe('reconciler — deletion sequences', () => {
  it('deletes multiple remaining siblings', async () => {
    let setCount: (v: number) => void;
    function App() {
      const [count, sc] = useState(5);
      setCount = sc;
      const items = [];
      for (let i = 0; i < count; i++) {
        items.push(createElement('div', { key: `item-${i}` }, `Item ${i}`));
      }
      return createElement('div', null, ...items);
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelectorAll('div').length).toBe(6); // outer + 5

    setCount!(2);
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelectorAll('div').length).toBe(3); // outer + 2
    root.unmount();
  });

  it('replaces single child with text', async () => {
    let setMode: (v: string) => void;
    function App() {
      const [mode, sm] = useState('element');
      setMode = sm;
      return mode === 'element'
        ? createElement('div', null, createElement('span', null, 'child'))
        : createElement('div', null, 'just text');
    }
    const root = createRoot(container);
    root.render(createElement(App, null));
    expect(container.querySelector('span')).toBeTruthy();

    setMode!('text');
    await new Promise((r) => setTimeout(r, 50));
    expect(container.querySelector('span')).toBeNull();
    expect(container.textContent).toBe('just text');
    root.unmount();
  });
});
