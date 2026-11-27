// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import { casual } from '../src/casual';
import { crisp } from '../src/crisp';
import { getVizTheme } from '../src/getVizTheme';
import { createVizTheme } from '../src/createVizTheme';
import { deepFreeze } from '../src/freeze';
import type { VizTheme } from '../src/VizTheme.types';

// ── VizTheme type shape ────────────────────────────────────────────────

describe('VizTheme type shape', () => {
  function assertThemeShape(theme: VizTheme): void {
    expect(typeof theme.fontFamily).toBe('string');
    expect(typeof theme.fontFamilyMono).toBe('string');
    expect(typeof theme.fontSize.axis).toBe('string');
    expect(typeof theme.fontSize.label).toBe('string');
    expect(typeof theme.fontSize.title).toBe('string');
    expect(typeof theme.lineWidth.grid).toBe('number');
    expect(typeof theme.lineWidth.axis).toBe('number');
    expect(typeof theme.lineWidth.series).toBe('number');
    expect(theme.lineCap === 'round' || theme.lineCap === 'butt').toBe(true);
    expect(typeof theme.spacing.padding.top).toBe('number');
    expect(typeof theme.spacing.padding.right).toBe('number');
    expect(typeof theme.spacing.padding.bottom).toBe('number');
    expect(typeof theme.spacing.padding.left).toBe('number');
    expect(typeof theme.border.radius).toBe('string');
    expect(typeof theme.border.width).toBe('string');
    expect(typeof theme.axis.showGrid).toBe('boolean');
    expect(typeof theme.axis.showMinorGrid).toBe('boolean');
    expect(typeof theme.axis.tickLength).toBe('number');
    expect(typeof theme.axis.tickWidth).toBe('number');
    expect(typeof theme.legend.swatchSize).toBe('number');
    expect(typeof theme.legend.spacing).toBe('string');
    expect(typeof theme.animation.duration).toBe('number');
  }

  it('casual theme has correct shape', () => {
    assertThemeShape(casual);
  });

  it('crisp theme has correct shape', () => {
    assertThemeShape(crisp);
  });

  it('themes have NO color tokens', () => {
    const casualKeys = JSON.stringify(casual);
    const crispKeys = JSON.stringify(crisp);
    // Should not contain any color-related keys
    expect(casualKeys).not.toContain('"palette"');
    expect(casualKeys).not.toContain('"background"');
    expect(casualKeys).not.toContain('"text"');
    expect(crispKeys).not.toContain('"palette"');
    expect(crispKeys).not.toContain('"background"');
    expect(crispKeys).not.toContain('"text"');
  });
});

// ── casual theme values ────────────────────────────────────────────────

describe('casual theme', () => {
  it('fontFamily is sans-serif', () => {
    expect(casual.fontFamily).toBe('sans-serif');
  });

  it('fontFamilyMono is monospace', () => {
    expect(casual.fontFamilyMono).toBe('monospace');
  });

  it('fontSize.axis is 12px', () => {
    expect(casual.fontSize.axis).toBe('12px');
  });

  it('fontSize.label is 13px', () => {
    expect(casual.fontSize.label).toBe('13px');
  });

  it('fontSize.title is 16px', () => {
    expect(casual.fontSize.title).toBe('16px');
  });

  it('lineWidth.grid is 1', () => {
    expect(casual.lineWidth.grid).toBe(1);
  });

  it('lineWidth.axis is 1', () => {
    expect(casual.lineWidth.axis).toBe(1);
  });

  it('lineWidth.series is 2', () => {
    expect(casual.lineWidth.series).toBe(2);
  });

  it('lineCap is round', () => {
    expect(casual.lineCap).toBe('round');
  });

  it('spacing.padding matches expected values', () => {
    expect(casual.spacing.padding).toEqual({ top: 20, right: 20, bottom: 40, left: 50 });
  });

  it('border.radius is 8px', () => {
    expect(casual.border.radius).toBe('8px');
  });

  it('border.width is 1px', () => {
    expect(casual.border.width).toBe('1px');
  });

  it('axis.showGrid is true', () => {
    expect(casual.axis.showGrid).toBe(true);
  });

  it('axis.showMinorGrid is false', () => {
    expect(casual.axis.showMinorGrid).toBe(false);
  });

  it('axis.tickLength is 0', () => {
    expect(casual.axis.tickLength).toBe(0);
  });

  it('axis.tickWidth is 0', () => {
    expect(casual.axis.tickWidth).toBe(0);
  });

  it('legend.swatchSize is 12', () => {
    expect(casual.legend.swatchSize).toBe(12);
  });

  it('legend.spacing is 8px', () => {
    expect(casual.legend.spacing).toBe('8px');
  });

  it('animation.duration is 300', () => {
    expect(casual.animation.duration).toBe(300);
  });

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(casual)).toBe(true);
    expect(Object.isFrozen(casual.fontSize)).toBe(true);
    expect(Object.isFrozen(casual.spacing.padding)).toBe(true);
  });
});

