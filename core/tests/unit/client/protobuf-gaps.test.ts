// ============================================================================
// Additional coverage tests for protobuf.ts — lines 333-383 (createGrpcWebClient)
// and 390-438 (useProto hook)
// ============================================================================

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createGrpcWebClient,
  defineMessage,
  encodeGrpcWebFrame,
  decodeVarint,
  useProto,
} from '../../../src/client/protobuf';
import type { MessageType, GrpcWebClient } from '../../../src/client/protobuf';
import { __setDispatcher } from '../../../src/hooks/index';

// ---------------------------------------------------------------------------
// Minimal message types used throughout
// ---------------------------------------------------------------------------

interface Ping {
  seq: number;
}

interface Pong {
  ack: number;
  message: string;
}

const PingMsg = defineMessage<Ping>('Ping', {
  seq: { tag: 1, type: 'uint32' },
});

const PongMsg = defineMessage<Pong>('Pong', {
  ack: { tag: 1, type: 'uint32' },
  message: { tag: 2, type: 'string' },
});

// ---------------------------------------------------------------------------
// Helper: build a valid gRPC-Web response body containing a single data frame
// ---------------------------------------------------------------------------

function makeGrpcResponse(msg: Uint8Array, trailerAfter = false): Uint8Array {
  const dataFrame = encodeGrpcWebFrame(msg, 0);
  if (!trailerAfter) {
    return dataFrame;
  }
  // Append a trailer frame (flags = 0x80, empty body)
  const trailerFrame = encodeGrpcWebFrame(new Uint8Array(0), 0x80);
  const combined = new Uint8Array(dataFrame.length + trailerFrame.length);
  combined.set(dataFrame, 0);
  combined.set(trailerFrame, dataFrame.length);
  return combined;
}

// ---------------------------------------------------------------------------
// createGrpcWebClient — happy paths
// ---------------------------------------------------------------------------

