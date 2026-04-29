// (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE
// SPDX-License-Identifier: MIT

/**
 * SpecifyJS Noscript Plugin for Vite
 *
 * Generates a `<noscript>` fallback block inside the built index.html,
 * providing a fully navigable static HTML document for environments
 * where JavaScript is disabled (accessibility) or not executed
 * (search engine crawlers).
 *
 * The noscript content is a single long-form document with:
 * - A navigation bar with anchor links to each section
 * - Each section rendered as semantic HTML (headings, paragraphs, lists)
 * - Internal links mapped to `#section-id` anchors
 *
 * Usage in vite.config.ts:
 *   import { specifyJsNoscriptPlugin } from 'specifyjs/build';
 *   export default defineConfig({
 *     plugins: [
 *       specifyJsNoscriptPlugin({
 *         title: 'My App',
 *         sections: [
 *           { id: 'home', title: 'Home', html: '<h1>Welcome</h1><p>...</p>' },
 *           { id: 'docs', title: 'Docs', html: '<h2>Getting Started</h2>...' },
 *         ],
 *       }),
 *     ],
 *   });
 */

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export interface NoscriptSection {
  /** Anchor ID (used in href="#id" links) */
  id: string;
  /** Display title in the navigation bar */
  title: string;
  /** Static HTML content for this section.
   *  Can include headings, paragraphs, lists, tables, code blocks, images.
   *  Interactive elements (buttons, inputs) are stripped automatically. */
  html: string;
}

export interface NoscriptPluginConfig {
  /** Page title shown at the top of the noscript document */
  title?: string;
  /** Subtitle / description shown below the title */
  description?: string;
  /** Sections to render in the noscript block */
  sections: NoscriptSection[];
  /** Copyright notice shown at the bottom */
  copyright?: string;
  /** CSS class prefix for noscript elements (default: 'ns') */
  classPrefix?: string;
  /** Maximum content length in bytes before truncation warning (default: 512KB) */
  maxContentSize?: number;
}

// ---------------------------------------------------------------------------
// HTML sanitization
// ---------------------------------------------------------------------------

/**
 * Strip interactive elements that don't work without JS.
 * Keeps readable content: headings, paragraphs, lists, tables, code, images, links.
 */
export function stripInteractiveElements(html: string): string {
  return (
    html
      // Remove <button> elements (keep inner text)
      .replace(/<button[^>]*>([\s\S]*?)<\/button>/gi, '$1')
      // Remove <input> elements
      .replace(/<input[^>]*\/?>/gi, '')
      // Remove <select>/<option> elements
      .replace(/<select[^>]*>[\s\S]*?<\/select>/gi, '')
      // Remove <textarea> elements
      .replace(/<textarea[^>]*>[\s\S]*?<\/textarea>/gi, '')
      // Remove <form> wrappers (keep content)
      .replace(/<\/?form[^>]*>/gi, '')
      // Remove onclick/onchange/etc. inline handlers
      .replace(/\s+on\w+="[^"]*"/gi, '')
      .replace(/\s+on\w+='[^']*'/gi, '')
      // Remove style attributes with JS expressions
      .replace(/\s+style="[^"]*javascript:[^"]*"/gi, '')
      // Remove <script> tags
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
  );
}

// ---------------------------------------------------------------------------
// Noscript HTML generation
// ---------------------------------------------------------------------------

