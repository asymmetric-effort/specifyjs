// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * GoogleAnalytics — Invisible component that injects the Google Analytics
 * (gtag.js) script and configures it with a site-specific measurement ID.
 *
 * Renders nothing to the DOM. Place it once at the top of your app.
 *
 * Usage:
 *   createElement(GoogleAnalytics, { measurementId: 'G-XXXXXXXXXX' })
 */

import { createElement } from 'specifyjs';
import { useEffect } from 'specifyjs/hooks';

export interface GoogleAnalyticsProps {
  /** Google Analytics measurement ID (e.g., 'G-XXXXXXXXXX') */
  measurementId: string;
  /** Disable tracking (useful for development/testing) */
  disabled?: boolean;
  /** Enable debug mode (logs events to console) */
  debug?: boolean;
  /** Anonymize IP addresses */
  anonymizeIp?: boolean;
  /** Custom config parameters passed to gtag('config', ...) */
  config?: Record<string, unknown>;
}

declare const window: Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

/**
 * Inject the gtag.js script into the document head.
 * Only injects once even if multiple GoogleAnalytics components mount.
 */
function injectGtagScript(measurementId: string): void {
  if (typeof document === 'undefined') return;

  const scriptId = 'specifyjs-gtag';
  if (document.getElementById(scriptId)) return;

  const script = document.createElement('script');
  script.id = scriptId;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);
}

/**
 * Initialize the gtag dataLayer and define the gtag function.
 */
function initDataLayer(): void {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (!window.gtag) {
    window.gtag = function gtag() {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    };
    window.gtag('js', new Date());
  }
}

export function GoogleAnalytics(props: GoogleAnalyticsProps) {
  const { measurementId, disabled = false, debug = false, anonymizeIp = false, config } = props;

  useEffect(() => {
    if (disabled || typeof window === 'undefined') return;

    injectGtagScript(measurementId);
    initDataLayer();

    const gtagConfig: Record<string, unknown> = {
      ...config,
    };

    if (anonymizeIp) {
      gtagConfig.anonymize_ip = true;
    }

    if (debug) {
      gtagConfig.debug_mode = true;
    }

    if (window.gtag) {
      window.gtag('config', measurementId, gtagConfig);
    }

    return () => {
      // Cleanup: remove the script tag on unmount
      const script = document.getElementById('specifyjs-gtag');
      if (script) script.remove();
    };
  }, [measurementId, disabled, debug, anonymizeIp]);

  // Renders nothing — this is a side-effect-only component
  return null;
}
