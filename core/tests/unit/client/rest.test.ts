import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { createRestClient, RestError, useRest } from '../../../src/client/rest';
import type {
  RestClient,
  RestClientConfig,
  RestResponse,
  RequestConfig,
} from '../../../src/client/rest';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { useState, useEffect } from '../../../src/hooks/index';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createMockFetchResponse(
  body: unknown,
  init?: { status?: number; statusText?: string; headers?: Record<string, string> },
): Response {
  const status = init?.status ?? 200;
  const statusText = init?.statusText ?? 'OK';
  const headers = new Headers({
    'content-type': 'application/json',
    ...(init?.headers ?? {}),
  });
  return new Response(JSON.stringify(body), { status, statusText, headers });
}

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  vi.restoreAllMocks();
});

// ===========================================================================
// RestError
// ===========================================================================

describe('RestError', () => {
  it('extends Error and sets all properties', () => {
    const config: RequestConfig = {
      url: 'https://api.example.com/test',
      method: 'GET',
      headers: {},
    };
    const err = new RestError('Not Found', 404, 'Not Found', { message: 'gone' }, config);

    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(RestError);
    expect(err.name).toBe('RestError');
    expect(err.message).toBe('Not Found');
    expect(err.status).toBe(404);
    expect(err.statusText).toBe('Not Found');
    expect(err.data).toEqual({ message: 'gone' });
    expect(err.config).toBe(config);
  });

  it('has a proper stack trace', () => {
    const err = new RestError('fail', 500, 'Internal', null, {
      url: '',
      method: 'GET',
      headers: {},
    });
    expect(err.stack).toBeDefined();
  });
});

// ===========================================================================
// createRestClient
// ===========================================================================

