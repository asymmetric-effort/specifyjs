<!-- (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE -->
<!-- SPDX-License-Identifier: MIT -->

# SEO — Sitemap, Robots, LLMs, and Noscript Fallback

SpecifyJS provides two Vite plugins for build-time SEO:

- **specifyJsSeoPlugin** -- auto-generates `sitemap.xml`, `robots.txt`, and `llms.txt`
- **specifyJsNoscriptPlugin** -- injects a `<noscript>` fallback into `index.html` for crawlers and accessibility

Both plugins run during the Vite `closeBundle` hook (build-time only) and
produce static files in the `dist/` output directory.

```typescript
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';
```

---

## specifyJsSeoPlugin

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://example.com',
      title: 'My App',
      description: 'A fast single-page application built with SpecifyJS.',
      routes: ['/', '/#/about', '/#/contact'],
      docsDir: './docs',
      npmPackage: '@my-org/my-app',
      author: 'My Org',
      license: 'MIT',
      repository: 'https://github.com/my-org/my-app',
      robotsRules: ['Disallow: /admin/'],
    }),
  ],
});
```

### SeoPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| `siteUrl` | `string` | Yes | Base URL of the site (e.g. `https://example.com`) |
| `title` | `string` | No | Site title used in `llms.txt` |
| `description` | `string` | No | Site description for `llms.txt` (supports `\n` for multi-line) |
| `routes` | `string[]` | No | Hash-based routes to include in the sitemap. Defaults to `['/']` |
| `docsDir` | `string` | No | Path to a docs directory. Markdown files are auto-discovered and added as `/#/docs/<path>` routes |
| `npmPackage` | `string` | No | npm package name for install instructions in `llms.txt` |
| `author` | `string` | No | Author name for `llms.txt` |
| `license` | `string` | No | License identifier for `llms.txt` |
| `robotsRules` | `string[]` | No | Additional lines appended to `robots.txt` (e.g. `['Disallow: /admin/']`) |
| `repository` | `string` | No | Repository URL for `llms.txt` |

### Generated Files

#### sitemap.xml

Standard XML sitemap with one `<url>` entry per route. Routes from the `routes`
array and auto-discovered doc pages from `docsDir` are both included. Each
entry gets a `<lastmod>` set to the build date.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://example.com/</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/about</loc><lastmod>2026-04-28</lastmod></url>
  <url><loc>https://example.com/#/docs/guides/getting-started</loc><lastmod>2026-04-28</lastmod></url>
</urlset>
```

#### robots.txt

Allows all crawlers by default and points to the sitemap. Extra rules are
appended after the `Allow` directive.

```
User-agent: *
Allow: /
Disallow: /admin/

Sitemap: https://example.com/sitemap.xml
```

#### llms.txt

A machine-readable text file describing the project for LLM crawlers. Includes
the title, description, website URL, repository, npm package, documentation
links (grouped by guides and API), install instructions, license, and author.

```
# My App

> A fast single-page application built with SpecifyJS.

## Website: https://example.com
## Repository: https://github.com/my-org/my-app
## npm: https://www.npmjs.com/package/@my-org/my-app

## Documentation

- getting-started: https://example.com/#/docs/guides/getting-started

## API Reference

- hooks: https://example.com/#/docs/api/hooks

## Install

```
npm install @my-org/my-app
```

## License: MIT
## Author: My Org
```

### Docs Directory Auto-Discovery

When `docsDir` is set, the plugin iteratively walks the directory tree and
collects all `.md` files. Each file becomes a sitemap route at
`/#/docs/<relative-path>` (without the `.md` extension).

For example, given the directory structure:
```
docs/
  guides/
    getting-started.md
    routing.md
  api/
    hooks.md
    dom.md
```

The plugin generates routes:
- `/#/docs/guides/getting-started`
- `/#/docs/guides/routing`
- `/#/docs/api/hooks`
- `/#/docs/api/dom`

In `llms.txt`, guides and API docs are listed in separate sections.

---

## specifyJsNoscriptPlugin

