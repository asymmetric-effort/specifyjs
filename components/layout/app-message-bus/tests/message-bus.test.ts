// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, vi } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import {
  MessageBusProvider,
  useMessageBus,
  useChannel,
  AppContextProvider,
  useAppId,
} from '../src/index';
import type { AppMessage, MessageBusContextValue } from '../src/index';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

async function flush(): Promise<void> {
  for (let i = 0; i < 4; i++) {
    await new Promise<void>((r) => queueMicrotask(r));
  }
}

/**
 * Sets up a MessageBusProvider with two apps (Inspector components).
 * Each app has its own AppContext with a unique appId.
 * Returns accessors for each app's bus context.
 */
function setup(opts?: { appAId?: string; appBId?: string }) {
  const appAId = opts?.appAId || 'app-a';
  const appBId = opts?.appBId || 'app-b';
  let busA: MessageBusContextValue = null as unknown as MessageBusContextValue;
  let busB: MessageBusContextValue = null as unknown as MessageBusContextValue;

  function InspectorA() {
    busA = useMessageBus();
    return createElement('div', { id: 'inspector-a' }, 'A');
  }

  function InspectorB() {
    busB = useMessageBus();
    return createElement('div', { id: 'inspector-b' }, 'B');
  }

  const root = createRoot(container);
  root.render(
    createElement(MessageBusProvider, null,
      createElement(AppContextProvider, { appId: appAId },
        createElement(InspectorA, null),
      ),
      createElement(AppContextProvider, { appId: appBId },
        createElement(InspectorB, null),
      ),
    ),
  );

  return {
    getBusA: () => busA,
    getBusB: () => busB,
    flush,
    root,
    appAId,
    appBId,
  };
}

/**
 * Sets up a single app with MessageBus.
 */
