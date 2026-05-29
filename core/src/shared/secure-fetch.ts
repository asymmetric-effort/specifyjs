// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * Secure fetch wrapper — enforces HTTPS-only policy.
 *
 * SpecifyJS prohibits HTTP connections. All network requests must use
 * HTTPS or be relative URLs. This prevents data from being transmitted
 * in plaintext, protecting against eavesdropping and MITM attacks.
 *
 * Exceptions:
 * - Relative URLs (./path, /path) — resolved by the browser
 * - localhost and 127.0.0.1 — development only
 */

/**
 * Validate that a URL uses HTTPS or is a relative/localhost URL.
 * Throws if the URL uses plaintext HTTP.
 */
export function assertSecureUrl(url: string): void {
  // Block protocol-relative URLs (//evil.com) — they inherit the page's protocol
  if (url.startsWith('//')) {
    throw new Error(
      `[SpecifyJS] Protocol-relative URL rejected: "${url}". ` + `Use an explicit https:// prefix.`,
    );
  }

  // Relative URLs are always allowed
  if (url.startsWith('/') || url.startsWith('./') || url.startsWith('../')) {
    return;
  }

  // Data URIs: allow but limit size to prevent memory exhaustion
  if (url.startsWith('data:')) {
    if (url.length > 1024 * 1024) {
      throw new Error('[SpecifyJS] secureFetch: data: URI exceeds 1MB limit');
    }
    return;
  }

  // Parse absolute URLs — reject if unparseable
  let parsed: URL;
  try {
    parsed = new URL(url, typeof window !== 'undefined' ? window.location.href : undefined);
  } catch {
    throw new Error(
      `[SpecifyJS] secureFetch: unable to validate URL "${url}". ` +
        `Provide a valid absolute HTTPS URL or a relative path.`,
    );
  }

  // Allow HTTPS
  if (parsed.protocol === 'https:') {
    return;
  }

  // Allow localhost for development (any protocol) — covers IPv4/IPv6 loopback
  if (
    parsed.hostname === 'localhost' ||
    parsed.hostname === '127.0.0.1' ||
    parsed.hostname === '[::1]' ||
    parsed.hostname === '0.0.0.0' ||
    parsed.hostname.startsWith('127.')
  ) {
    return;
  }

  // Reject HTTP and other insecure protocols
  throw new Error(
    `[SpecifyJS] Insecure URL rejected: "${url}". ` +
      `SpecifyJS enforces HTTPS-only for all network requests. ` +
      `Use https:// or a relative URL. ` +
      `Localhost URLs are allowed for development.`,
  );
}

/**
 * Secure fetch — drop-in replacement for window.fetch that enforces HTTPS.
 * Use this instead of fetch() directly to comply with the HTTPS-only policy.
 */
export function secureFetch(input: string | URL | Request, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  assertSecureUrl(url);
  // Default to rejecting redirects to prevent redirect-based SSRF.
  // Callers can override with { redirect: 'follow' } if they trust the target.
  return fetch(input, { redirect: 'error', ...init });
}
