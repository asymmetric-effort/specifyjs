// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT


/**
 * Filesystem test: verifies every component directory has a README.md file.
 *
 * Enumerates all component directories under components/<category>/<component>
 * and checks that each one contains a README.md.
 */

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import fs from 'fs';
import path from 'path';

const COMPONENTS_ROOT = path.resolve(__dirname, '..', '..');

/** Categories that contain component subdirectories */
const CATEGORIES = [
  'ad',
  'analytics',
  'data',
  'feedback',
  'form',
  'layout',
  'media',
  'nav',
  'overlay',
  'page',
  'viz',
];

/** Directories to skip (not actual components) */
const SKIP_DIRS = new Set(['_test-helpers', '*']);

function getComponentDirs(): { category: string; component: string; dir: string }[] {
  const results: { category: string; component: string; dir: string }[] = [];

  for (const category of CATEGORIES) {
    const catDir = path.join(COMPONENTS_ROOT, category);
    if (!fs.existsSync(catDir)) continue;

    const entries = fs.readdirSync(catDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SKIP_DIRS.has(entry.name)) continue;

      results.push({
        category,
        component: entry.name,
        dir: path.join(catDir, entry.name),
      });
    }
  }

  return results;
}

describe('Component README.md files', () => {
  const componentDirs = getComponentDirs();

  it('finds at least one component directory', () => {
    expect(componentDirs.length).toBeGreaterThan(0);
  });

  for (const { category, component, dir } of componentDirs) {
    it(`${category}/${component} has a README.md`, () => {
      const readmePath = path.join(dir, 'README.md');
      expect(fs.existsSync(readmePath)).toBe(true);
    });
  }
});
