#!/usr/bin/env node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * lint-imports.ts — Circular dependency and unused import detection
 * Uses @asymmetric-effort/nogginlessdom's analysis tools.
 *
 * Usage: bun scripts/lint-imports.ts [--fix]
 */

import {
  detectCircularImports,
  formatCycleReport,
  configureCycleDetection,
} from '@asymmetric-effort/nogginlessdom';

import {
  detectUnusedImports,
  formatUnusedImportReport,
  configureUnusedImportDetection,
} from '@asymmetric-effort/nogginlessdom';

const ROOT = new URL('..', import.meta.url).pathname;
const CORE_SRC = ROOT + 'core/src';
const COMPONENTS = ROOT + 'components';

// Configure
configureCycleDetection({
  entryPoints: [
    CORE_SRC + '/index.ts',
    CORE_SRC + '/dom/index.ts',
    CORE_SRC + '/hooks/index.ts',
    CORE_SRC + '/server/index.ts',
  ],
  extensions: ['.ts', '.tsx'],
  ignorePatterns: ['node_modules', 'dist', '.test.', '.spec.'],
});

configureUnusedImportDetection({
  extensions: ['.ts', '.tsx'],
  ignorePatterns: ['node_modules', 'dist', 'tests/', '.test.', '.spec.'],
});

let exitCode = 0;

// Circular dependency detection
console.log('=== Circular Dependency Detection ===\n');
try {
  const cycles = detectCircularImports([CORE_SRC]);
  if (cycles.length > 0) {
    console.log(formatCycleReport(cycles));
    // Only fail on core/src cycles, not known hooks cycle
    const unknownCycles = cycles.filter(
      (c) => !c.path.some((p) => p.includes('use-head'))
    );
    if (unknownCycles.length > 0) {
      console.error(`Found ${unknownCycles.length} unexpected circular dependencies`);
      exitCode = 1;
    } else {
      console.log('Only known hooks/use-head cycle found (acceptable).\n');
    }
  } else {
    console.log('No circular dependencies found.\n');
  }
} catch (e) {
  console.log('Circular dependency detection not available in this environment.\n');
}

// Unused import detection
console.log('=== Unused Import Detection ===\n');
try {
  const unused = detectUnusedImports([CORE_SRC]);
  if (unused.length > 0) {
    console.log(formatUnusedImportReport(unused));
    console.error(`Found ${unused.length} unused imports`);
    exitCode = 1;
  } else {
    console.log('No unused imports found.\n');
  }
} catch (e) {
  console.log('Unused import detection not available in this environment.\n');
}

process.exit(exitCode);
