<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Responsive Design

SpecifyJS provides a set of built-in hooks for responsive design:
**useMediaQuery**, **useBreakpoint**, **useWindowSize**, and
**useBreakpointValue**. These hooks let you adapt component behavior,
layout, and data fetching based on the current viewport size — without
reaching for external libraries.

```typescript
import { useMediaQuery, useBreakpoint, useWindowSize, useBreakpointValue } from 'specifyjs/hooks';
import { configureBreakpoints } from 'specifyjs/hooks';
```

---

## Breakpoint System

SpecifyJS ships with a default Tailwind CSS-compatible breakpoint scale:

| Name | Min-width |
|------|-----------|
| `xs` | 0px |
| `sm` | 640px |
| `md` | 768px |
| `lg` | 1024px |
| `xl` | 1280px |
| `2xl` | 1536px |

Breakpoints are always expressed as **minimum widths** (mobile-first).

### Reading Breakpoints

Use `getBreakpoints()` to retrieve the current breakpoint map and
`breakpointQuery()` to get the media query string for a named breakpoint:

```typescript
import { getBreakpoints, breakpointQuery } from 'specifyjs/hooks';

getBreakpoints();
// { xs: 0, sm: 640, md: 768, lg: 1024, xl: 1280, '2xl': 1536 }

breakpointQuery('md');
// '(min-width: 768px)'
```

### Custom Breakpoints

Call `configureBreakpoints()` at app startup to override any subset of the
default scale. Keys you omit keep their defaults.

```typescript
import { configureBreakpoints } from 'specifyjs/hooks';

// Override just sm and lg
configureBreakpoints({ sm: 600, lg: 992 });
```

Call it again to merge a different set with the defaults. Configuration is
global — set it once before rendering.

---

## useMediaQuery

A low-level hook that wraps `window.matchMedia`. It subscribes to changes
and re-renders the component when the query result changes.

```typescript
function useMediaQuery(query: string): boolean;
```

### Example

```typescript
import { createElement } from 'specifyjs';
import { useMediaQuery } from 'specifyjs/hooks';

function DarkModeHint() {
  const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');

  return createElement(
    'p',
    null,
    prefersDark ? 'Dark mode is active.' : 'Light mode is active.',
  );
}
```

### Notes

- Returns `false` during build-time pre-rendering (server-safe).
- The hook adds a single `change` event listener per unique query string
  and cleans it up when the component unmounts.
- For viewport-width checks, prefer `useBreakpoint` or `useBreakpointValue`
  instead of writing raw `(min-width: ...)` queries by hand.

---

## useWindowSize

Returns the current window dimensions as `{ width, height }`. All
components that call `useWindowSize` share a single `resize` event
listener so there is no overhead from multiple subscribers.

```typescript
function useWindowSize(): { width: number; height: number };
```

### Example

```typescript
import { createElement } from 'specifyjs';
import { useWindowSize } from 'specifyjs/hooks';

function ViewportLabel() {
  const { width, height } = useWindowSize();
  return createElement('span', null, `${width} x ${height}`);
}
```

### Notes

- Returns `{ width: 0, height: 0 }` during build-time pre-rendering
  where `window` is not available.
- The resize listener is debounced internally so rapid resize events do
  not trigger excessive re-renders.

---

## useBreakpoint

Returns the **name** of the currently active breakpoint (the largest
breakpoint whose min-width the viewport meets). Useful for conditional
rendering based on device class.

```typescript
function useBreakpoint(): Breakpoint;
// Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
```

### Example

```typescript
import { createElement } from 'specifyjs';
import { useBreakpoint } from 'specifyjs/hooks';

function Navigation() {
  const bp = useBreakpoint();

  if (bp === 'xs' || bp === 'sm') {
    return createElement(MobileNav, null);
  }
  return createElement(DesktopNav, null);
}
```

---

## useBreakpointValue

Maps a set of breakpoint-keyed values to the current viewport. You provide
an object whose keys are breakpoint names and whose values are the
corresponding return value. The hook picks the value for the largest
matching breakpoint.

```typescript
function useBreakpointValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined;
```

### Example: Responsive Columns