describe('createRestClient', () => {
  describe('construction', () => {
    it('creates a client with all HTTP methods', () => {
      const client = createRestClient({ baseURL: 'https://api.example.com' });
      expect(typeof client.get).toBe('function');
      expect(typeof client.post).toBe('function');
      expect(typeof client.put).toBe('function');
      expect(typeof client.patch).toBe('function');
      expect(typeof client.delete).toBe('function');
    });
  });

  describe('GET requests', () => {
    it('sends a GET request and deserializes JSON', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(createMockFetchResponse({ id: 1, name: 'Test' }));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const result = await client.get<{ id: number; name: string }>('/users/1');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://api.example.com/users/1');
      expect(init?.method).toBe('GET');
      expect(result.data).toEqual({ id: 1, name: 'Test' });
      expect(result.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(result.headers['content-type']).toBe('application/json');
    });

    it('handles baseURL with trailing slash', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({ baseURL: 'https://api.example.com/' });
      await client.get('/items');

      expect(fetchSpy.mock.calls[0][0]).toBe('https://api.example.com/items');
    });

    it('handles path without leading slash', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      await client.get('items');

      expect(fetchSpy.mock.calls[0][0]).toBe('https://api.example.com/items');
    });
  });

  describe('POST requests', () => {
    it('sends a POST request with JSON body', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(
          createMockFetchResponse({ id: 2 }, { status: 201, statusText: 'Created' }),
        );

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const result = await client.post<{ id: number }>('/users', { name: 'New User' });

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.method).toBe('POST');
      expect(init?.body).toBe(JSON.stringify({ name: 'New User' }));
      expect((init?.headers as Record<string, string>)['Content-Type']).toBe('application/json');
      expect(result.data).toEqual({ id: 2 });
      expect(result.status).toBe(201);
    });
  });

  describe('PUT requests', () => {
    it('sends a PUT request with body', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(createMockFetchResponse({ updated: true }));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      await client.put('/users/1', { name: 'Updated' });

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://api.example.com/users/1');
      expect(init?.method).toBe('PUT');
      expect(init?.body).toBe(JSON.stringify({ name: 'Updated' }));
    });
  });

  describe('PATCH requests', () => {
    it('sends a PATCH request with body', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(createMockFetchResponse({ patched: true }));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      await client.patch('/users/1', { email: 'new@test.com' });

      const [, init] = fetchSpy.mock.calls[0];
      expect(init?.method).toBe('PATCH');
      expect(init?.body).toBe(JSON.stringify({ email: 'new@test.com' }));
    });
  });

  describe('DELETE requests', () => {
    it('sends a DELETE request', async () => {
      const fetchSpy = vi
        .spyOn(globalThis, 'fetch')
        .mockResolvedValue(createMockFetchResponse(null));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      await client.delete('/users/1');

      const [url, init] = fetchSpy.mock.calls[0];
      expect(url).toBe('https://api.example.com/users/1');
      expect(init?.method).toBe('DELETE');
      expect(init?.body).toBeUndefined();
    });
  });

  describe('custom headers', () => {
    it('sends default headers from config', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer token123', 'X-Custom': 'value' },
      });
      await client.get('/data');

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer token123');
      expect(headers['X-Custom']).toBe('value');
    });

    it('merges per-request headers with defaults', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer default' },
      });
      await client.get('/data', { headers: { 'X-Request-Id': '123' } });

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer default');
      expect(headers['X-Request-Id']).toBe('123');
    });

    it('per-request headers override defaults', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        headers: { Authorization: 'Bearer default' },
      });
      await client.get('/data', { headers: { Authorization: 'Bearer override' } });

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Authorization']).toBe('Bearer override');
    });
  });

  describe('JSON serialization/deserialization', () => {
    it('serializes request body as JSON', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const body = { nested: { array: [1, 2, 3], flag: true } };
      await client.post('/data', body);

      expect(fetchSpy.mock.calls[0][1]?.body).toBe(JSON.stringify(body));
    });

    it('deserializes JSON response with content-type header', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        createMockFetchResponse({ items: ['a', 'b'] }),
      );

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const result = await client.get<{ items: string[] }>('/list');

      expect(result.data).toEqual({ items: ['a', 'b'] });
    });

    it('attempts JSON parse for responses without json content-type', async () => {
      const body = JSON.stringify({ value: 42 });
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response(body, {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        }),
      );

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const result = await client.get<{ value: number }>('/data');

      expect(result.data).toEqual({ value: 42 });
    });

    it('returns text when response is not valid JSON', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        new Response('plain text response', {
          status: 200,
          headers: { 'content-type': 'text/plain' },
        }),
      );

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      const result = await client.get<string>('/text');

      expect(result.data).toBe('plain text response');
    });

    it('does not set Content-Type when body is null', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({ baseURL: 'https://api.example.com' });
      await client.get('/data');

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['Content-Type']).toBeUndefined();
    });
  });

  describe('timeout handling', () => {
    it('aborts request after timeout', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            const signal = init?.signal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          }),
      );

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        timeout: 50,
      });

      await expect(client.get('/slow')).rejects.toThrow(RestError);

      try {
        await client.get('/slow');
      } catch (err) {
        expect(err).toBeInstanceOf(RestError);
        expect((err as RestError).message).toContain('timeout');
      }
    });

    it('per-request timeout overrides default', async () => {
      vi.spyOn(globalThis, 'fetch').mockImplementation(
        (_url, init) =>
          new Promise((_resolve, reject) => {
            const signal = init?.signal;
            if (signal) {
              signal.addEventListener('abort', () => {
                reject(new DOMException('The operation was aborted.', 'AbortError'));
              });
            }
          }),
      );

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        timeout: 10000,
      });

      await expect(client.get('/slow', { timeout: 50 })).rejects.toThrow(RestError);
    });

    it('clears timeout on successful response', async () => {
      const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout');

      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({ ok: true }));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        timeout: 5000,
      });

      await client.get('/fast');

      expect(clearTimeoutSpy).toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('throws RestError for non-ok responses', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        createMockFetchResponse({ error: 'not found' }, { status: 404, statusText: 'Not Found' }),
      );

      const client = createRestClient({ baseURL: 'https://api.example.com' });

      try {
        await client.get('/missing');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RestError);
        const restErr = err as RestError;
        expect(restErr.status).toBe(404);
        expect(restErr.statusText).toBe('Not Found');
        expect(restErr.data).toEqual({ error: 'not found' });
        expect(restErr.config.url).toBe('https://api.example.com/missing');
        expect(restErr.config.method).toBe('GET');
      }
    });

    it('throws RestError for network errors', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Failed to fetch'));

      const client = createRestClient({ baseURL: 'https://api.example.com' });

      try {
        await client.get('/fail');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RestError);
        expect((err as RestError).status).toBe(0);
        expect((err as RestError).message).toBe('Failed to fetch');
      }
    });
  });

  describe('request interceptors', () => {
    it('modifies request config via interceptor', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          request: [
            (config) => ({
              ...config,
              headers: { ...config.headers, 'X-Intercepted': 'true' },
            }),
          ],
        },
      });

      await client.get('/data');

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['X-Intercepted']).toBe('true');
    });

    it('chains multiple request interceptors', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          request: [
            (config) => ({
              ...config,
              headers: { ...config.headers, 'X-First': '1' },
            }),
            (config) => ({
              ...config,
              headers: { ...config.headers, 'X-Second': '2' },
            }),
          ],
        },
      });

      await client.get('/data');

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['X-First']).toBe('1');
      expect(headers['X-Second']).toBe('2');
    });

    it('supports async request interceptors', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({}));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          request: [
            async (config) => {
              await Promise.resolve();
              return { ...config, headers: { ...config.headers, 'X-Async': 'yes' } };
            },
          ],
        },
      });

      await client.get('/data');

      const headers = fetchSpy.mock.calls[0][1]?.headers as Record<string, string>;
      expect(headers['X-Async']).toBe('yes');
    });
  });

  describe('response interceptors', () => {
    it('modifies response via interceptor', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({ value: 1 }));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          response: [
            (response) => ({
              ...response,
              data: { ...(response.data as Record<string, unknown>), extra: true },
            }),
          ],
        },
      });

      const result = await client.get<{ value: number; extra: boolean }>('/data');

      expect(result.data.value).toBe(1);
      expect(result.data.extra).toBe(true);
    });

    it('chains multiple response interceptors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(createMockFetchResponse({ count: 0 }));

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          response: [
            (response) => ({
              ...response,
              data: { ...(response.data as Record<string, unknown>), first: true },
            }),
            (response) => ({
              ...response,
              data: { ...(response.data as Record<string, unknown>), second: true },
            }),
          ],
        },
      });

      const result = await client.get<Record<string, unknown>>('/data');

      expect(result.data['first']).toBe(true);
      expect(result.data['second']).toBe(true);
    });
  });

  describe('error interceptors', () => {
    it('modifies error via error interceptor', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        createMockFetchResponse({ error: 'forbidden' }, { status: 403, statusText: 'Forbidden' }),
      );

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          error: [
            (err) =>
              new RestError(
                'Custom: ' + err.message,
                err.status,
                err.statusText,
                err.data,
                err.config,
              ),
          ],
        },
      });

      try {
        await client.get('/forbidden');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect(err).toBeInstanceOf(RestError);
        expect((err as RestError).message).toContain('Custom:');
        expect((err as RestError).status).toBe(403);
      }
    });

    it('error interceptor runs on network errors too', async () => {
      vi.spyOn(globalThis, 'fetch').mockRejectedValue(new TypeError('Network fail'));

      const interceptorFn = vi.fn((err: RestError) => err);

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          error: [interceptorFn],
        },
      });

      try {
        await client.get('/fail');
      } catch {
        // expected
      }

      expect(interceptorFn).toHaveBeenCalledTimes(1);
      expect(interceptorFn.mock.calls[0][0]).toBeInstanceOf(RestError);
    });

    it('supports async error interceptors', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValue(
        createMockFetchResponse({ error: 'bad' }, { status: 500, statusText: 'Server Error' }),
      );

      const client = createRestClient({
        baseURL: 'https://api.example.com',
        interceptors: {
          error: [
            async (err) => {
              await Promise.resolve();
              return new RestError(
                'Async handled',
                err.status,
                err.statusText,
                err.data,
                err.config,
              );
            },
          ],
        },
      });

      try {
        await client.get('/error');
        expect.unreachable('should have thrown');
      } catch (err) {
        expect((err as RestError).message).toBe('Async handled');
      }
    });
  });
});

