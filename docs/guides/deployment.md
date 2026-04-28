# Deployment

This guide covers building SpecifyJS applications for production and deploying them to common hosting platforms.

## Building for Production

SpecifyJS applications use Vite (backed by Rollup) for production builds. The build process produces minified, tree-shaken JavaScript bundles optimized for browser delivery.

```bash
npx vite build
```

This outputs files to the `dist/` directory:

```
dist/
  index.html
  assets/
    index-abc123.js    # Hashed JS bundle
    style-def456.css   # Hashed CSS (if applicable)
```

### Vite Configuration

A minimal `vite.config.ts` for a SpecifyJS SPA:

```typescript
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    outDir: 'dist',
    minify: 'terser',
    sourcemap: true,
    rollupOptions: {
      input: 'index.html',
    },
  },
});
```

The framework targets less than 15KB minified and gzipped for the core library. Applications should aim for under 50KB gzipped total, including framework overhead.

## Deploying to GitHub Pages

GitHub Pages serves static files from a branch or directory.

1. Set the `base` option in `vite.config.ts` to your repository name:

```typescript
export default defineConfig({
  base: '/your-repo-name/',
});
```

2. Build the project:

```bash
npx vite build
```

3. Deploy using the `gh-pages` package or a GitHub Actions workflow:

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6
      - uses: actions/setup-node@v6
        with:
          node-version: 24
      - run: npm ci
      - run: npx vite build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

For hash-based routing (`/#/about`), no special server configuration is needed since GitHub Pages always serves `index.html` for the root path.

## Deploying to Netlify

1. Create a `netlify.toml` in the project root:

```toml
[build]
  command = "npx vite build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

The redirect rule ensures that client-side routes work when the user refreshes or navigates directly to a deep URL.

2. Connect your repository to Netlify via the dashboard, or use the Netlify CLI:

```bash
npx netlify deploy --prod --dir=dist
```

## Deploying to Vercel

1. Create a `vercel.json` in the project root:

```json
{
  "buildCommand": "npx vite build",
  "outputDirectory": "dist",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

2. Deploy with the Vercel CLI:

```bash
npx vercel --prod
```

## Environment Variables

Vite exposes environment variables prefixed with `VITE_` to client-side code:

```bash
# .env.production
VITE_API_URL=https://api.example.com
VITE_ANALYTICS_ID=UA-000000
```

Access them in your application:

```typescript
const apiUrl = import.meta.env.VITE_API_URL;
```

Never put secrets (API keys, tokens) in `VITE_` variables. They are embedded in the client bundle and visible to anyone. Use server-side API endpoints to proxy requests that require authentication.

## CNAME and Custom Domain Setup

### GitHub Pages

Create a `CNAME` file in your `public/` directory (so Vite copies it to `dist/`):

```
app.example.com
```

Then configure your DNS provider to point `app.example.com` to `your-username.github.io` with a CNAME record.

### Netlify / Vercel

Both platforms provide custom domain configuration through their dashboards. Add your domain and follow the DNS instructions they provide. Both handle TLS certificates automatically.

When using a custom domain, set the `base` option in Vite to `/` instead of the repository name.

## Source Maps in Production

Source maps help debug production issues but expose your source code. Configure them based on your needs:

```typescript
export default defineConfig({
  build: {
    // Full source maps (uploaded to error tracking, not served publicly)
    sourcemap: 'hidden',
    // Or disable entirely
    // sourcemap: false,
  },
});
```

- `true` -- Source maps are generated and referenced in the bundle. Useful for development.
- `'hidden'` -- Source maps are generated but not referenced. Upload them to error tracking services (Sentry, Datadog) without exposing them to users.
- `false` -- No source maps generated.

## Performance Verification

After deploying, verify your application meets performance targets:

1. **Lighthouse audit** -- Run Chrome DevTools Lighthouse in Incognito mode. Target a score above 90 for Performance.
2. **Bundle analysis** -- Use `npx vite-bundle-visualizer` to identify oversized chunks.
3. **First paint** -- Initial content should render within 100ms on modern hardware.
4. **Network** -- Confirm assets are served with proper cache headers (`Cache-Control: max-age=31536000, immutable` for hashed files).
5. **Compression** -- Verify your host serves Brotli or gzip-compressed assets.

```bash
# Check compressed size of your bundle
gzip -9 -c dist/assets/index-*.js | wc -c
```
