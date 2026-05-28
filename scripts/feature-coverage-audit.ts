#!/usr/bin/env bun
// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Feature Coverage Audit
 *
 * Programmatically identifies features by parsing the TypeScript AST for
 * all exported Props and API interfaces in the component library, then
 * cross-references against @feature annotations in E2E and PDV test files
 * to report which features have happy-path and sad-path test coverage.
 *
 * Usage:
 *   bun run scripts/feature-coverage-audit.ts            # warn mode (exit 0)
 *   bun run scripts/feature-coverage-audit.ts --enforce   # enforce mode (exit 1 on gaps)
 *   bun run scripts/feature-coverage-audit.ts --json      # output JSON manifest only
 */

import * as ts from '../core/node_modules/typescript';
import * as fs from 'fs';
import * as path from 'path';

// ── Configuration ─────────────────────────────────────────────────────

const ROOT = path.resolve(import.meta.dir, '..');
const COMPONENTS_DIR = path.join(ROOT, 'components');
const INTERFACE_SUFFIXES = ['Props', 'API'];

const TEST_DIRS = [
  path.join(ROOT, 'site', 'e2e'),
  path.join(ROOT, 'core', 'tests', 'e2e'),
  path.join(ROOT, 'demos'),
];

// ── Types ─────────────────────────────────────────────────────────────

interface Feature {
  /** e.g. "ForceGraph3DProps" */
  interface: string;
  /** e.g. "onNodeClick" */
  property: string;
  /** Whether the property is optional (has ?) */
  optional: boolean;
  /** Source file path relative to repo root */
  file: string;
  /** Fully qualified feature ID: InterfaceName.propertyName */
  id: string;
}

interface TestAnnotation {
  /** Feature ID from @feature tag: InterfaceName.propertyName */
  featureId: string;
  /** Whether this is a sad-path test */
  sad: boolean;
  /** Test file path relative to repo root */
  file: string;
  /** The test name or description */
  testName: string;
  /** Whether this is a PDV test (file contains 'pdv') */
  isPdv: boolean;
}

interface CoverageEntry {
  feature: Feature;
  e2eHappy: TestAnnotation[];
  e2eSad: TestAnnotation[];
  pdvHappy: TestAnnotation[];
  pdvSad: TestAnnotation[];
}

// ── Phase 1: Extract features from TypeScript AST ─────────────────────

function findSourceFiles(dir: string): string[] {
  const results: string[] = [];
  const stack = [dir];
  while (stack.length > 0) {
    const current = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(current, { withFileTypes: true });
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'tests') continue;
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.ts') && !entry.name.endsWith('.test.ts') && !entry.name.endsWith('.spec.ts')) {
        results.push(full);
      }
    }
  }
  return results;
}

function extractFeatures(sourceFiles: string[]): Feature[] {
  const features: Feature[] = [];
  const program = ts.createProgram(sourceFiles, {
    target: ts.ScriptTarget.ESNext,
    module: ts.ModuleKind.ESNext,
    moduleResolution: ts.ModuleResolutionKind.Bundler,
    strict: true,
    skipLibCheck: true,
    noEmit: true,
  });

  for (const sourceFile of program.getSourceFiles()) {
    const filePath = sourceFile.fileName;
    // Only process files under components/
    if (!filePath.includes('/components/')) continue;
    // Skip declaration files
    if (filePath.endsWith('.d.ts')) continue;

    const relPath = path.relative(ROOT, filePath);

    ts.forEachChild(sourceFile, function visit(node) {
      if (!ts.isInterfaceDeclaration(node)) return;

      // Check if exported
      const isExported = node.modifiers?.some(m => m.kind === ts.SyntaxKind.ExportKeyword) ?? false;
      if (!isExported) return;

      const interfaceName = node.name.text;

      // Check if name ends with Props or API
      const matchesSuffix = INTERFACE_SUFFIXES.some(s => interfaceName.endsWith(s));
      if (!matchesSuffix) return;

      // Extract direct property members
      for (const member of node.members) {
        if (!ts.isPropertySignature(member)) continue;
        if (!member.name || !ts.isIdentifier(member.name)) continue;

        const propName = member.name.text;
        const optional = member.questionToken !== undefined;

        features.push({
          interface: interfaceName,
          property: propName,
          optional,
          file: relPath,
          id: `${interfaceName}.${propName}`,
        });
      }
    });
  }

  // Sort by interface name, then property name
  features.sort((a, b) => a.id.localeCompare(b.id));
  return features;
}

// ── Phase 2: Scan test files for @feature annotations ─────────────────

function findTestFiles(dirs: string[]): string[] {
  const results: string[] = [];
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const stack = [dir];
    while (stack.length > 0) {
      const current = stack.pop()!;
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(current, { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) {
        const full = path.join(current, entry.name);
        if (entry.isDirectory()) {
          if (entry.name === 'node_modules') continue;
          stack.push(full);
        } else if (entry.isFile() && entry.name.endsWith('.spec.ts')) {
          results.push(full);
        }
      }
    }
  }
  return results;
}

