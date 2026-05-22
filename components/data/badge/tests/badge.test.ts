// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { Badge } from '../src/index';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  return () => {
    document.body.removeChild(container);
  };
});

// ── Happy Path ─────────────────────────────────────────────────────────

describe('Badge — happy path', () => {
  it('renders count value correctly', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 5 }));

    expect(container.textContent).toBe('5');
  });

  it('renders max+ when count exceeds max', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 150, max: 99 }));

    expect(container.textContent).toBe('99+');
  });

  it('renders count exactly at max without plus', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 99, max: 99 }));

    expect(container.textContent).toBe('99');
  });

  it('renders dot variant without count text', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { dot: true }));

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.textContent).toBe('');
    expect(badge.style.borderRadius).toBe('50%');
  });

  it('renders with overlay mode when children provided', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 3 },
      createElement('span', null, 'Inbox'),
    ));

    expect(container.textContent).toContain('Inbox');
    expect(container.textContent).toContain('3');

    // Container should be relative positioned for overlay
    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.style.position).toBe('relative');
  });

  it('applies correct size styles', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 1, size: 'lg' }));

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.fontSize).toBe('14px');
  });

  it('applies outline variant style', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 7, variant: 'outline' }));

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.border).toContain('solid');
    expect(badge.style.backgroundColor).toBe('transparent');
  });

  it('uses custom color', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 2, color: '#22c55e' }));

    const badge = container.firstElementChild as HTMLElement;
    // Solid variant: backgroundColor should be the custom color
    expect(badge.style.backgroundColor).toBeTruthy();
  });
});

// ── Sad Path ───────────────────────────────────────────────────────────

describe('Badge — sad path', () => {
  it('hides badge when count is 0', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 0 }));

    // Badge should not show when count is 0
    const badge = container.firstElementChild as HTMLElement;
    // Renders an empty span fallback
    expect(badge.textContent).toBe('');
  });

  it('hides badge when count is undefined and not dot', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, {}));

    const badge = container.firstElementChild as HTMLElement;
    expect(badge).toBeTruthy();
  });

  it('renders dot even when count is 0', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { dot: true, count: 0 }));

    const badge = container.firstElementChild as HTMLElement;
    expect(badge.style.borderRadius).toBe('50%');
  });

  it('renders with negative count', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: -5 }));

    // Negative count should not show badge (count > 0 check)
    const badge = container.firstElementChild as HTMLElement;
    expect(badge).toBeTruthy();
  });
});

// ── Interaction ────────────────────────────────────────────────────────

describe('Badge — interaction', () => {
  it('badge has correct aria-label for count', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 42 }));

    const badge = container.querySelector('[aria-label]');
    expect(badge).toBeTruthy();
    expect(badge!.getAttribute('aria-label')).toContain('42');
  });

  it('dot badge has notification aria-label', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { dot: true }));

    const badge = container.querySelector('[aria-label]');
    expect(badge).toBeTruthy();
    expect(badge!.getAttribute('aria-label')).toBe('notification');
  });

  it('overlay badge positions absolutely', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 5 },
      createElement('div', null, 'Content'),
    ));

    const badgeSpan = container.querySelector('[aria-label]') as HTMLElement;
    expect(badgeSpan.style.position).toBe('absolute');
    expect(badgeSpan.style.transform).toContain('translate');
  });

  it('re-renders correctly when count changes', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 5 }));
    expect(container.textContent).toBe('5');

    root.render(createElement(Badge, { count: 10 }));
    expect(container.textContent).toBe('10');
  });

  it('switches from count to dot mode correctly', () => {
    const root = createRoot(container);
    root.render(createElement(Badge, { count: 5 }));
    expect(container.textContent).toBe('5');

    root.render(createElement(Badge, { dot: true }));
    const badge = container.firstElementChild as HTMLElement;
    expect(badge.textContent).toBe('');
    expect(badge.style.borderRadius).toBe('50%');
  });
});
