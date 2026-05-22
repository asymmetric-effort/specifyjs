/**
 * Tests for uncovered paths in rest.ts: timeout+signal combo, interceptors,
 * network error wrapping.
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { createRestClient, RestError } from '../../../src/client/rest';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createRestClient — timeout + external signal', () => {
  it('aborts via timeout controller when timeout is set', async () => {
    const mockFetch = vi.fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('The operation was aborted.', 'AbortError')), 5);
        }),
    );
    vi.stubGlobal('fetch', mockFetch);

    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 10 });
    await expect(client.get('/slow')).rejects.toThrow('timeout');

    vi.unstubAllGlobals();
  });

  it('aborts when external signal is already aborted', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    vi.stubGlobal('fetch', mockFetch);

    const abortController = new AbortController();
    abortController.abort();

    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 5000 });
    await expect(client.get('/data', { signal: abortController.signal })).rejects.toThrow();

    vi.unstubAllGlobals();
  });

  it('aborts when external signal fires during request with timeout', async () => {
    const mockFetch = vi
      .fn()
      .mockImplementation(
        () =>
          new Promise((_, reject) =>
            setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 50),
          ),
      );
    vi.stubGlobal('fetch', mockFetch);

    const abortController = new AbortController();
    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 5000 });
    const promise = client.get('/data', { signal: abortController.signal });

    // Abort externally
    abortController.abort();
    await expect(promise).rejects.toThrow();

    vi.unstubAllGlobals();
  });
});

describe('createRestClient — network errors', () => {
  it('wraps non-Error rejection in RestError', async () => {
    const mockFetch = vi.fn().mockRejectedValue('string error');
    vi.stubGlobal('fetch', mockFetch);

    const client = createRestClient({ baseURL: 'https://api.example.com' });
    try {
      await client.get('/fail');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RestError);
      expect((err as RestError).message).toBe('Network error');
    }

    vi.unstubAllGlobals();
  });
});

describe('createRestClient — error interceptors', () => {
  it('passes errors through error interceptors', async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error('boom'));
    vi.stubGlobal('fetch', mockFetch);

    const interceptor = vi.fn(async (err: RestError) => {
      return new RestError(
        'intercepted: ' + err.message,
        err.status,
        err.statusText,
        err.data,
        err.config,
      );
    });

    const client = createRestClient({
      baseURL: 'https://api.example.com',
      interceptors: {
        error: [interceptor],
      },
    });

    try {
      await client.get('/fail');
      expect.fail('should have thrown');
    } catch (err) {
      expect(interceptor).toHaveBeenCalled();
      expect((err as RestError).message).toContain('intercepted');
    }

    vi.unstubAllGlobals();
  });
});
