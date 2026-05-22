// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { RadioGroup } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

const OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'green', label: 'Green' },
  { value: 'blue', label: 'Blue' },
];

describe('RadioGroup', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: vi.fn(), name: 'color' }));
      const group = el.querySelector('[role="radiogroup"]');
      expect(group).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'green', onChange: vi.fn(), name: 'color' }));
      const radios = el.querySelectorAll('input[type="radio"]');
      const checked = Array.from(radios).find((r) => (r as HTMLInputElement).checked);
      expect((checked as HTMLInputElement).value).toBe('green');
    });

    it('fires onChange on option click', () => {
      const handler = vi.fn();
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: handler, name: 'color' }));
      const labels = el.querySelectorAll('label');
      if (labels[1]) (labels[1] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('green');
    });

    it('displays label', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: vi.fn(), name: 'color', label: 'Favorite Color' }));
      expect(el.textContent).toContain('Favorite Color');
    });

    it('displays error message', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: '', onChange: vi.fn(), name: 'color', error: 'Select one' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Select one');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state to entire group', () => {
      const handler = vi.fn();
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: handler, name: 'color', disabled: true }));
      const group = el.querySelector('[role="radiogroup"]') as HTMLElement;
      expect(group.getAttribute('tabindex')).toBe('-1');
    });

    it('renders with empty value', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: '', onChange: vi.fn(), name: 'color' }));
      const radios = el.querySelectorAll('input[type="radio"]');
      const anyChecked = Array.from(radios).some((r) => (r as HTMLInputElement).checked);
      expect(anyChecked).toBe(false);
    });

    it('renders with empty options', () => {
      const el = render(createElement(RadioGroup, { options: [], value: '', onChange: vi.fn(), name: 'color' }));
      const group = el.querySelector('[role="radiogroup"]');
      expect(group).toBeTruthy();
    });

    it('disables individual option', () => {
      const opts = [
        { value: 'a', label: 'A' },
        { value: 'b', label: 'B', disabled: true },
      ];
      const el = render(createElement(RadioGroup, { options: opts, value: 'a', onChange: vi.fn(), name: 'test' }));
      const radios = el.querySelectorAll('input[type="radio"]');
      expect((radios[1] as HTMLInputElement).disabled).toBe(true);
    });
  });

  describe('interaction', () => {
    it('clicking option selects it', () => {
      const handler = vi.fn();
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: handler, name: 'color' }));
      const labels = el.querySelectorAll('label');
      if (labels[2]) (labels[2] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('blue');
    });

    it('supports horizontal direction', () => {
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: vi.fn(), name: 'color', direction: 'horizontal' }));
      const group = el.querySelector('[role="radiogroup"]') as HTMLElement;
      expect(group.style.flexDirection).toBe('row');
    });

    it('keyboard navigation with ArrowDown', () => {
      const handler = vi.fn();
      const el = render(createElement(RadioGroup, { options: OPTIONS, value: 'red', onChange: handler, name: 'color' }));
      const group = el.querySelector('[role="radiogroup"]') as HTMLElement;
      group.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
      expect(handler).toHaveBeenCalledWith('green');
    });
  });
});