function setupSingle(appId: string = 'single-app') {
  let bus: MessageBusContextValue = null as unknown as MessageBusContextValue;

  function Inspector() {
    bus = useMessageBus();
    return createElement('div', { id: 'inspector' }, 'ok');
  }

  const root = createRoot(container);
  root.render(
    createElement(MessageBusProvider, null,
      createElement(AppContextProvider, { appId },
        createElement(Inspector, null),
      ),
    ),
  );

  return { getBus: () => bus, flush, root };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('MessageBusProvider', () => {
  it('renders children', () => {
    setupSingle();
    expect(container.querySelector('#inspector')).not.toBeNull();
  });

  it('provides a MessageBusContext with publish, subscribe, subscribeAll', () => {
    const { getBus } = setupSingle();
    const bus = getBus();
    expect(typeof bus.publish).toBe('function');
    expect(typeof bus.subscribe).toBe('function');
    expect(typeof bus.subscribeAll).toBe('function');
  });
});

describe('AppContextProvider', () => {
  it('provides appId to descendants', () => {
    let capturedId = '';
    function Inspector() {
      capturedId = useAppId();
      return createElement('div', null, capturedId);
    }
    const root = createRoot(container);
    root.render(
      createElement(AppContextProvider, { appId: 'test-app' },
        createElement(Inspector, null),
      ),
    );
    expect(capturedId).toBe('test-app');
  });

  it('provides empty string when no AppContext is set', () => {
    let capturedId = '';
    function Inspector() {
      capturedId = useAppId();
      return createElement('div', null, capturedId);
    }
    const root = createRoot(container);
    root.render(createElement(Inspector, null));
    expect(capturedId).toBe('');
  });
});

describe('publish/subscribe', () => {
  it('delivers broadcast message to other apps', () => {
    const { getBusA, getBusB, appBId } = setup();
    const received: AppMessage[] = [];
    getBusB().subscribe('test-channel', (msg: AppMessage) => {
      received.push(msg);
    });
    getBusA().publish('test-channel', { value: 42 });
    expect(received.length).toBe(1);
    expect(received[0].channel).toBe('test-channel');
    expect(received[0].payload).toEqual({ value: 42 });
    expect(received[0].from).toBe('app-a');
  });

  it('does NOT deliver broadcast to the sender', () => {
    const { getBusA } = setup();
    const received: AppMessage[] = [];
    getBusA().subscribe('ch', (msg: AppMessage) => {
      received.push(msg);
    });
    getBusA().publish('ch', 'hello');
    expect(received.length).toBe(0);
  });

  it('delivers targeted message only to the specified app', () => {
    const { getBusA, getBusB, appBId } = setup();
    const receivedA: AppMessage[] = [];
    const receivedB: AppMessage[] = [];
    getBusA().subscribe('ch', (msg: AppMessage) => { receivedA.push(msg); });
    getBusB().subscribe('ch', (msg: AppMessage) => { receivedB.push(msg); });
    getBusA().publish('ch', 'targeted', appBId);
    expect(receivedB.length).toBe(1);
    expect(receivedB[0].to).toBe(appBId);
    // app-a should not receive its own targeted message
    expect(receivedA.length).toBe(0);
  });

  it('does not deliver targeted message to wrong app', () => {
    const { getBusA, getBusB, appAId } = setup({ appAId: 'x', appBId: 'y' });
    const received: AppMessage[] = [];
    getBusB().subscribe('ch', (msg: AppMessage) => { received.push(msg); });
    // Target app-a (id: 'x'), not app-b (id: 'y')
    getBusA().publish('ch', 'for-x-only', 'x');
    expect(received.length).toBe(0);
  });

  it('filters by channel', () => {
    const { getBusA, getBusB } = setup();
    const received: AppMessage[] = [];
    getBusB().subscribe('alpha', (msg: AppMessage) => { received.push(msg); });
    getBusA().publish('beta', 'wrong-channel');
    expect(received.length).toBe(0);
    getBusA().publish('alpha', 'right-channel');
    expect(received.length).toBe(1);
  });

  it('delivers messages synchronously within the same tick', () => {
    const { getBusA, getBusB } = setup();
    const order: string[] = [];
    getBusB().subscribe('sync', () => { order.push('handler'); });
    order.push('before');
    getBusA().publish('sync', null);
    order.push('after');
    expect(order).toEqual(['before', 'handler', 'after']);
  });

  it('delivers to multiple subscribers in registration order', () => {
    const { getBusA, getBusB } = setup();
    const order: number[] = [];
    getBusB().subscribe('ch', () => { order.push(1); });
    getBusB().subscribe('ch', () => { order.push(2); });
    getBusB().subscribe('ch', () => { order.push(3); });
    getBusA().publish('ch', null);
    expect(order).toEqual([1, 2, 3]);
  });

  it('includes timestamp in message', () => {
    const { getBusA, getBusB } = setup();
    let msg: AppMessage | null = null;
    getBusB().subscribe('ch', (m: AppMessage) => { msg = m; });
    const before = Date.now();
    getBusA().publish('ch', 'data');
    const after = Date.now();
    expect(msg).not.toBeNull();
    expect(msg!.timestamp).toBeGreaterThanOrEqual(before);
    expect(msg!.timestamp).toBeLessThanOrEqual(after);
  });

  it('sets to to null for broadcast messages', () => {
    const { getBusA, getBusB } = setup();
    let msg: AppMessage | null = null;
    getBusB().subscribe('ch', (m: AppMessage) => { msg = m; });
    getBusA().publish('ch', 'data');
    expect(msg!.to).toBeNull();
  });
});

describe('unsubscribe', () => {
  it('returns an unsubscribe function', () => {
    const { getBusA } = setup();
    const unsub = getBusA().subscribe('ch', () => {});
    expect(typeof unsub).toBe('function');
  });

  it('stops delivering messages after unsubscribe', () => {
    const { getBusA, getBusB } = setup();
    const received: AppMessage[] = [];
    const unsub = getBusB().subscribe('ch', (msg: AppMessage) => { received.push(msg); });
    getBusA().publish('ch', 'first');
    expect(received.length).toBe(1);
    unsub();
    getBusA().publish('ch', 'second');
    expect(received.length).toBe(1);
  });

  it('does not affect other subscribers when one unsubscribes', () => {
    const { getBusA, getBusB } = setup();
    const r1: AppMessage[] = [];
    const r2: AppMessage[] = [];
    const unsub1 = getBusB().subscribe('ch', (msg: AppMessage) => { r1.push(msg); });
    getBusB().subscribe('ch', (msg: AppMessage) => { r2.push(msg); });
    unsub1();
    getBusA().publish('ch', 'data');
    expect(r1.length).toBe(0);
    expect(r2.length).toBe(1);
  });

  it('is idempotent (calling unsubscribe multiple times is safe)', () => {
    const { getBusA, getBusB } = setup();
    const received: AppMessage[] = [];
    const unsub = getBusB().subscribe('ch', (msg: AppMessage) => { received.push(msg); });
    unsub();
    unsub();
    unsub();
    getBusA().publish('ch', 'data');
    expect(received.length).toBe(0);
  });
});

describe('subscribeAll', () => {
  it('receives all messages regardless of channel', () => {
    const { getBusA, getBusB } = setup();
    const received: AppMessage[] = [];
    getBusA().subscribeAll((msg: AppMessage) => { received.push(msg); });
    getBusA().publish('alpha', 'a');
    getBusB().publish('beta', 'b');
    expect(received.length).toBe(2);
    expect(received[0].channel).toBe('alpha');
    expect(received[1].channel).toBe('beta');
  });

  it('receives messages even from the same sender (debug use)', () => {
    const { getBusA } = setup();
    const received: AppMessage[] = [];
    getBusA().subscribeAll((msg: AppMessage) => { received.push(msg); });
    getBusA().publish('ch', 'self');
    // subscribeAll is for debugging; it gets everything
    expect(received.length).toBe(1);
  });

  it('returns unsubscribe function that works', () => {
    const { getBusA } = setup();
    const received: AppMessage[] = [];
    const unsub = getBusA().subscribeAll((msg: AppMessage) => { received.push(msg); });
    getBusA().publish('ch', 'first');
    expect(received.length).toBe(1);
    unsub();
    getBusA().publish('ch', 'second');
    expect(received.length).toBe(1);
  });

  it('receives targeted messages too', () => {
    const { getBusA, appBId } = setup();
    const received: AppMessage[] = [];
    getBusA().subscribeAll((msg: AppMessage) => { received.push(msg); });
    getBusA().publish('ch', 'targeted-msg', appBId);
    expect(received.length).toBe(1);
    expect(received[0].to).toBe(appBId);
  });
});

describe('useChannel', () => {
  it('subscribes to a channel and receives messages', async () => {
    const received: AppMessage[] = [];

    function AppA() {
      const bus = useMessageBus();
      // Publish on first render
      bus.publish('output', 'hello from A');
      return createElement('div', null, 'A');
    }

    function AppB() {
      useChannel('output', (msg: AppMessage) => {
        received.push(msg);
      });
      return createElement('div', null, 'B');
    }

    const root = createRoot(container);
    root.render(
      createElement(MessageBusProvider, null,
        createElement(AppContextProvider, { appId: 'appB' },
          createElement(AppB, null),
        ),
        createElement(AppContextProvider, { appId: 'appA' },
          createElement(AppA, null),
        ),
      ),
    );

    await flush();
    expect(received.length).toBe(1);
    expect(received[0].payload).toBe('hello from A');
  });
});

describe('multiple channels', () => {
  it('supports independent subscriptions across multiple channels', () => {
    const { getBusA, getBusB } = setup();
    const r1: AppMessage[] = [];
    const r2: AppMessage[] = [];
    getBusB().subscribe('ch1', (msg: AppMessage) => { r1.push(msg); });
    getBusB().subscribe('ch2', (msg: AppMessage) => { r2.push(msg); });
    getBusA().publish('ch1', 'one');
    getBusA().publish('ch2', 'two');
    getBusA().publish('ch1', 'three');
    expect(r1.length).toBe(2);
    expect(r2.length).toBe(1);
  });

  it('unsubscribing from one channel does not affect another', () => {
    const { getBusA, getBusB } = setup();
    const r1: AppMessage[] = [];
    const r2: AppMessage[] = [];
    const unsub1 = getBusB().subscribe('ch1', (msg: AppMessage) => { r1.push(msg); });
    getBusB().subscribe('ch2', (msg: AppMessage) => { r2.push(msg); });
    unsub1();
    getBusA().publish('ch1', 'gone');
    getBusA().publish('ch2', 'here');
    expect(r1.length).toBe(0);
    expect(r2.length).toBe(1);
  });
});

describe('edge cases', () => {
  it('handles publishing with no subscribers', () => {
    const { getBusA } = setup();
    // Should not throw
    expect(() => getBusA().publish('empty', 'data')).not.toThrow();
  });

  it('handles publishing with empty channel name', () => {
    const { getBusA, getBusB } = setup();
    const received: AppMessage[] = [];
    getBusB().subscribe('', (msg: AppMessage) => { received.push(msg); });
    getBusA().publish('', 'empty-channel');
    expect(received.length).toBe(1);
  });

  it('handles various payload types', () => {
    const { getBusA, getBusB } = setup();
    const received: unknown[] = [];
    getBusB().subscribe('ch', (msg: AppMessage) => { received.push(msg.payload); });
    getBusA().publish('ch', null);
    getBusA().publish('ch', 42);
    getBusA().publish('ch', 'string');
    getBusA().publish('ch', { nested: { value: true } });
    getBusA().publish('ch', [1, 2, 3]);
    expect(received.length).toBe(5);
    expect(received[0]).toBeNull();
    expect(received[1]).toBe(42);
    expect(received[2]).toBe('string');
    expect(received[3]).toEqual({ nested: { value: true } });
    expect(received[4]).toEqual([1, 2, 3]);
  });

  it('subscriber can publish a message from within handler', () => {
    const { getBusA, getBusB } = setup();
    const received: string[] = [];
    // B subscribes to 'trigger' and publishes to 'response'
    getBusB().subscribe('trigger', () => {
      getBusB().publish('response', 'pong');
    });
    // A subscribes to 'response'
    getBusA().subscribe('response', (msg: AppMessage) => {
      received.push(msg.payload as string);
    });
    getBusA().publish('trigger', 'ping');
    expect(received.length).toBe(1);
    expect(received[0]).toBe('pong');
  });

  it('three apps can communicate independently', () => {
    let busA: MessageBusContextValue;
    let busB: MessageBusContextValue;
    let busC: MessageBusContextValue;

    function AppA() { busA = useMessageBus(); return null; }
    function AppB() { busB = useMessageBus(); return null; }
    function AppC() { busC = useMessageBus(); return null; }

    const root = createRoot(container);
    root.render(
      createElement(MessageBusProvider, null,
        createElement(AppContextProvider, { appId: 'a' }, createElement(AppA, null)),
        createElement(AppContextProvider, { appId: 'b' }, createElement(AppB, null)),
        createElement(AppContextProvider, { appId: 'c' }, createElement(AppC, null)),
      ),
    );

    const rB: string[] = [];
    const rC: string[] = [];
    busB!.subscribe('ch', (msg: AppMessage) => { rB.push(msg.payload as string); });
    busC!.subscribe('ch', (msg: AppMessage) => { rC.push(msg.payload as string); });

    busA!.publish('ch', 'broadcast');
    expect(rB.length).toBe(1);
    expect(rC.length).toBe(1);

    // Targeted to b only
    busA!.publish('ch', 'for-b', 'b');
    expect(rB.length).toBe(2);
    expect(rC.length).toBe(1);
  });
});
