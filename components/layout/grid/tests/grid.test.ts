// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Grid, GridItem } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

function render(element: unknown) {
  const root = createRoot(container);
  root.render(element as any);
  return container;
}

describe('Grid', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(Grid, null));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.display).toBe('grid');
    });

    it('renders with numeric columns', () => {
      render(createElement(Grid, { columns: 3 }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateColumns).toBe('repeat(3, 1fr)');
    });

    it('renders with string columns', () => {
      render(createElement(Grid, { columns: '200px 1fr 1fr' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateColumns).toBe('200px 1fr 1fr');
    });

    it('renders with rows', () => {
      render(createElement(Grid, { rows: 'auto 1fr auto' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateRows).toBe('auto 1fr auto');
    });

    it('renders with gap', () => {
      render(createElement(Grid, { gap: '16px' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gap).toBe('16px');
    });

    it('renders with alignItems and justifyItems', () => {
      render(createElement(Grid, { alignItems: 'center', justifyItems: 'stretch' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.alignItems).toBe('center');
      expect(el.style.justifyItems).toBe('stretch');
    });

    it('renders with minColWidth (auto-fit)', () => {
      render(createElement(Grid, { minColWidth: '200px' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(200px, 1fr))');
    });

    it('renders with areas', () => {
      render(createElement(Grid, { areas: ['header header', 'nav main', 'footer footer'] }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateAreas).toContain('"header header"');
      expect(el.style.gridTemplateAreas).toContain('"nav main"');
    });

    it('renders with all props set', () => {
      render(createElement(Grid, {
        columns: 4,
        rows: '100px 1fr',
        gap: '8px',
        alignItems: 'start',
        justifyItems: 'end',
        className: 'my-grid',
        style: { border: '1px solid red' },
      }));
      const el = container.querySelector('.grid.my-grid') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.gridTemplateColumns).toBe('repeat(4, 1fr)');
      expect(el.style.border).toBe('1px solid red');
    });

    it('renders children inside', () => {
      render(createElement(Grid, { columns: 2 },
        createElement('div', { className: 'child-a' }, 'A'),
        createElement('div', { className: 'child-b' }, 'B'),
      ));
      expect(container.querySelector('.child-a')).toBeTruthy();
      expect(container.querySelector('.child-b')).toBeTruthy();
    });

    it('minColWidth takes priority over columns', () => {
      render(createElement(Grid, { columns: 3, minColWidth: '150px' }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateColumns).toBe('repeat(auto-fit, minmax(150px, 1fr))');
    });
  });

  describe('sad paths', () => {
    it('renders without crashing when no props given', () => {
      render(createElement(Grid, {}));
      expect(container.querySelector('.grid')).toBeTruthy();
    });

    it('renders with empty areas array', () => {
      render(createElement(Grid, { areas: [] }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.style.gridTemplateAreas).toBe('');
    });

    it('renders with no children', () => {
      render(createElement(Grid, { columns: 2 }));
      const el = container.querySelector('.grid') as HTMLElement;
      expect(el.children.length).toBe(0);
    });

    it('applies custom className alongside default', () => {
      render(createElement(Grid, { className: 'custom' }));
      const el = container.querySelector('.grid.custom') as HTMLElement;
      expect(el).toBeTruthy();
    });
  });
});

describe('GridItem', () => {
  describe('happy paths', () => {
    it('renders with default props', () => {
      render(createElement(GridItem, null));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el).toBeTruthy();
    });

    it('renders with gridColumn', () => {
      render(createElement(GridItem, { gridColumn: 'span 2' }));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el.style.gridColumn).toBe('span 2');
    });

    it('renders with gridRow', () => {
      render(createElement(GridItem, { gridRow: '1 / 3' }));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el.style.gridRow).toBe('1 / 3');
    });

    it('renders with gridArea', () => {
      render(createElement(GridItem, { gridArea: 'header' }));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el.style.gridArea).toBe('header');
    });

    it('renders with alignSelf and justifySelf', () => {
      render(createElement(GridItem, { alignSelf: 'end', justifySelf: 'center' }));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el.style.alignSelf).toBe('end');
      expect(el.style.justifySelf).toBe('center');
    });

    it('renders children inside', () => {
      render(createElement(GridItem, { gridColumn: '1 / -1' },
        createElement('span', null, 'content'),
      ));
      expect(container.querySelector('.grid-item span')).toBeTruthy();
    });

    it('renders with all props set', () => {
      render(createElement(GridItem, {
        gridColumn: '1 / 3',
        gridRow: '2 / 4',
        gridArea: 'main',
        alignSelf: 'stretch',
        justifySelf: 'start',
        className: 'custom-item',
        style: { backgroundColor: 'blue' },
      }));
      const el = container.querySelector('.grid-item.custom-item') as HTMLElement;
      expect(el).toBeTruthy();
      expect(el.style.backgroundColor).toBe('blue');
    });
  });

  describe('sad paths', () => {
    it('renders with empty props', () => {
      render(createElement(GridItem, {}));
      expect(container.querySelector('.grid-item')).toBeTruthy();
    });

    it('renders with no children', () => {
      render(createElement(GridItem, { gridColumn: 'span 2' }));
      const el = container.querySelector('.grid-item') as HTMLElement;
      expect(el.children.length).toBe(0);
    });
  });
});
