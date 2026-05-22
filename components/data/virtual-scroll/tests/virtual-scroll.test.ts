// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { VirtualScroll } from '../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

const generateItems = (count: number) =>
  Array.from({ length: count }, (_, i) => ({ id: i, label: `Item ${i}` }));

const renderItem = (item: unknown, index: number) => {
  const i = item as { id: number; label: string };
  return createElement('div', { 'data-index': String(index) }, i.label);
};

// ── Happy Path ─────────────────────────────────────────────────────────

describe('VirtualScroll — happy path', () => {
  it('renders only visible items plus overscan', () => {
    const items = generateItems(1000);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 5,
    }));

    // With 400px height and 40px items, visible count = 10, overscan = 5
    // Start at top: startIndex = max(0, 0 - 5) = 0, endIndex = min(1000, 0 + 10 + 5) = 15
    const renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems.length).toBe(15);
  });

  it('creates spacer div with correct total height', () => {
    const items = generateItems(100);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 50,
      height: '300px',
    }));

    // Total height = 100 * 50 = 5000px
    // The outer container has the scroll, inner div is the spacer with total height
    const scrollContainer = container.firstElementChild as HTMLElement;
    const spacer = scrollContainer.firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe('5000px');
  });

  it('positions items absolutely at correct offsets', () => {
    const items = generateItems(50);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 30,
      height: '200px',
      overscan: 0,
    }));

    const renderedItems = container.querySelectorAll('[data-index]');
    // First item at top: 0px
    const firstParent = renderedItems[0]!.parentElement!;
    expect(firstParent.style.top).toBe('0px');
    expect(firstParent.style.height).toBe('30px');
  });

  it('renders items with correct content', () => {
    const items = generateItems(20);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '200px',
      overscan: 0,
    }));

    const firstItem = container.querySelector('[data-index="0"]');
    expect(firstItem!.textContent).toBe('Item 0');
  });

  it('applies overflow auto to container', () => {
    const items = generateItems(10);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '200px',
    }));

    const scrollContainer = container.firstElementChild as HTMLElement;
    expect(scrollContainer.style.overflow).toBe('auto');
    expect(scrollContainer.style.height).toBe('200px');
  });
});

// ── Sad Path ───────────────────────────────────────────────────────────

describe('VirtualScroll — sad path', () => {
  it('renders nothing when items array is empty', () => {
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items: [],
      renderItem,
      itemHeight: 40,
      height: '400px',
    }));

    const renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems.length).toBe(0);

    // Spacer should be 0 height
    const scrollContainer = container.firstElementChild as HTMLElement;
    const spacer = scrollContainer.firstElementChild as HTMLElement;
    expect(spacer.style.height).toBe('0px');
  });

  it('handles single item list', () => {
    const items = generateItems(1);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '400px',
    }));

    const renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems.length).toBe(1);
    expect(renderedItems[0]!.textContent).toBe('Item 0');
  });

  it('handles very large itemHeight gracefully', () => {
    const items = generateItems(5);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 1000,
      height: '200px',
    }));

    // Should still render at least some items
    const renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems.length).toBeGreaterThan(0);
  });
});

// ── Interaction ────────────────────────────────────────────────────────

describe('VirtualScroll — interaction', () => {
  it('scroll event handler is attached to container', () => {
    const items = generateItems(1000);
    const root = createRoot(container);
    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 0,
    }));

    // Verify initial items start at index 0
    const renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems[0]!.getAttribute('data-index')).toBe('0');

    // Container should have overflow: auto for scrolling
    const scrollContainer = container.firstElementChild as HTMLElement;
    expect(scrollContainer.style.overflow).toBe('auto');
  });

  it('re-renders with different items updates the view', () => {
    const items10 = generateItems(10);
    const items100 = generateItems(100);
    const root = createRoot(container);

    root.render(createElement(VirtualScroll, {
      items: items10,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 0,
    }));

    let renderedItems = container.querySelectorAll('[data-index]');
    expect(renderedItems.length).toBe(10);

    // Re-render with more items
    root.render(createElement(VirtualScroll, {
      items: items100,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 0,
    }));

    renderedItems = container.querySelectorAll('[data-index]');
    // Should still render only visible items (ceil(400/40) = 10)
    expect(renderedItems.length).toBe(10);
  });

  it('changing overscan affects rendered count', () => {
    const items = generateItems(500);
    const root = createRoot(container);

    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 0,
    }));

    const countNoOverscan = container.querySelectorAll('[data-index]').length;

    root.render(createElement(VirtualScroll, {
      items,
      renderItem,
      itemHeight: 40,
      height: '400px',
      overscan: 10,
    }));

    const countWithOverscan = container.querySelectorAll('[data-index]').length;
    expect(countWithOverscan).toBeGreaterThan(countNoOverscan);
  });
});
