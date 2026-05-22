/**
 * Tests for uncovered paths in rest.ts: timeout+signal combo, interceptors,
 * network error wrapping.
 */
import { describe, it, expect, fn, spyOn, mock, afterEach } from '@asymmetric-effort/nogginlessdom';
import { createRestClient, RestError } from '../../../src/client/rest';

afterEach(() => {
  mock.restoreAllMocks();
});

describe('createRestClient — timeout + external signal', () => {
  it('aborts via timeout controller when timeout is set', async () => {
    const mockFetch = fn().mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(new DOMException('The operation was aborted.', 'AbortError')), 5);
        }),
    );
    mock.stubGlobal('fetch', mockFetch);

    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 10 });
    await expect(client.get('/slow')).rejects.toThrow('timeout');

    mock.unstubAllGlobals();
  });

  it('aborts when external signal is already aborted', async () => {
    const mockFetch = fn().mockRejectedValue(new DOMException('Aborted', 'AbortError'));
    mock.stubGlobal('fetch', mockFetch);

    const abortController = new AbortController();
    abortController.abort();

    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 5000 });
    await expect(client.get('/data', { signal: abortController.signal })).rejects.toThrow();

    mock.unstubAllGlobals();
  });

  it('aborts when external signal fires during request with timeout', async () => {
    const mockFetch = fn().mockImplementation(
      () =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new DOMException('Aborted', 'AbortError')), 50),
        ),
    );
    mock.stubGlobal('fetch', mockFetch);

    const abortController = new AbortController();
    const client = createRestClient({ baseURL: 'https://api.example.com', timeout: 5000 });
    const promise = client.get('/data', { signal: abortController.signal });

    // Abort externally
    abortController.abort();
    await expect(promise).rejects.toThrow();

    mock.unstubAllGlobals();
  });
});

describe('createRestClient — network errors', () => {
  it('wraps non-Error rejection in RestError', async () => {
    const mockFetch = fn().mockRejectedValue('string error');
    mock.stubGlobal('fetch', mockFetch);

    const client = createRestClient({ baseURL: 'https://api.example.com' });
    try {
      await client.get('/fail');
      expect.fail('should have thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(RestError);
      expect((err as RestError).message).toBe('Network error');
    }

    mock.unstubAllGlobals();
  });
});

describe('createRestClient — error interceptors', () => {
  it('passes errors through error interceptors', async () => {
    const mockFetch = fn().mockRejectedValue(new Error('boom'));
    mock.stubGlobal('fetch', mockFetch);

    const interceptor = fn(async (err: RestError) => {
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

    mock.unstubAllGlobals();
  });
});
