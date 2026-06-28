import { describe, it, expect, beforeEach } from '@asymmetric-effort/nogginlessdom';
import {
  parseStyleSheet,
  computeSpecificity,
  collectApplicableStyles,
  collectApplicableStylesWithImportance,
  parseMediaQuery,
  evaluateMediaQuery,
} from '@asymmetric-effort/nogginlessdom';
import type { CSSRule, MediaContext } from '@asymmetric-effort/nogginlessdom';
import { createElement } from '../../src/index';
import { createRoot } from '../../src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ---------------------------------------------------------------------------
// parseStyleSheet
// ---------------------------------------------------------------------------
describe('parseStyleSheet', () => {
  it('parses a simple ruleset into CSSRule objects', () => {
    const rules = parseStyleSheet(`
      .card { color: red; font-size: 16px; }
    `);
    expect(rules.length).toBe(1);
    const rule = rules[0] as CSSRule;
    expect(rule.selector).toBe('.card');
    expect(rule.properties.get('color')).toBe('red');
    expect(rule.properties.get('font-size')).toBe('16px');
  });

  it('parses multiple rulesets', () => {
    const rules = parseStyleSheet(`
      h1 { margin: 0; }
      .container { padding: 1rem; }
      #main { display: flex; }
    `);
    expect(rules.length).toBe(3);
  });

  it('preserves specificity on each rule', () => {
    const rules = parseStyleSheet(`
      div { color: blue; }
      .highlight { color: yellow; }
      #hero { color: green; }
    `);
    // element selector: [0,0,1]
    expect(rules[0]!.specificity).toEqual([0, 0, 1]);
    // class selector: [0,1,0]
    expect(rules[1]!.specificity).toEqual([0, 1, 0]);
    // id selector: [1,0,0]
    expect(rules[2]!.specificity).toEqual([1, 0, 0]);
  });

  it('handles @media blocks and attaches mediaQuery to inner rules', () => {
    const rules = parseStyleSheet(`
      @media (prefers-color-scheme: dark) {
        body { background: #000; color: #fff; }
      }
    `);
    expect(rules.length).toBeGreaterThanOrEqual(1);
    const darkRule = rules.find((r) => r.mediaQuery !== undefined);
    expect(darkRule).toBeDefined();
    expect(darkRule!.mediaQuery).toContain('prefers-color-scheme: dark');
    expect(darkRule!.properties.get('background')).toBe('#000');
  });

  it('handles !important declarations', () => {
    const rules = parseStyleSheet(`
      .override { color: red !important; font-size: 14px; }
    `);
    expect(rules.length).toBe(1);
    const rule = rules[0]!;
    expect(rule.properties.get('color')).toBe('red');
    expect(rule.importantProperties?.has('color')).toBe(true);
    expect(rule.importantProperties?.has('font-size')).toBeFalsy();
  });

  it('returns an empty array for an empty stylesheet', () => {
    const rules = parseStyleSheet('');
    expect(rules.length).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// computeSpecificity
// ---------------------------------------------------------------------------
describe('computeSpecificity', () => {
  it('returns [0,0,1] for a single element selector', () => {
    expect(computeSpecificity('div')).toEqual([0, 0, 1]);
  });

  it('returns [0,1,0] for a single class selector', () => {
    expect(computeSpecificity('.active')).toEqual([0, 1, 0]);
  });

  it('returns [1,0,0] for a single id selector', () => {
    expect(computeSpecificity('#main')).toEqual([1, 0, 0]);
  });

  it('returns [0,1,1] for element.class', () => {
    expect(computeSpecificity('div.container')).toEqual([0, 1, 1]);
  });

  it('returns [1,1,1] for element.class#id', () => {
    expect(computeSpecificity('div.box#hero')).toEqual([1, 1, 1]);
  });

  it('handles descendant selectors', () => {
    // "div .item" => div(0,0,1) + .item(0,1,0) = (0,1,1)
    expect(computeSpecificity('div .item')).toEqual([0, 1, 1]);
  });

  it('handles attribute selectors as class-level specificity', () => {
    // [type="text"] => (0,1,0)
    expect(computeSpecificity('[type="text"]')).toEqual([0, 1, 0]);
  });

  it('orders selectors correctly by specificity', () => {
    const selectors = ['div', '.card', '#main', 'div.card', 'div.card#main'];
    const specs = selectors.map((s) => computeSpecificity(s));
    // Verify ordering: each subsequent selector has equal or higher specificity
    for (let i = 1; i < specs.length; i++) {
      const [a0, a1, a2] = specs[i - 1]!;
      const [b0, b1, b2] = specs[i]!;
      const aVal = a0 * 1000000 + a1 * 1000 + a2;
      const bVal = b0 * 1000000 + b1 * 1000 + b2;
      expect(bVal).toBeGreaterThanOrEqual(aVal);
    }
  });
});

// ---------------------------------------------------------------------------
// parseMediaQuery & evaluateMediaQuery
// ---------------------------------------------------------------------------
describe('parseMediaQuery', () => {
  it('parses a prefers-color-scheme query', () => {
    const parsed = parseMediaQuery('(prefers-color-scheme: dark)');
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    const conditions = parsed[0]!.conditions;
    const scheme = conditions.find((c) => c.type === 'prefers-color-scheme');
    expect(scheme).toBeDefined();
    expect((scheme as any).value).toBe('dark');
  });

  it('parses a min-width query', () => {
    const parsed = parseMediaQuery('(min-width: 768px)');
    expect(parsed.length).toBeGreaterThanOrEqual(1);
    const conditions = parsed[0]!.conditions;
    const mw = conditions.find((c) => c.type === 'min-width');
    expect(mw).toBeDefined();
    expect((mw as any).value).toBe(768);
  });

  it('parses a max-width query', () => {
    const parsed = parseMediaQuery('(max-width: 1024px)');
    const conditions = parsed[0]!.conditions;
    const mw = conditions.find((c) => c.type === 'max-width');
    expect(mw).toBeDefined();
    expect((mw as any).value).toBe(1024);
  });

  it('parses prefers-reduced-motion', () => {
    const parsed = parseMediaQuery('(prefers-reduced-motion: reduce)');
    const conditions = parsed[0]!.conditions;
    const motion = conditions.find((c) => c.type === 'prefers-reduced-motion');
    expect(motion).toBeDefined();
    expect((motion as any).value).toBe('reduce');
  });

  it('handles comma-separated queries (OR semantics)', () => {
    const parsed = parseMediaQuery('(min-width: 768px), (prefers-color-scheme: dark)');
    expect(parsed.length).toBe(2);
  });
});

describe('evaluateMediaQuery', () => {
  const lightDesktop: MediaContext = {
    width: 1440,
    height: 900,
    colorScheme: 'light',
    reducedMotion: false,
    mediaType: 'screen',
  };

  const darkMobile: MediaContext = {
    width: 375,
    height: 667,
    colorScheme: 'dark',
    reducedMotion: false,
    mediaType: 'screen',
  };

  const reducedMotionCtx: MediaContext = {
    width: 1024,
    height: 768,
    colorScheme: 'light',
    reducedMotion: true,
    mediaType: 'screen',
  };

  it('matches dark mode query against dark context', () => {
    const parsed = parseMediaQuery('(prefers-color-scheme: dark)');
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(true);
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(false);
  });

  it('matches light mode query against light context', () => {
    const parsed = parseMediaQuery('(prefers-color-scheme: light)');
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(true);
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(false);
  });

  it('matches min-width breakpoint', () => {
    const parsed = parseMediaQuery('(min-width: 768px)');
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(true); // 1440 >= 768
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(false); // 375 < 768
  });

  it('matches max-width breakpoint', () => {
    const parsed = parseMediaQuery('(max-width: 600px)');
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(true); // 375 <= 600
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(false); // 1440 > 600
  });

  it('handles prefers-reduced-motion', () => {
    const parsed = parseMediaQuery('(prefers-reduced-motion: reduce)');
    expect(evaluateMediaQuery(parsed, reducedMotionCtx)).toBe(true);
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(false);
  });

  it('OR semantics: matches if any comma-separated query matches', () => {
    const parsed = parseMediaQuery('(min-width: 1200px), (prefers-color-scheme: dark)');
    // darkMobile: width 375 (fails min-width) but dark (passes second)
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(true);
    // lightDesktop: width 1440 (passes first)
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(true);
  });

  it('AND semantics within a single query', () => {
    // min-width AND max-width in the same query = both must pass
    const parsed = parseMediaQuery('(min-width: 768px) and (max-width: 1200px)');
    const tablet: MediaContext = {
      width: 1024,
      height: 768,
      colorScheme: 'light',
      reducedMotion: false,
      mediaType: 'screen',
    };
    expect(evaluateMediaQuery(parsed, tablet)).toBe(true); // 768 <= 1024 <= 1200
    expect(evaluateMediaQuery(parsed, lightDesktop)).toBe(false); // 1440 > 1200
    expect(evaluateMediaQuery(parsed, darkMobile)).toBe(false); // 375 < 768
  });
});

// ---------------------------------------------------------------------------
// collectApplicableStyles — requires DOM elements
// ---------------------------------------------------------------------------
describe('collectApplicableStyles', () => {
  it('collects styles matching an element by class', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'card' }, 'Hello'));

    const el = container.querySelector('.card');
    expect(el).not.toBeNull();

    const rules = parseStyleSheet(`
      .card { color: blue; padding: 8px; }
      .other { color: green; }
    `);

    const styles = collectApplicableStyles(el as any, rules);
    expect(styles.get('color')).toBe('blue');
    expect(styles.get('padding')).toBe('8px');
  });

  it('collects styles matching an element by id', () => {
    const root = createRoot(container);
    root.render(createElement('div', { id: 'hero' }, 'Hero'));

    const el = container.querySelector('#hero');
    const rules = parseStyleSheet(`
      #hero { background: navy; }
      .sidebar { background: gray; }
    `);

    const styles = collectApplicableStyles(el as any, rules);
    expect(styles.get('background')).toBe('navy');
  });

  it('higher specificity wins when rules conflict', () => {
    const root = createRoot(container);
    root.render(createElement('div', { id: 'main', className: 'box' }, 'content'));

    const el = container.querySelector('#main');
    const rules = parseStyleSheet(`
      .box { color: red; }
      #main { color: green; }
    `);

    const styles = collectApplicableStyles(el as any, rules);
    // #main (1,0,0) beats .box (0,1,0)
    expect(styles.get('color')).toBe('green');
  });

  it('later rule wins at equal specificity (cascade order)', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'a b' }, 'text'));

    const el = container.querySelector('.a');
    const rules = parseStyleSheet(`
      .a { color: red; }
      .b { color: blue; }
    `);

    const styles = collectApplicableStyles(el as any, rules);
    // Both are (0,1,0); .b comes later so it wins
    expect(styles.get('color')).toBe('blue');
  });

  it('filters rules by media context (dark mode)', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'themed' }, 'Themed'));

    const el = container.querySelector('.themed');
    const rules = parseStyleSheet(`
      .themed { background: white; color: black; }
      @media (prefers-color-scheme: dark) {
        .themed { background: #111; color: #eee; }
      }
    `);

    const lightCtx: MediaContext = {
      width: 1024,
      height: 768,
      colorScheme: 'light',
      reducedMotion: false,
      mediaType: 'screen',
    };

    const darkCtx: MediaContext = {
      width: 1024,
      height: 768,
      colorScheme: 'dark',
      reducedMotion: false,
      mediaType: 'screen',
    };

    const lightStyles = collectApplicableStyles(el as any, rules, lightCtx);
    expect(lightStyles.get('background')).toBe('white');
    expect(lightStyles.get('color')).toBe('black');

    const darkStyles = collectApplicableStyles(el as any, rules, darkCtx);
    expect(darkStyles.get('background')).toBe('#111');
    expect(darkStyles.get('color')).toBe('#eee');
  });

  it('filters rules by responsive breakpoint', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'grid' }, 'Grid'));

    const el = container.querySelector('.grid');
    const rules = parseStyleSheet(`
      .grid { display: block; }
      @media (min-width: 768px) {
        .grid { display: grid; grid-template-columns: 1fr 1fr; }
      }
    `);

    const mobileCtx: MediaContext = {
      width: 375,
      height: 667,
      colorScheme: 'light',
      reducedMotion: false,
      mediaType: 'screen',
    };

    const desktopCtx: MediaContext = {
      width: 1440,
      height: 900,
      colorScheme: 'light',
      reducedMotion: false,
      mediaType: 'screen',
    };

    const mobileStyles = collectApplicableStyles(el as any, rules, mobileCtx);
    expect(mobileStyles.get('display')).toBe('block');

    const desktopStyles = collectApplicableStyles(el as any, rules, desktopCtx);
    expect(desktopStyles.get('display')).toBe('grid');
    expect(desktopStyles.get('grid-template-columns')).toBe('1fr 1fr');
  });
});