// ── crisp theme values ─────────────────────────────────────────────────

describe('crisp theme', () => {
  it('fontFamily is Inter stack', () => {
    expect(casual.fontFamily).not.toBe(crisp.fontFamily);
    expect(crisp.fontFamily).toContain('Inter');
  });

  it('fontFamilyMono is JetBrains Mono stack', () => {
    expect(crisp.fontFamilyMono).toContain('JetBrains Mono');
  });

  it('fontSize.axis is 11px', () => {
    expect(crisp.fontSize.axis).toBe('11px');
  });

  it('fontSize.label is 11px', () => {
    expect(crisp.fontSize.label).toBe('11px');
  });

  it('fontSize.title is 13px', () => {
    expect(crisp.fontSize.title).toBe('13px');
  });

  it('lineWidth.grid is 0.5', () => {
    expect(crisp.lineWidth.grid).toBe(0.5);
  });

  it('lineWidth.series is 1.5', () => {
    expect(crisp.lineWidth.series).toBe(1.5);
  });

  it('lineCap is butt', () => {
    expect(crisp.lineCap).toBe('butt');
  });

  it('spacing.padding is tighter', () => {
    expect(crisp.spacing.padding).toEqual({ top: 12, right: 12, bottom: 32, left: 44 });
  });

  it('border.radius is 0', () => {
    expect(crisp.border.radius).toBe('0');
  });

  it('border.width is 0', () => {
    expect(crisp.border.width).toBe('0');
  });

  it('axis.showMinorGrid is true', () => {
    expect(crisp.axis.showMinorGrid).toBe(true);
  });

  it('axis.tickLength is 4', () => {
    expect(crisp.axis.tickLength).toBe(4);
  });

  it('axis.tickWidth is 1', () => {
    expect(crisp.axis.tickWidth).toBe(1);
  });

  it('legend.swatchSize is 8', () => {
    expect(crisp.legend.swatchSize).toBe(8);
  });

  it('animation.duration is 0', () => {
    expect(crisp.animation.duration).toBe(0);
  });

  it('is frozen (immutable)', () => {
    expect(Object.isFrozen(crisp)).toBe(true);
    expect(Object.isFrozen(crisp.fontSize)).toBe(true);
    expect(Object.isFrozen(crisp.axis)).toBe(true);
  });
});

// ── getVizTheme ────────────────────────────────────────────────────────

describe('getVizTheme', () => {
  it('returns casual theme for "casual"', () => {
    const theme = getVizTheme('casual');
    expect(theme.fontFamily).toBe('sans-serif');
    expect(theme.lineCap).toBe('round');
    expect(theme.border.radius).toBe('8px');
  });

  it('returns crisp theme for "crisp"', () => {
    const theme = getVizTheme('crisp');
    expect(theme.lineCap).toBe('butt');
    expect(theme.border.radius).toBe('0');
    expect(theme.axis.tickLength).toBe(4);
  });

  it('returns frozen objects', () => {
    expect(Object.isFrozen(getVizTheme('casual'))).toBe(true);
    expect(Object.isFrozen(getVizTheme('crisp'))).toBe(true);
  });

  it('throws for unknown theme name', () => {
    expect(() => getVizTheme('unknown' as 'casual')).toThrow('Unknown viz theme');
  });

  it('returns same reference for repeated calls', () => {
    expect(getVizTheme('casual')).toBe(getVizTheme('casual'));
    expect(getVizTheme('crisp')).toBe(getVizTheme('crisp'));
  });
});

// ── createVizTheme ─────────────────────────────────────────────────────

