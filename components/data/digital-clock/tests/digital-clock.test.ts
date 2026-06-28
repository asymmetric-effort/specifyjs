// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach, useFakeTimers, useRealTimers } from '@asymmetric-effort/nogginlessdom';
import { DigitalClock } from '../src/index';
import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function render(vnode: unknown): { container: HTMLElement; root: ReturnType<typeof createRoot> } {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as any);
  return { container, root };
}

describe('DigitalClock', () => {
  describe('happy paths', () => {
    it('renders with defaults (12h format, shows seconds)', () => {
      const { container } = render(createElement(DigitalClock, {}));
      const wrapper = container.querySelector('div');
      expect(wrapper).toBeTruthy();
      // Should have a time span
      const timeSpan = wrapper!.querySelector('span');
      expect(timeSpan).toBeTruthy();
      // Time text should contain colons (HH:MM:SS)
      const text = timeSpan!.textContent ?? '';
      // Should have seconds (two colons)
      expect((text.match(/:/g) || []).length).toBeGreaterThanOrEqual(2);
    });

    it('displays AM for morning hours', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 9, 30, 45), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { format: '12h' }));
      expect(container.textContent).toContain('AM');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('displays PM for afternoon hours', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 14, 30, 45), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { format: '12h' }));
      expect(container.textContent).toContain('PM');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows time in 24h format when format="24h"', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 14, 30, 45), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { format: '24h' }));
      // Should NOT have AM/PM
      expect(container.textContent).not.toContain('AM');
      expect(container.textContent).not.toContain('PM');
      // Should show 14:30
      expect(container.textContent).toContain('14:30');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date when showDate=true with short format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { showDate: true, dateFormat: 'short' }));
      // Short format: MM/DD/YYYY
      expect(container.textContent).toContain('04/25/2026');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date with long format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { showDate: true, dateFormat: 'long' }));
      expect(container.textContent).toContain('April');
      expect(container.textContent).toContain('2026');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('shows date with iso format', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 0, 0), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { showDate: true, dateFormat: 'iso' }));
      expect(container.textContent).toContain('2026-04-25');
      vi.clearAllTimers();
      useRealTimers();
    });

    it('hides seconds when showSeconds=false', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 45), shouldAdvanceTime: true });
      const { container } = render(createElement(DigitalClock, { showSeconds: false }));
      const timeSpan = container.querySelector('span');
      const text = timeSpan!.textContent ?? '';
      // Should only have one colon (HH:MM) without AM/PM span
      // Filter out the AM/PM child span text
      const timeOnly = text.replace(/[AP]M/, '').trim();
      expect((timeOnly.match(/:/g) || []).length).toBe(1);
      vi.clearAllTimers();
      useRealTimers();
    });

    it('renders with custom className', () => {
      const { container } = render(createElement(DigitalClock, { className: 'my-clock' }));
      const wrapper = container.querySelector('.my-clock');
      expect(wrapper).toBeTruthy();
    });
  });

  describe('sad paths', () => {
    it('handles invalid timezone gracefully (throws RangeError)', () => {
      // Invalid timezone causes Intl.DateTimeFormat to throw RangeError
      expect(() => {
        render(createElement(DigitalClock, { timezone: 'Invalid/Timezone' }));
      }).toThrow(RangeError);
    });

    it('handles missing props (renders with all defaults)', () => {
      const { container } = render(createElement(DigitalClock, {}));
      const wrapper = container.querySelector('div');
      expect(wrapper).toBeTruthy();
      // Should render time text
      expect(wrapper!.textContent!.length).toBeGreaterThan(0);
    });
  });

  describe('interaction', () => {
    it('sets up a 1-second interval for updates', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 0), shouldAdvanceTime: true });
      const setIntervalSpy = vi.spyOn(globalThis, 'setInterval');
      const { root } = render(createElement(DigitalClock, { format: '24h', showSeconds: true }));
      expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 1000);
      setIntervalSpy.mockRestore();
      root.unmount();
      vi.clearAllTimers();
      useRealTimers();
    });

    it('cleans up interval on unmount', () => {
      const clock = useFakeTimers({ now: new Date(2026, 3, 25, 10, 30, 0), shouldAdvanceTime: true });
      const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval');
      const { root } = render(createElement(DigitalClock, {}));
      root.unmount();
      expect(clearIntervalSpy).toHaveBeenCalled();
      clearIntervalSpy.mockRestore();
      vi.clearAllTimers();
      useRealTimers();
    });
  });
});
