// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { specifyJsSeoPlugin } from '../../../src/build/seo-plugin';
import type { SeoPluginConfig } from '../../../src/build/seo-plugin';

/** Read a file written to the temp dist directory. */
function readDistFile(distDir: string, filename: string): string | undefined {
  const filePath = path.join(distDir, filename);
  if (fs.existsSync(filePath)) {
    return fs.readFileSync(filePath, 'utf-8');
  }
  return undefined;
}

function invokeCloseBundle(plugin: Plugin): void {
  const hook = plugin.closeBundle as () => void;
  hook();
}

describe('specifyJsSeoPlugin', () => {
  const baseConfig: SeoPluginConfig = {
    siteUrl: 'https://example.com',
    title: 'TestProject',
    description: 'A test project for unit testing.',
    routes: ['/', '/#/about', '/#/contact'],
    npmPackage: '@test/project',
    author: 'Test Author',
    license: 'MIT',
    repository: 'https://github.com/test/project',
  };

  let tmpDir: string;
  let distDir: string;
  let originalCwd: typeof process.cwd;
  const today = new Date().toISOString().split('T')[0] ?? '';

  beforeEach(() => {
    // Create a real temp directory with dist/ subdirectory
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'seo-plugin-test-'));
    distDir = path.join(tmpDir, 'dist');
    fs.mkdirSync(distDir);

    // Mock process.cwd() to return our temp dir so the plugin writes to our dist/
    originalCwd = process.cwd;
    process.cwd = () => tmpDir;

    // Capture today's date for assertions (avoid brittle date mocks)
    // The plugin uses: new Date().toISOString().split('T')[0]
  });

  afterEach(() => {
    process.cwd = originalCwd;
    vi.restoreAllMocks();
    // Clean up temp directory
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('returns a Vite plugin with name specifyjs-seo', () => {
    const plugin = specifyJsSeoPlugin(baseConfig);
    expect(plugin.name).toBe('specifyjs-seo');
    expect(plugin.closeBundle).toBeTypeOf('function');
  });

  describe('sitemap.xml', () => {
    it('generates sitemap.xml with correct routes', () => {
      const plugin = specifyJsSeoPlugin(baseConfig);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toBeDefined();
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain(
        `<url><loc>https://example.com/</loc><lastmod>${today}</lastmod></url>`,
      );
      expect(sitemap).toContain(
        `<url><loc>https://example.com/#/about</loc><lastmod>${today}</lastmod></url>`,
      );
      expect(sitemap).toContain(
        `<url><loc>https://example.com/#/contact</loc><lastmod>${today}</lastmod></url>`,
      );
      expect(sitemap).toContain('</urlset>');
    });

    it('includes doc routes from docsDir (walkDocs)', () => {
      // Create a real docs directory structure
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.mkdirSync(path.join(docsDir, 'guides'));
      fs.mkdirSync(path.join(docsDir, 'api'));
      fs.writeFileSync(path.join(docsDir, 'guides', 'getting-started.md'), '# Getting Started');
      fs.writeFileSync(path.join(docsDir, 'guides', 'advanced.md'), '# Advanced');
      fs.writeFileSync(path.join(docsDir, 'api', 'hooks.md'), '# Hooks');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toBeDefined();
      expect(sitemap).toContain('https://example.com/#/docs/guides/getting-started');
      expect(sitemap).toContain('https://example.com/#/docs/guides/advanced');
      expect(sitemap).toContain('https://example.com/#/docs/api/hooks');
    });

    it('uses default root route when no routes provided', () => {
      const config: SeoPluginConfig = { siteUrl: 'https://example.com' };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toContain('<url><loc>https://example.com/</loc>');
    });
  });

  describe('robots.txt', () => {
    it('generates robots.txt with sitemap reference', () => {
      const plugin = specifyJsSeoPlugin(baseConfig);
      invokeCloseBundle(plugin);

      const robots = readDistFile(distDir, 'robots.txt');
      expect(robots).toBeDefined();
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
    });

    it('includes additional robots rules', () => {
      const config: SeoPluginConfig = {
        ...baseConfig,
        robotsRules: ['Disallow: /admin', 'Disallow: /private'],
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const robots = readDistFile(distDir, 'robots.txt');
      expect(robots).toContain('Disallow: /admin');
      expect(robots).toContain('Disallow: /private');
    });

    it('generates robots.txt without extra rules', () => {
      const config: SeoPluginConfig = { siteUrl: 'https://example.com' };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const robots = readDistFile(distDir, 'robots.txt');
      expect(robots).toBeDefined();
      expect(robots).toContain('User-agent: *');
      expect(robots).toContain('Allow: /');
      expect(robots).toContain('Sitemap: https://example.com/sitemap.xml');
      // No extra rules should appear between Allow and Sitemap
      const lines = robots!.split('\n');
      const allowIdx = lines.findIndex((l) => l === 'Allow: /');
      // Next non-empty line should be Sitemap
      expect(lines[allowIdx + 1]).toBe('');
    });
  });

  describe('llms.txt', () => {
    it('generates llms.txt with title, description, and install command', () => {
      const plugin = specifyJsSeoPlugin(baseConfig);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toBeDefined();
      expect(llms).toContain('# TestProject');
      expect(llms).toContain('> A test project for unit testing.');
      expect(llms).toContain('## Website: https://example.com');
      expect(llms).toContain('## Repository: https://github.com/test/project');
      expect(llms).toContain('## npm: https://www.npmjs.com/package/@test/project');
      expect(llms).toContain('npm install @test/project');
      expect(llms).toContain('## License: MIT');
      expect(llms).toContain('## Author: Test Author');
    });

    it('handles multi-line description', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
        description: 'Line one\nLine two\nLine three',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toContain('> Line one');
      expect(llms).toContain('> Line two');
      expect(llms).toContain('> Line three');
    });

    it('includes guide and api doc links in llms.txt', () => {
      // Create real docs directory structure
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.mkdirSync(path.join(docsDir, 'guides'));
      fs.mkdirSync(path.join(docsDir, 'api'));
      fs.writeFileSync(path.join(docsDir, 'guides', 'intro.md'), '# Intro');
      fs.writeFileSync(path.join(docsDir, 'api', 'core.md'), '# Core');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toContain('## Documentation');
      expect(llms).toContain('- intro: https://example.com/#/docs/guides/intro');
      expect(llms).toContain('## API Reference');
      expect(llms).toContain('- core: https://example.com/#/docs/api/core');
    });

    it('omits Documentation section when no guides', () => {
      // Create docs with only api subdirectory
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.mkdirSync(path.join(docsDir, 'api'));
      fs.writeFileSync(path.join(docsDir, 'api', 'core.md'), '# Core');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).not.toContain('## Documentation');
      expect(llms).toContain('## API Reference');
    });

    it('omits API Reference section when no api docs', () => {
      // Create docs with only guides subdirectory
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.mkdirSync(path.join(docsDir, 'guides'));
      fs.writeFileSync(path.join(docsDir, 'guides', 'intro.md'), '# Intro');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toContain('## Documentation');
      expect(llms).not.toContain('## API Reference');
    });

    it('omits npm section when no npmPackage', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
        title: 'NoNpm',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).not.toContain('## npm');
      expect(llms).not.toContain('## Install');
      expect(llms).not.toContain('npm install');
    });

    it('omits repository when not provided', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).not.toContain('## Repository');
    });

    it('omits license and author when not provided', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).not.toContain('## License');
      expect(llms).not.toContain('## Author');
    });

    it('uses default title "Site" when not provided', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toContain('# Site');
    });
  });

  describe('walkDocs — iterative directory traversal', () => {
    it('handles nested directories', () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.mkdirSync(path.join(docsDir, 'guides'));
      fs.mkdirSync(path.join(docsDir, 'guides', 'sub'));
      fs.writeFileSync(path.join(docsDir, 'guides', 'top-level.md'), '# Top');
      fs.writeFileSync(path.join(docsDir, 'guides', 'sub', 'nested.md'), '# Nested');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toContain('https://example.com/#/docs/guides/top-level');
      expect(sitemap).toContain('https://example.com/#/docs/guides/sub/nested');
    });

    it('ignores non-.md files', () => {
      const docsDir = path.join(tmpDir, 'docs');
      fs.mkdirSync(docsDir);
      fs.writeFileSync(path.join(docsDir, 'readme.md'), '# Readme');
      fs.writeFileSync(path.join(docsDir, 'image.png'), 'fake image');
      fs.writeFileSync(path.join(docsDir, 'notes.txt'), 'notes');

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toContain('https://example.com/#/docs/readme');
      expect(sitemap).not.toContain('image.png');
      expect(sitemap).not.toContain('notes.txt');
    });
  });

  describe('JSON-LD injection', () => {
    it('injects a single JSON-LD schema into index.html', () => {
      // Create an index.html in dist/ for the plugin to read
      fs.writeFileSync(
        path.join(distDir, 'index.html'),
        '<!DOCTYPE html><html><head></head><body></body></html>',
      );

      const jsonLd = { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' };
      const config: SeoPluginConfig = {
        ...baseConfig,
        jsonLd,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const html = readDistFile(distDir, 'index.html');
      expect(html).toBeDefined();
      expect(html).toContain('<script type="application/ld+json">');
      expect(html).toContain('"@type":"WebSite"');
      expect(html).toContain('</head>');
    });

    it('injects multiple JSON-LD schemas', () => {
      fs.writeFileSync(
        path.join(distDir, 'index.html'),
        '<!DOCTYPE html><html><head></head><body></body></html>',
      );

      const jsonLd = [
        { '@context': 'https://schema.org', '@type': 'WebSite', name: 'Test' },
        { '@context': 'https://schema.org', '@type': 'Organization', name: 'Org' },
      ];
      const config: SeoPluginConfig = {
        ...baseConfig,
        jsonLd,
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const html = readDistFile(distDir, 'index.html');
      expect(html).toBeDefined();
      // Should have two script tags
      const matches = html!.match(/<script type="application\/ld\+json">/g);
      expect(matches).toHaveLength(2);
      expect(html).toContain('"@type":"WebSite"');
      expect(html).toContain('"@type":"Organization"');
    });

    it('skips JSON-LD when index.html does not exist', () => {
      // No index.html in dist/
      const config: SeoPluginConfig = {
        ...baseConfig,
        jsonLd: { '@type': 'WebSite' },
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      // index.html should not exist in dist/
      const html = readDistFile(distDir, 'index.html');
      expect(html).toBeUndefined();
    });

    it('logs JSON-LD in summary when provided', () => {
      fs.writeFileSync(path.join(distDir, 'index.html'), '<html><head></head><body></body></html>');

      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const config: SeoPluginConfig = {
        ...baseConfig,
        jsonLd: { '@type': 'WebSite' },
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('JSON-LD'));
      consoleSpy.mockRestore();
    });
  });

  describe('graceful handling of missing optional config', () => {
    it('handles minimal config with only siteUrl', () => {
      const config: SeoPluginConfig = { siteUrl: 'https://minimal.com' };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toContain('https://minimal.com/');

      const robots = readDistFile(distDir, 'robots.txt');
      expect(robots).toContain('Sitemap: https://minimal.com/sitemap.xml');

      const llms = readDistFile(distDir, 'llms.txt');
      expect(llms).toContain('# Site');
      expect(llms).toContain('## Website: https://minimal.com');
      // Should not contain optional sections
      expect(llms).not.toContain('## Repository');
      expect(llms).not.toContain('## npm');
      expect(llms).not.toContain('npm install');
      expect(llms).not.toContain('## License');
      expect(llms).not.toContain('## Author');
    });

    it('handles missing docsDir gracefully', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
        docsDir: path.join(tmpDir, 'nonexistent-docs'),
      };
      const plugin = specifyJsSeoPlugin(config);

      // Should not throw
      expect(() => invokeCloseBundle(plugin)).not.toThrow();
    });

    it('skips docsDir when not provided', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
        routes: ['/', '/#/page'],
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      // Sitemap should only contain explicitly provided routes, no doc routes
      const sitemap = readDistFile(distDir, 'sitemap.xml');
      expect(sitemap).toContain('https://example.com/');
      expect(sitemap).toContain('https://example.com/#/page');
      expect(sitemap).not.toContain('/#/docs/');
    });
  });

  describe('correct site URL usage', () => {
    it('uses siteUrl consistently across all generated files', () => {
      const config: SeoPluginConfig = {
        siteUrl: 'https://custom-domain.io',
        title: 'Custom',
        routes: ['/', '/#/page'],
        npmPackage: '@custom/pkg',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = readDistFile(distDir, 'sitemap.xml');
      const robots = readDistFile(distDir, 'robots.txt');
      const llms = readDistFile(distDir, 'llms.txt');

      // Every URL reference should use the configured siteUrl
      expect(sitemap).toContain('https://custom-domain.io/');
      expect(sitemap).toContain('https://custom-domain.io/#/page');
      expect(robots).toContain('Sitemap: https://custom-domain.io/sitemap.xml');
      expect(llms).toContain('## Website: https://custom-domain.io');
    });
  });

  it('logs summary of generated files', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const plugin = specifyJsSeoPlugin(baseConfig);
    invokeCloseBundle(plugin);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Generated: sitemap.xml'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('robots.txt'));
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('llms.txt'));
    consoleSpy.mockRestore();
  });

  it('logs summary without JSON-LD when not provided', () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const config: SeoPluginConfig = { siteUrl: 'https://example.com' };
    const plugin = specifyJsSeoPlugin(config);
    invokeCloseBundle(plugin);

    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Generated: sitemap.xml'));
    // Should NOT contain JSON-LD in summary
    const logCall = consoleSpy.mock.calls[0]![0] as string;
    expect(logCall).not.toContain('JSON-LD');
    consoleSpy.mockRestore();
  });

  it('writes all three files', () => {
    const plugin = specifyJsSeoPlugin(baseConfig);
    invokeCloseBundle(plugin);

    // All three files should exist in dist/
    const sitemap = readDistFile(distDir, 'sitemap.xml');
    const robots = readDistFile(distDir, 'robots.txt');
    const llms = readDistFile(distDir, 'llms.txt');

    expect(sitemap).toBeDefined();
    expect(robots).toBeDefined();
    expect(llms).toBeDefined();
  });
});
