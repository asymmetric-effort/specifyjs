/**
 * Consumer integration smoke test (#62)
 *
 * Validates that the published npm tarball is consumable by a standard
 * Vite project importing from all public subpaths:
 *   - @asymmetric-effort/specifyjs
 *   - @asymmetric-effort/specifyjs/dom
 *   - @asymmetric-effort/specifyjs/components
 *
 * Run: node tests/smoke/consumer-vite-build.test.mjs
 * Prerequisite: npm run build (dist/ must exist)
 */

import { execSync } from 'child_process';
import { mkdtempSync, writeFileSync, mkdirSync, existsSync, rmSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join, resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const coreDir = resolve(__dirname, '../..');

let tempDir;

function log(msg) {
  console.log(`[smoke] ${msg}`);
}

function fail(msg) {
  console.error(`[smoke] FAIL: ${msg}`);
  process.exit(1);
}

try {
  // 1. Pack the core library
  log('Packing @asymmetric-effort/specifyjs...');
  const packOutput = execSync('npm pack --json 2>/dev/null', {
    cwd: coreDir,
    encoding: 'utf-8',
  });
  const packInfo = JSON.parse(packOutput);
  const tarball = join(coreDir, packInfo[0].filename);
  if (!existsSync(tarball)) {
    fail(`Tarball not found: ${tarball}`);
  }
  log(`Packed: ${tarball}`);

  // 2. Create temp consumer project
  tempDir = mkdtempSync(join(tmpdir(), 'specifyjs-smoke-'));
  log(`Temp dir: ${tempDir}`);

  writeFileSync(
    join(tempDir, 'package.json'),
    JSON.stringify(
      {
        name: 'specifyjs-smoke-consumer',
        private: true,
        type: 'module',
        dependencies: {
          '@asymmetric-effort/specifyjs': `file:${tarball}`,
        },
        devDependencies: {
          vite: '^6.0.0',
          typescript: '^5.0.0',
        },
      },
      null,
      2,
    ),
  );

  writeFileSync(
    join(tempDir, 'vite.config.ts'),
    `import { defineConfig } from 'vite';

export default defineConfig({
  esbuild: {
    jsxFactory: 'createElement',
    jsxFragment: 'Fragment',
  },
  build: {
    rollupOptions: {
      input: 'src/main.tsx',
    },
  },
});
`,
  );

  writeFileSync(
    join(tempDir, 'tsconfig.json'),
    JSON.stringify(
      {
        compilerOptions: {
          target: 'ES2020',
          module: 'ESNext',
          moduleResolution: 'bundler',
          jsx: 'react',
          jsxFactory: 'createElement',
          jsxFragmentFactory: 'Fragment',
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
        },
        include: ['src'],
      },
      null,
      2,
    ),
  );

  mkdirSync(join(tempDir, 'src'));

  writeFileSync(
    join(tempDir, 'src', 'main.tsx'),
    `// Verify main entry
import { createElement, Fragment, useState } from '@asymmetric-effort/specifyjs';

// Verify /dom subpath
import { createRoot } from '@asymmetric-effort/specifyjs/dom';

// Verify /components subpath
import { Toggle } from '@asymmetric-effort/specifyjs/components';

function App() {
  const [count, setCount] = useState(0);
  return createElement('div', null,
    createElement('h1', null, 'Smoke Test'),
    createElement('p', null, 'Count: ', count),
    createElement('button', { onClick: () => setCount(count + 1) }, 'Increment'),
    createElement(Toggle, { label: 'Test toggle', initialValue: false }),
  );
}

const root = createRoot(document.getElementById('app')!);
root.render(createElement(App, null));

export { App };
`,
  );

  writeFileSync(
    join(tempDir, 'index.html'),
    `<!DOCTYPE html>
<html>
<head><title>Smoke Test</title></head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.tsx"></script>
</body>
</html>
`,
  );

  // 3. Install dependencies
  log('Installing dependencies...');
  execSync('npm install --ignore-scripts 2>&1', {
    cwd: tempDir,
    encoding: 'utf-8',
    timeout: 60000,
  });

  // 4. Run vite build
  log('Running vite build...');
  let buildOutput;
  try {
    buildOutput = execSync('npx vite build 2>&1', {
      cwd: tempDir,
      encoding: 'utf-8',
      timeout: 60000,
    });
  } catch (err) {
    const stderr = err.stderr || err.stdout || '';
    fail(`vite build failed:\n${stderr}`);
  }

  // 5. Assertions
  log('Verifying build output...');

  // Check for "Could not resolve" errors
  if (buildOutput.includes('Could not resolve')) {
    fail(`Build output contains unresolved imports:\n${buildOutput}`);
  }

  // Check dist directory exists
  const distDir = join(tempDir, 'dist');
  if (!existsSync(distDir)) {
    fail('dist/ directory was not created');
  }

  // Check for JS output files
  const distFiles = readdirSync(distDir, { recursive: true }).filter(
    (f) => f.toString().endsWith('.js'),
  );
  if (distFiles.length === 0) {
    fail('No JS files in dist/');
  }

  log(`Build produced ${distFiles.length} JS file(s)`);
  log('PASS: Consumer Vite build succeeded');
} catch (err) {
  fail(err.message);
} finally {
  // Cleanup
  if (tempDir && existsSync(tempDir)) {
    rmSync(tempDir, { recursive: true, force: true });
  }
  // Clean up tarball
  try {
    const tarballs = readdirSync(coreDir).filter((f) => f.endsWith('.tgz'));
    for (const t of tarballs) {
      rmSync(join(coreDir, t), { force: true });
    }
  } catch {
    // ignore cleanup errors
  }
}
