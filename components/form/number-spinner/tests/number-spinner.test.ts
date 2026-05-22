// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { NumberSpinner } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('NumberSpinner', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(NumberSpinner, { value: 0, onChange: vi.fn() }));
      const spinbutton = el.querySelector('[role="spinbutton"]');
      expect(spinbutton).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(NumberSpinner, { value: 42, onChange: vi.fn() }));
      const input = el.querySelector('[role="spinbutton"]') as HTMLInputElement;
      expect(input.value).toBe('42');
    });

    it('fires onChange on increment click', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 5, onChange: handler, step: 1 }));
      const buttons = el.querySelectorAll('button');
      // Last button is increment (+)
      const incrementBtn = buttons[buttons.length - 1] as HTMLElement;
      incrementBtn.click();
      expect(handler).toHaveBeenCalledWith(6);
    });

    it('displays label', () => {
      const el = render(createElement(NumberSpinner, { value: 0, onChange: vi.fn(), label: 'Quantity' }));
      expect(el.textContent).toContain('Quantity');
    });

    it('displays error message', () => {
      const el = render(createElement(NumberSpinner, { value: 0, onChange: vi.fn(), error: 'Min is 1' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Min is 1');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 5, onChange: handler, disabled: true }));
      const input = el.querySelector('[role="spinbutton"]') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('clamps to min value', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 0, onChange: handler, min: 0, step: 1 }));
      const buttons = el.querySelectorAll('button');
      // First button is decrement
      (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith(0);
    });

    it('clamps to max value', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 10, onChange: handler, max: 10, step: 1 }));
      const buttons = el.querySelectorAll('button');
      const incrementBtn = buttons[buttons.length - 1] as HTMLElement;
      incrementBtn.click();
      expect(handler).toHaveBeenCalledWith(10);
    });

    it('sets aria-valuenow', () => {
      const el = render(createElement(NumberSpinner, { value: 7, onChange: vi.fn() }));
      const spinbutton = el.querySelector('[role="spinbutton"]');
      expect(spinbutton!.getAttribute('aria-valuenow')).toBe('7');
    });
  });

  describe('interaction', () => {
    it('decrement button decreases value', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 10, onChange: handler, step: 2 }));
      const buttons = el.querySelectorAll('button');
      (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith(8);
    });

    it('keyboard ArrowUp increments', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 5, onChange: handler, step: 1 }));
      const input = el.querySelector('[role="spinbutton"]') as HTMLElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(6);
    });

    it('keyboard ArrowDown decrements', () => {
      const handler = vi.fn();
      const el = render(createElement(NumberSpinner, { value: 5, onChange: handler, step: 1 }));
      const input = el.querySelector('[role="spinbutton"]') as HTMLElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(4);
    });
  });
});
