// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SpecifyJS SEO Plugin for Vite
 * Auto-generates sitemap.xml, robots.txt, and llms.txt at build time.
 *
 * Usage in vite.config.ts:
 *   import { specifyJsSeoPlugin } from '@asymmetric-effort/specifyjs/build';
 *   export default defineConfig({ plugins: [specifyJsSeoPlugin({ ... })] });
 */

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

export interface SeoPluginConfig {
  /** Base URL of the site (e.g., 'https://example.com') */
  siteUrl: string;
  /** Site title for llms.txt */
  title?: string;
  /** Site description for llms.txt */
  description?: string;
  /** Hash-based routes to include in sitemap */
  routes?: string[];
  /** Path to docs directory (generates doc routes in sitemap) */
  docsDir?: string;
  /** npm package name for llms.txt install instructions */
  npmPackage?: string;
  /** Author name for llms.txt */
  author?: string;
  /** License for llms.txt */
  license?: string;
  /** Additional robots.txt rules */
  robotsRules?: string[];
  /** Repository URL for llms.txt */
  repository?: string;
  /** Schema.org structured data (JSON-LD). When provided, a
   *  `<script type="application/ld+json">` block is injected into index.html.
   *  Can be a plain object or an array of objects for multiple schemas. */
  jsonLd?: Record<string, unknown> | Record<string, unknown>[];
}

/**
 * Iteratively walk a directory and collect markdown file paths (without .md extension).
 * Uses an explicit stack instead of recursion per project coding standards.
 */
function walkDocs(rootDir: string, results: string[]): void {
  const stack: Array<{ dir: string; prefix: string }> = [{ dir: rootDir, prefix: '' }];
  while (stack.length > 0) {
    const { dir, prefix } = stack.pop()!;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        stack.push({ dir: path.join(dir, entry.name), prefix: prefix + entry.name + '/' });
      } else if (entry.name.endsWith('.md')) {
        results.push(prefix + entry.name.replace('.md', ''));
      }
    }
  }
}

/**
 * Generate sitemap.xml content from a list of routes.
 */
function generateSitemap(siteUrl: string, routes: string[], today: string): string {
  const sitemapEntries = routes.map(
    (r) => `  <url><loc>${siteUrl}${r}</loc><lastmod>${today}</lastmod></url>`,
  );
  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapEntries,
    '</urlset>',
  ].join('\n');
}

/**
 * Generate robots.txt content.
 */
function generateRobots(siteUrl: string, extraRules?: string[]): string {
  const lines = ['User-agent: *', 'Allow: /'];
  if (extraRules) {
    lines.push(...extraRules);
  }
  lines.push('', `Sitemap: ${siteUrl}/sitemap.xml`);
  return lines.join('\n');
}

/**
 * Generate llms.txt content with project metadata and doc links.
 */
function generateLlmsTxt(config: SeoPluginConfig, docPaths: string[]): string {
  const title = config.title ?? 'Site';
  const lines: string[] = [`# ${title}`];

  if (config.description) {
    lines.push('');
    const descLines = config.description.split('\n');
    for (const dl of descLines) {
      lines.push(`> ${dl}`);
    }
  }

  lines.push('');
  lines.push(`## Website: ${config.siteUrl}`);
  if (config.repository) {
    lines.push(`## Repository: ${config.repository}`);
  }
  if (config.npmPackage) {
    lines.push(`## npm: https://www.npmjs.com/package/${config.npmPackage}`);
  }

  // Documentation section
  const guideNames = docPaths
    .filter((p) => p.startsWith('guides/'))
    .map((p) => p.replace('guides/', ''));
  const apiNames = docPaths.filter((p) => p.startsWith('api/')).map((p) => p.replace('api/', ''));

  if (guideNames.length > 0) {
    lines.push('', '## Documentation', '');
    for (const g of guideNames) {
      lines.push(`- ${g}: ${config.siteUrl}/#/docs/guides/${g}`);
    }
  }

  if (apiNames.length > 0) {
    lines.push('', '## API Reference', '');
    for (const a of apiNames) {
      lines.push(`- ${a}: ${config.siteUrl}/#/docs/api/${a}`);
    }
  }

  if (config.npmPackage) {
    lines.push('', '## Install', '', '```', `npm install ${config.npmPackage}`, '```');
  }

  if (config.license) {
    lines.push('', `## License: ${config.license}`);
  }
  if (config.author) {
    lines.push(`## Author: ${config.author}`);
  }

  return lines.join('\n');
}

/**
 * Create the SpecifyJS SEO Vite plugin.
 *
 * Generates sitemap.xml, robots.txt, and llms.txt in the build output directory
 * during the closeBundle hook.
 */
export function specifyJsSeoPlugin(config: SeoPluginConfig): Plugin {
  return {
    name: 'specifyjs-seo',
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const today = new Date().toISOString().split('T')[0] ?? '';

      // Collect routes
      const routes = [...(config.routes ?? ['/'])];

      // Collect doc routes from docsDir
      const docPaths: string[] = [];
      if (config.docsDir && fs.existsSync(config.docsDir)) {
        walkDocs(config.docsDir, docPaths);
        for (const dp of docPaths) {
          routes.push(`/#/docs/${dp}`);
        }
      }

      // Generate and write sitemap.xml
      const sitemap = generateSitemap(config.siteUrl, routes, today);
      fs.writeFileSync(path.join(distDir, 'sitemap.xml'), sitemap);

      // Generate and write robots.txt
      const robots = generateRobots(config.siteUrl, config.robotsRules);
      fs.writeFileSync(path.join(distDir, 'robots.txt'), robots);

      // Generate and write llms.txt
      const llmsTxt = generateLlmsTxt(config, docPaths);
      fs.writeFileSync(path.join(distDir, 'llms.txt'), llmsTxt);

      /* v8 ignore start -- JSON-LD injection uses fs in Vite closeBundle */
      // Inject JSON-LD structured data into index.html
      if (config.jsonLd) {
        const indexPath = path.join(distDir, 'index.html');
        if (fs.existsSync(indexPath)) {
          let html = fs.readFileSync(indexPath, 'utf-8');
          const schemas = Array.isArray(config.jsonLd) ? config.jsonLd : [config.jsonLd];
          const ldBlocks = schemas
            .map((s) => `<script type="application/ld+json">${JSON.stringify(s)}</script>`)
            .join('\n    ');
          html = html.replace('</head>', `    ${ldBlocks}\n  </head>`);
          fs.writeFileSync(indexPath, html, 'utf-8');
        }
      }

      /* v8 ignore stop */
      const extras = config.jsonLd ? ', JSON-LD' : '';
      console.log(`Generated: sitemap.xml (${routes.length} URLs), robots.txt, llms.txt${extras}`);
    },
  };
}