export function generateNoscriptHtml(config: NoscriptPluginConfig): string {
  const prefix = config.classPrefix ?? 'ns';
  const sections = config.sections;

  if (sections.length === 0) return '';

  // Navigation bar
  const navLinks = sections
    .map((s) => `<a href="#${s.id}" class="${prefix}-nav-link">${escapeHtml(s.title)}</a>`)
    .join('\n          ');

  // Section blocks
  const sectionBlocks = sections
    .map((s) => {
      const cleanHtml = stripInteractiveElements(s.html);
      return `
      <section id="${s.id}" class="${prefix}-section">
        <h2 class="${prefix}-section-title">${escapeHtml(s.title)}</h2>
        <div class="${prefix}-section-content">
          ${cleanHtml}
        </div>
        <p class="${prefix}-back-to-top"><a href="#${prefix}-top">Back to top</a></p>
      </section>`;
    })
    .join('\n');

  const title = config.title ? `<h1 class="${prefix}-title">${escapeHtml(config.title)}</h1>` : '';
  const desc = config.description
    ? `<p class="${prefix}-desc">${escapeHtml(config.description)}</p>`
    : '';
  const copyright = config.copyright
    ? `<footer class="${prefix}-footer"><p>${escapeHtml(config.copyright)}</p></footer>`
    : '';

  return `
    <noscript>
      <style>
        .${prefix}-container {
          max-width: 900px;
          margin: 0 auto;
          padding: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          line-height: 1.6;
          color: #1f2937;
        }
        .${prefix}-title {
          font-size: 2rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .${prefix}-desc {
          font-size: 1.1rem;
          color: #64748b;
          margin-bottom: 1.5rem;
        }
        .${prefix}-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          padding: 12px 0;
          border-bottom: 1px solid #e2e8f0;
          margin-bottom: 2rem;
          position: sticky;
          top: 0;
          background: white;
          z-index: 10;
        }
        .${prefix}-nav-link {
          padding: 6px 14px;
          border-radius: 6px;
          background: #f1f5f9;
          color: #3b82f6;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }
        .${prefix}-nav-link:hover {
          background: #3b82f6;
          color: white;
        }
        .${prefix}-section {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .${prefix}-section-title {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 1rem;
          padding-top: 1rem;
        }
        .${prefix}-section-content h3 {
          font-size: 1.2rem;
          margin-top: 1.5rem;
          color: #334155;
        }
        .${prefix}-section-content p {
          margin: 0.5rem 0;
        }
        .${prefix}-section-content pre {
          background: #1e293b;
          color: #e2e8f0;
          padding: 12px 16px;
          border-radius: 6px;
          overflow-x: auto;
          font-size: 13px;
          line-height: 1.5;
        }
        .${prefix}-section-content code {
          background: #f1f5f9;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.9em;
        }
        .${prefix}-section-content pre code {
          background: none;
          padding: 0;
        }
        .${prefix}-section-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        .${prefix}-section-content th,
        .${prefix}-section-content td {
          padding: 8px 12px;
          border: 1px solid #e2e8f0;
          text-align: left;
        }
        .${prefix}-section-content th {
          background: #f8fafc;
          font-weight: 600;
        }
        .${prefix}-section-content img {
          max-width: 100%;
          height: auto;
        }
        .${prefix}-back-to-top {
          font-size: 13px;
          margin-top: 1.5rem;
        }
        .${prefix}-back-to-top a {
          color: #3b82f6;
          text-decoration: none;
        }
        .${prefix}-footer {
          margin-top: 3rem;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          color: #94a3b8;
          font-size: 13px;
          text-align: center;
        }
        .${prefix}-js-notice {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          border-radius: 6px;
          padding: 12px 16px;
          margin-bottom: 1.5rem;
          font-size: 14px;
          color: #92400e;
        }
      </style>
      <div id="${prefix}-top" class="${prefix}-container">
        ${title}
        ${desc}
        <div class="${prefix}-js-notice">
          This page works best with JavaScript enabled. You are viewing a
          static version of the content.
        </div>
        <nav class="${prefix}-nav" aria-label="Section navigation">
          ${navLinks}
        </nav>
        ${sectionBlocks}
        ${copyright}
      </div>
    </noscript>`;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ---------------------------------------------------------------------------
// Vite Plugin
// ---------------------------------------------------------------------------

export function specifyJsNoscriptPlugin(config: NoscriptPluginConfig): Plugin {
  return {
    name: 'specifyjs-noscript',
    /* v8 ignore start -- Vite closeBundle hook runs at build time, not in jsdom tests */
    closeBundle() {
      const distDir = path.resolve(process.cwd(), 'dist');
      const indexPath = path.join(distDir, 'index.html');

      if (!fs.existsSync(indexPath)) {
        console.warn('[specifyjs-noscript] index.html not found in dist/');
        return;
      }

      const noscriptHtml = generateNoscriptHtml(config);

      if (!noscriptHtml) {
        console.warn('[specifyjs-noscript] No sections provided, skipping.');
        return;
      }

      // Check content size
      const maxSize = config.maxContentSize ?? 512 * 1024;
      const noscriptSize = Buffer.byteLength(noscriptHtml, 'utf-8');
      if (noscriptSize > maxSize) {
        console.warn(
          `[specifyjs-noscript] Noscript content is ${(noscriptSize / 1024).toFixed(0)}KB ` +
            `(limit: ${(maxSize / 1024).toFixed(0)}KB). Consider reducing section content.`,
        );
      }

      // Inject before </body>
      let html = fs.readFileSync(indexPath, 'utf-8');
      html = html.replace('</body>', `${noscriptHtml}\n</body>`);
      fs.writeFileSync(indexPath, html, 'utf-8');

      console.log(
        `Generated: noscript fallback (${config.sections.length} sections, ` +
          `${(noscriptSize / 1024).toFixed(1)}KB)`,
      );
    },
    /* v8 ignore stop */
  };
}
