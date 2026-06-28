// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach, useFakeTimers, useRealTimers } from '@asymmetric-effort/nogginlessdom';
import { AnalogClock } from '../src/index';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function render(vnode: unknown): { container: HTMLElement; root: ReturnType<typeof createRoot> } {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return { container, root };
}

describe('AnalogClock', () => {
  describe('happy paths', () => {
    it('renders SVG element with default size (200)', () => {
      const { container } = render(createElement(AnalogClock, {}));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg!.getAttribute('width')).toBe('200');
      expect(svg!.getAttribute('height')).toBe('200');
      expect(svg!.getAttribute('viewBox')).toBe('0 0 200 200');
    });

    it('renders with custom size', () => {
      const { container } = render(createElement(AnalogClock, { size: 300 }));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg!.getAttribute('width')).toBe('300');
      expect(svg!.getAttribute('height')).toBe('300');
      expect(svg!.getAttribute('viewBox')).toBe('0 0 300 300');
    });

    it('shows 12 hour numbers in 12h format', () => {
      const { container } = render(createElement(AnalogClock, { format: '12h' }));
      const textElements = container.querySelectorAll('text');
      expect(textElements.length).toBe(12);
      // Should have numbers 1-12
      const numbers = Array.from(textElements).map(el => el.textContent);
      expect(numbers).toContain('12');
      expect(numbers).toContain('1');
      expect(numbers).toContain('6');
    });

    it('shows 24 hour numbers in 24h format', () => {
      const { container } = render(createElement(AnalogClock, { format: '24h' }));
      const textElements = container.querySelectorAll('text');
      expect(textElements.length).toBe(24);
      // Should have numbers 0-23
      const numbers = Array.from(textElements).map(el => el.textContent);
      expect(numbers).toContain('0');
      expect(numbers).toContain('12');
      expect(numbers).toContain('23');
    });

    it('shows second hand when showSeconds=true (default)', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 15), shouldAdvanceTime: true });
      const { container } = render(createElement(AnalogClock, {}));
      // Count line elements: 12 ticks + hour hand + minute hand + second hand = 15
      const lines = container.querySelectorAll('line');
      // 12 tick marks + 3 hands (hour, minute, second)
      expect(lines.length).toBe(15);
      vi.clearAllTimers();
      useRealTimers();
    });

    it('hides second hand when showSeconds=false', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 15), shouldAdvanceTime: true });
      const { container } = render(createElement(AnalogClock, { showSeconds: false }));
      const lines = container.querySelectorAll('line');
      // 12 tick marks + 2 hands (hour, minute) = 14
      expect(lines.length).toBe(14);
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date when showDate=true with short format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(AnalogClock, { showDate: true, dateFormat: 'short' }));
      expect(container.textContent).toContain('04/25/2026');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date when showDate=true with long format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(AnalogClock, { showDate: true, dateFormat: 'long' }));
      expect(container.textContent).toContain('April');
      expect(container.textContent).toContain('2026');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date when showDate=true with iso format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(AnalogClock, { showDate: true, dateFormat: 'iso' }));
      expect(container.textContent).toContain('2026-04-25');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('renders with custom className', () => {
      const { container } = render(createElement(AnalogClock, { className: 'my-analog-clock' }));
      const wrapper = container.firstElementChild as HTMLElement;
      expect(wrapper).toBeTruthy();
      expect(wrapper.className).toBe('my-analog-clock');
    });
  });

  describe('sad paths', () => {
    it('handles invalid timezone gracefully (throws RangeError)', () => {
      // Invalid timezone causes Intl.DateTimeFormat to throw RangeError
      expect(() => {
        render(createElement(AnalogClock, { timezone: 'Invalid/Timezone' }));
      }).toThrow(RangeError);
    });

    it('handles zero size', () => {
      const { container } = render(createElement(AnalogClock, { size: 0 }));
      const svg = container.querySelector('svg');
      expect(svg).toBeTruthy();
      expect(svg!.getAttribute('width')).toBe('0');
      expect(svg!.getAttribute('height')).toBe('0');
    });
  });

  describe('interaction', () => {
    it('sets up a 1-second interval for updates', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 0), shouldAdvanceTime: true });
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const { root } = render(createElement(AnalogClock, { showSeconds: true }));
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      setIntervalSpy.mockRestore();
      root.unmount();
      vi.clearAllTimers();
      useRealTimers();
    });

    it('cleans up interval on unmount', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 0), shouldAdvanceTime: true });
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      const { root } = render(createElement(AnalogClock, {}));
      root.unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
      vi.clearAllTimers();
      useRealTimers();
    });
  });
});
