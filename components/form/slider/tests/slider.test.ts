// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { Slider } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('Slider', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(Slider, { value: 50, onChange: vi.fn() }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(Slider, { value: 75, onChange: vi.fn() }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider!.getAttribute('aria-valuenow')).toBe('75');
    });

    it('fires onChange on track click', () => {
      const handler = vi.fn();
      const el = render(createElement(Slider, { value: 50, onChange: handler, min: 0, max: 100 }));
      // The track div contains the slider - clicking it should fire onChange
      const track = el.querySelector('[role="slider"]')?.parentElement;
      if (track) track.click();
      expect(handler).toHaveBeenCalled();
    });

    it('displays label', () => {
      const el = render(createElement(Slider, { value: 50, onChange: vi.fn(), label: 'Volume' }));
      expect(el.textContent).toContain('Volume');
    });

    it('displays error message', () => {
      const el = render(createElement(Slider, { value: 50, onChange: vi.fn(), error: 'Out of range' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Out of range');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(Slider, { value: 50, onChange: vi.fn(), disabled: true }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider!.getAttribute('tabindex')).toBe('-1');
    });

    it('renders with min value', () => {
      const el = render(createElement(Slider, { value: 0, onChange: vi.fn(), min: 0, max: 100 }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider!.getAttribute('aria-valuenow')).toBe('0');
    });

    it('renders with max value', () => {
      const el = render(createElement(Slider, { value: 100, onChange: vi.fn(), min: 0, max: 100 }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider!.getAttribute('aria-valuenow')).toBe('100');
    });

    it('sets aria-valuemin and aria-valuemax', () => {
      const el = render(createElement(Slider, { value: 50, onChange: vi.fn(), min: 10, max: 90 }));
      const slider = el.querySelector('[role="slider"]');
      expect(slider!.getAttribute('aria-valuemin')).toBe('10');
      expect(slider!.getAttribute('aria-valuemax')).toBe('90');
    });
  });

  describe('interaction', () => {
    it('keyboard ArrowRight increments value', () => {
      const handler = vi.fn();
      const el = render(createElement(Slider, { value: 50, onChange: handler, step: 5 }));
      const slider = el.querySelector('[role="slider"]') as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(55);
    });

    it('keyboard ArrowLeft decrements value', () => {
      const handler = vi.fn();
      const el = render(createElement(Slider, { value: 50, onChange: handler, step: 5 }));
      const slider = el.querySelector('[role="slider"]') as HTMLElement;
      slider.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
      expect(handler).toHaveBeenCalledWith(45);
    });

    it('renders range mode with two thumbs', () => {
      const el = render(createElement(Slider, { value: [20, 80], onChange: vi.fn(), range: true }));
      const sliders = el.querySelectorAll('[role="slider"]');
      expect(sliders.length).toBe(2);
    });
  });
});
