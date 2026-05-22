/**
 * Additional metrics tests to close coverage gaps.
 */
import { describe, it, expect, vi } from 'vitest';
import {
  createMeterProvider,
  formatOtlpTraces,
  exportToEndpoint,
} from '../../../src/telemetry/metrics';
import { startSpan, endSpan } from '../../../src/telemetry/tracing';

describe('formatOtlpTraces — edge cases', () => {
  it('includes service.version when provided', () => {
    const span = startSpan('test-span', 'trace123', undefined, 'internal');
    endSpan(span);
    const payload = formatOtlpTraces([span], 'my-service', '1.2.3');
    const resource = (payload as any).resourceSpans[0].resource;
    const attrs = resource.attributes;
    expect(attrs).toContainEqual({ key: 'service.version', value: { stringValue: '1.2.3' } });
  });

  it('handles span with no endTime (outputs 0)', () => {
    const span = startSpan('test-span', 'trace456', undefined, 'server');
    // Don't call endSpan — endTime remains undefined
    const payload = formatOtlpTraces([span]);
    const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
    expect(otlpSpan.endTimeUnixNano).toBe('0');
  });

  it('maps span kind correctly', () => {
    for (const kind of ['internal', 'server', 'client', 'producer', 'consumer'] as const) {
      const span = startSpan(`test-${kind}`, 'trace789', undefined, kind);
      endSpan(span);
      const payload = formatOtlpTraces([span]);
      const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
      expect(otlpSpan.kind).toBeGreaterThanOrEqual(1);
      expect(otlpSpan.kind).toBeLessThanOrEqual(5);
    }
  });

  it('handles unknown span kind', () => {
    const span = startSpan('test-unknown', 'traceabc', undefined, 'unknown' as any);
    endSpan(span);
    const payload = formatOtlpTraces([span]);
    const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
    expect(otlpSpan.kind).toBe(1); // Fallback
  });

  it('serializes span events with attributes', () => {
    const span = startSpan('test-events', 'tracedef', undefined, 'internal');
    span.events.push({
      name: 'custom-event',
      timestamp: 100,
      attributes: { key1: 'val1', key2: 42 },
    });
    endSpan(span);
    const payload = formatOtlpTraces([span]);
    const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
    const event = otlpSpan.events.find((e: any) => e.name === 'custom-event');
    expect(event.attributes).toContainEqual({ key: 'key1', value: { stringValue: 'val1' } });
    expect(event.attributes).toContainEqual({ key: 'key2', value: { intValue: 42 } });
  });

  it('handles boolean attributes via toOtlpAttributes', () => {
    const span = startSpan('test-bool', 'traceghi', undefined, 'internal');
    span.attributes = { enabled: true as any, name: 'test' };
    endSpan(span);
    const payload = formatOtlpTraces([span]);
    const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
    expect(otlpSpan.attributes).toContainEqual({ key: 'enabled', value: { boolValue: true } });
  });

  it('handles error status code', () => {
    const span = startSpan('test-error', 'tracejkl', undefined, 'internal');
    span.status = { code: 'error', message: 'something broke' };
    endSpan(span);
    const payload = formatOtlpTraces([span]);
    const otlpSpan = (payload as any).resourceSpans[0].scopeSpans[0].spans[0];
    expect(otlpSpan.status.code).toBe(2);
    expect(otlpSpan.status.message).toBe('something broke');
  });
});

describe('exportToEndpoint', () => {
  it('sends POST request to endpoint', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await exportToEndpoint('https://example.com/api', { 'X-Key': 'abc' }, { data: 'test' });

    expect(mockFetch).toHaveBeenCalledWith(
      'https://example.com/api',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          'X-Key': 'abc',
        }),
      }),
    );
    vi.unstubAllGlobals();
  });

  it('silently swallows fetch errors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('network error'));
    vi.stubGlobal('fetch', mockFetch);

    // Should not throw
    await expect(
      exportToEndpoint('https://example.com/api', {}, { data: 'test' }),
    ).resolves.toBeUndefined();

    vi.unstubAllGlobals();
  });
});

describe('createMeterProvider — flush', () => {
  it('flush is no-op when no endpoint configured', async () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    // Should resolve without error
    await provider.flush();
  });

  it('flush exports when endpoint configured', async () => {
    const mockFetch = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const provider = createMeterProvider({
      serviceName: 'test',
      endpoint: 'https://example.com/v1/metrics',
    });
    const counter = provider.counter('test-counter');
    counter.add(1);

    await provider.flush();
    expect(mockFetch).toHaveBeenCalled();

    vi.unstubAllGlobals();
  });
});
