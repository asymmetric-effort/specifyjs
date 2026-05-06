// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { createElement } from 'specifyjs';
import { useState, useCallback } from 'specifyjs/hooks';
import { useHead } from 'specifyjs/hooks';

// ─── Feature article content ──────────────────────────────────────────

interface FeatureArticle {
  title: string;
  summary: string;
  sections: { heading: string; body: string }[];
}

const FEATURES: FeatureArticle[] = [
  {
    title: 'Concurrent Rendering',
    summary:
      'Lane-based priority system with time-slicing. useTransition and useDeferredValue for responsive UIs.',
    sections: [
      {
        heading: 'How It Works',
        body: 'SpecifyJS implements a lane-based priority system inspired by React 18. Each state update is assigned a priority lane — SyncLane for flushSync, DefaultLane for normal updates, and TransitionLane for deferred work. The scheduler processes higher-priority lanes first, interrupting lower-priority renders when urgent updates arrive.',
      },
      {
        heading: 'Time-Slicing',
        body: 'The work loop yields to the browser every 5ms via shouldYieldToHost(), preventing long renders from blocking user input. Work is split into units (one per fiber node) and the loop checks the frame budget between each unit. If time is up, the remaining work is scheduled as a continuation via MessageChannel.',
      },
      {
        heading: 'useTransition & useDeferredValue',
        body: 'useTransition wraps state updates in TransitionLane priority — the isPending flag flips immediately (DefaultLane) while the expensive update is deferred. useDeferredValue returns the previous value until the transition render completes, keeping input responsive during heavy computations.',
      },
      {
        heading: 'Why It Matters',
        body: 'Without concurrent rendering, a large list re-render blocks the main thread — the UI freezes. With lane-based scheduling, user interactions (typing, clicking) always take priority over background work, resulting in a consistently responsive experience.',
      },
    ],
  },
  {
    title: 'Full Hooks API',
    summary:
      'useState, useEffect, useContext, useReducer, useMemo, useCallback, useRef, and more.',
    sections: [
      {
        heading: 'How It Works',
        body: 'Hooks are implemented as a linked list of hook states attached to each fiber node. When a function component renders, a dispatcher is installed that routes hook calls (useState, useEffect, etc.) to concrete implementations that allocate and read from the fiber\'s hook list.',
      },
      {
        heading: '15 Built-in Hooks',
        body: 'useState, useEffect, useContext, useReducer, useCallback, useMemo, useRef, useImperativeHandle, useLayoutEffect, useDebugValue, useId, useDeferredValue, useTransition, useSyncExternalStore, useInsertionEffect — plus custom hooks like useHead for meta tags and useRouter for navigation.',
      },
      {
        heading: 'Custom Hooks',
        body: 'Build your own hooks by composing built-in hooks. Custom hooks follow the same rules — call them at the top level, never inside conditions. The useFetch hook on this site demonstrates the pattern: it combines useState, useEffect, and fetch() into a reusable data-loading hook.',
      },
      {
        heading: 'Why It Matters',
        body: 'Hooks enable stateful logic reuse without class components. They compose naturally, making complex state management readable and testable. The complete API surface means you can build any React-style application without missing functionality.',
      },
    ],
  },
  {
    title: 'Build-Time Pre-rendering',
    summary:
      'Generate static HTML during builds with renderToString. SpecifyJS is a browser-side SPA framework — dynamic content is fetched client-side via HTTPS.',
    sections: [
      {
        heading: 'How It Works',
        body: 'renderToString takes a component tree and produces an HTML string. This runs during the build process (e.g., in a Node.js build script) to generate static HTML files. The output is served as-is by a web server or CDN — no runtime rendering on the server.',
      },
      {
        heading: 'Not Server-Side Rendering',
        body: 'SpecifyJS deliberately does NOT support runtime SSR. Server-side code execution creates security risks: code injection, denial of service, and data leakage. By limiting the server to serving static assets and data APIs, the attack surface is minimal and well-understood.',
      },
      {
        heading: 'Hydration',
        body: 'hydrateRoot reuses existing pre-rendered DOM nodes instead of re-creating them. Event listeners and component state are attached to the existing HTML structure, avoiding a flash of re-rendered content. If the DOM doesn\'t match, SpecifyJS falls back gracefully to creating new nodes.',
      },
      {
        heading: 'Why It Matters',
        body: 'Pre-rendering gives you SEO benefits and fast initial paint without the security risks of runtime SSR. Dynamic content is fetched client-side via HTTPS from API endpoints, keeping the architecture simple and the attack surface small.',
      },
    ],
  },
  {
    title: 'Hash-Based Router',
    summary:
      'Built-in SPA routing with Router, Route, Link, useParams, and useNavigate. No server configuration required.',
    sections: [
      {
        heading: 'How It Works',
        body: 'The router listens to window hashchange events and provides routing context via createContext. Route components match path patterns against the current hash and conditionally render their children. Link components render anchor tags with hash hrefs and prevent default navigation.',
      },
      {
        heading: 'Path Matching',
        body: 'The matchPath utility supports literal segments (/about), named parameters (/users/:id), wildcards (/files/*), and exact vs. partial matching for nested routes. Parameters are automatically decoded and provided via useParams.',
      },
      {
        heading: 'No Server Configuration',
        body: 'Hash-based routing (#/path) works on any static file server — GitHub Pages, S3, Nginx — without URL rewrite rules. The server always serves the same index.html, and the router handles navigation entirely in the browser.',
      },
      {
        heading: 'Why It Matters',
        body: 'A built-in router means no third-party routing library. Zero additional dependencies, zero supply chain risk. The hash-based approach works everywhere without server configuration, making deployment trivial.',
      },
    ],
  },
  {
    title: 'Hydration',
    summary:
      'hydrateRoot reuses existing pre-rendered DOM nodes — no flash of re-rendered content.',
    sections: [
      {
        heading: 'How It Works',
        body: 'During hydration, the work loop walks the existing DOM children in parallel with fiber creation. For each HostComponent fiber, it claims the next matching DOM element by tag name. For HostText fibers, it claims the next text node. Claimed nodes are reused (stateNode is set to the existing DOM node) and marked NoEffect to prevent duplicate insertion.',
      },
      {
        heading: 'Event Attachment',
        body: 'After claiming a DOM node, updateDOMProperties runs to attach event listeners and update any props that differ from the server-rendered HTML. The DOM structure stays intact — only JavaScript behavior is added.',
      },
      {
        heading: 'Mismatch Handling',
        body: 'If the DOM structure doesn\'t match (wrong tag, missing node), SpecifyJS falls back to creating a new node. This ensures the app always renders correctly, even if the pre-rendered HTML is stale or incomplete.',
      },
      {
        heading: 'Why It Matters',
        body: 'Hydration eliminates the flash of blank content that occurs when a client-rendered SPA replaces server-rendered HTML. Users see content immediately, and interactivity is added seamlessly.',
      },
    ],
  },
  {
    title: 'Zero Dependencies',
    summary:
      'Every algorithm implemented from scratch. No runtime dependencies. 4KB gzipped core.',
    sections: [
      {
        heading: 'How It Works',
        body: 'Every algorithm in SpecifyJS — virtual DOM diffing, fiber reconciliation, hook state management, event normalization, concurrent scheduling, path matching — is implemented from scratch in TypeScript. The published package has zero entries in the "dependencies" field of package.json.',
      },
      {
        heading: 'Bundle Size',
        body: 'The core module compiles to approximately 4KB gzipped. The DOM renderer, hooks, router, and all built-in components are included. Rollup with Terser produces tree-shakeable ESM and CJS bundles with source maps.',
      },
      {
        heading: 'Supply Chain Integrity',
        body: 'Zero dependencies means zero transitive dependencies. There is no node_modules tree to audit, no risk of a compromised upstream package injecting malicious code. The entire framework is contained in a single repository under your control. Our CI/CD pipelines are equally locked down — every GitHub Action is pinned to a full commit SHA, never a floating tag. We avoid third-party NPM packages entirely and remain committed to never pulling a left-pad.',
      },
      {
        heading: 'Why It Matters',
        body: 'Supply chain attacks are the dominant threat to JavaScript applications. By eliminating all runtime dependencies, SpecifyJS removes this entire attack vector. You audit one codebase, not hundreds of packages.',
      },
    ],
  },
  {
    title: 'Security Focused',
    summary:
      'Zero runtime dependencies — complete supply chain integrity. No server-side code execution; client-server interaction limited to data exchange via HTTPS.',
    sections: [
      {
        heading: 'Supply Chain Integrity',
        body: 'SpecifyJS has zero runtime dependencies. Every algorithm is implemented from scratch — diffing, scheduling, event handling, path matching, HTML escaping. No transitive dependencies means no supply chain attack surface. One codebase to audit, not hundreds of packages. CI/CD pipelines pin every GitHub Action to a full commit SHA — no floating tags, no upstream tampering. We avoid third-party NPM packages entirely and remain committed to never pulling a left-pad.',
      },
      {
        heading: 'No Server-Side Execution',
        body: 'The framework is strictly browser-side. The server\'s role is limited to serving static build artifacts and responding to data API requests with JSON. Component code never executes on the server at request time, eliminating code injection, DoS, and data leakage risks.',
      },
      {
        heading: 'Automatic XSS Prevention',
        body: 'All text content and attribute values are automatically HTML-escaped during rendering. The only way to inject raw HTML is through dangerouslySetInnerHTML, which requires explicit opt-in and is easily auditable. The synthetic event system normalizes events across browsers without exposing raw DOM access.',
      },
      {
        heading: 'CI/CD Security',
        body: 'CodeQL static analysis runs on every push and pull request, scanning TypeScript and Go code for vulnerabilities. Dependabot monitors all dependencies (npm, Go modules, GitHub Actions) for known CVEs and opens PRs for security updates automatically.',
      },
      {
        heading: 'Why It Matters',
        body: 'Security is not a feature you add later — it\'s an architectural decision. By choosing zero dependencies, browser-only execution, and automatic escaping, SpecifyJS eliminates entire categories of vulnerabilities at the design level rather than patching them after the fact.',
      },
    ],
  },
  {
    title: 'useHead — Meta Tags',
    summary:
      'Declaratively set page title, description, keywords, Open Graph, and Twitter Card meta tags from within any component.',
    sections: [
      {
        heading: 'How It Works',
        body: 'The useHead hook accepts an object with title, description, keywords, author, canonical URL, Open Graph tags, Twitter Card tags, and arbitrary meta entries. It uses useEffect internally to apply the tags on mount and clean them up on unmount, ensuring stale meta tags don\'t persist across route changes.',
      },
      {
        heading: 'Route-Aware SEO',
        body: 'Each screen or page component can call useHead with page-specific meta tags. When the user navigates away, the previous page\'s meta tags are automatically removed and the new page\'s tags are applied. This works seamlessly with the hash-based router.',
      },
      {
        heading: 'Open Graph & Twitter Cards',
        body: 'Set og:title, og:description, og:image, twitter:card, twitter:title, and other social sharing tags from within your components. The tags are rendered as <meta> elements in the document <head>, making your SPA\'s pages shareable on social media with proper previews.',
      },
      {
        heading: 'Why It Matters',
        body: 'SPAs traditionally struggle with per-page meta tags because the HTML shell is static. useHead solves this by managing <head> content from within the component tree, giving each route its own title, description, and social sharing metadata.',
      },
    ],
  },
];

