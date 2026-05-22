// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { FormFieldWrapper, buildInputStyle } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('FormFieldWrapper', () => {
  // Happy paths
  describe('happy paths', () => {
    it('renders with defaults (no label, no help, no error)', () => {
      const el = render(
        createElement(FormFieldWrapper, null, createElement('input', { type: 'text' })),
      );
      expect(el.querySelector('.form-field')).toBeTruthy();
      expect(el.querySelector('label')).toBeFalsy();
      expect(el.querySelector('.form-field__help')).toBeFalsy();
      expect(el.querySelector('.form-field__error')).toBeFalsy();
    });

    it('displays label when provided', () => {
      const el = render(
        createElement(FormFieldWrapper, { label: 'Username' }, createElement('input', null)),
      );
      const label = el.querySelector('label');
      expect(label).toBeTruthy();
      expect(label!.textContent).toContain('Username');
    });

    it('displays helpText when provided', () => {
      const el = render(
        createElement(FormFieldWrapper, { helpText: 'Enter your name' }, createElement('input', null)),
      );
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('Enter your name');
    });

    it('displays error message when provided', () => {
      const el = render(
        createElement(FormFieldWrapper, { error: 'Required field' }, createElement('input', null)),
      );
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Required field');
      expect(error!.getAttribute('role')).toBe('alert');
    });

    it('shows required asterisk when required is true', () => {
      const el = render(
        createElement(FormFieldWrapper, { label: 'Email', required: true }, null),
      );
      const label = el.querySelector('label');
      expect(label!.textContent).toContain('*');
    });

    it('links label to input via htmlFor', () => {
      const el = render(
        createElement(FormFieldWrapper, { label: 'Name', htmlFor: 'name-input' }, null),
      );
      const label = el.querySelector('label');
      expect(label!.getAttribute('for')).toBe('name-input');
    });
  });

  // Sad paths
  describe('sad paths', () => {
    it('applies disabled opacity when disabled', () => {
      const el = render(
        createElement(FormFieldWrapper, { disabled: true }, createElement('input', null)),
      );
      const wrapper = el.querySelector('.form-field') as HTMLElement;
      expect(wrapper.style.opacity).toBe('0.6');
    });

    it('adds error class when error is present', () => {
      const el = render(
        createElement(FormFieldWrapper, { error: 'Bad input' }, null),
      );
      const wrapper = el.querySelector('.form-field');
      expect(wrapper!.className).toContain('form-field--error');
    });

    it('error takes precedence over helpText in display', () => {
      const el = render(
        createElement(FormFieldWrapper, { error: 'Error!', helpText: 'Help text' }, null),
      );
      expect(el.querySelector('.form-field__error')).toBeTruthy();
      expect(el.querySelector('.form-field__help')).toBeFalsy();
    });

    it('renders with no children gracefully', () => {
      const el = render(
        createElement(FormFieldWrapper, { label: 'Empty' }, null),
      );
      expect(el.querySelector('.form-field')).toBeTruthy();
    });
  });

  // buildInputStyle
  describe('buildInputStyle', () => {
    it('returns default styles for normal state', () => {
      const style = buildInputStyle({}, { focused: false, error: false });
      expect(style.border).toBe('1px solid #d1d5db');
      expect(style.borderRadius).toBe('6px');
    });

    it('applies focus border color', () => {
      const style = buildInputStyle({}, { focused: true, error: false });
      expect(style.border).toContain('#3b82f6');
    });

    it('applies error border color', () => {
      const style = buildInputStyle({}, { focused: false, error: true });
      expect(style.border).toContain('#ef4444');
    });

    it('accepts custom style overrides', () => {
      const style = buildInputStyle(
        { padding: '16px', borderRadius: '12px', custom: { letterSpacing: '1px' } },
        { focused: false, error: false },
      );
      expect(style.padding).toBe('16px');
      expect(style.borderRadius).toBe('12px');
      expect(style.letterSpacing).toBe('1px');
    });
  });
});
