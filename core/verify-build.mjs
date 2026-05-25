// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Post-build verification: scan all ESM entry bundles and verify every
 * import specifier resolves to an existing file. Catches broken chunk
 * paths before publish.
 *
 * Exit 0 = all imports resolve. Exit 1 = broken imports found.
 *
 * See: https://github.com/asymmetric-effort/specifyjs/issues/60
 *      https://github.com/asymmetric-effort/specifyjs/issues/61
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname, resolve } from 'path';

const DIST = 'dist';

function findEsmFiles(dir) {
  const results = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findEsmFiles(fullPath));
    } else if (entry.name.endsWith('.esm.js') || (entry.name.endsWith('.js') && dir.includes('chunks'))) {
      results.push(fullPath);
    }
  }
  return results;
}

function extractImportSpecifiers(content) {
  const specifiers = [];
  // Match both: from"./path" and import"./path" (with or without space)
  const regex = /(?:from|import)\s*["']([^"']+)["']/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    const specifier = match[1];
    // Only check relative specifiers pointing to .js files (skip code examples
    // embedded in string literals like "./components/App")
    if (specifier.startsWith('.') && specifier.endsWith('.js')) {
      specifiers.push(specifier);
    }
  }
  return specifiers;
}

let errors = 0;
let checked = 0;

const esmFiles = findEsmFiles(DIST);

for (const file of esmFiles) {
  const content = readFileSync(file, 'utf-8');
  const specifiers = extractImportSpecifiers(content);
  const dir = dirname(file);

  for (const spec of specifiers) {
    checked++;
    const resolved = resolve(dir, spec);
    if (!existsSync(resolved)) {
      console.error(`BROKEN: ${file} → ${spec} (resolved: ${resolved}, file not found)`);
      errors++;
    }
  }
}

// Check for singleton duplication: "Invalid hook call" should appear in at most
// one file across all ESM entry bundles (shared chunk), not in multiple entries.
const entryBundles = esmFiles.filter(f => f.startsWith(join(DIST, 'specifyjs')) && f.endsWith('.esm.js'));
const hookErrorFiles = entryBundles.filter(f => {
  const content = readFileSync(f, 'utf-8');
  return content.includes('Invalid hook call');
});
if (hookErrorFiles.length > 1) {
  console.error(`SINGLETON DUPLICATION: "Invalid hook call" found in ${hookErrorFiles.length} entry bundles:`);
  for (const f of hookErrorFiles) console.error(`  ${f}`);
  console.error('The hook dispatcher should be in a shared chunk, not duplicated.');
  errors++;
}

console.log(`Verified ${checked} import specifiers across ${esmFiles.length} files.`);
if (errors > 0) {
  console.error(`${errors} error(s) found.`);
  process.exit(1);
} else {
  console.log('All imports resolve correctly.');
}
