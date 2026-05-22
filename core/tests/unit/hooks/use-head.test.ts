import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createElement } from '../../../src/index';
import { createRoot } from '../../../src/dom/create-root';
import { useHead } from '../../../src/hooks/use-head';

let container: HTMLDivElement;

beforeEach(() => {
  container = document.createElement('div');
  document.body.appendChild(container);
  // Clean up any meta tags from previous tests
  document.querySelectorAll('meta[name="description"]').forEach((el) => el.remove());
  document.querySelectorAll('meta[name="keywords"]').forEach((el) => el.remove());
  document.querySelectorAll('meta[name="author"]').forEach((el) => el.remove());
  document.querySelectorAll('meta[property^="og:"]').forEach((el) => el.remove());
  document.querySelectorAll('meta[name^="twitter:"]').forEach((el) => el.remove());
  document.querySelectorAll('link[rel="canonical"]').forEach((el) => el.remove());
  return () => {
    document.body.removeChild(container);
  };
});

describe('useHead', () => {
  it('sets document title', () => {
    const origTitle = document.title;
    function Comp() {
      useHead({ title: 'Test Title' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(document.title).toBe('Test Title');
    root.unmount();
    // Title should be restored on unmount
    expect(document.title).toBe(origTitle);
  });

  it('sets meta description', () => {
    function Comp() {
      useHead({ description: 'Test description' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector('meta[name="description"]') as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe('Test description');
    root.unmount();
  });

  it('sets meta keywords', () => {
    function Comp() {
      useHead({ keywords: 'test, keywords' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector('meta[name="keywords"]') as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe('test, keywords');
    root.unmount();
  });

  it('sets meta author', () => {
    function Comp() {
      useHead({ author: 'Test Author' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector('meta[name="author"]') as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe('Test Author');
    root.unmount();
  });

  it('sets canonical link', () => {
    function Comp() {
      useHead({ canonical: 'https://example.com/page' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const link = document.querySelector('link[rel="canonical"]') as HTMLLinkElement;
    expect(link).toBeTruthy();
    expect(link.href).toBe('https://example.com/page');
    root.unmount();
    expect(document.querySelector('link[rel="canonical"]')).toBeNull();
  });

  it('sets Open Graph tags', () => {
    function Comp() {
      useHead({ og: { title: 'OG Title', description: 'OG Desc' } });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const ogTitle = document.querySelector('meta[property="og:title"]') as HTMLMetaElement;
    const ogDesc = document.querySelector('meta[property="og:description"]') as HTMLMetaElement;
    expect(ogTitle?.content).toBe('OG Title');
    expect(ogDesc?.content).toBe('OG Desc');
    root.unmount();
  });

  it('sets Twitter Card tags', () => {
    function Comp() {
      useHead({ twitter: { card: 'summary', title: 'TW Title' } });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const card = document.querySelector('meta[name="twitter:card"]') as HTMLMetaElement;
    expect(card?.content).toBe('summary');
    root.unmount();
  });

  it('sets arbitrary meta tags', () => {
    function Comp() {
      useHead({
        meta: [
          { name: 'robots', content: 'noindex' },
          { property: 'article:author', content: 'Author Name' },
        ],
      });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect((document.querySelector('meta[name="robots"]') as HTMLMetaElement)?.content).toBe(
      'noindex',
    );
    expect(
      (document.querySelector('meta[property="article:author"]') as HTMLMetaElement)?.content,
    ).toBe('Author Name');
    root.unmount();
  });

  it('cleans up meta tags on unmount', () => {
    function Comp() {
      useHead({ description: 'Will be removed', keywords: 'removed' });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(document.querySelector('meta[name="description"]')).toBeTruthy();
    root.unmount();
    // Tags created by useHead should be removed
    expect(document.querySelector('meta[name="description"]')).toBeNull();
    expect(document.querySelector('meta[name="keywords"]')).toBeNull();
  });

  it('handles empty head object', () => {
    function Comp() {
      useHead({});
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    expect(() => root.render(createElement(Comp, null))).not.toThrow();
    root.unmount();
  });

  it('sets Content-Security-Policy via httpEquiv.csp', () => {
    function Comp() {
      useHead({
        httpEquiv: {
          csp: "default-src 'self'; script-src 'self'",
        },
      });
      return createElement('div', null, 'secure');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector(
      'meta[http-equiv="Content-Security-Policy"]',
    ) as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe("default-src 'self'; script-src 'self'");
    root.unmount();
  });

  it('sets Referrer-Policy via httpEquiv.referrer', () => {
    function Comp() {
      useHead({ httpEquiv: { referrer: 'no-referrer' } });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector('meta[http-equiv="Referrer-Policy"]') as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe('no-referrer');
    root.unmount();
  });

  it('sets arbitrary http-equiv tags', () => {
    function Comp() {
      useHead({ httpEquiv: { 'X-Custom-Header': 'custom-value' } });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    const meta = document.querySelector('meta[http-equiv="X-Custom-Header"]') as HTMLMetaElement;
    expect(meta).toBeTruthy();
    expect(meta.content).toBe('custom-value');
    root.unmount();
  });

  it('cleans up http-equiv tags on unmount', () => {
    function Comp() {
      useHead({
        httpEquiv: { csp: "default-src 'self'" },
      });
      return createElement('div', null, 'content');
    }
    const root = createRoot(container);
    root.render(createElement(Comp, null));
    expect(document.querySelector('meta[http-equiv="Content-Security-Policy"]')).toBeTruthy();
    root.unmount();
    expect(document.querySelector('meta[http-equiv="Content-Security-Policy"]')).toBeNull();
  });
});