// ---------------------------------------------------------------------------
// collectApplicableStylesWithImportance
// ---------------------------------------------------------------------------
describe('collectApplicableStylesWithImportance', () => {
  it('reports !important flags alongside styles', () => {
    const root = createRoot(container);
    root.render(createElement('div', { className: 'alert' }, 'Warning'));

    const el = container.querySelector('.alert');
    const rules = parseStyleSheet(`
      .alert { color: red !important; font-size: 14px; }
    `);

    const { styles, important } = collectApplicableStylesWithImportance(el as any, rules);
    expect(styles.get('color')).toBe('red');
    expect(important.has('color')).toBe(true);
    expect(important.has('font-size')).toBe(false);
  });

  it('!important overrides higher specificity', () => {
    const root = createRoot(container);
    root.render(createElement('div', { id: 'special', className: 'base' }, 'text'));

    const el = container.querySelector('#special');
    const rules = parseStyleSheet(`
      .base { color: blue !important; }
      #special { color: red; }
    `);

    const { styles } = collectApplicableStylesWithImportance(el as any, rules);
    // !important on .base should beat #special even though #special has higher specificity
    expect(styles.get('color')).toBe('blue');
  });
});

// ---------------------------------------------------------------------------
// Component-level style integration
// ---------------------------------------------------------------------------
describe('component inline style + CSS cascade integration', () => {
  it('validates rendered component inline styles via DOM attributes', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'button',
        {
          className: 'btn',
          style: 'background: coral; padding: 8px 16px;',
        },
        'Click me',
      ),
    );

    const btn = container.querySelector('.btn') as any;
    expect(btn).not.toBeNull();
    expect(btn.getAttribute('style')).toContain('background: coral');
  });

  it('validates data-theme attribute on rendered element', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        { 'data-theme': 'dark', className: 'app-root' },
        createElement('p', null, 'Dark mode content'),
      ),
    );

    const appRoot = container.querySelector('.app-root') as any;
    expect(appRoot).not.toBeNull();
    expect(appRoot.getAttribute('data-theme')).toBe('dark');
  });

  it('applies different CSS rules based on data-theme context', () => {
    const root = createRoot(container);
    root.render(
      createElement(
        'div',
        { 'data-theme': 'dark', className: 'wrapper' },
        createElement('span', { className: 'text' }, 'Hello'),
      ),
    );

    const rules = parseStyleSheet(`
      .text { color: #333; }
      [data-theme="dark"] .text { color: #eee; }
    `);

    const textEl = container.querySelector('.text');
    expect(textEl).not.toBeNull();

    const styles = collectApplicableStyles(textEl as any, rules);
    // The attribute selector + descendant should match and override
    expect(styles.get('color')).toBe('#eee');
  });
});
