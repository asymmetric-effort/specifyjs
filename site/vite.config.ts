import { defineConfig, type Plugin } from 'vite';
import path from 'path';
import fs from 'fs';
import { specifyJsSeoPlugin, specifyJsNoscriptPlugin, type NoscriptSection } from '../core/src/build/index';

const corePkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../core/package.json'), 'utf-8'));
// Write version.txt to public/ so it's included in every build (used by staging deploy verification)
fs.writeFileSync(path.resolve(__dirname, 'public/version.txt'), `v${corePkg.version}\n`);
const JS_BANNER = '/* (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE */';
const CSS_BANNER = '/* (c) 2025-2026 Asymmetric Effort, LLC. MIT LICENSE */';

/**
 * Vite plugin to prepend a copyright banner to CSS assets.
 * Rollup's `output.banner` only applies to JS chunks.
 */
function cssBannerPlugin(): Plugin {
  return {
    name: 'css-banner',
    generateBundle(_options, bundle) {
      for (const [fileName, chunk] of Object.entries(bundle)) {
        if (
          fileName.endsWith('.css') &&
          chunk.type === 'asset' &&
          typeof chunk.source === 'string'
        ) {
          chunk.source = CSS_BANNER + '\n' + chunk.source;
        }
      }
    },
  };
}

/**
 * Load local HTTPS certs if available.
 * Run scripts/setup-dev-certs.sh to generate them.
 */
function loadHttpsCerts(): { key: Buffer; cert: Buffer } | undefined {
  const certDir = path.resolve(__dirname, '../.certs');
  const certPath = path.join(certDir, 'cert.pem');
  const keyPath = path.join(certDir, 'key.pem');
  if (fs.existsSync(certPath) && fs.existsSync(keyPath)) {
    return {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
    };
  }
  return undefined;
}

const https = loadHttpsCerts();

/**
 * Build noscript sections from docs directory and static content.
 * Reads markdown files and converts to basic HTML for the noscript fallback.
 */
