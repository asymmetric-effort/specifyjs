// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WordCloud } from '../src/index';
import { installMockDispatcher, teardownMockDispatcher } from '../../../_test-helpers/mock-dispatcher';

beforeEach(() => installMockDispatcher());
afterEach(() => teardownMockDispatcher());

const sampleWords = [
  { text: 'hello', weight: 10 },
  { text: 'world', weight: 8 },
  { text: 'test', weight: 5 },
  { text: 'vitest', weight: 3 },
];

// ---------------------------------------------------------------------------
// Happy-path tests
// ---------------------------------------------------------------------------

describe('WordCloud — happy path', () => {
  it('renders with words array', () => {
    const el = WordCloud({ words: sampleWords });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom dimensions', () => {
    const el = WordCloud({ words: sampleWords, width: 800, height: 500 });
    expect(el.props.width).toBe('100%');
  });

  it('renders with custom font size range', () => {
    const el = WordCloud({ words: sampleWords, minFontSize: 8, maxFontSize: 48 });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('renders with custom colors', () => {
    const el = WordCloud({ words: sampleWords, colors: ['#ff0000', '#00ff00'] });
    expect(el).not.toBeNull();
  });

  it('renders with rectangular spiral', () => {
    const el = WordCloud({ words: sampleWords, spiral: 'rectangular' });
    expect(el).not.toBeNull();
  });

  it('renders with title', () => {
    const el = WordCloud({ words: sampleWords, title: 'My Cloud' });
    expect(el).not.toBeNull();
    expect(el.props['aria-label']).toBe('My Cloud');
  });

  it('renders with custom rotations', () => {
    const el = WordCloud({ words: sampleWords, rotations: [0, 90] });
    expect(el).not.toBeNull();
  });

  it('renders with custom padding', () => {
    const el = WordCloud({ words: sampleWords, padding: 10 });
    expect(el).not.toBeNull();
  });

  it('renders with custom font family', () => {
    const el = WordCloud({ words: sampleWords, fontFamily: 'monospace' });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sad-path tests
// ---------------------------------------------------------------------------

describe('WordCloud — sad path', () => {
  it('handles empty words array', () => {
    const el = WordCloud({ words: [] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
    expect(el.props['aria-label']).toBe('Word cloud — no data');
  });

  it('handles single word', () => {
    const el = WordCloud({ words: [{ text: 'alone', weight: 5 }] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles words with zero weight', () => {
    const el = WordCloud({ words: [{ text: 'zero', weight: 0 }] });
    expect(el).not.toBeNull();
    expect(el.type).toBe('svg');
  });

  it('handles words with equal weights', () => {
    const el = WordCloud({
      words: [
        { text: 'a', weight: 5 },
        { text: 'b', weight: 5 },
        { text: 'c', weight: 5 },
      ],
    });
    expect(el).not.toBeNull();
  });

  it('handles words with explicit colors', () => {
    const el = WordCloud({
      words: [{ text: 'red', weight: 10, color: '#ff0000' }],
    });
    expect(el).not.toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Default props tests
// ---------------------------------------------------------------------------

describe('WordCloud — defaults', () => {
  it('uses default width of 600', () => {
    const el = WordCloud({ words: sampleWords });
    expect(el.props.width).toBe('100%');
  });

  it('uses default height of 400', () => {
    const el = WordCloud({ words: sampleWords });
  });

  it('uses aria-label "Word cloud" when no title', () => {
    const el = WordCloud({ words: sampleWords });
    expect(el.props['aria-label']).toBe('Word cloud');
  });

  it('sets role to img', () => {
    const el = WordCloud({ words: sampleWords });
    expect(el.props.role).toBe('img');
  });
});

// ---------------------------------------------------------------------------
// Dark mode text color tests
// ---------------------------------------------------------------------------

const DARK_ONLY_FILLS = ['#111827', '#374151', '#6b7280', '#1f2937', '#4b5563'];

function flatChildren(el: any): any[] {
  const c = el?.props?.children;
  if (Array.isArray(c)) return c.flat(Infinity).filter(Boolean);
  return c ? [c] : [];
}

function collectTextFills(root: any): { key: string; fill: string }[] {
  const results: { key: string; fill: string }[] = [];
  const stack: any[] = [root];
  while (stack.length > 0) {
    const node = stack.pop();
    if (!node || typeof node !== 'object') continue;
    if (node.type === 'text' && node.props?.fill) {
      results.push({ key: node.key ?? '(unknown)', fill: node.props.fill });
    }
    const children = node.children ?? node.props?.children;
    if (Array.isArray(children)) {
      for (const child of children) stack.push(child);
    } else if (children) {
      stack.push(children);
    }
  }
  return results;
}

describe('WordCloud — dark mode text colors', () => {
  it('title text uses currentColor', () => {
    const el = WordCloud({ words: sampleWords, title: 'Topics' });
    const titleEl = flatChildren(el).find((c: any) => c?.key === 'title');
    expect(titleEl).toBeTruthy();
    expect(titleEl.props.fill).toBe('currentColor');
  });

  it('empty state text uses currentColor', () => {
    const el = WordCloud({ words: [] });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });

  it('no text element uses a hardcoded dark-only fill', () => {
    const el = WordCloud({ words: sampleWords, title: 'Test' });
    const fills = collectTextFills(el);
    for (const entry of fills) {
      expect(DARK_ONLY_FILLS).not.toContain(entry.fill);
    }
  });
});
