// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { MultilineField } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('MultilineField', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(MultilineField, null));
      const textarea = el.querySelector('textarea');
      expect(textarea).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(MultilineField, { value: 'multi\nline' }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('multi\nline');
    });

    it('fires onChange on input', () => {
      const handler = vi.fn();
      const el = render(createElement(MultilineField, { value: '', onChange: handler }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'updated';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalledWith('updated');
    });

    it('displays label', () => {
      const el = render(createElement(MultilineField, { label: 'Description' }));
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Description');
    });

    it('displays error message', () => {
      const el = render(createElement(MultilineField, { error: 'Too short' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Too short');
    });

    it('displays help text', () => {
      const el = render(createElement(MultilineField, { helpText: 'Max 500 chars' }));
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('Max 500 chars');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(MultilineField, { disabled: true }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.disabled).toBe(true);
    });

    it('renders with empty value', () => {
      const el = render(createElement(MultilineField, { value: '' }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('');
    });

    it('sets aria-invalid when error is present', () => {
      const el = render(createElement(MultilineField, { error: 'Invalid' }));
      const textarea = el.querySelector('textarea');
      expect(textarea!.getAttribute('aria-invalid')).toBe('true');
    });

    it('renders without onChange gracefully', () => {
      const el = render(createElement(MultilineField, { value: 'read only text' }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.value).toBe('read only text');
    });
  });

  describe('interaction', () => {
    it('typing updates via onChange', () => {
      const handler = vi.fn();
      const el = render(createElement(MultilineField, { value: '', onChange: handler }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      textarea.value = 'new content';
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalledWith('new content');
    });

    it('fires onBlur when textarea loses focus', () => {
      const handler = vi.fn();
      const el = render(createElement(MultilineField, { value: 'val', onBlur: handler }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      textarea.dispatchEvent(new Event('blur', { bubbles: true }));
      expect(handler).toHaveBeenCalled();
    });

    it('renders with specified rows', () => {
      const el = render(createElement(MultilineField, { rows: 8 }));
      const textarea = el.querySelector('textarea') as HTMLTextAreaElement;
      expect(textarea.getAttribute('rows')).toBe('8');
    });
  });
});