### Setup

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsNoscriptPlugin({
      title: 'My App',
      description: 'A fast single-page application.',
      sections: [
        {
          id: 'home',
          title: 'Home',
          html: '<h1>Welcome</h1><p>This is the home page.</p>',
        },
        {
          id: 'docs',
          title: 'Documentation',
          html: '<h2>Getting Started</h2><p>Install with npm...</p>',
        },
      ],
      copyright: '(c) 2026 My Org. All rights reserved.',
    }),
  ],
});
```

### NoscriptPluginConfig

| Property | Type | Required | Description |
|---|---|---|---|
| `title` | `string` | No | Page title shown at the top |
| `description` | `string` | No | Subtitle shown below the title |
| `sections` | `NoscriptSection[]` | Yes | Content sections to render |
| `copyright` | `string` | No | Copyright notice at the bottom |
| `classPrefix` | `string` | No | CSS class prefix (default: `'ns'`) |
| `maxContentSize` | `number` | No | Maximum noscript content size in bytes before a warning (default: 512KB) |

### NoscriptSection

```typescript
interface NoscriptSection {
  id: string;      // Anchor ID (href="#id")
  title: string;   // Navigation bar display title
  html: string;    // Static HTML content
}
```

### What It Generates

The plugin injects a `<noscript>` block before `</body>` in `dist/index.html`
containing:

1. **Scoped CSS** -- a complete stylesheet for readable, responsive layout
2. **JS-disabled notice** -- a yellow banner explaining that the page works
   best with JavaScript
3. **Navigation bar** -- sticky nav with anchor links to each section
4. **Section content** -- each section as semantic HTML with headings,
   paragraphs, lists, and a "Back to top" link
5. **Copyright footer** -- if configured

### Interactive Element Stripping

The plugin automatically strips elements that do not work without JavaScript:

| Element | Treatment |
|---|---|
| `<button>` | Removed, inner text preserved |
| `<input>` | Removed entirely |
| `<select>` / `<option>` | Removed entirely |
| `<textarea>` | Removed entirely |
| `<form>` | Wrapper removed, content preserved |
| `<script>` | Removed entirely |
| `onclick`, `onchange`, etc. | Inline event handlers removed |
| `style="...javascript:..."` | Style attributes with JS expressions removed |

The `stripInteractiveElements()` function is exported for use outside the
plugin:

```typescript
import { stripInteractiveElements } from '@asymmetric-effort/specifyjs/build';

const clean = stripInteractiveElements('<button onclick="alert()">Click</button>');
// 'Click'
```

### Content Size Warning

If the generated noscript HTML exceeds `maxContentSize` (default 512KB),
a console warning is emitted during build. This prevents accidentally
bloating `index.html` with large noscript content.

### Removing Noscript After Hydration

The `<noscript>` block is inert when JavaScript is enabled -- browsers do not
render `<noscript>` content when JS is active. No cleanup is needed after
hydration.

If you want to remove the `<noscript>` element from the DOM for cleanliness
after your app mounts:

```typescript
import { createElement, useEffect } from '@asymmetric-effort/specifyjs';

function App() {
  useEffect(() => {
    const noscript = document.querySelector('noscript');
    if (noscript) {
      noscript.remove();
    }
  }, []);

  return createElement('div', null, 'App loaded');
}
```

---

## Using Both Plugins Together

```typescript
// vite.config.ts
import { defineConfig } from 'vite';
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin } from '@asymmetric-effort/specifyjs/build';

export default defineConfig({
  plugins: [
    specifyJsSeoPlugin({
      siteUrl: 'https://myapp.com',
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      routes: ['/', '/#/about'],
      docsDir: './docs',
      npmPackage: '@my-org/myapp',
      license: 'MIT',
    }),
    specifyJsNoscriptPlugin({
      title: 'MyApp',
      description: 'Built with SpecifyJS',
      sections: [
        { id: 'home', title: 'Home', html: '<h1>Welcome to MyApp</h1>' },
        { id: 'about', title: 'About', html: '<p>About this application.</p>' },
      ],
      copyright: '(c) 2026 My Org',
    }),
  ],
});
```

Both plugins run independently during `closeBundle`. The SEO plugin generates
`sitemap.xml`, `robots.txt`, and `llms.txt`. The noscript plugin modifies
`index.html` to add the fallback block. Order does not matter.

---

## Error Handling

| Scenario | Behavior |
|---|---|
| `docsDir` does not exist | Skipped silently; no doc routes added |
| `dist/index.html` not found (noscript) | Warning logged; noscript injection skipped |
| No sections provided (noscript) | Warning logged; no noscript block injected |
| Noscript content exceeds `maxContentSize` | Warning logged; content still injected |
| `routes` not provided (SEO) | Defaults to `['/']` |