function buildNoscriptSections(): NoscriptSection[] {
  const docsDir = path.resolve(__dirname, '..', 'docs');
  const sections: NoscriptSection[] = [];

  // Home section
  sections.push({
    id: 'home',
    title: 'Home',
    html: `
      <h3>SpecifyJS</h3>
      <p>A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity.</p>
      <ul>
        <li><strong>Zero runtime dependencies</strong> — every algorithm implemented from scratch</li>
        <li><strong>TypeScript-first</strong> — full type definitions, strict mode</li>
        <li><strong>React API parity</strong> — familiar hooks, components, and patterns</li>
        <li><strong>Concurrent rendering</strong> — lane-based priority system</li>
        <li><strong>ARIA compliant</strong> — development-time accessibility warnings</li>
      </ul>
      <h3>Getting Started</h3>
      <pre><code>npm install @asymmetric-effort/specifyjs</code></pre>
      <pre><code>import { createElement } from 'specifyjs';
import { createRoot } from 'specifyjs/dom';

function App() {
  return createElement('h1', null, 'Hello, SpecifyJS!');
}

createRoot(document.getElementById('root')).render(createElement(App, null));</code></pre>
    `,
  });

  // Components section
  sections.push({
    id: 'components',
    title: 'Components',
    html: `
      <p>SpecifyJS includes 80+ reusable components organized into categories:</p>
      <h3>Form Components</h3>
      <p>Button, Toggle, TextField, Checkbox, RadioGroup, Select, Slider, NumberSpinner, ColorPicker, DatePicker, TimePicker, FileUpload, MultilineField, TextEditor</p>
      <h3>Data Display</h3>
      <p>Badge, Tag, DataGrid, Avatar, ListView, VirtualScroll, DigitalClock, AnalogClock</p>
      <h3>Feedback</h3>
      <p>Alert, ProgressBar, Spinner, Skeleton, EmptyState</p>
      <h3>Navigation</h3>
      <p>Tabs, Breadcrumb, Pagination, Dropdown, Menubar, Sidebar, Stepper, Toolbar, TreeNav, Accordion</p>
      <h3>Layout</h3>
      <p>Card, FlexContainer, Grid, Panel, ScrollContainer, Splitter, Footer</p>
      <h3>Overlay</h3>
      <p>Modal, Tooltip, Toast, Drawer, Popover, ContextMenu</p>
      <h3>Visualization (25+ charts)</h3>
      <p>BarGraph, LineGraph, PieGraph, Histogram, BoxPlot, BubbleChart, RadarChart, HeatMap, GanttChart, TreeMap, Sunburst, SankeyDiagram, ChordDiagram, ForceGraph, Gauge, BigNumber, WordCloud, and more.</p>
    `,
  });

  // Docs section — read from markdown files
  const guidesDir = path.join(docsDir, 'guides');
  const apiDir = path.join(docsDir, 'api');
  let docsHtml = '<p>Complete documentation covering guides, API reference, and architecture.</p>';

  // Read guide files
  if (fs.existsSync(guidesDir)) {
    const guideFiles = fs.readdirSync(guidesDir).filter(f => f.endsWith('.md')).sort();
    docsHtml += '<h3>Guides</h3><ul>';
    for (const file of guideFiles) {
      const content = fs.readFileSync(path.join(guidesDir, file), 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      // Extract first paragraph as description
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      const desc = lines[0] ?? '';
      docsHtml += `<li><strong>${escapeHtmlBasic(title)}</strong>: ${escapeHtmlBasic(desc)}</li>`;
    }
    docsHtml += '</ul>';
  }

  // Read API files
  if (fs.existsSync(apiDir)) {
    const apiFiles = fs.readdirSync(apiDir).filter(f => f.endsWith('.md')).sort();
    docsHtml += '<h3>API Reference</h3><ul>';
    for (const file of apiFiles) {
      const content = fs.readFileSync(path.join(apiDir, file), 'utf-8');
      const titleMatch = content.match(/^#\s+(.+)/m);
      const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
      docsHtml += `<li>${escapeHtmlBasic(title)}</li>`;
    }
    docsHtml += '</ul>';
  }

  sections.push({
    id: 'docs',
    title: 'Documentation',
    html: docsHtml,
  });

  // Concurrent rendering section
  sections.push({
    id: 'concurrent',
    title: 'Concurrent Rendering',
    html: `
      <p>SpecifyJS implements lane-based concurrent rendering with the same priority levels as React 18:</p>
      <ul>
        <li><strong>SyncLane</strong> — highest priority, used by flushSync and discrete events</li>
        <li><strong>DefaultLane</strong> — normal state updates and event handlers</li>
        <li><strong>TransitionLane</strong> — lower priority, used with startTransition/useTransition</li>
      </ul>
      <h3>useTransition</h3>
      <p>Mark state updates as non-urgent so they can be interrupted by higher-priority work.</p>
      <h3>useDeferredValue</h3>
      <p>Returns a deferred copy of a value that lags behind during urgent updates.</p>
      <h3>startTransition</h3>
      <p>Standalone function for marking updates as transitions outside of components.</p>
    `,
  });

  // API Integration section
  sections.push({
    id: 'api',
    title: 'API Integration',
    html: `
      <p>SpecifyJS applications fetch data via HTTPS from API endpoints. The framework provides:</p>
      <ul>
        <li><strong>secureFetch</strong> — HTTPS-only fetch wrapper that blocks insecure requests</li>
        <li><strong>useFetch hook pattern</strong> — custom hook for data loading with loading/error states</li>
        <li><strong>Feature flags</strong> — FeatureFlagProvider for feature gating with remote JSON config</li>
      </ul>
    `,
  });

  return sections;
}

/**
 * Vite plugin to copy index.html to 404.html for GitHub Pages SPA support.
 * GitHub Pages serves 404.html for unknown paths, enabling client-side routing.
 */
function copy404Plugin(): Plugin {
  return {
    name: 'copy-404',
    closeBundle() {
      const distDir = path.resolve(__dirname, 'dist');
      const src = path.join(distDir, 'index.html');
      const dest = path.join(distDir, '404.html');
      if (fs.existsSync(src)) {
        fs.copyFileSync(src, dest);
      }
    },
  };
}

function escapeHtmlBasic(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// In CI builds, resolve specifyjs imports from dist/ artifacts (not source)
// so E2E and PDV tests validate the same code consumers get from npm.
// Local dev uses source aliases for HMR.
const useDist = process.env.SPECIFYJS_USE_DIST === 'true' || process.env.CI === 'true';

const sourceAliases = {
  'specifyjs/hooks': path.resolve(__dirname, '../core/src/hooks/index.ts'),
  'specifyjs/dom': path.resolve(__dirname, '../core/src/dom/index.ts'),
  'specifyjs': path.resolve(__dirname, '../core/src/index.ts'),
};

const distAliases = {
  'specifyjs/hooks': path.resolve(__dirname, '../core/dist/specifyjs.esm.js'),
  'specifyjs/dom': path.resolve(__dirname, '../core/dist/specifyjs-dom.esm.js'),
  'specifyjs': path.resolve(__dirname, '../core/dist/specifyjs.esm.js'),
};

export default defineConfig({
  define: {
    '__SPECIFYJS_VERSION__': JSON.stringify(corePkg.version),
  },
  resolve: {
    alias: useDist ? distAliases : sourceAliases,
  },
  server: {
    https: https as any,
  },
  build: {
    outDir: 'dist',
    minify: 'esbuild',
    chunkSizeWarningLimit: 300,
    rollupOptions: {
      output: {
        banner: JS_BANNER,
        entryFileNames: 'assets/[name]-[hash].js',
        manualChunks(id: string) {
          // Split visualization components into a separate chunk
          if (id.includes('components/viz/')) return 'viz-components';
          // Split page layout components
          if (id.includes('components/page/')) return 'page-components';
          // Split form/data/nav/layout/overlay/feedback components
          if (id.includes('components/') && !id.includes('components/viz/') && !id.includes('components/page/')) return 'ui-components';
          // Split docs data (large inline content)
          if (id.includes('docs-data')) return 'docs-data';
          // Core framework stays in the main chunk
        },
      },
    },
  },
  plugins: [
    copy404Plugin(),
    cssBannerPlugin(),
    specifyJsSeoPlugin({
      siteUrl: 'https://specifyjs.asymmetric-effort.com',
      title: 'SpecifyJS',
      description: 'A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity. Zero runtime dependencies. 4KB gzipped core.',
      routes: ['/', '/#/components', '/#/dashboard', '/#/concurrent', '/#/api', '/#/docs', '/#/getting-started', '/#/featureflags'],
      docsDir: path.resolve(__dirname, '..', 'docs'),
      npmPackage: '@asymmetric-effort/specifyjs',
      author: 'Asymmetric Effort, LLC',
      license: 'MIT',
      repository: 'https://github.com/asymmetric-effort/specifyjs',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        'name': 'SpecifyJS',
        'url': 'https://specifyjs.asymmetric-effort.com',
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'Web',
        'description': 'A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity. Zero runtime dependencies.',
        'license': 'https://opensource.org/licenses/MIT',
        'author': {
          '@type': 'Organization',
          'name': 'Asymmetric Effort, LLC',
          'url': 'https://asymmetric-effort.com',
        },
        'offers': { '@type': 'Offer', 'price': '0', 'priceCurrency': 'USD' },
      },
    }),
    specifyJsNoscriptPlugin({
      title: 'SpecifyJS',
      description: 'A declarative TypeScript UI framework built for performance, browser compatibility, and developer simplicity.',
      sections: buildNoscriptSections(),
      copyright: '\u00a9 2025-2026 Asymmetric Effort, LLC. MIT License.',
    }),
  ],
  base: './',
});
