# Custom Hooks

Custom hooks let you extract reusable stateful logic from components. They are regular functions that call built-in hooks internally.

## What Are Custom Hooks

A custom hook is any function whose name starts with `use` and that calls one or more SpecifyJS hooks. Custom hooks let you share behavior between components without duplicating code or introducing wrapper components.

## Naming Convention

Custom hooks must follow the `use*` naming convention. This convention is enforced by linters and signals to developers (and to SpecifyJS) that the function follows the rules of hooks: it must be called at the top level of a component or another hook, never inside conditions or loops.

```typescript
// Good
function useWindowSize() { ... }
function useDocumentTitle(title: string) { ... }

// Bad - not recognized as a hook
function getWindowSize() { ... }
function fetchData() { ... }
```

> **Note:** `useWindowSize` is now a built-in hook provided by SpecifyJS.
> You do not need to write your own — import it directly:
>
> ```typescript
> import { useWindowSize } from 'specifyjs/hooks';
> ```
>
> See the [Responsive Design](responsive-design.md) guide for details on
> `useWindowSize` and other responsive hooks.

## Building a useFetch Hook

A hook that fetches data from an API endpoint:

```typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useFetch<T>(url: string): { data: T | null; loading: boolean; error: string | null } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!cancelled) {
          setData(json as T);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [url]);

  return { data, loading, error };
}
```

Usage in a component:

```typescript
function UserProfile(props: { userId: string }) {
  const { data, loading, error } = useFetch(`/api/users/${props.userId}`);

  if (loading) return createElement('p', null, 'Loading...');
  if (error) return createElement('p', null, `Error: ${error}`);
  return createElement('h1', null, data.name);
}
```

## Building a useLocalStorage Hook

A hook that syncs state with `localStorage`:

```typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [stored, setStored] = useState<T>(() => {
    const item = localStorage.getItem(key);
    return item !== null ? JSON.parse(item) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(stored));
  }, [key, stored]);

  return [stored, setStored];
}
```

Usage:

```typescript
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return createElement('button', {
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  }, `Current theme: ${theme}`);
}
```

## Building a useDebounce Hook

A hook that delays updating a value until input settles:

```typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
```

Usage with a search input:

```typescript
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useFetch(`/api/search?q=${debouncedQuery}`);

  return createElement('div', null,
    createElement('input', {
      value: query,
      onInput: (e) => setQuery(e.target.value),
      placeholder: 'Search...',
    }),
    createElement('ul', null,
      (data || []).map((item) =>
        createElement('li', { key: item.id }, item.title),
      ),
    ),
  );
}
```

## Composing Hooks Together

Custom hooks can call other custom hooks. The `SearchBox` example above already demonstrates this: `useDebounce` and `useFetch` are composed together. You can also create higher-level hooks that combine several primitives:

```typescript
function useDebouncedFetch<T>(url: string, delayMs: number) {
  const debouncedUrl = useDebounce(url, delayMs);
  return useFetch<T>(debouncedUrl);
}
```

## Testing Custom Hooks

Test custom hooks by creating a minimal component that exercises the hook, then render it with `createRoot`:

```typescript
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { act } from 'specifyjs/test-utils';

test('useDebounce delays value', async () => {
  let result: string;

  function TestComponent() {
    result = useDebounce('hello', 100);
    return createElement('span', null, result);
  }

  const container = document.createElement('div');
  const root = createRoot(container);

  act(() => {
    root.render(createElement(TestComponent, null));
  });

  expect(result).toBe('hello');
});
```

For hooks that depend on external APIs (fetch, localStorage), mock those APIs in your test setup to keep tests deterministic and fast.

## Rules of Hooks

Custom hooks follow the same rules as built-in hooks:

1. Only call hooks at the top level of a function component or custom hook.
2. Never call hooks inside conditions, loops, or nested functions.
3. Always call hooks in the same order on every render.

Violating these rules causes a runtime error: "Invalid hook call. Hooks can only be called inside the body of a function component."
