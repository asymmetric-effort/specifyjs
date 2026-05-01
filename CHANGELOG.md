<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# Changelog

All notable changes to SpecifyJS are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.2.5] - 2026-04-30

### Added
- Linear algebra library for math/compute operations
- GPU compute abstraction layer
- N-joint pendulum physics simulation

## [0.2.4] - 2026-04-30

### Added
- Custom force support (`customForce`) for ForceGraph component
- Trail rendering for ForceGraph animations
- Double pendulum demo

### Fixed
- Compact 3D Layers spinners layout
- Dark mode colors for NumberSpinner component

## [0.2.3] - 2026-04-30

### Added
- 3D Layers rotation spinners (X/Y/Z axis controls)
- Page-layouts feature enabled by default

### Fixed
- PDV test updated for 11 accordion sections after page-layouts enabled

## [0.2.2] - 2026-04-30

### Fixed
- Hypercube edge and background colors adapt to dark/light mode
- Remove `<noscript>` SEO fallback after SPA hydration to avoid stale content
- Update setup-bun action to use actions/cache v5 (Node 24 compatibility)

## [0.2.1] - 2026-04-30

### Added
- All visualization components now responsive — fill container width automatically
- ForceGraph drag interaction support
- Word Cloud data-driven rendering

## [0.2.0] - 2026-04-29

### Added
- Noscript SEO fallback plugin for search engine crawlers

### Fixed
- ThreeDLayers responsive sizing — fills container and adapts to browser viewport

## [0.1.10] - 2026-04-28

### Fixed
- CSP inline handler violations resolved
- Label/id linking for form accessibility
- Pinned unstable dependency versions

## [0.1.9] - 2026-04-28

### Fixed
- PDV toggle test selector updated for `role="switch"` pattern

## [0.1.8] - 2026-04-28

### Fixed
- PDV toggle E2E test updated for refactored Toggle component

## [0.1.7] - 2026-04-28

### Added
- Async function evaluation for graph components
- ForceGraph animation loop

### Fixed
- Restore ForceGraph animation after refactor
- Larger 3D layers default size
- Scalable Mandelbrot rendering

## [0.1.6] - 2026-04-28

### Added
- Render loop detection with dev warnings
- Effect cycle detection to prevent infinite update loops

## [0.1.5] - 2026-04-28

### Fixed
- ForceGraph infinite re-render loop causing page hang
- 3D layers visualization rendering
- Mandelbrot SVG rendering
- Dark mode ListView styling
- ARIA attribute warnings

## [0.1.4] - 2026-04-28

### Added
- 26 data-driven visualization components
- Button component
- Gallery refactored with categorized sections

### Changed
- Upgrade all GitHub Actions to Node 24 compatible versions

## [0.1.3] - 2026-04-28

### Added
- Interactive page layout components
- Button list gallery view
- Page layout hover states, dark mode support, and interactivity

### Removed
- Dashboard screen replaced by gallery

## [0.1.2] - 2026-04-28

### Added
- Page layout components (feature-flagged): Hero, Pricing, FAQ, Testimonial
- Toolbar toggle buttons with momentary click state
- Footer component with dialog 3D styling and close button

### Fixed
- Analog clock 24h mode — 12 divisions with inner/outer number rings

## [0.1.1] - 2026-04-27

### Added
- ARIA dev warnings for accessibility compliance
- SEO build plugin for meta tags
- Google Analytics component (invisible, configurable)
- Sonora, Texas, 76950 added to site keywords

### Removed
- AdSense integration removed from showcase site

## [0.1.0] - 2026-04-27

### Added
- Organization-level GitHub Actions workflows
- ARIA compliance enforcement across all components
- AdSense component integration
- Test coverage increased to >= 98%

## [0.0.12] - 2026-04-27

### Added
- ARIA compliance attributes on all interactive components
- AdSense component for ad placement
- Coverage threshold raised to >= 98%

## [0.0.11] - 2026-04-27

### Added
- Build-time sitemap.xml generation
- Build-time robots.txt generation
- Build-time llms.txt generation for LLM crawlers

## [0.0.10] - 2026-04-27

### Added
- System dark mode preference detection (`prefers-color-scheme`)

### Removed
- Removed specifyjs alias package

## [0.0.9] - 2026-04-27

### Fixed
- Manual .npmrc for OIDC — `actions/setup-node` registry-url injects bad token
- Use `npx npm@latest` for trusted publishing (OIDC requires npm >= 11.5.1)
- Remove registry-url from setup-node in publish job
- Separate PDV paths for main vs tags
- Pipeline ordering: publish depends on e2e directly

