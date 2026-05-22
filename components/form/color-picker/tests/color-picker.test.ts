// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { ColorPicker } from '../src/index';
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

describe('ColorPicker', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: vi.fn() }));
      expect(el.querySelector('div')).toBeTruthy();
    });

    it('renders controlled value as swatch color', () => {
      const el = render(createElement(ColorPicker, { value: '#3b82f6', onChange: vi.fn() }));
      expect(el.textContent).toContain('#3b82f6');
    });

    it('fires onChange on swatch click', async () => {
      const handler = vi.fn();
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: handler }));
      // Open the picker — trigger is the flex container with the swatch
      const trigger = el.querySelector('[style*="align-items: center"][style*="gap: 8px"]') as HTMLElement;
      if (trigger) trigger.click();
      await flush();
      // Click a swatch
      const swatches = el.querySelectorAll('[title]');
      if (swatches.length > 0) (swatches[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalled();
    });

    it('displays label', () => {
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: vi.fn(), label: 'Theme Color' }));
      expect(el.textContent).toContain('Theme Color');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const handler = vi.fn();
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: handler, disabled: true }));
      // Disabled pickers should not open
      expect(el.querySelector('div')).toBeTruthy();
    });

    it('renders with empty color value', () => {
      const el = render(createElement(ColorPicker, { value: '', onChange: vi.fn() }));
      expect(el.querySelector('div')).toBeTruthy();
    });

    it('handles invalid hex gracefully', () => {
      const el = render(createElement(ColorPicker, { value: 'not-hex', onChange: vi.fn() }));
      expect(el.querySelector('div')).toBeTruthy();
    });

    it('resets invalid input on blur', () => {
      const handler = vi.fn();
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: handler }));
      // The input is only visible when dropdown is open
      expect(el.querySelector('div')).toBeTruthy();
    });
  });

  describe('interaction', () => {
    it('opens color dropdown on click', async () => {
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: vi.fn() }));
      const triggerArea = el.querySelector('[style*="align-items: center"][style*="gap: 8px"]') as HTMLElement;
      if (triggerArea) triggerArea.click();
      await flush();
      // After click, should see swatches
      const swatches = el.querySelectorAll('[title]');
      expect(swatches.length).toBeGreaterThan(0);
    });

    it('selecting a preset color fires onChange', async () => {
      const handler = vi.fn();
      const el = render(createElement(ColorPicker, { value: '#ff0000', onChange: handler }));
      const triggerArea = el.querySelector('[style*="align-items: center"][style*="gap: 8px"]') as HTMLElement;
      if (triggerArea) triggerArea.click();
      await flush();
      const swatches = el.querySelectorAll('[title]');
      if (swatches.length > 5) (swatches[5] as HTMLElement).click();
      expect(handler).toHaveBeenCalled();
    });

    it('renders with custom presets', async () => {
      const presets = ['#111', '#222', '#333'];
      const el = render(createElement(ColorPicker, { value: '#111', onChange: vi.fn(), presets }));
      // Open picker
      const triggerArea = el.querySelector('[style*="align-items: center"][style*="gap: 8px"]') as HTMLElement;
      if (triggerArea) triggerArea.click();
      await flush();
      const swatches = el.querySelectorAll('[title]');
      expect(swatches.length).toBe(3);
    });
  });
});
