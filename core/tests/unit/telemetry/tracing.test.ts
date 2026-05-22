// ============================================================================
// Tests — Distributed Tracing
// ============================================================================

import { describe, it, expect, vi } from 'vitest';
import {
  generateTraceId,
  generateSpanId,
  parseTraceparent,
  formatTraceparent,
  startSpan,
  endSpan,
  createTracer,
  useTracing,
} from '../../../src/telemetry/tracing';

// ---------------------------------------------------------------------------
// ID generation
// ---------------------------------------------------------------------------

describe('generateTraceId', () => {
  it('produces a 32-character hex string', () => {
    const id = generateTraceId();
    expect(id).toHaveLength(32);
    expect(id).toMatch(/^[0-9a-f]{32}$/);
  });

  it('produces unique values', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateTraceId()));
    expect(ids.size).toBe(50);
  });
});

describe('generateSpanId', () => {
  it('produces a 16-character hex string', () => {
    const id = generateSpanId();
    expect(id).toHaveLength(16);
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('produces unique values', () => {
    const ids = new Set(Array.from({ length: 50 }, () => generateSpanId()));
    expect(ids.size).toBe(50);
  });
});

// ---------------------------------------------------------------------------
// W3C traceparent
// ---------------------------------------------------------------------------

describe('parseTraceparent', () => {
  it('parses a valid traceparent header', () => {
    const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    const ctx = parseTraceparent(header);
    expect(ctx).not.toBeNull();
    expect(ctx!.traceId).toBe('4bf92f3577b34da6a3ce929d0e0e4736');
    expect(ctx!.spanId).toBe('00f067aa0ba902b7');
    expect(ctx!.traceFlags).toBe('01');
  });

  it('returns null for an invalid header', () => {
    expect(parseTraceparent('')).toBeNull();
    expect(parseTraceparent('not-valid')).toBeNull();
    expect(parseTraceparent('00-0000-0000-00')).toBeNull();
  });

  it('returns null for all-zero trace ID', () => {
    const header = '00-00000000000000000000000000000000-00f067aa0ba902b7-01';
    expect(parseTraceparent(header)).toBeNull();
  });

  it('returns null for all-zero span ID', () => {
    const header = '00-4bf92f3577b34da6a3ce929d0e0e4736-0000000000000000-01';
    expect(parseTraceparent(header)).toBeNull();
  });
});

describe('formatTraceparent', () => {
  it('formats a TraceContext into a traceparent string', () => {
    const ctx = {
      traceId: '4bf92f3577b34da6a3ce929d0e0e4736',
      spanId: '00f067aa0ba902b7',
      traceFlags: '01',
    };
    expect(formatTraceparent(ctx)).toBe('00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01');
  });

  it('round-trips with parseTraceparent', () => {
    const original = '00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01';
    const ctx = parseTraceparent(original)!;
    expect(formatTraceparent(ctx)).toBe(original);
  });
});

// ---------------------------------------------------------------------------
// Spans
// ---------------------------------------------------------------------------

describe('startSpan', () => {
  it('creates a span with correct fields', () => {
    const span = startSpan('test-span');
    expect(span.name).toBe('test-span');
    expect(span.traceId).toMatch(/^[0-9a-f]{32}$/);
    expect(span.spanId).toMatch(/^[0-9a-f]{16}$/);
    expect(span.kind).toBe('internal');
    expect(span.status.code).toBe('unset');
    expect(span.startTime).toBeGreaterThan(0);
    expect(span.endTime).toBeUndefined();
    expect(span.attributes).toEqual({});
    expect(span.events).toEqual([]);
  });

  it('accepts options', () => {
    const span = startSpan('custom', {
      kind: 'server',
      traceId: 'aaaa'.repeat(8),
      parentSpanId: 'bbbb'.repeat(4),
      attributes: { foo: 'bar' },
    });
    expect(span.kind).toBe('server');
    expect(span.traceId).toBe('aaaa'.repeat(8));
    expect(span.parentSpanId).toBe('bbbb'.repeat(4));
    expect(span.attributes.foo).toBe('bar');
  });
});

describe('endSpan', () => {
  it('sets endTime on the span', () => {
    const span = startSpan('end-test');
    expect(span.endTime).toBeUndefined();
    endSpan(span);
    expect(span.endTime).toBeDefined();
    expect(span.endTime).toBeGreaterThanOrEqual(span.startTime);
  });
});

describe('Span events', () => {
  it('can be added to a span', () => {
    const span = startSpan('event-test');
    span.events.push({ name: 'checkpoint', timestamp: performance.now() });
    span.events.push({
      name: 'error',
      timestamp: performance.now(),
      attributes: { message: 'something failed' },
    });
    expect(span.events).toHaveLength(2);
    expect(span.events[0].name).toBe('checkpoint');
    expect(span.events[1].attributes?.message).toBe('something failed');
  });
});

describe('Span attributes', () => {
  it('can be set on a span', () => {
    const span = startSpan('attr-test');
    span.attributes['http.method'] = 'GET';
    span.attributes['http.status_code'] = 200;
    span.attributes['cache.hit'] = true;
    expect(span.attributes['http.method']).toBe('GET');
    expect(span.attributes['http.status_code']).toBe(200);
    expect(span.attributes['cache.hit']).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Tracer
// ---------------------------------------------------------------------------

describe('Tracer', () => {
  it('creates child spans with parentSpanId', () => {
    const tracer = createTracer({ serviceName: 'test-svc' });
    const parent = tracer.startSpan('parent');
    const child = tracer.startSpan('child');

    expect(child.parentSpanId).toBe(parent.spanId);
    expect(child.traceId).toBe(parent.traceId);
  });

  it('withSpan auto-ends span and restores active', () => {
    const tracer = createTracer({ serviceName: 'test-svc' });
    const outer = tracer.startSpan('outer');
    const inner = tracer.startSpan('inner');

    // At this point both outer and inner are on the stack, inner is active.
    expect(tracer.activeSpan()?.spanId).toBe(inner.spanId);

    // withSpan pushes the span, runs fn, then pops and ends it.
    let spanDuringWithSpan: string | undefined;
    tracer.withSpan(inner, () => {
      spanDuringWithSpan = tracer.activeSpan()?.spanId;
    });

    // After withSpan, inner should be ended and removed from the stack.
    expect(inner.endTime).toBeDefined();
    expect(spanDuringWithSpan).toBe(inner.spanId);
    // The outer span should now be active (inner was removed).
    expect(tracer.activeSpan()?.spanId).toBe(outer.spanId);
  });

  it('withSpan ends span even on error', () => {
    const tracer = createTracer({ serviceName: 'test-svc' });
    const span = tracer.startSpan('error-span');

    expect(() => {
      tracer.withSpan(span, () => {
        throw new Error('boom');
      });
    }).toThrow('boom');

    expect(span.endTime).toBeDefined();
    expect(span.status.code).toBe('error');
  });

  it('buffers spans for flush', () => {
    const tracer = createTracer({ serviceName: 'test-svc' });
    const span = tracer.startSpan('buffered');
    tracer.withSpan(span, () => {
      // no-op
    });

    expect(tracer.pendingSpans.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// useTracing hook
// ---------------------------------------------------------------------------

describe('useTracing', () => {
  it('creates a span via the tracer', async () => {
    let effectCalled = false;
    const cleanupFns: Array<() => void> = [];

    // Mock the hooks module — the factory must be self-contained
    vi.mock('../../../src/hooks/index', () => {
      const _cleanups: Array<() => void> = [];
      return {
        useEffect: (fn: () => void | (() => void)) => {
          const cleanup = fn();
          if (typeof cleanup === 'function') {
            _cleanups.push(cleanup);
          }
        },
        useRef: <T>(initial: T) => ({ current: initial }),
        __cleanups: _cleanups,
      };
    });

    // Dynamic import so the mock is applied
    const { useTracing: useTracingMocked, createTracer: createTracerMocked } =
      await import('../../../src/telemetry/tracing');
    const hooksMod = (await import('../../../src/hooks/index')) as unknown as {
      __cleanups: Array<() => void>;
    };

    const tracer = createTracerMocked({ serviceName: 'hook-test' });

    // Calling useTracing should invoke useEffect synchronously (via mock)
    useTracingMocked(tracer, 'TestComponent');

    // The tracer should have started a span
    const active = tracer.activeSpan();
    expect(active).toBeDefined();
    expect(active!.name).toBe('TestComponent');
    expect(active!.events.some((e: { name: string }) => e.name === 'mount')).toBe(true);

    // Simulate unmount
    hooksMod.__cleanups.forEach((fn) => fn());
  });
});
