// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Security regression tests — ensures SAST fixes do not regress.
 * Each test maps to a specific finding from the security audit.
 */

import { describe, it, expect, vi } from '@asymmetric-effort/nogginlessdom';
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

describe('C-2/L-6/PT-003: CSS value sanitization in SSR', () => {
  it('rejects expression() in style values', () => {
    const el = createElement('div', { style: { color: 'expression(alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('expression');
    expect(html).not.toContain('alert');
  });

  it('rejects url(javascript:) in style values', () => {
    const el = createElement('div', { style: { background: 'url(javascript:alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('javascript:');
  });

  it('rejects CSS unicode escape bypass (\\65xpression)', () => {
    const el = createElement('div', { style: { color: '\\65xpression(alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('alert');
  });

  it('rejects CSS comment bypass (exp/**/ression)', () => {
    const el = createElement('div', { style: { color: 'exp/**/ression(alert(1))' } });
    const html = renderToString(el);
    expect(html).not.toContain('alert');
  });

  it('rejects behavior: pattern', () => {
    const el = createElement('div', { style: { color: 'behavior:url(xss.htc)' } });
    const html = renderToString(el);
    expect(html).not.toContain('behavior');
  });

  it('rejects -moz-binding pattern', () => {
    const el = createElement('div', { style: { color: '-moz-binding:url(xss.xml)' } });
    const html = renderToString(el);
    expect(html).not.toContain('moz-binding');
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
    // Check own property — __proto__ should not be copied as an own prop
    expect(Object.prototype.hasOwnProperty.call(el.props, '__proto__')).toBe(false);
    expect(el.props).toHaveProperty('title', 'safe');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });

  it('createElement filters constructor from config', () => {
    const el = createElement('div', { constructor: 'bad', title: 'ok' });
    // constructor exists on prototype of all objects, so check own property
    expect(Object.prototype.hasOwnProperty.call(el.props, 'constructor')).toBe(false);
    expect(el.props).toHaveProperty('title', 'ok');
  });

  it('createElement filters prototype from config', () => {
    const el = createElement('div', { prototype: 'bad', title: 'ok' });
    expect(Object.prototype.hasOwnProperty.call(el.props, 'prototype')).toBe(false);
  });

  it('cloneElement filters __proto__ from config', () => {
    const original = createElement('div', { title: 'orig' });
    const config = JSON.parse('{"__proto__":{"polluted":true},"title":"cloned"}');
    const cloned = cloneElement(original, config);
    expect(Object.prototype.hasOwnProperty.call(cloned.props, '__proto__')).toBe(false);
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

  it('PT-001: rejects unparseable URLs instead of silently allowing', () => {
    expect(() => assertSecureUrl('://')).toThrow('unable to validate URL');
  });
});

// ── M-8: gql template tag metacharacter warning ───────────────────────

describe('M-8/PT-002: gql metacharacter injection prevention', () => {
  it('throws when interpolated value contains GraphQL metacharacters', async () => {
    const { gql } = await import('../../../src/client/graphql');

    expect(() => gql`query { user(id: ${'{injected}'}) { name } }`).toThrow(
      'GraphQL metacharacters',
    );
  });

  it('throws for colon metacharacter', async () => {
    const { gql } = await import('../../../src/client/graphql');
    expect(() => gql`query { user(id: ${'key:value'}) { name } }`).toThrow(
      'GraphQL metacharacters',
    );
  });

  it('throws for parenthesis metacharacter', async () => {
    const { gql } = await import('../../../src/client/graphql');
    expect(() => gql`query { user(id: ${'fn()'}) { name } }`).toThrow('GraphQL metacharacters');
  });

  it('allows safe interpolated values without metacharacters', async () => {
    const { gql } = await import('../../../src/client/graphql');

    const frag = 'UserFields';
    const query = gql`query { user { ...${frag} } }`;
    expect(query).toContain('UserFields');
  });
});