```typescript
import { createElement } from 'specifyjs';
import { useBreakpointValue } from 'specifyjs/hooks';
import { Grid, GridItem } from 'specifyjs/components/layout/grid';

function ProductGrid(props: { items: Product[] }) {
  const columns = useBreakpointValue({ xs: 1, sm: 2, lg: 3, xl: 4 }) ?? 1;

  return createElement(
    Grid,
    { columns, gap: '16px' },
    props.items.map((item) =>
      createElement(GridItem, { key: item.id }, createElement(ProductCard, { item })),
    ),
  );
}
```

### Example: Responsive Props

```typescript
const fontSize = useBreakpointValue({ xs: '14px', md: '16px', xl: '18px' });
const padding = useBreakpointValue({ xs: '8px', lg: '24px' });
```

You do not need to supply every breakpoint. The hook falls back to the
nearest smaller breakpoint that has a value.

---

## Patterns: CSS vs. JS

Use CSS media queries for **styling** and JS hooks for **conditional
rendering and data fetching**.

| Use case | Approach |
|----------|----------|
| Adjust font size, padding, colors | CSS `@media` queries or Tailwind utility classes |
| Hide/show a decorative element | CSS `display: none` via media query |
| Render entirely different component trees | `useBreakpoint` / `useBreakpointValue` |
| Fetch different data for mobile vs desktop | `useBreakpoint` to pick an endpoint |
| Lazy-load heavy assets only on large screens | `useMediaQuery` with `lazy()` |

**Why not always use JS?** CSS media queries avoid JavaScript execution
and re-renders entirely. They are the right tool when only visual styling
changes. Reserve the JS hooks for situations where the DOM tree itself
needs to differ or where JavaScript logic depends on the viewport.

---

## Grid Integration

The `Grid` component from `specifyjs/components/layout/grid` has built-in
responsive breakpoint support via its `responsive` prop. Each entry in the
array is a `GridBreakpoint` that overrides columns, rows, or gap at a
given min-width.

```typescript
import { createElement } from 'specifyjs';
import { Grid, GridItem } from 'specifyjs/components/layout/grid';

const layout = createElement(
  Grid,
  {
    columns: 1,
    gap: '12px',
    responsive: [
      { minWidth: '640px', columns: 2 },
      { minWidth: '1024px', columns: 3, gap: '24px' },
    ],
  },
  createElement(GridItem, null, 'A'),
  createElement(GridItem, null, 'B'),
  createElement(GridItem, null, 'C'),
);
```

### Breakpoint Name Shorthand

`GridBreakpoint` also accepts an optional `breakpoint` property (of type
`Breakpoint`) as a shorthand for `minWidth`. When you provide a breakpoint
name, the min-width is resolved from the configured breakpoint scale
automatically:

```typescript
responsive: [
  { breakpoint: 'sm', columns: 2 },
  { breakpoint: 'lg', columns: 3, gap: '24px' },
]
```

This is equivalent to specifying `minWidth: '640px'` and
`minWidth: '1024px'` with the default scale. If both `breakpoint` and
`minWidth` are provided, `breakpoint` takes precedence.

---

## Desktop Layouts with Mobile Fallback

When building desktop-first layouts, design the mobile layout as your
base and layer complexity at larger breakpoints. This ensures content is
always accessible on small screens even if responsive styles fail to load.

```typescript
function AppShell() {
  const bp = useBreakpoint();
  const isDesktop = bp === 'lg' || bp === 'xl' || bp === '2xl';

  return createElement(
    'div',
    { style: { display: 'flex', flexDirection: isDesktop ? 'row' : 'column' } },
    isDesktop ? createElement(Sidebar, null) : null,
    createElement('main', null, createElement(RouterOutlet, null)),
    isDesktop ? null : createElement(MobileBottomNav, null),
  );
}
```

On viewports narrower than `lg`, the sidebar is omitted and a bottom
navigation bar appears instead — a natural mobile fallback that requires
no additional CSS overrides.

---

## Summary

| Hook | Returns | Use when you need... |
|------|---------|----------------------|
| `useMediaQuery` | `boolean` | Raw media query match (e.g. `prefers-color-scheme`) |
| `useWindowSize` | `{ width, height }` | Exact pixel dimensions |
| `useBreakpoint` | `Breakpoint` name | Current breakpoint name for branching |
| `useBreakpointValue` | `T` | A value that varies per breakpoint |
