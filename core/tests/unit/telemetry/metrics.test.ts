// ============================================================================
// Tests — Metrics
// ============================================================================

import { describe, it, expect } from 'vitest';
import {
  createMeterProvider,
  formatOtlpMetrics,
  formatOtlpTraces,
} from '../../../src/telemetry/metrics';
import { startSpan, endSpan } from '../../../src/telemetry/tracing';

// ---------------------------------------------------------------------------
// Counter
// ---------------------------------------------------------------------------

describe('Counter', () => {
  it('increments correctly', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const counter = provider.counter('requests');

    counter.add(1);
    counter.add(5);
    counter.add(3);

    expect(counter.dataPoints).toHaveLength(3);
    const total = counter.dataPoints.reduce((sum, dp) => sum + dp.value, 0);
    expect(total).toBe(9);
  });

  it('records attributes with data points', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const counter = provider.counter('http.requests');

    counter.add(1, { method: 'GET', status: 200 });
    counter.add(1, { method: 'POST', status: 201 });

    expect(counter.dataPoints).toHaveLength(2);
    expect(counter.dataPoints[0].attributes).toEqual({ method: 'GET', status: 200 });
    expect(counter.dataPoints[1].attributes).toEqual({ method: 'POST', status: 201 });
  });

  it('ignores negative values (monotonic)', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const counter = provider.counter('positive-only');

    counter.add(5);
    counter.add(-1);

    expect(counter.dataPoints).toHaveLength(1);
    expect(counter.dataPoints[0].value).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// Histogram
// ---------------------------------------------------------------------------

describe('Histogram', () => {
  it('records values', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const histogram = provider.histogram('response.duration');

    histogram.record(12.5);
    histogram.record(45.2);
    histogram.record(3.1);

    expect(histogram.dataPoints).toHaveLength(3);
    expect(histogram.dataPoints[0].value).toBe(12.5);
    expect(histogram.dataPoints[1].value).toBe(45.2);
    expect(histogram.dataPoints[2].value).toBe(3.1);
  });

  it('records values with attributes', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const histogram = provider.histogram('latency');

    histogram.record(100, { route: '/api/users' });

    expect(histogram.dataPoints[0].attributes).toEqual({ route: '/api/users' });
  });
});

// ---------------------------------------------------------------------------
// Gauge
// ---------------------------------------------------------------------------

describe('Gauge', () => {
  it('sets the current value', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const gauge = provider.gauge('cpu.usage');

    gauge.set(0.75);
    gauge.set(0.82);

    expect(gauge.dataPoints).toHaveLength(2);
    expect(gauge.dataPoints[0].value).toBe(0.75);
    expect(gauge.dataPoints[1].value).toBe(0.82);
  });

  it('supports attributes', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const gauge = provider.gauge('memory');

    gauge.set(1024, { host: 'web-01' });

    expect(gauge.dataPoints[0].attributes).toEqual({ host: 'web-01' });
  });
});

// ---------------------------------------------------------------------------
// MeterProvider
// ---------------------------------------------------------------------------

describe('MeterProvider', () => {
  it('creates instruments and tracks them', () => {
    const provider = createMeterProvider({ serviceName: 'test' });

    const c = provider.counter('c');
    const h = provider.histogram('h');
    const g = provider.gauge('g');

    expect(provider.instruments).toHaveLength(3);
    expect(provider.instruments[0]).toBe(c);
    expect(provider.instruments[1]).toBe(h);
    expect(provider.instruments[2]).toBe(g);
  });

  it('stores config', () => {
    const provider = createMeterProvider({
      serviceName: 'my-svc',
      endpoint: 'http://localhost:4318/v1/metrics',
    });
    expect(provider.config.serviceName).toBe('my-svc');
    expect(provider.config.endpoint).toBe('http://localhost:4318/v1/metrics');
  });
});

// ---------------------------------------------------------------------------
// Multiple data points accumulate
// ---------------------------------------------------------------------------

