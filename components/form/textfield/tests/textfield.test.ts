// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { TextField } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('TextField', () => {
  // Happy paths
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(TextField, null));
      const input = el.querySelector('input');
      expect(input).toBeTruthy();
      expect(input!.type).toBe('text');
    });

    it('renders controlled value', () => {
      const el = render(createElement(TextField, { value: 'hello' }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('hello');
    });

    it('fires onChange on input', () => {
      const handler = vi.fn();
      const el = render(createElement(TextField, { value: '', onChange: handler }));
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'test';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalledWith('test');
    });

    it('displays label', () => {
      const el = render(createElement(TextField, { label: 'Name' }));
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Name');
    });

    it('displays error message', () => {
      const el = render(createElement(TextField, { error: 'Required' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Required');
    });

    it('displays help text', () => {
      const el = render(createElement(TextField, { helpText: 'Enter value' }));
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('Enter value');
    });

    it('renders with placeholder', () => {
      const el = render(createElement(TextField, { placeholder: 'Type here...' }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.placeholder).toBe('Type here...');
    });
  });

  // Sad paths
  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(TextField, { disabled: true }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.disabled).toBe(true);
    });

    it('renders with empty value', () => {
      const el = render(createElement(TextField, { value: '' }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('');
    });

    it('sets aria-invalid when error is present', () => {
      const el = render(createElement(TextField, { error: 'Bad' }));
      const input = el.querySelector('input');
      expect(input!.getAttribute('aria-invalid')).toBe('true');
    });

    it('renders without onChange gracefully', () => {
      const el = render(createElement(TextField, { value: 'static' }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.value).toBe('static');
    });
  });

  // Interaction
  describe('interaction', () => {
    it('typing updates via onChange', () => {
      const handler = vi.fn();
      const el = render(createElement(TextField, { value: '', onChange: handler }));
      const input = el.querySelector('input') as HTMLInputElement;
      input.value = 'abc';
      input.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalledWith('abc');
    });

    it('fires onEnter on Enter key', () => {
      const handler = vi.fn();
      const el = render(createElement(TextField, { value: 'test', onEnter: handler }));
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      expect(handler).toHaveBeenCalled();
    });

    it('fires onBlur when input loses focus', () => {
      const handler = vi.fn();
      const el = render(createElement(TextField, { value: 'val', onBlur: handler }));
      const input = el.querySelector('input') as HTMLInputElement;
      input.dispatchEvent(new Event('blur', { bubbles: true }));
      expect(handler).toHaveBeenCalled();
    });

    it('supports password type', () => {
      const el = render(createElement(TextField, { type: 'password' }));
      const input = el.querySelector('input') as HTMLInputElement;
      expect(input.type).toBe('password');
    });
  });
});
