// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { TextEditor } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('TextEditor', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(TextEditor, null));
      const editor = el.querySelector('[contenteditable]');
      expect(editor).toBeTruthy();
    });

    it('renders toolbar buttons', () => {
      const el = render(createElement(TextEditor, null));
      const toolbar = el.querySelector('.texteditor-toolbar');
      expect(toolbar).toBeTruthy();
      const buttons = toolbar!.querySelectorAll('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('fires onChange on content input', () => {
      const handler = vi.fn();
      const el = render(createElement(TextEditor, { onChange: handler }));
      const editor = el.querySelector('[contenteditable]') as HTMLElement;
      editor.innerHTML = '<p>Hello</p>';
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      expect(handler).toHaveBeenCalled();
    });

    it('displays label', () => {
      const el = render(createElement(TextEditor, { label: 'Content' }));
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Content');
    });

    it('displays error message', () => {
      const el = render(createElement(TextEditor, { error: 'Content required' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Content required');
    });

    it('displays help text', () => {
      const el = render(createElement(TextEditor, { helpText: 'Format with toolbar' }));
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('Format with toolbar');
    });
  });

  describe('sad paths', () => {
    it('disables contentEditable when disabled', () => {
      const el = render(createElement(TextEditor, { disabled: true }));
      const editor = el.querySelector('[contenteditable]') as HTMLElement;
      expect(editor.getAttribute('contenteditable')).toBe('false');
    });

    it('renders with empty value', () => {
      const el = render(createElement(TextEditor, { value: '' }));
      const editor = el.querySelector('[contenteditable]');
      expect(editor).toBeTruthy();
    });

    it('renders without onChange gracefully', () => {
      const el = render(createElement(TextEditor, { value: '<p>Static</p>' }));
      const editor = el.querySelector('[contenteditable]');
      expect(editor).toBeTruthy();
    });

    it('disables toolbar buttons when disabled', () => {
      const el = render(createElement(TextEditor, { disabled: true }));
      const buttons = el.querySelectorAll('.texteditor-toolbar button');
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  describe('interaction', () => {
    it('fires onBlur when editor loses focus', () => {
      const handler = vi.fn();
      const el = render(createElement(TextEditor, { onBlur: handler }));
      const editor = el.querySelector('[contenteditable]') as HTMLElement;
      editor.dispatchEvent(new Event('blur', { bubbles: true }));
      expect(handler).toHaveBeenCalled();
    });

    it('renders with custom toolbar subset', () => {
      const el = render(createElement(TextEditor, { toolbar: ['bold', 'italic'] }));
      const buttons = el.querySelectorAll('.texteditor-toolbar button');
      expect(buttons.length).toBe(2);
    });

    it('applies custom minHeight', () => {
      const el = render(createElement(TextEditor, { minHeight: '400px' }));
      const editor = el.querySelector('[contenteditable]') as HTMLElement;
      expect(editor.style.minHeight).toBe('400px');
    });
  });
});
