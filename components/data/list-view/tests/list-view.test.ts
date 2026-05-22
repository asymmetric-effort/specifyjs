// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { ListView } from '../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

const sampleItems = [
  { id: '1', name: 'Apple' },
  { id: '2', name: 'Banana' },
  { id: '3', name: 'Cherry' },
  { id: '4', name: 'Date' },
];

const renderItem = (item: unknown, _index: number) => {
  const i = item as { id: string; name: string };
  return createElement('span', null, i.name);
};

const keyExtractor = (item: unknown, _index: number) => {
  return (item as { id: string }).id;
};

// ── Happy Path ─────────────────────────────────────────────────────────

describe('ListView — happy path', () => {
  it('renders all items correctly', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
    }));

    const items = container.querySelectorAll('li');
    expect(items.length).toBe(4);
    expect(items[0]!.textContent).toBe('Apple');
    expect(items[1]!.textContent).toBe('Banana');
    expect(items[2]!.textContent).toBe('Cherry');
    expect(items[3]!.textContent).toBe('Date');
  });

  it('renders header and footer sections', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      header: 'Fruit List',
      footer: 'End of list',
    }));

    const text = container.textContent;
    expect(text).toContain('Fruit List');
    expect(text).toContain('End of list');
  });

  it('highlights selected item', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      selectedIndex: 1,
      onSelect: () => {},
    }));

    const items = container.querySelectorAll('li');
    const selectedBg = (items[1] as HTMLElement).style.backgroundColor;
    expect(selectedBg).toBeTruthy();
  });

  it('renders dividers between items when divider prop is true', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      divider: true,
    }));

    const items = container.querySelectorAll('li');
    // Non-last items should have border-bottom
    const firstItemStyle = (items[0] as HTMLElement).style.borderBottom;
    expect(firstItemStyle).toBeTruthy();
  });

  it('uses listbox role when onSelect is provided', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      onSelect: () => {},
    }));

    const list = container.querySelector('ul');
    expect(list!.getAttribute('role')).toBe('listbox');
  });
});

// ── Sad Path ───────────────────────────────────────────────────────────

describe('ListView — sad path', () => {
  it('shows empty message when items array is empty', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: [],
      renderItem,
      keyExtractor,
    }));

    expect(container.textContent).toContain('No items');
  });

  it('shows custom empty message', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: [],
      renderItem,
      keyExtractor,
      emptyMessage: 'Nothing to display',
    }));

    expect(container.textContent).toContain('Nothing to display');
  });

  it('renders header and footer even with empty items', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: [],
      renderItem,
      keyExtractor,
      header: 'Header',
      footer: 'Footer',
    }));

    const text = container.textContent;
    expect(text).toContain('Header');
    expect(text).toContain('Footer');
    expect(text).toContain('No items');
  });

  it('handles single item list correctly', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: [sampleItems[0]],
      renderItem,
      keyExtractor,
      divider: true,
    }));

    const items = container.querySelectorAll('li');
    expect(items.length).toBe(1);
  });
});

// ── Interaction ────────────────────────────────────────────────────────

describe('ListView — interaction', () => {
  it('fires onSelect when an item is clicked', () => {
    let selectedIdx = -1;
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      onSelect: (idx: number) => { selectedIdx = idx; },
    }));

    const items = container.querySelectorAll('li');
    items[2]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(selectedIdx).toBe(2);
  });

  it('clicking different items updates selection', () => {
    const selections: number[] = [];
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      onSelect: (idx: number) => { selections.push(idx); },
    }));

    const items = container.querySelectorAll('li');
    items[0]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    items[3]!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(selections).toEqual([0, 3]);
  });

  it('items have aria-selected attribute when onSelect is provided', () => {
    const root = createRoot(container);
    root.render(createElement(ListView, {
      items: sampleItems,
      renderItem,
      keyExtractor,
      selectedIndex: 0,
      onSelect: () => {},
    }));

    const items = container.querySelectorAll('li');
    expect(items[0]!.getAttribute('aria-selected')).toBe('true');
    expect(items[1]!.getAttribute('aria-selected')).toBe('false');
  });
});