function extractAnnotations(testFiles: string[]): TestAnnotation[] {
  const annotations: TestAnnotation[] = [];

  // Pattern: /** @feature InterfaceName.propName */ or /** @feature InterfaceName.propName @sad */
  // Can also appear as // @feature ... on the line before a test()
  const featurePattern = /@feature\s+([\w.]+)(?:\s+@sad)?/g;
  const sadPattern = /@sad/;

  for (const file of testFiles) {
    const content = fs.readFileSync(file, 'utf-8');
    const relPath = path.relative(ROOT, file);
    const isPdv = relPath.toLowerCase().includes('pdv');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]!;
      featurePattern.lastIndex = 0;
      const match = featurePattern.exec(line);
      if (!match) continue;

      const featureId = match[1]!;
      const sad = sadPattern.test(line);

      // Try to find the associated test name on the next few lines
      let testName = '';
      for (let j = i; j < Math.min(i + 3, lines.length); j++) {
        const testMatch = lines[j]!.match(/test\(\s*['"`]([^'"`]+)['"`]/);
        if (testMatch) {
          testName = testMatch[1]!;
          break;
        }
      }

      annotations.push({
        featureId,
        sad,
        file: relPath,
        testName,
        isPdv,
      });
    }
  }

  return annotations;
}

// ── Phase 3: Cross-reference and report ───────────────────────────────

function buildCoverageMap(features: Feature[], annotations: TestAnnotation[]): Map<string, CoverageEntry> {
  const map = new Map<string, CoverageEntry>();

  for (const feature of features) {
    map.set(feature.id, {
      feature,
      e2eHappy: [],
      e2eSad: [],
      pdvHappy: [],
      pdvSad: [],
    });
  }

  for (const annotation of annotations) {
    const entry = map.get(annotation.featureId);
    if (!entry) continue; // annotation references unknown feature

    if (annotation.isPdv) {
      if (annotation.sad) {
        entry.pdvSad.push(annotation);
      } else {
        entry.pdvHappy.push(annotation);
      }
    } else {
      if (annotation.sad) {
        entry.e2eSad.push(annotation);
      } else {
        entry.e2eHappy.push(annotation);
      }
    }
  }

  return map;
}

function printReport(coverageMap: Map<string, CoverageEntry>): { covered: number; missing: number; missingSad: number; total: number } {
  let covered = 0;
  let missing = 0;
  let missingSad = 0;
  const total = coverageMap.size;

  // Group by interface
  const byInterface = new Map<string, CoverageEntry[]>();
  for (const entry of coverageMap.values()) {
    const key = entry.feature.interface;
    if (!byInterface.has(key)) byInterface.set(key, []);
    byInterface.get(key)!.push(entry);
  }

  console.log('Feature Coverage Audit');
  console.log('======================\n');

  for (const [interfaceName, entries] of byInterface) {
    const file = entries[0]!.feature.file;
    console.log(`${interfaceName} (${file})`);

    for (const entry of entries) {
      const hasAnyHappy = entry.e2eHappy.length > 0 || entry.pdvHappy.length > 0;
      const hasAnySad = entry.e2eSad.length > 0 || entry.pdvSad.length > 0;

      const tags: string[] = [];
      if (entry.e2eHappy.length > 0) tags.push('e2e:happy');
      if (entry.e2eSad.length > 0) tags.push('e2e:sad');
      if (entry.pdvHappy.length > 0) tags.push('pdv:happy');
      if (entry.pdvSad.length > 0) tags.push('pdv:sad');

      const opt = entry.feature.optional ? '?' : '';
      const prop = `${entry.feature.property}${opt}`;

      if (hasAnyHappy && hasAnySad) {
        console.log(`  \u2713 ${prop.padEnd(30)} ${tags.join(' ')}`);
        covered++;
      } else if (hasAnyHappy) {
        console.log(`  \u26a0 ${prop.padEnd(30)} ${tags.join(' ')} (no sad path)`);
        covered++;
        missingSad++;
      } else {
        console.log(`  \u2717 ${prop.padEnd(30)} MISSING`);
        missing++;
        missingSad++;
      }
    }
    console.log('');
  }

  console.log('Summary');
  console.log('-------');
  console.log(`Total features:       ${total}`);
  console.log(`Covered (happy):      ${covered}`);
  console.log(`Missing coverage:     ${missing}`);
  console.log(`Missing sad path:     ${missingSad}`);
  console.log(`Coverage:             ${total > 0 ? ((covered / total) * 100).toFixed(1) : '0'}%`);

  return { covered, missing, missingSad, total };
}

// ── Main ──────────────────────────────────────────────────────────────

const args = process.argv.slice(2);
const enforce = args.includes('--enforce');
const jsonOnly = args.includes('--json');

// Phase 1: Extract features
const sourceFiles = findSourceFiles(COMPONENTS_DIR);
const features = extractFeatures(sourceFiles);

if (jsonOnly) {
  console.log(JSON.stringify(features, null, 2));
  process.exit(0);
}

console.log(`Discovered ${features.length} features across ${new Set(features.map(f => f.interface)).size} interfaces\n`);

// Phase 2: Scan test annotations
const testFiles = findTestFiles(TEST_DIRS);
const annotations = extractAnnotations(testFiles);
console.log(`Found ${annotations.length} @feature annotations across ${testFiles.length} test files\n`);

// Phase 3: Cross-reference and report
const coverageMap = buildCoverageMap(features, annotations);
const { missing } = printReport(coverageMap);

if (enforce && missing > 0) {
  console.log(`\nERROR: ${missing} features have no test coverage. Use @feature annotations in E2E/PDV tests.`);
  process.exit(1);
}

if (missing > 0) {
  console.log(`\nWARNING: ${missing} features have no test coverage. Add @feature annotations to E2E/PDV tests.`);
  console.log('Run with --enforce to fail the build on coverage gaps.');
}