// ===========================================================================
// useRest hook
// ===========================================================================

describe('useRest', () => {
  let activeRoot: ReturnType<typeof createRoot> | null = null;
  afterEach(() => {
    if (activeRoot) {
      activeRoot.unmount();
      activeRoot = null;
    }
  });

  function createMockClient(overrides?: Partial<RestClient>): RestClient {
    return {
      get: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      post: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      put: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      patch: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      delete: vi.fn().mockResolvedValue({ data: null, status: 200, headers: {}, ok: true }),
      ...overrides,
    };
  }

  it('renders loading state initially on mount', () => {
    const mockClient = createMockClient({
      get: vi.fn().mockReturnValue(
        new Promise(() => {
          /* never resolves */
        }),
      ),
    });

    function TestComp() {
      const { loading } = useRest<{ name: string }>(mockClient, '/user');
      return createElement('div', null, loading ? 'loading' : 'done');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(container.textContent).toBe('loading');
    expect(mockClient.get).toHaveBeenCalledWith(
      '/user',
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('does not fetch when enabled is false', () => {
    const mockClient = createMockClient();

    function TestComp() {
      const { loading } = useRest(mockClient, '/data', { enabled: false });
      return createElement('div', null, loading ? 'loading' : 'idle');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(container.textContent).toBe('idle');
    expect(mockClient.get).not.toHaveBeenCalled();
  });

  it('uses the specified HTTP method', () => {
    const mockClient = createMockClient({
      post: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest<{ created: boolean }>(mockClient, '/items', {
        method: 'POST',
        body: { name: 'test' },
      });
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(mockClient.post).toHaveBeenCalledWith(
      '/items',
      { name: 'test' },
      expect.objectContaining({ signal: expect.any(AbortSignal) }),
    );
  });

  it('uses PUT method when specified', () => {
    const mockClient = createMockClient({
      put: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest(mockClient, '/items/1', { method: 'PUT', body: { x: 1 } });
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(mockClient.put).toHaveBeenCalled();
  });

  it('uses PATCH method when specified', () => {
    const mockClient = createMockClient({
      patch: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest(mockClient, '/items/1', { method: 'PATCH', body: { y: 2 } });
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(mockClient.patch).toHaveBeenCalled();
  });

  it('uses DELETE method when specified', () => {
    const mockClient = createMockClient({
      delete: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest(mockClient, '/items/1', { method: 'DELETE' });
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(mockClient.delete).toHaveBeenCalled();
  });

  it('exposes a refetch function', () => {
    let refetchFn: (() => void) | undefined;
    const mockClient = createMockClient({
      get: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      const { refetch } = useRest(mockClient, '/count');
      refetchFn = refetch;
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(typeof refetchFn).toBe('function');
  });

  it('returns null data and null error initially', () => {
    let capturedData: unknown = 'not-null';
    let capturedError: unknown = 'not-null';
    const mockClient = createMockClient({
      get: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      const { data, error } = useRest(mockClient, '/test');
      capturedData = data;
      capturedError = error;
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(capturedData).toBeNull();
    expect(capturedError).toBeNull();
  });

  it('passes AbortSignal to the client request', () => {
    const mockClient = createMockClient({
      get: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest(mockClient, '/data');
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    const callArgs = (mockClient.get as ReturnType<typeof vi.fn>).mock.calls[0];
    expect(callArgs[0]).toBe('/data');
    expect(callArgs[1]).toHaveProperty('signal');
    expect(callArgs[1].signal).toBeInstanceOf(AbortSignal);
  });

  it('defaults to GET method when no method specified', () => {
    const mockClient = createMockClient({
      get: vi.fn().mockReturnValue(new Promise(() => {})),
    });

    function TestComp() {
      useRest(mockClient, '/resource');
      return createElement('div', null, 'ok');
    }

    activeRoot = createRoot(container);
    const root = activeRoot;
    root.render(createElement(TestComp, null));

    expect(mockClient.get).toHaveBeenCalled();
    expect(mockClient.post).not.toHaveBeenCalled();
  });
});