## [0.0.8] - 2026-04-27

### Fixed
- Publish runs after PDV in CI pipeline
- Site deploy runs on tags in addition to main
- Nav bar branding — "Specify" in blue, "JS" in black/white

## [0.0.7] - 2026-04-26

### Added
- Bundle all components into core package for npm distribution
- npm publish via trusted publisher (OIDC provenance)
- Strict TypeScript for all components

### Changed
- Unified CI/CD into single "Full CI/CD Pipeline" workflow

### Fixed
- Remove npm upgrade step that breaks runner's npm installation
- Publish stage depends on e2e, not pdv (tags skip site deploy)

## [0.0.6] - 2026-04-26

### Changed
- Unified CI/CD into single "Full CI/CD Pipeline" workflow

## [0.0.5] - 2026-04-26

### Added
- Component ID registry with `data-cid` attributes for all components

### Fixed
- E2E tests — scope docs h1 locators to dialog/article, fix nav test
- PDV strict mode — use scoped locators for all docs tests

### Removed
- FOSSA license scanning removed

## [0.0.4] - 2026-04-26

### Added
- Docs search, nav link, and Playwright E2E tests

### Fixed
- Eliminate all recursion and bound all unbounded queues
- CSP blocks FOSSA badge images and external resources
- Docs sidebar crash — SidebarItem expected DocTreeNode with type discriminator

### Removed
- FOSSA badges from README and site footer

## [0.0.3] - 2026-04-26

### Added
- Comprehensive documentation system with docs viewer
- Security coverage tests

### Fixed
- Coverage threshold adjusted for security test additions

## [0.0.2] - 2026-04-26

### Added
- 20 security regression tests for SAST findings
- Playwright third-party notices to ThirdPartyNotices.txt

### Fixed
- All SAST findings resolved (Critical through Low severity)
- Feature flags page dark mode readability

### Changed
- Rename NOTICE to ThirdPartyNotices.txt, remove Go references

## [0.0.1] - 2026-04-25

### Added
- Rename project from LiquidJS to SpecifyJS
- New SpecifyJS logo — favicon, SVG, nav bar, PNG variants
- Complete internal rename of all Liquid types and symbols
- CDN content verification before running PDV tests
- Build stamp to force unique JS hash for CDN cache busting

### Changed
- Package name changed to `specifyjs-framework`
- Remove Go language from CodeQL analysis

### Fixed
- Regenerate bun.lock with new package name
- Force cache-busting deploy for SpecifyJS rename
- CDN propagation wait times increased for reliable verification

## [Pre-release] - 2026-04-25

Initial development under the LiquidJS name before the rename to SpecifyJS.

### Added

#### Core Framework
- Virtual DOM with efficient tree diffing algorithm
- Fiber architecture and reconciler with keyed diffing
- DOM renderer, hooks system, and full rendering pipeline
- Synthetic event system with cross-browser normalization
- Component model with lifecycle, memo bail-out, context, and error boundaries
- Concurrent rendering with lane-based scheduling
- StrictMode double-render detection
- SVG namespace support
- Web Components interop
- DevTools integration via `notifyDevToolsOfCommit`
- `createFactory` legacy API

#### Hooks
- Complete hooks system: `useState`, `useEffect`, `useContext`, `useReducer`,
  `useCallback`, `useMemo`, `useRef`, `useImperativeHandle`, `useLayoutEffect`,
  `useDebugValue`, `useId`, `useDeferredValue`, `useTransition`,
  `useSyncExternalStore`, `useInsertionEffect`

#### Rendering APIs
- `createRoot` / `hydrateRoot` (concurrent API)
- Legacy `render` / `hydrate` / `unmountComponentAtNode`
- `createPortal` for rendering into external DOM nodes
- `flushSync` for synchronous rendering bypass

#### Build-time Pre-rendering
- `renderToString` with hydration support
- `renderToStaticMarkup` for static HTML
- `renderToPipeableStream` with progressive chunked output
- `renderToReadableStream` with Web Streams output
- `hydrateRoot` reuses existing server-rendered DOM nodes

#### Client Libraries
- REST client with interceptors, timeout, abort, and `useRest` hook
- GraphQL client with `gql` template tag, caching, and `useQuery`/`useMutation` hooks
- Protobuf/gRPC-Web client with encode/decode, `defineMessage`, and `useProto` hook

