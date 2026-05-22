// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Checkbox } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('Checkbox', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn() }));
      const checkbox = el.querySelector('[role="checkbox"]');
      expect(checkbox).toBeTruthy();
    });

    it('renders checked state', () => {
      const el = render(createElement(Checkbox, { checked: true, onChange: vi.fn() }));
      const checkbox = el.querySelector('[role="checkbox"]');
      expect(checkbox!.getAttribute('aria-checked')).toBe('true');
    });

    it('fires onChange on click', () => {
      const handler = vi.fn();
      const el = render(createElement(Checkbox, { checked: false, onChange: handler }));
      const checkbox = el.querySelector('[role="checkbox"]') as HTMLElement;
      checkbox.click();
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('displays label', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn(), label: 'Accept terms' }));
      expect(el.textContent).toContain('Accept terms');
    });

    it('displays error message', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn(), error: 'Must accept' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Must accept');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const handler = vi.fn();
      const el = render(createElement(Checkbox, { checked: false, onChange: handler, disabled: true }));
      const checkbox = el.querySelector('[role="checkbox"]') as HTMLElement;
      checkbox.click();
      expect(handler).not.toHaveBeenCalled();
    });

    it('renders unchecked by default', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn() }));
      const checkbox = el.querySelector('[role="checkbox"]');
      expect(checkbox!.getAttribute('aria-checked')).toBe('false');
    });

    it('shows indeterminate state', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn(), indeterminate: true }));
      const checkbox = el.querySelector('[role="checkbox"]');
      expect(checkbox!.getAttribute('aria-checked')).toBe('mixed');
    });

    it('sets aria-disabled when disabled', () => {
      const el = render(createElement(Checkbox, { checked: false, onChange: vi.fn(), disabled: true }));
      const checkbox = el.querySelector('[role="checkbox"]');
      expect(checkbox!.getAttribute('aria-disabled')).toBe('true');
    });
  });

  describe('interaction', () => {
    it('toggles checked state via click', () => {
      const handler = vi.fn();
      const el = render(createElement(Checkbox, { checked: true, onChange: handler }));
      const checkbox = el.querySelector('[role="checkbox"]') as HTMLElement;
      checkbox.click();
      expect(handler).toHaveBeenCalledWith(false);
    });

    it('responds to Space key', () => {
      const handler = vi.fn();
      const el = render(createElement(Checkbox, { checked: false, onChange: handler }));
      const checkbox = el.querySelector('[role="checkbox"]') as HTMLElement;
      checkbox.dispatchEvent(new KeyboardEvent('keydown', { key: ' ', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(true);
    });

    it('responds to Enter key', () => {
      const handler = vi.fn();
      const el = render(createElement(Checkbox, { checked: false, onChange: handler }));
      const checkbox = el.querySelector('[role="checkbox"]') as HTMLElement;
      checkbox.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(true);
    });
  });
});
