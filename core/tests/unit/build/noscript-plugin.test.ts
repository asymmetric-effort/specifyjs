// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect } from 'vitest';
import {
  specifyJsNoscriptPlugin,
  generateNoscriptHtml,
  stripInteractiveElements,
} from '../../../src/build/noscript-plugin';

describe('specifyJsNoscriptPlugin', () => {
  it('creates a valid Vite plugin object', () => {
    const plugin = specifyJsNoscriptPlugin({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hello</p>' }],
    });
    expect(plugin.name).toBe('specifyjs-noscript');
    expect(typeof plugin.closeBundle).toBe('function');
  });

  it('accepts all configuration options', () => {
    const plugin = specifyJsNoscriptPlugin({
      title: 'My App',
      description: 'A great app',
      sections: [{ id: 'home', title: 'Home', html: '<p>Hello</p>' }],
      copyright: '© 2026',
      classPrefix: 'custom',
      maxContentSize: 1024 * 1024,
    });
    expect(plugin.name).toBe('specifyjs-noscript');
  });
});

describe('stripInteractiveElements', () => {
  it('removes button tags but keeps content', () => {
    expect(stripInteractiveElements('<button>Click me</button>')).toBe('Click me');
  });

  it('removes input elements', () => {
    expect(stripInteractiveElements('<input type="text"/>')).toBe('');
    expect(stripInteractiveElements('<input type="checkbox">')).toBe('');
  });

  it('removes select/option elements', () => {
    expect(stripInteractiveElements('<select><option>A</option><option>B</option></select>')).toBe(
      '',
    );
  });

  it('removes textarea elements', () => {
    expect(stripInteractiveElements('<textarea>text</textarea>')).toBe('');
  });

  it('removes form wrappers but keeps content', () => {
    expect(stripInteractiveElements('<form action="/"><p>Content</p></form>')).toBe(
      '<p>Content</p>',
    );
  });

  it('removes inline event handlers', () => {
    expect(stripInteractiveElements('<div onclick="alert(1)">text</div>')).toBe('<div>text</div>');
    expect(stripInteractiveElements("<div onchange='fn()'>text</div>")).toBe('<div>text</div>');
  });

  it('removes script tags', () => {
    expect(stripInteractiveElements('<script>alert(1)</script>')).toBe('');
  });

  it('preserves safe HTML elements', () => {
    const html = '<h1>Title</h1><p>Text</p><ul><li>Item</li></ul><a href="#">Link</a>';
    expect(stripInteractiveElements(html)).toBe(html);
  });

  it('handles nested interactive elements', () => {
    const html = '<div><button><span>Icon</span> Save</button><p>After</p></div>';
    const result = stripInteractiveElements(html);
    expect(result).toContain('Icon');
    expect(result).toContain('Save');
    expect(result).toContain('<p>After</p>');
    expect(result).not.toContain('<button');
  });

  it('removes style tags and content', () => {
    expect(stripInteractiveElements('<style>.foo { color: red }</style>')).toBe('');
  });

  it('removes iframe tags and content', () => {
    expect(stripInteractiveElements('<iframe src="evil.html">content</iframe>')).toBe('');
  });

  it('strips javascript: URIs from href', () => {
    const result = stripInteractiveElements('<a href="javascript:alert(1)">link</a>');
    expect(result).not.toContain('javascript');
    expect(result).toContain('link');
  });

  it('strips event handlers with various formats', () => {
    expect(stripInteractiveElements('<div onclick="x" onmouseover="y">t</div>')).toBe(
      '<div>t</div>',
    );
  });

  it('keeps allowed attributes', () => {
    const result = stripInteractiveElements('<a href="https://example.com" title="Ex">Go</a>');
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('title="Ex"');
  });

  it('handles self-closing tags', () => {
    expect(stripInteractiveElements('<br/>')).toBe('<br />');
    expect(stripInteractiveElements('<img src="x.png" alt="X"/>')).toContain('img');
  });

  it('handles unclosed tags', () => {
    const result = stripInteractiveElements('<p>text<br');
    expect(result).toContain('text');
  });

  it('handles empty string', () => {
    expect(stripInteractiveElements('')).toBe('');
  });

  it('handles text with no tags', () => {
    expect(stripInteractiveElements('plain text')).toBe('plain text');
  });

  it('escapes attribute values', () => {
    const result = stripInteractiveElements('<a href="x&y">link</a>');
    expect(result).toContain('&amp;');
  });
});

describe('generateNoscriptHtml', () => {
  it('returns empty string for no sections', () => {
    expect(generateNoscriptHtml({ sections: [] })).toBe('');
  });

  it('generates noscript block with sections', () => {
    const html = generateNoscriptHtml({
      sections: [
        { id: 'home', title: 'Home', html: '<p>Welcome</p>' },
        { id: 'about', title: 'About', html: '<p>About us</p>' },
      ],
    });
    expect(html).toContain('<noscript>');
    expect(html).toContain('</noscript>');
    expect(html).toContain('id="home"');
    expect(html).toContain('id="about"');
    expect(html).toContain('Welcome');
    expect(html).toContain('About us');
  });

  it('generates navigation links', () => {
    const html = generateNoscriptHtml({
      sections: [
        { id: 'sec1', title: 'First', html: '<p>1</p>' },
        { id: 'sec2', title: 'Second', html: '<p>2</p>' },
      ],
    });
    expect(html).toContain('href="#sec1"');
    expect(html).toContain('href="#sec2"');
    expect(html).toContain('First');
    expect(html).toContain('Second');
  });

  it('includes title and description', () => {
    const html = generateNoscriptHtml({
      title: 'My App',
      description: 'A great application',
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('My App');
    expect(html).toContain('A great application');
  });

  it('includes copyright footer', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
      copyright: '© 2026 Test Corp',
    });
    expect(html).toContain('2026 Test Corp');
  });

  it('generates back-to-top links', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('Back to top');
    expect(html).toContain('href="#ns-top"');
  });

  it('includes JS-disabled notice', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('works best with JavaScript enabled');
  });

  it('includes CSS styles', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('<style>');
    expect(html).toContain('.ns-container');
    expect(html).toContain('.ns-nav');
    expect(html).toContain('.ns-section');
  });

  it('supports custom class prefix', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
      classPrefix: 'fb',
    });
    expect(html).toContain('.fb-container');
    expect(html).toContain('.fb-nav');
    expect(html).toContain('href="#fb-top"');
  });

  it('escapes HTML in title and description', () => {
    const html = generateNoscriptHtml({
      title: 'App <script>alert(1)</script>',
      description: 'Desc & "quotes"',
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('&lt;script&gt;');
    expect(html).not.toContain('<script>alert');
    expect(html).toContain('&amp;');
    expect(html).toContain('&quot;quotes&quot;');
  });

  it('strips interactive elements from section content', () => {
    const html = generateNoscriptHtml({
      sections: [
        {
          id: 'test',
          title: 'Test',
          html: '<p>Keep</p><button>Remove tag</button><input type="text"/>',
        },
      ],
    });
    expect(html).toContain('Keep');
    expect(html).toContain('Remove tag');
    expect(html).not.toContain('<button');
    expect(html).not.toContain('<input');
  });

  it('handles nav with aria-label', () => {
    const html = generateNoscriptHtml({
      sections: [{ id: 'home', title: 'Home', html: '<p>Hi</p>' }],
    });
    expect(html).toContain('aria-label="Section navigation"');
  });
});
