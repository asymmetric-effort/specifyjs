// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * AdSense — Google AdSense advertisement component.
 * Injects the AdSense script and renders an ad unit, or shows a
 * placeholder in test mode.
 */

import { createElement } from 'specifyjs';
import { useEffect, useRef } from 'specifyjs/hooks';

export interface AdSenseProps {
  /** Google AdSense client ID (e.g., 'ca-pub-1234567890') */
  client: string;
  /** Ad slot ID */
  slot: string;
  /** Ad format: 'auto', 'rectangle', 'horizontal', 'vertical' */
  format?: 'auto' | 'rectangle' | 'horizontal' | 'vertical';
  /** Responsive sizing */
  responsive?: boolean;
  /** Custom width */
  width?: number;
  /** Custom height */
  height?: number;
  /** CSS className */
  className?: string;
  /** Test mode (shows placeholder instead of real ads) */
  testMode?: boolean;
}

const ADSENSE_SCRIPT_URL =
  'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';

/**
 * Inject the AdSense loader script into `<head>` once per client ID.
 */
function ensureScript(client: string): void {
  const existing = document.querySelector(
    `script[src="${ADSENSE_SCRIPT_URL}"][data-ad-client="${client}"]`,
  );
  if (existing) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = ADSENSE_SCRIPT_URL;
  script.setAttribute('data-ad-client', client);
  document.head.appendChild(script);
}

export function AdSense(props: AdSenseProps) {
  const {
    client,
    slot,
    format = 'auto',
    responsive = false,
    width,
    height,
    className,
    testMode = false,
  } = props;

  const pushedRef = useRef(false);

  // Inject script & initialise the ad unit (production only)
  useEffect(() => {
    if (testMode) return;

    ensureScript(client);

    // Push to adsbygoogle to request an ad fill for this slot
    const adsbygoogle: unknown[] =
      ((window as Record<string, unknown>).adsbygoogle as unknown[]) || [];
    (window as Record<string, unknown>).adsbygoogle = adsbygoogle;
    adsbygoogle.push({});
    pushedRef.current = true;

    return () => {
      pushedRef.current = false;
    };
  }, [client, slot, testMode]);

  // ── Test mode placeholder ──────────────────────────────────────────
  if (testMode) {
    const placeholderStyle: Record<string, string> = {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f0f0f0',
      border: '2px dashed #ccc',
      color: '#666',
      fontFamily: 'monospace',
      fontSize: '14px',
      width: width ? `${width}px` : '100%',
      height: height ? `${height}px` : '100px',
      boxSizing: 'border-box',
    };

    return createElement(
      'div',
      {
        className,
        style: placeholderStyle,
        'data-testid': 'adsense-placeholder',
      },
      `Ad: ${slot}`,
    );
  }

  // ── Production ad unit ─────────────────────────────────────────────
  const insStyle: Record<string, string> = {
    display: 'block',
  };
  if (width) insStyle.width = `${width}px`;
  if (height) insStyle.height = `${height}px`;

  return createElement('ins', {
    className: className
      ? `adsbygoogle ${className}`
      : 'adsbygoogle',
    style: insStyle,
    'data-ad-client': client,
    'data-ad-slot': slot,
    'data-ad-format': format,
    ...(responsive
      ? { 'data-full-width-responsive': 'true' }
      : {}),
  });
}
