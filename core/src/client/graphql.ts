// ============================================================================
// SpecifyJS GraphQL Client — Zero-dependency native GraphQL client
// ============================================================================
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { useState, useEffect, useRef, useCallback } from '../hooks/index';
import { assertSecureUrl } from '../shared/secure-fetch';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GraphQLError {
  message: string;
  locations?: { line: number; column: number }[];
  path?: (string | number)[];
}

export interface GraphQLResponse<T> {
  data: T | null;
  errors: GraphQLError[] | null;
  extensions?: Record<string, unknown>;
}

export interface GraphQLClientConfig {
  url: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
  cache?: boolean;
}

export interface GraphQLClient {
  query<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>>;
  mutate<T>(mutation: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>>;
  clearCache(): void;
  invalidate(query: string): void;
}

export interface UseQueryOptions {
  variables?: Record<string, unknown>;
  deps?: readonly unknown[];
  enabled?: boolean;
  cache?: boolean;
}

export interface UseQueryResult<T> {
  data: T | null;
  loading: boolean;
  error: GraphQLError[] | null;
  refetch: () => void;
}

// ---------------------------------------------------------------------------
// gql template tag
// ---------------------------------------------------------------------------

/**
 * Tagged template literal for GraphQL queries.
 * Returns the query string as-is. Provides editor syntax highlighting support.
 */
export function gql(strings: TemplateStringsArray, ...values: unknown[]): string {
  let result = '';
  for (let i = 0; i < strings.length; i++) {
    result += strings[i];
    if (i < values.length) {
      const val = String(values[i]);
      // Reject interpolated values with GraphQL metacharacters to prevent injection
      if (/[{}():]/.test(val)) {
        throw new Error(
          `[SpecifyJS] gql: Interpolated value "${val}" contains GraphQL metacharacters ({, }, (, ), :). ` +
            'Use the variables parameter instead of string interpolation to prevent injection.',
        );
      }
      result += val;
    }
  }
  return result.replace(/\s+/g, ' ').trim();
}

// ---------------------------------------------------------------------------
// createGraphQLClient
// ---------------------------------------------------------------------------

/**
 * Factory function that creates a GraphQL client instance.
 */
export function createGraphQLClient(config: GraphQLClientConfig): GraphQLClient {
  const { url, headers: configHeaders, credentials, cache: cacheEnabled = false } = config;

  const MAX_CACHE_SIZE = 100;
  const responseCache = new Map<string, GraphQLResponse<unknown>>();

  function buildCacheKey(query: string, variables?: Record<string, unknown>): string {
    return JSON.stringify({ query, variables });
  }

  async function execute<T>(
    query: string,
    variables?: Record<string, unknown>,
  ): Promise<GraphQLResponse<T>> {
    const reqHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...configHeaders,
    };

    const body = JSON.stringify({ query, variables });

    assertSecureUrl(url);
    const response = await fetch(url, {
      method: 'POST',
      headers: reqHeaders,
      credentials,
      body,
    });

    if (!response.ok) {
      throw new Error(`GraphQL request failed with status ${response.status}`);
    }

    const json = (await response.json()) as GraphQLResponse<T>;

    return {
      data: json.data ?? null,
      errors: json.errors ?? null,
      ...(json.extensions !== undefined ? { extensions: json.extensions } : {}),
    };
  }

  const client: GraphQLClient = {
    async query<T>(
      query: string,
      variables?: Record<string, unknown>,
    ): Promise<GraphQLResponse<T>> {
      if (cacheEnabled) {
        const key = buildCacheKey(query, variables);
        const cached = responseCache.get(key);
        if (cached) {
          return cached as GraphQLResponse<T>;
        }
        const result = await execute<T>(query, variables);
        if (responseCache.size >= MAX_CACHE_SIZE) {
          const oldest = responseCache.keys().next().value;
          if (oldest !== undefined) responseCache.delete(oldest);
        }
        responseCache.set(key, result);
        return result;
      }
      return execute<T>(query, variables);
    },

    async mutate<T>(
      mutation: string,
      variables?: Record<string, unknown>,
    ): Promise<GraphQLResponse<T>> {
      return execute<T>(mutation, variables);
    },

    clearCache(): void {
      responseCache.clear();
    },

    invalidate(query: string): void {
      for (const key of responseCache.keys()) {
        try {
          const parsed = JSON.parse(key) as { query: string };
          if (parsed.query === query) {
            responseCache.delete(key);
          }
        } catch {
          // skip malformed keys
        }
      }
    },
  };

  return client;
}

// ---------------------------------------------------------------------------
// useQuery hook
// ---------------------------------------------------------------------------

/**
 * Hook for executing GraphQL queries with automatic fetching.
 * Auto-fetches on mount and when deps change.
 */
export function useQuery<T>(
  client: GraphQLClient,
  query: string,
  opts?: UseQueryOptions,
): UseQueryResult<T> {
  const variables = opts?.variables;
  const deps = opts?.deps;
  const enabled = opts?.enabled ?? true;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(enabled);
  const [error, setError] = useState<GraphQLError[] | null>(null);

  const fetchIdRef = useRef(0);

  const fetchData = useCallback(() => {
    if (!enabled) return;

    const id = ++fetchIdRef.current;
    setLoading(true);
    setError(null);

    client
      .query<T>(query, variables)
      .then((result) => {
        if (fetchIdRef.current !== id) return;
        setData(result.data);
        setError(result.errors);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (fetchIdRef.current !== id) return;
        setError([{ message: err instanceof Error ? err.message : String(err) }]);
        setLoading(false);
      });
  }, [client, query, variables, enabled]);

  const effectDeps = deps ? [fetchData, ...deps] : [fetchData];

  useEffect(() => {
    fetchData();
  }, effectDeps);

  return { data, loading, error, refetch: fetchData };
}

// ---------------------------------------------------------------------------
// useMutation hook
// ---------------------------------------------------------------------------

/**
 * Hook for executing GraphQL mutations.
 * Does not auto-fire; only executes on explicit call.
 */
export function useMutation<T>(
  client: GraphQLClient,
  mutation: string,
): [
  (variables?: Record<string, unknown>) => Promise<GraphQLResponse<T>>,
  { data: T | null; loading: boolean; error: GraphQLError[] | null },
] {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<GraphQLError[] | null>(null);

  const mutateFn = async (variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> => {
    setLoading(true);
    setError(null);

    try {
      const result = await client.mutate<T>(mutation, variables);
      setData(result.data);
      setError(result.errors);
      setLoading(false);
      return result;
    } catch (err: unknown) {
      const errors: GraphQLError[] = [
        { message: err instanceof Error ? err.message : String(err) },
      ];
      setError(errors);
      setLoading(false);
      return { data: null, errors, extensions: undefined };
    }
  };

  const mutate = useCallback(
    ((...args: unknown[]) => mutateFn(args[0] as Record<string, unknown> | undefined)) as (
      ...args: unknown[]
    ) => unknown,
    [client, mutation],
  ) as unknown as (variables?: Record<string, unknown>) => Promise<GraphQLResponse<T>>;

  return [mutate, { data, loading, error }];
}
