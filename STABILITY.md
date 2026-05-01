# SpecifyJS API Stability Policy

SpecifyJS is committed to providing a stable, predictable API for its users. This document describes the versioning scheme, public API surface, and deprecation process.

## Semantic Versioning

SpecifyJS follows [Semantic Versioning 2.0.0](https://semver.org/):

| Version Component | When to Bump | Examples |
|---|---|---|
| **Major (X.0.0)** | Breaking API changes | Removing an export, changing a function signature, removing or renaming a component prop |
| **Minor (0.X.0)** | New backwards-compatible features | Adding a new component, adding a new hook, adding a new prop to an existing component |
| **Patch (0.0.X)** | Bug fixes and non-functional changes | Fixing a rendering bug, improving performance, updating documentation |

## Public API Surface

The public API consists of everything exported from the following entry points:

- `core/src/index.ts` -- Core framework exports (createElement, Component, etc.)
- `core/src/dom/index.ts` -- DOM renderer, event system, createRoot, hydrateRoot
- `core/src/hooks/index.ts` -- All hook implementations (useState, useEffect, etc.)
- `core/src/server/index.ts` -- Static pre-rendering APIs (build-time only)
- `core/src/build/index.ts` -- Build utilities

### What is public API

- All named exports from the entry points listed above
- Component props interfaces (the shape of props accepted by built-in components)
- Hook function signatures and return types
- Type definitions shipped in the published package

### What is NOT public API

- Internal modules under `shared/` and `core/` subdirectories (these are implementation details)
- Unexported functions, classes, and types
- The internal structure of the virtual DOM tree
- DevTools integration hooks (these may change to match tooling updates)

Internal APIs may change in any release without notice.

## Deprecation Process

All breaking changes to the public API must follow this deprecation process:

1. **Version N (minor release):** The old API is marked as deprecated. A development-time warning is emitted using the `deprecate()` utility from `shared/warnings.ts`. The warning message identifies the deprecated API, its replacement, and the version in which it will be removed.

2. **Documentation update:** The deprecation is documented in the changelog and in the API documentation. The replacement API is clearly described with migration examples.

3. **Version N+1 (major release) or later:** The deprecated API is removed. This is a breaking change and is reflected in the major version bump.

### Example

```typescript
import { deprecate } from './shared/warnings';

// In version 0.2.0: deprecate the old API
export function oldFunction(args: OldArgs): Result {
  deprecate('oldFunction', 'newFunction', '1.0.0');
  return newFunction(convertArgs(args));
}

// The replacement API
export function newFunction(args: NewArgs): Result {
  // ...implementation
}
```

### Deprecation warning behavior

- Warnings are emitted only once per unique message (deduplicated)
- Warnings are suppressed in production builds
- Warnings appear in the browser console prefixed with `[SpecifyJS]`

## Stability Tiers

### Tier 1: Stable

Most public APIs fall into this tier. These APIs will not change without following the full deprecation process described above.

### Tier 2: Experimental

APIs marked with `@experimental` in their JSDoc comments are not yet stable. They may change in minor releases without a deprecation period. Experimental APIs are opt-in and clearly documented as such.

### Tier 3: Internal

Anything not exported from a public entry point. No stability guarantees.

## Component Props

Component props interfaces are part of the public API (Tier 1). The following changes are considered breaking:

- Removing a prop
- Renaming a prop
- Changing a prop's type to be incompatible (e.g., `string` to `number`)
- Making an optional prop required

The following changes are non-breaking:

- Adding a new optional prop
- Widening a prop's type (e.g., `string` to `string | number`)
- Making a required prop optional

## Reporting Issues

If you encounter a breaking change that was not preceded by a deprecation period, please file an issue on the GitHub repository. Unintended breaking changes will be addressed in a patch release.