// ─── HomeScreen component ─────────────────────────────────────────────

export function HomeScreen() {
  const [openArticle, setOpenArticle] = useState<number | null>(null);

  useHead({
    title: 'SpecifyJS — Declarative TypeScript UI Framework',
    description:
      'A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity. Zero dependencies, 4KB gzipped.',
    keywords:
      'specifyjs, typescript, ui framework, spa, single page application, declarative, components, Sonora, Texas, 76950',
    author: 'Asymmetric Effort, LLC',
    og: {
      title: 'SpecifyJS',
      description:
        'A declarative TypeScript UI framework built for performance.',
      type: 'website',
      url: 'https://specifyjs.asymmetric-effort.com',
    },
    httpEquiv: {
      csp: "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://picsum.photos; connect-src 'self'; base-uri 'self'; form-action 'self'",
      referrer: 'strict-origin-when-cross-origin',
    },
  });

  const closeArticle = useCallback(
    ((..._args: unknown[]) => setOpenArticle(null)) as (
      ...args: unknown[]
    ) => unknown,
    [],
  );

  const handleBackdropClick = useCallback(
    ((...args: unknown[]) => {
      const e = args[0] as Event;
      if ((e.target as HTMLElement).classList.contains('dialog-backdrop')) {
        setOpenArticle(null);
      }
    }) as (...args: unknown[]) => unknown,
    [],
  );

  const article = openArticle !== null ? FEATURES[openArticle] : null;

  return createElement(
    'div',
    null,
    // Hero
    createElement(
      'div',
      { className: 'hero' },
      createElement(
        'h1',
        null,
        createElement('span', null, 'Specify'),
        'JS',
      ),
      createElement(
        'p',
        null,
        'A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity.',
      ),
      createElement(
        'div',
        { className: 'hero-stats' },
        statItem('4KB', 'Core (gzipped)'),
        statItem('0', 'Dependencies'),
        statItem('98%+', 'Test Coverage'),
        statItem('15+', 'Hooks'),
      ),
    ),

    // Features
    createElement(
      'div',
      { className: 'section' },
      createElement('h2', null, 'Features'),
      createElement(
        'div',
        { className: 'features-grid' },
        ...FEATURES.map((f, i) =>
          createElement(
            'div',
            {
              key: f.title,
              className: 'feature-card feature-card--clickable',
              role: 'button',
              tabindex: 0,
              onClick: () => setOpenArticle(i),
            },
            createElement('h3', null, f.title),
            createElement('p', null, f.summary),
            createElement(
              'span',
              { className: 'feature-card-cta' },
              'Learn more \u2192',
            ),
          ),
        ),
      ),
    ),

    // Feature article dialog
    article
      ? createElement(
          'div',
          { className: 'dialog-backdrop', role: 'presentation', onClick: handleBackdropClick },
          createElement(
            'div',
            { className: 'dialog-panel' },
            createElement(
              'div',
              { className: 'dialog-header' },
              createElement(
                'h2',
                { className: 'dialog-title' },
                article.title,
              ),
              createElement(
                'button',
                {
                  className: 'dialog-close',
                  onClick: closeArticle,
                  'aria-label': 'Close',
                },
                '\u00d7',
              ),
            ),
            createElement(
              'div',
              { className: 'dialog-body' },
              createElement(
                'p',
                {
                  style: {
                    fontSize: '16px',
                    color: '#64748b',
                    marginBottom: '24px',
                    lineHeight: '1.7',
                  },
                },
                article.summary,
              ),
              ...article.sections.map((s) =>
                createElement(
                  'div',
                  { key: s.heading, className: 'article-section' },
                  createElement('h3', { className: 'article-heading' }, s.heading),
                  createElement('p', { className: 'article-body' }, s.body),
                ),
              ),
            ),
          ),
        )
      : null,

  );
}

function statItem(value: string, label: string) {
  return createElement(
    'div',
    { className: 'hero-stat' },
    createElement('div', { className: 'hero-stat-value' }, value),
    createElement('div', { className: 'hero-stat-label' }, label),
  );
}
