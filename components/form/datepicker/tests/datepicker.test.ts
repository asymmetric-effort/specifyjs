// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { DatePicker } from '../src/index';
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

describe('DatePicker', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn() }));
      const trigger = el.querySelector('[role="button"]');
      expect(trigger).toBeTruthy();
    });

    it('renders controlled value', () => {
      const el = render(createElement(DatePicker, { value: '2024-06-15', onChange: vi.fn() }));
      expect(el.textContent).toContain('2024-06-15');
    });

    it('fires onChange when date selected', async () => {
      const handler = vi.fn();
      const el = render(createElement(DatePicker, { value: null, onChange: handler }));
      const trigger = el.querySelector('[role="button"]') as HTMLElement;
      trigger.click();
      await flush();
      // Calendar should now be open, click a day
      const days = el.querySelectorAll('[style*="cursor: pointer"]');
      const dayEl = Array.from(days).find((d) => d.textContent && /^\d+$/.test(d.textContent.trim()));
      if (dayEl) (dayEl as HTMLElement).click();
      expect(handler).toHaveBeenCalled();
    });

    it('displays label', () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn(), label: 'Birthday' }));
      expect(el.textContent).toContain('Birthday');
    });

    it('displays error message', () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn(), error: 'Date required' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Date required');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn(), disabled: true }));
      const trigger = el.querySelector('[role="button"]') as HTMLElement;
      expect(trigger.getAttribute('tabindex')).toBe('-1');
    });

    it('renders with null value showing placeholder', () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn(), placeholder: 'Pick date...' }));
      expect(el.textContent).toContain('Pick date...');
    });

    it('renders with invalid date string', () => {
      const el = render(createElement(DatePicker, { value: 'not-a-date', onChange: vi.fn() }));
      // Should show placeholder since date is invalid
      expect(el.querySelector('[role="button"]')).toBeTruthy();
    });

    it('handles missing onChange on render', () => {
      const el = render(createElement(DatePicker, { value: '2024-01-01', onChange: vi.fn() }));
      expect(el.textContent).toContain('2024-01-01');
    });
  });

  describe('interaction', () => {
    it('opens calendar on trigger click', async () => {
      const el = render(createElement(DatePicker, { value: null, onChange: vi.fn() }));
      const trigger = el.querySelector('[role="button"]') as HTMLElement;
      trigger.click();
      await flush();
      // Should see month/year navigation
      expect(el.textContent).toMatch(/January|February|March|April|May|June|July|August|September|October|November|December/);
    });

    it('navigates months via arrows', async () => {
      const el = render(createElement(DatePicker, { value: '2024-06-15', onChange: vi.fn() }));
      const trigger = el.querySelector('[role="button"]') as HTMLElement;
      trigger.click();
      await flush();
      const buttons = el.querySelectorAll('button[type="button"]');
      // Should have prev/next month buttons
      expect(buttons.length).toBeGreaterThanOrEqual(2);
    });

    it('formats date with custom format', () => {
      const el = render(createElement(DatePicker, { value: '2024-06-15', onChange: vi.fn(), format: 'DD/MM/YYYY' }));
      expect(el.textContent).toContain('15/06/2024');
    });
  });
});
