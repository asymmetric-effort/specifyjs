// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Guard test: ensures TypeScript strict mode is enabled in all tsconfig files.
 * This test will FAIL if strict: true is removed or set to false.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

function readTsConfig(relativePath: string): Record<string, unknown> {
  const fullPath = resolve(__dirname, '..', '..', '..', relativePath);
  return JSON.parse(readFileSync(fullPath, 'utf8'));
}

describe('TypeScript strict mode guard', () => {
  it('core tsconfig.json has strict: true', () => {
    const config = readTsConfig('tsconfig.json');
    const compilerOptions = config.compilerOptions as Record<string, unknown>;
    expect(compilerOptions.strict).toBe(true);
  });

  it('components tsconfig.components.json has strict: true', () => {
    const config = readTsConfig('tsconfig.components.json');
    const compilerOptions = config.compilerOptions as Record<string, unknown>;
    expect(compilerOptions.strict).toBe(true);
  });
});
