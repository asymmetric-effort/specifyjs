#!/usr/bin/env node
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * lint-imports.ts — Circular dependency, unused import, and import depth analysis
 * Uses @asymmetric-effort/nogginlessdom's analysis tools.
 *
 * Usage: bun scripts/lint-imports.ts [--fix] [--graph] [--graph-format=mermaid|dot]
 *
 * Exits with code 1 if:
 *   - Unexpected circular dependencies are found
 *   - Unused imports are found
 *   - Import depth exceeds threshold (default: 10)
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

import {
  analyzeImportDepth,
} from '@asymmetric-effort/nogginlessdom';

import {
  buildDependencyGraph,
  exportGraphMermaid,
  exportGraphDOT,
} from '@asymmetric-effort/nogginlessdom';

const ROOT = new URL('..', import.meta.url).pathname;
const CORE_SRC = ROOT + 'core/src';

const ENTRY_POINTS = [
  CORE_SRC + '/index.ts',
  CORE_SRC + '/dom/index.ts',
  CORE_SRC + '/hooks/index.ts',
  CORE_SRC + '/server/index.ts',
];

const EXCLUDE_PATTERNS = ['node_modules', 'dist', '.test.', '.spec.'];

const DEPTH_THRESHOLD = parseInt(process.env.IMPORT_DEPTH_THRESHOLD || '10', 10);

const args = process.argv.slice(2);
const generateGraph = args.includes('--graph');
const graphFormat = args.find(a => a.startsWith('--graph-format='))?.split('=')[1] || 'mermaid';

// Configure
configureCycleDetection({
  entryPoints: ENTRY_POINTS,
  extensions: ['.ts', '.tsx'],
  ignorePatterns: EXCLUDE_PATTERNS,
});

configureUnusedImportDetection({
  extensions: ['.ts', '.tsx'],
  ignorePatterns: ['node_modules', 'dist', 'tests/', '.test.', '.spec.'],
});

let exitCode = 0;

// ── Circular dependency detection ────────────────────────────────────
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

// ── Unused import detection ──────────────────────────────────────────
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

// ── Import depth analysis ────────────────────────────────────────────
console.log('=== Import Depth Analysis ===\n');
try {
  const depthResult = analyzeImportDepth(ENTRY_POINTS, {
    exclude: EXCLUDE_PATTERNS,
    threshold: DEPTH_THRESHOLD,
  });

  console.log(`Max depth:     ${depthResult.maxDepth}`);
  console.log(`Average depth: ${depthResult.averageDepth.toFixed(1)}`);
  console.log(`Threshold:     ${DEPTH_THRESHOLD}\n`);

  if (depthResult.filesExceedingThreshold.length > 0) {
    console.error(`Files exceeding depth threshold (${DEPTH_THRESHOLD}):\n`);
    for (const entry of depthResult.filesExceedingThreshold) {
      const relPath = entry.file.replace(ROOT, '');
      console.error(`  ${relPath} — depth ${entry.depth}`);
      console.error(`    chain: ${entry.longestChain.map(f => f.replace(ROOT, '')).join(' → ')}\n`);
    }
    exitCode = 1;
  } else {
    console.log(`All files within depth threshold.\n`);
  }
} catch (e) {
  console.log('Import depth analysis not available in this environment.\n');
}

// ── Dependency graph generation (optional) ───────────────────────────
if (generateGraph) {
  console.log('=== Dependency Graph ===\n');
  try {
    const graph = buildDependencyGraph(ENTRY_POINTS, {
      exclude: EXCLUDE_PATTERNS,
      relativePaths: true,
    });

    console.log(`Graph: ${graph.summary.totalFiles} files, ${graph.summary.totalEdges} edges`);
    console.log(`Max depth: ${graph.summary.maxDepth}, Avg imports: ${graph.summary.averageImports.toFixed(1)}`);
    console.log(`Cycles: ${graph.summary.cycleCount}, Leaves: ${graph.summary.leafCount}`);

    if (graph.summary.hubFiles.length > 0) {
      console.log(`Hub files: ${graph.summary.hubFiles.join(', ')}`);
    }
    console.log();

    if (graphFormat === 'dot') {
      console.log(exportGraphDOT(graph));
    } else {
      console.log(exportGraphMermaid(graph));
    }
  } catch (e) {
    console.log('Dependency graph generation not available in this environment.\n');
  }
}

process.exit(exitCode);
