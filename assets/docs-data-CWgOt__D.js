const t=[{title:"Overview",children:[{title:"SpecifyJS Documentation",path:"README",content:`# SpecifyJS Documentation

Welcome to the SpecifyJS documentation — a comprehensive guide to building declarative, performant web applications with zero runtime dependencies.

## Quick Start

| Topic | Link | Description |
|-------|------|-------------|
| Getting Started | [guides/getting-started.md](guides/getting-started.md) | Install, create your first app, build |
| Core Concepts | [guides/core-concepts.md](guides/core-concepts.md) | Components, props, state, lifecycle |
| Routing | [guides/routing.md](guides/routing.md) | Hash-based SPA routing |
| Forms | [guides/forms-and-validation.md](guides/forms-and-validation.md) | Controlled inputs, validation |

---

## Part I: Foundations

- [Getting Started](guides/getting-started.md) — Installation, first component, dev server, build
- [Core Concepts](guides/core-concepts.md) — Elements, components, props, state, effects, fragments, keys
- [TypeScript Patterns](guides/typescript.md) — Typing components, hooks, events, and context
- [Styling](guides/styling.md) — Inline styles, CSS classes, theming, dark mode

## Part II: Essential Patterns

- [Routing & Navigation](guides/routing.md) — Router, Route, Link, useRouter, useParams, useNavigate
- [State Management](guides/state-management.md) — useState, useReducer, Context, custom stores
- [Forms & Validation](guides/forms-and-validation.md) — Controlled inputs, validation, multi-step forms
- [Custom Hooks](guides/custom-hooks.md) — Building reusable logic with hooks
- [Meta Tags & SEO](guides/meta-tags.md) — useHead, Open Graph, CSP headers
- [Feature Flags](guides/feature-flags.md) — FeatureFlagProvider, FeatureGate, runtime toggling

## Part III: Advanced Topics

- [Performance Optimization](guides/performance.md) — memo, useMemo, useCallback, profiling
- [Concurrent Rendering](guides/concurrent-rendering.md) — useTransition, useDeferredValue, lanes
- [Code Splitting](guides/code-splitting.md) — lazy(), Suspense, route-based splitting
- [Error Handling](guides/error-handling.md) — ErrorBoundary, recovery, logging
- [Accessibility](guides/accessibility.md) — ARIA, keyboard nav, screen readers, focus management
- [Building SPAs](guides/building-spas.md) — Single-page application architecture

## Part IV: Production

- [Production Builds](guides/production-builds.md) — Minification, tree-shaking, bundle size
- [Deployment](guides/deployment.md) — GitHub Pages, Netlify, Vercel, custom domains
- [Testing](guides/testing.md) — Unit (Vitest), integration (jsdom), E2E (Playwright)
- [Browser Support](guides/browser-support.md) — Compatibility matrix, polyfills
- [Migrating from React](guides/migrating-from-react.md) — API mapping, key differences

## Part V: Troubleshooting

- [Troubleshooting & FAQ](guides/troubleshooting.md) — Common issues, debugging tips, gotchas

---

## API Reference

- [Components](api/components.md) — createElement, Fragment, Context, Refs, memo, lazy, forwardRef
- [Hooks](api/hooks.md) — All 16 hooks with signatures and examples
- [DOM](api/dom.md) — createRoot, hydrateRoot, createPortal, flushSync
- [Server](api/server.md) — renderToString, renderToStaticMarkup, streaming APIs
- [Types](api/types.md) — SpecElement, SpecNode, SpecChild, SpecContext

## Architecture

- [Overview](architecture/README.md) — High-level system design
- [Virtual DOM](architecture/virtual-dom.md) — Element types, diffing, symbols
- [Fiber & Reconciler](architecture/fiber-reconciler.md) — Fiber tree, work loop, keyed reconciliation
- [Hooks Internals](architecture/hooks-internals.md) — Hook state, dispatcher, effect system
- [Event System](architecture/event-system.md) — Synthetic events, delegation, normalization

## Component Library

- [Component Reference](components/README.md) — 62 components across 8 categories
- **Layout**: [Grid](components/layout/grid.md), [FlexContainer](components/layout/flex-container.md), [Card](components/layout/card.md), [Panel](components/layout/panel.md), [Splitter](components/layout/splitter.md), [Tabs](components/layout/tabs.md), [ScrollContainer](components/layout/scroll-container.md)
- **Form**: [TextField](components/form/textfield.md), [Select](components/form/select.md), [Checkbox](components/form/checkbox.md), [Toggle](components/form/toggle.md), [Slider](components/form/slider.md), [DatePicker](components/form/datepicker.md), [TimePicker](components/form/timepicker.md), [ColorPicker](components/form/color-picker.md), [FileUpload](components/form/file-upload.md), [NumberSpinner](components/form/number-spinner.md), [TextEditor](components/form/texteditor.md)
- **Navigation**: [Dropdown](components/nav/dropdown.md), [TreeNav](components/nav/treenav.md), [Accordion](components/nav/accordion.md), [Breadcrumb](components/nav/breadcrumb.md), [Pagination](components/nav/pagination.md), [Stepper](components/nav/stepper.md), [Sidebar](components/nav/sidebar.md), [Toolbar](components/nav/toolbar.md), [Menubar](components/nav/menubar.md)
- **Overlay**: [Modal](components/overlay/modal.md), [Drawer](components/overlay/drawer.md), [Popover](components/overlay/popover.md), [Tooltip](components/overlay/tooltip.md), [Toast](components/overlay/toast.md), [ContextMenu](components/overlay/context-menu.md)
- **Data**: [DataGrid](components/data/data-grid.md), [ListView](components/data/list-view.md), [VirtualScroll](components/data/virtual-scroll.md), [Tag](components/data/tag.md), [Badge](components/data/badge.md), [Avatar](components/data/avatar.md)
- **Feedback**: [ProgressBar](components/feedback/progress-bar.md), [Spinner](components/feedback/spinner.md), [Skeleton](components/feedback/skeleton.md), [Alert](components/feedback/alert.md), [EmptyState](components/feedback/empty-state.md)
- **Media**: [Image](components/media/image.md), [Carousel](components/media/carousel.md), [VideoPlayer](components/media/video-player.md)
- **Visualization**: [VizWrapper](components/viz/wrapper.md), [BarGraph](components/viz/2D-bar-graph.md), [LineGraph](components/viz/2D-line-graph.md), [PieGraph](components/viz/2D-pie-graph.md), [HypercubeGraph](components/viz/graph.md)

## Contributing

- [Development Setup](contributing/README.md) — Clone, install, run tests
- [Code Style](contributing/code-style.md) — TypeScript conventions, formatting
- [CI/CD](contributing/ci-cd.md) — GitHub Actions, testing with act
`}]},{title:"Guides",children:[{title:"Accessibility",path:"guides/accessibility",content:`# Accessibility

Building accessible applications ensures that all users -- including those who rely on assistive technologies, keyboard navigation, or alternative input devices -- can interact with your UI. SpecifyJS renders standard DOM elements, so all native accessibility features of HTML and ARIA are available through \`createElement\`.

## ARIA Attributes

Pass ARIA attributes as props. SpecifyJS forwards them directly to the DOM:

\`\`\`typescript
import { createElement } from 'specifyjs';

function Alert(props: { message: string }) {
  return createElement('div', {
    role: 'alert',
    'aria-live': 'assertive',
  }, props.message);
}

function ProgressBar(props: { value: number; max: number }) {
  return createElement('div', {
    role: 'progressbar',
    'aria-valuenow': props.value,
    'aria-valuemin': 0,
    'aria-valuemax': props.max,
    'aria-label': 'Loading progress',
    style: \`width: \${(props.value / props.max) * 100}%\`,
  });
}
\`\`\`

## Semantic HTML

Use the correct HTML elements rather than applying ARIA roles to generic \`div\` and \`span\` elements. Semantic elements carry built-in accessibility semantics that assistive technologies understand without extra attributes:

\`\`\`typescript
function PageLayout() {
  return createElement('div', null,
    createElement('header', null,
      createElement('nav', { 'aria-label': 'Main navigation' },
        createElement('ul', null,
          createElement('li', null, createElement('a', { href: '#home' }, 'Home')),
          createElement('li', null, createElement('a', { href: '#about' }, 'About')),
        ),
      ),
    ),
    createElement('main', null,
      createElement('article', null,
        createElement('h1', null, 'Page Title'),
        createElement('p', null, 'Content goes here.'),
      ),
    ),
    createElement('footer', null,
      createElement('p', null, 'Copyright 2026'),
    ),
  );
}
\`\`\`

Prefer \`button\` over \`div\` with \`onClick\`, \`a\` for navigation, \`input\` and \`label\` for forms, and heading elements (\`h1\`-\`h6\`) for document structure.

## Keyboard Navigation

Interactive components must be operable via keyboard. Handle \`onKeyDown\` to support expected key bindings:

\`\`\`typescript
function DropdownMenu(props: { items: string[]; onSelect: (item: string) => void }) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const handleKeyDown = (e: Event): void => {
    const key = (e as KeyboardEvent).key;
    if (key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => Math.min(i + 1, props.items.length - 1));
    } else if (key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(i => Math.max(i - 1, 0));
    } else if (key === 'Enter') {
      props.onSelect(props.items[activeIndex]);
      setOpen(false);
    } else if (key === 'Escape') {
      setOpen(false);
    }
  };

  return createElement('div', { onKeyDown: handleKeyDown },
    createElement('button', {
      'aria-haspopup': 'listbox',
      'aria-expanded': open,
      onClick: () => setOpen(o => !o),
    }, 'Select item'),
    open
      ? createElement('ul', { role: 'listbox' },
          ...props.items.map((item, i) =>
            createElement('li', {
              key: item,
              role: 'option',
              'aria-selected': i === activeIndex,
              tabindex: i === activeIndex ? 0 : -1,
              onClick: () => { props.onSelect(item); setOpen(false); },
            }, item),
          ),
        )
      : null,
  );
}
\`\`\`

## Focus Management with useRef

Manage focus programmatically when the UI changes -- after opening a modal, navigating to a new route, or revealing content:

\`\`\`typescript
import { useRef, useEffect, createElement } from 'specifyjs';
import type { RefObject } from 'specifyjs';

function Modal(props: { open: boolean; onClose: () => void; children: SpecNode }) {
  const closeRef: RefObject<HTMLButtonElement> = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (props.open) {
      closeRef.current?.focus();
    }
  }, [props.open]);

  if (!props.open) return null;

  return createElement('div', {
    role: 'dialog',
    'aria-modal': true,
    'aria-label': 'Dialog',
  },
    createElement('button', {
      ref: closeRef,
      onClick: props.onClose,
      'aria-label': 'Close dialog',
    }, 'X'),
    props.children,
  );
}
\`\`\`

## Screen Reader Considerations

- **Live regions**: Use \`aria-live="polite"\` for non-urgent updates (e.g., search result counts) and \`aria-live="assertive"\` for critical information (e.g., form errors).
- **Hidden content**: Use \`aria-hidden="true"\` to hide decorative elements from assistive technologies.
- **Labels**: Every interactive element needs an accessible name -- either visible text content, an \`aria-label\`, or an association via \`aria-labelledby\`.
- **Descriptions**: Provide \`aria-describedby\` to link form fields to help text or error messages.

\`\`\`typescript
function FormField(props: { id: string; label: string; error?: string }) {
  const errorId = \`\${props.id}-error\`;
  return createElement('div', null,
    createElement('label', { htmlFor: props.id }, props.label),
    createElement('input', {
      id: props.id,
      'aria-invalid': props.error ? true : undefined,
      'aria-describedby': props.error ? errorId : undefined,
    }),
    props.error
      ? createElement('span', {
          id: errorId,
          role: 'alert',
          'aria-live': 'assertive',
        }, props.error)
      : null,
  );
}
\`\`\`

## Common ARIA Roles

| Role          | Element         | When to use                                   |
|---------------|-----------------|-----------------------------------------------|
| \`alert\`       | \`div\`, \`span\`   | Important messages that need immediate attention |
| \`dialog\`      | \`div\`           | Modal or non-modal dialogs                    |
| \`navigation\`  | \`nav\`           | Groups of navigation links (prefer \`<nav>\`)   |
| \`tablist\`     | \`div\`           | Container for a set of tabs                   |
| \`tab\`         | \`button\`        | Individual tab control                        |
| \`tabpanel\`    | \`div\`           | Content associated with a tab                 |
| \`listbox\`     | \`ul\`            | Selectable list of options                    |
| \`option\`      | \`li\`            | Individual option within a listbox            |
| \`progressbar\` | \`div\`           | Displays progress of a task                   |
| \`status\`      | \`div\`           | Advisory information (pairs with \`aria-live\`)  |

## Testing Accessibility

Validate accessibility at multiple levels:

1. **Automated checks** -- Use axe-core in integration tests to catch missing labels, contrast issues, and invalid ARIA.
2. **Keyboard testing** -- Verify all interactive elements are reachable via Tab, Enter, Space, Escape, and arrow keys.
3. **Screen reader testing** -- Test with VoiceOver, NVDA, or Orca to confirm announcements and navigation flow.
4. **Playwright E2E tests** -- Assert focus position and \`aria-*\` attribute values after interactions.

\`\`\`typescript
// Example Playwright assertion
const dialog = page.locator('[role="dialog"]');
await expect(dialog).toHaveAttribute('aria-modal', 'true');
await expect(dialog.locator('button')).toBeFocused();
\`\`\`

## See Also

- [Core Concepts](./core-concepts.md)
- [API Reference: createElement](../api/create-element.md)
- [API Reference: useRef](../api/hooks.md#useref)
`},{title:"Browser Support",path:"guides/browser-support",content:`# Browser Support

SpecifyJS targets modern browsers with ES2020+ support. The framework has zero runtime dependencies, so browser compatibility is determined solely by the JavaScript and DOM APIs it uses.

## Supported Browsers

| Browser | Minimum Version | Status |
|---------|----------------|--------|
| Chrome / Chromium | Last 2 major versions | Fully supported |
| Firefox | Last 2 major versions | Fully supported |
| Safari | Last 2 major versions | Fully supported |
| Edge (Chromium) | Last 2 major versions | Fully supported |
| iOS Safari | 15+ | Fully supported |
| Chrome for Android | Last 2 major versions | Fully supported |

Older browsers (Internet Explorer, legacy Edge, Safari < 15) are not supported.

## Required Browser APIs

SpecifyJS relies on the following APIs that are available in all supported browsers:

- **ES2020 features** -- \`Promise\`, \`Map\`, \`Set\`, \`WeakMap\`, \`WeakSet\`, \`Symbol\`, optional chaining, nullish coalescing, \`globalThis\`
- **DOM APIs** -- \`document.createElement\`, \`MutationObserver\`, \`requestAnimationFrame\`, \`queueMicrotask\`
- **Fetch API** -- Used by feature flag loading and recommended for data fetching
- **URL / URLSearchParams** -- Used by the router for query string parsing
- **structuredClone** -- Used in some utilities (Chrome 98+, Firefox 94+, Safari 15.4+)

## Polyfill Recommendations

If you need to support slightly older browser versions, the following polyfills can extend compatibility:

| API | Polyfill | When Needed |
|-----|----------|-------------|
| \`structuredClone\` | \`core-js/actual/structured-clone\` | Safari < 15.4 |
| \`queueMicrotask\` | \`core-js/actual/queue-microtask\` | Very old browsers only |
| \`fetch\` | \`whatwg-fetch\` | Only if targeting legacy environments |

Add polyfills at the entry point of your application, before importing SpecifyJS:

\`\`\`typescript
import 'core-js/actual/structured-clone';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
\`\`\`

In most cases, no polyfills are needed if you target the browser versions listed above.

## Platform Support

| Platform | Architecture | Status |
|----------|-------------|--------|
| Linux | AMD64 | First-class (CI runs here) |
| Linux | ARM64 | Planned |
| macOS | Intel / Apple Silicon | Planned |
| Windows | x64 | Planned |

Development and CI are currently validated on Linux AMD64. The framework itself is pure JavaScript and runs identically on all platforms, but build tooling and E2E tests are validated on Linux first.
`},{title:"Building Single-Page Applications",path:"guides/building-spas",content:`# Building Single-Page Applications

SpecifyJS is designed for building SPAs that compile to minified JavaScript for high-performance browser execution.

## Application Structure

A typical SpecifyJS SPA:

\`\`\`
my-app/
  src/
    app.ts          # Root component
    components/     # Reusable components
    hooks/          # Custom hooks
    context/        # Application context providers
  index.html        # HTML shell with <div id="root">
  vite.config.ts    # Build configuration
\`\`\`

## Entry Point

\`\`\`typescript
// src/app.ts
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function App() {
  return createElement('div', { id: 'app' },
    createElement(Router, null),
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(createElement(App, null));
\`\`\`

## State Management

### Local State
Use \`useState\` for component-local state:

\`\`\`typescript
const [items, setItems] = useState<Item[]>([]);
\`\`\`

### Complex State
Use \`useReducer\` for state with multiple actions:

\`\`\`typescript
const [state, dispatch] = useReducer(reducer, initialState);
\`\`\`

### Shared State
Use \`createContext\` + \`useContext\` for app-wide state:

\`\`\`typescript
const AppContext = createContext(defaultState);
\`\`\`

## Performance Patterns

- **\`memo\`** — Skip re-renders when props haven't changed
- **\`useMemo\`** — Cache expensive computations
- **\`useCallback\`** — Stable function references for child components
- **Keys** — Efficient list reconciliation

## Production Build

SpecifyJS apps compile to minified, tree-shaken bundles via Vite/Rollup:

\`\`\`bash
npx vite build
\`\`\`

Target: < 50KB gzipped including framework overhead.

## Example Apps

See \`core/examples/\` for complete working SPAs:

- **Todo App** — Lists, events, filters, refs
- **Counter App** — useReducer, useMemo, useCallback
- **Form App** — Context, controlled inputs, validation

## Next Steps

- [Testing](testing.md) — How to test your SPA
- [Production Builds](production-builds.md) — Optimization and deployment
`},{title:"Code Splitting",path:"guides/code-splitting",content:`# Code Splitting

Code splitting lets you break your application into smaller chunks that are loaded on demand. SpecifyJS supports this through \`lazy()\` for dynamic imports and \`Suspense\` for rendering fallback UI while chunks load.

## lazy() for Dynamic Imports

The \`lazy\` function wraps a dynamic \`import()\` call and returns a component that loads its implementation on first render:

\`\`\`typescript
import { createElement, lazy, Suspense } from 'specifyjs';

const HeavyChart = lazy(() => import('./components/HeavyChart'));

function Dashboard() {
  return createElement(Suspense, { fallback: createElement('p', null, 'Loading chart...') },
    createElement(HeavyChart, { data: chartData }),
  );
}
\`\`\`

The module passed to \`lazy\` must have a \`default\` export that is a SpecifyJS component:

\`\`\`typescript
// components/HeavyChart.ts
export default function HeavyChart(props: { data: number[] }) {
  return createElement('canvas', { className: 'chart' });
}
\`\`\`

## Suspense Boundaries with Fallback

Every \`lazy\` component must be wrapped in a \`Suspense\` boundary. The \`fallback\` prop defines what to show while the component is loading:

\`\`\`typescript
createElement(Suspense, {
  fallback: createElement('div', { className: 'spinner' }, 'Loading...'),
},
  createElement(LazyComponent, null),
);
\`\`\`

You can nest multiple lazy components under a single \`Suspense\` boundary. The fallback is shown until all children within the boundary have loaded:

\`\`\`typescript
createElement(Suspense, { fallback: createElement('p', null, 'Loading page...') },
  createElement(LazyHeader, null),
  createElement(LazyContent, null),
  createElement(LazyFooter, null),
);
\`\`\`

## Route-Based Code Splitting

The most common use of code splitting is at the route level. Each route loads its page component lazily:

\`\`\`typescript
import { createElement, lazy, Suspense } from 'specifyjs';

const HomePage = lazy(() => import('./pages/Home'));
const AboutPage = lazy(() => import('./pages/About'));
const SettingsPage = lazy(() => import('./pages/Settings'));

function App() {
  // Assuming a router that provides currentRoute
  const { currentRoute } = useRouter();

  const pages: Record<string, ReturnType<typeof lazy>> = {
    '/': HomePage,
    '/about': AboutPage,
    '/settings': SettingsPage,
  };

  const Page = pages[currentRoute] || HomePage;

  return createElement(Suspense, {
    fallback: createElement('div', { className: 'page-loader' }, 'Loading...'),
  },
    createElement(Page, null),
  );
}
\`\`\`

This ensures that the JavaScript for each page is only downloaded when the user navigates to that route, reducing the initial bundle size.

## Component-Level Code Splitting

You can also split at the component level for heavy widgets that are not always visible:

\`\`\`typescript
const MarkdownEditor = lazy(() => import('./components/MarkdownEditor'));
const DataGrid = lazy(() => import('./components/DataGrid'));

function AdminPanel() {
  const [showEditor, setShowEditor] = useState(false);

  return createElement('div', null,
    createElement('button', {
      onClick: () => setShowEditor(true),
    }, 'Open Editor'),
    showEditor
      ? createElement(Suspense, {
          fallback: createElement('p', null, 'Loading editor...'),
        },
          createElement(MarkdownEditor, null),
        )
      : null,
  );
}
\`\`\`

The editor chunk is only fetched when the user clicks the button.

## Error Handling with Lazy Components

If a dynamic import fails (network error, missing chunk), the promise rejects and the error propagates up the component tree. Use an error boundary to catch it:

\`\`\`typescript
import { Component } from 'specifyjs';

class LazyErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return createElement('div', { className: 'error' },
        createElement('p', null, 'Failed to load component.'),
        createElement('button', {
          onClick: () => this.setState({ hasError: false }),
        }, 'Retry'),
      );
    }
    return this.props.children;
  }
}

// Usage
createElement(LazyErrorBoundary, null,
  createElement(Suspense, { fallback: createElement('p', null, 'Loading...') },
    createElement(LazyComponent, null),
  ),
);
\`\`\`

When the user clicks "Retry", the error boundary resets and \`lazy\` re-attempts the import. This pattern is essential for production applications where network reliability varies.
`},{title:"Concurrent Rendering",path:"guides/concurrent-rendering",content:`# Concurrent Rendering

Concurrent rendering allows SpecifyJS to work on multiple state updates simultaneously, prioritizing urgent interactions (like typing) over less critical updates (like filtering a large list). This keeps the UI responsive even during expensive renders.

## What Is Concurrent Rendering

In synchronous rendering, every state update blocks the main thread until the entire component tree re-renders. With concurrent rendering, SpecifyJS can interrupt a low-priority render to process a higher-priority update first, then resume or restart the lower-priority work.

Concurrent rendering is enabled automatically when you use \`createRoot\`:

\`\`\`typescript
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
\`\`\`

## Lane-Based Priority System

SpecifyJS uses a lane-based priority system to classify updates. Each update is assigned a lane that determines its urgency:

| Lane | Priority | Use Case |
|------|----------|----------|
| \`SyncLane\` | Highest | \`flushSync\`, discrete user events |
| \`DefaultLane\` | Normal | Standard state updates, event handlers |
| \`TransitionLane\` | Lower | Updates inside \`startTransition\` |

Higher-priority lanes interrupt lower-priority work. When a \`SyncLane\` update arrives while a \`TransitionLane\` render is in progress, the transition render is paused and the sync update is processed first.

## useTransition for Non-Urgent Updates

The \`useTransition\` hook marks a state update as non-urgent. It returns an \`isPending\` flag and a \`startTransition\` function:

\`\`\`typescript
import { useState, useTransition } from 'specifyjs/hooks';
import { createElement } from 'specifyjs';

function SearchableList(props: { items: string[] }) {
  const [query, setQuery] = useState('');
  const [filtered, setFiltered] = useState(props.items);
  const [isPending, startTransition] = useTransition();

  function handleInput(e: Event) {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);                        // Urgent: update the input immediately
    startTransition(() => {
      setFiltered(                          // Non-urgent: filter can wait
        props.items.filter((item) => item.toLowerCase().includes(value.toLowerCase())),
      );
    });
  }

  return createElement('div', null,
    createElement('input', { value: query, onInput: handleInput, placeholder: 'Search...' }),
    isPending
      ? createElement('p', null, 'Filtering...')
      : null,
    createElement('ul', null,
      filtered.map((item) => createElement('li', { key: item }, item)),
    ),
  );
}
\`\`\`

The input field updates instantly because \`setQuery\` is a normal (default lane) update. The list filtering happens inside \`startTransition\`, so it can be interrupted if the user types again before filtering completes.

## useDeferredValue for Expensive Computations

\`useDeferredValue\` returns a deferred copy of a value. The deferred value lags behind during urgent updates, allowing the UI to remain responsive:

\`\`\`typescript
import { useState, useDeferredValue, useMemo } from 'specifyjs/hooks';

function ExpensiveChart(props: { data: number[] }) {
  const [filter, setFilter] = useState('');
  const deferredFilter = useDeferredValue(filter);

  const filteredData = useMemo(() => {
    return props.data.filter((d) => expensiveCheck(d, deferredFilter));
  }, [props.data, deferredFilter]);

  const isStale = filter !== deferredFilter;

  return createElement('div', null,
    createElement('input', {
      value: filter,
      onInput: (e) => setFilter((e.target as HTMLInputElement).value),
    }),
    createElement('div', {
      style: { opacity: isStale ? 0.6 : 1, transition: 'opacity 0.2s' },
    },
      createElement(Chart, { data: filteredData }),
    ),
  );
}
\`\`\`

While the user types, \`deferredFilter\` lags behind \`filter\`. The chart re-renders with the deferred value, which can be interrupted if new input arrives. The stale state is indicated visually by reducing opacity.

## startTransition API

The standalone \`startTransition\` function works the same as the hook version but can be used outside of components:

\`\`\`typescript
import { startTransition } from 'specifyjs';

function handleNavigation(url: string) {
  startTransition(() => {
    setCurrentRoute(url);
  });
}
\`\`\`

State updates inside \`startTransition\` are assigned a \`TransitionLane\`, making them interruptible by higher-priority updates. Unlike \`useTransition\`, the standalone function does not provide an \`isPending\` flag.

## When to Use Concurrent Features

Use concurrent features when a state update triggers an expensive re-render that could block user interaction:

**Good candidates for transitions:**
- Filtering or sorting large lists
- Navigating between routes (loading new page content)
- Updating visualizations or charts with large datasets
- Search-as-you-type with results rendering

**Not needed for:**
- Simple state toggles (show/hide, open/close)
- Form input updates with minimal re-renders
- State changes that affect only a small subtree

### Guidelines

1. Keep urgent updates (text input, button feedback) outside \`startTransition\`.
2. Wrap expensive, non-blocking updates in \`startTransition\` or use \`useDeferredValue\`.
3. Show visual feedback during pending transitions (spinners, opacity changes).
4. Do not overuse transitions. Most updates are fast enough without them. Profile first, then optimize.
5. Combine \`useMemo\` with \`useDeferredValue\` to avoid recomputing expensive derived data on every keystroke.
`},{title:"Core Concepts",path:"guides/core-concepts",content:`# Core Concepts

## Elements

SpecifyJS elements are lightweight objects describing what to render:

\`\`\`typescript
const element = createElement('div', { className: 'card' },
  createElement('h2', null, 'Title'),
  createElement('p', null, 'Content'),
);
\`\`\`

## Function Components

Components are functions that return elements:

\`\`\`typescript
function Greeting(props: { name: string }) {
  return createElement('h1', null, \`Hello, \${props.name}!\`);
}
\`\`\`

## Props

Props are read-only inputs passed to components:

\`\`\`typescript
createElement(Greeting, { name: 'World' });
\`\`\`

Reserved props: \`key\` (reconciliation identity) and \`ref\` (DOM/instance access).

## State

Components manage local state with \`useState\`:

\`\`\`typescript
function Counter() {
  const [count, setCount] = useState(0);
  return createElement('button', {
    onClick: () => setCount(prev => prev + 1),
  }, \`Clicked \${count} times\`);
}
\`\`\`

## Lifecycle (Effects)

Side effects run after rendering:

\`\`\`typescript
function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setSeconds(s => s + 1), 1000);
    return () => clearInterval(id); // Cleanup
  }, []); // Empty deps = run once

  return createElement('span', null, \`\${seconds}s\`);
}
\`\`\`

## Context

Share values through the component tree without prop drilling:

\`\`\`typescript
const ThemeContext = createContext('light');

function App() {
  return createElement(ThemeContext.Provider, { value: 'dark' },
    createElement(ThemedButton, null),
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return createElement('button', { className: theme }, 'Click');
}
\`\`\`

## Fragments

Group children without extra DOM nodes:

\`\`\`typescript
createElement(Fragment, null,
  createElement('span', null, 'A'),
  createElement('span', null, 'B'),
);
\`\`\`

## Keys

Use \`key\` for efficient list reconciliation:

\`\`\`typescript
items.map(item =>
  createElement('li', { key: item.id }, item.name)
);
\`\`\`

## Next Steps

- [Hooks API](../api/hooks.md) — Full hook reference
- [Building SPAs](building-spas.md) — Application patterns
`},{title:"Custom Hooks",path:"guides/custom-hooks",content:`# Custom Hooks

Custom hooks let you extract reusable stateful logic from components. They are regular functions that call built-in hooks internally.

## What Are Custom Hooks

A custom hook is any function whose name starts with \`use\` and that calls one or more SpecifyJS hooks. Custom hooks let you share behavior between components without duplicating code or introducing wrapper components.

## Naming Convention

Custom hooks must follow the \`use*\` naming convention. This convention is enforced by linters and signals to developers (and to SpecifyJS) that the function follows the rules of hooks: it must be called at the top level of a component or another hook, never inside conditions or loops.

\`\`\`typescript
// Good
function useWindowSize() { ... }
function useDocumentTitle(title: string) { ... }

// Bad - not recognized as a hook
function getWindowSize() { ... }
function fetchData() { ... }
\`\`\`

## Building a useFetch Hook

A hook that fetches data from an API endpoint:

\`\`\`typescript
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
        if (!res.ok) throw new Error(\`HTTP \${res.status}\`);
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
\`\`\`

Usage in a component:

\`\`\`typescript
function UserProfile(props: { userId: string }) {
  const { data, loading, error } = useFetch(\`/api/users/\${props.userId}\`);

  if (loading) return createElement('p', null, 'Loading...');
  if (error) return createElement('p', null, \`Error: \${error}\`);
  return createElement('h1', null, data.name);
}
\`\`\`

## Building a useLocalStorage Hook

A hook that syncs state with \`localStorage\`:

\`\`\`typescript
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
\`\`\`

Usage:

\`\`\`typescript
function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');

  return createElement('button', {
    onClick: () => setTheme(theme === 'light' ? 'dark' : 'light'),
  }, \`Current theme: \${theme}\`);
}
\`\`\`

## Building a useDebounce Hook

A hook that delays updating a value until input settles:

\`\`\`typescript
import { useState, useEffect } from 'specifyjs/hooks';

function useDebounce<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);

  return debounced;
}
\`\`\`

Usage with a search input:

\`\`\`typescript
function SearchBox() {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const { data } = useFetch(\`/api/search?q=\${debouncedQuery}\`);

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
\`\`\`

## Composing Hooks Together

Custom hooks can call other custom hooks. The \`SearchBox\` example above already demonstrates this: \`useDebounce\` and \`useFetch\` are composed together. You can also create higher-level hooks that combine several primitives:

\`\`\`typescript
function useDebouncedFetch<T>(url: string, delayMs: number) {
  const debouncedUrl = useDebounce(url, delayMs);
  return useFetch<T>(debouncedUrl);
}
\`\`\`

## Testing Custom Hooks

Test custom hooks by creating a minimal component that exercises the hook, then render it with \`createRoot\`:

\`\`\`typescript
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
\`\`\`

For hooks that depend on external APIs (fetch, localStorage), mock those APIs in your test setup to keep tests deterministic and fast.

## Rules of Hooks

Custom hooks follow the same rules as built-in hooks:

1. Only call hooks at the top level of a function component or custom hook.
2. Never call hooks inside conditions, loops, or nested functions.
3. Always call hooks in the same order on every render.

Violating these rules causes a runtime error: "Invalid hook call. Hooks can only be called inside the body of a function component."
`},{title:"Deployment",path:"guides/deployment",content:`# Deployment

This guide covers building SpecifyJS applications for production and deploying them to common hosting platforms.

## Building for Production

SpecifyJS applications use Vite (backed by Rollup) for production builds. The build process produces minified, tree-shaken JavaScript bundles optimized for browser delivery.

\`\`\`bash
npx vite build
\`\`\`

This outputs files to the \`dist/\` directory:

\`\`\`
dist/
  index.html
  assets/
    index-abc123.js    # Hashed JS bundle
    style-def456.css   # Hashed CSS (if applicable)
\`\`\`

### Vite Configuration

A minimal \`vite.config.ts\` for a SpecifyJS SPA:

\`\`\`typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
\`\`\`

The framework targets less than 15KB minified and gzipped for the core library. Applications should aim for under 50KB gzipped total, including framework overhead.

## Deploying to GitHub Pages

GitHub Pages serves static files from a branch or directory.

1. Set the \`base\` option in \`vite.config.ts\` to your repository name:

\`\`\`typescript
export default defineConfig({
  base: '/your-repo-name/',
});
\`\`\`

2. Build the project:

\`\`\`bash
npx vite build
\`\`\`

3. Deploy using the \`gh-pages\` package or a GitHub Actions workflow:

\`\`\`yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
      - run: npm ci
      - run: npx vite build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: \${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
\`\`\`

For hash-based routing (\`/#/about\`), no special server configuration is needed since GitHub Pages always serves \`index.html\` for the root path.

## Deploying to Netlify

1. Create a \`netlify.toml\` in the project root:

\`\`\`toml
[build]
  command = "npx vite build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
\`\`\`

The redirect rule ensures that client-side routes work when the user refreshes or navigates directly to a deep URL.

2. Connect your repository to Netlify via the dashboard, or use the Netlify CLI:

\`\`\`bash
npx netlify deploy --prod --dir=dist
\`\`\`

## Deploying to Vercel

1. Create a \`vercel.json\` in the project root:

\`\`\`json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
\`\`\`

2. Deploy with the Vercel CLI:

\`\`\`bash
npx vercel --prod
\`\`\`

## Environment Variables

Vite exposes environment variables prefixed with \`VITE_\` to client-side code:

\`\`\`bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-000000
\`\`\`

Access them in your application:

\`\`\`typescript
const apiUrl = import.meta.env.VITE_API_URL;
\`\`\`

Never put secrets (API keys, tokens) in \`VITE_\` variables. They are embedded in the client bundle and visible to anyone. Use server-side API endpoints to proxy requests that require authentication.

## CNAME and Custom Domain Setup

### GitHub Pages

Create a \`CNAME\` file in your \`public/\` directory (so Vite copies it to \`dist/\`):

\`\`\`
app.example.com
\`\`\`

Then configure your DNS provider to point \`app.example.com\` to \`your-username.github.io\` with a CNAME record.

### Netlify / Vercel

Both platforms provide custom domain configuration through their dashboards. Add your domain and follow the DNS instructions they provide. Both handle TLS certificates automatically.

When using a custom domain, set the \`base\` option in Vite to \`/\` instead of the repository name.

## Source Maps in Production

Source maps help debug production issues but expose your source code. Configure them based on your needs:

\`\`\`typescript
export default defineConfig({
  build: {
    // Full source maps (uploaded to error tracking, not served publicly)
    sourcemap: 'hidden',
    // Or disable entirely
    // sourcemap: false,
  },
});
\`\`\`

- \`true\` -- Source maps are generated and referenced in the bundle. Useful for development.
- \`'hidden'\` -- Source maps are generated but not referenced. Upload them to error tracking services (Sentry, Datadog) without exposing them to users.
- \`false\` -- No source maps generated.

## Performance Verification

After deploying, verify your application meets performance targets:

1. **Lighthouse audit** -- Run Chrome DevTools Lighthouse in Incognito mode. Target a score above 90 for Performance.
2. **Bundle analysis** -- Use \`npx vite-bundle-visualizer\` to identify oversized chunks.
3. **First paint** -- Initial content should render within 100ms on modern hardware.
4. **Network** -- Confirm assets are served with proper cache headers (\`Cache-Control: max-age=31536000, immutable\` for hashed files).
5. **Compression** -- Verify your host serves Brotli or gzip-compressed assets.

\`\`\`bash
# Check compressed size of your bundle
gzip -9 -c dist/assets/index-*.js | wc -c
\`\`\`
`},{title:"Error Handling",path:"guides/error-handling",content:`# Error Handling

Errors in a UI tree can leave the entire application in a broken state. SpecifyJS provides **error boundaries** -- class components that catch errors during rendering, lifecycle methods, and constructors of any component below them in the tree.

## What Happens When a Component Throws

When a component throws during rendering, SpecifyJS walks up the fiber tree looking for an ancestor with \`componentDidCatch\` or \`getDerivedStateFromError\`. If one is found, the boundary captures the error and re-renders with fallback UI. If no boundary exists, the entire tree unmounts.

## Using the Built-in ErrorBoundary

SpecifyJS exports a ready-made \`ErrorBoundary\` component. Wrap any subtree that might fail:

\`\`\`typescript
import { createElement, ErrorBoundary } from 'specifyjs';

function App() {
  return createElement(ErrorBoundary, {
    fallback: createElement('p', null, 'Something went wrong.'),
    onError: (error: unknown, info: ErrorInfo) => {
      console.error('Caught by boundary:', error, info.componentStack);
    },
  },
    createElement(UnstableWidget, null),
  );
}
\`\`\`

The \`ErrorBoundaryProps\` interface accepts:

| Prop       | Type                                         | Purpose                               |
|------------|----------------------------------------------|---------------------------------------|
| \`fallback\` | \`SpecNode\`                                   | UI rendered when an error is caught   |
| \`onError\`  | \`(error: unknown, info: ErrorInfo) => void\`  | Callback for logging or side effects  |
| \`children\` | \`SpecNode\`                                   | Normal child tree                     |

## Building a Custom Error Boundary

Any class component becomes an error boundary when it implements one or both of the static and instance lifecycle methods:

\`\`\`typescript
import { Component, createElement } from 'specifyjs';
import type { SpecNode, ErrorInfo, Props } from 'specifyjs';

interface BoundaryProps extends Props {
  children?: SpecNode;
}

interface BoundaryState {
  hasError: boolean;
  error: unknown;
}

class CustomBoundary extends Component<BoundaryProps, BoundaryState> {
  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    // Update state so the next render shows fallback UI.
    return { hasError: true, error };
  }

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Side effects: send to a logging service, analytics, etc.
    reportErrorToService(error, info.componentStack);
  }

  render(): SpecNode {
    if (this.state.hasError) {
      return createElement('div', { role: 'alert' },
        createElement('h2', null, 'Unexpected Error'),
        createElement('pre', null, String(this.state.error)),
      );
    }
    return this.props.children ?? null;
  }
}
\`\`\`

### getDerivedStateFromError vs componentDidCatch

- **\`getDerivedStateFromError(error)\`** -- A static method called during the render phase. It returns a partial state update used to switch to fallback UI. It must be a pure function with no side effects.
- **\`componentDidCatch(error, info)\`** -- An instance method called during the commit phase. Use it for side effects like error logging. The \`info\` argument contains a \`componentStack\` string showing the component ancestry.

## Fallback UI Patterns

### Simple message

\`\`\`typescript
createElement(ErrorBoundary, {
  fallback: createElement('p', null, 'This section is unavailable.'),
}, children);
\`\`\`

### Retry button

\`\`\`typescript
class RetryBoundary extends Component<BoundaryProps, BoundaryState> {
  static getDerivedStateFromError(error: unknown): Partial<BoundaryState> {
    return { hasError: true, error };
  }

  constructor(props: BoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render(): SpecNode {
    if (this.state.hasError) {
      return createElement('div', { role: 'alert' },
        createElement('p', null, 'Something went wrong.'),
        createElement('button', { onClick: this.handleRetry }, 'Try Again'),
      );
    }
    return this.props.children ?? null;
  }
}
\`\`\`

Calling \`setState\` to clear the error causes the boundary to attempt rendering the children again.

## Error Recovery Strategies

1. **Retry rendering** -- Reset the boundary state to re-mount children (shown above).
2. **Granular boundaries** -- Place boundaries around individual widgets rather than the entire app. A failing sidebar should not take down the main content area.
3. **Progressive degradation** -- Show reduced functionality in fallback UI rather than a blank screen.
4. **Route-level boundaries** -- Wrap each route in a boundary so navigation errors are isolated.

## Logging Errors

Use the \`onError\` prop (built-in boundary) or \`componentDidCatch\` (custom boundary) to send errors to external services:

\`\`\`typescript
function logError(error: unknown, componentStack: string): void {
  fetch('/api/errors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      componentStack,
      timestamp: Date.now(),
    }),
  });
}
\`\`\`

## Error Boundaries and Async Operations

Error boundaries catch errors thrown **synchronously** during rendering and lifecycle methods. They do **not** catch errors inside event handlers or asynchronous code (promises, \`setTimeout\`). Handle those with standard try/catch and local state:

\`\`\`typescript
function DataLoader() {
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/data')
      .then(res => res.json())
      .then(d => setData(d.value))
      .catch(err => setError(err.message));
  }, []);

  if (error) {
    return createElement('p', { role: 'alert' }, \`Load failed: \${error}\`);
  }
  return createElement('p', null, data ?? 'Loading...');
}
\`\`\`

Combine both patterns for full coverage: an error boundary around the component tree and local error state for async work within individual components.

## See Also

- [API Reference: ErrorBoundary](../api/error-boundary.md)
- [API Reference: Component](../api/component.md)
- [Core Concepts](./core-concepts.md)
`},{title:"Feature Flags",path:"guides/feature-flags",content:`# Feature Flags

SpecifyJS includes a built-in feature flag system based on the Context API. It allows you to gate UI features behind boolean flags, load flag configuration from static JSON, and toggle flags at runtime.

## FeatureFlagProvider

Wrap your application (or a subtree) in \`FeatureFlagProvider\` to make flags available to all descendants:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { FeatureFlagProvider } from 'specifyjs/features';
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));

root.render(
  createElement(FeatureFlagProvider, {
    defaults: { darkMode: true, newDashboard: false },
  },
    createElement(App, null),
  ),
);
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| \`defaults\` | \`Record<string, boolean>\` | Initial flag values applied immediately. |
| \`url\` | \`string\` | URL to fetch a JSON object of flag overrides from. |
| \`children\` | \`SpecNode\` | Child components that can consume flags. |

When both \`defaults\` and \`url\` are provided, defaults are applied first, then remote flags are merged on top once the fetch completes.

## Loading Flags from Static JSON

Point the \`url\` prop at a static JSON file served over HTTPS:

\`\`\`typescript
createElement(FeatureFlagProvider, {
  url: 'https://cdn.example.com/flags.json',
  defaults: { betaFeature: false },
},
  createElement(App, null),
);
\`\`\`

The JSON file should be a flat object mapping flag names to booleans:

\`\`\`json
{ "betaFeature": true, "newCheckout": false }
\`\`\`

The provider sanitizes incoming JSON, stripping \`__proto__\`, \`constructor\`, and \`prototype\` keys to prevent prototype pollution.

## FeatureGate Component

\`FeatureGate\` conditionally renders children based on whether a flag is enabled:

\`\`\`typescript
import { FeatureGate } from 'specifyjs/features';

function Dashboard() {
  return createElement('div', null,
    createElement(FeatureGate, { flag: 'newDashboard' },
      createElement(NewDashboard, null),
    ),
    createElement(FeatureGate, {
      flag: 'newDashboard',
      fallback: createElement(LegacyWidget, null),
    },
      createElement(NewWidget, null),
    ),
  );
}
\`\`\`

### Props

| Prop | Type | Description |
|------|------|-------------|
| \`flag\` | \`string\` | The flag name to check. |
| \`children\` | \`SpecNode\` | Rendered when the flag is enabled. |
| \`fallback\` | \`SpecNode\` | Rendered when the flag is disabled (defaults to \`null\`). |

## useFeatureFlags Hook

For programmatic access, use the \`useFeatureFlags\` hook:

\`\`\`typescript
import { useFeatureFlags } from 'specifyjs/features';

function SettingsPanel() {
  const { flags, isEnabled, setFlag, loading } = useFeatureFlags();

  if (loading) {
    return createElement('p', null, 'Loading flags...');
  }

  return createElement('div', null,
    createElement('p', null, \`Dark mode: \${isEnabled('darkMode')}\`),
    createElement('button', {
      onClick: () => setFlag('darkMode', !isEnabled('darkMode')),
    }, 'Toggle Dark Mode'),
  );
}
\`\`\`

### Return Value

| Property | Type | Description |
|----------|------|-------------|
| \`flags\` | \`Record<string, boolean>\` | Current flag state object. |
| \`isEnabled\` | \`(flag: string) => boolean\` | Returns \`true\` if the named flag is enabled. |
| \`setFlag\` | \`(flag: string, enabled: boolean) => void\` | Updates a flag at runtime. |
| \`loading\` | \`boolean\` | \`true\` while remote flags are being fetched. |

## Toggling Flags at Runtime

Flags can be changed at runtime using \`setFlag\`. This triggers a re-render of all components consuming the flag context:

\`\`\`typescript
function AdminToolbar() {
  const { setFlag, isEnabled } = useFeatureFlags();

  return createElement('label', null,
    createElement('input', {
      type: 'checkbox',
      checked: isEnabled('experimentalEditor'),
      onChange: (e) => setFlag('experimentalEditor', e.target.checked),
    }),
    ' Enable experimental editor',
  );
}
\`\`\`

Runtime flag changes are not persisted. To persist them, combine \`setFlag\` with \`localStorage\` or an API call in your application code.
`},{title:"Forms and Validation",path:"guides/forms-and-validation",content:`# Forms and Validation

This guide covers building forms in SpecifyJS, from basic inputs to complex multi-step wizards with async validation.

## Controlled Components

SpecifyJS forms follow the controlled component pattern: the component state is the single source of truth, and user input is fed back through event handlers.

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';

function NameInput() {
  const [name, setName] = useState('');

  return createElement('input', {
    type: 'text',
    value: name,
    onInput: (e: Event) => setName((e.target as HTMLInputElement).value),
  });
}
\`\`\`

The \`value\` prop locks the input to the current state. The \`onInput\` handler updates state on every keystroke, which triggers a re-render with the new value. This gives you full control over what the user sees and lets you intercept, transform, or reject input before it reaches the DOM.

## Building a Basic Form

A typical form composes multiple controlled inputs and handles submission:

\`\`\`typescript
function ContactForm() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    console.log({ name, email });
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement('label', null, 'Name'),
    createElement('input', {
      type: 'text',
      value: name,
      onInput: (e: Event) => setName((e.target as HTMLInputElement).value),
    }),
    createElement('label', null, 'Email'),
    createElement('input', {
      type: 'email',
      value: email,
      onInput: (e: Event) => setEmail((e.target as HTMLInputElement).value),
    }),
    createElement('button', { type: 'submit' }, 'Send'),
  );
}
\`\`\`

Always call \`e.preventDefault()\` in the submit handler to prevent the browser from performing a full page navigation.

## Using FormFieldWrapper for Consistent Styling

The \`FormFieldWrapper\` component provides a standardized container with label, help text, error display, required indicator, and disabled styling. All form components in the \`@specifyjs/components\` library use it internally.

\`\`\`typescript
import { FormFieldWrapper } from '@specifyjs/form-wrapper';

function StyledInput() {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | undefined>();

  return createElement(FormFieldWrapper, {
    label: 'Username',
    required: true,
    helpText: 'Choose a unique username',
    error: error,
  },
    createElement('input', {
      type: 'text',
      value: value,
      onInput: (e: Event) => {
        const v = (e.target as HTMLInputElement).value;
        setValue(v);
        setError(v.length < 3 ? 'Must be at least 3 characters' : undefined);
      },
    }),
  );
}
\`\`\`

The wrapper handles label-to-input linking via \`htmlFor\`, displays a red asterisk for required fields, and switches between help text and error messages automatically. Customize colors, fonts, and spacing through the \`styling\` prop.

For single-line text inputs, the pre-built \`TextField\` component wraps \`FormFieldWrapper\` with focus/blur state management, prefix/suffix addon slots, and keyboard handling (e.g., \`onEnter\`):

\`\`\`typescript
import { TextField } from '@specifyjs/textfield';

createElement(TextField, {
  label: 'Email',
  type: 'email',
  value: email,
  onChange: setEmail,
  error: emailError,
  required: true,
  placeholder: 'you@example.com',
});
\`\`\`

## Input Validation Patterns

### Inline Validation

Validate on every change or on blur. Blur validation avoids showing errors while the user is still typing:

\`\`\`typescript
function ValidatedEmail() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const validate = (value: string): string | undefined => {
    if (!value) return 'Email is required';
    if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value)) return 'Invalid email address';
    return undefined;
  };

  return createElement(TextField, {
    label: 'Email',
    type: 'email',
    value: email,
    onChange: setEmail,
    onBlur: (v: string) => setError(validate(v)),
    error: error,
    required: true,
  });
}
\`\`\`

### Form-Level Validation

For forms with many fields, centralize validation in a single function that returns an errors map:

\`\`\`typescript
interface FormData { name: string; age: string; email: string; }
type Errors = Partial<Record<keyof FormData, string>>;

function validateForm(data: FormData): Errors {
  const errors: Errors = {};
  if (!data.name) errors.name = 'Name is required';
  if (!data.age || Number(data.age) < 18) errors.age = 'Must be 18 or older';
  if (!data.email) errors.email = 'Email is required';
  return errors;
}

function RegistrationForm() {
  const [data, setData] = useState<FormData>({ name: '', age: '', email: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  const update = (field: keyof FormData) => (value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
    if (submitted) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleSubmit = (e: Event) => {
    e.preventDefault();
    setSubmitted(true);
    const errs = validateForm(data);
    setErrors(errs);
    if (Object.keys(errs).length === 0) {
      // Submit the data
    }
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement(TextField, { label: 'Name', value: data.name, onChange: update('name'), error: errors.name, required: true }),
    createElement(TextField, { label: 'Age', type: 'number', value: data.age, onChange: update('age'), error: errors.age, required: true }),
    createElement(TextField, { label: 'Email', type: 'email', value: data.email, onChange: update('email'), error: errors.email, required: true }),
    createElement('button', { type: 'submit' }, 'Register'),
  );
}
\`\`\`

### Custom Validation with useReducer

For complex validation logic, \`useReducer\` keeps state transitions predictable:

\`\`\`typescript
type Action =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'VALIDATE' }
  | { type: 'RESET' };

function formReducer(state: FormState, action: Action): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, values: { ...state.values, [action.field]: action.value } };
    case 'VALIDATE':
      return { ...state, errors: validateForm(state.values) };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}
\`\`\`

## Displaying Validation Errors

When using \`FormFieldWrapper\` or \`TextField\`, pass the \`error\` prop. The wrapper automatically renders the error with \`role="alert"\` for screen readers. For custom error displays:

\`\`\`typescript
createElement('div', { className: 'error-summary', role: 'alert' },
  Object.entries(errors).map(([field, msg]) =>
    createElement('p', { key: field, style: { color: '#ef4444' } }, \`\${field}: \${msg}\`),
  ),
);
\`\`\`

## Async Validation

Use \`useEffect\` with a debounce pattern to validate against a server:

\`\`\`typescript
function UsernameField() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | undefined>();
  const [checking, setChecking] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (username.length < 3) {
      setError(username ? 'Too short' : undefined);
      return;
    }
    setChecking(true);
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(async () => {
      const res = await fetch(\`/api/check-username?u=\${encodeURIComponent(username)}\`);
      const { available } = await res.json();
      setError(available ? undefined : 'Username is taken');
      setChecking(false);
    }, 400);
    return () => clearTimeout(timerRef.current);
  }, [username]);

  return createElement(TextField, {
    label: 'Username',
    value: username,
    onChange: setUsername,
    error: error,
    suffix: checking ? 'Checking...' : null,
    required: true,
  });
}
\`\`\`

## Select and Radio Groups

Build select dropdowns and radio groups as controlled components:

\`\`\`typescript
function ColorPicker() {
  const [color, setColor] = useState('red');

  return createElement(FormFieldWrapper, { label: 'Favorite Color' },
    createElement('select', {
      value: color,
      onChange: (e: Event) => setColor((e.target as HTMLSelectElement).value),
    },
      createElement('option', { value: 'red' }, 'Red'),
      createElement('option', { value: 'green' }, 'Green'),
      createElement('option', { value: 'blue' }, 'Blue'),
    ),
  );
}

function SizeSelector() {
  const [size, setSize] = useState('medium');
  const sizes = ['small', 'medium', 'large'];

  return createElement(FormFieldWrapper, { label: 'Size' },
    ...sizes.map(s =>
      createElement('label', { key: s, style: { marginRight: '12px' } },
        createElement('input', {
          type: 'radio',
          name: 'size',
          value: s,
          checked: size === s,
          onChange: () => setSize(s),
        }),
        \` \${s}\`,
      ),
    ),
  );
}
\`\`\`

## File Uploads

Use an uncontrolled input (type \`file\` cannot be controlled) and read the file via a ref or event:

\`\`\`typescript
function FileUpload() {
  const [fileName, setFileName] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFile = async (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    setFileName(file.name);
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    await fetch('/api/upload', { method: 'POST', body: formData });
    setUploading(false);
  };

  return createElement(FormFieldWrapper, { label: 'Attachment' },
    createElement('input', { type: 'file', onChange: handleFile }),
    fileName ? createElement('span', null, uploading ? 'Uploading...' : \`Selected: \${fileName}\`) : null,
  );
}
\`\`\`

## Date and Time Pickers

Use native HTML date/time inputs as controlled components:

\`\`\`typescript
function DateRange() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  return createElement('div', { style: { display: 'flex', gap: '16px' } },
    createElement(TextField, { label: 'Start Date', type: 'date' as any, value: start, onChange: setStart }),
    createElement(TextField, { label: 'End Date', type: 'date' as any, value: end, onChange: setEnd,
      error: end && start && end < start ? 'End must be after start' : undefined }),
  );
}
\`\`\`

## Multi-Step Forms (Wizards)

Track the current step in state and render one section at a time:

\`\`\`typescript
function WizardForm() {
  const [step, setStep] = useState(0);
  const [data, setData] = useState({ name: '', email: '', plan: 'free' });

  const steps = [
    () => createElement(TextField, { label: 'Name', value: data.name, onChange: (v: string) => setData(d => ({ ...d, name: v })) }),
    () => createElement(TextField, { label: 'Email', type: 'email', value: data.email, onChange: (v: string) => setData(d => ({ ...d, email: v })) }),
    () => createElement('div', null,
      createElement('h3', null, 'Confirm'),
      createElement('p', null, \`Name: \${data.name}\`),
      createElement('p', null, \`Email: \${data.email}\`),
    ),
  ];

  return createElement('div', null,
    createElement('p', null, \`Step \${step + 1} of \${steps.length}\`),
    steps[step](),
    createElement('div', { style: { display: 'flex', gap: '8px', marginTop: '16px' } },
      step > 0
        ? createElement('button', { onClick: () => setStep(s => s - 1) }, 'Back')
        : null,
      step < steps.length - 1
        ? createElement('button', { onClick: () => setStep(s => s + 1) }, 'Next')
        : createElement('button', { onClick: () => console.log('Submit', data) }, 'Submit'),
    ),
  );
}
\`\`\`

## Best Practices

1. **Prefer controlled components.** Keeping form state in SpecifyJS gives you full control over validation, formatting, and conditional logic.

2. **Validate on blur for UX, on submit for safety.** Show errors after the user finishes a field, but always re-validate the entire form before submitting.

3. **Debounce async validation.** Network requests on every keystroke waste bandwidth and create race conditions. Use a 300-500ms delay.

4. **Use \`FormFieldWrapper\` for consistency.** It handles labels, errors, required indicators, and accessibility attributes so you do not have to.

5. **Set \`aria-invalid\` and \`role="alert"\`.** Screen readers need these attributes to announce validation errors. \`FormFieldWrapper\` and \`TextField\` handle this automatically.

6. **Avoid derived state.** Do not store both the raw value and a "cleaned" version. Derive formatted values during render with \`useMemo\` instead.

7. **Disable the submit button during async operations.** Prevent duplicate submissions by tracking a \`submitting\` state flag.

8. **Use \`key\` props on dynamic field lists.** When fields are added or removed dynamically, stable keys prevent input state from jumping between fields.
`},{title:"Getting Started",path:"guides/getting-started",content:`# Getting Started

## Prerequisites

- Node.js 24+
- npm 10+

## Installation

\`\`\`bash
cd core
npm install
\`\`\`

## Create Your First Component

SpecifyJS uses \`createElement\` (or JSX) to describe UI:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { createRoot } from 'specifyjs/dom';

function App() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('h1', null, \`Count: \${count}\`),
    createElement('button', {
      onClick: () => setCount(count + 1)
    }, 'Increment'),
  );
}

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
\`\`\`

## Development Server

Start the Vite dev server for hot-reloading:

\`\`\`bash
npx vite --port 3000
\`\`\`

## Build for Production

\`\`\`bash
npm run build
\`\`\`

Output lands in \`dist/\` with ESM and CJS bundles.

## Run Tests

\`\`\`bash
npm test              # Unit + integration (465 tests)
npm run test:e2e      # Playwright browser tests (27 tests)
npm run test:coverage # Tests with coverage report
\`\`\`

## Next Steps

- [Core Concepts](core-concepts.md) — Components, props, state
- [Hooks API](../api/hooks.md) — All 16 hooks
- [Building SPAs](building-spas.md) — SPA patterns and examples
`},{title:"Meta Tags",path:"guides/meta-tags",content:`# Meta Tags

The \`useHead\` hook lets components declaratively manage document \`<head>\` meta tags. Tags are applied when the component mounts and cleaned up when it unmounts, preventing stale metadata from persisting across route changes.

## useHead Hook API

\`\`\`typescript
import { useHead } from 'specifyjs/hooks';

function AboutPage() {
  useHead({
    title: 'About Us',
    description: 'Learn about our team and mission.',
    keywords: 'about, team, company',
    author: 'SpecifyJS Team',
  });

  return createElement('h1', null, 'About Us');
}
\`\`\`

### Options

| Property | Type | Description |
|----------|------|-------------|
| \`title\` | \`string\` | Sets \`document.title\`. |
| \`description\` | \`string\` | Sets \`<meta name="description">\`. |
| \`keywords\` | \`string\` | Sets \`<meta name="keywords">\` (comma-separated). |
| \`author\` | \`string\` | Sets \`<meta name="author">\`. |
| \`canonical\` | \`string\` | Adds a \`<link rel="canonical">\` element. |
| \`og\` | \`Record<string, string>\` | Open Graph \`<meta property="og:*">\` tags. |
| \`twitter\` | \`Record<string, string>\` | Twitter Card \`<meta name="twitter:*">\` tags. |
| \`httpEquiv\` | \`HeadHttpEquiv\` | HTTP-equiv meta tags. |
| \`meta\` | \`Array<{ name?, property?, content }>\` | Arbitrary meta tags. |

## Setting Title, Description, Keywords, Author

Each property maps to a standard HTML meta tag:

\`\`\`typescript
useHead({
  title: 'Product Page - MyApp',
  description: 'Browse our product catalog with free shipping.',
  keywords: 'products, catalog, shopping',
  author: 'MyApp Inc.',
  canonical: 'https://myapp.com/products',
});
\`\`\`

## Open Graph Tags

Open Graph tags control how your page appears when shared on social media:

\`\`\`typescript
useHead({
  title: 'Blog Post Title',
  og: {
    title: 'Blog Post Title',
    description: 'A summary of the blog post.',
    image: 'https://myapp.com/images/post-og.png',
    url: 'https://myapp.com/blog/post-slug',
    type: 'article',
    site_name: 'MyApp Blog',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@myapp',
    title: 'Blog Post Title',
    image: 'https://myapp.com/images/post-og.png',
  },
});
\`\`\`

Each key in the \`og\` object becomes \`<meta property="og:key" content="value">\`. Each key in the \`twitter\` object becomes \`<meta name="twitter:key" content="value">\`.

## HTTP-equiv Meta Tags

HTTP-equiv meta tags set browser-level policies. The \`httpEquiv\` option provides named shortcuts for common security headers:

\`\`\`typescript
useHead({
  httpEquiv: {
    csp: "default-src 'self'; script-src 'self'",
    referrer: 'strict-origin-when-cross-origin',
    contentType: 'nosniff',
    cacheControl: 'no-cache, no-store, must-revalidate',
  },
});
\`\`\`

### Named Shortcuts

| Key | HTTP-equiv header |
|-----|-------------------|
| \`csp\` | \`Content-Security-Policy\` |
| \`referrer\` | \`Referrer-Policy\` |
| \`contentType\` | \`X-Content-Type-Options\` |
| \`frameOptions\` | \`X-Frame-Options\` |
| \`cacheControl\` | \`Cache-Control\` |

You can also pass arbitrary http-equiv names as keys:

\`\`\`typescript
useHead({
  httpEquiv: {
    'X-Custom-Header': 'custom-value',
  },
});
\`\`\`

## Cleanup on Unmount

When the component calling \`useHead\` unmounts, all meta tags it created are removed. Tags that existed before the component mounted have their previous values restored. This automatic cleanup prevents stale meta tags from accumulating as users navigate between routes:

\`\`\`typescript
function ProductPage(props: { product: Product }) {
  // These tags are set on mount and removed on unmount
  useHead({
    title: \`\${props.product.name} - Shop\`,
    description: props.product.summary,
    og: {
      title: props.product.name,
      image: props.product.imageUrl,
    },
  });

  return createElement('div', null,
    createElement('h1', null, props.product.name),
    createElement('p', null, props.product.summary),
  );
}
\`\`\`

The dependency array includes all head properties, so if props change (e.g., navigating to a different product), the tags are updated accordingly.
`},{title:"Migrating from React",path:"guides/migrating-from-react",content:"# Migrating from React\n\nSpecifyJS is designed with React API parity. Most React code works with minimal changes.\n\n## Quick Start\n\n1. Replace imports:\n\n```diff\n- import React from 'react';\n- import ReactDOM from 'react-dom/client';\n+ import { createElement, useState, useEffect } from 'specifyjs';\n+ import { createRoot } from 'specifyjs/dom';\n```\n\n2. Replace JSX pragma (if not using automatic runtime):\n\n```json\n// tsconfig.json\n{\n  \"compilerOptions\": {\n    \"jsx\": \"react-jsx\",\n    \"jsxImportSource\": \"specifyjs\"\n  }\n}\n```\n\n## API Mapping\n\n| React | SpecifyJS | Notes |\n|-------|----------|-------|\n| `React.createElement` | `createElement` | Identical API |\n| `ReactDOM.createRoot` | `createRoot` | from `specifyjs/dom` |\n| `ReactDOM.hydrateRoot` | `hydrateRoot` | from `specifyjs/dom` |\n| `React.useState` | `useState` | Identical |\n| `React.useEffect` | `useEffect` | Identical |\n| `React.useTransition` | `useTransition` | Lane-based concurrent |\n| `React.useDeferredValue` | `useDeferredValue` | Lane-based concurrent |\n| `React.startTransition` | `startTransition` | Identical |\n| `ReactDOM.flushSync` | `flushSync` | from `specifyjs/dom` |\n| `React.memo` | `memo` | Identical |\n| `React.forwardRef` | `forwardRef` | Identical |\n| `React.lazy` | `lazy` | Identical |\n| `React.createContext` | `createContext` | Identical |\n| `React.createFactory` | `createFactory` | Deprecated, supported |\n| `renderToString` | `renderToString` | from `specifyjs/server` (build-time only) |\n| `renderToPipeableStream` | `renderToPipeableStream` | from `specifyjs/server` (build-time only) |\n| `renderToReadableStream` | `renderToReadableStream` | from `specifyjs/server` (build-time only) |\n\n> **Note:** Unlike React, SpecifyJS does NOT support server-side rendering at request time. The `specifyjs/server` module is for **static pre-rendering during builds** only. Dynamic content should be fetched client-side via HTTPS.\n\n## Legacy API Support\n\nSpecifyJS supports React's legacy rendering API for incremental migration:\n\n```typescript\nimport { render, hydrate, unmountComponentAtNode } from 'specifyjs/dom';\n\n// Legacy render (React 17 style)\nrender(element, container);\n\n// Legacy hydrate\nhydrate(element, container);\n\n// Legacy unmount\nunmountComponentAtNode(container);\n```\n\n## Key Differences\n\n### No Default Export\nSpecifyJS uses named exports exclusively. There is no default `React` object.\n\n### Zero Runtime Dependencies\nSpecifyJS has no dependencies. All algorithms (diffing, scheduling, event normalization) are implemented from scratch.\n\n### TypeScript-First\nAll APIs have full TypeScript type definitions. No `@types/` package needed.\n\n### Concurrent Rendering\nSpecifyJS implements lane-based concurrent rendering with the same priority levels as React 18:\n- `SyncLane` for `flushSync`\n- `DefaultLane` for normal updates\n- `TransitionLane` for `startTransition`/`useTransition`\n\n### SVG Support\nSVG elements are rendered with the correct SVG namespace (`createElementNS`).\n\n### Web Components\nCustom elements (tags with hyphens) receive complex prop values as DOM properties rather than string attributes.\n\n## What's Not Supported\n\n- React Server Components (RSC)\n- `use()` hook (React 19)\n- `useOptimistic` (React 19)\n- `useFormStatus` / `useFormState` (React 19)\n- React Native\n"},{title:"Performance Optimization",path:"guides/performance",content:`# Performance Optimization

This guide explains how SpecifyJS renders, why unnecessary work happens, and the tools available to eliminate it.

## How SpecifyJS Renders

SpecifyJS uses a three-phase rendering pipeline:

1. **Begin work** -- Traverse the fiber tree top-down. For each component fiber, call the component function to produce new elements, then reconcile the returned children against the previous tree.
2. **Complete work** -- Walk the tree bottom-up, building or updating real DOM nodes for host fibers (div, span, etc.).
3. **Commit** -- Apply all accumulated DOM mutations in a single synchronous batch, then run effects (\`useEffect\`, \`useLayoutEffect\`).

Each fiber carries a lane bitmask indicating the priority of its pending update. The scheduler processes high-priority lanes (user input, \`flushSync\`) before lower-priority ones (transitions). During concurrent rendering, the begin-work phase can yield to the browser between fibers, keeping the main thread responsive.

## Why Unnecessary Re-Renders Happen

A component re-renders whenever its parent re-renders, regardless of whether its props changed. Consider:

\`\`\`typescript
function Parent() {
  const [count, setCount] = useState(0);
  return createElement('div', null,
    createElement('button', { onClick: () => setCount(c => c + 1) }, 'Increment'),
    createElement(ExpensiveChild, null),  // re-renders every time
  );
}
\`\`\`

\`ExpensiveChild\` receives no props that change, yet it re-renders on every click because \`Parent\` creates a new element for it each time. This is where memoization helps.

## memo() for Component Memoization

Wrap a component with \`memo\` to skip re-rendering when its props have not changed (shallow comparison by default):

\`\`\`typescript
import { memo, createElement } from 'specifyjs';

const ExpensiveChild = memo(function ExpensiveChild(props: { data: string }) {
  // Only re-renders when props.data changes
  return createElement('div', null, computeExpensiveLayout(props.data));
});
\`\`\`

Supply a custom comparator for more control:

\`\`\`typescript
const Chart = memo(ChartComponent, (prev, next) => {
  return prev.data.length === next.data.length && prev.theme === next.theme;
});
\`\`\`

Return \`true\` to skip the re-render, \`false\` to allow it -- the opposite of \`shouldComponentUpdate\`.

## useMemo() for Expensive Computations

When a render involves heavy computation, cache the result with \`useMemo\`:

\`\`\`typescript
function FilteredList(props: { items: Item[]; query: string }) {
  const filtered = useMemo(
    () => props.items.filter(item => item.name.includes(props.query)),
    [props.items, props.query],
  );

  return createElement('ul', null,
    filtered.map(item =>
      createElement('li', { key: item.id }, item.name),
    ),
  );
}
\`\`\`

The filter function only runs when \`items\` or \`query\` changes. Without \`useMemo\`, it would run on every render of the parent.

## useCallback() for Stable Function References

Functions defined inside a component are recreated on every render. When passed as props to memoized children, this defeats \`memo\`:

\`\`\`typescript
function Parent() {
  const [count, setCount] = useState(0);

  // Unstable: new function every render
  const handleClick = () => console.log('clicked');

  // Stable: same reference unless deps change
  const stableHandleClick = useCallback(() => console.log('clicked'), []);

  return createElement('div', null,
    createElement(MemoizedButton, { onClick: stableHandleClick }),
  );
}
\`\`\`

Use \`useCallback\` when passing functions to \`memo\`-wrapped children or as dependencies of \`useEffect\`.

## Key Props for Efficient List Reconciliation

The reconciler uses \`key\` props to match old and new children in a list. Without keys, it compares by position, which causes unnecessary DOM mutations when items are inserted, removed, or reordered:

\`\`\`typescript
// Good: stable, unique keys
items.map(item =>
  createElement(Row, { key: item.id, data: item }),
);

// Bad: index keys cause problems on reorder
items.map((item, i) =>
  createElement(Row, { key: i, data: item }),
);
\`\`\`

Use a stable identifier from your data (database ID, slug, etc.) as the key. Avoid array indices unless the list is static and never reordered.

## Lazy Loading with lazy() and Suspense

Split your bundle by lazily loading components that are not needed on initial render:

\`\`\`typescript
import { lazy, createElement, Suspense } from 'specifyjs';

const Settings = lazy(() => import('./Settings'));

function App() {
  return createElement(Suspense, { fallback: createElement('div', null, 'Loading...') },
    createElement(Settings, null),
  );
}
\`\`\`

\`lazy\` accepts a function that returns a dynamic \`import()\` promise. The component is fetched only when it first renders. Until the module resolves, \`Suspense\` displays the fallback. This reduces the initial bundle size and speeds up first paint.

Place \`Suspense\` boundaries at meaningful UI divisions: route-level panels, modal content, or dashboard widgets.

## Concurrent Rendering with useTransition and useDeferredValue

### useTransition

Mark state updates as non-urgent so they do not block user input:

\`\`\`typescript
function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  const handleInput = (e: Event) => {
    const value = (e.target as HTMLInputElement).value;
    setQuery(value);  // Urgent: update the input immediately

    startTransition(() => {
      setResults(filterLargeDataset(value));  // Non-urgent: can be interrupted
    });
  };

  return createElement('div', null,
    createElement('input', { value: query, onInput: handleInput }),
    isPending
      ? createElement('div', null, 'Updating...')
      : createElement('ul', null,
          results.map(r => createElement('li', { key: r }, r)),
        ),
  );
}
\`\`\`

Updates inside \`startTransition\` receive a lower-priority lane. If a higher-priority update arrives (another keystroke), the in-progress transition is interrupted and restarted with the latest state.

### useDeferredValue

Defer an expensive derived value so the UI stays responsive:

\`\`\`typescript
function HeavyVisualization(props: { data: number[] }) {
  const deferredData = useDeferredValue(props.data);

  // deferredData may lag behind props.data during rapid updates
  const chart = useMemo(() => buildChart(deferredData), [deferredData]);

  return createElement('div', null, chart);
}
\`\`\`

## Bundle Size Optimization

### Tree-Shaking

Import only what you use. SpecifyJS is structured as named exports so bundlers can eliminate unused code:

\`\`\`typescript
// Good: only pulls in createElement and useState
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';

// Avoid: barrel imports that may pull in the entire library
import * as Spec from 'specifyjs';
\`\`\`

### Code Splitting

Use dynamic \`import()\` at route boundaries to split the bundle:

\`\`\`typescript
const routes: Record<string, ReturnType<typeof lazy>> = {
  '/dashboard': lazy(() => import('./pages/Dashboard')),
  '/settings': lazy(() => import('./pages/Settings')),
  '/profile': lazy(() => import('./pages/Profile')),
};
\`\`\`

Each route loads its own chunk on demand.

## Profiling with StrictMode

\`StrictMode\` intentionally double-renders components in development to surface impure renders and side effects:

\`\`\`typescript
import { StrictMode, createElement } from 'specifyjs';

createElement(StrictMode, null,
  createElement(App, null),
);
\`\`\`

If a component behaves differently across the two renders (e.g., it mutates external state during render), you have a purity violation that can cause bugs in concurrent mode. Fix these before optimizing.

## Common Performance Anti-Patterns

### Creating objects and arrays inline in props

\`\`\`typescript
// Bad: new object every render defeats memo
createElement(Child, { style: { color: 'red' } });

// Good: stable reference
const style = useMemo(() => ({ color: 'red' }), []);
createElement(Child, { style });
\`\`\`

### Defining components inside other components

\`\`\`typescript
// Bad: new component type every render, destroys all child state
function Parent() {
  function Child() { return createElement('div', null, 'hi'); }
  return createElement(Child, null);
}

// Good: define outside
function Child() { return createElement('div', null, 'hi'); }
function Parent() { return createElement(Child, null); }
\`\`\`

### Over-lifting state

Lifting state to a common ancestor is correct when siblings need to share it. But lifting state to the root when only a leaf needs it forces the entire tree to re-render. Keep state as close to its consumers as possible.

### Premature splitting of contexts

A single context with a large value causes every consumer to re-render on any change. Split contexts by update frequency:

\`\`\`typescript
// Separate rarely-changing config from frequently-changing state
const ThemeContext = createContext('light');
const UserInputContext = createContext('');
\`\`\`

## When NOT to Optimize

Not every re-render is a problem. Measure before optimizing:

1. **Most components are fast.** A component that returns a few elements takes microseconds to render. Wrapping it in \`memo\` adds comparison overhead that may exceed the render cost.

2. **Do not memoize everything.** \`useMemo\` and \`useCallback\` consume memory for the cached value and its dependency array. Use them when profiling shows a measurable improvement.

3. **Profile first.** Use browser DevTools Performance tab or the SpecifyJS \`Profiler\` component to identify actual bottlenecks. Optimize the slowest 5%, not the entire tree.

4. **Avoid premature code splitting.** Splitting a 2KB component into its own chunk adds a network round trip that costs more than the bytes saved. Split at meaningful boundaries where chunks are 20KB or larger.

5. **Readable code wins.** If an optimization makes the code significantly harder to understand, reconsider. Ship the simple version first and optimize when users report slowness.

## Summary Checklist

- Use \`key\` props on all list items with stable identifiers
- Wrap expensive pure components in \`memo\`
- Stabilize function props with \`useCallback\` when passed to memoized children
- Cache expensive computations with \`useMemo\`
- Split routes with \`lazy\` and \`Suspense\`
- Use \`startTransition\` for non-urgent updates that render large trees
- Keep state close to its consumers
- Define components outside of render functions
- Profile before optimizing -- measure, do not guess
`},{title:"Production Builds",path:"guides/production-builds",content:`# Production Builds

## Library Build

Build the SpecifyJS library for distribution:

\`\`\`bash
cd core
npm run build
\`\`\`

Outputs:
- \`dist/specifyjs.esm.js\` — ES module (14KB)
- \`dist/specifyjs.cjs.js\` — CommonJS (15KB)
- \`dist/specifyjs-dom.esm.js\` — DOM renderer (40KB)
- \`dist/specifyjs-server.esm.js\` — Pre-rendering (11KB)
- \`dist/specifyjs.d.ts\` — TypeScript declarations

## Application Build

Build a SpecifyJS SPA for deployment using Vite:

\`\`\`bash
npx vite build
\`\`\`

Vite automatically:
- Tree-shakes unused code
- Minifies with esbuild/Terser
- Generates source maps
- Code-splits dynamic imports

## Bundle Size Targets

- Core framework: < 15KB gzipped
- Full app (core + DOM renderer): < 50KB gzipped

## Optimization Tips

1. Use \`memo\` to prevent unnecessary re-renders
2. Use \`useMemo\`/\`useCallback\` for expensive operations
3. Use \`lazy\` for code splitting large components
4. Minimize component depth — flatter trees diff faster

`},{title:"Routing",path:"guides/routing",content:"# Routing\n\nSpecifyJS includes a built-in hash-based router for single-page applications. The router listens to changes in the URL hash (`window.location.hash`) and renders components conditionally based on the current path. No server configuration is required -- the router works on any static file host, including GitHub Pages, S3, and Netlify.\n\n## Why Hash-Based Routing\n\nTraditional path-based routing (e.g., `/users/123`) requires the server to rewrite all requests to `index.html`. Hash-based routing (e.g., `#/users/123`) avoids this entirely because browsers never send the hash fragment to the server. This means:\n\n- **Zero server configuration** -- deploy to any static host and routing works immediately.\n- **No 404 errors** -- refreshing the page always loads `index.html`, then the hash router picks up the path.\n- **Bookmark-friendly** -- users can share and bookmark URLs with hash paths.\n\n## Basic Setup\n\nWrap your application in a `Router` component. This subscribes to `hashchange` events and provides routing context to all descendant components.\n\n```typescript\nimport { createElement } from 'specifyjs';\nimport { createRoot } from 'specifyjs/dom';\nimport { Router, Route } from 'specifyjs/router';\n\nfunction App() {\n  return createElement(Router, null,\n    createElement(Route, { path: '/', exact: true, component: HomePage }),\n    createElement(Route, { path: '/about', component: AboutPage }),\n    createElement(Route, { path: '/contact', component: ContactPage }),\n  );\n}\n\ncreateRoot(document.getElementById('root')!).render(createElement(App));\n```\n\nThe `Router` component must be an ancestor of any `Route`, `Link`, or router hook usage. You typically place it at the top of your component tree.\n\n## Defining Routes\n\nThe `Route` component renders its content when the current hash path matches the `path` pattern.\n\n```typescript\n// Render a component\ncreateElement(Route, { path: '/dashboard', component: Dashboard })\n\n// Render children directly\ncreateElement(Route, { path: '/settings' },\n  createElement('h1', null, 'Settings'),\n)\n```\n\n### RouteProps\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `path` | `string` | Path pattern to match (e.g., `'/users/:id'`). |\n| `component` | `FunctionComponent` | Component to render. Receives matched params as props. |\n| `exact` | `boolean` | If `true`, the entire pathname must match. Default: `false`. |\n| `children` | `SpecNode` | Alternative to `component` -- render children when matched. |\n\n### Exact Matching\n\nWithout `exact`, a route with `path=\"/\"` matches every path because `/` is a prefix of all paths. Use `exact` for your root route:\n\n```typescript\ncreateElement(Route, { path: '/', exact: true, component: HomePage })\n```\n\n## Navigation with Link\n\nThe `Link` component renders an anchor tag (`<a>`) that navigates by updating the hash without a full page reload:\n\n```typescript\nimport { Link } from 'specifyjs/router';\n\nfunction NavBar() {\n  return createElement('nav', null,\n    createElement(Link, { to: '/' }, 'Home'),\n    createElement(Link, { to: '/about' }, 'About'),\n    createElement(Link, { to: '/contact' }, 'Contact'),\n  );\n}\n```\n\n### LinkProps\n\n| Prop | Type | Description |\n|------|------|-------------|\n| `to` | `string` | Target path (e.g., `'/about'`). |\n| `className` | `string` | CSS class name for the anchor element. |\n| `activeClassName` | `string` | Additional class applied when the link's path matches the current route. |\n| `exact` | `boolean` | If `true`, `activeClassName` requires an exact path match. Default: `false`. |\n| `children` | `SpecNode` | Link text or content. |\n\nAdditional props are spread onto the underlying `<a>` element.\n\n### Active Link Styling\n\nUse `activeClassName` to highlight the current route in your navigation:\n\n```typescript\ncreateElement(Link, {\n  to: '/dashboard',\n  className: 'nav-link',\n  activeClassName: 'nav-link--active',\n  exact: true,\n}, 'Dashboard')\n```\n\nWhen the user is on `#/dashboard`, the anchor receives both classes: `nav-link nav-link--active`. The `exact` prop controls whether partial path matches also activate the class.\n\n## Route Parameters\n\nDefine dynamic segments in your path pattern with the `:paramName` syntax. Matched values are passed as props to the `component` and are available via `useParams()`:\n\n```typescript\nfunction UserProfile(props: { id: string }) {\n  return createElement('h1', null, `User #${props.id}`);\n}\n\n// In your route definitions:\ncreateElement(Route, { path: '/users/:id', component: UserProfile })\n```\n\nWhen the user navigates to `#/users/42`, the `UserProfile` component receives `{ id: '42' }` as props. Parameter values are automatically URI-decoded.\n\n## Wildcard Routes\n\nA trailing `*` segment matches all remaining path segments. The matched portion is available as `params['*']`:\n\n```typescript\nfunction FileViewer(props: { '*': string }) {\n  return createElement('p', null, `Viewing: ${props['*']}`);\n}\n\ncreateElement(Route, { path: '/files/*', component: FileViewer })\n```\n\nNavigating to `#/files/docs/readme.md` renders `\"Viewing: docs/readme.md\"`. Wildcard routes are useful for catch-all pages and file-browser-style UIs.\n\n## Programmatic Navigation\n\nUse the `useNavigate` hook to navigate from event handlers, effects, or any logic inside a component:\n\n```typescript\nimport { useNavigate } from 'specifyjs/router';\n\nfunction LoginForm() {\n  const navigate = useNavigate();\n\n  const handleSubmit = () => {\n    // ... perform login logic\n    navigate('/dashboard');\n  };\n\n  return createElement('button', { onClick: handleSubmit }, 'Log In');\n}\n```\n\n### Replace vs. Push\n\nBy default, `navigate` pushes a new entry onto the browser history stack. Pass `{ replace: true }` to replace the current entry instead, which prevents the user from navigating back to the current page with the browser's back button:\n\n```typescript\nnavigate('/dashboard', { replace: true });\n```\n\nThis is useful after form submissions, redirects, or login flows where going \"back\" would be confusing.\n\n## Reading Router State\n\nThe `useRouter` hook returns the full routing context:\n\n```typescript\nimport { useRouter } from 'specifyjs/router';\n\nfunction Breadcrumb() {\n  const router = useRouter();\n  return createElement('span', null, `Current path: ${router.pathname}`);\n}\n```\n\n### RouterContextValue\n\n| Property | Type | Description |\n|----------|------|-------------|\n| `pathname` | `string` | Current hash pathname (e.g., `'/users/123'`). |\n| `params` | `Record<string, string>` | Matched route parameters from the nearest `Route`. |\n| `navigate` | `(to: string, options?) => void` | Navigate function. |\n| `basePath` | `string` | Base path for nested routing (the parent route's matched URL). |\n\n## Extracting Parameters\n\nThe `useParams` hook returns the matched route parameters from the nearest `Route` ancestor. It supports a generic type parameter for type safety:\n\n```typescript\nimport { useParams } from 'specifyjs/router';\n\nfunction ProductDetail() {\n  const params = useParams<{ category: string; id: string }>();\n  return createElement('div', null,\n    createElement('p', null, `Category: ${params.category}`),\n    createElement('p', null, `Product ID: ${params.id}`),\n  );\n}\n\n// Route definition:\ncreateElement(Route, { path: '/products/:category/:id', component: ProductDetail })\n```\n\n## Nested Routing\n\nRoutes can be nested to build layouts with sub-sections. When a `Route` matches, it sets a new `basePath` equal to the matched URL, so child routes are relative to the parent:\n\n```typescript\nfunction DashboardLayout() {\n  return createElement('div', { className: 'dashboard' },\n    createElement('nav', null,\n      createElement(Link, { to: '/dashboard/overview' }, 'Overview'),\n      createElement(Link, { to: '/dashboard/settings' }, 'Settings'),\n    ),\n    createElement('main', null,\n      createElement(Route, { path: '/overview', component: Overview }),\n      createElement(Route, { path: '/settings', component: Settings }),\n    ),\n  );\n}\n\n// Top-level route:\ncreateElement(Route, { path: '/dashboard', component: DashboardLayout })\n```\n\nWhen the user navigates to `#/dashboard/settings`, the parent `Route` matches `/dashboard` and sets `basePath` to `/dashboard`. The child `Route` with `path=\"/settings\"` then matches against the full path `/dashboard/settings`.\n\nParameters from parent routes are merged into child routes, so deeply nested components can access parameters defined at any level via `useParams()`.\n\n## Best Practices\n\n1. **Always use `exact` on your root route** -- without it, `path=\"/\"` matches every URL.\n2. **Prefer `Link` over manual hash manipulation** -- `Link` handles click events, sets `href` for accessibility, and integrates with `activeClassName`.\n3. **Use `replace` for redirects** -- after login or form submission, use `navigate(path, { replace: true })` to keep browser history clean.\n4. **Type your params** -- use the generic parameter on `useParams<{ id: string }>()` to catch typos at compile time.\n5. **Keep route definitions co-located** -- define routes near the components they render rather than in a single distant configuration file.\n6. **Use wildcard routes for 404 pages** -- place a `Route` with `path=\"/*\"` last to catch unmatched paths.\n\n## See Also\n\n- [Core Concepts](./core-concepts.md) -- elements, components, and hooks fundamentals\n- [Building SPAs](./building-spas.md) -- full application architecture guide\n- [API Reference: Router](/docs/api/router.md) -- complete API documentation\n"},{title:"State Management",path:"guides/state-management",content:`# State Management

SpecifyJS provides a layered approach to state management. Simple components use \`useState\`, components with complex transitions use \`useReducer\`, and cross-component state is shared through the Context API. For integration with external stores, \`useSyncExternalStore\` provides tear-free reads with automatic re-rendering.

## Local State with useState

The \`useState\` hook is the foundation of state management. It returns a tuple of the current value and a setter function:

\`\`\`typescript
import { createElement, useState } from 'specifyjs';

function Counter() {
  const [count, setCount] = useState(0);

  return createElement('div', null,
    createElement('p', null, \`Count: \${count}\`),
    createElement('button', {
      onClick: () => setCount(count + 1),
    }, 'Increment'),
  );
}
\`\`\`

### Functional Updates

When the next state depends on the previous state, pass a function to the setter. This avoids stale closures when multiple updates are batched:

\`\`\`typescript
// Correct -- always reads the latest value
setCount(prev => prev + 1);

// Risky -- may use a stale closure value
setCount(count + 1);
\`\`\`

### Lazy Initialization

If computing the initial state is expensive, pass a function to \`useState\`. It runs only on the first render:

\`\`\`typescript
const [data, setData] = useState(() => parseExpensiveData(rawInput));
\`\`\`

## Complex State with useReducer

When state transitions follow predictable rules or involve multiple related values, \`useReducer\` provides a clearer structure than multiple \`useState\` calls:

\`\`\`typescript
import { createElement, useReducer } from 'specifyjs';

interface FormState {
  name: string;
  email: string;
  submitting: boolean;
  error: string | null;
}

type FormAction =
  | { type: 'SET_FIELD'; field: string; value: string }
  | { type: 'SUBMIT' }
  | { type: 'SUCCESS' }
  | { type: 'ERROR'; message: string };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SUBMIT':
      return { ...state, submitting: true, error: null };
    case 'SUCCESS':
      return { ...state, submitting: false };
    case 'ERROR':
      return { ...state, submitting: false, error: action.message };
  }
}

function ContactForm() {
  const [state, dispatch] = useReducer(formReducer, {
    name: '',
    email: '',
    submitting: false,
    error: null,
  });

  return createElement('form', null,
    createElement('input', {
      value: state.name,
      onChange: (e: Event) =>
        dispatch({ type: 'SET_FIELD', field: 'name', value: (e.target as HTMLInputElement).value }),
    }),
    createElement('button', {
      onClick: () => dispatch({ type: 'SUBMIT' }),
      disabled: state.submitting,
    }, 'Submit'),
    state.error ? createElement('p', { className: 'error' }, state.error) : null,
  );
}
\`\`\`

### Lazy Initialization with useReducer

The optional third argument to \`useReducer\` is an initializer function. It receives the second argument and returns the initial state:

\`\`\`typescript
const [state, dispatch] = useReducer(reducer, rawConfig, (config) => ({
  ...parseConfig(config),
  loaded: true,
}));
\`\`\`

## Sharing State with Context

The Context API passes data through the component tree without manually threading props through every level. It consists of three parts: \`createContext\`, the \`Provider\`, and \`useContext\`.

### Creating a Context

\`\`\`typescript
import { createContext } from 'specifyjs';

interface ThemeContextValue {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: 'light',
  toggleTheme: () => {},
});
\`\`\`

The argument to \`createContext\` is the default value used when no \`Provider\` is found above the consuming component.

### Providing Context

Wrap a subtree with the \`Provider\` to supply a value:

\`\`\`typescript
import { createElement, useState, useCallback } from 'specifyjs';

function ThemeProvider(props: { children?: unknown }) {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  const toggleTheme = useCallback((() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }) as (...args: unknown[]) => unknown, []);

  const value = { theme, toggleTheme: toggleTheme as () => void };

  return createElement(ThemeContext.Provider, { value }, props.children);
}
\`\`\`

### Consuming Context

Use the \`useContext\` hook to read the nearest ancestor \`Provider\` value:

\`\`\`typescript
import { useContext } from 'specifyjs';

function ThemedButton(props: { label: string }) {
  const { theme, toggleTheme } = useContext(ThemeContext);

  return createElement('button', {
    className: \`btn--\${theme}\`,
    onClick: toggleTheme,
  }, props.label);
}
\`\`\`

When the \`Provider\` value changes, all components that call \`useContext\` for that context re-render automatically.

## When to Use Each Approach

| Approach | Best For |
|----------|----------|
| \`useState\` | Simple, independent values (toggles, counters, form fields). |
| \`useReducer\` | Complex state with multiple sub-values or strict transition rules. |
| Context | Cross-cutting concerns (theme, locale, auth) shared by many components. |
| \`useSyncExternalStore\` | Integration with external stores, real-time data, or shared mutable state. |

**Rule of thumb**: start with \`useState\`. Move to \`useReducer\` when you find yourself coordinating multiple \`useState\` calls in the same component. Lift to Context when sibling or distant components need the same data.

## Patterns for Large Applications

### Context + useReducer

Combine Context and \`useReducer\` to create a lightweight application-level store without any external libraries:

\`\`\`typescript
import { createContext, createElement, useReducer, useContext } from 'specifyjs';

interface AppState {
  user: { name: string } | null;
  notifications: string[];
}

type AppAction =
  | { type: 'LOGIN'; name: string }
  | { type: 'LOGOUT' }
  | { type: 'ADD_NOTIFICATION'; message: string };

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, user: { name: action.name } };
    case 'LOGOUT':
      return { ...state, user: null };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.message] };
  }
}

const AppStateContext = createContext<AppState>({ user: null, notifications: [] });
const AppDispatchContext = createContext<(action: AppAction) => void>(() => {});

function AppProvider(props: { children?: unknown }) {
  const [state, dispatch] = useReducer(appReducer, {
    user: null,
    notifications: [],
  });

  return createElement(AppStateContext.Provider, { value: state },
    createElement(AppDispatchContext.Provider, { value: dispatch },
      props.children,
    ),
  );
}

// Consumers only re-render when they read the part of context that changed
function useAppState(): AppState {
  return useContext(AppStateContext);
}

function useAppDispatch(): (action: AppAction) => void {
  return useContext(AppDispatchContext);
}
\`\`\`

Splitting state and dispatch into separate contexts is important: components that only dispatch actions (e.g., a logout button) will not re-render when state changes.

## Performance Considerations

### Avoiding Unnecessary Re-renders

1. **Memoize callbacks** with \`useCallback\` so child components receiving them as props do not re-render when the parent re-renders:

    \`\`\`typescript
    const handleClick = useCallback((() => {
      setOpen(prev => !prev);
    }) as (...args: unknown[]) => unknown, []);
    \`\`\`

2. **Memoize computed values** with \`useMemo\` to skip expensive recalculations:

    \`\`\`typescript
    const sortedItems = useMemo(() =>
      items.slice().sort((a, b) => a.name.localeCompare(b.name)),
      [items],
    );
    \`\`\`

3. **Split contexts** to prevent unrelated updates from triggering re-renders across the tree (as shown in the Context + useReducer pattern above).

4. **Use \`memo\`** to skip re-rendering a component when its props have not changed:

    \`\`\`typescript
    import { memo, createElement } from 'specifyjs';

    const ExpensiveList = memo(function ExpensiveList(props: { items: string[] }) {
      return createElement('ul', null,
        ...props.items.map(item => createElement('li', { key: item }, item)),
      );
    });
    \`\`\`

## External Store Integration

The \`useSyncExternalStore\` hook connects SpecifyJS components to any external data source that follows the subscribe/getSnapshot pattern. This is the recommended approach for integrating with third-party state libraries, browser APIs, or shared mutable state:

\`\`\`typescript
import { useSyncExternalStore } from 'specifyjs';

// A simple external store
let externalCount = 0;
const listeners = new Set<() => void>();

const counterStore = {
  increment() {
    externalCount++;
    listeners.forEach(fn => fn());
  },
  subscribe(callback: () => void) {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot() {
    return externalCount;
  },
};

function ExternalCounter() {
  const count = useSyncExternalStore(
    counterStore.subscribe,
    counterStore.getSnapshot,
  );

  return createElement('div', null,
    createElement('p', null, \`External count: \${count}\`),
    createElement('button', {
      onClick: () => counterStore.increment(),
    }, 'Increment'),
  );
}
\`\`\`

The hook guarantees that the component always sees a consistent snapshot, even during concurrent rendering. When the store notifies subscribers, SpecifyJS compares the new snapshot with \`Object.is\` and only re-renders if the value has changed.

## Custom Hooks for Encapsulating State Logic

Extract reusable state patterns into custom hooks. A custom hook is any function whose name starts with \`use\` and calls other hooks:

\`\`\`typescript
function useToggle(initial: boolean = false): [boolean, () => void] {
  const [value, setValue] = useState(initial);

  const toggle = useCallback((() => {
    setValue(prev => !prev);
  }) as (...args: unknown[]) => unknown, []);

  return [value, toggle as () => void];
}

function useLocalStorage<T>(key: string, defaultValue: T): [T, (v: T) => void] {
  const [value, setValue] = useState<T>(() => {
    const stored = localStorage.getItem(key);
    return stored !== null ? JSON.parse(stored) as T : defaultValue;
  });

  const setAndPersist = useCallback(((next: T) => {
    setValue(next);
    localStorage.setItem(key, JSON.stringify(next));
  }) as (...args: unknown[]) => unknown, [key]);

  return [value, setAndPersist as (v: T) => void];
}
\`\`\`

Usage:

\`\`\`typescript
function SettingsPanel() {
  const [darkMode, toggleDarkMode] = useToggle(false);
  const [fontSize, setFontSize] = useLocalStorage('fontSize', 16);

  return createElement('div', null,
    createElement('button', { onClick: toggleDarkMode },
      darkMode ? 'Light Mode' : 'Dark Mode',
    ),
    createElement('input', {
      type: 'range',
      min: '12',
      max: '24',
      value: String(fontSize),
      onChange: (e: Event) =>
        setFontSize(Number((e.target as HTMLInputElement).value)),
    }),
  );
}
\`\`\`

## Anti-Patterns to Avoid

1. **Storing derived data in state.** If a value can be computed from existing state or props, compute it inline or with \`useMemo\` rather than duplicating it in a separate \`useState\`:

    \`\`\`typescript
    // Bad -- duplicated state that can get out of sync
    const [items, setItems] = useState<string[]>([]);
    const [count, setCount] = useState(0); // always items.length

    // Good -- derive it
    const count = items.length;
    \`\`\`

2. **Putting everything in Context.** Context is not a global store. Every value change re-renders all consumers. Use Context for low-frequency data (theme, locale, auth) and local state for high-frequency data (form input, animations).

3. **Mutating state directly.** Always create new objects or arrays when updating state. Mutations bypass change detection and cause stale renders:

    \`\`\`typescript
    // Bad -- mutates the existing array
    items.push(newItem);
    setItems(items);

    // Good -- creates a new array
    setItems([...items, newItem]);
    \`\`\`

4. **Missing dependency arrays.** Omitting the dependency array on \`useEffect\`, \`useMemo\`, or \`useCallback\` causes the hook to run on every render, defeating memoization.

5. **Oversized reducers.** Keep reducers focused on a single domain. If your reducer handles dozens of unrelated action types, split it into separate reducers with separate contexts.

## See Also

- [Core Concepts](./core-concepts.md) -- elements, components, props, and hooks overview
- [Routing](./routing.md) -- hash-based navigation and route parameters
- [Testing](./testing.md) -- testing components with state and effects
`},{title:"Styling",path:"guides/styling",content:`# Styling

SpecifyJS supports multiple approaches to styling components, from inline styles to CSS classes, CSS modules, and dynamic theming via the Context API.

## Inline Styles with createElement

Pass a \`style\` prop as a JavaScript object. Property names use camelCase, and numeric values default to pixels:

\`\`\`typescript
import { createElement } from 'specifyjs';

function Banner() {
  return createElement('div', {
    style: {
      backgroundColor: '#1a1a2e',
      color: '#e0e0e0',
      padding: 24,
      borderRadius: 8,
      fontSize: 18,
      fontWeight: 600,
    },
  }, 'Welcome to SpecifyJS');
}
\`\`\`

Unitless CSS properties (such as \`opacity\`, \`zIndex\`, \`fontWeight\`, \`lineHeight\`, and \`flex\`) are not appended with \`px\`.

## CSS Classes via className

Use the \`className\` prop to apply CSS classes defined in external stylesheets:

\`\`\`typescript
function Card(props: { title: string; body: string }) {
  return createElement('div', { className: 'card' },
    createElement('h2', { className: 'card-title' }, props.title),
    createElement('p', { className: 'card-body' }, props.body),
  );
}
\`\`\`

For conditional classes, build the string manually:

\`\`\`typescript
function Button(props: { primary?: boolean; disabled?: boolean; label: string }) {
  const classes = [
    'btn',
    props.primary ? 'btn-primary' : 'btn-default',
    props.disabled ? 'btn-disabled' : '',
  ].filter(Boolean).join(' ');

  return createElement('button', {
    className: classes,
    disabled: props.disabled,
  }, props.label);
}
\`\`\`

## CSS Modules Approach

CSS Modules scope class names to the component, preventing style collisions. With Vite, any \`.module.css\` file is automatically treated as a CSS Module:

\`\`\`css
/* Button.module.css */
.button { padding: 8px 16px; border: none; cursor: pointer; }
.primary { background: #0066cc; color: white; }
.secondary { background: #e0e0e0; color: #333; }
\`\`\`

\`\`\`typescript
import styles from './Button.module.css';

function Button(props: { variant: 'primary' | 'secondary'; label: string }) {
  return createElement('button', {
    className: \`\${styles.button} \${styles[props.variant]}\`,
  }, props.label);
}
\`\`\`

The imported \`styles\` object maps original class names to unique, scoped identifiers (e.g., \`Button_button_x7f3a\`).

## Dynamic Styling Patterns

Compute styles based on props or state:

\`\`\`typescript
function ProgressBar(props: { percent: number }) {
  return createElement('div', {
    style: { background: '#e0e0e0', borderRadius: 4, overflow: 'hidden' },
  },
    createElement('div', {
      style: {
        width: \`\${Math.min(100, Math.max(0, props.percent))}%\`,
        height: 8,
        background: props.percent >= 100 ? '#22c55e' : '#3b82f6',
        transition: 'width 0.3s ease',
      },
    }),
  );
}
\`\`\`

## Theming with Context API

Use the Context API to provide theme values throughout your component tree:

\`\`\`typescript
import { createElement } from 'specifyjs';
import { createContext, useContext } from 'specifyjs/context';

const ThemeContext = createContext({
  primary: '#0066cc',
  background: '#ffffff',
  text: '#1a1a1a',
  surface: '#f5f5f5',
});

function useTheme() {
  return useContext(ThemeContext);
}

function ThemedButton(props: { label: string; onClick: () => void }) {
  const theme = useTheme();
  return createElement('button', {
    style: {
      backgroundColor: theme.primary,
      color: '#ffffff',
      border: 'none',
      padding: '8px 16px',
      borderRadius: 4,
      cursor: 'pointer',
    },
    onClick: props.onClick,
  }, props.label);
}
\`\`\`

Wrap the application in a \`ThemeContext.Provider\` to supply the theme:

\`\`\`typescript
const darkTheme = {
  primary: '#6366f1',
  background: '#0f0f23',
  text: '#e0e0e0',
  surface: '#1a1a2e',
};

function App() {
  return createElement(ThemeContext.Provider, { value: darkTheme },
    createElement(ThemedButton, { label: 'Click me', onClick: () => {} }),
  );
}
\`\`\`

## Dark Mode Implementation

Combine theme context with state to toggle between light and dark modes:

\`\`\`typescript
import { useState } from 'specifyjs/hooks';

const lightTheme = { primary: '#0066cc', background: '#ffffff', text: '#1a1a1a' };
const darkTheme = { primary: '#6366f1', background: '#0f0f23', text: '#e0e0e0' };

function App() {
  const [isDark, setIsDark] = useState(false);
  const theme = isDark ? darkTheme : lightTheme;

  return createElement(ThemeContext.Provider, { value: theme },
    createElement('div', {
      style: { backgroundColor: theme.background, color: theme.text, minHeight: '100vh' },
    },
      createElement('button', {
        onClick: () => setIsDark((prev) => !prev),
      }, isDark ? 'Switch to Light' : 'Switch to Dark'),
      createElement(MainContent, null),
    ),
  );
}
\`\`\`

To respect the user's system preference on initial load:

\`\`\`typescript
const [isDark, setIsDark] = useState(() =>
  window.matchMedia('(prefers-color-scheme: dark)').matches,
);
\`\`\`
`},{title:"Testing",path:"guides/testing",content:`# Testing

SpecifyJS applications use three levels of testing.

## Unit Tests (Vitest + jsdom)

Test individual components and hooks in isolation:

\`\`\`typescript
import { describe, it, expect } from 'vitest';
import { createElement } from 'specifyjs';
import { useState } from 'specifyjs/hooks';
import { createRoot } from 'specifyjs/dom';

describe('Counter', () => {
  it('renders initial count', () => {
    const container = document.createElement('div');
    function Counter() {
      const [count] = useState(0);
      return createElement('span', null, String(count));
    }
    const root = createRoot(container);
    root.render(createElement(Counter, null));
    expect(container.innerHTML).toBe('<span>0</span>');
  });
});
\`\`\`

## Integration Tests (Vitest + jsdom)

Test component trees and interactions:

\`\`\`typescript
it('adds a todo', () => {
  root.render(createElement(TodoApp, null));
  // Simulate interaction, verify DOM changes
});
\`\`\`

## E2E Tests (Playwright)

Test full user flows in a real browser:

\`\`\`typescript
import { test, expect } from '@playwright/test';

test('adds a todo', async ({ page }) => {
  await page.goto('/');
  await page.getByTestId('todo-input').fill('Buy milk');
  await page.getByTestId('add-btn').click();
  await expect(page.locator('.todo-item')).toHaveCount(1);
});
\`\`\`

## Running Tests

\`\`\`bash
npm test                    # Unit + integration
npm run test:coverage       # With coverage thresholds
npm run test:e2e            # Playwright browser tests
\`\`\`

## Coverage Requirements

- Statements: 95%+
- Branches: 94%+
- Functions: 97%+
- Lines: 95%+

## Next Steps

- [CI/CD](../contributing/ci-cd.md) — Automated testing in CI
- [Production Builds](production-builds.md) — Build optimization
`},{title:"Troubleshooting",path:"guides/troubleshooting",content:`# Troubleshooting

Common questions and solutions when working with SpecifyJS.

---

## Why isn't my component re-rendering?

Components only re-render when their state changes via \`useState\` or \`useReducer\`, or when their parent re-renders with new props. Common causes:

- **Mutating state directly.** Never modify state objects in place. Always create a new reference:

\`\`\`typescript
// Wrong: mutating the existing array
items.push(newItem);
setItems(items);

// Correct: creating a new array
setItems([...items, newItem]);
\`\`\`

- **Same reference.** If you pass the same object reference, SpecifyJS skips the re-render. Spread objects and arrays to create new references.

- **State not lifting high enough.** If a sibling component needs to react to a change, lift the state to the nearest common ancestor.

---

## How do I prevent unnecessary re-renders?

Use \`memo\` to skip re-renders when props have not changed:

\`\`\`typescript
import { memo, createElement } from 'specifyjs';

const ExpensiveList = memo(function ExpensiveList(props: { items: string[] }) {
  return createElement('ul', null,
    props.items.map((item) => createElement('li', { key: item }, item)),
  );
});
\`\`\`

Use \`useMemo\` for expensive computations and \`useCallback\` for stable function references passed as props:

\`\`\`typescript
const sorted = useMemo(() => items.sort(compareFn), [items]);
const handleClick = useCallback(() => { doSomething(); }, []);
\`\`\`

---

## Why do I get "hooks called in wrong order"?

Hooks must be called in the same order on every render. This error occurs when hooks are placed inside conditions, loops, or early returns:

\`\`\`typescript
// Wrong
function MyComponent(props: { show: boolean }) {
  if (props.show) {
    const [value, setValue] = useState('');  // Conditional hook call
  }
  // ...
}

// Correct
function MyComponent(props: { show: boolean }) {
  const [value, setValue] = useState('');    // Always called
  if (!props.show) return null;
  // Use value here
}
\`\`\`

Always place all hook calls at the top level of the component function body.

---

## How do I handle async data fetching?

Use \`useEffect\` with a cleanup flag to prevent updates after unmount:

\`\`\`typescript
function UserProfile(props: { userId: string }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    fetch(\`/api/users/\${props.userId}\`)
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setUser(data);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [props.userId]);

  if (loading) return createElement('p', null, 'Loading...');
  return createElement('h1', null, user.name);
}
\`\`\`

The \`cancelled\` flag prevents state updates on an unmounted component. See the [Custom Hooks](./custom-hooks.md) guide for a reusable \`useFetch\` pattern.

---

## Why does my effect run twice in StrictMode?

\`StrictMode\` intentionally double-invokes effects during development to help detect side effects that do not clean up properly. If your effect runs twice, verify that:

1. Your cleanup function properly reverses the setup (remove listeners, cancel timers, abort fetches).
2. Your effect is idempotent -- running it twice produces the same result as running it once.

This double invocation only happens in development. Production builds run effects once.

---

## How do I debug state changes?

Use \`useEffect\` to log state values whenever they change:

\`\`\`typescript
const [count, setCount] = useState(0);

useEffect(() => {
  console.log('count changed:', count);
}, [count]);
\`\`\`

For complex state managed by \`useReducer\`, log inside the reducer function:

\`\`\`typescript
function reducer(state: State, action: Action): State {
  console.log('action:', action.type, 'prev state:', state);
  switch (action.type) {
    case 'increment':
      return { ...state, count: state.count + 1 };
    default:
      return state;
  }
}
\`\`\`

---

## What's the difference between useEffect and useLayoutEffect?

Both run after rendering, but at different times:

- **\`useEffect\`** runs asynchronously after the browser has painted. Use it for data fetching, subscriptions, logging, and most side effects.
- **\`useLayoutEffect\`** runs synchronously after DOM mutations but before the browser paints. Use it for measuring DOM elements, adjusting scroll position, or preventing visual flicker.

\`\`\`typescript
// Measure an element's dimensions before the user sees it
useLayoutEffect(() => {
  const rect = ref.current.getBoundingClientRect();
  setHeight(rect.height);
}, []);
\`\`\`

Prefer \`useEffect\` unless you specifically need to read or modify the DOM before the browser paints.

---

## How do I share state between components?

Three approaches, depending on scope:

1. **Lift state up.** Move state to the nearest common ancestor and pass it down via props.

2. **Context API.** For widely shared state (theme, user session, feature flags), use \`createContext\` and a Provider:

\`\`\`typescript
const UserContext = createContext(null);

function App() {
  const [user, setUser] = useState(null);
  return createElement(UserContext.Provider, { value: { user, setUser } },
    createElement(Dashboard, null),
  );
}

function Dashboard() {
  const { user } = useContext(UserContext);
  return createElement('p', null, \`Hello, \${user?.name}\`);
}
\`\`\`

3. **External store with \`useSyncExternalStore\`.** For complex global state, create a store and subscribe components to it.

---

## Why is my list rendering slowly?

Large lists cause performance problems because every item creates DOM nodes. Solutions:

- **Add \`key\` props.** Always provide stable, unique keys so the reconciler can reuse existing DOM nodes instead of recreating them:

\`\`\`typescript
items.map((item) => createElement('li', { key: item.id }, item.name));
\`\`\`

- **Avoid index keys for dynamic lists.** Using array indices as keys causes incorrect reuse when items are inserted, removed, or reordered.

- **Memoize list items.** Wrap individual item components in \`memo\` to skip re-rendering unchanged items.

- **Virtualize.** For lists with hundreds or thousands of items, render only the visible portion using a windowing technique. Only create DOM nodes for items currently in the viewport.

- **Use transitions.** Wrap expensive list updates in \`startTransition\` so they do not block user input (see [Concurrent Rendering](./concurrent-rendering.md)).

---

## How do I handle form validation?

Validate on change or on submit using state:

\`\`\`typescript
function LoginForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleSubmit(e: Event) {
    e.preventDefault();
    if (!email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    // Submit the form
  }

  return createElement('form', { onSubmit: handleSubmit },
    createElement('input', {
      type: 'email',
      value: email,
      onInput: (e) => {
        setEmail((e.target as HTMLInputElement).value);
        setError('');
      },
    }),
    error ? createElement('p', { style: { color: 'red' } }, error) : null,
    createElement('button', { type: 'submit' }, 'Log In'),
  );
}
\`\`\`

For complex forms with multiple fields, use \`useReducer\` to manage form state and validation errors together. See the [Forms and Validation](./forms-and-validation.md) guide for more patterns.
`},{title:"TypeScript Patterns",path:"guides/typescript",content:`# TypeScript Patterns

SpecifyJS is a **TypeScript-first** framework. The entire codebase is written in strict mode (\`"strict": true\`), and all public APIs ship with full type definitions. This guide covers common typing patterns you will encounter when building SpecifyJS applications.

## Typing Functional Components

Use the \`FunctionComponent\` type or define an explicit props interface with a return type of \`SpecNode\`:

\`\`\`typescript
import { createElement } from 'specifyjs';
import type { FunctionComponent, SpecNode, Props } from 'specifyjs';

// Option 1: Inline props type
function Greeting(props: { name: string }): SpecNode {
  return createElement('h1', null, \`Hello, \${props.name}!\`);
}

// Option 2: Using FunctionComponent
interface CardProps extends Props {
  title: string;
  subtitle?: string;
}

const Card: FunctionComponent<CardProps> = (props) => {
  return createElement('div', { className: 'card' },
    createElement('h2', null, props.title),
    props.subtitle
      ? createElement('p', null, props.subtitle)
      : null,
  );
};
\`\`\`

## Typing Props Interfaces

Props interfaces should extend \`Props\` when you need access to \`children\`, \`key\`, or \`ref\`:

\`\`\`typescript
import type { Props, SpecNode, Ref } from 'specifyjs';

interface ButtonProps extends Props {
  label: string;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
  onClick?: () => void;
  ref?: Ref<HTMLButtonElement>;
  children?: SpecNode;
}
\`\`\`

The base \`Props\` type is \`Record<string, unknown> & { children?: SpecNode; key?: Key; ref?: Ref }\`, so extending it lets TypeScript enforce your custom fields while preserving built-in prop support.

## Typing Hooks

### useState with Generics

Provide a type parameter when the initial value does not fully express the type:

\`\`\`typescript
const [user, setUser] = useState<User | null>(null);
const [items, setItems] = useState<string[]>([]);

// TypeScript infers \`number\` from the initial value here:
const [count, setCount] = useState(0);
\`\`\`

### useRef\\<T\\>

Type the ref to match the DOM element or value it will hold:

\`\`\`typescript
import { useRef, useEffect, createElement } from 'specifyjs';
import type { RefObject } from 'specifyjs';

function TextInput() {
  const inputRef: RefObject<HTMLInputElement> = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  return createElement('input', { ref: inputRef, type: 'text' });
}
\`\`\`

### useReducer with Typed Actions

Define a discriminated union for actions:

\`\`\`typescript
interface State {
  count: number;
  error: string | null;
}

type Action =
  | { type: 'increment' }
  | { type: 'decrement' }
  | { type: 'reset'; payload: number }
  | { type: 'error'; payload: string };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'increment': return { ...state, count: state.count + 1 };
    case 'decrement': return { ...state, count: state.count - 1 };
    case 'reset':     return { ...state, count: action.payload, error: null };
    case 'error':     return { ...state, error: action.payload };
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0, error: null });
  return createElement('button', {
    onClick: () => dispatch({ type: 'increment' }),
  }, \`Count: \${state.count}\`);
}
\`\`\`

## Typing Event Handlers

Event handler props accept standard DOM event types. Type them explicitly for safety:

\`\`\`typescript
interface FormProps extends Props {
  onSubmit: (value: string) => void;
}

function SearchForm(props: FormProps) {
  const [query, setQuery] = useState('');

  const handleSubmit = (e: Event): void => {
    e.preventDefault();
    props.onSubmit(query);
  };

  const handleInput = (e: Event): void => {
    const target = e.target as HTMLInputElement;
    setQuery(target.value);
  };

  return createElement('form', { onSubmit: handleSubmit },
    createElement('input', { type: 'text', onInput: handleInput, value: query }),
    createElement('button', { type: 'submit' }, 'Search'),
  );
}
\`\`\`

## Typing Context Values

Provide a concrete type parameter to \`createContext\`:

\`\`\`typescript
import { createContext, useContext } from 'specifyjs';
import type { SpecContext } from 'specifyjs';

interface Theme {
  primary: string;
  secondary: string;
  background: string;
}

const ThemeContext: SpecContext<Theme> = createContext<Theme>({
  primary: '#0066cc',
  secondary: '#444',
  background: '#fff',
});

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return createElement('button', {
    style: \`background: \${theme.primary}; color: \${theme.background}\`,
  }, 'Click me');
}
\`\`\`

## Typing Custom Hooks

Custom hooks are plain functions. Type the return value explicitly to avoid leaking implementation details:

\`\`\`typescript
interface UseToggleReturn {
  value: boolean;
  toggle: () => void;
  setTrue: () => void;
  setFalse: () => void;
}

function useToggle(initial: boolean = false): UseToggleReturn {
  const [value, setValue] = useState(initial);
  return {
    value,
    toggle: useCallback(() => setValue(v => !v), []),
    setTrue: useCallback(() => setValue(true), []),
    setFalse: useCallback(() => setValue(false), []),
  };
}
\`\`\`

## Using SpecElement, SpecNode, and SpecChild

These types describe the tree structure:

| Type          | Definition                                                   | Use case                            |
|---------------|--------------------------------------------------------------|-------------------------------------|
| \`SpecElement\` | \`{ $$typeof, type, props, key, ref }\`                       | A single element descriptor         |
| \`SpecChild\`   | \`SpecElement \\| string \\| number \\| boolean \\| null \\| undefined\` | One renderable value           |
| \`SpecNode\`    | \`SpecChild \\| SpecNode[]\`                                    | Any renderable value, including arrays |

Use \`SpecNode\` as the return type for render functions and \`children\` props. Use \`SpecElement\` when you need to inspect or validate a specific element (for example with \`isValidElement\`):

\`\`\`typescript
import { isValidElement } from 'specifyjs';
import type { SpecElement, SpecNode } from 'specifyjs';

function renderWithWrapper(node: SpecNode): SpecNode {
  if (isValidElement(node)) {
    const element = node as SpecElement;
    return createElement('div', { className: 'wrapper', key: element.key }, element);
  }
  return node;
}
\`\`\`

## See Also

- [API Reference: Types](../api/types.md)
- [Core Concepts](./core-concepts.md)
- [Getting Started](./getting-started.md)
`},{title:"Render Safety",path:"guides/render-safety",content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Render Safety — Render Guard System

SpecifyJS includes a development-time render guard system that detects infinite
render loops, effect cycles, unstable hook dependencies, and setState floods.
All guards are tree-shaken in production builds (\`__DEV__\` gate) and have zero
overhead in shipped code.

The render guard uses \`WeakMap\` for per-fiber tracking, so component fibers
are garbage collected normally. Each unique warning message fires only once
to avoid console spam.

---

## Detection Strategies

The render guard implements four detection strategies:

1. **Render loop detection** -- catches components that re-render infinitely
2. **Effect cycle detection** -- catches effects that fire in a tight loop
3. **Unstable dependency warnings** -- catches effect deps that change every render
4. **setState flood detection** -- catches rapid-fire state updates in a single frame

---

## 1. Render Loop Detection

**What it detects:** A component that re-renders more than 50 times within a
single synchronous work cycle (e.g., a \`setState\` inside the render body that
triggers an immediate re-render).

**Threshold:** \`MAX_RENDERS_PER_CYCLE = 50\`

**Behavior:** Throws an \`Error\` to break the infinite loop. The error message
includes the component name and the number of renders.

**Error message:**
\`\`\`
[SpecifyJS] Maximum update depth exceeded. Component "MyComponent"
re-rendered 51 times in a single cycle. This usually means a useEffect
or setState call is creating an infinite loop. Check that useEffect
dependencies are stable (use useMemo/useCallback for objects/arrays).
\`\`\`

### Common Causes

**Setting state unconditionally during render:**
\`\`\`typescript
// BUG: Causes infinite render loop
function Counter() {
  const [count, setCount] = useState(0);
  setCount(count + 1); // setState during render body
  return createElement('div', null, count);
}
\`\`\`

**Fix:** Move state updates into event handlers or effects:
\`\`\`typescript
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // Only runs once after mount
    setCount(1);
  }, []);
  return createElement('div', null, count);
}
\`\`\`

**useEffect with unstable deps that trigger setState:**
\`\`\`typescript
// BUG: Creates a render loop
function List() {
  const [items, setItems] = useState([]);
  const config = { page: 1 }; // New object every render

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]); // config is a new reference every render

  return createElement('ul', null, ...items);
}
\`\`\`

**Fix:** Stabilize dependencies with \`useMemo\`:
\`\`\`typescript
function List() {
  const [items, setItems] = useState([]);
  const config = useMemo(() => ({ page: 1 }), []);

  useEffect(() => {
    setItems(fetchItems(config));
  }, [config]);

  return createElement('ul', null, ...items);
}
\`\`\`

### How It Works

The guard tracks per-fiber render counts using a \`WeakMap\`. Each work cycle
increments a monotonic cycle ID via \`beginRenderCycle()\`. When
\`trackRender(fiber, name)\` is called before a component render, it checks
whether the fiber has exceeded the threshold in the current cycle. If so, it
resets the count and throws.

---

## 2. Effect Cycle Detection

**What it detects:** Effects that fire more than 25 times for a single fiber
within a single commit cycle.

**Threshold:** \`MAX_EFFECTS_PER_CYCLE = 25\`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
\`\`\`
Effect cycle detected in "MyComponent". Effects fired 26 times in a
single commit. This may indicate an effect that triggers a state update
on every run. Ensure effect dependencies are correct and stable.
\`\`\`

### Common Causes

An effect that calls \`setState\`, which triggers a re-render, which triggers
the effect again:

\`\`\`typescript
// BUG: Effect cycle
function Broken() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(value + 1); // Triggers re-render, re-triggers this effect
  }); // No deps = runs every render
  return createElement('span', null, value);
}
\`\`\`

**Fix:** Add a dependency array to control when the effect runs:
\`\`\`typescript
function Fixed() {
  const [value, setValue] = useState(0);
  useEffect(() => {
    setValue(1);
  }, []); // Only runs once
  return createElement('span', null, value);
}
\`\`\`

### How It Works

A separate commit-cycle counter tracks effect executions per fiber.
\`beginCommitCycle()\` is called at the start of each commit phase, and
\`trackEffect(fiber, name)\` increments the count for that fiber.

---

## 3. Unstable Dependency Warnings

**What it detects:** An effect whose dependency array changes on every single
render for 5 or more consecutive renders.

**Threshold:** \`UNSTABLE_DEPS_THRESHOLD = 5\`

**Behavior:** Emits a one-time console warning per fiber+hook combination.

**Warning message:**
\`\`\`
Unstable useEffect dependencies in "MyComponent" (hook #2). Dependencies
changed on 5 consecutive renders. This may cause unnecessary effect
re-runs. Wrap objects/arrays in useMemo and functions in useCallback to
stabilize references.
\`\`\`

### Common Causes

Passing inline objects, arrays, or functions as effect dependencies:

\`\`\`typescript
// BUG: Deps change every render because options is a new object
function Search(props) {
  const options = { query: props.query, limit: 10 };
  useEffect(() => {
    performSearch(options);
  }, [options]); // New reference every render
  return createElement('div', null, 'Searching...');
}
\`\`\`

**Fix:**
\`\`\`typescript
function Search(props) {
  const options = useMemo(() => ({ query: props.query, limit: 10 }), [props.query]);
  useEffect(() => {
    performSearch(options);
  }, [options]);
  return createElement('div', null, 'Searching...');
}
\`\`\`

### How It Works

\`trackEffectDeps()\` is called during \`useEffect\` dependency comparison. It
maintains a per-fiber, per-hook-index history of consecutive dep changes.
Once the threshold is reached, a warning fires and is marked as "warned" to
prevent duplicates. If deps stabilize (stop changing), the counter resets
to zero.

---

## 4. setState Flood Detection

**What it detects:** A single fiber calling \`setState\` / \`dispatch\` 100 or
more times within a single browser frame.

**Threshold:** \`100 calls per frame\`

**Behavior:** Emits a console warning (does not throw).

**Warning message:**
\`\`\`
Rapid state updates in "MyComponent": setState called 100 times in a
single frame. This may indicate a loop or missing dependency optimization.
\`\`\`

### Common Causes

Processing a large dataset by calling \`setState\` in a loop:

\`\`\`typescript
// BUG: 1000 setState calls in one frame
function Importer() {
  const [items, setItems] = useState([]);
  const handleImport = (data) => {
    for (const item of data) {
      setItems(prev => [...prev, item]); // Called hundreds of times
    }
  };
  return createElement('button', { onClick: () => handleImport(bigData) }, 'Import');
}
\`\`\`

**Fix:** Batch into a single update:
\`\`\`typescript
function Importer() {
  const [items, setItems] = useState([]);
  const handleImport = (data) => {
    setItems(prev => [...prev, ...data]); // Single setState call
  };
  return createElement('button', { onClick: () => handleImport(bigData) }, 'Import');
}
\`\`\`

### How It Works

\`beginFrame()\` increments a frame counter at the start of each browser frame
or microtask batch. \`trackStateUpdate(fiber, name)\` counts how many times
\`setState\` is called for a given fiber in the current frame. The warning
fires exactly once when the count hits 100.

---

## Configuration

The thresholds are compile-time constants defined in the render guard module:

| Constant | Default | Purpose |
|---|---|---|
| \`MAX_RENDERS_PER_CYCLE\` | 50 | Max renders per component per work cycle before throwing |
| \`MAX_EFFECTS_PER_CYCLE\` | 25 | Max effect executions per fiber per commit before warning |
| \`UNSTABLE_DEPS_THRESHOLD\` | 5 | Consecutive dep-changing renders before warning |
| setState flood threshold | 100 | setState calls per fiber per frame before warning |

These values are not configurable at runtime. They are tuned for development
diagnostics and are fully removed in production builds.

---

## Production Behavior

All render guard code is gated behind \`__DEV__\` checks. In production builds:

- No \`WeakMap\` tracking is created
- No cycle/commit/frame counters are incremented
- No warnings or errors are emitted
- Zero runtime overhead

---

## Testing

The render guard exports a \`resetRenderGuard()\` function for use in test
suites. Call it in \`beforeEach\` or \`afterEach\` to reset all internal
counters:

\`\`\`typescript
import { resetRenderGuard } from '../../src/shared/render-guard';

afterEach(() => {
  resetRenderGuard();
});
\`\`\`

This resets \`currentCycleId\`, \`currentCommitId\`, and \`currentFrameId\` to zero.
\`WeakMap\` entries are not cleared explicitly but will be garbage collected
when fiber references are released.
`},{title:"SEO",path:"guides/seo",content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# SEO — Sitemap, Robots, LLMs, and Noscript Fallback

SpecifyJS provides two Vite plugins for build-time SEO:

- **specifyJsSeoPlugin** -- auto-generates \`sitemap.xml\`, \`robots.txt\`, and \`llms.txt\`
- **specifyJsNoscriptPlugin** -- injects a \`<noscript>\` fallback into \`index.html\` for crawlers and accessibility

Both plugins run during the Vite \`closeBundle\` hook (build-time only) and
produce static files in the \`dist/\` output directory.

\`\`\`typescript
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';
\`\`\`

---

## specifyJsSeoPlugin

### Setup

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://example.com',
      title: 'My App',
      description: 'A fast single-page application built with SpecifyJS.',
      routes: ['/', '/#/about', '/#/contact'],
      docsDir: './docs',
      npmPackage: '@my-org/my-app',
      author: 'My Org',
      license: 'MIT',
      repository: 'https://github.com/my-org/my-app',
      robotsRules: ['Disallow: /admin/'],
    }),
  ],
});
\`\`\`

### SeoPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| \`siteUrl\` | \`string\` | Yes | Base URL of the site (e.g. \`https://example.com\`) |
| \`title\` | \`string\` | No | Site title used in \`llms.txt\` |
| \`description\` | \`string\` | No | Site description for \`llms.txt\` (supports \`\\n\` for multi-line) |
| \`routes\` | \`string[]\` | No | Hash-based routes to include in the sitemap. Defaults to \`['/']\` |
| \`docsDir\` | \`string\` | No | Path to a docs directory. Markdown files are auto-discovered and added as \`/#/docs/<path>\` routes |
| \`npmPackage\` | \`string\` | No | npm package name for install instructions in \`llms.txt\` |
| \`author\` | \`string\` | No | Author name for \`llms.txt\` |
| \`license\` | \`string\` | No | License identifier for \`llms.txt\` |
| \`robotsRules\` | \`string[]\` | No | Additional lines appended to \`robots.txt\` (e.g. \`['Disallow: /admin/']\`) |
| \`repository\` | \`string\` | No | Repository URL for \`llms.txt\` |

### Generated Files

#### sitemap.xml

Standard XML sitemap with one \`<url>\` entry per route. Routes from the \`routes\`
array and auto-discovered doc pages from \`docsDir\` are both included. Each
entry gets a \`<lastmod>\` set to the build date.

\`\`\`xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/about</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/docs/guides/getting-started</loc><lastmod>2026-04-28</lastmod></url>
</urlset>
\`\`\`

#### robots.txt

Allows all crawlers by default and points to the sitemap. Extra rules are
appended after the \`Allow\` directive.

\`\`\`
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
\`\`\`

#### llms.txt

A machine-readable text file describing the project for LLM crawlers. Includes
the title, description, website URL, repository, npm package, documentation
links (grouped by guides and API), install instructions, license, and author.

\`\`\`
# My App

> A fast single-page application built with SpecifyJS.

## Website: https://example.com
## Repository: https://github.com/my-org/my-app
## npm: https://www.npmjs.com/package/@my-org/my-app

## Documentation

- getting-started: https://example.com/#/docs/guides/getting-started

## API Reference

- hooks: https://example.com/#/docs/api/hooks

## Install

\`\`\`
npm install @my-org/my-app
\`\`\`

## License: MIT
## Author: My Org
\`\`\`

### Docs Directory Auto-Discovery

When \`docsDir\` is set, the plugin iteratively walks the directory tree and
collects all \`.md\` files. Each file becomes a sitemap route at
\`/#/docs/<relative-path>\` (without the \`.md\` extension).

For example, given the directory structure:
\`\`\`
docs/
  guides/
    getting-started.md
    routing.md
  api/
    hooks.md
    dom.md
\`\`\`

The plugin generates routes:
- \`/#/docs/guides/getting-started\`
- \`/#/docs/guides/routing\`
- \`/#/docs/api/hooks\`
- \`/#/docs/api/dom\`

In \`llms.txt\`, guides and API docs are listed in separate sections.

---

## specifyJsNoscriptPlugin

### Setup

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsNoscriptPlugin({
      title: 'My App',
      description: 'A fast single-page application.',
      sections: [
        {
          id: 'home',
          title: 'Home',
          html: '<h1>Welcome</h1><p>This is the home page.</p>',
        },
        {
          id: 'docs',
          title: 'Documentation',
          html: '<h2>Getting Started</h2><p>Install with npm...</p>',
        },
      ],
      copyright: '(c) 2026 My Org. All rights reserved.',
    }),
  ],
});
\`\`\`

### NoscriptPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| \`title\` | \`string\` | No | Page title shown at the top |
| \`description\` | \`string\` | No | Subtitle shown below the title |
| \`sections\` | \`NoscriptSection[]\` | Yes | Content sections to render |
| \`copyright\` | \`string\` | No | Copyright notice at the bottom |
| \`classPrefix\` | \`string\` | No | CSS class prefix (default: \`'ns'\`) |
| \`maxContentSize\` | \`number\` | No | Maximum noscript content size in bytes before a warning (default: 512KB) |

### NoscriptSection

\`\`\`typescript
interface NoscriptSection {
  id: string;      // Anchor ID (href="#id")
  title: string;   // Navigation bar display title
  html: string;    // Static HTML content
}
\`\`\`

### What It Generates

The plugin injects a \`<noscript>\` block before \`</body>\` in \`dist/index.html\`
containing:

1. **Scoped CSS** -- a complete stylesheet for readable, responsive layout
2. **JS-disabled notice** -- a yellow banner explaining that the page works
   best with JavaScript
3. **Navigation bar** -- sticky nav with anchor links to each section
4. **Section content** -- each section as semantic HTML with headings,
   paragraphs, lists, and a "Back to top" link
5. **Copyright footer** -- if configured

### Interactive Element Stripping

The plugin automatically strips elements that do not work without JavaScript:

| Element | Treatment |
|---|---|
| \`<button>\` | Removed, inner text preserved |
| \`<input>\` | Removed entirely |
| \`<select>\` / \`<option>\` | Removed entirely |
| \`<textarea>\` | Removed entirely |
| \`<form>\` | Wrapper removed, content preserved |
| \`<script>\` | Removed entirely |
| \`onclick\`, \`onchange\`, etc. | Inline event handlers removed |
| \`style="...javascript:..."\` | Style attributes with JS expressions removed |

The \`stripInteractiveElements()\` function is exported for use outside the
plugin:

\`\`\`typescript
import { stripInteractiveElements } from '@asymmetric-effort/specifyjs/build';

const clean = stripInteractiveElements('<button onclick="alert()">Click</button>');
// 'Click'
\`\`\`

### Content Size Warning

If the generated noscript HTML exceeds \`maxContentSize\` (default 512KB),
a console warning is emitted during build. This prevents accidentally
bloating \`index.html\` with large noscript content.

### Removing Noscript After Hydration

The \`<noscript>\` block is inert when JavaScript is enabled -- browsers do not
render \`<noscript>\` content when JS is active. No cleanup is needed after
hydration.

If you want to remove the \`<noscript>\` element from the DOM for cleanliness
after your app mounts:

\`\`\`typescript
import { createElement, useEffect } from '@asymmetric-effort/specifyjs';

function App() {
  useEffect(() => {
    const noscript = document.querySelector('noscript');
    if (noscript) {
      noscript.remove();
    }
  }, []);

  return createElement('div', null, 'App loaded');
}
\`\`\`

---

## Using Both Plugins Together

\`\`\`typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://myapp.com',
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      routes: ['/', '/#/about'],
      docsDir: './docs',
      npmPackage: '@my-org/myapp',
      license: 'MIT',
    }),
    specifyJsNoscriptPlugin({
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      sections: [
        { id: 'home', title: 'Home', html: '<h1>Welcome to MyApp</h1>' },
        { id: 'about', title: 'About', html: '<p>About this application.</p>' },
      ],
      copyright: '(c) 2026 My Org',
    }),
  ],
});
\`\`\`

Both plugins run independently during \`closeBundle\`. The SEO plugin generates
\`sitemap.xml\`, \`robots.txt\`, and \`llms.txt\`. The noscript plugin modifies
\`index.html\` to add the fallback block. Order does not matter.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| \`docsDir\` does not exist | Skipped silently; no doc routes added |
| \`dist/index.html\` not found (noscript) | Warning logged; noscript injection skipped |
| No sections provided (noscript) | Warning logged; no noscript block injected |
| Noscript content exceeds \`maxContentSize\` | Warning logged; content still injected |
| \`routes\` not provided (SEO) | Defaults to \`['/']\` |
`},{title:"Async Computation",path:"guides/async-computation",content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Async Function Evaluation

SpecifyJS includes an async computation engine for evaluating mathematical
functions over a range of input values without blocking the UI. The engine
splits work into batches and yields to the browser between batches using
\`requestIdleCallback\` (or \`setTimeout\` as a fallback).

This module powers the \`CartesianGraph2D\` and \`PolarGraph2D\` visualization
components but can be used independently in any component that needs to
compute a large number of function evaluations.

---

## Import

\`\`\`typescript
import {
  evaluateFunction,
  generateInputs,
  computeSync,
  computeAsync,
} from '@asymmetric-effort/specifyjs';
\`\`\`

> **Note:** These functions are currently part of the internal \`shared/\`
> module. Import paths may vary depending on your project setup.

---

## Quick Start

\`\`\`typescript
import { evaluateFunction } from '../../core/src/shared/async-compute';

// Evaluate sin(x) from 0 to 2*PI with step 0.01
const { points, cancel } = evaluateFunction(
  {
    fn: Math.sin,
    range: { start: 0, end: 2 * Math.PI, step: 0.01 },
    sync: false,      // async mode (default)
    batchSize: 200,   // evaluations per idle tick (default)
  },
  (results) => {
    console.log(\`Computed \${results.length} points\`);
    // results: Array<{ input: number, output: number }>
  },
);

// Cancel computation if the component unmounts
// cancel();
\`\`\`

---

## Types

### ComputedPoint

\`\`\`typescript
interface ComputedPoint {
  input: number;   // The x (or theta) value
  output: number;  // The computed f(x) value
}
\`\`\`

### RangeSpec

\`\`\`typescript
interface RangeSpec {
  start: number;  // First input value
  end: number;    // Last input value (inclusive)
  step: number;   // Increment between values
}
\`\`\`

### AsyncComputeOptions

\`\`\`typescript
interface AsyncComputeOptions {
  fn: (x: number) => number;   // The function to evaluate
  range: RangeSpec;            // Range of input values
  sync?: boolean;              // If true, compute synchronously (default: false)
  batchSize?: number;          // Evaluations per idle tick (default: 200)
}
\`\`\`

---

## Core Functions

### evaluateFunction(options, onResult)

High-level entry point. Evaluates a function over a range and calls
\`onResult\` with the computed points.

\`\`\`typescript
function evaluateFunction(
  options: AsyncComputeOptions,
  onResult: (points: ComputedPoint[]) => void,
): { points: ComputedPoint[] | null; cancel: () => void }
\`\`\`

**Return value:**
- \`points\` -- In sync mode, the computed points are returned immediately. In
  async mode, this is \`null\` (use the callback).
- \`cancel\` -- A function to abort async computation. In sync mode, this is a
  no-op.

**Sync mode:**
\`\`\`typescript
const { points } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 }, sync: true },
  (results) => { /* also called immediately in sync mode */ },
);
// points is available immediately
console.log(points.length); // 101
\`\`\`

**Async mode:**
\`\`\`typescript
const { cancel } = evaluateFunction(
  { fn: (x) => x * x, range: { start: -5, end: 5, step: 0.1 } },
  (results) => {
    // Called once when all batches are complete
    console.log(results.length);
  },
);
// cancel() to abort
\`\`\`

### generateInputs(range)

Generates the full array of input values for a range specification.

\`\`\`typescript
function generateInputs(range: RangeSpec): number[]
\`\`\`

\`\`\`typescript
const inputs = generateInputs({ start: 0, end: 1, step: 0.25 });
// [0, 0.25, 0.5, 0.75, 1.0]
\`\`\`

**Safety limits:**
- Returns \`[]\` if \`step <= 0\` or \`step\` is not finite
- Returns \`[]\` if the computed count exceeds 1,000,000 (prevents memory
  explosion from very small step values)

### computeSync(fn, inputs)

Evaluates a function for every input value synchronously. Non-finite outputs
(NaN, Infinity, -Infinity) are silently skipped.

\`\`\`typescript
function computeSync(fn: (x: number) => number, inputs: number[]): ComputedPoint[]
\`\`\`

\`\`\`typescript
const results = computeSync(Math.sqrt, [0, 1, 4, -1, 9]);
// [
//   { input: 0, output: 0 },
//   { input: 1, output: 1 },
//   { input: 4, output: 2 },
//   // { input: -1, output: NaN } -- skipped (not finite)
//   { input: 9, output: 3 },
// ]
\`\`\`

### computeAsync(fn, inputs, batchSize, onProgress)

Evaluates a function in batches, yielding to the browser between batches.
Returns a cancel function.

\`\`\`typescript
function computeAsync(
  fn: (x: number) => number,
  inputs: number[],
  batchSize: number,
  onProgress: (results: ComputedPoint[], done: boolean) => void,
): () => void
\`\`\`

The \`onProgress\` callback is called after each batch with:
- \`results\` -- all points computed so far (cumulative)
- \`done\` -- \`true\` after the final batch

\`\`\`typescript
const cancel = computeAsync(
  (x) => Math.sin(x) / x,
  generateInputs({ start: 0.01, end: 100, step: 0.01 }),
  500,
  (results, done) => {
    if (done) {
      console.log(\`Finished: \${results.length} points\`);
    } else {
      console.log(\`Progress: \${results.length} points so far\`);
    }
  },
);

// Abort if needed:
cancel();
\`\`\`

**Scheduling:** Uses \`requestIdleCallback\` with a 16ms timeout when available,
falling back to \`setTimeout(fn, 0)\`.

---

## Using with Graph Components

The \`CartesianGraph2D\` and \`PolarGraph2D\` visualization components use async
computation internally. You control the behavior with these props:

### CartesianGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| \`plotFunction\` | \`(x: number) => number\` | required | The function to plot |
| \`xMin\` / \`xMax\` | \`number\` | required | X-axis range |
| \`plotResolution\` | \`number\` | \`200\` | Number of samples across the range |
| \`xStep\` | \`number\` | computed | Explicit step size (overrides \`plotResolution\`) |
| \`syncMode\` | \`boolean\` | \`false\` | If true, compute synchronously |

When \`syncMode\` is \`false\` (default), the component uses \`computeAsync\` to
evaluate the function in batches. This keeps the UI responsive when plotting
complex functions over large ranges.

When \`syncMode\` is \`true\`, the component uses \`computeSync\` via \`useMemo\` for
immediate results. Use this for simple functions or small ranges.

### PolarGraph2D

| Prop | Type | Default | Description |
|---|---|---|---|
| \`plotFunction\` | \`(theta: number) => number\` | required | Maps angle to radius |
| \`plotResolution\` | \`number\` | \`360\` | Number of samples around the circle |
| \`thetaStep\` | \`number\` | computed | Explicit theta step (overrides \`plotResolution\`) |
| \`syncMode\` | \`boolean\` | \`false\` | If true, compute synchronously |

The default range is \`0\` to \`2 * Math.PI\`. The step is computed as
\`thetaStep ?? (2 * Math.PI) / plotResolution\`.

---

## Using in Custom Components

You can use the async computation engine in your own components:

\`\`\`typescript
import { createElement, useState, useEffect, useRef, useMemo } from '@asymmetric-effort/specifyjs';
import { generateInputs, computeSync, computeAsync } from '../../core/src/shared/async-compute';

function CustomChart(props) {
  const { fn, xMin, xMax, step, syncMode } = props;
  const [asyncPoints, setAsyncPoints] = useState([]);
  const cancelRef = useRef(null);

  // Synchronous path
  const syncPoints = useMemo(() => {
    if (!syncMode) return null;
    const inputs = generateInputs({ start: xMin, end: xMax, step });
    return computeSync(fn, inputs);
  }, [fn, xMin, xMax, step, syncMode]);

  // Asynchronous path
  useEffect(() => {
    if (syncMode) return;
    // Cancel previous computation
    if (cancelRef.current) cancelRef.current();

    const inputs = generateInputs({ start: xMin, end: xMax, step });
    cancelRef.current = computeAsync(fn, inputs, 200, (results, done) => {
      if (done) setAsyncPoints(results);
    });

    return () => {
      if (cancelRef.current) cancelRef.current();
    };
  }, [fn, xMin, xMax, step, syncMode]);

  const points = syncMode ? syncPoints : asyncPoints;

  return createElement('svg', { width: 600, height: 400 },
    // ... render points as a polyline or path
  );
}
\`\`\`

Key patterns:
1. Store the cancel function in a \`useRef\`
2. Cancel previous computation in the effect cleanup
3. Use \`useMemo\` for sync mode, \`useEffect\` + \`useState\` for async mode
4. Check the \`done\` flag before updating state to avoid partial renders

---

## Error Handling

| Scenario | Behavior |
|---|---|
| \`step <= 0\` or non-finite step | \`generateInputs\` returns \`[]\` |
| Range produces more than 1,000,000 inputs | \`generateInputs\` returns \`[]\` |
| Function returns \`NaN\` or \`Infinity\` | Point is silently skipped |
| \`cancel()\` called during computation | Remaining batches are not processed |
| \`cancel()\` called after completion | No-op |
| \`sync: true\` with large input count | Blocks the main thread; use async mode instead |

---

## Performance Tips

- **Use async mode for 1,000+ points.** Sync mode blocks the main thread and
  can cause frame drops on complex functions.
- **Increase \`batchSize\` for simple functions.** If your function is cheap
  (e.g. \`Math.sin\`), a larger batch size (500-1000) reduces scheduling
  overhead.
- **Decrease \`batchSize\` for expensive functions.** If your function involves
  heavy computation, smaller batches (50-100) keep the UI smoother.
- **Cancel on unmount.** Always cancel pending computations in the effect
  cleanup to avoid setting state on unmounted components.
`}]},{title:"API Reference",children:[{title:"API Reference",path:"api/README",content:"# API Reference\n\n## Core API\n\n| Export | Module | Description |\n|--------|--------|-------------|\n| `createElement` | `specifyjs` | Create a virtual DOM element |\n| `h` | `specifyjs` | Alias for createElement |\n| `Fragment` | `specifyjs` | Group children without a wrapper node |\n| `createContext` | `specifyjs` | Create a context for shared state |\n| `createRef` | `specifyjs` | Create a mutable ref object |\n| `forwardRef` | `specifyjs` | Forward refs through components |\n| `memo` | `specifyjs` | Memoize a component |\n| `lazy` | `specifyjs` | Lazy-load a component (use with Suspense) |\n| `isValidElement` | `specifyjs` | Check if a value is a SpecifyJS element |\n| `cloneElement` | `specifyjs` | Clone an element with merged props |\n| `Children` | `specifyjs` | Utilities for the children prop |\n| `Component` | `specifyjs` | Base class for class components |\n| `PureComponent` | `specifyjs` | Component with shallow prop comparison |\n| `startTransition` | `specifyjs` | Mark state updates as non-urgent |\n| `act` | `specifyjs` | Testing utility for flushing updates |\n\n## Detailed References\n\n- [Components](components.md) — createElement, Fragment, Context, Refs, memo, lazy, forwardRef\n- [Hooks](hooks.md) — All 16 hooks with signatures and examples\n- [DOM](dom.md) — Browser rendering APIs\n- [Server](server.md) — Static pre-rendering — Build-time HTML generation\n- [Types](types.md) — TypeScript type definitions\n"},{title:"Components API",path:"api/components",content:`# Components API

## createElement

\`\`\`typescript
createElement(type, props, ...children): SpecElement
\`\`\`

Creates a virtual DOM element. \`type\` can be a string (\`'div'\`), function component, or class component.

## Fragment

\`\`\`typescript
createElement(Fragment, null, child1, child2)
\`\`\`

Groups children without adding an extra DOM node. JSX shorthand: \`<>...</>\`.

## Context

### createContext

\`\`\`typescript
const MyContext = createContext(defaultValue);
\`\`\`

Creates a context with Provider and Consumer.

### Provider

\`\`\`typescript
createElement(MyContext.Provider, { value: actualValue }, children)
\`\`\`

### useContext

\`\`\`typescript
const value = useContext(MyContext);
\`\`\`

## Refs

### createRef

\`\`\`typescript
const ref = createRef<HTMLInputElement>();
// ref.current is null until mounted
\`\`\`

### forwardRef

\`\`\`typescript
const FancyInput = forwardRef((props, ref) => {
  return createElement('input', { ref, ...props });
});
\`\`\`

## Memoization

### memo

\`\`\`typescript
const MemoComp = memo(MyComponent);
const MemoComp = memo(MyComponent, (prev, next) => prev.id === next.id);
\`\`\`

### lazy

\`\`\`typescript
const LazyComp = lazy(() => import('./HeavyComponent'));
// Use with Suspense
\`\`\`

## Class Components

### Component

\`\`\`typescript
class MyComp extends Component<Props, State> {
  state = { count: 0 };
  render() { return createElement('div', null, this.state.count); }
  componentDidMount() { }
  componentDidUpdate(prevProps, prevState) { }
  componentWillUnmount() { }
  shouldComponentUpdate(nextProps, nextState) { return true; }
}
\`\`\`

### PureComponent

Like Component but implements \`shouldComponentUpdate\` with shallow comparison.

## Utilities

### Children

\`\`\`typescript
Children.map(children, fn)     // Map over children
Children.forEach(children, fn) // Iterate children
Children.count(children)       // Count renderable children
Children.only(children)        // Assert single element child
Children.toArray(children)     // Flatten to array
\`\`\`

### cloneElement

\`\`\`typescript
cloneElement(element, { newProp: 'value' }, newChild)
\`\`\`

### isValidElement

\`\`\`typescript
isValidElement(value) // true if SpecifyJS element
\`\`\`
`},{title:"DOM API",path:"api/dom",content:`# DOM API

The DOM module provides browser rendering APIs. Import from \`specifyjs/dom\`.

## createRoot

\`\`\`typescript
import { createRoot } from 'specifyjs/dom';

const root = createRoot(document.getElementById('root'));
root.render(createElement(App, null));
root.unmount();
\`\`\`

## hydrateRoot

Hydrate server-rendered HTML:

\`\`\`typescript
import { hydrateRoot } from 'specifyjs/dom';

const root = hydrateRoot(document, createElement(App, null));
\`\`\`

## createPortal

Render children into a different DOM subtree:

\`\`\`typescript
import { createPortal } from 'specifyjs/dom';

createPortal(createElement(Modal, null), document.getElementById('modal-root'));
\`\`\`

## flushSync

Force synchronous state updates (escape automatic batching):

\`\`\`typescript
import { flushSync } from 'specifyjs/dom';

flushSync(() => {
  setState(newValue); // Updates DOM synchronously
});
\`\`\`

## Legacy APIs

For migration from older patterns:

\`\`\`typescript
import { render, hydrate, unmountComponentAtNode } from 'specifyjs/dom';

render(element, container, callback);
hydrate(element, container, callback);
unmountComponentAtNode(container);
\`\`\`

## Event Handling

SpecifyJS uses a synthetic event system with cross-browser normalization:

\`\`\`typescript
createElement('button', {
  onClick: (e) => { /* SyntheticMouseEvent */ },
  onKeyDown: (e) => { /* SyntheticKeyboardEvent */ },
});
\`\`\`

Supported event types: Mouse, Keyboard, Focus, Input, Touch, Wheel, Drag, Pointer, Clipboard, Animation, Transition.
`},{title:"Hooks API",path:"api/hooks",content:`# Hooks API

All hooks must be called inside function component bodies. Calling hooks outside a component throws an error.

## State Hooks

### \`useState<T>(initialState: T | (() => T)): [T, setter]\`

Returns a stateful value and a function to update it.

\`\`\`typescript
const [count, setCount] = useState(0);
setCount(5);             // Direct value
setCount(prev => prev + 1); // Functional updater
\`\`\`

### \`useReducer<S, A>(reducer, initialArg, init?): [S, dispatch]\`

Alternative to useState for complex state logic.

\`\`\`typescript
const [state, dispatch] = useReducer(
  (state, action) => { switch(action.type) { ... } },
  { count: 0 }
);
dispatch({ type: 'increment' });
\`\`\`

## Effect Hooks

### \`useEffect(create, deps?): void\`

Runs side effects after render. Returns an optional cleanup function.

\`\`\`typescript
useEffect(() => {
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, []);
\`\`\`

### \`useLayoutEffect(create, deps?): void\`

Like useEffect but fires synchronously after DOM mutations, before paint.

### \`useInsertionEffect(create, deps?): void\`

Fires before DOM mutations. Designed for CSS-in-JS libraries.

## Context Hooks

### \`useContext<T>(context: SpecContext<T>): T\`

Reads the current value from the nearest matching Provider.

\`\`\`typescript
const theme = useContext(ThemeContext);
\`\`\`

## Ref Hooks

### \`useRef<T>(initialValue?): { current: T }\`

Returns a mutable ref object that persists across renders.

\`\`\`typescript
const inputRef = useRef<HTMLInputElement>(null);
\`\`\`

### \`useImperativeHandle(ref, createHandle, deps?): void\`

Customizes the instance value exposed to parent refs via \`forwardRef\`.

## Performance Hooks

### \`useMemo<T>(factory: () => T, deps): T\`

Memoizes an expensive computation. Recomputes only when deps change.

\`\`\`typescript
const sorted = useMemo(() => items.sort(compareFn), [items]);
\`\`\`

### \`useCallback<T>(callback: T, deps): T\`

Returns a memoized callback. Equivalent to \`useMemo(() => callback, deps)\`.

\`\`\`typescript
const handleClick = useCallback(() => setCount(c => c + 1), []);
\`\`\`

### \`memo(component, compare?)\`

Wraps a component to skip re-renders when props are shallowly equal.

## Identity Hooks

### \`useId(): string\`

Generates a unique ID stable across server and client renders.

\`\`\`typescript
const id = useId(); // ":l0:", ":l1:", etc.
\`\`\`

## Transition Hooks

### \`useTransition(): [isPending, startTransition]\`

Marks state updates as non-urgent transitions.

### \`useDeferredValue<T>(value: T): T\`

Defers a value update to avoid blocking urgent updates.

## External Store Hooks

### \`useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot?): T\`

Subscribes to an external data source.

## Debug Hooks

### \`useDebugValue(value, format?): void\`

Displays a label in DevTools for custom hooks. No-op in production.
`},{title:"Static Pre-rendering API",path:"api/server",content:`# Static Pre-rendering API

Import from \`specifyjs/server\`.

> **Important:** These APIs are for **build-time static HTML generation only** — use them in build scripts to produce static HTML files served as-is by a web server or CDN. They must NOT be used in server request handlers, middleware, or any runtime code that responds to HTTP requests.
>
> SpecifyJS is a **browser-side SPA framework**. For dynamic content, use client-side rendering with data fetched via HTTPS from API endpoints.

## When to Use Static Pre-rendering

- **Static site generation (SSG)** — Generate HTML pages at build time for SEO or initial page load performance
- **Build scripts** — Pre-render component trees to HTML files during \`npm run build\`
- **Testing** — Generate HTML snapshots for visual regression testing

## When NOT to Use These APIs

- **Request handlers** — Never call \`renderToString\` inside an Express route, Koa middleware, or any HTTP handler
- **Edge functions** — Never render components on Cloudflare Workers, Vercel Edge, etc. at request time
- **API responses** — Never return pre-rendered HTML as an API response

If you need dynamic content, have the SPA fetch it as JSON from an API endpoint.

## renderToString

Renders a component tree to an HTML string during the build process:

\`\`\`typescript
// build-script.ts — run with: SPECIFYJS_ALLOW_PRERENDER=true node build-script.ts
import { renderToString } from 'specifyjs/server';

const html = renderToString(createElement(App, null));
fs.writeFileSync('dist/index.html', wrapInShell(html));
\`\`\`

Set the environment variable \`SPECIFYJS_ALLOW_PRERENDER=true\` to confirm you are using this in a build context. Without it, a warning is emitted in production environments.

## renderToStaticMarkup

Same as \`renderToString\` but without hydration markers. Use for pages that don't need client-side interactivity after load:

\`\`\`typescript
const html = renderToStaticMarkup(createElement(StaticPage, null));
fs.writeFileSync('dist/about.html', html);
\`\`\`

## renderToPipeableStream

Writes pre-rendered HTML to a Node.js writable stream in chunks. Useful for generating large static pages during build:

\`\`\`typescript
import { renderToPipeableStream } from 'specifyjs/server';
import { createWriteStream } from 'fs';

const stream = renderToPipeableStream(createElement(App, null), {
  onAllReady() { console.log('Pre-render complete'); },
});
stream.pipe(createWriteStream('dist/index.html'));
\`\`\`

## renderToReadableStream

Returns a Web ReadableStream of pre-rendered HTML. Useful in build tools that work with Web Streams:

\`\`\`typescript
import { renderToReadableStream } from 'specifyjs/server';

const stream = await renderToReadableStream(createElement(App, null));
// Write stream to file during build
\`\`\`

## Security

These APIs execute component code (including any side effects in component functions). Running untrusted component code on a server at request time creates security risks:

- **Code injection** — Malicious components could access server resources (filesystem, environment variables, databases)
- **Denial of service** — Expensive component trees could block the server event loop
- **Data leakage** — Build-time state could leak into rendered HTML

By restricting these APIs to build-time usage, component code only runs in the build environment (which is already trusted), and the output is static HTML served by a simple file server with no execution context.

## HTML Escaping

All text content and attribute values are automatically escaped to prevent XSS in the generated HTML. Use \`dangerouslySetInnerHTML\` only for trusted content:

\`\`\`typescript
createElement('div', { dangerouslySetInnerHTML: { __html: trustedHtml } });
\`\`\`
`},{title:"TypeScript Types",path:"api/types",content:`# TypeScript Types

SpecifyJS is written in TypeScript strict mode. All public APIs are fully typed.

## Core Types

\`\`\`typescript
// Element
interface SpecElement<P extends Props = Props> {
  $$typeof: symbol;
  type: ComponentType<P>;
  props: P;
  key: Key;
  ref: Ref;
}

// Valid children
type SpecChild = SpecElement | string | number | boolean | null | undefined;
type SpecNode = SpecChild | SpecNode[];

// Props
type Props = Record<string, unknown> & { children?: SpecNode; key?: Key; ref?: Ref };
type Key = string | number | null;

// Refs
type Ref<T = unknown> = RefCallback<T> | RefObject<T> | null;
type RefCallback<T> = (instance: T | null) => void;
interface RefObject<T> { current: T | null; }

// Components
type FunctionComponent<P extends Props = Props> = (props: P) => SpecNode;
type ComponentType<P extends Props = Props> = FunctionComponent<P> | ClassComponentConstructor<P> | string | symbol;

// Context
interface SpecContext<T> {
  Provider: ComponentType;
  Consumer: ComponentType;
  _currentValue: T;
  displayName?: string;
}
\`\`\`

## Fiber Types (internal)

\`\`\`typescript
interface Fiber<P extends Props = Props> {
  tag: FiberTag;
  type: ComponentType<P> | null;
  key: Key;
  ref: Ref;
  stateNode: unknown;
  pendingProps: P;
  memoizedProps: P | null;
  memoizedState: unknown;
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  alternate: Fiber | null;
  effectTag: EffectTag;
}
\`\`\`

These internal types are exported for advanced use cases like DevTools integration but are not part of the stable public API.
`},{title:"Math API",path:"api/math",content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Math — Linear Algebra Library

SpecifyJS ships a lightweight, immutable linear algebra library for 2D/3D vector
math, NxN matrix operations, and numerical solvers. All functions are pure
(they return new values and never mutate their inputs), use \`Float64Array\` for
numeric precision, and contain zero runtime dependencies.

\`\`\`typescript
import {
  vec2, vec2Add, vec2Sub, vec2Scale, vec2Dot, vec2Length,
  vec2Normalize, vec2Dist, vec2Lerp,
  vec3, vec3Add, vec3Sub, vec3Scale, vec3Dot, vec3Cross,
  vec3Length, vec3Normalize,
  matN, matNIdentity, matNFromArray, matNGet, matNSet,
  matNMultiply, matNMultiplyVec, matNTranspose, matNScale,
  matNAdd, matNCopy,
  solve, luDecompose, luSolve, determinant, inverse,
} from '@asymmetric-effort/specifyjs/math';
\`\`\`

> **Note:** The \`math\` subpath is an internal module. Depending on your project
> setup you may need to import directly from the source files
> (e.g. \`../../components/math/src/vec\`).

---

## Vec2 — 2D Vectors

### Type

\`\`\`typescript
interface Vec2 {
  readonly x: number;
  readonly y: number;
}
\`\`\`

All \`Vec2\` instances are plain objects with immutable \`x\` and \`y\` fields.

### Creating a Vec2

\`\`\`typescript
const v = vec2(3, 4); // { x: 3, y: 4 }
\`\`\`

### Arithmetic

\`\`\`typescript
const a = vec2(1, 2);
const b = vec2(3, 4);

vec2Add(a, b);        // { x: 4, y: 6 }
vec2Sub(a, b);        // { x: -2, y: -2 }
vec2Scale(a, 3);      // { x: 3, y: 6 }
\`\`\`

### Dot Product

Returns a scalar representing the alignment of two vectors.

\`\`\`typescript
vec2Dot(vec2(1, 0), vec2(0, 1)); // 0  (perpendicular)
vec2Dot(vec2(1, 0), vec2(1, 0)); // 1  (parallel)
\`\`\`

### Length and Normalization

\`\`\`typescript
vec2Length(vec2(3, 4));        // 5
vec2Normalize(vec2(3, 4));     // { x: 0.6, y: 0.8 }
vec2Normalize(vec2(0, 0));     // { x: 0, y: 0 } — zero-safe
\`\`\`

### Distance

\`\`\`typescript
vec2Dist(vec2(0, 0), vec2(3, 4)); // 5
\`\`\`

### Linear Interpolation

Interpolates between two points. \`t = 0\` returns \`a\`, \`t = 1\` returns \`b\`.

\`\`\`typescript
vec2Lerp(vec2(0, 0), vec2(10, 10), 0.5); // { x: 5, y: 5 }
\`\`\`

---

## Vec3 — 3D Vectors

### Type

\`\`\`typescript
interface Vec3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;
}
\`\`\`

### Creating a Vec3

\`\`\`typescript
const v = vec3(1, 2, 3);
\`\`\`

### Arithmetic

\`\`\`typescript
const a = vec3(1, 2, 3);
const b = vec3(4, 5, 6);

vec3Add(a, b);        // { x: 5, y: 7, z: 9 }
vec3Sub(a, b);        // { x: -3, y: -3, z: -3 }
vec3Scale(a, 2);      // { x: 2, y: 4, z: 6 }
\`\`\`

### Dot Product

\`\`\`typescript
vec3Dot(vec3(1, 0, 0), vec3(0, 1, 0)); // 0
\`\`\`

### Cross Product

Returns a vector perpendicular to both inputs (right-hand rule).

\`\`\`typescript
vec3Cross(vec3(1, 0, 0), vec3(0, 1, 0)); // { x: 0, y: 0, z: 1 }
\`\`\`

### Length and Normalization

\`\`\`typescript
vec3Length(vec3(1, 2, 2));        // 3
vec3Normalize(vec3(0, 0, 5));     // { x: 0, y: 0, z: 1 }
vec3Normalize(vec3(0, 0, 0));     // { x: 0, y: 0, z: 0 } — zero-safe
\`\`\`

---

## MatN — NxN Matrices

### Type

\`\`\`typescript
interface MatN {
  readonly data: Float64Array;  // Row-major flat storage
  readonly size: number;        // Dimension N (rows = cols = N)
}
\`\`\`

Matrices are stored as flat \`Float64Array\` in row-major order. Element at
row \`i\`, column \`j\` is at index \`i * size + j\`.

### Creating Matrices

\`\`\`typescript
// Zero matrix (3x3)
const zero = matN(3);

// Identity matrix (3x3)
const eye = matNIdentity(3);

// From flat array (row-major)
const m = matNFromArray(2, [
  1, 2,
  3, 4,
]);
\`\`\`

### Element Access

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);

matNGet(m, 0, 1);              // 2
const m2 = matNSet(m, 0, 1, 9); // Returns a new matrix with m[0][1] = 9
\`\`\`

\`matNSet\` returns a **new** matrix; the original is not modified.

### Matrix Multiplication

Both operands must have the same size.

\`\`\`typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNIdentity(2);
const c = matNMultiply(a, b); // c equals a
\`\`\`

### Matrix-Vector Multiplication

Multiplies an NxN matrix by an N-length column vector.

\`\`\`typescript
const m = matNFromArray(2, [1, 0, 0, 2]);
const v = new Float64Array([3, 4]);
const result = matNMultiplyVec(m, v); // Float64Array [3, 8]
\`\`\`

### Transpose

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
const mt = matNTranspose(m);
// mt = [1, 3, 2, 4]
\`\`\`

### Scalar Operations

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
matNScale(m, 2);  // [2, 4, 6, 8]
\`\`\`

### Addition

Both operands must have the same size.

\`\`\`typescript
const a = matNFromArray(2, [1, 2, 3, 4]);
const b = matNFromArray(2, [5, 6, 7, 8]);
const c = matNAdd(a, b); // [6, 8, 10, 12]
\`\`\`

### Copying

\`\`\`typescript
const copy = matNCopy(m); // Deep copy (new Float64Array)
\`\`\`

---

## Solver — Gaussian Elimination and LU Decomposition

### solve(A, b) — Solve Ax = b

Solves a system of linear equations using LU decomposition with partial
pivoting.

\`\`\`typescript
// Solve:  2x + y = 5
//          x + 3y = 7
const A = matNFromArray(2, [2, 1, 1, 3]);
const b = new Float64Array([5, 7]);
const x = solve(A, b);
// x = Float64Array [1.6, 1.8]
\`\`\`

Returns \`null\` if the matrix is singular (no unique solution exists).

\`\`\`typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
const result = solve(singular, new Float64Array([1, 2]));
// result === null
\`\`\`

### luDecompose(A) — LU Decomposition

Computes PA = LU where L is lower-triangular with unit diagonal, U is
upper-triangular, and P is a permutation vector.

\`\`\`typescript
const A = matNFromArray(3, [
  2, 1, 1,
  4, 3, 3,
  8, 7, 9,
]);
const decomp = luDecompose(A);
// decomp.L  — lower triangular (unit diagonal)
// decomp.U  — upper triangular
// decomp.P  — permutation vector [2, 1, 0] etc.
\`\`\`

Returns \`null\` if the matrix is singular (a pivot is smaller than \`1e-12\`).

### luSolve(L, U, P, b) — Solve with Pre-computed LU

Reuses an existing LU decomposition to solve for a different right-hand side
without repeating the factorization.

\`\`\`typescript
const decomp = luDecompose(A);
if (decomp) {
  const x1 = luSolve(decomp.L, decomp.U, decomp.P, b1);
  const x2 = luSolve(decomp.L, decomp.U, decomp.P, b2);
}
\`\`\`

### determinant(A) — Matrix Determinant

Computes the determinant via LU decomposition. Returns \`0\` for singular
matrices.

\`\`\`typescript
const m = matNFromArray(2, [1, 2, 3, 4]);
determinant(m); // -2

const singular = matNFromArray(2, [1, 2, 2, 4]);
determinant(singular); // 0
\`\`\`

The sign is computed by counting swaps in the permutation vector.

### inverse(A) — Matrix Inverse

Returns the inverse matrix, or \`null\` if the matrix is singular.

\`\`\`typescript
const m = matNFromArray(2, [4, 7, 2, 6]);
const inv = inverse(m);
// inv is the 2x2 inverse matrix

// Verify: m * inv = identity
const product = matNMultiply(m, inv);
// product ~ matNIdentity(2)
\`\`\`

\`\`\`typescript
const singular = matNFromArray(2, [1, 2, 2, 4]);
inverse(singular); // null
\`\`\`

For an empty matrix (\`size === 0\`), \`inverse\` returns a zero-size identity
and \`determinant\` returns \`1\` by convention.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Zero-length vector passed to \`vec2Normalize\` / \`vec3Normalize\` | Returns a zero vector |
| Singular matrix passed to \`solve\` | Returns \`null\` |
| Singular matrix passed to \`luDecompose\` | Returns \`null\` |
| Singular matrix passed to \`inverse\` | Returns \`null\` |
| Singular matrix passed to \`determinant\` | Returns \`0\` |
| Empty matrix (\`size === 0\`) | \`determinant\` returns \`1\`; \`inverse\` returns empty identity |

All functions are safe to call with any numeric input. NaN and Infinity propagate
through arithmetic as expected by IEEE 754.
`},{title:"Compute API",path:"api/compute",content:`<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Compute — GPU Compute Abstraction

SpecifyJS provides a backend-agnostic compute API for running parallel numeric
kernels on the GPU (WebGPU, WebGL) or CPU. The system auto-detects the best
available backend at runtime and falls back to a pure TypeScript CPU
implementation when no GPU is present.

\`\`\`typescript
import {
  createComputeContext,
  setComputeBackend,
} from '@asymmetric-effort/specifyjs/compute';

import type {
  KernelName,
  ComputeBuffer,
  KernelParams,
  KernelResult,
  BackendInfo,
  ComputeContext,
} from '@asymmetric-effort/specifyjs/compute';
\`\`\`

> **Note:** The \`compute\` subpath is an internal module. Depending on your
> project setup you may need to import directly from the source files.

---

## Quick Start

\`\`\`typescript
import { createComputeContext } from '@asymmetric-effort/specifyjs/compute';

const ctx = await createComputeContext();

console.log(ctx.getBackendInfo().name); // 'webgpu', 'webgl', or 'cpu'

const result = await ctx.execute('matrix-multiply', {
  buffers: [
    { name: 'a', data: new Float64Array([1, 0, 0, 1]), usage: 'read' },
    { name: 'b', data: new Float64Array([5, 6, 7, 8]), usage: 'read' },
    { name: 'result', data: new Float64Array(4), usage: 'write' },
  ],
  uniforms: { size: 2 },
});

const output = result.buffers.get('result');
// Float64Array [5, 6, 7, 8]

ctx.dispose();
\`\`\`

---

## createComputeContext()

\`\`\`typescript
async function createComputeContext(): Promise<ComputeContext>
\`\`\`

Creates or returns a cached \`ComputeContext\`. The context is cached for the
lifetime of the page -- calling \`createComputeContext()\` multiple times
returns the same instance until \`dispose()\` is called.

**Auto-detection order:**

1. **WebGPU** -- used if \`navigator.gpu\` is available and device initialization succeeds
2. **WebGL** -- used if WebGPU is unavailable but WebGL context can be created
3. **CPU** -- pure TypeScript fallback, always available

---

## setComputeBackend(name)

\`\`\`typescript
function setComputeBackend(name: 'webgpu' | 'webgl' | 'cpu'): void
\`\`\`

Forces a specific backend for all subsequent \`createComputeContext()\` calls.
Clears the cached backend so the next call creates a fresh instance.

\`\`\`typescript
import { setComputeBackend, createComputeContext } from '@asymmetric-effort/specifyjs/compute';

// Force CPU backend (useful for testing or deterministic behavior)
setComputeBackend('cpu');
const ctx = await createComputeContext();
console.log(ctx.getBackendInfo().name); // 'cpu'
\`\`\`

---

## ComputeContext

The developer-facing API returned by \`createComputeContext()\`.

### execute(kernel, params)

\`\`\`typescript
execute(kernel: KernelName, params: KernelParams): Promise<KernelResult>
\`\`\`

Runs a named compute kernel with the provided buffers and uniforms.

### getBackendInfo()

\`\`\`typescript
getBackendInfo(): BackendInfo
\`\`\`

Returns information about the active backend.

\`\`\`typescript
interface BackendInfo {
  name: 'webgpu' | 'webgl' | 'cpu';
  isGPU: boolean;
  maxBufferSize: number;  // Max buffer size in bytes
}
\`\`\`

### dispose()

\`\`\`typescript
dispose(): void
\`\`\`

Releases all GPU resources held by the backend and clears the cached
instance. After calling \`dispose()\`, the next \`createComputeContext()\` call
will create a new backend.

---

## Types

### KernelName

\`\`\`typescript
type KernelName = 'matrix-multiply' | 'verlet-constraints' | 'n-body' | 'particle-system';
\`\`\`

The four named compute kernels. Three are currently implemented
(\`matrix-multiply\`, \`verlet-constraints\`, \`n-body\`); \`particle-system\` is
reserved for a future kernel.

### ComputeBuffer

\`\`\`typescript
interface ComputeBuffer {
  name: string;
  data: Float64Array | Float32Array;
  usage: 'read' | 'write' | 'readwrite';
}
\`\`\`

| Field | Description |
|---|---|
| \`name\` | Identifier for this buffer within a kernel invocation |
| \`data\` | Typed array holding the numeric payload |
| \`usage\` | \`'read'\` = input only, \`'write'\` = output only, \`'readwrite'\` = both |

### KernelParams

\`\`\`typescript
interface KernelParams {
  buffers: ComputeBuffer[];
  uniforms?: Record<string, number>;
  workgroupSize?: number;  // GPU hint, ignored by CPU backend
}
\`\`\`

### KernelResult

\`\`\`typescript
interface KernelResult {
  buffers: Map<string, Float64Array | Float32Array>;
}
\`\`\`

Output buffers are keyed by buffer name. Only buffers with \`usage: 'write'\`
or \`'readwrite'\` appear in the result.

---

## Pre-built Kernels

### matrix-multiply

Multiplies two NxN matrices.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`a\` | \`read\` | N*N floats, row-major |
| \`b\` | \`read\` | N*N floats, row-major |
| \`result\` | \`write\` | N*N floats (pre-allocated) |

**Uniforms:**

| Name | Description |
|---|---|
| \`size\` | Dimension N of the square matrices |

\`\`\`typescript
const n = 3;
const a = new Float64Array([
  1, 2, 3,
  4, 5, 6,
  7, 8, 9,
]);
const b = new Float64Array([
  9, 8, 7,
  6, 5, 4,
  3, 2, 1,
]);

const result = await ctx.execute('matrix-multiply', {
  buffers: [
    { name: 'a', data: a, usage: 'read' },
    { name: 'b', data: b, usage: 'read' },
    { name: 'result', data: new Float64Array(n * n), usage: 'write' },
  ],
  uniforms: { size: n },
});

const product = result.buffers.get('result');
\`\`\`

### verlet-constraints

Applies Verlet integration with distance constraint relaxation for 2D
particle simulations (cloth, rope, soft-body).

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`positions\` | \`readwrite\` | 2 floats per particle (x, y), length = \`count * 2\` |
| \`prevPositions\` | \`readwrite\` | 2 floats per particle (previous frame), length = \`count * 2\` |
| \`constraints\` | \`read\` | Packed triples \`[indexA, indexB, restLength, ...]\`, length = \`constraintCount * 3\` |

**Uniforms:**

| Name | Description |
|---|---|
| \`dt\` | Time step (seconds) |
| \`gravity\` | Gravitational acceleration (positive = downward) |
| \`count\` | Number of particles |
| \`constraintCount\` | Number of distance constraints |

\`\`\`typescript
const count = 3;
const positions = new Float64Array([0, 0, 1, 0, 2, 0]);
const prevPositions = new Float64Array([0, 0, 1, 0, 2, 0]);
// Two constraints: particle 0--1 and 1--2, rest length 1.0
const constraints = new Float64Array([0, 1, 1.0, 1, 2, 1.0]);

const result = await ctx.execute('verlet-constraints', {
  buffers: [
    { name: 'positions', data: positions, usage: 'readwrite' },
    { name: 'prevPositions', data: prevPositions, usage: 'readwrite' },
    { name: 'constraints', data: constraints, usage: 'read' },
  ],
  uniforms: { dt: 1 / 60, gravity: 9.8, count, constraintCount: 2 },
});

const newPositions = result.buffers.get('positions');
const newPrev = result.buffers.get('prevPositions');
\`\`\`

The algorithm:
1. Computes velocity from position difference (\`current - previous\`)
2. Applies gravity to the y-component
3. Updates positions via Verlet integration
4. Relaxes each distance constraint by moving both particles toward the rest length

### n-body

Gravitational N-body simulation step for 3D particle systems.

**Buffers:**

| Name | Usage | Format |
|---|---|---|
| \`positions\` | \`readwrite\` | 3 floats per particle (x, y, z), length = \`count * 3\` |
| \`velocities\` | \`readwrite\` | 3 floats per particle (vx, vy, vz), length = \`count * 3\` |
| \`masses\` | \`read\` | 1 float per particle, length = \`count\` |

**Uniforms:**

| Name | Description |
|---|---|
| \`dt\` | Time step (seconds) |
| \`G\` | Gravitational constant |
| \`count\` | Number of particles |

\`\`\`typescript
const count = 2;
const positions = new Float64Array([
  0, 0, 0,  // Particle 0 at origin
  1, 0, 0,  // Particle 1 at (1, 0, 0)
]);
const velocities = new Float64Array(count * 3); // All zero
const masses = new Float64Array([1e6, 1e6]);

const result = await ctx.execute('n-body', {
  buffers: [
    { name: 'positions', data: positions, usage: 'readwrite' },
    { name: 'velocities', data: velocities, usage: 'readwrite' },
    { name: 'masses', data: masses, usage: 'read' },
  ],
  uniforms: { dt: 0.01, G: 6.674e-11, count },
});

const newPositions = result.buffers.get('positions');
const newVelocities = result.buffers.get('velocities');
\`\`\`

A softening factor of \`1e-10\` is added to distance calculations to prevent
singularities when particles are very close together.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| Unknown kernel name | Throws \`Error: CpuBackend: unknown kernel '<name>'\` |
| Missing required buffer | Throws \`Error: CpuBackend: missing buffer '<name>'\` |
| Missing required uniform | Throws \`Error: CpuBackend: missing uniform '<key>'\` |
| GPU init fails during auto-detect | Silently falls back to the next backend |
| All GPU backends fail | Falls back to CPU (always available) |
| \`dispose()\` called, then \`execute()\` | Undefined behavior -- create a new context first |

---

## Testing with CPU Backend

For deterministic tests, force the CPU backend:

\`\`\`typescript
import { setComputeBackend, createComputeContext } from '@asymmetric-effort/specifyjs/compute';

beforeAll(() => {
  setComputeBackend('cpu');
});

test('matrix multiply', async () => {
  const ctx = await createComputeContext();
  const result = await ctx.execute('matrix-multiply', {
    buffers: [
      { name: 'a', data: new Float64Array([1, 0, 0, 1]), usage: 'read' },
      { name: 'b', data: new Float64Array([2, 3, 4, 5]), usage: 'read' },
      { name: 'result', data: new Float64Array(4), usage: 'write' },
    ],
    uniforms: { size: 2 },
  });
  expect(Array.from(result.buffers.get('result')!)).toEqual([2, 3, 4, 5]);
  ctx.dispose();
});
\`\`\`
`}]},{title:"Architecture",children:[{title:"Architecture",path:"architecture/README",content:`# Architecture

SpecifyJS follows a three-phase rendering architecture similar to React's Fiber architecture.

## System Overview

\`\`\`
createElement()     Fiber Tree        DOM
     │                  │               │
     ▼                  ▼               ▼
  VNode ──► Reconciler ──► Work Loop ──► Commit ──► Browser
              (diff)      (begin/       (mutate
               │           complete)     real DOM)
               ▼
          Effect Queue ──► Run Effects
\`\`\`

## Phases

### 1. Begin Phase (top-down)
Walk the fiber tree, rendering components, reconciling children, and building the new fiber tree.

### 2. Complete Phase (bottom-up)
Create/update DOM nodes for host fibers. Build the DOM subtree bottom-up.

### 3. Commit Phase
Apply all DOM mutations atomically, attach refs, run lifecycle methods and effects.

## Key Modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| Types | \`src/shared/types.ts\` | Core type definitions, fiber tags, effect flags |
| createElement | \`src/core/create-element.ts\` | Virtual element creation |
| Fiber | \`src/core/fiber.ts\` | Fiber node creation, work-in-progress cloning |
| Reconciler | \`src/core/reconciler.ts\` | Two-pass keyed diffing algorithm |
| Scheduler | \`src/core/scheduler.ts\` | Batched updates, microtask scheduling |
| Hook State | \`src/hooks/hook-state.ts\` | Hook linked list, effect queue, deps comparison |
| Dispatcher | \`src/hooks/dispatcher.ts\` | Concrete hook implementations |
| Work Loop | \`src/dom/work-loop.ts\` | Begin/complete/commit phases, DOM mutations |
| Events | \`src/dom/synthetic-event.ts\` | Cross-browser event normalization |

## Detailed Architecture

- [Virtual DOM](virtual-dom.md) — Element creation and tree structure
- [Fiber & Reconciler](fiber-reconciler.md) — Diffing and tree updates
- [Hooks Internals](hooks-internals.md) — How hooks work under the hood
- [Event System](event-system.md) — Synthetic event delegation
`},{title:"Event System",path:"architecture/event-system",content:`# Event System

## Synthetic Events

SpecifyJS wraps native browser events in synthetic event objects for cross-browser consistency:

| Class | Native Event | Properties |
|-------|-------------|------------|
| \`SyntheticEvent\` | \`Event\` | type, target, preventDefault, stopPropagation |
| \`SyntheticMouseEvent\` | \`MouseEvent\` | clientX/Y, button, altKey, ctrlKey, getModifierState |
| \`SyntheticKeyboardEvent\` | \`KeyboardEvent\` | key, code, shiftKey, repeat, getModifierState |
| \`SyntheticFocusEvent\` | \`FocusEvent\` | relatedTarget |
| \`SyntheticInputEvent\` | \`InputEvent\` | data, inputType |
| \`SyntheticTouchEvent\` | \`TouchEvent\` | touches, targetTouches, changedTouches |
| \`SyntheticWheelEvent\` | \`WheelEvent\` | deltaX/Y/Z, deltaMode |

## Event Name Mapping

React-style camelCase names map to DOM events:

\`\`\`
onClick     → click
onKeyDown   → keydown
onChange    → change
onSubmit    → submit
onMouseMove → mousemove
\`\`\`

50+ events are supported including pointer, drag, clipboard, animation, and transition events.

## Event Registration

Events are registered directly on DOM elements via \`addEventListener\` during the commit phase. When props change, old listeners are removed and new ones attached.

\`\`\`typescript
// In updateDOMProperties:
if (EVENT_RE.test(key)) {
  const eventName = key.slice(2).toLowerCase();
  dom.addEventListener(eventName, handler);
}
\`\`\`

## No Event Pooling

Unlike React 16 and earlier, SpecifyJS does not pool synthetic events. The \`persist()\` method is a no-op for API compatibility.
`},{title:"Fiber & Reconciler",path:"architecture/fiber-reconciler",content:`# Fiber & Reconciler

## Fiber Nodes

Each element in the tree becomes a fiber — a mutable work unit:

\`\`\`typescript
interface Fiber {
  tag: FiberTag;        // HostComponent, FunctionComponent, ClassComponent, etc.
  type: ComponentType;  // 'div', MyComponent, Fragment symbol
  key: Key;             // Reconciliation identity
  stateNode: unknown;   // DOM node (host) or class instance
  pendingProps: Props;  // New props for this render
  memoizedProps: Props; // Props from last render
  memoizedState: unknown; // Hook linked list (functions) or state (classes)

  return: Fiber | null;  // Parent
  child: Fiber | null;   // First child
  sibling: Fiber | null; // Next sibling
  alternate: Fiber | null; // Previous render's fiber (double buffering)

  effectTag: EffectTag; // Placement, Update, Deletion
}
\`\`\`

## Double Buffering

SpecifyJS maintains two fiber trees:
- **Current** — represents what's on screen
- **Work-in-progress (WIP)** — being built during render

After commit, the WIP becomes the new current tree.

## Reconciliation Algorithm

### Single Child
Direct comparison: same type → reuse fiber, different type → replace.

### Multiple Children (Two-Pass)

**Pass 1 — Linear scan:**
Walk old and new children in order. Match by key. Break on first mismatch.

**Pass 2 — Map lookup:**
Build a Map of remaining old children by key. For each remaining new child, look up a match in the map. Matched fibers are reused; unmatched old fibers are deleted.

### Keyed Diffing

Keys enable O(n) reconciliation of reordered lists. Without keys, SpecifyJS falls back to index-based matching (O(n) but may cause unnecessary DOM mutations).

## Effect Tags

- \`Placement\` — New node, needs DOM insertion
- \`Update\` — Existing node with changed props
- \`Deletion\` — Node removed from tree
- \`Ref\` — Ref needs attaching/detaching

## Lane-Based Priority System

Each fiber has \`lanes\` and \`childLanes\` bitmask fields for concurrent rendering:

| Lane | Value | Purpose |
|------|-------|---------|
| \`SyncLane\` | 1 | \`flushSync\` — highest priority, synchronous |
| \`InputContinuousLane\` | 2 | Drag, scroll, hover |
| \`DefaultLane\` | 4 | Normal \`useState\`/\`useReducer\` updates |
| \`TransitionLane1/2\` | 8/16 | \`startTransition\` — interruptible, lower priority |
| \`IdleLane\` | 64 | Background/offscreen work |

### Scheduling

The work loop has two modes:
- **\`workLoopSync\`** — processes the entire tree without yielding (used by \`SyncLane\` and \`DefaultLane\`)
- **\`workLoopConcurrent\`** — yields to the host after each 5ms frame budget via \`shouldYieldToHost()\` (used by \`TransitionLane\` and \`IdleLane\`)

\`ensureRootIsScheduled\` inspects \`FiberRoot.pendingLanes\` and picks the appropriate mode. Higher-priority updates can interrupt in-progress lower-priority work.

### State Update Flow

1. \`setState()\` calls \`requestUpdateLane()\` → returns lane based on context (transition, flushSync, or default)
2. \`markFiberWithLane()\` propagates the lane up the fiber tree via \`childLanes\`
3. \`ensureRootIsScheduled()\` schedules sync or concurrent work based on the highest-priority pending lane
4. After commit, completed lanes are cleared from \`pendingLanes\`
`},{title:"Hooks Internals",path:"architecture/hooks-internals",content:`# Hooks Internals

## Hook Linked List

Each function component's fiber stores a linked list of hooks:

\`\`\`
fiber.memoizedState → Hook₁ → Hook₂ → Hook₃ → null
                       │        │        │
                    useState  useEffect  useRef
\`\`\`

On each render, \`allocateHook()\` advances through the list. Hooks must be called in the same order every render.

## Dispatcher Pattern

Hooks are thin functions that delegate to a dispatcher:

\`\`\`
useState() → resolveDispatcher().useState() → useStateImpl()
\`\`\`

The dispatcher is installed before rendering a function component and uninstalled after. Calling hooks outside a component body fails because the dispatcher is null.

## State Update Queue

Each \`useState\`/\`useReducer\` hook maintains a queue of pending updates:

\`\`\`typescript
hook.queue = [{ action: 5 }, { action: prev => prev + 1 }]
\`\`\`

The queue is a **shared mutable array** — the \`setState\` closure and the re-render both reference the same array. This enables state updates to accumulate between renders.

On re-render, the queue is processed in order and cleared in-place (\`queue.length = 0\`) to maintain closure reference stability.

## Effect System

Effects are pushed to a per-fiber effect list during render:

\`\`\`typescript
EffectHook {
  tag: HasEffect | Passive,  // Passive = useEffect, Layout = useLayoutEffect
  create: () => cleanup,
  destroy: cleanup | null,
  deps: [dep1, dep2],
  next: EffectHook | null,
}
\`\`\`

During commit:
1. Run \`destroy\` (cleanup) from previous render
2. Run \`create\` and store returned cleanup as \`destroy\`

Deps are compared with \`Object.is\` — if all match, the effect is skipped.

## Re-render Trigger

When \`setState\`/\`dispatch\` is called:
1. Update is pushed to the hook's queue
2. \`scheduleUpdate\` is called with a callback that finds the fiber's root
3. \`scheduleRender\` fires a microtask that re-renders from the root
4. The component re-executes, processes its queued updates, and produces new output
`},{title:"Virtual DOM",path:"architecture/virtual-dom",content:"# Virtual DOM\n\n## Elements\n\n`createElement` produces lightweight VNode objects:\n\n```typescript\n{\n  $$typeof: SPEC_ELEMENT_TYPE,  // Symbol — prevents JSON injection\n  type: 'div',                    // String for host, function/class for components\n  props: { className: 'card' },   // Includes children\n  key: null,                      // Reconciliation identity\n  ref: null,                      // DOM/instance ref\n}\n```\n\n## Type Symbols\n\nEach special component type has a unique symbol:\n- `SPEC_FRAGMENT_TYPE` — Fragment (no DOM wrapper)\n- `SPEC_PORTAL_TYPE` — Render into different DOM subtree\n- `SPEC_PROVIDER_TYPE` — Context Provider\n- `SPEC_CONSUMER_TYPE` — Context Consumer\n- `SPEC_FORWARD_REF_TYPE` — Ref forwarding wrapper\n- `SPEC_MEMO_TYPE` — Memoized component wrapper\n- `SPEC_LAZY_TYPE` — Lazy-loaded component\n- `SPEC_SUSPENSE_TYPE` — Suspense boundary\n\n## Children Normalization\n\nChildren are normalized during reconciliation:\n- `null`, `undefined`, `boolean` → filtered out\n- `string`, `number` → text nodes\n- Arrays → flattened recursively\n- Elements → fiber nodes\n\n## JSX Runtime\n\nThe automatic JSX transform (`jsx-runtime.ts`) is a thin wrapper over `createElement` that handles the `key` extraction differently (passed as a separate argument by the compiler).\n"}]},{title:"Components",children:[{title:"Component Library Reference",path:"components/README",content:`# Component Library Reference

60 components across 9 families. All zero-dependency, pure SpecifyJS, ARIA accessible, keyboard navigable.

## Layout (7)

| Component | Description | Docs |
|-----------|-------------|------|
| Grid | CSS Grid container with areas, responsive breakpoints | [layout/grid.md](layout/grid.md) |
| FlexContainer | Flexbox layout with FlexItem children | [layout/flex-container.md](layout/flex-container.md) |
| Card | Content card with header/body/footer/image slots | [layout/card.md](layout/card.md) |
| Panel | Collapsible panel with animated transition | [layout/panel.md](layout/panel.md) |
| Splitter | Resizable split pane with draggable divider | [layout/splitter.md](layout/splitter.md) |
| Tabs | Tabbed content with line/card/pill variants | [layout/tabs.md](layout/tabs.md) |
| ScrollContainer | Scrollable container with edge shadow indicators | [layout/scroll-container.md](layout/scroll-container.md) |

## Form (14)

| Component | Description | Docs |
|-----------|-------------|------|
| FormFieldWrapper | Base wrapper with label, help text, error display | [form/wrapper.md](form/wrapper.md) |
| TextField | Single-line input with prefix/suffix slots | [form/textfield.md](form/textfield.md) |
| MultilineField | Textarea with auto-resize and character count | [form/multiline.md](form/multiline.md) |
| TextEditor | WYSIWYG rich text editor with toolbar | [form/texteditor.md](form/texteditor.md) |
| Select | Custom dropdown with search, multi-select, groups | [form/select.md](form/select.md) |
| Checkbox | Styled checkbox with indeterminate state | [form/checkbox.md](form/checkbox.md) |
| RadioGroup | Radio button group with horizontal/vertical layout | [form/radio.md](form/radio.md) |
| Toggle | Sliding pill switch with configurable colors | [form/toggle.md](form/toggle.md) |
| Slider | Range slider with marks, dual-handle mode | [form/slider.md](form/slider.md) |
| DatePicker | Calendar dropdown with month/year navigation | [form/datepicker.md](form/datepicker.md) |
| TimePicker | Hour/minute spinners with 12h/24h format | [form/timepicker.md](form/timepicker.md) |
| ColorPicker | Swatch grid with hex input | [form/color-picker.md](form/color-picker.md) |
| FileUpload | Drag-and-drop zone with file list | [form/file-upload.md](form/file-upload.md) |
| NumberSpinner | Numeric input with +/- buttons | [form/number-spinner.md](form/number-spinner.md) |

## Navigation (10)

| Component | Description | Docs |
|-----------|-------------|------|
| NavWrapper | Base container with orientation, ARIA, keyboard nav | [nav/wrapper.md](nav/wrapper.md) |
| Dropdown | Dropdown menu with nested submenus | [nav/dropdown.md](nav/dropdown.md) |
| TreeNav | Tree navigation with extensible TreeNode class | [nav/treenav.md](nav/treenav.md) |
| Accordion | Collapsible sections with animated transitions | [nav/accordion.md](nav/accordion.md) |
| Breadcrumb | Breadcrumb trail with separator and collapse | [nav/breadcrumb.md](nav/breadcrumb.md) |
| Pagination | Page numbers with ellipsis and prev/next | [nav/pagination.md](nav/pagination.md) |
| Stepper | Step wizard with circle/dot variants | [nav/stepper.md](nav/stepper.md) |
| Sidebar | Collapsible sidebar with nested sections | [nav/sidebar.md](nav/sidebar.md) |
| Toolbar | Horizontal toolbar with button groups | [nav/toolbar.md](nav/toolbar.md) |
| Menubar | Menu bar with hover-switch dropdowns | [nav/menubar.md](nav/menubar.md) |

## Overlay (6)

| Component | Description | Docs |
|-----------|-------------|------|
| Modal | Dialog with backdrop and focus trap | [overlay/modal.md](overlay/modal.md) |
| Drawer | Slide-in panel from any edge | [overlay/drawer.md](overlay/drawer.md) |
| Popover | Positioned popover with arrow | [overlay/popover.md](overlay/popover.md) |
| Tooltip | Hover tooltip with delay | [overlay/tooltip.md](overlay/tooltip.md) |
| Toast | Notification system with useToast hook | [overlay/toast.md](overlay/toast.md) |
| ContextMenu | Right-click menu with nested submenus | [overlay/context-menu.md](overlay/context-menu.md) |

## Data Display (6)

| Component | Description | Docs |
|-----------|-------------|------|
| DataGrid | Full-featured table with sort, filter, pagination | [data/data-grid.md](data/data-grid.md) |
| ListView | Styled list with custom item rendering | [data/list-view.md](data/list-view.md) |
| VirtualScroll | Virtualized list for large datasets | [data/virtual-scroll.md](data/virtual-scroll.md) |
| Tag | Rounded pill with solid/outline/subtle variants | [data/tag.md](data/tag.md) |
| Badge | Count or dot indicator overlay | [data/badge.md](data/badge.md) |
| Avatar | Image/initials avatar with status dot | [data/avatar.md](data/avatar.md) |

## Feedback (5)

| Component | Description | Docs |
|-----------|-------------|------|
| ProgressBar | Bar and circular progress indicators | [feedback/progress-bar.md](feedback/progress-bar.md) |
| Spinner | Rotating loading spinner | [feedback/spinner.md](feedback/spinner.md) |
| Skeleton | Content placeholder with shimmer animation | [feedback/skeleton.md](feedback/skeleton.md) |
| Alert | Info/success/warning/error banners | [feedback/alert.md](feedback/alert.md) |
| EmptyState | Empty content placeholder with CTA | [feedback/empty-state.md](feedback/empty-state.md) |

## Media (3)

| Component | Description | Docs |
|-----------|-------------|------|
| Image | Enhanced image with lazy loading and fallback | [media/image.md](media/image.md) |
| Carousel | Image/content slider with arrows and dots | [media/carousel.md](media/carousel.md) |
| VideoPlayer | Video player with custom controls overlay | [media/video-player.md](media/video-player.md) |

## Page Layouts (4)

| Component | Description | Docs |
|-----------|-------------|------|
| UnityDesktop | Ubuntu Unity-style desktop with launcher sidebar and top panel | [page/unity-desktop.md](page/unity-desktop.md) |
| WordProcessor | Word processor layout with menu bar, toolbar, ruler, and document page | [page/word-processor.md](page/word-processor.md) |
| IDE | VS Code-style IDE with file explorer, editor, terminal, and status bar | [page/ide.md](page/ide.md) |
| TradingDashboard | Stock trading terminal with chart, order book, and watchlist grid | [page/trading-dashboard.md](page/trading-dashboard.md) |

## Visualization (5)

| Component | Description | Docs |
|-----------|-------------|------|
| VizWrapper | Container with title, legend, CSS isolation | [viz/wrapper.md](viz/wrapper.md) |
| HypercubeGraph | N-dimensional hypercube with rotation | [viz/graph.md](viz/graph.md) |
| LineGraph | 2D line chart with multi-line support | [viz/2D-line-graph.md](viz/2D-line-graph.md) |
| BarGraph | Vertical/horizontal bar chart | [viz/2D-bar-graph.md](viz/2D-bar-graph.md) |
| PieGraph | Pie and donut chart | [viz/2D-pie-graph.md](viz/2D-pie-graph.md) |
`}]},{title:"Contributing",children:[{title:"Contributing",path:"contributing/README",content:`# Contributing

## Development Setup

### Prerequisites

- [Bun](https://bun.sh) (JavaScript/TypeScript runtime and package manager)
- Docker (for local CI testing)

### Clone and Install

\`\`\`bash
git clone <repo-url>
cd specifyjs

# Core framework
cd core
bun install
\`\`\`

### Run Tests

\`\`\`bash
# Core — unit/integration
cd core && bun run test

# Core — E2E
cd core && bun run test:e2e
\`\`\`

### Run All CI Locally

\`\`\`bash
./scripts/act-run.sh          # All jobs
./scripts/act-run.sh --list   # See available jobs
\`\`\`

## Monorepo Structure

| Directory | Purpose | Language |
|-----------|---------|----------|
| \`core/\` | SpecifyJS framework | TypeScript |
| \`components/\` | Reusable components | TypeScript |
| \`docs/\` | Documentation | Markdown |
| \`skills/\` | Claude AI skills | YAML/Markdown |

## Workflow

1. Fork the repository
2. Create a feature branch from \`main\`
3. Make changes with tests
4. Verify locally: \`./scripts/act-run.sh\`
5. Open a pull request

## See Also

- [Code Style](code-style.md) — Formatting and conventions
- [CI/CD](ci-cd.md) — Pipeline details
`},{title:"CI/CD",path:"contributing/ci-cd",content:`# CI/CD

## GitHub Actions

The CI pipeline (\`.github/workflows/ci.yml\`) runs on every push and PR to \`main\`.

### Jobs

| Job | What it does | Duration |
|-----|-------------|----------|
| **lint** | TypeScript type check + Prettier format check | ~10s |
| **test** | 465 Vitest tests with coverage thresholds | ~15s |
| **build** | Rollup build + verify outputs + bundle size check (< 512KB) | ~15s |
| **e2e** | Install Playwright + run 27 browser tests | ~30s |

### Coverage Thresholds

Enforced in \`vitest.config.ts\`:
- Statements: 95%
- Branches: 94%
- Functions: 97%
- Lines: 95%

## Local Testing with act

[nektos/act](https://github.com/nektos/act) runs GitHub Actions workflows locally in Docker containers.

### Install act

\`\`\`bash
curl -sSL https://github.com/nektos/act/releases/latest/download/act_Linux_x86_64.tar.gz | tar -xz -C ~/bin act
\`\`\`

### Run Workflows

\`\`\`bash
./scripts/act-run.sh              # All jobs
./scripts/act-run.sh lint         # Single job
./scripts/act-run.sh --list       # List jobs
\`\`\`

### Container Image

The \`.actrc\` file maps \`ubuntu-latest\` to \`catthehacker/ubuntu:act-latest\`, which includes Node.js and system dependencies needed for Playwright.

### Artifact Uploads

\`upload-artifact\` steps are guarded with \`!env.ACT\` and skipped during local testing (the GitHub artifact API isn't available locally).

## Adding New CI Steps

1. Edit \`.github/workflows/ci.yml\`
2. Test locally: \`./scripts/act-run.sh <job-name>\`
3. Verify all jobs pass: \`./scripts/act-run.sh\`
4. Commit
`},{title:"Code Style",path:"contributing/code-style",content:`# Code Style

## TypeScript (core/)

- **Strict mode** — \`strict: true\` in tsconfig
- **No \`any\`** — Avoid unless documented
- **\`const\` over \`let\`** — Never \`var\`
- **Named exports** — No default exports
- **Formatting** — Prettier with: single quotes, trailing commas, 100 char width
- **Semicolons** — Always
- **Arrow parens** — Always (\`(x) => x\`, not \`x => x\`)

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

\`\`\`
feat: add useOptimistic hook
fix: prevent stale closure in setState
test: add coverage for pre-render context restoration
refactor: simplify fiber cloning in memo bail-out
docs: add sourcemap command documentation
chore: update playwright to v1.60
perf: reduce allocation in reconciler hot path
\`\`\`

## Documentation (docs/)

- Markdown with GitHub-flavored extensions
- Code blocks with language tags
- Internal links use relative paths
- One concept per page, linked from index
`}]}],r={};for(const n of t)for(const e of n.children)r[e.path]=e;export{t as a,r as d};
