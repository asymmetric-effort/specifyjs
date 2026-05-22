// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Toggle } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('Toggle', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn() }));
      const toggle = el.querySelector('[role="switch"]');
      expect(toggle).toBeTruthy();
    });

    it('renders checked state', () => {
      const el = render(createElement(Toggle, { checked: true, onChange: vi.fn() }));
      const toggle = el.querySelector('[role="switch"]');
      expect(toggle!.getAttribute('aria-checked')).toBe('true');
    });

    it('fires onChange on click', () => {
      const handler = vi.fn();
      const el = render(createElement(Toggle, { checked: false, onChange: handler }));
      const toggle = el.querySelector('[role="switch"]') as HTMLElement;
      toggle.click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('displays label', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn(), label: 'Dark Mode' }));
      expect(el.textContent).toContain('Dark Mode');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const handler = vi.fn();
      const el = render(createElement(Toggle, { checked: false, onChange: handler, disabled: true }));
      const toggle = el.querySelector('[role="switch"]') as HTMLElement;
      toggle.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('renders unchecked by default', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn() }));
      const toggle = el.querySelector('[role="switch"]');
      expect(toggle!.getAttribute('aria-checked')).toBe('false');
    });

    it('renders without label gracefully', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn() }));
      expect(el.querySelector('[role="switch"]')).toBeTruthy();
    });

    it('sets aria-disabled when disabled', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn(), disabled: true }));
      const toggle = el.querySelector('[role="switch"]');
      expect(toggle!.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('interaction', () => {
    it('toggles off when clicked while checked', () => {
      const handler = vi.fn();
      const el = render(createElement(Toggle, { checked: true, onChange: handler }));
      const toggle = el.querySelector('[role="switch"]') as HTMLElement;
      toggle.click();
      expect(handler).toHaveBeenCalledWith(false);
    });

    it('responds to Space key', () => {
      const handler = vi.fn();
      const el = render(createElement(Toggle, { checked: false, onChange: handler }));
      const toggle = el.querySelector('[role="switch"]') as HTMLElement;
      toggle.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('supports different sizes', () => {
      const el = render(createElement(Toggle, { checked: false, onChange: vi.fn(), size: 'lg' }));
      const toggle = el.querySelector('[role="switch"]');
      expect(toggle).toBeTruthy();
    });
  });
});
