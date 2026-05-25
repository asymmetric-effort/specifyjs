/**
 * Consumer runtime smoke test (#69)
 *
 * Validates that the published npm tarball works at runtime in a browser:
 * hooks return values, createRoot renders DOM, setState triggers re-renders.
 *
 * Uses Playwright to load a built consumer app and verify interactive behavior.
 *
 * Run: node tests/smoke/consumer-runtime.test.mjs
 * Prerequisite: npm run build (dist/ must exist), playwright must be installed
 */

import { execSync, spawn } from 'child_process';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const coreDir = resolve(__dirname, '../..');

let tempDir;
let server;

function log(msg) { console.log(`[runtime-smoke] ${msg}`); }
function fail(msg) { console.error(`[runtime-smoke] FAIL: ${msg}`); process.exit(1); }

try {
  // 1. Pack the core library
  log('Packing @asymmetric-effort/specifyjs...');
  const packOutput = execSync('npm pack --json 2>/dev/null', { cwd: coreDir, encoding: 'utf-8' });
  const packInfo = JSON.parse(packOutput);
  const tarball = join(coreDir, packInfo[0].filename);

  // 2. Create temp consumer project
  tempDir = mkdtempSync(join(tmpdir(), 'specifyjs-runtime-'));
  log(`Temp dir: ${tempDir}`);

  writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
    name: 'specifyjs-runtime-smoke',
    private: true,
    type: 'module',
    dependencies: { '@asymmetric-effort/specifyjs': `file:${tarball}` },
    devDependencies: { vite: '^6.0.0' },
  }, null, 2));

  writeFileSync(join(tempDir, 'vite.config.ts'), `
import { defineConfig } from 'vite';
export default defineConfig({
  build: { rollupOptions: { input: 'index.html' } },
});
`);

  mkdirSync(join(tempDir, 'src'));

  // App that uses useState + createRoot from separate entries
  writeFileSync(join(tempDir, 'src', 'main.js'), `
import { createElement, useState } from '@asymmetric-effort/specifyjs';
import { createRoot } from '@asymmetric-effort/specifyjs/dom';

function App() {
  const [count, setCount] = useState(0);
  return createElement('div', { id: 'app-root' },
    createElement('span', { id: 'count' }, String(count)),
    createElement('button', { id: 'inc', onClick: function() { setCount(function(c) { return c + 1; }); } }, '+'),
    createElement('span', { id: 'status' }, 'ready'),
  );
}

var root = createRoot(document.getElementById('app'));
root.render(createElement(App, null));
`);

  writeFileSync(join(tempDir, 'index.html'), `<!DOCTYPE html>
<html><head><title>Runtime Smoke</title></head>
<body><div id="app"></div><script type="module" src="/src/main.js"></script></body>
</html>`);

  // 3. Install + build
  log('Installing...');
  execSync('npm install --ignore-scripts 2>&1', { cwd: tempDir, timeout: 60000 });
  log('Building...');
  execSync('npx vite build 2>&1', { cwd: tempDir, timeout: 60000 });

  // 4. Serve the built output
  const distDir = join(tempDir, 'dist');
  if (!existsSync(distDir)) fail('dist/ not created');

  const getMime = (f) => f.endsWith('.js') ? 'application/javascript' : f.endsWith('.css') ? 'text/css' : f.endsWith('.html') ? 'text/html' : 'application/octet-stream';

  server = createServer((req, res) => {
    let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);
    if (!existsSync(filePath) && existsSync(filePath + '.html')) filePath += '.html';
    if (!existsSync(filePath)) { res.writeHead(404); res.end(); return; }
    res.writeHead(200, { 'Content-Type': getMime(filePath) });
    res.end(readFileSync(filePath));
  });

  const port = 19876;
  await new Promise((resolve) => server.listen(port, resolve));
  log(`Serving at http://localhost:${port}`);

  // 5. Launch Playwright and verify runtime behavior
  log('Launching browser...');

  // Use a simple script approach — check if playwright is available
  const testScript = `
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', (err) => errors.push(err.message));
  page.on('console', (msg) => { if (msg.type() === 'error') errors.push(msg.text()); });

  await page.goto('http://localhost:${port}/', { waitUntil: 'networkidle' });

  // Wait for app to render
  await page.waitForSelector('#status', { timeout: 5000 });

  // Verify initial render
  const count = await page.locator('#count').innerText();
  if (count !== '0') throw new Error('Initial count should be 0, got: ' + count);

  // Verify setState works (cross-entry-point: createRoot from /dom, useState from main)
  await page.locator('#inc').click();
  await page.waitForTimeout(200);
  const updated = await page.locator('#count').innerText();
  if (updated !== '1') throw new Error('After click count should be 1, got: ' + updated);

  // Verify no console errors
  if (errors.length > 0) throw new Error('Console errors: ' + errors.join(', '));

  await browser.close();
  console.log('RUNTIME_PASS');
})().catch((err) => { console.error('RUNTIME_FAIL: ' + err.message); process.exit(1); });
`;

  writeFileSync(join(tempDir, 'verify.cjs'), testScript);

  try {
    const result = execSync(`node ${join(tempDir, 'verify.cjs')}`, {
      encoding: 'utf-8',
      timeout: 30000,
      env: { ...process.env, PLAYWRIGHT_BROWSERS_PATH: process.env.PLAYWRIGHT_BROWSERS_PATH || '' },
    });
    if (!result.includes('RUNTIME_PASS')) fail('Runtime verification did not pass');
    log('PASS: Consumer runtime smoke test succeeded');
    log('  - useState works across entry points');
    log('  - createRoot renders DOM');
    log('  - setState triggers re-render');
    log('  - No console errors');
  } catch (err) {
    fail(`Runtime verification failed: ${err.stderr || err.stdout || err.message}`);
  }

} catch (err) {
  fail(err.message);
} finally {
  if (server) server.close();
  if (tempDir && existsSync(tempDir)) rmSync(tempDir, { recursive: true, force: true });
  try {
    const tarballs = readdirSync(coreDir).filter((f) => f.endsWith('.tgz'));
    for (const t of tarballs) rmSync(join(coreDir, t), { force: true });
  } catch {}
}
