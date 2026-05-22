/**
 * Additional tracing tests to close coverage gaps.
 */
import { describe, it, expect, vi } from 'vitest';
import { createTracer, startSpan, endSpan } from '../../../src/telemetry/tracing';

describe('createTracer — advanced', () => {
  it('flush is no-op when buffer is empty', async () => {
    const tracer = createTracer({ serviceName: 'test' });
    await tracer.flush();
  });

  it('flush exports to endpoint when configured', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const tracer = createTracer({
      serviceName: 'test',
      endpoint: 'https://example.com/v1/traces',
    });

    const span = tracer.startSpan('test-op');
    tracer.withSpan(span, () => 'result');

    await tracer.flush();
    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/v1/traces',
      expect.objectContaining({ method: 'POST' }),
    );

    vi.unstubAllGlobals();
  });

  it('withSpan handles async functions — success', async () => {
    const tracer = createTracer({ serviceName: 'test' });
    const span = tracer.startSpan('async-op');
    const result = await tracer.withSpan(span, async () => 42);
    expect(result).toBe(42);
  });

  it('withSpan handles async functions — error', async () => {
    const tracer = createTracer({ serviceName: 'test' });
    const span = tracer.startSpan('async-fail');
    await expect(
      tracer.withSpan(span, async () => {
        throw new Error('boom');
      }),
    ).rejects.toThrow('boom');
  });

  it('withSpan handles sync error', () => {
    const tracer = createTracer({ serviceName: 'test' });
    const span = tracer.startSpan('sync-fail');
    expect(() =>
      tracer.withSpan(span, () => {
        throw new Error('sync-boom');
      }),
    ).toThrow('sync-boom');
  });

  it('withSpan pushes external span onto stack', () => {
    const tracer = createTracer({ serviceName: 'test' });
    // Create span manually (not via tracer.startSpan, so it's not on the stack)
    const span = startSpan('external', { kind: 'internal' });
    const result = tracer.withSpan(span, () => 'done');
    expect(result).toBe('done');
  });

  it('startSpan with explicit traceId', () => {
    const tracer = createTracer({ serviceName: 'test' });
    const span = tracer.startSpan('op', { traceId: 'abcd1234abcd1234abcd1234abcd1234' });
    expect(span.traceId).toBe('abcd1234abcd1234abcd1234abcd1234');
  });

  it('startSpan inherits traceId from active span', () => {
    const tracer = createTracer({ serviceName: 'test' });
    const parent = tracer.startSpan('parent');
    // While parent is on the stack, child inherits traceId
    const child = tracer.startSpan('child');
    expect(child.traceId).toBe(parent.traceId);
    expect(child.parentSpanId).toBe(parent.spanId);
  });

  it('pendingSpans returns buffered spans', () => {
    const tracer = createTracer({ serviceName: 'test' });
    expect(tracer.pendingSpans).toHaveLength(0);
    const span = tracer.startSpan('op');
    tracer.withSpan(span, () => {});
    expect(tracer.pendingSpans.length).toBeGreaterThan(0);
  });

  it('activeSpan returns current span', () => {
    const tracer = createTracer({ serviceName: 'test' });
    expect(tracer.activeSpan()).toBeUndefined();
    const span = tracer.startSpan('op');
    expect(tracer.activeSpan()).toBe(span);
  });
});
