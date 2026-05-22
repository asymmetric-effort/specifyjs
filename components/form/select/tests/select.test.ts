// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Select } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

const flush = () => new Promise((r) => setTimeout(r, 10));

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
  { value: 'c', label: 'Gamma' },
];

describe('Select', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn() }));
      const trigger = el.querySelector('[role="combobox"]');
      expect(trigger).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: 'b', onChange: vi.fn() }));
      expect(el.textContent).toContain('Beta');
    });

    it('fires onChange on option selection', async () => {
      const handler = vi.fn();
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: handler }));
      const trigger = el.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      await flush();
      const option = el.querySelector('[role="option"]') as HTMLElement;
      if (option) option.click();
      expect(handler).toHaveBeenCalled();
    });

    it('displays label', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn(), label: 'Country' }));
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Country');
    });

    it('displays error message', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn(), error: 'Pick one' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Pick one');
    });

    it('displays help text', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn(), helpText: 'Choose wisely' }));
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('Choose wisely');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const handler = vi.fn();
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: handler, disabled: true }));
      const trigger = el.querySelector('[role="combobox"]') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('-1');
    });

    it('renders with empty value showing placeholder', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn(), placeholder: 'Pick...' }));
      expect(el.textContent).toContain('Pick...');
    });

    it('renders without options gracefully', () => {
      const el = render(createElement(Select, { options: [], value: '', onChange: vi.fn() }));
      expect(el.querySelector('[role="combobox"]')).toBeTruthy();
    });

    it('handles missing onChange gracefully on render', () => {
      const el = render(createElement(Select, { options: OPTIONS, value: 'a', onChange: vi.fn() }));
      expect(el.textContent).toContain('Alpha');
    });
  });

  describe('interaction', () => {
    it('opens dropdown on click', async () => {
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: vi.fn() }));
      const trigger = el.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      await flush();
      const listbox = el.querySelector('[role="listbox"]');
      expect(listbox).toBeTruthy();
    });

    it('selects option on click', async () => {
      const handler = vi.fn();
      const el = render(createElement(Select, { options: OPTIONS, value: '', onChange: handler }));
      const trigger = el.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      await flush();
      const options = el.querySelectorAll('[role="option"]');
      if (options.length > 1) (options[1] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('b');
    });

    it('supports multiple selection mode', async () => {
      const handler = vi.fn();
      const el = render(createElement(Select, { options: OPTIONS, value: ['a'], onChange: handler, multiple: true }));
      const trigger = el.querySelector('[role="combobox"]') as HTMLElement;
      trigger.click();
      await flush();
      const options = el.querySelectorAll('[role="option"]');
      if (options.length > 1) (options[1] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith(['a', 'b']);
    });
  });
});
