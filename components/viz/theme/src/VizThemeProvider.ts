// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * VizThemeProvider — context provider for visualization themes.
 *
 * Wraps descendant components with a VizTheme context. All viz components
 * call useVizTheme() to read the current theme. When no provider is
 * present, useVizTheme() returns the casual theme (backward compatible).
 */

import { createElement } from '../../../../core/src/index';
import { createContext } from '../../../../core/src/context/create-context';
import { useMemo, useContext } from '../../../../core/src/hooks/index';
import type { SpecNode } from '../../../../core/src/shared/types';
import type { VizTheme } from './VizTheme.types';
import { casual } from './casual';
import { getVizTheme } from './getVizTheme';
import { deepFreeze } from './freeze';

// ---------------------------------------------------------------------------
// Context (default = casual theme)
// ---------------------------------------------------------------------------

const VizThemeContext = createContext<VizTheme>(casual);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export interface VizThemeProviderProps {
  /** Theme name ('casual' | 'crisp') or a custom VizTheme object */
  theme: 'casual' | 'crisp' | VizTheme;
  /** Children */
  children?: SpecNode;
}

export function VizThemeProvider(props: VizThemeProviderProps): SpecNode {
  const { theme, children } = props;

  // Resolve theme: string name → built-in, object → use directly
  const resolved = useMemo(() => {
    if (typeof theme === 'string') {
      return getVizTheme(theme);
    }
    // Custom theme object — freeze if not already
    return Object.isFrozen(theme) ? theme : deepFreeze({ ...theme } as VizTheme);
  }, [theme]);

  return createElement(
    VizThemeContext.Provider as unknown as string,
    { value: resolved },
    children,
  );
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * useVizTheme — read the current visualization theme from context.
 * Returns the casual theme when no VizThemeProvider is present.
 */
export function useVizTheme(): VizTheme {
  return useContext(VizThemeContext);
}