describe('Data point accumulation', () => {
  it('accumulates multiple data points across instruments', () => {
    const provider = createMeterProvider({ serviceName: 'test' });
    const counter = provider.counter('events');
    const histogram = provider.histogram('durations');

    for (let i = 0; i < 10; i++) {
      counter.add(1, { batch: i });
      histogram.record(i * 1.5);
    }

    expect(counter.dataPoints).toHaveLength(10);
    expect(histogram.dataPoints).toHaveLength(10);
  });
});

// ---------------------------------------------------------------------------
// OTLP JSON format
// ---------------------------------------------------------------------------

describe('formatOtlpMetrics', () => {
  it('produces a valid OTLP metrics structure', () => {
    const provider = createMeterProvider({ serviceName: 'fmt-test' });
    const counter = provider.counter('req.count', { description: 'Total requests' });
    counter.add(5);
    counter.add(3);

    const histogram = provider.histogram('req.duration');
    histogram.record(42);

    const gauge = provider.gauge('active.connections');
    gauge.set(7);

    const payload = formatOtlpMetrics(provider.instruments, 'fmt-test');

    // Top-level structure
    expect(payload).toHaveProperty('resourceMetrics');
    const resourceMetrics = payload.resourceMetrics as Array<Record<string, unknown>>;
    expect(resourceMetrics).toHaveLength(1);

    const rm = resourceMetrics[0];
    expect(rm).toHaveProperty('resource');
    expect(rm).toHaveProperty('scopeMetrics');

    const scopeMetrics = rm.scopeMetrics as Array<Record<string, unknown>>;
    expect(scopeMetrics).toHaveLength(1);

    const metrics = scopeMetrics[0].metrics as Array<Record<string, unknown>>;
    expect(metrics).toHaveLength(3);

    // Counter metric
    const counterMetric = metrics[0];
    expect(counterMetric.name).toBe('req.count');
    expect(counterMetric).toHaveProperty('sum');

    // Histogram metric
    const histogramMetric = metrics[1];
    expect(histogramMetric.name).toBe('req.duration');
    expect(histogramMetric).toHaveProperty('histogram');

    // Gauge metric
    const gaugeMetric = metrics[2];
    expect(gaugeMetric.name).toBe('active.connections');
    expect(gaugeMetric).toHaveProperty('gauge');
  });
});

describe('formatOtlpTraces', () => {
  it('produces a valid OTLP traces structure', () => {
    const span1 = startSpan('root-span', { kind: 'server' });
    span1.attributes['http.method'] = 'GET';
    span1.events.push({ name: 'start', timestamp: performance.now() });
    endSpan(span1);

    const span2 = startSpan('child-span', {
      traceId: span1.traceId,
      parentSpanId: span1.spanId,
    });
    endSpan(span2);

    const payload = formatOtlpTraces([span1, span2], 'trace-test', '1.0.0');

    // Top-level structure
    expect(payload).toHaveProperty('resourceSpans');
    const resourceSpans = payload.resourceSpans as Array<Record<string, unknown>>;
    expect(resourceSpans).toHaveLength(1);

    const rs = resourceSpans[0];
    expect(rs).toHaveProperty('resource');
    expect(rs).toHaveProperty('scopeSpans');

    const scopeSpans = rs.scopeSpans as Array<Record<string, unknown>>;
    expect(scopeSpans).toHaveLength(1);

    const spans = scopeSpans[0].spans as Array<Record<string, unknown>>;
    expect(spans).toHaveLength(2);

    // Verify span fields
    const otlpSpan = spans[0];
    expect(otlpSpan.traceId).toBe(span1.traceId);
    expect(otlpSpan.spanId).toBe(span1.spanId);
    expect(otlpSpan.name).toBe('root-span');
    expect(otlpSpan.kind).toBe(2); // server = 2

    // Verify child span has parentSpanId
    const childOtlp = spans[1];
    expect(childOtlp.parentSpanId).toBe(span1.spanId);
  });
});
