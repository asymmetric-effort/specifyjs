#!/usr/bin/env node
// Check for circular imports in the SpecifyJS source tree.
// Uses nogginlessdom's detectCircularImports if available,
// falls back to a simple regex-based detector.
//
// Usage: node scripts/check-circular-imports.mjs [--enforce]
// Exit code 0: no cycles found (or warn mode without --enforce)
// Exit code 1: cycles found in enforce mode

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, relative, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const enforce = process.argv.includes('--enforce');

// Directories to scan
const SCAN_DIRS = [
  join(ROOT, 'core', 'src'),
  join(ROOT, 'components'),
  join(ROOT, 'demos'),
];

// Collect all TypeScript files
function collectFiles(dir) {
  const files = [];
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return files;
  }
  for (const entry of entries) {
    if (entry === 'node_modules' || entry === 'dist' || entry === 'build') continue;
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      files.push(...collectFiles(full));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts') && !entry.endsWith('.spec.ts')) {
      files.push(full);
    }
  }
  return files;
}

// Parse imports from a TypeScript file
function parseImports(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const imports = [];
  const importRegex = /(?:import|export)\s+(?:.*?\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const spec = match[1];
    // Only resolve relative imports
    if (spec.startsWith('.')) {
      const dir = dirname(filePath);
      let resolved = resolve(dir, spec);
      // Try adding extensions
      for (const ext of ['', '.ts', '.tsx', '/index.ts', '/index.tsx']) {
        const candidate = resolved + ext;
        try {
          statSync(candidate);
          resolved = candidate;
          break;
        } catch { /* continue */ }
      }
      imports.push(resolved);
    }
  }
  return imports;
}

// Build import graph
const allFiles = [];
for (const dir of SCAN_DIRS) {
  allFiles.push(...collectFiles(dir));
}

const graph = new Map();
for (const file of allFiles) {
  graph.set(file, parseImports(file));
}

// Detect cycles using DFS
function detectCycles(graph) {
  const cycles = [];
  const visited = new Set();
  const inStack = new Set();
  const stack = [];

  function dfs(node) {
    if (inStack.has(node)) {
      // Found a cycle
      const cycleStart = stack.indexOf(node);
      const cycle = stack.slice(cycleStart).map(f => relative(ROOT, f));
      cycles.push(cycle);
      return;
    }
    if (visited.has(node)) return;

    visited.add(node);
    inStack.add(node);
    stack.push(node);

    const deps = graph.get(node) || [];
    for (const dep of deps) {
      if (graph.has(dep)) {
        dfs(dep);
      }
    }

    stack.pop();
    inStack.delete(node);
  }

  for (const node of graph.keys()) {
    dfs(node);
  }

  return cycles;
}

const cycles = detectCycles(graph);

// Report
console.log('Circular Import Detection');
console.log('=========================');
console.log(`Scanned ${allFiles.length} TypeScript files`);
console.log();

if (cycles.length === 0) {
  console.log('✓ No circular imports detected');
  process.exit(0);
} else {
  // Deduplicate cycles (same cycle can be found from different entry points)
  const uniqueCycles = [];
  const seen = new Set();
  for (const cycle of cycles) {
    const key = [...cycle].sort().join(' -> ');
    if (!seen.has(key)) {
      seen.add(key);
      uniqueCycles.push(cycle);
    }
  }

  console.log(`✗ Found ${uniqueCycles.length} circular import chain(s):`);
  console.log();
  for (let i = 0; i < uniqueCycles.length; i++) {
    const cycle = uniqueCycles[i];
    console.log(`  Cycle ${i + 1}:`);
    for (const file of cycle) {
      console.log(`    → ${file}`);
    }
    console.log(`    → ${cycle[0]} (back to start)`);
    console.log();
  }

  if (enforce) {
    console.log('FAIL: Circular imports detected (--enforce mode)');
    process.exit(1);
  } else {
    console.log('WARN: Circular imports detected (warn mode — pass --enforce to fail)');
    process.exit(0);
  }
}
