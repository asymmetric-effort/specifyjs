// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from '@asymmetric-effort/nogginlessdom';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';
import { Card } from '../src/Card';
import type { ProjectCard } from '../src/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeCard(overrides: Partial<ProjectCard> = {}): ProjectCard {
  return {
    id: 'card-1',
    title: 'Test Card',
    description: 'Test description',
    color: '#fef9c3',
    position: { x: 100, y: 100 },
    size: { width: 180, height: 120 },
    priority: 'medium',
    createdAt: 1000,
    updatedAt: 1000,
    ...overrides,
  };
}

function renderCard(card: ProjectCard, overrides: Record<string, unknown> = {}): HTMLElement {
  const noop = () => {};
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  root.render(createElement(Card, {
    card,
    selected: false,
    onSelect: noop,
    onMove: noop,
    onResize: noop,
    onDelete: noop,
    onDoubleClick: noop,
    ...overrides,
  }) as ReturnType<typeof createElement>);
  return container;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Card', () => {
  it('should render with card title', () => {
    const container = renderCard(makeCard());
    expect(container.textContent).toContain('Test Card');
  });

  it('should render with card description', () => {
    const container = renderCard(makeCard());
    expect(container.textContent).toContain('Test description');
  });

  it('should render with the card background color', () => {
    const container = renderCard(makeCard({ color: '#bbf7d0' }));
    expect(container.innerHTML).toContain('#bbf7d0');
  });

  it('should render with low priority border color', () => {
    const container = renderCard(makeCard({ priority: 'low' }));
    expect(container.innerHTML).toContain('#22c55e');
  });

  it('should render with medium priority border color', () => {
    const container = renderCard(makeCard({ priority: 'medium' }));
    expect(container.innerHTML).toContain('#f59e0b');
  });

  it('should render with high priority border color', () => {
    const container = renderCard(makeCard({ priority: 'high' }));
    expect(container.innerHTML).toContain('#f97316');
  });

  it('should render with critical priority border color', () => {
    const container = renderCard(makeCard({ priority: 'critical' }));
    expect(container.innerHTML).toContain('#ef4444');
  });

  it('should render with transparent border when no priority', () => {
    const container = renderCard(makeCard({ priority: undefined }));
    expect(container.innerHTML).toContain('transparent');
  });

  it('should position card using card position values', () => {
    const container = renderCard(makeCard({ position: { x: 250, y: 350 } }));
    expect(container.innerHTML).toContain('250px');
    expect(container.innerHTML).toContain('350px');
  });

  it('should apply card dimensions as width and height', () => {
    const container = renderCard(makeCard({ size: { width: 200, height: 150 } }));
    expect(container.innerHTML).toContain('200px');
    expect(container.innerHTML).toContain('150px');
  });

  it('should render blue outline when selected', () => {
    const container = renderCard(makeCard(), { selected: true });
    expect(container.innerHTML).toContain('#3b82f6');
  });

  it('should render delete button element', () => {
    const container = renderCard(makeCard());
    const deleteBtn = container.querySelector('[data-testid="card-delete-card-1"]');
    expect(deleteBtn).not.toBeNull();
  });

  it('should render resize handle', () => {
    const container = renderCard(makeCard());
    expect(container.innerHTML).toContain('nwse-resize');
  });

  it('should render card data-testid', () => {
    const container = renderCard(makeCard());
    const cardEl = container.querySelector('[data-testid="card-card-1"]');
    expect(cardEl).not.toBeNull();
  });

  it('should render aria-label with card title', () => {
    const container = renderCard(makeCard({ title: 'My Task' }));
    expect(container.innerHTML).toContain('Card: My Task');
  });

  it('should render tags when provided', () => {
    const container = renderCard(makeCard({ tags: ['frontend', 'urgent'] }));
    expect(container.textContent).toContain('frontend');
    expect(container.textContent).toContain('urgent');
  });

  it('should render "Untitled" when title is empty', () => {
    const container = renderCard(makeCard({ title: '' }));
    expect(container.textContent).toContain('Untitled');
  });

  it('should not render tags section when tags are empty', () => {
    const container = renderCard(makeCard({ tags: [] }));
    expect(container.textContent).not.toContain('frontend');
  });

  it('should render with role button', () => {
    const container = renderCard(makeCard());
    const cardEl = container.querySelector('[role="button"]');
    expect(cardEl).not.toBeNull();
  });
});
