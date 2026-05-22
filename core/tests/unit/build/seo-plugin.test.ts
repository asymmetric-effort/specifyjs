// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

import { describe, it, expect, vi, beforeEach, afterEach } from '@asymmetric-effort/nogginlessdom';
import type { Plugin } from 'vite';

// Mock fs and path before importing the module under test
vi.module('fs', () => {
  const writtenFiles: Record<string, string> = {};
  return {
    default: {
      existsSync: vi.fn(() => false),
      readdirSync: vi.fn(() => []),
      writeFileSync: vi.fn((filePath: string, content: string) => {
        writtenFiles[filePath] = content;
      }),
    },
    existsSync: vi.fn(() => false),
    readdirSync: vi.fn(() => []),
    writeFileSync: vi.fn((filePath: string, content: string) => {
      writtenFiles[filePath] = content;
    }),
    __writtenFiles: writtenFiles,
  };
});

import fs from 'fs';
import { specifyJsSeoPlugin } from '../../../src/build/seo-plugin';
import type { SeoPluginConfig } from '../../../src/build/seo-plugin';

function getWrittenFile(filename: string): string | undefined {
  const calls = vi.mocked(fs.writeFileSync).mock.calls;
  for (const call of calls) {
    if (String(call[0]).endsWith(filename)) {
      return String(call[1]);
    }
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

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-03-15T12:00:00Z').getTime());
    vi.spyOn(Date.prototype, 'toISOString').mockReturnValue('2026-03-15T12:00:00.000Z');
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

      const sitemap = getWrittenFile('sitemap.xml');
      expect(sitemap).toBeDefined();
      expect(sitemap).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(sitemap).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">');
      expect(sitemap).toContain(
        '<url><loc>https://example.com/</loc><lastmod>2026-03-15</lastmod></url>',
      );
      expect(sitemap).toContain(
        '<url><loc>https://example.com/#/about</loc><lastmod>2026-03-15</lastmod></url>',
      );
      expect(sitemap).toContain(
        '<url><loc>https://example.com/#/contact</loc><lastmod>2026-03-15</lastmod></url>',
      );
      expect(sitemap).toContain('</urlset>');
    });

    it('includes doc routes from docsDir', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: unknown) => {
        const dirStr = String(dir);
        if (dirStr.endsWith('/docs')) {
          return [
            { name: 'guides', isDirectory: () => true },
            { name: 'api', isDirectory: () => true },
          ] as unknown as ReturnType<typeof fs.readdirSync>;
        }
        if (dirStr.endsWith('/guides')) {
          return [
            { name: 'getting-started.md', isDirectory: () => false },
            { name: 'advanced.md', isDirectory: () => false },
          ] as unknown as ReturnType<typeof fs.readdirSync>;
        }
        if (dirStr.endsWith('/api')) {
          return [{ name: 'hooks.md', isDirectory: () => false }] as unknown as ReturnType<
            typeof fs.readdirSync
          >;
        }
        return [] as unknown as ReturnType<typeof fs.readdirSync>;
      });

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir: '/fake/docs',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = getWrittenFile('sitemap.xml');
      expect(sitemap).toBeDefined();
      expect(sitemap).toContain('https://example.com/#/docs/guides/getting-started');
      expect(sitemap).toContain('https://example.com/#/docs/guides/advanced');
      expect(sitemap).toContain('https://example.com/#/docs/api/hooks');
    });

    it('uses default root route when no routes provided', () => {
      const config: SeoPluginConfig = { siteUrl: 'https://example.com' };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = getWrittenFile('sitemap.xml');
      expect(sitemap).toContain('<url><loc>https://example.com/</loc>');
    });
  });

  describe('robots.txt', () => {
    it('generates robots.txt with sitemap reference', () => {
      const plugin = specifyJsSeoPlugin(baseConfig);
      invokeCloseBundle(plugin);

      const robots = getWrittenFile('robots.txt');
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

      const robots = getWrittenFile('robots.txt');
      expect(robots).toContain('Disallow: /admin');
      expect(robots).toContain('Disallow: /private');
    });
  });

  describe('llms.txt', () => {
    it('generates llms.txt with title, description, and install command', () => {
      const plugin = specifyJsSeoPlugin(baseConfig);
      invokeCloseBundle(plugin);

      const llms = getWrittenFile('llms.txt');
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

    it('includes guide and api doc links in llms.txt', () => {
      vi.mocked(fs.existsSync).mockReturnValue(true);
      vi.mocked(fs.readdirSync).mockImplementation((dir: unknown) => {
        const dirStr = String(dir);
        if (dirStr.endsWith('/docs')) {
          return [
            { name: 'guides', isDirectory: () => true },
            { name: 'api', isDirectory: () => true },
          ] as unknown as ReturnType<typeof fs.readdirSync>;
        }
        if (dirStr.endsWith('/guides')) {
          return [{ name: 'intro.md', isDirectory: () => false }] as unknown as ReturnType<
            typeof fs.readdirSync
          >;
        }
        if (dirStr.endsWith('/api')) {
          return [{ name: 'core.md', isDirectory: () => false }] as unknown as ReturnType<
            typeof fs.readdirSync
          >;
        }
        return [] as unknown as ReturnType<typeof fs.readdirSync>;
      });

      const config: SeoPluginConfig = {
        ...baseConfig,
        docsDir: '/fake/docs',
      };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const llms = getWrittenFile('llms.txt');
      expect(llms).toContain('## Documentation');
      expect(llms).toContain('- intro: https://example.com/#/docs/guides/intro');
      expect(llms).toContain('## API Reference');
      expect(llms).toContain('- core: https://example.com/#/docs/api/core');
    });
  });

  describe('graceful handling of missing optional config', () => {
    it('handles minimal config with only siteUrl', () => {
      const config: SeoPluginConfig = { siteUrl: 'https://minimal.com' };
      const plugin = specifyJsSeoPlugin(config);
      invokeCloseBundle(plugin);

      const sitemap = getWrittenFile('sitemap.xml');
      expect(sitemap).toContain('https://minimal.com/');

      const robots = getWrittenFile('robots.txt');
      expect(robots).toContain('Sitemap: https://minimal.com/sitemap.xml');

      const llms = getWrittenFile('llms.txt');
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
      vi.mocked(fs.existsSync).mockReturnValue(false);
      const config: SeoPluginConfig = {
        siteUrl: 'https://example.com',
        docsDir: '/nonexistent/docs',
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

      // readdirSync should not be called when docsDir is not provided
      expect(fs.readdirSync).not.toHaveBeenCalled();
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

      const sitemap = getWrittenFile('sitemap.xml');
      const robots = getWrittenFile('robots.txt');
      const llms = getWrittenFile('llms.txt');

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

  it('writes all three files', () => {
    const plugin = specifyJsSeoPlugin(baseConfig);
    invokeCloseBundle(plugin);

    // Should have written 3 files
    expect(fs.writeFileSync).toHaveBeenCalledTimes(3);

    const sitemap = getWrittenFile('sitemap.xml');
    const robots = getWrittenFile('robots.txt');
    const llms = getWrittenFile('llms.txt');

    expect(sitemap).toBeDefined();
    expect(robots).toBeDefined();
    expect(llms).toBeDefined();
  });
});