#### Telemetry
- Metrics: counter, histogram, gauge with OTLP export
- Tracing: distributed tracing with span management, `useTracing` hook

#### Component Library
- 80+ UI components across 8 families (layout, nav, form, overlay, data, feedback, media, viz)
- Visualization components — graph, line, bar, pie, wrapper
- 26 new visualization components added to gallery
- Cartesian, Complex, and Polar graph components
- Rich text editor and ColorWheel component

#### Showcase Site
- 7-screen SPA at specifyjs.asymmetric-effort.com
- Hash-based router: Router, Route, Link, useRouter, useParams, useNavigate
- `useHead` hook for declarative meta tags
- Component gallery with accordion and categorized sections
- Clickable feature cards with detailed article dialogs
- Getting Started dialog with code examples
- Dialog overlay UX for all non-home screens
- Copyright banners on build output and favicon
- Post-deployment Playwright verification

#### Security
- `secureFetch` wrapper enforcing HTTPS-only network requests
- CSP and Referrer-Policy headers via `useHead` httpEquiv
- ReDoS fix in router matchPath
- Integer overflow fix in protobuf API
- SHA-pinned all GitHub Actions to verified commit hashes
- CodeQL and Dependabot configured for automated scanning

#### Build & Tooling
- Zero runtime dependencies
- Rollup build with Terser minification (4KB gzipped core)
- Type declarations for all sub-packages
- ESM and CJS output formats with source maps
- Migrate from npm to bun across entire project
- GitHub Actions CI workflow with multi-browser E2E
- Bundle size gating (< 15KB gzipped)
- Coverage thresholds (97.9% lines, 98% functions)
- Pre-commit and pre-push git hooks
- Feature flag system with demo page
- SEO meta tags on all showcase screens
- Dark mode toggle gated by feature flag
- FOSSA license scanning and SPDX headers

#### Documentation
- Comprehensive documentation tree
- API reference for all modules
- Architecture docs (fiber, reconciler, hooks, events)
- Getting started guide and migration guide
- Component library documentation

### Fixed
- Resolve vitest hang with `--pool forks --no-file-parallelism`
- Repair all component tests (layout, nav)
- Fix aria attribute types
- Resolve TypeScript strict mode errors and CI failures
- Resolve Route hooks violation
- S&P 500 bar chart renders with proper bar heights
- E2E test selectors for dialog architecture and matchPath root exact bug
- Security — ReDoS in matchPath and integer overflow in protobuf API
- Feature flag gating, dark mode, flag cleanup
- Gallery bugs and feature-flag coverage
- Eliminate all recursion and bound all unbounded queues

### Changed
- Migrate from npm to bun across entire project
- Reposition server module as build-time pre-rendering only (not runtime SSR)
- Remove Go tooling, rewrite API servers in TypeScript
- Test coverage raised from 61% to 97.91%

[0.2.5]: https://github.com/asymmetric-effort/specifyjs/compare/v0.2.4...v0.2.5
[0.2.4]: https://github.com/asymmetric-effort/specifyjs/compare/v0.2.3...v0.2.4
[0.2.3]: https://github.com/asymmetric-effort/specifyjs/compare/v0.2.2...v0.2.3
[0.2.2]: https://github.com/asymmetric-effort/specifyjs/compare/v0.2.1...v0.2.2
[0.2.1]: https://github.com/asymmetric-effort/specifyjs/compare/v0.2.0...v0.2.1
[0.2.0]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.10...v0.2.0
[0.1.10]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.9...v0.1.10
[0.1.9]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.8...v0.1.9
[0.1.8]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.7...v0.1.8
[0.1.7]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.6...v0.1.7
[0.1.6]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.5...v0.1.6
[0.1.5]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.4...v0.1.5
[0.1.4]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.7...v0.1.4
[0.1.3]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/asymmetric-effort/specifyjs/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.12...v0.1.0
[0.0.12]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.11...v0.0.12
[0.0.11]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.10...v0.0.11
[0.0.10]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.9...v0.0.10
[0.0.9]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.8...v0.0.9
[0.0.8]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.7...v0.0.8
[0.0.7]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.6...v0.0.7
[0.0.6]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.5...v0.0.6
[0.0.5]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.4...v0.0.5
[0.0.4]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.3...v0.0.4
[0.0.3]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.2...v0.0.3
[0.0.2]: https://github.com/asymmetric-effort/specifyjs/compare/v0.0.1...v0.0.2
[0.0.1]: https://github.com/asymmetric-effort/specifyjs/releases/tag/v0.0.1
