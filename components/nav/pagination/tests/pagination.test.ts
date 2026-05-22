// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Pagination } from '../src/index';
import type { PaginationProps } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/index';

function renderToContainer(element: unknown): HTMLElement {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(element);
  return container;
}

function cleanup(container: HTMLElement) {
  document.body.removeChild(container);
}

// -- Happy path tests -------------------------------------------------------

describe('Pagination', () => {
  describe('happy path', () => {
    it('renders pagination navigation', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 100, pageSize: 10, currentPage: 1, onChange: vi.fn() }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      expect(nav!.getAttribute('aria-label')).toBe('Pagination');
      cleanup(container);
    });

    it('renders correct number of page buttons', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 1, onChange: vi.fn() }),
      );
      // 5 pages + first/last + prev/next = many buttons
      const buttons = container.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThanOrEqual(5);
      cleanup(container);
    });

    it('marks current page as active', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 3, onChange: vi.fn() }),
      );
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeTruthy();
      expect(current!.textContent).toBe('3');
      cleanup(container);
    });

    it('shows First and Last buttons by default', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 100, pageSize: 10, currentPage: 5, onChange: vi.fn() }),
      );
      const firstBtn = container.querySelector('[aria-label="Go to first page"]');
      const lastBtn = container.querySelector('[aria-label="Go to last page"]');
      expect(firstBtn).toBeTruthy();
      expect(lastBtn).toBeTruthy();
      cleanup(container);
    });

    it('shows Prev and Next buttons by default', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 100, pageSize: 10, currentPage: 5, onChange: vi.fn() }),
      );
      const prevBtn = container.querySelector('[aria-label="Go to previous page"]');
      const nextBtn = container.querySelector('[aria-label="Go to next page"]');
      expect(prevBtn).toBeTruthy();
      expect(nextBtn).toBeTruthy();
      cleanup(container);
    });

    it('shows ellipsis for large page counts', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 200, pageSize: 10, currentPage: 10, onChange: vi.fn() }),
      );
      expect(container.textContent).toContain('...');
      cleanup(container);
    });
  });

  // -- Sad path tests ---------------------------------------------------------

  describe('sad path', () => {
    it('handles zero total items', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 0, pageSize: 10, currentPage: 1, onChange: vi.fn() }),
      );
      const nav = container.querySelector('[role="navigation"]');
      expect(nav).toBeTruthy();
      cleanup(container);
    });

    it('renders disabled state', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 1, disabled: true, onChange }),
      );
      const buttons = container.querySelectorAll('button');
      buttons.forEach((btn) => {
        btn.click();
      });
      expect(onChange).not.toHaveBeenCalled();
      cleanup(container);
    });

    it('clamps currentPage to valid range', () => {
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 999, onChange: vi.fn() }),
      );
      // Should not crash; should show last page as active
      const current = container.querySelector('[aria-current="page"]');
      expect(current).toBeTruthy();
      expect(current!.textContent).toBe('5');
      cleanup(container);
    });

    it('handles missing showFirstLast', () => {
      const container = renderToContainer(
        createElement(Pagination, {
          total: 50, pageSize: 10, currentPage: 1, onChange: vi.fn(),
          showFirstLast: false,
        }),
      );
      const firstBtn = container.querySelector('[aria-label="Go to first page"]');
      expect(firstBtn).toBeNull();
      cleanup(container);
    });
  });

  // -- Interaction tests ------------------------------------------------------

  describe('interaction', () => {
    it('calls onChange when a page button is clicked', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 1, onChange }),
      );
      const page2 = container.querySelector('[aria-label="Page 2"]') as HTMLElement;
      page2.click();
      expect(onChange).toHaveBeenCalledWith(2);
      cleanup(container);
    });

    it('calls onChange with next page on Next click', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 3, onChange }),
      );
      const nextBtn = container.querySelector('[aria-label="Go to next page"]') as HTMLElement;
      nextBtn.click();
      expect(onChange).toHaveBeenCalledWith(4);
      cleanup(container);
    });

    it('calls onChange with previous page on Prev click', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 3, onChange }),
      );
      const prevBtn = container.querySelector('[aria-label="Go to previous page"]') as HTMLElement;
      prevBtn.click();
      expect(onChange).toHaveBeenCalledWith(2);
      cleanup(container);
    });

    it('calls onChange with 1 on First click', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 5, onChange }),
      );
      const firstBtn = container.querySelector('[aria-label="Go to first page"]') as HTMLElement;
      firstBtn.click();
      expect(onChange).toHaveBeenCalledWith(1);
      cleanup(container);
    });

    it('does not call onChange on current page click', () => {
      const onChange = vi.fn();
      const container = renderToContainer(
        createElement(Pagination, { total: 50, pageSize: 10, currentPage: 3, onChange }),
      );
      const current = container.querySelector('[aria-current="page"]') as HTMLElement;
      current.click();
      expect(onChange).not.toHaveBeenCalled();
      cleanup(container);
    });
  });
});
