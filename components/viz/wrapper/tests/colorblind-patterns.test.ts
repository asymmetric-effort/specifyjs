// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { createPatternDefs, getPatternId, getPatternFill } from '../src/colorblind-patterns';

// ---------------------------------------------------------------------------
// createPatternDefs
// ---------------------------------------------------------------------------

describe('createPatternDefs', () => {
  it('returns a non-null element', () => {
    const defs = createPatternDefs();
    expect(defs).not.toBeNull();
    expect(defs).not.toBeUndefined();
  });

  it('returns a defs element', () => {
    const defs = createPatternDefs() as { type: string };
    expect(defs.type).toBe('defs');
  });
});

// ---------------------------------------------------------------------------
// getPatternId
// ---------------------------------------------------------------------------

describe('getPatternId', () => {
  it('returns expected ids for first few indices', () => {
    expect(getPatternId(0)).toBe('cb-diag-right');
    expect(getPatternId(1)).toBe('cb-diag-left');
    expect(getPatternId(2)).toBe('cb-dots');
    expect(getPatternId(3)).toBe('cb-cross');
    expect(getPatternId(4)).toBe('cb-horiz');
    expect(getPatternId(5)).toBe('cb-vert');
  });

  it('cycles through patterns when index exceeds count', () => {
    expect(getPatternId(6)).toBe('cb-diag-right');
    expect(getPatternId(7)).toBe('cb-diag-left');
    expect(getPatternId(12)).toBe('cb-diag-right');
  });
});

// ---------------------------------------------------------------------------
// getPatternFill
// ---------------------------------------------------------------------------

describe('getPatternFill', () => {
  it('returns url(#...) format', () => {
    const fill = getPatternFill(0);
    expect(fill).toBe('url(#cb-diag-right)');
  });

  it('returns correct format for all pattern indices', () => {
    for (let i = 0; i < 6; i++) {
      const fill = getPatternFill(i);
      expect(fill.startsWith('url(#')).toBe(true);
      expect(fill.endsWith(')')).toBe(true);
    }
  });

  it('cycles correctly for large indices', () => {
    expect(getPatternFill(6)).toBe('url(#cb-diag-right)');
    expect(getPatternFill(11)).toBe('url(#cb-vert)');
  });
});
