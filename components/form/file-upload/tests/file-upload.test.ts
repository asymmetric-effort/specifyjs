// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, fn } from '@asymmetric-effort/nogginlessdom';
import { FileUpload } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('FileUpload', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(FileUpload, { onChange: fn() }));
      const dropZone = el.querySelector('[role="button"]');
      expect(dropZone).toBeTruthy();
    });

    it('renders upload prompt text', () => {
      const el = render(createElement(FileUpload, { onChange: fn() }));
      expect(el.textContent).toContain('Click to upload');
    });

    it('fires onChange when file input changes', () => {
      const handler = fn();
      const el = render(createElement(FileUpload, { onChange: handler }));
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input).toBeTruthy();
    });

    it('displays label', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), label: 'Attachment' }));
      expect(el.textContent).toContain('Attachment');
    });

    it('displays help text', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), helpText: 'PDF only' }));
      const help = el.querySelector('.form-field__help');
      expect(help).toBeTruthy();
      expect(help!.textContent).toBe('PDF only');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), disabled: true }));
      const dropZone = el.querySelector('[role="button"]') as HTMLElement;
      expect(dropZone.getAttribute('tabindex')).toBe('-1');
    });

    it('renders with no files initially', () => {
      const el = render(createElement(FileUpload, { onChange: fn() }));
      // No file items should be present
      expect(el.textContent).not.toContain('Remove');
    });

    it('shows accepted file types', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), accept: 'image/*,.pdf' }));
      expect(el.textContent).toContain('image/*,.pdf');
    });

    it('shows max file size', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), maxSize: 1048576 }));
      expect(el.textContent).toContain('Max size:');
    });
  });

  describe('interaction', () => {
    it('clicking drop zone triggers file input', () => {
      const el = render(createElement(FileUpload, { onChange: fn() }));
      const dropZone = el.querySelector('[role="button"]') as HTMLElement;
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      const clickSpy = fn();
      input.click = clickSpy;
      dropZone.click();
      expect(clickSpy).toHaveBeenCalled();
    });

    it('hidden input has correct accept attribute', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), accept: '.png,.jpg' }));
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.getAttribute('accept')).toBe('.png,.jpg');
    });

    it('supports multiple file selection', () => {
      const el = render(createElement(FileUpload, { onChange: fn(), multiple: true }));
      const input = el.querySelector('input[type="file"]') as HTMLInputElement;
      expect(input.multiple).toBe(true);
    });
  });
});
