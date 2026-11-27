// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * getVizTheme — returns a frozen built-in theme by name.
 * Useful outside component trees where useVizTheme() is not available.
 */

import type { VizTheme } from './VizTheme.types';
import { casual } from './casual';
import { crisp } from './crisp';

const themes: Record<string, VizTheme> = {
  casual,
  crisp,
};

export function getVizTheme(name: 'casual' | 'crisp'): VizTheme {
  const theme = themes[name];
  if (!theme) {
    throw new Error(`Unknown viz theme: "${name}". Available themes: casual, crisp.`);
  }
  return theme;
}
