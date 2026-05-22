// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Security regression tests — ensures SAST fixes do not regress.
 * Each test maps to a specific finding from the security audit.
 */

import { describe, it, expect, vi } from 'vitest';
import { createElement } from '../../../src/core/create-element';
import { cloneElement } from '../../../src/core/clone-element';
import { renderToString, renderToStaticMarkup } from '../../../src/server/render-to-string';
import { assertSecureUrl } from '../../../src/shared/secure-fetch';
import { warn, resetWarnings } from '../../../src/shared/warnings';
import { coerceToFiberChildren } from '../../../src/core/fiber';

// ── C-1: Attribute name injection in SSR ──────────────────────────────

describe('C-1: SSR attribute name validation', () => {
  it('rejects attribute names with XSS payloads', () => {
    const el = createElement('div', { '" onclick="alert(1)': 'x' });
    const html = renderToString(el);
    expect(html).not.toContain('onclick');
    expect(html).not.toContain('alert');
  });

  it('accepts valid attribute names', () => {
    const el = createElement('div', { 'data-testid': 'foo', className: 'bar' });
    const html = renderToString(el);
    expect(html).toContain('data-testid="foo"');
  });

  it('rejects attribute names with spaces', () => {
    const el = createElement('div', { 'bad attr': 'val' });
    const html = renderToString(el);
    expect(html).not.toContain('bad attr');
  });
});

// ── C-2/L-6: CSS injection in SSR ────────────────────────────────────

