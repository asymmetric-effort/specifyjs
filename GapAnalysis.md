# Gap Analysis: SpecifyJS — Delivered Work vs Issue Specifications

**Date**: 2026-11-27
**Repository**: asymmetric-effort/specifyjs
**Version**: v1.4.1
**Total Issues Reviewed**: 95 (94 closed, 1 open)

## Executive Summary

7 gaps identified (0 P0, 1 P1, 3 P2, 3 P3). Estimated total effort: 2-4 engineering-days. The project has delivered on 98% of its issue specifications. All major features (Unity Desktop, Wumpus World, responsive hooks, viz theme system, NavWrapper responsive, class setState fix, .d.ts extension fix, security sanitization) are implemented and verified.

The single open issue (#136 — replace esbuild with steamroller) is a planned migration, not a gap in delivered work. The identified gaps are minor: 2 unmigrated viz components, missing Playwright tests for some features, and documentation completeness.

## Feature Inventory

### Closed Issues — Delivered Features

| Category | Issues | Status |
|----------|--------|--------|
| Viz Theme System | #173-#184 (12 issues) | 95% — 35/37 components migrated |
| Unity Desktop | #36-#41, #84-#87, #114-#116 (12 issues) | 100% |
| 3D/Space Components | #42-#48, #52, #64, #71-#76, #80-#81 (16 issues) | 100% |
| Responsive Design | #51, #171, responsive hooks | 100% |
| Test Infrastructure | #49, #61-#63, #65, #68-#69, #88-#99 (18 issues) | 100% |
| Bug Fixes | #35, #58, #60, #80-#81, #129, #170 (6 issues) | 100% |
| TypeScript 6 Upgrade | #130-#135 (6 issues) | 100% |
| Build System | #50, #61, #170 | 100% |
| Documentation | #184, guides, component docs | 95% |

### Open Issues

| # | Title | Labels | Status |
|---|-------|--------|--------|
| #136 | Replace esbuild with @asymmetric-effort/steamroller | automated-development | Planned, not started |

## Gap Details

### P0 — Critical

None.

### P1 — High

| # | Gap | Category | Specified | Delivered | Effort | Risk |
|---|-----|----------|-----------|-----------|--------|------|
| 1 | 2D-polar-graph not migrated to VizTheme | Partial Implementation | #180 specified migration of all specialized components including PolarGraph | `components/viz/2D-polar-graph/src/PolarGraph2D.ts` exists but does not import `useVizTheme` | XS | None |

### P2 — Medium

| # | Gap | Category | Specified | Delivered | Effort | Risk |
|---|-----|----------|-----------|-----------|--------|------|
| 2 | 2D-cartesian-raw not migrated to VizTheme | Partial Implementation | #180 specified migration of CartesianRaw | `components/viz/2D-cartesian-raw/src/CartesianGraph2D.ts` exists but does not import `useVizTheme` | XS | None — intentionally "raw" but should still support themes |
| 3 | Wumpus World integration tests skipped | Test Coverage Gap | Test file exists at `site/tests/wumpus-integration.test.ts` but begins with `process.exit(0)` skip | Tests were skipped pending NogginLessDom createElementNS support; skip is still active | S | Low — E2E/PDV tests cover the behavior |
| 4 | UnityApp DOM tests skipped | Test Coverage Gap | Tests exist in `components/page/unity-desktop/tests/unity-desktop.test.ts` but UnityApp describe blocks use `describe.skip` | Skipped because self-registration requires multiple reconciler passes that don't complete in vitest's microtask model | S | Low — E2E/PDV tests validate the behavior |

### P3 — Low

| # | Gap | Category | Specified | Delivered | Effort | Risk |
|---|-----|----------|-----------|-----------|--------|------|
| 5 | PDV flaky drag z-index test | Test Coverage Gap | `project-manager-pdv.spec.ts` drag z-index test passes intermittently | Polling retry added but still occasionally flaky on production PDV | S | Low — not a code bug, timing sensitivity |
| 6 | Gallery source links PDV fails on GitHub 503 | Test Coverage Gap | `gallery-source-links.spec.ts` checks README.md links on GitHub | Fails when GitHub returns 503 rate limit errors; no retry logic | XS | None — GitHub infrastructure issue |
| 7 | esbuild → steamroller migration (#136) | Missing Feature | Issue filed, labeled automated-development | Not started — awaiting steamroller maturity | L | Medium — build toolchain change |

## Effort Summary

| Priority | Count | Effort Range |
|----------|-------|-------------|
| P0 — Critical | 0 | — |
| P1 — High | 1 | < 1 hour |
| P2 — Medium | 3 | 1-2 days |
| P3 — Low | 3 | 1-2 days |
| **Total** | **7** | **2-4 days** |

## Recommended Priority Order

1. **PolarGraph VizTheme migration** (P1, XS) — Add `useVizTheme()` import and replace hardcoded font-family. 10-minute fix.
2. **CartesianRaw VizTheme migration** (P2, XS) — Same pattern. Even if "raw", consumers expect consistent theme behavior.
3. **Re-enable Wumpus integration tests** (P2, S) — NogginLessDom may have added createElementNS since the skip was added. Check and re-enable if supported.
4. **Re-enable UnityApp DOM tests** (P2, S) — Investigate if the reconciler pass issue is resolved with current framework version.
5. **PDV drag test robustness** (P3, S) — Add more aggressive retry or move to E2E-only (not PDV).
6. **Gallery source links retry** (P3, XS) — Add HTTP retry with backoff for GitHub API calls in the test.
7. **esbuild → steamroller** (P3, L) — Deferred until steamroller is production-ready.

## Risk Assessment

| Risk | Affected Gaps | Mitigation |
|------|--------------|------------|
| NogginLessDom may not yet support createElementNS | #3 | Check latest version; if not supported, keep skip |
| Steamroller may not be ready for production build | #7 | Keep esbuild as fallback; migrate incrementally |
| PDV timing sensitivity varies by CI runner load | #5 | Increase retry count or move to E2E-only validation |
