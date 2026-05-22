import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { createElement } from '../../../../core/src/index';
import { createRoot } from '../../../../core/src/dom/create-root';
import { AdSense } from '../src/AdSense';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
});

afterEach(() => {
  document.body.removeChild(container);
  // Clean up any injected AdSense scripts
  document
    .querySelectorAll('script[src*="adsbygoogle"]')
    .forEach((s) => s.remove());
  // Reset adsbygoogle global
  delete (window as Record<string, unknown>).adsbygoogle;
});

describe('AdSense', () => {
  // ── Test mode ──────────────────────────────────────────────────────

  it('renders in test mode with placeholder', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-111', slot: '222', testMode: true }),
    );
    const placeholder = container.querySelector('[data-testid="adsense-placeholder"]');
    expect(placeholder).not.toBeNull();
  });

  it('shows slot ID in test mode', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-111', slot: '9876', testMode: true }),
    );
    expect(container.textContent).toContain('Ad: 9876');
  });

  it('does not inject script in test mode', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-111', slot: '222', testMode: true }),
    );
    const scripts = document.querySelectorAll('script[src*="adsbygoogle"]');
    expect(scripts.length).toBe(0);
  });

  it('applies className in test mode', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        testMode: true,
        className: 'my-ad',
      }),
    );
    const placeholder = container.querySelector('.my-ad');
    expect(placeholder).not.toBeNull();
  });

  it('applies custom width/height in test mode', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        testMode: true,
        width: 300,
        height: 250,
      }),
    );
    const placeholder = container.querySelector(
      '[data-testid="adsense-placeholder"]',
    ) as HTMLElement;
    expect(placeholder).not.toBeNull();
    expect(placeholder.style.width).toBe('300px');
    expect(placeholder.style.height).toBe('250px');
  });

  // ── Production mode (ins element) ─────────────────────────────────

  it('renders ins element with correct data attributes', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-abc', slot: '123' }),
    );
    const ins = container.querySelector('ins.adsbygoogle');
    expect(ins).not.toBeNull();
  });

  it('sets data-ad-client correctly', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-xyz', slot: '456' }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-ad-client')).toBe('ca-pub-xyz');
  });

  it('sets data-ad-slot correctly', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-xyz', slot: '789' }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-ad-slot')).toBe('789');
  });

  it('sets data-ad-format default to auto', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-111', slot: '222' }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-ad-format')).toBe('auto');
  });

  it('sets data-full-width-responsive when responsive=true', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        responsive: true,
      }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-full-width-responsive')).toBe('true');
  });

  it('does not set data-full-width-responsive when responsive is false/omitted', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-111', slot: '222' }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-full-width-responsive')).toBeNull();
  });

  it('applies custom width/height styles on ins element', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        width: 728,
        height: 90,
      }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.style.width).toBe('728px');
    expect(ins.style.height).toBe('90px');
  });

  it('applies className to ins element', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        className: 'banner-ad',
      }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.className).toContain('adsbygoogle');
    expect(ins.className).toContain('banner-ad');
  });

  it('handles missing optional props with defaults', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, { client: 'ca-pub-min', slot: '999' }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins).not.toBeNull();
    expect(ins.getAttribute('data-ad-format')).toBe('auto');
    expect(ins.getAttribute('data-full-width-responsive')).toBeNull();
    expect(ins.style.display).toBe('block');
  });

  it('sets non-default format correctly', () => {
    const root = createRoot(container);
    root.render(
      createElement(AdSense, {
        client: 'ca-pub-111',
        slot: '222',
        format: 'rectangle',
      }),
    );
    const ins = container.querySelector('ins') as HTMLElement;
    expect(ins.getAttribute('data-ad-format')).toBe('rectangle');
  });
});
