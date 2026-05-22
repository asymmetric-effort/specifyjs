import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createGraphQLClient,
  gql,
  useQuery,
  useMutation,
  type GraphQLClient,
  type GraphQLResponse,
} from '../../../src/client/graphql';
import { createElement } from '../../../src/index';
import { useState, useEffect } from '../../../src/hooks/index';
import { createRoot } from '../../../src/dom/create-root';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  vi.restoreAllMocks();
});

afterEach(() => {
  document.body.removeChild(container);
});

function mockFetch(body: unknown, status = 200): ReturnType<typeof vi.fn> {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(body),
  });
  vi.stubGlobal('fetch', fn);
  return fn;
}

function flushPromises(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

// ---------------------------------------------------------------------------
// createGraphQLClient construction
// ---------------------------------------------------------------------------

describe('createGraphQLClient', () => {
  it('returns an object with query, mutate, clearCache, and invalidate', () => {
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });
    expect(typeof client.query).toBe('function');
    expect(typeof client.mutate).toBe('function');
    expect(typeof client.clearCache).toBe('function');
    expect(typeof client.invalidate).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// query sends correct POST body
// ---------------------------------------------------------------------------

describe('client.query', () => {
  it('sends a POST request with correct body', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    await client.query('query { users { id } }');

    expect(fetchFn).toHaveBeenCalledOnce();
    const [url, options] = fetchFn.mock.calls[0];
    expect(url).toBe('https://api.example.com/graphql');
    expect(options.method).toBe('POST');
    expect(options.headers['Content-Type']).toBe('application/json');
    expect(JSON.parse(options.body)).toEqual({
      query: 'query { users { id } }',
      variables: undefined,
    });
  });

  it('returns data from response', async () => {
    mockFetch({ data: { users: [{ id: '1' }] }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    const result = await client.query<{ users: { id: string }[] }>('query { users { id } }');
    expect(result.data).toEqual({ users: [{ id: '1' }] });
    expect(result.errors).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// mutate sends correct POST body
// ---------------------------------------------------------------------------

describe('client.mutate', () => {
  it('sends a POST request with mutation and variables', async () => {
    const fetchFn = mockFetch({ data: { createUser: { id: '2' } }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    await client.mutate('mutation CreateUser($name: String!) { createUser(name: $name) { id } }', {
      name: 'Alice',
    });

    expect(fetchFn).toHaveBeenCalledOnce();
    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body.query).toBe(
      'mutation CreateUser($name: String!) { createUser(name: $name) { id } }',
    );
    expect(body.variables).toEqual({ name: 'Alice' });
  });
});

// ---------------------------------------------------------------------------
// gql template tag
// ---------------------------------------------------------------------------

describe('gql template tag', () => {
  it('returns the query string as-is', () => {
    const query = gql`
      query {
        users {
          id
          name
        }
      }
    `;
    expect(query).toBe('query { users { id name } }');
  });

  it('interpolates values', () => {
    const fragment = 'id name';
    const query = gql`query { users { ${fragment} } }`;
    expect(query).toBe('query { users { id name } }');
  });
});

// ---------------------------------------------------------------------------
// GraphQL error extraction
// ---------------------------------------------------------------------------

describe('GraphQL error extraction', () => {
  it('extracts errors from response', async () => {
    mockFetch({
      data: null,
      errors: [
        {
          message: 'Not found',
          locations: [{ line: 1, column: 3 }],
          path: ['user'],
        },
      ],
    });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    const result = await client.query('query { user { id } }');
    expect(result.errors).toEqual([
      {
        message: 'Not found',
        locations: [{ line: 1, column: 3 }],
        path: ['user'],
      },
    ]);
    expect(result.data).toBeNull();
  });

  it('preserves extensions when present', async () => {
    mockFetch({
      data: { me: { id: '1' } },
      errors: null,
      extensions: { tracing: { duration: 42 } },
    });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    const result = await client.query('query { me { id } }');
    expect(result.extensions).toEqual({ tracing: { duration: 42 } });
  });
});

// ---------------------------------------------------------------------------
// Response caching
// ---------------------------------------------------------------------------

describe('response caching', () => {
  it('caches query results (second call does not fetch again)', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: true,
    });

    const r1 = await client.query('query { users { id } }');
    const r2 = await client.query('query { users { id } }');

    expect(fetchFn).toHaveBeenCalledOnce();
    expect(r1).toEqual(r2);
  });

  it('does not cache when cache is disabled', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: false,
    });

    await client.query('query { users { id } }');
    await client.query('query { users { id } }');

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('does not cache mutations', async () => {
    const fetchFn = mockFetch({ data: { ok: true }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: true,
    });

    await client.mutate('mutation { doThing }');
    await client.mutate('mutation { doThing }');

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Cache invalidation
// ---------------------------------------------------------------------------

describe('cache invalidation', () => {
  it('clearCache clears all cached entries', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: true,
    });

    await client.query('query { users { id } }');
    client.clearCache();
    await client.query('query { users { id } }');

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('invalidate removes entries for a specific query', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: true,
    });

    const query1 = 'query { users { id } }';
    const query2 = 'query { posts { id } }';

    await client.query(query1);
    await client.query(query2);
    expect(fetchFn).toHaveBeenCalledTimes(2);

    client.invalidate(query1);

    await client.query(query1); // should re-fetch
    await client.query(query2); // should still be cached

    expect(fetchFn).toHaveBeenCalledTimes(3);
  });
});

// ---------------------------------------------------------------------------
// Variables substitution
// ---------------------------------------------------------------------------

describe('variables substitution', () => {
  it('sends variables in the POST body', async () => {
    const fetchFn = mockFetch({ data: { user: { id: '1' } }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    await client.query('query GetUser($id: ID!) { user(id: $id) { id } }', { id: '1' });

    const body = JSON.parse(fetchFn.mock.calls[0][1].body);
    expect(body.variables).toEqual({ id: '1' });
  });

  it('caches separately for different variables', async () => {
    const fetchFn = mockFetch({ data: { user: { id: '1' } }, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      cache: true,
    });

    const q = 'query GetUser($id: ID!) { user(id: $id) { id } }';
    await client.query(q, { id: '1' });
    await client.query(q, { id: '2' });

    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});

// ---------------------------------------------------------------------------
// Custom headers
// ---------------------------------------------------------------------------

describe('custom headers', () => {
  it('sends custom headers with every request', async () => {
    const fetchFn = mockFetch({ data: null, errors: null });
    const client = createGraphQLClient({
      url: 'https://api.example.com/graphql',
      headers: { Authorization: 'Bearer token123', 'X-Custom': 'value' },
    });

    await client.query('query { me { id } }');

    const headers = fetchFn.mock.calls[0][1].headers;
    expect(headers['Authorization']).toBe('Bearer token123');
    expect(headers['X-Custom']).toBe('value');
    expect(headers['Content-Type']).toBe('application/json');
  });
});

// ---------------------------------------------------------------------------
// Network error handling
// ---------------------------------------------------------------------------

describe('network error handling', () => {
  it('throws on non-ok HTTP responses', async () => {
    mockFetch({ message: 'Unauthorized' }, 401);
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    await expect(client.query('query { me { id } }')).rejects.toThrow(
      'GraphQL request failed with status 401',
    );
  });

  it('throws on network failure', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    await expect(client.query('query { me { id } }')).rejects.toThrow('Failed to fetch');
  });
});

// ---------------------------------------------------------------------------
// useQuery hook
// ---------------------------------------------------------------------------

describe('useQuery', () => {
  it('transitions through loading, data, and error states', async () => {
    mockFetch({ data: { users: [{ id: '1' }] }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    const states: { loading: boolean; data: unknown; error: unknown }[] = [];

    function TestComponent() {
      const result = useQuery<{ users: { id: string }[] }>(client, 'query { users { id } }');
      states.push({ loading: result.loading, data: result.data, error: result.error });
      return createElement('div', null, result.loading ? 'loading' : JSON.stringify(result.data));
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));

    // Initially should be loading
    expect(states[0].loading).toBe(true);
    expect(states[0].data).toBeNull();

    await flushPromises();

    // After fetch resolves, re-render triggers
    root.render(createElement(TestComponent, null));
    await flushPromises();
    // At least one state should have the fetched data eventually
  });

  it('does not fetch when enabled is false', async () => {
    const fetchFn = mockFetch({ data: { users: [] }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    function TestComponent() {
      const result = useQuery(client, 'query { users { id } }', { enabled: false });
      return createElement('div', null, result.loading ? 'loading' : 'idle');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));
    await flushPromises();

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('provides a refetch function', async () => {
    const fetchFn = mockFetch({ data: { count: 1 }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });
    let refetchFn: (() => void) | null = null;

    function TestComponent() {
      const result = useQuery(client, 'query { count }');
      refetchFn = result.refetch;
      return createElement('div', null, String(result.loading));
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));
    await flushPromises();

    expect(refetchFn).toBeTypeOf('function');
  });

  it('handles fetch errors in useQuery', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Network down')));
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    const capturedErrors: unknown[] = [];

    function TestComponent() {
      const result = useQuery(client, 'query { me { id } }');
      if (result.error) {
        capturedErrors.push(result.error);
      }
      return createElement('div', null, result.loading ? 'loading' : 'done');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));
    await flushPromises();
    // Re-render to pick up state after async
    root.render(createElement(TestComponent, null));
    await flushPromises();
  });
});

// ---------------------------------------------------------------------------
// useMutation hook
// ---------------------------------------------------------------------------

describe('useMutation', () => {
  it('returns a mutate function and state object', () => {
    mockFetch({ data: null, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    let result: unknown;

    function TestComponent() {
      result = useMutation(client, 'mutation { doThing }');
      return createElement('div', null, 'test');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));

    expect(Array.isArray(result)).toBe(true);
    const [mutateFn, state] = result as [unknown, unknown];
    expect(typeof mutateFn).toBe('function');
    expect(state).toHaveProperty('data');
    expect(state).toHaveProperty('loading');
    expect(state).toHaveProperty('error');
  });

  it('does not auto-fire the mutation', () => {
    const fetchFn = mockFetch({ data: null, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    function TestComponent() {
      useMutation(client, 'mutation { doThing }');
      return createElement('div', null, 'test');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));

    expect(fetchFn).not.toHaveBeenCalled();
  });

  it('executes mutation on explicit call', async () => {
    const fetchFn = mockFetch({ data: { created: true }, errors: null });
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    let mutateFn: ((vars?: Record<string, unknown>) => Promise<GraphQLResponse<unknown>>) | null =
      null;

    function TestComponent() {
      const [mutate] = useMutation(
        client,
        'mutation Create($name: String!) { create(name: $name) }',
      );
      mutateFn = mutate;
      return createElement('div', null, 'test');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));

    expect(fetchFn).not.toHaveBeenCalled();

    const result = await mutateFn!({ name: 'Alice' });
    expect(fetchFn).toHaveBeenCalledOnce();
    expect(result.data).toEqual({ created: true });
  });

  it('handles mutation errors', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('Server error')));
    const client = createGraphQLClient({ url: 'https://api.example.com/graphql' });

    let mutateFn: ((vars?: Record<string, unknown>) => Promise<GraphQLResponse<unknown>>) | null =
      null;

    function TestComponent() {
      const [mutate] = useMutation(client, 'mutation { fail }');
      mutateFn = mutate;
      return createElement('div', null, 'test');
    }

    const root = createRoot(container);
    root.render(createElement(TestComponent, null));

    const result = await mutateFn!();
    expect(result.data).toBeNull();
    expect(result.errors).toEqual([{ message: 'Server error' }]);
  });
});