describe('C-2/L-6: CSS value sanitization in SSR', () => {
  it('strips expression() from style values', () => {
    const el = createElement('div', { style: { color: 'expression(alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('expression(');
  });

  it('strips url(javascript:) from style values', () => {
    const el = createElement('div', { style: { background: 'url(javascript:alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('javascript:');
  });

  it('allows normal CSS values', () => {
    const el = createElement('div', { style: { color: 'red', fontSize: '14px' } });
    const html = renderToString(el);
    expect(html).toContain('color:red');
    expect(html).toContain('font-size:14px');
  });
});

// ── H-1/H-2/H-3: Prototype pollution ─────────────────────────────────

describe('H-1/H-2/H-3: Prototype pollution prevention', () => {
  it('createElement filters __proto__ from config', () => {
    const config = JSON.parse('{"__proto__":{"polluted":true},"title":"safe"}');
    const el = createElement('div', config);
    expect(el.props).not.toHaveProperty('__proto__');
    expect(el.props).toHaveProperty('title', 'safe');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('createElement filters constructor from config', () => {
    const el = createElement('div', { constructor: 'bad', title: 'ok' });
    expect(el.props).not.toHaveProperty('constructor');
    expect(el.props).toHaveProperty('title', 'ok');
  });

  it('createElement filters prototype from config', () => {
    const el = createElement('div', { prototype: 'bad', title: 'ok' });
    expect(el.props).not.toHaveProperty('prototype');
  });

  it('cloneElement filters __proto__ from config', () => {
    const original = createElement('div', { title: 'orig' });
    const config = JSON.parse('{"__proto__":{"polluted":true},"title":"cloned"}');
    const cloned = cloneElement(original, config);
    expect(cloned.props).not.toHaveProperty('__proto__');
    expect(cloned.props).toHaveProperty('title', 'cloned');
  });
});

// ── M-7: Protocol-relative URL bypass ─────────────────────────────────

describe('M-7: Protocol-relative URL blocking', () => {
  it('rejects //evil.com URLs', () => {
    expect(() => assertSecureUrl('//evil.com/path')).toThrow('Protocol-relative URL rejected');
  });

  it('rejects //attacker.io', () => {
    expect(() => assertSecureUrl('//attacker.io')).toThrow();
  });

  it('allows single-slash relative URLs', () => {
    expect(() => assertSecureUrl('/api/data')).not.toThrow();
  });

  it('allows https URLs', () => {
    expect(() => assertSecureUrl('https://example.com')).not.toThrow();
  });

  it('rejects http URLs', () => {
    expect(() => assertSecureUrl('http://example.com')).toThrow('Insecure URL rejected');
  });

  it('allows localhost for development', () => {
    expect(() => assertSecureUrl('http://localhost:3000')).not.toThrow();
  });
});

// ── M-11: Bounded warnings set ────────────────────────────────────────

describe('M-11: Warning set bounds', () => {
  it('does not grow beyond 1000 entries', () => {
    resetWarnings();
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    for (let i = 0; i < 1100; i++) {
      warn(`unique-warning-${i}`);
    }
    // Should have warned exactly 1000 times (capped)
    expect(consoleSpy).toHaveBeenCalledTimes(1000);
    consoleSpy.mockRestore();
    resetWarnings();
  });
});

// ── L-1/L-2: Iterative tree traversal ────────────────────────────────

describe('L-1/L-2: Iterative children flattening', () => {
  it('handles deeply nested arrays without stack overflow', () => {
    // Build a 1000-level deep nested array
    let nested: unknown = 'leaf';
    for (let i = 0; i < 1000; i++) {
      nested = [nested];
    }
    const result = coerceToFiberChildren(nested as any);
    expect(result).toEqual(['leaf']);
  });

  it('flattens mixed arrays correctly', () => {
    const el1 = createElement('span', null, 'a');
    const el2 = createElement('span', null, 'b');
    const result = coerceToFiberChildren([el1, [el2, 'text', [42]]]);
    expect(result).toHaveLength(4);
  });
});

// ── SSR renderToStaticMarkup also validates attributes ─────────────────

describe('renderToStaticMarkup attribute validation', () => {
  it('rejects XSS in attribute names', () => {
    const el = createElement('div', { '"><script>alert(1)</script>': 'x' });
    const html = renderToStaticMarkup(el);
    expect(html).not.toContain('<script>');
    expect(html).not.toContain('alert');
  });
});

// ── M-2: Scheduler queue bounds ───────────────────────────────────────

describe('M-2: Scheduler queue bounds', () => {
  it('warns and trims when queue exceeds limit', async () => {
    const { scheduleUpdate, batchUpdates, flushPendingTasks } =
      await import('../../../src/core/scheduler');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const calls: number[] = [];

    batchUpdates(() => {
      for (let i = 0; i < 10001; i++) {
        scheduleUpdate(() => calls.push(i));
      }
    });

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('pending task queue exceeded'));
    consoleSpy.mockRestore();
  });
});

// ── M-7 additional: secure-fetch edge cases ───────────────────────────

describe('M-7 additional: secure-fetch edge cases', () => {
  it('allows data: URLs', () => {
    expect(() => assertSecureUrl('data:text/html,hello')).not.toThrow();
  });

  it('allows relative ./ URLs', () => {
    expect(() => assertSecureUrl('./data/file.json')).not.toThrow();
  });

  it('allows relative ../ URLs', () => {
    expect(() => assertSecureUrl('../assets/img.png')).not.toThrow();
  });

  it('allows 127.0.0.1 for development', () => {
    expect(() => assertSecureUrl('http://127.0.0.1:8080')).not.toThrow();
  });

  it('allows unparseable URLs (treated as relative paths)', () => {
    // URL constructor throws on malformed URLs without a base — these are treated as relative
    expect(() => assertSecureUrl('://')).not.toThrow();
  });
});

// ── M-8: gql template tag metacharacter warning ───────────────────────

describe('M-8: gql metacharacter warning', () => {
  it('warns when interpolated value contains GraphQL metacharacters', async () => {
    const { gql } = await import('../../../src/client/graphql');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const query = gql`query { user(id: ${'{injected}'}) { name } }`;
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('GraphQL metacharacters'));
    expect(query).toContain('{injected}');
    consoleSpy.mockRestore();
  });

  it('does not warn for safe interpolated values', async () => {
    const { gql } = await import('../../../src/client/graphql');
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const frag = 'UserFields';
    gql`query { user { ...${frag} } }`;
    // The fragment name "UserFields" has no metacharacters
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
