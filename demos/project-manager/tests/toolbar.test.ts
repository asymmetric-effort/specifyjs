// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { BoardToolbar, CARD_COLORS } from '../src/Toolbar';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderToolbar(overrides: Record<string, unknown> = {}): HTMLElement {
  const noop = () => {};
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(createElement(BoardToolbar, {
    zoom: 1,
    gridEnabled: false,
    selectedColor: CARD_COLORS[0],
    onNewCard: noop,
    onZoomIn: noop,
    onZoomOut: noop,
    onZoomReset: noop,
    onColorSelect: noop,
    onGridToggle: noop,
    onSearch: noop,
    ...overrides,
  }) as ReturnType<typeof createElement>);
  return container;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('BoardToolbar', () => {
  it('should render the toolbar container', () => {
    const container = renderToolbar();
    const toolbar = container.querySelector('[data-testid="board-toolbar"]');
    expect(toolbar).not.toBeNull();
  });

  it('should render the New Card button', () => {
    const container = renderToolbar();
    const btn = container.querySelector('[data-testid="btn-new-card"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('New Card');
  });

  it('should render zoom controls', () => {
    const container = renderToolbar();
    expect(container.querySelector('[data-testid="btn-zoom-in"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="btn-zoom-out"]')).not.toBeNull();
    expect(container.querySelector('[data-testid="zoom-level"]')).not.toBeNull();
  });

  it('should display current zoom level as percentage', () => {
    const container = renderToolbar({ zoom: 1.5 });
    const zoomLevel = container.querySelector('[data-testid="zoom-level"]');
    expect(zoomLevel?.textContent).toContain('150%');
  });

  it('should display 100% at default zoom', () => {
    const container = renderToolbar({ zoom: 1 });
    const zoomLevel = container.querySelector('[data-testid="zoom-level"]');
    expect(zoomLevel?.textContent).toContain('100%');
  });

  it('should render color palette swatches', () => {
    const container = renderToolbar();
    for (const color of CARD_COLORS) {
      const swatch = container.querySelector(`[data-testid="color-swatch-${color}"]`);
      expect(swatch).not.toBeNull();
    }
  });

  it('should highlight selected color swatch with blue border', () => {
    const container = renderToolbar({ selectedColor: '#fecaca' });
    const swatch = container.querySelector('[data-testid="color-swatch-#fecaca"]');
    expect(swatch).not.toBeNull();
    // Selected swatch has a blue border
    const style = swatch?.getAttribute('style') || '';
    expect(style).toContain('#3b82f6');
  });

  it('should render grid toggle button', () => {
    const container = renderToolbar();
    const btn = container.querySelector('[data-testid="btn-grid-toggle"]');
    expect(btn).not.toBeNull();
    expect(btn?.textContent).toContain('Grid');
  });

  it('should show grid button as active when grid is enabled', () => {
    const container = renderToolbar({ gridEnabled: true });
    const btn = container.querySelector('[data-testid="btn-grid-toggle"]');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
  });

  it('should show grid button as inactive when grid is disabled', () => {
    const container = renderToolbar({ gridEnabled: false });
    const btn = container.querySelector('[data-testid="btn-grid-toggle"]');
    expect(btn?.getAttribute('aria-pressed')).toBe('false');
  });

  it('should render search input', () => {
    const container = renderToolbar();
    const input = container.querySelector('[data-testid="search-input"]');
    expect(input).not.toBeNull();
  });

  it('should render with toolbar role', () => {
    const container = renderToolbar();
    const toolbar = container.querySelector('[role="toolbar"]');
    expect(toolbar).not.toBeNull();
  });

  it('should export CARD_COLORS with 8 colors', () => {
    expect(CARD_COLORS).toHaveLength(8);
  });
});
