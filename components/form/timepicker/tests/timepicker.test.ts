// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi } from 'vitest';
import { TimePicker } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import * as hooks from '../../../../core/src/hooks/index';

function render(vnode: unknown): HTMLElement {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return container;
}

describe('TimePicker', () => {
  describe('happy paths', () => {
    it('renders with defaults', () => {
      const el = render(createElement(TimePicker, { value: '12:00', onChange: vi.fn() }));
      const inputs = el.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('renders controlled value', () => {
      const el = render(createElement(TimePicker, { value: '14:30', onChange: vi.fn() }));
      const inputs = el.querySelectorAll('input');
      // Hour and minute inputs
      expect((inputs[0] as HTMLInputElement).value).toBe('14');
      expect((inputs[1] as HTMLInputElement).value).toBe('30');
    });

    it('fires onChange on hour change', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:00', onChange: handler }));
      // Click hour increment button
      const buttons = el.querySelectorAll('button');
      if (buttons[0]) (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('11:00');
    });

    it('displays label', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), label: 'Start Time' }));
      expect(el.textContent).toContain('Start Time');
    });

    it('displays error message', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), error: 'Invalid time' }));
      const error = el.querySelector('.form-field__error');
      expect(error).toBeTruthy();
      expect(error!.textContent).toBe('Invalid time');
    });
  });

  describe('sad paths', () => {
    it('applies disabled state', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), disabled: true }));
      const inputs = el.querySelectorAll('input');
      inputs.forEach((input) => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    it('renders with empty value gracefully', () => {
      const el = render(createElement(TimePicker, { value: '', onChange: vi.fn() }));
      const inputs = el.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('handles invalid time string', () => {
      const el = render(createElement(TimePicker, { value: 'not:time', onChange: vi.fn() }));
      const inputs = el.querySelectorAll('input');
      expect(inputs.length).toBeGreaterThanOrEqual(2);
    });

    it('disables buttons when disabled', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:00', onChange: handler, disabled: true }));
      const buttons = el.querySelectorAll('button');
      buttons.forEach((btn) => {
        expect((btn as HTMLButtonElement).disabled).toBe(true);
      });
    });
  });

  describe('interaction', () => {
    it('increment hour button updates time', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '09:30', onChange: handler }));
      const buttons = el.querySelectorAll('button');
      // First button should be hour increment
      if (buttons[0]) (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('10:30');
    });

    it('decrement minute button updates time', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '09:30', onChange: handler }));
      const buttons = el.querySelectorAll('button');
      // Last button should be minute decrement
      const lastBtn = buttons[buttons.length - 1] as HTMLElement;
      if (lastBtn) lastBtn.click();
      expect(handler).toHaveBeenCalledWith('09:29');
    });

    it('shows AM/PM toggle in 12h format', () => {
      const el = render(createElement(TimePicker, { value: '14:00', onChange: vi.fn(), format: '12h' }));
      expect(el.textContent).toContain('PM');
    });
  });

  describe('seconds support', () => {
    it('shows seconds spinner when showSeconds=true', () => {
      const el = render(createElement(TimePicker, { value: '10:30:45', onChange: vi.fn(), showSeconds: true }));
      const inputs = el.querySelectorAll('input');
      // Should have 3 inputs: hour, minute, second
      expect(inputs.length).toBe(3);
    });

    it('emits HH:MM:SS format when showSeconds=true', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:30:45', onChange: handler, showSeconds: true }));
      const buttons = el.querySelectorAll('button');
      // Click hour increment (first button)
      if (buttons[0]) (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('11:30:45');
    });

    it('increment second button works', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:30:20', onChange: handler, showSeconds: true }));
      const buttons = el.querySelectorAll('button');
      // Buttons order: hour-up, hour-down, minute-up, minute-down, second-up, second-down
      // Second increment is buttons[4]
      if (buttons[4]) (buttons[4] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('10:30:21');
    });

    it('decrement second button works', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:30:20', onChange: handler, showSeconds: true }));
      const buttons = el.querySelectorAll('button');
      // Second decrement is buttons[5]
      if (buttons[5]) (buttons[5] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('10:30:19');
    });

    it('second input has aria-label Second', () => {
      const el = render(createElement(TimePicker, { value: '10:30:45', onChange: vi.fn(), showSeconds: true }));
      const inputs = el.querySelectorAll('input');
      const secondInput = inputs[2] as HTMLInputElement;
      expect(secondInput.getAttribute('aria-label')).toBe('Second');
    });

    it('preserves seconds when changing hour', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:30:55', onChange: handler, showSeconds: true }));
      const buttons = el.querySelectorAll('button');
      // Click hour increment
      if (buttons[0]) (buttons[0] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('11:30:55');
    });

    it('preserves seconds when changing minute', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, { value: '10:30:55', onChange: handler, showSeconds: true }));
      const buttons = el.querySelectorAll('button');
      // Click minute increment (buttons[2])
      if (buttons[2]) (buttons[2] as HTMLElement).click();
      expect(handler).toHaveBeenCalledWith('10:31:55');
    });
  });

  describe('timezone label', () => {
    it('displays timezone label when timezone is provided without showTimezone', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), timezone: 'America/New_York' }));
      expect(el.textContent).toContain('America/New_York');
    });

    it('does not show timezone label when timezone is not provided', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn() }));
      expect(el.textContent).not.toContain('UTC');
      expect(el.textContent).not.toContain('America');
    });
  });

  describe('timezone selector', () => {
    it('shows timezone dropdown when showTimezone=true', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), showTimezone: true }));
      const select = el.querySelector('select');
      expect(select).toBeTruthy();
    });

    it('populates dropdown with default timezones', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), showTimezone: true }));
      const options = el.querySelectorAll('option');
      expect(options.length).toBe(8);
      expect((options[0] as HTMLOptionElement).value).toBe('UTC');
      expect((options[1] as HTMLOptionElement).value).toBe('America/New_York');
    });

    it('populates dropdown with custom timezones array', () => {
      const customTzs = ['US/Eastern', 'US/Central', 'US/Pacific'];
      const el = render(createElement(TimePicker, {
        value: '10:00',
        onChange: vi.fn(),
        showTimezone: true,
        timezones: customTzs,
      }));
      const options = el.querySelectorAll('option');
      expect(options.length).toBe(3);
      expect((options[0] as HTMLOptionElement).value).toBe('US/Eastern');
      expect((options[1] as HTMLOptionElement).value).toBe('US/Central');
      expect((options[2] as HTMLOptionElement).value).toBe('US/Pacific');
    });

    it('calls onTimezoneChange when timezone is selected', () => {
      const tzHandler = vi.fn();
      const el = render(createElement(TimePicker, {
        value: '10:00',
        onChange: vi.fn(),
        showTimezone: true,
        onTimezoneChange: tzHandler,
      }));
      const select = el.querySelector('select') as HTMLSelectElement;
      expect(select).toBeTruthy();
      // Simulate a change event
      select.value = 'America/Chicago';
      const event = new Event('change', { bubbles: true });
      select.dispatchEvent(event);
      expect(tzHandler).toHaveBeenCalledWith('America/Chicago');
    });

    it('dropdown has aria-label Timezone', () => {
      const el = render(createElement(TimePicker, { value: '10:00', onChange: vi.fn(), showTimezone: true }));
      const select = el.querySelector('select') as HTMLSelectElement;
      expect(select.getAttribute('aria-label')).toBe('Timezone');
    });

    it('dropdown is disabled when component is disabled', () => {
      const el = render(createElement(TimePicker, {
        value: '10:00',
        onChange: vi.fn(),
        showTimezone: true,
        disabled: true,
      }));
      const select = el.querySelector('select') as HTMLSelectElement;
      expect(select.disabled).toBe(true);
    });
  });

  describe('AM/PM with seconds', () => {
    it('AM/PM toggle preserves seconds', () => {
      const handler = vi.fn();
      const el = render(createElement(TimePicker, {
        value: '10:30:45',
        onChange: handler,
        format: '12h',
        showSeconds: true,
      }));
      // Find the AM/PM toggle button
      const buttons = el.querySelectorAll('button');
      const ampmBtn = Array.from(buttons).find(
        (b) => b.textContent === 'AM' || b.textContent === 'PM',
      ) as HTMLElement;
      expect(ampmBtn).toBeTruthy();
      ampmBtn.click();
      // 10 AM -> 22 (PM), seconds preserved
      expect(handler).toHaveBeenCalledWith('22:30:45');
    });

    it('shows correct display for 12h format with seconds', () => {
      const el = render(createElement(TimePicker, {
        value: '14:30:15',
        onChange: vi.fn(),
        format: '12h',
        showSeconds: true,
      }));
      const inputs = el.querySelectorAll('input');
      // Hour should display as 02 (14 in 12h = 2 PM)
      expect((inputs[0] as HTMLInputElement).value).toBe('02');
      // Minute
      expect((inputs[1] as HTMLInputElement).value).toBe('30');
      // Second
      expect((inputs[2] as HTMLInputElement).value).toBe('15');
      // Should show PM
      expect(el.textContent).toContain('PM');
    });
  });
});