describe('createVizTheme', () => {
  it('shallow override: changes lineCap', () => {
    const custom = createVizTheme('casual', { lineCap: 'butt' });
    expect(custom.lineCap).toBe('butt');
    // Other tokens unchanged
    expect(custom.fontFamily).toBe('sans-serif');
    expect(custom.lineWidth.series).toBe(2);
  });

  it('deep merge: changes only fontSize.axis', () => {
    const custom = createVizTheme('casual', { fontSize: { axis: '10px' } } as Partial<VizTheme>);
    expect(custom.fontSize.axis).toBe('10px');
    // Other fontSize tokens preserved
    expect(custom.fontSize.label).toBe('13px');
    expect(custom.fontSize.title).toBe('16px');
  });

  it('deep merge: changes only spacing.padding.top', () => {
    const custom = createVizTheme('crisp', {
      spacing: { padding: { top: 5 } },
    } as Partial<VizTheme>);
    expect(custom.spacing.padding.top).toBe(5);
    expect(custom.spacing.padding.bottom).toBe(32);
    expect(custom.spacing.padding.left).toBe(44);
  });

  it('returns frozen theme', () => {
    const custom = createVizTheme('casual', { lineCap: 'butt' });
    expect(Object.isFrozen(custom)).toBe(true);
    expect(Object.isFrozen(custom.fontSize)).toBe(true);
  });

  it('does not mutate the base theme', () => {
    const before = getVizTheme('casual').lineCap;
    createVizTheme('casual', { lineCap: 'butt' });
    expect(getVizTheme('casual').lineCap).toBe(before);
  });

  it('works with crisp base', () => {
    const custom = createVizTheme('crisp', { animation: { duration: 200 } } as Partial<VizTheme>);
    expect(custom.animation.duration).toBe(200);
    expect(custom.lineCap).toBe('butt');
  });

  it('empty overrides returns equivalent of base', () => {
    const custom = createVizTheme('casual', {});
    expect(custom.fontFamily).toBe(casual.fontFamily);
    expect(custom.lineCap).toBe(casual.lineCap);
    expect(custom.fontSize.axis).toBe(casual.fontSize.axis);
  });
});

// ── deepFreeze ─────────────────────────────────────────────────────────

describe('deepFreeze', () => {
  it('freezes top-level object', () => {
    const obj = deepFreeze({ a: 1 });
    expect(Object.isFrozen(obj)).toBe(true);
  });

  it('freezes nested objects', () => {
    const obj = deepFreeze({ outer: { inner: { value: 1 } } });
    expect(Object.isFrozen(obj.outer)).toBe(true);
    expect(Object.isFrozen(obj.outer.inner)).toBe(true);
  });

  it('returns the same reference', () => {
    const original = { a: 1 };
    const frozen = deepFreeze(original);
    expect(frozen).toBe(original);
  });
});

// ── Component migration verification ───────────────────────────────────
// Verify that all viz components import and call useVizTheme

import { readFileSync } from 'fs';
import { join } from 'path';

describe('viz component theme migration', () => {
  const VIZ_DIR = join(__dirname, '..', '..'); // components/viz/

  const EXPECTED_COMPONENTS = [
    '2D-bar-graph', '2D-line-graph', '2D-pie-graph', '2D-discrete-cartesian',
    '2D-polar-graph', '2D-cartesian-raw',
    'big-number', 'bloch-sphere', 'box-plot', 'bubble-chart',
    'calendar-heat-map', 'chord', 'decomposition-tree', 'earth-globe',
    'force-graph', '3d-force-graph', '3d-layers', '3dSpace',
    'funnel', 'gantt-chart', 'gauge', 'graph',
    'heat-map', 'histogram', 'lollipop', 'matrix',
    'partition', 'pivot-table', 'radar-chart', 'sankey',
    'sunburst', 'tree-map', 'us-state-map', 'vector-field',
    'waterfall', 'word-cloud', 'wrapper',
  ];

  for (const component of EXPECTED_COMPONENTS) {
    it(`${component} imports useVizTheme`, () => {
      const srcDir = join(VIZ_DIR, component, 'src');
      const files = require('fs').readdirSync(srcDir).filter((f: string) => f.endsWith('.ts') && f !== 'index.ts');
      let found = false;
      for (const file of files) {
        const content = readFileSync(join(srcDir, file), 'utf-8');
        if (content.includes('useVizTheme')) {
          found = true;
          break;
        }
      }
      expect(found).toBe(true);
    });
  }
});
