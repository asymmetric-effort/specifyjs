// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GoogleAnalytics } from '../src/index';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';

function render(vnode: unknown): { container: HTMLElement; root: ReturnType<typeof createRoot> } {
  const container = document.createElement('div');
  const root = createRoot(container);
  root.render(vnode as ReturnType<typeof createElement>);
  return { container, root };
}

describe('GoogleAnalytics', () => {
  beforeEach(() => {
    // Clean up any injected scripts and globals
    const script = document.getElementById('specifyjs-gtag');
    if (script) script.remove();
    delete (window as Record<string, unknown>).dataLayer;
    delete (window as Record<string, unknown>).gtag;
  });

  afterEach(() => {
    const script = document.getElementById('specifyjs-gtag');
    if (script) script.remove();
    delete (window as Record<string, unknown>).dataLayer;
    delete (window as Record<string, unknown>).gtag;
  });

  describe('rendering', () => {
    it('renders nothing to the DOM', () => {
      const { container } = render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      expect(container.innerHTML).toBe('');
    });

    it('renders nothing when disabled', () => {
      const { container } = render(
        createElement(GoogleAnalytics, { measurementId: 'G-TEST123', disabled: true }),
      );
      expect(container.innerHTML).toBe('');
    });
  });

  describe('script injection', () => {
    it('injects gtag script into document head', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      const script = document.getElementById('specifyjs-gtag') as HTMLScriptElement;
      expect(script).toBeTruthy();
      expect(script.async).toBe(true);
      expect(script.src).toContain('googletagmanager.com/gtag/js');
      expect(script.src).toContain('G-TEST123');
    });

    it('does not inject script when disabled', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123', disabled: true }));
      const script = document.getElementById('specifyjs-gtag');
      expect(script).toBeNull();
    });

    it('injects script only once for multiple instances', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      const scripts = document.querySelectorAll('#specifyjs-gtag');
      expect(scripts.length).toBe(1);
    });

    it('removes script on unmount', () => {
      const { root } = render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      expect(document.getElementById('specifyjs-gtag')).toBeTruthy();
      root.unmount();
      expect(document.getElementById('specifyjs-gtag')).toBeNull();
    });
  });

  describe('dataLayer', () => {
    it('initializes window.dataLayer', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      expect((window as Record<string, unknown>).dataLayer).toBeTruthy();
      expect(Array.isArray((window as Record<string, unknown>).dataLayer)).toBe(true);
    });

    it('initializes window.gtag function', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      expect(typeof (window as Record<string, unknown>).gtag).toBe('function');
    });

    it('does not initialize dataLayer when disabled', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123', disabled: true }));
      expect((window as Record<string, unknown>).dataLayer).toBeUndefined();
    });

    it('pushes config to dataLayer', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-TEST123' }));
      const dataLayer = (window as Record<string, unknown>).dataLayer as unknown[];
      // dataLayer should have at least 2 entries: js date + config
      expect(dataLayer.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('configuration', () => {
    it('passes anonymize_ip when anonymizeIp is true', () => {
      render(
        createElement(GoogleAnalytics, { measurementId: 'G-TEST123', anonymizeIp: true }),
      );
      const dataLayer = (window as Record<string, unknown>).dataLayer as unknown[];
      const configCall = dataLayer.find(
        (entry) =>
          entry &&
          typeof entry === 'object' &&
          Object.values(entry as Record<string, unknown>).includes('config'),
      );
      expect(configCall).toBeTruthy();
    });

    it('passes debug_mode when debug is true', () => {
      render(
        createElement(GoogleAnalytics, { measurementId: 'G-TEST123', debug: true }),
      );
      const dataLayer = (window as Record<string, unknown>).dataLayer as unknown[];
      expect(dataLayer.length).toBeGreaterThanOrEqual(2);
    });

    it('passes custom config parameters', () => {
      render(
        createElement(GoogleAnalytics, {
          measurementId: 'G-TEST123',
          config: { send_page_view: false, cookie_domain: 'example.com' },
        }),
      );
      const dataLayer = (window as Record<string, unknown>).dataLayer as unknown[];
      expect(dataLayer.length).toBeGreaterThanOrEqual(2);
    });

    it('encodes measurement ID in script URL', () => {
      render(createElement(GoogleAnalytics, { measurementId: 'G-AB&CD' }));
      const script = document.getElementById('specifyjs-gtag') as HTMLScriptElement;
      expect(script.src).toContain('G-AB%26CD');
    });
  });
});