describe('createGrpcWebClient', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('sends a POST request with correct URL (trailing slash stripped)', async () => {
    const pong: Pong = { ack: 1, message: 'ok' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com/' });
    await client.unary('MyService', 'DoPing', PingMsg, PongMsg, { seq: 1 });

    expect(fetchMock).toHaveBeenCalledOnce();
    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/MyService/DoPing');
  });

  it('sets required gRPC-Web headers', async () => {
    const pong: Pong = { ack: 2, message: 'hi' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com' });
    await client.unary('Svc', 'Method', PingMsg, PongMsg, { seq: 2 });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Content-Type']).toBe('application/grpc-web+proto');
    expect(headers['Accept']).toBe('application/grpc-web+proto');
    expect(headers['X-Grpc-Web']).toBe('1');
  });

  it('merges extra headers from config', async () => {
    const pong: Pong = { ack: 3, message: 'auth' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({
      baseURL: 'https://api.example.com',
      headers: { Authorization: 'Bearer token123' },
    });
    await client.unary('Svc', 'Method', PingMsg, PongMsg, { seq: 3 });

    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    const headers = init.headers as Record<string, string>;
    expect(headers['Authorization']).toBe('Bearer token123');
    // Standard headers still present
    expect(headers['X-Grpc-Web']).toBe('1');
  });

  it('decodes the response message correctly', async () => {
    const pong: Pong = { ack: 42, message: 'world' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://rpc.example.com' });
    const result = await client.unary('Svc', 'DoIt', PingMsg, PongMsg, { seq: 10 });

    expect(result.ack).toBe(42);
    expect(result.message).toBe('world');
  });

  it('skips trailer frame (flags & 0x80) and returns data frame', async () => {
    // Response: trailer first (flags=0x80), then data frame — unusual but let's test
    // Actually the implementation iterates and returns on first non-trailer, so
    // put data first, then trailer.
    const pong: Pong = { ack: 7, message: 'trailer-test' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong), true);

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://rpc.example.com' });
    const result = await client.unary('Svc', 'DoIt', PingMsg, PongMsg, { seq: 7 });

    expect(result.ack).toBe(7);
    expect(result.message).toBe('trailer-test');
  });

  it('throws when response is not ok', async () => {
    fetchMock.mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com' });
    await expect(client.unary('Svc', 'Method', PingMsg, PongMsg, { seq: 1 })).rejects.toThrow(
      'gRPC-Web request failed: 503 Service Unavailable',
    );
  });

  it('throws when response contains only trailer frames (no data frame)', async () => {
    // Only a trailer frame — no data frame
    const trailerFrame = encodeGrpcWebFrame(new Uint8Array(0), 0x80);

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(trailerFrame.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com' });
    await expect(client.unary('Svc', 'Method', PingMsg, PongMsg, { seq: 1 })).rejects.toThrow(
      'No data frame found in gRPC-Web response',
    );
  });

  it('handles baseURL without trailing slash', async () => {
    const pong: Pong = { ack: 1, message: '' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com' });
    await client.unary('SvcA', 'MethodB', PingMsg, PongMsg, { seq: 1 });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/SvcA/MethodB');
  });

  it('handles baseURL with multiple trailing slashes', async () => {
    const pong: Pong = { ack: 1, message: '' };
    const responseBody = makeGrpcResponse(PongMsg.encode(pong));

    fetchMock.mockResolvedValue({
      ok: true,
      arrayBuffer: () => Promise.resolve(responseBody.buffer),
    });

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com///' });
    await client.unary('SvcA', 'MethodB', PingMsg, PongMsg, { seq: 1 });

    const [url] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.example.com/SvcA/MethodB');
  });

  it('propagates fetch network errors', async () => {
    fetchMock.mockRejectedValue(new Error('Network error'));

    const client = createGrpcWebClient({ baseURL: 'https://api.example.com' });
    await expect(client.unary('Svc', 'Method', PingMsg, PongMsg, { seq: 1 })).rejects.toThrow(
      'Network error',
    );
  });
});

// ---------------------------------------------------------------------------
// useProto hook
// ---------------------------------------------------------------------------

describe('useProto', () => {
  // We need to provide a dispatcher implementation that simulates React-like
  // hook state tracking for the hook to execute.

  function createTestDispatcher() {
    type Setter<T> = (action: T | ((prev: T) => T)) => void;
    const states: unknown[] = [];
    const setters: Setter<unknown>[] = [];
    let stateIndex = 0;

    const effects: Array<{ create: () => void | (() => void); deps?: readonly unknown[] }> = [];
    const callbacks: Map<(...args: unknown[]) => unknown, (...args: unknown[]) => unknown> =
      new Map();
    const refs: Array<{ current: unknown }> = [];
    let refIndex = 0;

    function useState<T>(initialState: T | (() => T)): [T, (action: T | ((prev: T) => T)) => void] {
      const idx = stateIndex++;
      if (states[idx] === undefined) {
        states[idx] =
          typeof initialState === 'function' ? (initialState as () => T)() : initialState;
        setters[idx] = (action) => {
          states[idx] =
            typeof action === 'function'
              ? (action as (prev: unknown) => unknown)(states[idx])
              : action;
        };
      }
      return [states[idx] as T, setters[idx] as Setter<T>];
    }

    function useEffect(create: () => void | (() => void), _deps?: readonly unknown[]): void {
      effects.push({ create, deps: _deps });
    }

    function useCallback<T extends (...args: unknown[]) => unknown>(
      callback: T,
      _deps: readonly unknown[],
    ): T {
      // Simple: always return the same callback identity (keyed by function reference)
      if (!callbacks.has(callback)) {
        callbacks.set(callback, callback);
      }
      return callbacks.get(callback) as T;
    }

    function useRef<T>(initialValue?: T): { current: T | undefined } {
      const idx = refIndex++;
      if (refs[idx] === undefined) {
        refs[idx] = { current: initialValue };
      }
      return refs[idx] as { current: T | undefined };
    }

    function runEffects() {
      for (const effect of effects) {
        effect.create();
      }
    }

    function reset() {
      states.length = 0;
      setters.length = 0;
      stateIndex = 0;
      effects.length = 0;
      callbacks.clear();
      refs.length = 0;
      refIndex = 0;
    }

    const dispatcher = {
      useState,
      useEffect,
      useContext: vi.fn(),
      useReducer: vi.fn(),
      useCallback,
      useMemo: vi.fn(),
      useRef,
      useImperativeHandle: vi.fn(),
      useLayoutEffect: vi.fn(),
      useDebugValue: vi.fn(),
      useId: vi.fn(),
      useDeferredValue: vi.fn(),
      useTransition: vi.fn(),
      useSyncExternalStore: vi.fn(),
      useInsertionEffect: vi.fn(),
    };

    return { dispatcher, runEffects, reset, states, effects };
  }

  afterEach(() => {
    __setDispatcher(null);
  });

  it('initialises with data=null, loading=false, error=null', () => {
    const { dispatcher } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockReturnValue(new Promise(() => {})), // never resolves
    };

    const result = useProto(mockClient, 'Svc', 'Method', PingMsg, PongMsg, { seq: 1 });

    expect(result.data).toBeNull();
    expect(result.loading).toBe(false);
    expect(result.error).toBeNull();
    expect(typeof result.refetch).toBe('function');
  });

  it('calls client.unary with correct arguments when refetch runs', async () => {
    const { dispatcher, runEffects } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const pong: Pong = { ack: 1, message: 'hi' };
    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockResolvedValue(pong),
    };

    useProto(mockClient, 'MySvc', 'MyMethod', PingMsg, PongMsg, { seq: 5 });
    runEffects();

    // Allow microtasks to settle
    await vi.waitFor(() => {
      expect(mockClient.unary).toHaveBeenCalledWith('MySvc', 'MyMethod', PingMsg, PongMsg, {
        seq: 5,
      });
    });
  });

  it('sets loading=true before request resolves', () => {
    const { dispatcher, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    let resolveUnary!: (v: Pong) => void;
    const pendingUnary = new Promise<Pong>((res) => {
      resolveUnary = res;
    });

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockReturnValue(pendingUnary),
    };

    const result = useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });
    result.refetch();

    // loading state (index 1) should be true
    expect(states[1]).toBe(true);

    // cleanup
    resolveUnary({ ack: 0, message: '' });
  });

  it('does not call unary when enabled=false', () => {
    const { dispatcher, runEffects } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const mockClient: GrpcWebClient = {
      unary: vi.fn(),
    };

    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 }, { enabled: false });
    runEffects();

    // refetch should be a no-op when disabled
    expect(mockClient.unary).not.toHaveBeenCalled();
  });

  it('sets data and loading=false on successful response', async () => {
    const { dispatcher, runEffects, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const pong: Pong = { ack: 99, message: 'done' };
    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockResolvedValue(pong),
    };

    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });
    runEffects();

    await vi.waitFor(() => {
      // data (index 0) should be set, loading (index 1) should be false
      expect(states[0]).toEqual(pong);
      expect(states[1]).toBe(false);
    });
  });

  it('sets error and loading=false on failed request', async () => {
    const { dispatcher, runEffects, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockRejectedValue(new Error('RPC failed')),
    };

    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });
    runEffects();

    await vi.waitFor(() => {
      // error (index 2) should be set
      expect((states[2] as Error)?.message).toBe('RPC failed');
      expect(states[1]).toBe(false);
    });
  });

  it('wraps non-Error rejections in an Error', async () => {
    const { dispatcher, runEffects, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockRejectedValue('plain string error'),
    };

    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });
    runEffects();

    await vi.waitFor(() => {
      expect(states[2]).toBeInstanceOf(Error);
      expect((states[2] as Error).message).toBe('plain string error');
    });
  });

  it('does not update state after unmount (mountedRef = false)', async () => {
    const { dispatcher, effects, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    let resolveUnary!: (v: Pong) => void;
    const pendingUnary = new Promise<Pong>((res) => {
      resolveUnary = res;
    });

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockReturnValue(pendingUnary),
    };

    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });

    // Run the effect and capture the cleanup
    let cleanup: (() => void) | undefined;
    for (const effect of effects) {
      const result = effect.create();
      if (typeof result === 'function') cleanup = result;
    }

    // Trigger cleanup (unmount): sets mountedRef.current = false
    cleanup?.();

    // Now resolve the unary — state setters should NOT be called
    const beforeData = states[0];
    const beforeLoading = states[1];
    resolveUnary({ ack: 5, message: 'late' });

    // Wait a tick for microtasks
    await new Promise((r) => setTimeout(r, 0));

    // States should be unchanged because mountedRef.current is false
    expect(states[0]).toBe(beforeData);
    expect(states[1]).toBe(beforeLoading);
  });

  it('returns refetch function that re-triggers unary', async () => {
    const { dispatcher, states } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const pong: Pong = { ack: 1, message: '' };
    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockResolvedValue(pong),
    };

    const result = useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });

    // Call refetch directly (useEffect auto-calls it, but we verify manual call too)
    result.refetch();

    await vi.waitFor(() => {
      expect(mockClient.unary).toHaveBeenCalled();
    });
  });

  it('uses opts.enabled=true by default (undefined opts)', () => {
    const { dispatcher, runEffects } = createTestDispatcher();
    __setDispatcher(dispatcher);

    const mockClient: GrpcWebClient = {
      unary: vi.fn().mockReturnValue(new Promise(() => {})),
    };

    // No opts passed at all
    useProto(mockClient, 'Svc', 'M', PingMsg, PongMsg, { seq: 1 });
    runEffects();

    expect(mockClient.unary).toHaveBeenCalled();
  });
});

// ---------------------------------------------------------------------------
// decodeVarint — error paths (coverage gaps)
// ---------------------------------------------------------------------------

describe('decodeVarint error paths', () => {
  it('throws Varint too long when shift reaches 35', () => {
    // Build a 6-byte varint where every byte has the MSB set (continuation)
    const bytes = new Uint8Array([0x80, 0x80, 0x80, 0x80, 0x80, 0x00]);
    expect(() => decodeVarint(bytes, 0)).toThrow('Varint too long');
  });
});
